const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const mongoose = require('mongoose');
const streamifier = require('streamifier');
require('../utils/cloudinary'); // applies the Cloudinary config
const cloudinary = require('cloudinary').v2;
const { protect, authorize } = require('../middleware/auth');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const ChatBlock = require('../models/ChatBlock');
const chat = require('../utils/chatService');

const router = express.Router();
router.use(protect);

const me = (req) => chat.identityOf(req.user, req.userType);
const fail = (res, err) => {
    if (!err.status) console.error('Chat route error:', err);
    res.status(err.status || 500).json({ success: false, message: err.status ? err.message : 'Something went wrong' });
};

// @route GET /api/chat/contacts?q=
router.get('/contacts', async (req, res) => {
    try {
        const contacts = await chat.getContacts(me(req), { q: String(req.query.q || '').slice(0, 60) });
        res.json({ success: true, data: contacts });
    } catch (err) { fail(res, err); }
});

// @route GET /api/chat/conversations
router.get('/conversations', async (req, res) => {
    try {
        const viewer = me(req);
        const data = await chat.listConversations(viewer, { 'participants.user': viewer.id });
        const block = await ChatBlock.findOne({ blocked: viewer.id }).select('scope blockedBy').lean();
        res.json({
            success: true,
            data,
            me: { id: viewer.id, role: viewer.role },
            studentWindowHours: viewer.role === 'student' ? 24 : null,
            chatStatus: block ? { scope: block.scope, blockedBy: String(block.blockedBy) } : null
        });
    } catch (err) { fail(res, err); }
});

// @route GET /api/chat/messages/:conversationId?before=<ISO date>
// Latest 50 messages. Students only get the last 24 hours.
router.get('/messages/:conversationId', async (req, res) => {
    try {
        const viewer = me(req);
        const { conversationId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(conversationId)) return res.status(404).json({ success: false, message: 'Conversation not found' });
        const conversation = await Conversation.findById(conversationId).lean();
        const participant = conversation && chat.isParticipant(conversation, viewer.id);
        if (!conversation || (!participant && viewer.role !== 'super_admin')) {
            return res.status(404).json({ success: false, message: 'Conversation not found' });
        }

        const createdAt = {};
        if (req.query.before) {
            const before = new Date(req.query.before);
            if (!Number.isNaN(before.getTime())) createdAt.$lt = before;
        }
        if (viewer.role === 'student') createdAt.$gte = chat.studentCutoff();
        const filter = { conversationId };
        if (Object.keys(createdAt).length) filter.createdAt = createdAt;

        const messages = await Message.find(filter).sort({ createdAt: -1 }).limit(50).lean();
        if (participant) chat.markRead(viewer, conversationId).catch(() => {});

        res.json({
            success: true,
            data: messages.reverse().map(chat.serialiseMessage),
            hasMore: messages.length === 50,
            readOnly: !participant
        });
    } catch (err) { fail(res, err); }
});

// @route POST /api/chat/send  (fallback when the live connection is down)
router.post('/send', async (req, res) => {
    try {
        const result = await chat.sendMessage(me(req), req.body || {});
        res.json({ success: true, ...result });
    } catch (err) { fail(res, err); }
});

// @route POST /api/chat/upload  (images compressed, max 5MB)
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const FILE_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain'
];
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024, files: 1 },
    fileFilter: (req, file, cb) => {
        if (IMAGE_TYPES.includes(file.mimetype) || FILE_TYPES.includes(file.mimetype)) return cb(null, true);
        cb(Object.assign(new Error('Only images, PDF, Word, Excel or text files can be sent'), { status: 400 }));
    }
});

const uploadBuffer = (buffer, options) => new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => (error ? reject(error) : resolve(result)));
    streamifier.createReadStream(buffer).pipe(stream);
});

