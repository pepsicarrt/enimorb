const swAllowedHostnames = ["localhost", "127.0.0.1"];
const stockSW = "./ultraworker.js";

self.onmessage = async () => {
	if (!("navigator" in self)) {
		postMessage({ error: "SW registration not supported in worker context." });
		return;
	}

	if (!("serviceWorker" in navigator)) {
		postMessage({ error: "Browser does not support service workers." });
		return;
	}

	if (
		location.protocol !== "https:" &&
		!swAllowedHostnames.includes(location.hostname)
	) {
		postMessage({ error: "Cannot register SW without HTTPS." });
		return;
	}

	try {
		await navigator.serviceWorker.register(stockSW);
		postMessage({ success: true });
	} catch (e) {
		postMessage({ error: (e as Error).message });
	}
};
