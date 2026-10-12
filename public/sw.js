// Forever IT Institute - Web Push Service Worker

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch (err) {
    payload = {
      title: 'Forever IT Institute',
      body: event.data.text(),
    };
  }

  const title = payload.title || 'Forever IT Institute Alert';
  const options = {
    body: payload.body || 'You have a new update.',
    icon: payload.icon || '/logo-icon.svg',
    badge: '/logo-mark.svg',
    tag: payload.tag || 'forever-it-notification',
    data: {
      url: payload.url || '/notifications',
      ...(payload.data || {}),
    },
    vibrate: [100, 50, 100],
    renotify: true,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/notifications';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // If a window is already open at the destination or host, focus it and navigate
      for (const client of windowClients) {
        if (client.url && 'focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      // Otherwise open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    }),
  );
});
