/* InvoiceCraft — Service Worker: makes the app work offline after the first visit.
   Bump CACHE when you change any file so users get the update. */
const CACHE = 'invoicecraft-v1';
const CORE = [
  './', './index.html', './style.css', './app.js', './icon.svg', './manifest.webmanifest',
  './lib/jspdf.umd.min.js', './lib/html2canvas.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
  'https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:wght@600;700&display=swap'
];

// Pre-cache core files (each one individually, so one failure doesn't break install)
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      Promise.all(CORE.map((url) =>
        fetch(url, { mode: url.startsWith('http') ? 'cors' : 'same-origin' })
          .then((res) => res.ok && cache.put(url, res))
          .catch(() => {})
      ))
    ).then(() => self.skipWaiting())
  );
});

// Remove old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Stale-while-revalidate: serve from cache instantly, refresh in the background
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const allowed = url.origin === location.origin ||
    /(^|\.)cdnjs\.cloudflare\.com$|(^|\.)fonts\.googleapis\.com$|(^|\.)fonts\.gstatic\.com$/.test(url.hostname);
  if (!allowed) return;

  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const cached = await cache.match(req, { ignoreSearch: url.origin === location.origin });
      const network = fetch(req)
        .then((res) => { if (res && (res.ok || res.type === 'opaque')) cache.put(req, res.clone()); return res; })
        .catch(() => cached || (req.mode === 'navigate' ? cache.match('./index.html') : undefined));
      return cached || network;
    })
  );
});
