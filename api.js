/**
 * เชื่อมหน้าเว็บบน GitHub Pages กับ Apps Script (ระบบเช็คชื่อกิจกรรม คณะพลศึกษา)
 * จำลอง google.script.run ให้หน้าเดิม (myqr / scan) ทำงานได้โดยไม่ต้องแก้ — ส่งคำขอไปที่ doPost ของเว็บแอป
 * ข้อมูลและการตรวจสอบสิทธิ์ทั้งหมดอยู่ฝั่ง Apps Script ไฟล์นี้ไม่มีความลับใดๆ
 */
const API_URL = 'https://script.google.com/macros/s/AKfycbxU7jUHNXaC2wYG2MGz-bpfwOm6Crk8JDR441fnj-lNUhrrG-keRJe0nfgCaARCQcTZ/exec';

(function () {
  function call(fn, args, ok, fail) {
    fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },   // text/plain = ไม่มี CORS preflight
      body: JSON.stringify({ fn: fn, args: args })
    })
      .then(r => r.json())
      .then(d => {
        if (d.ok) { if (ok) ok(d.result); }
        else if (fail) fail(new Error(d.error || 'เกิดข้อผิดพลาด'));
      })
      .catch(() => { if (fail) fail(new Error('เชื่อมต่อระบบไม่ได้ — ตรวจสอบอินเทอร์เน็ต')); });
  }

  function runner(ok, fail) {
    return new Proxy({}, {
      get(_, k) {
        if (k === 'withSuccessHandler') return f => runner(f, fail);
        if (k === 'withFailureHandler') return f => runner(ok, f);
        return (...a) => call(k, a, ok, fail);
      }
    });
  }

  window.google = window.google || {};
  window.google.script = { run: runner(null, null) };

  // เก็บหน้าเว็บไว้ในเครื่อง — เปิด "QR ของฉัน" ได้แม้ไม่มีอินเทอร์เน็ต
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => { navigator.serviceWorker.register('sw.js').catch(() => {}); });
  }
})();
