// Used as a wrapper for the Ultraviolet worker but with custom configuration for bundle
/*global UVServiceWorker,__uv$config*/
/*
 * Stock service worker script.
 * Users can provide their own sw.js if they need to extend the functionality of the service worker.
 * Ideally, this will be registered under the scope in uv.config.js so it will not need to be modified.
 * However, if a user changes the location of uv.bundle.js/uv.config.js or sw.js is not relative to them, they will need to modify this script locally.
 */
importScripts('https://brominecdn.netlify.app/uv/uv.bundle.js');
importScripts('uv.config.js');
importScripts(__uv$config.sw);
importScripts("/scram/scramjet.shared.js", "/scram/scramjet.worker.js");
// importScripts("/workerware/workerware.js")

const uv = new UVServiceWorker();
const scramjet = new ScramjetServiceWorker();

let playgroundData;

self.addEventListener('message', ({ data }) => {
  if (data.type === 'playgroundData') {
    playgroundData = data;
  }
});

async function handleRequest(event) {

  await scramjet.loadConfig();
  if (scramjet.route(event)) {
    return scramjet.fetch(event);
  }
  if (uv.route(event)) {
    return await uv.fetch(event);
  }

  return await fetch(event.request)
}

self.addEventListener('fetch', (event) => {
  event.respondWith(handleRequest(event));
});
