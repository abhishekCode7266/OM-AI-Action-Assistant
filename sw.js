/**
 * OM AI Action Assistant — Production Service Worker
 * Build: v3.3.0-build.20261002
 * Tagline: "Think. Plan. Act. Achieve."
 */

const CACHE_NAME = 'om-assistant-v3.3.0-build.20261002';

const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './assets/css/style.css',
  './assets/icons/logo.svg',
  './assets/js/config.js',
  './assets/js/chatStore.js',
  './assets/js/analytics.js',
  './assets/js/files.js',
  './assets/js/voice.js',
  './assets/js/jarvisLive.js',
  './assets/js/mediaVision.js',
  './assets/js/dismantler3d.js',
  './assets/js/neuralCanvas.js',
  './assets/js/cyberTerminal.js',
  './assets/js/projects.js',
  './assets/js/planner.js',
  './assets/js/dashboard.js',
  './assets/js/assistant.js',
  './assets/js/app.js'
];

// 1. Install Event: Cache Core Assets
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[OM SW] Pre-caching static assets for', CACHE_NAME);
      return Promise.allSettled(
        STATIC_ASSETS.map((url) =>
          cache.add(url).catch((err) => {
            console.warn('[OM SW] Failed to cache:', url, err);
          })
        )
      );
    })
  );
});

// 2. Activate Event: Clean Old Caches & Claim Clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[OM SW] Purging old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Fetch Event: API calls network-first; Static assets cache-first / stale-while-revalidate
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Non-GET requests (POST / PUT / DELETE) bypass cache completely
  if (req.method !== 'GET') {
    return;
  }

  // API endpoints: Network-only / Network-first (never serve stale AI responses)
  if (url.pathname.includes('/api/')) {
    event.respondWith(
      fetch(req).catch(() => {
        return new Response(
          JSON.stringify({
            error: 'Network offline. Please check your internet connection.',
            cached: false,
            offline: true
          }),
          { headers: { 'Content-Type': 'application/json' }, status: 503 }
        );
      })
    );
    return;
  }

  // Static Assets: Cache-first, fallback to network and update cache
  event.respondWith(
    caches.match(req).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch in background to revalidate cache for next visit
        fetch(req).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            caches.open(CACHE_NAME).then((cache) => cache.put(req, networkResponse));
          }
        }).catch(() => {/* offline silent fallback */});
        return cachedResponse;
      }

      return fetch(req).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(req, responseToCache);
        });
        return networkResponse;
      }).catch((err) => {
        if (req.headers.get('accept') && req.headers.get('accept').includes('text/html')) {
          return caches.match('./index.html');
        }
        throw err;
      });
    })
  );
});
