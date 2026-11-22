import api from './api';
import { API_BASE_URL } from '../config/environment';

// Web push for chat messages (works with the browser closed; on iPhone only
// when the site is added to the home screen).
const SW_URL = '/push-sw.js';
const SW_SCOPE = '/chat-push/';

export const pushSupported = () => typeof window !== 'undefined'
    && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;

const keyBytes = (base64) => {
    const padded = (base64 + '='.repeat((4 - (base64.length % 4)) % 4)).replace(/-/g, '+').replace(/_/g, '/');
    const raw = window.atob(padded);
    return Uint8Array.from(raw, (c) => c.charCodeAt(0));
};

const sameKey = (buffer, base64) => {
    if (!buffer) return true;
    const a = new Uint8Array(buffer);
    const b = keyBytes(base64);
    return a.length === b.length && a.every((v, i) => v === b[i]);
};

// The page is outside the worker's scope, so navigator.serviceWorker.ready would never resolve
const waitActive = (reg) => new Promise((resolve, reject) => {
    if (reg.active) { resolve(reg); return; }
    const worker = reg.installing || reg.waiting;
    if (!worker) { reject(new Error('No service worker')); return; }
    const timer = setTimeout(() => reject(new Error('Service worker did not start')), 15000);
    worker.addEventListener('statechange', () => {
        if (worker.state === 'activated') { clearTimeout(timer); resolve(reg); }
        if (worker.state === 'redundant') { clearTimeout(timer); reject(new Error('Service worker failed')); }
    });
});

const subscribeDevice = async () => {
    const keyRes = await api.get('/api/chat/push/key', { silent: true });
    const key = keyRes.data?.enabled ? keyRes.data.publicKey : null;
    if (!key) return false;
    const reg = await waitActive(await navigator.serviceWorker.register(SW_URL, { scope: SW_SCOPE }));
    let sub = await reg.pushManager.getSubscription();
    if (sub && !sameKey(sub.options?.applicationServerKey, key)) { // server keys were changed
        await sub.unsubscribe();
        sub = null;
    }
    if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyBytes(key) });
    await api.post('/api/chat/push/subscribe', { subscription: sub.toJSON() }, { silent: true });
    return true;
};

// From a button click: asks for permission, then subscribes this device
export const enableChatPush = async () => {
    const permission = await Promise.resolve(Notification.requestPermission());
    if (permission !== 'granted' || !pushSupported()) return { permission, push: false };
    try {
        return { permission, push: await subscribeDevice() };
    } catch {
        return { permission, push: false };
    }
};

// Dashboard load: if permission was given before, link this device to whoever is signed in
export const syncChatPush = async () => {
    if (!pushSupported() || Notification.permission !== 'granted') return false;
    try {
        return await subscribeDevice();
    } catch {
        return false;
    }
};

// Logout: stop this device receiving the signed-out person's messages
export const disableChatPush = (token) => {
    if (!pushSupported()) return;
    navigator.serviceWorker.getRegistration(SW_SCOPE).then(async (reg) => {
        if (!reg || !reg.scope.endsWith(SW_SCOPE)) return;
        const sub = await reg.pushManager.getSubscription();
        if (!sub) return;
        if (token) {
            fetch(`${API_BASE_URL || ''}/api/chat/push/unsubscribe`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ endpoint: sub.endpoint }),
            }).catch(() => {});
        }
        await sub.unsubscribe();
    }).catch(() => {});
};
