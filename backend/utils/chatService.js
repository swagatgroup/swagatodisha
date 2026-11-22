const mongoose = require('mongoose');
const User = require('../models/User');
const Admin = require('../models/Admin');
const StudentApplication = require('../models/StudentApplication');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const ChatBlock = require('../models/ChatBlock');
const LastSeen = require('../models/LastSeen');
const chatPush = require('./chatPush');

const STUDENT_VISIBLE_MS = 24 * 60 * 60 * 1000;
const FLOOD_LIMIT = 15;          // messages
const FLOOD_WINDOW_MS = 60 * 1000; // per minute
const EDIT_WINDOW_MS = 15 * 60 * 1000;      // messages can be edited for 15 minutes
const UNSEND_WINDOW_MS = 24 * 60 * 60 * 1000; // and unsent for 24 hours
const GROUP_MAX_MEMBERS = 100;
const GROUP_CREATOR_ROLES = ['super_admin', 'staff', 'agent'];

let io = null;
const setIO = (instance) => { io = instance; };
const getIO = () => io;

// ─── Presence ──────────────────────────────────────────────────────────────
const online = new Map(); // userId -> open socket count
const markOnline = (id) => {
    const n = (online.get(id) || 0) + 1;
    online.set(id, n);
    return n === 1; // first connection
};
const markOffline = (id) => {
    const n = (online.get(id) || 1) - 1;
    if (n <= 0) { online.delete(id); return true; }
    online.set(id, n);
    return false;
};
const isOnline = (id) => online.has(String(id));
const onlineIds = () => Array.from(online.keys());

// Last seen is saved on connect and on disconnect; best-effort
const touchLastSeen = (id, at = new Date()) =>
    LastSeen.updateOne({ _id: id }, { $set: { at } }, { upsert: true }).catch(() => {});

const lastSeenMap = async (ids) => {
    const valid = [...new Set(ids.map(String))].filter((id) => mongoose.Types.ObjectId.isValid(id));
    if (!valid.length) return new Map();
    const rows = await LastSeen.find({ _id: { $in: valid } }).lean();
    return new Map(rows.map((r) => [String(r._id), r.at]));
};

// Adds lastSeen to a list of contacts
const withLastSeen = async (contacts) => {
    const seen = await lastSeenMap(contacts.map((c) => c.id));
    return contacts.map((c) => ({ ...c, lastSeen: seen.get(c.id) || null }));
};

// ─── Identity ──────────────────────────────────────────────────────────────
const normaliseRole = (role) => (role === 'user' ? 'student' : role);

const nameOf = (doc) => {
    if (!doc) return 'Unknown';
    if (doc.fullName) return doc.fullName;
    return [doc.firstName, doc.lastName].filter(Boolean).join(' ') || doc.email || 'Unknown';
};

// From req.user / socket user (protect sets req.userType to 'user' or 'admin')
const identityOf = (user, userType) => ({
    id: String(user._id),
    model: userType === 'admin' ? 'Admin' : 'User',
    role: normaliseRole(user.role),
    name: nameOf(user)
});

const PERSON_FIELDS = 'fullName firstName lastName email role isActive';

const toContact = (doc, model) => ({
    id: String(doc._id),
    model,
    role: normaliseRole(doc.role),
    name: nameOf(doc),
    email: doc.email,
    online: isOnline(doc._id)
});

// Look up a person in either collection
const findPerson = async (id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    const user = await User.findById(id).select(PERSON_FIELDS).lean();
    if (user) return toContact(user, 'User');
    const admin = await Admin.findById(id).select(PERSON_FIELDS).lean();
    if (admin) return toContact(admin, 'Admin');
    return null;
};

// Batch name lookup for a list of ids from both collections
const lookupPeople = async (ids) => {
    const unique = [...new Set(ids.map(String))].filter((id) => mongoose.Types.ObjectId.isValid(id));
    if (!unique.length) return new Map();
    const [users, admins, seen] = await Promise.all([
        User.find({ _id: { $in: unique } }).select(PERSON_FIELDS).lean(),
        Admin.find({ _id: { $in: unique } }).select(PERSON_FIELDS).lean(),
        lastSeenMap(unique)
    ]);
    const map = new Map();
    users.forEach((u) => map.set(String(u._id), { ...toContact(u, 'User'), lastSeen: seen.get(String(u._id)) || null }));
    admins.forEach((a) => map.set(String(a._id), { ...toContact(a, 'Admin'), lastSeen: seen.get(String(a._id)) || null }));
    return map;
};

