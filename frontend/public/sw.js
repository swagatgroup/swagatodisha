// Service Worker for Caching and Performance Optimization
// Disabled in development mode

// Check if we're in development mode
if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
    console.log('Service Worker disabled in development mode');
    self.addEventListener('install', () => self.skipWaiting());
    self.addEventListener('activate', () => self.clients.claim());
} else {
    // Production mode service worker code

    const CACHE_NAME = 'swagat-odisha-v1';
    const STATIC_CACHE = 'static-v1';
    const DYNAMIC_CACHE = 'dynamic-v1';
    const API_CACHE = 'api-v1';

    // Files to cache immediately
    const STATIC_FILES = [
        '/',
        '/index.html',
        '/src/main.jsx',
        '/src/App.jsx',
        '/src/index.css',
        '/manifest.json'
    ];

    // API endpoints to cache
    const API_ENDPOINTS = [
        '/api/auth/me',
        '/api/dashboard/stats',
        '/api/notifications'
    ];

    // Install event - cache static files
    self.addEventListener('install', (event) => {
        console.log('Service Worker installing...');

        event.waitUntil(
            caches.open(STATIC_CACHE)
                .then((cache) => {
                    console.log('Caching static files...');
                    return cache.addAll(STATIC_FILES);
                })
                .then(() => {
                    console.log('Static files cached successfully');
                    return self.skipWaiting();
                })
                .catch((error) => {
                    console.error('Error caching static files:', error);
                })
        );
    });

    // Activate event - clean up old caches
    self.addEventListener('activate', (event) => {
        console.log('Service Worker activating...');

        event.waitUntil(
            caches.keys()
                .then((cacheNames) => {
                    return Promise.all(
                        cacheNames.map((cacheName) => {
                            if (cacheName !== STATIC_CACHE &&
                                cacheName !== DYNAMIC_CACHE &&
                                cacheName !== API_CACHE) {
                                console.log('Deleting old cache:', cacheName);
                                return caches.delete(cacheName);
                            }
                        })
                    );
                })
                .then(() => {
                    console.log('Service Worker activated');
                    return self.clients.claim();
                })
        );
    });

    // Fetch event - serve from cache or network
    self.addEventListener('fetch', (event) => {
        const { request } = event;
        const url = new URL(request.url);

        // Skip non-GET requests
        if (request.method !== 'GET') {
            return;
        }

        // Bypass service worker for file downloads (PDF, ZIP, etc.)
        if (url.pathname.includes('/download/') ||
            url.pathname.endsWith('.pdf') ||
            url.pathname.endsWith('.zip') ||
            url.pathname.includes('/api/files/download/')) {
            // Always fetch from network for downloads to ensure authentication works
            return fetch(request);
        }

        // Handle different types of requests
        if (url.pathname.startsWith('/api/')) {
            event.respondWith(handleApiRequest(request));
        } else if (url.pathname.startsWith('/src/') || url.pathname.endsWith('.js') || url.pathname.endsWith('.css')) {
            event.respondWith(handleStaticRequest(request));
        } else {
            event.respondWith(handlePageRequest(request));
        }
    });

    // Handle API requests with cache-first strategy
    async function handleApiRequest(request) {
        const url = new URL(request.url);

        // Check if this is a cacheable API endpoint
        const isCacheable = API_ENDPOINTS.some(endpoint => url.pathname.startsWith(endpoint));

        if (!isCacheable) {
            return fetch(request);
        }

        try {
            const cache = await caches.open(API_CACHE);
            const cachedResponse = await cache.match(request);

            if (cachedResponse) {
                // Return cached response and update in background
                fetchAndCache(request, cache);
                return cachedResponse;
            } else {
                // Fetch from network and cache
                return await fetchAndCache(request, cache);
            }
        } catch (error) {
            console.error('API request failed:', error);
            return fetch(request);
        }
    }

    // Handle static file requests with cache-first strategy
    async function handleStaticRequest(request) {
        try {
            const cache = await caches.open(STATIC_CACHE);
            const cachedResponse = await cache.match(request);

            if (cachedResponse) {
                return cachedResponse;
            } else {
                const networkResponse = await fetch(request);
                if (networkResponse.ok) {
                    cache.put(request, networkResponse.clone());
                }
                return networkResponse;
            }
        } catch (error) {
            console.error('Static request failed:', error);
            return fetch(request);
        }
    }

    // Handle page requests with network-first strategy
    async function handlePageRequest(request) {
        try {
            const networkResponse = await fetch(request);

            if (networkResponse.ok) {
                const cache = await caches.open(DYNAMIC_CACHE);
                cache.put(request, networkResponse.clone());
            }

            return networkResponse;
        } catch (error) {
            console.error('Page request failed, trying cache:', error);

            const cache = await caches.open(DYNAMIC_CACHE);
            const cachedResponse = await cache.match(request);

            if (cachedResponse) {
                return cachedResponse;
            } else {
                // Return offline page
                return caches.match('/offline.html') || new Response('Offline', { status: 503 });
            }
        }
    }

    // Fetch and cache helper
    async function fetchAndCache(request, cache) {
        try {
            const networkResponse = await fetch(request);

            if (networkResponse.ok) {
                // Clone the response before caching
                const responseToCache = networkResponse.clone();

                // Cache with expiration
                const responseWithHeaders = new Response(responseToCache.body, {
                    status: responseToCache.status,
                    statusText: responseToCache.statusText,
                    headers: {
                        ...responseToCache.headers,
                        'sw-cache-timestamp': Date.now().toString()
                    }
                });

                cache.put(request, responseWithHeaders);
            }

            return networkResponse;
        } catch (error) {
            console.error('Fetch and cache failed:', error);
            throw error;
        }
    }

    // Background sync for offline actions
    self.addEventListener('sync', (event) => {
        console.log('Background sync triggered:', event.tag);

        if (event.tag === 'background-sync') {
            event.waitUntil(doBackgroundSync());
        }
    });

    async function doBackgroundSync() {
        try {
            // Get pending actions from IndexedDB
            const pendingActions = await getPendingActions();

            for (const action of pendingActions) {
                try {
                    await fetch(action.url, {
                        method: action.method,
                        headers: action.headers,
                        body: action.body
                    });

                    // Remove from pending actions
                    await removePendingAction(action.id);
                } catch (error) {
                    console.error('Background sync action failed:', error);
                }
            }
        } catch (error) {
            console.error('Background sync failed:', error);
        }
    }

    // Push notification handling
    self.addEventListener('push', (event) => {
        console.log('Push notification received:', event);

        const options = {
            body: event.data ? event.data.text() : 'New notification',
            icon: '/icon-192x192.png',
            badge: '/badge-72x72.png',
            vibrate: [100, 50, 100],
            data: {
                dateOfArrival: Date.now(),
                primaryKey: 1
            },
            actions: [
                {
                    action: 'explore',
                    title: 'View',
                    icon: '/icon-192x192.png'
                },
                {
                    action: 'close',
                    title: 'Close',
                    icon: '/icon-192x192.png'
                }
            ]
        };

        event.waitUntil(
            self.registration.showNotification('Swagat Odisha', options)
        );
    });

    // Notification click handling
    self.addEventListener('notificationclick', (event) => {
        console.log('Notification clicked:', event);

        event.notification.close();

        if (event.action === 'explore') {
            event.waitUntil(
                clients.openWindow('/dashboard')
            );
        }
    });

    // Cache management utilities
    async function getPendingActions() {
        // This would typically use IndexedDB
        // For now, return empty array
        return [];
    }

    async function removePendingAction(actionId) {
        // This would typically use IndexedDB
        console.log('Removing pending action:', actionId);
    }

    // Cache cleanup
    async function cleanupCache() {
        const cacheNames = await caches.keys();
        const oldCaches = cacheNames.filter(name =>
            name !== STATIC_CACHE &&
            name !== DYNAMIC_CACHE &&
            name !== API_CACHE
        );

        await Promise.all(
            oldCaches.map(cacheName => caches.delete(cacheName))
        );

        console.log('Cache cleanup completed');
    }

    // Periodic cache cleanup
    setInterval(cleanupCache, 24 * 60 * 60 * 1000); // Daily cleanup
} // End of production mode check
