// Lõi máy tính khoa học: đọc biểu thức LaTeX (từ ô nhập MathLive), tính giá trị, nhận dạng kết quả
// (phân số, căn, bội của π), giải phương trình, bất phương trình, thống kê.
window.GI = window.GI || {};
GI.mtLoi = (function () {
  // ---------------- tách từ ----------------
  var HAM = ['arcsin', 'arccos', 'arctan', 'sin', 'cos', 'tan', 'log', 'ln', 'exp'];
  // \frac13 → \frac{1}{3}, x^2 → x^{2}, \sqrt2 → \sqrt{2} (MathLive viết gọn đối số một kí tự)
  function boNgoac(s) {
    var kq = '', i = 0;
    function doiSo() {
      while (s[i] === ' ') i++;
      if (s[i] === '{') { var sau = 0, j = i; do { if (s[j] === '{') sau++; else if (s[j] === '}') sau--; j++; } while (sau > 0 && j < s.length); var g = s.slice(i + 1, j - 1); i = j; return '{' + boNgoac(g) + '}'; }
      if (s[i] === '\\') { var m = /^\\[A-Za-z]+/.exec(s.slice(i)); if (m) { i += m[0].length; return '{' + m[0] + '}'; } }
      var c = s[i] || ''; i++; return '{' + c + '}';
    }
    while (i < s.length) {
      var m = /^\\(d|t)?frac/.exec(s.slice(i));
      if (m) { i += m[0].length; kq += '\\frac' + doiSo() + doiSo(); continue; }
      if (/^\\sqrt/.test(s.slice(i))) { i += 5; while (s[i] === ' ') i++; if (s[i] === '[') { var j2 = s.indexOf(']', i); kq += '\\sqrt' + s.slice(i, j2 + 1); i = j2 + 1; } else kq += '\\sqrt'; kq += doiSo(); continue; }
      if (s[i] === '^' || s[i] === '_') { kq += s[i++]; kq += doiSo(); continue; }
      kq += s[i++];
    }
    return kq;
  }
  function tachTu(s) {
    var ds = [], i = 0;
    s = boNgoac(s);
    s = s.replace(/\\left\s*\(|\\lparen/g, '(').replace(/\\right\s*\)|\\rparen/g, ')').replace(/\\left\s*\[/g, '(').replace(/\\right\s*\]/g, ')')
      .replace(/\\left\s*\\vert|\\left\s*\|/g, '\\absL').replace(/\\right\s*\\vert|\\right\s*\|/g, '\\absR')
      .replace(/\\mathrm\{Ans\}|\\operatorname\{Ans\}|\\text\{Ans\}/g, '\\Ans').replace(/\\mathrm\{([A-Za-z])\}|\\operatorname\{([A-Za-z])\}/g, function (m, a, b) { return '\\op' + (a || b); })
      .replace(/\\(,|;|:|!| |quad|qquad)/g, ' ').replace(/\\placeholder(\[[^\]]*\])?\{[^}]*\}/g, '\\TRONG');
    while (i < s.length) {
      var c = s[i];
      if (c === ' ') { i++; continue; }
      if (/[0-9.]/.test(c)) { var j = i; while (j < s.length && /[0-9.]/.test(s[j])) j++; var so = s.slice(i, j); if ((so.match(/\./g) || []).length > 1) throw loi('Số không hợp lệ: ' + so); ds.push({ k: 'so', v: parseFloat(so) }); i = j; continue; }
      if (c === '\\') {
        if (s[i + 1] === '%') { ds.push({ k: '%' }); i += 2; continue; }
        var m = /^\\([A-Za-z]+)/.exec(s.slice(i)); if (!m) { i += 2; continue; }
        var ten = m[1]; i += m[0].length;
        if (ten === 'frac' || ten === 'dfrac' || ten === 'tfrac') ds.push({ k: 'frac' });
        else if (ten === 'sqrt') ds.push({ k: 'sqrt' });
        else if (ten === 'times' || ten === 'cdot') ds.push({ k: '*' });
        else if (ten === 'div') ds.push({ k: '/' });
        else if (ten === 'pi') ds.push({ k: 'hang', v: Math.PI });
        else if (ten === 'Ans') ds.push({ k: 'ans' });
        else if (ten === 'absL') ds.push({ k: 'absL' }); else if (ten === 'absR') ds.push({ k: 'absR' });
        else if (ten === 'circ') ds.push({ k: 'circ' });
        else if (ten === 'TRONG') throw loi('Còn ô trống chưa nhập');
        else if (ten === 'opC') ds.push({ k: 'C' }); else if (ten === 'opP') ds.push({ k: 'P' });
        else if (/^op[A-Za-z]$/.test(ten)) ds.push({ k: 'bien', v: ten.slice(2) });
        else if (HAM.indexOf(ten) >= 0) ds.push({ k: 'ham', v: ten });
        else if (ten === 'exponentialE') ds.push({ k: 'hang', v: Math.E });
        else if (ten === 'left' || ten === 'right' || ten === 'displaystyle' || ten === 'mathrm' || ten === 'operatorname') continue;
        else if (ten === 'le' || ten === 'leq' || ten === 'ge' || ten === 'geq' || ten === 'lt' || ten === 'gt' || ten === 'ne') throw loi('Dấu so sánh không dùng trong chế độ tính toán');
        else throw loi('Chưa hỗ trợ kí hiệu \\' + ten);
        continue;
      }
      if ('+-*/^_(){}!%|'.indexOf(c) >= 0) { ds.push({ k: c === '|' ? 'abs' : c }); i++; continue; }
      if (c === '[' || c === ']') { ds.push({ k: c }); i++; continue; }
      if (/[A-Fxy]/.test(c) || c === 'M') { ds.push({ k: 'bien', v: c }); i++; continue; }
      if (c === 'e') { ds.push({ k: 'hang', v: Math.E }); i++; continue; }
      if (c === '=') throw loi('Biểu thức không được có dấu “=”');
      throw loi('Kí tự không dùng được: “' + c + '”');
    }
    // độ – phút – giây: a° b° c°  →  một số
    var kq = [];
    for (var k = 0; k < ds.length; k++) {
      if (ds[k].k === 'so' && ds[k + 1] && ds[k + 1].k === '^' && laDo(ds, k + 2)) {
        var tong = 0, he = 1, p = k;
        while (ds[p] && ds[p].k === 'so' && ds[p + 1] && ds[p + 1].k === '^' && laDo(ds, p + 2) && he >= 1 / 3600) { tong += ds[p].v * he; he /= 60; p += ds[p + 2].k === '{' ? 5 : 3; }
        kq.push({ k: 'so', v: tong, dms: true }); k = p - 1; continue;
      }
      kq.push(ds[k]);
    }
    return kq;
  }
  function laDo(ds, i) { return ds[i] && (ds[i].k === 'circ' || (ds[i].k === '{' && ds[i + 1] && ds[i + 1].k === 'circ' && ds[i + 2] && ds[i + 2].k === '}')); }
  function loi(t) { var e = new Error(t); e.mt = true; return e; }

  // ---------------- phân tích & tính ----------------
  // mt = { goc: 'D' | 'R', bien: {A..}, ans }
  function tinh(latex, mt) {
    var ds = tachTu(latex), i = 0;
    if (!ds.length) throw loi('Chưa nhập biểu thức');
    function xem() { return ds[i]; }
    function lay(k) { var t = ds[i]; if (!t || (k && t.k !== k)) throw loi(k === ')' ? 'Thiếu dấu “)”' : 'Biểu thức chưa đúng'); i++; return t; }
    function batDau(t) { return t && ['so', 'bien', 'hang', 'ans', '(', '{', 'frac', 'sqrt', 'ham', 'absL', 'abs'].indexOf(t.k) >= 0; }
    function tong() {
      var a = tich();
      while (xem() && (xem().k === '+' || xem().k === '-')) { var op = lay().k, b = tich(); a = op === '+' ? a + b : a - b; }
      return a;
    }
    function tich() {
      var a = dau();
      for (;;) {
        var t = xem();
        if (t && (t.k === '*' || t.k === '/')) { lay(); var b = dau(); if (t.k === '/' && b === 0) throw loi('Lỗi toán: chia cho 0'); a = t.k === '*' ? a * b : a / b; }
        else if (t && (t.k === 'C' || t.k === 'P')) { lay(); var r = dau(); a = toHop(a, r, t.k === 'C'); }
        else if (batDau(t) && !(t.k === 'abs' && moTri > 0)) a = a * dau();
        else return a;
      }
    }
    function dau() { var t = xem(); if (t && t.k === '-') { lay(); return -dau(); } if (t && t.k === '+') { lay(); return dau(); } return luyThua(); }
    function luyThua() {
      var a = hauTo();
      if (xem() && xem().k === '^') { lay(); var b = nhom(true); a = mu(a, b); }
      return a;
    }
    function mu(a, b) {
      if (a < 0 && Math.abs(b - Math.round(b)) > 1e-12) { var q = phanSo(b, 99); if (q && q.q % 2 === 1) return (q.p % 2 ? -1 : 1) * Math.pow(-a, b); throw loi('Lỗi toán: luỹ thừa của số âm'); }
      return Math.pow(a, b);
    }
    function hauTo() {
      var a = coSo();
      for (;;) {
        var t = xem();
        if (t && t.k === '!') { lay(); a = giaiThua(a); }
        else if (t && t.k === '%') { lay(); a = a / 100; }
        else return a;
      }
    }
    var moTri = 0;
    // nhóm: {…} hoặc một kí hiệu (sau ^, _ , \frac …)
    function nhom(choMu) {
      var t = xem(); if (!t) throw loi('Biểu thức chưa đầy đủ');
      if (t.k === '{') { lay(); var v = tong(); lay('}'); return v; }
      if (t.k === 'so' && choMu) { lay(); return t.v; }
      return choMu ? coSo() : coSo();
    }
    function coSo() {
      var t = lay(); if (!t) throw loi('Biểu thức chưa đầy đủ');
      switch (t.k) {
        case 'so': return t.v;
        case 'hang': return t.v;
        case 'ans': return mt.ans || 0;
        case 'bien': { var v = mt.bien && mt.bien[t.v]; return typeof v === 'number' ? v : 0; }
        case '(': { var a = tong(); if (xem() && xem().k === ')') lay(); else if (xem()) throw loi('Thiếu dấu “)”'); return a; }
        case '{': { var b = tong(); lay('}'); return b; }
        case 'frac': { var tu = nhom(), mau = nhom(); if (mau === 0) throw loi('Lỗi toán: chia cho 0'); return tu / mau; }
        case 'sqrt': {
          var n = 2; if (xem() && xem().k === '[') { lay(); n = tong(); lay(']'); }
          var x = nhom();
          if (n === 2) { if (x < 0) throw loi('Lỗi toán: căn bậc hai của số âm'); return Math.sqrt(x); }
          if (x < 0) { if (Math.round(n) % 2 === 1) return -Math.pow(-x, 1 / n); throw loi('Lỗi toán: căn bậc chẵn của số âm'); }
          return Math.pow(x, 1 / n);
        }
        case 'absL': { moTri++; var c = tong(); moTri--; lay('absR'); return Math.abs(c); }
        case 'abs': { moTri++; var d = tong(); moTri--; lay('abs'); return Math.abs(d); }
        case 'ham': return ham(t.v);
      }
      throw loi('Biểu thức chưa đúng');
    }
    function ham(ten) {
      var nguoc = false, coSoLog = 10;
      if (xem() && xem().k === '^') {   // sin^{-1}
        lay(); var p = nhom(true); if (p === -1 && /^(sin|cos|tan)$/.test(ten)) nguoc = true; else throw loi('Chưa hỗ trợ dạng này');
      }
      if (ten === 'log' && xem() && xem().k === '_') { lay(); coSoLog = nhom(true); }
      var x;
      if (xem() && (xem().k === '(')) { lay(); x = tong(); if (xem() && xem().k === ')') lay(); }
      else x = luyThua();
      var doSangRad = mt.goc === 'R' ? 1 : Math.PI / 180;
      if (/^arc/.test(ten)) { nguoc = true; ten = ten.slice(3); }
      if (ten === 'sin' || ten === 'cos' || ten === 'tan') {
        if (nguoc) {
          if ((ten !== 'tan') && (x < -1 - 1e-12 || x > 1 + 1e-12)) throw loi('Lỗi toán: giá trị ngoài [−1; 1]');
          x = Math.max(-1, Math.min(1, ten === 'tan' ? x : x));
          var r = ten === 'sin' ? Math.asin(x) : ten === 'cos' ? Math.acos(x) : Math.atan(x);
          return r / doSangRad;
        }
        var a = x * doSangRad;
        if (ten === 'tan') { var co = Math.cos(a); if (Math.abs(co) < 1e-12) throw loi('Lỗi toán: tan không xác định'); }
        var kq = ten === 'sin' ? Math.sin(a) : ten === 'cos' ? Math.cos(a) : Math.tan(a);
        return Math.abs(kq) < 1e-13 ? 0 : kq;
      }
      if (ten === 'log') { if (x <= 0) throw loi('Lỗi toán: log của số không dương'); return Math.log(x) / Math.log(coSoLog); }
      if (ten === 'ln') { if (x <= 0) throw loi('Lỗi toán: ln của số không dương'); return Math.log(x); }
      if (ten === 'exp') return Math.exp(x);
      throw loi('Chưa hỗ trợ hàm ' + ten);
    }
    var v = tong();
    if (i < ds.length) throw loi(ds[i].k === ')' ? 'Thừa dấu “)”' : 'Biểu thức chưa đúng');
    if (!isFinite(v)) throw loi('Lỗi toán: kết quả quá lớn');
    return v;
  }
  function giaiThua(n) { if (n < 0 || Math.abs(n - Math.round(n)) > 1e-9) throw loi('Lỗi toán: giai thừa chỉ cho số tự nhiên'); n = Math.round(n); if (n > 170) throw loi('Lỗi toán: kết quả quá lớn'); var r = 1; for (var i = 2; i <= n; i++) r *= i; return r; }
  function toHop(n, k, laC) {
    n = Math.round(n); k = Math.round(k); if (n < 0 || k < 0 || k > n) throw loi('Lỗi toán: cần 0 ≤ k ≤ n');
    var r = 1; for (var i = 0; i < k; i++) r = r * (n - i) / (laC ? i + 1 : 1); return Math.round(r);
  }

  // ---------------- nhận dạng & hiển thị ----------------
  function ucln(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = a % b; a = b; b = t; } return a; }
  function phanSo(x, maxMau) {   // xấp xỉ liên phân số
    if (!isFinite(x)) return null;
    var dau = x < 0 ? -1 : 1; x = Math.abs(x);
    var h1 = 1, h0 = 0, k1 = 0, k0 = 1, b = x;
    for (var n = 0; n < 40; n++) {
      var a = Math.floor(b), h2 = a * h1 + h0, k2 = a * k1 + k0;
      if (k2 > maxMau) break;
      h0 = h1; h1 = h2; k0 = k1; k1 = k2;
      if (Math.abs(x - h1 / k1) <= 1e-10 * Math.max(1, x)) return { p: dau * h1, q: k1 };
      if (b - a < 1e-15) break; b = 1 / (b - a);
    }
    return null;
  }
  function tachCan(n) {   // n = k² · m (m không chính phương)
    var k = 1, m = n;
    for (var d = 2; d * d <= m; d++) while (m % (d * d) === 0) { m /= d * d; k *= d; }
    return { k: k, m: m };
  }
  // Dạng chính xác của số thực: { latex, chu (văn bản ngắn), xapXi }
  function dangDep(x) {
    if (!isFinite(x)) return null;
    if (Math.abs(x) < 1e-13) return { latex: '0', chu: '0' };
    if (Math.abs(x) < 1e13) {
      var r = Math.round(x); if (Math.abs(x - r) <= 1e-10 * Math.max(1, Math.abs(x))) return { latex: String(r).replace('-', '-'), chu: String(r).replace('-', '−') };
      var q = phanSo(x, 10000); if (q) return phanSoLatex(q.p, q.q);
      // căn: x = ±(k√m)/q
      var q2 = phanSo(x * x, 100000);
      if (q2 && q2.p > 0 && q2.p * q2.q < 1e9) {
        var t = tachCan(q2.p * q2.q), k = t.k, mau = q2.q, g = ucln(k, mau); k /= g; mau /= g;
        if (t.m > 1) return canLatex(x < 0 ? -1 : 1, k, t.m, mau);
      }
      var q3 = phanSo(x / Math.PI, 1000);
      if (q3) { var g3 = phanSoLatex(q3.p, q3.q), tu = Math.abs(q3.p) === 1 ? '' : String(Math.abs(q3.p)); return { latex: (q3.p < 0 ? '-' : '') + (q3.q === 1 ? tu + '\\pi' : '\\frac{' + tu + '\\pi}{' + q3.q + '}'), chu: (q3.p < 0 ? '−' : '') + tu + 'π' + (q3.q === 1 ? '' : '/' + q3.q) }; }
    }
    return null;
  }
  function phanSoLatex(p, q) { var am = p < 0; p = Math.abs(p); return { latex: (am ? '-' : '') + '\\frac{' + p + '}{' + q + '}', chu: (am ? '−' : '') + p + '/' + q }; }
  function canLatex(dau, k, m, q) {
    var tu = (k === 1 ? '' : k) + '\\sqrt{' + m + '}', tuC = (k === 1 ? '' : k) + '√' + m;
    return { latex: (dau < 0 ? '-' : '') + (q === 1 ? tu : '\\frac{' + tu + '}{' + q + '}'), chu: (dau < 0 ? '−' : '') + tuC + (q === 1 ? '' : '/' + q) };
  }
  // Số thập phân kiểu máy tính: 10 chữ số có nghĩa, dấu phẩy thập phân
  function thapPhan(x) {
    if (!isFinite(x)) return { latex: '\\text{Lỗi}', chu: 'Lỗi' };
    if (Math.abs(x) < 1e-99) return { latex: '0', chu: '0' };
    var e = Math.floor(Math.log10(Math.abs(x)));
    if (e >= 10 || e < -9) {
      var m = x / Math.pow(10, e); m = parseFloat(m.toPrecision(10)); if (Math.abs(m) >= 10) { m /= 10; e++; }
      var ms = String(m).replace('.', ',');
      return { latex: ms + '\\times10^{' + e + '}', chu: ms + '×10^' + e };
    }
    var s = parseFloat(x.toPrecision(10)).toString(); if (/e/.test(s)) s = x.toFixed(10).replace(/0+$/, '');
    s = s.replace('.', ','); return { latex: s.replace('-', '-'), chu: s.replace('-', '−') };
  }
  function hienThi(x, dang) { if (dang === 'thapPhan') return thapPhan(x); return dangDep(x) || thapPhan(x); }
  function doPhutGiay(x) {
    var am = x < 0, a = Math.abs(x), d = Math.floor(a + 1e-12), p = Math.floor((a - d) * 60 + 1e-9), g = (a - d - p / 60) * 3600;
    g = Math.round(g * 100) / 100; if (g >= 60) { g -= 60; p++; } if (p >= 60) { p -= 60; d++; }
    var gs = String(g).replace('.', ',');
    return { latex: (am ? '-' : '') + d + '^{\\circ}' + p + '^{\\prime}' + gs + '^{\\prime\\prime}', chu: (am ? '−' : '') + d + '°' + p + "'" + gs + '"' };
  }

  // ---------------- giải hệ phương trình bậc nhất ----------------
  function giaiHe(A) {   // A: n hàng × (n+1) cột
    var n = A.length, M = A.map(function (h) { return h.slice(); });
    for (var c = 0; c < n; c++) {
      var p = c; for (var r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
      if (Math.abs(M[p][c]) < 1e-12) return null;
      var t = M[c]; M[c] = M[p]; M[p] = t;
      for (var r2 = 0; r2 < n; r2++) if (r2 !== c) { var f = M[r2][c] / M[c][c]; for (var k = c; k <= n; k++) M[r2][k] -= f * M[c][k]; }
    }
    return M.map(function (h, i) { return h[n] / h[i]; });
  }
  // ---------------- nghiệm đa thức (hệ số từ bậc cao) ----------------
  function nghiemDaThuc(he) {
    while (he.length > 1 && Math.abs(he[0]) < 1e-15) he = he.slice(1);
    var n = he.length - 1; if (n < 1) return [];
    var a = he.map(function (c) { return c / he[0]; }), z = [];
    for (var i = 0; i < n; i++) z.push({ re: Math.cos(0.4 + 2 * Math.PI * i / n) * 0.9, im: Math.sin(0.4 + 2 * Math.PI * i / n) * 0.9 });
    function nhan(p, q) { return { re: p.re * q.re - p.im * q.im, im: p.re * q.im + p.im * q.re }; }
    function chia(p, q) { var d = q.re * q.re + q.im * q.im; return { re: (p.re * q.re + p.im * q.im) / d, im: (p.im * q.re - p.re * q.im) / d }; }
    function giaTri(x) { var r = { re: a[0], im: 0 }; for (var k = 1; k <= n; k++) { r = nhan(r, x); r.re += a[k]; } return r; }
    for (var lap = 0; lap < 500; lap++) {
      var doi = 0;
      for (var j = 0; j < n; j++) {
        var mau = { re: 1, im: 0 }; for (var k2 = 0; k2 < n; k2++) if (k2 !== j) mau = nhan(mau, { re: z[j].re - z[k2].re, im: z[j].im - z[k2].im });
        var d = chia(giaTri(z[j]), mau); z[j] = { re: z[j].re - d.re, im: z[j].im - d.im }; doi = Math.max(doi, Math.abs(d.re) + Math.abs(d.im));
      }
      if (doi < 1e-14) break;
    }
    // làm tròn phần ảo rất nhỏ, đánh bóng nghiệm thực bằng Newton
    return z.map(function (x) {
      if (Math.abs(x.im) < 1e-7) {
        var t = x.re; for (var l = 0; l < 30; l++) { var f = 0, df = 0; for (var k3 = 0; k3 <= n; k3++) { df = df * t + f; f = f * t + a[k3]; } if (!df) break; var bu = f / df; t -= bu; if (Math.abs(bu) < 1e-16) break; }
        return { re: t, im: 0 };
      }
      return x;
    }).sort(function (p, q) { return p.re - q.re || p.im - q.im; });
  }
  // Nghiệm phương trình bậc hai dạng chính xác: a x² + b x + c = 0
  function nghiemBac2(a, b, c) {
    var D = b * b - 4 * a * c, A = -b / (2 * a);
    if (Math.abs(D) < 1e-12 * Math.max(1, b * b)) return { kep: true, ds: [hienThi(A)] };
    var thuc = D > 0, s = Math.sqrt(Math.abs(D)) / (2 * Math.abs(a)), qD = phanSo(Math.abs(D), 10000);
    function ghep(dau) {
      if (thuc && dangDep(A + dau * s) && !/sqrt|pi/.test(dangDep(A + dau * s).latex)) return dangDep(A + dau * s);
      var qA = phanSo(A, 10000), qS = phanSo(s * s, 100000);
      if (qA && qS && qS.p > 0) {
        var t = tachCan(qS.p * qS.q), k = t.k, mauS = qS.q;   // s = k√m / mauS
        if (t.m > 1) {
          var L = mauS / ucln(mauS, qA.q) * qA.q, tA = qA.p * (L / qA.q), tS = k * (L / mauS), g = ucln(ucln(tA, tS), L);
          tA /= g; tS /= g; L /= g;
          var phanCan = (tS === 1 ? '' : tS) + '\\sqrt{' + t.m + '}' + (thuc ? '' : 'i'), phanCanC = (tS === 1 ? '' : tS) + '√' + t.m + (thuc ? '' : 'i');
          if (!tA) return { latex: (dau < 0 ? '-' : '') + (L === 1 ? phanCan : '\\frac{' + phanCan + '}{' + L + '}'), chu: (dau < 0 ? '−' : '') + phanCanC + (L === 1 ? '' : '/' + L) };
          var tu = tA + (dau > 0 ? '+' : '-') + phanCan, tuC = tA + (dau > 0 ? '+' : '−') + phanCanC;
          return { latex: L === 1 ? tu : '\\frac{' + tu + '}{' + L + '}', chu: L === 1 ? tuC : '(' + tuC + ')/' + L };
        }
      }
      if (thuc) return thapPhan(A + dau * s);
      var re = thapPhan(A), im = thapPhan(s);
      return { latex: (Math.abs(A) > 1e-13 ? re.latex + (dau > 0 ? '+' : '-') : (dau > 0 ? '' : '-')) + im.latex + 'i', chu: '' };
    }
    void qD;
    return { kep: false, thuc: thuc, ds: [ghep(-1), ghep(1)].sort(function () { return 0; }) };
  }
  // ---------------- bất phương trình đa thức ----------------
  //   dau: '>', '<', '>=', '<='
  function giaiBpt(he, dau) {
    var ng = nghiemDaThuc(he).filter(function (z) { return Math.abs(z.im) < 1e-7; }).map(function (z) { return z.re; });
    var cac = []; ng.forEach(function (x) { if (!cac.some(function (y) { return Math.abs(x - y) < 1e-7; })) cac.push(x); });
    function f(x) { return he.reduce(function (s, c) { return s * x + c; }, 0); }
    var bang = [-Infinity].concat(cac).concat([Infinity]), khoang = [];
    function dung(v) { return dau === '>' ? v > 0 : dau === '<' ? v < 0 : dau === '>=' ? v >= 0 : v <= 0; }
    for (var i = 0; i + 1 < bang.length; i++) {
      var a = bang[i], b = bang[i + 1], m = !isFinite(a) ? b - 1 : !isFinite(b) ? a + 1 : (a + b) / 2;
      if (!isFinite(a) && !isFinite(b)) m = 0;
      khoang.push({ a: a, b: b, dung: dung(f(m)) });
    }
    var bang2 = dau.length === 2;   // có dấu bằng → lấy cả nghiệm
    // gộp các khoảng đúng liền nhau (qua nghiệm khi có dấu bằng)
    var kq = [], hien = null;
    for (var j = 0; j < khoang.length; j++) {
      var k = khoang[j];
      if (k.dung) { if (hien && bang2 && hien.b === k.a) hien.b = k.b; else { hien = { a: k.a, b: k.b }; kq.push(hien); } }
      else if (bang2 && j > 0 && isFinite(k.a) && !(khoang[j - 1].dung)) { kq.push({ a: k.a, b: k.a, diem: true }); hien = null; }
      else hien = null;
    }
    return { khoang: kq, bang: bang2, nghiem: cac };
  }
  // ---------------- thống kê ----------------
  function thongKe1(x, f) {
    var n = 0, s = 0, s2 = 0, ds = [];
    x.forEach(function (v, i) { var t = f ? f[i] : 1; n += t; s += v * t; s2 += v * v * t; for (var k = 0; k < t && k < 100000; k++) ds.push(v); });
    if (!n) return null;
    ds.sort(function (a, b) { return a - b; });
    function trungVi(a) { var m = a.length; return m % 2 ? a[(m - 1) / 2] : (a[m / 2 - 1] + a[m / 2]) / 2; }
    var nua = Math.floor(ds.length / 2), duoi = ds.slice(0, nua), tren = ds.slice(ds.length % 2 ? nua + 1 : nua);
    var tb = s / n, ps = s2 / n - tb * tb;
    return { n: n, tb: tb, tong: s, tong2: s2, sigma: Math.sqrt(Math.max(0, ps)), s: n > 1 ? Math.sqrt(Math.max(0, (s2 - n * tb * tb) / (n - 1))) : NaN, min: ds[0], max: ds[ds.length - 1], q1: duoi.length ? trungVi(duoi) : ds[0], me: trungVi(ds), q3: tren.length ? trungVi(tren) : ds[ds.length - 1] };
  }
  function thongKe2(x, y) {
    var n = x.length; if (n < 2) return null;
    var sx = 0, sy = 0, sxx = 0, syy = 0, sxy = 0;
    for (var i = 0; i < n; i++) { sx += x[i]; sy += y[i]; sxx += x[i] * x[i]; syy += y[i] * y[i]; sxy += x[i] * y[i]; }
    var mx = sx / n, my = sy / n, Sxx = sxx - n * mx * mx, Syy = syy - n * my * my, Sxy = sxy - n * mx * my;
    var b = Sxx ? Sxy / Sxx : NaN, a = my - b * mx, r = Sxx && Syy ? Sxy / Math.sqrt(Sxx * Syy) : NaN;
    return { n: n, tbx: mx, tby: my, tongx: sx, tongy: sy, tongxy: sxy, a: a, b: b, r: r };
  }
  return { tinh: tinh, hienThi: hienThi, thapPhan: thapPhan, dangDep: dangDep, doPhutGiay: doPhutGiay, giaiHe: giaiHe, nghiemDaThuc: nghiemDaThuc, nghiemBac2: nghiemBac2, giaiBpt: giaiBpt, thongKe1: thongKe1, thongKe2: thongKe2 };
})();
