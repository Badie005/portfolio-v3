// Service Worker for B.DEV Portfolio
// Version: 1.0.0

const CACHE_VERSION = 'v1';
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `dynamic-${CACHE_VERSION}`;
const IMAGE_CACHE = `images-${CACHE_VERSION}`;

// Assets to cache on install
const STATIC_ASSETS = [
    '/',
    '/offline.html',
    '/favicon.ico',
    '/favicon-dark.svg',
    '/favicon-light.svg',
    '/android-chrome-192x192.png',
    '/android-chrome-512x512.png',
    '/logo/SVG/Logo-B.svg',
];

// Cache size limits
const CACHE_LIMITS = {
    dynamic: 50,
    images: 100,
};

// Install event - cache static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((keys) => {
                return Promise.all(
                    keys
                        .filter((key) => {
                            return key !== STATIC_CACHE &&
                                key !== DYNAMIC_CACHE &&
                                key !== IMAGE_CACHE;
                        })
                        .map((key) => {
                            return caches.delete(key);
                        })
                );
            })
            .then(() => self.clients.claim())
    );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') return;

    // Skip chrome-extension and other non-http(s) requests
    if (!url.protocol.startsWith('http')) return;

    // API routes - Network First
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(networkFirst(request, DYNAMIC_CACHE));
        return;
    }

    // Images - Cache First
    if (isImageRequest(request)) {
        event.respondWith(cacheFirst(request, IMAGE_CACHE));
        return;
    }

    // Static assets (JS, CSS, fonts) - Stale While Revalidate
    if (isStaticAsset(request)) {
        event.respondWith(staleWhileRevalidate(request, STATIC_CACHE));
        return;
    }

    // HTML pages - Network First with offline fallback
    if (request.headers.get('accept')?.includes('text/html')) {
        event.respondWith(networkFirstWithOffline(request));
        return;
    }

    // Default - Network First
    event.respondWith(networkFirst(request, DYNAMIC_CACHE));
});

// Strategies

// Network First - try network, fallback to cache
async function networkFirst(request, cacheName) {
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(cacheName);
            cache.put(request, networkResponse.clone());
            await trimCache(cacheName, CACHE_LIMITS.dynamic);
        }
        return networkResponse;
    } catch (error) {
        const cachedResponse = await caches.match(request);
        return cachedResponse || Response.error();
    }
}

// Network First with Offline fallback for HTML
async function networkFirstWithOffline(request) {
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) return cachedResponse;

        // Return offline page for navigation requests
        const offlinePage = await caches.match('/offline.html');
        return offlinePage || new Response('Offline', {
            status: 503,
            statusText: 'Service Unavailable'
        });
    }
}

// Cache First - try cache, fallback to network
async function cacheFirst(request, cacheName) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) return cachedResponse;

    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(cacheName);
            cache.put(request, networkResponse.clone());
            await trimCache(cacheName, CACHE_LIMITS.images);
        }
        return networkResponse;
    } catch (error) {
        return Response.error();
    }
}

// Stale While Revalidate
async function staleWhileRevalidate(request, cacheName) {
    const cachedResponse = await caches.match(request);

    const fetchPromise = fetch(request)
        .then((networkResponse) => {
            if (networkResponse.ok) {
                caches.open(cacheName)
                    .then((cache) => cache.put(request, networkResponse.clone()));
            }
            return networkResponse;
        })
        .catch(() => cachedResponse);

    return cachedResponse || fetchPromise;
}

// Helpers

function isImageRequest(request) {
    const url = new URL(request.url);
    return (
        request.destination === 'image' ||
        /\.(jpg|jpeg|png|gif|svg|webp|avif|ico)$/i.test(url.pathname)
    );
}

function isStaticAsset(request) {
    const url = new URL(request.url);
    return (
        url.pathname.startsWith('/_next/static/') ||
        /\.(js|css|woff|woff2|ttf|eot)$/i.test(url.pathname)
    );
}

// Trim old entries from cache to stay within limits
async function trimCache(cacheName, maxItems) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    if (keys.length > maxItems) {
        // Delete oldest entries
        const deleteCount = keys.length - maxItems;
        for (let i = 0; i < deleteCount; i++) {
            await cache.delete(keys[i]);
        }
    }
}

// Listen for skip waiting message from client
self.addEventListener('message', (event) => {
    if (event.data?.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
