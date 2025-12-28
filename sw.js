// Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('service-worker.js').then(
      function(registration) {
        console.log('Service Worker registered with scope:', registration.scope);
        
        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          console.log('Service Worker update found!');
          
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New update available
              showUpdateNotification();
            }
          });
        });
      },
      function(err) {
        console.log('Service Worker registration failed:', err);
      }
    );
    
    // Check for controller change (page refresh after update)
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });
  });
}

// Background Sync Registration
function registerBackgroundSync() {
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    navigator.serviceWorker.ready.then(registration => {
      return registration.sync.register('sync-tasks');
    }).then(() => {
      console.log('Background sync registered');
    }).catch(err => {
      console.log('Background sync registration failed:', err);
    });
  }
}

// Periodic Sync (for regular updates)
function registerPeriodicSync() {
  if ('serviceWorker' in navigator && 'PeriodicSyncManager' in window) {
    navigator.serviceWorker.ready.then(registration => {
      return registration.periodicSync.register('update-tasks', {
        minInterval: 24 * 60 * 60 * 1000 // 24 hours
      });
    }).then(() => {
      console.log('Periodic sync registered');
    }).catch(err => {
      console.log('Periodic sync registration failed:', err);
    });
  }
}

// Push Notification Permission
function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        console.log('Notification permission granted');
        subscribeToPushNotifications();
      }
    });
  }
}

// Push Notification Subscription
function subscribeToPushNotifications() {
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    navigator.serviceWorker.ready.then(registration => {
      return registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array('YOUR_PUBLIC_VAPID_KEY')
      });
    }).then(subscription => {
      console.log('Push subscription successful:', subscription);
      // Send subscription to your server
      sendSubscriptionToServer(subscription);
    }).catch(err => {
      console.log('Failed to subscribe to push:', err);
    });
  }
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function sendSubscriptionToServer(subscription) {
  // Implement this to send subscription to your backend
  fetch('/api/push-subscribe', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(subscription)
  });
}

// Update notification
function showUpdateNotification() {
  if ('Notification' in window && Notification.permission === 'granted') {
    navigator.serviceWorker.ready.then(registration => {
      registration.showNotification('Update Available', {
        body: 'A new version of Intuiva is available. Click to refresh.',
        icon: 'icons/icon-192x192.png',
        badge: 'icons/badge-72x72.png',
        tag: 'update-notification',
        requireInteraction: true,
        actions: [
          {
            action: 'refresh',
            title: 'Refresh',
            icon: 'icons/refresh.png'
          }
        ]
      });
    });
  } else {
    // Fallback to custom notification
    showCustomUpdateNotification();
  }
}

function showCustomUpdateNotification() {
  const notification = document.createElement('div');
  notification.className = 'update-notification';
  notification.innerHTML = `
    <div class="update-content">
      <i class="fas fa-sync-alt"></i>
      <div>
        <h4>Update Available</h4>
        <p>A new version of Intuiva is available.</p>
      </div>
      <button id="refreshApp" class="btn-primary">Refresh</button>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  document.getElementById('refreshApp').addEventListener('click', () => {
    window.location.reload();
  });
  
  // Auto-remove after 10 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.remove();
    }
  }, 10000);
}

// Install prompt
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  showInstallPrompt();
});

function showInstallPrompt() {
  const installPrompt = document.getElementById('installPrompt');
  if (installPrompt) {
    installPrompt.classList.add('active');
    
    document.getElementById('installBtn').addEventListener('click', installApp);
    document.getElementById('dismissInstall').addEventListener('click', () => {
      installPrompt.classList.remove('active');
    });
  }
}

function installApp() {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      deferredPrompt = null;
      
      const installPrompt = document.getElementById('installPrompt');
      if (installPrompt) {
        installPrompt.classList.remove('active');
      }
    });
  }
}

// Export functions for use in main app
window.serviceWorkerHelpers = {
  registerBackgroundSync,
  registerPeriodicSync,
  requestNotificationPermission,
  installApp
};
