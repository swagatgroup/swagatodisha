const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('./models/User');
const Admin = require('./models/Admin');
const Conversation = require('./models/Conversation');
const chat = require('./utils/chatService');

const ALLOWED_ORIGINS = [
    'https://www.swagatodisha.com',
    'https://swagatodisha.com',
    'https://swagatodisha.vercel.app',
    'https://swagat-odisha.vercel.app',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'http://localhost:5173'
];

// Same lookup as the `protect` middleware: User first, then Admin
const authenticate = async (token) => {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'swagat_odisha_jwt_secret_key_2024_development');
    if (decoded.type === 'refresh') throw new Error('Wrong token type');
    const id = decoded.userId || decoded.id;
    let user = await User.findById(id).select('fullName firstName lastName email role isActive passwordChangedAt');
    let userType = 'user';
    if (!user) {
        user = await Admin.findById(id).select('firstName lastName email role isActive passwordChangedAt');
        userType = 'admin';
    }
    if (!user || user.isActive === false) throw new Error('Account not available');
    if (user.changedPasswordAfter && user.changedPasswordAfter(decoded.iat)) throw new Error('Password changed');
    if (userType === 'admin') user.role = user.role || 'super_admin';
    return chat.identityOf(user, userType);
};

const initSocket = (server) => {
    const io = new Server(server, {
        cors: { origin: ALLOWED_ORIGINS, credentials: true },
        // Keep memory low on the 512MB instance
        maxHttpBufferSize: 64 * 1024,
        pingInterval: 25000,
        pingTimeout: 20000
    });
    chat.setIO(io);

    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth && socket.handshake.auth.token;
            if (!token) return next(new Error('Not authorized'));
            socket.user = await authenticate(token);
            next();
        } catch (err) {
            next(new Error('Not authorized'));
        }
    });

    io.on('connection', (socket) => {
        const me = socket.user;
        socket.join(`user:${me.id}`);
        if (chat.markOnline(me.id)) socket.broadcast.emit('user_online', { userId: me.id });
        socket.emit('online_users', chat.onlineIds());

        const reply = (ack, body) => { if (typeof ack === 'function') ack(body); };

        socket.on('send_message', async (payload, ack) => {
            try {
                const result = await chat.sendMessage(me, payload || {});
                reply(ack, { success: true, ...result });
            } catch (err) {
                if (!err.status) console.error('Chat send error:', err);
                reply(ack, { success: false, message: err.status ? err.message : 'Message could not be sent' });
            }
        });

        // Typing indicators go to the other participants' personal rooms
        const relayTyping = (event) => async (payload) => {
            try {
                const id = payload && payload.conversationId;
                if (!mongoose.Types.ObjectId.isValid(id)) return;
                const conversation = await Conversation.findById(id).select('participants').lean();
                if (!conversation || !chat.isParticipant(conversation, me.id)) return;
                chat.emitToParticipants(conversation, event, { conversationId: id, userId: me.id, name: me.name }, me.id);
            } catch (err) { /* typing is best-effort */ }
        };
        socket.on('typing', relayTyping('typing'));
        socket.on('stop_typing', relayTyping('stop_typing'));

        socket.on('mark_read', async (payload) => {
            try { await chat.markRead(me, payload && payload.conversationId); } catch (err) { /* best-effort */ }
        });

        socket.on('disconnect', () => {
            if (chat.markOffline(me.id)) io.emit('user_offline', { userId: me.id });
        });
    });

    return io;
};

module.exports = { initSocket };
