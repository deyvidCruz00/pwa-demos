/**
 * Service Worker – PWA Demos
 * Cache First para assets estáticos, Network First para navegación.
 */

const CACHE_NAME = 'pwa-demos-v1';

const PRECACHE_ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './manifest.json',
  './js/filesystem.js',
  './js/authentication.js',
  './js/face-detection.js',
  './js/barcode-detection.js',
  './js/screen-capture.js',
  './js/audio-recording.js',
  './js/orientation.js',
  './js/motion.js',
  './js/multitouch.js',
  './js/view-transition.js',
  './js/vendor/face-api.min.js',
  './models/tiny_face_detector_model-weights_manifest.json',
  './models/tiny_face_detector_model.bin',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(res => {
          caches.open(CACHE_NAME).then(c => c.put(event.request, res.clone()));
          return res;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(res => {
        if (res && res.status === 200 && res.type !== 'opaque') {
          caches.open(CACHE_NAME).then(c => c.put(event.request, res.clone()));
        }
        return res;
      });
    })
  );
});
