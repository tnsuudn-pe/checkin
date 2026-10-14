// เก็บหน้าเว็บและไลบรารีไว้ในเครื่อง: ใช้ของในเครื่องก่อน แล้วอัปเดตเบื้องหลังเมื่อมีเน็ต
// คำขอ POST (ส่งข้อมูลเข้าระบบ) ไม่ถูกเก็บ
const CACHE = 'pe-checkin-v1';
const CORE = ['./', './index.html', './myqr.html', './scan.html', './api.js'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.open(CACHE).then(async c => {
    const hit = await c.match(e.request, { ignoreSearch: true });
    const net = fetch(e.request).then(r => {
      if (r && (r.ok || r.type === 'opaque')) c.put(e.request, r.clone());
      return r;
    }).catch(() => hit);
    return hit || net;
  }));
});
