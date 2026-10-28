// Liberia Job Board service worker.
// Keeps the app shell and recently viewed job pages available on weak or no connections.
// Employer pages and form submissions always go to the network and are never stored.
const VERSION = "v1";
const STATIC_CACHE = `jb-static-${VERSION}`;
const PAGE_CACHE = `jb-pages-${VERSION}`;
const OFFLINE_URL = "/offline.html";
const PRECACHE = [OFFLINE_URL, "/icon-192.png", "/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => ![STATIC_CACHE, PAGE_CACHE].includes(k)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

// Only public pages are kept for offline reading.
function isPublicPage(url) {
  return url.pathname === "/" || url.pathname.startsWith("/jobs/");
}

async function trimPages(max) {
  const cache = await caches.open(PAGE_CACHE);
  const keys = await cache.keys();
  for (let i = 0; i < keys.length - max; i++) await cache.delete(keys[i]);
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/employer") || url.pathname.startsWith("/api/")) return;

  // Built files have unique names, so a stored copy is always correct.
  if (url.pathname.startsWith("/_next/static/") || /\.(png|svg|ico|woff2?)$/.test(url.pathname)) {
    event.respondWith(
      caches.match(req).then(
        (hit) =>
          hit ||
          fetch(req).then((res) => {
            if (res.ok) {
              const copy = res.clone();
              caches.open(STATIC_CACHE).then((c) => c.put(req, copy));
            }
            return res;
          }),
      ),
    );
    return;
  }

  // Pages: always try the network first so jobs are up to date; fall back to a stored copy or the offline page.
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok && isPublicPage(url)) {
            const copy = res.clone();
            caches.open(PAGE_CACHE).then((c) => c.put(req, copy).then(() => trimPages(30)));
          }
          return res;
        })
        .catch(async () => (await caches.match(req)) || (await caches.match(OFFLINE_URL))),
    );
  }
});
