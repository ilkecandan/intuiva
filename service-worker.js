// Service Worker for Intuiva PWA

const CACHE_NAME = 'intuiva-v1.0.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/kanban.js',
  '/data.js',
  '/manifest.json',
  '/icons/icon-72.png',
  '/icons/icon-96.png',
  '/icons/icon-128.png',
  '/icons/icon-144.png',
  '/icons/icon-152.png',
  '/icons/icon-192.png',
  '/icons/icon-384.png',
  '/icons/icon-512.png'
];

// Install event
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activate event
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Clone the request
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          response => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
  );
});

// Sync event for background sync
self.addEventListener('sync', event => {
  if (event.tag === 'sync-answers') {
    event.waitUntil(syncAnswers());
  }
});

// Push notification event
self.addEventListener('push', event => {
  const options = {
    body: event.data?.text() || 'New update from Intuiva!',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Open App',
        icon: '/icons/icon-72.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/icon-72.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Intuiva', options)
  );
});

// Notification click event
self.addEventListener('notificationclick', event => {
  console.log('Notification click received.');
  event.notification.close();

  if (event.action === 'explore') {
    clients.openWindow('/');
  }
});

// Background sync function
async function syncAnswers() {
  // This would sync data with a server in a real app
  console.log('Syncing answers in background...');
}
