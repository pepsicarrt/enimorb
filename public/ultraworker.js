importScripts(
  "https://unpkg.com/@titaniumnetwork-dev/ultraviolet@3.2.10/dist/uv.bundle.js",
)
importScripts("uv.config.js")
importScripts(__uv$config.sw)
importScripts("/workerware/workerware.js")
importScripts("/alu-adblocker.js")
importScripts("/scram/scramjet.all.js");


if (navigator.userAgent.includes("Firefox")) {
  Object.defineProperty(globalThis, "crossOriginIsolated", {
    value: true,
    writable: true,
  })
}

const uv = new UVServiceWorker()
const { ScramjetServiceWorker } = $scramjetLoadWorker();
const scramjet = new ScramjetServiceWorker();
(async function () {
        await scramjet.loadConfig();
})();
const ww = new WorkerWare({});



if (navigator.userAgent.includes("Firefox")) {
    Object.defineProperty(globalThis, "crossOriginIsolated", {
        value: true,
        writable: true
    });
}


ww.use({
  function: self.adblockExt.filterRequest,
  events: ["fetch"],
  name: "Adblock",
});


self.vencordjs = "";
self.vencordcss = "";
(async function () {
  try {
    const js = await fetch("https://github.com/Equicord/Equicord/releases/download/latest/browser.js");
    const css = await fetch("https://github.com/Equicord/Equicord/releases/download/latest/browser.css");
    self.vencordjs = await js.text();
    self.vencordcss = await css.text();
    self.vencord = {
      injectDiscord: async function (e) {
        alert("a");
        const url = e.request.url;
        if (
          e.request.method !== "GET" ||
          !url.includes("discord.com") ||
          e.request.destination !== "document"
        )
          return;

        const originalRes = await fetch(e.request);
        const html = (await originalRes.text()).replace(
          /<head[^>]*>/i,
          `$&<script>${self.vencordjs}<\/script><style>${self.vencordcss}</style>`
        );

        const headers = new Headers(originalRes.headers);
        headers.set("content-type", "text/html");

        e.respondWith(
          new Response(html, {
            status: originalRes.status,
            statusText: originalRes.statusText,
            headers,
          })
        );
      },
    };

    ww.use({
      function: self.vencord.injectDiscord,
      events: ["fetch"],
      name: "EquicordInjection",
    });
  } catch (e) {
    console.warn("equicord injection failed", e);
  }
})();


self.addEventListener("install", () => {
  self.skipWaiting()
})


async function handleRequest(event) {
  let mwResponse = await ww.run(event)();
  if (mwResponse.includes(null)) {
    return;
  }
  
  if (scramjet.route(event)) {
    return scramjet.fetch(event)
  }


  if (uv.route(event)) return await uv.fetch(event);
    
  return await fetch(event.request)
}

self.addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event))
})


