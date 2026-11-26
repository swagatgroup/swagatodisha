const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const mongoose = require('mongoose');
const streamifier = require('streamifier');
require('../utils/cloudinary'); // applies the Cloudinary config
const cloudinary = require('cloudinary').v2;
const { protect, authorize, requirePower } = require('../middleware/auth');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const ChatBlock = require('../models/ChatBlock');
const Story = require('../models/Story');
const chat = require('../utils/chatService');
const chatPush = require('../utils/chatPush');

const router = express.Router();
router.use(protect);

const me = (req) => chat.identityOf(req.user, req.userType);
const { hasPower } = require('../config/seniorPowers');
const fail = (res, err) => {
    if (!err.status) console.error('Chat route error:', err);
    res.status(err.status || 500).json({ success: false, message: err.status ? err.message : 'Something went wrong' });
};

// @route GET /api/chat/contacts?q=
router.get('/contacts', async (req, res) => {
    try {
        const contacts = await chat.getContacts(me(req), { q: String(req.query.q || '').slice(0, 60) });
        res.json({ success: true, data: await chat.withLastSeen(contacts) });
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
        // Non-participants: super admin, or senior staff with chat_moderation (reading student chats)
        if (!conversation || (!participant && !hasPower(req.user, 'chat_moderation'))) {
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

// ─── Push notifications ────────────────────────────────────────────────────

// @route GET /api/chat/push/key  Public VAPID key, or enabled:false when not set up
router.get('/push/key', (req, res) => {
    res.json({ success: true, enabled: chatPush.isEnabled(), publicKey: chatPush.publicKey() });
});

// @route POST /api/chat/push/subscribe  { subscription }
router.post('/push/subscribe', async (req, res) => {
    try {
        if (!chatPush.isEnabled()) return res.status(503).json({ success: false, message: 'Notifications are not set up yet' });
        await chatPush.subscribe(me(req), (req.body || {}).subscription, req.get('user-agent'));
        res.json({ success: true });
    } catch (err) { fail(res, err); }
});

// @route POST /api/chat/push/unsubscribe  { endpoint }
router.post('/push/unsubscribe', async (req, res) => {
    try {
        await chatPush.unsubscribe(me(req), (req.body || {}).endpoint);
        res.json({ success: true });
    } catch (err) { fail(res, err); }
});

// @route PATCH /api/chat/messages/:messageId  { text }  Edit own message (15 minutes)
router.patch('/messages/:messageId', async (req, res) => {
    try {
        const data = await chat.editMessage(me(req), req.params.messageId, (req.body || {}).text);
        res.json({ success: true, data });
    } catch (err) { fail(res, err); }
});

// @route DELETE /api/chat/messages/:messageId  Unsend own message (24 hours)
router.delete('/messages/:messageId', async (req, res) => {
    try {
        const data = await chat.unsendMessage(me(req), req.params.messageId);
        res.json({ success: true, data });
    } catch (err) { fail(res, err); }
});

// ─── Groups ────────────────────────────────────────────────────────────────

// @route POST /api/chat/groups  { name, memberIds }  (admin, staff, agents)
router.post('/groups', async (req, res) => {
    try {
        const conversationId = await chat.createGroup(me(req), req.body || {});
        res.status(201).json({ success: true, conversationId });
    } catch (err) { fail(res, err); }
});

// @route PATCH /api/chat/groups/:id  { name }
router.patch('/groups/:id', async (req, res) => {
    try {
        await chat.renameGroup(me(req), req.params.id, (req.body || {}).name);
        res.json({ success: true });
    } catch (err) { fail(res, err); }
});

// @route POST /api/chat/groups/:id/members  { memberIds }
router.post('/groups/:id/members', async (req, res) => {
    try {
        await chat.addGroupMembers(me(req), req.params.id, (req.body || {}).memberIds);
        res.json({ success: true });
    } catch (err) { fail(res, err); }
});

// @route DELETE /api/chat/groups/:id/members/:userId  (your own id = leave)
router.delete('/groups/:id/members/:userId', async (req, res) => {
    try {
        await chat.removeGroupMember(me(req), req.params.id, req.params.userId);
        res.json({ success: true });
    } catch (err) { fail(res, err); }
});

// ─── Stories (disappear after 24 hours) ─────────────────────────────────────
const STORY_TTL_MS = 24 * 60 * 60 * 1000;
const STORY_MAX_ACTIVE = 30;
const STORY_COLOURS = ['#0E1A3D', '#1D4ED8', '#047857', '#B45309', '#9D174D', '#6D28D9'];

// Whose stories a person may see: everyone they can chat with, plus people
// they already have a direct chat with. Super admin sees every story.
const storyAuthorIds = async (viewer) => {
    if (viewer.role === 'super_admin') return null;
    const [contacts, direct] = await Promise.all([
        chat.getContacts(viewer, { limit: 100000 }),
        Conversation.find({ 'participants.user': viewer.id, isGroup: { $ne: true } }).select('participants.user').lean()
    ]);
    const ids = new Set([viewer.id, ...contacts.map((c) => c.id)]);
    direct.forEach((c) => c.participants.forEach((p) => ids.add(String(p.user))));
    return [...ids];
};

const canSeeStory = async (viewer, story) => {
    if (String(story.author) === viewer.id) return true;
    const ids = await storyAuthorIds(viewer);
    return ids === null || ids.includes(String(story.author));
};

const loadStory = async (id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    const story = await Story.findById(id);
    return story && story.expiresAt > new Date() ? story : null;
};

// @route GET /api/chat/stories  Grouped by person, your own first
router.get('/stories', async (req, res) => {
    try {
        const viewer = me(req);
        const ids = await storyAuthorIds(viewer);
        const filter = { expiresAt: { $gt: new Date() } };
        if (ids) filter.author = { $in: ids };
        const stories = await Story.find(filter).sort({ createdAt: 1 }).limit(500).lean();

        const byAuthor = new Map();
        stories.forEach((s) => {
            const key = String(s.author);
            if (!byAuthor.has(key)) {
                byAuthor.set(key, { author: { id: key, name: s.authorName, role: s.authorRole }, stories: [] });
            }
            const mine = key === viewer.id;
            byAuthor.get(key).stories.push({
                id: String(s._id),
                text: s.text,
                bg: s.bg,
                mediaUrl: s.mediaUrl,
                mediaType: s.mediaType,
                createdAt: s.createdAt,
                expiresAt: s.expiresAt,
                seen: mine || (s.viewers || []).some((v) => String(v.user) === viewer.id),
                ...(mine ? { viewCount: (s.viewers || []).length } : {})
            });
        });
        const groups = [...byAuthor.values()].map((g) => ({
            ...g,
            allSeen: g.stories.every((s) => s.seen),
            latestAt: g.stories[g.stories.length - 1].createdAt
        }));
        const mine = groups.find((g) => g.author.id === viewer.id) || null;
        const others = groups.filter((g) => g.author.id !== viewer.id)
            .sort((a, b) => (a.allSeen - b.allSeen) || (new Date(b.latestAt) - new Date(a.latestAt)));
        res.json({ success: true, mine, data: others, colours: STORY_COLOURS });
    } catch (err) { fail(res, err); }
});

// @route POST /api/chat/stories  { text, bg, mediaUrl, mediaType: 'none' | 'image' }
router.post('/stories', async (req, res) => {
    try {
        const author = me(req);
        const body = req.body || {};
        const text = String(body.text || '').trim().slice(0, 700);
        const mediaType = body.mediaType === 'image' ? 'image' : 'none';
        const mediaUrl = mediaType === 'image' ? String(body.mediaUrl || '') : '';
        if (mediaType === 'image' && !/^https:\/\/res\.cloudinary\.com\//.test(mediaUrl)) {
            return res.status(400).json({ success: false, message: 'Invalid photo' });
        }
        if (!text && mediaType === 'none') return res.status(400).json({ success: false, message: 'Write something or add a photo' });

        const suspended = await ChatBlock.findOne({ blocked: author.id, scope: 'all' }).lean();
        if (suspended) return res.status(403).json({ success: false, message: 'Your chat access has been suspended by the admin.' });
        const active = await Story.countDocuments({ author: author.id, expiresAt: { $gt: new Date() } });
        if (active >= STORY_MAX_ACTIVE) return res.status(429).json({ success: false, message: 'You have too many stories up. Delete one first.' });

        const story = await Story.create({
            author: author.id,
            authorModel: author.model,
            authorRole: author.role,
            authorName: author.name,
            text,
            bg: STORY_COLOURS.includes(body.bg) ? body.bg : STORY_COLOURS[0],
            mediaUrl,
            mediaType,
            expiresAt: new Date(Date.now() + STORY_TTL_MS)
        });
        res.status(201).json({ success: true, data: { id: String(story._id) } });
    } catch (err) { fail(res, err); }
});

// @route POST /api/chat/stories/:id/view
router.post('/stories/:id/view', async (req, res) => {
    try {
        const viewer = me(req);
        const story = await loadStory(req.params.id);
        if (!story || !(await canSeeStory(viewer, story))) return res.status(404).json({ success: false, message: 'Story not found' });
        if (String(story.author) !== viewer.id) {
            await Story.updateOne(
                { _id: story._id, 'viewers.user': { $ne: viewer.id } },
                { $push: { viewers: { user: viewer.id, name: viewer.name, at: new Date() } } }
            );
        }
        res.json({ success: true });
    } catch (err) { fail(res, err); }
});

// @route GET /api/chat/stories/:id/viewers  (the author only)
router.get('/stories/:id/viewers', async (req, res) => {
    try {
        const story = await loadStory(req.params.id);
        if (!story || String(story.author) !== me(req).id) return res.status(404).json({ success: false, message: 'Story not found' });
        const viewers = [...(story.viewers || [])].sort((a, b) => b.at - a.at)
            .map((v) => ({ id: String(v.user), name: v.name, at: v.at }));
        res.json({ success: true, data: viewers });
    } catch (err) { fail(res, err); }
});

// @route DELETE /api/chat/stories/:id  (the author or the super admin)
router.delete('/stories/:id', async (req, res) => {
    try {
        const viewer = me(req);
        const story = await loadStory(req.params.id);
        if (!story || (String(story.author) !== viewer.id && viewer.role !== 'super_admin')) {
            return res.status(404).json({ success: false, message: 'Story not found' });
        }
        await Story.deleteOne({ _id: story._id });
        res.json({ success: true });
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
router.get('/oversight', requirePower('chat_moderation'), async (req, res) => {
    try {
        const skip = Math.max(0, parseInt(req.query.skip, 10) || 0);
        const data = await chat.listConversations(me(req), { hasStudent: true }, { limit: 50, skip });
        res.json({ success: true, data });
    } catch (err) { fail(res, err); }
});

// @route GET /api/chat/blocks
router.get('/blocks', requirePower('chat_moderation'), async (req, res) => {
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
router.post('/blocks', requirePower('chat_moderation'), async (req, res) => {
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
router.delete('/blocks/:userId', requirePower('chat_moderation'), async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.userId)) return res.status(404).json({ success: false, message: 'Not found' });
        await ChatBlock.deleteOne({ blocked: req.params.userId });
        const io = chat.getIO();
        if (io) io.to(`user:${req.params.userId}`).emit('chat_status', null);
        res.json({ success: true, message: 'Unblocked' });
    } catch (err) { fail(res, err); }
});

module.exports = router;
