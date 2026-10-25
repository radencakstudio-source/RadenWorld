/**
 * ============================================================================
 * RadenWorld Progressive Web Game - High-Performance Asset Cache Service Worker
 * ============================================================================
 * Tujuan:
 * 1. Menghemat kuota internet pemain secara drastis (zero-data reload).
 * 2. Mempercepat waktu muat (loading screen) saat refresh atau koneksi lambat.
 * 3. Menghindari request berulang untuk tekstur, peta, sprite karakter, dan audio.
 * 4. Aman & tidak merusak sistem: request /api/ dan /socket.io/ SELALU live realtime.
 * ============================================================================
 */

const CACHE_NAME = 'radenworld-static-v1';

// Pola URL yang dikecualikan dari cache (harus selalu live realtime)
const NETWORK_ONLY_PATTERNS = [
  /\/api\//,
  /\/socket\.io\//,
  /\/sanctum\//,
  /hot$/,
  /@vite/,
  /@fs/,
  /@react-refresh/
];

// Pola file statis yang di-cache agresif (Cache-First)
const STATIC_ASSET_EXTENSIONS = [
  '.png', '.jpg', '.jpeg', '.webp', '.svg', '.gif',
  '.mp3', '.ogg', '.wav',
  '.woff2', '.woff', '.ttf',
  '.css', '.js'
];

self.addEventListener('install', (event) => {
  // Langsung aktifkan service worker baru tanpa menunggu tab ditutup
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName.startsWith('radenworld-')) {
            console.log('[SW] Membersihkan cache lama:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // 1. Abaikan request non-GET (POST, PUT, DELETE)
  if (request.method !== 'GET') {
    return;
  }

  // 2. Abaikan API, WebSocket, dan internal Vite dev
  if (NETWORK_ONLY_PATTERNS.some((pattern) => pattern.test(url.pathname))) {
    return;
  }

  // 3. Strategi Cache-First untuk Aset Game (/assets/, /build/, dan font eksternal)
  const isStaticGameAsset =
    url.pathname.startsWith('/assets/') ||
    url.pathname.startsWith('/build/') ||
    url.hostname.includes('fonts.googleapis.com') ||
    url.hostname.includes('fonts.gstatic.com') ||
    STATIC_ASSET_EXTENSIONS.some((ext) => url.pathname.toLowerCase().endsWith(ext));

  if (isStaticGameAsset) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            // Aset ditemukan di cache: kembalikan instan (0 data kuota, 0 ms delay)
            return cachedResponse;
          }

          // Jika belum ada di cache, unduh dari jaringan lalu simpan di cache
          return fetch(request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                cache.put(request, networkResponse.clone());
              }
              return networkResponse;
            })
            .catch(() => {
              // Jika jaringan offline / lag parah, kembalikan respon kosong yang aman
              return new Response('', { status: 408, statusText: 'Request Timeout Offline' });
            });
        });
      })
    );
    return;
  }

  // 4. Strategi Network-First untuk Dokumen HTML Halaman Utama
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(request).then((cached) => {
            return cached || caches.match('/');
          });
        })
    );
  }
});
