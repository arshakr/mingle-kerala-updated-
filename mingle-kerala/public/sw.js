const VERSION = 'kc-public-v1';
const PUBLIC_ASSETS = ['/icon.svg', '/manifest.webmanifest'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(VERSION).then(cache => cache.addAll(PUBLIC_ASSETS)));
  self.skipWaiting();
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return;
  if (!PUBLIC_ASSETS.includes(url.pathname)) return; // never cache authenticated/profile/chat/payment data
  event.respondWith(caches.match(event.request).then(match => match || fetch(event.request)));
});
