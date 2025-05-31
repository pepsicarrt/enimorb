//////////////////////////////
///          Init          ///
//////////////////////////////
await import('https://cdn.jsdelivr.net/gh/Coding4Hours/cdn/uv/uv.bundle.js');

await import('./uv.config.js');

await import("https://cdn.jsdelivr.net/gh/Coding4Hours/cdn/scram/scramjet.shared.js")
await import("https://cdn.jsdelivr.net/gh/Coding4Hours/cdn/scram/scramjet.worker.js")
await import("https://cdn.jsdelivr.net/gh/Coding4Hours/cdn/scram/scramjet.controller.js")

import * as BareMux from 'https://cdn.jsdelivr.net/gh/Coding4Hours/cdn/bare-mux/index.mjs';


//////////////////////////////
///         Options        ///
//////////////////////////////
const connection = new BareMux.BareMuxConnection("/bareworker.js");


let bareURL = null;
let wispURL = null;
let transportURL = null;
let proxyOption = null; 

const transportOptions = {
  "epoxy": "https://cdn.jsdelivr.net/npm/@mercuryworkshop/epoxy-transport/dist/index.mjs",
  "libcurl": "https://cdn.jsdelivr.net/npm/@mercuryworkshop/libcurl-transport/dist/index.mjs",
  "bare": "https://cdn.jsdelivr.net/gh/Coding4Hours/bare-as-module3@dev/dist/index.mjs",
}


//////////////////////////////
///           SW           ///
//////////////////////////////
const stockSW = "./ultraworker.js";
const swAllowedHostnames = ["localhost", "127.0.0.1"];

async function registerSW() {
  if (!navigator.serviceWorker) {
    if (
      location.protocol !== "https:" &&
      !swAllowedHostnames.includes(location.hostname)
    )
      throw new Error("Service workers cannot be registered without https.");

    throw new Error("Your browser doesn't support service workers.");
  }

  await navigator.serviceWorker.register(stockSW);
}

const scramjet = new ScramjetController({
  files: {
    wasm: "https://cdn.jsdelivr.net/gh/Coding4Hours/cdn/scram/scramjet.wasm.wasm",
    worker: "https://cdn.jsdelivr.net/gh/Coding4Hours/cdn/scram/scramjet.worker.js",
    client: "https://cdn.jsdelivr.net/gh/Coding4Hours/cdn/scram/scramjet.client.js",
    shared: "https://cdn.jsdelivr.net/gh/Coding4Hours/cdn/scram/scramjet.shared.js",
    sync: "https://cdn.jsdelivr.net/gh/Coding4Hours/cdn/scram/scramjet.sync.js",
  },
	flags: {
	  serviceworkers: false,
		syncxhr: false,
		naiiveRewriter: false,
		strictRewrites: true,
		rewriterLogs: false,
		captureErrors: true,
		cleanErrors: true,
		scramitize: false,
		sourcemaps: true,
	},
});

scramjet.init();

await registerSW();
console.log('lethal.js: Service Worker registered');


//////////////////////////////
///        Functions       ///
//////////////////////////////
export function makeURL(input, template = 'https://search.brave.com/search?q=%s') {
  try {
    return new URL(input).toString();
  } catch (err) { }

  const url = new URL(`http://${input}`);
  if (url.hostname.includes(".")) return url.toString();

  return template.replace("%s", encodeURIComponent(input));
}

async function updateBareMux() {
  if(transportURL != "https://cdn.jsdelivr.net/gh/Coding4Hours/bare-as-module3@dev/dist/index.js") {
  if (wispURL != null) {
    console.log(`lethal.js: Setting BareMux to ${transportURL} and Wisp to ${wispURL}`);
    await connection.setTransport(transportURL, [{ wisp: wispURL }]);
  }
  } else if(transportURL === "https://cdn.jsdelivr.net/gh/Coding4Hours/bare-as-module3@dev/dist/index.js") {
    if (bareURL != null) {
      console.log(`lethal.js: Setting BareMux to ${transportURL} and Bare to ${bareURL}]`);
      await connection.settransport(transporturl, bareURL);
    }
  }
}


export async function setTransport(transport) {
  console.log(`lethal.js: Setting transport to ${transport}`);
  transportURL = transportOptions[transport];
  if (!transportURL) {
    transportURL = transport;
  }

  await updateBareMux();
}

export function getTransport() {
  return transportURL;
}

export async function setWisp(wisp) {
  console.log(`lethal.js: Setting Wisp to ${wisp}`);
  wispURL = wisp;

  await updateBareMux();
}

export function getWisp() {
  return wispURL;
}

export async function setBare(bare) {
  console.log(`lethal.js: Setting Bare to ${bare}`);
  bareURL = bare;

  await updateBareMux();
}

export function getBare() {
  return bareURL;
}

export function setProxy(proxy) {
  console.log(`lethal.js: Setting proxy backend to {proxy}`);
  proxyOption = proxy;
}

export function getProxy() {
  return proxyOption;
}

export async function getProxied(input) {
  const url = makeURL(input);

  if (proxyOption != "scram")
    return __uv$config.prefix + __uv$config.encodeUrl(url);

  else return scramjet.encodeUrl(url);
}
