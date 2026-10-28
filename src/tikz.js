// Nhập hình từ mã TikZ thuần (theo khung 4 bước: khai báo điểm bằng calc → vẽ → chú thích → xuất hiện điểm).
// Mỗi điểm giữ nguyên CÁCH DỰNG (trung điểm, hình chiếu, phép quay, giao điểm…) dưới dạng biểu thức,
// nên kéo điểm gốc thì cả hình đổi theo như khi dựng bằng tay.
//
//   GI.tikz.nhap(maNguon, { taoId, viTri }) → { hinh: [đối tượng GeoInk], canhBao: [chuỗi], so: { diem, doan, … } }
//   GI.tikz.tinh(bt, layDiem)               → điểm (toạ độ TikZ, cm) của biểu thức bt; layDiem(id) trả điểm TikZ
window.GI = window.GI || {};
GI.tikz = (function () {
  var PT = 2.54 / 72.27;            // 1pt = ? cm
  var DON_VI = { pt: PT, cm: 1, mm: 0.1, 'in': 2.54, bp: 2.54 / 72, ex: 4.3 * PT, em: 10 * PT };
  var RAD = Math.PI / 180;

  /* ================== TÍNH BIỂU THỨC TOẠ ĐỘ (dùng cả khi vẽ lại) ================== */
  function quay(P, O, g) { var c = Math.cos(g * RAD), s = Math.sin(g * RAD), x = P.x - O.x, y = P.y - O.y; return { x: O.x + x * c - y * s, y: O.y + x * s + y * c }; }
  function giaoThang(A, B, C, D) {
    var d = (B.x - A.x) * (D.y - C.y) - (B.y - A.y) * (D.x - C.x); if (Math.abs(d) < 1e-12) return null;
    var t = ((C.x - A.x) * (D.y - C.y) - (C.y - A.y) * (D.x - C.x)) / d; return { x: A.x + (B.x - A.x) * t, y: A.y + (B.y - A.y) * t };
  }
  function tinh(n, lay) {
    if (!n) return null;
    switch (n.t) {
      case 'xy': return { x: n.x, y: n.y };
      case 'ref': return lay(n.id);
      case 'cong': case 'tru': { var a = tinh(n.a, lay), b = tinh(n.b, lay); if (!a || !b) return null; var k = n.t === 'cong' ? 1 : -1; return { x: a.x + k * b.x, y: a.y + k * b.y }; }
      case 'nhan': { var p = tinh(n.a, lay); return p ? { x: n.s * p.x, y: n.s * p.y } : null; }
      case 'tile': case 'kc': {
        var A = tinh(n.a, lay), B = tinh(n.b, lay); if (!A || !B) return null; if (n.g) B = quay(B, A, n.g);
        if (n.t === 'tile') return { x: A.x + (B.x - A.x) * n.s, y: A.y + (B.y - A.y) * n.s };
        var L = Math.hypot(B.x - A.x, B.y - A.y); if (L < 1e-12) return null; return { x: A.x + (B.x - A.x) * n.d / L, y: A.y + (B.y - A.y) * n.d / L };
      }
      case 'chieu': {
        var A2 = tinh(n.a, lay), P2 = tinh(n.p, lay), B2 = tinh(n.b, lay); if (!A2 || !P2 || !B2) return null;
        var ux = B2.x - A2.x, uy = B2.y - A2.y, L2 = ux * ux + uy * uy; if (L2 < 1e-12) return null; var t = ((P2.x - A2.x) * ux + (P2.y - A2.y) * uy) / L2;
        return { x: A2.x + ux * t, y: A2.y + uy * t };
      }
      case 'giao': { var ps = [n.a, n.b, n.c, n.d].map(function (q) { return tinh(q, lay); }); return ps.every(Boolean) ? giaoThang(ps[0], ps[1], ps[2], ps[3]) : null; }
      case 'xyTu': { var X = tinh(n.x, lay), Y = tinh(n.y, lay); return X && Y ? { x: X.x, y: Y.y } : null; }
      case 'giaoDuong': return giaoDuong(n, lay);
    }
    return null;
  }
  function banKinh(r, lay) {
    if (r.t === 'so') return r.v;
    if (r.t === 'daiVec') { var v = tinh(r.v, lay); return v ? Math.hypot(v.x, v.y) : null; }
    if (r.t === 'dai') { var a = tinh(r.a, lay), b = tinh(r.b, lay); return a && b ? Math.hypot(a.x - b.x, a.y - b.y) : null; }
    return null;
  }
  // giao điểm của hai đường đã đặt tên (name path): đoạn gấp khúc và / hoặc đường tròn
  function giaoDuong(n, lay) {
    function hinhCua(d) {
      if (d.loai === 'tron') { var c = tinh(d.c, lay), r = banKinh(d.r, lay); return c && r ? { tron: true, c: c, r: r } : null; }
      var ds = d.ds.map(function (q) { return tinh(q, lay); }); return ds.every(Boolean) ? { ds: ds } : null;
    }
    var H1 = hinhCua(n.p1), H2 = hinhCua(n.p2); if (!H1 || !H2) return null;
    var kq = [];   // { P, khoa (thứ tự dọc đường sort by) }
    function doanTron(A, B, T, chiSo, laThuNhat) {
      var dx = B.x - A.x, dy = B.y - A.y, fx = A.x - T.c.x, fy = A.y - T.c.y, a = dx * dx + dy * dy, b = 2 * (fx * dx + fy * dy), c = fx * fx + fy * fy - T.r * T.r, D = b * b - 4 * a * c;
      if (a < 1e-12 || D < 0) return; var s = Math.sqrt(D);
      [(-b - s) / (2 * a), (-b + s) / (2 * a)].forEach(function (t, i) { if (t < -1e-9 || t > 1 + 1e-9 || (i === 1 && s < 1e-12)) return; var P = { x: A.x + dx * t, y: A.y + dy * t }; kq.push({ P: P, k1: laThuNhat ? chiSo + t : Math.atan2(P.y - T.c.y, P.x - T.c.x), k2: laThuNhat ? Math.atan2(P.y - T.c.y, P.x - T.c.x) : chiSo + t }); });
    }
    if (H1.tron && H2.tron) {
      var d = Math.hypot(H2.c.x - H1.c.x, H2.c.y - H1.c.y); if (d < 1e-12 || d > H1.r + H2.r + 1e-9 || d < Math.abs(H1.r - H2.r) - 1e-9) return null;
      var a = (H1.r * H1.r - H2.r * H2.r + d * d) / (2 * d), h = Math.sqrt(Math.max(0, H1.r * H1.r - a * a)), ux = (H2.c.x - H1.c.x) / d, uy = (H2.c.y - H1.c.y) / d, M = { x: H1.c.x + ux * a, y: H1.c.y + uy * a };
      // thứ tự ổn định: điểm bên trái hướng tâm 1 → tâm 2 trước
      var L = [{ x: M.x - uy * h, y: M.y + ux * h }, { x: M.x + uy * h, y: M.y - ux * h }];
      return L[n.k] || null;
    }
    if (H1.tron || H2.tron) {
      var T = H1.tron ? H1 : H2, Dg = H1.tron ? H2 : H1;
      for (var i = 0; i + 1 < Dg.ds.length; i++) doanTron(Dg.ds[i], Dg.ds[i + 1], T, i, !H1.tron);
    } else {
      for (var i1 = 0; i1 + 1 < H1.ds.length; i1++) for (var i2 = 0; i2 + 1 < H2.ds.length; i2++) {
        var A = H1.ds[i1], B = H1.ds[i1 + 1], C = H2.ds[i2], D2 = H2.ds[i2 + 1], den = (B.x - A.x) * (D2.y - C.y) - (B.y - A.y) * (D2.x - C.x);
        if (Math.abs(den) < 1e-12) continue;
        var t = ((C.x - A.x) * (D2.y - C.y) - (C.y - A.y) * (D2.x - C.x)) / den, u = ((C.x - A.x) * (B.y - A.y) - (C.y - A.y) * (B.x - A.x)) / den;
        if (t < -1e-9 || t > 1 + 1e-9 || u < -1e-9 || u > 1 + 1e-9) continue;
        kq.push({ P: { x: A.x + (B.x - A.x) * t, y: A.y + (B.y - A.y) * t }, k1: i1 + t, k2: i2 + u });
      }
    }
    if (n.sx) kq.sort(function (p, q) { return n.sx === 1 ? p.k1 - q.k1 : p.k2 - q.k2; });
    return kq[n.k] ? kq[n.k].P : null;
  }

  /* ================== ĐỌC MÃ NGUỒN ================== */
  function boChuThich(s) { return s.split('\n').map(function (d) { var i = -1; for (var j = 0; j < d.length; j++) if (d[j] === '%' && d[j - 1] !== '\\') { i = j; break; } return i < 0 ? d : d.slice(0, i); }).join('\n'); }
  var MO = { '(': ')', '[': ']', '{': '}' };
  function khop(s, i) {   // vị trí dấu đóng ứng với s[i] (ngoặc tròn, vuông, nhọn lồng nhau)
    var ngan = [];
    for (var j = i; j < s.length; j++) {
      var ch = s[j];
      if (ch === '\\') { j++; continue; }
      if (MO[ch]) ngan.push(MO[ch]);
      else if (ch === ')' || ch === ']' || ch === '}') {
        var k = ngan.lastIndexOf(ch); if (k < 0) continue;
        ngan.length = k; if (!ngan.length) return j;
      }
    }
    return -1;
  }
  function tach(s, dau) {   // tách theo dấu ở độ sâu 0
    var kq = [], sau = 0, cu = 0;
    for (var j = 0; j < s.length; j++) {
      var ch = s[j]; if (ch === '\\') { j++; continue; }
      if (ch === '(' || ch === '[' || ch === '{') sau++; else if (ch === ')' || ch === ']' || ch === '}') sau--;
      else if (sau === 0 && s.substr(j, dau.length) === dau) { kq.push(s.slice(cu, j)); cu = j + dau.length; j += dau.length - 1; }
    }
    kq.push(s.slice(cu)); return kq;
  }
  function boNgoac(s) { s = s.trim(); while (s.charAt(0) === '{' && khop(s, 0) === s.length - 1) s = s.slice(1, -1).trim(); return s; }
  function tuyChon(s) {   // "[a=1, dashed, \"$1$\"]" (không có ngoặc) → { khoa: giá trị }
    var o = {}; if (!s) return o;
    tach(s, ',').forEach(function (p) {
      p = p.trim(); if (!p) return;
      if (p.charAt(0) === '"') { var j = p.indexOf('"', 1); o._nhan = p.slice(1, j); p = p.slice(j + 1).trim(); if (!p) return; }
      var i = -1, sau = 0; for (var j2 = 0; j2 < p.length; j2++) { var c = p[j2]; if (c === '{' || c === '(' || c === '[') sau++; else if (c === '}' || c === ')' || c === ']') sau--; else if (c === '=' && sau === 0) { i = j2; break; } }
      if (i < 0) o[p.replace(/\s+/g, ' ')] = true; else o[p.slice(0, i).trim().replace(/\s+/g, ' ')] = boNgoac(p.slice(i + 1));
    });
    return o;
  }

  // ---------- số học (pgfmath rút gọn) ----------
  function soHoc(s, ham) {
    s = String(s).trim(); var coDV = /\d\s*(pt|cm|mm|in|bp|ex|em)\b/.test(s), i = 0;
    function bo() { while (i < s.length && /\s/.test(s[i])) i++; }
    function tong() { var v = tich(); for (;;) { bo(); var c = s[i]; if (c === '+') { i++; v += tich(); } else if (c === '-') { i++; v -= tich(); } else return v; } }
    function tich() { var v = mu(); for (;;) { bo(); var c = s[i]; if (c === '*') { i++; v *= mu(); } else if (c === '/') { i++; v /= mu(); } else return v; } }
    function mu() { var v = don(); bo(); if (s[i] === '^') { i++; v = Math.pow(v, mu()); } return v; }
    function don() {
      bo(); var c = s[i];
      if (c === '-') { i++; return -mu(); } if (c === '+') { i++; return mu(); }   // -x^2 = -(x^2) như TikZ
      if (c === '(' || c === '{') { var j = khop(s, i), v = soHoc(s.slice(i + 1, j), ham); i = j + 1; return v; }
      var m = /^(\d*\.\d+|\d+\.?)(\s*(pt|cm|mm|in|bp|ex|em)\b)?/.exec(s.slice(i));
      if (m) { i += m[0].length; var x = parseFloat(m[1]); if (m[3]) return x * DON_VI[m[3]]; return coDV ? x * PT : x; }
      var t = /^[A-Za-z_][A-Za-z_0-9]*/.exec(s.slice(i));
      if (t) {
        i += t[0].length; var ten = t[0]; bo();
        if (s[i] === '(') { var j2 = khop(s, i), ds = tach(s.slice(i + 1, j2), ',').map(function (x) { return soHoc(x, ham); }); i = j2 + 1;
          var f = { sin: function (a) { return Math.sin(a * RAD); }, cos: function (a) { return Math.cos(a * RAD); }, tan: function (a) { return Math.tan(a * RAD); }, sqrt: Math.sqrt, abs: Math.abs,
            veclen: function (a, b) { return Math.hypot(a, b); }, atan: function (a) { return Math.atan(a) / RAD; }, atan2: function (a, b) { return Math.atan2(a, b) / RAD; }, asin: function (a) { return Math.asin(a) / RAD; }, acos: function (a) { return Math.acos(a) / RAD; },
            min: Math.min, max: Math.max, exp: Math.exp, ln: Math.log, pow: Math.pow, round: Math.round, floor: Math.floor, ceil: Math.ceil, deg: function (a) { return a / RAD; }, rad: function (a) { return a * RAD; } }[ten];
          if (!f) throw new Error('Hàm chưa hỗ trợ: ' + ten); return f.apply(null, ds); }
        if (ten === 'pi') return Math.PI; if (ten === 'e') return Math.E;
        if (ham && ten in ham) return ham[ten];
        throw new Error('Không hiểu “' + ten + '”');
      }
      throw new Error('Không đọc được số trong “' + s + '”');
    }
    var v = tong(); bo(); if (i < s.length) throw new Error('Thừa kí tự trong “' + s + '”'); return v;
  }

  // ---------- chữ trong nhãn ($...$) → chữ thường ----------
  var HY_LAP = { alpha: 'α', beta: 'β', gamma: 'γ', delta: 'δ', varepsilon: 'ε', epsilon: 'ε', varphi: 'φ', phi: 'φ', theta: 'θ', lambda: 'λ', mu: 'μ', pi: 'π', rho: 'ρ', sigma: 'σ', tau: 'τ', omega: 'ω', Delta: 'Δ', Omega: 'Ω' };
  var MU = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻' };
  // Màu kiểu xcolor: red, gray!50, blue!30!green … → mã hex
  var MAU_GOC = { black: [0, 0, 0], white: [255, 255, 255], red: [255, 0, 0], green: [0, 255, 0], blue: [0, 0, 255], cyan: [0, 255, 255], magenta: [255, 0, 255], yellow: [255, 255, 0],
    gray: [128, 128, 128], grey: [128, 128, 128], darkgray: [64, 64, 64], lightgray: [191, 191, 191], brown: [191, 128, 64], lime: [191, 255, 0], olive: [128, 128, 0], orange: [255, 128, 0],
    pink: [255, 191, 191], purple: [191, 0, 64], teal: [0, 128, 128], violet: [128, 0, 128] };
  function mauTikz(t) {
    t = String(t || '').trim(); if (!t || t === 'none') return null;
    var m = /^#?([0-9a-fA-F]{6})$/.exec(t); if (m) return '#' + m[1];
    var ph = t.split('!').map(function (x) { return x.trim(); }), c = MAU_GOC[ph[0]]; if (!c) return null;
    for (var i = 1; i < ph.length; i += 2) {
      var p = Math.max(0, Math.min(100, parseFloat(ph[i]))) / 100, d = MAU_GOC[ph[i + 1]] || MAU_GOC.white; if (!isFinite(p)) return null;
      c = [0, 1, 2].map(function (k) { return c[k] * p + d[k] * (1 - p); });
    }
    return '#' + c.map(function (v) { return Math.round(v).toString(16).padStart(2, '0'); }).join('');
  }
  function laMau(k) { return /^[a-z]+(![0-9.]+(![a-z]+)?)*$/.test(k) && MAU_GOC[k.split('!')[0]] !== undefined; }
  function chuNhan(s) {
    s = String(s);
    s = s.replace(/\\text\{([^}]*)\}/g, '$1').replace(/\{,\}/g, ',').replace(/\^\\circ|\^\{\\circ\}|\\circ/g, '°').replace(/\\%/g, '%');
    s = s.replace(/\\([A-Za-z]+)/g, function (m, t) { return HY_LAP[t] || (t === 'prime' ? "'" : t === 'cdot' ? '·' : t === 'times' ? '×' : t === 'parallel' ? '∥' : t === 'perp' ? '⊥' : t === 'angle' ? '∠' : ''); });
    s = s.replace(/\^\{([^}]*)\}|\^(.)/g, function (m, a, b) { return (a || b).split('').map(function (c) { return MU[c] || c; }).join(''); });
    s = s.replace(/_\{([^}]*)\}|_(.)/g, '$1$2');
    return s.replace(/[${}]/g, '').replace(/\s+/g, ' ').trim();
  }

  /* ================== DỊCH MÃ ================== */
  function nhap(ma, cfg) {
    cfg = cfg || {};
    var canhBao = [], macro = {}, ham = {}, ten = {}, nut = [], tyLe = 1;
    var dvX = 1, dvY = 1, dich = { x: 0, y: 0 }, chongDich = [], hcnTZ = [],
        duongTen = {}, doan = [], tron = [], cung = [], dsPlot = [], goc = [], gocVuong = [], nhan = [], xuatHien = {}, conLai = [];
    function bao(s) { if (canhBao.indexOf(s) < 0 && canhBao.length < 30) canhBao.push(s); }
    function nutMoi(bt, tenTZ) { nut.push({ bt: bt, ten: tenTZ }); return { t: 'ref', id: nut.length - 1 }; }
    function datTen(t, bt) { t = t.trim().replace(/\.(center|north|south|east|west).*$/, ''); var r = bt.t === 'ref' ? bt : nutMoi(bt, t); ten[t] = r.id; if (!nut[r.id].ten) nut[r.id].ten = t; return r; }
    function goiTen(t) { t = t.trim().replace(/\.(center|north|south|east|west|north east|north west|south east|south west)$/, ''); if (t in ten) return { t: 'ref', id: ten[t] }; throw new Error('Chưa khai báo điểm (' + t + ')'); }
    function so(s) { return soHoc(s, ham); }

    // ----- mở rộng macro (\def, biến của \foreach) -----
    function moRong(s, env) {
      for (var lan = 0; lan < 8; lan++) {
        var doi = false;
        s = s.replace(/\\([A-Za-z@]+)(?![A-Za-z@])/g, function (m, t, vt, toan) {
          var sau = toan.charAt(vt + m.length);
          if (/\d/.test(sau) && /^(x|y|p|n)$/.test(t)) return m;   // \x1, \p1 trong "let"
          if (env && t in env) { doi = true; return env[t]; }
          if (t in macro) { doi = true; return macro[t]; }
          return m;
        });
        if (!doi) break;
      }
      return s;
    }

    // ----- toạ độ -----
    function toaDo(s, env) {   // nội dung trong ( … )
      s = s.trim();
      if (s.charAt(0) === '$' && s.charAt(s.length - 1) === '$') return calc(s.slice(1, -1));
      var mI = /^intersection\s+of\s+(.+?)\s+and\s+(.+)$/.exec(s);
      if (mI) {
        var d1 = tach(mI[1], '--'), d2 = tach(mI[2], '--');
        if (d1.length !== 2 || d2.length !== 2) throw new Error('Không hiểu “' + s + '”');
        return { t: 'giao', a: diemTrong(d1[0]), b: diemTrong(d1[1]), c: diemTrong(d2[0]), d: diemTrong(d2[1]) };
      }
      if (env && env.let && /^\\p\d+$/.test(s)) return env.let[s];
      var dx0 = env && env.tuongDoi ? 0 : dich.x, dy0 = env && env.tuongDoi ? 0 : dich.y;   // dời theo scope[shift] (toạ độ tương đối ++ thì không)
      var p2 = tach(s, ':'); if (p2.length === 2) { var g = so(boNgoac(p2[0])), r = so(boNgoac(p2[1])); return { t: 'xy', x: r * Math.cos(g * RAD) * tyLe * dvX + dx0, y: r * Math.sin(g * RAD) * tyLe * dvY + dy0 }; }
      var p = tach(s, ','); if (p.length === 2) return { t: 'xy', x: so(boNgoac(p[0])) * tyLe * dvX + dx0, y: so(boNgoac(p[1])) * tyLe * dvY + dy0 };
      return goiTen(s);
    }
    function diemTrong(s) {   // điểm trong "intersection of A--B and …": tên, (toạ độ) hoặc {$…$}
      s = boNgoac(s);
      if (s.charAt(0) === '$') return calc(s.slice(1, -1));
      if (s.charAt(0) === '(' && khop(s, 0) === s.length - 1) return toaDo(s.slice(1, -1));
      if (/^[-\d.]/.test(s)) return toaDo(s);
      return goiTen(s);
    }
    // biểu thức calc: tổng các hạng; mỗi hạng [hệ số *] (toạ độ) [!…!…]*
    function calc(s) {
      var i = 0, kq = null, dau = 1;
      function bo() { while (i < s.length && /\s/.test(s[i])) i++; }
      function docToaDo() { bo(); if (s[i] !== '(') throw new Error('Thiếu “(” trong $' + s + '$'); var j = khop(s, i), v = toaDo(s.slice(i + 1, j)); i = j + 1; return v; }
      for (;;) {
        bo(); if (i >= s.length) break;
        if (s[i] === '+') { i++; dau = 1; continue; } if (s[i] === '-') { i++; dau = -1; continue; }
        var heSo = null;
        if (s[i] !== '(') { var j0 = s.indexOf('*', i); if (j0 < 0) throw new Error('Không hiểu $' + s + '$'); heSo = so(boNgoac(s.slice(i, j0))); i = j0 + 1; }
        var X = docToaDo();
        for (;;) {
          bo(); if (s[i] !== '!') break; i++;
          var j1 = i, sau = 0; for (; j1 < s.length; j1++) { var c = s[j1]; if (c === '(' || c === '{') sau++; else if (c === ')' || c === '}') sau--; else if (c === '!' && sau === 0) break; }
          var phan = s.slice(i, j1).trim(); i = j1 + 1; bo();
          if (phan.charAt(0) === '(') { var Y0 = docToaDo(); X = { t: 'chieu', a: X, p: toaDo(phan.slice(1, khop(phan, 0))), b: Y0 }; continue; }
          var gocQ = 0, k2 = s.indexOf('(', i), truoc = s.slice(i, k2);
          if (/:\s*$/.test(truoc)) { gocQ = so(boNgoac(truoc.replace(/:\s*$/, ''))); i = k2; }
          var Y = docToaDo();
          if (/\d\s*(pt|cm|mm|in|bp|ex|em)\b/.test(phan)) X = { t: 'kc', a: X, b: Y, d: so(phan), g: gocQ };
          else X = { t: 'tile', a: X, b: Y, s: so(boNgoac(phan)), g: gocQ };
        }
        if (heSo !== null) X = { t: 'nhan', s: heSo, a: X };
        kq = kq === null ? (dau < 0 ? { t: 'nhan', s: -1, a: X } : X) : { t: dau < 0 ? 'tru' : 'cong', a: kq, b: X };
        dau = 1;
      }
      return kq;
    }

    // giá trị bằng số (lúc nhập, để so sánh, sắp xếp)
    function gtNut(id) { var n = nut[id]; if (n._dang) return null; if (!n._gt) { n._dang = true; n._gt = tinh(n.bt, gtNut); n._dang = false; } return n._gt; }
    function gt(bt) { return tinh(bt, gtNut); }

    // ----- một câu lệnh vẽ -----
    function lenh(cau, env) {
      cau = cau.trim(); var m = /^\\(path|draw|fill|filldraw|node|coordinate|pic|clip|shade|shadedraw)\b/.exec(cau);
      if (!m) { if (/^\\(begin|end)\{scope\}/.test(cau)) return; bao('Bỏ qua lệnh: ' + cau.slice(0, 40)); return; }
      var lenhVe = m[1], s = cau.slice(m[0].length).trim(), opt = {};
      if (s.charAt(0) === '[') { var j = khop(s, 0); opt = tuyChon(s.slice(1, j)); s = s.slice(j + 1).trim(); }
      if (lenhVe === 'node') { // \node[..] (ten) at (..) {chữ}
        var mN = /^(\([^)]*\))?\s*at\s*/.exec(s), tenNode = null; if (mN) { s = s.slice(mN[0].length); }
        else if (s.charAt(0) === '(') { var jn = khop(s, 0); tenNode = s.slice(1, jn); s = s.slice(jn + 1).trim(); s = s.replace(/^at\s*/, ''); }
        var jc = s.charAt(0) === '(' ? khop(s, 0) : -1; if (jc < 0) return bao('Bỏ qua \\node không có toạ độ');
        s = s.slice(0, jc + 1) + ' node[' + Object.keys(opt).map(function (k) { return opt[k] === true ? k : k + '={' + opt[k] + '}'; }).join(',') + ']' + s.slice(jc + 1); opt = {}; lenhVe = 'path';
      }
      if (lenhVe === 'coordinate') { var mc = /^\(([^)]*)\)\s*at\s*/.exec(s); if (!mc) return bao('Bỏ qua \\coordinate'); s = s.slice(mc[0].length) + ' coordinate (' + mc[1] + ')'; lenhVe = 'path'; }
      if (lenhVe === 'pic') { s = 'pic' + (Object.keys(opt).length ? '[' + Object.keys(opt).map(function (k) { return k === '_nhan' ? '"' + opt[k] + '"' : opt[k] === true ? k : k + '={' + opt[k] + '}'; }).join(',') + ']' : '') + ' ' + s; opt = {}; lenhVe = 'path'; }
      var ve = lenhVe === 'draw' || lenhVe === 'filldraw' || lenhVe === 'shadedraw' || (opt.draw !== undefined && opt.draw !== 'none');
      var to = lenhVe === 'fill' || lenhVe === 'filldraw' || opt.fill !== undefined;
      var kieu = opt.dashed || opt['densely dashed'] || opt['loosely dashed'] ? 'dut' : opt.dotted || opt['densely dotted'] || opt['loosely dotted'] ? 'cham' : null;
      var khoaKieu = [lenhVe, opt.fill, opt.pattern, opt['pattern color'], opt.color, Object.keys(opt).filter(function (k) { return opt[k] === true && laMau(k); }).join('+')].join('|');   // nhận ra cùng một dãy số liệu (biểu đồ)
      var mauToHCN = typeof opt.fill === 'string' ? mauTikz(opt.fill) : null;
      var mui = Object.keys(opt).filter(function (k) { return /^(<|)-(>|stealth|latex|Stealth|Latex)?$|^<-$|^<->$|^-(>|stealth)$|^(<|stealth)-/.test(k) && k !== '-'; })[0];
      var duong = { ds: [], loai: null }, cur = null, goc0 = null, dauDuong = null, noi = false, i = 0, doanTrongLenh = [], dangCham = null, letEnv = {};
      if (opt['name path'] || opt['name path global']) duong.ten = opt['name path'] || opt['name path global'];
      if (opt['name intersections']) giaoTen(tuyChon(opt['name intersections']));
      function bo() { while (i < s.length && /\s/.test(s[i])) i++; }
      function themDiem(P) {
        if (noi && cur) { if (ve) doanTrongLenh.push({ a: cur, b: P }); duong.ds.push(P); }
        else { duong.ds = [P]; dauDuong = P; }
        cur = P; noi = false;
      }
      while (i < s.length) {
        bo(); if (i >= s.length) break; var r = s.slice(i);
        var mPlus = /^(\+\+|\+)\s*\(/.exec(r);
        if (r.charAt(0) === '(' || mPlus) {
          if (mPlus) i += mPlus[0].length - 1;
          var j2 = khop(s, i), bt = toaDo(s.slice(i + 1, j2), { let: letEnv, tuongDoi: !!mPlus }); i = j2 + 1;
          if (mPlus) { if (!goc0) throw new Error('Toạ độ tương đối không có điểm gốc'); bt = { t: 'cong', a: goc0, b: bt }; if (mPlus[1] === '++') goc0 = bt; }
          else goc0 = bt;
          if (mPlus && mPlus[1] === '+' && !noi) { cur = bt; continue; }   // +(…) chỉ để đặt nhãn / di chuyển, không nối
          themDiem(bt); continue;
        }
        if (/^--/.test(r)) { i += 2; noi = true; continue; }
        if (/^to\b/.test(r)) { i += 2; noi = true; continue; }
        if (/^(-\||\|-)/.test(r)) { var kieuGoc = r.slice(0, 2); i += 2; bo(); var j3 = khop(s, i), Q = toaDo(s.slice(i + 1, j3)); i = j3 + 1; var Gc = kieuGoc === '-|' ? { t: 'xyTu', x: Q, y: cur } : { t: 'xyTu', x: cur, y: Q }; noi = true; themDiem(Gc); noi = true; themDiem(Q); goc0 = Q; continue; }
        if (/^cycle\b/.test(r)) { i += 5; if (cur && dauDuong) { if (ve) doanTrongLenh.push({ a: cur, b: dauDuong }); duong.ds.push(dauDuong); cur = dauDuong; } noi = false; continue; }
        var mCo = /^coordinate\s*(\[[^\]]*\])?\s*\(([^)]*)\)(\s*at\s*\()?/.exec(r);
        if (mCo) {
          i += mCo[0].length;
          if (mCo[3]) { i--; var j4 = khop(s, i), bt4 = toaDo(s.slice(i + 1, j4)); i = j4 + 1; datTen(mCo[2], bt4); }
          else if (cur) {   // đặt tên cho điểm hiện tại: mọi chỗ đang dùng điểm này đổi sang tham chiếu tên
            var cu4 = cur, r4 = datTen(mCo[2], cu4);
            if (goc0 === cu4) goc0 = r4; if (dauDuong === cu4) dauDuong = r4; cur = r4;
            duong.ds = duong.ds.map(function (x) { return x === cu4 ? r4 : x; });
            doanTrongLenh.forEach(function (d) { if (d.a === cu4) d.a = r4; if (d.b === cu4) d.b = r4; });
          }
          continue;
        }
        if (/^node\b/.test(r)) {
          i += 4; bo(); var oN = {}; if (s[i] === '[') { var j5 = khop(s, i); oN = tuyChon(s.slice(i + 1, j5)); i = j5 + 1; bo(); }
          if (s[i] === '(') { i = khop(s, i) + 1; bo(); }
          var viTriN = null; if (/^at\s*\(/.test(s.slice(i))) { i = s.indexOf('(', i); var j6 = khop(s, i); viTriN = toaDo(s.slice(i + 1, j6)); i = j6 + 1; bo(); }
          if (s[i] !== '{') { bao('Nhãn thiếu nội dung'); continue; }
          var j7 = khop(s, i), chu = s.slice(i + 1, j7); i = j7 + 1;
          datNhan(chu, oN, viTriN);
          continue;
        }
        if (/^circle\b/.test(r)) {
          i += 6; bo(); var rBt = null;
          if (s[i] === '[') { var j8 = khop(s, i), oc = tuyChon(s.slice(i + 1, j8)); i = j8 + 1; rBt = { t: 'so', v: so(oc.radius || oc['x radius'] || '1') * tyLe }; }
          else if (s[i] === '(') { var j9 = khop(s, i), noiR = boNgoac(s.slice(i + 1, j9)); i = j9 + 1; rBt = banKinhTu(noiR, letEnv); }
          if (!cur || !rBt) { bao('Đường tròn thiếu tâm hoặc bán kính'); continue; }
          var rso = banKinh(rBt, gtNut);
          if (rBt.t === 'so' && rso <= 0.12) { dangCham = { P: cur, rong: rso, mau: to }; datCham(cur, to, rso < 0.6 * PT); }
          else { var tr = { c: cur, r: rBt, ve: ve, kieu: kieu }; if (ve) tron.push(tr); duong.loai = 'tron'; duong.c = cur; duong.r = rBt; }
          continue;
        }
        if (/^let\b/.test(r)) {
          var kIn = s.indexOf(' in', i); var noiLet = s.slice(i + 3, kIn); i = kIn + 3;
          tach(noiLet, ',').forEach(function (p) { var q = p.split('='); if (q.length === 2) { var tt = q[1].trim(); letEnv[q[0].trim()] = toaDo(tt.slice(1, khop(tt, 0))); } });
          continue;
        }
        if (/^pic\b/.test(r)) {
          i += 3; bo(); var oP = {}; if (s[i] === '[') { var jp = khop(s, i); oP = tuyChon(s.slice(i + 1, jp)); i = jp + 1; bo(); }
          if (s[i] === '"') { var jq = s.indexOf('"', i + 1); oP._nhan = s.slice(i + 1, jq); i = jq + 1; bo(); }
          if (s[i] !== '{') { bao('pic không hợp lệ'); continue; }
          var jr = khop(s, i), noiP = s.slice(i + 1, jr); i = jr + 1;
          var mp = /^\s*(right angle|angle)\s*=\s*(.+)$/.exec(noiP);
          if (!mp) { bao('Bỏ qua pic: ' + noiP); continue; }
          var ba = tach(mp[2], '--').map(function (x) { return goiTen(x); });
          if (ba.length !== 3) { bao('pic góc cần 3 điểm'); continue; }
          var veCung = (oP.draw !== undefined && oP.draw !== 'none') || ve;
          if (mp[1] === 'right angle') gocVuong.push({ a: ba[0], o: ba[1], b: ba[2] });
          else goc.push({ a: ba[0], o: ba[1], b: ba[2], ve: veCung, nhan: oP._nhan ? chuNhan(oP._nhan) : null, lech: oP['angle eccentricity'] ? so(oP['angle eccentricity']) : 0.6, kep: !!oP.double, bk: oP['angle radius'] ? so(String(oP['angle radius']).replace(/^([\d.]+)$/, '$1pt')) : null });
          continue;
        }
        if (/^arc\b/.test(r)) {   // arc (đầu:cuối:bán kính) hoặc arc[start angle=…, end angle=…, radius=…]
          i += 3; bo(); var g1, g2, rA;
          if (s[i] === '(') { var jA = khop(s, i), pA = tach(s.slice(i + 1, jA), ':'); i = jA + 1; g1 = so(boNgoac(pA[0])); g2 = so(boNgoac(pA[1])); rA = so(boNgoac(pA[2] || '1')) * tyLe; }
          else if (s[i] === '[') { var jA2 = khop(s, i), oA = tuyChon(s.slice(i + 1, jA2)); i = jA2 + 1; g1 = so(oA['start angle'] || '0'); g2 = oA['end angle'] !== undefined ? so(oA['end angle']) : g1 + so(oA.delta || '90'); rA = so(oA.radius || '1') * tyLe; }
          if (!cur || !isFinite(rA)) { bao('Cung tròn thiếu thông tin'); continue; }
          var tamA = { t: 'cong', a: cur, b: { t: 'xy', x: -rA * Math.cos(g1 * RAD), y: -rA * Math.sin(g1 * RAD) } }, cuoiA = { t: 'cong', a: tamA, b: { t: 'xy', x: rA * Math.cos(g2 * RAD), y: rA * Math.sin(g2 * RAD) } };
          if (ve) cung.push({ c: tamA, a: g2 >= g1 ? cur : cuoiA, b: g2 >= g1 ? cuoiA : cur, kieu: kieu });
          cur = cuoiA; goc0 = cuoiA; noi = false; continue;
        }
        if (/^plot\b/.test(r)) {   // plot (\x,{f(\x)}) với domain, samples, variable · plot coordinates {(…) (…)}
          i += 4; bo(); var oPl = {}; if (s[i] === '[') { var jPl = khop(s, i); oPl = tuyChon(s.slice(i + 1, jPl)); i = jPl + 1; bo(); }
          var lay = function (k, md) { return oPl[k] !== undefined ? oPl[k] : opt[k] !== undefined ? opt[k] : md; };
          var ptsPl = [];
          if (/^coordinates\b/.test(s.slice(i))) {
            i += 11; bo(); if (s[i] !== '{') { bao('plot coordinates thiếu { }'); break; }
            var jCo = khop(s, i), noiCo = s.slice(i + 1, jCo); i = jCo + 1;
            var reCo = /\(([^()]*)\)/g, mCo2; while ((mCo2 = reCo.exec(noiCo))) { var Pc = gt(toaDo(mCo2[1])); if (Pc) ptsPl.push(Pc); }
          } else if (s[i] === '(') {
            var jPt = khop(s, i), haiVe = tach(s.slice(i + 1, jPt), ','); i = jPt + 1;
            if (haiVe.length !== 2) { bao('plot cần dạng (x, y)'); break; }
            var bien = String(lay('variable', '\\x')).replace(/^\\/, '').trim() || 'x', dom = String(lay('domain', '-5:5')).split(':');
            var a0 = so(boNgoac(dom[0])), b0 = so(boNgoac(dom[1] || '5')), nMau = Math.max(2, Math.min(240, Math.round(so(String(lay('samples', '25'))))));
            var reBien = new RegExp('\\\\' + bien + '(?![A-Za-z])', 'g'), fx = haiVe[0].replace(reBien, bien), fy = haiVe[1].replace(reBien, bien);
            for (var kPl = 0; kPl < nMau; kPl++) {
              var tPl = a0 + (b0 - a0) * kPl / (nMau - 1), hPl = {}; for (var kh in ham) hPl[kh] = ham[kh]; hPl[bien] = tPl;
              try { var xPl = soHoc(boNgoac(fx), hPl), yPl = soHoc(boNgoac(fy), hPl); if (isFinite(xPl) && isFinite(yPl)) ptsPl.push({ x: xPl * tyLe, y: yPl * tyLe }); } catch (ePl) { bao('Không tính được plot: ' + (ePl.message || ePl)); break; }
            }
          } else { bao('plot không hợp lệ'); break; }
          if (ptsPl.length >= 2 && ve) dsPlot.push({ pts: ptsPl, kieu: kieu });
          if (ptsPl.length) { var cuoiPl = ptsPl[ptsPl.length - 1]; cur = { t: 'xy', x: cuoiPl.x, y: cuoiPl.y }; goc0 = cur; }
          noi = false; continue;
        }
        if (/^(rectangle|grid|parabola|sin|cos|plot|edge|\.\.)\b/.test(r) || /^\.\./.test(r)) {
          var tu = /^\S+/.exec(r)[0];
          if (tu === 'rectangle') { i += 9; bo(); var jR = khop(s, i), Q2 = toaDo(s.slice(i + 1, jR)); i = jR + 1; var P0 = cur; hcnTZ.push({ a: P0, b: Q2, kieu: khoaKieu, mau: mauToHCN }); var A1 = { t: 'xyTu', x: Q2, y: P0 }, A3 = { t: 'xyTu', x: P0, y: Q2 }; if (ve) doanTrongLenh.push({ a: P0, b: A1 }, { a: A1, b: Q2 }, { a: Q2, b: A3 }, { a: A3, b: P0 }); cur = Q2; continue; }
          bao('Chưa hỗ trợ “' + tu + '” — phần này bị bỏ qua'); break;
        }
        if (s[i] === '[') { i = khop(s, i) + 1; continue; }
        if (s[i] === ';') { i++; continue; }
        bao('Không hiểu đoạn: ' + r.slice(0, 30)); break;
      }
      // ghi nhận
      if (duong.ten) duongTen[duong.ten] = duong.loai === 'tron' ? { loai: 'tron', c: duong.c, r: duong.r } : { loai: 'gap', ds: duong.ds.slice() };
      doanTrongLenh.forEach(function (d, k) { doan.push({ a: d.a, b: d.b, kieu: kieu, muiDau: mui && /^</.test(mui) && k === 0, muiCuoi: mui && />|stealth|latex/i.test(mui.replace(/^<|^stealth-/, '')) && k === doanTrongLenh.length - 1 }); });

      function datCham(P, coTo, rat) { if (P.t !== 'ref') { P = nutMoi(P, null); cur = P; dangCham.P = P; } xuatHien[P.id] = xuatHien[P.id] || { to: coTo, khongCham: rat }; }
      function datNhan(chu, oN, viTriN) {
        var noiDung = chuNhan(chu); if (!noiDung) return;
        var huong = null, kc = 0.25;
        var dir = { above: 90, below: -90, left: 180, right: 0, 'above left': 135, 'above right': 45, 'below left': -135, 'below right': -45, north: -90, south: 90, east: 180, west: 0 };
        Object.keys(oN).forEach(function (k) { if (k in dir) huong = dir[k]; if (/^(above|below|left|right)$/.test(k) && oN[k] !== true) { huong = dir[k]; kc = so(oN[k]); } if (k === 'anchor' && dir[oN[k]] !== undefined) huong = { north: -90, south: 90, east: 180, west: 0, 'north west': -45, 'north east': -135, 'south west': 45, 'south east': 135 }[oN[k]]; });
        if (oN.shift) { var sh = boNgoac(oN.shift); var jj = sh.indexOf('('); var v = toaDo(sh.slice(jj + 1, khop(sh, jj)), { tuongDoi: true }), vv = gt(v); if (vv) { huong = Math.atan2(vv.y, vv.x) / RAD; kc = Math.hypot(vv.x, vv.y) / tyLe; } }
        var P = viTriN || cur, tren = null;
        if (oN.midway || oN.pos !== undefined || oN['near start'] || oN['near end']) {
          var t = oN.midway ? 0.5 : oN.pos !== undefined ? so(oN.pos) : oN['near start'] ? 0.25 : 0.75, dcuoi = doanTrongLenh[doanTrongLenh.length - 1];
          if (dcuoi) P = { t: 'tile', a: dcuoi.a, b: dcuoi.b, s: t, g: 0 };
        }
        if (!P) return bao('Nhãn “' + noiDung + '” không có vị trí');
        // nhãn ở cùng lệnh với chấm điểm → tên điểm
        if (dangCham && dangCham.P.t === 'ref' && !xuatHien[dangCham.P.id].nhan && !viTriN && !(oN.midway || oN.pos !== undefined)) {
          var goc1 = P !== dangCham.P && P.t === 'cong' && P.a === dangCham.P ? gt(P.b) : null;
          if (goc1) { huong = Math.atan2(goc1.y, goc1.x) / RAD; kc = Math.hypot(goc1.x, goc1.y) / tyLe; }
          xuatHien[dangCham.P.id].nhan = noiDung; xuatHien[dangCham.P.id].huong = huong; xuatHien[dangCham.P.id].kc = kc;
          return;
        }
        nhan.push({ P: P, chu: noiDung, huong: huong, kc: kc, tren: tren });
      }
    }
    function banKinhTu(s, letEnv) {
      var mv = /^veclen\(\s*\\x(\d+)\s*,\s*\\y(\d+)\s*\)$/.exec(s.replace(/\s+/g, ''));
      if (mv && letEnv['\\p' + mv[1]]) return { t: 'daiVec', v: letEnv['\\p' + mv[1]] };
      return { t: 'so', v: so(s) * tyLe };
    }
    function giaoTen(o) {
      var mOf = /^(.+?)\s+and\s+(.+)$/.exec(o.of || ''); if (!mOf) return bao('name intersections thiếu “of”');
      var p1 = duongTen[mOf[1].trim()], p2 = duongTen[mOf[2].trim()];
      if (!p1 || !p2) return bao('Chưa khai báo name path: ' + (!p1 ? mOf[1] : mOf[2]));
      var sx = o['sort by'] ? (o['sort by'].trim() === mOf[1].trim() ? 1 : 2) : 0;
      function nutGiao(k) { return { t: 'giaoDuong', p1: p1, p2: p2, k: k, sx: sx }; }
      for (var k = 0; k < 2; k++) { var r = nutMoi(nutGiao(k), 'intersection-' + (k + 1)); ten['intersection-' + (k + 1)] = r.id; }
      if (o.by) tach(boNgoac(o.by), ',').forEach(function (t, k) { t = t.trim(); if (t) datTen(t, nutMoi(nutGiao(k), t)); });
    }

    // ----- chạy tuần tự các câu lệnh (\def, \foreach, lệnh vẽ) -----
    function chay(s, env) {
      var i = 0;
      while (i < s.length) {
        while (i < s.length && /[\s;]/.test(s[i])) i++;
        if (i >= s.length) break;
        var r = s.slice(i);
        var mDef = /^\\def\s*\\([A-Za-z@]+)\s*\{/.exec(r);
        if (mDef) { var j = khop(s, i + mDef[0].length - 1); macro[mDef[1]] = moRong(s.slice(i + mDef[0].length, j), env); i = j + 1; continue; }
        var mSet = /^\\pgfmathsetmacro\s*\{?\\([A-Za-z@]+)\}?\s*\{/.exec(r);
        if (mSet) { var j0 = khop(s, i + mSet[0].length - 1); try { macro[mSet[1]] = String(so(moRong(s.slice(i + mSet[0].length, j0), env))); } catch (e) { bao(e.message); } i = j0 + 1; continue; }
        if (/^\\(tikzset|usetikzlibrary|tikzstyle)\b/.test(r)) { var k1 = s.indexOf('{', i); if (k1 < 0) break; var j1 = khop(s, k1); i = j1 + 1; if (/^\\tikzstyle/.test(r)) { var kc2 = s.indexOf(']', i); if (kc2 >= 0 && /^\s*=\s*\[/.test(s.slice(i))) i = kc2 + 1; } continue; }
        if (/^\\(begin|end)\{scope\}/.test(r)) {   // scope[shift={(x,y)}, xshift=…, yshift=…]: dời các toạ độ bên trong
          var mS = /^\\(begin|end)\{scope\}\s*/.exec(r); i += mS[0].length;
          if (mS[1] === 'end') { dich = chongDich.pop() || { x: 0, y: 0 }; continue; }
          var oS = {}; if (s[i] === '[') { var jS = khop(s, i); oS = tuyChon(moRong(s.slice(i + 1, jS), env)); i = jS + 1; }
          chongDich.push(dich); var moi = { x: dich.x, y: dich.y };
          try {
            if (oS.shift) { var shS = boNgoac(oS.shift), kS = shS.indexOf('('); if (kS >= 0) { var vS = gt(toaDo(shS.slice(kS + 1, khop(shS, kS)), { tuongDoi: true })); if (vS) { moi.x += vS.x; moi.y += vS.y; } } }
            if (oS.xshift) moi.x += so(boNgoac(oS.xshift)) * tyLe; if (oS.yshift) moi.y += so(boNgoac(oS.yshift)) * tyLe;
          } catch (eS) { bao('scope: ' + (eS.message || eS)); }
          dich = moi; continue;
        }
        if (/^\\foreach\b/.test(r)) { i = foreach(s, i, env); continue; }
        if (r.charAt(0) === '{') { var jg = khop(s, i); chay(s.slice(i + 1, jg), env); i = jg + 1; continue; }
        // câu lệnh đến dấu ; ở độ sâu 0
        var j2 = i, sau = 0; for (; j2 < s.length; j2++) { var c = s[j2]; if (c === '\\') { j2++; continue; } if (c === '(' || c === '[' || c === '{') sau++; else if (c === ')' || c === ']' || c === '}') sau--; else if (c === ';' && sau <= 0) break; }
        var cau = s.slice(i, j2); i = j2 + 1;
        try { lenh(moRong(cau, env), env); } catch (e) { bao((e.message || String(e)) + ' — ở: ' + cau.trim().slice(0, 50)); }
      }
    }
    function foreach(s, i, env) {
      var r = s.slice(i), m = /^\\foreach\s*(\[[^\]]*\])?\s*((?:\\[A-Za-z]+\s*\/?\s*)+)\s*in\s*\{/.exec(r);
      if (!m) { bao('\\foreach không hợp lệ'); return s.length; }
      var bien = m[2].split('/').map(function (x) { return x.trim().replace(/^\\/, ''); }).filter(Boolean);
      var kD = i + m[0].length - 1, jD = khop(s, kD), ds = tach(moRong(s.slice(kD + 1, jD), env), ',').map(function (x) { return x.trim(); }).filter(function (x) { return x !== ''; });
      // a, b, ..., c
      var k = ds.indexOf('...'); if (k > 0 && k < ds.length - 1) { var a = so(ds[k - 2] !== undefined && k >= 2 ? ds[k - 2] : ds[k - 1]), b = so(ds[k - 1]), c = so(ds[k + 1]), buoc = k >= 2 ? b - a : 1, mo = []; for (var x = b + buoc; buoc > 0 ? x <= c + 1e-9 : x >= c - 1e-9; x += buoc) mo.push(String(Math.round(x * 1e6) / 1e6)); ds = ds.slice(0, k).concat(mo.slice(0, -1).concat([String(c)]).filter(function (v, idx, arr) { return arr.indexOf(v) === idx; })).concat(ds.slice(k + 2)); }
      var j = jD + 1; while (j < s.length && /\s/.test(s[j])) j++;
      var than, ketThuc;
      if (s[j] === '{') { var jt = khop(s, j); than = s.slice(j + 1, jt); ketThuc = jt + 1; }
      else if (/^\\foreach\b/.test(s.slice(j))) { // foreach lồng: thân là cả foreach con
        var tam = foreachDai(s, j); than = s.slice(j, tam); ketThuc = tam;
      } else { var j2 = j, sau = 0; for (; j2 < s.length; j2++) { var c2 = s[j2]; if (c2 === '\\') { j2++; continue; } if (c2 === '(' || c2 === '[' || c2 === '{') sau++; else if (c2 === ')' || c2 === ']' || c2 === '}') sau--; else if (c2 === ';' && sau <= 0) break; } than = s.slice(j, j2 + 1); ketThuc = j2 + 1; }
      ds.forEach(function (muc) {
        var gtri = tach(boNgoac(muc), '/').map(function (x) { return boNgoac(x); }), e = Object.assign({}, env);
        bien.forEach(function (b, idx) { e[b] = gtri[Math.min(idx, gtri.length - 1)]; });
        chay(than, e);
      });
      return ketThuc;
    }
    function foreachDai(s, i) {   // vị trí kết thúc của một \foreach (kể cả thân)
      var r = s.slice(i), m = /^\\foreach\s*(\[[^\]]*\])?\s*((?:\\[A-Za-z]+\s*\/?\s*)+)\s*in\s*\{/.exec(r); if (!m) return s.length;
      var jD = khop(s, i + m[0].length - 1), j = jD + 1; while (j < s.length && /\s/.test(s[j])) j++;
      if (s[j] === '{') return khop(s, j) + 1;
      if (/^\\foreach\b/.test(s.slice(j))) return foreachDai(s, j);
      var sau = 0; for (; j < s.length; j++) { var c = s[j]; if (c === '\\') { j++; continue; } if (c === '(' || c === '[' || c === '{') sau++; else if (c === ')' || c === ']' || c === '}') sau--; else if (c === ';' && sau <= 0) return j + 1; }
      return s.length;
    }

    // ----- bắt đầu -----
    var nguon = boChuThich(String(ma || ''));
    var mB = /\\begin\{tikzpicture\}\s*(\[)?/.exec(nguon), than = nguon;
    if (mB) {
      var bd = mB.index + mB[0].length, optTP = {};
      if (mB[1]) { var jB = khop(nguon, bd - 1); optTP = tuyChon(nguon.slice(bd, jB)); bd = jB + 1; }
      var kt = nguon.indexOf('\\end{tikzpicture}', bd); than = nguon.slice(bd, kt < 0 ? undefined : kt);
      // \def đặt trước \begin{tikzpicture}
      (nguon.slice(0, mB.index).match(/\\def\s*\\[A-Za-z@]+\s*\{[^{}]*\}|\\pgfmathsetmacro\s*\{?\\[A-Za-z@]+\}?\s*\{[^{}]*\}/g) || []).forEach(function (d) { chay(d, {}); });
      if (optTP.scale) tyLe = so(optTP.scale);
      try { if (optTP.x) dvX = so(boNgoac(optTP.x)); if (optTP.y) dvY = so(boNgoac(optTP.y)); } catch (eU) { bao('Đơn vị x / y: ' + (eU.message || eU)); }   // [x=1cm, y=0.7cm]
      if (optTP['declare function']) tach(optTP['declare function'], ';').forEach(function (p) { var q = p.split('='); if (q.length === 2) { try { ham[q[0].trim()] = so(q[1]); } catch (e) { bao(e.message); } } });
    }
    chay(than, {});
    if (cfg.thuThap) return {   // chỉ lấy dữ liệu thô (để nhận ra biểu đồ)
      hcn: hcnTZ.map(function (r) { var A = gt(r.a), B = gt(r.b); return A && B ? { x0: Math.min(A.x, B.x), x1: Math.max(A.x, B.x), y0: Math.min(A.y, B.y), y1: Math.max(A.y, B.y), kieu: r.kieu, mau: r.mau } : null; }).filter(Boolean),
      nhan: nhan.map(function (n) { var P = gt(n.P); return P ? { x: P.x, y: P.y, chu: n.chu, huong: n.huong } : null; }).filter(Boolean),
      doan: doan.map(function (d) { var A = gt(d.a), B = gt(d.b); return A && B ? { A: A, B: B } : null; }).filter(Boolean),
      canhBao: canhBao };
    var ketQua = dung();
    ketQua.canhBao = canhBao;
    return ketQua;

    /* ----- dựng đối tượng GeoInk từ những gì đã đọc ----- */
    function dung() {
      var taoId = cfg.taoId || (function () { var d = 0; return function (t) { return (t || 'z') + 'tz' + (++d); }; })();
      var hinh = [], idNut = {}, can = {}, KT, DV;
      // các nút cần thành đối tượng: điểm được vẽ ra, đầu mút đoạn, tâm đường tròn, đỉnh góc
      function canNut(r) { if (r && r.t === 'ref') can[r.id] = true; }
      // đoạn: bỏ trùng; nhận diện gạch đánh dấu (đoạn ngắn) sau
      var dsDoan = [], daCo = {};
      doan.forEach(function (d) {
        var A = gt(d.a), B = gt(d.b); if (!A || !B || Math.hypot(A.x - B.x, A.y - B.y) < 1e-9) return;
        dsDoan.push({ a: d.a, b: d.b, A: A, B: B, L: Math.hypot(A.x - B.x, A.y - B.y), kieu: d.kieu, muiDau: d.muiDau, muiCuoi: d.muiCuoi });
      });
      // góc: gộp các cung cùng góc (2 nét, 3 nét); góc chỉ có nhãn ghép vào góc có cung
      var dsGoc = [];
      goc.forEach(function (g) {
        var cu = dsGoc.filter(function (x) { return x.a.id === g.a.id && x.o.id === g.o.id && x.b.id === g.b.id; })[0];
        if (cu) { if (g.ve) cu.cung = cu.ve ? cu.cung + 1 : (g.kep ? 2 : 1); cu.ve = cu.ve || g.ve; if (g.nhan) cu.nhan.push({ nd: g.nhan, e: g.lech }); if (g.kep) cu.cung = Math.max(cu.cung, 2); return; }
        dsGoc.push({ a: g.a, o: g.o, b: g.b, ve: g.ve, cung: g.ve ? (g.kep ? 2 : 1) : 0, nhan: g.nhan ? [{ nd: g.nhan, e: g.lech }] : [], gach: 0 });
      });
      // gạch đánh dấu: đoạn ngắn (≤ 0,45 cm) cắt ngang trung điểm một đoạn dài → kí hiệu đoạn bằng nhau; nằm trên cung góc → gạch của góc
      var dai = dsDoan.filter(function (d) { return d.L > 0.45; }), kyHieu = new Map();
      dsDoan = dsDoan.filter(function (d) {
        if (d.L > 0.45) return true;
        var M = { x: (d.A.x + d.B.x) / 2, y: (d.A.y + d.B.y) / 2 }, ux = (d.B.x - d.A.x) / d.L, uy = (d.B.y - d.A.y) / d.L;
        for (var k = 0; k < dai.length; k++) {
          var D = dai[k], vx = (D.B.x - D.A.x) / D.L, vy = (D.B.y - D.A.y) / D.L, t = (M.x - D.A.x) * vx + (M.y - D.A.y) * vy, kc = Math.abs((M.x - D.A.x) * vy - (M.y - D.A.y) * vx);
          if (kc < 0.06 && Math.abs(t - D.L / 2) < 0.25 && Math.abs(ux * vx + uy * vy) < 0.35) { kyHieu.set(D, (kyHieu.get(D) || 0) + 1); return false; }
        }
        for (var g = 0; g < dsGoc.length; g++) {
          var G = dsGoc[g], O = gt(G.o), A = gt(G.a), B = gt(G.b); if (!O || !A || !B) continue;
          var wx = M.x - O.x, wy = M.y - O.y, wl = Math.hypot(wx, wy); if (wl < 1e-9 || wl > 1.2) continue;
          if (Math.abs((ux * wx + uy * wy) / wl) < 0.8) continue;
          var a1 = Math.atan2(A.y - O.y, A.x - O.x), a2 = Math.atan2(B.y - O.y, B.x - O.x), am = Math.atan2(wy, wx), da = ((a2 - a1) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI), dm = ((am - a1) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
          if (dm > 0 && dm < da) { G.gach++; return false; }
        }
        return true;
      });
      dsDoan.forEach(function (d) { canNut(d.a); canNut(d.b); });
      dsDoan = dsDoan.filter(function (d) { var k = [d.a.id, d.b.id].sort().join('|'); if (d.a.t !== 'ref' || d.b.t !== 'ref') return true; if (daCo[k]) return false; daCo[k] = 1; return true; });
      tron = tron.filter(function (t, k) { var C = gt(t.c), R = banKinh(t.r, gtNut); t._k = C && R ? [C.x, C.y, R].map(function (x) { return Math.round(x * 1e4); }).join() : 'x' + k; return tron.findIndex(function (u) { return u._k === t._k; }) === k; });
      tron.forEach(function (t) { canNut(t.c); });
      dsGoc.forEach(function (g) { canNut(g.a); canNut(g.o); canNut(g.b); });
      gocVuong.forEach(function (g) { canNut(g.a); canNut(g.o); canNut(g.b); });
      Object.keys(xuatHien).forEach(function (id) { can[id] = true; });
      // nút chưa phải tham chiếu (biểu thức ẩn danh làm đầu mút) → tạo nút
      function veNut(r) { if (r.t === 'ref') return r; var x = nutMoi(r, null); can[x.id] = true; return x; }
      dsDoan.forEach(function (d) { d.a = veNut(d.a); d.b = veNut(d.b); });
      tron.forEach(function (t) { t.c = veNut(t.c); });
      cung.forEach(function (k) { k.c = veNut(k.c); k.a = veNut(k.a); k.b = veNut(k.b); });
      // nút tự do: toạ độ cố định (không phụ thuộc điểm nào) → điểm kéo được
      function tuDo(bt) { if (!bt) return false; if (bt.t === 'xy') return true; if (bt.t === 'ref') return false; var k; for (k in bt) { var v = bt[k]; if (v && typeof v === 'object' && v.t && !tuDo(v)) return false; if (v && typeof v === 'object' && (v.loai === 'tron' || v.loai === 'gap')) return false; } return bt.t !== 'giaoDuong'; }
      // vị trí đặt hình: giữa khung bao các điểm
      var bao2 = { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity };
      function moRongBao(P, r) { if (!P) return; r = r || 0; bao2.x0 = Math.min(bao2.x0, P.x - r); bao2.x1 = Math.max(bao2.x1, P.x + r); bao2.y0 = Math.min(bao2.y0, P.y - r); bao2.y1 = Math.max(bao2.y1, P.y + r); }
      Object.keys(can).forEach(function (id) { moRongBao(gtNut(+id)); });
      tron.forEach(function (t) { moRongBao(gt(t.c), banKinh(t.r, gtNut)); });
      cung.forEach(function (k) { moRongBao(gt(k.a)); moRongBao(gt(k.b)); moRongBao(gt(k.c)); });
      nhan.forEach(function (n) { moRongBao(gt(n.P)); });
      dsPlot.forEach(function (c) { c.pts.forEach(function (P) { moRongBao(P); }); });
      if (!isFinite(bao2.x0)) return { hinh: [], so: {}, canhBao: [] };
      // cỡ hình trên bảng: vừa khoảng 3/4 khung nhìn, không quá 2 lần cỡ thật
      KT = cfg.heSo || 1.5;
      if (!cfg.heSo && cfg.khung) { var bw = Math.max(bao2.x1 - bao2.x0, 0.5), bh = Math.max(bao2.y1 - bao2.y0, 0.5); KT = Math.max(0.4, Math.min(2, 0.72 * cfg.khung.w / (bw * 40), 0.68 * cfg.khung.h / (bh * 40))); }
      DV = 40 * KT;
      var tamTZ = { x: (bao2.x0 + bao2.x1) / 2, y: (bao2.y0 + bao2.y1) / 2 }, viTri = cfg.viTri || { x: 0, y: 0 };
      var G0 = { x: viTri.x - tamTZ.x * DV, y: viTri.y + tamTZ.y * DV };   // gốc TikZ (0,0) trên bảng
      var idGoc = taoId('d'); hinh.push({ id: idGoc, loai: 'diem', x: G0.x, y: G0.y, an: true, phuTZ: true });
      function raBang(P) { return { x: G0.x + P.x * DV, y: G0.y - P.y * DV }; }
      // biểu thức: thay tham chiếu tới nút chưa thành đối tượng bằng chính biểu thức của nút (gộp lại)
      function moBT(bt, refs) {
        if (!bt || typeof bt !== 'object') return bt;
        if (bt.t === 'ref') { if (can[bt.id]) { var id = idCua(bt.id); if (refs.indexOf(id) < 0) refs.push(id); return { t: 'ref', id: id }; } return moBT(nut[bt.id].bt, refs); }
        var o = {}; Object.keys(bt).forEach(function (k) { var v = bt[k]; o[k] = Array.isArray(v) ? v.map(function (x) { return moBT(x, refs); }) : v && typeof v === 'object' ? moBT(v, refs) : v; }); return o;
      }
      function idCua(i) {
        if (idNut[i]) return idNut[i];
        var n = nut[i], xh = xuatHien[i], id = taoId('d'); idNut[i] = id;
        var o;
        if (tuDo(n.bt)) { var P = raBang(gt(n.bt)); o = { id: id, loai: 'diem', x: P.x, y: P.y }; }
        else { var refs = [idGoc], bt = moBT(n.bt, refs); o = { id: id, loai: 'diemTZ', goc: idGoc, ds: refs, bt: bt, kt: KT }; }
        if (xh) { if (xh.nhan) { o.ten = xh.nhan; o.hienTen = true; if (xh.huong != null) o.huongTZ = { g: xh.huong, kc: xh.kc }; } else o.hienTen = false; if (xh.khongCham) o.chamAn = true; }
        else if (o.loai === 'diem') o.chamAn = true;   // đầu mút đường thẳng: kéo được nhưng không hiện chấm
        else o.an = true;
        hinh.push(o); return id;
      }
      Object.keys(can).sort(function (a, b) { return a - b; }).forEach(function (i) { idCua(+i); });
      var so2 = { diem: 0, doan: 0, tron: 0, goc: 0 };
      hinh.forEach(function (o) { if (!o.an && !o.chamAn && (o.loai === 'diem' || o.loai === 'diemTZ')) so2.diem++; });
      dsDoan.forEach(function (d) {
        var o = { id: taoId('h'), loai: 'doan', a: idCua(d.a.id), b: idCua(d.b.id) };
        if (d.kieu) o.kieuNet = d.kieu; if (d.muiDau) o.muiDau = true; if (d.muiCuoi) o.muiCuoi = true;
        var kh = kyHieu.get(d); if (kh) o.kyHieu = String(Math.min(3, kh));
        hinh.push(o); so2.doan++;
      });
      tron.forEach(function (t) {
        var o, idTam = idCua(t.c.id);
        if (t.r.t === 'so') o = { id: taoId('h'), loai: 'tronBanKinh', o: idTam, r: t.r.v * KT };
        else if (t.r.t === 'daiVec' && t.r.v.t === 'tru' && JSON.stringify(t.r.v.a) === JSON.stringify(nut[t.c.id].bt)) o = { id: taoId('h'), loai: 'tron', o: idTam, a: idCua(veNut(t.r.v.b).id) };
        else { var rr = banKinh(t.r, gtNut); if (!rr) return; o = { id: taoId('h'), loai: 'tronBanKinh', o: idTam, r: rr * KT }; }
        if (t.kieu) o.kieuNet = t.kieu; hinh.push(o); so2.tron++;
      });
      cung.forEach(function (k) { var o = { id: taoId('h'), loai: 'cungTam', o: idCua(k.c.id), a: idCua(k.a.id), b: idCua(k.b.id) }; if (k.kieu) o.kieuNet = k.kieu; hinh.push(o); so2.doan++; });
      dsGoc.forEach(function (g) {
        var o = { id: taoId('h'), loai: 'goc', a: idCua(g.a.id), o: idCua(g.o.id), b: idCua(g.b.id), anSo: true };
        if (g.cung !== 1) o.cung = g.cung; if (g.gach) o.gach = Math.min(2, g.gach); if (g.nhan.length) o.nhanGoc = g.nhan;
        hinh.push(o); so2.goc++;
      });
      dsPlot.forEach(function (c) { var o = { id: taoId('h'), loai: 'duongTZ', goc: idGoc, kt: KT, pts: c.pts.map(function (P) { return [Math.round(P.x * 1e4) / 1e4, Math.round(P.y * 1e4) / 1e4]; }) }; if (c.kieu) o.kieuNet = c.kieu; hinh.push(o); so2.doan++; });
      gocVuong.forEach(function (g) { hinh.push({ id: taoId('h'), loai: 'gocVuong', a: idCua(g.a.id), o: idCua(g.o.id), b: idCua(g.b.id) }); so2.goc++; });
      nhan.forEach(function (n) { var refs = [idGoc], bt = moBT(n.P, refs); hinh.push({ id: taoId('h'), loai: 'nhanTZ', goc: idGoc, ds: refs, bt: bt, kt: KT, nd: n.chu, huong: n.huong, kc: n.kc }); });
      // điểm tự do nằm trên đường tròn đã vẽ → điểm thuộc đường tròn (kéo vẫn nằm trên đường tròn)
      hinh.forEach(function (o) {
        if (o.loai !== 'diem' || o.an || o.chamAn) return;
        hinh.forEach(function (t) {
          if (o.loai !== 'diem' || t.loai !== 'tronBanKinh' || t.o === o.id) return;
          var C = hinh.filter(function (x) { return x.id === t.o; })[0]; if (!C) return;
          var Cp = C.loai === 'diem' ? C : null; if (!Cp) { var nC = Object.keys(idNut).filter(function (k) { return idNut[k] === C.id; })[0]; if (nC === undefined) return; var pc = gtNut(+nC); if (!pc) return; Cp = raBang(pc); }
          var d = Math.hypot(o.x - Cp.x, o.y - Cp.y), R = t.r * 40;
          if (Math.abs(d - R) < 1e-3 * R + 1e-6) { o.loai = 'diemTren'; o.tren = t.id; o.t = Math.atan2(o.y - Cp.y, o.x - Cp.x); delete o.x; delete o.y; }
        });
      });
      // đường tròn phải đứng trước điểm thuộc nó trong danh sách? không cần: tính theo tham chiếu
      return { hinh: hinh, so: so2 };
    }
  }

  return { nhap: nhap, tinh: tinh, chuNhan: chuNhan, soHoc: soHoc, mau: mauTikz };
})();
