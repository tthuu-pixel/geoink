// Đọc biểu thức hàm số do giáo viên gõ: "y = 2x + 1", "x^2 - 3", "1/2x", "sin(x)", "√x", "|x|"
// Không dùng eval: tự phân tích cú pháp rồi tạo hàm tính f(x, s).
window.GI = window.GI || {};
GI.bieuThuc = (function () {
  var HAM = {
    sin: Math.sin, cos: Math.cos, tan: Math.tan, cot: function (x, s) { return 1 / Math.tan(x); },
    sqrt: Math.sqrt, can: Math.sqrt, abs: Math.abs, ln: Math.log, log: function (x, s) { return Math.log(x) / Math.LN10; }, exp: Math.exp,
  };
  function tachTu(s, bien) {
    bien = bien || [];
    var ds = [], i = 0;
    s = s.replace(/\s+/g, '').replace(/[×·]/g, '*').replace(/[÷:]/g, '/').replace(/[−–]/g, '-').replace(/²/g, '^2').replace(/³/g, '^3').replace(/π/g, 'pi').replace(/√/g, 'sqrt');
    while (i < s.length) {
      var c = s[i];
      if (/[0-9.,]/.test(c)) { var j = i; while (j < s.length && /[0-9.,]/.test(s[j])) j++; var so = s.slice(i, j).replace(',', '.'); if (isNaN(parseFloat(so))) throw new Error('Số không hợp lệ: ' + s.slice(i, j)); ds.push({ k: 'so', v: parseFloat(so) }); i = j; continue; }
      if (/[a-zA-Z]/.test(c)) {
        var j2 = i; while (j2 < s.length && /[a-zA-Z]/.test(s[j2])) j2++;
        var tu = s.slice(i, j2);
        // tách "2xsin" … thành các phần nhận biết được
        while (tu.length) {
          var thuong = tu.toLowerCase();
          var gap = Object.keys(HAM).concat(['pi', 'e', 'x']).sort(function (a, b) { return b.length - a.length; }).filter(function (h) { return thuong.indexOf(h) === 0; })[0];
          var tenBien = bien.filter(function (b) { return tu.indexOf(b) === 0; }).sort(function (a, b) { return b.length - a.length; })[0];
          if (tenBien && (!gap || tenBien.length >= gap.length)) { ds.push({ k: 'bien', v: tenBien }); tu = tu.slice(tenBien.length); continue; }
          if (!gap) throw new Error('Không hiểu "' + tu + '". Dùng biến x, tên thanh trượt và các hàm sin, cos, tan, sqrt, abs, ln, log.');
          ds.push(HAM[gap] && gap !== 'e' ? { k: 'ham', v: gap } : { k: 'ten', v: gap });
          tu = tu.slice(gap.length);
        }
        i = j2; continue;
      }
      if ('+-*/^()|'.indexOf(c) >= 0) { ds.push({ k: c }); i++; continue; }
      throw new Error('Kí tự không dùng được: "' + c + '"');
    }
    return ds;
  }
  function phanTich(ds) {
    var i = 0;
    function xem() { return ds[i]; }
    function lay(k) {
      var t = ds[i];
      if (!t) throw new Error(k ? 'Biểu thức còn thiếu "' + k + '".' : 'Biểu thức chưa đầy đủ.');
      if (k && t.k !== k) throw new Error('Biểu thức chưa đúng: cần "' + k + '".');
      i++; return t;
    }
    function batDau(t) { return t && (t.k === 'so' || t.k === 'ten' || t.k === 'ham' || t.k === '(' || t.k === '|'); }
    function tong() {
      var a = tich();
      while (xem() && (xem().k === '+' || xem().k === '-')) { var op = lay().k, b = tich(); a = op === '+' ? cong(a, b) : tru(a, b); }
      return a;
    }
    function cong(a, b) { return function (x, s) { return a(x, s) + b(x, s); }; }
    function tru(a, b) { return function (x, s) { return a(x, s) - b(x, s); }; }
    function tich() {
      var a = dau();
      for (;;) {
        var t = xem();
        if (t && (t.k === '*' || t.k === '/')) { lay(); var b = dau(); a = t.k === '*' ? nhan(a, b) : chia(a, b); }
        else if (batDau(t) && !(t.k === '|' && demGiaTriTuyetDoi())) { var b2 = dau(); a = nhan(a, b2); }   // nhân ngầm: 2x, 3(x+1)
        else return a;
      }
    }
    var moTri = 0;
    function demGiaTriTuyetDoi() { return moTri > 0; }
    function nhan(a, b) { return function (x, s) { return a(x, s) * b(x, s); }; }
    function chia(a, b) { return function (x, s) { return a(x, s) / b(x, s); }; }
    function dau() {
      var t = xem();
      if (t && t.k === '-') { lay(); var a = dau(); return function (x, s) { return -a(x, s); }; }
      if (t && t.k === '+') { lay(); return dau(); }
      return luyThua();
    }
    function luyThua() {
      var a = coSo();
      if (xem() && xem().k === '^') { lay(); var b = dau(); return function (x, s) { return Math.pow(a(x, s), b(x, s)); }; }
      return a;
    }
    function coSo() {
      var t = lay();
      if (!t) throw new Error('Biểu thức chưa đầy đủ.');
      if (t.k === 'so') { var v = t.v; return function () { return v; }; }
      if (t.k === 'bien') { var tb = t.v; return function (x, s) { return s && tb in s ? s[tb] : NaN; }; }
      if (t.k === 'ten') { if (t.v === 'x') return function (x, s) { return x; }; var c = t.v === 'pi' ? Math.PI : Math.E; return function () { return c; }; }
      if (t.k === 'ham') {
        var f = HAM[t.v], arg;
        if (xem() && xem().k === '(') { lay('('); arg = tong(); lay(')'); } else arg = luyThua();
        return function (x, s) { return f(arg(x, s)); };
      }
      if (t.k === '(') { var a = tong(); lay(')'); return a; }
      if (t.k === '|') { moTri++; var b = tong(); moTri--; lay('|'); return function (x, s) { return Math.abs(b(x, s)); }; }
      throw new Error('Biểu thức chưa đúng gần "' + t.k + '".');
    }
    var f = tong();
    if (i < ds.length) throw new Error('Biểu thức thừa phần "' + (ds[i].v || ds[i].k) + '".');
    return f;
  }
  // Chuỗi hiển thị đẹp: x^2 → x², 1/2 → ½, - → −, * → ·
  function dep(s) {
    var MU = { 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
    return s.replace(/\s+/g, '').replace(/\^(\d)/g, function (m, d) { return MU[d]; }).replace(/\b1\/2(?!\d)/g, '½').replace(/\b1\/3(?!\d)/g, '⅓').replace(/\b1\/4(?!\d)/g, '¼')
      .replace(/sqrt/g, '√').replace(/\*/g, '·').replace(/pi/g, 'π').replace(/([^\s(])([+\-])/g, '$1 $2 ').replace(/-/g, '−').replace(/^−\s/, '−');
  }
  // Trả về { f, ve: chuỗi hiển thị } hoặc ném lỗi tiếng Việt
  function doc(chuoi, bien) {
    var s = String(chuoi || '').trim();
    var m = s.match(/^(?:y|f\s*\(\s*x\s*\))\s*=\s*(.*)$/i);
    if (m) s = m[1];
    if (!s) throw new Error('Hãy nhập biểu thức, ví dụ 2x + 1');
    var f = phanTich(tachTu(s, bien));
    return { f: f, ve: 'y = ' + dep(s) };
  }
  return { doc: doc };
})();