router.post('/upload', (req, res) => {
    upload.single('file')(req, res, async (uploadErr) => {
        try {
            if (uploadErr) {
                const message = uploadErr.code === 'LIMIT_FILE_SIZE' ? 'File is larger than 5MB' : uploadErr.message;
                return res.status(400).json({ success: false, message });
            }
            if (!req.file) return res.status(400).json({ success: false, message: 'No file received' });

            const isImage = IMAGE_TYPES.includes(req.file.mimetype) && req.file.mimetype !== 'image/gif';
            let result;
            if (isImage) {
                const compressed = await sharp(req.file.buffer)
                    .rotate()
                    .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
                    .jpeg({ quality: 72, mozjpeg: true })
                    .toBuffer();
                result = await uploadBuffer(compressed, { folder: 'swagat-odisha/chat', resource_type: 'image' });
            } else {
                result = await uploadBuffer(req.file.buffer, {
                    folder: 'swagat-odisha/chat',
                    resource_type: req.file.mimetype === 'image/gif' ? 'image' : 'raw',
                    use_filename: true,
                    unique_filename: true,
                    filename_override: req.file.originalname
                });
            }
            res.json({
                success: true,
                data: {
                    mediaUrl: result.secure_url,
                    mediaType: req.file.mimetype.startsWith('image/') ? 'image' : 'file',
                    fileName: req.file.originalname
                }
            });
        } catch (err) {
            console.error('Chat upload error:', err);
            res.status(500).json({ success: false, message: 'Upload failed. Please try again.' });
        }
    });
});

// ─── Super admin only ──────────────────────────────────────────────────────

// @route GET /api/chat/oversight?skip=  All conversations that involve a student
router.get('/oversight', authorize('super_admin'), async (req, res) => {
    try {
        const skip = Math.max(0, parseInt(req.query.skip, 10) || 0);
        const data = await chat.listConversations(me(req), { hasStudent: true }, { limit: 50, skip });
        res.json({ success: true, data });
    } catch (err) { fail(res, err); }
});

// @route GET /api/chat/blocks
router.get('/blocks', authorize('super_admin'), async (req, res) => {
    try {
        const blocks = await ChatBlock.find().sort({ createdAt: -1 }).lean();
        res.json({
            success: true,
            data: blocks.map((b) => ({
                userId: String(b.blocked), name: b.blockedName, role: b.blockedRole,
                scope: b.scope, reason: b.reason, createdAt: b.createdAt
            }))
        });
    } catch (err) { fail(res, err); }
});

// @route POST /api/chat/blocks  { userId, scope: 'admin' | 'all', reason }
router.post('/blocks', authorize('super_admin'), async (req, res) => {
    try {
        const { userId, scope, reason = '' } = req.body || {};
        if (!['admin', 'all'].includes(scope)) return res.status(400).json({ success: false, message: 'Choose a block type' });
        const person = await chat.findPerson(userId);
        if (!person) return res.status(404).json({ success: false, message: 'Person not found' });
        if (person.role === 'super_admin') return res.status(400).json({ success: false, message: 'A super admin cannot be blocked' });

        await ChatBlock.findOneAndUpdate(
            { blocked: person.id },
            {
                blocked: person.id, blockedModel: person.model, blockedName: person.name, blockedRole: person.role,
                scope, reason: String(reason).slice(0, 300), blockedBy: req.user._id
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        const io = chat.getIO();
        if (io) io.to(`user:${person.id}`).emit('chat_status', { scope, blockedBy: String(req.user._id) });
        res.json({ success: true, message: `${person.name} has been blocked` });
    } catch (err) { fail(res, err); }
});

// @route DELETE /api/chat/blocks/:userId
router.delete('/blocks/:userId', authorize('super_admin'), async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.userId)) return res.status(404).json({ success: false, message: 'Not found' });
        await ChatBlock.deleteOne({ blocked: req.params.userId });
        const io = chat.getIO();
        if (io) io.to(`user:${req.params.userId}`).emit('chat_status', null);
        res.json({ success: true, message: 'Unblocked' });
    } catch (err) { fail(res, err); }
});

module.exports = router;
