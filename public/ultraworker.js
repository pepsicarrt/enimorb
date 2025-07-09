importScripts(
  "https://unpkg.com/@titaniumnetwork-dev/ultraviolet@3.2.10/dist/uv.bundle.js",
)
importScripts("uv.config.js")
importScripts(__uv$config.sw)
importScripts("/scram/scramjet.shared.js", "/scram/scramjet.worker.js")
importScripts("/workerware/workerware.js")
importScripts("/alu-adblocker.js")

if (navigator.userAgent.includes("Firefox")) {
  Object.defineProperty(globalThis, "crossOriginIsolated", {
    value: true,
    writable: true,
  })
}

const uv = new UVServiceWorker()
const scramjet = new ScramjetServiceWorker()
const ww = new WorkerWare({});

ww.use({
  function: self.adblockExt.filterRequest,
  events: ["fetch"],
  name: "Adblock",
});


self.addEventListener("install", () => {
  self.skipWaiting()
})

async function handleRequest(event) {

  await scramjet.loadConfig()
  if (scramjet.route(event)) {
    return scramjet.fetch(event)
  }


  if (uv.route(event)) {
    let mwResponse = await ww.run(event)();
    if (mwResponse.includes(null)) {
      return;
    }
  
    return await uv.fetch(event)
  }
    
  return await fetch(event.request)
}

self.addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event))
})
