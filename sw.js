/**
 * OM AI Action Assistant — Production Service Worker
 * Build: v3.3.1-build.20261002.1
 * Tagline: "Think. Plan. Act. Achieve."
 */

const CACHE_NAME = 'om-assistant-v3.3.1-build.20261002.165152';

const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './assets/icons/logo.svg'
];

// 1. Install Event: Cache Core Assets immediately
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

// 2. Activate Event: Clean Old Caches & Claim Clients immediately
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

// Listen for message events (e.g. skipWaiting trigger from client)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// 3. Fetch Event: Strict Cache Busting & Fresh Updates
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

  // HTML Navigation Requests: Network-First (Enforces instant updates on GitHub deployments)
  const isHtmlRequest = req.mode === 'navigate' || (req.headers.get('accept') && req.headers.get('accept').includes('text/html'));
  if (isHtmlRequest) {
    event.respondWith(
      fetch(req).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const toCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, toCache));
        }
        return networkResponse;
      }).catch(() => {
        return caches.match('./index.html') || caches.match('./');
      })
    );
    return;
  }

  // Static Assets (CSS, JS, Icons): Network-First if versioned or Cache-First with revalidate
  event.respondWith(
    fetch(req).then((networkResponse) => {
      if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
        const toCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, toCache));
      }
      return networkResponse;
    }).catch(() => {
      return caches.match(req);
    })
  );
});
