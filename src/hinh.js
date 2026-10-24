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
//   { id, loai: 'hamSo', bt }                      đồ thị y = f(x) (dùng được tên thanh trượt)
//   Mới: trungTruc, phanGiac, daGiacDeu (+ dinhDG), tronBanKinh, compa, tron3, banNguyet, cungTam, cung3, quatTam, quat3,
//        tam, diemCach (đoạn có độ dài cố định), gapKhuc, gocVuong, dienTich, bienHinh, thanhTruot, chu
window.GI = window.GI || {};
GI.hinh = (function () {
  var DV = 40;   // 1 cm = 40 đơn vị thế giới
  var LA_DIEM = { diem: 1, diemTren: 1, trungDiem: 1, giao: 1, tam: 1, diemCach: 1, dinhDG: 1, dauDoan: 1, trongTam: 1, trucTam: 1, chanCao: 1, diemTZ: 1, chanPhanGiac: 1, hinhChieu: 1 };
  var LA_THANG = { doan: 1, duong: 1, tia: 1, vuongGoc: 1, songSong: 1, trungTruc: 1, phanGiac: 1, tiepTuyenChung: 1 };
  var LA_TRON = { tron: 1, tronBanKinh: 1, compa: 1, tron3: 1 };
  var LA_CUNG = { banNguyet: 1, cungTam: 1, cung3: 1, quatTam: 1, quat3: 1 };
  var LA_CONIC = { elip: 1, hypebol: 1, parabol: 1 };
  // Các trường chứa id đối tượng khác (để tìm đối tượng phụ thuộc)
  var TRUONG_REF = ['a', 'b', 'c', 'o', 'd', 'tren', 'o1', 'o2', 'nguon', 'tam', 'truc', 'tron', 'v1', 'v2', 'dg'];
  function tamNgoaiTiep(A, B, C) {
    var d = 2 * (A.x * (B.y - C.y) + B.x * (C.y - A.y) + C.x * (A.y - B.y)); if (Math.abs(d) < 1e-9) return null;
    var a2 = A.x * A.x + A.y * A.y, b2 = B.x * B.x + B.y * B.y, c2 = C.x * C.x + C.y * C.y;
    var O = { x: (a2 * (B.y - C.y) + b2 * (C.y - A.y) + c2 * (A.y - B.y)) / d, y: (a2 * (C.x - B.x) + b2 * (A.x - C.x) + c2 * (B.x - A.x)) / d };
    return { c: O, r: Math.hypot(A.x - O.x, A.y - O.y) };
  }
  function goc(P, C) { return Math.atan2(P.y - C.y, P.x - C.x); }
  function chuanHoa(a) { while (a > Math.PI) a -= 2 * Math.PI; while (a <= -Math.PI) a += 2 * Math.PI; return a; }
  function quetDuong(a) { while (a < 0) a += 2 * Math.PI; while (a >= 2 * Math.PI) a -= 2 * Math.PI; return a; }   // 0..2π
  // Cung qua 3 điểm A → B → C trên đường tròn ngoại tiếp
  function cungQua3(A, B, C) {
    var T = tamNgoaiTiep(A, B, C); if (!T) return null;
    var a0 = goc(A, T.c), sAB = quetDuong(goc(B, T.c) - a0), sAC = quetDuong(goc(C, T.c) - a0);
    var da = sAB < sAC ? sAC : sAC - 2 * Math.PI;   // đi qua B
    return { c: T.c, r: T.r, a0: a0, da: da };
  }

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
    var gt = {}, theoId = {}, bien = {};
    ds.forEach(function (o) { if (o.loai === 'thanhTruot' && o.ten) bien[o.ten] = o.gt; });
    ds.forEach(function (o) { theoId[o.id] = o; });
    function lay(id) {
      if (id in gt) return gt[id];
      var o = theoId[id]; if (!o) return null;
      gt[id] = null;   // chặn vòng lặp
      gt[id] = tinhMot(o);
      return gt[id];
    }
    function diem(id) { var v = lay(id); return v && v.k === 'diem' ? v : null; }
    // Phép biến hình áp dụng lên giá trị v của đối tượng nguồn
    function bienHinh(o, v) {
      if (!v) return null;
      var f, lat = false, kTL = 1;
      if (o.kieu === 'dxTruc') {
        var L = lay(o.truc); if (!L || L.k !== 'thang') return null; lat = true;
        f = function (P) { var u = hieu(L.q, L.p), t = ((P.x - L.p.x) * u.x + (P.y - L.p.y) * u.y) / (u.x * u.x + u.y * u.y), K = { x: L.p.x + u.x * t, y: L.p.y + u.y * t }; return { x: 2 * K.x - P.x, y: 2 * K.y - P.y }; };
      } else if (o.kieu === 'dxTam') {
        var I = diem(o.tam); if (!I) return null; f = function (P) { return { x: 2 * I.x - P.x, y: 2 * I.y - P.y }; };
      } else if (o.kieu === 'quay') {
        var Q = diem(o.tam); if (!Q) return null; var a = -(o.goc || 0) * Math.PI / 180, cs = Math.cos(a), sn = Math.sin(a);   // góc dương = ngược chiều kim đồng hồ trên màn hình
        f = function (P) { var x = P.x - Q.x, y = P.y - Q.y; return { x: Q.x + x * cs - y * sn, y: Q.y + x * sn + y * cs }; };
      } else if (o.kieu === 'tinhTien') {
        var V1 = diem(o.v1), V2 = diem(o.v2); if (!V1 || !V2) return null; f = function (P) { return { x: P.x + V2.x - V1.x, y: P.y + V2.y - V1.y }; };
      } else if (o.kieu === 'viTu') {
        var T = diem(o.tam); if (!T) return null; kTL = o.k == null ? 2 : o.k; f = function (P) { return { x: T.x + (P.x - T.x) * kTL, y: T.y + (P.y - T.y) * kTL }; };
      } else if (o.kieu === 'nghichDao') {
        var C = lay(o.tron); if (!C || C.k !== 'tron' || v.k !== 'diem') return null;
        var dx = v.x - C.c.x, dy = v.y - C.c.y, d2 = dx * dx + dy * dy; if (d2 < 1e-9) return null;
        return { k: 'diem', x: C.c.x + dx * C.r * C.r / d2, y: C.c.y + dy * C.r * C.r / d2 };
      } else return null;
      function d(P) { var R = f(P); return { k: 'diem', x: R.x, y: R.y }; }
      if (v.k === 'diem') return d(v);
      if (v.k === 'thang') return { k: 'thang', loai: v.loai, p: d(v.p), q: d(v.q) };
      if (v.k === 'tron') return { k: 'tron', c: d(v.c), r: v.r * Math.abs(kTL) };
      if (v.k === 'daGiac' || v.k === 'gapKhuc') return { k: v.k, ds: v.ds.map(d) };
      if (v.k === 'cung') { var C2 = d(v.c), S2 = d({ x: v.c.x + v.r * Math.cos(v.a0), y: v.c.y + v.r * Math.sin(v.a0) }); return { k: 'cung', c: C2, r: v.r * Math.abs(kTL), a0: goc(S2, C2), da: lat ? -v.da : v.da, quat: v.quat }; }
      return null;
    }
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
          var khoaBien = Object.keys(bien).join(',');
          if (!o._f || o._bt !== o.bt || o._kb !== khoaBien) { try { var r = GI.bieuThuc.doc(o.bt, Object.keys(bien)); o._f = r.f; o._ve = r.ve; o._bt = o.bt; o._kb = khoaBien; } catch (e) { return null; } }
          var fh = o._f; return { k: 'ham', f: function (x) { return fh(x, bien); }, ve: o._ve };
        }
        case 'anh': return { k: 'anh', x: o.x, y: o.y, w: o.w, h: o.h };
        case 'che': return { k: 'che', x: o.x, y: o.y, w: o.w, h: o.h };
        case 'bieuDo': return { k: 'bieuDo', x: o.x, y: o.y, w: o.w || 440, h: o.h || 330 };
        case 'doThi': return { k: 'doThi', x: o.x, y: o.y };   // đồ thị hàm số (hệ trục + đồ thị + bảng giá trị)   // ảnh dán / cắt từ màn hình
        case 'diemTZ': case 'nhanTZ': {   // điểm / nhãn dựng từ mã TikZ (biểu thức theo toạ độ TikZ, gốc là điểm o.goc)
          var G = diem(o.goc); if (!G || !GI.tikz) return null; var Dk = DV * (o.kt || 1);
          var Pz = GI.tikz.tinh(o.bt, function (id) { var Q = diem(id); return Q ? { x: (Q.x - G.x) / Dk, y: -(Q.y - G.y) / Dk } : null; });
          if (!Pz || !isFinite(Pz.x) || !isFinite(Pz.y)) return null;
          return { k: o.loai === 'diemTZ' ? 'diem' : 'nhanTZ', x: G.x + Pz.x * Dk, y: G.y - Pz.y * Dk };
        }
        case 'trongTam': { var Ag = diem(o.a), Bg = diem(o.b), Cg = diem(o.c); return Ag && Bg && Cg ? { k: 'diem', x: (Ag.x + Bg.x + Cg.x) / 3, y: (Ag.y + Bg.y + Cg.y) / 3 } : null; }
        case 'trucTam': {   // H = A + B + C − 2O (O: tâm đường tròn ngoại tiếp)
          var Ah = diem(o.a), Bh = diem(o.b), Ch = diem(o.c); if (!Ah || !Bh || !Ch) return null; var Th = tamNgoaiTiep(Ah, Bh, Ch); if (!Th) return null;
          return { k: 'diem', x: Ah.x + Bh.x + Ch.x - 2 * Th.c.x, y: Ah.y + Bh.y + Ch.y - 2 * Th.c.y };
        }
        case 'chanCao': {   // chân đường cao kẻ từ a xuống đường thẳng bc
          var Af = diem(o.a), Bf = diem(o.b), Cf = diem(o.c); if (!Af || !Bf || !Cf) return null; var ux = Cf.x - Bf.x, uy = Cf.y - Bf.y, L2 = ux * ux + uy * uy; if (L2 < 1e-12) return null;
          var tf = ((Af.x - Bf.x) * ux + (Af.y - Bf.y) * uy) / L2; return { k: 'diem', x: Bf.x + ux * tf, y: Bf.y + uy * tf, t: tf };
        }
        case 'chanPhanGiac': {   // chân đường phân giác góc aob trên đường thẳng ab: chia ab theo tỉ số oa : ob
          var Aq = diem(o.a), Oq = diem(o.o), Bq = diem(o.b); if (!Aq || !Oq || !Bq) return null; var la = kc(Oq, Aq), lb = kc(Oq, Bq); if (la + lb < 1e-9) return null;
          return { k: 'diem', x: (lb * Aq.x + la * Bq.x) / (la + lb), y: (lb * Aq.y + la * Bq.y) / (la + lb) };
        }
        case 'hinhChieu': {   // hình chiếu vuông góc của điểm a lên đường thẳng d
          var Ar = diem(o.a), Dr = lay(o.d); if (!Ar || !Dr || Dr.k !== 'thang') return null; var vx = Dr.q.x - Dr.p.x, vy = Dr.q.y - Dr.p.y, L2r = vx * vx + vy * vy; if (L2r < 1e-12) return null;
          var tr = ((Ar.x - Dr.p.x) * vx + (Ar.y - Dr.p.y) * vy) / L2r; return { k: 'diem', x: Dr.p.x + vx * tr, y: Dr.p.y + vy * tr, t: tr };
        }
        case 'tam': { var Tt = lay(o.d); return Tt && (Tt.k === 'tron' || Tt.k === 'cung') ? { k: 'diem', x: Tt.c.x, y: Tt.c.y } : null; }
        case 'diemCach': { var Ac = diem(o.a); return Ac ? { k: 'diem', x: Ac.x + o.l * DV * Math.cos(o.t || 0), y: Ac.y + o.l * DV * Math.sin(o.t || 0) } : null; }
        case 'trungTruc': {
          var At = diem(o.a), Bt = diem(o.b); if (!At || !Bt || kc(At, Bt) < 1e-9) return null;
          var Mt = { x: (At.x + Bt.x) / 2, y: (At.y + Bt.y) / 2 };
          return { k: 'thang', loai: 'duong', p: Mt, q: { x: Mt.x - (Bt.y - At.y), y: Mt.y + (Bt.x - At.x) } };
        }
        case 'phanGiac': {
          var Ap = diem(o.a), Op = diem(o.o), Bp = diem(o.b); if (!Ap || !Op || !Bp) return null;
          var u1 = hieu(Ap, Op), u2 = hieu(Bp, Op), l1 = dai(u1), l2 = dai(u2); if (l1 < 1e-9 || l2 < 1e-9) return null;
          var w2 = { x: u1.x / l1 + u2.x / l2, y: u1.y / l1 + u2.y / l2 }; if (dai(w2) < 1e-9) w2 = { x: -u1.y / l1, y: u1.x / l1 };
          return { k: 'thang', loai: 'duong', p: Op, q: { x: Op.x + w2.x * 100, y: Op.y + w2.y * 100 } };
        }
        case 'daGiacDeu': {
          var A7 = diem(o.a), B7 = diem(o.b); if (!A7 || !B7 || o.n < 3) return null;
          var ps7 = [A7, B7], ngoai = -2 * Math.PI / o.n;
          for (var i7 = 2; i7 < o.n; i7++) {
            var P1 = ps7[i7 - 1], P0 = ps7[i7 - 2], e7 = hieu(P1, P0), cs = Math.cos(ngoai), sn = Math.sin(ngoai);
            ps7.push({ k: 'diem', x: P1.x + e7.x * cs - e7.y * sn, y: P1.y + e7.x * sn + e7.y * cs });
          }
          return { k: 'daGiac', ds: ps7 };
        }
        case 'dinhDG': { var G = lay(o.dg); return G && G.ds[o.i] ? { k: 'diem', x: G.ds[o.i].x, y: G.ds[o.i].y } : null; }
        case 'tronBanKinh': { var Or = diem(o.o); return Or ? { k: 'tron', c: Or, r: Math.abs(o.r) * DV } : null; }
        case 'compa': { var Oc = diem(o.o), Ac2 = diem(o.a), Bc2 = diem(o.b); return Oc && Ac2 && Bc2 ? { k: 'tron', c: Oc, r: kc(Ac2, Bc2) } : null; }
        case 'tron3': { var A8 = diem(o.a), B8 = diem(o.b), C8 = diem(o.c); var T8 = A8 && B8 && C8 && tamNgoaiTiep(A8, B8, C8); return T8 ? { k: 'tron', c: T8.c, r: T8.r } : null; }
        case 'banNguyet': {
          var A9 = diem(o.a), B9 = diem(o.b); if (!A9 || !B9 || kc(A9, B9) < 1e-9) return null;
          var M9 = { x: (A9.x + B9.x) / 2, y: (A9.y + B9.y) / 2 };
          return { k: 'cung', c: M9, r: kc(A9, B9) / 2, a0: goc(A9, M9), da: Math.PI };   // A trái, B phải → nửa phía trên
        }
        case 'cungTam': case 'quatTam': {
          var Ok = diem(o.o), Ak = diem(o.a), Bk = diem(o.b); if (!Ok || !Ak || !Bk || kc(Ok, Ak) < 1e-9) return null;
          var a0k = goc(Ak, Ok); return { k: 'cung', c: Ok, r: kc(Ok, Ak), a0: a0k, da: -quetDuong(a0k - goc(Bk, Ok)), quat: o.loai === 'quatTam' };
        }
        case 'cung3': case 'quat3': {
          var Ak3 = diem(o.a), Bk3 = diem(o.b), Ck3 = diem(o.c); var K3 = Ak3 && Bk3 && Ck3 && cungQua3(Ak3, Bk3, Ck3);
          return K3 ? { k: 'cung', c: K3.c, r: K3.r, a0: K3.a0, da: K3.da, quat: o.loai === 'quat3' } : null;
        }
        case 'gapKhuc': { var psg = o.ds.map(diem); return psg.every(Boolean) ? { k: 'gapKhuc', ds: psg } : null; }
        case 'gocVuong': {
          var Av = diem(o.a), Ov = diem(o.o), Bv = diem(o.b); if (!Av || !Ov || !Bv) return null;
          var g1 = hieu(Av, Ov), g2 = hieu(Bv, Ov), d1 = dai(g1), d2 = dai(g2); if (d1 < 1e-9 || d2 < 1e-9) return null;
          return { k: 'gocVuong', o: Ov, u1: { x: g1.x / d1, y: g1.y / d1 }, u2: { x: g2.x / d2, y: g2.y / d2 } };
        }
        case 'dienTich': {
          var Dd = lay(o.d); if (!Dd) return null;
          if (Dd.k === 'daGiac') { var S = 0, cx = 0, cy = 0; Dd.ds.forEach(function (P, i) { var Q = Dd.ds[(i + 1) % Dd.ds.length]; S += P.x * Q.y - Q.x * P.y; cx += P.x; cy += P.y; }); return { k: 'dienTich', S: Math.abs(S) / 2, vi: { x: cx / Dd.ds.length, y: cy / Dd.ds.length } }; }
          if (Dd.k === 'tron') return { k: 'dienTich', S: Math.PI * Dd.r * Dd.r, vi: Dd.c };
          if (Dd.k === 'cung' && Dd.quat) { var am = Dd.a0 + Dd.da / 2; return { k: 'dienTich', S: Dd.r * Dd.r * Math.abs(Dd.da) / 2, vi: { x: Dd.c.x + Math.cos(am) * Dd.r * 0.55, y: Dd.c.y + Math.sin(am) * Dd.r * 0.55 } }; }
          return null;
        }
        case 'bienHinh': return bienHinh(o, lay(o.nguon));
        case 'thanhTruot': return { k: 'truot', x: o.x, y: o.y };
        case 'chu': return { k: 'chu', x: o.x, y: o.y };
        case 'congThuc': return { k: 'chu', x: o.x, y: o.y };
        case 'khoi': return GI.khoi ? GI.khoi.tinh(o) : null;
        case 'tiepTuyenChung': {   // tiếp tuyến chung ngoài của hai đường tròn (k = 0, 1)
          var T1 = lay(o.o1), T2 = lay(o.o2); if (!T1 || !T2 || T1.k !== 'tron' || T2.k !== 'tron') return null;
          var dx = T2.c.x - T1.c.x, dy = T2.c.y - T1.c.y, dd = Math.hypot(dx, dy); if (dd <= Math.abs(T1.r - T2.r) + 1e-6) return null;
          var th = Math.atan2(dy, dx), ph = Math.acos((T1.r - T2.r) / dd) * (o.k ? -1 : 1), nx = Math.cos(th + ph), ny = Math.sin(th + ph);
          return { k: 'thang', loai: 'doan', p: { x: T1.c.x + T1.r * nx, y: T1.c.y + T1.r * ny }, q: { x: T2.c.x + T2.r * nx, y: T2.c.y + T2.r * ny } };
        }
        case 'dauDoan': { var Sd = lay(o.d); return Sd && Sd.k === 'thang' ? { k: 'diem', x: (o.i ? Sd.q : Sd.p).x, y: (o.i ? Sd.q : Sd.p).y } : null; }
        case 'elip': case 'hypebol': {
          var F1 = diem(o.a), F2 = diem(o.b), Pc = diem(o.c); if (!F1 || !F2 || !Pc) return null;
          var cc = kc(F1, F2) / 2, d1 = kc(Pc, F1), d2 = kc(Pc, F2), Mc = { x: (F1.x + F2.x) / 2, y: (F1.y + F2.y) / 2 }, th = Math.atan2(F2.y - F1.y, F2.x - F1.x);
          var co = Math.cos(th), si = Math.sin(th);
          function dat(x, y) { return { x: Mc.x + x * co - y * si, y: Mc.y + x * si + y * co }; }
          if (o.loai === 'elip') {
            var Ae = (d1 + d2) / 2, Be = Math.sqrt(Math.max(0, Ae * Ae - cc * cc)); if (Be < 1e-6) return null;
            var pe = []; for (var ie = 0; ie <= 144; ie++) { var te = ie / 144 * 2 * Math.PI; pe.push(dat(Ae * Math.cos(te), Be * Math.sin(te))); }
            return { k: 'cong', nhanh: [pe], kin: true };
          }
          var Ah = Math.abs(d1 - d2) / 2, Bh = Math.sqrt(Math.max(0, cc * cc - Ah * Ah)); if (Ah < 1e-6 || Bh < 1e-6) return null;
          var U = Math.log(60 * DV / Bh + Math.sqrt(1 + Math.pow(60 * DV / Bh, 2))), nh = [[], []];
          for (var ih = 0; ih <= 120; ih++) { var u = -U + 2 * U * ih / 120; nh[0].push(dat(Ah * Math.cosh(u), Bh * Math.sinh(u))); nh[1].push(dat(-Ah * Math.cosh(u), Bh * Math.sinh(u))); }
          return { k: 'cong', nhanh: nh, kin: false };
        }
        case 'parabol': {
          var Fp = diem(o.a), Dp = lay(o.d); if (!Fp || !Dp || Dp.k !== 'thang') return null;
          var up = hieu(Dp.q, Dp.p), Lp = dai(up); up = { x: up.x / Lp, y: up.y / Lp };
          var tp = (Fp.x - Dp.p.x) * up.x + (Fp.y - Dp.p.y) * up.y, Hp = { x: Dp.p.x + up.x * tp, y: Dp.p.y + up.y * tp }, pp = kc(Fp, Hp); if (pp < 1e-6) return null;
          var np = { x: (Fp.x - Hp.x) / pp, y: (Fp.y - Hp.y) / pp }, Vp = { x: (Fp.x + Hp.x) / 2, y: (Fp.y + Hp.y) / 2 }, Sp = Math.sqrt(2 * pp * 60 * DV), pts = [];
          for (var ip = 0; ip <= 160; ip++) { var sp = -Sp + 2 * Sp * ip / 160, hp = sp * sp / (2 * pp); pts.push({ x: Vp.x + up.x * sp + np.x * hp, y: Vp.y + up.y * sp + np.y * hp }); }
          return { k: 'cong', nhanh: [pts], kin: false };
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
    if (v.k === 'daGiac' || v.k === 'gapKhuc') { var m = Infinity, n = v.ds.length - (v.k === 'gapKhuc' ? 1 : 0); for (var i = 0; i < n; i++) m = Math.min(m, khoangCach({ k: 'thang', loai: 'doan', p: v.ds[i], q: v.ds[(i + 1) % v.ds.length] }, M)); return m; }
    if (v.k === 'khoi') return GI.khoi.khoangCach(v, M);
    if (v.k === 'cong') {
      var mc = Infinity; v.nhanh.forEach(function (ds) { for (var j = 0; j + 1 < ds.length; j++) mc = Math.min(mc, khoangCach({ k: 'thang', loai: 'doan', p: ds[j], q: ds[j + 1] }, M)); });
      return mc;
    }
    if (v.k === 'cung') {
      var a = Math.atan2(M.y - v.c.y, M.x - v.c.x), t = v.da >= 0 ? quetDuong(a - v.a0) : quetDuong(v.a0 - a), S = { x: v.c.x + v.r * Math.cos(v.a0), y: v.c.y + v.r * Math.sin(v.a0) }, E = { x: v.c.x + v.r * Math.cos(v.a0 + v.da), y: v.c.y + v.r * Math.sin(v.a0 + v.da) };
      var dC = t <= Math.abs(v.da) ? Math.abs(kc(M, v.c) - v.r) : Math.min(kc(M, S), kc(M, E));
      if (v.quat) dC = Math.min(dC, khoangCach({ k: 'thang', loai: 'doan', p: v.c, q: S }, M), khoangCach({ k: 'thang', loai: 'doan', p: v.c, q: E }, M));
      return dC;
    }
    return Infinity;
  }
  // Tham số của hình chiếu M lên đường / đường tròn (dùng cho điểm trên đối tượng)
  function thamSo(v, M) {
    if (v.k === 'tron') return Math.atan2(M.y - v.c.y, M.x - v.c.x);
    var u = hieu(v.q, v.p), t = ((M.x - v.p.x) * u.x + (M.y - v.p.y) * u.y) / (u.x * u.x + u.y * u.y);
    if (v.loai === 'doan') t = Math.max(0, Math.min(1, t)); else if (v.loai === 'tia') t = Math.max(0, t);
    return t;
  }
  // Các đối tượng mà o được dựng từ (cha trực tiếp)
  function cha(o) { return TRUONG_REF.map(function (k) { return o[k]; }).concat(o.ds || []).filter(function (r) { return typeof r === 'string'; }); }
  // Tất cả đối tượng phụ thuộc (trực tiếp hoặc gián tiếp) vào id
  function phuThuoc(ds, id) {
    var bo = {}; bo[id] = 1; var doi = true;
    while (doi) {
      doi = false;
      ds.forEach(function (o) {
        if (bo[o.id]) return;
        var ref = TRUONG_REF.map(function (k) { return o[k]; }).concat(o.ds || []);
        if (ref.some(function (r) { return r && bo[r]; })) { bo[o.id] = 1; doi = true; }
      });
    }
    return bo;
  }
  return { cha: cha, tinh: tinh, catNhau: catNhau, khoangCach: khoangCach, thamSo: thamSo, phuThuoc: phuThuoc, LA_DIEM: LA_DIEM, LA_THANG: LA_THANG, LA_TRON: LA_TRON, LA_CUNG: LA_CUNG, LA_CONIC: LA_CONIC, kc: kc, DV: DV };
})();
