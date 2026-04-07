// Victaulic Groove Inspector - Service Worker
// Increment this version number whenever you deploy an update
const CACHE_VERSION = 'v1';
const CACHE_NAME = 'groove-inspector-' + CACHE_VERSION;

const ASSETS = [
  '/victaulic-groove-inspector/',
  '/victaulic-groove-inspector/index.html',
  '/victaulic-groove-inspector/manifest.json',
  '/victaulic-groove-inspector/icon-192.png',
  '/victaulic-groove-inspector/icon-512.png'
];

// Install: cache all assets
self.addEventListener('install', function(event) {
  self.skipWaiting(); // Activate new SW immediately
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(ASSETS);
    })
  );
});

// Activate: delete old caches so updates apply straight away
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(key) {
          return key !== CACHE_NAME;
        }).map(function(key) {
          return caches.delete(key);
        })
      );
    }).then(function() {
      return self.clients.claim(); // Take control of all open tabs immediately
    })
  );
});

// Fetch: network first, fall back to cache
// This means users always get the latest version when online
self.addEventListener('fetch', function(event) {
  event.respondWith(
    fetch(event.request)
      .then(function(response) {
        // Update the cache with the fresh response
        var responseClone = response.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(function() {
        // Offline: serve from cache
        return caches.match(event.request);
      })
  );
});
