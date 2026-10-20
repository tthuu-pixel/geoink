// Dụng cụ học tập trên bảng: thước kẻ 20 cm, thước đo độ, ê-ke 30°–60° / 45°, thước parabol, compa.
// Vẽ đúng tỉ lệ thật (1 cm = 40 đơn vị thế giới). Không lưu vào tệp, không vào lịch sử hoàn tác.
//   dc = { loai, x, y, goc (rad) }   – compa: { loai: 'compa', x, y (đầu kim), r, goc (hướng kim → bút) }
window.GI = window.GI || {};
GI.dungCu = (function () {
  var CM = 40, TEN = { thuoc: 'Thước kẻ', doDo: 'Thước đo độ', eke30: 'Ê-ke 30°–60°', eke45: 'Ê-ke 45°', parabol: 'Thước parabol', compa: 'Compa' };
  var R_DO = 5.6 * CM, F_PB = 1.6 * CM, W_PB = 4.6 * CM, DAY_PB = 1.8 * CM;   // bán kính thước đo độ; tiêu cự, nửa bề rộng, bề dày thước parabol
  var CHAN_COMPA = 9 * CM;

  var LECH = { thuoc: [0, 3], doDo: [-6, -2], eke30: [5, 0], eke45: [9, 2], parabol: [-7, 4], compa: [-10, 3] };   // mỗi loại hiện một chỗ (cm so với giữa màn hình)
  function tao(loai, tam0) {
    var tam = { x: tam0.x + LECH[loai][0] * CM, y: tam0.y + LECH[loai][1] * CM };
    if (loai === 'compa') return { loai: 'compa', x: tam.x - 2 * CM, y: tam.y + 2 * CM, r: 4 * CM, goc: 0 };
    var o = { loai: loai, x: tam.x, y: tam.y, goc: 0 };
    if (loai === 'thuoc') { o.x = tam.x - 10 * CM; o.y = tam.y - 1.5 * CM; }
    if (loai === 'eke30' || loai === 'eke45') { o.x = tam.x - 4 * CM; o.y = tam.y + 3 * CM; }
    if (loai === 'parabol') { o.y = tam.y + 1 * CM; }
    return o;
  }
  // ---- toạ độ cục bộ ↔ thế giới ----
  function raTG(dc, lx, ly) { var c = Math.cos(dc.goc), s = Math.sin(dc.goc); return { x: dc.x + lx * c - ly * s, y: dc.y + lx * s + ly * c }; }
  function veCB(dc, P) { var c = Math.cos(dc.goc), s = Math.sin(dc.goc), dx = P.x - dc.x, dy = P.y - dc.y; return { x: dx * c + dy * s, y: -dx * s + dy * c }; }
  function cacEke(loai) { var L1 = loai === 'eke45' ? 8 * CM : 10.4 * CM, L2 = loai === 'eke45' ? 8 * CM : 6 * CM; return { L1: L1, L2: L2 }; }
  function duongPB() { var ds = []; for (var i = 0; i <= 120; i++) { var t = -W_PB + 2 * W_PB * i / 120; ds.push({ x: t, y: -t * t / (4 * F_PB) }); } return ds; }

  // Thân dụng cụ (đa giác, toạ độ cục bộ) và các mép vẽ được
  function hinhDang(dc) {
    var L = dc.loai;
    if (L === 'thuoc') return { than: [{ x: -0.6 * CM, y: 0 }, { x: 20.6 * CM, y: 0 }, { x: 20.6 * CM, y: 3 * CM }, { x: -0.6 * CM, y: 3 * CM }], mep: [[{ x: -0.6 * CM, y: 0 }, { x: 20.6 * CM, y: 0 }], [{ x: -0.6 * CM, y: 3 * CM }, { x: 20.6 * CM, y: 3 * CM }]], tam: { x: 10 * CM, y: 1.5 * CM }, xoay: { x: 21.4 * CM, y: 1.5 * CM } };
    if (L === 'doDo') {
      var t = [], n = 72; for (var i = 0; i <= n; i++) { var a = Math.PI + Math.PI * i / n; t.push({ x: (R_DO + 0.3 * CM) * Math.cos(a), y: (R_DO + 0.3 * CM) * Math.sin(a) }); }
      t.push({ x: R_DO + 0.3 * CM, y: 0.7 * CM }, { x: -R_DO - 0.3 * CM, y: 0.7 * CM });
      return { than: t, mep: [[{ x: -R_DO - 0.3 * CM, y: 0.7 * CM }, { x: R_DO + 0.3 * CM, y: 0.7 * CM }]], tam: { x: 0, y: -R_DO / 2 }, xoay: { x: R_DO + 1.2 * CM, y: 0.35 * CM } };
    }
    if (L === 'eke30' || L === 'eke45') {
      var e = cacEke(L), A = { x: 0, y: 0 }, B = { x: e.L1, y: 0 }, C = { x: 0, y: -e.L2 };
      return { than: [A, B, C], mep: [[A, B], [A, C], [B, C]], tam: { x: e.L1 / 3, y: -e.L2 / 3 }, xoay: { x: e.L1 * 0.62, y: -e.L2 * 0.62 } };
    }
    if (L === 'parabol') {
      var d = duongPB(), than = d.slice(); for (var j = d.length - 1; j >= 0; j--) than.push({ x: d[j].x, y: d[j].y + DAY_PB });
      return { than: than, mep: [], cong: d, tam: { x: 0, y: -W_PB * W_PB / (8 * F_PB) + DAY_PB / 2 }, xoay: { x: W_PB + 1 * CM, y: -W_PB * W_PB / (4 * F_PB) + DAY_PB / 2 } };
    }
    return null;
  }
  function trongDaGiac(ds, P) { var tr = false; for (var i = 0, j = ds.length - 1; i < ds.length; j = i++) { if ((ds[i].y > P.y) !== (ds[j].y > P.y) && P.x < (ds[j].x - ds[i].x) * (P.y - ds[i].y) / (ds[j].y - ds[i].y) + ds[i].x) tr = !tr; } return tr; }
  function chieuDoan(A, B, P) { var ux = B.x - A.x, uy = B.y - A.y, L = ux * ux + uy * uy, t = Math.max(0, Math.min(1, ((P.x - A.x) * ux + (P.y - A.y) * uy) / L)); return { x: A.x + ux * t, y: A.y + uy * t }; }
  function chieuDuong(A, B, P) { var ux = B.x - A.x, uy = B.y - A.y, L = ux * ux + uy * uy, t = ((P.x - A.x) * ux + (P.y - A.y) * uy) / L; return { x: A.x + ux * t, y: A.y + uy * t }; }

  // ---- compa ----
  function compa(dc) {
    var K = { x: dc.x, y: dc.y }, P = { x: dc.x + dc.r * Math.cos(dc.goc), y: dc.y + dc.r * Math.sin(dc.goc) };
    var M = { x: (K.x + P.x) / 2, y: (K.y + P.y) / 2 }, n = { x: Math.sin(dc.goc), y: -Math.cos(dc.goc) }; if (n.y > 0) n = { x: -n.x, y: -n.y };
    var h = Math.sqrt(Math.max(CHAN_COMPA * CHAN_COMPA - dc.r * dc.r / 4, (0.6 * CM) * (0.6 * CM)));
    var H = { x: M.x + n.x * h, y: M.y + n.y * h };
    return { K: K, P: P, H: H, N: { x: H.x + n.x * 1.5 * CM, y: H.y + n.y * 1.5 * CM }, n: n };
  }

  // ---- tìm phần dụng cụ dưới con trỏ ----
  //   ve: true khi đang cầm bút (để mép thước hút nét vẽ)
  function tim(ds, M, px, ve) {
    // nút xoay và núm compa được ưu tiên (kể cả khi dụng cụ khác đè lên)
    for (var k = ds.length - 1; k >= 0; k--) {
      var d0 = ds[k];
      if (d0.loai === 'compa') { var C0 = compa(d0); if (Math.hypot(M.x - C0.N.x, M.y - C0.N.y) < 14 * px) return { dc: d0, phan: 'quayCompa' }; continue; }
      var H0 = hinhDang(d0), X0 = raTG(d0, H0.xoay.x, H0.xoay.y);
      if (Math.hypot(M.x - X0.x, M.y - X0.y) < 15 * px) return { dc: d0, phan: 'xoay', tam: raTG(d0, H0.tam.x, H0.tam.y) };
    }
    for (var i = ds.length - 1; i >= 0; i--) {
      var dc = ds[i];
      if (dc.loai === 'compa') {
        var C = compa(dc), d = function (Q) { return Math.hypot(M.x - Q.x, M.y - Q.y); };
        if (d(C.N) < 14 * px) return { dc: dc, phan: 'quayCompa' };
        if (d(C.P) < 12 * px) return { dc: dc, phan: 'butCompa' };
        if (d(C.K) < 12 * px || doanGan(C.K, C.H, M) < 9 * px || doanGan(C.P, C.H, M) < 9 * px || d(C.H) < 16 * px) return { dc: dc, phan: 'than' };
        continue;
      }
      var H = hinhDang(dc), L = veCB(dc, M), X = raTG(dc, H.xoay.x, H.xoay.y);
      if (Math.hypot(M.x - X.x, M.y - X.y) < 15 * px) return { dc: dc, phan: 'xoay', tam: raTG(dc, H.tam.x, H.tam.y) };
      if (ve) {   // gần mép (kể cả phía ngoài) → vẽ bám mép
        var tot = null, d0 = 18 * px;
        H.mep.forEach(function (m) { var Q = chieuDoan(m[0], m[1], L), dd = Math.hypot(Q.x - L.x, Q.y - L.y); if (dd < d0) { d0 = dd; tot = { dc: dc, phan: 'mep', A: m[0], B: m[1] }; } });
        if (H.cong) { var Qc = ganCong(H.cong, L), dc2 = Math.hypot(Qc.x - L.x, Qc.y - L.y); if (dc2 < d0) { d0 = dc2; tot = { dc: dc, phan: 'mep', cong: H.cong }; } }
        if (tot) return tot;
      }
      if (trongDaGiac(H.than, L)) return { dc: dc, phan: 'than' };
    }
    return null;
  }
  function doanGan(A, B, P) { var Q = chieuDoan(A, B, P); return Math.hypot(P.x - Q.x, P.y - Q.y); }
  function ganCong(ds, P) { var tot = ds[0], d0 = Infinity; for (var i = 0; i + 1 < ds.length; i++) { var Q = chieuDoan(ds[i], ds[i + 1], P), d = Math.hypot(Q.x - P.x, Q.y - P.y); if (d < d0) { d0 = d; tot = Q; } } return tot; }
  // Chiếu điểm vẽ lên mép đã bắt (theo toạ độ thế giới)
  function chieuMep(m, P) {
    var L = veCB(m.dc, P), Q = m.cong ? ganCong(m.cong, L) : chieuDuong(m.A, m.B, L);
    if (!m.cong) { var T = chieuDoan(m.A, m.B, L); Q = T; }
    return raTG(m.dc, Q.x, Q.y);
  }

  // ---- vẽ ----
  function soVN(x) { return String(x).replace('.', ','); }
  function ve(c, dc, px, dangXoay) {
    c.save(); c.setLineDash([]); c.lineJoin = 'round';
    if (dc.loai === 'compa') { veCompa(c, dc, px); c.restore(); return; }
    var H = hinhDang(dc);
    c.translate(dc.x, dc.y); c.rotate(dc.goc);
    // thân trong suốt
    c.beginPath(); H.than.forEach(function (P, i) { i ? c.lineTo(P.x, P.y) : c.moveTo(P.x, P.y); }); c.closePath();
    var MAU = { thuoc: ['rgba(186,230,253,.62)', '#0369A1'], doDo: ['rgba(254,240,138,.55)', '#A16207'], eke30: ['rgba(187,247,208,.6)', '#15803D'], eke45: ['rgba(221,214,254,.6)', '#6D28D9'], parabol: ['rgba(254,205,211,.6)', '#BE123C'] }[dc.loai];
    c.fillStyle = MAU[0]; c.fill(); c.strokeStyle = MAU[1]; c.lineWidth = 1.4 * px; c.stroke();
    c.strokeStyle = MAU[1]; c.fillStyle = MAU[1];
    var coSo = Math.max(9 * px, 0.32 * CM);
    if (dc.loai === 'thuoc') {
      for (var mm = 0; mm <= 200; mm++) { var x = mm * CM / 10, dai = mm % 10 === 0 ? 0.6 : mm % 5 === 0 ? 0.42 : 0.26; c.lineWidth = (mm % 10 === 0 ? 1.3 : 0.9) * px; c.beginPath(); c.moveTo(x, 0); c.lineTo(x, dai * CM); c.stroke(); }
      c.font = '600 ' + coSo + 'px Arial'; c.textAlign = 'center'; c.textBaseline = 'top';
      for (var cm = 0; cm <= 20; cm++) c.fillText(String(cm), cm * CM, 0.68 * CM);
      c.font = (coSo * 0.8) + 'px Arial'; c.textAlign = 'left'; c.fillText('cm', 0.15 * CM, 1.9 * CM);
    } else if (dc.loai === 'doDo') {
      for (var g = 0; g <= 180; g++) {
        var a = Math.PI + g * Math.PI / 180, ca = Math.cos(a), sa = Math.sin(a), d1 = g % 10 === 0 ? 0.75 : g % 5 === 0 ? 0.5 : 0.3;
        c.lineWidth = (g % 10 === 0 ? 1.2 : 0.8) * px; c.beginPath(); c.moveTo(R_DO * ca, R_DO * sa); c.lineTo((R_DO - d1 * CM) * ca, (R_DO - d1 * CM) * sa); c.stroke();
      }
      c.font = '600 ' + (coSo * 0.9) + 'px Arial'; c.textAlign = 'center'; c.textBaseline = 'middle';
      for (var g2 = 0; g2 <= 180; g2 += 10) {
        var a2 = Math.PI + g2 * Math.PI / 180, r1 = R_DO - 1.15 * CM, r2 = R_DO - 1.85 * CM;
        c.save(); c.translate(r1 * Math.cos(a2), r1 * Math.sin(a2)); c.rotate(a2 + Math.PI / 2); c.fillText(String(g2), 0, 0); c.restore();
        c.save(); c.globalAlpha = 0.75; c.translate(r2 * Math.cos(a2), r2 * Math.sin(a2)); c.rotate(a2 + Math.PI / 2); c.fillText(String(180 - g2), 0, 0); c.restore();
      }
      c.lineWidth = 1 * px; c.beginPath(); c.arc(0, 0, R_DO - 2.4 * CM, Math.PI, 0); c.stroke();
      c.beginPath(); c.moveTo(-R_DO, 0); c.lineTo(R_DO, 0); c.moveTo(0, 0); c.lineTo(0, -0.8 * CM); c.stroke();
      c.beginPath(); c.arc(0, 0, 0.12 * CM, 0, Math.PI * 2); c.fill();
    } else if (dc.loai === 'eke30' || dc.loai === 'eke45') {
      var e = cacEke(dc.loai);
      for (var m1 = 0; m1 * CM / 10 <= e.L1 - 0.4 * CM; m1++) { var x1 = m1 * CM / 10, dd1 = m1 % 10 === 0 ? 0.45 : m1 % 5 === 0 ? 0.32 : 0.2; c.lineWidth = 0.8 * px; c.beginPath(); c.moveTo(x1, 0); c.lineTo(x1, -dd1 * CM); c.stroke(); }
      for (var m2 = 0; m2 * CM / 10 <= e.L2 - 0.4 * CM; m2++) { var y2 = -m2 * CM / 10, dd2 = m2 % 10 === 0 ? 0.45 : m2 % 5 === 0 ? 0.32 : 0.2; c.lineWidth = 0.8 * px; c.beginPath(); c.moveTo(0, y2); c.lineTo(dd2 * CM, y2); c.stroke(); }
      c.font = (coSo * 0.8) + 'px Arial'; c.textAlign = 'center'; c.textBaseline = 'bottom';
      for (var k1 = 1; k1 * CM <= e.L1 - 0.6 * CM; k1++) c.fillText(String(k1), k1 * CM, -0.5 * CM);
      c.textAlign = 'left'; c.textBaseline = 'middle'; for (var k2 = 1; k2 * CM <= e.L2 - 0.6 * CM; k2++) c.fillText(String(k2), 0.55 * CM, -k2 * CM);
      // lỗ tam giác ở giữa và kí hiệu góc vuông
      var k = 0.42; c.beginPath(); c.moveTo(e.L1 * 0.2, -e.L2 * 0.2); c.lineTo(e.L1 * (0.2 + k), -e.L2 * 0.2); c.lineTo(e.L1 * 0.2, -e.L2 * (0.2 + k)); c.closePath(); c.lineWidth = 1 * px; c.stroke();
      c.beginPath(); c.moveTo(0.6 * CM, 0); c.lineTo(0.6 * CM, -0.6 * CM); c.lineTo(0, -0.6 * CM); c.stroke();
      c.font = '600 ' + (coSo * 0.85) + 'px Arial'; c.textAlign = 'center'; c.fillText(dc.loai === 'eke45' ? '45°' : '30°', e.L1 * 0.78, -e.L2 * 0.09);
    } else if (dc.loai === 'parabol') {
      c.lineWidth = 1 * px;
      for (var t = -4; t <= 4; t++) { var X = t * CM, Y = -X * X / (4 * F_PB); c.beginPath(); c.moveTo(X, Y); c.lineTo(X, Y + 0.35 * CM); c.stroke(); }
      c.beginPath(); c.arc(0, -F_PB, 0.1 * CM, 0, Math.PI * 2); c.fill();
      c.font = (coSo * 0.8) + 'px Arial'; c.textAlign = 'center'; c.textBaseline = 'top'; c.fillText('y = ax²', 0, 0.55 * CM);
    }
    // nút xoay
    c.beginPath(); c.arc(H.xoay.x, H.xoay.y, 13 * px, 0, Math.PI * 2); c.fillStyle = '#FFFFFF'; c.fill(); c.strokeStyle = '#2457C5'; c.lineWidth = 1.5 * px; c.stroke();
    c.beginPath(); c.arc(H.xoay.x, H.xoay.y, 7 * px, -Math.PI * 0.85, Math.PI * 0.55); c.lineWidth = 1.8 * px; c.stroke();
    c.restore();
    if (dangXoay) {   // số đo góc quay
      var X0 = raTG(dc, H.xoay.x, H.xoay.y), deg = ((dc.goc * 180 / Math.PI) % 360 + 360) % 360;
      c.save(); c.font = '700 ' + (15 * px) + 'px Arial'; var txt = soVN(Math.round(deg * 10) / 10) + '°', w = c.measureText(txt).width + 14 * px;
      c.fillStyle = '#1F2937'; c.fillRect(X0.x + 18 * px, X0.y - 12 * px, w, 24 * px); c.fillStyle = '#fff'; c.textBaseline = 'middle'; c.fillText(txt, X0.x + 25 * px, X0.y); c.restore();
    }
  }
  function veCompa(c, dc, px) {
    var C = compa(dc);
    // chân kim (xám) và chân bút (xanh, đầu bút chì)
    c.lineCap = 'round';
    c.strokeStyle = '#64748B'; c.lineWidth = 0.32 * CM; c.beginPath(); c.moveTo(C.H.x, C.H.y); c.lineTo(C.K.x + (C.H.x - C.K.x) * 0.12, C.K.y + (C.H.y - C.K.y) * 0.12); c.stroke();
    c.strokeStyle = '#94A3B8'; c.lineWidth = 0.1 * CM; c.beginPath(); c.moveTo(C.K.x + (C.H.x - C.K.x) * 0.12, C.K.y + (C.H.y - C.K.y) * 0.12); c.lineTo(C.K.x, C.K.y); c.stroke();
    c.strokeStyle = '#2563EB'; c.lineWidth = 0.32 * CM; c.beginPath(); c.moveTo(C.H.x, C.H.y); c.lineTo(C.P.x + (C.H.x - C.P.x) * 0.22, C.P.y + (C.H.y - C.P.y) * 0.22); c.stroke();
    c.strokeStyle = '#F5C451'; c.lineWidth = 0.22 * CM; c.beginPath(); c.moveTo(C.P.x + (C.H.x - C.P.x) * 0.22, C.P.y + (C.H.y - C.P.y) * 0.22); c.lineTo(C.P.x + (C.H.x - C.P.x) * 0.05, C.P.y + (C.H.y - C.P.y) * 0.05); c.stroke();
    c.strokeStyle = '#1F2937'; c.lineWidth = 0.1 * CM; c.beginPath(); c.moveTo(C.P.x + (C.H.x - C.P.x) * 0.05, C.P.y + (C.H.y - C.P.y) * 0.05); c.lineTo(C.P.x, C.P.y); c.stroke();
    // khớp và núm cầm
    c.fillStyle = '#334155'; c.beginPath(); c.arc(C.H.x, C.H.y, 0.32 * CM, 0, Math.PI * 2); c.fill();
    c.strokeStyle = '#334155'; c.lineWidth = 0.18 * CM; c.beginPath(); c.moveTo(C.H.x, C.H.y); c.lineTo(C.N.x, C.N.y); c.stroke();
    c.fillStyle = '#7A1E1E'; c.beginPath(); c.arc(C.N.x, C.N.y, 0.36 * CM, 0, Math.PI * 2); c.fill();
    // đầu kim, đầu bút: vòng tròn tay nắm; bán kính
    c.lineWidth = 1.4 * px; c.strokeStyle = '#2457C5'; c.setLineDash([]);
    [C.K, C.P].forEach(function (Q) { c.beginPath(); c.arc(Q.x, Q.y, 7 * px, 0, Math.PI * 2); c.stroke(); });
    c.save(); c.setLineDash([4 * px, 4 * px]); c.strokeStyle = 'rgba(37,87,197,.6)'; c.beginPath(); c.moveTo(C.K.x, C.K.y); c.lineTo(C.P.x, C.P.y); c.stroke(); c.restore();
    var txt = 'r = ' + soVN(Math.round(dc.r / CM * 10) / 10) + ' cm';
    c.font = '700 ' + (14 * px) + 'px Arial'; var w = c.measureText(txt).width + 12 * px, Mx = (C.K.x + C.P.x) / 2 - w / 2, My = (C.K.y + C.P.y) / 2 + 10 * px;
    c.fillStyle = 'rgba(255,255,255,.9)'; c.fillRect(Mx, My, w, 22 * px); c.fillStyle = '#1D4ED8'; c.textBaseline = 'middle'; c.fillText(txt, Mx + 6 * px, My + 11 * px);
  }
  return { TEN: TEN, CM: CM, tao: tao, tim: tim, chieuMep: chieuMep, ve: ve, compa: compa, CHAN: CHAN_COMPA };
})();
