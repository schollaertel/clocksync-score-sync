// Service Worker for Push Notifications
const CACHE_NAME = 'clocksync-v1';

self.addEventListener('install', (event) => {
  console.log('Service Worker installing');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating');
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);
  
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'ClockSync Notification';
  const options = {
    body: data.body || 'Game update',
    icon: '/clocksync-logo.png',
    badge: '/clocksync-logo.png',
    data: data.url || '/',
    requireInteraction: true,
    actions: [
      {
        action: 'view',
        title: 'View Game'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();
  
  if (event.action === 'view') {
    event.waitUntil(
      self.clients.openWindow(event.notification.data)
    );
  }
});
