const CACHE_NAME = "zumbale-v1";
const urlsToCache = [
  "./",
  "./index.html",
  "./app.js",
  "./logo.png",
  "./zumbido.mp3"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log("Service Worker: Archivos en cache");
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});

self.addEventListener("activate", event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if(!cacheWhitelist.includes(cacheName)){
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});