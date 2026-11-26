// Máy tính khoa học 580 (bố cục và cách bấm theo fx-580VN X, tự lập trình; không dùng phần mềm của hãng)
// Đợt 1: vỏ máy, bàn phím, màn hình hiển thị như sách giáo khoa (MathI/MathO), MENU, SETUP, phương thức Calculate.
window.GI = window.GI || {};
GI.may580 = (function () {
  'use strict';
  var el = null, manEl = null, ttEl = null;

  /* =====================================================================
     SỐ HỌC CHÍNH XÁC: giá trị = (n/d)·√r·π^pi  (n, d, r: BigInt) hoặc số gần đúng {x}
     ===================================================================== */
  var B0 = BigInt(0), B1 = BigInt(1), B2 = BigInt(2), B10 = BigInt(10);
  function LoiMay(ten) { this.ten = ten; }
  function loi(ten) { throw new LoiMay(ten); }
  function bAbs(a) { return a < B0 ? -a : a; }
  function bGcd(a, b) { a = bAbs(a); b = bAbs(b); while (b) { var t = a % b; a = b; b = t; } return a; }
  function soChuSo(a) { return bAbs(a).toString().length; }
  function Q(n, d, r, pi) {
    d = d == null ? B1 : d; r = r == null ? B1 : r; pi = pi || 0;
    if (d === B0) loi('Math');
    if (d < B0) { n = -n; d = -d; }
    if (n === B0) return { n: B0, d: B1, r: B1, pi: 0 };
    var g = bGcd(n, d); if (g !== B1) { n /= g; d /= g; }
    if (soChuSo(n) > 60 || soChuSo(d) > 60 || soChuSo(r) > 30) return X(Number(n) / Number(d) * Math.sqrt(Number(r)) * (pi ? Math.PI : 1));
    return { n: n, d: d, r: r, pi: pi };
  }
  function X(x) { if (!isFinite(x) || isNaN(x)) loi('Math'); if (Math.abs(x) >= 1e100) loi('Math'); return { x: x }; }
  function laCX(v) { return v.x === undefined; }
  function laHuuTi(v) { return laCX(v) && v.r === B1 && !v.pi; }
  function laNguyen(v) { return laHuuTi(v) && v.d === B1; }
  function so(v) { return laCX(v) ? Number(v.n) / Number(v.d) * (v.r === B1 ? 1 : Math.sqrt(Number(v.r))) * (v.pi ? Math.PI : 1) : v.x; }
  function la0(v) { return laCX(v) ? v.n === B0 : v.x === 0; }
  var KHONG = Q(B0), MOT = Q(B1), PI_V = Q(B1, B1, B1, 1);
  function tuSoNguyen(k) { return Q(BigInt(k)); }
  // tách thừa số chính phương: r = k²·s
  function rutCan(r) {
    if (r <= B0) return [B1, r];
    if (r > BigInt(1e12)) return null;
    var k = B1, s = r, rn = Number(r);
    for (var i = 2; i * i <= rn; i++) { var bi = BigInt(i), b2 = bi * bi; while (s % b2 === B0) { s /= b2; k *= bi; } if (b2 > s) break; }
    return [k, s];
  }
  function am(a) { return laCX(a) ? Q(-a.n, a.d, a.r, a.pi) : X(-a.x); }
  function cong(a, b) {
    if (laCX(a) && la0(a)) return b; if (laCX(b) && la0(b)) return a;
    if (laCX(a) && laCX(b) && a.r === b.r && a.pi === b.pi) return Q(a.n * b.d + b.n * a.d, a.d * b.d, a.r, a.pi);
    return X(so(a) + so(b));
  }
  function tru(a, b) { return cong(a, am(b)); }
  function nhan(a, b) {
    if (laCX(a) && laCX(b)) {
      if (la0(a) || la0(b)) return KHONG;
      var pi = a.pi + b.pi, rc = rutCan(a.r * b.r);
      if (pi <= 1 && rc) return Q(a.n * b.n * rc[0], a.d * b.d, rc[1], pi);
    }
    return X(so(a) * so(b));
  }
  function chia(a, b) {
    if (la0(b)) loi('Math');
    if (laCX(a) && laCX(b) && a.pi >= b.pi) {
      var rc = rutCan(a.r * b.r);
      if (rc) return Q(a.n * b.d * rc[0], a.d * b.n * b.r, rc[1], a.pi - b.pi);
    }
    return X(so(a) / so(b));
  }
  function nghichDao(a) { return chia(MOT, a); }
  function canHai(a) {
    if (laHuuTi(a)) {
      if (a.n < B0) loi('Math');
      var rc = rutCan(a.n * a.d); if (rc) return Q(rc[0], a.d, rc[1]);
    }
    var x = so(a); if (x < 0) loi('Math'); return X(Math.sqrt(x));
  }
  function nguyenCan(a, k) {   // căn bậc k nguyên của số hữu tỉ nếu chính xác
    if (!laHuuTi(a)) return null;
    function goc(b) { if (b < B0) return null; var g = BigInt(Math.round(Math.pow(Number(b), 1 / k))); for (var t = g - B1; t <= g + B1; t++) if (t >= B0 && t ** BigInt(k) === b) return t; return null; }
    var neg = a.n < B0; if (neg && k % 2 === 0) return null;
    var tn = goc(bAbs(a.n)), td = goc(a.d); if (tn === null || td === null) return null;
    return Q(neg ? -tn : tn, td);
  }
  function luyThua(a, b) {
    if (laHuuTi(b)) {
      if (b.d === B1 && bAbs(b.n) <= BigInt(400) && laCX(a)) {
        var k = Number(b.n), kq = MOT, c = a, m = Math.abs(k);
        if (la0(a) && k <= 0) loi('Math');
        while (m) { if (m & 1) kq = nhan(kq, c); m >>= 1; if (m) c = nhan(c, c); }
        return k < 0 ? nghichDao(kq) : kq;
      }
      if (b.d === B2 && laHuuTi(a) && a.n >= B0 && bAbs(b.n) <= BigInt(100)) return luyThua(canHai(a), Q(b.n));
      if (laHuuTi(a) && b.d <= BigInt(9)) { var nc = nguyenCan(a, Number(b.d)); if (nc) return luyThua(nc, Q(b.n)); }
      var x = so(a), y = so(b);
      if (x < 0 && b.d % B2 === B1) { var r = Math.pow(-x, y); return X(b.n % B2 === B0 ? r : -r); }
    }
    var xa = so(a), ya = so(b);
    if (xa === 0 && ya <= 0) loi('Math');
    if (xa < 0 && Math.round(ya) !== ya) loi('Math');
    return X(Math.pow(xa, ya));
  }
  function canBacN(n, a) {   // ⁿ√a
    if (laNguyen(n) && n.n > B0) {
      var k = Number(n.n);
      if (k === 2) return canHai(a);
      var nc = nguyenCan(a, k); if (nc) return nc;
      var x = so(a); if (x < 0 && k % 2 === 1) return X(-Math.pow(-x, 1 / k));
      if (x < 0) loi('Math'); return X(Math.pow(x, 1 / k));
    }
    var xn = so(n); if (xn === 0) loi('Math');
    return luyThua(a, chia(MOT, n));
  }
  function nguyen(v, ten) { if (!laNguyen(v)) loi(ten || 'Math'); return v.n; }
  function giaiThua(v) { var n = nguyen(v); if (n < B0 || n > BigInt(69)) loi('Math'); var k = B1; for (var i = B2; i <= n; i++) k *= i; return Q(k); }
  function hoanVi(a, b) { var n = nguyen(a), r = nguyen(b); if (n < B0 || r < B0 || r > n || n >= BigInt(1e10)) loi('Math'); var k = B1; for (var i = B0; i < r; i++) k *= (n - i); return Q(k); }
  function toHop(a, b) { var n = nguyen(a), r = nguyen(b); if (n < B0 || r < B0 || r > n || n >= BigInt(1e10)) loi('Math'); if (r > n - r) r = n - r; var k = B1; for (var i = B0; i < r; i++) k = k * (n - i) / (i + B1); return Q(k); }

  /* ---------- góc ---------- */
  var st;   // trạng thái máy (khai báo đầy đủ ở dưới)
  function sangDo(v) {   // góc nhập theo đơn vị đang chọn → số đo độ (chính xác nếu được)
    if (st.cd.goc === 'D') return v;
    if (st.cd.goc === 'R') { if (laCX(v) && v.pi === 1 && v.r === B1) return Q(v.n * BigInt(180), v.d); return X(so(v) * 180 / Math.PI); }
    return laHuuTi(v) ? Q(v.n * BigInt(9), v.d * B10) : X(so(v) * 0.9);
  }
  function tuDo(d) {   // số đo độ → đơn vị đang chọn
    if (st.cd.goc === 'D') return d;
    if (st.cd.goc === 'R') return laHuuTi(d) ? Q(d.n, d.d * BigInt(180), B1, 1) : X(so(d) * Math.PI / 180);
    return laHuuTi(d) ? Q(d.n * B10, d.d * BigInt(9)) : X(so(d) / 0.9);
  }
  var SIN_DAC_BIET = {};   // độ (bội 15 trong [0,90]) → giá trị chính xác
  function sinDB(goc) {
    var s3 = Q(B1, B2, BigInt(3)), s2 = Q(B1, B2, B2);
    return { 0: KHONG, 30: Q(B1, B2), 45: s2, 60: s3, 90: MOT }[goc];
  }
  function sinChinhXac(d) {   // d: số đo độ hữu tỉ
    if (!laHuuTi(d) || d.d !== B1) return null;
    var g = Number(((d.n % BigInt(360)) + BigInt(360)) % BigInt(360)), dau = 1;
    if (g > 180) { g -= 180; dau = -1; }
    if (g > 90) g = 180 - g;
    var v = sinDB(g); if (!v) return null;
    return dau < 0 ? am(v) : v;
  }
  function hamLG(ten, v) {
    var d = sangDo(v), xd = so(d);
    if (ten === 'sin' || ten === 'cos' || ten === 'tan') {
      if (Math.abs(so(v)) >= (st.cd.goc === 'R' ? 157079632.7 : 9e9)) loi('Math');
      var dd = ten === 'cos' ? cong(d, Q(BigInt(90))) : d;
      var s = sinChinhXac(dd);
      if (ten === 'tan') {
        var sc = sinChinhXac(d), cc = sinChinhXac(cong(d, Q(BigInt(90))));
        if (sc && cc) { if (la0(cc)) loi('Math'); return chia(sc, cc); }
        if (Math.abs(((xd % 180) + 180) % 180 - 90) < 1e-12) loi('Math');
        return X(Math.tan(xd * Math.PI / 180));
      }
      if (s) return s;
      var r = xd * Math.PI / 180; return X(ten === 'sin' ? Math.sin(r) : Math.cos(r));
    }
    // lượng giác ngược
    var x = so(v), kq = null;
    if (ten === 'asin' || ten === 'acos') { if (x < -1 - 1e-12 || x > 1 + 1e-12) loi('Math'); }
    if (laCX(v) && !v.pi) {
      var bang = ten === 'atan' ? [[KHONG, 0], [Q(B1, BigInt(3), BigInt(3)), 30], [MOT, 45], [Q(B1, B1, BigInt(3)), 60]] :
        [[KHONG, 0], [Q(B1, B2), 30], [Q(B1, B2, B2), 45], [Q(B1, B2, BigInt(3)), 60], [MOT, 90]];
      for (var i = 0; i < bang.length; i++) {
        var w = bang[i][0], g = bang[i][1];
        if (w.n === bAbs(v.n) && w.d === v.d && w.r === v.r) { kq = v.n < B0 ? -g : g; break; }
      }
    }
    if (kq !== null) { if (ten === 'acos') kq = 90 - kq; return tuDo(Q(BigInt(kq))); }
    var rad = ten === 'asin' ? Math.asin(Math.max(-1, Math.min(1, x))) : ten === 'acos' ? Math.acos(Math.max(-1, Math.min(1, x))) : Math.atan(x);
    return tuDo(X(rad * 180 / Math.PI));
  }
  function log10(v) {
    if (laHuuTi(v)) {
      if (v.n <= B0) loi('Math');
      if (v.d === B1 || v.n === B1) { var t = v.d === B1 ? v.n : v.d, k = 0; while (t % B10 === B0 && t > B1) { t /= B10; k++; } if (t === B1) return tuSoNguyen(v.d === B1 ? k : -k); }
    }
    var x = so(v); if (x <= 0) loi('Math'); return X(Math.log10(x));
  }
  function logAB(a, b) {   // log_a(b)
    var xa = so(a), xb = so(b);
    if (xa <= 0 || xa === 1 || xb <= 0) loi('Math');
    if (laHuuTi(a) && laHuuTi(b)) {
      var k = Math.round(Math.log(xb) / Math.log(xa));
      if (Math.abs(k) <= 200) { var thu = luyThua(a, tuSoNguyen(k)); if (laHuuTi(thu) && thu.n === b.n && thu.d === b.d) return tuSoNguyen(k); }
    }
    return X(Math.log(xb) / Math.log(xa));
  }
  function lnHam(v) { var x = so(v); if (x <= 0) loi('Math'); if (x === 1 && laCX(v)) return KHONG; return X(Math.log(x)); }
  function eMu(v) { if (laCX(v) && la0(v)) return MOT; return X(Math.exp(so(v))); }
  function muuMuoi(v) { if (laNguyen(v) && bAbs(v.n) <= BigInt(99)) return luyThua(Q(B10), v); return X(Math.pow(10, so(v))); }

  /* =====================================================================
     BIỂU THỨC: dòng = mảng phần tử. Phần tử: {k:'c', v:'7'} (kí tự / hàm / biến) hoặc khuôn {k:'phan', a:[], b:[]}…
     ===================================================================== */
  var KHUON = { phan: ['a', 'b'], hon: ['w', 'a', 'b'], can: ['a'], canN: ['n', 'a'], mu: ['a'], logab: ['b', 'a'], ex: ['a'], p10: ['a'], abs: ['a'],
    tp: ['f', 'a', 'b'], dh: ['f', 'x'], sig: ['f', 'a', 'b'], tich: ['f', 'a', 'b'] };
  function taoKhuon(k, sanCo) { var o = { k: k }; KHUON[k].forEach(function (t) { o[t] = []; }); if (sanCo) Object.keys(sanCo).forEach(function (t) { o[t] = sanCo[t]; }); return o; }
  function saoChep(row) { return row.map(function (it) { if (it.k === 'c') return { k: 'c', v: it.v }; var o = { k: it.k }; KHUON[it.k].forEach(function (t) { o[t] = saoChep(it[t]); }); return o; }); }
  function kt(v) { return { k: 'c', v: v }; }
  // tìm cha của một dòng con: { muc, truong, dongCha, viTri }
  function timCha(goc, dong) {
    for (var i = 0; i < goc.length; i++) {
      var it = goc[i]; if (it.k === 'c') continue;
      var ts = KHUON[it.k];
      for (var j = 0; j < ts.length; j++) {
        if (it[ts[j]] === dong) return { muc: it, truong: j, dongCha: goc, viTri: i };
        var t = timCha(it[ts[j]], dong); if (t) return t;
      }
    }
    return null;
  }

  /* ---------- tách token và phân tích cú pháp (theo trình tự ưu tiên của máy) ---------- */
  var HAM = { 'sin(': 'sin', 'cos(': 'cos', 'tan(': 'tan', 'sin⁻¹(': 'asin', 'cos⁻¹(': 'acos', 'tan⁻¹(': 'atan', 'log(': 'log', 'ln(': 'ln',
    'Pol(': 'Pol', 'Rec(': 'Rec', 'GCD(': 'GCD', 'LCM(': 'LCM', 'Int(': 'Int', 'Intg(': 'Intg', 'Rnd(': 'Rnd', 'RanInt#(': 'RanInt' };
  var BIEN = ['A', 'B', 'C', 'D', 'E', 'F', 'x', 'y', 'z', 'M'];
  var HAU_TO = { '²': 1, '³': 1, '⁻¹': 1, '!': 1, '%': 1 };
  function tachToken(row) {
    var tk = [], i = 0;
    while (i < row.length) {
      var it = row[i];
      if (it.k !== 'c') { tk.push(it.k === 'mu' ? { t: 'mu', node: it } : { t: 'khuon', node: it }); i++; continue; }
      var v = it.v;
      if (/^[0-9.]$/.test(v) || v === 'E') {   // số: chữ số, dấu chấm, ×10^n
        var s = '', e = null, eSo = '';
        while (i < row.length && row[i].k === 'c' && /^[0-9.]$/.test(row[i].v)) { s += row[i].v; i++; }
        if (i < row.length && row[i].k === 'c' && row[i].v === 'E') {
          i++; e = '';
          if (i < row.length && row[i].k === 'c' && row[i].v === 'neg') { e = '-'; i++; }
          while (i < row.length && row[i].k === 'c' && /^[0-9]$/.test(row[i].v)) { eSo += row[i].v; i++; }
          if (!eSo) loi('Syntax');
        }
        var gt = docSo(s === '' ? '1' : s, e === null ? null : e + eSo);
        // độ phút giây: a°b°c°
        if (i < row.length && row[i].k === 'c' && row[i].v === '°') {
          i++; var tong = gt, chiaDMS = [60, 3600];
          for (var lan = 0; lan < 2; lan++) {
            var j = i, s2 = '';
            while (j < row.length && row[j].k === 'c' && /^[0-9.]$/.test(row[j].v)) { s2 += row[j].v; j++; }
            if (s2 && j < row.length && row[j].k === 'c' && row[j].v === '°') { tong = cong(tong, chia(docSo(s2, null), tuSoNguyen(chiaDMS[lan]))); i = j + 1; } else break;
          }
          gt = tong;
        }
        tk.push({ t: 'so', v: gt }); continue;
      }
      i++;
      if (v === '+' || v === '-' || v === '×' || v === '÷' || v === 'P' || v === 'C') tk.push({ t: 'op', v: v });
      else if (v === 'neg') tk.push({ t: 'am' });
      else if (v === '(') tk.push({ t: 'mo' });
      else if (v === ')') tk.push({ t: 'dong' });
      else if (v === ',') tk.push({ t: 'phay' });
      else if (v === '=') tk.push({ t: 'bang' });
      else if (HAM[v]) tk.push({ t: 'ham', v: HAM[v] });
      else if (BIEN.indexOf(v) >= 0 || v === 'Ans' || v === 'PreAns') tk.push({ t: 'bien', v: v });
      else if (v === 'π' || v === 'e' || v === 'Ran#') tk.push({ t: 'hang', v: v });
      else if (HAU_TO[v]) tk.push({ t: 'hau', v: v });
      else if (v === '°') loi('Syntax');
      else loi('Syntax');
    }
    return tk;
  }
  function docSo(s, e) {
    if ((s.match(/\./g) || []).length > 1 || s === '.') loi('Syntax');
    var p = s.split('.'), nguyenP = p[0] || '0', le = p[1] || '';
    var v = Q(BigInt(nguyenP + le), B10 ** BigInt(le.length));
    if (e !== null) { var k = parseInt(e, 10); if (Math.abs(k) > 99) loi('Math'); v = nhan(v, k >= 0 ? Q(B10 ** BigInt(k)) : Q(B1, B10 ** BigInt(-k))); }
    return v;
  }
  function batDauGiaTri(t) { return t && (t.t === 'so' || t.t === 'bien' || t.t === 'hang' || t.t === 'mo' || t.t === 'ham' || t.t === 'khuon'); }
  var BP = { '+': 10, '-': 10, '×': 20, '÷': 20, 'P': 26, 'C': 26 };
  function tinhDong(row, env) {
    if (!row.length) loi('Syntax');
    var p = { tk: tachToken(row), i: 0, env: env || {} };
    var v = bieuThuc(p, 0);
    if (p.i < p.tk.length) loi('Syntax');
    return v;
  }
  function bieuThuc(p, minBp) {
    var trai = tienTo(p);
    for (;;) {
      var t = p.tk[p.i]; if (!t) break;
      if (t.t === 'op') {
        var bp = BP[t.v]; if (bp <= minBp) break; p.i++;
        var phai = bieuThuc(p, bp);
        trai = t.v === '+' ? cong(trai, phai) : t.v === '-' ? tru(trai, phai) : t.v === '×' ? nhan(trai, phai) : t.v === '÷' ? chia(trai, phai) : t.v === 'P' ? hoanVi(trai, phai) : toHop(trai, phai);
      } else if (batDauGiaTri(t)) {   // phép nhân bỏ dấu nhân (ưu tiên cao hơn × ÷)
        if (30 <= minBp) break;
        trai = nhan(trai, bieuThuc(p, 30));
      } else break;
    }
    return trai;
  }
  function tienTo(p) {
    var t = p.tk[p.i++], v;
    if (!t) loi('Syntax');
    if (t.t === 'am') return am(bieuThuc(p, 35));
    if (t.t === 'so') v = t.v;
    else if (t.t === 'bien') v = t.v === 'Ans' ? st.ans : t.v === 'PreAns' ? st.preAns : (p.env[t.v] !== undefined ? p.env[t.v] : st.bien[t.v]);
    else if (t.t === 'hang') v = t.v === 'π' ? PI_V : t.v === 'e' ? X(Math.E) : Q(BigInt(Math.floor(Math.random() * 1000)), BigInt(1000));
    else if (t.t === 'mo') { v = bieuThuc(p, 0); if (p.tk[p.i] && p.tk[p.i].t === 'dong') p.i++; else if (p.i < p.tk.length) loi('Syntax'); }
    else if (t.t === 'ham') {
      var ds = [bieuThuc(p, 0)];
      while (p.tk[p.i] && p.tk[p.i].t === 'phay') { p.i++; ds.push(bieuThuc(p, 0)); }
      if (p.tk[p.i] && p.tk[p.i].t === 'dong') p.i++; else if (p.i < p.tk.length) loi('Syntax');
      v = goiHam(t.v, ds);
    } else if (t.t === 'khuon') v = tinhKhuon(t.node, p.env);
    else loi('Syntax');
    // hàm đứng sau giá trị: x², x³, x⁻¹, x!, %, lũy thừa
    for (;;) {
      var h = p.tk[p.i]; if (!h) break;
      if (h.t === 'hau') { p.i++; v = h.v === '²' ? luyThua(v, tuSoNguyen(2)) : h.v === '³' ? luyThua(v, tuSoNguyen(3)) : h.v === '⁻¹' ? nghichDao(v) : h.v === '!' ? giaiThua(v) : chia(v, tuSoNguyen(100)); }
      else if (h.t === 'mu') { p.i++; v = luyThua(v, tinhDong(h.node.a, p.env)); }
      else break;
    }
    return v;
  }
  function soDoi(n, ds) { if (ds.length !== n) loi('Argument'); }
  function goiHam(ten, ds) {
    if (ten === 'Pol' || ten === 'Rec') {
      soDoi(2, ds); var a = so(ds[0]), b = so(ds[1]), r, th;
      if (ten === 'Pol') {
        if (laCX(ds[0]) && laCX(ds[1])) r = canHai(cong(nhan(ds[0], ds[0]), nhan(ds[1], ds[1]))); else r = X(Math.hypot(a, b));
        if (a === 0 && b === 0) loi('Math');
        var thD = Math.atan2(b, a) * 180 / Math.PI, thX = laCX(ds[0]) && laCX(ds[1]) ? hamGocPol(ds[0], ds[1], thD) : tuDo(X(thD));
        st.bien.x = r; st.bien.y = thX;
        return { cap: [['r', r], ['θ', thX]] };
      }
      var cx = hamLG('cos', ds[1]), sy = hamLG('sin', ds[1]);
      var xr = nhan(ds[0], cx), yr = nhan(ds[0], sy);
      st.bien.x = xr; st.bien.y = yr;
      return { cap: [['x', xr], ['y', yr]] };
    }
    if (ten === 'GCD' || ten === 'LCM') {
      soDoi(2, ds); var m = nguyen(ds[0]), n = nguyen(ds[1]);
      if (ten === 'GCD') return Q(bGcd(m, n));
      if (m === B0 || n === B0) return KHONG; return Q(bAbs(m * n) / bGcd(m, n));
    }
    if (ten === 'RanInt') { soDoi(2, ds); var lo = nguyen(ds[0]), hi = nguyen(ds[1]); if (lo > hi) loi('Math'); return Q(lo + BigInt(Math.floor(Math.random() * (Number(hi - lo) + 1)))); }
    soDoi(1, ds); var v = ds[0];
    switch (ten) {
      case 'sin': case 'cos': case 'tan': case 'asin': case 'acos': case 'atan': return hamLG(ten, v);
      case 'log': return log10(v);
      case 'ln': return lnHam(v);
      case 'Int': return laHuuTi(v) ? Q(v.n / v.d) : X(Math.trunc(so(v)));
      case 'Intg': if (laHuuTi(v)) { var q = v.n / v.d; if (v.n < B0 && q * v.d !== v.n) q -= B1; return Q(q); } return X(Math.floor(so(v)));
      case 'Rnd': return lamTronHienThi(v);
    }
    loi('Syntax');
  }
  function hamGocPol(a, b, thD) {   // góc θ của Pol: chính xác khi là góc đặc biệt
    var x = so(a), y = so(b);
    var dacBiet = [0, 30, 45, 60, 90, 120, 135, 150, 180, -30, -45, -60, -90, -120, -135, -150];
    for (var i = 0; i < dacBiet.length; i++) if (Math.abs(thD - dacBiet[i]) < 1e-9) return tuDo(tuSoNguyen(dacBiet[i]));
    return tuDo(X(thD));
  }
  function tinhKhuon(n, env) {
    switch (n.k) {
      case 'phan': return chia(tinhDong(n.a, env), tinhDong(n.b, env));
      case 'hon': { var w = tinhDong(n.w, env), f = chia(tinhDong(n.a, env), tinhDong(n.b, env)); return so(w) < 0 ? tru(w, f) : cong(w, f); }
      case 'can': return canHai(tinhDong(n.a, env));
      case 'canN': return canBacN(tinhDong(n.n, env), tinhDong(n.a, env));
      case 'logab': return logAB(tinhDong(n.b, env), tinhDong(n.a, env));
      case 'ex': return eMu(tinhDong(n.a, env));
      case 'p10': return muuMuoi(tinhDong(n.a, env));
      case 'abs': { var v = tinhDong(n.a, env); return so(v) < 0 ? am(v) : v; }
      case 'tp': return tichPhan(n, env);
      case 'dh': return daoHam(n, env);
      case 'sig': case 'tich': return tongTich(n, env);
    }
    loi('Syntax');
  }
  function fX(row, env) { return function (x) { var e = Object.assign({}, env); e.x = X(x); return so(tinhDong(row, e)); }; }
  function tichPhan(n, env) {   // Gauss–Kronrod 15 điểm thích nghi
    var a = so(tinhDong(n.a, env)), b = so(tinhDong(n.b, env)), f = fX(n.f, env);
    if (a === b) return KHONG;
    var XK = [0.991455371120813, 0.949107912342759, 0.864864423359769, 0.741531185599394, 0.586087235467691, 0.405845151377397, 0.207784955007898, 0];
    var WK = [0.022935322010529, 0.063092092629979, 0.104790010322250, 0.140653259715525, 0.169004726639267, 0.190350578064785, 0.204432940075298, 0.209482141084728];
    var WG = [0, 0.129484966168870, 0, 0.279705391489277, 0, 0.381830050505119, 0, 0.417959183673469];
    var dem = 0;
    function gk(l, r) {
      var c = (l + r) / 2, h = (r - l) / 2, sk = 0, sg = 0;
      for (var i = 0; i < 8; i++) {
        if (i === 7) { var fc = f(c); sk += WK[7] * fc; sg += WG[7] * fc; break; }
        var f1 = f(c - h * XK[i]), f2 = f(c + h * XK[i]); sk += WK[i] * (f1 + f2); sg += WG[i] * (f1 + f2);
      }
      return [sk * h, Math.abs((sk - sg) * h)];
    }
    function tt(l, r, tol, sau) {
      var k = gk(l, r); if (++dem > 2000) loi('Time Out');
      if (k[1] <= tol || sau > 40) return k[0];
      var m = (l + r) / 2; return tt(l, m, tol / 2, sau + 1) + tt(m, r, tol / 2, sau + 1);
    }
    return X(tt(a, b, 1e-10 * Math.max(1, Math.abs(b - a)), 0));
  }
  function daoHam(n, env) {
    var x0 = so(tinhDong(n.x, env)), f = fX(n.f, env), h = 1e-3 * Math.max(1, Math.abs(x0));
    function D(h) { return (f(x0 + h) - f(x0 - h)) / (2 * h); }
    var d1 = D(h), d2 = D(h / 2), d3 = D(h / 4);   // ngoại suy Richardson
    var r1 = (4 * d2 - d1) / 3, r2 = (4 * d3 - d2) / 3;
    return X((16 * r2 - r1) / 15);
  }
  function tongTich(n, env) {
    var a = tinhDong(n.a, env), b = tinhDong(n.b, env);
    if (!laNguyen(a) || !laNguyen(b)) loi('Math');
    if (b.n - a.n > BigInt(9999)) loi('Math');
    var kq = n.k === 'sig' ? KHONG : MOT;
    for (var k = a.n; k <= b.n; k++) { var e = Object.assign({}, env); e.x = Q(k); var v = tinhDong(n.f, e); kq = n.k === 'sig' ? cong(kq, v) : nhan(kq, v); }
    return kq;
  }

  /* =====================================================================
     HIỂN THỊ KẾT QUẢ
     ===================================================================== */
  function dauThapPhan(s) { return st.cd.dauTP === ',' ? s.replace('.', ',') : s; }
  function tachNghin(s) {
    if (!st.cd.tachSo) return s;
    var p = s.split('.'); p[0] = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, st.cd.dauTP === ',' ? '.' : ','); return p.join('.');
  }
  function muHtml(m) { return '×10<sup class="m-mu">' + (m < 0 ? '−' + (-m) : m) + '</sup>'; }
  function boKhong(s) { return s.indexOf('.') >= 0 ? s.replace(/0+$/, '').replace(/\.$/, '') : s; }
  function dinhDangSo(x, ep) {   // số thực → chuỗi HTML theo Norm / Fix / Sci
    if (x === 0) return '0';
    var dau = x < 0 ? '−' : '', ax = Math.abs(x), f = st.cd.dang;
    if (ax >= 1e100 || ax < 1e-99) loi('Math');
    function sci(chuSo) {
      var m = ax.toExponential(chuSo - 1), pp = m.split('e'), man = pp[0], mu = parseInt(pp[1], 10);
      if (f.k !== 'sci') man = boKhong(man);
      return dau + dauThapPhan(man) + muHtml(mu);
    }
    if (ep !== undefined) {   // ký pháp kỹ thuật: số mũ là bội của 3
      var e = Math.floor(Math.log10(ax) + 1e-12); e = Math.floor(e / 3) * 3 + ep;
      var man2 = ax / Math.pow(10, e);
      return dau + dauThapPhan(boKhong(man2.toPrecision(10).indexOf('e') >= 0 ? String(man2) : String(Number(man2.toPrecision(10))))) + muHtml(e);
    }
    if (f.k === 'sci') return sci(f.n === 0 ? 10 : f.n);
    if (f.k === 'fix') {
      if (ax >= 1e10) return sci(10);
      var s = ax.toFixed(f.n); if (Number(s) === 0 && ax > 0) return sci(10);
      return dau + dauThapPhan(tachNghin(s));
    }
    var nguong = f.n === 2 ? 1e-9 : 1e-2;
    var tron = Number(ax.toPrecision(10));
    if (tron >= 1e10 || tron < nguong) return sci(10);
    var s2 = tron.toPrecision(10); if (s2.indexOf('e') >= 0) s2 = String(tron);
    return dau + dauThapPhan(tachNghin(boKhong(s2)));
  }
  function lamTronHienThi(v) {   // Rnd: làm tròn theo định dạng hiển thị
    var x = so(v), f = st.cd.dang;
    if (f.k === 'fix') return Math.abs(x) < 1e15 ? Q(BigInt(Math.round(x * Math.pow(10, f.n))), B10 ** BigInt(f.n)) : X(x);
    if (f.k === 'sci') return X(Number(x.toPrecision(f.n || 10)));
    return X(Number(x.toPrecision(10)));
  }
  function tongChuSoPS(n, d) { return soChuSo(n) + soChuSo(d); }
  // các dạng hiển thị của một kết quả: [{k:'chinh'|'tuanHoan'|'tp', html}]
  function htmlPhanSo(tu, mau) { return '<span class="m-phan"><span class="m-tu">' + tu + '</span><span class="m-mau">' + mau + '</span></span>'; }
  function htmlCan(r) { return '<span class="m-can"><span class="m-dau">√</span><span class="m-duoi">' + r + '</span></span>'; }
  function dangChinhXac(v) {   // HTML dạng phân số / căn / π, hoặc null nếu không hiển thị được
    if (!laCX(v)) return null;
    var dau = v.n < B0 ? '−' : '', n = bAbs(v.n), d = v.d;
    if (v.r === B1 && !v.pi) {
      if (d === B1) return soChuSo(n) <= 10 ? dau + n.toString() : null;
      if (tongChuSoPS(n, d) > 10) return null;
      if ((st.cd.honSo !== honDao) && n > d) { var w = n / d, r = n % d; if (soChuSo(w) + tongChuSoPS(r, d) > 10) return null; return dau + w.toString() + htmlPhanSo(r.toString(), d.toString()); }
      return dau + htmlPhanSo(n.toString(), d.toString());
    }
    if (v.pi && v.r !== B1) return null;
    var ky = v.pi ? 'π' : htmlCan(v.r.toString());
    if (soChuSo(n) + soChuSo(d) + (v.pi ? 0 : soChuSo(v.r)) > 10) return null;
    var heSo = n === B1 ? '' : n.toString();
    if (d === B1) return dau + heSo + ky;
    if (v.pi) return dau + htmlPhanSo(heSo + 'π', d.toString());
    return dau + htmlPhanSo(heSo + ky, d.toString());
  }
  function thapPhanTuanHoan(v) {   // phân số → 0,(142857) nếu phù hợp
    if (!laHuuTi(v) || v.d === B1) return null;
    var n = bAbs(v.n), d = v.d, w = n / d, r = n % d;
    if (soChuSo(w) + tongChuSoPS(r, d) + 1 > 10) return null;
    var cs = '', gap = {}, vt = 0;
    while (r !== B0 && gap[r.toString()] === undefined && vt < 60) { gap[r.toString()] = vt; r *= B10; cs += (r / d).toString(); r %= d; vt++; }
    if (r === B0) return null;   // hữu hạn: không phải tuần hoàn
    var bd = gap[r.toString()], truocCK = cs.slice(0, bd), chuKy = cs.slice(bd);
    if ((w.toString() + truocCK + chuKy).length > 10) return null;
    return (v.n < B0 ? '−' : '') + w.toString() + dauThapPhan('.') + truocCK + '<span class="m-ck">' + chuKy + '</span>';
  }
  var honDao = false;   // SHIFT S⇔D: tạm đổi giữa hỗn số và phân số cho kết quả đang hiện
  function cacDang(v) {
    var ds = [], cx = st.cd.io === 'MathI/MathO' ? dangChinhXac(v) : null;
    if (cx !== null && !(laNguyen(v))) {
      ds.push({ k: 'chinh', html: cx });
      if (st.cd.tuanHoan) { var th = thapPhanTuanHoan(v); if (th) ds.push({ k: 'tuanHoan', html: th }); }
    } else if (cx !== null) ds.push({ k: 'chinh', html: cx });
    var tp = dinhDangSo(so(v));
    if (!ds.length || ds[ds.length - 1].html !== tp) ds.push({ k: 'tp', html: tp });
    if (ds.length > 1 && ds[0].html === tp) ds.shift();
    return ds;
  }
  function dmsHtml(x) {
    var dau = x < 0 ? '−' : ''; x = Math.abs(x);
    var d = Math.floor(x), m0 = (x - d) * 60, m = Math.floor(m0 + 1e-9), s = (m0 - m) * 60;
    s = Number(s.toFixed(2)); if (s >= 60) { s = 0; m++; } if (m >= 60) { m = 0; d++; }
    return dau + d + '°' + m + '\'' + dauThapPhan(boKhong(s.toFixed(2))) + '"';
  }
  function thuaSoNguyenTo(v) {
    if (!laNguyen(v) || v.n <= B1 || v.n >= BigInt(1e10)) return null;
    var n = Number(v.n), ds = [];
    for (var p = 2; p * p <= n && p < 1000; p++) { var k = 0; while (n % p === 0) { n /= p; k++; } if (k) ds.push(p + (k > 1 ? '<sup class="m-mu">' + k + '</sup>' : '')); }
    if (n > 1) ds.push(n > 1e6 ? '(' + n + ')' : String(n));
    return ds.join('×');
  }

  /* =====================================================================
     TRẠNG THÁI MÁY
     ===================================================================== */
  var CD_MD = { io: 'MathI/MathO', goc: 'D', dang: { k: 'norm', n: 1 }, honSo: false, kyHieuKT: false, phuc: 'a+bi', tanSo: false, ptPhuc: true, bang: 'f(x),g(x)', tuanHoan: true, dauTP: '.', tachSo: false, ngonNgu: 'Tiếng Việt' };
  function trangThaiMoi() {
    var b = {}; BIEN.forEach(function (t) { b[t] = KHONG; });
    return { cd: JSON.parse(JSON.stringify(CD_MD)), cheDo: 'calc', man: 'tinh', shift: false, alpha: false, sto: false,
      dong: [], ct: null, kq: null, dangKq: 0, ans: KHONG, preAns: KHONG, bien: b, lichSu: [], xemLS: -1, loi: null, ds: null, menuChon: 0, truoc: null, eng: null, kqDong: null };
  }
  st = trangThaiMoi();
  try { var luu = JSON.parse(localStorage.getItem('geoink_may580_cd')); if (luu) Object.keys(luu).forEach(function (k) { if (k in st.cd) st.cd[k] = luu[k]; }); } catch (e) { }
  function luuCD() { try { localStorage.setItem('geoink_may580_cd', JSON.stringify(st.cd)); } catch (e) { } }
  st.ct = { row: st.dong, i: 0 };

  /* =====================================================================
     VẼ BIỂU THỨC (định dạng sách giáo khoa)
     ===================================================================== */
  var HIEN_KT = { '×': '×', '÷': '÷', '-': '−', '+': '+', 'neg': '<span class="m-am">-</span>', 'P': '<b class="m-pc">P</b>', 'C': '<b class="m-pc">C</b>', 'Ans': 'Ans', 'PreAns': 'PreAns', 'Ran#': 'Ran#', ',': ',', '=': '=' };
  function veDong(row, ct, laGoc) {
    if (!row.length) {
      if (laGoc) return ct && ct.row === row ? '<span class="m-ct"></span>' : '';
      return '<span class="m-o">' + (ct && ct.row === row ? '<span class="m-ct"></span>' : '') + '</span>';
    }
    var h = '', trongMu = false;
    for (var i = 0; i <= row.length; i++) {
      var it = row[i];
      if (trongMu && (!it || it.k !== 'c' || !/^[0-9]$|^neg$/.test(it.v))) { h += '</sup>'; trongMu = false; }
      if (ct && ct.row === row && ct.i === i) h += '<span class="m-ct"></span>';
      if (!it) break;
      if (it.k === 'c' && it.v === 'E') { h += '<span class="m-e10">×10</span><sup class="m-mu">'; trongMu = true; continue; }
      h += veMuc(it, ct);
    }
    if (trongMu) h += '</sup>';
    return h;
  }
  function veMuc(it, ct) {
    if (it.k === 'c') return HIEN_KT[it.v] !== undefined ? HIEN_KT[it.v] : it.v.replace(/</g, '&lt;');
    var d = function (t) { return veDong(it[t], ct, false); };
    switch (it.k) {
      case 'phan': return htmlPhanSo(d('a'), d('b'));
      case 'hon': return '<span class="m-hon">' + d('w') + htmlPhanSo(d('a'), d('b')) + '</span>';
      case 'can': return htmlCan(d('a'));
      case 'canN': return '<span class="m-can"><sup class="m-bac">' + d('n') + '</sup><span class="m-dau">√</span><span class="m-duoi">' + d('a') + '</span></span>';
      case 'mu': return '<sup class="m-mu">' + d('a') + '</sup>';
      case 'logab': return 'log<sub class="m-co">' + d('b') + '</sub>(' + d('a') + ')';
      case 'ex': return 'e<sup class="m-mu">' + d('a') + '</sup>';
      case 'p10': return '10<sup class="m-mu">' + d('a') + '</sup>';
      case 'abs': return '<span class="m-abs">' + d('a') + '</span>';
      case 'tp': return '<span class="m-lon"><span class="m-ky">∫</span><span class="m-gh"><span>' + d('b') + '</span><span>' + d('a') + '</span></span></span>(' + d('f') + ')dx';
      case 'dh': return '<span class="m-ddx">' + htmlPhanSo('d', 'dx') + '</span>(' + d('f') + ')<span class="m-tai">|<sub>x=' + d('x') + '</sub></span>';
      case 'sig': case 'tich': return '<span class="m-lon"><span class="m-gh m-gh-dung"><span>' + d('b') + '</span><span class="m-ky2">' + (it.k === 'sig' ? 'Σ' : '∏') + '</span><span>x=' + d('a') + '</span></span></span>(' + d('f') + ')';
    }
    return '';
  }

  /* =====================================================================
     SOẠN BIỂU THỨC: con trỏ, chèn, xoá
     ===================================================================== */
  function chen(it) {
    luuTruoc();
    var c = st.ct; c.row.splice(c.i, 0, it); c.i++;
    if (it.k !== 'c') { var t0 = KHUON[it.k][0], vao = it.k === 'canN' && it.n.length ? 'a' : t0; st.ct = { row: it[vao], i: it[vao].length }; }
  }
  function luuTruoc() { st.truoc = { dong: saoChep(st.dong) }; }
  function diPhai() {
    var c = st.ct, it = c.row[c.i];
    if (it) { if (it.k !== 'c') st.ct = { row: it[KHUON[it.k][0]], i: 0 }; else c.i++; return; }
    var cha = timCha(st.dong, c.row);
    if (!cha) { st.ct = { row: st.dong, i: 0 }; return; }   // cuối dòng: về đầu
    var ts = KHUON[cha.muc.k];
    if (cha.truong < ts.length - 1) st.ct = { row: cha.muc[ts[cha.truong + 1]], i: 0 };
    else st.ct = { row: cha.dongCha, i: cha.viTri + 1 };
  }
  function diTrai() {
    var c = st.ct;
    if (c.i > 0) { var it = c.row[c.i - 1]; if (it.k !== 'c') { var ts = KHUON[it.k], r = it[ts[ts.length - 1]]; st.ct = { row: r, i: r.length }; } else c.i--; return; }
    var cha = timCha(st.dong, c.row);
    if (!cha) { st.ct = { row: st.dong, i: st.dong.length }; return; }
    var ts2 = KHUON[cha.muc.k];
    if (cha.truong > 0) { var r2 = cha.muc[ts2[cha.truong - 1]]; st.ct = { row: r2, i: r2.length }; }
    else st.ct = { row: cha.dongCha, i: cha.viTri };
  }
  function diDoc(len) {   // ▲▼ trong phân số: chuyển giữa tử và mẫu
    var cha = timCha(st.dong, st.ct.row);
    while (cha) {
      var k = cha.muc.k, ts = KHUON[k], tr = ts[cha.truong];
      var dich = (k === 'phan' || k === 'hon') ? (len ? (tr === 'b' ? 'a' : null) : (tr === 'a' ? 'b' : null)) :
        (k === 'tp' || k === 'sig' || k === 'tich') ? (len ? (tr === 'a' ? 'b' : null) : (tr === 'b' ? 'a' : null)) : null;
      if (dich) { var r = cha.muc[dich]; st.ct = { row: r, i: Math.min(st.ct.i, r.length) }; return true; }
      cha = timCha(st.dong, cha.dongCha);
    }
    return false;
  }
  function xoaLui() {
    var c = st.ct; luuTruoc();
    if (c.i > 0) {
      var it = c.row[c.i - 1];
      if (it.k !== 'c') { var ts = KHUON[it.k], r = it[ts[ts.length - 1]]; st.ct = { row: r, i: r.length }; return; }
      c.row.splice(c.i - 1, 1); c.i--; return;
    }
    var cha = timCha(st.dong, c.row);   // đầu một ô trống của khuôn: gỡ khuôn, giữ phần đã nhập ở ô đầu
    if (!cha) return;
    var ts2 = KHUON[cha.muc.k], conLai = [];
    ts2.forEach(function (t) { conLai = conLai.concat(cha.muc[t]); });
    if (cha.muc.k !== 'mu' && conLai.length && cha.truong > 0) { var r2 = cha.muc[ts2[cha.truong - 1]]; st.ct = { row: r2, i: r2.length }; return; }
    cha.dongCha.splice.apply(cha.dongCha, [cha.viTri, 1].concat(conLai));
    st.ct = { row: cha.dongCha, i: cha.viTri };
  }

  /* =====================================================================
     PHÍM
     ===================================================================== */
  // [mã, nhãn, nhãn SHIFT, nhãn ALPHA, kiểu]
  var PHIM_TREN = { shift: ['SHIFT', '', '', 'tron vang'], alpha: ['ALPHA', '', '', 'tron do'], menu: ['MENU', 'SETUP', '', 'tron'], on: ['ON', '', '', 'tron'],
    optn: ['OPTN', '', '', 'cn'], calc: ['CALC', 'SOLVE', '=', 'cn'], tp: ['∫<small>▭</small>', 'd/dx', ':', 'cn'], x: ['<i>x</i>', 'Σ', '∏', 'cn'] };
  var HANG_CN = [
    [['phan', '<span class="k-ps">▭<br>▭</span>', '▭▭/▭', '÷R'], ['can', '√▭', '∛▭', ''], ['sq', '<i>x</i>²', '<i>x</i>³', ''], ['mu', '<i>x</i><sup>▭</sup>', 'ⁿ√▭', ''], ['logab', 'log<sub>▭</sub>▭', '10<sup>▭</sup>', ''], ['ln', 'ln', 'e<sup>▭</sup>', '']],
    [['am', '(−)', 'log', 'A'], ['dms', '°′″', 'FACT', 'B'], ['inv', '<i>x</i><sup>−1</sup>', '<i>x</i>!', 'C'], ['sin', 'sin', 'sin<sup>−1</sup>', 'D'], ['cos', 'cos', 'cos<sup>−1</sup>', 'E'], ['tan', 'tan', 'tan<sup>−1</sup>', 'F']],
    [['sto', 'STO', 'RECALL', ''], ['eng', 'ENG', '←', 'i'], ['mo', '(', 'Abs', '<i>x</i>'], ['dong', ')', ',', '<i>y</i>'], ['sd', 'S⇔D', 'a<sup>b</sup>/<sub>c</sub>⇔<sup>d</sup>/<sub>c</sub>', '<i>z</i>'], ['mcong', 'M+', 'M−', 'M']]
  ];
  var HANG_SO = [
    [['7', '7', 'CONST', ''], ['8', '8', 'CONV', ''], ['9', '9', 'RESET', ''], ['del', 'DEL', 'INS', 'UNDO', 'xanh'], ['ac', 'AC', 'OFF', '', 'xanh']],
    [['4', '4', '', ''], ['5', '5', '', ''], ['6', '6', '', ''], ['nhan', '×', '<sub>n</sub>P<sub>r</sub>', 'GCD'], ['chia', '÷', '<sub>n</sub>C<sub>r</sub>', 'LCM']],
    [['1', '1', '', ''], ['2', '2', '', ''], ['3', '3', '', ''], ['cong', '+', 'Pol', 'Int'], ['tru', '−', 'Rec', 'Intg']],
    [['0', '0', 'Rnd', ''], ['cham', '.', 'Ran#', 'RanInt'], ['e10', '×10<sup><i>x</i></sup>', 'π', 'e'], ['ans', 'Ans', '%', 'PreAns'], ['bang', '=', '≈', '']]
  ];
  function htmlPhim(p, kieu) {
    return '<div class="m5-o"><div class="m5-nhan"><span class="s">' + (p[2] || '') + '</span><span class="a">' + (p[3] || '') + '</span></div>' +
      '<button class="m5-k ' + (p[4] || kieu) + '" data-k="' + p[0] + '">' + p[1] + '</button></div>';
  }
  function htmlTren(k) { var p = PHIM_TREN[k]; return htmlPhim([k, p[0], p[1], p[2]], p[3]); }

  var CHEN_KT = {   // phím → kí tự chèn
    '0': '0', '1': '1', '2': '2', '3': '3', '4': '4', '5': '5', '6': '6', '7': '7', '8': '8', '9': '9', cham: '.', cong: '+', tru: '-', nhan: '×', chia: '÷', am: 'neg',
    mo: '(', dong: ')', 's:dong': ',', e10: 'E', 's:e10': 'π', 'a:e10': 'e', ans: 'Ans', 'a:ans': 'PreAns', 's:ans': '%', sq: '²', 's:sq': '³', inv: '⁻¹', 's:inv': '!',
    sin: 'sin(', cos: 'cos(', tan: 'tan(', 's:sin': 'sin⁻¹(', 's:cos': 'cos⁻¹(', 's:tan': 'tan⁻¹(', 's:am': 'log(', ln: 'ln(', x: 'x',
    'a:am': 'A', 'a:dms': 'B', 'a:inv': 'C', 'a:sin': 'D', 'a:cos': 'E', 'a:tan': 'F', 'a:mo': 'x', 'a:dong': 'y', 'a:sd': 'z', 'a:mcong': 'M', 'a:calc': '=',
    's:nhan': 'P', 's:chia': 'C', 'a:nhan': 'GCD(', 'a:chia': 'LCM(', 's:cong': 'Pol(', 's:tru': 'Rec(', 'a:cong': 'Int(', 'a:tru': 'Intg(', 's:0': 'Rnd(', 's:cham': 'Ran#', 'a:cham': 'RanInt#(', dms: '°'
  };
  var CHEN_KHUON = { phan: 'phan', 's:phan': 'hon', can: 'can', 's:can': 'can3', mu: 'mu', 's:mu': 'canN', logab: 'logab', 's:logab': 'p10', 's:ln': 'ex', 's:mo': 'abs', tp: 'tp', 's:tp': 'dh', 's:x': 'sig', 'a:x': 'tich' };
  var BIEN_STO = { am: 'A', dms: 'B', inv: 'C', sin: 'D', cos: 'E', tan: 'F', mo: 'x', dong: 'y', sd: 'z', mcong: 'M', x: 'x' };
  var LA_TOAN_TU = { '+': 1, '-': 1, '×': 1, '÷': 1, '²': 1, '³': 1, '⁻¹': 1, '!': 1, '%': 1, 'P': 1, 'C': 1 };

  /* =====================================================================
     MENU, SETUP
     ===================================================================== */
  var CHE_DO = [['calc', 'Calculate', '×÷<br>+−'], ['phuc', 'Complex', '<b>i</b>∠'], ['baseN', 'Base-N', '2 8<br>10 16'], ['mt', 'Matrix', '[▫▫]'], ['vt', 'Vector', '↗'], ['tk', 'Statistics', '▁▃▅'],
    ['pp', 'Distribution', '⌒'], ['bang', 'Table', '▤▤'], ['pt', 'Equation/Func', 'xy<br>=0'], ['bpt', 'Inequality', 'xy<br>&gt;0'], ['kt', 'Verify', '⚖'], ['tl', 'Ratio', '▫:▫']];
  var MA_CHE_DO = '123456789ABC';
  function dsSetup() {
    var c = st.cd;
    return [
      ['Input/Output', [['MathI/MathO', function () { c.io = 'MathI/MathO'; }], ['MathI/DecimalO', function () { c.io = 'MathI/DecimalO'; }], ['LineI/LineO', function () { c.io = 'MathI/MathO'; baoNho('Đợt này chưa có LineI'); }], ['LineI/DecimalO', function () { c.io = 'MathI/DecimalO'; baoNho('Đợt này chưa có LineI'); }]]],
      ['Angle Unit', [['Degree', function () { c.goc = 'D'; }], ['Radian', function () { c.goc = 'R'; }], ['Gradian', function () { c.goc = 'G'; }]]],
      ['Number Format', [['Fix', function () { hoiSo('Fix', 0, 9, function (n) { c.dang = { k: 'fix', n: n }; }); return true; }], ['Sci', function () { hoiSo('Sci', 0, 9, function (n) { c.dang = { k: 'sci', n: n }; }); return true; }],
        ['Norm', function () { moDs('Norm', [['Norm 1', function () { c.dang = { k: 'norm', n: 1 }; }], ['Norm 2', function () { c.dang = { k: 'norm', n: 2 }; }]]); return true; }]]],
      ['Fraction Result', [['ab/c', function () { c.honSo = true; }], ['d/c', function () { c.honSo = false; }]]],
      ['Engineer Symbol', [['On', function () { c.kyHieuKT = true; }], ['Off', function () { c.kyHieuKT = false; }]]],
      ['Complex', [['a+bi', function () { c.phuc = 'a+bi'; }], ['r∠θ', function () { c.phuc = 'r∠θ'; }]]],
      ['Statistics', [['On', function () { c.tanSo = true; }], ['Off', function () { c.tanSo = false; }]]],
      ['Equation/Func', [['On', function () { c.ptPhuc = true; }], ['Off', function () { c.ptPhuc = false; }]]],
      ['Table', [['f(x)', function () { c.bang = 'f(x)'; }], ['f(x),g(x)', function () { c.bang = 'f(x),g(x)'; }]]],
      ['Recurring Dec', [['On', function () { c.tuanHoan = true; }], ['Off', function () { c.tuanHoan = false; }]]],
      ['Decimal Mark', [['Dot', function () { c.dauTP = '.'; }], ['Comma', function () { c.dauTP = ','; }]]],
      ['Digit Separator', [['On', function () { c.tachSo = true; }], ['Off', function () { c.tachSo = false; }]]],
      ['Language', [['English', function () { c.ngonNgu = 'English'; }], ['Tiếng Việt', function () { c.ngonNgu = 'Tiếng Việt'; }]]]
    ];
  }
  // danh sách chọn: { tieuDe, muc: [[nhãn, hàm]], dau (dòng đầu hiển thị), chon, cha }
  function moDs(tieuDe, muc, laGoc) {
    st.ds = { tieuDe: tieuDe, muc: muc, dau: 0, chon: 0, cha: laGoc ? null : st.ds };
    st.man = 'ds'; ve();
  }
  function moSetup() { moDs('SETUP', dsSetup().map(function (m) { return [m[0], function () { moDs(m[0], m[1]); return true; }]; }), true); }
  function chonDs(i) {
    var d = st.ds; if (!d || i < 0 || i >= d.muc.length) return;
    var giu = d.muc[i][1]();
    if (giu === true) return;   // đã mở danh sách con / hỏi tiếp
    luuCD(); veLaiKetQua(); veTinh();
  }
  function hoiSo(ten, lo, hi, xong) {
    st.ds = { tieuDe: ten + ' ' + lo + '~' + hi + '?', muc: [], dau: 0, chon: -1, cha: st.ds, hoiSo: { lo: lo, hi: hi, xong: xong } };
    st.man = 'ds'; ve();
  }
  function veLaiKetQua() { if (st.kq) st.dangKq = 0; }
  function veTinh() { st.man = 'tinh'; st.ds = null; ve(); }

  /* =====================================================================
     TÍNH TOÁN
     ===================================================================== */
  function tachBang(row) {   // dòng có dấu "=" ở mức ngoài cùng: [trái, phải]
    for (var i = 0; i < row.length; i++) if (row[i].k === 'c' && row[i].v === '=') return [row.slice(0, i), row.slice(i + 1)];
    return null;
  }
  function tinhNgay(thapPhan) {
    var row = st.dong; if (!row.length) return;
    try {
      var hai = tachBang(row), v;
      if (hai) { if (hai[0].length !== 1 || BIEN.indexOf(hai[0][0].v) < 0) loi('Syntax'); v = tinhDong(hai[1]); }
      else v = tinhDong(row);
      if (v && v.cap) { st.kq = { cap: v.cap }; datAns(v.cap[0][1]); }
      else {
        if (!laCX(v) && Math.abs(v.x) >= 1e100) loi('Math');
        if (hai) st.bien[hai[0][0].v] = v;
        st.kq = { v: v, tp: !!thapPhan || st.cd.io !== 'MathI/MathO', dms: row.some(function (it) { return it.k === 'c' && it.v === '°'; }) }; datAns(v);
      }
      st.dangKq = 0; st.eng = null; st.kqDong = saoChep(row);
      st.lichSu.push({ dong: saoChep(row), kq: st.kq }); if (st.lichSu.length > 30) st.lichSu.shift(); st.xemLS = -1;
    } catch (e) { if (e instanceof LoiMay) { st.loi = e.ten; st.man = 'loi'; } else { st.loi = 'Math'; st.man = 'loi'; console.error(e); } }
  }
  function datAns(v) { st.preAns = st.ans; st.ans = v; }
  function batDauMoi(it) {   // đang hiện kết quả mà bấm phím nhập: bắt đầu biểu thức mới (toán tử thì nối sau Ans)
    var laTT = it.k === 'c' && LA_TOAN_TU[it.v] || it.k === 'mu';
    st.dong = laTT ? [kt('Ans')] : []; st.ct = { row: st.dong, i: st.dong.length }; st.kq = null;
  }
  function suaLai(cuoi) { st.dong = st.kqDong ? saoChep(st.kqDong) : st.dong; st.ct = { row: st.dong, i: cuoi ? st.dong.length : 0 }; st.kq = null; }

  /* ---------- CALC / SOLVE ---------- */
  function cacBien(row, ds) {
    ds = ds || [];
    row.forEach(function (it) {
      if (it.k === 'c') { if (BIEN.indexOf(it.v) >= 0 && ds.indexOf(it.v) < 0) ds.push(it.v); return; }
      KHUON[it.k].forEach(function (t) { if ((it.k === 'tp' || it.k === 'dh' || it.k === 'sig' || it.k === 'tich') && t === 'f') return; cacBien(it[t], ds); });
    });
    return ds;
  }
  function batDauCalc() {
    var row = st.kq ? (st.kqDong || st.dong) : st.dong; if (!row.length) return;
    if (st.kq) { st.dong = saoChep(row); }
    var hai = tachBang(st.dong), ds = cacBien(hai ? hai[1] : st.dong);
    st.calc = { ds: ds, i: 0, gan: hai ? hai[0][0].v : null };
    if (!ds.length) { tinhNgay(); st.calc = null; return; }
    hoiBien();
  }
  function hoiBien() {
    var c = st.calc, ten = c.ds[c.i];
    c.o = []; c.ct = { row: c.o, i: 0 }; c.ten = ten; st.man = 'calc'; st.kq = null;
  }
  function xongBienCalc() {
    var c = st.calc;
    try {
      if (c.o.length) st.bien[c.ten] = tinhDong(c.o);
      c.i++;
      if (c.i < c.ds.length) return hoiBien();
      st.man = 'tinh'; st.ct = { row: st.dong, i: st.dong.length }; tinhNgay();
      if (st.man !== 'loi') st.calc.daTinh = true;
    } catch (e) { st.loi = e instanceof LoiMay ? e.ten : 'Math'; st.man = 'loi'; }
  }
  function batDauSolve() {
    var row = st.kq ? (st.kqDong || st.dong) : st.dong; if (!row.length) return;
    if (st.kq) st.dong = saoChep(row);
    var hai = tachBang(st.dong), ds = cacBien(st.dong);
    if (ds.indexOf('x') < 0) { st.loi = 'Variable'; st.man = 'loi'; return; }
    st.solve = { trai: hai ? hai[0] : st.dong, phai: hai ? hai[1] : [], ds: ds.filter(function (t) { return t !== 'x'; }).concat(['x']), i: 0 };
    st.calc = { ds: st.solve.ds, i: 0, gan: null, laSolve: true };
    hoiBien();
  }
  function giaiSolve() {
    var s = st.solve, f = function (x) { var e = { x: X(x) }; var l = so(tinhDong(s.trai, e)), r = s.phai.length ? so(tinhDong(s.phai, e)) : 0; return l - r; };
    var x = so(st.bien.x), fx;
    try {
      for (var k = 0; k < 150; k++) {
        fx = f(x); if (Math.abs(fx) < 1e-14) break;
        var h = 1e-6 * Math.max(1, Math.abs(x)), d = (f(x + h) - f(x - h)) / (2 * h);
        if (!isFinite(d) || d === 0) { x += h * 100; continue; }
        var buoc = fx / d, xm = x - buoc, lap = 0;
        while (lap++ < 30) { try { if (Math.abs(f(xm)) < Math.abs(fx) || lap > 25) break; } catch (e) { } buoc /= 2; xm = x - buoc; }
        if (Math.abs(xm - x) < 1e-15 * Math.max(1, Math.abs(x))) { x = xm; break; }
        x = xm;
      }
      fx = f(x);
      if (!isFinite(fx) || Math.abs(fx) > 1e-6 * Math.max(1, Math.abs(x))) { st.loi = 'Cannot Solve'; st.man = 'loi'; return; }
      var xv = X(x), r = Math.round(x * 1e9) / 1e9; if (Math.abs(r - x) < 1e-11 && Math.abs(r) < 1e9 && Number.isInteger(r * 1)) xv = tuSoNguyen(r);
      st.bien.x = xv; datAns(xv);
      st.kq = { solve: true, x: xv, lr: X(Math.abs(fx) < 1e-15 ? 0 : fx) }; st.kqDong = saoChep(st.dong); st.man = 'tinh'; st.ct = { row: st.dong, i: st.dong.length };
    } catch (e) { st.loi = e instanceof LoiMay ? e.ten : 'Cannot Solve'; st.man = 'loi'; }
  }

  /* ---------- xử lý phím ---------- */
  function bamPhim(k) {
    if (k === 'shift') { st.shift = !st.shift; st.alpha = false; return veTT(); }
    if (k === 'alpha') { st.alpha = !st.alpha; st.shift = false; return veTT(); }
    var ma = (st.shift ? 's:' : st.alpha ? 'a:' : '') + k;
    st.shift = false; st.alpha = false;
    if (ma === 's:ac') return dong();
    if (k === 'on') { var cd = st.cd; st.man = 'tinh'; st.dong = []; st.ct = { row: st.dong, i: 0 }; st.kq = null; st.cd = cd; return ve(); }
    if (st.man === 'menu') return phimMenu(ma);
    if (st.man === 'ds') return phimDs(ma);
    if (st.man === 'loi') return phimLoi(ma);
    if (st.man === 'calc') return phimCalc(ma);
    if (ma === 'menu') { st.man = 'menu'; st.menuChon = Math.max(0, CHE_DO.map(function (c) { return c[0]; }).indexOf(st.cheDo)); return ve(); }
    if (ma === 's:menu') return moSetup();
    if (st.cheDo !== 'calc') { if (ma === 'ac') return ve(); return; }
    phimTinh(ma, k);
    ve();
  }
  function phimTinh(ma, k) {
    if (st.sto) {   // STO → chọn biến
      st.sto = false; var bien = BIEN_STO[k];
      if (!bien) return;
      if (!st.kq) { tinhNgay(); if (st.man === 'loi') return; }
      var v = st.kq && st.kq.v ? st.kq.v : st.ans; st.bien[bien] = v; st.kq = { v: v, tp: st.kq ? st.kq.tp : false, stoTen: bien }; return;
    }
    if (ma === 'sto') { st.sto = true; return; }
    if (ma === 's:sto') { moXemBien(); return; }
    if (ma === 'ac') { st.dong = []; st.ct = { row: st.dong, i: 0 }; st.kq = null; st.calc = null; st.xemLS = -1; return; }
    if (ma === 'bang' || ma === 's:bang') {
      if (st.calc && st.calc.daTinh && st.kq) { batDauCalc(); return; }
      if (st.kq && st.kqDong) { st.dong = saoChep(st.kqDong); }
      tinhNgay(ma === 's:bang'); return;
    }
    if (ma === 'calc') { batDauCalc(); return; }
    if (ma === 's:calc') { batDauSolve(); return; }
    if (ma === 'sd' && st.kq) {
      if (st.kq.v) {
        if (st.kq.tp && st.cd.io === 'MathI/MathO' && dangChinhXac(st.kq.v) !== null) { st.kq.tp = false; st.dangKq = 0; }
        else { var n = cacDangKQ().length; st.dangKq = (st.dangKq + 1) % n; }
        st.eng = null; st.kq.dms = st.kq.fact = false;
      }
      return;
    }
    if (ma === 's:sd' && st.kq) { if (st.kq.v && laHuuTi(st.kq.v) && st.kq.v.d !== B1) { st.kq.honDao = !st.kq.honDao; st.kq.tp = false; st.dangKq = 0; } return; }
    if (ma === 'dms' && st.kq && st.kq.v) { st.kq.dms = !st.kq.dms; return; }
    if (ma === 's:dms' && st.kq && st.kq.v) { st.kq.fact = !st.kq.fact; return; }
    if ((ma === 'eng' || ma === 's:eng') && st.kq && st.kq.v) { st.eng = (st.eng === null ? 0 : st.eng) + (ma === 'eng' ? -3 : 3); if (st.eng === null) st.eng = 0; return; }
    if (ma === 'mcong' || ma === 's:mcong') {
      if (!st.kq) { tinhNgay(); if (st.man === 'loi') return; }
      var gt = st.kq && st.kq.v ? st.kq.v : st.ans;
      st.bien.M = ma === 'mcong' ? cong(st.bien.M, gt) : tru(st.bien.M, gt); st.kq.mTen = ma === 'mcong' ? 'M+' : 'M−'; return;
    }
    if (ma === 'trai' || ma === 'phai') { if (st.kq) { suaLai(ma === 'trai'); return; } if (ma === 'trai') diTrai(); else diPhai(); return; }
    if (ma === 'len' || ma === 'xuong') {
      if (!st.kq && diDoc(ma === 'len')) return;
      if (!st.lichSu.length) return;   // xem lại lịch sử
      var i = st.xemLS < 0 ? st.lichSu.length - 1 : st.xemLS + (ma === 'len' ? -1 : 1);
      if (st.xemLS < 0 && ma === 'xuong') return;
      i = Math.max(0, Math.min(st.lichSu.length - 1, i)); st.xemLS = i;
      var h = st.lichSu[i]; st.dong = saoChep(h.dong); st.kqDong = saoChep(h.dong); st.kq = h.kq; st.dangKq = 0; st.ct = { row: st.dong, i: st.dong.length }; return;
    }
    if (ma === 'del') { if (st.kq) { suaLai(true); return; } xoaLui(); return; }
    if (ma === 'a:del') { if (st.truoc) { st.dong = st.truoc.dong; st.ct = { row: st.dong, i: st.dong.length }; st.truoc = null; st.kq = null; } return; }
    if (ma === 's:del') return;
    if (ma === 'optn' || ma === 's:7' || ma === 's:8') { baoNho(ma === 'optn' ? 'OPTN sẽ có ở đợt sau' : ma === 's:7' ? 'Hằng số khoa học (CONST) sẽ có ở đợt sau' : 'Chuyển đổi đơn vị (CONV) sẽ có ở đợt sau'); return; }
    if (ma === 's:9') { moDs('Reset', [['Setup Data', function () { st.cd = JSON.parse(JSON.stringify(CD_MD)); luuCD(); baoNho('Đã khởi động cài đặt'); }], ['Variable Memory', function () { BIEN.forEach(function (t) { st.bien[t] = KHONG; }); st.ans = KHONG; baoNho('Đã xoá các biến'); }], ['Initialize All', function () { st = trangThaiMoi(); st.ct = { row: st.dong, i: 0 }; luuCD(); baoNho('Đã khởi động lại máy'); }]], true); return; }
    // chèn khuôn / kí tự
    var kh = CHEN_KHUON[ma], it = null;
    if (kh === 'can3') it = taoKhuon('canN', { n: [kt('3')] });
    else if (kh) it = taoKhuon(kh);
    else if (CHEN_KT[ma] !== undefined) it = kt(CHEN_KT[ma]);
    if (!it) return;
    if (st.kq) batDauMoi(it);
    st.xemLS = -1; chen(it);
  }
  function cacDangKQ() {
    var k = st.kq; if (!k || !k.v) return [];
    if (k.tp) return [{ k: 'tp', html: dinhDangSo(so(k.v)) }];
    return cacDang(k.v);
  }
  function moXemBien() {
    st.man = 'ds';
    st.ds = { tieuDe: 'RECALL', xemBien: true, muc: BIEN.map(function (t) { return [t + '=' + dinhDangSo(so(st.bien[t])), function () { veTinh(); chen(kt(t)); return true; }]; }), dau: 0, chon: 0, cha: null };
    ve();
  }
  function phimMenu(ma) {
    var n = CHE_DO.length;
    if (ma === 'ac' || ma === 'menu') { st.man = 'tinh'; return ve(); }
    if (ma === 'trai') st.menuChon = (st.menuChon + n - 1) % n;
    else if (ma === 'phai') st.menuChon = (st.menuChon + 1) % n;
    else if (ma === 'len') st.menuChon = (st.menuChon + n - 4) % n;
    else if (ma === 'xuong') st.menuChon = (st.menuChon + 4) % n;
    else if (ma === 'bang') return chonCheDo(st.menuChon);
    else {
      var phimSo = { am: 'A', dms: 'B', inv: 'C' }[ma] || ma, i = MA_CHE_DO.indexOf(phimSo);
      if (i >= 0 && phimSo.length === 1) return chonCheDo(i);
    }
    ve();
  }
  function chonCheDo(i) {
    st.cheDo = CHE_DO[i][0]; st.man = 'tinh'; st.dong = []; st.ct = { row: st.dong, i: 0 }; st.kq = null;
    if (st.cheDo !== 'calc') baoNho(CHE_DO[i][1] + ': sẽ có ở đợt sau');
    ve();
  }
  function phimDs(ma) {
    var d = st.ds;
    if (d.hoiSo) {
      var c = /^[0-9]$/.test(ma) ? +ma : null;
      if (c !== null && c >= d.hoiSo.lo && c <= d.hoiSo.hi) { d.hoiSo.xong(c); luuCD(); veLaiKetQua(); return veTinh(); }
      if (ma === 'ac') return veTinh(); if (ma === 'trai') { st.ds = d.cha; return ve(); }
      return;
    }
    if (ma === 'ac') return veTinh();
    if (ma === 'trai' && d.cha) { st.ds = d.cha; return ve(); }
    if (ma === 'len') { d.dau = Math.max(0, d.dau - 1); return ve(); }
    if (ma === 'xuong') { d.dau = Math.min(Math.max(0, d.muc.length - 4), d.dau + 1); return ve(); }
    if (d.xemBien) {
      var bien = { am: 'A', dms: 'B', inv: 'C', sin: 'D', cos: 'E', tan: 'F', mo: 'x', dong: 'y', sd: 'z', mcong: 'M', x: 'x' }[ma.replace(/^[sa]:/, '')];
      if (bien) { veTinh(); if (st.kq) batDauMoi(kt(bien)); chen(kt(bien)); return ve(); }
      return;
    }
    if (/^[1-9]$/.test(ma)) { var i = +ma - 1; if (i < d.muc.length) chonDs(i); }
  }
  function phimLoi(ma) {
    if (ma === 'ac') { st.loi = null; st.man = 'tinh'; st.dong = []; st.ct = { row: st.dong, i: 0 }; st.kq = null; st.calc = null; return ve(); }
    if (ma === 'trai' || ma === 'phai') { st.loi = null; st.man = 'tinh'; st.ct = { row: st.dong, i: st.dong.length }; st.kq = null; return ve(); }
  }
  function phimCalc(ma) {
    var c = st.calc;
    if (ma === 'ac') { st.man = 'tinh'; st.calc = null; st.solve = null; st.ct = { row: st.dong, i: st.dong.length }; return ve(); }
    if (ma === 'bang') {
      if (c.laSolve) {
        try { if (c.o.length) st.bien[c.ten] = tinhDong(c.o); } catch (e) { st.loi = e instanceof LoiMay ? e.ten : 'Math'; st.man = 'loi'; return ve(); }
        c.i++; if (c.i < c.ds.length) { hoiBien(); return ve(); }
        st.calc = null; giaiSolve(); return ve();
      }
      xongBienCalc(); return ve();
    }
    // nhập số cho biến
    var luu = { dong: st.dong, ct: st.ct };
    st.dong = c.o; st.ct = c.ct;
    if (ma === 'del') xoaLui(); else if (ma === 'trai') diTrai(); else if (ma === 'phai') diPhai();
    else { var kh = CHEN_KHUON[ma], it = kh === 'can3' ? taoKhuon('canN', { n: [kt('3')] }) : kh ? taoKhuon(kh) : CHEN_KT[ma] !== undefined ? kt(CHEN_KT[ma]) : null; if (it) chen(it); }
    c.ct = st.ct; st.dong = luu.dong; st.ct = luu.ct;
    ve();
  }

  /* =====================================================================
     VẼ MÀN HÌNH
     ===================================================================== */
  var thongBaoTam = '', henTB = null;
  function baoNho(s) { thongBaoTam = s; clearTimeout(henTB); henTB = setTimeout(function () { thongBaoTam = ''; if (el && !el.classList.contains('an')) ve(); }, 1800); }
  function veTT() {
    if (!ttEl) return;
    var c = st.cd, f = c.dang;
    ttEl.innerHTML = (st.shift ? '<b class="m5-chi">S</b>' : '') + (st.alpha ? '<b class="m5-chi">A</b>' : '') + (st.bien.M && !la0(st.bien.M) ? '<span>M</span>' : '') +
      (st.sto ? '<span>→<i>x</i></span>' : '') + (f.k === 'fix' ? '<span>FIX</span>' : f.k === 'sci' ? '<span>SCI</span>' : '') +
      (c.io.indexOf('MathI') === 0 ? '<span class="tt-math">√▭⁄</span>' : '') + '<b class="m5-chi">' + c.goc + '</b>' +
      '<span class="tt-ten">' + (CHE_DO.filter(function (m) { return m[0] === st.cheDo; })[0] || ['', ''])[1] + '</span>';
  }
  function htmlKQ() {
    var k = st.kq; if (!k) return '';
    if (k.cap) return k.cap.map(function (p) { var d = cacDang(p[1]); return p[0] + '=' + d[0].html; }).join(', ');
    if (k.solve) return '<span class="m-solve"><i>x</i>=' + (cacDang(k.x)[0].html) + '<br>L−R=' + dinhDangSo(so(k.lr)) + '</span>';
    honDao = !!k.honDao;
    if (k.dms) return dmsHtml(so(k.v));
    if (k.fact) { var f = thuaSoNguyenTo(k.v); if (f) return f; }
    if (st.eng !== null) return dinhDangSo(so(k.v), st.eng);
    var ds = cacDangKQ(); if (!ds.length) return '';
    return ds[st.dangKq % ds.length].html;
  }
  function ve() {
    if (!el) return;
    veTT();
    var h = '';
    if (st.man === 'menu') {
      var trang = Math.floor(st.menuChon / 8), ds = CHE_DO.slice(trang * 8, trang * 8 + 8);
      h = '<div class="m5-menu-ten">' + CHE_DO[st.menuChon][1] + '</div><div class="m5-menu">' + ds.map(function (m, i) {
        var so2 = trang * 8 + i; return '<div class="m5-bt' + (so2 === st.menuChon ? ' chon' : '') + '"><span class="m5-bt-hinh">' + m[2] + '</span><span class="m5-bt-so">' + MA_CHE_DO[so2] + '</span></div>';
      }).join('') + '</div>';
    } else if (st.man === 'ds') {
      var d = st.ds;
      if (d.hoiSo) h = '<div class="m5-ds"><div>' + d.tieuDe + '</div></div>';
      else h = '<div class="m5-ds">' + (d.cha ? '<span class="m5-ds-lui">◀</span>' : '') + d.muc.slice(d.dau, d.dau + 4).map(function (m, i) { return '<div>' + (d.xemBien ? '' : (d.dau + i + 1) + ':') + m[0] + '</div>'; }).join('') +
        (d.muc.length > 4 ? '<span class="m5-cuon" style="top:' + (d.dau / (d.muc.length - 4) * 70) + '%"></span>' : '') + '</div>';
    } else if (st.man === 'loi') {
      var ten = { Math: 'Math ERROR', Syntax: 'Syntax ERROR', Argument: 'Argument ERROR', Stack: 'Stack ERROR', Variable: 'Variable ERROR', 'Cannot Solve': 'Cannot Solve', 'Time Out': 'Time Out' }[st.loi] || st.loi;
      h = '<div class="m5-loi"><b>' + ten + '</b><div>[AC] :Cancel</div><div>[◀][▶]:Goto</div></div>';
    } else if (st.man === 'calc') {
      var c = st.calc;
      h = '<div class="m5-vao">' + c.ten + '=' + veDong(c.o, c.ct, true) + '</div><div class="m5-ra">' + dinhDangSo(so(st.bien[c.ten])) + '</div>';
    } else {
      var kqH = '';
      try { kqH = htmlKQ(); } catch (e) { kqH = 'Math ERROR'; }
      var tren = st.kq && st.kq.stoTen ? 'Ans→' + st.kq.stoTen : st.kq && st.kq.mTen ? 'Ans' + st.kq.mTen : null;
      h = '<div class="m5-vao">' + (tren ? tren : veDong(st.dong, st.kq ? null : st.ct, true)) + '</div><div class="m5-ra">' + kqH + '</div>';
    }
    if (thongBaoTam) h += '<div class="m5-tb">' + thongBaoTam + '</div>';
    manEl.innerHTML = h;
    var vao = manEl.querySelector('.m5-vao'), ct = vao && vao.querySelector('.m-ct');
    if (vao && ct) { var x = ct.offsetLeft; if (x - vao.scrollLeft > vao.clientWidth - 14) vao.scrollLeft = x - vao.clientWidth + 24; else if (x < vao.scrollLeft + 6) vao.scrollLeft = Math.max(0, x - 24); }
    else if (vao) vao.scrollLeft = 0;
  }

  /* =====================================================================
     TẠO CỬA SỔ
     ===================================================================== */
  function tao() {
    el = document.createElement('div'); el.id = 'may-580'; el.className = 'an'; el.tabIndex = -1;
    el.innerHTML = '<div class="m5-dau"><span class="m5-hieu">580</span><span class="m5-phu">Máy tính khoa học · GeoInk</span><button class="m5-dong" title="Đóng (SHIFT AC)">✕</button></div>' +
      '<div class="m5-vien"><div class="m5-lcd"><div class="m5-tt"></div><div class="m5-man"></div></div></div>' +
      '<div class="m5-tren"><div class="m5-cum">' + htmlTren('shift') + htmlTren('alpha') + htmlTren('optn') + htmlTren('calc') + '</div>' +
      '<div class="m5-dpad"><button data-k="len" class="d-len"></button><button data-k="trai" class="d-trai"></button><button data-k="phai" class="d-phai"></button><button data-k="xuong" class="d-xuong"></button></div>' +
      '<div class="m5-cum">' + htmlTren('menu') + htmlTren('on') + htmlTren('tp') + htmlTren('x') + '</div></div>' +
      '<div class="m5-cn">' + HANG_CN.map(function (h) { return h.map(function (p) { return htmlPhim(p, 'cn'); }).join(''); }).join('') + '</div>' +
      '<div class="m5-so">' + HANG_SO.map(function (h) { return h.map(function (p) { return htmlPhim(p, 'trang'); }).join(''); }).join('') + '</div>';
    document.body.appendChild(el);
    ttEl = el.querySelector('.m5-tt'); manEl = el.querySelector('.m5-man');
    el.querySelectorAll('[data-k]').forEach(function (b) {
      b.addEventListener('pointerdown', function (e) { e.preventDefault(); });
      b.addEventListener('click', function () { bamPhim(b.dataset.k); el.focus({ preventScroll: true }); });
    });
    el.querySelector('.m5-dong').onclick = dong;
    // kéo cửa sổ
    var dau = el.querySelector('.m5-dau'), keo = null;
    dau.addEventListener('pointerdown', function (e) { if (e.target.closest('button')) return; var r = el.getBoundingClientRect(); keo = { dx: e.clientX - r.left, dy: e.clientY - r.top }; dau.setPointerCapture(e.pointerId); });
    dau.addEventListener('pointermove', function (e) { if (!keo) return; el.style.left = Math.max(0, e.clientX - keo.dx) + 'px'; el.style.top = Math.max(0, e.clientY - keo.dy) + 'px'; el.style.right = 'auto'; });
    dau.addEventListener('pointerup', function () { keo = null; });
    // bàn phím máy tính
    el.addEventListener('keydown', function (e) {
      var k = e.key, m = { Enter: 'bang', '=': 'bang', Backspace: 'del', Delete: 'del', Escape: 'ac', ArrowLeft: 'trai', ArrowRight: 'phai', ArrowUp: 'len', ArrowDown: 'xuong',
        '+': 'cong', '-': 'tru', '*': 'nhan', '/': 'chia', '.': 'cham', ',': 'cham', '(': 'mo', ')': 'dong', '^': 'mu' }[k] || (/^[0-9]$/.test(k) ? k : null);
      if (m) { e.preventDefault(); e.stopPropagation(); bamPhim(m); }
    });
  }
  function mo() { if (!el) tao(); el.classList.remove('an'); ve(); setTimeout(function () { el.focus({ preventScroll: true }); }, 0); }
  function dong() { if (el) el.classList.add('an'); }
  function batTat() { if (el && !el.classList.contains('an')) dong(); else mo(); }

  // dùng cho kiểm thử: bấm một chuỗi phím, đọc màn hình
  function bam(ds) { if (!el) tao(); ds.forEach(bamPhim); return { vao: manEl.querySelector('.m5-vao') ? manEl.querySelector('.m5-vao').textContent : '', ra: manEl.querySelector('.m5-ra') ? manEl.querySelector('.m5-ra').textContent : manEl.textContent }; }
  return { mo: mo, dong: dong, batTat: batTat, bam: bam };
})();
