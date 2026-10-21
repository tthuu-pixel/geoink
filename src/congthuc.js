// Công thức toán: soạn bằng MathLive, vẽ lên bảng bằng ảnh SVG do MathJax tạo (không cần mạng).
//   o = { loai: 'congThuc', x, y, latex, mau, co (cỡ chữ), lon (kiểu hiển thị lớn) }
window.GI = window.GI || {};
GI.congThuc = (function () {
  var hua = {}, boNho = {};
  function napScript(src) {
    if (hua[src]) return hua[src];
    hua[src] = new Promise(function (xong, loi) { var s = document.createElement('script'); s.src = src; s.onload = xong; s.onerror = function () { loi(new Error('Không nạp được ' + src)); }; document.head.appendChild(s); });
    return hua[src];
  }
  function napMathJax() {
    return napScript('thu-vien/mathjax/cau-hinh.js').then(function () { return napScript('thu-vien/mathjax/tex-svg.js'); }).then(function () { return window.MathJax.startup.promise; });
  }
  function napMathLive() {
    return napScript('thu-vien/mathlive/mathlive.min.js').then(function () {
      var M = window.MathfieldElement;
      // thư mục font tính theo vị trí mathlive.min.js
      if (M && !M._daCauHinh) { M._daCauHinh = true; M.fontsDirectory = 'fonts'; M.soundsDirectory = null; M.plonkSound = null; M.keypressSound = null; }
    });
  }
  // Công thức → danh sách nét vẽ (Path2D) lấy từ SVG của MathJax; vẽ thẳng lên bảng bằng nét vector.
  //   Không đi qua ảnh <img> SVG: trên một số máy Windows, Chromium vẽ ảnh SVG lên canvas thành khối đen.
  //   Vẽ vector còn giữ nét sắc ở mọi mức phóng to. (đệm theo latex + kiểu; màu áp lúc vẽ)
  function maTran(el) {
    var tf = el.transform && el.transform.baseVal;
    if (!tf || !tf.numberOfItems) return null;
    var m = tf.consolidate().matrix; return [m.a, m.b, m.c, m.d, m.e, m.f];
  }
  function nhan(A, B) {   // A · B (ma trận affine [a b c d e f])
    return [A[0] * B[0] + A[2] * B[1], A[1] * B[0] + A[3] * B[1], A[0] * B[2] + A[2] * B[3], A[1] * B[2] + A[3] * B[3], A[0] * B[4] + A[2] * B[5] + A[4], A[1] * B[4] + A[3] * B[5] + A[5]];
  }
  function so(v, md) { var x = parseFloat(v); return isFinite(x) ? x : md; }
  function tachNet(svg) {
    var ds = [];
    // tô / viền kế thừa từ thẻ cha; 'currentColor' = màu công thức (áp lúc vẽ)
    function lay(el, ten, cu) { var v = el.getAttribute && el.getAttribute(ten); return v == null || v === '' ? cu : v; }
    function them(k, p, M, ki, extra) {
      var op = { k: k, p: p, m: M, f: ki.f === 'none' ? null : ki.f, s: ki.s && ki.s !== 'none' && ki.w > 0 ? ki.s : null, w: ki.w };
      if (extra) for (var t in extra) op[t] = extra[t];
      if (op.f || op.s || k === 't') ds.push(op);
    }
    function vet(el, M, ki) {
      var tag = (el.tagName || '').toLowerCase(); if (!tag) return;
      var m = maTran(el); if (m) M = nhan(M, m);
      ki = { f: lay(el, 'fill', ki.f), s: lay(el, 'stroke', ki.s), w: so(lay(el, 'stroke-width', ki.w), 0) };
      if (tag === 'svg' && el !== svg) {   // svg lồng: dời theo x, y và co theo viewBox
        var vb = (el.getAttribute('viewBox') || '').split(/[\s,]+/).map(parseFloat), x = so(el.getAttribute('x'), 0), y = so(el.getAttribute('y'), 0);
        M = nhan(M, [1, 0, 0, 1, x, y]);
        if (vb.length === 4 && isFinite(vb[2])) { var w = so(el.getAttribute('width'), vb[2]), h = so(el.getAttribute('height'), vb[3]); M = nhan(M, [w / vb[2], 0, 0, h / vb[3], -vb[0] * w / vb[2], -vb[1] * h / vb[3]]); }
      }
      if (tag === 'path') { var d = el.getAttribute('d'); if (d) them('p', new Path2D(d), M, ki); return; }
      if (tag === 'rect') { var r = new Path2D(); r.rect(so(el.getAttribute('x'), 0), so(el.getAttribute('y'), 0), so(el.getAttribute('width'), 0), so(el.getAttribute('height'), 0)); them('p', r, M, ki); return; }
      if (tag === 'line') { var l = new Path2D(); l.moveTo(so(el.getAttribute('x1'), 0), so(el.getAttribute('y1'), 0)); l.lineTo(so(el.getAttribute('x2'), 0), so(el.getAttribute('y2'), 0)); them('p', l, M, { f: 'none', s: ki.s || ki.f, w: ki.w || 40 }); return; }
      if (tag === 'ellipse' || tag === 'circle') { var e = new Path2D(), rx = so(el.getAttribute('rx') || el.getAttribute('r'), 0), ry = so(el.getAttribute('ry') || el.getAttribute('r'), 0); e.ellipse(so(el.getAttribute('cx'), 0), so(el.getAttribute('cy'), 0), rx, ry, 0, 0, 2 * Math.PI); them('p', e, M, ki); return; }
      if (tag === 'polygon' || tag === 'polyline') { var q = (el.getAttribute('points') || '').trim().split(/[\s,]+/).map(parseFloat), g = new Path2D(); for (var i = 0; i + 1 < q.length; i += 2) i ? g.lineTo(q[i], q[i + 1]) : g.moveTo(q[i], q[i + 1]); if (tag === 'polygon') g.closePath(); them('p', g, M, tag === 'polygon' ? ki : { f: 'none', s: ki.s || ki.f, w: ki.w || 40 }); return; }
      if (tag === 'text') {   // chữ không có trong phông MathJax (tiếng Việt trong \text…)
        them('t', null, M, ki, { t: el.textContent, x: so(el.getAttribute('x'), 0), y: so(el.getAttribute('y'), 0),
          font: (el.getAttribute('font-style') === 'italic' ? 'italic ' : '') + (el.getAttribute('font-weight') === 'bold' ? 'bold ' : '') + so(el.getAttribute('font-size'), 1000) + 'px ' + (el.getAttribute('font-family') || '"Times New Roman", serif') });
        return;
      }
      for (var c = el.firstElementChild; c; c = c.nextElementSibling) vet(c, M, ki);
    }
    vet(svg, [1, 0, 0, 1, 0, 0], { f: 'currentColor', s: null, w: 0 });
    return ds;
  }
  function anh(latex, mau, lon, khiXong) {
    var k = latex + '|' + (lon ? 1 : 0), b = boNho[k];
    if (b) return b.san ? b : null;
    b = boNho[k] = { san: false };
    napMathJax().then(function () {
      var svg = window.MathJax.tex2svg(latex || '\\square', { display: !!lon }).querySelector('svg');
      b.loi = !!svg.querySelector('[data-mml-node="merror"]');
      b.wEx = parseFloat(svg.getAttribute('width')) || 1; b.hEx = parseFloat(svg.getAttribute('height')) || 1;
      var va = svg.style.verticalAlign; b.va = parseFloat(va) || 0;
      b.vb = (svg.getAttribute('viewBox') || '0 0 1 1').split(/[\s,]+/).map(parseFloat);
      b.net = tachNet(svg); b.san = true; if (khiXong) khiXong();
    }).catch(function (e) { b.loiNap = String(e.message || e); });
    return null;
  }
  var EX = 0.45;   // 1 ex ≈ 0,45 cỡ chữ
  function ve(c, o, mauMD, khiXong) {
    var co = o.co || 36, mau = o.mau || mauMD, a = anh(o.latex, mau, o.lon, khiXong);
    if (!a) {
      c.save(); c.font = (co * 0.5) + 'px Arial'; c.fillStyle = '#94A3B8'; c.textBaseline = 'top'; c.fillText('Đang tạo công thức…', o.x, o.y); c.restore();
      return { x0: o.x, y0: o.y, x1: o.x + co * 5, y1: o.y + co };
    }
    var w = a.wEx * co * EX, h = a.hEx * co * EX, vb = a.vb;
    c.save(); c.setLineDash([]);
    c.translate(o.x, o.y); c.scale(w / vb[2], h / vb[3]); c.translate(-vb[0], -vb[1]);
    a.net.forEach(function (n) {
      c.save(); c.transform(n.m[0], n.m[1], n.m[2], n.m[3], n.m[4], n.m[5]);
      var f = !n.f || n.f === 'currentColor' ? mau : n.f, st = n.s === 'currentColor' ? mau : n.s;
      if (n.k === 'p') { if (n.f) { c.fillStyle = f; c.fill(n.p); } if (st) { c.strokeStyle = st; c.lineWidth = n.w; c.stroke(n.p); } }
      else { c.fillStyle = f; c.font = n.font; c.textBaseline = 'alphabetic'; c.fillText(n.t, n.x, n.y); }
      c.restore();
    });
    c.restore();
    return { x0: o.x, y0: o.y, x1: o.x + w, y1: o.y + h };
  }
  return { napMathJax: napMathJax, napMathLive: napMathLive, anh: anh, ve: ve };
})();
