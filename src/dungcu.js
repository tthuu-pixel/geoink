// Dụng cụ học tập trên bảng: thước kẻ 20 cm, thước đo độ, ê-ke 30°–60° / 45°, thước parabol, compa.
// Vẽ đúng tỉ lệ thật (1 cm = 40 đơn vị thế giới). Không lưu vào tệp, không vào lịch sử hoàn tác.
//   dc = { loai, x, y, goc (rad) }   – compa: { loai: 'compa', x, y (đầu kim), r, goc (hướng kim → bút) }
window.GI = window.GI || {};
GI.dungCu = (function () {
  var CM = 40, TEN = { thuoc: 'Thước kẻ', doDo: 'Thước đo độ', eke30: 'Ê-ke 30°–60°', eke45: 'Ê-ke 45°', parabol: 'Thước parabol', compa: 'Compa' };
  var R_DO = 6 * CM, DAY_DO = 0.85 * CM;   // bán kính thước đo độ, bề dày dải thước ở đáy
  var MAU_THAN = 'rgba(254,243,170,.5)', MAU_VIEN = '#A16207', MAU_VACH = '#5B3A0A';   // mọi dụng cụ: vàng nhạt trong suốt
  var CHAN_COMPA = 9 * CM;

  var LECH = { thuoc: [0, 3], doDo: [-6, -2], eke30: [5, 0], eke45: [9, 2], parabol: [-7, 4], compa: [-10, 3] };   // mỗi loại hiện một chỗ (cm so với giữa màn hình)
  function tao(loai, tam0) {
    var tam = { x: tam0.x + LECH[loai][0] * CM, y: tam0.y + LECH[loai][1] * CM };
    if (loai === 'compa') return { loai: 'compa', x: tam.x - 2 * CM, y: tam.y + 2 * CM, r: 4 * CM, goc: 0 };
    var o = { loai: loai, x: tam.x, y: tam.y, goc: 0 };
    if (loai === 'thuoc') { o.x = tam.x - 10 * CM; o.y = tam.y - 1.5 * CM; }
    if (loai === 'eke30' || loai === 'eke45') { o.x = tam.x - 4 * CM; o.y = tam.y + 3 * CM; }
    if (loai === 'parabol') { o.y = tam.y - 4.5 * CM; }
    return o;
  }
  // ---- toạ độ cục bộ ↔ thế giới ----
  // dc.k: tỉ lệ phóng to / thu nhỏ của dụng cụ (1 = 100%, đúng kích thước thật)
  function tl(dc) { return dc.k || 1; }
  function raTG(dc, lx, ly) { var k = tl(dc), c = Math.cos(dc.goc), s = Math.sin(dc.goc); lx *= k; ly *= k; return { x: dc.x + lx * c - ly * s, y: dc.y + lx * s + ly * c }; }
  function veCB(dc, P) { var k = tl(dc), c = Math.cos(dc.goc), s = Math.sin(dc.goc), dx = P.x - dc.x, dy = P.y - dc.y; return { x: (dx * c + dy * s) / k, y: (-dx * s + dy * c) / k }; }
  // ---- phóng to / thu nhỏ ----
  var MUC_TL = [0.5, 0.6, 0.7, 0.8, 0.9, 1, 1.1, 1.25, 1.5, 1.75, 2, 2.5, 3];
  // chỗ đặt nút "− 100% +" (toạ độ cục bộ, chưa nhân tỉ lệ): chỗ trống trên / cạnh thân dụng cụ
  function choNutTL(dc) {
    if (dc.loai === 'thuoc') return { x: 10 * CM, y: 3 * CM, duoi: true };
    if (dc.loai === 'doDo') return { x: 0, y: DAY_DO, duoi: true };
    if (dc.loai === 'eke30' || dc.loai === 'eke45') { var e = cacEke(dc.loai); return { x: e.L1 * 0.36, y: -e.L2 * 0.36 }; }
    if (dc.loai === 'parabol') return { x: 0, y: 6.5 * CM };
    return null;
  }
  function viTriNutTL(dc, px) {
    var P;
    if (dc.loai === 'compa') { var C = compa(dc); P = { x: (C.K.x + C.P.x) / 2, y: (C.K.y + C.P.y) / 2 + 48 * px }; }
    else { var q = choNutTL(dc); P = raTG(dc, q.x, q.y); if (q.duoi) { var c = Math.cos(dc.goc), s = Math.sin(dc.goc); P = { x: P.x - s * 20 * px, y: P.y + c * 20 * px }; } }
    return { x: P.x, y: P.y, w: 104 * px, h: 26 * px };
  }
  // đổi tỉ lệ, giữ nguyên tâm dụng cụ trên bảng
  function doiTiLe(dc, kMoi) {
    kMoi = Math.max(MUC_TL[0], Math.min(MUC_TL[MUC_TL.length - 1], Math.round(kMoi * 100) / 100));
    if (dc.loai === 'compa') { dc.k = kMoi; dc.r = Math.min(dc.r, CHAN_COMPA * kMoi * 1.94); return kMoi; }
    var H = hinhDang(dc), T0 = raTG(dc, H.tam.x, H.tam.y); dc.k = kMoi;
    var T1 = raTG(dc, H.tam.x, H.tam.y); dc.x += T0.x - T1.x; dc.y += T0.y - T1.y;
    return kMoi;
  }
  function buocTiLe(dc, huong) {
    var k = tl(dc), i;
    if (huong > 0) { for (i = 0; i < MUC_TL.length && MUC_TL[i] <= k + 1e-6; i++); return doiTiLe(dc, MUC_TL[Math.min(i, MUC_TL.length - 1)]); }
    for (i = MUC_TL.length - 1; i >= 0 && MUC_TL[i] >= k - 1e-6; i--); return doiTiLe(dc, MUC_TL[Math.max(i, 0)]);
  }
  function timNutTL(ds, M, px) {
    for (var i = ds.length - 1; i >= 0; i--) {
      var b = viTriNutTL(ds[i], px), dx = M.x - b.x, dy = M.y - b.y;
      if (Math.abs(dx) <= b.w / 2 && Math.abs(dy) <= b.h / 2 + 2 * px) return { dc: ds[i], phan: 'tiLe', huong: dx < -b.w / 6 ? -1 : dx > b.w / 6 ? 1 : 0 };
    }
    return null;
  }
  function veNutTL(c, dc, px) {
    var b = viTriNutTL(dc, px), x0 = b.x - b.w / 2, y0 = b.y - b.h / 2, r = b.h / 2;
    c.save(); c.setLineDash([]);
    c.beginPath(); c.moveTo(x0 + r, y0); c.arcTo(x0 + b.w, y0, x0 + b.w, y0 + b.h, r); c.arcTo(x0 + b.w, y0 + b.h, x0, y0 + b.h, r); c.arcTo(x0, y0 + b.h, x0, y0, r); c.arcTo(x0, y0, x0 + b.w, y0, r); c.closePath();
    c.fillStyle = 'rgba(255,255,255,.95)'; c.fill(); c.strokeStyle = '#2457C5'; c.lineWidth = 1.3 * px; c.stroke();
    c.strokeStyle = '#2457C5'; c.lineWidth = 2 * px; c.lineCap = 'round';
    var a = 5 * px, xt = x0 + b.w / 6, xp = x0 + b.w * 5 / 6;
    c.beginPath(); c.moveTo(xt - a, b.y); c.lineTo(xt + a, b.y); c.moveTo(xp - a, b.y); c.lineTo(xp + a, b.y); c.moveTo(xp, b.y - a); c.lineTo(xp, b.y + a); c.stroke();
    c.lineWidth = 1 * px; c.strokeStyle = 'rgba(36,87,197,.3)'; c.beginPath(); c.moveTo(x0 + b.w / 3, y0 + 5 * px); c.lineTo(x0 + b.w / 3, y0 + b.h - 5 * px); c.moveTo(x0 + b.w * 2 / 3, y0 + 5 * px); c.lineTo(x0 + b.w * 2 / 3, y0 + b.h - 5 * px); c.stroke();
    c.font = '700 ' + (13 * px) + 'px Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = tl(dc) === 1 ? '#1F2937' : '#C2410C';
    c.fillText(Math.round(tl(dc) * 100) + '%', b.x, b.y + 0.5 * px);
    c.restore();
  }
  function cacEke(loai) { var L1 = loai === 'eke45' ? 8 * CM : 10.4 * CM, L2 = loai === 'eke45' ? 8 * CM : 6 * CM; return { L1: L1, L2: L2 }; }
  // Thước parabol: đường viền, khe cong và lỗ tròn dò trực tiếp từ ảnh thước thật (đơn vị cm, gốc = đỉnh trên).
  var PB_VIEN = [0,-0.085,0.062,-0.083,0.124,-0.078,0.185,-0.069,0.247,-0.056,0.309,-0.04,0.37,-0.02,0.432,0.004,0.493,0.031,0.555,0.061,0.616,0.095,0.677,0.133,0.739,0.174,0.8,0.219,0.86,0.267,0.921,0.318,0.982,0.373,1.042,0.431,1.102,0.492,1.162,0.557,1.22,0.625,1.275,0.696,1.326,0.77,1.373,0.847,1.417,0.927,1.458,1.01,1.495,1.095,1.528,1.184,1.559,1.276,1.586,1.37,1.612,1.467,1.634,1.566,1.655,1.668,1.674,1.772,1.691,1.879,1.707,1.988,1.721,2.099,1.733,2.212,1.744,2.327,1.754,2.444,1.763,2.564,1.771,2.685,1.778,2.807,1.782,2.932,1.783,3.058,1.782,3.185,1.779,3.314,1.773,3.444,1.764,3.575,1.756,3.708,1.746,3.841,1.737,3.976,1.728,4.111,1.718,4.247,1.709,4.384,1.7,4.521,1.69,4.659,1.678,4.797,1.665,4.935,1.649,5.074,1.633,5.212,1.617,5.351,1.602,5.49,1.588,5.628,1.573,5.766,1.558,5.904,1.543,6.041,1.526,6.178,1.509,6.314,1.492,6.449,1.475,6.584,1.458,6.717,1.44,6.85,1.422,6.981,1.402,7.111,1.381,7.24,1.36,7.367,1.339,7.493,1.318,7.618,1.297,7.74,1.275,7.861,1.254,7.98,1.233,8.098,1.211,8.213,1.188,8.326,1.165,8.437,1.141,8.546,1.118,8.653,1.095,8.757,1.072,8.859,1.05,8.958,1.028,9.055,1.006,9.149,0.982,9.241,0.958,9.33,0.933,9.415,0.906,9.498,0.878,9.578,0.847,9.655,0.815,9.729,0.78,9.8,0.742,9.868,0.704,9.933,0.665,9.994,0.627,10.052,0.588,10.107,0.549,10.158,0.511,10.206,0.472,10.251,0.433,10.292,0.394,10.33,0.354,10.364,0.315,10.394,0.276,10.421,0.237,10.445,0.197,10.465,0.158,10.481,0.118,10.494,0.079,10.503,0.039,10.508,0,10.51,-0.039,10.508,-0.079,10.503,-0.118,10.494,-0.158,10.481,-0.197,10.465,-0.237,10.445,-0.276,10.421,-0.315,10.394,-0.354,10.364,-0.394,10.33,-0.433,10.292,-0.472,10.251,-0.511,10.206,-0.549,10.158,-0.588,10.107,-0.627,10.052,-0.665,9.994,-0.704,9.933,-0.742,9.868,-0.78,9.8,-0.815,9.729,-0.847,9.655,-0.878,9.578,-0.906,9.498,-0.933,9.415,-0.958,9.33,-0.982,9.241,-1.006,9.149,-1.028,9.055,-1.05,8.958,-1.072,8.859,-1.095,8.757,-1.118,8.653,-1.141,8.546,-1.165,8.437,-1.188,8.326,-1.211,8.213,-1.233,8.098,-1.254,7.98,-1.275,7.861,-1.297,7.74,-1.318,7.618,-1.339,7.493,-1.36,7.367,-1.381,7.24,-1.402,7.111,-1.422,6.981,-1.44,6.85,-1.458,6.717,-1.475,6.584,-1.492,6.449,-1.509,6.314,-1.526,6.178,-1.543,6.041,-1.558,5.904,-1.573,5.766,-1.588,5.628,-1.602,5.49,-1.617,5.351,-1.633,5.212,-1.649,5.074,-1.665,4.935,-1.678,4.797,-1.69,4.659,-1.7,4.521,-1.709,4.384,-1.718,4.247,-1.728,4.111,-1.737,3.976,-1.746,3.841,-1.756,3.708,-1.764,3.575,-1.773,3.444,-1.779,3.314,-1.782,3.185,-1.783,3.058,-1.782,2.932,-1.778,2.807,-1.771,2.685,-1.763,2.564,-1.754,2.444,-1.744,2.327,-1.733,2.212,-1.721,2.099,-1.707,1.988,-1.691,1.879,-1.674,1.772,-1.655,1.668,-1.634,1.566,-1.612,1.467,-1.586,1.37,-1.559,1.276,-1.528,1.184,-1.495,1.095,-1.458,1.01,-1.417,0.927,-1.373,0.847,-1.326,0.77,-1.275,0.696,-1.22,0.625,-1.162,0.557,-1.102,0.492,-1.042,0.431,-0.982,0.373,-0.921,0.318,-0.86,0.267,-0.8,0.219,-0.739,0.174,-0.677,0.133,-0.616,0.095,-0.555,0.061,-0.493,0.031,-0.432,0.004,-0.37,-0.02,-0.309,-0.04,-0.247,-0.056,-0.185,-0.069,-0.124,-0.078,-0.062,-0.083];   // nửa phải lấy đều từ ảnh thước thật, làm trơn, đối xứng
  var PB_KHE = [-0.54,1.13,-0.17,1.13,-0.07,1.15,0.08,1.21,0.35,1.37,0.54,1.56,0.76,1.87,0.9,2.2,0.99,2.56,1.03,2.97,0.99,3.51,0.93,3.91,0.78,4.45,0.63,4.84,0.33,5.32,0.17,5.51,-0.01,5.7,-0.12,5.8,-0.23,5.87,-0.31,5.88,-0.39,5.86,-0.44,5.81,-0.48,5.72,-0.59,5.31,-0.59,5.21,-0.54,5.15,-0.15,4.84,0.08,4.61,0.29,4.32,0.44,4.08,0.58,3.78,0.69,3.46,0.73,3.17,0.74,2.92,0.69,2.57,0.59,2.29,0.47,2.08,0.3,1.88,0.06,1.7,-0.07,1.63,-0.28,1.58,-0.62,1.58,-0.7,1.55,-0.76,1.5,-0.79,1.4,-0.78,1.33,-0.75,1.26,-0.66,1.17];
  var PB_LO = { x: 0, y: 7.87, r: 0.72 };
  // hai điểm ở hai đầu thước parabol: bấm một điểm → điểm đó cố định (xanh), kéo điểm kia để xoay
  var DAU_PB = [{ x: 0, y: 0.32 * CM }, { x: 0, y: 10.18 * CM }];
  function diemCM(m) { var ds = []; for (var i = 0; i < m.length; i += 2) ds.push({ x: m[i] * CM, y: m[i + 1] * CM }); return ds; }
  // làm trơn đường khép kín (Chaikin): mỗi lần cắt góc, đường cong mượt dần
  function chaikin(ds, lan) {
    for (var k = 0; k < lan; k++) { var m = []; for (var i = 0; i < ds.length; i++) { var A = ds[i], B = ds[(i + 1) % ds.length]; m.push({ x: A.x * 0.75 + B.x * 0.25, y: A.y * 0.75 + B.y * 0.25 }, { x: A.x * 0.25 + B.x * 0.75, y: A.y * 0.25 + B.y * 0.75 }); } ds = m; }
    return ds;
  }
  var _vienPB = null, _khePB = null;
  function vienPB() { return _vienPB || (_vienPB = chaikin(diemCM(PB_VIEN), 2)); }
  function khePB() { return _khePB || (_khePB = chaikin(diemCM(PB_KHE), 3)); }
  // Thân dụng cụ (đa giác, toạ độ cục bộ) và các mép vẽ được
  function hinhDang(dc) {
    var L = dc.loai;
    if (L === 'thuoc') return { ghim: { x: 0, y: 0 }, than: [{ x: -0.6 * CM, y: 0 }, { x: 20.6 * CM, y: 0 }, { x: 20.6 * CM, y: 3 * CM }, { x: -0.6 * CM, y: 3 * CM }], mep: [[{ x: -0.6 * CM, y: 0 }, { x: 20.6 * CM, y: 0 }], [{ x: -0.6 * CM, y: 3 * CM }, { x: 20.6 * CM, y: 3 * CM }]], tam: { x: 10 * CM, y: 1.5 * CM }, xoay: { x: 21.4 * CM, y: 1.5 * CM } };
    if (L === 'doDo') {
      var t = [], n = 90, R1 = R_DO + 0.25 * CM; for (var i = 0; i <= n; i++) { var a = Math.PI + Math.PI * i / n; t.push({ x: R1 * Math.cos(a), y: R1 * Math.sin(a) }); }
      t.push({ x: R1, y: DAY_DO }, { x: -R1, y: DAY_DO });
      return { ghim: { x: 0, y: 0 }, than: t, mep: [[{ x: -R1, y: DAY_DO }, { x: R1, y: DAY_DO }]], tam: { x: 0, y: -R_DO / 2 }, xoay: { x: R1 + 1 * CM, y: DAY_DO / 2 } };
    }
    if (L === 'eke30' || L === 'eke45') {
      var e = cacEke(L), A = { x: 0, y: 0 }, B = { x: e.L1, y: 0 }, C = { x: 0, y: -e.L2 };
      return { ghim: { x: 0, y: 0 }, than: [A, B, C], mep: [[A, B], [A, C], [B, C]], tam: { x: e.L1 / 3, y: -e.L2 / 3 }, xoay: { x: e.L1 * 0.62, y: -e.L2 * 0.62 } };
    }
    if (L === 'parabol') {
      var v = vienPB();
      return { ghim: DAU_PB[dc.dauCoDinh == null ? 0 : dc.dauCoDinh], than: v, mep: [], cong: v.concat([v[0]]), tam: { x: 0, y: 4 * CM }, xoay: null, dau: DAU_PB };
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
    var k = tl(dc), L = CHAN_COMPA * k, h = Math.sqrt(Math.max(L * L - dc.r * dc.r / 4, (0.6 * CM * k) * (0.6 * CM * k)));
    var H = { x: M.x + n.x * h, y: M.y + n.y * h };
    return { K: K, P: P, H: H, N: { x: H.x + n.x * 1.5 * CM * k, y: H.y + n.y * 1.5 * CM * k }, n: n };
  }

  // ---- tìm phần dụng cụ dưới con trỏ ----
  //   ve: true khi đang cầm bút (để mép thước hút nét vẽ)
  function tim(ds, M, px, ve) {
    var nt = timNutTL(ds, M, px); if (nt) return nt;
    // nút xoay và núm compa được ưu tiên (kể cả khi dụng cụ khác đè lên)
    for (var k = ds.length - 1; k >= 0; k--) {
      var d0 = ds[k];
      if (d0.loai === 'compa') { var C0 = compa(d0); if (Math.hypot(M.x - C0.N.x, M.y - C0.N.y) < 14 * px) return { dc: d0, phan: 'quayCompa' }; continue; }
      if (d0.loai === 'parabol') {   // hai điểm đầu thước
        for (var j = 0; j < 2; j++) {
          var Pj = raTG(d0, DAU_PB[j].x, DAU_PB[j].y); if (Math.hypot(M.x - Pj.x, M.y - Pj.y) >= 12 * px) continue;
          if (d0.dauCoDinh === j) return { dc: d0, phan: 'dauPB', i: j, coDinh: true };
          var tj = DAU_PB[d0.dauCoDinh != null ? d0.dauCoDinh : 1 - j]; return { dc: d0, phan: 'dauPB', i: j, tam: raTG(d0, tj.x, tj.y) };
        }
        continue;
      }
      var H0 = hinhDang(d0), X0 = raTG(d0, H0.xoay.x, H0.xoay.y), G0 = raTG(d0, H0.ghim.x, H0.ghim.y);
      if (Math.hypot(M.x - X0.x, M.y - X0.y) < 15 * px) return { dc: d0, phan: 'xoay', tam: G0 };
      if (Math.hypot(M.x - G0.x, M.y - G0.y) < 10 * px) return { dc: d0, phan: 'ghim' };
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
      var H = hinhDang(dc), L = veCB(dc, M), X = H.xoay && raTG(dc, H.xoay.x, H.xoay.y);
      if (X && Math.hypot(M.x - X.x, M.y - X.y) < 15 * px) return { dc: dc, phan: 'xoay', tam: raTG(dc, H.tam.x, H.tam.y) };
      if (ve) {   // gần mép (kể cả phía ngoài) → vẽ bám mép
        var tot = null, d0 = 18 * px;
        var kk0 = tl(dc); d0 /= kk0;
        H.mep.forEach(function (m) { var Q = chieuDoan(m[0], m[1], L), dd = Math.hypot(Q.x - L.x, Q.y - L.y); if (dd < d0) { d0 = dd; tot = { dc: dc, phan: 'mep', A: m[0], B: m[1] }; } });
        if (H.cong) { var Qc = ganCong(H.cong, L), dc2 = Math.hypot(Qc.x - L.x, Qc.y - L.y); if (dc2 < d0) { d0 = dc2; tot = { dc: dc, phan: 'mep', cong: H.cong }; } }
        if (tot) return tot;
      }
      if (trongDaGiac(H.than, L)) return (dc.loai === 'parabol' ? dc.dauCoDinh != null : dc.ghim) ? { dc: dc, phan: 'xoay', tam: raTG(dc, H.ghim.x, H.ghim.y), quaThan: true } : { dc: dc, phan: 'than' };
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
    if (dc.loai === 'compa') { veCompa(c, dc, px); c.restore(); veNutTL(c, dc, px); return; }
    var H = hinhDang(dc), px0 = px;
    c.translate(dc.x, dc.y); c.rotate(dc.goc); c.scale(tl(dc), tl(dc)); px = px / tl(dc);
    // thân trong suốt màu vàng nhạt
    c.beginPath(); H.than.forEach(function (P, i) { i ? c.lineTo(P.x, P.y) : c.moveTo(P.x, P.y); }); c.closePath();
    c.fillStyle = MAU_THAN; c.fill(); c.strokeStyle = MAU_VIEN; c.lineWidth = 1.4 * px; c.stroke();
    c.strokeStyle = MAU_VACH; c.fillStyle = MAU_VACH;
    var coSo = Math.max(9 * px, 0.32 * CM);
    if (dc.loai === 'thuoc') {
      for (var mm = 0; mm <= 200; mm++) { var x = mm * CM / 10, dai = mm % 10 === 0 ? 0.6 : mm % 5 === 0 ? 0.42 : 0.26; c.lineWidth = (mm % 10 === 0 ? 1.3 : 0.9) * px; c.beginPath(); c.moveTo(x, 0); c.lineTo(x, dai * CM); c.stroke(); }
      c.font = '600 ' + coSo + 'px Arial'; c.textAlign = 'center'; c.textBaseline = 'top';
      for (var cm = 0; cm <= 20; cm++) c.fillText(String(cm), cm * CM, 0.68 * CM);
      c.font = (coSo * 0.8) + 'px Arial'; c.textAlign = 'left'; c.fillText('cm', 0.15 * CM, 1.9 * CM);
    } else if (dc.loai === 'doDo') {
      var R2 = R_DO - 2.25 * CM, R3 = 1.25 * CM;
      // vạch chia từng độ ở vành ngoài, vạch 10° nối vào vòng trong
      for (var g = 0; g <= 180; g++) {
        var a = Math.PI + g * Math.PI / 180, ca = Math.cos(a), sa = Math.sin(a), d1 = g % 10 === 0 ? 0.7 : g % 5 === 0 ? 0.48 : 0.3;
        c.lineWidth = (g % 10 === 0 ? 1.2 : 0.75) * px; c.beginPath(); c.moveTo(R_DO * ca, R_DO * sa); c.lineTo((R_DO - d1 * CM) * ca, (R_DO - d1 * CM) * sa); c.stroke();
        if (g % 5 === 0) { var d2 = g % 10 === 0 ? 0.35 : 0.2; c.lineWidth = 0.75 * px; c.beginPath(); c.moveTo(R2 * ca, R2 * sa); c.lineTo((R2 + d2 * CM) * ca, (R2 + d2 * CM) * sa); c.stroke(); }
        if (g % 10 === 0 && g > 0 && g < 180) { c.lineWidth = 0.7 * px; c.beginPath(); c.moveTo(R3 * ca, R3 * sa); c.lineTo(R2 * ca, R2 * sa); c.stroke(); }
      }
      c.lineWidth = 0.9 * px; c.beginPath(); c.arc(0, 0, R2, Math.PI, 0); c.stroke(); c.beginPath(); c.arc(0, 0, R3, Math.PI, 0); c.stroke();
      // hai hàng số: ngoài (đỏ) 0 → 180 từ trái, trong (đen) 180 → 0
      c.textAlign = 'center'; c.textBaseline = 'middle';
      for (var g2 = 0; g2 <= 180; g2 += 10) {
        var a2 = Math.PI + g2 * Math.PI / 180, r1 = R_DO - 1.05 * CM, r2 = R_DO - 1.7 * CM;
        c.font = (g2 === 90 ? '700 ' + coSo * 1.25 : '600 ' + coSo * 0.95) + 'px Arial';
        c.save(); c.translate(r1 * Math.cos(a2), r1 * Math.sin(a2)); c.rotate(a2 + Math.PI / 2); c.fillStyle = '#DC2626'; c.fillText(String(g2), 0, 0); c.restore();
        if (g2 !== 90) { c.save(); c.font = '600 ' + coSo * 0.8 + 'px Arial'; c.translate(r2 * Math.cos(a2), r2 * Math.sin(a2)); c.rotate(a2 + Math.PI / 2); c.fillStyle = '#111827'; c.fillText(String(180 - g2), 0, 0); c.restore(); }
      }
      // đường kính, dấu tâm, dải thước cm ở đáy (0 ở tâm)
      c.lineWidth = 1 * px; c.beginPath(); c.moveTo(-R_DO, 0); c.lineTo(R_DO, 0); c.moveTo(0, 0); c.lineTo(0, -R3); c.stroke();
      for (var m = -55; m <= 55; m++) { var xm = m * CM / 10, dm = m % 10 === 0 ? 0.42 : m % 5 === 0 ? 0.3 : 0.18; c.lineWidth = 0.7 * px; c.beginPath(); c.moveTo(xm, DAY_DO); c.lineTo(xm, DAY_DO - dm * CM); c.stroke(); }
      c.font = '600 ' + coSo * 0.75 + 'px Arial'; c.textBaseline = 'bottom'; c.fillStyle = '#111827';
      for (var k0 = -5; k0 <= 5; k0++) c.fillText(String(Math.abs(k0)), k0 * CM, DAY_DO - 0.42 * CM);
    } else if (dc.loai === 'eke30' || dc.loai === 'eke45') {
      var e = cacEke(dc.loai);
      for (var m1 = 0; m1 * CM / 10 <= e.L1 - 0.4 * CM; m1++) { var x1 = m1 * CM / 10, dd1 = m1 % 10 === 0 ? 0.45 : m1 % 5 === 0 ? 0.32 : 0.2; c.lineWidth = 0.8 * px; c.beginPath(); c.moveTo(x1, 0); c.lineTo(x1, -dd1 * CM); c.stroke(); }
      for (var m2 = 0; m2 * CM / 10 <= e.L2 - 0.4 * CM; m2++) { var y2 = -m2 * CM / 10, dd2 = m2 % 10 === 0 ? 0.45 : m2 % 5 === 0 ? 0.32 : 0.2; c.lineWidth = 0.8 * px; c.beginPath(); c.moveTo(0, y2); c.lineTo(dd2 * CM, y2); c.stroke(); }
      c.font = (coSo * 0.8) + 'px Arial'; c.textAlign = 'center'; c.textBaseline = 'bottom';
      for (var k1 = 1; k1 * CM <= e.L1 - 0.6 * CM; k1++) c.fillText(String(k1), k1 * CM, -0.5 * CM);
      c.textAlign = 'left'; c.textBaseline = 'middle'; for (var k2 = 1; k2 * CM <= e.L2 - 0.6 * CM; k2++) c.fillText(String(k2), 0.55 * CM, -k2 * CM);
      var kk = 0.42; c.beginPath(); c.moveTo(e.L1 * 0.2, -e.L2 * 0.2); c.lineTo(e.L1 * (0.2 + kk), -e.L2 * 0.2); c.lineTo(e.L1 * 0.2, -e.L2 * (0.2 + kk)); c.closePath(); c.lineWidth = 1 * px; c.strokeStyle = MAU_VIEN; c.stroke();
      c.strokeStyle = MAU_VACH; c.beginPath(); c.moveTo(0.6 * CM, 0); c.lineTo(0.6 * CM, -0.6 * CM); c.lineTo(0, -0.6 * CM); c.stroke();
      c.font = '600 ' + (coSo * 0.85) + 'px Arial'; c.textAlign = 'center'; c.fillText(dc.loai === 'eke45' ? '45°' : '30°', e.L1 * 0.78, -e.L2 * 0.09);
    } else if (dc.loai === 'parabol') {
      // khe cong bên trong và lỗ tròn gần đáy (như thước thật)
      c.lineCap = 'round'; c.strokeStyle = MAU_VIEN;
      var khe = khePB(); c.beginPath(); khe.forEach(function (P, i) { if (i) c.lineTo(P.x, P.y); else c.moveTo(P.x, P.y); }); c.closePath();
      c.fillStyle = 'rgba(255,255,255,.85)'; c.fill(); c.lineWidth = 1.3 * px; c.stroke();
      c.beginPath(); c.arc(PB_LO.x * CM, PB_LO.y * CM, PB_LO.r * CM, 0, Math.PI * 2); c.fill(); c.stroke();
    }
    var viTriSo = H.xoay;
    if (H.dau) {
      // thước parabol: điểm cố định tô xanh; điểm còn lại có vòng mũi tên để kéo xoay
      H.dau.forEach(function (D, j) {
        var coDinh = dc.dauCoDinh === j, quay = dc.dauCoDinh != null && !coDinh;
        if (coDinh) { c.beginPath(); c.arc(D.x, D.y, 12 * px, 0, Math.PI * 2); c.strokeStyle = 'rgba(37,99,235,.35)'; c.lineWidth = 4 * px; c.stroke(); }
        c.beginPath(); c.arc(D.x, D.y, (coDinh ? 7 : 6) * px, 0, Math.PI * 2); c.fillStyle = coDinh ? '#2563EB' : '#FFFFFF'; c.fill(); c.strokeStyle = '#2563EB'; c.lineWidth = 2 * px; c.stroke();
        if (quay) { c.beginPath(); c.arc(D.x, D.y, 12 * px, -Math.PI * 0.85, Math.PI * 0.55); c.strokeStyle = '#2563EB'; c.lineWidth = 1.8 * px; c.stroke(); viTriSo = D; }
      });
      if (!viTriSo) viTriSo = H.dau[1];
    } else {
      // điểm cố định (ghim): bấm để ghim, đã ghim thì kéo thân là quay quanh điểm này
      c.beginPath(); c.arc(H.ghim.x, H.ghim.y, (dc.ghim ? 6.5 : 5) * px, 0, Math.PI * 2); c.fillStyle = dc.ghim ? '#DC2626' : '#FFFFFF'; c.fill(); c.strokeStyle = '#DC2626'; c.lineWidth = 2 * px; c.stroke();
      if (dc.ghim) { c.beginPath(); c.arc(H.ghim.x, H.ghim.y, 11 * px, 0, Math.PI * 2); c.strokeStyle = 'rgba(220,38,38,.4)'; c.lineWidth = 3 * px; c.stroke(); }
      // nút xoay
      c.beginPath(); c.arc(H.xoay.x, H.xoay.y, 13 * px, 0, Math.PI * 2); c.fillStyle = '#FFFFFF'; c.fill(); c.strokeStyle = '#2457C5'; c.lineWidth = 1.5 * px; c.stroke();
      c.beginPath(); c.arc(H.xoay.x, H.xoay.y, 7 * px, -Math.PI * 0.85, Math.PI * 0.55); c.lineWidth = 1.8 * px; c.stroke();
    }
    c.restore(); px = px0;
    veNutTL(c, dc, px);
    if (dangXoay) {   // số đo góc quay
      var X0 = raTG(dc, viTriSo.x, viTriSo.y), deg = ((dc.goc * 180 / Math.PI) % 360 + 360) % 360;
      c.save(); c.font = '700 ' + (15 * px) + 'px Arial'; var txt = soVN(Math.round(deg * 10) / 10) + '°', w = c.measureText(txt).width + 14 * px;
      c.fillStyle = '#1F2937'; c.fillRect(X0.x + 18 * px, X0.y - 12 * px, w, 24 * px); c.fillStyle = '#fff'; c.textBaseline = 'middle'; c.fillText(txt, X0.x + 25 * px, X0.y); c.restore();
    }
  }
  function veCompa(c, dc, px) {
    var C = compa(dc), k = tl(dc);
    // chân kim (xám) và chân bút (xanh, đầu bút chì)
    c.lineCap = 'round';
    c.strokeStyle = '#64748B'; c.lineWidth = 0.32 * CM * k; c.beginPath(); c.moveTo(C.H.x, C.H.y); c.lineTo(C.K.x + (C.H.x - C.K.x) * 0.12, C.K.y + (C.H.y - C.K.y) * 0.12); c.stroke();
    c.strokeStyle = '#94A3B8'; c.lineWidth = 0.1 * CM * k; c.beginPath(); c.moveTo(C.K.x + (C.H.x - C.K.x) * 0.12, C.K.y + (C.H.y - C.K.y) * 0.12); c.lineTo(C.K.x, C.K.y); c.stroke();
    c.strokeStyle = '#2563EB'; c.lineWidth = 0.32 * CM * k; c.beginPath(); c.moveTo(C.H.x, C.H.y); c.lineTo(C.P.x + (C.H.x - C.P.x) * 0.22, C.P.y + (C.H.y - C.P.y) * 0.22); c.stroke();
    c.strokeStyle = '#F5C451'; c.lineWidth = 0.22 * CM * k; c.beginPath(); c.moveTo(C.P.x + (C.H.x - C.P.x) * 0.22, C.P.y + (C.H.y - C.P.y) * 0.22); c.lineTo(C.P.x + (C.H.x - C.P.x) * 0.05, C.P.y + (C.H.y - C.P.y) * 0.05); c.stroke();
    c.strokeStyle = '#1F2937'; c.lineWidth = 0.1 * CM * k; c.beginPath(); c.moveTo(C.P.x + (C.H.x - C.P.x) * 0.05, C.P.y + (C.H.y - C.P.y) * 0.05); c.lineTo(C.P.x, C.P.y); c.stroke();
    // khớp và núm cầm
    c.fillStyle = '#334155'; c.beginPath(); c.arc(C.H.x, C.H.y, 0.32 * CM * k, 0, Math.PI * 2); c.fill();
    c.strokeStyle = '#334155'; c.lineWidth = 0.18 * CM * k; c.beginPath(); c.moveTo(C.H.x, C.H.y); c.lineTo(C.N.x, C.N.y); c.stroke();
    c.fillStyle = '#7A1E1E'; c.beginPath(); c.arc(C.N.x, C.N.y, 0.36 * CM * k, 0, Math.PI * 2); c.fill();
    // đầu kim, đầu bút: vòng tròn tay nắm; bán kính
    c.lineWidth = 1.4 * px; c.strokeStyle = '#2457C5'; c.setLineDash([]);
    [C.K, C.P].forEach(function (Q) { c.beginPath(); c.arc(Q.x, Q.y, 7 * px, 0, Math.PI * 2); c.stroke(); });
    c.save(); c.setLineDash([4 * px, 4 * px]); c.strokeStyle = 'rgba(37,87,197,.6)'; c.beginPath(); c.moveTo(C.K.x, C.K.y); c.lineTo(C.P.x, C.P.y); c.stroke(); c.restore();
    var txt = 'r = ' + soVN(Math.round(dc.r / CM * 10) / 10) + ' cm';
    c.font = '700 ' + (14 * px) + 'px Arial'; var w = c.measureText(txt).width + 12 * px, Mx = (C.K.x + C.P.x) / 2 - w / 2, My = (C.K.y + C.P.y) / 2 + 10 * px;
    c.fillStyle = 'rgba(255,255,255,.9)'; c.fillRect(Mx, My, w, 22 * px); c.fillStyle = '#1D4ED8'; c.textBaseline = 'middle'; c.fillText(txt, Mx + 6 * px, My + 11 * px);
  }
  return { TEN: TEN, CM: CM, tao: tao, tim: tim, chieuMep: chieuMep, ve: ve, compa: compa, CHAN: CHAN_COMPA, doiTiLe: doiTiLe, buocTiLe: buocTiLe, tiLe: tl };
})();
