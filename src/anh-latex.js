// Ảnh → LaTeX (chỉ bản máy tính): gửi ảnh / trang PDF đề Toán cho AI, nhận mã LaTeX chuẩn theo bộ quy tắc
// "chuẩn hoá LaTeX Toán" (ex, bt, vd, choice, loigiai, TikZ thuần), kèm lời giải và ghi chú kiểm tra số liệu.
// Bộ quy tắc: tải bản mới nhất từ GitHub (tiến trình chính), không có mạng thì dùng bản đóng gói src/quytac.
var GI = window.GI || (window.GI = {});
GI.anhLatex = (function () {
  var MT = window.mayTinh || null;
  var dsAnh = [], pdfCho = null, quyTac = null, dangChay = 0, ketQua = { ma: '', ghiChu: '' }, hop = null, cfg = {};
  function $(s) { return hop.querySelector(s); }
  function thoat(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function tb(s, loi) { var e = $('#al-tb'); e.textContent = s || ''; e.className = 'al-tb' + (loi ? ' loi' : ''); }

  // ---------- ảnh đầu vào ----------
  function thuNho(url, max) {
    return new Promise(function (ok) {
      var im = new Image();
      im.onload = function () {
        var k = Math.min(1, max / Math.max(im.naturalWidth, im.naturalHeight));
        if (k >= 1 && url.length < 2.5e6) return ok(url);
        var c = document.createElement('canvas'); c.width = Math.round(im.naturalWidth * k); c.height = Math.round(im.naturalHeight * k);
        var x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.drawImage(im, 0, 0, c.width, c.height); ok(c.toDataURL('image/jpeg', 0.9));
      };
      im.onerror = function () { ok(null); }; im.src = url;
    });
  }
  function themAnh(url, ten) {
    if (dsAnh.length >= 12) return tb('Mỗi lần gửi tối đa 12 ảnh / trang.', true);
    return thuNho(url, 2000).then(function (u) { if (!u) return tb('Không đọc được ảnh ' + (ten || ''), true); dsAnh.push({ url: u, ten: ten || 'Ảnh ' + (dsAnh.length + 1) }); veDs(); tb(''); });
  }
  function veDs() {
    var d = $('#al-ds');
    d.innerHTML = dsAnh.map(function (a, i) { return '<figure><img src="' + a.url + '" alt=""><figcaption>' + thoat(a.ten) + '</figcaption><button data-xoa="' + i + '" title="Bỏ ảnh này">×</button></figure>'; }).join('');
    $('#al-tha').classList.toggle('co-anh', dsAnh.length > 0);
    $('#al-chay').disabled = !dsAnh.length;
  }
  function docTep(f) {
    if (/pdf$/i.test(f.type) || /\.pdf$/i.test(f.name)) return f.arrayBuffer().then(function (b) { return moPdf(new Uint8Array(b), f.name); });
    if (!/^image\//.test(f.type)) return tb(f.name + ': chỉ nhận ảnh hoặc PDF', true);
    return new Promise(function (ok) { var fr = new FileReader(); fr.onload = function () { ok(themAnh(fr.result, f.name)); }; fr.readAsDataURL(f); });
  }
  function moPdf(du, ten) {
    if (!window.pdfjsLib) return tb('Thiếu bộ đọc PDF', true);
    tb('Đang mở ' + ten + '…');
    return window.pdfjsLib.getDocument({ data: du, isEvalSupported: false, standardFontDataUrl: 'thu-vien/standard_fonts/' }).promise.then(function (doc) {
      pdfCho = { doc: doc, ten: ten };
      $('#al-pdf').classList.remove('an'); $('#al-pdf-ten').textContent = ten + ' (' + doc.numPages + ' trang)';
      $('#al-trang').value = doc.numPages <= 4 ? '1-' + doc.numPages : '1-4'; tb('Chọn các trang cần chuyển rồi bấm "Lấy trang".');
    }, function () { tb('Không mở được tệp PDF ' + ten, true); });
  }
  function docKhoang(t, n) {   // "1-3, 5" → [1,2,3,5]
    var ra = [];
    String(t || '').split(/[,;\s]+/).forEach(function (p) {
      var m = p.match(/^(\d+)(?:-(\d+))?$/); if (!m) return;
      for (var i = +m[1]; i <= Math.min(n, +(m[2] || m[1])); i++) if (i >= 1 && ra.indexOf(i) < 0) ra.push(i);
    });
    return ra;
  }
  function layTrang() {
    if (!pdfCho) return; var doc = pdfCho.doc, ds = docKhoang($('#al-trang').value, doc.numPages);
    if (!ds.length) return tb('Ghi số trang, ví dụ 1-3 hoặc 2, 4', true);
    var p = Promise.resolve();
    ds.forEach(function (so) {
      p = p.then(function () {
        tb('Đang lấy trang ' + so + '…');
        return doc.getPage(so).then(function (pg) {
          var v0 = pg.getViewport({ scale: 1 }), k = Math.min(3, 1800 / Math.max(v0.width, v0.height)), v = pg.getViewport({ scale: k });
          var c = document.createElement('canvas'); c.width = Math.round(v.width); c.height = Math.round(v.height);
          var x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height);
          return pg.render({ canvasContext: x, viewport: v }).promise.then(function () { return themAnh(c.toDataURL('image/jpeg', 0.9), pdfCho.ten.replace(/\.pdf$/i, '') + ' · tr.' + so); });
        });
      });
    });
    p.then(function () { $('#al-pdf').classList.add('an'); pdfCho = null; tb(''); });
  }

  // ---------- gọi AI ----------
  function layQuyTac() {
    if (quyTac) return Promise.resolve(quyTac);
    if (!MT || !MT.quyTacLatex) return Promise.reject(new Error('Tính năng này chỉ có trong app GeoInk trên máy tính.'));
    return MT.quyTacLatex().then(function (r) { if (!r || !r.ma) throw new Error('Không nạp được bộ quy tắc chuẩn hoá.'); quyTac = r; return r; });
  }
  function nhiemVu() {
    var lg = $('#al-lg').checked, kt = $('#al-kt').checked, dang = $('#al-dang').value, them = $('#al-them').value.trim();
    var v = ['Nhiệm vụ với ' + dsAnh.length + ' ảnh đề đính kèm (theo đúng thứ tự):',
      '1. Chuyển TOÀN BỘ nội dung đề trong ảnh thành mã LaTeX chuẩn theo bộ quy tắc (môi trường ex / bt / vd, \\choice, \\choiceTF, \\shortans, công thức, bảng, hình TikZ thuần). Bỏ nguồn đề, số thứ tự câu gốc, tên trường, điểm số.',
      lg ? '2. Viết lời giải đầy đủ trong \\loigiai{...} cho MỌI câu / bài theo mẫu lời giải; câu trắc nghiệm đánh dấu \\True đúng phương án.' : '2. KHÔNG viết lời giải; nếu ảnh có sẵn lời giải thì chép lại vào \\loigiai{...}, không thì bỏ trống phần này.',
      kt ? '3. Kiểm tra tính hợp lí của số liệu, logic, dữ kiện thiếu, thông tin thực tế; thế ngược nghiệm vào mọi dữ kiện. Ghi kết quả kiểm tra NGOÀI code block.' : '3. Không cần ghi nhận xét kiểm tra số liệu.'];
    if (dang === 'ex') v.push('Trình bày tất cả thành câu trắc nghiệm môi trường ex.');
    else if (dang === 'bt') v.push('Trình bày tất cả thành bài tự luận môi trường bt.');
    else if (dang === 'vd') v.push('Trình bày tất cả thành ví dụ môi trường vd.');
    else v.push('Giữ dạng câu như đề gốc: câu có phương án thành ex, bài tự luận thành bt.');
    if (them) v.push('Yêu cầu thêm của giáo viên: ' + them);
    return v.join('\n');
  }
  var DAU_RA = '\n\n---\n\n# Cách trả lời trong phần mềm GeoInk (bắt buộc)\n' +
    '- Đầu vào là ảnh chụp / ảnh scan / trang PDF đề Toán của giáo viên. Đọc kĩ từng ảnh; chép đúng, không bỏ sót, không bịa thêm câu.\n' +
    '- Trả về đúng MỘT code block ```latex chứa toàn bộ các môi trường ex / bt / vd nối tiếp nhau; không có \\documentclass, preamble hay \\begin{document}.\n' +
    '- Hình vẽ trong ảnh: vẽ lại bằng TikZ thuần theo mục "Vẽ hình TikZ" và đặt đúng vị trí quy định.\n' +
    '- Ngoài code block chỉ viết các ý ngắn, mỗi ý một dòng bắt đầu bằng "- ": chỗ trong ảnh không đọc rõ, chỗ đã sửa, cảnh báo số liệu / logic cần giáo viên quyết định. Không có gì thì ghi "- Không phát hiện vấn đề."';
  function tachKetQua(t) {
    t = String(t || ''); var m = t.match(/```(?:latex|tex)?\s*\n([\s\S]*?)```/i);
    if (!m) { var a = t.search(/\\begin\{(ex|bt|vd)\}/); return a < 0 ? { ma: '', ghiChu: t.trim() } : { ma: t.slice(a).trim(), ghiChu: t.slice(0, a).trim() }; }
    var ma = m[1].trim(), gc = (t.slice(0, m.index) + '\n' + t.slice(m.index + m[0].length)).replace(/```[\s\S]*?```/g, '').trim();
    var them = t.slice(m.index + m[0].length).match(/```(?:latex|tex)?\s*\n([\s\S]*?)```/gi);   // AI tách nhiều khối → gộp
    if (them) them.forEach(function (k) { ma += '\n\n' + k.replace(/^```(?:latex|tex)?\s*\n/i, '').replace(/```$/, '').trim(); });
    return { ma: ma, ghiChu: gc };
  }
  function chay() {
    if (!dsAnh.length) return tb('Hãy thêm ảnh đề trước.', true);
    if (!GI.ai.coMoHinh()) { tb('Chưa cài AI: nhập khoá API và chọn mô hình.', true); return GI.ai.moCaiDat(); }
    var lan = ++dangChay, bd = Date.now(), cat = false;
    hop.classList.add('dang-ai'); $('#al-chay').disabled = true;
    var dem = setInterval(function () { if (lan === dangChay) tb('AI đang đọc ' + dsAnh.length + ' ảnh và viết LaTeX… ' + Math.round((Date.now() - bd) / 1000) + ' giây'); }, 1000);
    tb('Đang nạp bộ quy tắc…');
    layQuyTac().then(function (qt) {
      var he = 'Bạn là trợ lí biên soạn tài liệu Toán THCS – THPT cho giáo viên Việt Nam, làm việc bên trong phần mềm bảng giảng dạy GeoInk. ' +
        'Tuân thủ TUYỆT ĐỐI bộ quy tắc "Chuẩn hóa LaTeX Toán" dưới đây (phiên bản ' + qt.phienBan + ').\n\n' + qt.ma + DAU_RA;
      return GI.ai.hoi({ heThong: he, chu: nhiemVu(), anh: dsAnh.map(function (a) { return a.url; }), toiDa: 32000, khiCat: function () { cat = true; } });
    }).then(function (t) {
      if (lan !== dangChay) return;
      var kq = tachKetQua(t); if (!kq.ma) throw new Error('AI không trả về mã LaTeX. ' + (kq.ghiChu ? kq.ghiChu.slice(0, 200) : ''));
      ketQua = kq; $('#al-ma').value = kq.ma; veGhiChu(); xem(); chonTab(cat ? 'gc' : 'xem');
      var so = (kq.ma.match(/\\begin\{(ex|bt|vd)\}/g) || []).length;
      tb('Xong sau ' + Math.round((Date.now() - bd) / 1000) + ' giây: ' + so + ' câu / bài.' + (cat ? ' Trả lời bị cắt vì quá dài — hãy gửi ít ảnh hơn mỗi lần.' : ' Kiểm tra lại trước khi dùng.'), cat);
    }).catch(function (e) { if (lan === dangChay) tb('Chưa chuyển được: ' + (e && e.message || e), true); })
      .then(function () { clearInterval(dem); if (lan === dangChay) { hop.classList.remove('dang-ai'); $('#al-chay').disabled = !dsAnh.length; } });
  }
  function veGhiChu() {
    var d = ketQua.ghiChu.split('\n').map(function (x) { return x.trim(); }).filter(Boolean);
    $('#al-gc').innerHTML = d.length ? '<ul>' + d.map(function (x) { return '<li>' + xemDong(x.replace(/^[-*•]\s*/, '').replace(/\*\*(.+?)\*\*/g, '$1')) + '</li>'; }).join('') + '</ul>' : '<p class="al-rong">Không có ghi chú.</p>';
    $('#al-so-gc').textContent = d.length ? d.length : '';
  }

  // ---------- xem trước gần giống bản in ----------
  function khop(s, i) { var sau = 0; for (var j = i; j < s.length; j++) { var c = s.charAt(j); if (c === '\\') { j++; continue; } if (c === '{') sau++; else if (c === '}') { sau--; if (!sau) return j; } } return -1; }
  function nhom(s, i) { while (/\s/.test(s.charAt(i))) i++; if (s.charAt(i) !== '{') return null; var j = khop(s, i); return j < 0 ? null : { t: s.slice(i + 1, j), het: j + 1 }; }
  function cacNhom(s, i, n) { var ra = []; for (var k = 0; k < n; k++) { var g = nhom(s, i); if (!g) break; ra.push(g.t); i = g.het; } return { ds: ra, het: i }; }
  function lenh(s, ten, f) {   // thay \ten{..} (số nhóm tuỳ f.length - 1)
    var re = new RegExp('\\\\' + ten + '(?![A-Za-z])', 'g'), m, ra = '', cu = 0;
    while ((m = re.exec(s))) { var g = cacNhom(s, m.index + m[0].length, f.length); if (g.ds.length < f.length) continue; ra += s.slice(cu, m.index) + f.apply(null, g.ds); cu = g.het; re.lastIndex = g.het; }
    return ra + s.slice(cu);
  }
  var CT = [];
  function boToan(s) {   // tách công thức ra chỗ giữ §n§ để xử lý chữ không đụng tới
    return s.replace(/\\begin\{(align\*?|gather\*?|equation\*?|eqnarray\*?)\}[\s\S]*?\\end\{\1\}|\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\]|\$(?:\\.|[^$])+?\$|\\\([\s\S]+?\\\)/g, function (m) {
      var lon = !/^\$[^$]|^\\\(/.test(m), t = m;
      if (/^\$\$/.test(t)) t = t.slice(2, -2); else if (/^\\\[|^\\\(/.test(t)) t = t.slice(2, -2); else if (/^\$/.test(t)) t = t.slice(1, -1);
      else t = t.replace(/^\\begin\{(\w+)\*?\}/, '\\begin{aligned}').replace(/\\end\{\w+\*?\}$/, '\\end{aligned}').replace(/\\begin\{aligned\}([\s\S]*)\\end\{aligned\}/, function (x, n) { return /&/.test(n) ? x : '\\begin{gathered}' + n + '\\end{gathered}'; });
      CT.push({ t: t, lon: lon }); return '§' + (CT.length - 1) + '§';
    });
  }
  function svgToan(c) {
    var tex = GI.deBai && GI.deBai.chuanTex ? GI.deBai.chuanTex(c.t) : c.t;
    try { var n = window.MathJax.tex2svg(tex, { display: c.lon }); var s = n.querySelector('svg'); if (s && !n.querySelector('[data-mjx-error]')) return c.lon ? '<div class="al-ct-lon">' + s.outerHTML + '</div>' : s.outerHTML; } catch (e) { }
    return '<code class="al-loi-ct">' + thoat(c.t) + '</code>';
  }
  function traToan(s) { return s.replace(/§(\d+)§/g, function (m, i) { return svgToan(CT[+i]); }); }
  function xemDong(s) { CT = []; return traToan(chu(thoat(boToan(s)))); }
  function moiTruong(s, ten, f) {
    var re = new RegExp('\\\\begin\\{' + ten + '\\}'), m, lan = 0;
    while ((m = re.exec(s)) && lan++ < 200) {
      var a = m.index, sau = 1, j = a + m[0].length, reK = new RegExp('\\\\(begin|end)\\{' + ten + '\\}', 'g'), k; reK.lastIndex = j;
      while ((k = reK.exec(s))) { sau += k[1] === 'begin' ? 1 : -1; if (!sau) break; }
      if (!k) break;
      var trong = s.slice(j, k.index), tc = ''; var mt = trong.match(/^\s*\[([^\]]*)\]/); if (mt) { tc = mt[1]; trong = trong.slice(mt[0].length); }
      s = s.slice(0, a) + f(trong, tc) + s.slice(k.index + k[0].length);
    }
    return s;
  }
  function danhSach(trong, so) {
    var it = trong.split(/\\item\b/).slice(1), nhan = function (i) { return so ? String.fromCharCode(97 + i) + ')' : '•'; };
    return '<div class="al-ds-y">' + it.map(function (x, i) { var m = x.match(/^\s*\[([^\]]*)\]/), n = m ? m[1] : nhan(i); if (m) x = x.slice(m[0].length); return '<div class="al-y"><b>' + n + '</b><div>' + x.trim() + '</div></div>'; }).join('') + '</div>';
  }
  function bang(trong) {
    trong = trong.replace(/^\s*\{[^{}]*(\{[^{}]*\}[^{}]*)*\}/, '');
    var hang = trong.split(/\\\\(?:\[[^\]]*\])?/).map(function (h) { return h.replace(/\\(hline|cline\{[^}]*\})/g, '').trim(); }).filter(Boolean);
    return '<table class="al-bang">' + hang.map(function (h) {
      return '<tr>' + h.split('&').map(function (o) { var mc = o.match(/\\multicolumn\{(\d+)\}\{[^}]*\}\{([\s\S]*)\}\s*$/); return mc ? '<td colspan="' + mc[1] + '">' + mc[2] + '</td>' : '<td>' + o.trim() + '</td>'; }).join('') + '</tr>';
    }).join('') + '</table>';
  }
  function chu(s) {   // phần chữ (đã thoát HTML, công thức đã tách)
    s = moiTruong(s, 'tikzpicture', function () { return '<div class="al-hinh">Hình vẽ TikZ — dựng thành hình khi đưa lên bảng (xem ở thẻ "Mã LaTeX")</div>'; });
    s = moiTruong(s, 'center', function (t) { return '<div class="al-giua">' + t + '</div>'; });
    s = moiTruong(s, 'tabular', bang);
    s = moiTruong(s, 'enumerate', function (t) { return danhSach(t, true); });
    s = moiTruong(s, 'itemize', function (t) { return danhSach(t, false); });
    s = moiTruong(s, 'multicols', function (t) { return '<div class="al-cot">' + t.replace(/^\s*\{\d+\}/, '') + '</div>'; });
    s = lenh(s, 'immini', function (a, b) { return '<div class="al-immini"><div>' + a + '</div><div>' + b + '</div></div>'; });
    s = lenh(s, 'textbf', function (a) { return '<b>' + a + '</b>'; });
    s = lenh(s, 'textit', function (a) { return '<i>' + a + '</i>'; });
    s = lenh(s, 'emph', function (a) { return '<i>' + a + '</i>'; });
    s = lenh(s, 'underline', function (a) { return '<u>' + a + '</u>'; });
    s = lenh(s, 'text', function (a) { return a; });
    s = s.replace(/\\(hfill|centering|noindent|medskip|bigskip|smallskip|par|newline)\b\s*/g, function (m, t) { return t === 'par' || t === 'newline' ? '<br>' : ' '; })
      .replace(/\\\\(\[[^\]]*\])?/g, '<br>').replace(/\\%/g, '%').replace(/~/g, '&nbsp;').replace(/\\,/g, ' ').replace(/\n\s*\n/g, '<p></p>');
    return s;
  }
  function phuongAn(ds, tf) {
    return '<div class="al-pa' + (tf ? ' tf' : '') + '">' + ds.map(function (p, i) {
      var dung = /\\True\b/.test(p); p = p.replace(/\\True\b\s*/g, '');
      return '<div class="' + (dung ? 'dung' : '') + '"><b>' + (tf ? String.fromCharCode(97 + i) + ')' : String.fromCharCode(65 + i) + '.') + '</b> ' + traToan(chu(p)) + (tf ? '<span class="al-ds-tf">' + (dung ? 'Đ' : 'S') + '</span>' : '') + '</div>';
    }).join('') + '</div>';
  }
  function xem() {
    var ma = $('#al-ma').value.replace(/(^|[^\\])%.*$/gm, '$1'), dem = { ex: 0, bt: 0, vd: 0 }, TEN = { ex: 'Câu', bt: 'Bài', vd: 'Ví dụ' }, html = '';
    var re = /\\begin\{(ex|bt|vd)\}([\s\S]*?)\\end\{\1\}/g, m;
    while ((m = re.exec(ma))) {
      CT = [];
      var k = m[1], t = boToan(m[2]), lg = '', pa = '';
      t = thoat(t);
      t = lenh(t, 'loigiai', function (a) { lg = a; return ''; });
      t = lenh(t, 'choiceTF', function (a, b, c, d) { pa = phuongAn([a, b, c, d], true); return ''; });
      t = lenh(t, 'choice', function (a, b, c, d) { pa = phuongAn([a, b, c, d]); return ''; });
      t = lenh(t, 'shortans', function (a) { pa = '<div class="al-tln">Đáp án: ' + traToan(chu(a)) + '</div>'; return ''; });
      t = t.replace(/\\(choiceTF|choice)\b(\[[^\]]*\])?/g, '');
      html += '<section class="al-cau"><div class="al-noi"><b class="al-nhan">' + TEN[k] + ' ' + (++dem[k]) + '.</b> ' + traToan(chu(t)) + '</div>' + pa +
        (lg ? '<details class="al-lg" open><summary>Lời giải</summary><div>' + traToan(chu(lg)) + '</div></details>' : '') + '</section>';
    }
    $('#al-xem').innerHTML = html || '<p class="al-rong">Chưa có câu / bài nào (\\begin{ex}, \\begin{bt}, \\begin{vd}).</p>';
  }
  function chonTab(t) {
    hop.querySelectorAll('[data-tab]').forEach(function (b) { b.classList.toggle('bat', b.dataset.tab === t); });
    $('#al-xem').classList.toggle('an', t !== 'xem'); $('#al-ma').classList.toggle('an', t !== 'ma'); $('#al-gc').classList.toggle('an', t !== 'gc');
    if (t === 'xem') { var nap = GI.congThuc && GI.congThuc.napMathJax ? GI.congThuc.napMathJax() : Promise.resolve(); nap.then(xem, xem); }
  }

  // ---------- hộp thoại ----------
  function tao() {
    hop = document.createElement('div'); hop.id = 'hop-anh-latex'; hop.className = 'hop an'; hop.setAttribute('role', 'dialog');
    hop.innerHTML = '<div class="hop-noi-dung al-hop"><h2>Ảnh → LaTeX <small>bằng AI, theo quy tắc chuẩn hoá LaTeX Toán</small></h2><div class="al-khung"><div class="al-trai">' +
      '<div class="al-tha" id="al-tha"><b>Kéo thả, dán (Ctrl+V)</b> ảnh đề hoặc tệp PDF vào đây<br><button class="nut chu" id="al-chon">Chọn ảnh / PDF…</button></div>' +
      '<div class="al-pdf an" id="al-pdf"><span id="al-pdf-ten"></span><span>Trang <input id="al-trang" placeholder="1-3, 5"></span><button class="nut chu" id="al-lay">Lấy trang</button></div>' +
      '<div class="al-ds" id="al-ds"></div>' +
      '<div class="al-tuy"><label><input type="checkbox" id="al-lg" checked> Viết lời giải (\\loigiai)</label><label><input type="checkbox" id="al-kt" checked> Kiểm tra số liệu, logic</label>' +
      '<label>Dạng câu <select id="al-dang"><option value="">Giữ như đề gốc</option><option value="ex">Trắc nghiệm (ex)</option><option value="bt">Tự luận (bt)</option><option value="vd">Ví dụ (vd)</option></select></label>' +
      '<textarea id="al-them" rows="2" placeholder="Yêu cầu thêm (không bắt buộc), ví dụ: chỉ lấy câu 3 đến câu 5"></textarea></div>' +
      '<div class="al-mh"><span id="al-mh"></span><button class="nut chu" id="al-cd">Đổi</button></div>' +
      '<button class="nut chu chinh al-chay" id="al-chay" disabled>Chuyển sang LaTeX</button><div class="al-tb" id="al-tb"></div>' +
      '<p class="al-luu-y">Mỗi lần chuyển gửi kèm toàn bộ quy tắc (khoảng 30 nghìn token) và các ảnh, tính vào khoá API của thầy cô.</p></div>' +
      '<div class="al-phai"><div class="al-tab"><button data-tab="xem" class="bat">Xem trước</button><button data-tab="ma">Mã LaTeX</button><button data-tab="gc">Ghi chú kiểm tra <b id="al-so-gc"></b></button></div>' +
      '<div class="al-xem" id="al-xem"><p class="al-rong">Kết quả sẽ hiện ở đây.</p></div><textarea class="al-ma an" id="al-ma" spellcheck="false" placeholder="Mã LaTeX (sửa được)"></textarea><div class="al-gc an" id="al-gc"></div></div></div>' +
      '<div class="hanh-dong"><button class="nut chu" id="al-dong">Đóng</button><button class="nut chu" id="al-chep">Sao chép mã</button><button class="nut chu" id="al-luu">Lưu .tex</button><button class="nut chu chinh" id="al-bang">Đưa lên bảng</button></div></div>';
    document.body.appendChild(hop);
    if (GI.latexGo) GI.latexGo.ganO($('#al-ma'));
    $('#al-dong').onclick = function () { hop.classList.add('an'); };
    hop.addEventListener('pointerdown', function (e) { if (e.target === hop) hop.classList.add('an'); });
    $('#al-chon').onclick = function () {
      var inp = document.createElement('input'); inp.type = 'file'; inp.multiple = true; inp.accept = 'image/*,.pdf,application/pdf';
      inp.onchange = function () { Array.prototype.reduce.call(inp.files, function (p, f) { return p.then(function () { return docTep(f); }); }, Promise.resolve()); };
      inp.click();
    };
    $('#al-lay').onclick = layTrang;
    $('#al-ds').onclick = function (e) { var b = e.target.closest('[data-xoa]'); if (b) { dsAnh.splice(+b.dataset.xoa, 1); veDs(); } };
    ['dragover', 'drop'].forEach(function (ev) {
      hop.addEventListener(ev, function (e) {
        e.preventDefault(); e.stopPropagation();
        if (ev === 'drop') Array.prototype.reduce.call(e.dataTransfer.files || [], function (p, f) { return p.then(function () { return docTep(f); }); }, Promise.resolve());
      });
    });
    hop.addEventListener('paste', function (e) {
      var it = Array.prototype.filter.call((e.clipboardData && e.clipboardData.items) || [], function (x) { return x.kind === 'file'; });
      if (!it.length) return; e.preventDefault(); e.stopPropagation(); it.forEach(function (x) { docTep(x.getAsFile()); });
    });
    $('#al-chay').onclick = chay;
    $('#al-cd').onclick = function () { GI.ai.moCaiDat(); };
    hop.querySelector('.al-tab').onclick = function (e) { var b = e.target.closest('[data-tab]'); if (b) chonTab(b.dataset.tab); };
    $('#al-chep').onclick = function () {
      var ma = $('#al-ma').value; if (!ma.trim()) return tb('Chưa có mã để sao chép.', true);
      (navigator.clipboard ? navigator.clipboard.writeText(ma) : Promise.reject()).then(function () { tb('Đã sao chép mã LaTeX.'); }, function () { $('#al-ma').select(); document.execCommand('copy'); tb('Đã sao chép mã LaTeX.'); });
    };
    $('#al-luu').onclick = function () {
      var ma = $('#al-ma').value; if (!ma.trim()) return tb('Chưa có mã để lưu.', true);
      if (!MT || !MT.luuChu) return tb('Lưu tệp chỉ có trong app.', true);
      MT.luuChu(ma + '\n', 'de-chuan-hoa.tex', 'Tệp LaTeX').then(function (r) { if (r && r.ten) tb('Đã lưu ' + r.ten); else if (r && r.loi) tb('Không lưu được: ' + r.loi, true); });
    };
    $('#al-bang').onclick = function () {
      var ma = $('#al-ma').value; if (!ma.trim()) return tb('Chưa có mã để đưa lên bảng.', true);
      var loi = cfg.duaLenBang && cfg.duaLenBang(ma); if (loi) return tb(String(loi).replace(/<[^>]+>/g, ' '), true);
      hop.classList.add('an');
    };
  }
  function mo(o) {
    cfg = o || cfg; if (!hop) tao();
    $('#al-mh').textContent = GI.ai.coMoHinh() ? 'AI: ' + GI.ai.moTa() : 'Chưa cài AI (khoá API, mô hình)';
    hop.classList.remove('an'); veDs();
  }
  function dangMo() { return !!hop && !hop.classList.contains('an'); }
  return { mo: mo, dangMo: dangMo, themAnh: themAnh, tachKetQua: tachKetQua };
})();
