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
    but: '<path d="M4 20l1-5L16 4l4 4L9 19z"/><path d="M14 6l4 4"/>',
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
  var tl = { app: 'GeoInk', phienBan: 1, trang: [trangMoi('oVuong')], so: 0 };
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
    $('#ty-le').textContent = Math.round(V.s * 100) + '%'; canVe();
  }

  /* =====================================================================
     CÔNG CỤ
     ===================================================================== */
  var NHOM_CC = [
    { ten: 'Viết', ds: [['chon', 'Chọn / kéo'], ['but', 'Bút'], ['dq', 'Bút dạ quang'], ['tay', 'Tẩy'], ['laser', 'Bút chỉ'], ['keo', 'Kéo trang']] },
    { ten: 'Dựng hình', ds: [['diem', 'Điểm'], ['doan', 'Đoạn thẳng'], ['duong', 'Đường thẳng'], ['tia', 'Tia'], ['tron', 'Đường tròn'], ['trungDiem', 'Trung điểm'],
      ['vuongGoc', 'Vuông góc'], ['songSong', 'Song song'], ['giao', 'Giao điểm'], ['daGiac', 'Đa giác'], ['xoa', 'Xoá hình']] },
    { ten: 'Đo đạc', ds: [['doDai', 'Độ dài'], ['goc', 'Số đo góc']] },
    { ten: 'Đồ thị · GeoLab', ds: [['hamSo', 'Hàm số'], ['moHinh', 'Mô hình GeoLab']] },
  ];
  var GOI_Y = {
    chon: 'Kéo điểm, nét vẽ hoặc mô hình để di chuyển · kéo chỗ trống để dời trang',
    but: '', dq: '', tay: 'Rê tẩy qua nét vẽ để xoá', laser: 'Bút chỉ: nét đỏ tự mờ đi', keo: 'Kéo để dời trang · lăn chuột để phóng to, thu nhỏ',
    diem: 'Bấm để đặt điểm (bấm lên đường thẳng, đường tròn để đặt điểm trên đó)',
    doan: ['Chọn điểm đầu', 'Chọn điểm cuối'], duong: ['Chọn điểm thứ nhất', 'Chọn điểm thứ hai'], tia: ['Chọn gốc của tia', 'Chọn điểm tia đi qua'],
    tron: ['Chọn tâm', 'Chọn một điểm trên đường tròn'], trungDiem: ['Chọn hai điểm (hoặc bấm vào một đoạn thẳng)', 'Chọn điểm thứ hai'],
    vuongGoc: ['Chọn một điểm và một đường thẳng', 'Chọn đường thẳng (hoặc điểm) còn lại'], songSong: ['Chọn một điểm và một đường thẳng', 'Chọn đường thẳng (hoặc điểm) còn lại'],
    giao: ['Chọn đối tượng thứ nhất', 'Chọn đối tượng thứ hai'], daGiac: 'Chọn lần lượt các đỉnh, bấm lại đỉnh đầu để khép kín',
    xoa: 'Bấm vào hình hoặc mô hình cần xoá', doDai: ['Chọn hai điểm (hoặc bấm vào một đoạn thẳng)', 'Chọn điểm thứ hai'], goc: ['Chọn điểm trên cạnh thứ nhất', 'Chọn đỉnh góc', 'Chọn điểm trên cạnh thứ hai'],
  };
  var cc = 'but', choChon = [];
  var butCfg = { mau: '#1E3A8A', co: 3 }, dqCfg = { mau: '#FACC15', co: 18 }, tayCo = 22;
  var MAU_BUT = ['#111827', '#1E40AF', '#DC2626', '#16A34A', '#9333EA', '#EA580C', '#0891B2', '#FFFFFF'];
  var MAU_DQ = ['#FACC15', '#4ADE80', '#60A5FA', '#F472B6', '#FB923C'];
  var CO_BUT = [2, 3, 5, 8], CO_DQ = [12, 18, 28], CO_TAY = [12, 22, 40];
  var MAU_HINH = '#1F3A8A', MAU_HAM = ['#DC2626', '#2563EB', '#16A34A', '#9333EA', '#EA580C', '#0891B2'];
  var hienSo = true;

  function veThanhCongCu() {
    $('#cong-cu').innerHTML = NHOM_CC.map(function (n) {
      return '<h4>' + n.ten + '</h4><div class="luoi">' + n.ds.map(function (c) {
        return '<button class="nut" data-cc="' + c[0] + '" title="' + c[1] + '"><i data-bt="' + c[0] + '"></i><span>' + c[1] + '</span></button>';
      }).join('') + '</div>';
    }).join('');
    ganBieuTuong($('#cong-cu'));
    $$('#cong-cu [data-cc]').forEach(function (b) { b.onclick = function () { chonCongCu(b.dataset.cc); }; });
  }
  function chonCongCu(k) {
    if (k === 'hamSo') return moHopHam();
    if (k === 'moHinh') return moHopMoHinh();
    cc = k; choChon = []; xemTruoc = null;
    $$('#cong-cu [data-cc]').forEach(function (b) { b.classList.toggle('bat', b.dataset.cc === cc); });
    capNhatTuyChonBut(); capNhatGoiY(); canVe(); veNhap();
    cv.style.cursor = cc === 'keo' ? 'grab' : cc === 'chon' ? 'default' : 'crosshair';
  }
  function capNhatGoiY() {
    var g = GOI_Y[cc], s = Array.isArray(g) ? g[Math.min(choChon.length, g.length - 1)] : g;
    if (cc === 'daGiac' && choChon.length) s = 'Đã chọn ' + choChon.length + ' đỉnh · bấm lại đỉnh đầu để khép kín';
    var el = $('#goi-y'); el.textContent = s || ''; el.classList.toggle('an', !s);
  }
  function capNhatTuyChonBut() {
    var el = $('#tuy-chon-but');
    if (cc !== 'but' && cc !== 'dq' && cc !== 'tay') { el.classList.add('an'); return; }
    el.classList.remove('an');
    var h = '';
    if (cc === 'tay') {
      h = '<b>Cỡ tẩy</b>' + CO_TAY.map(function (c) { return '<button class="co' + (c === tayCo ? ' bat' : '') + '" data-co="' + c + '" title="Cỡ ' + c + '"><span style="height:' + Math.round(c / 2.5) + 'px;width:' + Math.round(c / 2.5) + 'px"></span></button>'; }).join('');
    } else {
      var cfg = cc === 'but' ? butCfg : dqCfg, dsMau = cc === 'but' ? MAU_BUT : MAU_DQ, dsCo = cc === 'but' ? CO_BUT : CO_DQ;
      h = dsMau.map(function (m) { return '<button class="mau' + (m.toLowerCase() === cfg.mau.toLowerCase() ? ' bat' : '') + '" data-mau="' + m + '" style="background:' + m + '" title="' + m + '"></button>'; }).join('') +
        '<label class="tu-chon" title="Chọn màu khác"><input type="color" id="mau-khac" value="' + cfg.mau + '"></label><span class="ngan"></span>' +
        dsCo.map(function (c) { return '<button class="co' + (c === cfg.co ? ' bat' : '') + '" data-co="' + c + '" title="Nét ' + c + '"><span style="height:' + Math.max(2, Math.round(cc === 'dq' ? c / 2.5 : c * 1.2)) + 'px;' + (cc === 'dq' ? 'opacity:.5;background:' + cfg.mau : '') + '"></span></button>'; }).join('');
    }
    el.innerHTML = h;
    el.querySelectorAll('[data-mau]').forEach(function (b) { b.onclick = function () { (cc === 'but' ? butCfg : dqCfg).mau = b.dataset.mau; capNhatTuyChonBut(); }; });
    el.querySelectorAll('[data-co]').forEach(function (b) { b.onclick = function () { var c = +b.dataset.co; if (cc === 'tay') tayCo = c; else (cc === 'but' ? butCfg : dqCfg).co = c; capNhatTuyChonBut(); }; });
    var mk = el.querySelector('#mau-khac'); if (mk) mk.oninput = function () { (cc === 'but' ? butCfg : dqCfg).mau = mk.value; };
  }

  /* =====================================================================
     VẼ
     ===================================================================== */
  var NEN = {
    trang: { mau: '#FFFFFF', luoi: null, toi: false },
    oVuong: { mau: '#FFFFFF', luoi: 'vuong', toi: false },
    oLy: { mau: '#FFFDF7', luoi: 'ly', toi: false },
    bangXanh: { mau: '#1F4D3B', luoi: 'vuongToi', toi: true },
    den: { mau: '#111827', luoi: null, toi: true },
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
  function veHinh(c, vn, s, gt, toSang) {
    var px = 1 / s, t = trang(), fam = getComputedStyle(document.body).fontFamily;
    var mauChinh = mauNet(), mauSang = '#F97316';
    function nhan(o) { return toSang && toSang[o.id]; }
    function keThang(v, o) {
      var u = { x: v.q.x - v.p.x, y: v.q.y - v.p.y }, L = Math.hypot(u.x, u.y); u = { x: u.x / L, y: u.y / L };
      var R = Math.hypot(vn.x1 - vn.x0, vn.y1 - vn.y0) * 2, A, B;
      if (v.loai === 'doan') { A = v.p; B = v.q; }
      else { var ga = { x: (vn.x0 + vn.x1) / 2, y: (vn.y0 + vn.y1) / 2 }, k = (ga.x - v.p.x) * u.x + (ga.y - v.p.y) * u.y;
        A = v.loai === 'tia' ? v.p : { x: v.p.x + u.x * (k - R), y: v.p.y + u.y * (k - R) }; B = { x: v.p.x + u.x * (Math.max(k, 0) + R), y: v.p.y + u.y * (Math.max(k, 0) + R) }; }
      c.beginPath(); c.moveTo(A.x, A.y); c.lineTo(B.x, B.y);
      c.strokeStyle = nhan(o) ? mauSang : (o.mau || mauChinh); c.lineWidth = (nhan(o) ? 4.5 : 2.6) * px; c.stroke();
    }
    // đa giác (tô) trước
    t.hinh.forEach(function (o) {
      var v = gt[o.id]; if (!v || v.k !== 'daGiac') return;
      c.beginPath(); v.ds.forEach(function (P, i) { i ? c.lineTo(P.x, P.y) : c.moveTo(P.x, P.y); }); c.closePath();
      c.fillStyle = kieuNen().toi ? 'rgba(147,197,253,.18)' : 'rgba(59,130,246,.12)'; c.fill();
      c.strokeStyle = nhan(o) ? mauSang : (o.mau || mauChinh); c.lineWidth = (nhan(o) ? 4.5 : 2.6) * px; c.lineJoin = 'round'; c.stroke();
    });
    // đồ thị hàm số
    var demHam = 0;
    t.hinh.forEach(function (o) {
      if (o.loai !== 'hamSo') return; var v = gt[o.id], mau = o.mau || MAU_HAM[demHam++ % MAU_HAM.length];
      if (!v) return;
      c.beginPath(); var dangVe = false, truocY = null, buoc = 1.5 * px, nhanP = null;
      for (var X = vn.x0; X <= vn.x1 + buoc; X += buoc) {
        var y = v.f(X / DV), Y = -y * DV;
        if (!isFinite(Y) || Math.abs(Y) > 1e6 || (truocY !== null && Math.abs(Y - truocY) > (vn.y1 - vn.y0) * 3)) { dangVe = false; truocY = null; continue; }
        if (dangVe) c.lineTo(X, Y); else { c.moveTo(X, Y); dangVe = true; }
        truocY = Y;
        if (Y > vn.y0 + 110 * px && Y < vn.y1 - 70 * px && X < vn.x1 - 170 * px) nhanP = { x: X, y: Y };
      }
      c.strokeStyle = nhan(o) ? mauSang : mau; c.lineWidth = (nhan(o) ? 4.5 : 3) * px; c.lineJoin = 'round'; c.stroke();
      if (nhanP) { c.font = '600 ' + (17 * px) + 'px "Cambria Math", "Times New Roman", serif'; c.fillStyle = mau; c.textAlign = 'left'; c.textBaseline = 'bottom'; c.fillText(v.ve, nhanP.x + 6 * px, nhanP.y - 6 * px); }
    });
    // đường thẳng, đoạn, tia, đường tròn
    t.hinh.forEach(function (o) {
      var v = gt[o.id]; if (!v) return;
      if (v.k === 'thang') keThang(v, o);
      else if (v.k === 'tron') { c.beginPath(); c.arc(v.c.x, v.c.y, v.r, 0, Math.PI * 2); c.strokeStyle = nhan(o) ? mauSang : (o.mau || mauChinh); c.lineWidth = (nhan(o) ? 4.5 : 2.6) * px; c.stroke(); }
    });
    // số đo
    t.hinh.forEach(function (o) {
      var v = gt[o.id]; if (!v) return;
      if (v.k === 'goc') {
        var r = 30 * px; c.beginPath(); c.moveTo(v.o.x, v.o.y); c.arc(v.o.x, v.o.y, r, v.a1, v.a1 + v.da, v.da < 0); c.closePath();
        c.fillStyle = 'rgba(22,163,74,.18)'; c.fill();
        c.beginPath(); c.arc(v.o.x, v.o.y, r, v.a1, v.a1 + v.da, v.da < 0); c.strokeStyle = nhan(o) ? mauSang : '#16A34A'; c.lineWidth = 2.2 * px; c.stroke();
        if (hienSo) { var am = v.a1 + v.da / 2; c.font = '700 ' + (16 * px) + 'px ' + fam; c.fillStyle = '#15803D'; c.textAlign = 'center'; c.textBaseline = 'middle';
          c.fillText(soVN(v.do, 1) + '°', v.o.x + Math.cos(am) * (r + 22 * px), v.o.y + Math.sin(am) * (r + 22 * px)); }
      } else if (v.k === 'doDai' && hienSo) {
        var mx = (v.a.x + v.b.x) / 2, my = (v.a.y + v.b.y) / 2, nx = -(v.b.y - v.a.y) / v.d, ny = (v.b.x - v.a.x) / v.d;
        if (ny > 0) { nx = -nx; ny = -ny; }
        var ta = timTheoId(o.a), tb = timTheoId(o.b), chu = (ta && tb && ta.ten && tb.ten ? ta.ten + tb.ten + ' = ' : '') + soVN(v.d / DV, 2) + ' cm';
        c.font = '700 ' + (15 * px) + 'px ' + fam; var w = c.measureText(chu).width + 14 * px, X2 = mx + nx * 20 * px, Y2 = my + ny * 20 * px;
        bo(c, X2 - w / 2, Y2 - 12 * px, w, 24 * px, 12 * px); c.fillStyle = nhan(o) ? mauSang : '#DC2626'; c.fill();
        c.fillStyle = '#fff'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(chu, X2, Y2 + px);
      }
    });
    // điểm và tên điểm
    t.hinh.forEach(function (o) {
      var v = gt[o.id]; if (!v || v.k !== 'diem') return;
      var tuDo = o.loai === 'diem' || o.loai === 'diemTren';
      c.beginPath(); c.arc(v.x, v.y, (nhan(o) ? 7 : 5) * px, 0, Math.PI * 2);
      c.fillStyle = nhan(o) ? mauSang : tuDo ? '#2451C7' : (kieuNen().toi ? '#E5E7EB' : '#334155'); c.fill();
      c.lineWidth = 1.5 * px; c.strokeStyle = kieuNen().toi ? '#111827' : '#FFFFFF'; c.stroke();
      if (o.ten) {
        c.font = 'italic 600 ' + (19 * px) + 'px "Cambria Math", "Times New Roman", serif'; c.textAlign = 'left'; c.textBaseline = 'bottom';
        c.lineWidth = 4 * px; c.strokeStyle = kieuNen().mau; c.strokeText(o.ten, v.x + 7 * px, v.y - 5 * px);
        c.fillStyle = kieuNen().toi ? '#F8FAFC' : '#16213A'; c.fillText(o.ten, v.x + 7 * px, v.y - 5 * px);
      }
    });
  }

  var giaTri = {};   // toạ độ đã tính của trang hiện tại
  function ve() {
    var t = trang(), vn = vungNhin(), s = V.s;
    ctx.setTransform(dpr * s, 0, 0, dpr * s, -V.x * s * dpr, -V.y * s * dpr);
    veNen(ctx, vn, s);
    if (coTruc()) veTruc(ctx, vn, s);
    giaTri = H.tinh(t.hinh);
    var sang = {}; if (diDuoi) sang[diDuoi] = 1; choChon.forEach(function (x) { if (x.id) sang[x.id] = 1; });
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
    trang().hinh.forEach(function (o) { var v = giaTri[o.id]; if (v && v.k === 'diem') { var d = H.kc(v, M); if (d < d0) { d0 = d; tot = o; } } });
    return tot;
  }
  function timDoiTuong(M, loc) {
    var tot = null, d0 = nguong(11);
    trang().hinh.forEach(function (o) {
      var v = giaTri[o.id]; if (!v || (loc && !loc(o, v))) return;
      var d = v.k === 'ham' ? khoangCachHam(v, M) : H.khoangCach(v, M);
      if (d < d0) { d0 = d; tot = o; }
    });
    return tot;
  }
  function khoangCachHam(v, M) { var y = -v.f(M.x / DV) * DV; return isFinite(y) ? Math.abs(y - M.y) : Infinity; }
  function laDuongTron(o, v) { return v.k === 'thang' || v.k === 'tron'; }
  function laThang(o, v) { return v.k === 'thang'; }
  function timGiaoGan(M) {
    var ds = trang().hinh.filter(function (o) { var v = giaTri[o.id]; return v && laDuongTron(o, v) && H.khoangCach(v, M) < nguong(16); }), tot = null, d0 = nguong(14);
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
  function themHinh(o) { trang().hinh.push(o); giaTri = H.tinh(trang().hinh); return o; }
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
        t.hinh = t.hinh.filter(function (o) { return !bo2[o.id]; }); canVe(); return;
      }
    }
    capNhatGoiY(); canVe();
  }
  function timSoDo(M) {
    var tot = null, d0 = nguong(30);
    trang().hinh.forEach(function (o) {
      var v = giaTri[o.id]; if (!v) return;
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
    var nutMH = cc !== 'but' && cc !== 'dq' && cc !== 'tay' && trongNutMoHinh(M);
    if (nutMH && e.button === 0) { moLinkMoHinh(nutMH); return; }
    var keoTrang = e.button === 1 || cc === 'keo' || (e.pointerType === 'touch' && daThayBut && (cc === 'but' || cc === 'dq' || cc === 'tay'));
    if (keoTrang) { dangKeo = { loai: 'trang', p: p, V: { x: V.x, y: V.y } }; cv.style.cursor = 'grabbing'; return; }
    if (e.button === 2) return;
    if (cc === 'but' || cc === 'dq') {
      var cfg = cc === 'but' ? butCfg : dqCfg;
      netDang = { loai: 'net', kieu: cc, mau: cfg.mau, co: cfg.co, pts: [[M.x, M.y, lucNhan(e)]] };
      veNhap(); return;
    }
    if (cc === 'tay') { daGhiTay = false; tay(M); dangKeo = { loai: 'tay' }; veNhap(M); return; }
    if (cc === 'laser') { laser.push({ x: M.x, y: M.y, t: performance.now(), moi: true }); dangKeo = { loai: 'laser' }; chayLaser(); return; }
    if (cc === 'chon') {
      var d = timDiem(M);
      if (d && (d.loai === 'diem' || d.loai === 'diemTren')) { ghiLichSu(); dangKeo = { loai: 'diem', o: d }; return; }
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
      V.s = s2; V.x = Mw.x - m.x / V.s; V.y = Mw.y - m.y / V.s; $('#ty-le').textContent = Math.round(V.s * 100) + '%'; canVe(); return;
    }
    var M = veTG(p.x, p.y); conTro = M;
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
    if (cc === 'chon') { var dd = timDiem(M); diDuoi = dd && (dd.loai === 'diem' || dd.loai === 'diemTren') ? dd.id : null; cv.style.cursor = diDuoi || timMoHinh(M) || timNet(M) ? 'move' : 'default'; }
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
      ghiLichSu(); trang().net.push(netDang); netDang = null; nctx.setTransform(1, 0, 0, 1, 0, 0); nctx.clearRect(0, 0, cvN.width, cvN.height); canVe(); return;
    }
    if (dangKeo && dangKeo.loai === 'trang') cv.style.cursor = cc === 'keo' ? 'grab' : 'default';
    if (dangKeo && dangKeo.loai === 'laser') laser.forEach(function (l) { l.ketThuc = true; });
    dangKeo = null; veNhap();
  }
  cv.addEventListener('pointerup', thaTay);
  cv.addEventListener('pointercancel', function (e) { huyNetDang(); thaTay(e); });
  cv.addEventListener('pointerleave', function () { conTro = null; if (cc === 'tay' && !dangKeo) veNhap(); });
  cv.addEventListener('contextmenu', function (e) { e.preventDefault(); });
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
    $('#so-trang').textContent = (tl.so + 1) + ' / ' + tl.trang.length;
    $('#nen').value = trang().nen;
    capNhatNutBat(); capNhatGoiY(); capNhatTieuDe(); canVe(); veNhap();
  }
  function capNhatNutBat() {
    var nt = $('[data-lenh="truc"]'); if (nt) nt.classList.toggle('bat', !!trang().truc);
    var ns = $('#nut-so-do'); if (ns) ns.classList.toggle('bat', hienSo);
  }
  function capNhatTieuDe() {
    var ten = tenTep ? tenTep.split(/[\\/]/).pop() : 'Bảng mới';
    $('#ten-tep').textContent = ten + (daSua ? ' •' : '');
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
    tl = { app: 'GeoInk', phienBan: 1, trang: [trangMoi('oVuong')], so: 0 }; tenTep = null; daSua = false; truoc = []; sauLS = [];
    V = { x: -W / 2, y: -Hh / 2, s: 1 }; $('#ty-le').textContent = '100%'; sauKhiDoiTrang();
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
    $('#ty-le').textContent = Math.round(V.s * 100) + '%'; canVe();
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
    moi: moi, mo: mo, luu: function () { luu(false); }, xuatAnh: xuatAnh, hoanTac: hoanTac, lamLai: lamLai,
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
     KHỞI ĐỘNG
     ===================================================================== */
  ganBieuTuong(); veThanhCongCu();
  $$('[data-lenh]').forEach(function (b) { b.addEventListener('click', function () { LENH[b.dataset.lenh](); }); });
  $('#nen').onchange = function (e) {
    ghiLichSu(); trang().nen = e.target.value;
    var toi = kieuNen().toi;
    if (toi && /^#(111827|1e3a8a|1e40af)$/i.test(butCfg.mau)) butCfg.mau = '#FFFFFF';
    if (!toi && /^#ffffff$/i.test(butCfg.mau)) butCfg.mau = '#1E3A8A';
    capNhatTuyChonBut(); canVe(); e.target.blur();
  };
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
    if (e.key === 'Escape') { choChon = []; $$('.hop').forEach(function (h) { h.classList.add('an'); }); capNhatGoiY(); canVe(); }
    else if (e.key === 'PageDown') LENH.trangSau(); else if (e.key === 'PageUp') LENH.trangTruoc();
    else if (e.key === 'F11') { e.preventDefault(); LENH.toanManHinh(); }
    else if ((e.key === 'Delete' || e.key === 'Backspace') && dangChon) {
      ghiLichSu(); var t = trang();
      if (dangChon.net) t.net.splice(t.net.indexOf(dangChon.net), 1); if (dangChon.moHinh) t.moHinh.splice(t.moHinh.indexOf(dangChon.moHinh), 1);
      dangChon = null; canVe();
    }
    else { var phim = { v: 'chon', p: 'but', h: 'dq', e: 'tay', l: 'laser' }[k]; if (phim) chonCongCu(phim); }
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
