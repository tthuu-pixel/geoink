// Đề bài từ mã LaTeX (môi trường ex, bt, vd kiểu ex_test): chữ tiếng Việt xen công thức, phương án \choice, \loigiai, hình TikZ.
//   GI.deBai.phanTich(ma) → [{ kieu: 'ex' | 'bt' | 'vd', doan, loiGiai, tikz: [mã tikzpicture] }]
//   o = { loai: 'deBai', x, y, rong, co, mau, ma (mã gốc), doan: [khối] }
//     khối: { k: 'p', runs, nhan, thut } đoạn chữ (nhan: nhãn a), 1., • ở đầu) · { k: 'm', tex } công thức riêng dòng
//           { k: 'chon', ds: [runs], nhan: ['A.', …] } các phương án trắc nghiệm
//     runs: [{ t, b, i, u, mau } | { m: latex }]
window.GI = window.GI || {};
GI.deBai = (function () {
  var TEN = { ex: 'Câu', bt: 'Bài', vd: 'Ví dụ' }, MAU_NHAN = '#1D4ED8';

  /* ================== ĐỌC MÃ ================== */
  function khop(s, i) {   // s[i] là { hoặc [ → vị trí dấu đóng tương ứng
    var mo = s.charAt(i), dong = mo === '{' ? '}' : ']', sau = 0;
    for (var j = i; j < s.length; j++) {
      var ch = s.charAt(j);
      if (ch === '\\') { j++; continue; }
      if (ch === mo) sau++; else if (ch === dong) { sau--; if (!sau) return j; }
    }
    return s.length - 1;
  }
  function boTrang(s, i) { while (i < s.length && /\s/.test(s.charAt(i))) i++; return i; }
  // đọc lệnh \ten[..]{..}{..}: trả { tuyChon, doi: [..], het }
  function docDoi(s, i, soDoi) {
    var tc = null, doi = [];
    var j = boTrang(s, i); if (s.charAt(j) === '[') { var k = khop(s, j); tc = s.slice(j + 1, k); i = k + 1; }
    for (var n = 0; n < soDoi; n++) {
      j = boTrang(s, i); if (s.charAt(j) !== '{') break;
      var e = khop(s, j); doi.push(s.slice(j + 1, e)); i = e + 1;
    }
    return { tuyChon: tc, doi: doi, het: i };
  }
  function boChuThich(s) { return s.split('\n').map(function (d) { return d.replace(/(^|[^\\])%.*$/, '$1'); }).join('\n'); }
  function timMoiTruong(s, ten) {   // các khối \begin{ten}…\end{ten} (không lồng cùng tên)
    var ds = [], re = new RegExp('\\\\begin\\{' + ten + '\\}', 'g'), m;
    while ((m = re.exec(s))) {
      var het = s.indexOf('\\end{' + ten + '}', m.index); if (het < 0) break;
      var trong = s.slice(m.index + m[0].length, het);
      ds.push({ dau: m.index, cuoi: het + ('\\end{' + ten + '}').length, trong: trong }); re.lastIndex = het;
    }
    return ds;
  }
  function phanTich(ma) {
    ma = boChuThich(String(ma || ''));
    var ds = [];
    ['ex', 'bt', 'vd'].forEach(function (ten) {
      timMoiTruong(ma, ten).forEach(function (k) { ds.push({ vt: k.dau, kieu: ten, trong: k.trong, ma: ma.slice(k.dau, k.cuoi) }); });
    });
    ds.sort(function (a, b) { return a.vt - b.vt; });
    return ds.map(function (d) { var r = mot(d.kieu, d.trong.replace(/^\s*\[[^\]]*\]/, '')); r.ma = d.ma; return r; });
  }
  function laCauTN(s) { return /\\choice(TF)?\b/.test(s); }
  function mot(kieu, s) {
    var tikz = [], loiGiai = null, chon = null, tf = false, dapAn = [], traLoi = null;
    // lời giải
    var iL = s.indexOf('\\loigiai');
    if (iL >= 0) { var r = docDoi(s, iL + 8, 1); loiGiai = r.doi[0] || ''; s = s.slice(0, iL) + s.slice(r.het); }
    // \shortans{…}: đáp số trả lời ngắn
    var iS = s.indexOf('\\shortans');
    if (iS >= 0) { var rS = docDoi(s, iS + 9, 1); traLoi = rS.doi[0] || ''; s = s.slice(0, iS) + s.slice(rS.het); }
    // phương án
    var mC = /\\choice(TF)?(?![A-Za-z])/.exec(s);
    if (mC) {
      tf = !!mC[1]; var rC = docDoi(s, mC.index + mC[0].length, 6); chon = rC.doi;
      s = s.slice(0, mC.index) + s.slice(rC.het);
      chon = chon.map(function (p, i) { if (/\\True\b/.test(p)) dapAn.push(i); return p.replace(/\\True\b\s*/g, ''); });
    }
    // \immini[..]{chữ}{hình}, \impicinpar{chữ}{hình}: lấy chữ, hình đưa ra ngoài
    s = s.replace(/\\(immini|impicinpar|imminiL)\b/g, '\\@IMM');
    for (var lan = 0; lan < 20; lan++) {
      var iI = s.indexOf('\\@IMM'); if (iI < 0) break;
      var rI = docDoi(s, iI + 5, 2); s = s.slice(0, iI) + (rI.doi[0] || '') + '\n\n' + (rI.doi[1] || '') + s.slice(rI.het);
    }
    s = layTikz(s, tikz);
    var doan = sangKhoi(s);
    if (chon) doan.push({ k: 'chon', tf: tf, nhan: chon.map(function (_, i) { return tf ? String.fromCharCode(97 + i) + ')' : String.fromCharCode(65 + i) + '.'; }), ds: chon.map(function (p) { return dongRuns(layTikz(p, tikz)); }) });
    var lg = null;
    if (loiGiai != null || traLoi != null || dapAn.length) {
      lg = [];
      if (dapAn.length && !tf) lg.push({ k: 'p', runs: [{ t: 'Chọn ', b: true }, { t: dapAn.map(function (i) { return String.fromCharCode(65 + i); }).join(', '), b: true, mau: '#DC2626' }] });
      if (dapAn.length && tf) lg.push({ k: 'p', runs: [{ t: 'Đúng: ', b: true }, { t: dapAn.map(function (i) { return String.fromCharCode(97 + i) + ')'; }).join(', ') || '—', b: true, mau: '#DC2626' }] });
      if (traLoi != null) lg.push({ k: 'p', runs: [{ t: 'Đáp số: ', b: true }].concat(dongRuns(traLoi).map(function (r) { if (r.t != null) { r.b = true; r.mau = '#DC2626'; } return r; })) });
      if (loiGiai != null) lg = lg.concat(sangKhoi(layTikz(loiGiai, tikz)));
    }
    return { kieu: kieu, doan: doan, loiGiai: lg, tikz: tikz, tracNghiem: !!chon };
  }
  function layTikz(s, tikz) {
    timMoiTruong(s, 'tikzpicture').reverse().forEach(function (k) {
      // lấy cả \begin{tikzpicture}[…] … \end{tikzpicture}
      tikz.unshift(s.slice(k.dau, k.cuoi)); s = s.slice(0, k.dau) + s.slice(k.cuoi);
    });
    return s;
  }

  // ----- chữ → các khối (đoạn, công thức riêng dòng, danh sách) -----
  var BO_LENH = /\\(centering|noindent|hfill|dotfill|newpage|medskip|bigskip|smallskip|indent|par(?![a-z])|break|clearpage|allowdisplaybreaks)\b/g;
  function sangKhoi(s) {
    s = s.replace(/\\(vspace|hspace)\*?\{[^}]*\}/g, ' ').replace(BO_LENH, '\n\n').replace(/\\begin\{(center|flushleft|minipage|multicols)\}(\{[^}]*\})?(\[[^\]]*\])?|\\end\{(center|flushleft|minipage|multicols)\}/g, '\n\n');
    var kq = [];
    // tách danh sách enumerate / itemize / enumEX / listEX
    var re = /\\begin\{(enumerate|itemize|enumEX|listEX)\}/g, m, cu = 0;
    while ((m = re.exec(s))) {
      var het = timHet(s, m[1], m.index + m[0].length); if (het < 0) break;
      doanVanBan(s.slice(cu, m.index), kq);
      var trong = s.slice(m.index + m[0].length, het), tc = '';
      var t2 = trong.replace(/^\s*\{[^}]*\}/, function () { return ''; });
      t2 = t2.replace(/^\s*\[([^\]]*)\]/, function (_, x) { tc = x; return ''; });
      danhSach(m[1], tc, t2, kq);
      cu = het + ('\\end{' + m[1] + '}').length; re.lastIndex = cu;
    }
    doanVanBan(s.slice(cu), kq);
    return kq;
  }
  function timHet(s, ten, tu) {   // \end{ten} khớp (cho phép lồng)
    var sau = 1, re = new RegExp('\\\\(begin|end)\\{' + ten + '\\}', 'g'), m; re.lastIndex = tu;
    while ((m = re.exec(s))) { sau += m[1] === 'begin' ? 1 : -1; if (!sau) return m.index; }
    return -1;
  }
  function danhSach(ten, tc, s, kq) {
    var muc = s.split(/\\item\b/).slice(1), kieu = ten === 'itemize' ? 'cham' : /\\?alph|a\)|a\.|\(a\)|\[a\]/.test(tc) || ten === 'enumEX' || ten === 'listEX' ? 'chu' : /i\)|i\./.test(tc) && !/1/.test(tc) ? 'la' : 'so';
    muc.forEach(function (p, i) {
      var nhan = null;
      p = p.replace(/^\s*\[([^\]]*)\]/, function (_, x) { nhan = x; return ''; });
      if (nhan == null) nhan = kieu === 'cham' ? '•' : kieu === 'chu' ? String.fromCharCode(97 + i) + ')' : kieu === 'la' ? ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii'][i] + ')' : (i + 1) + '.';
      var con = sangKhoi(p), dau = true;
      con.forEach(function (k) { if (k.k === 'p') { k.thut = (k.thut || 0) + 1; if (dau) { k.nhan = dongRuns(nhan).map(function (r) { if (r.t != null) r.b = true; return r; }); dau = false; } } kq.push(k); });
      if (dau) kq.push({ k: 'p', runs: [], thut: 1, nhan: [{ t: nhan, b: true }] });
    });
  }
  // văn bản thường: tách đoạn (dòng trống, \\), công thức riêng dòng
  function doanVanBan(s, kq) {
    var MT = /\$\$([\s\S]+?)\$\$|\\\[([\s\S]+?)\\\]|\\begin\{(align\*?|equation\*?|gather\*?|eqnarray\*?)\}([\s\S]*?)\\end\{\3\}/g, m, cu = 0;
    function chu(t) {
      tachDong(t).forEach(function (d) { if (/\S/.test(d)) kq.push({ k: 'p', runs: dongRuns(d) }); });
    }
    while ((m = MT.exec(s))) {
      chu(s.slice(cu, m.index));
      var tex = m[1] || m[2]; if (m[3]) tex = /^align|^eqnarray/.test(m[3]) ? '\\begin{aligned}' + m[4].replace(/\\label\{[^}]*\}|\\nonumber/g, '') + '\\end{aligned}' : m[4];
      kq.push({ k: 'm', tex: chuanTex(tex.trim()) }); cu = MT.lastIndex;
    }
    chu(s.slice(cu));
  }
  function tachDong(s) {   // tách theo dòng trống và \\ nằm ngoài công thức
    var ra = [], hien = '', trongMT = false;
    for (var i = 0; i < s.length; i++) {
      var ch = s.charAt(i);
      if (ch === '\\' && s.charAt(i + 1) === '$') { hien += '\\$'; i++; continue; }
      if (ch === '$') { trongMT = !trongMT; hien += ch; continue; }
      if (!trongMT && ch === '\\' && s.charAt(i + 1) === '\\') { ra.push(hien); hien = ''; i++; if (s.charAt(i + 1) === '[') i = khop(s, i + 1); continue; }
      if (!trongMT && ch === '\\' && s.slice(i, i + 8) === '\\newline') { ra.push(hien); hien = ''; i += 7; continue; }
      if (!trongMT && ch === '\n' && /^\s*\n/.test(s.slice(i + 1))) { ra.push(hien); hien = ''; continue; }
      hien += ch;
    }
    ra.push(hien);
    return ra;
  }
  // một đoạn → các mảnh chữ / công thức trong dòng
  function dongRuns(s, kieu) {
    kieu = kieu || {}; var ra = [], buf = '';
    function day() { if (buf) { var r = { t: buf }; for (var k in kieu) r[k] = kieu[k]; ra.push(r); buf = ''; } }
    s = s.replace(/\s+/g, ' ');
    for (var i = 0; i < s.length; i++) {
      var ch = s.charAt(i);
      if (ch === '$' || (ch === '\\' && s.charAt(i + 1) === '(')) {
        var mo = ch === '$' ? 1 : 2, dong = ch === '$' ? '$' : '\\)', j = s.indexOf(dong, i + mo);
        while (ch === '$' && j > 0 && s.charAt(j - 1) === '\\') j = s.indexOf('$', j + 1);
        if (j < 0) { buf += s.slice(i); break; }
        day(); ra.push({ m: chuanTex(s.slice(i + mo, j).trim()) }); i = j + dong.length - 1; continue;
      }
      if (ch === '\\') {
        var mL = /^\\([A-Za-z]+)\*?/.exec(s.slice(i));
        if (!mL) { var kt = s.charAt(i + 1); buf += kt === '\\' ? ' ' : kt; i++; continue; }
        var ten = mL[1], sau = i + mL[0].length;
        var KIEU = { textbf: { b: true }, textit: { i: true }, emph: { i: true }, underline: { u: true }, uline: { u: true }, textup: {}, textrm: {}, textsf: {}, text: {}, mbox: {}, textnormal: {} };
        if (ten in KIEU || ten === 'textcolor' || ten === 'color') {
          day(); var mau = null;
          if (ten === 'textcolor') { var rM = docDoi(s, sau, 1); mau = mauLatex(rM.doi[0]); sau = rM.het; }
          var rT = docDoi(s, sau, 1), k2 = {}; for (var a in kieu) k2[a] = kieu[a]; var th = KIEU[ten] || {}; for (var b in th) k2[b] = th[b]; if (mau) k2.mau = mau;
          if (ten === 'color') { i = sau - 1; continue; }
          ra = ra.concat(dongRuns(rT.doi[0] || '', k2)); i = rT.het - 1; continue;
        }
        if (ten === 'True' || ten === 'label' || ten === 'ref' || ten === 'footnote') { var rB = docDoi(s, sau, ten === 'True' ? 0 : 1); i = rB.het - 1; continue; }
        var KY = { ldots: '…', dots: '…', cdots: '⋯', LaTeX: 'LaTeX', TeX: 'TeX', textdegree: '°', degree: '°', ' ': ' ', quad: '  ', qquad: '    ' };
        if (ten in KY) { buf += KY[ten]; i = sau - 1; if (s.charAt(sau) === ' ') { } continue; }
        // lệnh khác: bỏ tên lệnh, giữ nội dung trong ngoặc
        var rK = docDoi(s, sau, 1); buf += (rK.doi[0] != null ? rK.doi[0] : ''); i = rK.het - 1; continue;
      }
      if (ch === '{' || ch === '}') continue;
      if (ch === '~') { buf += ' '; continue; }
      if (ch === '-' && s.charAt(i + 1) === '-') { buf += '–'; i += s.charAt(i + 2) === '-' ? 2 : 1; continue; }
      if (ch === '`' && s.charAt(i + 1) === '`') { buf += '“'; i++; continue; }
      if (ch === "'" && s.charAt(i + 1) === "'") { buf += '”'; i++; continue; }
      buf += ch;
    }
    day();
    if (ra.length && ra[0].t != null) ra[0].t = ra[0].t.replace(/^ +/, '');
    if (ra.length && ra[ra.length - 1].t != null) ra[ra.length - 1].t = ra[ra.length - 1].t.replace(/ +$/, '');
    return ra.filter(function (r) { return r.m != null || r.t; });
  }
  function mauLatex(t) { var M = { red: '#DC2626', blue: '#2563EB', green: '#16A34A', violet: '#7C3AED', purple: '#7C3AED', orange: '#EA580C', brown: '#92400E', cyan: '#0891B2', magenta: '#C026D3', black: '#111827' }; return M[String(t || '').trim()] || null; }
  // macro quen dùng trong đề Toán (gói ex_test, ...) → TeX mà MathJax hiểu
  function chuanTex(t) {
    function thay(ten, mo, dong) {
      for (var lan = 0; lan < 20; lan++) {
        var i = t.indexOf('\\' + ten); if (i < 0 || /[A-Za-z]/.test(t.charAt(i + ten.length + 1))) break;
        var r = docDoi(t, i + ten.length + 1, 1); if (!r.doi.length) break;
        t = t.slice(0, i) + mo + r.doi[0] + dong + t.slice(r.het);
      }
    }
    t = t.replace(/\\True\b\s*/g, '').replace(/\\displaystyle\b/g, '\\displaystyle ');
    thay('heva', '\\left\\{\\begin{aligned}', '\\end{aligned}\\right.');
    thay('hoac', '\\left[\\begin{aligned}', '\\end{aligned}\\right.');
    thay('vv', '\\overrightarrow{', '}');
    thay('overparen', '\\overset{\\frown}{', '}');
    thay('wideparen', '\\overset{\\frown}{', '}');
    thay('num', '{', '}');
    t = t.replace(/\\(heva|hoac)\b/g, '').replace(/\\textrm\b/g, '\\text').replace(/\\dfrac/g, '\\dfrac');
    return t;
  }

  /* ================== DÀN TRANG VÀ VẼ ================== */
  var EX = 0.45;
  function anh(tex, co, khiXong) {
    var a = GI.congThuc.anh(tex, null, false, khiXong);
    if (!a) return { w: co * 1.6, cao: co * 0.8, sau: co * 0.25, chua: true };
    var w = a.wEx * co * EX, h = a.hEx * co * EX, sau = Math.max(0, -a.va * co * EX);
    return { w: w, cao: h - sau, sau: sau, a: a };
  }
  function fontR(r, co, ff) { return (r.i ? 'italic ' : '') + (r.b ? '700 ' : '400 ') + co + 'px ' + ff; }
  // runs → các hàng trong bề rộng rong (thụt đầu dòng thut); nhãn đặt trước hàng đầu
  function chiaHang(c, runs, rong, co, ff, khiXong) {
    var tu = [];
    runs.forEach(function (r) {
      if (r.m != null) { var b = anh(r.m, co, khiXong); tu.push({ m: r.m, w: b.w, cao: b.cao, sau: b.sau, chua: b.chua }); return; }
      r.t.split(/( +)/).forEach(function (p) { if (!p) return; c.font = fontR(r, co, ff); tu.push({ t: p, r: r, w: c.measureText(p).width, cao: co * 0.92, sau: co * 0.28, trang: /^ +$/.test(p) }); });
    });
    // công thức dính liền chữ phía sau (dấu câu) không tách dòng
    var hang = [], h = { ds: [], w: 0 }, chua = false;
    tu.forEach(function (w, i) {
      if (w.chua) chua = true;
      var dinh = i > 0 && !w.trang && !tu[i - 1].trang;
      if (h.ds.length && !w.trang && h.w + w.w > rong && !dinh) {
        while (h.ds.length && h.ds[h.ds.length - 1].trang) h.w -= h.ds.pop().w;
        hang.push(h); h = { ds: [], w: 0 };
      }
      if (!h.ds.length && w.trang) return;
      h.ds.push(w); h.w += w.w;
    });
    hang.push(h);
    hang.forEach(function (x) {
      x.cao = co * 0.92; x.sau = co * 0.3;
      x.ds.forEach(function (w) { x.cao = Math.max(x.cao, w.cao); x.sau = Math.max(x.sau, w.sau); });
    });
    hang.chua = chua;
    return hang;
  }
  function danTrang(c, o, khiXong) {
    var co = o.co || 26, ff = GI.vanBan.css(o.font || 'Times New Roman'), rong = o.rong || 900, cach = co * 0.32, thutDV = co * 1.6;
    var muc = [], y = 0;
    function themHang(hang, x0, thut) { hang.forEach(function (h) { y += h.cao; muc.push({ k: 'hang', h: h, x: x0, y: y }); y += h.sau + cach; }); }
    (o.doan || []).forEach(function (k) {
      if (k.k === 'm') { var b = anh(k.tex, co, khiXong); y += co * 0.15 + b.cao; muc.push({ k: 'mt', tex: k.tex, w: b.w, cao: b.cao, sau: b.sau, x: Math.max(0, (rong - b.w) / 2), y: y }); y += b.sau + cach + co * 0.15; return; }
      if (k.k === 'chon') {
        var n = k.ds.length, nhanW = 0, tuNhien = [];
        c.font = fontR({ b: true }, co, ff); k.nhan.forEach(function (t) { nhanW = Math.max(nhanW, c.measureText(t + ' ').width); });
        k.ds.forEach(function (runs) { var hh = chiaHang(c, runs, 1e9, co, ff, khiXong); tuNhien.push(hh[0].w); });
        var lon = Math.max.apply(null, tuNhien.concat([0])) + nhanW + co, soCot = k.tf ? 1 : lon <= rong / 4 ? Math.min(4, n) : lon <= rong / 2 ? 2 : 1, wCot = rong / soCot;
        for (var i = 0; i < n; i += soCot) {
          var hangCot = [], caoMax = 0;
          for (var j = i; j < Math.min(n, i + soCot); j++) { var hc = chiaHang(c, k.ds[j], wCot - nhanW - co * 0.6, co, ff, khiXong); hangCot.push(hc); }
          var caoDau = 0; hangCot.forEach(function (hc) { caoDau = Math.max(caoDau, hc[0].cao); }); hangCot.forEach(function (hc) { hc[0].cao = caoDau; });   // cùng một hàng: chung đường chân chữ
          var y0 = y, yMax = y;
          hangCot.forEach(function (hc, jj) {
            var yy = y0, x0 = (jj) * wCot;
            hc.forEach(function (h, hi) { yy += h.cao; muc.push({ k: 'hang', h: h, x: x0 + nhanW, y: yy }); if (hi === 0) muc.push({ k: 'nhan', t: k.nhan[i + jj], x: x0, y: yy, mau: MAU_NHAN }); yy += h.sau + cach; });
            yMax = Math.max(yMax, yy); void caoMax;
          });
          y = yMax;
        }
        return;
      }
      var thut = (k.thut || 0) * thutDV, nhanW2 = 0, nhan = k.nhan;
      if (nhan && nhan.length) { c.font = fontR({ b: true }, co, ff); nhanW2 = nhan.reduce(function (s2, r) { return s2 + (r.t != null ? c.measureText(r.t).width : anh(r.m, co, khiXong).w); }, 0) + co * 0.4; }
      var hangP = chiaHang(c, k.runs || [], rong - thut - nhanW2, co, ff, khiXong), yTruoc = y;
      themHang(hangP, thut + nhanW2);
      if (nhan && nhan.length) { var dau = muc.filter(function (m) { return m.k === 'hang'; }).filter(function (m) { return m.y > yTruoc; })[0]; if (dau) muc.push({ k: 'nhanRuns', runs: nhan, x: thut, y: dau.y }); }
    });
    return { muc: muc, cao: Math.max(y - cach, co), rong: rong, co: co, ff: ff };
  }
  function ve(c, o, mauMD, khiXong) {
    var L = danTrang(c, o, khiXong), mau = o.mau || mauMD, co = L.co;
    c.save(); c.textBaseline = 'alphabetic'; c.setLineDash([]);
    function veTu(w, x, yNen) {
      if (w.m != null) { var a = GI.congThuc.anh(w.m, null, false, khiXong); if (a) GI.congThuc.ve(c, { x: x, y: yNen - w.cao, latex: w.m, co: co }, mau, khiXong); return; }
      var r = w.r; c.font = fontR(r, co, L.ff); c.fillStyle = r.mau || mau; c.fillText(w.t, x, yNen);
      if (r.u) { c.strokeStyle = r.mau || mau; c.lineWidth = Math.max(1, co / 16); c.beginPath(); c.moveTo(x, yNen + co * 0.12); c.lineTo(x + w.w, yNen + co * 0.12); c.stroke(); }
    }
    L.muc.forEach(function (m) {
      if (m.k === 'hang') { var x = o.x + m.x; m.h.ds.forEach(function (w) { veTu(w, x, o.y + m.y); x += w.w; }); }
      else if (m.k === 'mt') GI.congThuc.ve(c, { x: o.x + m.x, y: o.y + m.y - m.cao, latex: m.tex, co: co }, mau, khiXong);
      else if (m.k === 'nhan') { c.font = fontR({ b: true }, co, L.ff); c.fillStyle = m.mau; c.fillText(m.t, o.x + m.x, o.y + m.y); }
      else if (m.k === 'nhanRuns') {
        var xN = o.x + m.x;
        m.runs.forEach(function (r) {
          if (r.m != null) { var b = anh(r.m, co, khiXong); if (b.a) GI.congThuc.ve(c, { x: xN, y: o.y + m.y - b.cao, latex: r.m, co: co }, mau, khiXong); xN += b.w; return; }
          c.font = fontR(r, co, L.ff); c.fillStyle = r.mau || MAU_NHAN; c.fillText(r.t, xN, o.y + m.y); xN += c.measureText(r.t).width;
        });
      }
    });
    c.restore();
    return { x0: o.x, y0: o.y, x1: o.x + L.rong, y1: o.y + L.cao };
  }
  // chờ MathJax dựng xong mọi công thức của các khối (để đo chiều cao đúng trước khi xếp lên bảng)
  function chuanBi(dsDoan) {
    var tex = [];
    function lay(runs) { (runs || []).forEach(function (r) { if (r.m != null) tex.push(r.m); }); }
    dsDoan.forEach(function (doan) { (doan || []).forEach(function (k) { if (k.k === 'm') tex.push(k.tex); else if (k.k === 'chon') k.ds.forEach(lay); else { lay(k.runs); lay(k.nhan); } }); });
    return GI.congThuc.napMathJax().then(function () {
      return new Promise(function (xong) {
        var bat = Date.now();
        (function thu() {
          var con = tex.filter(function (t) { return !GI.congThuc.anh(t, null, false); });
          if (!con.length || Date.now() - bat > 8000) return xong(); setTimeout(thu, 40);
        })();
      });
    });
  }
  function dauDe(kieu, so) { return [{ t: TEN[kieu] + ' ' + so + '. ', b: true, mau: MAU_NHAN }]; }
  function coMa(s) { return /\\begin\{(ex|bt|vd)\}/.test(String(s || '')); }
  return { phanTich: phanTich, ve: ve, danTrang: danTrang, chuanBi: chuanBi, dauDe: dauDe, coMa: coMa, TEN: TEN };
})();
