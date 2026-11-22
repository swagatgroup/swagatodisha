const webpush = require('web-push');
const PushSubscription = require('../models/PushSubscription');

// Web push for chat. Switched off unless VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY are set.
const PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || '';
const PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';
const SUBJECT = process.env.VAPID_SUBJECT || 'mailto:contact@swagatodisha.com';
const MAX_PER_USER = 10;

let enabled = false;
if (PUBLIC_KEY && PRIVATE_KEY) {
    try {
        webpush.setVapidDetails(SUBJECT, PUBLIC_KEY, PRIVATE_KEY);
        enabled = true;
    } catch (err) {
        console.error('Chat push disabled, VAPID keys are invalid:', err.message);
    }
}

const isEnabled = () => enabled;
const publicKey = () => (enabled ? PUBLIC_KEY : null);

const DASHBOARD_PATH = { student: '/dashboard/student', agent: '/dashboard/agent', staff: '/dashboard/staff', super_admin: '/dashboard/admin' };
const dashboardUrl = (role, conversationId) => `${DASHBOARD_PATH[role] || '/dashboard'}?chat=${conversationId}`;

const validSubscription = (s) => s && typeof s.endpoint === 'string' && /^https:\/\//.test(s.endpoint)
    && s.endpoint.length <= 1000 && s.keys && typeof s.keys.p256dh === 'string' && typeof s.keys.auth === 'string';

const subscribe = async (me, subscription, userAgent = '') => {
    if (!validSubscription(subscription)) {
        const err = new Error('Invalid subscription');
        err.status = 400;
        throw err;
    }
    // The same browser may be re-used by someone else after logout, so the endpoint moves to the new person
    await PushSubscription.findOneAndUpdate(
        { endpoint: subscription.endpoint },
        {
            user: me.id,
            role: me.role,
            endpoint: subscription.endpoint,
            keys: { p256dh: subscription.keys.p256dh.slice(0, 200), auth: subscription.keys.auth.slice(0, 100) },
            userAgent: String(userAgent).slice(0, 300)
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    // Keep only the most recent devices per person
    const extra = await PushSubscription.find({ user: me.id }).sort({ updatedAt: -1 }).skip(MAX_PER_USER).select('_id').lean();
    if (extra.length) await PushSubscription.deleteMany({ _id: { $in: extra.map((e) => e._id) } });
};

const unsubscribe = (me, endpoint) =>
    PushSubscription.deleteOne({ user: me.id, endpoint: String(endpoint || '') });

/**
 * Notify people of a new message. Fire and forget: never throws.
 * The service worker skips showing it when the dashboard is already on screen.
 */
const notifyMessage = async (recipientIds, { conversationId, title, body }) => {
    if (!enabled || !recipientIds.length) return;
    try {
        const subs = await PushSubscription.find({ user: { $in: recipientIds } }).lean();
        await Promise.all(subs.map(async (s) => {
            const payload = JSON.stringify({
                type: 'chat',
                conversationId,
                title,
                body,
                url: dashboardUrl(s.role, conversationId)
            });
            try {
                await webpush.sendNotification({ endpoint: s.endpoint, keys: s.keys }, payload, { TTL: 24 * 60 * 60, urgency: 'high' });
            } catch (err) {
                // Gone or expired: the browser unsubscribed
                if (err.statusCode === 404 || err.statusCode === 410) {
                    await PushSubscription.deleteOne({ _id: s._id }).catch(() => {});
                } else {
                    console.error('Chat push failed:', err.statusCode || err.message);
                }
            }
        }));
    } catch (err) {
        console.error('Chat push error:', err.message);
    }
};

module.exports = { isEnabled, publicKey, subscribe, unsubscribe, notifyMessage, dashboardUrl };
