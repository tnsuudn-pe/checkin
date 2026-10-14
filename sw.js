// เก็บหน้าเว็บและไลบรารีไว้ในเครื่อง เพื่อให้เปิด "QR ของฉัน" ได้แม้ไม่มีอินเทอร์เน็ต
// - มีเน็ต: โหลดจากเซิร์ฟเวอร์ก่อนเสมอ (ได้หน้าล่าสุดทันทีที่แก้) แล้วเก็บสำเนาไว้
// - ไม่มีเน็ต: ใช้สำเนาในเครื่อง
// คำขอ POST (ส่งข้อมูลเข้าระบบ) ไม่ถูกเก็บ
const CACHE = 'pe-checkin-v3';
const CORE = ['./', './index.html', './myqr.html', './scan.html', './api.js'];

self.addEventListener('install', e => {
  // cache:'reload' = ข้ามแคชของเบราว์เซอร์ ได้ไฟล์ล่าสุดจริง
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE.map(u => new Request(u, { cache: 'reload' })))));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith((async () => {
    const c = await caches.open(CACHE);
    try {
      const r = await fetch(e.request, { cache: 'no-cache' });
      if (r && (r.ok || r.type === 'opaque')) c.put(e.request, r.clone());
      return r;
    } catch (err) {
      const hit = await c.match(e.request, { ignoreSearch: true });
      if (hit) return hit;
      throw err;
    }
  })());
});
