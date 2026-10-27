// Service worker for the offline-capable exhibition PWA.
//
// Strategy:
// - HTML page navigations (e.g. "/", "/dashboard/", "/scan/green/") use
//   NETWORK-FIRST: always try to fetch the latest version from the server,
//   and only fall back to a cached copy if the visitor is offline. This is
//   critical for a PWA that gets redeployed/fixed during setup — a
//   cache-first strategy would otherwise permanently "lock in" a broken or
//   stale page the first time it's ever visited on a given phone, even
//   after the real site has been fixed on the server.
// - Static, content-hashed build assets (JS/CSS chunks under /_next/static/)
//   use CACHE-FIRST, since their filenames change whenever their content
//   changes, making stale caches impossible for those files — this keeps
//   the app fast and mostly usable offline after the first successful visit.
const CACHE_NAME = "exhibition-passport-v3";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

function isStaticBuildAsset(url) {
  return url.pathname.includes("/_next/static/");
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  if (isStaticBuildAsset(url)) {
    // Cache-first: these files are content-hashed, so a cached copy can
    // never be "stale" — if the content changed, the filename changed too.
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((res) => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone)).catch(() => {});
          return res;
        });
      })
    );
    return;
  }

  // Network-first for everything else (HTML pages, manifest, icons, etc.)
  event.respondWith(
    fetch(request)
      .then((res) => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(request))
  );
});
