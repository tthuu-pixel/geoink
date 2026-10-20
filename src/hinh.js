// Bộ dựng hình kiểu GeoGebra: mỗi đối tượng lưu CÁCH DỰNG (phụ thuộc vào đối tượng khác),
// toạ độ được tính lại mỗi lần vẽ, nên kéo điểm gốc thì mọi hình phụ thuộc đổi theo.
//
// Đối tượng (lưu trong tệp):
//   { id, loai: 'diem', x, y }                     điểm tự do
//   { id, loai: 'diemTren', tren, t }              điểm nằm trên đường thẳng / đường tròn (t: tham số)
//   { id, loai: 'trungDiem', a, b }                trung điểm
//   { id, loai: 'giao', o1, o2, k }                giao điểm thứ k (0, 1)
//   { id, loai: 'doan' | 'duong' | 'tia', a, b }   đoạn / đường thẳng / tia (tia gốc a)
//   { id, loai: 'tron', o, a }                     đường tròn tâm o đi qua a
//   { id, loai: 'vuongGoc' | 'songSong', d, a }    đường qua a vuông góc / song song với d
//   { id, loai: 'daGiac', ds: [id…] }              đa giác
//   { id, loai: 'doDai', a, b } · { id, loai: 'goc', a, o, b }   số đo
//   { id, loai: 'hamSo', bt }                      đồ thị y = f(x)
window.GI = window.GI || {};
GI.hinh = (function () {
  var LA_DIEM = { diem: 1, diemTren: 1, trungDiem: 1, giao: 1 };
  var LA_THANG = { doan: 1, duong: 1, tia: 1, vuongGoc: 1, songSong: 1 };

  function hieu(a, b) { return { x: a.x - b.x, y: a.y - b.y }; }
  function dai(v) { return Math.hypot(v.x, v.y); }
  function kc(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }

  // Giao của đường thẳng (p, u) với đường thẳng / đường tròn. Trả về danh sách { x, y, t, s }.
  function giaoThangThang(A, B) {
    var u = hieu(A.q, A.p), v = hieu(B.q, B.p), m = u.x * v.y - u.y * v.x;
    if (Math.abs(m) < 1e-12) return [];
    var w = hieu(B.p, A.p), t = (w.x * v.y - w.y * v.x) / m, s = (w.x * u.y - w.y * u.x) / m;
    return [{ x: A.p.x + u.x * t, y: A.p.y + u.y * t, t: t, s: s }];
  }
  function giaoThangTron(A, C) {
    var u = hieu(A.q, A.p), f = hieu(A.p, C.c), a = u.x * u.x + u.y * u.y, b = 2 * (f.x * u.x + f.y * u.y), c = f.x * f.x + f.y * f.y - C.r * C.r;
    var D = b * b - 4 * a * c; if (D < 0 || a < 1e-12) return [];
    var sD = Math.sqrt(D);
    return [(-b - sD) / (2 * a), (-b + sD) / (2 * a)].map(function (t) { return { x: A.p.x + u.x * t, y: A.p.y + u.y * t, t: t }; });
  }
  function giaoTronTron(A, B) {
    var d = kc(A.c, B.c); if (d < 1e-9 || d > A.r + B.r + 1e-9 || d < Math.abs(A.r - B.r) - 1e-9) return [];
    var a = (A.r * A.r - B.r * B.r + d * d) / (2 * d), h = Math.sqrt(Math.max(0, A.r * A.r - a * a));
    var ex = (B.c.x - A.c.x) / d, ey = (B.c.y - A.c.y) / d, mx = A.c.x + ex * a, my = A.c.y + ey * a;
    return [{ x: mx - ey * h, y: my + ex * h }, { x: mx + ey * h, y: my - ex * h }];
  }
  // Điểm có nằm trong phần giới hạn của đoạn / tia không (t: tham số dọc p→q)
  function trongGioiHan(L, t) { return L.loai === 'doan' ? t >= -1e-9 && t <= 1 + 1e-9 : L.loai === 'tia' ? t >= -1e-9 : true; }
  function catNhau(A, B) {
    var kq = [];
    if (A.k === 'thang' && B.k === 'thang') kq = giaoThangThang(A, B).filter(function (P) { return trongGioiHan(A, P.t) && trongGioiHan(B, P.s); });
    else if (A.k === 'thang' && B.k === 'tron') kq = giaoThangTron(A, B).filter(function (P) { return trongGioiHan(A, P.t); });
    else if (A.k === 'tron' && B.k === 'thang') kq = giaoThangTron(B, A).filter(function (P) { return trongGioiHan(B, P.t); });
    else if (A.k === 'tron' && B.k === 'tron') kq = giaoTronTron(A, B);
    return kq;
  }

  // Tính giá trị (toạ độ) của mọi đối tượng. Trả về { id: giá trị | null }
  function tinh(ds) {
    var gt = {}, theoId = {};
    ds.forEach(function (o) { theoId[o.id] = o; });
    function lay(id) {
      if (id in gt) return gt[id];
      var o = theoId[id]; if (!o) return null;
      gt[id] = null;   // chặn vòng lặp
      gt[id] = tinhMot(o);
      return gt[id];
    }
    function diem(id) { var v = lay(id); return v && v.k === 'diem' ? v : null; }
    function tinhMot(o) {
      switch (o.loai) {
        case 'diem': return { k: 'diem', x: o.x, y: o.y };
        case 'diemTren': {
          var T = lay(o.tren); if (!T) return null;
          if (T.k === 'tron') return { k: 'diem', x: T.c.x + T.r * Math.cos(o.t), y: T.c.y + T.r * Math.sin(o.t) };
          if (T.k === 'thang') { var u = hieu(T.q, T.p); return { k: 'diem', x: T.p.x + u.x * o.t, y: T.p.y + u.y * o.t }; }
          return null;
        }
        case 'trungDiem': { var A = diem(o.a), B = diem(o.b); return A && B ? { k: 'diem', x: (A.x + B.x) / 2, y: (A.y + B.y) / 2 } : null; }
        case 'giao': {
          var X = lay(o.o1), Y = lay(o.o2); if (!X || !Y) return null;
          var c = catNhau(X, Y), P = c[o.k || 0] || (c.length === 1 && !o.k ? c[0] : null);
          return P ? { k: 'diem', x: P.x, y: P.y } : null;
        }
        case 'doan': case 'duong': case 'tia': {
          var A2 = diem(o.a), B2 = diem(o.b); if (!A2 || !B2 || kc(A2, B2) < 1e-9) return null;
          return { k: 'thang', loai: o.loai, p: A2, q: B2 };
        }
        case 'vuongGoc': case 'songSong': {
          var D = lay(o.d), A3 = diem(o.a); if (!D || D.k !== 'thang' || !A3) return null;
          var v = hieu(D.q, D.p), L = dai(v); v = { x: v.x / L, y: v.y / L };
          var w = o.loai === 'vuongGoc' ? { x: -v.y, y: v.x } : v;
          return { k: 'thang', loai: 'duong', p: A3, q: { x: A3.x + w.x * 100, y: A3.y + w.y * 100 } };
        }
        case 'tron': { var O = diem(o.o), A4 = diem(o.a); return O && A4 ? { k: 'tron', c: O, r: kc(O, A4) } : null; }
        case 'daGiac': { var ps = o.ds.map(diem); return ps.every(Boolean) ? { k: 'daGiac', ds: ps } : null; }
        case 'doDai': { var A5 = diem(o.a), B5 = diem(o.b); return A5 && B5 ? { k: 'doDai', a: A5, b: B5, d: kc(A5, B5) } : null; }
        case 'goc': {
          var A6 = diem(o.a), O6 = diem(o.o), B6 = diem(o.b); if (!A6 || !O6 || !B6) return null;
          var a1 = Math.atan2(A6.y - O6.y, A6.x - O6.x), a2 = Math.atan2(B6.y - O6.y, B6.x - O6.x), da = a2 - a1;
          while (da > Math.PI) da -= 2 * Math.PI; while (da < -Math.PI) da += 2 * Math.PI;
          return { k: 'goc', a: A6, o: O6, b: B6, a1: a1, da: da, do: Math.abs(da) * 180 / Math.PI };
        }
        case 'hamSo': {
          if (!o._f || o._bt !== o.bt) { try { var r = GI.bieuThuc.doc(o.bt); o._f = r.f; o._ve = r.ve; o._bt = o.bt; } catch (e) { return null; } }
          return { k: 'ham', f: o._f, ve: o._ve };
        }
      }
      return null;
    }
    ds.forEach(function (o) { lay(o.id); });
    return gt;
  }

  // Khoảng cách từ điểm M (thế giới) tới hình đã tính (để chọn bằng chuột / bút)
  function khoangCach(v, M) {
    if (!v) return Infinity;
    if (v.k === 'diem') return kc(v, M);
    if (v.k === 'thang') {
      var u = hieu(v.q, v.p), L2 = u.x * u.x + u.y * u.y, t = ((M.x - v.p.x) * u.x + (M.y - v.p.y) * u.y) / L2;
      if (v.loai === 'doan') t = Math.max(0, Math.min(1, t)); else if (v.loai === 'tia') t = Math.max(0, t);
      return kc(M, { x: v.p.x + u.x * t, y: v.p.y + u.y * t });
    }
    if (v.k === 'tron') return Math.abs(kc(M, v.c) - v.r);
    if (v.k === 'daGiac') { var m = Infinity; for (var i = 0; i < v.ds.length; i++) m = Math.min(m, khoangCach({ k: 'thang', loai: 'doan', p: v.ds[i], q: v.ds[(i + 1) % v.ds.length] }, M)); return m; }
    return Infinity;
  }
  // Tham số của hình chiếu M lên đường / đường tròn (dùng cho điểm trên đối tượng)
  function thamSo(v, M) {
    if (v.k === 'tron') return Math.atan2(M.y - v.c.y, M.x - v.c.x);
    var u = hieu(v.q, v.p), t = ((M.x - v.p.x) * u.x + (M.y - v.p.y) * u.y) / (u.x * u.x + u.y * u.y);
    if (v.loai === 'doan') t = Math.max(0, Math.min(1, t)); else if (v.loai === 'tia') t = Math.max(0, t);
    return t;
  }
  // Tất cả đối tượng phụ thuộc (trực tiếp hoặc gián tiếp) vào id
  function phuThuoc(ds, id) {
    var bo = {}; bo[id] = 1; var doi = true;
    while (doi) {
      doi = false;
      ds.forEach(function (o) {
        if (bo[o.id]) return;
        var ref = [o.a, o.b, o.o, o.d, o.tren, o.o1, o.o2].concat(o.ds || []);
        if (ref.some(function (r) { return r && bo[r]; })) { bo[o.id] = 1; doi = true; }
      });
    }
    return bo;
  }
  return { tinh: tinh, catNhau: catNhau, khoangCach: khoangCach, thamSo: thamSo, phuThuoc: phuThuoc, LA_DIEM: LA_DIEM, LA_THANG: LA_THANG, kc: kc };
})();
