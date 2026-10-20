// GeoInk – giao diện chính: bảng viết tay + dựng hình + đồ thị + mô hình GeoLab
(function () {
  'use strict';
  var MT = window.mayTinh || null;          // cầu nối Electron (null khi mở bằng trình duyệt)
  var DV = 40;                               // 1 đơn vị (1 cm) = 40 điểm ảnh ở mức phóng 100%
  var H = GI.hinh;
  function $(s) { return document.querySelector(s); }
  function $$(s) { return Array.prototype.slice.call(document.querySelectorAll(s)); }

  /* =====================================================================
     BIỂU TƯỢNG (SVG 24 × 24)
     ===================================================================== */
  var BT = {
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    caiDat: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/>',
    xuong: '<path d="M6 9l6 6 6-6"/>',
    thang: '<path d="M4 20L20 4"/><circle cx="4" cy="20" r="1.6" fill="currentColor"/><circle cx="20" cy="4" r="1.6" fill="currentColor"/>',
    moi: '<path d="M6 3h8l5 5v13H6z"/><path d="M14 3v5h5M12 11v6M9 14h6"/>',
    mo: '<path d="M3 7h6l2 2h10v10H3z"/><path d="M3 7V5h6"/>',
    luu: '<path d="M5 3h12l3 3v15H5z"/><path d="M8 3v6h8V3M8 21v-7h9v7"/>',
    anh: '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 17l-6-6-8 8"/>',
    hoanTac: '<path d="M9 14L4 9l5-5"/><path d="M4 9h11a5 5 0 010 10h-3"/>',
    lamLai: '<path d="M15 14l5-5-5-5"/><path d="M20 9H9a5 5 0 000 10h3"/>',
    xoaTrang: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
    truoc: '<path d="M15 5l-7 7 7 7"/>', sau: '<path d="M9 5l7 7-7 7"/>',
    themTrang: '<path d="M6 3h9l4 4v14H6z"/><path d="M12 10v7M8.5 13.5h7"/>',
    nen: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18" opacity=".6"/>',
    truc: '<path d="M4 20V3M4 20h17"/><path d="M2 5l2-2 2 2M19 18l2 2-2 2"/><path d="M6 16c4-1 6-9 13-11" stroke-dasharray="0"/>',
    soDo: '<path d="M3 17l6-10 6 10z"/><path d="M14 7h6M17 4v6"/><path d="M5 20h14" stroke-dasharray="2 2"/>',
    toanManHinh: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
    thuNho: '<circle cx="11" cy="11" r="7"/><path d="M8 11h6M21 21l-5-5"/>',
    phongTo: '<circle cx="11" cy="11" r="7"/><path d="M8 11h6M11 8v6M21 21l-5-5"/>',
    chon: '<path d="M5 3l14 8-6 2-2 6z"/>',
    but: '<path d="M9 3h6l-1 5h-4z"/><path d="M10 8l-1 9 3 4 3-4-1-9"/><path d="M12 15v2"/>',
    dq: '<path d="M8 15l-3 6h8l-1-3"/><path d="M8 15l9-11 4 4-9 11z"/><path d="M3 21h18" opacity=".5"/>',
    tay: '<path d="M8 20h12M5 15l9-10 6 6-8 9H9z"/><path d="M10 9l6 6"/>',
    laser: '<circle cx="7" cy="17" r="3"/><path d="M9.5 14.5L20 4M14 4h6v6"/>',
    keo: '<path d="M8 13V5a1.5 1.5 0 013 0v6M11 11V4a1.5 1.5 0 013 0v7M14 11V6a1.5 1.5 0 013 0v8c0 4-3 7-7 7-3 0-5-2-6-4l-2-4a1.5 1.5 0 012.6-1.5L8 13"/>',
    diem: '<circle cx="12" cy="12" r="3.5" fill="currentColor"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3"/>',
    doan: '<path d="M5 18L19 6"/><circle cx="5" cy="18" r="2.2" fill="currentColor"/><circle cx="19" cy="6" r="2.2" fill="currentColor"/>',
    duong: '<path d="M2 20L22 4"/><circle cx="8" cy="15.2" r="2" fill="currentColor"/><circle cx="16" cy="8.8" r="2" fill="currentColor"/>',
    tia: '<path d="M5 18L22 4"/><circle cx="5" cy="18" r="2.2" fill="currentColor"/><circle cx="13" cy="11.4" r="2" fill="currentColor"/>',
    tron: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="1.8" fill="currentColor"/><path d="M12 12l6 5" opacity=".6"/>',
    trungDiem: '<path d="M3 17L21 7"/><circle cx="3.5" cy="16.7" r="1.8" fill="currentColor"/><circle cx="20.5" cy="7.3" r="1.8" fill="currentColor"/><circle cx="12" cy="12" r="2.6" fill="currentColor"/><path d="M7 12.6l1 1.6M16 9.8l1 1.6"/>',
    vuongGoc: '<path d="M3 19h18M12 19V4"/><path d="M12 15h4v4"/>',
    songSong: '<path d="M3 16L17 4M7 20L21 8"/>',
    giao: '<path d="M3 19L21 5M3 6l18 12"/><circle cx="12" cy="12" r="2.6" fill="currentColor"/>',
    daGiac: '<path d="M5 19l-2-9 8-6 9 5-3 10z"/>',
    xoa: '<path d="M6 6l12 12M18 6L6 18"/>',
    doDai: '<path d="M3 15h18M3 11v8M21 11v8"/><path d="M7 7h10M7 7l2-2M7 7l2 2M17 7l-2-2M17 7l-2 2"/>',
    goc: '<path d="M4 19h16M4 19L16 5"/><path d="M11 19a7 7 0 00-2.6-5.4"/>',
    hamSo: '<path d="M3 21V3M3 21h18"/><path d="M5 18c3-1 4-12 7-12s4 9 8 10"/>',
    moHinh: '<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M12 12l8-4.5M12 12L4 7.5M12 12v9"/>',
  };
  function svg(k) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + (BT[k] || '') + '</svg>'; }
  function ganBieuTuong(goc) { (goc || document).querySelectorAll('i[data-bt]').forEach(function (i) { i.innerHTML = svg(i.dataset.bt); }); }

  /* =====================================================================
     TÀI LIỆU, LỊCH SỬ
     ===================================================================== */
  function trangMoi(nen) { return { nen: nen || 'trang', net: [], hinh: [], moHinh: [], truc: false }; }
  var tl = { app: 'GeoInk', phienBan: 1, trang: [trangMoi('giayKe')], so: 0 };
  var tenTep = null, daSua = false, demId = 1;
  function trang() { return tl.trang[tl.so]; }
  function idMoi(tienTo) { var id; do { id = tienTo + (demId++); } while (timTheoId(id)); return id; }
  function timTheoId(id) { var t = trang(); return t.hinh.filter(function (o) { return o.id === id; })[0] || t.moHinh.filter(function (o) { return o.id === id; })[0]; }
  function boPhanPhu(k, v) { return k.charAt(0) === '_' ? undefined : v; }
  function chup() { return JSON.stringify(tl, boPhanPhu); }
  var truoc = [], sauLS = [];
  function ghiLichSu() { truoc.push(chup()); if (truoc.length > 100) truoc.shift(); sauLS = []; daSua = true; capNhatTieuDe(); }
  function napTaiLieu(chuoi) {
    var d = JSON.parse(chuoi);
    if (!d || !Array.isArray(d.trang) || !d.trang.length) throw new Error('Tệp không phải bảng GeoInk.');
    d.trang.forEach(function (t) { t.net = t.net || []; t.hinh = t.hinh || []; t.moHinh = t.moHinh || []; t.nen = t.nen || 'trang'; });
    d.so = Math.min(Math.max(0, d.so | 0), d.trang.length - 1);
    tl = d;
  }
  function hoanTac() { if (!truoc.length) return thongBao('Không còn gì để hoàn tác'); sauLS.push(chup()); napTaiLieu(truoc.pop()); daSua = true; sauKhiDoiTrang(); }
  function lamLai() { if (!sauLS.length) return thongBao('Không còn gì để làm lại'); truoc.push(chup()); napTaiLieu(sauLS.pop()); daSua = true; sauKhiDoiTrang(); }

  /* =====================================================================
     KHUNG NHÌN (thế giới ↔ màn hình)
     ===================================================================== */
  var V = { x: -300, y: -260, s: 1 };
  var cv = $('#ve'), ctx = cv.getContext('2d'), cvN = $('#nhap'), nctx = cvN.getContext('2d');
  var W = 800, Hh = 600, dpr = 1, daCanGiua = false;   // đặt gốc toạ độ giữa bảng khi cửa sổ có kích thước thật
  function raMH(p) { return { x: (p.x - V.x) * V.s, y: (p.y - V.y) * V.s }; }
  function veTG(x, y) { return { x: x / V.s + V.x, y: y / V.s + V.y }; }
  function doiKichThuoc() {
    var r = $('#bang').getBoundingClientRect(); dpr = window.devicePixelRatio || 1;
    W = Math.max(1, r.width); Hh = Math.max(1, r.height);
    [cv, cvN].forEach(function (c) { c.width = Math.round(W * dpr); c.height = Math.round(Hh * dpr); });
    if (!daCanGiua && W > 200 && Hh > 200) { daCanGiua = true; V.x = -W / 2 / V.s; V.y = -Hh / 2 / V.s; }
    canVe();
  }
  function thuPhong(k, cx, cy) {
    var s2 = Math.max(0.2, Math.min(6, V.s * k)); if (cx == null) { cx = W / 2; cy = Hh / 2; }
    var M = veTG(cx, cy); V.s = s2; V.x = M.x - cx / V.s; V.y = M.y - cy / V.s;
    capNhatThongTin(); canVe();
  }
  function capNhatThongTin() {
    var ten = tenTep ? tenTep.split(/[\\/]/).pop().replace(/\.geoink$/i, '') : 'Bảng mới';
    $('#thong-tin').textContent = ten + (daSua ? ' •' : '') + '   ' + (tl.so + 1) + ' / ' + tl.trang.length + ' · ' + Math.round(V.s * 100) + '%';
  }

  /* =====================================================================
     CÔNG CỤ
     ===================================================================== */
  // Hàng 2 (kiểu GeoGebra): [mã, tên ngắn, mô tả]
  var CC_HINH = [
    ['diem', 'Điểm', 'Điểm'], ['doan', 'Đoạn', 'Đoạn thẳng'], ['duong', 'Đường', 'Đường thẳng'], ['tia', 'Tia', 'Tia'], ['tron', 'Đ. tròn', 'Đường tròn (tâm, điểm)'],
    '|', ['trungDiem', 'Trung điểm', 'Trung điểm'], ['vuongGoc', 'Vuông góc', 'Đường vuông góc'], ['songSong', 'Song song', 'Đường song song'], ['giao', 'Giao điểm', 'Giao điểm'], ['daGiac', 'Đa giác', 'Đa giác'],
    '|', ['doDai', 'Độ dài', 'Đo độ dài'], ['goc', 'Góc', 'Đo góc'],
    '|', ['hamSo', 'Hàm số', 'Vẽ đồ thị hàm số'], ['moHinh', 'GeoLab', 'Chèn mô hình GeoLab'],
    '|', ['xoa', 'Xoá hình', 'Xoá hình, mô hình'],
  ];
  var GOI_Y = {
    chon: 'Kéo điểm, nét vẽ hoặc mô hình để di chuyển · kéo chỗ trống để dời trang',
    but: '', dq: '', thang: 'Kéo để kẻ nét thẳng (gần nằm ngang / thẳng đứng sẽ tự thẳng)', tay: 'Rê tẩy qua nét vẽ để xoá', laser: 'Bút chỉ: nét đỏ tự mờ đi', keo: 'Kéo để dời trang · lăn chuột để phóng to, thu nhỏ',
    diem: 'Bấm để đặt điểm (bấm lên đường thẳng, đường tròn để đặt điểm trên đó)',
    doan: ['Chọn điểm đầu', 'Chọn điểm cuối'], duong: ['Chọn điểm thứ nhất', 'Chọn điểm thứ hai'], tia: ['Chọn gốc của tia', 'Chọn điểm tia đi qua'],
    tron: ['Chọn tâm', 'Chọn một điểm trên đường tròn'], trungDiem: ['Chọn hai điểm (hoặc bấm vào một đoạn thẳng)', 'Chọn điểm thứ hai'],
    vuongGoc: ['Chọn một điểm và một đường thẳng', 'Chọn đường thẳng (hoặc điểm) còn lại'], songSong: ['Chọn một điểm và một đường thẳng', 'Chọn đường thẳng (hoặc điểm) còn lại'],
    giao: ['Chọn đối tượng thứ nhất', 'Chọn đối tượng thứ hai'], daGiac: 'Chọn lần lượt các đỉnh, bấm lại đỉnh đầu để khép kín',
    xoa: 'Bấm vào hình hoặc mô hình cần xoá', doDai: ['Chọn hai điểm (hoặc bấm vào một đoạn thẳng)', 'Chọn điểm thứ hai'], goc: ['Chọn điểm trên cạnh thứ nhất', 'Chọn đỉnh góc', 'Chọn điểm trên cạnh thứ hai'],
  };
  var cc = 'but', choChon = [];
  var butCfg = { mau: '#111827', co: 3 }, dqCfg = { mau: '#FDE047', co: 20 }, tayCo = 22;
  var MAU_BUT = ['#111827', '#DC2626', '#2563EB', '#16A34A', '#9333EA'];
  var MAU_DQ = ['#FDE047', '#4ADE80', '#22D3EE'];
  var CO_BUT = [2, 4, 7], CO_TAY = [12, 22, 40];
  var MAU_HINH = '#1F3A8A', MAU_HAM = ['#DC2626', '#2563EB', '#16A34A', '#9333EA', '#EA580C', '#0891B2'];
  var hienSo = true;

  function veThanhCongCu() {
    $('#hang-hinh').innerHTML = '<span class="nhan-hang">Hình học</span>' + CC_HINH.map(function (c) {
      if (c === '|') return '<span class="ke"></span>';
      return '<button class="nut" data-cc="' + c[0] + '" title="' + c[2] + '"><i data-bt="' + c[0] + '"></i>' + c[1] + '</button>';
    }).join('') + '<div class="gian"></div>' +
      '<button class="nut" data-lenh="soDo" id="nut-so-do" title="Ẩn / hiện số đo"><i data-bt="soDo"></i>Số đo</button>' +
      '<button class="nut" data-lenh="truc" title="Bật / tắt hệ trục toạ độ"><i data-bt="truc"></i>Hệ trục</button>';
    ganBieuTuong();
    $$('[data-cc]').forEach(function (b) { b.onclick = function () { chonCongCu(b.dataset.cc); }; });
  }
  function chonCongCu(k) {
    if (k === 'hamSo') return moHopHam();
    if (k === 'moHinh') return moHopMoHinh();
    cc = k; choChon = []; xemTruoc = null;
    $$('[data-cc]').forEach(function (b) { b.classList.toggle('bat', b.dataset.cc === cc); });
    capNhatTuyChonBut(); capNhatGoiY(); canVe(); veNhap();
    cv.style.cursor = cc === 'keo' ? 'grab' : cc === 'chon' ? 'default' : 'crosshair';
  }
  function capNhatGoiY() {
    var g = GOI_Y[cc], s = Array.isArray(g) ? g[Math.min(choChon.length, g.length - 1)] : g;
    if (cc === 'daGiac' && choChon.length) s = 'Đã chọn ' + choChon.length + ' đỉnh · bấm lại đỉnh đầu để khép kín';
    var el = $('#goi-y'); el.textContent = s || ''; el.classList.toggle('an', !s);
  }
  // Khay màu bút, độ dày, màu dạ quang trên hàng 1; cỡ tẩy hiện nổi khi chọn Tẩy
  function capNhatTuyChonBut() {
    var dangBut = cc === 'but' || cc === 'thang', dangDq = cc === 'dq';
    $('#khay-mau').innerHTML = MAU_BUT.map(function (m) {
      return '<button class="cham' + (dangBut && m.toLowerCase() === butCfg.mau.toLowerCase() ? ' bat' : '') + '" data-mau="' + m + '" title="Màu bút"><b style="width:18px;height:18px;background:' + m + (m === '#FFFFFF' ? ';box-shadow:inset 0 0 0 1px #9CA3AF' : '') + '"></b></button>';
    }).join('') + '<button class="cham' + (dangBut && MAU_BUT.indexOf(butCfg.mau) < 0 ? ' bat' : '') + '" title="Màu khác"><span class="tu-chon"></span><input type="color" id="mau-khac" value="' + butCfg.mau + '"></button>';
    $('#khay-co').innerHTML = CO_BUT.map(function (c, i) {
      var d = [8, 12, 17][i];
      return '<button class="cham' + (c === butCfg.co ? ' bat' : '') + '" data-co="' + c + '" title="Nét ' + ['mảnh', 'vừa', 'đậm'][i] + '"><b style="width:' + d + 'px;height:' + d + 'px;background:#111827"></b></button>';
    }).join('');
    $('#khay-dq').innerHTML = MAU_DQ.map(function (m) {
      return '<button class="cham dq' + (dangDq && m.toLowerCase() === dqCfg.mau.toLowerCase() ? ' bat' : '') + '" data-mau-dq="' + m + '" title="Dạ quang"><b style="background:' + m + '"></b></button>';
    }).join('');
    $$('#khay-mau [data-mau]').forEach(function (b) { b.onclick = function () { butCfg.mau = b.dataset.mau; if (!dangBut) chonCongCu('but'); else capNhatTuyChonBut(); }; });
    var mk = $('#mau-khac'); mk.oninput = function () { butCfg.mau = mk.value; }; mk.onchange = function () { if (cc !== 'but' && cc !== 'thang') chonCongCu('but'); else capNhatTuyChonBut(); };
    $$('#khay-co [data-co]').forEach(function (b) { b.onclick = function () { butCfg.co = +b.dataset.co; if (!dangBut) chonCongCu('but'); else capNhatTuyChonBut(); }; });
    $$('#khay-dq [data-mau-dq]').forEach(function (b) { b.onclick = function () { dqCfg.mau = b.dataset.mauDq; if (!dangDq) chonCongCu('dq'); else capNhatTuyChonBut(); }; });
    var el = $('#tuy-chon-but');
    if (cc !== 'tay') { el.classList.add('an'); return; }
    el.classList.remove('an');
    el.innerHTML = 'Cỡ tẩy' + CO_TAY.map(function (c) { return '<button class="co' + (c === tayCo ? ' bat' : '') + '" data-co-tay="' + c + '" title="Cỡ ' + c + '"><span style="height:' + Math.round(c / 1.6) + 'px;width:' + Math.round(c / 1.6) + 'px"></span></button>'; }).join('');
    el.querySelectorAll('[data-co-tay]').forEach(function (b) { b.onclick = function () { tayCo = +b.dataset.coTay; capNhatTuyChonBut(); }; });
  }

  /* =====================================================================
     VẼ
     ===================================================================== */
  var NEN = {
    giayKe: { ten: 'Giấy kẻ dòng', mau: '#FFFFFF', luoi: 'ke', toi: false },
    trang: { ten: 'Nền trắng', mau: '#FFFFFF', luoi: null, toi: false },
    oVuong: { ten: 'Ô vuông', mau: '#FFFFFF', luoi: 'vuong', toi: false },
    oLy: { ten: 'Ô ly', mau: '#FFFDF7', luoi: 'ly', toi: false },
    bangXanh: { ten: 'Bảng xanh', mau: '#1F4D3B', luoi: 'vuongToi', toi: true },
    den: { ten: 'Nền đen', mau: '#111827', luoi: null, toi: true },
  };
  var canVeLai = true;
  function canVe() { canVeLai = true; }
  function vong() { if (canVeLai) { canVeLai = false; ve(); } requestAnimationFrame(vong); }
  function kieuNen() { return NEN[trang().nen] || NEN.trang; }
  function mauNet() { return kieuNen().toi ? '#E5E7EB' : MAU_HINH; }
  function vungNhin() { return { x0: V.x, y0: V.y, x1: V.x + W / V.s, y1: V.y + Hh / V.s }; }

  function veNen(c, vn, s) {
    var n = kieuNen(); c.fillStyle = n.mau; c.fillRect(vn.x0, vn.y0, vn.x1 - vn.x0, vn.y1 - vn.y0);
    if (!n.luoi) return;
    var mong = 1 / s;
    function ke(buoc, mau, rong, chiNgang) {
      c.beginPath();
      if (!chiNgang) for (var x = Math.floor(vn.x0 / buoc) * buoc; x <= vn.x1; x += buoc) { c.moveTo(x, vn.y0); c.lineTo(x, vn.y1); }
      for (var y = Math.floor(vn.y0 / buoc) * buoc; y <= vn.y1; y += buoc) { c.moveTo(vn.x0, y); c.lineTo(vn.x1, y); }
      c.strokeStyle = mau; c.lineWidth = rong * mong; c.stroke();
    }
    if (n.luoi === 'ke') {   // giấy kẻ dòng: dòng xanh nhạt cách 32, lề đỏ đôi bên trái
      if (32 * s > 5) ke(32, '#C7D7F1', 1, true);
      var xl = -16 * DV; if (xl > vn.x0 && xl < vn.x1) { c.beginPath(); c.moveTo(xl, vn.y0); c.lineTo(xl, vn.y1); c.moveTo(xl + 4 * mong, vn.y0); c.lineTo(xl + 4 * mong, vn.y1); c.strokeStyle = '#F0A3A3'; c.lineWidth = 1.2 * mong; c.stroke(); }
      return;
    }
    if (n.luoi === 'vuong') { if (DV * s > 7) ke(DV, '#DCE6F5', 1); ke(DV * 5, '#C3D3EC', 1.2); }
    else if (n.luoi === 'ly') { if (DV * s > 14) ke(DV / 4, '#E8E2F2', 0.8, true); ke(DV, '#B9A7D9', 1); }
    else if (n.luoi === 'vuongToi') { if (DV * s > 7) ke(DV, 'rgba(255,255,255,.07)', 1); ke(DV * 5, 'rgba(255,255,255,.12)', 1); }
  }

  function coTruc() { var t = trang(); return t.truc || t.hinh.some(function (o) { return o.loai === 'hamSo'; }); }
  function soVN(x, le) { var k = Math.pow(10, le == null ? 1 : le), r = Math.round(x * k) / k; if (Math.abs(r) < 1e-9) r = 0; return String(r).replace('.', ',').replace('-', '−'); }
  function veTruc(c, vn, s) {
    var toi = kieuNen().toi, mau = toi ? '#CBD5E1' : '#334155', px = 1 / s;
    c.save(); c.strokeStyle = mau; c.fillStyle = mau; c.lineWidth = 1.6 * px;
    c.beginPath(); c.moveTo(vn.x0, 0); c.lineTo(vn.x1, 0); c.moveTo(0, vn.y0); c.lineTo(0, vn.y1); c.stroke();
    // mũi tên
    var m = 10 * px;
    c.beginPath(); c.moveTo(vn.x1 - 2 * px, 0); c.lineTo(vn.x1 - 2 * px - m, -m / 2); c.lineTo(vn.x1 - 2 * px - m, m / 2); c.fill();
    c.beginPath(); c.moveTo(0, vn.y0 + 2 * px); c.lineTo(-m / 2, vn.y0 + 2 * px + m); c.lineTo(m / 2, vn.y0 + 2 * px + m); c.fill();
    // vạch chia và số
    var b = 1, dvPx = DV * s; while (b * dvPx < 34) b = b === 1 ? 2 : b === 2 ? 5 : b * 2;
    c.font = (13 * px) + 'px ' + getComputedStyle(document.body).fontFamily; c.textAlign = 'center'; c.textBaseline = 'top';
    for (var i = Math.ceil(vn.x0 / DV / b) * b; i * DV <= vn.x1; i += b) { if (!i) continue; c.beginPath(); c.moveTo(i * DV, -4 * px); c.lineTo(i * DV, 4 * px); c.stroke(); c.fillText(soVN(i, 0), i * DV, 6 * px); }
    c.textAlign = 'right'; c.textBaseline = 'middle';
    for (var j = Math.ceil(vn.y0 / DV / b) * b; j * DV <= vn.y1; j += b) { if (!j) continue; c.beginPath(); c.moveTo(-4 * px, j * DV); c.lineTo(4 * px, j * DV); c.stroke(); c.fillText(soVN(-j, 0), -7 * px, j * DV); }
    c.font = 'italic ' + (17 * px) + 'px "Cambria Math", "Times New Roman", serif';
    c.textAlign = 'right'; c.textBaseline = 'top'; c.fillText('x', vn.x1 - 6 * px, 8 * px);
    c.textAlign = 'left'; c.fillText('y', 9 * px, vn.y0 + 4 * px);
    c.textAlign = 'right'; c.fillText('O', -5 * px, 5 * px);
    c.restore();
  }

  // Nét bút: rộng theo lực nhấn
  function veNet(c, n) {
    var p = n.pts; if (!p.length) return;
    c.save(); c.lineCap = 'round'; c.lineJoin = 'round'; c.strokeStyle = n.mau; c.fillStyle = n.mau;
    if (n.kieu === 'dq') {
      c.globalAlpha = 0.38; c.lineWidth = n.co;
      c.beginPath(); c.moveTo(p[0][0], p[0][1]);
      if (p.length === 1) c.lineTo(p[0][0] + 0.1, p[0][1]);
      for (var i = 1; i < p.length - 1; i++) c.quadraticCurveTo(p[i][0], p[i][1], (p[i][0] + p[i + 1][0]) / 2, (p[i][1] + p[i + 1][1]) / 2);
      if (p.length > 1) c.lineTo(p[p.length - 1][0], p[p.length - 1][1]);
      c.stroke(); c.restore(); return;
    }
    var rong = function (k) { return n.co * (0.45 + 0.9 * (p[k][2] == null ? 0.5 : p[k][2])); };
    if (p.length === 1) { c.beginPath(); c.arc(p[0][0], p[0][1], rong(0) / 2, 0, Math.PI * 2); c.fill(); c.restore(); return; }
    var a = { x: p[0][0], y: p[0][1] };
    for (var j = 1; j < p.length; j++) {
      var b = j < p.length - 1 ? { x: (p[j][0] + p[j + 1][0]) / 2, y: (p[j][1] + p[j + 1][1]) / 2 } : { x: p[j][0], y: p[j][1] };
      c.beginPath(); c.moveTo(a.x, a.y); c.quadraticCurveTo(p[j][0], p[j][1], b.x, b.y);
      c.lineWidth = (rong(j - 1) + rong(j)) / 2; c.stroke(); a = b;
    }
    c.restore();
  }

  // Ảnh minh hoạ mô hình (SVG GeoLab → ảnh)
  var anhMoHinh = {};
  function anhCua(hinh, mau) {
    var k = hinh + mau; if (anhMoHinh[k]) return anhMoHinh[k];
    var s = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 90" width="240" height="180" style="color:' + mau + '">' + (GI.BIEU_TUONG[hinh] || '').replace(/currentColor/g, mau) + '</svg>';
    var img = new Image(); img.onload = canVe; img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(s);
    anhMoHinh[k] = img; return img;
  }
  var KT_THE = { w: 230, h: 206 };
  function vungNut(m) { return { x: m.x + 14, y: m.y + KT_THE.h - 50, w: KT_THE.w - 28, h: 36 }; }
  function bo(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
  function veTheMoHinh(c, m, sang) {
    var d = GI.MO_HINH.filter(function (x) { return x.ma === m.ma; })[0]; if (!d) return;
    c.save();
    c.shadowColor = 'rgba(15,23,42,.18)'; c.shadowBlur = 14; c.shadowOffsetY = 4;
    bo(c, m.x, m.y, KT_THE.w, KT_THE.h, 16); c.fillStyle = '#FFFFFF'; c.fill();
    c.shadowColor = 'transparent'; c.lineWidth = sang ? 3 : 1.2; c.strokeStyle = sang ? '#2451C7' : '#D9E0EC'; c.stroke();
    var img = anhCua(d.hinh, '#2451C7'); if (img.complete && img.naturalWidth) c.drawImage(img, m.x + (KT_THE.w - 150) / 2, m.y + 10, 150, 112);
    c.fillStyle = '#16213A'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.font = '700 15px ' + getComputedStyle(document.body).fontFamily;
    var ten = d.ten.length > 30 ? d.ten.slice(0, 29) + '…' : d.ten;
    c.fillText(ten, m.x + KT_THE.w / 2, m.y + 132);
    c.font = '600 12px ' + getComputedStyle(document.body).fontFamily; c.fillStyle = '#5B667D';
    c.fillText((d.nhom === 'khong-gian' ? 'Hình không gian' : 'Hình phẳng') + ' · Lớp ' + d.lop, m.x + KT_THE.w / 2, m.y + 148);
    var n = vungNut(m); bo(c, n.x, n.y, n.w, n.h, 10); c.fillStyle = '#2451C7'; c.fill();
    c.fillStyle = '#FFFFFF'; c.font = '700 13.5px ' + getComputedStyle(document.body).fontFamily; c.fillText('Mở mô hình GeoLab ↗', n.x + n.w / 2, n.y + n.h / 2 + 1);
    c.restore();
  }

  function tenDiemMoi() {
    var dung = {}; trang().hinh.forEach(function (o) { if (o.ten) dung[o.ten] = 1; });
    for (var vong2 = 0; ; vong2++) for (var i = 0; i < 26; i++) { var t = String.fromCharCode(65 + i) + (vong2 ? vong2 : ''); if (!dung[t]) return t; }
  }

  // Vẽ các đối tượng hình học
  // Kiểu nét (độ dài gạch tính theo điểm ảnh màn hình)
  var KIEU_NET = {
    lien: { ten: 'Liền', dash: [] }, dut: { ten: 'Nét đứt', dash: [10, 6] }, gach: { ten: 'Gạch nhỏ', dash: [5, 4] },
    cham: { ten: 'Chấm', dash: [0.1, 6] }, gachCham: { ten: 'Gạch – chấm', dash: [11, 5, 0.1, 5] },
  };
  var KY_HIEU = [['', 'Không'], ['1', '|'], ['2', '||'], ['3', '|||'], ['>', '>'], ['>>', '>>'], ['>>>', '>>>']];
  function hienTenCua(o) { return o.hienTen != null ? o.hienTen : H.LA_DIEM[o.loai] === 1; }
  // Đặt màu, độ dày, kiểu nét cho đối tượng o
  function datNet(c, o, px, sang, rongMacDinh, mauMacDinh) {
    var w = o.rong || rongMacDinh || 2.6;
    c.strokeStyle = o.mau || mauMacDinh; c.lineWidth = w * px;
    var k = KIEU_NET[o.kieuNet] || KIEU_NET.lien;
    c.setLineDash(k.dash.map(function (d) { return d * px * Math.max(1, w / 2.6); }));
    c.lineCap = o.kieuNet === 'cham' || o.kieuNet === 'gachCham' ? 'round' : 'butt';
    return w;
  }
  // Nét của đường đang có (path hiện tại): vẽ viền sáng nếu đang chọn / rê chuột, rồi vẽ nét thật
  function keNet(c, sang, w, px) {
    if (sang) { c.save(); c.setLineDash([]); c.lineCap = 'round'; c.strokeStyle = 'rgba(249,115,22,.42)'; c.lineWidth = (w + 9) * px; c.stroke(); c.restore(); }
    c.stroke(); c.setLineDash([]);
  }
  function veMuiTen(c, P, u, w, kieu, px, mau) {   // mũi tên tại P, hướng u (đơn vị) chỉ ra ngoài
    var L = Math.max(11, w * 4) * px, R = L * 0.55, n = { x: -u.y, y: u.x }, G = { x: P.x - u.x * L, y: P.y - u.y * L };
    c.save(); c.setLineDash([]); c.lineCap = 'round'; c.lineJoin = 'round';
    c.beginPath(); c.moveTo(G.x + n.x * R, G.y + n.y * R); c.lineTo(P.x, P.y); c.lineTo(G.x - n.x * R, G.y - n.y * R);
    if (kieu === 'v') { c.strokeStyle = mau; c.lineWidth = Math.max(2, w) * px; c.stroke(); }
    else { c.closePath(); c.fillStyle = mau; c.fill(); }
    c.restore();
  }
  function veKyHieu(c, A, B, kh, px, mau, w) {   // kí hiệu đoạn bằng nhau (|, ||, |||) hoặc song song (>, >>, >>>)
    if (!kh) return;
    var u = { x: B.x - A.x, y: B.y - A.y }, L = Math.hypot(u.x, u.y); if (L < 1e-9) return; u = { x: u.x / L, y: u.y / L };
    var n = { x: -u.y, y: u.x }, M = { x: (A.x + B.x) / 2, y: (A.y + B.y) / 2 }, so = kh.length === 1 && kh !== '>' ? +kh : kh.length, khoang = 5 * px;
    c.save(); c.setLineDash([]); c.strokeStyle = mau; c.lineWidth = Math.max(1.8, w * 0.75) * px; c.lineCap = 'round'; c.lineJoin = 'round';
    for (var i = 0; i < so; i++) {
      var d = (i - (so - 1) / 2) * khoang * (kh.charAt(0) === '>' ? 1.4 : 1), C = { x: M.x + u.x * d, y: M.y + u.y * d };
      c.beginPath();
      if (kh.charAt(0) === '>') { var a = 6 * px; c.moveTo(C.x - u.x * a + n.x * a, C.y - u.y * a + n.y * a); c.lineTo(C.x, C.y); c.lineTo(C.x - u.x * a - n.x * a, C.y - u.y * a - n.y * a); }
      else { var h = 7 * px; c.moveTo(C.x + n.x * h, C.y + n.y * h); c.lineTo(C.x - n.x * h, C.y - n.y * h); }
      c.stroke();
    }
    c.restore();
  }
  function veTen(c, ten, x, y, px, mau) {
    c.save(); c.setLineDash([]);
    c.font = 'italic 600 ' + (19 * px) + 'px "Cambria Math", "Times New Roman", serif'; c.textAlign = 'left'; c.textBaseline = 'bottom';
    c.lineWidth = 4 * px; c.strokeStyle = kieuNen().mau; c.lineJoin = 'round'; c.strokeText(ten, x, y);
    c.fillStyle = mau; c.fillText(ten, x, y); c.restore();
  }

  // Vẽ các đối tượng hình học (bỏ qua đối tượng đang ẩn)
  function veHinh(c, vn, s, gt, toSang) {
    var px = 1 / s, t = trang(), fam = getComputedStyle(document.body).fontFamily;
    var mauChinh = mauNet(), mauSang = '#F97316', mauChu = kieuNen().toi ? '#F8FAFC' : '#16213A';
    function sang(o) { return toSang && toSang[o.id]; }
    function hien(o) { return !o.an; }
    function keThang(v, o) {
      var u = { x: v.q.x - v.p.x, y: v.q.y - v.p.y }, L = Math.hypot(u.x, u.y); u = { x: u.x / L, y: u.y / L };
      var R = Math.hypot(vn.x1 - vn.x0, vn.y1 - vn.y0) * 2, A, B;
      if (v.loai === 'doan') { A = v.p; B = v.q; }
      else { var ga = { x: (vn.x0 + vn.x1) / 2, y: (vn.y0 + vn.y1) / 2 }, k = (ga.x - v.p.x) * u.x + (ga.y - v.p.y) * u.y;
        A = v.loai === 'tia' ? v.p : { x: v.p.x + u.x * (k - R), y: v.p.y + u.y * (k - R) }; B = { x: v.p.x + u.x * (Math.max(k, 0) + R), y: v.p.y + u.y * (Math.max(k, 0) + R) }; }
      var w = datNet(c, o, px, sang(o), 2.6, mauChinh), mau = c.strokeStyle;
      // chừa chỗ cho mũi tên đặc để đầu nét không lòi ra
      var bot = Math.max(11, w * 4) * px * 0.7, A2 = A, B2 = B;
      if (v.loai === 'doan' && o.muiDau && o.kieuMui !== 'v') A2 = { x: A.x + u.x * bot, y: A.y + u.y * bot };
      if (v.loai === 'doan' && o.muiCuoi && o.kieuMui !== 'v') B2 = { x: B.x - u.x * bot, y: B.y - u.y * bot };
      c.beginPath(); c.moveTo(A2.x, A2.y); c.lineTo(B2.x, B2.y); keNet(c, sang(o), w, px);
      if (v.loai === 'doan') {
        if (o.muiDau) veMuiTen(c, A, { x: -u.x, y: -u.y }, w, o.kieuMui, px, mau);
        if (o.muiCuoi) veMuiTen(c, B, u, w, o.kieuMui, px, mau);
        veKyHieu(c, A, B, o.kyHieu, px, mau, w);
      }
      if (o.ten && hienTenCua(o)) {
        var M = v.loai === 'doan' ? { x: (A.x + B.x) / 2, y: (A.y + B.y) / 2 } : { x: v.q.x + u.x * 30 * px, y: v.q.y + u.y * 30 * px }, n = { x: -u.y, y: u.x };
        if (n.y > 0) n = { x: -n.x, y: -n.y };
        veTen(c, o.ten, M.x + n.x * 12 * px, M.y + n.y * 12 * px, px, o.mau || mauChu);
      }
    }
    // đa giác (tô) trước
    t.hinh.forEach(function (o) {
      var v = gt[o.id]; if (!v || v.k !== 'daGiac' || !hien(o)) return;
      c.beginPath(); v.ds.forEach(function (P, i) { i ? c.lineTo(P.x, P.y) : c.moveTo(P.x, P.y); }); c.closePath();
      c.save(); c.globalAlpha = o.doMo == null ? 0.16 : o.doMo; c.fillStyle = o.mau || (kieuNen().toi ? '#93C5FD' : '#3B82F6'); c.fill(); c.restore();
      keNet(c, sang(o), datNet(c, o, px, sang(o), 2.6, mauChinh), px);
    });
    // đồ thị hàm số
    var demHam = 0;
    t.hinh.forEach(function (o) {
      if (o.loai !== 'hamSo') return; var v = gt[o.id], mau = o.mau || MAU_HAM[demHam++ % MAU_HAM.length];
      if (!v || !hien(o)) return;
      c.beginPath(); var dangVe = false, truocY = null, buoc = 1.5 * px, nhanP = null;
      for (var X = vn.x0; X <= vn.x1 + buoc; X += buoc) {
        var y = v.f(X / DV), Y = -y * DV;
        if (!isFinite(Y) || Math.abs(Y) > 1e6 || (truocY !== null && Math.abs(Y - truocY) > (vn.y1 - vn.y0) * 3)) { dangVe = false; truocY = null; continue; }
        if (dangVe) c.lineTo(X, Y); else { c.moveTo(X, Y); dangVe = true; }
        truocY = Y;
        if (Y > vn.y0 + 110 * px && Y < vn.y1 - 70 * px && X < vn.x1 - 170 * px) nhanP = { x: X, y: Y };
      }
      c.lineJoin = 'round'; keNet(c, sang(o), datNet(c, o, px, sang(o), 3, mau), px);
      if (nhanP && o.hienTen !== false) { c.font = '600 ' + (17 * px) + 'px "Cambria Math", "Times New Roman", serif'; c.fillStyle = mau; c.textAlign = 'left'; c.textBaseline = 'bottom'; c.fillText(v.ve, nhanP.x + 6 * px, nhanP.y - 6 * px); }
    });
    // đường thẳng, đoạn, tia, đường tròn
    t.hinh.forEach(function (o) {
      var v = gt[o.id]; if (!v || !hien(o)) return;
      if (v.k === 'thang') keThang(v, o);
      else if (v.k === 'tron') {
        var wT = datNet(c, o, px, sang(o), 2.6, mauChinh); c.beginPath(); c.arc(v.c.x, v.c.y, v.r, 0, Math.PI * 2); keNet(c, sang(o), wT, px);
        if (o.ten && hienTenCua(o)) { var a = -Math.PI / 4; veTen(c, o.ten, v.c.x + Math.cos(a) * v.r + 6 * px, v.c.y + Math.sin(a) * v.r - 4 * px, px, o.mau || mauChu); }
      }
    });
    // số đo
    t.hinh.forEach(function (o) {
      var v = gt[o.id]; if (!v || !hien(o)) return;
      if (v.k === 'goc') {
        var r = 30 * px, mauG = o.mau || '#16A34A'; c.beginPath(); c.moveTo(v.o.x, v.o.y); c.arc(v.o.x, v.o.y, r, v.a1, v.a1 + v.da, v.da < 0); c.closePath();
        c.save(); c.globalAlpha = 0.18; c.fillStyle = mauG; c.fill(); c.restore();
        c.beginPath(); c.arc(v.o.x, v.o.y, r, v.a1, v.a1 + v.da, v.da < 0); c.strokeStyle = sang(o) ? mauSang : mauG; c.lineWidth = 2.2 * px; c.stroke();
        if (hienSo) { var am = v.a1 + v.da / 2; c.font = '700 ' + (16 * px) + 'px ' + fam; c.fillStyle = mauG; c.textAlign = 'center'; c.textBaseline = 'middle';
          c.fillText(soVN(v.do, 1) + '°', v.o.x + Math.cos(am) * (r + 22 * px), v.o.y + Math.sin(am) * (r + 22 * px)); }
      } else if (v.k === 'doDai' && hienSo) {
        var mx = (v.a.x + v.b.x) / 2, my = (v.a.y + v.b.y) / 2, nx = -(v.b.y - v.a.y) / v.d, ny = (v.b.x - v.a.x) / v.d;
        if (ny > 0) { nx = -nx; ny = -ny; }
        var ta = timTheoId(o.a), tb = timTheoId(o.b), chu = (ta && tb && ta.ten && tb.ten ? ta.ten + tb.ten + ' = ' : '') + soVN(v.d / DV, 2) + ' cm';
        c.font = '700 ' + (15 * px) + 'px ' + fam; var w = c.measureText(chu).width + 14 * px, X2 = mx + nx * 20 * px, Y2 = my + ny * 20 * px;
        bo(c, X2 - w / 2, Y2 - 12 * px, w, 24 * px, 12 * px); c.fillStyle = sang(o) ? mauSang : (o.mau || '#DC2626'); c.fill();
        c.fillStyle = '#fff'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(chu, X2, Y2 + px);
      }
    });
    // điểm và tên điểm
    t.hinh.forEach(function (o) {
      var v = gt[o.id]; if (!v || v.k !== 'diem' || !hien(o)) return;
      var tuDo = o.loai === 'diem' || o.loai === 'diemTren', r = o.rong || 5;
      if (sang(o)) { c.beginPath(); c.arc(v.x, v.y, (r + 6) * px, 0, Math.PI * 2); c.fillStyle = 'rgba(249,115,22,.4)'; c.fill(); }
      c.beginPath(); c.arc(v.x, v.y, r * px, 0, Math.PI * 2);
      c.fillStyle = o.mau || (tuDo ? '#2451C7' : (kieuNen().toi ? '#E5E7EB' : '#334155')); c.fill();
      c.lineWidth = 1.5 * px; c.strokeStyle = kieuNen().toi ? '#111827' : '#FFFFFF'; c.stroke();
      if (o.ten && hienTenCua(o)) veTen(c, o.ten, v.x + (r + 2) * px, v.y - (r) * px, px, mauChu);
    });
  }

  var giaTri = {};   // toạ độ đã tính của trang hiện tại
  function ve() {
    var t = trang(), vn = vungNhin(), s = V.s;
    ctx.setTransform(dpr * s, 0, 0, dpr * s, -V.x * s * dpr, -V.y * s * dpr);
    veNen(ctx, vn, s);
    if (coTruc()) veTruc(ctx, vn, s);
    giaTri = H.tinh(t.hinh);
    var sang = {}; if (diDuoi) sang[diDuoi] = 1; if (chonId) sang[chonId] = 1; choChon.forEach(function (x) { if (x.id) sang[x.id] = 1; });
    veHinh(ctx, vn, s, giaTri, sang);
    t.moHinh.forEach(function (m) { veTheMoHinh(ctx, m, dangChon && dangChon.moHinh === m); });
    t.net.forEach(function (n) { veNet(ctx, n); });
    if (dangChon && dangChon.net) { ctx.save(); ctx.setLineDash([6 / s, 5 / s]); ctx.strokeStyle = '#2451C7'; ctx.lineWidth = 1.5 / s; var bb = khungNet(dangChon.net); ctx.strokeRect(bb.x0 - 6 / s, bb.y0 - 6 / s, bb.x1 - bb.x0 + 12 / s, bb.y1 - bb.y0 + 12 / s); ctx.restore(); }
    veXemTruoc(ctx, s);
  }

  // Xem trước khi đang dựng (đường từ điểm đã chọn tới con trỏ)
  var xemTruoc = null, conTro = null;
  function veXemTruoc(c, s) {
    if (!conTro || !choChon.length) return;
    var px = 1 / s, P0 = choChon[0].id && giaTri[choChon[0].id];
    c.save(); c.setLineDash([7 * px, 6 * px]); c.strokeStyle = '#F97316'; c.lineWidth = 2 * px;
    var M = conTro;
    if ((cc === 'doan' || cc === 'duong' || cc === 'tia' || cc === 'doDai' || cc === 'trungDiem') && P0 && P0.k === 'diem') { c.beginPath(); c.moveTo(P0.x, P0.y); c.lineTo(M.x, M.y); c.stroke(); }
    else if (cc === 'tron' && P0 && P0.k === 'diem') { c.beginPath(); c.arc(P0.x, P0.y, Math.hypot(M.x - P0.x, M.y - P0.y), 0, Math.PI * 2); c.stroke(); }
    else if (cc === 'daGiac' || cc === 'goc') {
      c.beginPath(); choChon.forEach(function (x, i) { var P = giaTri[x.id]; if (P) { i ? c.lineTo(P.x, P.y) : c.moveTo(P.x, P.y); } }); c.lineTo(M.x, M.y); c.stroke();
    }
    c.restore();
  }

  /* =====================================================================
     CHỌN ĐỐI TƯỢNG DƯỚI CON TRỎ
     ===================================================================== */
  function nguong(px) { return px / V.s; }
  function timDiem(M) {
    var tot = null, d0 = nguong(14);
    trang().hinh.forEach(function (o) { var v = giaTri[o.id]; if (v && v.k === 'diem' && !o.an) { var d = H.kc(v, M); if (d < d0) { d0 = d; tot = o; } } });
    return tot;
  }
  function timDoiTuong(M, loc) {
    var tot = null, d0 = nguong(11);
    trang().hinh.forEach(function (o) {
      var v = giaTri[o.id]; if (!v || o.an || (loc && !loc(o, v))) return;
      var d = v.k === 'ham' ? khoangCachHam(v, M) : H.khoangCach(v, M);
      if (d < d0) { d0 = d; tot = o; }
    });
    return tot;
  }
  function khoangCachHam(v, M) { var y = -v.f(M.x / DV) * DV; return isFinite(y) ? Math.abs(y - M.y) : Infinity; }
  function laDuongTron(o, v) { return v.k === 'thang' || v.k === 'tron'; }
  function laThang(o, v) { return v.k === 'thang'; }
  function timGiaoGan(M) {
    var ds = trang().hinh.filter(function (o) { var v = giaTri[o.id]; return v && !o.an && laDuongTron(o, v) && H.khoangCach(v, M) < nguong(16); }), tot = null, d0 = nguong(14);
    for (var i = 0; i < ds.length; i++) for (var j = i + 1; j < ds.length; j++) {
      H.catNhau(giaTri[ds[i].id], giaTri[ds[j].id]).forEach(function (P, k) { var d = H.kc(P, M); if (d < d0) { d0 = d; tot = { o1: ds[i].id, o2: ds[j].id, k: k }; } });
    }
    return tot;
  }
  function batLuoi(M) {
    if (!kieuNen().luoi) return M;
    var g = { x: Math.round(M.x / DV) * DV, y: Math.round(M.y / DV) * DV };
    return H.kc(g, M) < nguong(10) ? g : M;
  }
  function themHinh(o) {
    if (!o.ten && (H.LA_THANG[o.loai] || o.loai === 'tron')) o.ten = tenDuongMoi();
    trang().hinh.push(o); giaTri = H.tinh(trang().hinh); return o;
  }
  function tenDuongMoi() {   // tên chữ thường cho đường thẳng, đoạn, tia, đường tròn (ẩn tên theo mặc định)
    var dung = {}; trang().hinh.forEach(function (o) { if (o.ten) dung[o.ten] = 1; });
    var chu = 'abcdefghkmnpqrstuvw';
    for (var vong2 = 0; ; vong2++) for (var i = 0; i < chu.length; i++) { var t = chu[i] + (vong2 ? vong2 : ''); if (!dung[t]) return t; }
  }
  // Lấy (hoặc tạo) điểm tại vị trí M, kiểu GeoGebra
  function layDiem(M) {
    var d = timDiem(M); if (d) return d.id;
    var g = timGiaoGan(M);
    if (g) return themHinh({ id: idMoi('d'), loai: 'giao', o1: g.o1, o2: g.o2, k: g.k, ten: tenDiemMoi() }).id;
    var tren = timDoiTuong(M, laDuongTron);
    if (tren) return themHinh({ id: idMoi('d'), loai: 'diemTren', tren: tren.id, t: H.thamSo(giaTri[tren.id], M), ten: tenDiemMoi() }).id;
    var P = batLuoi(M);
    return themHinh({ id: idMoi('d'), loai: 'diem', x: P.x, y: P.y, ten: tenDiemMoi() }).id;
  }

  /* =====================================================================
     XỬ LÝ CÔNG CỤ DỰNG HÌNH (bấm)
     ===================================================================== */
  function bamDungHinh(M) {
    var t = trang();
    function xong() { choChon = []; capNhatGoiY(); canVe(); }
    function batDau() { if (!choChon.length) ghiLichSu(); }
    switch (cc) {
      case 'diem': ghiLichSu(); layDiem(M); xong(); return;
      case 'doan': case 'duong': case 'tia': case 'tron': {
        batDau(); choChon.push({ id: layDiem(M) });
        if (choChon.length === 2) {
          if (choChon[0].id !== choChon[1].id) {
            var o = cc === 'tron' ? { loai: 'tron', o: choChon[0].id, a: choChon[1].id } : { loai: cc, a: choChon[0].id, b: choChon[1].id };
            o.id = idMoi('h'); themHinh(o);
          } else { choChon.pop(); capNhatGoiY(); canVe(); return; }
          xong(); return;
        }
        break;
      }
      case 'trungDiem': case 'doDai': {
        if (!choChon.length && !timDiem(M)) {   // bấm thẳng vào một đoạn
          var dn = timDoiTuong(M, function (o) { return o.loai === 'doan'; });
          if (dn) { ghiLichSu(); themHinh(cc === 'trungDiem' ? { id: idMoi('d'), loai: 'trungDiem', a: dn.a, b: dn.b, ten: tenDiemMoi() } : { id: idMoi('h'), loai: 'doDai', a: dn.a, b: dn.b }); xong(); return; }
        }
        batDau(); choChon.push({ id: layDiem(M) });
        if (choChon.length === 2) {
          if (choChon[0].id === choChon[1].id) { choChon.pop(); break; }
          themHinh(cc === 'trungDiem' ? { id: idMoi('d'), loai: 'trungDiem', a: choChon[0].id, b: choChon[1].id, ten: tenDiemMoi() } : { id: idMoi('h'), loai: 'doDai', a: choChon[0].id, b: choChon[1].id });
          xong(); return;
        }
        break;
      }
      case 'vuongGoc': case 'songSong': {
        var daDiem = choChon.filter(function (x) { return x.diem; })[0], daThang = choChon.filter(function (x) { return x.thang; })[0];
        var th = !daThang && timDoiTuong(M, laThang), dm = timDiem(M);
        batDau();
        if (!daThang && th && !dm) choChon.push({ id: th.id, thang: true });
        else if (!daDiem) choChon.push({ id: layDiem(M), diem: true });
        else if (!daThang && th) choChon.push({ id: th.id, thang: true });
        else { thongBao('Hãy chọn một đường thẳng, đoạn thẳng hoặc tia'); break; }
        daDiem = choChon.filter(function (x) { return x.diem; })[0]; daThang = choChon.filter(function (x) { return x.thang; })[0];
        if (daDiem && daThang) { themHinh({ id: idMoi('h'), loai: cc, d: daThang.id, a: daDiem.id }); xong(); return; }
        break;
      }
      case 'giao': {
        var dt = timDoiTuong(M, laDuongTron);
        if (!dt) { thongBao('Hãy bấm vào đường thẳng, đoạn thẳng, tia hoặc đường tròn'); break; }
        if (choChon.length && choChon[0].id === dt.id) break;
        choChon.push({ id: dt.id });
        if (choChon.length === 2) {
          var c2 = H.catNhau(giaTri[choChon[0].id], giaTri[choChon[1].id]);
          if (!c2.length) { thongBao('Hai đối tượng này không cắt nhau'); xong(); return; }
          ghiLichSu();
          c2.forEach(function (P, k) { themHinh({ id: idMoi('d'), loai: 'giao', o1: choChon[0].id, o2: choChon[1].id, k: k, ten: tenDiemMoi() }); });
          xong(); return;
        }
        break;
      }
      case 'daGiac': {
        var dd = timDiem(M);
        if (choChon.length >= 3 && dd && dd.id === choChon[0].id) {
          themHinh({ id: idMoi('h'), loai: 'daGiac', ds: choChon.map(function (x) { return x.id; }) }); xong(); return;
        }
        batDau(); var id = layDiem(M);
        if (!choChon.some(function (x) { return x.id === id; })) choChon.push({ id: id });
        break;
      }
      case 'goc': {
        batDau(); choChon.push({ id: layDiem(M) });
        if (choChon.length === 3) {
          var ids = choChon.map(function (x) { return x.id; });
          if (ids[0] !== ids[1] && ids[1] !== ids[2] && ids[0] !== ids[2]) themHinh({ id: idMoi('h'), loai: 'goc', a: ids[0], o: ids[1], b: ids[2] });
          xong(); return;
        }
        break;
      }
      case 'xoa': {
        var mh = timMoHinh(M);
        var dx = timDiem(M) || timDoiTuong(M) || timSoDo(M);
        if (!dx && mh) { ghiLichSu(); t.moHinh.splice(t.moHinh.indexOf(mh), 1); canVe(); return; }
        if (!dx) return thongBao('Không có hình ở đây. Để xoá nét viết, dùng Tẩy.');
        ghiLichSu(); var bo2 = H.phuThuoc(t.hinh, dx.id);
        t.hinh = t.hinh.filter(function (o) { return !bo2[o.id]; }); if (chonId && !timTheoId(chonId)) dongThuocTinh(); else if (chonId) veThuocTinh(); canVe(); return;
      }
    }
    capNhatGoiY(); canVe();
  }
  function timSoDo(M) {
    var tot = null, d0 = nguong(30);
    trang().hinh.forEach(function (o) {
      var v = giaTri[o.id]; if (!v || o.an) return;
      var P = v.k === 'goc' ? v.o : v.k === 'doDai' ? { x: (v.a.x + v.b.x) / 2, y: (v.a.y + v.b.y) / 2 } : null;
      if (P && H.kc(P, M) < d0) { d0 = H.kc(P, M); tot = o; }
    });
    return tot;
  }
  function timMoHinh(M) {
    var ds = trang().moHinh;
    for (var i = ds.length - 1; i >= 0; i--) { var m = ds[i]; if (M.x >= m.x && M.x <= m.x + KT_THE.w && M.y >= m.y && M.y <= m.y + KT_THE.h) return m; }
    return null;
  }
  function trongNutMoHinh(M) {
    var m = timMoHinh(M); if (!m) return null;
    var n = vungNut(m); return M.x >= n.x && M.x <= n.x + n.w && M.y >= n.y && M.y <= n.y + n.h ? m : null;
  }
  function moLinkMoHinh(m) {
    var d = GI.MO_HINH.filter(function (x) { return x.ma === m.ma; })[0]; if (!d) return;
    thongBao('Đang mở “' + d.ten + '” trên GeoLab…');
    if (MT) MT.moLink(d.url); else window.open(d.url, '_blank', 'noopener');
  }

  /* =====================================================================
     NÉT VIẾT: chọn, tẩy
     ===================================================================== */
  function khungNet(n) { var b = { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity }; n.pts.forEach(function (p) { b.x0 = Math.min(b.x0, p[0]); b.y0 = Math.min(b.y0, p[1]); b.x1 = Math.max(b.x1, p[0]); b.y1 = Math.max(b.y1, p[1]); }); return b; }
  function kcDiemDoan(M, A, B) { var ux = B[0] - A[0], uy = B[1] - A[1], L2 = ux * ux + uy * uy, t = L2 ? Math.max(0, Math.min(1, ((M.x - A[0]) * ux + (M.y - A[1]) * uy) / L2)) : 0; return Math.hypot(M.x - A[0] - ux * t, M.y - A[1] - uy * t); }
  function netCham(n, M, r) {
    var b = khungNet(n), m = r + n.co; if (M.x < b.x0 - m || M.x > b.x1 + m || M.y < b.y0 - m || M.y > b.y1 + m) return false;
    if (n.pts.length === 1) return Math.hypot(M.x - n.pts[0][0], M.y - n.pts[0][1]) < r + n.co / 2;
    for (var i = 1; i < n.pts.length; i++) if (kcDiemDoan(M, n.pts[i - 1], n.pts[i]) < r + n.co / 2) return true;
    return false;
  }
  function timNet(M) { var ds = trang().net; for (var i = ds.length - 1; i >= 0; i--) if (netCham(ds[i], M, nguong(8))) return ds[i]; return null; }

  /* =====================================================================
     SỰ KIỆN CON TRỎ (bút, chuột, chạm)
     ===================================================================== */
  var conTroDS = {}, chum = null, dangKeo = null, netDang = null, daThayBut = false, daGhiTay = false;
  var dangChon = null, diDuoi = null, laser = [];
  function toaDo(e) { var r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
  function lucNhan(e) { return e.pointerType === 'pen' ? (e.pressure || 0.5) : 0.5; }

  cv.addEventListener('pointerdown', function (e) {
    if (e.pointerType === 'pen') daThayBut = true;
    cv.setPointerCapture(e.pointerId);
    var p = toaDo(e); conTroDS[e.pointerId] = p;
    var soCham = Object.keys(conTroDS).length;
    if (soCham === 2) { huyNetDang(); var ds = Object.keys(conTroDS).map(function (k) { return conTroDS[k]; }); chum = { d: Math.hypot(ds[0].x - ds[1].x, ds[0].y - ds[1].y), s: V.s, m: { x: (ds[0].x + ds[1].x) / 2, y: (ds[0].y + ds[1].y) / 2 }, V: { x: V.x, y: V.y } }; dangKeo = null; return; }
    if (soCham > 2) return;
    var M = veTG(p.x, p.y);
    // Nút "Mở mô hình GeoLab" bấm được ở mọi công cụ (trừ bút, tẩy)
    var nutMH = cc !== 'but' && cc !== 'dq' && cc !== 'tay' && cc !== 'thang' && trongNutMoHinh(M);
    if (nutMH && e.button === 0) { moLinkMoHinh(nutMH); return; }
    $('#menu').classList.add('an');
    var keoTrang = e.button === 1 || cc === 'keo' || (e.pointerType === 'touch' && daThayBut && (cc === 'but' || cc === 'dq' || cc === 'tay' || cc === 'thang'));
    if (keoTrang) { dangKeo = { loai: 'trang', p: p, V: { x: V.x, y: V.y } }; cv.style.cursor = 'grabbing'; return; }
    if (e.button === 2) return;
    if (cc === 'thang') { netDang = { loai: 'net', kieu: 'but', mau: butCfg.mau, co: butCfg.co, thang: true, pts: [[M.x, M.y, 0.6], [M.x, M.y, 0.6]] }; veNhap(); return; }
    if (cc === 'but' || cc === 'dq') {
      var cfg = cc === 'but' ? butCfg : dqCfg;
      netDang = { loai: 'net', kieu: cc, mau: cfg.mau, co: cfg.co, pts: [[M.x, M.y, lucNhan(e)]] };
      veNhap(); return;
    }
    if (cc === 'tay') { daGhiTay = false; tay(M); dangKeo = { loai: 'tay' }; veNhap(M); return; }
    if (cc === 'laser') { laser.push({ x: M.x, y: M.y, t: performance.now(), moi: true }); dangKeo = { loai: 'laser' }; chayLaser(); return; }
    if (cc === 'chon') {
      var d = timDiem(M);
      if (d) { moThuocTinh(d.id); if ((d.loai === 'diem' || d.loai === 'diemTren') && !d.coDinh) { ghiLichSu(); dangKeo = { loai: 'diem', o: d }; } return; }
      var dt = timDoiTuong(M) || timSoDo(M);
      if (dt) { moThuocTinh(dt.id); return; }
      dongThuocTinh();
      var mh = timMoHinh(M);
      if (mh) { ghiLichSu(); dangChon = { moHinh: mh }; dangKeo = { loai: 'moHinh', m: mh, dx: M.x - mh.x, dy: M.y - mh.y }; canVe(); return; }
      var n = timNet(M);
      if (n) { ghiLichSu(); dangChon = { net: n }; dangKeo = { loai: 'net', n: n, truoc: M }; canVe(); return; }
      dangChon = null; dangKeo = { loai: 'trang', p: p, V: { x: V.x, y: V.y } }; canVe(); return;
    }
    bamDungHinh(M);
  });
  cv.addEventListener('pointermove', function (e) {
    var p = toaDo(e);
    if (conTroDS[e.pointerId]) conTroDS[e.pointerId] = p;
    if (chum) {
      var ds = Object.keys(conTroDS).map(function (k) { return conTroDS[k]; }); if (ds.length < 2) return;
      var d = Math.hypot(ds[0].x - ds[1].x, ds[0].y - ds[1].y), m = { x: (ds[0].x + ds[1].x) / 2, y: (ds[0].y + ds[1].y) / 2 };
      var s2 = Math.max(0.2, Math.min(6, chum.s * d / chum.d)), Mw = { x: chum.m.x / chum.s + chum.V.x, y: chum.m.y / chum.s + chum.V.y };
      V.s = s2; V.x = Mw.x - m.x / V.s; V.y = Mw.y - m.y / V.s; capNhatThongTin(); canVe(); return;
    }
    var M = veTG(p.x, p.y); conTro = M;
    if (netDang && netDang.thang) {
      var A0 = netDang.pts[0], dx0 = M.x - A0[0], dy0 = M.y - A0[1], gocN = Math.atan2(dy0, dx0) * 180 / Math.PI, Q = { x: M.x, y: M.y };
      var gan = Math.round(gocN / 45) * 45; if (Math.abs(gocN - gan) < 4) { var L0 = Math.hypot(dx0, dy0), ra = gan * Math.PI / 180; Q = { x: A0[0] + L0 * Math.cos(ra), y: A0[1] + L0 * Math.sin(ra) }; }
      netDang.pts[1] = [Q.x, Q.y, 0.6]; veNhap(); return;
    }
    if (netDang) {
      var evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
      evs.forEach(function (ev) { var q = toaDo(ev), W2 = veTG(q.x, q.y), cuoi = netDang.pts[netDang.pts.length - 1]; if (Math.hypot(W2.x - cuoi[0], W2.y - cuoi[1]) * V.s >= 1.2) netDang.pts.push([W2.x, W2.y, lucNhan(ev)]); });
      veNhap(); return;
    }
    if (dangKeo) {
      if (dangKeo.loai === 'trang') { V.x = dangKeo.V.x - (p.x - dangKeo.p.x) / V.s; V.y = dangKeo.V.y - (p.y - dangKeo.p.y) / V.s; canVe(); return; }
      if (dangKeo.loai === 'tay') { tay(M); veNhap(M); return; }
      if (dangKeo.loai === 'laser') { laser.push({ x: M.x, y: M.y, t: performance.now() }); return; }
      if (dangKeo.loai === 'diem') {
        var o = dangKeo.o;
        if (o.loai === 'diem') { var P = batLuoi(M); o.x = P.x; o.y = P.y; }
        else { var tren = giaTri[o.tren]; if (tren) o.t = H.thamSo(tren, M); }
        daSua = true; canVe(); return;
      }
      if (dangKeo.loai === 'moHinh') { dangKeo.m.x = M.x - dangKeo.dx; dangKeo.m.y = M.y - dangKeo.dy; canVe(); return; }
      if (dangKeo.loai === 'net') { var dx = M.x - dangKeo.truoc.x, dy = M.y - dangKeo.truoc.y; dangKeo.n.pts.forEach(function (q) { q[0] += dx; q[1] += dy; }); dangKeo.truoc = M; canVe(); return; }
    }
    // Rê chuột: làm sáng đối tượng sẽ được chọn
    var cu = diDuoi; diDuoi = null;
    if (cc === 'chon') {
      var dd = timDiem(M), dt2 = dd ? null : (timDoiTuong(M) || timSoDo(M));
      diDuoi = dd ? dd.id : dt2 ? dt2.id : null;
      cv.style.cursor = dd && (dd.loai === 'diem' || dd.loai === 'diemTren') && !dd.coDinh ? 'move' : dt2 ? 'pointer' : timMoHinh(M) || timNet(M) ? 'move' : 'default';
      if (cu !== diDuoi) canVe();
    }
    else if (['diem', 'doan', 'duong', 'tia', 'tron', 'trungDiem', 'vuongGoc', 'songSong', 'giao', 'daGiac', 'xoa', 'doDai', 'goc'].indexOf(cc) >= 0) {
      var dd2 = timDiem(M);
      diDuoi = dd2 ? dd2.id : null;
      if (!diDuoi && (cc === 'giao' || cc === 'vuongGoc' || cc === 'songSong' || cc === 'xoa' || ((cc === 'trungDiem' || cc === 'doDai') && !choChon.length))) {
        var ob = timDoiTuong(M, cc === 'giao' ? laDuongTron : (cc === 'vuongGoc' || cc === 'songSong') ? laThang : (cc === 'xoa' ? null : function (o2) { return o2.loai === 'doan'; }));
        diDuoi = ob ? ob.id : (cc === 'xoa' && timSoDo(M) ? timSoDo(M).id : null);
      }
      canVe();
    }
    if (cc !== 'chon' && trongNutMoHinh(M) && cc !== 'but' && cc !== 'dq' && cc !== 'tay') cv.style.cursor = 'pointer';
    else if (cc !== 'chon') cv.style.cursor = cc === 'keo' ? 'grab' : 'crosshair';
    if (cu !== diDuoi || choChon.length) canVe();
    if (cc === 'tay') veNhap(M);
  });
  function thaTay(e) {
    delete conTroDS[e.pointerId];
    if (chum) { if (Object.keys(conTroDS).length < 2) chum = null; return; }
    if (netDang) {
      delete netDang.thang;
      ghiLichSu(); trang().net.push(netDang); netDang = null; nctx.setTransform(1, 0, 0, 1, 0, 0); nctx.clearRect(0, 0, cvN.width, cvN.height); canVe(); return;
    }
    if (dangKeo && dangKeo.loai === 'trang') cv.style.cursor = cc === 'keo' ? 'grab' : 'default';
    if (dangKeo && dangKeo.loai === 'laser') laser.forEach(function (l) { l.ketThuc = true; });
    dangKeo = null; veNhap();
  }
  cv.addEventListener('pointerup', thaTay);
  cv.addEventListener('pointercancel', function (e) { huyNetDang(); thaTay(e); });
  cv.addEventListener('pointerleave', function () { conTro = null; if (cc === 'tay' && !dangKeo) veNhap(); });
  cv.addEventListener('contextmenu', function (e) {   // chuột phải vào hình → mở Thuộc tính
    e.preventDefault(); var p = toaDo(e), M = veTG(p.x, p.y), o = timDiem(M) || timDoiTuong(M) || timSoDo(M);
    if (o) moThuocTinh(o.id);
  });
  cv.addEventListener('wheel', function (e) {
    e.preventDefault(); var p = toaDo(e);
    if (e.ctrlKey || !e.shiftKey && Math.abs(e.deltaX) < 1) thuPhong(Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.0015)), p.x, p.y);
    else { V.x += e.deltaX / V.s; V.y += e.deltaY / V.s; canVe(); }
  }, { passive: false });
  function huyNetDang() { netDang = null; nctx.setTransform(1, 0, 0, 1, 0, 0); nctx.clearRect(0, 0, cvN.width, cvN.height); }

  function tay(M) {
    var r = tayCo / 2 / V.s, t = trang(), con = t.net.filter(function (n) { return !netCham(n, M, r); });
    if (con.length !== t.net.length) { if (!daGhiTay) { ghiLichSu(); daGhiTay = true; } t.net = con; canVe(); }
  }

  // Lớp nháp: nét đang viết, vòng tẩy, bút chỉ
  function veNhap(M) {
    nctx.setTransform(1, 0, 0, 1, 0, 0); nctx.clearRect(0, 0, cvN.width, cvN.height);
    nctx.setTransform(dpr * V.s, 0, 0, dpr * V.s, -V.x * V.s * dpr, -V.y * V.s * dpr);
    if (netDang) veNet(nctx, netDang);
    if (cc === 'tay' && (M || conTro)) { var P = M || conTro; nctx.beginPath(); nctx.arc(P.x, P.y, tayCo / 2 / V.s, 0, Math.PI * 2); nctx.fillStyle = 'rgba(148,163,184,.25)'; nctx.fill(); nctx.strokeStyle = '#64748B'; nctx.lineWidth = 1.5 / V.s; nctx.stroke(); }
    if (laser.length) {
      var now = performance.now(); nctx.lineCap = 'round'; nctx.lineJoin = 'round';
      for (var i = 1; i < laser.length; i++) {
        if (laser[i].moi) continue;
        var a = 1 - (now - laser[i].t) / 900; if (a <= 0) continue;
        nctx.beginPath(); nctx.moveTo(laser[i - 1].x, laser[i - 1].y); nctx.lineTo(laser[i].x, laser[i].y);
        nctx.strokeStyle = 'rgba(239,68,68,' + a + ')'; nctx.lineWidth = 6 / V.s; nctx.shadowColor = 'rgba(239,68,68,.8)'; nctx.shadowBlur = 12; nctx.stroke();
      }
      nctx.shadowBlur = 0;
      var cuoi = laser[laser.length - 1]; if (now - cuoi.t < 900) { nctx.beginPath(); nctx.arc(cuoi.x, cuoi.y, 7 / V.s, 0, Math.PI * 2); nctx.fillStyle = '#EF4444'; nctx.fill(); }
    }
  }
  var laserChay = false;
  function chayLaser() {
    if (laserChay) return; laserChay = true;
    (function buoc() {
      var now = performance.now(); laser = laser.filter(function (l) { return now - l.t < 900; });
      veNhap();
      if (laser.length || (dangKeo && dangKeo.loai === 'laser')) requestAnimationFrame(buoc); else laserChay = false;
    })();
  }

  /* =====================================================================
     TRANG, NỀN, TỆP
     ===================================================================== */
  function sauKhiDoiTrang() {
    choChon = []; dangChon = null; diDuoi = null;
    if (chonId && !timTheoId(chonId)) dongThuocTinh(); else if (chonId) veThuocTinh();
    capNhatThongTin(); veTabTrang(); veMenuNen();
    capNhatNutBat(); capNhatGoiY(); capNhatTieuDe(); canVe(); veNhap();
  }
  function veTabTrang() {
    $('#tab-trang').innerHTML = tl.trang.map(function (t, i) { return '<button data-trang="' + i + '"' + (i === tl.so ? ' class="bat"' : '') + '>Trang ' + (i + 1) + '</button>'; }).join('') +
      '<button class="them" data-lenh-tab="themTrang" title="Thêm trang">+</button>';
    $$('#tab-trang [data-trang]').forEach(function (b) { b.onclick = function () { tl.so = +b.dataset.trang; sauKhiDoiTrang(); }; });
    $('#tab-trang .them').onclick = function () { LENH.themTrang(); };
  }
  function veMenuNen() {
    $('#nen-menu').innerHTML = Object.keys(NEN).map(function (k) {
      var n = NEN[k], hinh = n.luoi === 'ke' ? 'repeating-linear-gradient(#fff 0 9px,#C7D7F1 9px 10px)' : n.luoi === 'vuong' ? 'linear-gradient(#DCE6F5 1px,transparent 1px) 0 0/10px 10px,linear-gradient(90deg,#DCE6F5 1px,#fff 1px) 0 0/10px 10px' : n.luoi === 'ly' ? 'repeating-linear-gradient(#FFFDF7 0 4px,#E8E2F2 4px 5px)' : n.mau;
      return '<button data-nen="' + k + '"' + (trang().nen === k ? ' class="bat"' : '') + '><span class="mau-nen" style="background:' + hinh + '"></span>' + n.ten + '</button>';
    }).join('');
    $$('#nen-menu [data-nen]').forEach(function (b) { b.onclick = function () { datNen(b.dataset.nen); }; });
  }
  function datNen(k) {
    ghiLichSu(); trang().nen = k;
    var toi = kieuNen().toi;
    if (toi && /^#(111827|1e3a8a|2563eb)$/i.test(butCfg.mau)) butCfg.mau = '#FFFFFF';
    if (!toi && /^#ffffff$/i.test(butCfg.mau)) butCfg.mau = '#111827';
    capNhatTuyChonBut(); veMenuNen(); canVe();
  }
  function capNhatNutBat() {
    var nt = $('[data-lenh="truc"]'); if (nt) nt.classList.toggle('bat', !!trang().truc);
    var ns = $('#nut-so-do'); if (ns) ns.classList.toggle('bat', hienSo);
  }
  function capNhatTieuDe() {
    var ten = tenTep ? tenTep.split(/[\\/]/).pop() : 'Bảng mới';
    capNhatThongTin();
    document.title = (daSua ? '• ' : '') + ten + ' – GeoInk';
  }
  function thongBao(s) {
    var el = $('#thong-bao'); el.textContent = s; el.classList.remove('an');
    clearTimeout(thongBao.t); thongBao.t = setTimeout(function () { el.classList.add('an'); }, 2600);
  }
  function hoiBoThayDoi() { return !daSua || window.confirm('Bảng hiện tại có thay đổi chưa lưu. Vẫn tiếp tục và bỏ các thay đổi đó?'); }

  function luu(hoiLai) {
    var nd = chup();
    if (MT) {
      return MT.luu(nd, tenTep, hoiLai).then(function (kq) {
        if (kq.huy) return false; if (kq.loi) { thongBao('Không lưu được: ' + kq.loi); return false; }
        tenTep = kq.ten; daSua = false; capNhatTieuDe(); thongBao('Đã lưu'); return true;
      });
    }
    var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([nd], { type: 'application/json' })); a.download = (tenTep || 'Bang-GeoInk') + '.geoink'; a.click();
    daSua = false; capNhatTieuDe(); return Promise.resolve(true);
  }
  function napTep(d) {
    if (!d || d.huy) return; if (d.loi) return thongBao('Không mở được tệp: ' + d.loi);
    try { napTaiLieu(d.noiDung); tenTep = d.ten; daSua = false; truoc = []; sauLS = []; vuaNoiDung(); sauKhiDoiTrang(); thongBao('Đã mở ' + d.ten.split(/[\\/]/).pop()); }
    catch (e) { thongBao('Không mở được tệp: ' + e.message); }
  }
  function mo() {
    if (!hoiBoThayDoi()) return;
    if (MT) return MT.mo().then(napTep);
    var inp = document.createElement('input'); inp.type = 'file'; inp.accept = '.geoink,application/json';
    inp.onchange = function () { var f = inp.files[0]; if (!f) return; f.text().then(function (s) { napTep({ ten: f.name, noiDung: s }); }); };
    inp.click();
  }
  function moi() {
    if (!hoiBoThayDoi()) return;
    tl = { app: 'GeoInk', phienBan: 1, trang: [trangMoi('giayKe')], so: 0 }; tenTep = null; daSua = false; truoc = []; sauLS = [];
    V = { x: -W / 2, y: -Hh / 2, s: 1 }; capNhatThongTin(); sauKhiDoiTrang();
  }
  // Khung bao nội dung trang (thế giới)
  function khungNoiDung() {
    var t = trang(), b = { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity };
    function them(x, y) { b.x0 = Math.min(b.x0, x); b.y0 = Math.min(b.y0, y); b.x1 = Math.max(b.x1, x); b.y1 = Math.max(b.y1, y); }
    t.net.forEach(function (n) { var k = khungNet(n); them(k.x0 - n.co, k.y0 - n.co); them(k.x1 + n.co, k.y1 + n.co); });
    t.moHinh.forEach(function (m) { them(m.x, m.y); them(m.x + KT_THE.w, m.y + KT_THE.h); });
    var g = H.tinh(t.hinh);
    t.hinh.forEach(function (o) { var v = g[o.id]; if (!v) return; if (v.k === 'diem') them(v.x, v.y); if (v.k === 'tron') { them(v.c.x - v.r, v.c.y - v.r); them(v.c.x + v.r, v.c.y + v.r); } });
    if (coTruc()) { them(-6 * DV, -5 * DV); them(6 * DV, 5 * DV); }
    return isFinite(b.x0) ? b : null;
  }
  function vuaNoiDung() {
    var b = khungNoiDung(); if (!b) { V = { x: -W / 2, y: -Hh / 2, s: 1 }; }
    else { var le = 60, s = Math.max(0.2, Math.min(2, Math.min(W / (b.x1 - b.x0 + 2 * le), Hh / (b.y1 - b.y0 + 2 * le)))); V = { s: s, x: (b.x0 + b.x1) / 2 - W / 2 / s, y: (b.y0 + b.y1) / 2 - Hh / 2 / s }; }
    capNhatThongTin(); canVe();
  }
  function xuatAnh() {
    var b = khungNoiDung(); if (!b) return thongBao('Trang đang trống');
    var le = 40, k = 2, w = b.x1 - b.x0 + 2 * le, h = b.y1 - b.y0 + 2 * le, s = Math.min(k, 6000 / Math.max(w, h));
    var c = document.createElement('canvas'); c.width = Math.round(w * s); c.height = Math.round(h * s);
    var x2 = c.getContext('2d'), vn = { x0: b.x0 - le, y0: b.y0 - le, x1: b.x1 + le, y1: b.y1 + le };
    x2.setTransform(s, 0, 0, s, -vn.x0 * s, -vn.y0 * s);
    veNen(x2, vn, s); if (coTruc()) veTruc(x2, vn, s);
    veHinh(x2, vn, s, H.tinh(trang().hinh), {}); trang().moHinh.forEach(function (m) { veTheMoHinh(x2, m, false); });
    trang().net.forEach(function (n) { veNet(x2, n); });
    var url = c.toDataURL('image/png'), ten = (tenTep ? tenTep.split(/[\\/]/).pop().replace(/\.geoink$/i, '') : 'GeoInk') + '-trang-' + (tl.so + 1) + '.png';
    if (MT) MT.xuatAnh(url, ten).then(function (kq) { if (kq.ten) thongBao('Đã xuất ảnh'); else if (kq.loi) thongBao('Không xuất được: ' + kq.loi); });
    else { var a = document.createElement('a'); a.href = url; a.download = ten; a.click(); }
  }

  var LENH = {
    moi: moi, mo: mo, luu: function () { luu(false); }, luuThanh: function () { luu(true); }, xuatAnh: xuatAnh, hoanTac: hoanTac, lamLai: lamLai,
    xoaTrangNay: function () {
      if (tl.trang.length < 2) return LENH.xoaTrang();
      if (!window.confirm('Xoá trang ' + (tl.so + 1) + '?')) return;
      ghiLichSu(); tl.trang.splice(tl.so, 1); tl.so = Math.min(tl.so, tl.trang.length - 1); sauKhiDoiTrang();
    },
    xoaTrang: function () { var t = trang(); if (!t.net.length && !t.hinh.length && !t.moHinh.length) return; if (!window.confirm('Xoá hết nét viết, hình và mô hình trên trang này?')) return; ghiLichSu(); t.net = []; t.hinh = []; t.moHinh = []; sauKhiDoiTrang(); },
    trangTruoc: function () { if (tl.so > 0) { tl.so--; sauKhiDoiTrang(); } },
    trangSau: function () { if (tl.so < tl.trang.length - 1) { tl.so++; sauKhiDoiTrang(); } },
    themTrang: function () { ghiLichSu(); tl.trang.splice(tl.so + 1, 0, trangMoi(trang().nen)); tl.so++; sauKhiDoiTrang(); thongBao('Đã thêm trang ' + (tl.so + 1)); },
    truc: function () { ghiLichSu(); trang().truc = !trang().truc; if (trang().truc) { V.x = -W / 2 / V.s; V.y = -Hh / 2 / V.s; } capNhatNutBat(); canVe(); },
    soDo: function () { hienSo = !hienSo; capNhatNutBat(); canVe(); },
    toanManHinh: function () { if (MT) MT.toanManHinh(); else if (!document.fullscreenElement) document.documentElement.requestFullscreen(); else document.exitFullscreen(); },
    thuNho: function () { thuPhong(1 / 1.25); }, phongTo: function () { thuPhong(1.25); },
    vuaKhung: function () { thuPhong(1 / V.s); },
  };

  /* =====================================================================
     HỘP THOẠI: hàm số, mô hình GeoLab
     ===================================================================== */
  function moHopHam() { $('#hop-ham-so').classList.remove('an'); $('#loi-ham').textContent = ''; var i = $('#o-ham'); i.value = ''; setTimeout(function () { i.focus(); }, 30); }
  function veHam() {
    var s = $('#o-ham').value;
    try { GI.bieuThuc.doc(s); } catch (e) { $('#loi-ham').textContent = e.message; return; }
    ghiLichSu();
    var dem = trang().hinh.filter(function (o) { return o.loai === 'hamSo'; }).length;
    themHinh({ id: idMoi('f'), loai: 'hamSo', bt: s.replace(/^\s*(y|f\s*\(\s*x\s*\))\s*=\s*/i, ''), mau: MAU_HAM[dem % MAU_HAM.length] });
    if (!trang().truc && dem === 0) { V.x = -W / 2 / V.s; V.y = -Hh / 2 / V.s; }
    $('#hop-ham-so').classList.add('an'); canVe(); capNhatNutBat();
  }
  var locMH = 'tat-ca';
  function moHopMoHinh() { $('#hop-mo-hinh').classList.remove('an'); veLuoiMoHinh(); }
  function veLuoiMoHinh() {
    var LOC = [['tat-ca', 'Tất cả'], ['khong-gian', 'Hình không gian'], ['6', 'Lớp 6'], ['7', 'Lớp 7'], ['8', 'Lớp 8'], ['9', 'Lớp 9']];
    $('#loc-mo-hinh').innerHTML = LOC.map(function (l) { return '<button data-loc="' + l[0] + '"' + (l[0] === locMH ? ' class="bat"' : '') + '>' + l[1] + '</button>'; }).join('');
    $$('#loc-mo-hinh [data-loc]').forEach(function (b) { b.onclick = function () { locMH = b.dataset.loc; veLuoiMoHinh(); }; });
    var ds = GI.MO_HINH.filter(function (d) { return locMH === 'tat-ca' || (locMH === 'khong-gian' ? d.nhom === 'khong-gian' : d.nhom === 'phang' && String(d.lop) === locMH); });
    $('#luoi-mo-hinh').innerHTML = ds.map(function (d) {
      return '<button class="the-mo-hinh" data-ma="' + d.ma + '"><svg viewBox="0 0 120 90">' + (GI.BIEU_TUONG[d.hinh] || '') + '</svg>' + d.ten + '<small>' + (d.nhom === 'khong-gian' ? 'Không gian' : 'Hình phẳng') + ' · Lớp ' + d.lop + '</small></button>';
    }).join('');
    $$('#luoi-mo-hinh [data-ma]').forEach(function (b) { b.onclick = function () { chenMoHinh(b.dataset.ma); }; });
  }
  function chenMoHinh(ma) {
    ghiLichSu();
    var tam = veTG(W / 2, Hh / 2), lech = (trang().moHinh.length % 5) * 24;
    trang().moHinh.push({ id: idMoi('m'), ma: ma, x: tam.x - KT_THE.w / 2 + lech, y: tam.y - KT_THE.h / 2 + lech });
    $('#hop-mo-hinh').classList.add('an'); chonCongCu('chon'); canVe();
    thongBao('Đã chèn mô hình · kéo để di chuyển, bấm nút xanh để mở trên GeoLab');
  }

  /* =====================================================================
     BẢNG THUỘC TÍNH (bấm vào đối tượng bằng công cụ Chọn, hoặc chuột phải)
     ===================================================================== */
  var chonId = null, tabTT = 'coBan', lsKhoa = null, lsLuc = 0;
  var NHOM_TT = [
    ['Điểm', function (o) { return H.LA_DIEM[o.loai]; }], ['Đoạn thẳng', function (o) { return o.loai === 'doan'; }],
    ['Đường thẳng', function (o) { return o.loai === 'duong' || o.loai === 'vuongGoc' || o.loai === 'songSong'; }], ['Tia', function (o) { return o.loai === 'tia'; }],
    ['Đường tròn', function (o) { return o.loai === 'tron'; }], ['Đa giác', function (o) { return o.loai === 'daGiac'; }],
    ['Số đo', function (o) { return o.loai === 'doDai' || o.loai === 'goc'; }], ['Hàm số', function (o) { return o.loai === 'hamSo'; }],
  ];
  var BANG_MAU = ['#000000', '#374151', '#6B7280', '#9CA3AF', '#FFFFFF', '#7A1E1E', '#DC2626', '#F97316', '#F59E0B', '#EAB308', '#84CC16', '#16A34A',
    '#059669', '#0D9488', '#0891B2', '#0284C7', '#2563EB', '#1F3A8A', '#4F46E5', '#7C3AED', '#9333EA', '#C026D3', '#DB2777', '#92400E'];
  function ghiLichSuGop(khoa) { var now = Date.now(); if (khoa !== lsKhoa || now - lsLuc > 1500) ghiLichSu(); lsKhoa = khoa; lsLuc = now; daSua = true; capNhatTieuDe(); }
  function tenHay(id) { var o = timTheoId(id); return o ? (o.ten || dinhNghia(o)) : '?'; }
  function dinhNghia(o) {
    var T = tenHay;
    switch (o.loai) {
      case 'diem': return 'Điểm(' + soVN(o.x / DV, 2) + '; ' + soVN(-o.y / DV, 2) + ')';
      case 'diemTren': return 'Điểm trên(' + T(o.tren) + ')';
      case 'trungDiem': return 'Trung điểm(' + T(o.a) + ', ' + T(o.b) + ')';
      case 'giao': return 'Giao điểm(' + T(o.o1) + ', ' + T(o.o2) + ')';
      case 'doan': return 'Đoạn thẳng(' + T(o.a) + ', ' + T(o.b) + ')';
      case 'duong': return 'Đường thẳng(' + T(o.a) + ', ' + T(o.b) + ')';
      case 'tia': return 'Tia(' + T(o.a) + ', ' + T(o.b) + ')';
      case 'vuongGoc': return 'Đường vuông góc(qua ' + T(o.a) + ', với ' + T(o.d) + ')';
      case 'songSong': return 'Đường song song(qua ' + T(o.a) + ', với ' + T(o.d) + ')';
      case 'tron': return 'Đường tròn(tâm ' + T(o.o) + ', qua ' + T(o.a) + ')';
      case 'daGiac': return 'Đa giác(' + o.ds.map(T).join(', ') + ')';
      case 'doDai': return 'Độ dài(' + T(o.a) + ', ' + T(o.b) + ')';
      case 'goc': return 'Góc(' + T(o.a) + ', ' + T(o.o) + ', ' + T(o.b) + ')';
      case 'hamSo': return 'y = ' + o.bt;
    }
    return o.loai;
  }
  function mauMacDinh(o) {
    if (o.mau) return o.mau;
    if (H.LA_DIEM[o.loai]) return o.loai === 'diem' || o.loai === 'diemTren' ? '#2451C7' : '#334155';
    if (o.loai === 'goc') return '#16A34A'; if (o.loai === 'doDai') return '#DC2626';
    return mauNet();
  }
  function moThuocTinh(id) { chonId = id; $('#thuoc-tinh').classList.remove('an'); veThuocTinh(); canVe(); }
  function dongThuocTinh() { if (!chonId && $('#thuoc-tinh').classList.contains('an')) return; chonId = null; $('#thuoc-tinh').classList.add('an'); canVe(); }
  function doi(khoa, f) { var o = timTheoId(chonId); if (!o) return; ghiLichSuGop(chonId + ':' + khoa); f(o); canVe(); veDanhSachTT(); }

  function taoBangTT() {
    var el = document.createElement('div'); el.id = 'thuoc-tinh'; el.className = 'an';
    el.innerHTML = '<div class="tt-dau" id="tt-dau"><span><i data-bt="caiDat"></i>Thuộc tính</span><button class="tt-dong" title="Đóng (Esc)"><i data-bt="xoa"></i></button></div>' +
      '<div class="tt-than"><div class="tt-ds" id="tt-ds"></div><div class="tt-phai"><div class="tt-tab" id="tt-tab"></div><div class="tt-noi" id="tt-noi"></div></div></div>';
    $('#bang').appendChild(el); ganBieuTuong(el);
    el.querySelector('.tt-dong').onclick = dongThuocTinh;
    // kéo bảng bằng thanh tiêu đề
    var dau = el.querySelector('#tt-dau'), keoTT = null;
    dau.addEventListener('pointerdown', function (e) { if (e.target.closest('button')) return; var r = el.getBoundingClientRect(), rb = $('#bang').getBoundingClientRect(); keoTT = { dx: e.clientX - r.left, dy: e.clientY - r.top, rb: rb }; dau.setPointerCapture(e.pointerId); });
    dau.addEventListener('pointermove', function (e) { if (!keoTT) return; el.style.left = Math.max(0, Math.min(keoTT.rb.width - 120, e.clientX - keoTT.rb.left - keoTT.dx)) + 'px'; el.style.top = Math.max(0, Math.min(keoTT.rb.height - 60, e.clientY - keoTT.rb.top - keoTT.dy)) + 'px'; el.style.right = 'auto'; });
    dau.addEventListener('pointerup', function () { keoTT = null; });
  }
  function veDanhSachTT() {
    var t = trang(), h = '';
    NHOM_TT.forEach(function (n) {
      var ds = t.hinh.filter(n[1]); if (!ds.length) return;
      h += '<div class="tt-nhom">' + n[0] + '</div>' + ds.map(function (o) {
        return '<button class="tt-muc' + (o.id === chonId ? ' bat' : '') + '" data-id="' + o.id + '" title="' + dinhNghia(o).replace(/"/g, '&quot;') + '">' +
          '<span class="tt-cham' + (o.an ? ' rong' : '') + '" style="--m:' + mauMacDinh(o) + '"></span>' + (o.ten || dinhNghia(o)) + '</button>';
      }).join('');
    });
    $('#tt-ds').innerHTML = h || '<div class="tt-trong">Chưa có hình nào</div>';
    $$('#tt-ds [data-id]').forEach(function (b) { b.onclick = function () { chonId = b.dataset.id; veThuocTinh(); canVe(); }; });
  }
  function svgNet(kieu, w) { var k = KIEU_NET[kieu] || KIEU_NET.lien; return '<svg width="150" height="16"><line x1="6" y1="8" x2="144" y2="8" stroke="#111827" stroke-width="' + (w || 2.6) + '" stroke-linecap="' + (kieu === 'cham' || kieu === 'gachCham' ? 'round' : 'butt') + '" stroke-dasharray="' + k.dash.join(' ') + '"/></svg>'; }
  function svgKyHieu(kh) {
    var g = '<line x1="6" y1="10" x2="144" y2="10" stroke="#111827" stroke-width="2"/>', so = kh.length === 1 && kh !== '>' ? +kh : kh.length;
    for (var i = 0; i < (kh ? so : 0); i++) { var x = 75 + (i - (so - 1) / 2) * (kh.charAt(0) === '>' ? 7 : 5); g += kh.charAt(0) === '>' ? '<path d="M' + (x - 6) + ' 4 L' + x + ' 10 L' + (x - 6) + ' 16" fill="none" stroke="#111827" stroke-width="2"/>' : '<line x1="' + x + '" y1="3" x2="' + x + '" y2="17" stroke="#111827" stroke-width="2"/>'; }
    return '<svg width="150" height="20">' + g + '</svg>';
  }
  function svgMui(kieu) { return '<svg width="150" height="20"><line x1="6" y1="10" x2="' + (kieu === 'v' ? 140 : 132) + '" y2="10" stroke="#111827" stroke-width="2.4"/>' + (kieu === 'v' ? '<path d="M130 4 L141 10 L130 16" fill="none" stroke="#111827" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>' : '<path d="M128 3 L144 10 L128 17 Z" fill="#111827"/>') + '</svg>'; }
  // Ô xổ xuống có hình minh hoạ (kiểu nét, kí hiệu, mũi tên)
  function hopXo(ds, hienTai, khiChon) {
    var w = document.createElement('div'); w.className = 'tt-xo';
    var nut = document.createElement('button'); nut.className = 'tt-xo-nut'; w.appendChild(nut);
    var ls = document.createElement('div'); ls.className = 'tt-xo-ds an'; w.appendChild(ls);
    function veNut() { var d = ds.filter(function (x) { return x.gt === hienTai; })[0] || ds[0]; nut.innerHTML = d.html + '<i data-bt="xuong"></i>'; ganBieuTuong(nut); }
    ls.innerHTML = ds.map(function (x) { return '<button data-gt="' + x.gt + '" title="' + x.ten + '">' + x.html + '</button>'; }).join('');
    nut.onclick = function (e) { e.stopPropagation(); $$('.tt-xo-ds').forEach(function (l) { if (l !== ls) l.classList.add('an'); }); ls.classList.toggle('an'); };
    ls.querySelectorAll('button').forEach(function (b) { b.onclick = function () { hienTai = b.dataset.gt; veNut(); ls.classList.add('an'); khiChon(hienTai); }; });
    veNut(); return w;
  }
  function dong(nhan, phan) { var r = document.createElement('div'); r.className = 'tt-dong-tt'; var l = document.createElement('label'); l.textContent = nhan; r.appendChild(l); if (phan) r.appendChild(phan); return r; }
  function oTich(nhan, giaTriDung, khiDoi) {
    var l = document.createElement('label'); l.className = 'tt-tich'; l.innerHTML = '<input type="checkbox"' + (giaTriDung ? ' checked' : '') + '><span>' + nhan + '</span>';
    l.querySelector('input').onchange = function (e) { khiDoi(e.target.checked); }; return l;
  }
  function veThuocTinh() {
    var o = timTheoId(chonId); if (!o || !o.loai) { dongThuocTinh(); return; }
    veDanhSachTT();
    var laDiem = !!H.LA_DIEM[o.loai], laDoan = o.loai === 'doan', coNet = !laDiem && o.loai !== 'doDai';
    var TAB = [['coBan', 'Cơ bản'], ['mauSac', 'Màu sắc']]; if (coNet || laDiem) TAB.push(['kieu', 'Kiểu']);
    if (!TAB.some(function (x) { return x[0] === tabTT; })) tabTT = 'coBan';
    $('#tt-tab').innerHTML = TAB.map(function (x) { return '<button data-tab="' + x[0] + '"' + (x[0] === tabTT ? ' class="bat"' : '') + '>' + x[1] + '</button>'; }).join('');
    $$('#tt-tab [data-tab]').forEach(function (b) { b.onclick = function () { tabTT = b.dataset.tab; veThuocTinh(); }; });
    var noi = $('#tt-noi'); noi.innerHTML = '';
    if (tabTT === 'coBan') {
      var oTen = document.createElement('input'); oTen.className = 'tt-o'; oTen.value = o.ten || ''; oTen.placeholder = o.loai === 'hamSo' ? '(không cần tên)' : '';
      oTen.onchange = function () {
        var ten = oTen.value.trim(); if (ten === (o.ten || '')) return;
        if (ten && trang().hinh.some(function (x) { return x !== o && x.ten === ten; })) { thongBao('Tên “' + ten + '” đã có, hãy chọn tên khác'); oTen.value = o.ten || ''; return; }
        doi('ten', function (x) { x.ten = ten || undefined; if (ten && x.hienTen == null && !H.LA_DIEM[x.loai]) x.hienTen = true; }); veThuocTinh();
      };
      oTen.onkeydown = function (e) { if (e.key === 'Enter') oTen.blur(); };
      noi.appendChild(dong('Tên:', oTen));
      var dn = document.createElement('div'); dn.className = 'tt-o tt-dn'; dn.textContent = dinhNghia(o); noi.appendChild(dong('Định nghĩa:', dn));
      noi.appendChild(oTich('Hiển thị đối tượng', !o.an, function (v) { doi('an', function (x) { x.an = !v || undefined; }); }));
      if (o.loai !== 'doDai' && o.loai !== 'goc') noi.appendChild(oTich('Hiển thị tên', o.loai === 'hamSo' ? o.hienTen !== false : hienTenCua(o), function (v) { doi('hienTen', function (x) { x.hienTen = v; if (v && !x.ten && x.loai !== 'hamSo') x.ten = H.LA_DIEM[x.loai] ? tenDiemMoi() : tenDuongMoi(); }); veThuocTinh(); }));
      if (o.loai === 'diem' || o.loai === 'diemTren') noi.appendChild(oTich('Cố định đối tượng (không kéo được)', !!o.coDinh, function (v) { doi('coDinh', function (x) { x.coDinh = v || undefined; }); }));
      var xoa = document.createElement('button'); xoa.className = 'tt-xoa'; xoa.innerHTML = '<i data-bt="xoaTrang"></i>Xoá đối tượng'; ganBieuTuong(xoa);
      xoa.onclick = function () { ghiLichSu(); var bo2 = H.phuThuoc(trang().hinh, o.id); trang().hinh = trang().hinh.filter(function (x) { return !bo2[x.id]; }); dongThuocTinh(); };
      noi.appendChild(xoa);
    } else if (tabTT === 'mauSac') {
      var luoi = document.createElement('div'); luoi.className = 'tt-bang-mau';
      var hienMau = mauMacDinh(o).toLowerCase();
      luoi.innerHTML = BANG_MAU.map(function (m) { return '<button data-mau="' + m + '" style="background:' + m + '"' + (m.toLowerCase() === hienMau ? ' class="bat"' : '') + ' title="' + m + '"></button>'; }).join('') +
        '<label class="tt-mau-khac" title="Màu khác"><input type="color" value="' + (/^#[0-9a-f]{6}$/i.test(hienMau) ? hienMau : '#2451c7') + '"></label>';
      luoi.querySelectorAll('[data-mau]').forEach(function (b) { b.onclick = function () { doi('mau', function (x) { x.mau = b.dataset.mau; }); veThuocTinh(); }; });
      var ip = luoi.querySelector('input'); ip.oninput = function () { doi('mau', function (x) { x.mau = ip.value; }); };
      noi.appendChild(dong('Màu:', null)); noi.appendChild(luoi);
      if (o.loai === 'daGiac') noi.appendChild(dong('Độ mờ tô:', thanhTruot(0, 1, 0.05, o.doMo == null ? 0.16 : o.doMo, function (v) { doi('doMo', function (x) { x.doMo = v; }); }, function (v) { return Math.round(v * 100) + '%'; })));
      var mac = document.createElement('button'); mac.className = 'tt-xoa nhe'; mac.textContent = 'Về màu mặc định';
      mac.onclick = function () { doi('mau', function (x) { delete x.mau; }); veThuocTinh(); }; noi.appendChild(mac);
    } else {
      if (laDiem) noi.appendChild(dong('Kích thước điểm:', thanhTruot(2, 10, 0.5, o.rong || 5, function (v) { doi('rong', function (x) { x.rong = v; }); })));
      else {
        noi.appendChild(dong('Độ dày nét:', thanhTruot(1, 12, 0.5, o.rong || (o.loai === 'hamSo' ? 3 : 2.6), function (v) { doi('rong', function (x) { x.rong = v; }); })));
        noi.appendChild(dong('Kiểu nét:', hopXo(Object.keys(KIEU_NET).map(function (k) { return { gt: k, ten: KIEU_NET[k].ten, html: svgNet(k) }; }), o.kieuNet || 'lien', function (v) { doi('kieuNet', function (x) { x.kieuNet = v === 'lien' ? undefined : v; }); })));
      }
      if (laDoan) {
        var mt = document.createElement('div'); mt.className = 'tt-hang';
        mt.appendChild(oTich('Mũi tên ở đầu (' + tenHay(o.a) + ')', !!o.muiDau, function (v) { doi('muiDau', function (x) { x.muiDau = v || undefined; }); }));
        mt.appendChild(oTich('Mũi tên ở cuối (' + tenHay(o.b) + ')', !!o.muiCuoi, function (v) { doi('muiCuoi', function (x) { x.muiCuoi = v || undefined; }); }));
        noi.appendChild(dong('Mũi tên:', null)); noi.appendChild(mt);
        noi.appendChild(dong('Kiểu mũi tên:', hopXo([{ gt: 'tamGiac', ten: 'Tam giác đặc', html: svgMui('tamGiac') }, { gt: 'v', ten: 'Chữ V', html: svgMui('v') }], o.kieuMui || 'tamGiac', function (v) { doi('kieuMui', function (x) { x.kieuMui = v === 'tamGiac' ? undefined : v; }); })));
        noi.appendChild(dong('Kí hiệu:', hopXo(KY_HIEU.map(function (k) { return { gt: k[0], ten: k[1], html: k[0] ? svgKyHieu(k[0]) : '<span class="tt-khong">Không</span>' }; }), o.kyHieu || '', function (v) { doi('kyHieu', function (x) { x.kyHieu = v || undefined; }); })));
      }
    }
  }
  function thanhTruot(min, max, buoc, gt, khiDoi, dinhDang) {
    var w = document.createElement('div'); w.className = 'tt-truot';
    w.innerHTML = '<input type="range" min="' + min + '" max="' + max + '" step="' + buoc + '" value="' + gt + '"><b></b>';
    var ip = w.querySelector('input'), b = w.querySelector('b'), hien = function () { b.textContent = dinhDang ? dinhDang(+ip.value) : String(+ip.value).replace('.', ','); };
    ip.oninput = function () { hien(); khiDoi(+ip.value); }; hien(); return w;
  }
  document.addEventListener('pointerdown', function (e) { if (!e.target.closest('.tt-xo')) $$('.tt-xo-ds').forEach(function (l) { l.classList.add('an'); }); });

  /* =====================================================================
     KHỞI ĐỘNG
     ===================================================================== */
  ganBieuTuong(); veThanhCongCu(); taoBangTT();
  $$('[data-lenh]').forEach(function (b) { b.addEventListener('click', function () { $('#menu').classList.add('an'); LENH[b.dataset.lenh](); }); });
  $('#nut-menu').onclick = function (e) { e.stopPropagation(); $('#menu').classList.toggle('an'); veMenuNen(); };
  document.addEventListener('pointerdown', function (e) { if (!e.target.closest('#menu') && !e.target.closest('#nut-menu')) $('#menu').classList.add('an'); });
  $('#thong-tin').onclick = function () { thuPhong(1 / V.s); };
  if (MT) MT.phienBan().then(function (v) { $('#phien-ban').textContent = 'GeoInk ' + v + ' · Nhóm nghiên cứu khoa học trường TH-THCS An Lạc'; });
  $$('.hop [data-dong]').forEach(function (b) { b.onclick = function () { b.closest('.hop').classList.add('an'); }; });
  $$('.hop').forEach(function (h) { h.addEventListener('pointerdown', function (e) { if (e.target === h) h.classList.add('an'); }); });
  $('#nut-ve-ham').onclick = veHam;
  $('#o-ham').addEventListener('keydown', function (e) { if (e.key === 'Enter') veHam(); });
  $('#o-ham').addEventListener('input', function () { $('#loi-ham').textContent = ''; });
  $$('.vi-du [data-vd]').forEach(function (b) { b.onclick = function () { $('#o-ham').value = b.dataset.vd; $('#o-ham').focus(); }; });

  window.addEventListener('keydown', function (e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') { if (e.key === 'Escape') $$('.hop').forEach(function (h) { h.classList.add('an'); }); return; }
    var k = e.key.toLowerCase();
    if (e.ctrlKey || e.metaKey) {
      if (k === 'z' && !e.shiftKey) { e.preventDefault(); hoanTac(); }
      else if (k === 'y' || (k === 'z' && e.shiftKey)) { e.preventDefault(); lamLai(); }
      else if (k === 's') { e.preventDefault(); luu(e.shiftKey); }
      else if (k === 'o') { e.preventDefault(); mo(); }
      else if (k === 'n') { e.preventDefault(); moi(); }
      else if (k === '=' || k === '+') { e.preventDefault(); thuPhong(1.25); }
      else if (k === '-') { e.preventDefault(); thuPhong(0.8); }
      else if (k === '0') { e.preventDefault(); thuPhong(1 / V.s); }
      return;
    }
    if (e.key === 'Escape') { dongThuocTinh(); choChon = []; $$('.hop').forEach(function (h) { h.classList.add('an'); }); capNhatGoiY(); canVe(); }
    else if (e.key === 'PageDown') LENH.trangSau(); else if (e.key === 'PageUp') LENH.trangTruoc();
    else if (e.key === 'F11') { e.preventDefault(); LENH.toanManHinh(); }
    else if ((e.key === 'Delete' || e.key === 'Backspace') && chonId && !dangChon) {
      ghiLichSu(); var bo3 = H.phuThuoc(trang().hinh, chonId); trang().hinh = trang().hinh.filter(function (o) { return !bo3[o.id]; }); dongThuocTinh();
    }
    else if ((e.key === 'Delete' || e.key === 'Backspace') && dangChon) {
      ghiLichSu(); var t = trang();
      if (dangChon.net) t.net.splice(t.net.indexOf(dangChon.net), 1); if (dangChon.moHinh) t.moHinh.splice(t.moHinh.indexOf(dangChon.moHinh), 1);
      dangChon = null; canVe();
    }
    else { var phim = { v: 'chon', p: 'but', h: 'dq', e: 'tay', l: 'laser', t: 'thang' }[k]; if (phim) chonCongCu(phim); }
  });

  window.addEventListener('resize', doiKichThuoc);
  doiKichThuoc();
  chonCongCu('but'); sauKhiDoiTrang(); requestAnimationFrame(vong);
  if (MT) {
    MT.tepKhoiDong().then(function (d) { if (d) napTep(d); });
    MT.khiMoTep(function (d) { if (hoiBoThayDoi()) napTep(d); });
    MT.khiHoiDong(function () { if (!daSua || window.confirm('Bảng có thay đổi chưa lưu. Thoát mà không lưu?')) MT.dongThat(); });
  } else {
    window.addEventListener('beforeunload', function (e) { if (daSua) { e.preventDefault(); e.returnValue = ''; } });
  }
  window.GeoInk = { tl: function () { return tl; }, V: function () { return V; }, chonCongCu: chonCongCu, lenh: LENH, giaTri: function () { return giaTri; } };   // để kiểm thử
})();