// ─── Who can message whom ──────────────────────────────────────────────────
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const searchFilter = (q) => {
    if (!q) return {};
    const rx = new RegExp(escapeRegex(q.trim()), 'i');
    return { $or: [{ fullName: rx }, { firstName: rx }, { lastName: rx }, { email: rx }] };
};

const activeAdmins = (filter = {}) =>
    Admin.find({ isActive: { $ne: false }, ...filter }).select(PERSON_FIELDS).lean();

// Ids of the students linked to a staff member (same scope the staff dashboard uses)
const staffStudentIds = async (staffId) => {
    const agentIds = (await User.find({ role: 'agent', assignedStaff: staffId }).select('_id').lean()).map((a) => a._id);
    const scopeIds = [staffId, ...agentIds];
    const ids = await StudentApplication.distinct('user', {
        $or: [
            { 'referralInfo.referredBy': { $in: scopeIds } },
            { submittedBy: { $in: scopeIds } },
            { assignedAgent: { $in: agentIds } },
            { assignedStaff: staffId }
        ]
    });
    return { agentIds, studentIds: ids };
};

const agentStudentIds = async (agentId) => {
    const fromApps = await StudentApplication.distinct('user', {
        $or: [{ assignedAgent: agentId }, { submittedBy: agentId }, { 'referralInfo.referredBy': agentId }]
    });
    const referred = await User.distinct('_id', { referredBy: agentId, role: { $in: ['student', 'user'] } });
    return [...fromApps, ...referred];
};

/**
 * Contacts the person may start a chat with.
 * Super admin: everyone. Staff: their agents, their students, other staff, admin.
 * Agent: their assigned staff, their students, admin.
 * Student: their assigned staff, their agent, admin.
 */
const getContacts = async (me, { q = '', limit = 50 } = {}) => {
    const search = searchFilter(q);
    const notMe = { _id: { $ne: me.id } };
    let admins = [];
    let users = [];

    if (me.role === 'super_admin') {
        admins = await activeAdmins({ ...notMe, ...search });
        users = await User.find({ isActive: { $ne: false }, role: { $in: ['agent', 'student', 'user'] }, ...search })
            .select(PERSON_FIELDS).sort({ role: 1, createdAt: -1 }).limit(q ? limit : 100).lean();
    } else if (me.role === 'staff') {
        const { agentIds, studentIds } = await staffStudentIds(me.id);
        admins = await activeAdmins({ ...notMe, ...search });
        users = await User.find({ _id: { $in: [...agentIds, ...studentIds] }, isActive: { $ne: false }, ...search })
            .select(PERSON_FIELDS).limit(q ? limit : 200).lean();
    } else if (me.role === 'agent') {
        const self = await User.findById(me.id).select('assignedStaff').lean();
        const adminFilter = { $or: [{ role: 'super_admin' }, ...(self?.assignedStaff ? [{ _id: self.assignedStaff }] : [])] };
        admins = await activeAdmins({ ...adminFilter, ...search });
        const studentIds = await agentStudentIds(me.id);
        users = await User.find({ _id: { $in: studentIds }, isActive: { $ne: false }, ...search })
            .select(PERSON_FIELDS).limit(q ? limit : 200).lean();
    } else {
        // student
        const self = await User.findById(me.id).select('referredBy').lean();
        const apps = await StudentApplication.find({ user: me.id })
            .select('assignedStaff assignedAgent submittedBy referralInfo.referredBy').lean();
        const linked = [];
        if (self?.referredBy) linked.push(self.referredBy);
        apps.forEach((a) => {
            [a.assignedStaff, a.assignedAgent, a.submittedBy, a.referralInfo?.referredBy].forEach((id) => id && linked.push(id));
        });
        admins = await activeAdmins({ $or: [{ role: 'super_admin' }, { _id: { $in: linked } }], ...search });
        users = await User.find({ _id: { $in: linked }, role: 'agent', isActive: { $ne: false }, ...search })
            .select(PERSON_FIELDS).lean();
    }

    return [
        ...admins.map((a) => toContact(a, 'Admin')),
        ...users.map((u) => toContact(u, 'User'))
    ];
};

const canStartChat = async (me, otherId) => {
    if (me.role === 'super_admin') return true;
    const contacts = await getContacts(me, { limit: 100000 });
    return contacts.some((c) => c.id === String(otherId));
};

