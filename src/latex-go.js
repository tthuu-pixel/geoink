// Gõ công thức nhanh (bản máy tính):
//  · Khung chữ ABC: gõ $x^2$ (hoặc $x^2) rồi bấm Tab → hiện ngay thành công thức, gõ tiếp được.
//    Backspace ngay sau công thức (hoặc bấm đúp vào nó) → trở lại mã để sửa.
//  · Gợi ý lệnh kiểu TeXstudio: gõ \tri → danh sách \triangle…; ↑↓ chọn, Tab / Enter điền, Esc bỏ.
//    Dùng trong khung chữ và các ô mã LaTeX (nhập đề, Ảnh → LaTeX).
var GI = window.GI || (window.GI = {});
GI.latexGo = (function () {
  // ---------- danh sách lệnh: "tên" hoặc "tên|mẫu chèn" (¦ = chỗ đặt con trỏ) ----------
  var THO = [
    // phân số, căn, mũ
    'frac|\\frac{¦}{}', 'dfrac|\\dfrac{¦}{}', 'tfrac|\\tfrac{¦}{}', 'sqrt|\\sqrt{¦}', 'sqrt[n]|\\sqrt[¦]{}', 'overline|\\overline{¦}', 'underline|\\underline{¦}',
    'widehat|\\widehat{¦}', 'hat|\\hat{¦}', 'overrightarrow|\\overrightarrow{¦}', 'vec|\\vec{¦}', 'vv|\\vv{¦}', 'overparen|\\overparen{¦}', 'wideparen|\\wideparen{¦}', 'bar|\\bar{¦}', 'dot|\\dot{¦}', 'tilde|\\tilde{¦}',
    'heva|\\heva{¦}', 'hoac|\\hoac{¦}', 'num|\\num{¦}', 'text|\\text{¦}', 'mathrm|\\mathrm{¦}', 'mathbb|\\mathbb{¦}', 'boxed|\\boxed{¦}', 'displaystyle', 'left(|\\left(¦\\right)', 'left[|\\left[¦\\right]', 'left\\{|\\left\\{¦\\right.', 'left||\\left|¦\\right|',
    'begin{cases}|\\begin{cases}¦\\end{cases}', 'begin{aligned}|\\begin{aligned}¦\\end{aligned}', 'begin{array}|\\begin{array}{¦}\\end{array}', 'begin{matrix}|\\begin{matrix}¦\\end{matrix}',
    'sum|\\sum_{¦}^{}', 'prod|\\prod_{¦}^{}', 'int|\\int_{¦}^{}', 'lim|\\lim_{¦}', 'log|\\log_{¦}', 'ln', 'lg', 'sin', 'cos', 'tan', 'cot', 'arcsin', 'arccos', 'arctan', 'max', 'min', 'gcd', 'operatorname|\\operatorname{¦}', 'mod', 'pmod|\\pmod{¦}',
    // hình học
    'triangle', 'angle', 'measuredangle', 'perp', 'parallel', 'nparallel', 'backsim', 'sim', 'cong', 'equiv', 'odot', 'circ', 'degree|^\\circ', 'square', 'Box', 'diamond', 'bigtriangleup', 'bigtriangledown', 'triangleleft', 'triangleright', 'trianglelefteq', 'trianglerighteq', 'blacktriangle', 'vartriangle',
    // quan hệ
    'le', 'leq', 'leqslant', 'ge', 'geq', 'geqslant', 'ne', 'neq', 'approx', 'simeq', 'propto', 'll', 'gg', 'pm', 'mp', 'times', 'div', 'cdot', 'cdots', 'ldots', 'vdots', 'ddots', 'dots', 'ast', 'star', 'bullet', 'infty', 'partial', 'nabla', 'prime', 'emptyset', 'varnothing',
    // tập hợp, logic
    'in', 'notin', 'ni', 'subset', 'subseteq', 'supset', 'supseteq', 'not\\subset', 'cup', 'cap', 'setminus', 'bigcup', 'bigcap', 'mathbb{N}|\\mathbb{N}', 'mathbb{Z}|\\mathbb{Z}', 'mathbb{Q}|\\mathbb{Q}', 'mathbb{R}|\\mathbb{R}', 'mathbb{N}^*|\\mathbb{N}^*',
    'forall', 'exists', 'nexists', 'neg', 'land', 'lor', 'wedge', 'vee', 'Rightarrow', 'Leftarrow', 'Leftrightarrow', 'rightarrow', 'leftarrow', 'leftrightarrow', 'to', 'mapsto', 'implies', 'iff', 'longrightarrow', 'Longrightarrow', 'Longleftrightarrow', 'uparrow', 'downarrow', 'nearrow', 'searrow', 'therefore', 'because',
    // chữ Hi Lạp
    'alpha', 'beta', 'gamma', 'Gamma', 'delta', 'Delta', 'epsilon', 'varepsilon', 'zeta', 'eta', 'theta', 'vartheta', 'Theta', 'iota', 'kappa', 'lambda', 'Lambda', 'mu', 'nu', 'xi', 'Xi', 'pi', 'Pi', 'rho', 'varrho', 'sigma', 'Sigma', 'tau', 'upsilon', 'phi', 'varphi', 'Phi', 'chi', 'psi', 'Psi', 'omega', 'Omega',
    // khoảng cách, ngoặc
    'quad', 'qquad', 'hspace|\\hspace{¦}', 'langle', 'rangle', 'lfloor', 'rfloor', 'lceil', 'rceil', 'vert', 'Vert', 'mid', '|',
    // văn bản trong đề
    'textbf|\\textbf{¦}', 'textit|\\textit{¦}', 'emph|\\emph{¦}', 'textcolor|\\textcolor{red}{¦}', 'True|\\True ', 'choice|\\choice{¦}{}{}{}', 'choiceTF|\\choiceTF{¦}{}{}{}', 'shortans|\\shortans{¦}', 'loigiai|\\loigiai{\n¦\n}', 'immini|\\immini{¦}{}',
    'begin{ex}|\\begin{ex}\n¦\n\\end{ex}', 'begin{bt}|\\begin{bt}\n¦\n\\end{bt}', 'begin{vd}|\\begin{vd}\n¦\n\\end{vd}', 'begin{enumerate}|\\begin{enumerate}\n\\item ¦\n\\end{enumerate}', 'begin{itemize}|\\begin{itemize}\n\\item ¦\n\\end{itemize}',
    'begin{center}|\\begin{center}\n¦\n\\end{center}', 'begin{tikzpicture}|\\begin{tikzpicture}\n¦\n\\end{tikzpicture}', 'begin{tabular}|\\begin{tabular}{|c|c|}\n\\hline\n¦\n\\end{tabular}', 'item|\\item ', 'hline', 'centering', 'dfrac12|\\dfrac{1}{2}',
  ];
  var DS = THO.filter(function (x) { return x !== '|'; }).map(function (x) {
    var p = x.indexOf('|'), ten = p < 0 ? x : x.slice(0, p), chen = p < 0 ? '\\' + x : x.slice(p + 1);
    return { ten: ten, chen: chen, xem: chen.replace(/¦/g, '').replace(/\{\}/g, '{\\square}').replace(/^\\(begin|item|hline|centering|textbf|textit|emph|textcolor|True|choice|shortans|loigiai|immini|hspace|quad|qquad|displaystyle|text\b|mod\b)[\s\S]*$/, '') };
  });

  // ---------- ảnh công thức (MathJax có sẵn trong app) ----------
  var boNho = {};
  function svg(tex, ok) {
    if (boNho[tex] != null) return boNho[tex];
    if (!window.MathJax || !window.MathJax.tex2svg) { GI.congThuc.napMathJax().then(ok || function () { }); return null; }
    var t = GI.deBai && GI.deBai.chuanTex ? GI.deBai.chuanTex(tex) : tex, h = '';
    try { var n = window.MathJax.tex2svg(t, { display: false }), s = n.querySelector('svg'); if (s && !n.querySelector('[data-mml-node="merror"]')) h = s.outerHTML; } catch (e) { }
    return (boNho[tex] = h);
  }
  function thoat(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  // ---------- công thức "chip" trong khung chữ ----------
  function htmlChip(tex) {   // dùng khi mở khung soạn: $...$ đã có hiện thành công thức luôn
    var s = svg(tex);
    return '<span class="lg-ct" contenteditable="false" data-tex="' + thoat(tex) + '">' + (s || thoat('$' + tex + '$')) + '</span>';
  }
  function lamDayChip(goc) {   // MathJax nạp xong thì vẽ lại các chip còn là chữ
    var con = goc.querySelectorAll('.lg-ct');
    if (!Array.prototype.some.call(con, function (c) { return !c.querySelector('svg'); })) return;
    GI.congThuc.napMathJax().then(function () {
      goc.querySelectorAll('.lg-ct').forEach(function (c) { if (!c.querySelector('svg')) { var s = svg(c.dataset.tex); if (s) c.innerHTML = s; } });
    });
  }
  function taoChip(tex) {
    var c = document.createElement('span'); c.className = 'lg-ct'; c.contentEditable = 'false'; c.dataset.tex = tex;
    var s = svg(tex, function () { var s2 = svg(tex); if (s2) c.innerHTML = s2; }); c.innerHTML = s || thoat('$' + tex + '$');
    if (s === '') c.classList.add('loi');
    return c;
  }
  function datConTro(node, off) { var r = document.createRange(), s = window.getSelection(); r.setStart(node, off); r.collapse(true); s.removeAllRanges(); s.addRange(r); }
  // Tab: đổi $...$ (hoặc $... chưa đóng) ngay trước con trỏ thành công thức
  function doiThanhCT(noi) {
    var s = window.getSelection(); if (!s.rangeCount || !s.isCollapsed) return false;
    var r = s.getRangeAt(0), n = r.startContainer, off = r.startOffset; if (n.nodeType !== 3 || !noi.contains(n)) return false;
    var truoc = n.nodeValue.slice(0, off), m = truoc.match(/\$((?:\\\$|[^$])+?)\$?$/);
    if (!m) return false;
    // "$" mở phải là dấu lẻ trong đoạn chữ này (không phải dấu đóng của công thức trước)
    var soDau = (truoc.slice(0, m.index).replace(/\\\$/g, '').match(/\$/g) || []).length; if (soDau % 2) return false;
    var tex = m[1].replace(/\u200B/g, '').trim(); if (!tex) return false;
    var a = m.index, sau = n.splitText(off), giua = n.splitText(a); giua.remove();
    var chip = taoChip(tex), dem = document.createTextNode('​');
    sau.parentNode.insertBefore(chip, sau); sau.parentNode.insertBefore(dem, sau);
    datConTro(dem, 1); noi.dispatchEvent(new Event('input', { bubbles: true }));
    return true;
  }
  function chipTruoc(noi) {   // chip nằm ngay trước con trỏ (bỏ qua kí tự rỗng ​)
    var s = window.getSelection(); if (!s.rangeCount || !s.isCollapsed) return null;
    var r = s.getRangeAt(0), n = r.startContainer, off = r.startOffset, truoc = null;
    if (n.nodeType === 3) { if (n.nodeValue.slice(0, off).replace(/​/g, '')) return null; truoc = n.previousSibling; }
    else truoc = n.childNodes[off - 1];
    while (truoc && truoc.nodeType === 3 && !truoc.nodeValue.replace(/​/g, '')) truoc = truoc.previousSibling;
    return truoc && truoc.nodeType === 1 && truoc.classList.contains('lg-ct') ? truoc : null;
  }
  function moChip(c, boDauDong) {   // công thức → mã để sửa
    var t = document.createTextNode('$' + c.dataset.tex + (boDauDong ? '' : '$'));
    c.parentNode.replaceChild(t, c); datConTro(t, t.nodeValue.length);
  }
  function ganKhungChu(noi) {
    noi.addEventListener('keydown', function (e) {
      if (goiY.mo && goiY.o === noi && xuLyPhimGoiY(e)) return;
      if (e.key === 'Tab' && !e.shiftKey) { if (doiThanhCT(noi)) { e.preventDefault(); e.stopImmediatePropagation(); dongGoiY(); return; } e.preventDefault(); return; }
      if (e.key === 'Backspace') { var c = chipTruoc(noi); if (c) { e.preventDefault(); moChip(c, true); } }
    }, true);
    noi.addEventListener('dblclick', function (e) { var c = e.target.closest && e.target.closest('.lg-ct'); if (c) { e.preventDefault(); moChip(c, false); } });
    noi.addEventListener('input', function () { kiemGoiY(noi); });
    noi.addEventListener('blur', function () { setTimeout(function () { if (goiY.o === noi && !goiY.el.matches(':hover')) dongGoiY(); }, 120); });
  }

  // ---------- gợi ý lệnh ----------
  var goiY = { el: null, mo: false, o: null, ds: [], i: 0, tu: '' };
  function taoGoiY() {
    var el = document.createElement('div'); el.id = 'lg-goi-y'; el.className = 'an'; document.body.appendChild(el);
    el.addEventListener('mousedown', function (e) { e.preventDefault(); var d = e.target.closest('[data-i]'); if (d) { goiY.i = +d.dataset.i; chonGoiY(); } });
    goiY.el = el;
  }
  function timLenh(tu) {
    var a = [], b = [], t = tu.toLowerCase();
    DS.forEach(function (x) { var n = x.ten.toLowerCase(); if (n === t && tu.length > 1 && x.ten === tu) return a.unshift(x); if (n.indexOf(t) === 0) a.push(x); else if (t.length >= 3 && n.indexOf(t) > 0 && n.indexOf('{') < 0) b.push(x); });
    a.sort(function (p, q) { return (p.ten.indexOf(tu) === 0 ? 0 : 1) - (q.ten.indexOf(tu) === 0 ? 0 : 1) || p.ten.length - q.ten.length; });
    return a.concat(b).slice(0, 9);
  }
  function chuTruocConTro(o) {
    if (o.tagName === 'TEXTAREA' || o.tagName === 'INPUT') return o.value.slice(0, o.selectionStart);
    var s = window.getSelection(); if (!s.rangeCount || !s.isCollapsed) return '';
    var r = s.getRangeAt(0); return r.startContainer.nodeType === 3 ? r.startContainer.nodeValue.slice(0, r.startOffset) : '';
  }
  function kiemGoiY(o) {
    var m = chuTruocConTro(o).match(/\\([A-Za-z]{2,})$/);
    if (!m) return dongGoiY();
    var ds = timLenh(m[1]); if (!ds.length || (ds.length === 1 && ds[0].ten === m[1] && ds[0].chen === '\\' + m[1])) return dongGoiY();
    goiY.o = o; goiY.ds = ds; goiY.i = 0; goiY.tu = m[1]; veGoiY();
  }
  function viTriConTro(o) {
    if (o.tagName !== 'TEXTAREA' && o.tagName !== 'INPUT') {
      var s = window.getSelection(), r = s.getRangeAt(0).cloneRange(), k = r.getClientRects()[0] || r.getBoundingClientRect();
      if (!k || (!k.left && !k.top)) k = o.getBoundingClientRect();
      return { x: k.left, y: k.bottom };
    }
    // ô nhập nhiều dòng: dựng bản sao ẩn để đo vị trí con trỏ
    var cs = getComputedStyle(o), g = document.createElement('div'), b = o.getBoundingClientRect();
    ['fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing', 'paddingTop', 'paddingLeft', 'paddingRight', 'paddingBottom', 'borderTopWidth', 'borderLeftWidth', 'boxSizing', 'tabSize'].forEach(function (k) { g.style[k] = cs[k]; });
    g.style.position = 'fixed'; g.style.visibility = 'hidden'; g.style.whiteSpace = 'pre-wrap'; g.style.overflowWrap = 'break-word'; g.style.width = o.clientWidth + 'px'; g.style.left = b.left + 'px'; g.style.top = b.top + 'px';
    g.textContent = o.value.slice(0, o.selectionStart); var sp = document.createElement('span'); sp.textContent = '​'; g.appendChild(sp); document.body.appendChild(g);
    var k2 = sp.getBoundingClientRect(); g.remove();
    return { x: k2.left - o.scrollLeft, y: k2.bottom - o.scrollTop };
  }
  function veGoiY() {
    if (!goiY.el) taoGoiY();
    var el = goiY.el, can = false;
    el.innerHTML = goiY.ds.map(function (x, i) {
      var s = x.xem ? svg(x.xem) : ''; if (s === null) can = true;
      return '<div data-i="' + i + '"' + (i === goiY.i ? ' class="chon"' : '') + '><code>\\' + thoat(x.ten) + '</code><span class="lg-xem">' + (s || '') + '</span></div>';
    }).join('') + '<small>↑↓ chọn · Tab / Enter điền · Esc bỏ</small>';
    if (can) GI.congThuc.napMathJax().then(function () { if (goiY.mo) veGoiY(); });
    var p = viTriConTro(goiY.o); el.classList.remove('an'); goiY.mo = true;
    var w = el.offsetWidth, h = el.offsetHeight, x = Math.min(p.x, window.innerWidth - w - 8), y = p.y + 4 + h > window.innerHeight - 8 ? p.y - h - 26 : p.y + 4;
    el.style.left = Math.max(8, x) + 'px'; el.style.top = Math.max(8, y) + 'px';
  }
  function dongGoiY() { if (goiY.el) goiY.el.classList.add('an'); goiY.mo = false; }
  function xuLyPhimGoiY(e) {
    var k = e.key;
    if (k === 'ArrowDown' || k === 'ArrowUp') { goiY.i = (goiY.i + (k === 'ArrowDown' ? 1 : goiY.ds.length - 1)) % goiY.ds.length; veGoiY(); }
    else if (k === 'Tab' || k === 'Enter') chonGoiY();
    else if (k === 'Escape') dongGoiY();
    else return false;
    e.preventDefault(); e.stopImmediatePropagation(); return true;
  }
  function chonGoiY() {
    var x = goiY.ds[goiY.i], o = goiY.o; if (!x || !o) return dongGoiY();
    var chen = x.chen, vt = chen.indexOf('¦'); chen = chen.replace('¦', ''); if (vt < 0) vt = chen.length;
    var bo = goiY.tu.length + 1;   // xoá "\tri" đã gõ
    if (o.tagName === 'TEXTAREA' || o.tagName === 'INPUT') {
      var a = o.selectionStart - bo; o.focus(); o.setSelectionRange(a, o.selectionStart);
      if (!document.execCommand('insertText', false, chen)) o.setRangeText(chen, a, a + bo, 'end');
      o.setSelectionRange(a + vt, a + vt);
    } else {
      var s = window.getSelection(), r = s.getRangeAt(0), n = r.startContainer, off = r.startOffset;
      var r2 = document.createRange(); r2.setStart(n, off - bo); r2.setEnd(n, off); s.removeAllRanges(); s.addRange(r2);
      document.execCommand('insertText', false, chen);
      var lui = chen.length - vt; for (var i = 0; i < lui; i++) s.modify('move', 'backward', 'character');
    }
    dongGoiY();
  }
  function ganO(o) {   // ô mã LaTeX (textarea): chỉ có gợi ý lệnh
    if (!o || o._lgGan) return; o._lgGan = true;
    o.addEventListener('keydown', function (e) { if (goiY.mo && goiY.o === o) xuLyPhimGoiY(e); }, true);
    o.addEventListener('input', function () { kiemGoiY(o); });
    o.addEventListener('blur', function () { setTimeout(function () { if (goiY.o === o) dongGoiY(); }, 120); });
    o.addEventListener('scroll', function () { if (goiY.o === o) dongGoiY(); });
  }
  return { ganKhungChu: ganKhungChu, ganO: ganO, htmlChip: htmlChip, lamDayChip: lamDayChip, dongGoiY: dongGoiY, DS: DS };
})();
