// Biểu đồ thống kê kiểu sách giáo khoa Toán THCS: cột, cột kép, đoạn thẳng, đoạn thẳng kép, hình quạt tròn.
//   o = { loai: 'bieuDo', x, y (góc trên trái), w, h (kích thước trên bảng), kieu: 'cot' | 'cotKep' | 'duong' | 'duongKep' | 'tron',
//         tieuDe, tenX, tenY, dm: ['6A', …], ds: [{ ten, mau, so: [18, 22, …] }], ghiSo, luoi, chuThich, denTrang, buoc (vạch chia, 0 = tự chọn) }
//   Vẽ theo đơn vị của bảng (chữ, nét co giãn cùng hình như một bức ảnh). denTrang: tô sọc / chấm đen trắng để in đề.
window.GI = window.GI || {};
GI.bieuDo = (function () {
  var FONT = '"LM Roman", "Times New Roman", serif';
  var MAU = ['#3B82F6', '#F97316', '#10B981', '#A855F7', '#EF4444', '#EAB308', '#06B6D4', '#EC4899'];
  var TEN_KIEU = { cot: 'Biểu đồ cột', cotKep: 'Biểu đồ cột kép', duong: 'Biểu đồ đoạn thẳng', duongKep: 'Biểu đồ đoạn thẳng kép', tron: 'Biểu đồ hình quạt tròn' };
  function so(v) { var r = Math.round(v * 100) / 100; return (r < 0 ? '−' : '') + String(Math.abs(r)).replace('.', ','); }
  function giaTriO(d, i) { var v = d.so[i]; if (v == null || v === '') return null; v = +v; return isFinite(v) ? v : null; }   // ô trống: không vẽ
  function laKep(k) { return k === 'cotKep' || k === 'duongKep'; }
  // ---- hoa văn đen trắng (sọc, chấm…) ----
  var boHoaVan = null;
  function hoaVan(c, i) {
    if (!boHoaVan) {
      boHoaVan = [function (x, n) { x.lineWidth = 1.6; x.beginPath(); for (var k = -n; k < 2 * n; k += 6) { x.moveTo(k, n); x.lineTo(k + n, 0); } x.stroke(); },          // sọc chéo /
        function (x, n) { for (var a = 3; a < n; a += 6) for (var b = 3; b < n; b += 6) { x.beginPath(); x.arc(a, b, 1.2, 0, 7); x.fill(); } },                         // chấm
        function (x, n) { x.lineWidth = 1.6; x.beginPath(); for (var k = -n; k < 2 * n; k += 6) { x.moveTo(k, 0); x.lineTo(k + n, n); } x.stroke(); },               // sọc chéo \
        function (x, n) { x.lineWidth = 1; x.beginPath(); for (var k = 0; k <= n; k += 6) { x.moveTo(k, 0); x.lineTo(k, n); x.moveTo(0, k); x.lineTo(n, k); } x.stroke(); },   // ô lưới
        function (x, n) { x.lineWidth = 1.4; x.beginPath(); for (var k = 2; k < n; k += 5) { x.moveTo(0, k); x.lineTo(n, k); } x.stroke(); },                       // sọc ngang
        function (x, n) { x.fillStyle = '#9CA3AF'; x.fillRect(0, 0, n, n); },                                                                                     // xám
        function () { },                                                                                                                                         // trắng
        function (x, n) { x.lineWidth = 1.4; x.beginPath(); for (var k = 2; k < n; k += 5) { x.moveTo(k, 0); x.lineTo(k, n); } x.stroke(); }].map(function (f) {   // sọc dọc
        var cv = document.createElement('canvas'); cv.width = cv.height = 30; var x = cv.getContext('2d');
        x.fillStyle = '#fff'; x.fillRect(0, 0, 30, 30); x.strokeStyle = '#111'; x.fillStyle = '#111'; f(x, 30); return cv;
      });
    }
    return c.createPattern(boHoaVan[i % boHoaVan.length], 'repeat');
  }
  function toMau(c, o, i) { return o.denTrang ? hoaVan(c, i) : ((o.ds[i] && o.ds[i].mau) || MAU[i % MAU.length]); }
  function buocDep(max, muon) {   // bước chia trục "đẹp": 1, 2, 5 × 10^k
    if (!(max > 0)) return 1; var tho = max / (muon || 5), mu = Math.pow(10, Math.floor(Math.log10(tho))), t = tho / mu;
    return (t <= 1 ? 1 : t <= 2 ? 2 : t <= 5 ? 5 : 10) * mu;
  }
  function chu(c, t, x, y, co, canh, nghieng, dam, mau) {
    c.font = (nghieng ? 'italic ' : '') + (dam ? 'bold ' : '') + co + 'px ' + FONT; c.textAlign = canh || 'left'; c.fillStyle = mau || '#111827'; c.fillText(t, x, y);
  }
  function chuThich(c, o, x, y, ds, laDuong) {   // ô mẫu + tên dãy, canh giữa quanh x
    c.font = '14px ' + FONT; var rong = ds.map(function (d) { return 26 + c.measureText(d.ten || '').width; }), tong = rong.reduce(function (a, b) { return a + b + 24; }, -24), xx = x - tong / 2;
    ds.forEach(function (d, i) {
      if (laDuong) veMauDuong(c, o, i, xx, y - 5, 22); else { c.fillStyle = toMau(c, o, i); c.fillRect(xx, y - 11, 18, 13); c.strokeStyle = '#111'; c.lineWidth = 0.8; c.strokeRect(xx, y - 11, 18, 13); }
      chu(c, d.ten || '', xx + 24, y, 14, 'left'); xx += rong[i] + 24;
    });
  }
  function kieuDuong(o, i) { return o.denTrang ? { mau: '#111827', dash: i % 2 ? [7, 5] : [], dau: i % 3 } : { mau: (o.ds[i] && o.ds[i].mau) || MAU[i % MAU.length], dash: [], dau: 0 }; }
  function dauDiem(c, k, x, y, r) {   // điểm trên đường: 0 tròn đặc, 1 vuông rỗng, 2 tam giác
    c.beginPath(); c.setLineDash([]);
    if (k === 1) { c.rect(x - r, y - r, 2 * r, 2 * r); c.fillStyle = '#fff'; c.fill(); c.lineWidth = 1.6; c.stroke(); return; }
    if (k === 2) { c.moveTo(x, y - r * 1.2); c.lineTo(x + r * 1.1, y + r * 0.8); c.lineTo(x - r * 1.1, y + r * 0.8); c.closePath(); c.fill(); return; }
    c.arc(x, y, r, 0, 2 * Math.PI); c.fill(); c.lineWidth = 1.2; c.strokeStyle = '#fff'; c.stroke();
  }
  function veMauDuong(c, o, i, x, y, dai) { var k = kieuDuong(o, i); c.save(); c.strokeStyle = k.mau; c.fillStyle = k.mau; c.lineWidth = 2.2; c.setLineDash(k.dash); c.beginPath(); c.moveTo(x, y); c.lineTo(x + dai, y); c.stroke(); dauDiem(c, k.dau, x + dai / 2, y, 3.6); c.restore(); }

  function ve(c, o) {
    var W = o.w || 440, Hh = o.h || 330, X0 = o.x, Y0 = o.y, ds = (o.ds || []).filter(function (d) { return d && d.so; }), dm = o.dm || [];
    c.save(); c.translate(X0, Y0); c.lineCap = 'butt'; c.lineJoin = 'round'; c.textBaseline = 'alphabetic';
    c.fillStyle = '#FFFFFF'; c.fillRect(0, 0, W, Hh);
    if (o.tieuDe) chu(c, o.tieuDe, W / 2, 24, 17, 'center', false, true);
    var coCT = o.chuThich !== false && (laKep(o.kieu) || o.kieu === 'tron') && ds.length;
    if (o.kieu === 'tron') { veTron(c, o, ds[0], dm, W, Hh); c.restore(); return { x0: X0, y0: Y0, x1: X0 + W, y1: Y0 + Hh }; }
    // ---- trục ----
    var soDay = laKep(o.kieu) ? Math.min(2, ds.length) : Math.min(1, ds.length), dsVe = ds.slice(0, soDay);
    var lon = 0; dsVe.forEach(function (d) { dm.forEach(function (_, i) { var v = giaTriO(d, i); if (v != null) lon = Math.max(lon, v); }); });
    var buoc = o.buoc > 0 ? o.buoc : buocDep(lon || 1, 5), max = Math.max(buoc, Math.ceil((lon || 1) / buoc) * buoc);
    if (lon >= max - buoc * 0.05) max += buoc;   // chừa chỗ ghi số trên đỉnh
    var x0 = 64, y0 = Hh - (coCT ? 62 : 40), w = W - x0 - 54, h = y0 - (o.tieuDe ? 82 : 52);
    var Yv = function (v) { return y0 - v / max * h; };
    c.font = '14px ' + FONT;
    for (var v = 0; v <= max + 1e-9; v += buoc) {
      var yy = Yv(v);
      if (o.luoi !== false && v > 0) { c.save(); c.strokeStyle = '#CBD5E1'; c.lineWidth = 1; c.setLineDash([4, 3]); c.beginPath(); c.moveTo(x0, yy); c.lineTo(x0 + w, yy); c.stroke(); c.restore(); }
      c.strokeStyle = '#111'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(x0 - 4, yy); c.lineTo(x0, yy); c.stroke();
      chu(c, so(v), x0 - 8, yy + 5, 14, 'right');
    }
    c.strokeStyle = '#111'; c.fillStyle = '#111'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x0 + w + 16, y0); c.moveTo(x0, y0); c.lineTo(x0, y0 - h - 22); c.stroke();
    c.beginPath(); c.moveTo(x0 + w + 24, y0); c.lineTo(x0 + w + 14, y0 - 4.5); c.lineTo(x0 + w + 14, y0 + 4.5); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(x0, y0 - h - 30); c.lineTo(x0 - 4.5, y0 - h - 20); c.lineTo(x0 + 4.5, y0 - h - 20); c.closePath(); c.fill();
    if (o.tenY) chu(c, o.tenY, x0 - 4, y0 - h - 36, 14, 'left', true);
    if (o.tenX) chu(c, o.tenX, x0 + w + 24, y0 + 34, 14, 'right', true);
    var n = Math.max(1, dm.length), nhom = w / n;
    dm.forEach(function (t, i) { chu(c, String(t), x0 + nhom * (i + 0.5), y0 + 20, 14, 'center'); });
    // ---- cột / đường ----
    if (o.kieu === 'cot' || o.kieu === 'cotKep') {
      var rong = Math.min(40, nhom * 0.64 / Math.max(1, soDay));
      dm.forEach(function (_, i) {
        var cx = x0 + nhom * (i + 0.5);
        dsVe.forEach(function (d, j) {
          var val = giaTriO(d, i); if (val == null) return; var hc = Math.max(0, val) / max * h, xc = cx - rong * soDay / 2 + j * rong;
          c.fillStyle = toMau(c, o, j); c.fillRect(xc, y0 - hc, rong, hc); c.strokeStyle = '#111'; c.lineWidth = 1; c.setLineDash([]); c.strokeRect(xc, y0 - hc, rong, hc);
          if (o.ghiSo !== false) chu(c, so(val), xc + rong / 2, y0 - hc - 6, 13, 'center');
        });
      });
    } else {
      dsVe.forEach(function (d, j) {
        var k = kieuDuong(o, j), P = [];
        dm.forEach(function (_, i) { var val = giaTriO(d, i); if (val != null) P.push({ x: x0 + nhom * (i + 0.5), y: Yv(val), v: val, i: i }); });
        c.save(); c.strokeStyle = '#94A3B8'; c.lineWidth = 1; c.setLineDash([3, 3]); P.forEach(function (q) { c.beginPath(); c.moveTo(q.x, q.y); c.lineTo(q.x, y0); c.stroke(); }); c.restore();
        c.save(); c.strokeStyle = k.mau; c.fillStyle = k.mau; c.lineWidth = 2.4; c.setLineDash(k.dash); c.beginPath(); P.forEach(function (q, i) { i ? c.lineTo(q.x, q.y) : c.moveTo(q.x, q.y); }); c.stroke();
        P.forEach(function (q) { c.strokeStyle = k.mau; dauDiem(c, k.dau, q.x, q.y, 4); });
        if (o.ghiSo !== false) P.forEach(function (q) {   // dãy thứ hai ghi số phía dưới cho khỏi đè
          var duoi = j === 1 && +dsVe[0].so[q.i] >= q.v;
          c.save(); c.lineWidth = 3; c.strokeStyle = '#fff'; c.font = '13px ' + FONT; c.textAlign = 'center'; var ty = duoi ? q.y + 19 : q.y - 9; c.strokeText(so(q.v), q.x, ty); c.fillStyle = o.denTrang ? '#111827' : k.mau; c.fillText(so(q.v), q.x, ty); c.restore();
        });
        c.restore();
      });
    }
    chu(c, '0', x0 - 8, y0 + 5, 14, 'right');
    if (coCT) chuThich(c, o, x0 + w / 2, Hh - 14, dsVe, o.kieu === 'duongKep');
    c.restore();
    return { x0: X0, y0: Y0, x1: X0 + W, y1: Y0 + Hh };
  }
  function veTron(c, o, d, dm, W, Hh) {
    if (!d) return;
    var gt = dm.map(function (_, i) { var v = giaTriO(d, i); return v > 0 ? v : 0; }), tong = gt.reduce(function (a, b) { return a + b; }, 0); if (!tong) return;
    var top = o.tieuDe ? 44 : 14, r = Math.min((Hh - top - 16) / 2, W * 0.27), cx = 22 + r, cy = top + (Hh - top) / 2, a = -Math.PI / 2;
    gt.forEach(function (v, i) {
      if (!v) return; var g = v / tong * 2 * Math.PI, b = a + g;
      c.beginPath(); c.moveTo(cx, cy); c.arc(cx, cy, r, a, b); c.closePath(); c.fillStyle = toMau(c, o, i); c.fill();
      c.lineWidth = o.denTrang ? 1.2 : 2; c.strokeStyle = o.denTrang ? '#111' : '#fff'; c.stroke();
      var m = (a + b) / 2, pt = Math.round(v / tong * 1000) / 10, nhan = String(pt).replace('.', ',') + '%', tx = cx + r * 0.62 * Math.cos(m), ty = cy + r * 0.62 * Math.sin(m) + 5;
      if (g < 0.32) { tx = cx + (r + 22) * Math.cos(m); ty = cy + (r + 22) * Math.sin(m) + 5; }   // phần quá nhỏ: ghi bên ngoài
      c.font = 'bold 15px ' + FONT; c.textAlign = 'center';
      if (o.denTrang || g < 0.32) { var wt = c.measureText(nhan).width; c.fillStyle = 'rgba(255,255,255,.92)'; c.fillRect(tx - wt / 2 - 3, ty - 14, wt + 6, 18); c.fillStyle = '#111827'; }
      else c.fillStyle = '#fff';
      c.fillText(nhan, tx, ty); a = b;
    });
    c.beginPath(); c.arc(cx, cy, r, 0, 2 * Math.PI); c.lineWidth = 1.2; c.strokeStyle = '#111'; c.stroke();
    if (o.chuThich !== false) {   // chú thích bên phải
      var xL = cx + r + 34, n = dm.length, y = cy - (n * 28) / 2 + 14;
      dm.forEach(function (t, i) { c.fillStyle = toMau(c, o, i); c.fillRect(xL, y - 11, 18, 14); c.strokeStyle = '#111'; c.lineWidth = 0.8; c.strokeRect(xL, y - 11, 18, 14); chu(c, String(t), xL + 26, y + 1, 14, 'left'); y += 28; });
    }
  }
  return { ve: ve, MAU: MAU, TEN_KIEU: TEN_KIEU, laKep: laKep };
})();
