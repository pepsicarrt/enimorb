importScripts('https://brominecdn.netlify.app/uv/uv.bundle.js');
importScripts('uv.config.js');
importScripts(__uv$config.sw);
importScripts("/scram/scramjet.shared.js", "/scram/scramjet.worker.js");

// --- Firefox crossOriginIsolated Workaround ---
if (navigator.userAgent.includes("Firefox")) {
    Object.defineProperty(globalThis, "crossOriginIsolated", {
        value: true,
        writable: true
    });
}

const uv = new UVServiceWorker();
const scramjet = new ScramjetServiceWorker();

const cacheName = 'cache-v1';

self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating...');


    event.waitUntil(scramjet.loadConfig());

    event.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(
                keyList.map((key) => {
                    if (key !== cacheName) {
                        console.log('[Service Worker] Deleting old cache:', key);
                        return caches.delete(key);
                    }
                })
            );
        })
    );  
  event.waitUntil(clients.claim());
});

// --- Fetch Handler ---

async function handleRequest(event) {
    const request = event.request;

        if (scramjet.route(event)) {
            return await scramjet.fetch(event);
        }


        if (uv.route(event)) {
            return await uv.fetch(event);
        }


    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
        event.waitUntil(
            fetch(request)
                .then((networkResponse) => {
                    if (networkResponse.ok) {
                        return cache.put(request, networkResponse.clone());
                    }
                    return null;
                })
                .catch((error) => {
                    console.warn(`[Service Worker] Background fetch failed for ${request.url}:`, error);
                })
        );
        return cachedResponse;
    }
            const networkResponse = await fetch(request);
            if (networkResponse.ok) 
            await cache.put(request, networkResponse.clone());
            
            return networkResponse;
}

self.addEventListener('fetch', (event) => {
    event.respondWith(handleRequest(event));
});
