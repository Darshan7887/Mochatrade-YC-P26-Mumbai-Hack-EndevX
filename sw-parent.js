/**
 * BrainBerry Parent Dashboard — Service Worker
 * Provides offline support and fast loading for the parent mobile dashboard.
 */

const CACHE_NAME = 'bb-parent-v1';

// All assets needed to run the app completely offline
const PRECACHE_ASSETS = [
  './parent-mobile.html',
  './manifest-parent.json',
  './icon-192.png',
  './icon-512.png'
];

// External assets to cache on first use
const RUNTIME_CACHE_PATTERNS = [
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'www.gstatic.com/firebasejs'
];

/* ── Install: pre-cache all local assets ── */
self.addEventListener('install', event => {
  self.skipWaiting(); // Activate immediately
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(PRECACHE_ASSETS).catch(err => {
        console.warn('[SW] Pre-cache partial failure:', err);
      });
    })
  );
});

/* ── Activate: clean up old caches ── */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

/* ── Fetch: serve from cache, fall back to network ── */
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle GET requests
  if (request.method !== 'GET') return;

  // Firebase Auth API calls — always go to network (never cache auth tokens)
  if (url.hostname.includes('identitytoolkit') ||
      url.hostname.includes('securetoken') ||
      url.pathname.includes('firestore')) {
    return; // Let browser handle it
  }

  // Runtime network assets (fonts, Firebase SDK) — cache-first with network fallback
  const isRuntime = RUNTIME_CACHE_PATTERNS.some(p => request.url.includes(p));
  if (isRuntime) {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached;
        return fetch(request).then(response => {
          if (response && response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
          }
          return response;
        }).catch(() => cached); // If offline and not cached, just fail gracefully
      })
    );
    return;
  }

  // Local app files — cache-first, network update in background (stale-while-revalidate)
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache =>
        cache.match(request).then(cached => {
          const networkFetch = fetch(request).then(response => {
            if (response && response.ok) {
              cache.put(request, response.clone());
            }
            return response;
          }).catch(() => null);

          return cached || networkFetch;
        })
      )
    );
  }
});

/* ── Background sync message from page ── */
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
