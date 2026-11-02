// Văn bản có định dạng (nút ABC): soạn bằng khung HTML, lưu thành đoạn – mảnh chữ, vẽ lên canvas.
//   o = { loai: 'chu', x, y, rong (bề rộng khung, null = tự co), font, co (cỡ chữ), mau, doan: [{ canh, ds, runs: [{ t, b, i, u, s, mau }] }] }
window.GI = window.GI || {};
GI.vanBan = (function () {
  var FONT = [
    ['Arial', 'Arial, "Liberation Sans", Helvetica, sans-serif'],
    ['Times New Roman', '"Times New Roman", "Liberation Serif", serif'],
    ['Latin Modern (LaTeX)', '"LM Roman", "Times New Roman", serif'],
    ['Cambria', 'Cambria, "Times New Roman", serif'],
    ['Segoe UI', '"Segoe UI", Arial, sans-serif'],
    ['Tahoma', 'Tahoma, Arial, sans-serif'],
    ['Courier New', '"Courier New", "Liberation Mono", monospace'],
  ];
  function css(font) { for (var i = 0; i < FONT.length; i++) if (FONT[i][0] === font) return FONT[i][1]; return FONT[0][1]; }
  function chuan(o) {   // tệp cũ: nd là chuỗi nhiều dòng
    if (o.doan) return o.doan;
    return String(o.nd || '').split('\n').map(function (d) { return { canh: 'trai', runs: [{ t: d, b: !!o.dam }] }; });
  }
  function laTrong(o) { return !chuan(o).some(function (d) { return d.runs.some(function (r) { return /\S/.test(r.t); }); }); }

  // ---------- HTML (khung soạn) → mô hình ----------
  function tuHtml(goc) {
    var doan = [], hien = null;
    function moiDoan(canh, ds) { hien = { canh: canh || 'trai', ds: ds || null, runs: [] }; doan.push(hien); }
    function canhCua(el) { var a = el.style && el.style.textAlign || el.getAttribute && el.getAttribute('align'); return a === 'center' ? 'giua' : a === 'right' ? 'phai' : a === 'justify' ? 'trai' : null; }
    function di(n, kieu, canh, ds) {
      if (n.nodeType === 3) {
        if (!hien) moiDoan(canh, ds);
        var t = n.nodeValue.replace(/\u200B/g, '').replace(/\s+/g, ' '); if (t) hien.runs.push(Object.assign({ t: t }, kieu)); return;
      }
      if (n.nodeType !== 1) return;
      if (n.dataset && n.dataset.tex != null) { if (!hien) moiDoan(canh, ds); hien.runs.push(Object.assign({ t: '$' + n.dataset.tex + '$' }, kieu)); return; }   // công thức đã hiện (gõ $…$ + Tab)
      var tag = n.tagName, k = Object.assign({}, kieu), st = n.style || {};
      if (tag === 'B' || tag === 'STRONG' || st.fontWeight === 'bold' || +st.fontWeight >= 600) k.b = true;
      if (tag === 'I' || tag === 'EM' || st.fontStyle === 'italic') k.i = true;
      if (tag === 'U' || /underline/.test(st.textDecoration || st.textDecorationLine || '')) k.u = true;
      if (tag === 'S' || tag === 'STRIKE' || tag === 'DEL' || /line-through/.test(st.textDecoration || st.textDecorationLine || '')) k.s = true;
      var mau = n.getAttribute('color') || st.color; if (mau) k.mau = mauHex(mau);
      // <br>: kết thúc dòng hiện tại; <br> trên dòng trống mới tạo một dòng trống
      if (tag === 'BR') { if (hien && hien.runs.length) hien = null; else { moiDoan(canh, ds); hien = null; } return; }
      var khoi = /^(DIV|P|LI|H\d|BLOCKQUOTE)$/.test(tag), c2 = canhCua(n) || canh, ds2 = ds;
      if (tag === 'UL') ds2 = 'cham'; if (tag === 'OL') ds2 = 'so';
      // khối DIV/P: đoạn mới chỉ tạo khi gặp chữ (tránh đoạn rỗng khi khối chỉ bọc danh sách); LI luôn là một đoạn
      if (tag === 'LI') moiDoan(c2, ds2); else if (khoi) hien = null;
      for (var c = n.firstChild; c; c = c.nextSibling) di(c, k, c2, ds2);
      if (khoi) hien = null;
    }
    for (var c = goc.firstChild; c; c = c.nextSibling) di(c, {}, 'trai', null);
    // bỏ đoạn rỗng thừa ở cuối, gộp mảnh trùng kiểu
    while (doan.length > 1 && !doan[doan.length - 1].runs.length) doan.pop();
    doan.forEach(function (d) {
      var g = []; d.runs.forEach(function (r) { var tr = g[g.length - 1]; if (tr && tr.b === r.b && tr.i === r.i && tr.u === r.u && tr.s === r.s && tr.mau === r.mau) tr.t += r.t; else g.push(r); });
      if (g.length) { g[0].t = g[0].t.replace(/^ /, ''); } d.runs = g;
    });
    return doan.length ? doan : [{ canh: 'trai', runs: [] }];
  }
  function mauHex(m) {
    var r = /^rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(m); if (!r) return m;
    return '#' + [r[1], r[2], r[3]].map(function (x) { return (+x).toString(16).padStart(2, '0'); }).join('');
  }
  // ---------- mô hình → HTML (để sửa lại) ----------
  function esc(t) { return t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function sangHtml(o) {
    var h = '', ds = null;
    chuan(o).forEach(function (d) {
      if (d.ds !== ds) { if (ds) h += ds === 'so' ? '</ol>' : '</ul>'; if (d.ds) h += d.ds === 'so' ? '<ol>' : '<ul>'; ds = d.ds; }
      var noi = d.runs.map(function (r) {
        var t = GI.vanBan.toan && GI.latexGo && r.t.indexOf('$') >= 0 ? tachToan(r.t).map(function (m) { return m.m != null ? GI.latexGo.htmlChip(m.m) : esc(m.t); }).join('') : esc(r.t); if (r.mau) t = '<font color="' + r.mau + '">' + t + '</font>';
        if (r.s) t = '<s>' + t + '</s>'; if (r.u) t = '<u>' + t + '</u>'; if (r.i) t = '<i>' + t + '</i>'; if (r.b) t = '<b>' + t + '</b>'; return t;
      }).join('') || '<br>';
      var st = d.canh === 'giua' ? ' style="text-align:center"' : d.canh === 'phai' ? ' style="text-align:right"' : '';
      h += d.ds ? '<li' + st + '>' + noi + '</li>' : '<div' + st + '>' + noi + '</div>';
    });
    if (ds) h += ds === 'so' ? '</ol>' : '</ul>';
    return h;
  }

  // ---------- dàn trang và vẽ ----------
  function fontChu(r, co, ff) { return (r.i ? 'italic ' : '') + (r.b ? '700 ' : '400 ') + co + 'px ' + ff; }
  // Công thức $...$ trong chữ (bản máy tính): tách mỗi mảnh chữ thành chữ thường và công thức
  var EX = 0.45;
  function tachToan(t) {
    var ra = [], buf = '', i = 0;
    while (i < t.length) {
      var ch = t.charAt(i);
      if (ch === '\\' && t.charAt(i + 1) === '$') { buf += '$'; i += 2; continue; }
      if (ch === '$') {
        var j = i + 1; while (j < t.length && (t.charAt(j) !== '$' || t.charAt(j - 1) === '\\')) j++;
        if (j < t.length && j > i + 1 && /\S/.test(t.slice(i + 1, j))) { if (buf) ra.push({ t: buf }); buf = ''; ra.push({ m: t.slice(i + 1, j).trim() }); i = j + 1; continue; }
      }
      buf += ch; i++;
    }
    if (buf) ra.push({ t: buf });
    return ra;
  }
  function soToan(tex, co, khiXong) {
    var tx = GI.deBai && GI.deBai.chuanTex ? GI.deBai.chuanTex(tex) : tex, a = GI.congThuc && GI.congThuc.anh(tx, null, false, khiXong);
    if (!a) return { tex: tx, w: co * 1.2, cao: co * 0.7, sau: 0, chua: true };
    var sau = Math.max(0, -a.va * co * EX);
    return { tex: tx, w: a.wEx * co * EX, cao: a.hEx * co * EX - sau, sau: sau };
  }
  function danTrang(c, o, khiXong) {
    var co = o.co || 24, ff = css(o.font), lh = co * 1.38, rong = o.rong || 0, dong = [], so = 0, TREN = co * 1.02, DUOI = lh - TREN;
    chuan(o).forEach(function (d) {
      so = d.ds === 'so' ? so + 1 : 0;
      var thut = d.ds ? co * 1.4 : 0, tu = [];
      d.runs.forEach(function (r) {
        (GI.vanBan.toan && r.t.indexOf('$') >= 0 ? tachToan(r.t) : [{ t: r.t }]).forEach(function (m) {
          if (m.m != null) { tu.push({ m: m.m, r: r }); return; }
          m.t.split(/(\s+)/).forEach(function (p) { if (p) tu.push({ t: p, r: r }); });
        });
      });
      function hangMoi(dau) { return { doan: d, thut: thut, dau: dau, ds: [], w: 0, tren: TREN, duoi: DUOI }; }
      var hang = hangMoi(d.ds ? (d.ds === 'so' ? so + '.' : '•') : null), dau = true;
      tu.forEach(function (w) {
        var wd, ct = null;
        if (w.m != null) { ct = soToan(w.m, co, khiXong); wd = ct.w; }
        else { c.font = fontChu(w.r, co, ff); wd = c.measureText(w.t).width; }
        if (rong && !dau && hang.w + wd > rong - thut && (ct || /\S/.test(w.t))) { dong.push(hang); hang = hangMoi(null); }
        if (!ct && !hang.ds.length && /^\s+$/.test(w.t)) return;
        hang.ds.push(ct ? { ct: ct, r: w.r, w: wd } : { t: w.t, r: w.r, w: wd }); hang.w += wd; dau = false;
        if (ct) { hang.tren = Math.max(hang.tren, ct.cao + co * 0.12); hang.duoi = Math.max(hang.duoi, ct.sau + co * 0.12); }
      });
      dong.push(hang);
    });
    var rongKhung = rong || Math.max.apply(null, dong.map(function (h) { return h.w + h.thut; }).concat([co]));
    var cao = dong.reduce(function (t, h) { return t + h.tren + h.duoi; }, 0);
    return { dong: dong, lh: lh, co: co, ff: ff, rong: rongKhung, cao: cao };
  }
  function ve(c, o, mauMD, khiXong) {
    var L = danTrang(c, o, khiXong), y = o.y;
    c.save(); c.textBaseline = 'alphabetic';
    L.dong.forEach(function (h) {
      var tr = h.w, x = o.x + h.thut;
      if (h.doan.canh === 'giua') x = o.x + h.thut + (L.rong - h.thut - tr) / 2; else if (h.doan.canh === 'phai') x = o.x + L.rong - tr;
      var nen = y + h.tren;
      if (h.dau) { c.font = fontChu({}, L.co, L.ff); c.fillStyle = o.mau || mauMD; c.textAlign = 'right'; c.fillText(h.dau, o.x + h.thut - L.co * 0.35, nen); c.textAlign = 'left'; }
      h.ds.forEach(function (w) {
        var m = w.r.mau || o.mau || mauMD;
        if (w.ct) {
          if (!w.ct.chua) GI.congThuc.ve(c, { x: x, y: nen - w.ct.cao, latex: w.ct.tex, co: L.co }, m, khiXong);
          else { c.font = (L.co * 0.6) + 'px Arial'; c.fillStyle = '#94A3B8'; c.fillText('…', x, nen); }
          c.textBaseline = 'alphabetic'; x += w.w; return;
        }
        c.font = fontChu(w.r, L.co, L.ff); c.fillStyle = m; c.fillText(w.t, x, nen);
        if (w.r.u || w.r.s) { c.strokeStyle = m; c.lineWidth = Math.max(1, L.co / 16); c.beginPath(); var yy = w.r.u ? nen + L.co * 0.12 : nen - L.co * 0.3; c.moveTo(x, yy); c.lineTo(x + w.w, yy); c.stroke(); }
        x += w.w;
      });
      y += h.tren + h.duoi;
    });
    c.restore();
    return { x0: o.x, y0: o.y, x1: o.x + L.rong, y1: o.y + Math.max(L.cao, L.lh) };
  }
  return { toan: false, FONT: FONT, css: css, chuan: chuan, laTrong: laTrong, tuHtml: tuHtml, sangHtml: sangHtml, ve: ve };
})();
