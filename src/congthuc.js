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
  // Ảnh SVG của công thức (đệm theo latex + màu + kiểu); khiXong gọi khi ảnh vừa sẵn sàng
  function anh(latex, mau, lon, khiXong) {
    var k = latex + '|' + mau + '|' + (lon ? 1 : 0), b = boNho[k];
    if (b) return b.san ? b : null;
    b = boNho[k] = { san: false };
    napMathJax().then(function () {
      var svg = window.MathJax.tex2svg(latex || '\\square', { display: !!lon }).querySelector('svg');
      b.loi = !!svg.querySelector('[data-mml-node="merror"]');
      svg.setAttribute('style', 'color:' + mau); svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      b.wEx = parseFloat(svg.getAttribute('width')) || 1; b.hEx = parseFloat(svg.getAttribute('height')) || 1;
      var va = svg.style.verticalAlign; b.va = parseFloat(va) || 0;
      var img = new Image();
      img.onload = function () { b.img = img; b.san = true; if (khiXong) khiXong(); };
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(new XMLSerializer().serializeToString(svg));
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
    var w = a.wEx * co * EX, h = a.hEx * co * EX;
    c.drawImage(a.img, o.x, o.y, w, h);
    return { x0: o.x, y0: o.y, x1: o.x + w, y1: o.y + h };
  }
  return { napMathJax: napMathJax, napMathLive: napMathLive, anh: anh, ve: ve };
})();
