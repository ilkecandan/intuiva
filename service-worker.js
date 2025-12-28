const CACHE_NAME = 'intuiva-v1.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/kanban.js',
  '/data.js',
  '/manifest.json',
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
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

        return fetch(fetchRequest).then(response => {
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
        });
      })
      .catch(() => {
        // If both cache and network fail, show offline page
        if (event.request.url.indexOf('.html') > -1) {
          return caches.match('/index.html');
        }
      })
  );
});

// Background sync for offline data
self.addEventListener('sync', event => {
  if (event.tag === 'sync-tasks') {
    event.waitUntil(syncTasks());
  }
});

async function syncTasks() {
  const pendingTasks = await getPendingTasks();
  
  for (const task of pendingTasks) {
    try {
      // Try to sync with server
      await syncTaskWithServer(task);
      await markTaskAsSynced(task.id);
    } catch (error) {
      console.error('Sync failed for task:', task.id, error);
    }
  }
}

// Push notifications
self.addEventListener('push', event => {
  const options = {
    body: event.data.text(),
    icon: 'icons/icon-192x192.png',
    badge: 'icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '2'
    },
    actions: [
      {
        action: 'explore',
        title: 'Open App',
        icon: 'icons/check.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: 'icons/close.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Intuiva', options)
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Helper functions for background sync
async function getPendingTasks() {
  const db = await openDatabase();
  const transaction = db.transaction(['tasks'], 'readonly');
  const store = transaction.objectStore('tasks');
  const index = store.index('synced');
  const request = index.getAll(false);
  
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function syncTaskWithServer(task) {
  // Implement your server sync logic here
  const response = await fetch('/api/tasks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(task)
  });
  
  if (!response.ok) {
    throw new Error('Sync failed');
  }
  
  return response.json();
}

async function markTaskAsSynced(taskId) {
  const db = await openDatabase();
  const transaction = db.transaction(['tasks'], 'readwrite');
  const store = transaction.objectStore('tasks');
  const task = await store.get(taskId);
  
  if (task) {
    task.synced = true;
    store.put(task);
  }
}

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('IntuivaDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = event => {
      const db = event.target.result;
      
      if (!db.objectStoreNames.contains('tasks')) {
        const store = db.createObjectStore('tasks', { keyPath: 'id' });
        store.createIndex('synced', 'synced', { unique: false });
        store.createIndex('column', 'column', { unique: false });
      }
    };
  });
}