// ─── Blocks and flood limit ────────────────────────────────────────────────
const floodLog = new Map(); // userId -> timestamps
const checkFlood = (userId) => {
    const now = Date.now();
    const recent = (floodLog.get(userId) || []).filter((t) => now - t < FLOOD_WINDOW_MS);
    if (recent.length >= FLOOD_LIMIT) {
        floodLog.set(userId, recent);
        return false;
    }
    recent.push(now);
    floodLog.set(userId, recent);
    return true;
};

const blockMessage = async (senderId, recipientIds) => {
    const block = await ChatBlock.findOne({ blocked: senderId }).lean();
    if (!block) return null;
    if (block.scope === 'all') return 'Your chat access has been suspended by the admin.';
    if (recipientIds.includes(String(block.blockedBy))) return "You can't message this person or group.";
    return null;
};

class ChatError extends Error {
    constructor(message, status = 400) { super(message); this.status = status; }
}

// ─── Conversations ─────────────────────────────────────────────────────────
const pairKeyOf = (a, b) => [String(a), String(b)].sort().join(':');

const isParticipant = (conversation, id) =>
    conversation.participants.some((p) => String(p.user) === String(id));

const findOrCreateConversation = async (me, other) => {
    const pairKey = pairKeyOf(me.id, other.id);
    let conversation = await Conversation.findOne({ pairKey });
    if (conversation) return conversation;
    try {
        conversation = await Conversation.create({
            pairKey,
            participants: [
                { user: me.id, model: me.model, role: me.role },
                { user: other.id, model: other.model, role: other.role }
            ],
            hasStudent: me.role === 'student' || other.role === 'student'
        });
    } catch (err) {
        if (err.code === 11000) return Conversation.findOne({ pairKey });
        throw err;
    }
    return conversation;
};

const studentCutoff = () => new Date(Date.now() - STUDENT_VISIBLE_MS);

const serialiseMessage = (m) => {
    const deleted = !!m.deletedAt;
    return {
        id: String(m._id),
        conversationId: String(m.conversationId),
        sender: String(m.sender),
        senderRole: m.senderRole,
        senderName: m.senderName,
        text: deleted ? '' : m.text,
        mediaUrl: deleted ? '' : m.mediaUrl,
        mediaType: deleted ? 'none' : m.mediaType,
        fileName: deleted ? '' : m.fileName,
        readBy: (m.readBy || []).map(String),
        createdAt: m.createdAt,
        system: !!m.system,
        editedAt: deleted ? null : m.editedAt || null,
        deleted
    };
};

// Conversation as seen by one viewer
const serialiseConversation = (c, viewer, people) => {
    let person;
    if (c.isGroup) {
        // Groups use the same shape so the list and thread code stay shared
        person = { id: String(c._id), name: c.name || 'Group', role: 'group', model: 'Group', isGroup: true };
    } else {
        const others = c.participants.filter((p) => String(p.user) !== viewer.id);
        const other = others[0] || c.participants[0];
        person = people.get(String(other.user)) || { id: String(other.user), name: 'Unknown', role: other.role, model: other.model };
    }
    const last = c.lastMessage && typeof c.lastMessage === 'object' && c.lastMessage._id ? c.lastMessage : null;
    const hiddenForStudent = viewer.role === 'student' && c.lastMessageAt < studentCutoff();
    const unread = c.unreadCounts instanceof Map ? c.unreadCounts.get(viewer.id) : c.unreadCounts?.[viewer.id];
    return {
        id: String(c._id),
        other: { ...person, online: !c.isGroup && isOnline(person.id) },
        isGroup: !!c.isGroup,
        group: c.isGroup ? {
            name: c.name || 'Group',
            createdBy: c.createdBy ? String(c.createdBy) : null,
            admins: (c.admins || []).map(String)
        } : null,
        participants: c.participants.map((p) => people.get(String(p.user)) || { id: String(p.user), role: p.role, name: 'Unknown' }),
        isParticipant: isParticipant(c, viewer.id),
        hasStudent: c.hasStudent,
        lastMessage: last && !hiddenForStudent ? serialiseMessage(last) : null,
        lastMessageAt: c.lastMessageAt,
        unread: hiddenForStudent ? 0 : unread || 0
    };
};

const listConversations = async (viewer, filter, { limit = 100, skip = 0 } = {}) => {
    const conversations = await Conversation.find(filter)
        .sort({ lastMessageAt: -1 }).skip(skip).limit(limit)
        .populate('lastMessage').lean();
    const people = await lookupPeople(conversations.flatMap((c) => c.participants.map((p) => p.user)));
    return conversations.map((c) => serialiseConversation(c, viewer, people));
};

