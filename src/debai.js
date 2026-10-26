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
  function mot(kieu, s) {
    var ctx = { tikz: [] }, loiGiai = null, chon = null, tf = false, dapAn = [], traLoi = null;
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
    var doan = sangKhoi(s, ctx);
    if (chon) {
      var hinhPA = [];
      doan.push({ k: 'chon', tf: tf, nhan: chon.map(function (_, i) { return tf ? String.fromCharCode(97 + i) + ')' : String.fromCharCode(65 + i) + '.'; }),
        ds: chon.map(function (p) { return dongRuns(layTikz(p, ctx, hinhPA)); }) });
      hinhPA.forEach(function (i) { doan.push({ k: 'hinh', tz: i }); });
    }
    var lg = null;
    if (loiGiai != null || traLoi != null || dapAn.length) {
      lg = [];
      if (dapAn.length && !tf) lg.push({ k: 'p', runs: [{ t: 'Chọn ', b: true }, { t: dapAn.map(function (i) { return String.fromCharCode(65 + i); }).join(', '), b: true, mau: '#DC2626' }] });
      if (dapAn.length && tf) lg.push({ k: 'p', runs: [{ t: 'Đúng: ', b: true }, { t: dapAn.map(function (i) { return String.fromCharCode(97 + i) + ')'; }).join(', ') || '—', b: true, mau: '#DC2626' }] });
      if (traLoi != null) lg.push({ k: 'p', runs: [{ t: 'Đáp số: ', b: true }].concat(dongRuns(traLoi).map(function (r) { if (r.t != null) { r.b = true; r.mau = '#DC2626'; } return r; })) });
      if (loiGiai != null) lg = lg.concat(sangKhoi(loiGiai, ctx));
    }
    return { kieu: kieu, doan: doan, loiGiai: lg, tikz: ctx.tikz, tracNghiem: !!chon };
  }
  // tách các tikzpicture ra khỏi chuỗi, ghi chỉ số vào ds
  function layTikz(s, ctx, ds) {
    timMoiTruong(s, 'tikzpicture').reverse().forEach(function (k) {
      ds.unshift(ctx.tikz.length); ctx.tikz.push(s.slice(k.dau, k.cuoi)); s = s.slice(0, k.dau) + s.slice(k.cuoi);
    });
    return s;
  }
  // gắn "Câu 1." vào đầu đề: đoạn đầu tiên, hoặc vào phần chữ của \immini[thm] đứng đầu
  function ganDau(doan, dau) {
    var k = doan[0];
    if (k && k.k === 'p' && !k.nhan) { k.runs = dau.concat(k.runs); return; }
    if (k && k.k === 'immini' && k.thm) { ganDau(k.trai, dau); return; }
    doan.unshift({ k: 'p', runs: dau });
  }

  // ----- chữ → các khối (đoạn, công thức riêng dòng, danh sách, chia cột, chữ + hình, hình) -----
  var BO_LENH = /\\(centering|noindent|hfill|dotfill|newpage|medskip|bigskip|smallskip|indent|par(?![a-z])|break|clearpage|allowdisplaybreaks)\b/g;
  function sangKhoi(s, ctx) {
    s = s.replace(/\\(vspace|hspace)\*?\{[^}]*\}/g, ' ').replace(BO_LENH, '\n\n').replace(/\\begin\{(center|flushleft|flushright|minipage)\}(\{[^}]*\})?(\[[^\]]*\])?|\\end\{(center|flushleft|flushright|minipage)\}/g, '\n\n');
    var kq = [], re = /\\begin\{(enumerate|itemize|enumEX|listEX|multicols\*?|tikzpicture)\}|\\(immini|imminiL|impicinpar)(?![A-Za-z])/g, m, cu = 0;
    while ((m = re.exec(s))) {
      doanVanBan(s.slice(cu, m.index), kq);
      if (m[2]) {   // \immini[thm]{chữ}{hình}: chữ bên trái, hình bên phải
        var rI = docDoi(s, m.index + m[0].length, 2), tz = [];
        var phai = layTikz(rI.doi[1] || '', ctx, tz), trai = sangKhoi(rI.doi[0] || '', ctx);
        if (tz.length) kq.push({ k: 'immini', thm: /thm/.test(rI.tuyChon || ''), trai: trai, tz: tz });
        else trai.forEach(function (x) { kq.push(x); });
        if (/\S/.test(phai.replace(/\\[A-Za-z]+/g, ''))) sangKhoi(phai, ctx).forEach(function (x) { kq.push(x); });
        cu = rI.het; re.lastIndex = cu; continue;
      }
      var ten = m[1].replace('*', '\\*'), het = timHet(s, ten, m.index + m[0].length); if (het < 0) break;
      var trong = s.slice(m.index + m[0].length, het), dong = het + ('\\end{' + m[1] + '}').length;
      if (m[1] === 'tikzpicture') { kq.push({ k: 'hinh', tz: ctx.tikz.length }); ctx.tikz.push(s.slice(m.index, dong)); }
      else if (/^multicols/.test(m[1])) chiaCot(trong, ctx, kq);
      else {
        var tc = '', t2 = trong.replace(/^\s*\{[^}]*\}/, '');
        t2 = t2.replace(/^\s*\[([^\]]*)\]/, function (_, x) { tc = x; return ''; });
        danhSach(m[1], tc, t2, kq, ctx);
      }
      cu = dong; re.lastIndex = cu;
    }
    doanVanBan(s.slice(cu), kq);
    return kq;
  }
  // \begin{multicols}{n} … \end{multicols}: chia nội dung thành n cột (theo \columnbreak, hoặc chia đều các mục)
  function chiaCot(trong, ctx, kq) {
    var n = 2; trong = trong.replace(/^\s*\{(\d+)\}/, function (_, x) { n = Math.max(1, Math.min(6, +x)); return ''; }).replace(/^\s*\[[^\]]*\]/, '');
    var phan = trong.split(/\\columnbreak\b/), cot;
    if (phan.length > 1) cot = phan.map(function (p) { return sangKhoi(p, ctx); });
    else {
      var ds = sangKhoi(trong, ctx), cum = [];   // mỗi mục danh sách (đoạn có nhãn) cùng các khối theo sau là một cụm
      ds.forEach(function (k) { if (!cum.length || k.nhan || (k.k !== 'p' && k.k !== 'm')) cum.push([k]); else cum[cum.length - 1].push(k); });
      var moi = Math.ceil(cum.length / n); cot = [];
      for (var i = 0; i < n; i++) cot.push([].concat.apply([], cum.slice(i * moi, (i + 1) * moi)));
    }
    kq.push({ k: 'cot', so: n, ds: cot });
  }
  function timHet(s, ten, tu) {   // \end{ten} khớp (cho phép lồng)
    var sau = 1, re = new RegExp('\\\\(begin|end)\\{' + ten + '\\}', 'g'), m; re.lastIndex = tu;
    while ((m = re.exec(s))) { sau += m[1] === 'begin' ? 1 : -1; if (!sau) return m.index; }
    return -1;
  }
  function danhSach(ten, tc, s, kq, ctx) {
    var muc = s.split(/\\item\b/).slice(1), kieu = ten === 'itemize' ? 'cham' : /\\?alph|a\)|a\.|\(a\)|\[a\]/.test(tc) || ten === 'enumEX' || ten === 'listEX' ? 'chu' : /i\)|i\./.test(tc) && !/1/.test(tc) ? 'la' : 'so';
    muc.forEach(function (p, i) {
      var nhan = null;
      p = p.replace(/^\s*\[([^\]]*)\]/, function (_, x) { nhan = x; return ''; });
      if (nhan == null) nhan = kieu === 'cham' ? '•' : kieu === 'chu' ? String.fromCharCode(97 + i) + ')' : kieu === 'la' ? ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii'][i] + ')' : (i + 1) + '.';
      var con = sangKhoi(p, ctx), dau = true;
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
    var co = o.co || 26, ff = GI.vanBan.css(o.font || 'Times New Roman'), cach = co * 0.32, thutDV = co * 1.6;
    var muc = [], hinh = [];
    // xếp các khối trong cột rộng `rong`, lề trái x0, bắt đầu ở y; trả y cuối
    function xep(ds, x0, rong, y) {
      (ds || []).forEach(function (k) {
        if (k.k === 'm') { var b = anh(k.tex, co, khiXong); y += co * 0.15 + b.cao; muc.push({ k: 'mt', tex: k.tex, w: b.w, cao: b.cao, sau: b.sau, x: x0 + Math.max(0, (rong - b.w) / 2), y: y }); y += b.sau + cach + co * 0.15; return; }
        if (k.k === 'hinh') {   // hình TikZ riêng dòng: giữ chỗ ở giữa cột
          var kt = k.kt || { w: 0, h: 0 }; if (!kt.h) return;
          hinh.push({ tz: k.tz, x: x0 + Math.max(0, (rong - kt.w) / 2), y: y + co * 0.2, w: kt.w, h: kt.h }); y += kt.h + co * 0.4 + cach; return;
        }
        if (k.k === 'immini') {   // chữ bên trái, hình bên phải (cùng hàng)
          var kt2 = k.kt || { w: 0, h: 0 }, wH = Math.min(kt2.w, rong * 0.5), wChu = kt2.w ? rong - wH - co : rong;
          var yChu = xep(k.trai, x0, wChu, y);
          if (kt2.h) hinh.push({ tz: k.tz, x: x0 + rong - wH, y: y, w: wH, h: kt2.h });
          y = Math.max(yChu, y + kt2.h + cach); return;
        }
        if (k.k === 'cot') {   // multicols: các cột cạnh nhau
          var soC = Math.max(1, k.so || k.ds.length), wC = rong / soC, yMax = y;
          k.ds.forEach(function (dsC, ic) { yMax = Math.max(yMax, xep(dsC, x0 + ic * wC, wC - co * 0.6, y)); });
          y = yMax; return;
        }
        if (k.k === 'chon') {
          var n = k.ds.length, nhanW = 0, tuNhien = [];
          c.font = fontR({ b: true }, co, ff); k.nhan.forEach(function (t) { nhanW = Math.max(nhanW, c.measureText(t + ' ').width); });
          k.ds.forEach(function (runs) { var hh = chiaHang(c, runs, 1e9, co, ff, khiXong); tuNhien.push(hh[0].w); });
          var lon = Math.max.apply(null, tuNhien.concat([0])) + nhanW + co, soCot = k.tf ? 1 : lon <= rong / 4 ? Math.min(4, n) : lon <= rong / 2 ? 2 : 1, wCot = rong / soCot;
          for (var i = 0; i < n; i += soCot) {
            var hangCot = [];
            for (var j = i; j < Math.min(n, i + soCot); j++) hangCot.push(chiaHang(c, k.ds[j], wCot - nhanW - co * 0.6, co, ff, khiXong));
            var caoDau = 0; hangCot.forEach(function (hc) { caoDau = Math.max(caoDau, hc[0].cao); }); hangCot.forEach(function (hc) { hc[0].cao = caoDau; });   // cùng một hàng: chung đường chân chữ
            var y0 = y, yM = y;
            hangCot.forEach(function (hc, jj) {
              var yy = y0, xc = x0 + jj * wCot;
              hc.forEach(function (h, hi) { yy += h.cao; muc.push({ k: 'hang', h: h, x: xc + nhanW, y: yy }); if (hi === 0) muc.push({ k: 'nhan', t: k.nhan[i + jj], x: xc, y: yy, mau: MAU_NHAN }); yy += h.sau + cach; });
              yM = Math.max(yM, yy);
            });
            y = yM;
          }
          return;
        }
        var thut = (k.thut || 0) * thutDV, nhanW2 = 0, nhan = k.nhan;
        if (nhan && nhan.length) { c.font = fontR({ b: true }, co, ff); nhanW2 = nhan.reduce(function (s2, r) { return s2 + (r.t != null ? c.measureText(r.t).width : anh(r.m, co, khiXong).w); }, 0) + co * 0.4; }
        var hangP = chiaHang(c, k.runs || [], rong - thut - nhanW2, co, ff, khiXong), dau = true;
        hangP.forEach(function (h) {
          y += h.cao; muc.push({ k: 'hang', h: h, x: x0 + thut + nhanW2, y: y });
          if (dau && nhan && nhan.length) muc.push({ k: 'nhanRuns', runs: nhan, x: x0 + thut, y: y }); dau = false;
          y += h.sau + cach;
        });
      });
      return y;
    }
    var rong = o.rong || 900, y = xep(o.doan, 0, rong, 0);
    return { muc: muc, hinh: hinh, cao: Math.max(y - cach, co), rong: rong, co: co, ff: ff };
  }
  // các hình TikZ của đề: [{ tz, vai: 'immini' | 'hinh', khoi }] để app dựng hình và ghi kích thước vào khoi.kt
  function cacHinh(doan) {
    var ds = [];
    (function di(arr) { (arr || []).forEach(function (k) {
      if (k.k === 'hinh') ds.push({ tz: [k.tz], vai: 'hinh', khoi: k });
      else if (k.k === 'immini') { ds.push({ tz: k.tz, vai: 'immini', khoi: k }); di(k.trai); }
      else if (k.k === 'cot') k.ds.forEach(di);
    }); })(doan);
    return ds;
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
    function di(doan) { (doan || []).forEach(function (k) { if (k.k === 'm') tex.push(k.tex); else if (k.k === 'chon') k.ds.forEach(lay); else if (k.k === 'immini') di(k.trai); else if (k.k === 'cot') k.ds.forEach(di); else { lay(k.runs); lay(k.nhan); } }); }
    dsDoan.forEach(di);
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
  return { phanTich: phanTich, ve: ve, danTrang: danTrang, chuanBi: chuanBi, dauDe: dauDe, ganDau: ganDau, cacHinh: cacHinh, coMa: coMa, TEN: TEN };
})();
