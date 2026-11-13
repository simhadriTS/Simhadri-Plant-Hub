/* NTPC Simhadri Plant Hub — one service worker for the launcher and both apps.
   Bump CACHE whenever app code changes so every phone picks up the new version. */
const CACHE = 'plant-hub-v1';
const CORE = [
  './', './index.html', './manifest.webmanifest', './favicon.ico',
  './icons/icon-180.png', './icons/icon-192.png', './icons/icon-512.png',
  './icons/icon-192-maskable.png', './icons/icon-512-maskable.png', './icons/simhadri-logo.png',
  './guide/', './guide/index.html', './guide/data/locations.json', './guide/data/land.json',
  './owner/', './owner/index.html', './owner/app.js',
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.allSettled(CORE.map(u => c.add(u)))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE && k !== 'tiles-v1').map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Never intercept live data / auth / routing APIs
  if (/googleapis\.com$|firebaseio\.com|api\.github\.com|router\.project-osrm\.org|google\.com$/.test(url.hostname) &&
      !/fonts\.googleapis\.com/.test(url.hostname)) return;

  // Map tiles: cache on use so visited areas work offline
  if (/arcgisonline\.com|tile\.openstreetmap\.org/.test(url.hostname)) {
    e.respondWith(caches.open('tiles-v1').then(c => c.match(req).then(hit => hit || fetch(req).then(res => {
      if (res && (res.ok || res.type === 'opaque')) c.put(req, res.clone());
      return res;
    }).catch(() => hit))));
    return;
  }

  // Same-origin: network first (always fresh code & data), cache fallback offline
  if (url.origin === location.origin) {
    e.respondWith(fetch(req).then(res => {
      if (res && res.ok && !url.search) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req, { ignoreSearch: true }).then(hit => {
      if (hit) return hit;
      if (req.mode === 'navigate') {
        const p = url.pathname;
        return caches.match(p.includes('/guide/') ? './guide/index.html' : p.includes('/owner/') ? './owner/index.html' : './index.html');
      }
      return Response.error();
    })));
    return;
  }

  // CDN libraries & fonts: cache first
  if (/cdnjs\.cloudflare\.com|gstatic\.com|fonts\.googleapis\.com/.test(url.hostname)) {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
      if (res && (res.ok || res.type === 'opaque')) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    })));
  }
});
