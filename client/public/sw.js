// Digital Detox PWA Service Worker v4
// Strategy: Network-first for everything, minimal cache
const CACHE_NAME = 'digital-detox-v4';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Nothing gets cached except bare minimum HTML
function shouldCache(url) {
  if (url.includes('/api/')) return false;
  const pathname = new URL(url).pathname;
  // Only cache index.html root
  return pathname === '/' || pathname === '/index.html';
}

// Install - minimal
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Activate - delete ALL old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) => Promise.all(names.map(n => caches.delete(n))))
  );
  self.clients.claim();
  // Force all clients to reload
  self.clients.matchAll().then((clients) => {
    clients.forEach((client) => client.postMessage({ type: 'SW_UPDATED', v: 4 }));
  });
});

// Fetch - network always
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  if (event.request.url.includes('/api/')) return;

  // JS/CSS never cached
  const pathname = new URL(event.request.url).pathname;
  const noCache = ['.js', '.css', '.json', '.woff', '.woff2', '.ttf', '.svg'].some(ext => pathname.endsWith(ext));

  if (noCache) {
    event.respondWith(fetch(event.request).catch(() => new Response('Offline', { status: 503 })));
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((res) => {
        if (res.status === 200 && shouldCache(event.request.url)) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(event.request).then(r => r || new Response('Offline', { status: 503 })))
  );
});
