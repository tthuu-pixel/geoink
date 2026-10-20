// Xuất hình đang chọn ra mã TikZ thuần theo khung 4 bước:
//   1. khai báo điểm bằng \path … coordinate (điểm dựng được thì dùng calc / intersection of, không gõ toạ độ)
//   2. \draw nối hình thành chuỗi dài nhất (--cycle khi khép kín), đường tròn gộp chung
//   3. chú thích: góc, góc vuông, kí hiệu đoạn bằng nhau gộp trong \foreach
//   4. \foreach xuất hiện điểm: chấm tròn + nhãn theo góc
window.GI = window.GI || {};
GI.xuatTex = (function () {
  var RAD = Math.PI / 180;
  function so(x, n) { var k = Math.pow(10, n == null ? 2 : n), v = Math.round(x * k) / k; if (Object.is(v, -0) || Math.abs(v) < 1e-9) v = 0; return String(v); }

  function xuat(hinh, ids, gt) {
    var theoId = {}; hinh.forEach(function (o) { theoId[o.id] = o; });
    var chon = ids.map(function (id) { return theoId[id]; }).filter(Boolean);
    var ghiChu = [];
    // ---------- khung bao, tỉ lệ (cm) ----------
    var bao = { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity };
    function moRong(P, r) { if (!P) return; r = r || 0; bao.x0 = Math.min(bao.x0, P.x - r); bao.x1 = Math.max(bao.x1, P.x + r); bao.y0 = Math.min(bao.y0, P.y - r); bao.y1 = Math.max(bao.y1, P.y + r); }
    chon.forEach(function (o) {
      var v = gt[o.id]; if (!v) return;
      if (v.k === 'diem' || v.k === 'nhanTZ') moRong(v);
      else if (v.k === 'thang') { if (v.loai === 'doan') { moRong(v.p); moRong(v.q); } else { moRong(v.p); } }
      else if (v.k === 'tron') moRong(v.c, v.r);
      else if (v.k === 'cung') { moRong({ x: v.c.x + v.r * Math.cos(v.a0), y: v.c.y + v.r * Math.sin(v.a0) }); moRong({ x: v.c.x + v.r * Math.cos(v.a0 + v.da), y: v.c.y + v.r * Math.sin(v.a0 + v.da) }); moRong({ x: v.c.x + v.r * Math.cos(v.a0 + v.da / 2), y: v.c.y + v.r * Math.sin(v.a0 + v.da / 2) }); }
      else if (v.k === 'daGiac' || v.k === 'gapKhuc') v.ds.forEach(function (P) { moRong(P); });
      else if (v.k === 'cong') v.nhanh.forEach(function (ds) { ds.forEach(function (P) { moRong(P); }); });
      else if (v.k === 'goc' || v.k === 'gocVuong') moRong(v.o);
    });
    if (!isFinite(bao.x0)) return null;
    var dai = Math.max(bao.x1 - bao.x0, bao.y1 - bao.y0) / 40, S = 40;   // đơn vị thế giới cho 1 cm
    if (dai > 8) S = 40 * dai / 7; else if (dai > 0 && dai < 3) S = 40 * dai / 4;
    var X0 = bao.x0, Y0 = bao.y1;
    function cm(P) { return { x: (P.x - X0) / S, y: (Y0 - P.y) / S }; }
    function xy(P) { var q = cm(P); return '(' + so(q.x) + ',' + so(q.y) + ')'; }
    function dai2(a, b) { return Math.hypot(a.x - b.x, a.y - b.y) / S; }

    // ---------- tên toạ độ ----------
    var tenTZ = {}, daDung = {}, demPhu = 0;
    function ten(id) {
      if (tenTZ[id]) return tenTZ[id];
      var o = theoId[id], t = o && o.ten ? String(o.ten).replace(/[^A-Za-z0-9']/g, '') : '';
      if (!t || daDung[t]) { do { t = 'p' + (++demPhu); } while (daDung[t]); }
      daDung[t] = 1; tenTZ[id] = t; return t;
    }
    // ---------- cách dựng từng điểm ----------
    var dinhNghia = {}, phuThuoc = {}, can = {};
    function laDiem(id) { var v = gt[id]; return v && v.k === 'diem'; }
    // Một đường thẳng → hai "điểm" (tên hoặc biểu thức calc) để dùng trong intersection of / kéo dài
    function haiDiem(o) {
      if (!o) return null; var v = gt[o.id]; if (!v || v.k !== 'thang') return null;
      function d(id) { can[id] = 1; return { ten: id, P: cm(gt[id]) }; }
      function quay90(T, A) { return { x: T.x - (A.y - T.y), y: T.y + (A.x - T.x) }; }   // quay A quanh T góc 90° (toạ độ TikZ)
      switch (o.loai) {
        case 'doan': case 'duong': case 'tia': return laDiem(o.a) && laDiem(o.b) ? [d(o.a), d(o.b)] : null;
        case 'vuongGoc': case 'songSong': {
          var L = haiDiem(theoId[o.d]); if (!L || !laDiem(o.a)) return null; var A = d(o.a);
          var Q = o.loai === 'vuongGoc' ? (function () { var r = quay90(L[0].P, L[1].P); return { x: A.P.x + r.x - L[0].P.x, y: A.P.y + r.y - L[0].P.y }; })() : { x: A.P.x + L[1].P.x - L[0].P.x, y: A.P.y + L[1].P.y - L[0].P.y };
          return [A, { calc: o.loai === 'vuongGoc' ? '(' + R(A) + ')+($(' + R(L[0]) + ')!1!90:(' + R(L[1]) + ')$)-(' + R(L[0]) + ')' : '(' + R(A) + ')+(' + R(L[1]) + ')-(' + R(L[0]) + ')', deps: [o.a].concat(depsCua(L)), P: Q }];
        }
        case 'trungTruc': {
          if (!laDiem(o.a) || !laDiem(o.b)) return null; var Ta = d(o.a).P, Tb = d(o.b).P, Mt = { x: (Ta.x + Tb.x) / 2, y: (Ta.y + Tb.y) / 2 };
          return [{ calc: '(' + R({ ten: o.a }) + ')!0.5!(' + R({ ten: o.b }) + ')', deps: [o.a, o.b], P: Mt }, { calc: '(' + R({ ten: o.a }) + ')!0.5!(' + R({ ten: o.b }) + ')!1!90:(' + R({ ten: o.b }) + ')', deps: [o.a, o.b], P: quay90(Mt, Tb) }];
        }
        case 'phanGiac': if (!laDiem(o.a) || !laDiem(o.o) || !laDiem(o.b)) return null; var Pa = d(o.a).P, Po = d(o.o).P, Pb = d(o.b).P, la = Math.hypot(Pa.x - Po.x, Pa.y - Po.y), lb = Math.hypot(Pb.x - Po.x, Pb.y - Po.y);
          var Pg = { x: Po.x + ((Pa.x - Po.x) / la + (Pb.x - Po.x) / lb) / 2, y: Po.y + ((Pa.y - Po.y) / la + (Pb.y - Po.y) / lb) / 2 };
          return [{ ten: o.o, P: Po }, { P: Pg, calc: '($(' + R({ ten: o.o }) + ')!1cm!(' + R({ ten: o.a }) + ')$)!.5!($(' + R({ ten: o.o }) + ')!1cm!(' + R({ ten: o.b }) + ')$)', deps: [o.a, o.o, o.b] }];
      }
      return null;
    }
    function depsCua(L) { var ds = []; L.forEach(function (p) { if (p.ten) ds.push(p.ten); else ds = ds.concat(p.deps); }); return ds; }
    function R(p) { return p.ten ? '§' + p.ten + '§' : '$' + p.calc + '$'; }   // § id § thay bằng tên sau
    function trongGiao(p) { return p.ten ? '§' + p.ten + '§' : '{$' + p.calc + '$}'; }
    function trongDuong(p) { return p.ten ? '(§' + p.ten + '§)' : '($' + p.calc + '$)'; }
    function thucHien(id) {
      if (id in dinhNghia) return; dinhNghia[id] = null;
      var o = theoId[id], v = gt[id], s = null, deps = [];
      function D(x) { deps.push(x); can[x] = 1; return '§' + x + '§'; }
      if (o && v) switch (o.loai) {
        case 'trungDiem': if (laDiem(o.a) && laDiem(o.b)) s = '($(' + D(o.a) + ')!0.5!(' + D(o.b) + ')$)'; break;
        case 'chanCao': if (laDiem(o.a) && laDiem(o.b) && laDiem(o.c)) s = '($(' + D(o.b) + ')!(' + D(o.a) + ')!(' + D(o.c) + ')$)'; break;
        case 'trongTam': if (laDiem(o.a) && laDiem(o.b) && laDiem(o.c)) s = '($(' + D(o.a) + ')!2/3!($(' + D(o.b) + ')!0.5!(' + D(o.c) + ')$)$)'; break;
        case 'trucTam': if (laDiem(o.a) && laDiem(o.b) && laDiem(o.c)) { var a = D(o.a), b = D(o.b), c = D(o.c); s = '(intersection of ' + a + '--{$(' + b + ')!(' + a + ')!(' + c + ')$} and ' + b + '--{$(' + a + ')!(' + b + ')!(' + c + ')$})'; } break;
        case 'giao': {
          var L1 = haiDiem(theoId[o.o1]), L2 = haiDiem(theoId[o.o2]);
          if (L1 && L2) { depsCua(L1).concat(depsCua(L2)).forEach(function (x) { deps.push(x); can[x] = 1; }); s = '(intersection of ' + trongGiao(L1[0]) + '--' + trongGiao(L1[1]) + ' and ' + trongGiao(L2[0]) + '--' + trongGiao(L2[1]) + ')'; }
          break;
        }
        case 'diemTren': {
          var T = theoId[o.tren], vt = gt[o.tren];
          if (vt && vt.k === 'tron' && T && (T.loai === 'tron' || T.loai === 'tronBanKinh' || T.loai === 'compa') && laDiem(T.o)) { var g = Math.atan2(-(v.y - vt.c.y), v.x - vt.c.x) / RAD; s = '($(' + D(T.o) + ')+(' + so(g, 1) + ':' + tenBK(T.id, vt.r) + ')$)'; }
          else if (vt && vt.k === 'thang' && T && laDiem(T.a) && laDiem(T.b) && (T.loai === 'doan' || T.loai === 'duong' || T.loai === 'tia')) { var A = gt[T.a], B = gt[T.b], ux = B.x - A.x, uy = B.y - A.y, t = ((v.x - A.x) * ux + (v.y - A.y) * uy) / (ux * ux + uy * uy); s = '($(' + D(T.a) + ')!' + so(t, 3) + '!(' + D(T.b) + ')$)'; }
          break;
        }
        case 'bienHinh': {
          if (!laDiem(o.nguon)) break; var P = D(o.nguon);
          if (o.kieu === 'quay' && laDiem(o.tam)) s = '($(' + D(o.tam) + ')!1!' + so(o.goc || 0, 2) + ':(' + P + ')$)';
          else if (o.kieu === 'dxTam' && laDiem(o.tam)) s = '($(' + P + ')!2!(' + D(o.tam) + ')$)';
          else if (o.kieu === 'viTu' && laDiem(o.tam)) s = '($(' + D(o.tam) + ')!' + so(o.k == null ? 2 : o.k, 3) + '!(' + P + ')$)';
          else if (o.kieu === 'tinhTien' && laDiem(o.v1) && laDiem(o.v2)) s = '($(' + P + ')+(' + D(o.v2) + ')-(' + D(o.v1) + ')$)';
          else if (o.kieu === 'dxTruc') { var Lt = haiDiem(theoId[o.truc]); if (Lt && Lt[0].ten && Lt[1].ten) s = '($(' + P + ')!2!($(' + D(Lt[0].ten) + ')!(' + P + ')!(' + D(Lt[1].ten) + ')$)$)'; }
          break;
        }
      }
      if (!s) { s = xy(v); deps = []; }   // điểm tự do hoặc chưa có cách dựng tương ứng: toạ độ
      dinhNghia[id] = s; phuThuoc[id] = deps;
      deps.forEach(thucHien);
    }
    // bán kính đường tròn: khai báo bằng declare function (r, r1, r2…)
    var banKinh = [], tenBKCua = {};
    function tenBK(idTron, r) {
      if (tenBKCua[idTron]) return tenBKCua[idTron];
      var gtR = so(r / S), cu = banKinh.filter(function (b) { return b.gt === gtR; })[0];
      if (cu) return (tenBKCua[idTron] = cu.ten);
      var t = banKinh.length ? 'r' + banKinh.length : 'r'; banKinh.push({ ten: t, gt: gtR }); return (tenBKCua[idTron] = t);
    }

    // ---------- bước 2: các nét vẽ ----------
    var canh = [], canhDut = [], tronVe = [], ngoai = [];
    function themCanh(a, b, dut) { (dut ? canhDut : canh).push([a, b]); can[a] = 1; can[b] = 1; }
    chon.forEach(function (o) {
      var v = gt[o.id]; if (!v || o.an) return; var dut = o.kieuNet && o.kieuNet !== 'lien';
      if (v.k === 'thang') {
        if (o.loai === 'doan' && laDiem(o.a) && laDiem(o.b)) return themCanh(o.a, o.b, dut);
        var L = haiDiem(o); if (!L) L = [{ thuong: true, P: cm(v.p) }, { thuong: true, P: cm(v.q) }];
        // kéo dài trong khung hình (tính trên toạ độ TikZ của chính hai điểm dùng trong mã)
        var P = L[0].P, Q = L[1].P, ux = Q.x - P.x, uy = Q.y - P.y, ts = [], g0 = cm({ x: bao.x0, y: bao.y1 }), g1 = cm({ x: bao.x1, y: bao.y0 });
        [[g0.x, g0.y], [g1.x, g0.y], [g0.x, g1.y], [g1.x, g1.y]].forEach(function (g) { ts.push(((g[0] - P.x) * ux + (g[1] - P.y) * uy) / (ux * ux + uy * uy)); });
        var lo = Math.min.apply(null, ts), hi = Math.max.apply(null, ts), du = (hi - lo) * 0.08; lo -= du; hi += du;
        if (o.loai === 'tia' || v.loai === 'tia') lo = 0;
        if (o.loai === 'doan') { lo = 0; hi = 1; }
        function diemTrenDuong(t) { if (L[0].thuong) return '(' + so(P.x + ux * t) + ',' + so(P.y + uy * t) + ')'; if (Math.abs(t) < 1e-9) return trongDuong(L[0]); if (Math.abs(t - 1) < 1e-9) return trongDuong(L[1]); return '($' + trongDuong(L[0]) + '!' + so(t, 2) + '!' + trongDuong(L[1]) + '$)'; }
        if (!L[0].thuong) depsCua(L).forEach(function (x) { can[x] = 1; });
        ngoai.push({ dut: dut, s: diemTrenDuong(lo) + '--' + diemTrenDuong(hi) });
        return;
      }
      if (v.k === 'daGiac') { var ds = o.ds; for (var i = 0; i < ds.length; i++) themCanh(ds[i], ds[(i + 1) % ds.length], dut); return; }
      if (v.k === 'gapKhuc') { for (var j = 0; j + 1 < o.ds.length; j++) themCanh(o.ds[j], o.ds[j + 1], dut); return; }
      if (v.k === 'tron') {
        var tam = (o.loai === 'tron' || o.loai === 'tronBanKinh' || o.loai === 'compa') && laDiem(o.o) ? o.o : null;
        if (tam) can[tam] = 1;
        tronVe.push({ dut: dut, tam: tam, c: v.c, r: tenBK(o.id, v.r) }); return;
      }
      if (v.k === 'cung') {
        var g0 = -v.a0 / RAD, g1 = -(v.a0 + v.da) / RAD, rr = so(v.r / S), C = v.c, S0 = { x: C.x + v.r * Math.cos(v.a0), y: C.y + v.r * Math.sin(v.a0) };
        var tamC = (o.loai === 'cungTam' || o.loai === 'quatTam') && laDiem(o.o) ? o.o : null; if (tamC) can[tamC] = 1;
        var dau = tamC ? '($(§' + tamC + '§)+(' + so(g0, 1) + ':' + rr + ')$)' : xy(S0), cung = dau + ' arc (' + so(g0, 1) + ':' + so(g1, 1) + ':' + rr + ')';
        if (v.quat && tamC) cung = '(§' + tamC + '§)--' + cung + '--cycle';
        ngoai.push({ dut: dut, s: cung }); return;
      }
      if (v.k === 'cong') { v.nhanh.forEach(function (ds2) { var buoc = Math.max(1, Math.floor(ds2.length / 60)), pts = []; for (var k = 0; k < ds2.length; k += buoc) pts.push(xy(ds2[k])); ngoai.push({ dut: dut, s: 'plot[smooth] coordinates {' + pts.join(' ') + '}' }); }); return; }
      if (v.k === 'khoi') ghiChu.push('% Hình không gian (' + (GI.khoi && GI.khoi.TEN[o.dang] || 'khối') + ') chưa xuất được');
    });
    // điểm hiện trên hình
    var hienDiem = [];
    chon.forEach(function (o) { var v = gt[o.id]; if (v && v.k === 'diem' && !o.an && !o.chamAn) { hienDiem.push(o.id); can[o.id] = 1; } });
    // các điểm đầu mút của nét vẽ cũng hiện chấm nếu trên bảng đang hiện
    Object.keys(can).forEach(function (id) { var o = theoId[id]; if (o && !o.an && !o.chamAn && hienDiem.indexOf(id) < 0 && gt[id] && gt[id].k === 'diem') hienDiem.push(id); });

    // ---------- bước 3: chú thích ----------
    var gocTheoKieu = {}, gocCoSo = [], vuong = [], kyHieu = { 1: [], 2: [], 3: [] };
    chon.forEach(function (o) {
      var v = gt[o.id]; if (!v || o.an) return;
      if ((o.loai === 'goc' || o.loai === 'gocVuong') && laDiem(o.a) && laDiem(o.o) && laDiem(o.b)) {
        can[o.a] = can[o.o] = can[o.b] = 1;
        var A = gt[o.a], O = gt[o.o], B = gt[o.b], cr = (A.x - O.x) * (B.y - O.y) - (A.y - O.y) * (B.x - O.x);   // < 0: từ OA quay ngược chiều kim đồng hồ (nhìn trên màn) tới OB
        var ba = cr < 0 ? [o.a, o.o, o.b] : [o.b, o.o, o.a];
        if (o.loai === 'gocVuong') { vuong.push(ba); return; }
        var n = o.cung === 0 ? 0 : (o.cung || 1), gach = o.gach === true ? 1 : (o.gach || 0), k = n + '|' + gach;
        if (!o.anSo || (o.nhanGoc && o.nhanGoc.length)) {
          var nh = o.nhanGoc && o.nhanGoc.length ? o.nhanGoc[0].nd : soVN(v.do) + '^\\circ'; gocCoSo.push({ ba: ba, nhan: nh.replace(/°/g, '^\\circ'), ve: n === 1 && !gach });
          if (n === 1 && !gach) return;
        }
        if (n > 0) (gocTheoKieu[k] = gocTheoKieu[k] || []).push(ba);
      }
      if (o.loai === 'doan' && o.kyHieu && kyHieu[o.kyHieu] && laDiem(o.a) && laDiem(o.b)) kyHieu[o.kyHieu].push([o.a, o.b]);
      // đường vuông góc có dấu góc vuông ở chân: cần một điểm đã có tại chân đường
      if (o.loai === 'vuongGoc' && o.kyHieuVuong !== false && laDiem(o.a)) {
        var Ld = theoId[o.d], vd = gt[o.d]; if (!Ld || !vd || vd.k !== 'thang') return;
        var A2 = gt[o.a], ux = vd.q.x - vd.p.x, uy = vd.q.y - vd.p.y, t = ((A2.x - vd.p.x) * ux + (A2.y - vd.p.y) * uy) / (ux * ux + uy * uy), F = { x: vd.p.x + ux * t, y: vd.p.y + uy * t };
        var chan = chon.concat(Object.keys(can).map(function (id) { return theoId[id]; })).filter(function (x) { return x && laDiem(x.id) && x.id !== o.a && Math.hypot(gt[x.id].x - F.x, gt[x.id].y - F.y) < 0.5; })[0];
        var ben = [Ld.a, Ld.b].filter(function (id) { return id && laDiem(id) && Math.hypot(gt[id].x - F.x, gt[id].y - F.y) > 1; })[0];
        if (chan && ben) { can[chan.id] = can[ben] = can[o.a] = 1; var cr2 = (A2.x - F.x) * (gt[ben].y - F.y) - (A2.y - F.y) * (gt[ben].x - F.x); vuong.push(cr2 < 0 ? [o.a, chan.id, ben] : [ben, chan.id, o.a]); }
      }
    });
    function soVN(x) { return so(x, 1).replace('.', '{,}'); }

    // ---------- gom các điểm cần khai báo (kèm điểm mà chúng dựng từ) ----------
    Object.keys(can).forEach(thucHien);
    var thuTu = [], daXep = {};
    function xep(id) { if (daXep[id]) return; daXep[id] = 1; (phuThuoc[id] || []).forEach(xep); thuTu.push(id); }
    // điểm tự do trước, rồi điểm dựng theo thứ tự phụ thuộc
    Object.keys(dinhNghia).filter(function (id) { return !(phuThuoc[id] || []).length; }).forEach(xep);
    Object.keys(dinhNghia).forEach(xep);
    thuTu.forEach(ten);
    function thayTen(s) { return s.replace(/§([^§]+)§/g, function (m, id) { return ten(id); }); }

    // ---------- ghép đoạn thành chuỗi dài nhất ----------
    function chuoi(ds) {
      var con = ds.map(function (e) { return { a: e[0], b: e[1], dung: false }; }), ke = {}, kq = [];
      // bỏ đoạn trùng
      var thay = {}; con = con.filter(function (e) { var k = [e.a, e.b].sort().join('|'); if (thay[k]) return false; thay[k] = 1; return true; });
      con.forEach(function (e) { (ke[e.a] = ke[e.a] || []).push(e); (ke[e.b] = ke[e.b] || []).push(e); });
      function bac(x) { return (ke[x] || []).filter(function (e) { return !e.dung; }).length; }
      for (;;) {
        var conLai = con.filter(function (e) { return !e.dung; }); if (!conLai.length) break;
        var dau = null; conLai.forEach(function (e) { if (!dau && bac(e.a) % 2) dau = e.a; else if (!dau && bac(e.b) % 2) dau = e.b; });
        if (!dau) dau = conLai[0].a;
        var duong = [dau], hien = dau;
        for (;;) { var e = (ke[hien] || []).filter(function (x) { return !x.dung; })[0]; if (!e) break; e.dung = true; hien = e.a === hien ? e.b : e.a; duong.push(hien); }
        kq.push(duong);
      }
      // tách vòng khép kín (về lại điểm đầu) thành --cycle, phần còn lại thành chuỗi riêng
      var manh = [];
      kq.forEach(function (d) {
        for (;;) {
          var k = -1; for (var i = 3; i < d.length; i++) if (d[i] === d[0]) { k = i; break; }
          if (k < 0) { if (d.length > 1) manh.push({ ds: d, kin: false }); break; }
          manh.push({ ds: d.slice(0, k), kin: true }); d = d.slice(k);
        }
      });
      return manh.map(function (m) { return m.ds.map(function (id) { return '(' + ten(id) + ')'; }).join('--') + (m.kin ? '--cycle' : ''); });
    }

    // ---------- ghép mã ----------
    var dong = [];
    var tuyChon = 'scale=1, font=\\footnotesize, line join=round, line cap=round, >=stealth';
    if (banKinh.length) tuyChon += ', declare function={' + banKinh.map(function (b) { return b.ten + '=' + b.gt + ';'; }).join('') + '}';
    dong.push('\\begin{tikzpicture}[' + tuyChon + ']');
    dong.push('% BƯỚC 1 — KHAI BÁO ĐIỂM');
    if (thuTu.length) {
      dong.push('\\path ' + thuTu.map(function (id, k) { return (k ? '      ' : '') + thayTen(dinhNghia[id]) + ' coordinate (' + ten(id) + ')'; }).join('\n'));
      dong.push(';');
    }
    dong.push('% BƯỚC 2 — VẼ');
    var lien = chuoi(canh).concat(tronVe.filter(function (t) { return !t.dut; }).map(function (t) { return (t.tam ? '(' + ten(t.tam) + ')' : xy(t.c)) + ' circle (' + t.r + ')'; })).concat(ngoai.filter(function (x) { return !x.dut; }).map(function (x) { return thayTen(x.s); }));
    if (lien.length) dong.push('\\draw ' + lien.join('\n      ') + ';');
    var dut = chuoi(canhDut).concat(tronVe.filter(function (t) { return t.dut; }).map(function (t) { return (t.tam ? '(' + ten(t.tam) + ')' : xy(t.c)) + ' circle (' + t.r + ')'; })).concat(ngoai.filter(function (x) { return x.dut; }).map(function (x) { return thayTen(x.s); }));
    if (dut.length) dong.push('\\draw[dashed] ' + dut.join('\n      ') + ';');
    var coChuThich = vuong.length || gocCoSo.length || Object.keys(gocTheoKieu).length || kyHieu[1].length || kyHieu[2].length || kyHieu[3].length;
    if (coChuThich) dong.push('% BƯỚC 3 — CHÚ THÍCH');
    function bo3(ds) { return ds.map(function (b) { return b.map(ten).join('/'); }).join(', '); }
    Object.keys(gocTheoKieu).sort().forEach(function (k) {
      var n = +k.split('|')[0], g = +k.split('|')[1], ds = gocTheoKieu[k];
      if (!g) {
        if (n === 1) dong.push('\\foreach \\x/\\y/\\z in {' + bo3(ds) + '}\n  \\path pic[draw=black, angle radius=10] {angle = \\x--\\y--\\z};');
        else dong.push('\\foreach \\x/\\y/\\z in {' + bo3(ds) + '} \\foreach \\solan in {' + [10, 13, 16].slice(0, n).join(',') + '}\n  \\path pic[draw=black, angle radius=\\solan] {angle = \\x--\\y--\\z};');
      } else {
        var bk = [10, 13, 16].slice(0, n), ngoaiCung = bk[bk.length - 1];
        dong.push('\\foreach \\x/\\y/\\z in {' + bo3(ds) + '}\n{' + (n === 1 ? '\\path pic[draw=black, angle radius=10] {angle = \\x--\\y--\\z}' : '\\foreach \\solan in {' + bk.join(',') + '} \\path pic[draw=black, angle radius=\\solan] {angle = \\x--\\y--\\z};\n \\path') +
          '\n       ($(\\x)!0.5!(\\z)$) coordinate (tdxz);' +
          (g === 1 ? '\n \\draw ($(\\y)!8pt!(tdxz)$)--($(\\y)!' + (ngoaiCung + 2) + 'pt!(tdxz)$);}' : '\n \\draw ($(\\y)!8pt!($(\\x)!0.4!(\\z)$)$)--($(\\y)!' + (ngoaiCung + 2) + 'pt!($(\\x)!0.4!(\\z)$)$)\n       ($(\\y)!8pt!($(\\x)!0.6!(\\z)$)$)--($(\\y)!' + (ngoaiCung + 2) + 'pt!($(\\x)!0.6!(\\z)$)$);}'));
      }
    });
    gocCoSo.forEach(function (g) { dong.push('\\path pic[' + (g.ve ? 'draw=black, ' : '') + 'angle radius=10, "$' + g.nhan + '$", angle eccentricity=1.9] {angle = ' + g.ba.map(ten).join('--') + '};'); });
    if (vuong.length) dong.push('\\foreach \\x/\\y/\\z in {' + bo3(vuong) + '}\n  \\path pic[draw=black, angle radius=6] {right angle = \\x--\\y--\\z};');
    function bo2(ds) { return ds.map(function (b) { return b.map(ten).join('/'); }).join(', '); }
    if (kyHieu[1].length) dong.push('\\foreach \\x/\\y in {' + bo2(kyHieu[1]) + '}\n  \\draw ($(\\x)!0.5!(\\y)!4pt!90:(\\x)$)--($(\\x)!0.5!(\\y)!4pt!-90:(\\x)$);');
    if (kyHieu[2].length) dong.push('\\foreach \\x/\\y in {' + bo2(kyHieu[2]) + '} \\foreach \\tl in {.49,.51}\n  \\draw ($(\\x)!\\tl!(\\y)!4pt!90:(\\x)$)--($(\\x)!\\tl!(\\y)!4pt!-90:(\\x)$);');
    if (kyHieu[3].length) dong.push('\\foreach \\x/\\y in {' + bo2(kyHieu[3]) + '} \\foreach \\tl in {.48,.5,.52}\n  \\draw ($(\\x)!\\tl!(\\y)!4pt!90:(\\x)$)--($(\\x)!\\tl!(\\y)!4pt!-90:(\\x)$);');
    // nhãn rời (tên đường, số đo…)
    chon.forEach(function (o) { var v = gt[o.id]; if (o.loai === 'nhanTZ' && v) { var p = xy(v); if (o.huong != null) p = '($' + p + '+(' + so(o.huong, 0) + ':' + so(o.kc || 0.25) + ')$)'; dong.push('\\node at ' + p + ' {' + texNhan(o.nd) + '};'); } });
    // ---------- bước 4: xuất hiện điểm ----------
    var coTen = hienDiem.filter(function (id) { return theoId[id].ten && theoId[id].hienTen !== false; }), khongTen = hienDiem.filter(function (id) { return coTen.indexOf(id) < 0; });
    if (coTen.length || khongTen.length) dong.push('% BƯỚC 4 — XUẤT HIỆN ĐIỂM');
    var tamHinh = { x: (bao.x0 + bao.x1) / 2, y: (bao.y0 + bao.y1) / 2 };
    function gocNhan(id) {
      var o = theoId[id], P = gt[id], g;
      if (o.huongTZ) g = o.huongTZ.g;
      else if (o.nhan) g = Math.atan2(-(o.nhan.dy - 12), o.nhan.dx + 12) / RAD;   // chỗ tên trên bảng (mặc định chếch lên phải)
      else { g = Math.atan2(-(P.y - tamHinh.y), P.x - tamHinh.x) / RAD; if (Math.hypot(P.x - tamHinh.x, P.y - tamHinh.y) < 1e-6) g = 90; }
      return Math.round(g / 45) * 45;
    }
    if (coTen.length) {
      var khac = coTen.some(function (id) { return ten(id) !== tenHien(id); });
      dong.push('\\foreach \\d/\\g' + (khac ? '/\\z' : '') + ' in {' + coTen.map(function (id) { return ten(id) + '/' + gocNhan(id) + (khac ? '/' + tenHien(id) : ''); }).join(', ') + '}\n  \\path[draw=black, fill=white] (\\d) circle (1pt) + (\\g:9pt) node {$\\' + (khac ? 'z' : 'd') + '$};');
    }
    if (khongTen.length) dong.push('\\foreach \\d in {' + khongTen.map(ten).join(', ') + '}\n  \\path[draw=black, fill=white] (\\d) circle (1pt);');
    function tenHien(id) { return texNhan(theoId[id].ten).replace(/^\$|\$$/g, ''); }
    ghiChu.forEach(function (g) { dong.push(g); });
    dong.push('\\end{tikzpicture}');
    return dong.join('\n');
  }
  function texNhan(t) {
    t = String(t || '');
    var m = /^([A-Za-z])(\d+)('*)$/.exec(t); if (m) return m[1] + '_' + m[2] + m[3];
    return t.replace(/°/g, '^\\circ').replace(/(\d),(\d)/g, '$1{,}$2');
  }
  return { xuat: xuat };
})();