const emitToParticipants = (conversation, event, payload, exceptId = null) => {
    if (!io) return;
    conversation.participants.forEach((p) => {
        if (String(p.user) !== String(exceptId)) io.to(`user:${p.user}`).emit(event, payload);
    });
};

const MEDIA_HOST = /^https:\/\/res\.cloudinary\.com\//;

/**
 * Send a message (used by the socket handler and the REST fallback).
 * payload: { conversationId?, recipientId?, text?, mediaUrl?, mediaType?, fileName? }
 */
const sendMessage = async (me, payload = {}) => {
    const text = String(payload.text || '').trim().slice(0, 4000);
    const mediaType = ['image', 'file'].includes(payload.mediaType) ? payload.mediaType : 'none';
    const mediaUrl = mediaType !== 'none' ? String(payload.mediaUrl || '') : '';
    if (mediaType !== 'none' && !MEDIA_HOST.test(mediaUrl)) throw new ChatError('Invalid attachment');
    if (!text && mediaType === 'none') throw new ChatError('Message is empty');

    if (!checkFlood(me.id)) {
        throw new ChatError('You are sending messages too quickly. Please wait a minute.', 429);
    }

    let conversation;
    if (payload.conversationId) {
        if (!mongoose.Types.ObjectId.isValid(payload.conversationId)) throw new ChatError('Conversation not found', 404);
        conversation = await Conversation.findById(payload.conversationId);
        if (!conversation || !isParticipant(conversation, me.id)) throw new ChatError('Conversation not found', 404);
    } else {
        const other = await findPerson(payload.recipientId);
        if (!other || other.id === me.id) throw new ChatError('Person not found', 404);
        const existing = await Conversation.findOne({ pairKey: pairKeyOf(me.id, other.id) });
        if (existing) {
            conversation = existing;
        } else {
            if (!(await canStartChat(me, other.id))) throw new ChatError("You can't message this person.", 403);
            conversation = await findOrCreateConversation(me, other);
        }
    }

    const recipientIds = conversation.participants.map((p) => String(p.user)).filter((id) => id !== me.id);
    const blocked = await blockMessage(me.id, recipientIds);
    if (blocked) throw new ChatError(blocked, 403);

    const message = await Message.create({
        conversationId: conversation._id,
        sender: me.id,
        senderModel: me.model,
        senderRole: me.role,
        senderName: me.name,
        text,
        mediaUrl,
        mediaType,
        fileName: mediaType !== 'none' ? String(payload.fileName || '').slice(0, 200) : '',
        readBy: [me.id]
    });

    const inc = {};
    recipientIds.forEach((id) => { inc[`unreadCounts.${id}`] = 1; });
    await Conversation.updateOne(
        { _id: conversation._id },
        { $set: { lastMessage: message._id, lastMessageAt: message.createdAt }, $inc: inc }
    );

    const out = serialiseMessage(message);
    emitToParticipants(conversation, 'receive_message', out);
    const mediaLabel = mediaType === 'image' ? 'Photo' : 'File';
    recipientIds.forEach((id) => {
        if (io) io.to(`user:${id}`).emit('new_message_notification', {
            conversationId: out.conversationId,
            senderName: me.name,
            groupName: conversation.isGroup ? conversation.name || 'Group' : null,
            preview: text ? text.slice(0, 80) : mediaLabel
        });
    });
    // Phones and closed browsers (does not delay the reply)
    chatPush.notifyMessage(recipientIds, {
        conversationId: out.conversationId,
        title: conversation.isGroup ? `${me.name} · ${conversation.name || 'Group'}` : me.name,
        body: text ? text.slice(0, 120) : mediaLabel
    });
    return { message: out, conversationId: String(conversation._id) };
};

const markRead = async (me, conversationId) => {
    if (!mongoose.Types.ObjectId.isValid(conversationId)) return;
    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !isParticipant(conversation, me.id)) return;
    await Promise.all([
        Message.updateMany(
            { conversationId, readBy: { $ne: me.id } },
            { $addToSet: { readBy: me.id } }
        ),
        Conversation.updateOne({ _id: conversationId }, { $set: { [`unreadCounts.${me.id}`]: 0 } })
    ]);
    emitToParticipants(conversation, 'messages_read', { conversationId: String(conversationId), readerId: me.id }, me.id);
};

