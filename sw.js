/**
 * İşBul Service Worker
 * PWA offline support & caching
 */

const CACHE_NAME = 'isbul-v1.0.1';
const STATIC_CACHE = 'isbul-static-v2';
const API_CACHE = 'isbul-api-v2';

// Offline'da da çalışacak sayfalar
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/uzmanlar.html',
  '/uzman-ol.html',
  '/profil.html',
  '/hizmetler.html',
  '/nasil-calisir.html',
  '/hakkimizda.html',
  '/blog.html',
  '/create-account.html',
  '/forgot-password.html',
  '/sartlar.html',
  '/gizlilik.html',
  '/kvkk.html',
  '/assets/css/styles.css',
  '/assets/css/chatbot.css',
  '/assets/js/app.js',
  '/assets/js/api-client.js',
  '/assets/js/data.js',
  '/assets/js/chatbot.js',
  '/assets/js/analytics.js',
  '/manifest.json',
  '/favicon.svg'
];

// ─── INSTALL ───────────────────────────────────────────────
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS.map(url => new Request(url, { cache: 'reload' })));
      })
      .then(() => self.skipWaiting())
      .catch(err => console.warn('[SW] Cache failed:', err))
  );
});

// ─── ACTIVATE ──────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== STATIC_CACHE && key !== API_CACHE)
          .map(key => {
            console.log('[SW] Deleting old cache:', key);
            return caches.delete(key);
          })
      )
    ).then(() => self.clients.claim())
  );
});

// ─── FETCH ─────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // API isteklerini cache'leme (sadece GET)
  if (url.pathname.startsWith('/api/')) {
    if (request.method === 'GET') {
      event.respondWith(networkFirstStrategy(request));
    }
    return;
  }

  // Static assets için cache-first
  event.respondWith(cacheFirstStrategy(request));
});

// Cache-First: Önce cache'e bak, yoksa network'ten al
async function cacheFirstStrategy(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    // Offline fallback
    const offlinePage = await caches.match('/index.html');
    return offlinePage || new Response('Çevrimdışısınız. Lütfen internet bağlantınızı kontrol edin.', {
      status: 503,
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }
}

// Network-First: Önce network'ten al, başarısız olursa cache'e bak
async function networkFirstStrategy(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(API_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached || new Response(JSON.stringify({
      success: false,
      error: { code: 'OFFLINE', message: 'Çevrimdışı mod - önbellek verisi' }
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// ─── PUSH NOTIFICATIONS ────────────────────────────────────
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {};
  const title = data.title || 'İşBul';
  const options = {
    body: data.body || 'Yeni bir bildiriminiz var.',
    icon: '/assets/img/icon.svg',
    badge: '/assets/img/icon.svg',
    tag: data.tag || 'isbul-notification',
    data: { url: data.url || '/' },
    actions: data.actions || [],
    vibrate: [200, 100, 200]
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

// ─── NOTIFICATION CLICK ────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) return client.focus();
      }
      return clients.openWindow(url);
    })
  );
});

// ─── BACKGROUND SYNC ───────────────────────────────────────
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-pending-actions') {
    console.log('[SW] Background sync triggered');
  }
});

console.log('[SW] Service Worker loaded - İşBul PWA v1.0.1');
