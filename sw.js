// Pavani Binary Pro - Service Worker (Online-Only Mode)

const CACHE_NAME = 'pavani-binary-pro-v1';

self.addEventListener('install', (event) => {
  console.log('Pavani Binary Pro: Service Worker Installed');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Pavani Binary Pro: Service Worker Activated');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// ALWAYS use network - this app requires internet
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return new Response(
        JSON.stringify({
          error: 'No internet connection',
          message: 'Pavani Binary Pro requires an active internet connection.'
        }),
        {
          headers: { 'Content-Type': 'application/json' }
        }
      );
    })
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
