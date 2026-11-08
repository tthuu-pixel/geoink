// Thêm vào mọi trang GeoLab trong app: thanh nhỏ ở mép trên (rê chuột lên sát mép để hiện)
// gồm Thu nhỏ, Toàn màn hình, Thoát; và thông báo khi có nội dung / bản app mới.
const { ipcRenderer, contextBridge } = require('electron');

contextBridge.exposeInMainWorld('geolabApp', { laApp: true, phienBan: () => ipcRenderer.invoke('phien-ban') });

let toan = true;
function taoGiaoDien() {
  if (document.getElementById('gla-thanh')) return;
  const st = document.createElement('style');
  st.textContent = `
#gla-thanh{visibility:hidden;position:fixed;top:0;left:50%;transform:translate(-50%,-110%);z-index:2147483000;display:flex;gap:4px;padding:6px 8px;
  background:rgba(17,24,39,.88);border-radius:0 0 14px 14px;box-shadow:0 8px 24px rgba(0,0,0,.25);transition:transform .18s ease,visibility .18s;font:600 13px system-ui,"Segoe UI",sans-serif}
#gla-thanh.hien{transform:translate(-50%,0);visibility:visible}
#gla-thanh button{all:unset;cursor:pointer;color:#fff;padding:6px 12px;border-radius:9px;display:flex;align-items:center;gap:6px}
#gla-thanh button:hover{background:rgba(255,255,255,.14)}
#gla-thanh button.do:hover{background:#DC2626}
#gla-mep{position:fixed;top:0;left:0;right:0;height:6px;z-index:2147482999}
#gla-tb{position:fixed;right:18px;bottom:18px;z-index:2147483000;max-width:380px;padding:12px 14px;background:#fff;color:#1F2937;border:1px solid #DCE5F5;border-radius:14px;
  box-shadow:0 12px 32px rgba(36,81,199,.18);font:14px/1.5 system-ui,"Segoe UI",sans-serif;display:none}
#gla-tb b{color:#1A3A9C}
#gla-tb .gla-nut{display:flex;gap:8px;justify-content:flex-end;margin-top:8px}
#gla-tb button{all:unset;cursor:pointer;padding:6px 14px;border-radius:9px;font-weight:600;background:#EEF2FF;color:#1E3A8A}
#gla-tb button.chinh{background:#2451C7;color:#fff}`;
  document.head.appendChild(st);
  const mep = document.createElement('div'); mep.id = 'gla-mep';
  const t = document.createElement('div'); t.id = 'gla-thanh';
  t.innerHTML = '<button data-l="thu-nho" title="Thu nhỏ xuống thanh tác vụ">― Thu nhỏ</button><button data-l="toan-man-hinh" title="Thoát / vào toàn màn hình (F11)">⛶ <span>Thoát toàn màn hình</span></button><button data-l="thoat" class="do" title="Thoát GeoLab">✕ Thoát</button>';
  document.body.appendChild(mep); document.body.appendChild(t);
  let hen = null;
  const hien = () => { if (!toan) return; clearTimeout(hen); t.classList.add('hien'); };
  const an = () => { clearTimeout(hen); hen = setTimeout(() => t.classList.remove('hien'), 500); };
  mep.addEventListener('mouseenter', hien); t.addEventListener('mouseenter', hien); t.addEventListener('mouseleave', an);
  document.addEventListener('mousemove', (e) => { if (e.clientY <= 4) hien(); });
  t.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) { ipcRenderer.send(b.dataset.l); t.classList.remove('hien'); } });
  capNhatThanh();
  const tb = document.createElement('div'); tb.id = 'gla-tb'; document.body.appendChild(tb);
}
function capNhatThanh() {
  const t = document.getElementById('gla-thanh'); if (!t) return;
  t.querySelector('[data-l="toan-man-hinh"] span').textContent = toan ? 'Thoát toàn màn hình' : 'Toàn màn hình';
  document.getElementById('gla-mep').style.display = toan ? '' : 'none';
}
function thongBao(html, nut) {
  taoGiaoDien(); const tb = document.getElementById('gla-tb');
  tb.innerHTML = html + '<div class="gla-nut"></div>'; const k = tb.querySelector('.gla-nut');
  (nut || []).concat([{ ten: 'Để sau', f: () => { tb.style.display = 'none'; } }]).forEach((n, i) => {
    const b = document.createElement('button'); b.textContent = n.ten; if (i === 0 && nut && nut.length) b.className = 'chinh'; b.onclick = n.f; k.appendChild(b);
  });
  tb.style.display = 'block';
}
ipcRenderer.on('man-hinh', (e, laToan) => { toan = laToan; capNhatThanh(); });
ipcRenderer.on('thong-bao', (e, d) => {
  if (d.loai === 'noiDung') thongBao('<b>GeoLab có nội dung mới</b> (' + d.soTep + ' tệp đã tải về). Tải lại để dùng ngay, hoặc dùng từ lần mở sau.', [{ ten: 'Tải lại', f: () => ipcRenderer.send('tai-lai') }]);
  else if (d.loai === 'banApp') thongBao('<b>Có bản app GeoLab ' + d.phienBan + '</b>. Cập nhật mất khoảng 1 phút, app tự mở lại.', [{ ten: 'Cập nhật', f: () => { ipcRenderer.send('cai-ban-app'); thongBao('Đang tải bản cập nhật…'); } }]);
  else if (d.loai === 'tien') { const tb = document.getElementById('gla-tb'); if (tb) tb.firstChild.textContent = 'Đang tải bản cập nhật… ' + d.phanTram + '%'; }
  else if (d.loai === 'loi') thongBao('Chưa cập nhật được: ' + d.loi.replace(/</g, '&lt;'));
});
window.addEventListener('DOMContentLoaded', taoGiaoDien);
