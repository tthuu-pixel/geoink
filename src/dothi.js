// Đồ thị hàm số kiểu hình vẽ LaTeX: hệ trục Oxy có mũi tên, nhãn O, x, y, vạch số; đồ thị cắt gọn trong khung;
// bảng giá trị kẻ ô ngay dưới hình.
//   o = { loai: 'doThi', x, y (vị trí gốc O trên bảng), dv (độ dài 1 đơn vị, mặc định 40 = 1 ô / 1 cm),
//         xMin, xMax, yMin, yMax, ds: [{ bt, mau, rong }], bang: [{ i (chỉ số đồ thị), xs: '−2; −1; 0; 1; 2' }], luoi, ghiPT }
window.GI = window.GI || {};
GI.doThi = (function () {
  var MAU = ['#2563EB', '#DC2626', '#16A34A', '#9333EA', '#EA580C'];
  var FONT = '"LM Roman", "Times New Roman", serif';
  function ham(d) {   // hàm số đã đọc (đệm lại theo biểu thức)
    if (d._bt !== d.bt || (typeof d._f !== 'function' && !d._loi)) { d._bt = d.bt; try { var r = GI.bieuThuc.doc(d.bt); d._f = r.f; d._ve = r.ve; d._loi = null; } catch (e) { d._f = null; d._ve = 'y = ' + d.bt; d._loi = e.message; } }
    return d._f;
  }
  function docX(s) {   // "−2; −1; 0; 1,5; 2" → mảng số (nhận cả phân số 1/2)
    return String(s || '').replace(/[−–]/g, '-').split(/[;\s]+/).filter(Boolean).map(function (t) {
      t = t.replace(',', '.'); var m = /^(-?\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)$/.exec(t); return m ? +m[1] / +m[2] : parseFloat(t);
    }).filter(function (v) { return isFinite(v); });
  }
  // số đẹp: phân số đơn giản (½, −1/3…) hoặc thập phân dùng dấu phẩy
  function so(v) {
    if (!isFinite(v)) return '—';
    if (Math.abs(v - Math.round(v)) < 1e-9) return (Math.round(v) < 0 ? '−' : '') + Math.abs(Math.round(v));
    for (var q = 2; q <= 12; q++) { var p = v * q; if (Math.abs(p - Math.round(p)) < 1e-9) { var t = Math.abs(Math.round(p)); return (v < 0 ? '−' : '') + t + '/' + q; } }
    var r = Math.round(v * 100) / 100; return (r < 0 ? '−' : '') + String(Math.abs(r)).replace('.', ',');
  }
  // ô bảng: "−1/2" vẽ thành phân số chồng kiểu LaTeX
  var PS = /^(−?)(\d+)\/(\d+)$/;
  function rongChu(c, t) {
    var m = PS.exec(t); if (!m) return c.measureText(t).width;
    var f = c.font; c.font = f.replace(/[\d.]+px/, function (v) { return (parseFloat(v) * 0.8) + 'px'; });
    var w = Math.max(c.measureText(m[2]).width, c.measureText(m[3]).width); c.font = f;
    return w + 6 + (m[1] ? c.measureText('−').width + 2 : 0);
  }
  function veO(c, t, x, y, px) {
    var m = PS.exec(t); if (!m) { c.fillText(t, x, y); return; }
    var f = c.font, w = rongChu(c, t), tru = m[1] ? c.measureText('−').width + 2 : 0, x0 = x - w / 2;
    if (tru) { c.textAlign = 'left'; c.fillText('−', x0, y); c.textAlign = 'center'; }
    var cx = x0 + tru + (w - tru) / 2, nho = parseFloat(/([\d.]+)px/.exec(f)[1]) * 0.8;
    c.font = f.replace(/[\d.]+px/, nho + 'px');
    c.fillText(m[2], cx, y - nho * 0.62); c.fillText(m[3], cx, y + nho * 0.66);
    c.save(); c.lineWidth = 1 * px; c.strokeStyle = c.fillStyle; c.beginPath(); c.moveTo(cx - (w - tru) / 2 + 1 * px, y); c.lineTo(cx + (w - tru) / 2 - 1 * px, y); c.stroke(); c.restore();
    c.font = f;
  }
  function buoc(khoang) { return khoang > 24 ? 5 : khoang > 12 ? 2 : 1; }
  function ve(c, o, px, mauChu, chon) {
    var dv = o.dv || 40, X = function (x) { return o.x + x * dv; }, Y = function (y) { return o.y - y * dv; };
    var x0 = Math.min(o.xMin, 0), x1 = Math.max(o.xMax, 0), y0 = Math.min(o.yMin, 0), y1 = Math.max(o.yMax, 0), mau = mauChu || '#111827';
    c.save(); c.lineCap = 'round'; c.lineJoin = 'round'; c.setLineDash([]);
    // lưới ô vuông
    if (o.luoi) {
      c.strokeStyle = 'rgba(100,116,139,.22)'; c.lineWidth = 1 * px; c.beginPath();
      for (var gx = Math.ceil(o.xMin); gx <= o.xMax; gx++) { c.moveTo(X(gx), Y(o.yMin)); c.lineTo(X(gx), Y(o.yMax)); }
      for (var gy = Math.ceil(o.yMin); gy <= o.yMax; gy++) { c.moveTo(X(o.xMin), Y(gy)); c.lineTo(X(o.xMax), Y(gy)); }
      c.stroke();
    }
    // trục có mũi tên
    var mt = 10 * px, du = 0.55;
    c.strokeStyle = mau; c.fillStyle = mau; c.lineWidth = 1.5 * px;
    c.beginPath(); c.moveTo(X(x0 - du * 0.6), Y(0)); c.lineTo(X(x1 + du), Y(0)); c.moveTo(X(0), Y(y0 - du * 0.6)); c.lineTo(X(0), Y(y1 + du)); c.stroke();
    c.beginPath(); c.moveTo(X(x1 + du) + mt * 0.4, Y(0)); c.lineTo(X(x1 + du) - mt, Y(0) - mt * 0.45); c.lineTo(X(x1 + du) - mt, Y(0) + mt * 0.45); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(X(0), Y(y1 + du) - mt * 0.4); c.lineTo(X(0) - mt * 0.45, Y(y1 + du) + mt); c.lineTo(X(0) + mt * 0.45, Y(y1 + du) + mt); c.closePath(); c.fill();
    c.font = 'italic ' + (20 * px) + 'px ' + FONT; c.textBaseline = 'middle';
    c.textAlign = 'left'; c.fillText('x', X(x1 + du) - 4 * px, Y(0) + 16 * px);
    c.textAlign = 'right'; c.fillText('y', X(0) - 9 * px, Y(y1 + du) + 2 * px);
    c.fillText('O', X(0) - 6 * px, Y(0) + 14 * px);
    // vạch số
    c.font = (15 * px) + 'px ' + FONT; c.lineWidth = 1.2 * px;
    var bx = buoc(x1 - x0), by = buoc(y1 - y0);
    var chiem = [];   // ô chữ đã có quanh trục (để số ghi thêm không đè lên)
    function oChu(t, cx, cy) { var w = rongChu(c, t) / 2 + 2 * px, h = (PS.test(t) ? 14 : 8) * px; return { x0: cx - w, x1: cx + w, y0: cy - h, y1: cy + h }; }
    var wO = c.measureText('O').width; chiem.push({ x0: X(0) - 8 * px - wO, x1: X(0) - 4 * px, y0: Y(0) + 4 * px, y1: Y(0) + 24 * px });
    for (var i = Math.ceil(x0 / bx) * bx; i <= x1 + 1e-9; i += bx) { if (Math.abs(i) < 1e-9) continue; c.beginPath(); c.moveTo(X(i), Y(0) - 3.5 * px); c.lineTo(X(i), Y(0) + 3.5 * px); c.stroke(); c.textAlign = 'center'; c.fillText(so(i), X(i), Y(0) + 15 * px); chiem.push(oChu(so(i), X(i), Y(0) + 15 * px)); }
    for (var j = Math.ceil(y0 / by) * by; j <= y1 + 1e-9; j += by) { if (Math.abs(j) < 1e-9) continue; c.beginPath(); c.moveTo(X(0) - 3.5 * px, Y(j)); c.lineTo(X(0) + 3.5 * px, Y(j)); c.stroke(); c.textAlign = 'right'; c.fillText(so(j), X(0) - 7 * px, Y(j)); var wj = c.measureText(so(j)).width; chiem.push(oChu(so(j), X(0) - 7 * px - wj / 2, Y(j))); }
    // các đồ thị (cắt trong khung Ox, Oy đã chọn)
    var nhanPT = [];
    (o.ds || []).forEach(function (d, k) {
      var f = ham(d); if (!f) return;
      var mauD = d.mau || MAU[k % MAU.length];
      c.save(); c.beginPath(); c.rect(X(o.xMin), Y(o.yMax), (o.xMax - o.xMin) * dv, (o.yMax - o.yMin) * dv); c.clip();
      c.strokeStyle = mauD; c.lineWidth = (d.rong || 2.4) * px; c.beginPath();
      var n = 480, dang = false, trong = [];
      for (var s = 0; s <= n; s++) {
        var x = o.xMin + (o.xMax - o.xMin) * s / n, y = f(x, {});
        if (!isFinite(y) || Math.abs(y) > 1e6) { dang = false; continue; }
        if (dang) c.lineTo(X(x), Y(y)); else { c.moveTo(X(x), Y(y)); dang = true; }
        if (y >= o.yMin && y <= o.yMax) trong.push({ x: x, y: y });
      }
      c.stroke(); c.restore();
      if (o.ghiPT !== false && trong.length) nhanPT.push({ t: d._ve, mau: mauD, ds: trong });
    });
    // điểm từ bảng giá trị + nét đứt gióng xuống hai trục (kiểu SGK)
    var daDat = [], vachX = {}, vachY = {};
    if (o.giong !== false) {
      var bx0 = buoc(x1 - x0), by0 = buoc(y1 - y0);
      function datSo(t, ds) {   // chọn chỗ ít đè nhất trong các chỗ thử
        var tot = null, it = 1e9;
        ds.forEach(function (d) { var h = oChu(t, d[0], d[1]), n = 0; chiem.forEach(function (k) { if (h.x0 < k.x1 && k.x0 < h.x1 && h.y0 < k.y1 && k.y0 < h.y1) n++; }); if (n < it) { it = n; tot = { d: d, h: h }; } });
        chiem.push(tot.h); veO(c, t, tot.d[0], tot.d[1], px);
      }
      (o.bang || []).forEach(function (b) {
        var d = o.ds[b.i] || o.ds[0]; if (!d) return; var f = ham(d); if (!f) return;
        var mauD = d.mau || MAU[(b.i || 0) % MAU.length];
        docX(b.xs).forEach(function (x) {
          var y = f(x, {}); if (!isFinite(y) || x < o.xMin - 1e-9 || x > o.xMax + 1e-9 || y < o.yMin - 1e-9 || y > o.yMax + 1e-9) return;
          c.save(); c.setLineDash([5 * px, 4 * px]); c.strokeStyle = mau; c.lineWidth = 1 * px; c.globalAlpha = 0.85; c.beginPath();
          if (Math.abs(y) > 1e-9) { c.moveTo(X(x), Y(y)); c.lineTo(X(x), Y(0)); }
          if (Math.abs(x) > 1e-9) { c.moveTo(X(x), Y(y)); c.lineTo(X(0), Y(y)); }
          c.stroke(); c.restore();
          // số chưa có vạch trên trục (như 1/2, 2,5…) thì ghi thêm
          var kx = so(x), ky = so(y);
          if (Math.abs(x) > 1e-9 && Math.abs(x / bx0 - Math.round(x / bx0)) > 1e-9 && !vachX[kx]) { vachX[kx] = 1; c.save(); c.fillStyle = mau; c.strokeStyle = mau; c.lineWidth = 1.2 * px; c.beginPath(); c.moveTo(X(x), Y(0) - 3.5 * px); c.lineTo(X(x), Y(0) + 3.5 * px); c.stroke(); c.font = (15 * px) + 'px ' + FONT; c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = (15 * px) + 'px ' + FONT; c.textAlign = 'center'; c.textBaseline = 'middle'; var dx = (PS.test(kx) ? 22 : 15) * px; datSo(kx, [[X(x), Y(0) + dx], [X(x), Y(0) - dx]]); c.restore(); }
          if (Math.abs(y) > 1e-9 && Math.abs(y / by0 - Math.round(y / by0)) > 1e-9 && !vachY[ky]) { vachY[ky] = 1; c.save(); c.fillStyle = mau; c.strokeStyle = mau; c.lineWidth = 1.2 * px; c.beginPath(); c.moveTo(X(0) - 3.5 * px, Y(y)); c.lineTo(X(0) + 3.5 * px, Y(y)); c.stroke(); c.font = (15 * px) + 'px ' + FONT; c.textAlign = 'right'; c.textBaseline = 'middle'; c.save(); c.textAlign = 'center'; var dy = 7 * px + rongChu(c, ky) / 2; datSo(ky, [[X(0) - dy, Y(y)], [X(0) + dy, Y(y)]]); c.restore(); c.restore(); }
          daDat.push({ x0: X(x) - 6 * px, x1: X(x) + 6 * px, y0: Y(y) - 6 * px, y1: Y(y) + 6 * px, diem: { x: X(x), y: Y(y), mau: mauD } });
        });
      });
    }
    // nhãn phương trình: chọn chỗ dọc theo đồ thị không đè lên trục và nhãn khác
    c.font = 'italic ' + (19 * px) + 'px ' + FONT; c.textBaseline = 'middle'; c.textAlign = 'left';
    var cao = 22 * px, le = { x0: X(o.xMin), x1: X(o.xMax), y0: Y(o.yMax), y1: Y(o.yMin) };
    function de(a, b) { var g = 8 * px, gx = 30 * px; return a.x0 < b.x1 + gx && b.x0 < a.x1 + gx && a.y0 < b.y1 + g && b.y0 < a.y1 + g; }
    nhanPT.forEach(function (n) {
      var w = c.measureText(n.t).width, tot = null, diemTot = -1e9;
      [0.92, 0.82, 0.72, 0.62, 0.08, 0.18, 0.3, 0.5].forEach(function (tl, th) {
        var P = n.ds[Math.round((n.ds.length - 1) * tl)], px0 = X(P.x), py0 = Y(P.y);
        [[8, -16], [-8 - w, -16], [8, 16], [-8 - w, 16]].forEach(function (lc, lh) {
          var h = {}; h.x0 = px0 + (lc[0] > 0 ? 8 * px : -8 * px - w); h.y0 = py0 + (lc[1] > 0 ? 6 * px : -6 * px - cao); h.x1 = h.x0 + w; h.y1 = h.y0 + cao;
          var diem = -th * 3 - lh;
          if (h.x0 < le.x0 - 30 * px || h.x1 > le.x1 + 30 * px || h.y0 < le.y0 - 6 * px || h.y1 > le.y1 + 6 * px) diem -= 60;
          if (h.x0 < X(0) + 6 * px && h.x1 > X(0) - 30 * px) diem -= 40;   // đè trục Oy và số trên trục
          if (h.y0 < Y(0) + 26 * px && h.y1 > Y(0) - 6 * px) diem -= 40;   // đè trục Ox và số trên trục
          if (h.y0 < Y(o.yMax) + 18 * px && h.x0 < X(0) + 24 * px && h.x1 > X(0) - 24 * px) diem -= 40;   // chữ y, mũi tên
          daDat.forEach(function (k) { if (de(h, k)) diem -= 100; });
          nhanPT.forEach(function (m) { if (m === n) return; for (var q = 0; q < m.ds.length; q += 6) { var mx = X(m.ds[q].x), my = Y(m.ds[q].y); if (mx > h.x0 && mx < h.x1 && my > h.y0 && my < h.y1) { diem -= 25; break; } } });
          if (diem > diemTot) { diemTot = diem; tot = h; }
        });
      });
      daDat.push(tot);
      c.lineWidth = 4 * px; c.strokeStyle = '#fff'; c.strokeText(n.t, tot.x0, (tot.y0 + tot.y1) / 2);
      c.fillStyle = n.mau; c.fillText(n.t, tot.x0, (tot.y0 + tot.y1) / 2);
    });
    daDat.forEach(function (k) { if (!k.diem) return; c.beginPath(); c.arc(k.diem.x, k.diem.y, 3.6 * px, 0, 2 * Math.PI); c.fillStyle = k.diem.mau; c.fill(); c.lineWidth = 1 * px; c.strokeStyle = '#fff'; c.stroke(); });
    // bảng giá trị ngay dưới hình
    var kh = { x0: X(x0 - du) - 24 * px, y0: Y(y1 + du) - 12 * px, x1: X(x1 + du) + 16 * px, y1: Y(y0 - du) + 22 * px };
    var yb = kh.y1 + 14 * px;
    (!o.hienBang ? [] : o.bang || []).forEach(function (b) {
      var d = o.ds[b.i] || o.ds[0]; if (!d) return; var f = ham(d), xs = docX(b.xs); if (!xs.length) return;
      var hang = [['x'].concat(xs.map(so)), [d._ve || 'y'].concat(xs.map(function (x) { return f ? so(f(x, {})) : '—'; }))];
      c.font = (17 * px) + 'px ' + FONT;
      var rong0 = Math.max(c.measureText(hang[0][0]).width, c.measureText(hang[1][0]).width) + 22 * px, rongO = 0;
      for (var q = 1; q < hang[0].length; q++) rongO = Math.max(rongO, rongChu(c, hang[0][q]), rongChu(c, hang[1][q]));
      var coPS = hang[0].concat(hang[1]).some(function (t) { return PS.test(t); });
      rongO += 22 * px; var cao = (coPS ? 44 : 30) * px, tong = rong0 + rongO * xs.length, xb = (kh.x0 + kh.x1) / 2 - tong / 2;
      c.fillStyle = '#fff'; c.fillRect(xb, yb, tong, cao * 2);
      c.strokeStyle = mau; c.lineWidth = 1.3 * px; c.strokeRect(xb, yb, tong, cao * 2);
      c.beginPath(); c.moveTo(xb, yb + cao); c.lineTo(xb + tong, yb + cao); c.moveTo(xb + rong0, yb); c.lineTo(xb + rong0, yb + 2 * cao);
      for (var r = 1; r < xs.length; r++) { c.moveTo(xb + rong0 + r * rongO, yb); c.lineTo(xb + rong0 + r * rongO, yb + 2 * cao); }
      c.stroke();
      c.textBaseline = 'middle'; c.textAlign = 'center';
      hang.forEach(function (h, hi) { h.forEach(function (t, ci) {
        c.fillStyle = hi === 1 && ci === 0 ? (d.mau || MAU[(b.i || 0) % MAU.length]) : mau;
        c.font = (ci === 0 ? 'italic ' : '') + (17 * px) + 'px ' + FONT;
        veO(c, t, ci === 0 ? xb + rong0 / 2 : xb + rong0 + (ci - 0.5) * rongO, yb + (hi + 0.5) * cao, px);
      }); });
      kh.x0 = Math.min(kh.x0, xb - 4 * px); kh.x1 = Math.max(kh.x1, xb + tong + 4 * px); yb += cao * 2 + 12 * px; kh.y1 = yb;
    });
    if (chon) { c.setLineDash([6 * px, 4 * px]); c.strokeStyle = '#F97316'; c.lineWidth = 1.5 * px; c.strokeRect(kh.x0, kh.y0, kh.x1 - kh.x0, kh.y1 - kh.y0); }
    c.restore();
    return kh;
  }
  // nhận dạng: 'bac1' (y = ax + b) cần 3 điểm, 'bac2' (y = ax²…) cần 5 điểm
  function dang(bt) {
    var f; try { f = GI.bieuThuc.doc(bt).f; } catch (e) { return null; }
    var v = [-2, -1, 0, 1, 2, 3].map(function (x) { return f(x, {}); }); if (!v.every(isFinite)) return 'khac';
    var d2 = v.slice(2).map(function (_, i) { return v[i + 2] - 2 * v[i + 1] + v[i]; });
    if (d2.every(function (t) { return Math.abs(t) < 1e-9; })) return 'bac1';
    if (d2.every(function (t) { return Math.abs(t - d2[0]) < 1e-9; })) return 'bac2';
    return 'khac';
  }
  // bậc nhất: 2 điểm kiểu SGK — x = 0 (y = b) và y = 0 (x = −b/a); b = 0 thì lấy x = 0; 1
  function xMacDinh(bt) {
    if (dang(bt) !== 'bac1') return '-2; -1; 0; 1; 2';
    var f = GI.bieuThuc.doc(bt).f, b = f(0, {}), a = f(1, {}) - b;
    if (Math.abs(a) < 1e-12 || Math.abs(b) < 1e-12 || Math.abs(b / a) > 20) return '0; 1';
    var x = so(-b / a).replace('−', '-');
    return /,/.test(x) ? '0; 1' : '0; ' + x;
  }
  return { dang: dang, xMacDinh: xMacDinh, ve: ve, docX: docX, so: so, MAU: MAU, ham: ham };
})();
