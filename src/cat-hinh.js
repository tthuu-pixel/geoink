// Lớp phủ cắt hình: hiện ảnh chụp màn hình, kéo chọn một vùng, gửi vùng (toạ độ CSS) về tiến trình chính
(function () {
  var cv = document.getElementById('nen'), c = cv.getContext('2d'), anh = new Image(), dau = null, cuoi = null, co = document.getElementById('co');
  function kichThuoc() { var d = window.devicePixelRatio || 1; cv.width = innerWidth * d; cv.height = innerHeight * d; c.setTransform(d, 0, 0, d, 0, 0); ve(); }
  function vung() { if (!dau || !cuoi) return null; return { x: Math.min(dau.x, cuoi.x), y: Math.min(dau.y, cuoi.y), w: Math.abs(cuoi.x - dau.x), h: Math.abs(cuoi.y - dau.y) }; }
  function ve() {
    var W = innerWidth, H = innerHeight; c.clearRect(0, 0, W, H);
    if (anh.complete && anh.naturalWidth) c.drawImage(anh, 0, 0, W, H);
    c.fillStyle = 'rgba(15,23,42,.45)'; var r = vung();
    if (!r) { c.fillRect(0, 0, W, H); return; }
    c.fillRect(0, 0, W, r.y); c.fillRect(0, r.y + r.h, W, H - r.y - r.h); c.fillRect(0, r.y, r.x, r.h); c.fillRect(r.x + r.w, r.y, W - r.x - r.w, r.h);
    c.strokeStyle = '#3B82F6'; c.lineWidth = 2; c.setLineDash([]); c.strokeRect(r.x + .5, r.y + .5, r.w, r.h);
    c.fillStyle = '#fff'; [[r.x, r.y], [r.x + r.w, r.y], [r.x, r.y + r.h], [r.x + r.w, r.y + r.h]].forEach(function (p) { c.fillRect(p[0] - 4, p[1] - 4, 8, 8); c.strokeRect(p[0] - 4, p[1] - 4, 8, 8); });
    co.style.display = 'block'; co.textContent = Math.round(r.w) + ' × ' + Math.round(r.h); co.style.left = (r.x) + 'px'; co.style.top = Math.max(0, r.y - 26) + 'px';
  }
  window.catHinh.khiCoAnh(function (d) { anh.onload = ve; anh.src = d; });
  window.addEventListener('resize', kichThuoc);
  window.addEventListener('pointerdown', function (e) { if (e.button !== 0) return; dau = { x: e.clientX, y: e.clientY }; cuoi = dau; ve(); });
  window.addEventListener('pointermove', function (e) { if (!dau) return; cuoi = { x: e.clientX, y: e.clientY }; ve(); });
  window.addEventListener('pointerup', function () { var r = vung(); if (!r) return; if (r.w < 3 || r.h < 3) { dau = cuoi = null; co.style.display = 'none'; ve(); return; } window.catHinh.chon(r); });
  window.addEventListener('keydown', function (e) { if (e.key === 'Escape') window.catHinh.chon(null); });
  window.addEventListener('contextmenu', function (e) { e.preventDefault(); window.catHinh.chon(null); });
  kichThuoc();
})();
