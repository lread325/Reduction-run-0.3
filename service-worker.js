const CACHE_NAME = 'reduction-run-v3';
const ASSETS = [
  './reduction-run.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// network-first for the HTML/app shell so a fix deployed to GitHub Pages is always
// picked up on next visit — cache is only a fallback for when the network is down,
// never a way to get "stuck" on an old build again.
// {cache: 'no-store'} is important here: GitHub Pages serves everything with
// Cache-Control: max-age=600 (a fixed 10-minute browser/CDN cache that can't be
// overridden from the repo side), and without this flag the browser's own HTTP
// cache could still quietly serve a stale response even though this handler is
// "network-first" — no-store forces an actual network round-trip every time.
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request, { cache: 'no-store' })
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
