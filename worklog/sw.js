/* 工作日誌 Service Worker — 離線快取 + 通知點擊 */
const CACHE = 'worklog-v1';
const SHELL = ['./', './index.html', './manifest.webmanifest'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // 只快取自家同源的 app 資源；Google API / 字型走網路
  if (url.origin !== self.location.origin) return;

  if (req.mode === 'navigate') {
    // 導覽：網路優先，離線退回快取
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match(req).then((r) => r || caches.match('./index.html')))
    );
    return;
  }

  // 其他同源資源：快取優先
  e.respondWith(
    caches.match(req).then((cached) => cached || fetch(req).then((res) => {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
      return res;
    }).catch(() => cached))
  );
});

// 提醒通知點擊 → 開啟 / 聚焦 App
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if ('focus' in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow('./index.html');
    })
  );
});

// 由頁面觸發的提醒（App 開啟時）
self.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'notify') {
    const { title, body } = e.data;
    self.registration.showNotification(title || '工作日誌提醒', {
      body: body || '今天還沒留下紀錄，花 5 分鐘寫一則吧。',
      icon: '../logo.png',
      badge: '../logo.png',
      tag: 'worklog-daily',
      renotify: true,
    });
  }
});
