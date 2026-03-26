// Network-first strategy — always get latest version
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Skip non-GET and API/socket requests
  if (e.request.method !== 'GET' || e.request.url.includes('/api/') || e.request.url.includes('/socket.io/')) return;

  e.respondWith(
    fetch(e.request)
      .then(res => {
        // Cache successful responses for offline fallback
        if (res.ok) {
          const clone = res.clone();
          caches.open('spil-v1').then(c => c.put(e.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});

// Listen for update message from app
self.addEventListener('message', e => {
  if (e.data === 'skipWaiting') self.skipWaiting();
});
