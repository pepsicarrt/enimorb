importScripts('https://brominecdn.netlify.app/uv/uv.bundle.js');
importScripts('uv.config.js');
importScripts(__uv$config.sw);
importScripts("/scram/scramjet.shared.js", "/scram/scramjet.worker.js");

if (navigator.userAgent.includes("Firefox")) {
    Object.defineProperty(globalThis, "crossOriginIsolated", {
        value: true,
        writable: true
    });
}

const uv = new UVServiceWorker();
const scramjet = new ScramjetServiceWorker();

const cacheName = 'cache';


async function handleRequest(event) {

  await scramjet.loadConfig()
  if (scramjet.route(event)) 
    return scramjet.fetch(event);
  
  if (uv.route(event)) 
    return await uv.fetch(event);
 
  if (event.request) {
    return caches.open(cacheName).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        const fetchedResponse = fetch(event.request).then((networkResponse) => {
          cache.put(event.request, networkResponse.clone());

          return networkResponse;
        });

        return cachedResponse || fetchedResponse;
      });
    });
  }

  return await fetch(event.request)
}

self.addEventListener('fetch', (event) => {
  event.respondWith(handleRequest(event));
});


