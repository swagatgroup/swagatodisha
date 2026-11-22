// Chat push notifications only: no caching and no fetch handling.
// Registered with the narrow scope /chat-push/ so it never controls site pages
// and never clashes with the retired /sw.js clean-up worker.
self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('push', (event) => {
    let data = {};
    try {
        data = event.data ? event.data.json() : {};
    } catch (e) {
        data = { body: event.data ? event.data.text() : '' };
    }
    event.waitUntil((async () => {
        const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
        // The dashboard is on screen and in focus: it shows its own pop-up
        if (windows.some((w) => w.visibilityState === 'visible' && w.focused)) return;
        await self.registration.showNotification(data.title || 'Swagat Odisha', {
            body: data.body || 'New message',
            icon: '/Swagat_Favicon.png',
            badge: '/Swagat_Favicon.png',
            tag: data.conversationId ? `chat-${data.conversationId}` : 'chat',
            renotify: true,
            data: { url: data.url || '/dashboard', conversationId: data.conversationId || null }
        });
    })());
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const { url = '/dashboard', conversationId = null } = event.notification.data || {};
    event.waitUntil((async () => {
        const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
        const dashboard = windows.find((w) => new URL(w.url).pathname.startsWith('/dashboard'));
        if (dashboard) {
            dashboard.postMessage({ type: 'open-chat', conversationId });
            return dashboard.focus();
        }
        return self.clients.openWindow(url);
    })());
});
