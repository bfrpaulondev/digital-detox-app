// Digital Detox PWA Service Worker v3
// Strategy: Network-first for everything, cache only HTML and static assets
const CACHE_NAME = 'digital-detox-v3';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// File patterns that should NEVER be cached (always fetched from network)
const NO_CACHE_EXTENSIONS = ['.js', '.css', '.json', '.woff', '.woff2', '.ttf', '.svg'];

function shouldCache(url) {
  // Never cache API calls
  if (url.includes('/api/')) return false;
  // Never cache JS/CSS/font bundles
  const pathname = new URL(url).pathname;
  for (const ext of NO_CACHE_EXTENSIONS) {
    if (pathname.endsWith(ext)) return false;
  }
  // Only cache static assets listed above
  return true;
}

// Install event - cache minimal static assets only
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean ALL old caches (forces fresh start)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          // Delete ALL caches, including current one, to force fresh start
          return caches.delete(name);
        })
      );
    })
  );
  self.clients.claim();
  // Notify all clients to refresh
  self.clients.matchAll().then((clients) => {
    clients.forEach((client) => {
      client.postMessage({ type: 'SW_UPDATED', cacheName: CACHE_NAME });
    });
  });
});

// Fetch event - network first, cache only allowed resources
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip API calls entirely
  if (event.request.url.includes('/api/')) return;

  // For JS/CSS bundles, always go to network (never cache)
  if (!shouldCache(event.request.url)) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response('Offline - Resource not available', { status: 503 });
      })
    );
    return;
  }

  // For allowed resources: network first, cache fallback
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request).then((response) => {
          if (response) return response;
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
          return new Response('Offline', { status: 503 });
        });
      })
  );
});
