// Máy tính khoa học (bố cục kiểu fx-880BTG, phần dùng cho THCS):
// Tính toán · Thống kê · Bảng giá trị · Phương trình (hệ, đa thức) · Bất phương trình.
window.GI = window.GI || {};
GI.mayTinh = (function () {
  var L = GI.mtLoi, el = null, mf = null, man = null, tt = null;
  var st = { cheDo: 'tinh', goc: 'D', shift: false, alpha: false, sto: false, ans: 0, bien: { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, x: 0, y: 0, M: 0 }, kq: null, dang: 'chinh', vuaTinh: false, loi: '' };
  var TEN_CHE_DO = { tinh: 'Tính toán', tk: 'Thống kê', bang: 'Bảng', pt: 'Phương trình', bpt: 'Bất phương trình' };

  // ---------- phím (bố cục giống máy fx-880BTG, phần dùng cho THCS) ----------
  //   [mã, nhãn, nhãn SHIFT (ghi phía trên phím), kiểu]
  var SVG = { nha: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11l8-7 8 7M6 9.5V20h12V9.5"/></svg>', caiDat: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>', quay: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M9 7L4 12l5 5M4 12h11a5 5 0 000-10h-2"/></svg>', bien: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M5 6l6 12M11 6L5 18"/><path d="M14 12h6M17.5 9.5L20 12l-2.5 2.5"/></svg>', ham: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c2 0 2-14 5-14 1 0 1.5.5 1.5.5M7 11h7"/><path d="M16 13l4 5M20 13l-4 5"/></svg>', sach: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M5 5.5A2.5 2.5 0 017.5 3H19v15H7.5A2.5 2.5 0 005 20.5zM5 20.5A2.5 2.5 0 017.5 18H19v3H7.5"/></svg>', cong: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="12" r="1.6" fill="currentColor"/><circle cx="12" cy="12" r="1.6" fill="currentColor"/><circle cx="18" cy="12" r="1.6" fill="currentColor"/></svg>', shift: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4l7 8h-4v7H9v-7H5z"/></svg>', xoaLui: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5h11v14H9l-6-7z"/><path d="M12 9l5 6M17 9l-5 6"/></svg>' };
  var HANG_CN = [
    [['shift', SVG.shift, '', 'shift'], ['var', SVG.bien, '', 'cn'], ['fn', SVG.ham, '', 'cn'], ['catalog', SVG.sach, '', 'cn'], ['tools', SVG.cong, '', 'cn']],
    [['x', '<i>x</i>', '', 'cn'], ['frac', '<svg viewBox="0 0 20 24" width="15" height="19"><rect x="4.5" y="1.5" width="11" height="7.5" rx="1.2" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M2.5 12h15" stroke="currentColor" stroke-width="1.9"/><rect x="4.5" y="15" width="11" height="7.5" rx="1.2" fill="currentColor"/></svg>', '', 'cn'], ['sqrt', '√▪', '∛▪', 'cn'], ['sq', '▪²', '▪<sup>▫</sup>', 'cn'], ['log', 'log<sub>▪</sub>▫', '10<sup>▪</sup>', 'cn']],
    [['ans', 'Ans', 'PreAns', 'cn'], ['sin', 'sin', 'sin⁻¹', 'cn'], ['cos', 'cos', 'cos⁻¹', 'cn'], ['tan', 'tan', 'tan⁻¹', 'cn'], ['mo', '(', '', 'cn'], ['dong', ')', '', 'cn']],
  ];
  var PHIM_SO = [
    [['7', '7'], ['8', '8'], ['9', '9'], ['del', SVG.xoaLui, 'INS', 'xoa'], ['ac', 'AC', '', 'xoa']],
    [['4', '4'], ['5', '5'], ['6', '6'], ['nhan', '×'], ['chia', '÷']],
    [['1', '1'], ['2', '2'], ['3', '3'], ['cong', '+'], ['tru', '−']],
    [['0', '0'], ['cham', '.'], ['e10', '×10<sup><i>x</i></sup>', 'π'], ['format', 'FORMAT', '', 'fmt'], ['bang', 'EXE', '', 'exe']],
  ];
  // LaTeX chèn vào ô nhập (#0: chỗ đặt con trỏ)
  var CHEN = {
    x: 'x', frac: '\\frac{#0}{#?}', sqrt: '\\sqrt{#0}', sq: '^{2}', pow: '^{#0}', log: '\\log_{#0}\\left(#?\\right)', ln: '\\ln\\left(#0\\right)', am: '-', inv: '^{-1}',
    sin: '\\sin\\left(#0\\right)', cos: '\\cos\\left(#0\\right)', tan: '\\tan\\left(#0\\right)', abs: '\\left|#0\\right|', mo: '\\left(', dong: '\\right)', pt: '\\%', ncr: '\\operatorname{C}',
    ans: '\\mathrm{Ans}', ans2: '\\mathrm{Ans}', cham: '.', e10: '\\times10^{#0}', nhan: '\\times', chia: '\\div', cong: '+', tru: '-', dms: '^{\\circ}',
    's:sqrt': '\\sqrt[3]{#0}', 's:sq': '^{3}', 's:pow': '\\sqrt[#0]{#?}', 's:log': '10^{#0}', 's:ln': 'e^{#0}', 's:inv': '!', 's:sin': '\\sin^{-1}\\left(#0\\right)', 's:cos': '\\cos^{-1}\\left(#0\\right)', 's:tan': '\\tan^{-1}\\left(#0\\right)',
    's:ncr': '\\operatorname{P}', 's:e10': '\\pi', 's:sq': '^{#0}', cube: '^{3}', nthRoot: '\\sqrt[#0]{#?}', exp: 'e^{#0}', fact: '!', hangE: 'e', hangPi: '\\pi', 'a:e10': 'e', 'a:x': 'y', 'a:am': 'A', 'a:dms': 'B', 'a:inv': 'C', 'a:sin': 'D', 'a:cos': 'E', 'a:tan': 'F', 'a:mcong': 'M',
  };
  for (var so = 0; so <= 9; so++) CHEN[String(so)] = String(so);
  var LA_TOAN_TU = { sq: 1, pow: 1, inv: 1, nhan: 1, chia: 1, cong: 1, tru: 1, pt: 1, ncr: 1, 's:sq': 1, 's:inv': 1, 's:ncr': 1, cube: 1, fact: 1 };

  function htmlPhim(p) {
    var kieu = p[3] || 'so';
    var tieuDe = { var: 'VARIABLE: gọi biến · SHIFT + VARIABLE: STO (lưu Ans vào biến)', fn: 'FUNCTION: các hàm', catalog: 'CATALOG: hàm và hằng số π, e', tools: 'TOOLS: M+, M−, xoá bộ nhớ, S⇔D', format: 'FORMAT: đổi dạng kết quả (phân số / thập phân / độ phút giây)', bang: 'EXE: tính' }[p[0]];
    return '<button class="mt-k mt-' + kieu + '" data-k="' + p[0] + '"' + (tieuDe ? ' title="' + tieuDe + '"' : '') + '>' + (p[2] ? '<span class="mt-s">' + p[2] + '</span>' : '') + '<b>' + p[1] + '</b></button>';
  }
  function tao() {
    el = document.createElement('div'); el.id = 'may-tinh'; el.className = 'an';
    el.innerHTML = '<div class="mt-dau"><span class="mt-hieu">GeoInk</span><span class="mt-phu">máy tính khoa học · THCS</span><button class="mt-dong" title="Đóng máy tính">×</button></div>' +
      '<div class="mt-vien-lcd"><div class="mt-lcd"><div class="mt-tt"></div><div class="mt-man"></div></div></div>' +
      '<div class="mt-dong-chu">GEOINK</div>' +
      '<div class="mt-cum">' +
        '<div class="mt-trai"><div class="mt-cap"><span>ON</span><button class="mt-tron" data-k="on">' + '' + '</button></div><div class="mt-cap"><span>HOME</span><button class="mt-tron" data-k="home">' + SVG.nha + '</button></div>' +
          '<div class="mt-cap"><span>SETTINGS</span><button class="mt-tron" data-k="settings">' + SVG.caiDat + '</button></div><div class="mt-cap"><span>&nbsp;</span><button class="mt-tron" data-k="quay">' + SVG.quay + '</button></div></div>' +
        '<div class="mt-dpad"><button data-k="len" class="d-len">▲</button><button data-k="trai" class="d-trai">◀</button><button data-k="ok" class="d-ok">OK</button><button data-k="phai" class="d-phai">▶</button><button data-k="xuong" class="d-xuong">▼</button></div>' +
        '<div class="mt-cuon"><button data-k="len">︿</button><button data-k="xuong">﹀</button></div>' +
      '</div>' +
      '<div class="mt-nhan-cn"><span>SHIFT</span><span>VARIABLE</span><span>FUNCTION</span><span>CATALOG</span><span>TOOLS</span></div>' +
      HANG_CN.map(function (h, i) { return '<div class="mt-hang mt-hang' + i + '">' + h.map(htmlPhim).join('') + '</div>'; }).join('') +
      '<div class="mt-ban-so">' + PHIM_SO.map(function (h) { return h.map(htmlPhim).join(''); }).join('') + '</div>';
    document.body.appendChild(el);
    tt = el.querySelector('.mt-tt'); man = el.querySelector('.mt-man');
    el.querySelectorAll('[data-k]').forEach(function (b) { b.addEventListener('mousedown', function (e) { e.preventDefault(); }); b.onclick = function () { nhan(b.dataset.k); }; });
    el.querySelector('.mt-dong').onclick = dong;
    // kéo máy tính bằng phần đầu (chỗ chữ GeoInk)
    var dau = el.querySelector('.mt-dau'), keo = null;
    dau.addEventListener('pointerdown', function (e) { if (e.target.closest('button')) return; var r = el.getBoundingClientRect(), z = parseFloat(el.style.zoom) || 1; keo = { dx: e.clientX / z - r.left / z, dy: e.clientY / z - r.top / z, z: z }; dau.setPointerCapture(e.pointerId); });
    dau.addEventListener('pointermove', function (e) { if (!keo) return; el.style.left = Math.max(0, e.clientX / keo.z - keo.dx) + 'px'; el.style.top = Math.max(0, e.clientY / keo.z - keo.dy) + 'px'; el.style.right = 'auto'; });
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
    tt.innerHTML = '<span class="' + (st.shift ? 'bat' : '') + '">S</span>' + (st.sto ? '<span class="bat">STO</span>' : '') +
      '<span class="bat">' + (st.goc === 'D' ? 'D' : 'R') + '</span>' + (st.bien.M ? '<span class="bat">M</span>' : '') + '<span class="mt-cd">' + TEN_CHE_DO[st.cheDo] + '</span>';
  }
  var manHinh = 'tinh', luoi = null, dsKq = null, chonMuc = 0;
  // ô trên màn hình HOME (biểu tượng vẽ kiểu màn hình LCD)
  var IC = function (d) { return '<svg viewBox="0 0 32 24" width="34" height="26" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + d + '</svg>'; };
  var MUC_HOME = [
    ['tinh', 'Tính thường', IC('<path d="M5 6h7M8.5 2.5v7M20 6h7M5 18l6-5M11 18l-6-5M20 15.5h7M20 20.5h7"/>')],
    ['tk', 'Thống kê', IC('<path d="M4 21h24M7 21V13M12 21V6M17 21V10M22 21V15M27 21V8" stroke-width="2.6"/>')],
    ['bang', 'Bảng giá trị', IC('<rect x="4" y="3" width="24" height="18" rx="1.5"/><path d="M4 9h24M4 15h24M14 3v18"/>')],
    ['pt', 'Phương trình', IC('<path d="M3 9c3-6 6-6 9 0s6 6 9 0M3 15h8M15 15h3M21 12v6M24 15h5"/>')],
    ['bpt', 'Bất phương trình', IC('<path d="M5 6l8 6-8 6M17 18h11M17 6h11M17 12h11" />')],
  ];
  function veMan() {
    veTrangThai(); man.innerHTML = '';
    if (manHinh === 'tinh') { man.appendChild(mf); var k = document.createElement('div'); k.className = 'mt-kq'; man.appendChild(k); veKetQua(); return; }
    if (manHinh === 'menu') {
      man.innerHTML = '<div class="mt-menu">' + MUC_HOME.map(function (m, i) { return '<div class="mt-mn' + (i === chonMuc ? ' chon' : '') + '"><span class="mt-mn-i">' + m[2] + '</span><span class="mt-mn-t">' + m[1] + '</span></div>'; }).join('') + '</div>';
      return;
    }
    if (manHinh === 'danhSach') {   // chọn trong danh sách (loại phương trình, bậc, dấu…)
      man.innerHTML = '<div class="mt-tieu-de">' + dsChon.tieuDe + '</div><div class="mt-ds">' + dsChon.ds.map(function (d, i) { return '<div class="' + (i === chonMuc ? 'chon' : '') + '">' + (i < 9 ? (i + 1) + ': ' : '') + d[1] + '</div>'; }).join('') + '</div>';
      var cs = man.querySelector('.mt-ds .chon'); if (cs) cs.scrollIntoView({ block: 'nearest' });
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
    if (k === 'shift') { st.shift = !st.shift; veTrangThai(); return; }
    var coShift = st.shift, ma = coShift ? 's:' + k : k; st.shift = false;
    if (k === 'on') { if (coShift) return dong(); manHinh = 'tinh'; st.cheDo = 'tinh'; veMan(); return nhan('ac'); }
    if (k === 'home' || k === 'menu') { manHinh = 'menu'; chonMuc = Math.max(0, MUC_HOME.map(function (m) { return m[0]; }).indexOf(st.cheDo)); veMan(); return; }
    if (k === 'ok') k = ma = 'bang';
    if (k === 'quay') return quayLai();
    if (k === 'settings') return moDanhSach('Cài đặt', [['D', 'Đơn vị góc: Độ (D)'], ['R', 'Đơn vị góc: Radian (R)']], function (g) { st.goc = g; veTrangThai(); thongBaoNho(g === 'D' ? 'Đơn vị góc: Độ (D)' : 'Đơn vị góc: Radian (R)'); });
    if (k === 'var') return coShift ? moBien(true) : moBien(false);
    if (k === 'fn' || k === 'catalog') return moHam(k === 'catalog');
    if (k === 'tools') return moCongCu();
    if (k === 'ans' && coShift) { var o = oHienTai(); o.executeCommand(['insert', L.hienThi(st.preAns || 0).latex, { focus: true }]); return; }
    if (k === 'format') { if (manHinh === 'tinh' && st.vuaTinh && st.kq != null) { st.dang = st.dang === 'chinh' ? 'thapPhan' : st.dang === 'thapPhan' ? 'dms' : 'chinh'; veKetQua(); } return; }
    if (k === 'del' && coShift) return;
    if (manHinh === 'menu') return nhanMenu(k);
    if (manHinh === 'danhSach') return nhanDanhSach(k);
    if (manHinh === 'luoi') return nhanLuoi(k, ma);
    if (manHinh === 'ketQua') { if (k === 'ac' || k === 'trai' || k === 'del') { manHinh = 'luoi'; veMan(); } else if (k === 'bang') { manHinh = 'luoi'; veMan(); } return; }
    nhanTinh(k, ma);
  }
  function oHienTai() { return manHinh === 'luoi' && oSua ? oSua : mf; }
  function quayLai() {
    if (manHinh === 'danhSach') { manHinh = dsChon.quayVe || 'menu'; veMan(); if (dsChon.giu != null) khoiPhucO(); return; }
    if (manHinh === 'ketQua') { manHinh = 'luoi'; veMan(); return; }
    if (manHinh === 'luoi' || manHinh === 'menu') { manHinh = 'menu'; if (st.cheDo === 'tinh') manHinh = 'tinh'; veMan(); return; }
  }
  // danh sách chọn (Cài đặt, biến, hàm, công cụ…): chọn xong quay về màn hình đang dùng
  function moDanhSach(tieuDe, ds, xong) {
    var ve = manHinh === 'danhSach' ? (dsChon.quayVe || 'tinh') : manHinh, giu = ve === 'luoi' && oSua ? oSua.value : null;
    dsChon = { tieuDe: tieuDe, ds: ds, quayVe: ve, giu: giu, xong: function (v) { manHinh = ve; veMan(); if (giu != null) khoiPhucO(); xong(v); } };
    manHinh = 'danhSach'; chonMuc = 0; veMan();
  }
  function khoiPhucO() { if (oSua && dsChon && dsChon.giu != null) { oSua.value = dsChon.giu; oSua.executeCommand('moveToMathfieldEnd'); } }
  function chenVao(ma) { setTimeout(function () { var o = oHienTai(); if (manHinh === 'tinh' && st.vuaTinh) { mf.value = LA_TOAN_TU[ma] ? '\\mathrm{Ans}' : ''; st.vuaTinh = false; st.dang = 'chinh'; veKetQua(); } chen(ma, o); }, 0); }
  function moBien(luu) {
    var ten = ['A', 'B', 'C', 'D', 'E', 'F', 'x', 'y', 'M'];
    moDanhSach(luu ? 'STO: lưu Ans vào biến' : 'Biến (VARIABLE)', ten.map(function (t) { return [t, t + ' = ' + L.hienThi(st.bien[t] || 0).chu]; }), function (t) {
      if (luu) { st.bien[t] = st.ans; thongBaoNho('Ans → ' + t + ' = ' + L.hienThi(st.ans).chu); return; }
      setTimeout(function () { oHienTai().executeCommand(['insert', t, { focus: true }]); }, 0);
    });
  }
  function moHam(coHang) {
    var ds = [['abs', '|x|  (giá trị tuyệt đối)'], ['inv', 'x⁻¹'], ['cube', 'x³'], ['nthRoot', 'ⁿ√  (căn bậc n)'], ['ln', 'ln'], ['exp', 'eˣ'], ['fact', 'x!  (giai thừa)'], ['ncr', 'nCr  (tổ hợp)'], ['s:ncr', 'nPr  (chỉnh hợp)'], ['pt', '%'], ['dms', '° ′ ″  (độ phút giây)']];
    if (coHang) ds = ds.concat([['hangPi', 'π'], ['hangE', 'e'], ['s:sin', 'sin⁻¹'], ['s:cos', 'cos⁻¹'], ['s:tan', 'tan⁻¹'], ['s:log', '10ˣ']]);
    moDanhSach(coHang ? 'CATALOG' : 'FUNCTION', ds, function (m) { chenVao(m); });
  }
  function moCongCu() {
    moDanhSach('TOOLS', [['mcong', 'M+  (cộng kết quả vào M)'], ['mtru', 'M−  (trừ kết quả khỏi M)'], ['xoaM', 'Xoá bộ nhớ M'], ['xoaBien', 'Xoá tất cả biến'], ['sd', 'S⇔D  (phân số ⇔ thập phân)']], function (m) {
      if (m === 'mcong' || m === 'mtru') { var v = st.vuaTinh && st.kq != null ? st.kq : st.ans; st.bien.M += m === 'mtru' ? -v : v; thongBaoNho('M = ' + L.hienThi(st.bien.M).chu); veTrangThai(); return; }
      if (m === 'xoaM') { st.bien.M = 0; thongBaoNho('Đã xoá M'); veTrangThai(); return; }
      if (m === 'xoaBien') { Object.keys(st.bien).forEach(function (t) { st.bien[t] = 0; }); thongBaoNho('Đã xoá tất cả biến'); veTrangThai(); return; }
      if (m === 'sd') { if (st.vuaTinh && st.kq != null) { st.dang = st.dang === 'thapPhan' ? 'chinh' : 'thapPhan'; veKetQua(); } }
    });
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
    try { var v = L.tinh(mf.value, ngu()); st.kq = v; st.preAns = st.ans; st.ans = v; st.loi = ''; st.vuaTinh = true; st.dang = 'chinh'; }
    catch (e) { st.loi = e.mt ? e.message : 'Lỗi cú pháp'; st.vuaTinh = false; }
    veKetQua();
  }
  var thongBaoT = null;
  function thongBaoNho(s) { var d = document.createElement('div'); d.className = 'mt-tb'; d.textContent = s; man.appendChild(d); clearTimeout(thongBaoT); thongBaoT = setTimeout(function () { d.remove(); }, 1600); }

  // ---------- MENU ----------
  function nhanMenu(k) {
    var so = +k, n = MUC_HOME.length;
    if (k === 'trai') { chonMuc = (chonMuc + n - 1) % n; veMan(); return; }
    if (k === 'phai') { chonMuc = (chonMuc + 1) % n; veMan(); return; }
    if (k === 'len') { chonMuc = chonMuc >= 3 ? chonMuc - 3 : chonMuc; veMan(); return; }
    if (k === 'xuong') { chonMuc = Math.min(n - 1, chonMuc + 3); veMan(); return; }
    if (k === 'bang') so = chonMuc + 1;
    if (k === 'ac') { batDauCheDo(st.cheDo); return; }
    if (so >= 1 && so <= n) batDauCheDo(MUC_HOME[so - 1][0]);
  }
  var dsChon = null;
  function hoiChon(tieuDe, ds, xong) { dsChon = { tieuDe: tieuDe, ds: ds, xong: xong, quayVe: 'menu' }; manHinh = 'danhSach'; chonMuc = 0; veMan(); }
  function nhanDanhSach(k) {
    var n = dsChon.ds.length, so = +k;
    if (k === 'len' || k === 'trai') { chonMuc = (chonMuc + n - 1) % n; veMan(); return; }
    if (k === 'xuong' || k === 'phai') { chonMuc = (chonMuc + 1) % n; veMan(); return; }
    if (k === 'bang') so = chonMuc + 1;
    if (k === 'ac') { quayLai(); return; }
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
    if (k === 'format') return;
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
