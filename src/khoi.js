// Hình không gian vẽ theo phép chiếu song song (kiểu sách giáo khoa): mặt trước giữ nguyên hình dạng,
// chiều sâu vẽ xiên góc alpha, thu ngắn k lần. Cạnh khuất vẽ nét đứt.
//   o = { loai: 'khoi', dang, x, y (tâm đáy trên bảng), a, b, c (kích thước, đơn vị thế giới), xoay (độ), alpha (độ) }
//   dang: hop, lapPhuong, lang3, lang4, chop3, chop4, tru, non, cau
window.GI = window.GI || {};
GI.khoi = (function () {
  var K = 0.5;   // hệ số thu ngắn chiều sâu
  var TEN = {
    hop: 'Hình hộp chữ nhật', lapPhuong: 'Hình lập phương', lang3: 'Lăng trụ đứng tam giác', lang4: 'Lăng trụ đứng tứ giác',
    chop3: 'Hình chóp tam giác đều', chop4: 'Hình chóp tứ giác đều', tru: 'Hình trụ', non: 'Hình nón', cau: 'Hình cầu',
    tuDoChop: 'Hình chóp', tuDoLang: 'Hình lăng trụ',
  };
  var MAC_DINH = {
    hop: { a: 200, b: 140, c: 130 }, lapPhuong: { a: 150, b: 150, c: 150 }, lang3: { a: 190, b: 140, c: 170 }, lang4: { a: 190, b: 130, c: 150 },
    chop3: { a: 190, b: 0, c: 190 }, chop4: { a: 180, b: 0, c: 190 }, tru: { a: 90, b: 0, c: 170 }, non: { a: 100, b: 0, c: 180 }, cau: { a: 100, b: 0, c: 0 },
  };
  function moi(dang, x, y) { var m = MAC_DINH[dang]; return { loai: 'khoi', dang: dang, x: x, y: y, a: m.a, b: m.b, c: m.c, xoay: 0, alpha: 40 }; }

  // Mô hình 3D: đỉnh (X, Y lên trên, Z vào sâu), mặt (chỉ số đỉnh), tên đỉnh, cạnh phụ (nét đứt luôn)
  function moHinh(o) {
    var a = o.a, b = o.b, c = o.c, d = o.dang;
    if (d === 'tuDoChop' || d === 'tuDoLang') {   // đa diện dựng bằng cách bấm đỉnh: o.dinh3 (toạ độ 3D), o.mat (mặt), o.tenDinh
      var day = o.mat[0].map(function (i) { return o.dinh3[i]; }), M = { dinh: o.dinh3, mat: o.mat, ten: o.tenDinh, tamDay: tam(day) };
      if (d === 'tuDoChop' && o.chan) { M.chan = o.chan; M.phu = o.chanTrung != null ? [] : [{ a: o.dinh3.length - 1, b: 'H' }]; M.O = true; M.tenO = o.chanTrung != null ? null : 'H'; }
      if (d === 'tuDoLang' && o.dung) M.vuong = true;
      return M;
    }
    if (d === 'lapPhuong') { b = a; c = a; }
    if (d === 'hop' || d === 'lapPhuong' || d === 'lang4') {
      var s = d === 'lang4' ? Math.min(a * 0.22, 40) : 0;   // lăng trụ tứ giác: đáy là hình thang
      var day = [[0, 0, 0], [a, 0, 0], [a - s, 0, b], [s, 0, b]];
      return lang(day, c, ['A', 'B', 'C', 'D']);
    }
    if (d === 'lang3') return lang([[0, 0, 0], [a, 0, 0], [a * 0.42, 0, b]], c, ['A', 'B', 'C']);
    if (d === 'chop3' || d === 'chop4') {
      var dayC = d === 'chop4' ? [[0, 0, 0], [a, 0, 0], [a, 0, a], [0, 0, a]] : [[0, 0, 0], [a, 0, 0], [a / 2, 0, a * Math.sqrt(3) / 2]];
      var g = tam(dayC), n = dayC.length;
      var dinh = dayC.concat([[g[0], c, g[2]]]), mat = [dayC.map(function (_, i) { return i; })];
      for (var i = 0; i < n; i++) mat.push([i, (i + 1) % n, n]);
      var ten = (n === 4 ? ['A', 'B', 'C', 'D'] : ['A', 'B', 'C']).concat(['S']);
      var phu = [{ a: n, b: 'O' }];   // đường cao SO
      if (n === 4) phu.push({ a: 0, b: 2 }, { a: 1, b: 3 }); else for (var j = 0; j < 3; j++) phu.push({ a: j, b: 'O' });
      return { dinh: dinh, mat: mat, ten: ten, tamDay: g, phu: phu, O: true };
    }
    return null;
  }
  function tam(ds) { var g = [0, 0, 0]; ds.forEach(function (p) { g[0] += p[0]; g[1] += p[1]; g[2] += p[2]; }); return [g[0] / ds.length, g[1] / ds.length, g[2] / ds.length]; }
  function lang(day, c, ten) {
    var n = day.length, tren = day.map(function (p) { return [p[0], c, p[2]]; }), mat = [];
    mat.push(day.map(function (_, i) { return i; })); mat.push(tren.map(function (_, i) { return i + n; }));
    for (var i = 0; i < n; i++) mat.push([i, (i + 1) % n, (i + 1) % n + n, i + n]);
    return { dinh: day.concat(tren), mat: mat, ten: ten.concat(ten.map(function (t) { return t + "'"; })), tamDay: tam(day), vuong: true };
  }

  // Phép chiếu: quay quanh trục đứng qua tâm đáy rồi chiếu xiên
  function boChieu(o, g) {
    var q = (o.xoay || 0) * Math.PI / 180, al = (o.alpha == null ? 40 : o.alpha) * Math.PI / 180, cq = Math.cos(q), sq = Math.sin(q);
    var ng = (o.nghieng || 0) * Math.PI / 180, cn = Math.cos(ng), sn = Math.sin(ng);
    // quay quanh trục đứng (xoay) rồi nghiêng quanh trục ngang (nghieng)
    function quay(p) { var x = p[0] - g[0], z = p[2] - g[2], y = p[1], x1 = x * cq - z * sq, z1 = x * sq + z * cq; return [x1, y * cn + z1 * sn, -y * sn + z1 * cn]; }
    function chieu(p) { var r = quay(p); return { x: o.x + r[0] + K * r[2] * Math.cos(al), y: o.y - r[1] - K * r[2] * Math.sin(al) }; }
    var huong = [-K * Math.cos(al), -K * Math.sin(al), 1];   // hướng nhìn
    return { quay: quay, chieu: chieu, huong: huong, al: al, q: q };
  }
  function tru3(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
  function nhan3(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
  function vh(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }

  function tinh(o) {
    var d = o.dang, tp = tienDoTrai(o);
    if (tp > 0 && d !== 'cau') return tinhTrai(o, tp);
    if (d === 'tru' || d === 'non' || d === 'cau') return tinhTron(o);
    var M = moHinh(o); if (!M) return null;
    var B = boChieu(o, M.tamDay), R = M.dinh.map(B.quay), G = tam(R);
    var thay = M.mat.map(function (f) {
      var n = nhan3(tru3(R[f[1]], R[f[0]]), tru3(R[f[2]], R[f[0]])), cm = tam(f.map(function (i) { return R[i]; }));
      if (vh(n, tru3(cm, G)) < 0) n = [-n[0], -n[1], -n[2]];
      return vh(n, B.huong) < -1e-9;
    });
    var P = M.dinh.map(B.chieu), canh = {}, ds = [];
    M.mat.forEach(function (f, fi) {
      for (var i = 0; i < f.length; i++) {
        var u = f[i], v = f[(i + 1) % f.length], k = Math.min(u, v) + '-' + Math.max(u, v);
        if (!canh[k]) canh[k] = { a: u, b: v, thay: false };
        if (thay[fi]) canh[k].thay = true;
      }
    });
    Object.keys(canh).forEach(function (k) { var e = canh[k]; ds.push({ p: P[e.a], q: P[e.b], an: !e.thay }); });
    // đỉnh khuất: không thuộc mặt nhìn thấy nào
    var dinhThay = M.dinh.map(function () { return false; });
    M.mat.forEach(function (f, fi) { if (thay[fi]) f.forEach(function (i) { dinhThay[i] = true; }); });
    var gC = { x: 0, y: 0 }; P.forEach(function (p) { gC.x += p.x / P.length; gC.y += p.y / P.length; });
    var dinh = P.map(function (p, i) { return { ten: M.ten[i], P: p, an: !dinhThay[i] }; });
    var Oc = B.chieu(M.chan || M.tamDay);
    if (M.O) {
      if (M.tenO !== null) dinh.push({ ten: M.tenO || 'O', P: Oc, an: true, phu: true });
      M.phu.forEach(function (e) { var p1 = e.a === 'O' || e.a === 'H' ? Oc : P[e.a], q1 = e.b === 'O' || e.b === 'H' ? Oc : P[e.b]; ds.push({ p: p1, q: q1, an: true, phu: true }); });
    }
    // các mặt (để tô màu): sắp xa → gần theo chiều nhìn
    var soDay = d === 'tuDoLang' || /^(hop|lapPhuong|lang3|lang4)$/.test(d) ? 2 : 1;   // lăng trụ: 2 đáy (mặt 0, 1); chóp: 1 đáy (mặt 0)
    var mat = M.mat.map(function (f, fi) { var sau = vh(tam(f.map(function (i) { return R[i]; })), B.huong); return { pts: f.map(function (i) { return P[i]; }), thay: thay[fi], sau: sau, day: fi < soDay }; });
    mat.sort(function (u, w) { return w.sau - u.sau; });
    var n = M.dinh.length, vuong = [];
    if (M.vuong) { var nn = n / 2; vuong.push({ o: P[0], u1: donVi(P[1], P[0]), u2: donVi(P[nn], P[0]) }); }
    if (M.chan && o.hienCao !== false) { var nd = M.mat[0][0]; vuong.push({ o: Oc, u1: donVi(P[n - 1], Oc), u2: donVi(P[o.chanTrung != null ? (o.chanTrung + 1) % (n - 1) : nd], Oc) }); }
    // tay nắm: điểm kéo + tham số thay đổi
    var tay = [];
    if (d === 'tuDoChop' || d === 'tuDoLang') { }   // dựng tự do: không có tay nắm đổi kích thước
    else if (d === 'chop3' || d === 'chop4') { tay.push({ ts: 'a', P: P[1] }, { ts: 'c', P: P[n - 1] }); }
    else if (d === 'lapPhuong') tay.push({ ts: 'a', P: P[1] });
    else { var m2 = n / 2; tay.push({ ts: 'a', P: P[1] }, { ts: 'b', P: P[m2 - 1] }, { ts: 'c', P: P[m2] }); }
    var kq = ketQua(o, ds, [], dinh, tay, vuong, P.concat([Oc])); kq.mat = mat; return kq;
  }
  function donVi(P, Q) { var x = P.x - Q.x, y = P.y - Q.y, l = Math.hypot(x, y) || 1; return { x: x / l, y: y / l }; }

  // Trụ, nón, cầu
  function tinhTron(o) {
    var r = o.a, h = o.c, al = (o.alpha == null ? 40 : o.alpha) * Math.PI / 180, q = (o.xoay || 0) * Math.PI / 180;
    // trụ, nón, cầu: đường tròn đáy vẽ thành elip nằm ngang (độ dẹt theo góc nhìn), kiểu sách giáo khoa
    var dep = 0.32 * Math.sin(al) / Math.sin(40 * Math.PI / 180);
    var B = { q: q, chieu: function (p) { var x = p[0] * Math.cos(q) - p[2] * Math.sin(q), z = p[0] * Math.sin(q) + p[2] * Math.cos(q); return { x: o.x + x, y: o.y - p[1] - z * dep }; } };
    function vong(y, t) { return B.chieu([r * Math.cos(t), y, r * Math.sin(t)]); }
    // điểm có hoành độ màn hình lớn / nhỏ nhất trên đường tròn đáy (sau khi quay chỉ đổi vị trí điểm, hình không đổi)
    var tE = -B.q, ds = [], cong = [], dinh = [], tay = [], pts = [];
    function cung(y, t0, t1, an) { var p = []; for (var i = 0; i <= 48; i++) p.push(vong(y, t0 + (t1 - t0) * i / 48)); cong.push({ pts: p, an: an }); pts.push.apply(pts, p); }
    function zMan(t) { return r * Math.sin(t + B.q); }   // độ sâu sau khi quay
    function chiaDay(y, tA, tB, anSau) {   // tách đường tròn thành cung trước (liền) và cung sau (đứt nếu anSau)
      var m = (tA + tB) / 2, truoc = zMan(m) < 0;
      cung(y, tA, tB, anSau && !truoc); cung(y, tB, tA + 2 * Math.PI, anSau && truoc);
    }
    var O = B.chieu([0, 0, 0]), A = vong(0, -B.q);   // A: điểm trên đường tròn đáy, nằm bên phải tâm
    if (o.dang === 'tru') {
      var O2 = B.chieu([0, h, 0]);
      chiaDay(0, tE, tE + Math.PI, true); cung(h, 0, 2 * Math.PI, false);
      ds.push({ p: vong(0, tE), q: vong(h, tE), an: false }, { p: vong(0, tE + Math.PI), q: vong(h, tE + Math.PI), an: false });
      ds.push({ p: O, q: O2, an: true, phu: true }, { p: O, q: A, an: true, phu: true });
      dinh.push({ ten: 'O', P: O, an: true }, { ten: "O'", P: O2, an: false }, { ten: 'A', P: A, an: false });
      tay.push({ ts: 'a', P: A }, { ts: 'c', P: O2 });
    } else if (o.dang === 'non') {
      var S = B.chieu([0, h, 0]), tt = [], ff = function (t) { var E = vong(0, t), dE = { x: -r * Math.sin(t), y: 0 }; var E2 = vong(0, t + 1e-4); dE = { x: E2.x - E.x, y: E2.y - E.y }; return (E.x - S.x) * dE.y - (E.y - S.y) * dE.x; };
      var N = 360, f0 = ff(0);
      for (var i = 1; i <= N; i++) { var t = i / N * 2 * Math.PI, f1 = ff(t); if (f0 * f1 < 0) tt.push(t - Math.PI / N); f0 = f1; }
      if (tt.length >= 2) {
        chiaDay(0, tt[0], tt[1], true);
        ds.push({ p: S, q: vong(0, tt[0]), an: false }, { p: S, q: vong(0, tt[1]), an: false });
      } else cung(0, 0, 2 * Math.PI, false);
      ds.push({ p: S, q: O, an: true, phu: true }, { p: O, q: A, an: true, phu: true });
      dinh.push({ ten: 'S', P: S, an: false }, { ten: 'O', P: O, an: true }, { ten: 'A', P: A, an: false });
      tay.push({ ts: 'a', P: A }, { ts: 'c', P: S });
    } else {   // cầu: đường viền + đường xích đạo (nửa sau nét đứt)
      var vien = []; for (var j = 0; j <= 96; j++) { var tv = j / 96 * 2 * Math.PI; vien.push({ x: O.x + r * Math.cos(tv), y: O.y + r * Math.sin(tv) }); }
      cong.push({ pts: vien, an: false }); pts.push.apply(pts, vien);
      chiaDay(0, tE, tE + Math.PI, true);
      ds.push({ p: O, q: A, an: true, phu: true });
      dinh.push({ ten: 'O', P: O, an: false }, { ten: 'A', P: A, an: false });
      tay.push({ ts: 'a', P: A });
    }
    pts.push(O);
    return ketQua(o, ds, cong, dinh, tay, [], pts);
  }

  // ===== Trải phẳng (hình khai triển) =====
  //   o.trai = true: hình đang trải; o._tp: tiến độ 0 → 1 trong lúc chạy hiệu ứng (không cần lưu)
  function tienDoTrai(o) { return o._tp != null ? o._tp : (o.trai ? 1 : 0); }
  function em(t) { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t); }
  function chuan3(a) { var l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; }
  // phép quay quanh trục đi qua P, hướng e (đơn vị), góc t: dạng { R (3x3), t (3) }
  function phepQuay(P, e, g) {
    var c = Math.cos(g), s = Math.sin(g), C = 1 - c, x = e[0], y = e[1], z = e[2];
    var R = [[c + x * x * C, x * y * C - z * s, x * z * C + y * s], [y * x * C + z * s, c + y * y * C, y * z * C - x * s], [z * x * C - y * s, z * y * C + x * s, c + z * z * C]];
    var RP = apR(R, P); return { R: R, t: [P[0] - RP[0], P[1] - RP[1], P[2] - RP[2]] };
  }
  function apR(R, p) { return [R[0][0] * p[0] + R[0][1] * p[1] + R[0][2] * p[2], R[1][0] * p[0] + R[1][1] * p[1] + R[1][2] * p[2], R[2][0] * p[0] + R[2][1] * p[1] + R[2][2] * p[2]]; }
  function ap(T, p) { var q = apR(T.R, p); return [q[0] + T.t[0], q[1] + T.t[1], q[2] + T.t[2]]; }
  function ghep(A, B) {   // A sau B
    var R = [0, 1, 2].map(function (i) { return [0, 1, 2].map(function (j) { return A.R[i][0] * B.R[0][j] + A.R[i][1] * B.R[1][j] + A.R[i][2] * B.R[2][j]; }); });
    var t = apR(A.R, B.t); return { R: R, t: [t[0] + A.t[0], t[1] + A.t[1], t[2] + A.t[2]] };
  }
  var DONG = { R: [[1, 0, 0], [0, 1, 0], [0, 0, 1]], t: [0, 0, 0] };
  function tinhTrai(o, tp) {
    if (o.dang === 'tru' || o.dang === 'non') return traiTron(o, tp);
    var M = moHinh(o); if (!M) return null;
    var V = M.dinh, G = tam(V), F = M.mat, nF = F.length;
    var phap = F.map(function (f) {   // pháp tuyến hướng ra ngoài
      var n = chuan3(nhan3(tru3(V[f[1]], V[f[0]]), tru3(V[f[2]], V[f[0]]))), cm = tam(f.map(function (i) { return V[i]; }));
      return vh(n, tru3(cm, G)) < 0 ? [-n[0], -n[1], -n[2]] : n;
    });
    // cây trải: mặt đáy (mặt 0) đứng yên, mỗi mặt khác quay quanh cạnh chung với mặt cha cho tới khi nằm cùng mặt phẳng
    var u = em(tp / 0.75), cha = [], bien = [-1], hang = [0], T = [DONG];
    for (var i = 1; i < nF; i++) bien.push(null);
    while (hang.length) {
      var p = hang.shift(), fp = F[p];
      for (var j = 0; j < nF; j++) {
        if (bien[j] !== null) continue;
        var fj = F[j], chung = null;
        for (var a = 0; a < fp.length && !chung; a++) { var x1 = fp[a], x2 = fp[(a + 1) % fp.length]; if (fj.indexOf(x1) >= 0 && fj.indexOf(x2) >= 0) chung = [x1, x2]; }
        if (!chung) continue;
        bien[j] = p; cha[j] = chung; hang.push(j);
        var e = chuan3(tru3(V[chung[1]], V[chung[0]])), goc = Math.acos(Math.max(-1, Math.min(1, vh(phap[j], phap[p]))));
        var thu = apR(phepQuay([0, 0, 0], e, goc).R, phap[j]); if (vh(thu, phap[p]) < 0.999) goc = -goc;
        T[j] = ghep(T[p], phepQuay(V[chung[0]], e, goc * u));
      }
    }
    // nhìn dần từ trên xuống để thấy hình trải đúng hình dạng
    var w = em((tp - 0.35) / 0.65), o2 = {}; for (var k in o) o2[k] = o[k];
    o2.nghieng = (o.nghieng || 0) * (1 - w) + 90 * w;
    var B = boChieu(o2, M.tamDay), soDay = o.dang === 'tuDoLang' || /^(hop|lapPhuong|lang3|lang4)$/.test(o.dang) ? 2 : 1;
    var mat = [], nhan = [], pts = [];
    F.forEach(function (f, fi) {
      var Q = f.map(function (i) { return ap(T[fi] || DONG, V[i]); }), R = Q.map(B.quay), P = Q.map(B.chieu);
      mat.push({ pts: P, vien: f.map(function () { return true; }), day: fi < soDay, sau: vh(tam(R), B.huong) });
      P.forEach(function (q, k2) { pts.push(q); if (!nhan.some(function (d) { return d.ten === M.ten[f[k2]] && Math.hypot(d.P.x - q.x, d.P.y - q.y) < 3; })) nhan.push({ ten: M.ten[f[k2]], P: q, an: false }); });
    });
    mat.sort(function (a, b) { return b.sau - a.sau; });
    var kq = ketQua(o, [], [], nhan, [], [], pts); kq.trai = mat; kq.tp = tp; return kq;
  }
  // Trụ: cắt theo đường sinh phía sau, mặt xung quanh duỗi dần thành hình chữ nhật nằm trên mặt phẳng tiếp xúc phía trước,
  //      hai đáy lật quanh tiếp tuyến tại điểm tiếp xúc. Nón: mặt xung quanh mở dần thành hình quạt (giữ nguyên đường sinh l).
  function traiTron(o, tp) {
    var r = o.a, h = o.c, al = (o.alpha == null ? 40 : o.alpha) * Math.PI / 180, dep = 0.32 * Math.sin(al) / Math.sin(40 * Math.PI / 180);
    var u = Math.min(em(tp), 0.99995), N = 64, mat = [], nhan = [], pts = [], so = [];
    function chieu(p) { return { x: o.x + p[0], y: o.y - p[1] - p[2] * dep }; }
    function them(Q, vien, day) { var P = Q.map(chieu); P.forEach(function (q) { pts.push(q); }); mat.push({ pts: P, vien: vien, day: day, sau: tam(Q)[2] }); }
    function dia(tamD, d1, d2) { var Q = []; for (var i = 0; i < N; i++) { var t = i / N * 2 * Math.PI; Q.push([tamD[0] + r * (Math.cos(t) * d1[0] + Math.sin(t) * d2[0]), tamD[1] + r * (Math.cos(t) * d1[1] + Math.sin(t) * d2[1]), tamD[2] + r * (Math.cos(t) * d1[2] + Math.sin(t) * d2[2])]); } return Q; }
    function tatCa(n) { var v = []; for (var i = 0; i < n; i++) v.push(true); return v; }
    if (o.dang === 'tru') {
      var rho = r / (1 - u);
      var B = function (ph, y) { var s = r * ph; return [rho * Math.sin(s / rho), y, -r + rho - rho * Math.cos(s / rho)]; };
      for (var i = 0; i < N; i++) {
        var a = -Math.PI + 2 * Math.PI * i / N, b = -Math.PI + 2 * Math.PI * (i + 1) / N;
        them([B(a, 0), B(b, 0), B(b, h), B(a, h)], [true, i === N - 1, true, i === 0], false);
      }
      var be = Math.PI / 2 * em(tp), cb = Math.cos(be), sb = Math.sin(be);
      // đáy dưới: lật xuống quanh tiếp tuyến tại (0, 0, −r); đáy trên: lật lên quanh tiếp tuyến tại (0, h, −r)
      var O1 = [0, -r * sb, -r + r * cb], O2 = [0, h + r * sb, -r + r * cb];
      them(dia(O1, [1, 0, 0], [0, -sb, cb]), tatCa(N), true); them(dia(O2, [1, 0, 0], [0, sb, cb]), tatCa(N), true);
      nhan.push({ ten: 'O', P: chieu(O1), an: false }, { ten: "O'", P: chieu(O2), an: false });
      if (tp > 0.97) so.push({ nd: '2πr', P: chieu([-Math.PI * r / 2, -16, -r]) }, { nd: 'h', P: chieu([Math.PI * r + 16, h / 2, -r]) });
    } else {
      var l = Math.hypot(r, h), g0 = Math.asin(r / l), gm = g0 + (Math.PI / 2 - g0) * u, rh = l * Math.sin(gm);
      var S = [0, h, 0], gV = [0, -h / l, -r / l], mV = [0, -r / l, h / l], wV = [1, 0, 0];
      var aV = [0, 1, 2].map(function (k) { return Math.cos(gm) * gV[k] + Math.sin(gm) * mV[k]; });
      var C = [0, 1, 2].map(function (k) { return S[k] + l * Math.cos(gm) * aV[k]; }), e1 = [0, 1, 2].map(function (k) { return Math.sin(gm) * gV[k] - Math.cos(gm) * mV[k]; });
      // quay cả hình quanh trục ngang qua S để mặt phẳng trải dần quay ra phía người xem
      var ka = -g0 * em((tp - 0.3) / 0.7), ck = Math.cos(ka), sk = Math.sin(ka);
      var Xq = function (p) { var y = p[1] - h, z = p[2]; return [p[0], h + y * ck - z * sk, y * sk + z * ck]; };
      var Bd = function (ph) { var ps = r * ph / rh; return Xq([0, 1, 2].map(function (k) { return C[k] + rh * (Math.cos(ps) * e1[k] + Math.sin(ps) * wV[k]); })); };
      var Sq = Xq(S);
      for (var j = 0; j < N; j++) {
        var a2 = -Math.PI + 2 * Math.PI * j / N, b2 = -Math.PI + 2 * Math.PI * (j + 1) / N;
        them([Sq, Bd(a2), Bd(b2)], [j === 0, true, j === N - 1], false);
      }
      var Fp = [0, 0, -r], an = (Math.PI / 2 + g0) * (1 - em(tp)), dV = [0, 1, 2].map(function (k) { return Math.cos(an) * gV[k] + Math.sin(an) * mV[k]; });
      var Od = [0, 1, 2].map(function (k) { return Fp[k] + r * dV[k]; });
      them(dia(Od, dV, wV).map(Xq), tatCa(N), true);
      nhan.push({ ten: 'S', P: chieu(Sq), an: false }, { ten: 'O', P: chieu(Xq(Od)), an: false });
      if (tp > 0.97) {   // ghi l bên ngoài cạnh cắt (lệch vuông góc với cạnh, ra xa hình quạt)
        var Bt = Bd(-Math.PI), Bg = Bd(0), ex = Bt[0] - Sq[0], ey = Bt[1] - Sq[1], el = Math.hypot(ex, ey) || 1, nx = -ey / el, ny = ex / el;
        if (nx * (Bg[0] - Sq[0]) + ny * (Bg[1] - Sq[1]) > 0) { nx = -nx; ny = -ny; }
        so.push({ nd: 'l', P: chieu([(Sq[0] + Bt[0]) / 2 + nx * 16, (Sq[1] + Bt[1]) / 2 + ny * 16, (Sq[2] + Bt[2]) / 2]) });
      }
    }
    mat.sort(function (a, b) { return b.sau - a.sau; });
    var kq = ketQua(o, [], [], nhan, [], [], pts); kq.trai = mat; kq.so = so; kq.tp = tp; return kq;
  }

  function ketQua(o, canh, cong, dinh, tay, vuong, pts) {
    var b = { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity };
    pts.concat(dinh.map(function (d) { return d.P; })).forEach(function (p) { b.x0 = Math.min(b.x0, p.x); b.y0 = Math.min(b.y0, p.y); b.x1 = Math.max(b.x1, p.x); b.y1 = Math.max(b.y1, p.y); });
    return { k: 'khoi', canh: canh, cong: cong, dinh: dinh, tay: tay, vuong: vuong, khung: b };
  }
  // Kéo tay nắm: tìm giá trị tham số để tay nắm đi tới gần chuột nhất (tay nắm chạy trên một đường thẳng)
  function keo(o, ts, M, P0, g0, p0) {
    var v = (M.x - P0.x) * g0.x + (M.y - P0.y) * g0.y, gg = g0.x * g0.x + g0.y * g0.y; if (gg < 1e-9) return;
    o[ts] = Math.max(20, Math.min(1200, p0 + v / gg));
  }
  // Đạo hàm vị trí tay nắm theo tham số (sai phân)
  // Điểm neo đứng yên khi đổi kích thước: đỉnh A (đa diện) hoặc tâm O (trụ, nón, cầu)
  function neo(o, v) { var ten = /^(tru|non|cau)$/.test(o.dang) ? 'O' : 'A'; return v.dinh.filter(function (d) { return d.ten === ten; })[0].P; }
  function daoHam(o, i) {
    var v0 = tinh(o), ts = v0.tay[i].ts, cu = o[ts], P0 = v0.tay[i].P, N0 = neo(o, v0);
    o[ts] = cu + 1; var v1 = tinh(o), P1 = v1.tay[i].P, N1 = neo(o, v1); o[ts] = cu;
    return { ts: ts, P0: P0, p0: cu, N0: N0, g: { x: (P1.x - N1.x) - (P0.x - N0.x), y: (P1.y - N1.y) - (P0.y - N0.y) } };
  }
  // sau khi đổi tham số: dời cả hình để điểm neo về chỗ cũ
  function giuNeo(o, N0) { var N = neo(o, tinh(o)); o.x += N0.x - N.x; o.y += N0.y - N.y; }
  function khoangCach(v, M) {
    function kcDoan(P, Q) { var ux = Q.x - P.x, uy = Q.y - P.y, L = ux * ux + uy * uy, t = L ? Math.max(0, Math.min(1, ((M.x - P.x) * ux + (M.y - P.y) * uy) / L)) : 0; return Math.hypot(M.x - P.x - ux * t, M.y - P.y - uy * t); }
    var m = Infinity;
    v.canh.forEach(function (e) { m = Math.min(m, kcDoan(e.p, e.q)); });
    v.cong.forEach(function (c) { for (var i = 0; i + 1 < c.pts.length; i++) m = Math.min(m, kcDoan(c.pts[i], c.pts[i + 1])); });
    (v.trai || []).forEach(function (f) { for (var i = 0; i < f.pts.length; i++) if (f.vien[i]) m = Math.min(m, kcDoan(f.pts[i], f.pts[(i + 1) % f.pts.length])); });
    return m;
  }
  // Dựng đa diện từ các điểm bấm trên bảng: đáy (≥ 3 điểm) nằm ngang, vẽ theo phép chiếu song song chuẩn.
  //   chop: dinhTren = đỉnh S; lang: dinhTren = vị trí A' (đỉnh đáy trên ứng với đỉnh đầu tiên)
  function dungTuDiem(loai, day, dinhTren) {
    var al = 40 * Math.PI / 180, ca = Math.cos(al), sa = Math.sin(al), O = day[0], tenDay = 'ABCDEFGHKMN';
    function vao3(Q) { var z = (O.y - Q.y) / (K * sa), x = (Q.x - O.x) - K * z * ca; return [x, 0, z]; }
    var d3 = day.map(vao3), n = d3.length;
    // đáy theo chiều ngược kim đồng hồ nhìn từ trên xuống (để mặt hướng ra ngoài đúng)
    var dt = 0; for (var i = 0; i < n; i++) { var p = d3[i], q = d3[(i + 1) % n]; dt += p[0] * q[2] - q[0] * p[2]; }
    var o = { loai: 'khoi', dang: loai === 'chop' ? 'tuDoChop' : 'tuDoLang', xoay: 0, nghieng: 0, alpha: 40, a: 0, b: 0, c: 0 };
    var ten = day.map(function (_, i) { return tenDay.charAt(i) || ('A' + i); }), mat = [];
    if (loai === 'chop') {
      // chân đường cao: ngay dưới S nếu S thẳng trên một đỉnh đáy, không thì ở giữa đáy (cùng độ sâu với tâm đáy)
      var gy = day.reduce(function (s2, P) { return s2 + P.y; }, 0) / n, chanTrung = null, chan;
      for (var j = 0; j < n; j++) if (Math.abs(dinhTren.x - day[j].x) < 14 && dinhTren.y < day[j].y - 10) { chanTrung = j; break; }
      if (chanTrung != null) chan = d3[chanTrung].slice(); else chan = vao3({ x: dinhTren.x, y: gy });
      var yChan = chanTrung != null ? day[chanTrung].y : gy, h = yChan - dinhTren.y; if (h < 8) return null;
      var S = [chan[0], h, chan[2]];
      o.dinh3 = d3.concat([S]); o.tenDinh = ten.concat(['S']); o.chan = chan; o.chanTrung = chanTrung;
      mat.push(d3.map(function (_, i) { return i; })); for (var k = 0; k < n; k++) mat.push([k, (k + 1) % n, n]);
    } else {
      var hL = O.y - dinhTren.y; if (hL < 8) return null;
      var lech = Math.abs(dinhTren.x - O.x) < 14 ? 0 : dinhTren.x - O.x, tren = d3.map(function (p) { return [p[0] + lech, hL, p[2]]; });
      o.dinh3 = d3.concat(tren); o.tenDinh = ten.concat(ten.map(function (t) { return t + "'"; })); o.dung = !lech;
      mat.push(d3.map(function (_, i) { return i; })); mat.push(tren.map(function (_, i) { return i + n; }));
      for (var m = 0; m < n; m++) mat.push([m, (m + 1) % n, (m + 1) % n + n, m + n]);
    }
    o.mat = mat;
    // tâm đáy trên bảng (điểm o.x, o.y là hình chiếu của tâm đáy)
    var g = tam(d3); o.x = O.x + g[0] + K * g[2] * ca; o.y = O.y - K * g[2] * sa;
    void dt; return o;
  }
  return { TEN: TEN, tienDoTrai: tienDoTrai, moi: moi, dungTuDiem: dungTuDiem, tinh: tinh, keo: keo, daoHam: daoHam, giuNeo: giuNeo, khoangCach: khoangCach };
})();
