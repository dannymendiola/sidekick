/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />
import { build, version, files } from '$service-worker';

const sw = self as unknown as ServiceWorkerGlobalScope;

// Create a cache name for this deployment
const CACHE = `cache-sk-${version}`;

const ASSETS = [
	...build, // the app itself
	...files // everything in static
];

sw.addEventListener('install', async (event) => {
	const addFilesToCache = async () => {
		const cache = await caches.open(CACHE);
		console.log('[Service Worker] Caching app assets');
		await cache.addAll(ASSETS);
	};

	event.waitUntil(addFilesToCache());
});

sw.addEventListener('activate', (event) => {
	let deletedCaches = 0;
	const deleteOldCaches = async () => {
		for (const key of await caches.keys()) {
			if (key !== CACHE) {
				await caches.delete(key);
				deletedCaches++;
			}
		}
	};
	event.waitUntil(deleteOldCaches());
	if (deletedCaches > 0) {
		console.log(`[Service Worker] Deleted ${deletedCaches} caches`);
	}
});

sw.addEventListener('fetch', (event) => {
	// ignore POST requests etc
	if (event.request.method !== 'GET') return;

	async function respond() {
		const url = new URL(event.request.url);
		const cache = await caches.open(CACHE);

		// `build`/`files` can always be served from the cache
		if (ASSETS.includes(url.pathname)) {
			const response = await cache.match(url.pathname);

			if (response) {
				return response;
			}
		}

		// for everything else, try the network first, but
		// fall back to the cache if we're offline
		try {
			const response = await fetch(event.request);

			// if we're offline, fetch can return a value that is not a Response
			// instead of throwing - and we can't pass this non-Response to respondWith
			if (!(response instanceof Response)) {
				throw new Error('invalid response from fetch');
			}

			if (response.status === 200) {
				cache.put(event.request, response.clone());
			}

			return response;
		} catch (err) {
			const response = await cache.match(event.request);

			if (response) {
				return response;
			}

			// if there's no cache, then just error out
			// as there is nothing we can do to respond to this request
			throw err;
		}
	}

	event.respondWith(respond());
});
