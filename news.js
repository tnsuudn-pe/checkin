/**
 * ประกาศ + กิจกรรมสัปดาห์นี้/สัปดาห์หน้า แบบ "ข้อความแชทเด้ง"
 * - เด้งเฉพาะข้อความที่เครื่องนี้ยังไม่เคยเห็น (จำใน localStorage) ทีละข้อความ มีจุดกำลังพิมพ์
 * - ปุ่มกระดิ่ง 🔔 มุมขวาล่าง เปิดดูทั้งหมดได้ตลอด
 * - ถ้าหน้ามี <div id="newsSection"> จะแสดงรายการเต็มในหน้าด้วย
 * ใช้ร่วมกับ api.js (google.script.run → publicNews)
 */
(function () {
  const TH_MONTH = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  const TH_DAY = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const thDate = iso => { const m = String(iso || '').match(/^(\d{4})-(\d{2})-(\d{2})/); if (!m) return ''; const d = new Date(+m[1], +m[2] - 1, +m[3]); return 'วัน' + TH_DAY[d.getDay()] + 'ที่ ' + (+m[3]) + ' ' + TH_MONTH[+m[2] - 1]; };
  const ICON = { 'ธงชาติ': '🇹🇭', 'บังคับ (มหาวิทยาลัย)': '🙏', 'เสริมความเป็นครู': '📚', 'จิตอาสา': '🤝', 'ชมรม': '🛡️' };

  const css = `
  .nw-bell { position:fixed; right:16px; bottom:16px; z-index:80; width:54px; height:54px; border-radius:50%; border:0; cursor:pointer;
    background:#0a2a66; color:#fff; font-size:24px; box-shadow:0 6px 18px rgba(0,0,0,.25); }
  .nw-bell b { position:absolute; top:-2px; right:-2px; min-width:20px; height:20px; padding:0 5px; border-radius:10px; background:#e5484d; color:#fff; font-size:12px; line-height:20px; font-family:sans-serif; }
  .nw-stack { position:fixed; right:16px; bottom:80px; z-index:80; width:min(340px, calc(100vw - 32px)); display:flex; flex-direction:column; gap:8px; align-items:stretch; pointer-events:none; }
  .nw-msg { pointer-events:auto; display:flex; gap:8px; align-items:flex-end; animation:nwIn .35s cubic-bezier(.2,1.3,.4,1) both; }
  .nw-msg img { width:34px; height:36px; object-fit:contain; flex:none; background:#fff; border-radius:50%; padding:2px; box-shadow:0 2px 6px rgba(0,0,0,.15); }
  .nw-bub { position:relative; background:#fff; color:#1b1f29; border-radius:16px 16px 16px 4px; padding:9px 30px 9px 12px; box-shadow:0 6px 20px rgba(10,42,102,.18); font-size:14px; line-height:1.5; border:1px solid #e1e5ec; max-width:290px; }
  .nw-bub small { display:block; font-size:11.5px; color:#7a8193; font-weight:700; }
  .nw-bub b { font-family:'Prompt',sans-serif; font-weight:600; }
  .nw-bub .x { position:absolute; top:4px; right:6px; border:0; background:none; font-size:16px; color:#9aa3b2; cursor:pointer; }
  .nw-typing span { display:inline-block; width:7px; height:7px; margin:0 2px; border-radius:50%; background:#9aa3b2; animation:nwDot 1s infinite; }
  .nw-typing span:nth-child(2) { animation-delay:.15s; } .nw-typing span:nth-child(3) { animation-delay:.3s; }
  @keyframes nwDot { 50% { transform:translateY(-4px); opacity:.5; } }
  @keyframes nwIn { from { opacity:0; transform:translateY(16px) scale(.9); } }
  .nw-panel { position:fixed; right:16px; bottom:80px; z-index:81; width:min(380px, calc(100vw - 32px)); max-height:70vh; overflow:auto; background:#f4f6fa; border-radius:18px;
    box-shadow:0 12px 40px rgba(0,0,0,.3); padding:12px; display:flex; flex-direction:column; gap:8px; }
  .nw-panel h3 { margin:0 0 4px; font-family:'Prompt',sans-serif; font-size:16px; color:#0a2a66; display:flex; justify-content:space-between; }
  .nw-panel h3 button { border:0; background:none; font-size:18px; cursor:pointer; }
  .nw-item { background:#fff; border:1px solid #e1e5ec; border-radius:12px; padding:9px 12px; font-size:14px; line-height:1.5; }
  .nw-item small { color:#7a8193; font-weight:700; font-size:11.5px; display:block; }
  .nw-tag { display:inline-block; font-size:11px; font-weight:700; padding:1px 8px; border-radius:99px; background:#fff3cd; color:#6b4e00; margin-left:4px; }
  .nw-tag.open { background:#c8e6c9; color:#0b4d0b; }
  @media (prefers-reduced-motion: reduce) { .nw-msg, .nw-typing span { animation:none; } }`;

  function messages(d) {
    const out = [];
    d.activities.forEach(a => out.push({
      id: a.id, kind: 'act', who: a.week === 'this' ? '📅 กิจกรรมสัปดาห์นี้' : '🗓️ กิจกรรมสัปดาห์หน้า',
      html: (ICON[a.type] || '⭐') + ' <b>' + esc(a.name) + '</b><br>' + esc(thDate(a.date)) + (a.place ? ' · ' + esc(a.place) : '') + ' · ชั้นปี ' + esc(a.years) +
        (a.status === 'เปิดเช็คชื่อ' ? ' <span class="nw-tag open">กำลังเช็คชื่อ</span>' : ''),
      date: a.date
    }));
    d.news.forEach(n => out.push({ id: n.id, kind: 'news', who: '📢 ประกาศ', html: '<b>' + esc(n.title) + '</b>' + (n.body ? '<br>' + esc(n.body).replace(/\n/g, '<br>') : ''), date: n.at }));
    return out;
  }

  function seenSet() { try { return JSON.parse(localStorage.getItem('pe_seen_news') || '{}'); } catch (e) { return {}; } }
  function markSeen(ids) { const s = seenSet(); ids.forEach(i => { s[i] = 1; }); try { localStorage.setItem('pe_seen_news', JSON.stringify(s)); } catch (e) { /* ไม่เป็นไร */ } }

  function start(d) {
    const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    const all = messages(d);
    // รายการเต็มในหน้า (ถ้ามีช่อง)
    const sec = document.getElementById('newsSection');
    if (sec) sec.innerHTML = all.length ? all.map(m => '<div class="nw-item"><small>' + m.who + '</small>' + m.html + '</div>').join('') : '<div class="nw-item">ยังไม่มีกิจกรรมหรือประกาศในสัปดาห์นี้และสัปดาห์หน้า</div>';
    if (!all.length) return;
    const seen = seenSet(), fresh = all.filter(m => !seen[m.id]);
    const bell = document.createElement('button');
    bell.className = 'nw-bell'; bell.type = 'button'; bell.title = 'ประกาศและกิจกรรม'; bell.setAttribute('aria-label', 'ประกาศและกิจกรรม');
    bell.innerHTML = '🔔' + (fresh.length ? '<b>' + fresh.length + '</b>' : '');
    document.body.appendChild(bell);
    const stack = document.createElement('div'); stack.className = 'nw-stack'; stack.setAttribute('aria-live', 'polite'); document.body.appendChild(stack);
    let panel = null;
    bell.onclick = () => {
      if (panel) { panel.remove(); panel = null; return; }
      stack.innerHTML = '';
      panel = document.createElement('div'); panel.className = 'nw-panel';
      panel.innerHTML = '<h3>📢 ประกาศ & กิจกรรม <button type="button" aria-label="ปิด">✕</button></h3>' + all.map(m => '<div class="nw-item"><small>' + m.who + '</small>' + m.html + '</div>').join('');
      panel.querySelector('h3 button').onclick = () => { panel.remove(); panel = null; };
      document.body.appendChild(panel);
      markSeen(all.map(m => m.id)); bell.innerHTML = '🔔';
    };
    // เด้งทีละข้อความ (สูงสุด 3) เหมือนแชท: จุดกำลังพิมพ์ → ข้อความ
    const queue = fresh.slice(0, 3);
    let i = 0;
    (function next() {
      const m = queue[i++]; if (!m || panel) return;
      const row = document.createElement('div'); row.className = 'nw-msg';
      row.innerHTML = '<img src="logo-mark.png" alt=""><div class="nw-bub nw-typing"><span></span><span></span><span></span></div>';
      stack.appendChild(row);
      setTimeout(() => {
        row.querySelector('.nw-bub').outerHTML = '<div class="nw-bub"><small>' + m.who + ' · งานกิจการนักศึกษา</small>' + m.html + '<button class="x" type="button" aria-label="ปิด">✕</button></div>';
        row.querySelector('.x').onclick = () => { row.remove(); markSeen([m.id]); };
        try { if (navigator.vibrate) navigator.vibrate(40); } catch (e) { /* ไม่เป็นไร */ }
        setTimeout(next, 1100);
        setTimeout(() => { if (row.isConnected) { row.style.transition = 'opacity .4s'; row.style.opacity = '0'; setTimeout(() => row.remove(), 400); } }, 12000);
      }, 900);
    })();
    markSeen(queue.map(m => m.id));
    bell.innerHTML = '🔔' + (fresh.length > queue.length ? '<b>' + (fresh.length - queue.length) + '</b>' : '');
  }

  function load() {
    if (!window.google || !google.script) return;
    google.script.run.withSuccessHandler(d => { if (d && d.ok) start(d); }).withFailureHandler(() => {}).publicNews();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(load, 600)); else setTimeout(load, 600);
})();
