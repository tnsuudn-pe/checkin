// à¹€à¸à¹‡à¸šà¸«à¸™à¹‰à¸²à¹€à¸§à¹‡à¸šà¹à¸¥à¸°à¹„à¸¥à¸šà¸£à¸²à¸£à¸µà¹„à¸§à¹‰à¹ƒà¸™à¹€à¸„à¸£à¸·à¹ˆà¸­à¸‡ à¹€à¸žà¸·à¹ˆà¸­à¹ƒà¸«à¹‰à¹€à¸›à¸´à¸” "QR à¸‚à¸­à¸‡à¸‰à¸±à¸™" à¹„à¸”à¹‰à¹à¸¡à¹‰à¹„à¸¡à¹ˆà¸¡à¸µà¸­à¸´à¸™à¹€à¸—à¸­à¸£à¹Œà¹€à¸™à¹‡à¸•
// - à¸¡à¸µà¹€à¸™à¹‡à¸•: à¹‚à¸«à¸¥à¸”à¸ˆà¸²à¸à¹€à¸‹à¸´à¸£à¹Œà¸Ÿà¹€à¸§à¸­à¸£à¹Œà¸à¹ˆà¸­à¸™à¹€à¸ªà¸¡à¸­ (à¹„à¸”à¹‰à¸«à¸™à¹‰à¸²à¸¥à¹ˆà¸²à¸ªà¸¸à¸”à¸—à¸±à¸™à¸—à¸µà¸—à¸µà¹ˆà¹à¸à¹‰) à¹à¸¥à¹‰à¸§à¹€à¸à¹‡à¸šà¸ªà¸³à¹€à¸™à¸²à¹„à¸§à¹‰
// - à¹„à¸¡à¹ˆà¸¡à¸µà¹€à¸™à¹‡à¸•: à¹ƒà¸Šà¹‰à¸ªà¸³à¹€à¸™à¸²à¹ƒà¸™à¹€à¸„à¸£à¸·à¹ˆà¸­à¸‡
// à¸„à¸³à¸‚à¸­ POST (à¸ªà¹ˆà¸‡à¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¹€à¸‚à¹‰à¸²à¸£à¸°à¸šà¸š) à¹„à¸¡à¹ˆà¸–à¸¹à¸à¹€à¸à¹‡à¸š
const CACHE = 'pe-checkin-v14';
const CORE = ['./', './index.html', './myqr.html', './scan.html', './register.html', './card.html', './leaderboard.html', './theme.css', './logo-mark.png', './news.js', './api.js'];

self.addEventListener('install', e => {
  // cache:'reload' = à¸‚à¹‰à¸²à¸¡à¹à¸„à¸Šà¸‚à¸­à¸‡à¹€à¸šà¸£à¸²à¸§à¹Œà¹€à¸‹à¸­à¸£à¹Œ à¹„à¸”à¹‰à¹„à¸Ÿà¸¥à¹Œà¸¥à¹ˆà¸²à¸ªà¸¸à¸”à¸ˆà¸£à¸´à¸‡
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
