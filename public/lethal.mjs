// Ultraviolet
await import('https://cdn.jsdelivr.net/npm/@titaniumnetwork-dev/ultraviolet/dist/uv.bundle.js');
// UV Config
await import('./uv.config.js');
// Scramjet
await import("./scram/scramjet.shared.js")
await import("./scram/scramjet.worker.js")
await import("./scram/scramjet.controller.js")
// Bare Mux
import * as BareMux from 'https://cdn.jsdelivr.net/npm/@mercuryworkshop/bare-mux/dist/index.mjs';

const connection = new BareMux.BareMuxConnection("/bareworker.js");

let wispURL = null; // Not exported because it needs to be set through `setWisp`
let transportURL = null; // Not exported because it needs to be set through `setTransport`
let proxyOption = null; // Not exported becuase it needs to be set through `setProxy`

// Service Worker for Ultraviolet
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
    wasm: "/scram/scramjet.wasm.wasm",
    worker: "/scram/scramjet.worker.js",
    client: "/scram/scramjet.client.js",
    shared: "/scram/scramjet.shared.js",
    sync: "/scram/scramjet.sync.js",
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
		sourcemaps: false,
	},
	codec: {
		encode: (url: string) => {
  		if (!url) return url;
      let result = "";
      let len = url.length;
      for (let i = 0; i < len; i++) {
        const char = url[i];
        result += i % 2 ? String.fromCharCode(char.charCodeAt(0) ^ 2) : char;
      }
      return encodeURIComponent(result);
		},
		decode: (url: string) => {
      if (!url) return url;
      url = decodeURIComponent(url);
      let result = "";
      let len = url.length;
      for (let i = 0; i < len; i++) {
        const char = url[i];
        result += i % 2 ? String.fromCharCode(char.charCodeAt(0) ^ 2) : char;
      }
  		return result;
		},
	},
  prefix: "/scramjet/",
});

scramjet.init();

await registerSW(); // Register the service worker
console.log('lethal.js: Service Worker registered');


/**
 * Convert and any search/url bar input into a formatted URL ready for use
 * @param {string} input - The inputed search terms, URl, or query
 * @param {string} template - The search engine prefix
 * @returns {string} - The proccessed output URL 
 */
export function makeURL(input, template = 'https://search.brave.com/search?q=%s') {
  try {
    return new URL(input).toString();
  } catch (err) { }

  try {
    const url = new URL(`http://${input}`);
    if (url.hostname.includes(".")) return url.toString();
  } catch (err) { }

  return template.replace("%s", encodeURIComponent(input));
}

async function updateBareMux() {
  if (transportURL != null && wispURL != null) {
    console.log(`lethal.js: Setting BareMux to ${transportURL} and Wisp to ${wispURL}`);
    await connection.setTransport(transportURL, [{ wisp: wispURL }]);
  }
}

// Transport options
const transportOptions = {
  "epoxy": "https://cdn.jsdelivr.net/npm/@mercuryworkshop/epoxy-transport/dist/index.mjs",
  "libcurl": "https://cdn.jsdelivr.net/npm/@mercuryworkshop/libcurl-transport/dist/index.mjs"
}
/**
 * Select the transport method for the connection
 * @param {string} transport - The transport method to use (`'epoxy'`, `'libcurl'`, path to MJS or URL)
*/
export async function setTransport(transport) {
  console.log(`lethal.js: Setting transport to ${transport}`);
  // Epoxy or libcurl options
  transportURL = transportOptions[transport];
  if (!transportURL) {
    transportURL = transport;
  }

  await updateBareMux();
}
export function getTransport() {
  return transportURL;
}

// Wisp options
/**
 * 
 * @param {string} wisp - The WebSocket URL for the Wisp (eg. `'wss://your.wisp.server/wisp/'`)
 */
export async function setWisp(wisp) {
  console.log(`lethal.js: Setting Wisp to ${wisp}`);
  wispURL = wisp;

  await updateBareMux();
}
export function getWisp() {
  return wispURL;
}

/**
 * Select the proxy method for the backend
 * @param {string} proxy - The proxy method to use (`'scram'`, `'uv'`)
*/
export async function setProxy(proxy) {
  console.log(`lethal.js: Setting proxy backend to {proxy}`);
  proxyOption = proxy;
}


// Main Ultraviolet function
/**
 * Get the Proxied URL for a given input
 * @param {string} input - The inputed search terms, URl, or query
 * @returns {string} - The proxied URL (viewable in an iframe)
 */
export async function getProxied(input) {
  const url = makeURL(input);

  if (proxyOption != "scram")
    return __uv$config.prefix + __uv$config.encodeUrl(url);

  else return scramjet.encodeUrl(url);
}