// ─── Edit and unsend ───────────────────────────────────────────────────────
// Only the sender, only their own normal messages, inside the time window.
const loadOwnMessage = async (me, messageId, windowMs, action) => {
    if (!mongoose.Types.ObjectId.isValid(messageId)) throw new ChatError('Message not found', 404);
    const message = await Message.findById(messageId);
    if (!message || String(message.sender) !== me.id) throw new ChatError('Message not found', 404);
    if (message.system) throw new ChatError(`This message can't be ${action}`);
    if (message.deletedAt) throw new ChatError('This message was already deleted');
    if (Date.now() - new Date(message.createdAt).getTime() > windowMs) {
        throw new ChatError(`This message is too old to be ${action}`);
    }
    const conversation = await Conversation.findById(message.conversationId).select('participants').lean();
    if (!conversation || !isParticipant(conversation, me.id)) throw new ChatError('Message not found', 404);
    const blocked = await blockMessage(me.id, conversation.participants.map((p) => String(p.user)).filter((id) => id !== me.id));
    if (blocked) throw new ChatError(blocked, 403);
    return { message, conversation };
};

const editMessage = async (me, messageId, rawText) => {
    const text = String(rawText || '').trim().slice(0, 4000);
    const { message, conversation } = await loadOwnMessage(me, messageId, EDIT_WINDOW_MS, 'edited');
    if (!text && message.mediaType === 'none') throw new ChatError('Message is empty');
    if (text !== message.text) {
        message.text = text;
        message.editedAt = new Date();
        await message.save();
    }
    const out = serialiseMessage(message);
    emitToParticipants(conversation, 'message_updated', out);
    return out;
};

const unsendMessage = async (me, messageId) => {
    const { message, conversation } = await loadOwnMessage(me, messageId, UNSEND_WINDOW_MS, 'unsent');
    message.deletedAt = new Date();
    await message.save();
    const out = serialiseMessage(message);
    emitToParticipants(conversation, 'message_updated', out);
    return out;
};

// ─── Groups ────────────────────────────────────────────────────────────────
const cleanGroupName = (name) => String(name || '').replace(/\s+/g, ' ').trim().slice(0, 60);

// The people in `ids` that `me` is allowed to add to a group
const resolveMembers = async (me, ids) => {
    const wanted = [...new Set((Array.isArray(ids) ? ids : []).map(String))].filter((id) => id !== me.id);
    if (!wanted.length) return [];
    if (me.role === 'super_admin') {
        const people = await lookupPeople(wanted);
        return wanted.map((id) => people.get(id)).filter(Boolean);
    }
    const contacts = await getContacts(me, { limit: 100000 });
    const byId = new Map(contacts.map((c) => [c.id, c]));
    return wanted.map((id) => byId.get(id)).filter(Boolean);
};

const isGroupAdmin = (conversation, me) =>
    (conversation.admins || []).some((id) => String(id) === me.id) || (me.role === 'super_admin' && isParticipant(conversation, me.id));

const loadGroup = async (me, conversationId) => {
    if (!mongoose.Types.ObjectId.isValid(conversationId)) throw new ChatError('Group not found', 404);
    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.isGroup || !isParticipant(conversation, me.id)) throw new ChatError('Group not found', 404);
    return conversation;
};

// Centred event line in the group ("Asha added Ravi"). Does not count as unread.
const systemMessage = async (conversation, me, text) => {
    const message = await Message.create({
        conversationId: conversation._id,
        sender: me.id,
        senderModel: me.model,
        senderRole: me.role,
        senderName: me.name,
        text: text.slice(0, 4000),
        system: true,
        readBy: conversation.participants.map((p) => p.user)
    });
    await Conversation.updateOne({ _id: conversation._id }, { $set: { lastMessage: message._id, lastMessageAt: message.createdAt } });
    const out = serialiseMessage(message);
    emitToParticipants(conversation, 'receive_message', out);
    return out;
};

const announceGroup = (conversation, extra = {}) => {
    emitToParticipants(conversation, 'group_updated', { conversationId: String(conversation._id), ...extra });
};

