const CACHE_NAME = "ai-learning-nepal-v2";
const OFFLINE_FALLBACK_URL = "/offline";

const PRECACHE_ASSETS = [
  "/",
  "/offline",
  "/manifest.json",
  "/icon.svg",
];

// Install Event: Precache essential offline routes & assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate Event: Cleanup stale caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event: network-only navigation with a public offline fallback; cache static assets only.
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignore non-GET requests
  if (request.method !== "GET") {
    return;
  }

  // Handle navigation requests
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => {
        return caches.match(OFFLINE_FALLBACK_URL) || caches.match("/");
      })
    );
    return;
  }

  // Never cache API responses, cross-origin resources, or application HTML.
  const isStaticAsset =
    url.origin === self.location.origin &&
    (url.pathname.startsWith("/_next/static/") ||
      ["style", "script", "image", "font"].includes(request.destination));
  if (!isStaticAsset) {
    return;
  }

  // Stale-while-revalidate for versioned/static assets.
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached version immediately and update cache in background
        fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(request, networkResponse));
            }
          })
          .catch(() => {});
        return cachedResponse;
      }

      return fetch(request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type !== "basic") {
            return response;
          }
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
          return response;
        })
        .catch(() => {
          // Give callers an explicit failure for an uncached static resource.
          return new Response("Offline resource unavailable", { status: 503 });
        });
    })
  );
});
