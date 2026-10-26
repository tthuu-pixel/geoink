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
      doan.push({ k: 'chon', tf: tf, dung: dapAn, nhan: chon.map(function (_, i) { return tf ? String.fromCharCode(97 + i) : String.fromCharCode(65 + i); }),
        ds: chon.map(function (p) { return dongRuns(layTikz(p, ctx, hinhPA)); }) });
      hinhPA.forEach(function (i) { doan.push({ k: 'hinh', tz: i }); });
    }
    if (traLoi != null) doan.push({ k: 'traLoi' });
    var lg = null;
    if (loiGiai != null || traLoi != null || dapAn.length) {
      lg = [];
      if (dapAn.length && !tf) lg.push({ k: 'p', runs: [{ t: 'Chọn ', b: true }, { t: dapAn.map(function (i) { return String.fromCharCode(65 + i); }).join(', '), b: true, mau: '#DC2626' }] });
      if (dapAn.length && tf) lg.push({ k: 'p', runs: [{ t: 'Đúng: ', b: true }, { t: dapAn.map(function (i) { return String.fromCharCode(97 + i) + ')'; }).join(', ') || '—', b: true, mau: '#DC2626' }] });
      if (traLoi != null) lg.push({ k: 'p', runs: [{ t: 'Đáp số: ', b: true }].concat(dongRuns(traLoi).map(function (r) { if (r.t != null) { r.b = true; r.mau = '#DC2626'; } return r; })) });
      if (loiGiai != null) lg = lg.concat(sangKhoi(loiGiai, ctx));
    }
    var tn = !!chon || traLoi != null;
    return { kieu: kieu, dang: tn ? 'tn' : 'tl', nhanDe: kieu === 'vd' ? 'Ví dụ' : tn ? 'Câu' : 'Bài', loaiCau: tf ? 'Đúng – Sai' : chon ? 'Trắc nghiệm' : traLoi != null ? 'Trả lời ngắn' : kieu === 'vd' ? 'Ví dụ' : 'Tự luận',
      doan: doan, loiGiai: lg, tikz: ctx.tikz };
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
    var kq = [], re = /\\begin\{(enumerate|itemize|enumEX|listEX|multicols\*?|tikzpicture|tabular\*?|tabularx)\}|\\(immini|imminiL|impicinpar)(?![A-Za-z])/g, m, cu = 0;
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
      else if (/^tabular/.test(m[1])) kq.push(bangLatex(trong, m[1]));
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
  // tách chuỗi theo dấu phân cách ở mức ngoài cùng (ngoài { } và ngoài $ … $)
  function tachTang(s, sep) {
    var ra = [], hien = '', sau = 0, mt = false;
    for (var i = 0; i < s.length; i++) {
      var ch = s.charAt(i);
      if (ch === '\\' && s.slice(i, i + sep.length) !== sep) { hien += ch + s.charAt(i + 1); i++; continue; }
      if (ch === '$') mt = !mt; else if (ch === '{') sau++; else if (ch === '}') sau--;
      if (!mt && !sau && s.slice(i, i + sep.length) === sep) { ra.push(hien); hien = ''; i += sep.length - 1; continue; }
      hien += ch;
    }
    ra.push(hien); return ra;
  }
  // \begin{tabular}{|l|c|c|} … \end{tabular} → bảng
  function bangLatex(trong, ten) {
    if (ten === 'tabularx' || ten === 'tabular*') trong = trong.replace(/^\s*\{[^}]*\}/, '');
    trong = trong.replace(/^\s*\[[^\]]*\]/, '');
    var rS = docDoi(trong, 0, 1), spec = (rS.doi[0] || '').replace(/[@!<>]\{[^}]*\}/g, ''), than = trong.slice(rS.het), canh = [];
    for (var i = 0; i < spec.length; i++) {
      var ch = spec.charAt(i);
      if ('lcr'.indexOf(ch) >= 0) canh.push(ch);
      else if ('pmbX'.indexOf(ch) >= 0) { canh.push('l'); if (spec.charAt(i + 1) === '{') i = khop(spec, i + 1); }
      else if (ch === '*') { var r = docDoi(spec, i + 1, 2), n = +r.doi[0] || 1; for (var k = 0; k < n; k++) (r.doi[1] || '').replace(/[lcr]/g, function (x) { canh.push(x); }); i = r.het - 1; }
    }
    var hang = [], luoi = /\|/.test(spec) || /\\hline/.test(than);
    tachTang(than, '\\\\').forEach(function (r) {
      var tren = false;
      r = r.replace(/^\s*((\\hline|\\cline\{[^}]*\}|\\toprule|\\midrule|\\bottomrule)\s*)+/, function (x) { tren = true; return ''; }).replace(/^\s*\[[^\]]*\]/, '');
      if (!/\S/.test(r)) { if (tren && hang.length) hang[hang.length - 1].duoi = true; return; }
      var o = tachTang(r, '&').map(function (x) {
        var mm = /\\multicolumn\b/.exec(x);
        if (mm) { var rr = docDoi(x, mm.index + mm[0].length, 3); return { span: +rr.doi[0] || 1, canh: ((rr.doi[1] || '').match(/[lcr]/) || ['c'])[0], runs: dongRuns(rr.doi[2] || '') }; }
        return { span: 1, runs: dongRuns(x.replace(/\\(hline|centering)\b/g, '')) };
      });
      hang.push({ o: o, tren: tren });
    });
    if (!canh.length) canh = (hang[0] ? hang[0].o : []).map(function () { return 'c'; });
    return { k: 'bang', canh: canh, hang: hang, luoi: luoi };
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
  // ===== Khung đề (thẻ): trắc nghiệm = "Câu" tông tím, tự luận = "Bài" tông xanh; lời giải nằm trong khung =====
  var TONG = {
    tn: { vien: '#7C3AED', nenDau: '#EDE9FE', chuDau: '#4C1D95', nhan: '#7C3AED', nenHang: '#F3F2F8', the: '#DDD6FE' },
    tl: { vien: '#0E7490', nenDau: '#CFFAFE', chuDau: '#134E4A', nhan: '#0E7490', nenHang: '#EEF6F8', the: '#A5F3FC' },
  };
  var MAU_CHU = '#1F2937', MAU_LG = '#15803D', MAU_DUNG = '#16A34A', MAU_SAI = '#DC2626';
  function tongCua(o) { return TONG[o.dang === 'tn' ? 'tn' : 'tl']; }
  function danTrang(c, o, khiXong) {
    var khoa = [o.rong, o.co, !!o.moLG, o.dang].join('|');
    if (o._L && o._Lk === khoa) return o._L;
    var co = o.co || 26, ff = GI.vanBan.css(o.font || 'Times New Roman'), cach = co * 0.32, thutDV = co * 1.6, T = tongCua(o);
    var muc = [], nen = [], hinh = [], chua = false;
    function hang(runs, rong) { var h = chiaHang(c, runs, rong, co, ff, khiXong); if (h.chua) chua = true; return h; }
    function chuRuns(hh, x, y0) {   // đặt các hàng chữ từ y0, trả y cuối
      var y = y0; hh.forEach(function (h) { y += h.cao; muc.push({ k: 'hang', h: h, x: x, y: y }); y += h.sau + cach; }); return y;
    }
    function xep(ds, x0, rong, y) {
      (ds || []).forEach(function (k) {
        if (k.k === 'm') { var b = anh(k.tex, co, khiXong); if (b.chua) chua = true; y += co * 0.15 + b.cao; muc.push({ k: 'mt', tex: k.tex, w: b.w, cao: b.cao, sau: b.sau, x: x0 + Math.max(0, (rong - b.w) / 2), y: y }); y += b.sau + cach + co * 0.15; return; }
        if (k.k === 'hinh') {
          var kt = k.kt || { w: 0, h: 0 }; if (!kt.h) return;
          hinh.push({ tz: k.tz, x: x0 + Math.max(0, (rong - kt.w) / 2), y: y + co * 0.2, w: kt.w, h: kt.h }); y += kt.h + co * 0.4 + cach; return;
        }
        if (k.k === 'immini') {
          var kt2 = k.kt || { w: 0, h: 0 }, wH = Math.min(kt2.w, rong * 0.5), wChu = kt2.w ? rong - wH - co : rong;
          var yChu = xep(k.trai, x0, wChu, y);
          if (kt2.h) hinh.push({ tz: k.tz, x: x0 + rong - wH, y: y, w: wH, h: kt2.h });
          y = Math.max(yChu, y + kt2.h + cach); return;
        }
        if (k.k === 'cot') {
          var soC = Math.max(1, k.so || k.ds.length), wC = rong / soC, yMax = y;
          k.ds.forEach(function (dsC, ic) { yMax = Math.max(yMax, xep(dsC, x0 + ic * wC, wC - co * 0.6, y)); });
          y = yMax; return;
        }
        if (k.k === 'chon' && k.tf) { y = bangDS(k, x0, rong, y); return; }
        if (k.k === 'chon') {   // phương án A B C D: nhãn tròn, tự chia 4 / 2 / 1 cột
          var n = k.ds.length, R = co * 0.52, nhanW = R * 2 + co * 0.45, tuNhien = [];
          k.ds.forEach(function (runs) { tuNhien.push(hang(runs, 1e9)[0].w); });
          var lon = Math.max.apply(null, tuNhien.concat([0])) + nhanW + co, soCot = lon <= rong / 4 ? Math.min(4, n) : lon <= rong / 2 ? 2 : 1, wCot = rong / soCot;
          y += co * 0.15;
          for (var i = 0; i < n; i += soCot) {
            var hc = [];
            for (var j = i; j < Math.min(n, i + soCot); j++) hc.push(hang(k.ds[j], wCot - nhanW - co * 0.6));
            var caoDau = 0; hc.forEach(function (x) { caoDau = Math.max(caoDau, x[0].cao); }); hc.forEach(function (x) { x[0].cao = caoDau; });
            var y0 = y, yM = y;
            hc.forEach(function (x, jj) {
              var xc = x0 + jj * wCot, yy = chuRuns(x, xc + nhanW, y0);
              muc.push({ k: 'huy', x: xc + R, y: y0 + x[0].cao - co * 0.3, r: R, t: k.nhan[i + jj], mau: T.nhan, dung: (k.dung || []).indexOf(i + jj) >= 0 });
              yM = Math.max(yM, yy);
            });
            y = yM + co * 0.1;
          }
          return;
        }
        if (k.k === 'traLoi') {   // ô trả lời ngắn
          y += co * 1.25; muc.push({ k: 'chu', t: 'Trả lời:', b: true, x: x0, y: y, mau: T.chuDau });
          c.font = fontR({ b: true }, co, ff); var wt = c.measureText('Trả lời: ').width;
          nen.push({ k: 'o', x: x0 + wt, y: y - co * 1.05, w: co * 9, h: co * 1.5, r: co * 0.35, vien: T.vien, mau: '#FFFFFF' });
          y += co * 0.55 + cach; return;
        }
        if (k.k === 'bang') { y = veBang(k, x0, rong, y); return; }
        var thut = (k.thut || 0) * thutDV, nhanW2 = 0, nhan = k.nhan;
        if (nhan && nhan.length) { c.font = fontR({ b: true }, co, ff); nhanW2 = nhan.reduce(function (s2, r) { return s2 + (r.t != null ? c.measureText(r.t).width : anh(r.m, co, khiXong).w); }, 0) + co * 0.4; }
        var hangP = hang(k.runs || [], rong - thut - nhanW2), dau = true;
        hangP.forEach(function (h) {
          y += h.cao; muc.push({ k: 'hang', h: h, x: x0 + thut + nhanW2, y: y });
          if (dau && nhan && nhan.length) muc.push({ k: 'nhanRuns', runs: nhan, x: x0 + thut, y: y, mau: T.nhan }); dau = false;
          y += h.sau + cach;
        });
      });
      return y;
    }
    // bảng Mệnh đề | Đúng | Sai
    function bangDS(k, x0, rong, y) {
      var wO = co * 3.4, R = co * 0.52, wNhan = R * 2 + co * 0.7, wMD = rong - 2 * wO - co * 0.4, hDau = co * 1.6, g = co * 0.3;
      y += co * 0.25;
      nen.push({ k: 'o', x: x0, y: y, w: wMD, h: hDau, r: co * 0.45, mau: T.vien });
      nen.push({ k: 'o', x: x0 + wMD + co * 0.2, y: y, w: wO, h: hDau, r: co * 0.45, mau: T.vien });
      nen.push({ k: 'o', x: x0 + wMD + wO + co * 0.4, y: y, w: wO, h: hDau, r: co * 0.45, mau: T.vien });
      muc.push({ k: 'chuGiua', t: 'Mệnh đề', x: x0 + wMD / 2, y: y + hDau / 2, mau: '#FFFFFF' }, { k: 'chuGiua', t: 'Đúng', x: x0 + wMD + co * 0.2 + wO / 2, y: y + hDau / 2, mau: '#FFFFFF' }, { k: 'chuGiua', t: 'Sai', x: x0 + wMD + wO * 1.5 + co * 0.4, y: y + hDau / 2, mau: '#FFFFFF' });
      y += hDau + g;
      k.ds.forEach(function (runs, i) {
        var hh = hang(runs, rong - wNhan - 2 * wO - co * 0.8), pad = co * 0.42, cao = hh.reduce(function (s2, h) { return s2 + h.cao + h.sau; }, 0) + cach * (hh.length - 1) + 2 * pad;
        nen.push({ k: 'o', x: x0, y: y, w: rong, h: cao, r: co * 0.4, mau: T.nenHang });
        chuRuns(hh, x0 + wNhan, y + pad);
        var giua = y + cao / 2, dung = (k.dung || []).indexOf(i) >= 0;
        muc.push({ k: 'huy', x: x0 + co * 0.25 + R, y: giua, r: R, t: k.nhan[i], mau: T.nhan, dot: true });
        muc.push({ k: 'oTron', x: x0 + wMD + co * 0.2 + wO / 2, y: giua, r: co * 0.48, mau: T.vien, to: dung ? MAU_DUNG : null });
        muc.push({ k: 'oTron', x: x0 + wMD + wO * 1.5 + co * 0.4, y: giua, r: co * 0.48, mau: T.vien, to: dung ? null : MAU_SAI });
        y += cao + g;
      });
      return y + co * 0.1;
    }
    // bảng tabular
    function veBang(k, x0, rong, y) {
      var nC = k.canh.length || 1, pad = co * 0.45, padD = co * 0.22, wTN = [];
      for (var i = 0; i < nC; i++) wTN.push(co);
      k.hang.forEach(function (h) { var ci = 0; h.o.forEach(function (o) { if (o.span === 1 && ci < nC) wTN[ci] = Math.max(wTN[ci], hang(o.runs, 1e9)[0].w + 2 * pad); ci += o.span; }); });
      var tong = wTN.reduce(function (a, b) { return a + b; }, 0), heSo = tong > rong ? rong / tong : 1, w = wTN.map(function (x) { return x * heSo; }), rongB = tong * heSo, xB = x0 + (rong - rongB) / 2;
      var xs = [xB]; w.forEach(function (x) { xs.push(xs[xs.length - 1] + x); });
      y += co * 0.3; var yDau = y, ys = [y];
      k.hang.forEach(function (h) {
        var ci = 0, oH = [];
        h.o.forEach(function (o) { var c1 = Math.min(nC, ci + o.span); var wO2 = xs[c1] - xs[Math.min(ci, nC)]; oH.push({ o: o, ci: ci, x: xs[Math.min(ci, nC)], w: wO2, hh: hang(o.runs, Math.max(co, wO2 - 2 * pad + co * 0.2)) }); ci += o.span; });
        var cao = 0; oH.forEach(function (x) { x.cao = x.hh.reduce(function (s2, hq) { return s2 + hq.cao + hq.sau; }, 0) + cach * (x.hh.length - 1); cao = Math.max(cao, x.cao); });
        cao += 2 * padD;
        oH.forEach(function (x) {
          var cn = x.o.span > 1 ? x.o.canh : k.canh[x.ci] || 'c', yy = y + padD + (cao - 2 * padD - x.cao) / 2;
          x.hh.forEach(function (hq) { yy += hq.cao; var xx = cn === 'c' ? x.x + (x.w - hq.w) / 2 : cn === 'r' ? x.x + x.w - pad - hq.w : x.x + pad; muc.push({ k: 'hang', h: hq, x: xx, y: yy }); yy += hq.sau + cach; });
        });
        y += cao; ys.push(y);
      });
      if (k.luoi) {
        ys.forEach(function (yy) { muc.push({ k: 'ke', x1: xB, y1: yy, x2: xB + rongB, y2: yy }); });
        // kẻ dọc từng hàng (bỏ qua chỗ ô gộp)
        k.hang.forEach(function (h, hi) { var ci = 0, cot = [0]; h.o.forEach(function (o) { ci += o.span; cot.push(Math.min(ci, nC)); }); if (ci < nC) cot.push(nC); cot.forEach(function (cc) { muc.push({ k: 'ke', x1: xs[cc], y1: ys[hi], x2: xs[cc], y2: ys[hi + 1] }); }); });
      }
      void yDau; return y + co * 0.35;
    }
    var P = co * 0.8, HB = co * 1.85, rong = o.rong || 900, y;
    nen.push({ k: 'the', x: 0, y: 0, w: rong, r: co * 0.6 });
    muc.push({ k: 'dau', t: (o.nhanDe || TEN[o.kieu] || 'Câu') + (o.so ? ' ' + o.so : ''), x: P, y: HB / 2, mau: T.chuDau });
    if (o.loaiCau) muc.push({ k: 'theLoai', t: o.loaiCau, x: rong - P, y: HB / 2, mau: T.chuDau, nen: T.the });
    y = xep(o.doan, P, rong - 2 * P, HB + P * 0.55);
    var vungLG = null;
    if (o.loiGiai) {
      y += P * 0.2; muc.push({ k: 'ke', x1: P, y1: y, x2: rong - P, y2: y, mau: '#E5E7EB' }); y += P * 0.55;
      if (!o.moLG) {
        vungLG = { x: P, y: y, w: rong - 2 * P, h: co * 1.6 };
        nen.push({ k: 'o', x: P, y: y, w: rong - 2 * P, h: co * 1.6, r: co * 0.4, mau: '#F0FDF4', vien: '#86EFAC', net: true });
        muc.push({ k: 'chuGiua', t: 'Lời giải · bấm đúp để xem', x: rong / 2, y: y + co * 0.8, mau: MAU_LG, nho: true });
        y += co * 1.6;
      } else {
        vungLG = { x: P, y: y, w: rong - 2 * P, h: co * 1.3 };
        muc.push({ k: 'chu', t: 'Lời giải', b: true, x: P, y: y + co * 0.95, mau: MAU_LG });
        muc.push({ k: 'chu', t: 'bấm đúp để ẩn', x: P + co * 4.6, y: y + co * 0.95, mau: '#86A397', nho: true });
        y = xep(o.loiGiai, P, rong - 2 * P, y + co * 1.55);
      }
    }
    var cao = y + P * 0.8;
    nen[0].h = cao;
    var L = { muc: muc, nen: nen, hinh: hinh, cao: cao, rong: rong, co: co, ff: ff, HB: HB, T: T, vungLG: vungLG };
    if (!chua) { o._L = L; o._Lk = khoa; }
    return L;
  }
  // các hình TikZ: [{ tz, vai, khoi, lg }] để app dựng hình và ghi kích thước vào khoi.kt
  function cacHinh(doan, lg) {
    var ds = [];
    (function di(arr) { (arr || []).forEach(function (k) {
      if (k.k === 'hinh') ds.push({ tz: [k.tz], vai: 'hinh', khoi: k, lg: !!lg });
      else if (k.k === 'immini') { ds.push({ tz: k.tz, vai: 'immini', khoi: k, lg: !!lg }); di(k.trai); }
      else if (k.k === 'cot') k.ds.forEach(di);
    }); })(doan);
    return ds;
  }
  function boTron(c, x, y, w, h, r) { r = Math.min(r, h / 2, w / 2); c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
  // lớp nền (vẽ trước hình TikZ): thẻ, dải tiêu đề, nền hàng, ô
  function veNen(c, o, khiXong) {
    var L = danTrang(c, o, khiXong), T = L.T, ox = o.x, oy = o.y;
    c.save(); c.setLineDash([]);
    L.nen.forEach(function (n) {
      if (n.k === 'the') {
        c.save(); c.shadowColor = 'rgba(15,23,42,.10)'; c.shadowBlur = 14; c.shadowOffsetY = 4;
        boTron(c, ox, oy, n.w, n.h, n.r); c.fillStyle = '#FFFFFF'; c.fill(); c.restore();
        c.save(); boTron(c, ox, oy, n.w, n.h, n.r); c.clip(); c.fillStyle = T.nenDau; c.fillRect(ox, oy, n.w, L.HB); c.restore();
        c.strokeStyle = T.vien; c.lineWidth = Math.max(2, L.co / 11); boTron(c, ox, oy, n.w, n.h, n.r); c.stroke();
        c.beginPath(); c.moveTo(ox, oy + L.HB); c.lineTo(ox + n.w, oy + L.HB); c.lineWidth = 1; c.stroke();
        return;
      }
      boTron(c, ox + n.x, oy + n.y, n.w, n.h, n.r); c.fillStyle = n.mau; c.fill();
      if (n.vien) { c.strokeStyle = n.vien; c.lineWidth = 1.4; if (n.net) c.setLineDash([6, 4]); c.stroke(); c.setLineDash([]); }
    });
    c.restore();
  }
  function ve(c, o, mauMD, khiXong) {
    var L = danTrang(c, o, khiXong), mau = MAU_CHU, co = L.co, ox = o.x, oy = o.y;
    c.save(); c.textBaseline = 'alphabetic'; c.setLineDash([]);
    function veTu(w, x, yNen) {
      if (w.m != null) { var a = GI.congThuc.anh(w.m, null, false, khiXong); if (a) GI.congThuc.ve(c, { x: x, y: yNen - w.cao, latex: w.m, co: co }, mau, khiXong); return; }
      var r = w.r; c.font = fontR(r, co, L.ff); c.fillStyle = r.mau || mau; c.fillText(w.t, x, yNen);
      if (r.u) { c.strokeStyle = r.mau || mau; c.lineWidth = Math.max(1, co / 16); c.beginPath(); c.moveTo(x, yNen + co * 0.12); c.lineTo(x + w.w, yNen + co * 0.12); c.stroke(); }
    }
    L.muc.forEach(function (m) {
      if (m.k === 'hang') { var x = ox + m.x; m.h.ds.forEach(function (w) { veTu(w, x, oy + m.y); x += w.w; }); }
      else if (m.k === 'mt') GI.congThuc.ve(c, { x: ox + m.x, y: oy + m.y - m.cao, latex: m.tex, co: co }, mau, khiXong);
      else if (m.k === 'nhanRuns') {
        var xN = ox + m.x;
        m.runs.forEach(function (r) {
          if (r.m != null) { var b = anh(r.m, co, khiXong); if (b.a) GI.congThuc.ve(c, { x: xN, y: oy + m.y - b.cao, latex: r.m, co: co }, mau, khiXong); xN += b.w; return; }
          c.font = fontR(r, co, L.ff); c.fillStyle = r.mau || m.mau; c.fillText(r.t, xN, oy + m.y); xN += c.measureText(r.t).width;
        });
      }
      else if (m.k === 'dau') { c.font = '700 ' + (co * 1.05) + 'px ' + L.ff; c.fillStyle = m.mau; c.textBaseline = 'middle'; c.fillText(m.t, ox + m.x, oy + m.y + co * 0.04); c.textBaseline = 'alphabetic'; }
      else if (m.k === 'theLoai') {
        c.font = '600 ' + (co * 0.62) + 'px Arial, sans-serif'; var wT = c.measureText(m.t).width + co * 0.9, hT = co * 1.05;
        boTron(c, ox + m.x - wT, oy + m.y - hT / 2, wT, hT, hT / 2); c.fillStyle = '#FFFFFF'; c.fill(); c.strokeStyle = m.nen; c.lineWidth = 1.2; c.stroke();
        c.fillStyle = m.mau; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(m.t, ox + m.x - wT / 2, oy + m.y + 1); c.textAlign = 'left'; c.textBaseline = 'alphabetic';
      }
      else if (m.k === 'chu') { c.font = (m.b ? '700 ' : '400 ') + (m.nho ? co * 0.72 : co) + 'px ' + (m.nho ? 'Arial, sans-serif' : L.ff); c.fillStyle = m.mau || mau; c.fillText(m.t, ox + m.x, oy + m.y); }
      else if (m.k === 'chuGiua') { c.font = (m.nho ? '600 ' + co * 0.66 + 'px Arial, sans-serif' : '700 ' + co * 0.92 + 'px ' + L.ff); c.fillStyle = m.mau; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(m.t, ox + m.x, oy + m.y + 1); c.textAlign = 'left'; c.textBaseline = 'alphabetic'; }
      else if (m.k === 'huy') {   // nhãn tròn A, B, … / a, b, …; lúc mở lời giải: đáp án đúng tô xanh
        var dung = !m.dot && m.dung && o.moLG;
        c.beginPath(); c.arc(ox + m.x, oy + m.y, m.r, 0, Math.PI * 2); c.fillStyle = dung ? MAU_DUNG : m.mau; c.fill();
        c.font = '700 ' + (co * 0.66) + 'px Arial, sans-serif'; c.fillStyle = '#FFFFFF'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(m.t, ox + m.x, oy + m.y + 1); c.textAlign = 'left'; c.textBaseline = 'alphabetic';
      }
      else if (m.k === 'oTron') {
        c.beginPath(); c.arc(ox + m.x, oy + m.y, m.r, 0, Math.PI * 2); c.fillStyle = '#FFFFFF'; c.fill(); c.strokeStyle = m.mau; c.lineWidth = Math.max(1.5, co / 16); c.stroke();
        if (m.to && o.moLG) { c.beginPath(); c.arc(ox + m.x, oy + m.y, m.r * 0.62, 0, Math.PI * 2); c.fillStyle = m.to; c.fill(); }
      }
      else if (m.k === 'ke') { c.beginPath(); c.moveTo(ox + m.x1, oy + m.y1); c.lineTo(ox + m.x2, oy + m.y2); c.strokeStyle = m.mau || '#334155'; c.lineWidth = m.mau ? 1.2 : Math.max(1, co / 22); c.stroke(); }
    });
    c.restore();
    return { x0: ox, y0: oy, x1: ox + L.rong, y1: oy + L.cao };
  }
  // chờ MathJax dựng xong mọi công thức của các khối (để đo chiều cao đúng trước khi xếp lên bảng)
  function chuanBi(dsDoan) {
    var tex = [];
    function lay(runs) { (runs || []).forEach(function (r) { if (r.m != null) tex.push(r.m); }); }
    function di(doan) { (doan || []).forEach(function (k) { if (k.k === 'm') tex.push(k.tex); else if (k.k === 'chon') k.ds.forEach(lay); else if (k.k === 'immini') di(k.trai); else if (k.k === 'cot') k.ds.forEach(di); else if (k.k === 'bang') k.hang.forEach(function (h) { h.o.forEach(function (x) { lay(x.runs); }); }); else { lay(k.runs); lay(k.nhan); } }); }
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
  return { phanTich: phanTich, ve: ve, veNen: veNen, danTrang: danTrang, chuanBi: chuanBi, dauDe: dauDe, ganDau: ganDau, cacHinh: cacHinh, coMa: coMa, TEN: TEN };
})();
