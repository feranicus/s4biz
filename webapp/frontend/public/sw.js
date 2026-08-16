/* Service worker — app shell only.
 *
 * HARD RULE: NEVER cache /api. The contact endpoint is a write, and a cached response there would
 * either replay a stale answer or, worse, make a failed send look successful. Only static build
 * assets are cached.
 *
 * Strategy: network first for navigation, so a deploy is picked up on the next visit rather than
 * days later; cache first for hashed build assets, which Vite fingerprints and which are therefore
 * immutable by construction.
 *
 * The cache name carries a version. Bump it when the shell changes shape; `activate` deletes every
 * cache that is not the current one, so an old shell can never survive a deploy.
 */
const CACHE = "s4biz-shell-v1";
const SHELL = ["/", "/manifest.webmanifest", "/icon-192.png", "/icon-512.png", "/apple-touch-icon.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches
      .open(CACHE)
      // addAll rejects the WHOLE install if any one entry 404s, which would silently leave the
      // site with no service worker at all. Add them individually and tolerate a miss.
      .then((c) => Promise.allSettled(SHELL.map((u) => c.add(u))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return; // never, under any circumstances

  if (e.request.mode === "navigate") {
    e.respondWith(
      fetch(e.request)
        .then((r) => {
          const cp = r.clone();
          caches.open(CACHE).then((c) => c.put(e.request, cp));
          return r;
        })
        .catch(() => caches.match(e.request).then((m) => m || caches.match("/")))
    );
    return;
  }

  if (
    /\/assets\/.*\.(js|css|woff2?)$/.test(url.pathname) ||
    /\.(png|svg|ico|jpg|webp|webmanifest)$/.test(url.pathname)
  ) {
    e.respondWith(
      caches.match(e.request).then(
        (m) =>
          m ||
          fetch(e.request).then((r) => {
            const cp = r.clone();
            caches.open(CACHE).then((c) => c.put(e.request, cp));
            return r;
          })
      )
    );
  }
});
