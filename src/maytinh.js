// Máy tính khoa học (bố cục kiểu fx-880BTG, phần dùng cho THCS):
// Tính toán · Thống kê · Bảng giá trị · Phương trình (hệ, đa thức) · Bất phương trình.
window.GI = window.GI || {};
GI.mayTinh = (function () {
  var L = GI.mtLoi, el = null, mf = null, man = null, tt = null;
  var st = { cheDo: 'tinh', goc: 'D', shift: false, alpha: false, sto: false, ans: 0, bien: { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, x: 0, y: 0, M: 0 }, kq: null, dang: 'chinh', vuaTinh: false, loi: '' };
  var TEN_CHE_DO = { tinh: 'Tính toán', tk: 'Thống kê', bang: 'Bảng', pt: 'Phương trình', bpt: 'Bất phương trình' };

  // ---------- phím ----------
  //   [mã, nhãn, nhãn SHIFT, nhãn ALPHA, kiểu]  kiểu: 'cn' (chức năng), 'so', 'xoa', 'bang'
  var PHIM_TREN = [
    [['shift', 'SHIFT', '', '', 'shift'], ['alpha', 'ALPHA', '', '', 'alpha'], ['trai', '◀', '', '', 'dh'], ['len', '▲', '', '', 'dh'], ['xuong', '▼', '', '', 'dh'], ['phai', '▶', '', '', 'dh']],
    [['menu', 'MENU', '', '', 'cn2'], ['setup', 'SETUP', '', '', 'cn2'], ['x', '<i>x</i>', '', '<i>y</i>', 'cn'], ['frac', '<span class="mt-ps">▫<br>▫</span>', '', '', 'cn'], ['sqrt', '√▫', '∛▫', '', 'cn'], ['sq', '<i>x</i>²', '<i>x</i>³', '', 'cn']],
    [['pow', '<i>x</i><sup>▫</sup>', '<sup>▫</sup>√▫', '', 'cn'], ['log', 'log<sub>▫</sub>', '10<sup>▫</sup>', '', 'cn'], ['ln', 'ln', '<i>e</i><sup>▫</sup>', '', 'cn'], ['am', '(−)', '', 'A', 'cn'], ['dms', '° ′ ″', '', 'B', 'cn'], ['inv', '<i>x</i>⁻¹', '<i>x</i>!', 'C', 'cn']],
    [['sin', 'sin', 'sin⁻¹', 'D', 'cn'], ['cos', 'cos', 'cos⁻¹', 'E', 'cn'], ['tan', 'tan', 'tan⁻¹', 'F', 'cn'], ['sto', 'STO', '', '', 'cn'], ['sd', 'S⇔D', '', '', 'cn'], ['abs', '|<i>x</i>|', '', '', 'cn']],
    [['mo', '(', '', '', 'cn'], ['dong', ')', '', '', 'cn'], ['pt', '%', '', '', 'cn'], ['ncr', '<i>n</i>C<i>r</i>', '<i>n</i>P<i>r</i>', '', 'cn'], ['mcong', 'M+', 'M−', 'M', 'cn'], ['ans2', 'Ans', '', '', 'cn']],
  ];
  var PHIM_SO = [
    [['7', '7'], ['8', '8'], ['9', '9'], ['del', 'DEL', '', '', 'xoa'], ['ac', 'AC', '', '', 'xoa']],
    [['4', '4'], ['5', '5'], ['6', '6'], ['nhan', '×'], ['chia', '÷']],
    [['1', '1'], ['2', '2'], ['3', '3'], ['cong', '+'], ['tru', '−']],
    [['0', '0'], ['cham', '.'], ['e10', '×10<sup><i>x</i></sup>', 'π', '<i>e</i>'], ['ans', 'Ans'], ['bang', '=', '', '', 'bang']],
  ];
  // LaTeX chèn vào ô nhập (#0: chỗ đặt con trỏ)
  var CHEN = {
    x: 'x', frac: '\\frac{#0}{#?}', sqrt: '\\sqrt{#0}', sq: '^{2}', pow: '^{#0}', log: '\\log_{#0}\\left(#?\\right)', ln: '\\ln\\left(#0\\right)', am: '-', inv: '^{-1}',
    sin: '\\sin\\left(#0\\right)', cos: '\\cos\\left(#0\\right)', tan: '\\tan\\left(#0\\right)', abs: '\\left|#0\\right|', mo: '\\left(', dong: '\\right)', pt: '\\%', ncr: '\\operatorname{C}',
    ans: '\\mathrm{Ans}', ans2: '\\mathrm{Ans}', cham: '.', e10: '\\times10^{#0}', nhan: '\\times', chia: '\\div', cong: '+', tru: '-', dms: '^{\\circ}',
    's:sqrt': '\\sqrt[3]{#0}', 's:sq': '^{3}', 's:pow': '\\sqrt[#0]{#?}', 's:log': '10^{#0}', 's:ln': 'e^{#0}', 's:inv': '!', 's:sin': '\\sin^{-1}\\left(#0\\right)', 's:cos': '\\cos^{-1}\\left(#0\\right)', 's:tan': '\\tan^{-1}\\left(#0\\right)',
    's:ncr': '\\operatorname{P}', 's:e10': '\\pi', 'a:e10': 'e', 'a:x': 'y', 'a:am': 'A', 'a:dms': 'B', 'a:inv': 'C', 'a:sin': 'D', 'a:cos': 'E', 'a:tan': 'F', 'a:mcong': 'M',
  };
  for (var so = 0; so <= 9; so++) CHEN[String(so)] = String(so);
  var LA_TOAN_TU = { sq: 1, pow: 1, inv: 1, nhan: 1, chia: 1, cong: 1, tru: 1, pt: 1, ncr: 1, 's:sq': 1, 's:inv': 1, 's:ncr': 1 };

  function htmlPhim(p, nho) {
    var kieu = p[4] || 'so';
    return '<button class="mt-k mt-' + kieu + (nho ? ' nho' : '') + '" data-k="' + p[0] + '">' +
      (p[2] ? '<span class="mt-s">' + p[2] + '</span>' : '') + (p[3] ? '<span class="mt-a">' + p[3] + '</span>' : '') + '<b>' + p[1] + '</b></button>';
  }
  function tao() {
    el = document.createElement('div'); el.id = 'may-tinh'; el.className = 'an';
    el.innerHTML = '<div class="mt-dau"><span class="mt-ten">MÁY TÍNH KHOA HỌC</span><span class="mt-phu">CHẾ ĐỘ THCS</span><button class="mt-dong" title="Đóng">×</button></div>' +
      '<div class="mt-lcd"><div class="mt-tt"></div><div class="mt-man"></div></div>' +
      '<div class="mt-ban-tren">' + PHIM_TREN.map(function (h) { return h.map(function (p) { return htmlPhim(p, true); }).join(''); }).join('') + '</div>' +
      '<div class="mt-ban-so">' + PHIM_SO.map(function (h) { return h.map(function (p) { return htmlPhim(p, false); }).join(''); }).join('') + '</div>';
    document.body.appendChild(el);
    tt = el.querySelector('.mt-tt'); man = el.querySelector('.mt-man');
    el.querySelectorAll('[data-k]').forEach(function (b) { b.addEventListener('mousedown', function (e) { e.preventDefault(); }); b.onclick = function () { nhan(b.dataset.k); }; });
    el.querySelector('.mt-dong').onclick = dong;
    // kéo máy tính
    var dau = el.querySelector('.mt-dau'), keo = null;
    dau.addEventListener('pointerdown', function (e) { if (e.target.closest('button')) return; var r = el.getBoundingClientRect(); keo = { dx: e.clientX - r.left, dy: e.clientY - r.top }; dau.setPointerCapture(e.pointerId); });
    dau.addEventListener('pointermove', function (e) { if (!keo) return; el.style.left = Math.max(0, Math.min(window.innerWidth - 80, e.clientX - keo.dx)) + 'px'; el.style.top = Math.max(0, Math.min(window.innerHeight - 60, e.clientY - keo.dy)) + 'px'; el.style.right = 'auto'; });
    dau.addEventListener('pointerup', function () { keo = null; });
    el.addEventListener('keydown', function (e) {   // bàn phím máy tính thật
      e.stopPropagation();
      if (e.key === 'Enter') { e.preventDefault(); nhan('bang'); }
      else if (e.key === 'Escape') { e.preventDefault(); nhan('ac'); }
    });
  }
  function moi() { return new window.MathfieldElement(); }
  function taoO(cls) {
    var f = moi(); f.mathVirtualKeyboardPolicy = 'manual'; f.className = cls || 'mt-nhap'; f.smartFence = false; f.smartSuperscript = false;
    f.addEventListener('input', function () { st.loi = ''; if (st.cheDo === 'tinh' && st.vuaTinh) { st.vuaTinh = false; } veKetQua(); });
    return f;
  }
  function mo() {
    GI.congThuc.napMathLive().then(function () {
      if (!el) tao();
      el.classList.remove('an'); if (!mf) { mf = taoO(); }
      el.style.zoom = Math.min(1, Math.max(0.6, (window.innerHeight - 70) / 800));   // vừa màn hình thấp
      veMan(); setTimeout(function () { if (mf.isConnected) mf.focus(); }, 30);
    });
  }
  function dong() { if (el) el.classList.add('an'); }
  function batTat() { if (el && !el.classList.contains('an')) dong(); else mo(); }

  // ---------- trạng thái ----------
  function veTrangThai() {
    tt.innerHTML = '<span class="' + (st.shift ? 'bat' : '') + '">S</span><span class="' + (st.alpha ? 'bat' : '') + '">A</span>' + (st.sto ? '<span class="bat">STO</span>' : '') +
      '<span class="bat">' + (st.goc === 'D' ? 'D' : 'R') + '</span>' + (st.bien.M ? '<span class="bat">M</span>' : '') + '<span class="mt-cd">' + TEN_CHE_DO[st.cheDo] + '</span>';
  }
  var manHinh = 'tinh', luoi = null, dsKq = null, chonMuc = 0;
  function veMan() {
    veTrangThai(); man.innerHTML = '';
    if (manHinh === 'tinh') { man.appendChild(mf); var k = document.createElement('div'); k.className = 'mt-kq'; man.appendChild(k); veKetQua(); return; }
    if (manHinh === 'menu') {
      var M = [['tinh', '1', 'Tính toán', '<b>√</b>÷'], ['tk', '2', 'Thống kê', '<b>x̄</b>'], ['bang', '3', 'Bảng', '<b>f(x)</b>'], ['pt', '4', 'Phương trình', '<b>x=</b>'], ['bpt', '5', 'Bất phương trình', '<b>x&gt;</b>']];
      man.innerHTML = '<div class="mt-menu">' + M.map(function (m, i) { return '<div class="mt-mn' + (i === chonMuc ? ' chon' : '') + '"><span class="mt-mn-i">' + m[3] + '</span><span>' + m[1] + ': ' + m[2] + '</span></div>'; }).join('') + '</div>';
      return;
    }
    if (manHinh === 'danhSach') {   // chọn trong danh sách (loại phương trình, bậc, dấu…)
      man.innerHTML = '<div class="mt-tieu-de">' + dsChon.tieuDe + '</div><div class="mt-ds">' + dsChon.ds.map(function (d, i) { return '<div class="' + (i === chonMuc ? 'chon' : '') + '">' + (i + 1) + ': ' + d[1] + '</div>'; }).join('') + '</div>';
      return;
    }
    if (manHinh === 'luoi') { veLuoi(); return; }
    if (manHinh === 'ketQua') {
      man.innerHTML = '<div class="mt-tieu-de">' + dsKq.tieuDe + '</div><div class="mt-kq-ds"></div><div class="mt-goi-y">AC: nhập lại · ◀: sửa hệ số</div>';
      var hop = man.querySelector('.mt-kq-ds');
      dsKq.dong.forEach(function (d) {
        var r = document.createElement('div'); r.className = 'mt-kq-dong';
        if (d.html) r.innerHTML = d.html; else { var f = moi(); f.readOnly = true; f.value = d.latex; f.className = 'mt-tinh'; r.appendChild(f); }
        hop.appendChild(r);
      });
    }
  }
  function veKetQua() {
    var k = man && man.querySelector('.mt-kq'); if (!k) return;
    k.innerHTML = '';
    if (st.loi) { k.innerHTML = '<div class="mt-loi">' + st.loi + '</div>'; return; }
    if (st.kq == null || !st.vuaTinh) return;
    var h = st.dang === 'dms' ? L.doPhutGiay(st.kq) : L.hienThi(st.kq, st.dang), f = moi(); f.readOnly = true; f.value = h.latex; f.className = 'mt-tinh mt-ket'; k.appendChild(f);
  }
  function ngu() { return { goc: st.goc, bien: st.bien, ans: st.ans }; }

  // ---------- xử lí phím ----------
  function nhan(k) {
    if (k === 'shift') { st.shift = !st.shift; st.alpha = false; veTrangThai(); return; }
    if (k === 'alpha') { st.alpha = !st.alpha; st.shift = false; veTrangThai(); return; }
    var ma = st.shift ? 's:' + k : st.alpha ? 'a:' + k : k; st.shift = false; st.alpha = false;
    if (k === 'menu') { manHinh = 'menu'; chonMuc = 0; veMan(); return; }
    if (k === 'setup') { st.goc = st.goc === 'D' ? 'R' : 'D'; veTrangThai(); thongBaoNho(st.goc === 'D' ? 'Đơn vị góc: Độ (D)' : 'Đơn vị góc: Radian (R)'); return; }
    if (manHinh === 'menu') return nhanMenu(k);
    if (manHinh === 'danhSach') return nhanDanhSach(k);
    if (manHinh === 'luoi') return nhanLuoi(k, ma);
    if (manHinh === 'ketQua') { if (k === 'ac' || k === 'trai' || k === 'del') { manHinh = 'luoi'; veMan(); } else if (k === 'bang') { manHinh = 'luoi'; veMan(); } return; }
    nhanTinh(k, ma);
  }
  function chen(ma, o) {
    o = o || mf; var lx = CHEN[ma]; if (lx == null) return false;
    o.executeCommand(['insert', lx, { insertionMode: 'replaceSelection', selectionMode: 'placeholder', focus: true }]);
    return true;
  }
  function nhanTinh(k, ma) {
    if (st.sto) {   // STO rồi bấm biến: lưu Ans
      st.sto = false; var bien = (CHEN[ma] || '').replace(/\\/g, '');
      if (/^[A-FxyM]$/.test(bien)) { st.bien[bien] = st.ans; thongBaoNho('Ans → ' + bien + ' = ' + L.hienThi(st.ans).chu); }
      veTrangThai(); return;
    }
    if (k === 'sto') { st.sto = true; veTrangThai(); return; }
    if (k === 'ac') { mf.value = ''; st.kq = null; st.loi = ''; st.vuaTinh = false; veKetQua(); mf.focus(); return; }
    if (k === 'del') { mf.executeCommand('deleteBackward'); return; }
    if (k === 'trai') { mf.executeCommand('moveToPreviousChar'); return; }
    if (k === 'phai') { mf.executeCommand('moveToNextChar'); return; }
    if (k === 'len') { mf.executeCommand('moveUp'); return; }
    if (k === 'xuong') { mf.executeCommand('moveDown'); return; }
    if (k === 'bang') { tinhNgay(); return; }
    if (k === 'sd') { if (st.vuaTinh && st.kq != null) { st.dang = st.dang === 'thapPhan' ? 'chinh' : 'thapPhan'; veKetQua(); } return; }
    if (k === 'dms' && ma === 'dms' && st.vuaTinh && st.kq != null) { st.dang = st.dang === 'dms' ? 'chinh' : 'dms'; veKetQua(); return; }
    if (k === 'mcong') {
      if (ma === 'a:mcong') { chen(ma); return; }
      try { var v = mf.value ? L.tinh(mf.value, ngu()) : st.ans; st.bien.M += ma === 's:mcong' ? -v : v; st.ans = v; st.kq = v; st.vuaTinh = true; st.dang = 'chinh'; veKetQua(); thongBaoNho('M = ' + L.hienThi(st.bien.M).chu); veTrangThai(); } catch (e) { st.loi = e.message; veKetQua(); }
      return;
    }
    // sau khi bấm “=”: phép toán thì tiếp tục từ Ans, số thì bắt đầu biểu thức mới
    if (st.vuaTinh) { mf.value = LA_TOAN_TU[ma] ? '\\mathrm{Ans}' : ''; mf.executeCommand('moveToMathfieldEnd'); st.vuaTinh = false; st.dang = 'chinh'; veKetQua(); }
    chen(ma);
  }
  function tinhNgay() {
    try { var v = L.tinh(mf.value, ngu()); st.kq = v; st.ans = v; st.loi = ''; st.vuaTinh = true; st.dang = 'chinh'; }
    catch (e) { st.loi = e.mt ? e.message : 'Lỗi cú pháp'; st.vuaTinh = false; }
    veKetQua();
  }
  var thongBaoT = null;
  function thongBaoNho(s) { var d = document.createElement('div'); d.className = 'mt-tb'; d.textContent = s; man.appendChild(d); clearTimeout(thongBaoT); thongBaoT = setTimeout(function () { d.remove(); }, 1600); }

  // ---------- MENU ----------
  function nhanMenu(k) {
    var so = +k;
    if (k === 'len' || k === 'trai') { chonMuc = (chonMuc + 4) % 5; veMan(); return; }
    if (k === 'xuong' || k === 'phai') { chonMuc = (chonMuc + 1) % 5; veMan(); return; }
    if (k === 'bang') so = chonMuc + 1;
    if (k === 'ac') { manHinh = st.cheDo === 'tinh' ? 'tinh' : manHinh; batDauCheDo(st.cheDo); return; }
    if (so >= 1 && so <= 5) batDauCheDo(['tinh', 'tk', 'bang', 'pt', 'bpt'][so - 1]);
  }
  var dsChon = null;
  function hoiChon(tieuDe, ds, xong) { dsChon = { tieuDe: tieuDe, ds: ds, xong: xong }; manHinh = 'danhSach'; chonMuc = 0; veMan(); }
  function nhanDanhSach(k) {
    var n = dsChon.ds.length, so = +k;
    if (k === 'len' || k === 'trai') { chonMuc = (chonMuc + n - 1) % n; veMan(); return; }
    if (k === 'xuong' || k === 'phai') { chonMuc = (chonMuc + 1) % n; veMan(); return; }
    if (k === 'bang') so = chonMuc + 1;
    if (k === 'ac') { manHinh = 'menu'; veMan(); return; }
    if (so >= 1 && so <= n) dsChon.xong(dsChon.ds[so - 1][0]);
  }
  function batDauCheDo(cd) {
    st.cheDo = cd;
    if (cd === 'tinh') { manHinh = 'tinh'; veMan(); setTimeout(function () { mf.focus(); }, 20); return; }
    if (cd === 'pt') return hoiChon('Phương trình', [['he', 'Hệ phương trình bậc nhất'], ['dt', 'Phương trình đa thức']], function (loai) {
      if (loai === 'he') hoiChon('Số ẩn', [[2, '2 ẩn (x, y)'], [3, '3 ẩn (x, y, z)'], [4, '4 ẩn (x, y, z, t)']], function (n) { moLuoiHe(n); });
      else hoiChon('Bậc của đa thức', [[2, 'ax² + bx + c = 0'], [3, 'ax³ + bx² + cx + d = 0'], [4, 'ax⁴ + bx³ + cx² + dx + e = 0']], function (n) { moLuoiDaThuc(n, null); });
    });
    if (cd === 'bpt') return hoiChon('Bậc của bất phương trình', [[2, 'Bậc 2'], [3, 'Bậc 3'], [4, 'Bậc 4']], function (n) {
      hoiChon('Dạng bất phương trình', [['>', 'P(x) > 0'], ['<', 'P(x) < 0'], ['>=', 'P(x) ≥ 0'], ['<=', 'P(x) ≤ 0']], function (d) { moLuoiDaThuc(n, d); });
    });
    if (cd === 'bang') return moLuoiBang();
    if (cd === 'tk') return hoiChon('Thống kê', [[1, 'Một biến (x)'], [2, 'Hai biến: y = a + bx']], function (n) { moLuoiTK(n); });
  }

  // ---------- lưới nhập (hệ số, dữ liệu, bảng) ----------
  //   luoi = { tieuDe, cot: [tên], o: [[{ latex, gt }]], chon: [h, c], giai: fn, themHang (bool), nhan: [nhãn hàng], bieuThuc: {hàng,cột → nhập biểu thức chứa x} }
  function oTrong() { return { latex: '', gt: null }; }
  function moLuoiHe(n) {
    var ten = ['x', 'y', 'z', 't'].slice(0, n), o = [];
    for (var i = 0; i < n; i++) { var h = []; for (var j = 0; j <= n; j++) h.push(oTrong()); o.push(h); }
    luoi = { tieuDe: 'Hệ ' + n + ' ẩn: ' + ten.map(function (t, j) { return 'a' + (j + 1) + t; }).join(' + ') + ' = c', cot: ten.map(function (t, j) { return String.fromCharCode(97 + j); }).concat(['c']), o: o, chon: [0, 0], giai: function () { giaiHe(n); } };
    manHinh = 'luoi'; veMan();
  }
  function moLuoiDaThuc(n, dau) {
    var cot = 'abcde'.slice(0, n + 1).split(''), o = [cot.map(oTrong)];
    var dangPT = { 2: 'ax² + bx + c', 3: 'ax³ + bx² + cx + d', 4: 'ax⁴ + bx³ + cx² + dx + e' }[n];
    var kiHieu = { '>': ' > 0', '<': ' < 0', '>=': ' ≥ 0', '<=': ' ≤ 0' }[dau] || ' = 0';
    luoi = { tieuDe: dangPT + kiHieu, cot: cot, o: o, chon: [0, 0], giai: function () { if (dau) giaiBpt(dau); else giaiDaThuc(); } };
    manHinh = 'luoi'; veMan();
  }
  function moLuoiBang() {
    luoi = { tieuDe: 'Bảng giá trị', nhanHang: ['f(x) =', 'g(x) =', 'Bắt đầu', 'Kết thúc', 'Bước'], cot: [''], o: [[oTrong()], [oTrong()], [{ latex: '1', gt: 1 }], [{ latex: '5', gt: 5 }], [{ latex: '1', gt: 1 }]], chon: [0, 0], bieuThuc: { 0: 1, 1: 1 }, giai: lapBang };
    manHinh = 'luoi'; veMan();
  }
  function moLuoiTK(n) {
    luoi = { tieuDe: n === 1 ? 'Thống kê một biến' : 'Hai biến: y = a + bx', cot: n === 1 ? ['x', 'Tần số'] : ['x', 'y'], o: [n === 1 ? [oTrong(), { latex: '1', gt: 1 }] : [oTrong(), oTrong()]], chon: [0, 0], themHang: true, tk: n, giai: function () { tinhTK(n); } };
    manHinh = 'luoi'; veMan();
  }
  var oSua = null;
  function veLuoi() {
    var g = luoi, h = '<div class="mt-tieu-de">' + g.tieuDe + '</div><div class="mt-luoi-cuon"><table class="mt-luoi"><tr><th></th>' + g.cot.map(function (c) { return '<th>' + c + '</th>'; }).join('') + '</tr>';
    g.o.forEach(function (hang, i) {
      h += '<tr><th>' + (g.nhanHang ? g.nhanHang[i] : i + 1) + '</th>' + hang.map(function (o, j) { var chon = g.chon[0] === i && g.chon[1] === j; return '<td class="' + (chon ? 'chon' : '') + '">' + (o.gt == null ? (o.latex ? hienO(o) : '') : hienO(o)) + '</td>'; }).join('') + '</tr>';
    });
    h += '</table></div><div class="mt-sua"></div><div class="mt-goi-y">= : lưu ô · ◀▶▲▼: chọn ô · ô trống rồi = : ' + (g.tk || g.nhanHang ? 'tính' : 'giải') + '</div>';
    man.innerHTML = h;
    if (!oSua) oSua = taoO('mt-nhap mt-nhap-nho');
    oSua.value = ''; man.querySelector('.mt-sua').appendChild(oSua); setTimeout(function () { if (oSua.isConnected) oSua.focus(); }, 20);
    var td = man.querySelector('td.chon'); if (td) td.scrollIntoView({ block: 'nearest' });
  }
  function hienO(o) {
    if (o.gt == null) return '<span class="mt-bt">' + o.latex.replace(/\\left|\\right|\\/g, '').replace(/frac\{([^}]*)\}\{([^}]*)\}/g, '$1/$2') + '</span>';
    return L.hienThi(o.gt).chu;
  }
  function nhanLuoi(k, ma) {
    var g = luoi, i = g.chon[0], j = g.chon[1], soHang = g.o.length, soCot = g.o[0].length;
    if (k === 'ac') { if (oSua.value) { oSua.value = ''; return; } manHinh = 'menu'; veMan(); return; }
    if (k === 'del') { oSua.executeCommand('deleteBackward'); return; }
    var trong = !oSua.value;
    if (trong && (k === 'trai' || k === 'phai' || k === 'len' || k === 'xuong')) {
      if (k === 'trai') j = Math.max(0, j - 1); if (k === 'phai') j = Math.min(soCot - 1, j + 1);
      if (k === 'len') i = Math.max(0, i - 1); if (k === 'xuong') i = Math.min(soHang - 1, i + 1);
      g.chon = [i, j]; veMan(); return;
    }
    if (k === 'trai') { oSua.executeCommand('moveToPreviousChar'); return; } if (k === 'phai') { oSua.executeCommand('moveToNextChar'); return; }
    if (k === 'len') { oSua.executeCommand('moveUp'); return; } if (k === 'xuong') { oSua.executeCommand('moveDown'); return; }
    if (k === 'bang') {
      if (trong) { try { g.giai(); } catch (e) { thongBaoNho(e.mt ? e.message : 'Lỗi: ' + e.message); } return; }
      var o = g.o[i][j];
      if (g.bieuThuc && g.bieuThuc[i]) { o.latex = oSua.value; o.gt = null; }
      else { try { o.gt = L.tinh(oSua.value, ngu()); o.latex = oSua.value; } catch (e) { thongBaoNho(e.mt ? e.message : 'Lỗi cú pháp'); return; } }
      // sang ô kế tiếp
      j++; if (j >= soCot) { j = 0; i++; }
      if (i >= soHang) { if (g.themHang) { g.o.push(g.o[0].map(function (_, c) { return g.tk === 1 && c === 1 ? { latex: '1', gt: 1 } : oTrong(); })); } else { i = soHang - 1; j = soCot - 1; } }
      g.chon = [i, j]; veMan(); return;
    }
    if (k === 'sto' || k === 'sd' || k === 'mcong' || k === 'menu' || k === 'setup') return;
    chen(ma, oSua);
  }
  function giaTriLuoi() { return luoi.o.map(function (h) { return h.map(function (o) { return o.gt; }); }); }
  function ketQua(tieuDe, dong) { dsKq = { tieuDe: tieuDe, dong: dong }; manHinh = 'ketQua'; veMan(); }
  function loi(t) { var e = new Error(t); e.mt = true; throw e; }
  function giaiHe(n) {
    var A = giaTriLuoi(); if (A.some(function (h) { return h.some(function (v) { return v == null; }); })) loi('Còn hệ số chưa nhập');
    var ng = L.giaiHe(A), ten = ['x', 'y', 'z', 't'];
    if (!ng) return ketQua('Kết quả', [{ html: '<div class="mt-vo">Hệ vô nghiệm hoặc vô số nghiệm</div>' }]);
    ketQua('Nghiệm của hệ', ng.map(function (v, i) { return { latex: ten[i] + '=' + L.hienThi(v).latex }; }));
  }
  function heSoDT() {
    var he = luoi.o[0].map(function (o) { return o.gt; }); if (he.some(function (v) { return v == null; })) loi('Còn hệ số chưa nhập');
    if (Math.abs(he[0]) < 1e-15) loi('Hệ số a phải khác 0'); return he;
  }
  function giaiDaThuc() {
    var he = heSoDT(), n = he.length - 1, dong = [];
    if (n === 2) {
      var r = L.nghiemBac2(he[0], he[1], he[2]);
      if (r.kep) dong.push({ latex: 'x_1=x_2=' + r.ds[0].latex });
      else { dong.push({ latex: 'x_1=' + r.ds[0].latex }, { latex: 'x_2=' + r.ds[1].latex }); if (!r.thuc) dong.unshift({ html: '<div class="mt-vo">Không có nghiệm thực (nghiệm phức):</div>' }); }
      var xd = -he[1] / (2 * he[0]), yd = he[2] - he[1] * he[1] / (4 * he[0]);
      dong.push({ html: '<div class="mt-vo">' + (he[0] > 0 ? 'Giá trị nhỏ nhất' : 'Giá trị lớn nhất') + ' của vế trái:</div>' }, { latex: 'x=' + L.hienThi(xd).latex + '\\;\\Rightarrow\\;y_{' + (he[0] > 0 ? '\\min' : '\\max') + '}=' + L.hienThi(yd).latex });
      return ketQua('Nghiệm', dong);
    }
    var ng = L.nghiemDaThuc(he), i = 1, thuc = 0;
    ng.forEach(function (z) {
      if (Math.abs(z.im) < 1e-7) { dong.push({ latex: 'x_' + (i++) + '=' + L.hienThi(z.re).latex }); thuc++; }
      else if (z.im > 0) { var re = L.thapPhan(z.re).latex, im = L.thapPhan(z.im).latex; dong.push({ latex: 'x_' + (i++) + '=' + re + '+' + im + 'i' }, { latex: 'x_' + (i++) + '=' + re + '-' + im + 'i' }); }
    });
    if (!thuc) dong.unshift({ html: '<div class="mt-vo">Không có nghiệm thực</div>' });
    ketQua('Nghiệm', dong);
  }
  function giaiBpt(dau) {
    var he = heSoDT(), r = L.giaiBpt(he, dau), lt = dau === '>' || dau === '<' ? '<' : '\\le';
    function so(v) { return L.hienThi(v).latex; }
    if (!r.khoang.length) return ketQua('Tập nghiệm', [{ html: '<div class="mt-vo">Bất phương trình vô nghiệm</div>' }]);
    var dong = r.khoang.map(function (k) {
      if (k.diem) return { latex: 'x=' + so(k.a) };
      if (!isFinite(k.a) && !isFinite(k.b)) return { html: '<div class="mt-vo">Mọi số thực x đều là nghiệm</div>' };
      if (!isFinite(k.a)) return { latex: 'x' + lt + so(k.b) };
      if (!isFinite(k.b)) return { latex: so(k.a) + lt + 'x' };
      return { latex: so(k.a) + lt + 'x' + lt + so(k.b) };
    });
    ketQua('Tập nghiệm', dong);
  }
  function lapBang() {
    var o = luoi.o, f = o[0][0].latex, g = o[1][0].latex, a = o[2][0].gt, b = o[3][0].gt, h = o[4][0].gt;
    if (!f) loi('Hãy nhập f(x)'); if (a == null || b == null || !h) loi('Kiểm tra Bắt đầu, Kết thúc, Bước');
    var soDong = Math.floor((b - a) / h + 1e-9) + 1; if (soDong < 1) loi('Kết thúc phải lớn hơn Bắt đầu'); if (soDong > 45) loi('Bảng quá dài (tối đa 45 dòng)');
    var bt = '<table class="mt-luoi mt-bang"><tr><th>x</th><th>f(x)</th>' + (g ? '<th>g(x)</th>' : '') + '</tr>';
    for (var i = 0; i < soDong; i++) {
      var x = a + i * h, m = ngu(); m.bien = Object.assign({}, st.bien, { x: x });
      var fx, gx; try { fx = L.hienThi(L.tinh(f, m)).chu; } catch (e) { fx = 'Lỗi'; } if (g) try { gx = L.hienThi(L.tinh(g, m)).chu; } catch (e2) { gx = 'Lỗi'; }
      bt += '<tr><td>' + L.hienThi(x).chu + '</td><td>' + fx + '</td>' + (g ? '<td>' + gx + '</td>' : '') + '</tr>';
    }
    ketQua('Bảng giá trị', [{ html: '<div class="mt-luoi-cuon">' + bt + '</table></div>' }]);
  }
  function tinhTK(n) {
    var hang = luoi.o.filter(function (h) { return h[0].gt != null && (n === 1 || h[1].gt != null); });
    if (!hang.length) loi('Chưa có dữ liệu');
    var x = hang.map(function (h) { return h[0].gt; });
    function d(ten, v) { return { latex: ten + '=' + (isFinite(v) ? L.hienThi(v).latex : '\\text{—}') }; }
    if (n === 1) {
      var f = hang.map(function (h) { return h[1].gt == null ? 1 : h[1].gt; }), r = L.thongKe1(x, f);
      return ketQua('Kết quả thống kê', [d('n', r.n), d('\\overline{x}', r.tb), d('\\sum x', r.tong), d('\\sum x^2', r.tong2), d('\\sigma_x', r.sigma), d('s_x', r.s), d('\\min(x)', r.min), d('Q_1', r.q1), d('\\operatorname{Me}', r.me), d('Q_3', r.q3), d('\\max(x)', r.max)]);
    }
    var y = hang.map(function (h) { return h[1].gt; }), r2 = L.thongKe2(x, y); if (!r2) loi('Cần ít nhất 2 cặp số liệu');
    ketQua('Hồi quy y = a + bx', [d('n', r2.n), d('\\overline{x}', r2.tbx), d('\\overline{y}', r2.tby), d('a', r2.a), d('b', r2.b), d('r', r2.r)]);
  }
  return { mo: mo, dong: dong, batTat: batTat, nhan: nhan, trangThai: function () { return st; } };
})();
