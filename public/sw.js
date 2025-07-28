const CACHE_NAME = 'solana-alarms-v2';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/alarm-beep.mp3',
  // Add other static assets here
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
      .catch(() => {
        // Fallback for offline
        if (event.request.destination === 'document') {
          return caches.match('/');
        }
      })
  );
});

// Background sync for checking prices
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag);
  if (event.tag === 'price-check') {
    event.waitUntil(
      fetch('/api/check-prices-background')
        .then(response => response.json())
        .then(data => {
          console.log('Background price check result:', data);
          // If alarms are triggered, we could show a notification here
        })
        .catch(error => {
          console.log('Background price check failed:', error);
        })
    );
  }
});

// Enhanced push notification handler
self.addEventListener('push', (event) => {
  console.log('Push notification received');
  
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { message: event.data.text() };
    }
  }
  
  const options = {
    body: data.message || 'Price alarm triggered!',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200, 100, 200, 100, 200],
    requireInteraction: true,
    persistent: true,
    tag: 'price-alarm',
    renotify: true,
    actions: [
      {
        action: 'view',
        title: 'View Alarm',
        icon: '/icon-192.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ],
    data: {
      url: data.url || '/',
      alarmId: data.alarmId
    }
  };

  event.waitUntil(
    self.registration.showNotification('🚨 Solana Price Alert!', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event.action);
  event.notification.close();

  if (event.action === 'view' || !event.action) {
    const urlToOpen = event.notification.data?.url || '/';
    
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((clientList) => {
          // Check if there's already a window/tab open
          for (const client of clientList) {
            if (client.url.includes(self.location.origin) && 'focus' in client) {
              client.focus();
              client.navigate(urlToOpen);
              return;
            }
          }
          // If no window is open, open a new one
          if (clients.openWindow) {
            return clients.openWindow(urlToOpen);
          }
        })
    );
  }
});

// Periodic background sync (experimental)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'price-check-periodic') {
    console.log('Periodic background sync triggered');
    event.waitUntil(
      fetch('/api/check-prices-background')
        .then(response => response.json())
        .then(data => {
          if (data.triggered && data.triggered > 0) {
            // Show notification if alarms were triggered
            return self.registration.showNotification('🚨 Price Alarm Triggered!', {
              body: `${data.triggered} alarm(s) have been triggered!`,
              icon: '/icon-192.png',
              vibrate: [300, 100, 300, 100, 300],
              requireInteraction: true
            });
          }
        })
        .catch(error => console.log('Periodic sync failed:', error))
    );
  }
});

// Message handler for communication with main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker received message:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'REGISTER_BACKGROUND_SYNC') {
    // Register background sync
    self.registration.sync.register('price-check')
      .then(() => console.log('Background sync registered'))
      .catch(error => console.log('Background sync registration failed:', error));
  }
  
  if (event.data && event.data.type === 'CHECK_PRICES_NOW') {
    // Immediate price check
    fetch('/api/check-prices-background')
      .then(response => response.json())
      .then(data => {
        event.ports[0].postMessage({ success: true, data });
      })
      .catch(error => {
        event.ports[0].postMessage({ success: false, error: error.message });
      });
  }
});
