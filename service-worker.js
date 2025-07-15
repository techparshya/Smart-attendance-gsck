// service-worker.js

self.addEventListener('install', event => {
  self.skipWaiting(); // Immediately activate this version
});

self.addEventListener('activate', event => {
  event.waitUntil(clients.claim()); // Control existing clients
});

// For development: always fetch from network (no cache)
self.addEventListener('fetch', event => {
  event.respondWith(fetch(event.request));
});