const createGroup = async (me, { name, memberIds } = {}) => {
    if (!GROUP_CREATOR_ROLES.includes(me.role)) throw new ChatError("You can't create groups.", 403);
    const block = await ChatBlock.findOne({ blocked: me.id, scope: 'all' }).lean();
    if (block) throw new ChatError('Your chat access has been suspended by the admin.', 403);
    const groupName = cleanGroupName(name);
    if (!groupName) throw new ChatError('Give the group a name');
    const members = await resolveMembers(me, memberIds);
    if (!members.length) throw new ChatError('Add at least one person to the group');
    if (members.length + 1 > GROUP_MAX_MEMBERS) throw new ChatError(`A group can have up to ${GROUP_MAX_MEMBERS} people`);

    const participants = [{ user: me.id, model: me.model, role: me.role }, ...members.map((m) => ({ user: m.id, model: m.model, role: m.role }))];
    const conversation = await Conversation.create({
        pairKey: `group:${new mongoose.Types.ObjectId()}`,
        isGroup: true,
        name: groupName,
        createdBy: me.id,
        admins: [me.id],
        participants,
        hasStudent: participants.some((p) => p.role === 'student')
    });
    await systemMessage(conversation, me, `${me.name} created the group "${groupName}"`);
    announceGroup(conversation);
    return String(conversation._id);
};

const renameGroup = async (me, conversationId, name) => {
    const conversation = await loadGroup(me, conversationId);
    if (!isGroupAdmin(conversation, me)) throw new ChatError('Only group admins can rename the group', 403);
    const groupName = cleanGroupName(name);
    if (!groupName) throw new ChatError('Give the group a name');
    if (groupName === conversation.name) return;
    conversation.name = groupName;
    await conversation.save();
    await systemMessage(conversation, me, `${me.name} renamed the group to "${groupName}"`);
    announceGroup(conversation);
};

const addGroupMembers = async (me, conversationId, memberIds) => {
    const conversation = await loadGroup(me, conversationId);
    if (!isGroupAdmin(conversation, me)) throw new ChatError('Only group admins can add people', 403);
    const members = (await resolveMembers(me, memberIds)).filter((m) => !isParticipant(conversation, m.id));
    if (!members.length) throw new ChatError('No one new to add');
    if (conversation.participants.length + members.length > GROUP_MAX_MEMBERS) {
        throw new ChatError(`A group can have up to ${GROUP_MAX_MEMBERS} people`);
    }
    members.forEach((m) => conversation.participants.push({ user: m.id, model: m.model, role: m.role }));
    if (members.some((m) => m.role === 'student')) conversation.hasStudent = true;
    await conversation.save();
    await systemMessage(conversation, me, `${me.name} added ${members.map((m) => m.name).join(', ')}`);
    announceGroup(conversation);
};

// Removing yourself = leaving the group
const removeGroupMember = async (me, conversationId, userId) => {
    const conversation = await loadGroup(me, conversationId);
    const leaving = String(userId) === me.id;
    if (!leaving && !isGroupAdmin(conversation, me)) throw new ChatError('Only group admins can remove people', 403);
    const member = conversation.participants.find((p) => String(p.user) === String(userId));
    if (!member) throw new ChatError('This person is not in the group', 404);

    const people = await lookupPeople([userId]);
    const name = people.get(String(userId))?.name || 'Someone';
    const before = { participants: conversation.participants.map((p) => ({ user: p.user })) };

    conversation.participants = conversation.participants.filter((p) => String(p.user) !== String(userId));
    conversation.admins = (conversation.admins || []).filter((id) => String(id) !== String(userId));
    // Keep at least one admin while people remain
    if (!conversation.admins.length && conversation.participants.length) conversation.admins = [conversation.participants[0].user];
    conversation.hasStudent = conversation.participants.some((p) => p.role === 'student');
    if (conversation.unreadCounts && conversation.unreadCounts.has(String(userId))) {
        conversation.unreadCounts.delete(String(userId));
        conversation.markModified('unreadCounts');
    }
    await conversation.save();

    if (conversation.participants.length) {
        await systemMessage(conversation, me, leaving ? `${name} left` : `${me.name} removed ${name}`);
    }
    // Tell everyone who was in the group, including the person removed
    announceGroup(before, { conversationId: String(conversation._id), removed: [String(userId)] });
};

module.exports = {
    STUDENT_VISIBLE_MS,
    ChatError,
    setIO,
    getIO,
    markOnline,
    markOffline,
    isOnline,
    onlineIds,
    identityOf,
    findPerson,
    getContacts,
    listConversations,
    isParticipant,
    studentCutoff,
    serialiseMessage,
    sendMessage,
    markRead,
    emitToParticipants,
    touchLastSeen,
    withLastSeen,
    lookupPeople,
    editMessage,
    unsendMessage,
    createGroup,
    renameGroup,
    addGroupMembers,
    removeGroupMember
};
