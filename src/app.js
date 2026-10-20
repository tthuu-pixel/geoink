// GeoInk – giao diện chính: bảng viết tay + dựng hình + đồ thị + mô hình GeoLab
(function () {
  'use strict';
  var MT = window.mayTinh || null;          // cầu nối Electron (null khi mở bằng trình duyệt)
  var DV = 40;   // 1 đơn vị (1 cm) = 40 điểm ảnh ở mức phóng 100%
  var FONT_TEX = 'Arial, "Liberation Sans", Helvetica, sans-serif';   // font chữ giống GeoGebra
  var FONT_TEN = '"LM Roman", "Times New Roman", serif';               // tên điểm, tên đường: font LaTeX (Latin Modern), in nghiêng như $A$
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
  // Biểu tượng nét mảnh một màu (kiểu Scrble Ink) cho hai hàng trên và menu
  var BT_NET = {
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    mo: '<rect x="4" y="4.5" width="3.2" height="15" rx=".6"/><rect x="8.6" y="4.5" width="3.2" height="15" rx=".6"/><path d="M13.6 6.1l3-.8 3.9 14.5-3 .8z"/>',
    luu: '<path d="M5.5 4.5h10.5l2.5 2.5v12.5h-13z"/><path d="M8.5 4.5v4.5h6v-4.5M8.5 19.5v-5.5h7v5.5"/>',
    hoanTac: '<path d="M9 6.5L5 10.5l4 4"/><path d="M5 10.5h9.5a4.5 4.5 0 0 1 0 9H11"/>',
    lamLai: '<path d="M15 6.5l4 4-4 4"/><path d="M19 10.5H9.5a4.5 4.5 0 0 0 0 9H13"/>',
    pdf: '<path d="M7 3.5h7l4 4v13H7z"/><path d="M14 3.5v4h4"/><path d="M12.5 10.5v6.5M9.8 14.5l2.7 2.7 2.7-2.7"/>',
    themTrang: '<path d="M7 3.5h7l4 4v13H7z"/><path d="M14 3.5v4h4"/>',
    moi: '<path d="M7 3.5h7l4 4v13H7z"/><path d="M14 3.5v4h4M12.5 11v6M9.5 14h6"/>',
    tay: '<path d="M5.5 15.5l8.5-8.5 5 5-7 7H9.5z"/><path d="M9.8 11.2l5 5M8 19.5h11"/>',
    dq: '<path d="M7.5 14.5l8.5-8.5 2.5 2.5-8.5 8.5H7.5z"/><path d="M14 8l2.5 2.5"/><path d="M5 20.5h14" stroke-dasharray="2.2 2"/>',
    xuong: '<path d="M7.5 10l4.5 4.5 4.5-4.5"/>',
    toanManHinh: '<path d="M4.5 9V4.5H9M19.5 9V4.5H15M4.5 15v4.5H9M19.5 15v4.5H15"/>',
  };
  var BT_MAU = { but: 1, tay: 1, dq: 1, chon: 1, keo: 1, congThuc: 1, mayTinh: 1, dungCu: 1, nhapTex: 1, xuatTex: 1, catHinh: 1 };   // bút chì, mũi tên, bàn tay: biểu tượng có màu
  function bieuTuong(k, hang2) {
    if (!hang2 && BT_MAU[k] && GI.bieuTuong) return GI.bieuTuong(k);
    if (!hang2 && BT_NET[k]) return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' + BT_NET[k] + '</svg>';
    if (!hang2 && BT[k]) return svg(k);
    return GI.bieuTuong ? GI.bieuTuong(k, hang2) : svg(k);
  }
  function btHang2(k) { return bieuTuong(k === 'keo' ? 'diChuyen' : k, true); }
  function ganBieuTuong(goc) { (goc || document).querySelectorAll('i[data-bt]').forEach(function (i) { i.innerHTML = bieuTuong(i.dataset.bt); }); }

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
    if (d.taiNguyen) { Object.keys(d.taiNguyen).forEach(function (k) { if (!taiNguyen[k]) taiNguyen[k] = d.taiNguyen[k]; }); delete d.taiNguyen; }
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
  // Hàng 2 (kiểu GeoGebra): các nhóm công cụ, mỗi nhóm có danh sách xổ xuống ('-' là vạch ngăn)
  var NHOM_HINH = [
    [['diem', 'Điểm mới'], ['diemTren', 'Điểm thuộc đối tượng'], ['ganDiem', 'Dán / huỷ dán điểm'], '-', ['giao', 'Giao điểm của 2 đối tượng'], ['trungDiem', 'Trung điểm hoặc tâm']],
    [['duong', 'Đường thẳng qua 2 điểm'], ['doan', 'Đoạn thẳng'], ['doanCoDinh', 'Đoạn thẳng với độ dài cố định'], '-', ['tia', 'Tia đi qua 2 điểm'], ['gapKhuc', 'Đường gấp khúc']],
    [['vuongGoc', 'Đường vuông góc'], ['songSong', 'Đường song song'], ['trungTruc', 'Đường trung trực'], ['phanGiac', 'Đường phân giác']],
    [['daGiac', 'Đa giác'], ['daGiacDeu', 'Đa giác đều']],
    [['tron', 'Đường tròn khi biết tâm và 1 điểm trên đường tròn'], ['tronBanKinh', 'Đường tròn khi biết tâm và bán kính'], ['compa', 'Compa'], ['tron3Diem', 'Đường tròn qua 3 điểm có sẵn'], '-',
      ['banNguyet', 'Hình bán nguyệt qua 2 điểm'], ['cungTam', 'Cung tròn khi biết tâm và 2 điểm trên cung tròn'], ['cung3Diem', 'Cung tròn qua 3 điểm'], '-',
      ['quatTam', 'Hình quạt khi biết tâm và qua 2 điểm trên hình quạt'], ['quat3Diem', 'Hình quạt đi qua 3 điểm']],
    [['elip', 'Elip'], ['hypebol', 'Hypebol'], ['parabol', 'Parabol']],
    [['goc', 'Góc (1 nét cung)'], ['goc2', 'Góc 2 nét cung'], ['goc3', 'Góc 3 nét cung'], ['gocGach1', 'Góc 1 nét cung có gạch'], ['gocGach2', 'Góc 2 nét cung có gạch'], '-', ['gocChoTruoc', 'Góc với độ lớn cho trước'], ['gocVuong', 'Kí hiệu góc vuông (bấm 3 điểm)'], '-', ['doDai', 'Khoảng cách, độ dài'], ['dienTich', 'Diện tích']],
    [['dxTruc', 'Đối xứng qua đường thẳng'], ['dxTam', 'Đối xứng qua điểm'], ['nghichDao', 'Đối xứng điểm qua đường tròn'], ['quay', 'Quay đối tượng quanh 1 điểm theo 1 góc cho trước'], ['tinhTien', 'Phép tịnh tiến'], ['viTu', 'Phép vị tự']],
    [['thanhTruot', 'Thanh trượt']],
    [['keo', 'Di chuyển hình vẽ (kéo trang)'], ['xoa', 'Xoá đối tượng']],
    [['chu', 'Chèn chữ']],
  ];
  // Các nhóm mẫu hình (đặt sau nút GeoLab): bấm là chèn hình có sẵn
  var BAT_DAU_MAU = NHOM_HINH.length;
  NHOM_HINH.push(
    [['k_hop', 'Hình hộp chữ nhật'], ['k_lapPhuong', 'Hình lập phương'], ['k_lang3', 'Lăng trụ đứng tam giác'], ['k_lang4', 'Lăng trụ đứng tứ giác'], '-',
      ['k_chop3', 'Hình chóp tam giác đều'], ['k_chop4', 'Hình chóp tứ giác đều'], '-', ['k_tru', 'Hình trụ'], ['k_non', 'Hình nón'], ['k_cau', 'Hình cầu']],
    [['m_noiTiep', 'Tam giác nội tiếp đường tròn'], ['m_catHaiCanh', 'Đường tròn cắt hai cạnh tam giác'], '-', ['m_duongKinh', 'Đường tròn đường kính'], ['m_veDuongKinh', 'Vẽ đường kính'], '-',
      ['m_tiepTuyen1', 'Tiếp tuyến từ điểm ngoài (1 tiếp tuyến)'], ['m_tiepTuyen2', 'Tiếp tuyến từ điểm ngoài (2 tiếp tuyến)'], ['m_tiepTuyenChung', 'Tiếp tuyến chung ngoài']],
    [['p_tamGiac', 'Tam giác'], ['p_tamGiacCan', 'Tam giác cân'], ['p_tamGiacDeu', 'Tam giác đều'], ['p_tamGiacVuong', 'Tam giác vuông'], '-',
      ['p_hcn', 'Hình chữ nhật'], ['p_hv', 'Hình vuông'], ['p_hbh', 'Hình bình hành'], ['p_thoi', 'Hình thoi'], '-',
      ['p_thang', 'Hình thang'], ['p_thangCan', 'Hình thang cân'], ['p_thangVuong', 'Hình thang vuông'], ['p_lucGiac', 'Lục giác đều']],
    [['d_trungTuyen', 'Đường trung tuyến'], ['d_trongTam', 'Trọng tâm'], '-', ['d_duongCao', 'Đường cao'], ['d_trucTam', 'Trực tâm'], '-', ['d_phanGiac', 'Đường phân giác – Tâm đường tròn nội tiếp'],
      ['d_trungTruc', 'Đường trung trực – Tâm đường tròn ngoại tiếp'], '-', ['d_trungBinh', 'Đường trung bình của tam giác']]
  );
  function laMau(k) { return /^[kmpd]_/.test(k) && !CONG_CU[k]; }   // mẫu hình (bấm lên bảng để đặt); d_trungTuyen… là công cụ dựng
  var nhomHien = NHOM_HINH.map(function (n) { return n[0][0]; }); nhomHien[1] = 'doan';   // công cụ đang hiện trên mỗi ô nhóm
  function tenCongCu(k) { if (k === 'chon') return 'Chọn, di chuyển'; var t = null; NHOM_HINH.forEach(function (n) { n.forEach(function (x) { if (x[0] === k) t = x[1]; }); }); return t; }
  var GOI_Y = {
    chon: 'Kéo hình, kéo tên để di chuyển · kéo chỗ trống: chọn khung · Ctrl: chọn nhiều',
    but: '', dq: '', tay: 'Rê tẩy qua nét vẽ để xoá', laser: 'Bút chỉ: nét đỏ tự mờ đi', keo: 'Kéo để dời trang · lăn chuột để phóng to, thu nhỏ',
    diem: 'Bấm để đặt điểm (bấm lên đường thẳng, đường tròn để đặt điểm trên đó)',
    doan: ['Chọn điểm đầu', 'Chọn điểm cuối'], duong: ['Chọn điểm thứ nhất', 'Chọn điểm thứ hai'], tia: ['Chọn gốc của tia', 'Chọn điểm tia đi qua'],
    tron: ['Chọn tâm', 'Chọn một điểm trên đường tròn'], trungDiem: ['Chọn hai điểm (hoặc bấm vào một đoạn thẳng)', 'Chọn điểm thứ hai'],
    vuongGoc: ['Chọn một điểm và một đường thẳng', 'Chọn đường thẳng (hoặc điểm) còn lại'], songSong: ['Chọn một điểm và một đường thẳng', 'Chọn đường thẳng (hoặc điểm) còn lại'],
    giao: ['Chọn đối tượng thứ nhất', 'Chọn đối tượng thứ hai'], daGiac: 'Chọn lần lượt các đỉnh, bấm lại đỉnh đầu để khép kín',
    xoa: 'Bấm vào hình hoặc mô hình cần xoá', doDai: ['Chọn hai điểm (hoặc bấm vào một đoạn thẳng)', 'Chọn điểm thứ hai'], goc: ['Chọn điểm trên cạnh thứ nhất', 'Chọn đỉnh góc', 'Chọn điểm trên cạnh thứ hai'],
  };
  var cc = 'but', choChon = [];
  var butCfg = { mau: '#111827', co: 3, lucNhan: true }, dqCfg = { mau: '#FDE047', co: 20 }, tayCo = 22, moChinh = null;
  var MAU_BUT = ['#111827', '#DC2626', '#2563EB', '#16A34A', '#9333EA'];
  var MAU_DQ = ['#FDE047', '#4ADE80', '#22D3EE'];
  var CO_BUT = [2, 4, 8], CO_TAY = [12, 22, 40];
  var BANG_MAU_BUT = ['#111827', '#6B7280', '#FFFFFF', '#DC2626', '#EA580C', '#CA8A04', '#16A34A', '#0D9488', '#2563EB', '#1E3A8A', '#9333EA', '#DB2777'];
  var BANG_MAU_DQ = ['#FDE047', '#4ADE80', '#22D3EE', '#F472B6', '#FB923C', '#A78BFA'];
  var MAU_HINH = '#1F3A8A', MAU_HAM = ['#DC2626', '#2563EB', '#16A34A', '#9333EA', '#EA580C', '#0891B2'];
  var hienSo = true;

  function veThanhCongCu() {
    function oNhom(n, i) { return '<button class="nhom-cc" data-nhom="' + i + '"><i></i>' + (n.length > 1 ? '<span class="tam-giac" data-mo-nhom="' + i + '"><svg viewBox="0 0 10 8" width="11" height="9"><path d="M1 1h8L5 7z" fill="#fff" stroke="#6B7280" stroke-width="1.1" stroke-linejoin="round"/></svg></span>' : '') + '</button>'; }
    $('#hang-hinh').innerHTML = NHOM_HINH.slice(0, BAT_DAU_MAU).map(oNhom).join('') + '<span class="ke"></span>' +
      '<button class="nut-don" data-cc="moHinh" title="Chèn mô hình GeoLab"><i>' + btHang2('moHinh') + '</i></button>' +
      NHOM_HINH.slice(BAT_DAU_MAU).map(function (n, j) { return oNhom(n, BAT_DAU_MAU + j); }).join('') +
      '<div class="gian"></div>' +
      '<button class="nut" data-lenh="soDo" id="nut-so-do" title="Ẩn / hiện số đo"><i>' + GI.bieuTuong('soDo') + '</i>Số đo</button>' +
      '<button class="nut" data-lenh="truc" title="Bật / tắt hệ trục toạ độ"><i>' + GI.bieuTuong('truc') + '</i>Hệ trục</button>';
    ganBieuTuong();
    $$('[data-cc]').forEach(function (b) { b.onclick = function () { chonCongCu(b.dataset.cc); }; });
    $$('.nhom-cc').forEach(function (b) {
      b.onclick = function (e) {
        var i = +b.dataset.nhom, k = nhomHien[i];
        if (e.target.closest('[data-mo-nhom]') || (cc === k && NHOM_HINH[i].length > 1)) return moXoNhom(i, b);
        dongXoNhom(); chonCongCu(k);
      };
    });
    capNhatNhom();
  }
  function capNhatNhom() {
    $$('.nhom-cc').forEach(function (b) {
      var i = +b.dataset.nhom, k = nhomHien[i];
      b.querySelector('i').innerHTML = btHang2(k); b.title = tenCongCu(k) + (NHOM_HINH[i].length > 1 ? ' (bấm ▾ để xem thêm)' : '');
      b.classList.toggle('bat', NHOM_HINH[i].some(function (x) { return x[0] === cc; }));
      b.title = laMau(k) ? tenCongCu(k) + ': bấm nút rồi bấm lên bảng để đặt hình' + (NHOM_HINH[i].length > 1 ? ' (bấm ▾ để chọn hình khác)' : '') : b.title;
    });
  }
  function dongXoNhom() { var x = $('#xo-nhom'); if (x) x.remove(); }
  function moXoNhom(i, nut) {
    var cu = $('#xo-nhom'); dongXoNhom(); if (cu && cu.dataset.nhom === String(i)) return;
    var el = document.createElement('div'); el.id = 'xo-nhom'; el.dataset.nhom = i;
    el.innerHTML = NHOM_HINH[i].map(function (x) { return x === '-' ? '<hr>' : '<button data-k="' + x[0] + '"' + (x[0] === cc ? ' class="bat"' : '') + '><i>' + btHang2(x[0]) + '</i>' + x[1] + '</button>'; }).join('');
    document.body.appendChild(el);
    var r = nut.getBoundingClientRect(); el.style.left = Math.min(r.left, window.innerWidth - el.offsetWidth - 8) + 'px'; el.style.top = (r.bottom + 2) + 'px';
    el.querySelectorAll('[data-k]').forEach(function (b) { b.onclick = function () { nhomHien[i] = b.dataset.k; dongXoNhom(); chonCongCu(b.dataset.k); }; });
  }
  document.addEventListener('pointerdown', function (e) { if (!e.target.closest('#xo-nhom') && !e.target.closest('.nhom-cc')) dongXoNhom(); });
  // Con trỏ chuột theo công cụ (chữ thập đen viền trắng cho dễ thấy)
  function conTroCC() {
    var C = GI.CON_TRO || {};
    if (cc === 'but') return C.but || 'crosshair';
    if (cc === 'dq') return C.dq || 'crosshair';
    if (cc === 'tay') return 'none';
    if (cc === 'keo') return 'grab';
    if (cc === 'chon') return 'default';
    return C.thap || 'crosshair';
  }
  GI.khiCoConTro = function () { cv.style.cursor = conTroCC(); };
  function chonCongCu(k) {
    if (k === 'moHinh') return moHopMoHinh();
    cc = k; choChon = []; xemTruoc = null;
    NHOM_HINH.forEach(function (n, i) { if (n.some(function (x) { return x[0] === k; })) nhomHien[i] = k; });
    $$('[data-cc]').forEach(function (b) { b.classList.toggle('bat', b.dataset.cc === cc); });
    capNhatNhom(); capNhatTuyChonBut(); capNhatGoiY(); canVe(); veNhap();
    cv.style.cursor = conTroCC();
  }
  function capNhatGoiY() {
    var cu = CONG_CU[cc], s2;
    if (cu) {
      s2 = cu.goiY[Math.min(choChon.length, cu.goiY.length - 1)];
      if (cu.buoc[0] === 'nhieu' && choChon.length) s2 = 'Đã chọn ' + choChon.length + ' điểm · ' + (cc === 'daGiac' ? 'bấm lại đỉnh đầu để khép kín' : 'bấm lại điểm cuối để kết thúc');
      s2 = '<b>' + (tenCongCu(cc) || '') + ':</b> ' + s2;
    } else {
      var g = GOI_Y[cc]; s2 = Array.isArray(g) ? g[Math.min(choChon.length, g.length - 1)] : g;
      if (laMau(cc)) s2 = '<b>' + tenCongCu(cc) + ':</b> bấm lên bảng ở chỗ muốn đặt hình';
      if (cc === 'ganDiem') s2 = '<b>Dán / huỷ dán điểm:</b> ' + (choChon.length ? 'Chọn đường thẳng hoặc đường tròn để dán điểm vào' : 'Chọn điểm tự do để dán, hoặc điểm thuộc đối tượng để huỷ dán');
    }
    var el = $('#goi-y'); el.innerHTML = s2 || ''; el.classList.toggle('an', !s2);
  }
  // Khay màu bút, độ dày, màu dạ quang trên hàng 1; cỡ tẩy hiện nổi khi chọn Tẩy
  function capNhatTuyChonBut() {
    var dangBut = cc === 'but', dangDq = cc === 'dq';
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
    var mk = $('#mau-khac'); mk.oninput = function () { butCfg.mau = mk.value; }; mk.onchange = function () { if (cc !== 'but') chonCongCu('but'); else capNhatTuyChonBut(); };
    $$('#khay-co [data-co]').forEach(function (b) { b.onclick = function () { butCfg.co = +b.dataset.co; if (!dangBut) chonCongCu('but'); else capNhatTuyChonBut(); }; });
    $$('#khay-dq [data-mau-dq]').forEach(function (b) { b.onclick = function () { dqCfg.mau = b.dataset.mauDq; if (!dangDq) chonCongCu('dq'); else capNhatTuyChonBut(); }; });
    veBangChinh();
  }
  // Bảng chỉnh (bấm ▾ cạnh Bút / Tẩy / Dạ quang): độ dày, màu, xem trước
  function moBangChinh(k, nut) {
    if (moChinh === k) { moChinh = null; veBangChinh(); return; }
    moChinh = k; if (cc !== k) chonCongCu(k); veBangChinh();
    var el = $('#tuy-chon-but'), r = nut.getBoundingClientRect(); el.style.left = Math.max(8, Math.min(window.innerWidth - 320, r.left - 40)) + 'px'; el.style.transform = 'none';
  }
  function veBangChinh() {
    var el = $('#tuy-chon-but');
    if (!moChinh) { el.classList.add('an'); return; }
    el.classList.remove('an');
    var k = moChinh, cfg = k === 'but' ? butCfg : k === 'dq' ? dqCfg : null;
    var co = k === 'tay' ? tayCo : cfg.co, min = k === 'but' ? 1 : k === 'dq' ? 6 : 6, max = k === 'but' ? 30 : k === 'dq' ? 60 : 120;
    el.innerHTML = '<h4>' + (k === 'but' ? 'Bút' : k === 'dq' ? 'Bút dạ quang' : 'Tẩy') + '</h4><canvas class="xem-truoc" width="560" height="112"></canvas>' +
      '<div class="dong-truot">Độ dày <input type="range" min="' + min + '" max="' + max + '" step="' + (k === 'but' ? 0.5 : 1) + '" value="' + co + '"><b>' + String(co).replace('.', ',') + '</b></div>' +
      (cfg ? '<div class="hang-mau">' + (k === 'but' ? BANG_MAU_BUT : BANG_MAU_DQ).map(function (m) { return '<button data-m="' + m + '" style="background:' + m + '"' + (m.toLowerCase() === cfg.mau.toLowerCase() ? ' class="bat"' : '') + '></button>'; }).join('') + '</div>' : '') +
      (k === 'but' ? '<label class="tich"><input type="checkbox"' + (butCfg.lucNhan ? ' checked' : '') + '> Nét to nhỏ theo lực nhấn của bút</label>' : '');
    var ip = el.querySelector('input[type=range]'), b = el.querySelector('b');
    ip.oninput = function () { var v = +ip.value; if (k === 'tay') tayCo = v; else cfg.co = v; b.textContent = String(v).replace('.', ','); veXemTruocBut(); capNhatKhayCo(); };
    el.querySelectorAll('[data-m]').forEach(function (x) { x.onclick = function () { cfg.mau = x.dataset.m; veBangChinh(); capNhatTuyChonBut(); }; });
    var tich = el.querySelector('label.tich input'); if (tich) tich.onchange = function () { butCfg.lucNhan = tich.checked; veXemTruocBut(); };
    veXemTruocBut();
  }
  function capNhatKhayCo() { $$('#khay-co [data-co]').forEach(function (b) { b.classList.toggle('bat', +b.dataset.co === butCfg.co); }); }
  function veXemTruocBut() {
    var c = $('#tuy-chon-but canvas'); if (!c) return; var x = c.getContext('2d'); x.clearRect(0, 0, c.width, c.height);
    if (moChinh === 'tay') { x.fillStyle = 'rgba(148,163,184,.3)'; x.strokeStyle = '#64748B'; x.lineWidth = 2; x.beginPath(); x.arc(c.width / 2, c.height / 2, Math.min(52, tayCo), 0, Math.PI * 2); x.fill(); x.stroke(); return; }
    var pts = []; for (var i = 0; i <= 60; i++) { var t = i / 60; pts.push([40 + t * 480, 56 + Math.sin(t * Math.PI * 2) * 26, 0.25 + 0.75 * Math.sin(t * Math.PI)]); }
    var n = moChinh === 'but' ? { kieu: 'but', mau: butCfg.mau, co: butCfg.co * 2, pts: pts } : { kieu: 'dq', mau: dqCfg.mau, co: dqCfg.co * 2, pts: pts };
    veNet(x, n);
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
    xam: { ten: 'Nền xám (trang PDF)', mau: '#E3E7ED', luoi: null, toi: false },
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
    if (n.luoi === 'ke') {   // giấy kẻ dòng: dòng xanh nhạt cách 32
      if (32 * s > 5) ke(32, '#C7D7F1', 1, true);
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
    c.font = (13 * px) + 'px ' + FONT_TEX; c.textAlign = 'center'; c.textBaseline = 'top';
    for (var i = Math.ceil(vn.x0 / DV / b) * b; i * DV <= vn.x1; i += b) { if (!i) continue; c.beginPath(); c.moveTo(i * DV, -4 * px); c.lineTo(i * DV, 4 * px); c.stroke(); c.fillText(soVN(i, 0), i * DV, 6 * px); }
    c.textAlign = 'right'; c.textBaseline = 'middle';
    for (var j = Math.ceil(vn.y0 / DV / b) * b; j * DV <= vn.y1; j += b) { if (!j) continue; c.beginPath(); c.moveTo(-4 * px, j * DV); c.lineTo(4 * px, j * DV); c.stroke(); c.fillText(soVN(-j, 0), -7 * px, j * DV); }
    c.font = (18 * px) + 'px ' + FONT_TEX;
    c.textAlign = 'right'; c.textBaseline = 'top'; c.fillText('x', vn.x1 - 6 * px, 8 * px);
    c.textAlign = 'left'; c.fillText('y', 9 * px, vn.y0 + 4 * px);
    c.textAlign = 'right'; c.fillText('O', -5 * px, 5 * px);
    c.restore();
  }

  // Nét viết mượt: làm mượt đường đi và lực nhấn, rồi tô cả nét thành một dải viền liền (không gãy khúc)
  function lamMuot(p, t) {
    if (p.length < 3) return p.map(function (q) { return [q[0], q[1], q[2] == null ? 0.5 : q[2]]; });
    var r = [[p[0][0], p[0][1], p[0][2] == null ? 0.5 : p[0][2]]];
    for (var i = 1; i < p.length; i++) {
      var tr = r[r.length - 1], q = p[i], ap = q[2] == null ? 0.5 : q[2];
      var x = tr[0] + (q[0] - tr[0]) * t, y = tr[1] + (q[1] - tr[1]) * t;
      if (Math.hypot(x - tr[0], y - tr[1]) < 0.35 && i < p.length - 1) continue;
      r.push([x, y, tr[2] + (ap - tr[2]) * 0.35]);
    }
    var cuoi = p[p.length - 1]; r.push([cuoi[0], cuoi[1], r[r.length - 1][2]]);
    return r;
  }
  function vienNet(n) {
    var khoa = n.pts.length + ':' + n.co + ':' + (n.lucNhan === false ? 0 : 1);
    if (n._vien && n._khoa === khoa) return n._vien;
    var p = lamMuot(n.pts, 0.5), L = p.length, trai = [], phai = [];
    var dauMut = Math.min(5, Math.floor(L / 3));
    for (var i = 0; i < L; i++) {
      var a = p[Math.max(0, i - 1)], b = p[Math.min(L - 1, i + 1)], tx = b[0] - a[0], ty = b[1] - a[1], dd = Math.hypot(tx, ty) || 1;
      var ap = n.lucNhan === false ? 0.6 : p[i][2], w = n.co * (0.42 + 0.95 * ap);
      if (dauMut > 1) { if (i < dauMut) w *= 0.65 + 0.35 * i / dauMut; if (i > L - 1 - dauMut) w *= 0.6 + 0.4 * (L - 1 - i) / dauMut; }
      var nx = -ty / dd * w / 2, ny = tx / dd * w / 2;
      trai.push([p[i][0] + nx, p[i][1] + ny, w]); phai.push([p[i][0] - nx, p[i][1] - ny, w]);
    }
    n._vien = { p: p, trai: trai, phai: phai }; n._khoa = khoa; return n._vien;
  }
  function veDuongMuot(c, ds, lienTuc) {   // nối các điểm bằng cung bậc hai qua trung điểm
    if (!lienTuc) c.moveTo(ds[0][0], ds[0][1]); else c.lineTo(ds[0][0], ds[0][1]);
    for (var i = 1; i < ds.length - 1; i++) c.quadraticCurveTo(ds[i][0], ds[i][1], (ds[i][0] + ds[i + 1][0]) / 2, (ds[i][1] + ds[i + 1][1]) / 2);
    if (ds.length > 1) c.lineTo(ds[ds.length - 1][0], ds[ds.length - 1][1]);
  }
  function veNet(c, n) {
    var p = n.pts; if (!p.length) return;
    c.save(); c.fillStyle = n.mau; c.strokeStyle = n.mau; c.lineCap = 'round'; c.lineJoin = 'round';
    if (n.kieu === 'dq') {
      var q = lamMuot(p, 0.4); c.globalAlpha = 0.38; c.lineWidth = n.co;
      c.beginPath(); if (q.length === 1) { c.moveTo(q[0][0], q[0][1]); c.lineTo(q[0][0] + 0.1, q[0][1]); } else veDuongMuot(c, q);
      c.stroke(); c.restore(); return;
    }
    var v = vienNet(n), L = v.p.length;
    if (L === 1) { c.beginPath(); c.arc(v.p[0][0], v.p[0][1], v.trai[0][2] / 2, 0, Math.PI * 2); c.fill(); c.restore(); return; }
    c.beginPath();
    veDuongMuot(c, v.trai);
    var E = v.p[L - 1], aE = Math.atan2(v.trai[L - 1][1] - E[1], v.trai[L - 1][0] - E[0]);
    c.arc(E[0], E[1], v.trai[L - 1][2] / 2, aE, aE - Math.PI, true);      // đầu tròn cuối nét
    veDuongMuot(c, v.phai.slice().reverse(), true);
    var S = v.p[0], aS = Math.atan2(v.phai[0][1] - S[1], v.phai[0][0] - S[0]);
    c.arc(S[0], S[1], v.phai[0][2] / 2, aS, aS - Math.PI, true);          // đầu tròn đầu nét
    c.closePath(); c.fill();
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
    c.font = '700 15px ' + FONT_TEX;
    var ten = d.ten.length > 30 ? d.ten.slice(0, 29) + '…' : d.ten;
    c.fillText(ten, m.x + KT_THE.w / 2, m.y + 132);
    c.font = '600 12px ' + FONT_TEX; c.fillStyle = '#5B667D';
    c.fillText((d.nhom === 'khong-gian' ? 'Hình không gian' : 'Hình phẳng') + ' · Lớp ' + d.lop, m.x + KT_THE.w / 2, m.y + 148);
    var n = vungNut(m); bo(c, n.x, n.y, n.w, n.h, 10); c.fillStyle = '#2451C7'; c.fill();
    c.fillStyle = '#FFFFFF'; c.font = '700 13.5px ' + FONT_TEX; c.fillText('Mở mô hình GeoLab ↗', n.x + n.w / 2, n.y + n.h / 2 + 1);
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
  function laDiemO(o) { return H.LA_DIEM[o.loai] === 1 || (o.loai === 'bienHinh' && giaTri[o.id] && giaTri[o.id].k === 'diem'); }
  function hienTenCua(o) { return o.hienTen != null ? o.hienTen : laDiemO(o) || o.loai === 'khoi'; }
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
  // Ổ khoá ở góc khung chữ / công thức đang chọn: bấm để cố định
  function oKhoa(o) { var k = o._khung, px = 1 / V.s; return { x: k.x1 + 16 * px, y: k.y0 - 14 * px }; }
  function veKhoa(c, P, khoa, px) {
    c.save(); c.setLineDash([]); c.beginPath(); c.arc(P.x, P.y, 12 * px, 0, Math.PI * 2); c.fillStyle = khoa ? '#6B1515' : '#FFFFFF'; c.fill();
    c.strokeStyle = khoa ? '#6B1515' : '#94A3B8'; c.lineWidth = 1.3 * px; c.stroke();
    var m = khoa ? '#FFFFFF' : '#475569'; c.fillStyle = m; c.strokeStyle = m; c.lineWidth = 1.6 * px;
    c.fillRect(P.x - 5 * px, P.y - 1 * px, 10 * px, 7.5 * px);
    c.beginPath(); if (khoa) c.arc(P.x, P.y - 1 * px, 3.6 * px, Math.PI, 0); else c.arc(P.x + 2.5 * px, P.y - 2 * px, 3.6 * px, Math.PI * 1.05, Math.PI * 1.95); c.stroke(); c.restore();
  }
  // Nút xoay ↻ (hình không gian, mẫu hình)
  function viTriNutXoay(k) { var px = 1 / V.s; return { x: k.x1 + 26 * px, y: k.y0 - 22 * px }; }
  function veNutXoay(c, P, px) {
    c.save(); c.setLineDash([]); c.beginPath(); c.arc(P.x, P.y, 14 * px, 0, Math.PI * 2); c.fillStyle = '#FFFFFF'; c.fill(); c.strokeStyle = '#2457C5'; c.lineWidth = 1.6 * px; c.stroke();
    c.beginPath(); c.arc(P.x, P.y, 7.5 * px, -Math.PI * 0.85, Math.PI * 0.55); c.lineWidth = 2 * px; c.stroke();
    var a = Math.PI * 0.55, E = { x: P.x + Math.cos(a) * 7.5 * px, y: P.y + Math.sin(a) * 7.5 * px };
    c.beginPath(); c.moveTo(E.x + 4.5 * px, E.y + 1 * px); c.lineTo(E.x - 1 * px, E.y - 0.5 * px); c.lineTo(E.x + 2.5 * px, E.y - 4.5 * px); c.stroke(); c.restore();
  }
  // Vẽ tên; o.nhan = { dx, dy } (điểm ảnh màn hình) là độ dời tên do người dùng kéo, tối đa BK_TEN quanh chỗ mặc định
  var BK_TEN = 40, vungTen = [];
  function veTen(c, ten, x, y, px, mau, o) {
    var x0 = x, y0 = y; if (o && o.nhan) { x += o.nhan.dx * px; y += o.nhan.dy * px; }
    c.save(); c.setLineDash([]);
    c.font = 'italic ' + (22 * px) + 'px ' + FONT_TEN; c.textAlign = 'left'; c.textBaseline = 'bottom';
    c.lineWidth = 4 * px; c.strokeStyle = kieuNen().mau; c.lineJoin = 'round'; c.strokeText(ten, x, y);
    c.fillStyle = mau; c.fillText(ten, x, y);
    if (o && c === ctx) { var w = c.measureText(ten).width; vungTen.push({ o: o, x0: x - 2 * px, x1: x + w + 2 * px, y0: y - 22 * px, y1: y + 3 * px, goc: { x: x0, y: y0 } }); }
    c.restore();
  }
  function timTen(M) { for (var i = vungTen.length - 1; i >= 0; i--) { var k = vungTen[i]; if (M.x >= k.x0 && M.x <= k.x1 && M.y >= k.y0 && M.y <= k.y1) return k; } return null; }
  function datViTriTen(o, dx, dy) {
    var d = Math.hypot(dx, dy); if (d > BK_TEN) { dx *= BK_TEN / d; dy *= BK_TEN / d; }
    o.nhan = Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5 ? undefined : { dx: Math.round(dx * 10) / 10, dy: Math.round(dy * 10) / 10 };
  }

  // Vẽ các đối tượng hình học (bỏ qua đối tượng đang ẩn)
  function veHinh(c, vn, s, gt, toSang) {
    var px = 1 / s, t = trang(), fam = FONT_TEX;
    var mauChinh = mauNet(), mauSang = '#F97316', mauChu = kieuNen().toi ? '#F8FAFC' : '#16213A';
    function sang(o) { return toSang && toSang[o.id]; }
    function hien(o) { return !o.an; }
    // dấu góc vuông ở chân đường vuông góc (giao với đường gốc)
    function veKyHieuVuong(o, v) {
      var D = gt[o.d], A = gt[o.a]; if (!D || D.k !== 'thang' || !A) return;
      var u = { x: D.q.x - D.p.x, y: D.q.y - D.p.y }, L = Math.hypot(u.x, u.y); if (L < 1e-9) return; u = { x: u.x / L, y: u.y / L };
      var tF = (A.x - D.p.x) * u.x + (A.y - D.p.y) * u.y, F = { x: D.p.x + u.x * tF, y: D.p.y + u.y * tF };
      var n = { x: -u.y, y: u.x }; if ((A.x - F.x) * n.x + (A.y - F.y) * n.y < -1e-6) n = { x: -n.x, y: -n.y };
      if (D.loai === 'doan' || D.loai === 'tia') { var tM = D.loai === 'doan' ? L / 2 : L; if (tF > tM) u = { x: -u.x, y: -u.y }; }   // quay dấu vào phía có đường gốc
      var k = 18 * px;
      c.save(); c.setLineDash([]); c.beginPath(); c.moveTo(F.x + u.x * k, F.y + u.y * k); c.lineTo(F.x + u.x * k + n.x * k, F.y + u.y * k + n.y * k); c.lineTo(F.x + n.x * k, F.y + n.y * k);
      c.strokeStyle = o.mau || mauChinh; c.lineWidth = 1.6 * px; c.lineJoin = 'miter'; c.stroke(); c.restore();
    }
    // Hình không gian: cạnh thấy nét liền, cạnh khuất nét đứt, đỉnh có tên
    function veKhoi(o, v) {
      var mau = o.mau || (kieuNen().toi ? '#E5E7EB' : '#111827'), w = (o.rong || 2.2) * px, sg = sang(o);
      c.save(); c.lineCap = 'round'; c.lineJoin = 'round';
      function net(an) { c.strokeStyle = mau; c.lineWidth = an ? Math.max(1.3 * px, w * 0.75) : w; c.setLineDash(an ? [7 * px, 5 * px] : []); }
      function keS() { if (sg) { c.save(); c.setLineDash([]); c.strokeStyle = 'rgba(249,115,22,.38)'; c.lineWidth = w + 9 * px; c.stroke(); c.restore(); } c.stroke(); }
      v.canh.forEach(function (e) { c.beginPath(); c.moveTo(e.p.x, e.p.y); c.lineTo(e.q.x, e.q.y); net(e.an); keS(); });
      v.cong.forEach(function (k) { c.beginPath(); k.pts.forEach(function (P, i) { i ? c.lineTo(P.x, P.y) : c.moveTo(P.x, P.y); }); net(k.an); keS(); });
      c.setLineDash([]); c.lineWidth = 1.4 * px; c.strokeStyle = mau;
      v.vuong.forEach(function (q) { var k = 15 * px; c.beginPath(); c.moveTo(q.o.x + q.u1.x * k, q.o.y + q.u1.y * k); c.lineTo(q.o.x + (q.u1.x + q.u2.x) * k, q.o.y + (q.u1.y + q.u2.y) * k); c.lineTo(q.o.x + q.u2.x * k, q.o.y + q.u2.y * k); c.stroke(); });
      var gx = (v.khung.x0 + v.khung.x1) / 2, gy = (v.khung.y0 + v.khung.y1) / 2;
      v.dinh.forEach(function (d) {
        c.beginPath(); c.arc(d.P.x, d.P.y, 3.6 * px, 0, Math.PI * 2); c.fillStyle = d.an ? '#3F4A57' : '#2457C5'; c.fill();
        if (o.hienTen !== false) {
          var ux = d.P.x - gx, uy = d.P.y - gy, L = Math.hypot(ux, uy) || 1; ux /= L; uy /= L;
          c.save(); c.font = 'italic ' + (21 * px) + 'px ' + FONT_TEN; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = o.mau || mauChu;
          c.lineWidth = 4 * px; c.strokeStyle = kieuNen().mau; c.lineJoin = 'round';
          var tx = d.P.x + ux * 15 * px, ty = d.P.y + uy * 15 * px; c.strokeText(d.ten, tx, ty); c.fillText(d.ten, tx, ty); c.restore();
        }
      });
      // tay nắm đổi kích thước (vòng trắng quanh điểm) và nút xoay khi đang chọn
      if (c === ctx && (sg || cc === 'chon')) v.tay.forEach(function (t) { c.beginPath(); c.arc(t.P.x, t.P.y, 6.5 * px, 0, Math.PI * 2); c.strokeStyle = '#2457C5'; c.lineWidth = 1.6 * px; c.setLineDash([]); c.stroke(); });
      if (c === ctx && sg) veNutXoay(c, viTriNutXoay(v.khung), px);
      c.restore();
    }
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
        veTen(c, o.ten, M.x + n.x * 12 * px, M.y + n.y * 12 * px, px, o.mau || mauChu, o);
      }
    }
    // ảnh (dán / cắt từ màn hình) nằm dưới cùng
    t.hinh.forEach(function (o) {
      if (o.loai !== 'anh' || !hien(o)) return; var img = anhCua(o.tn);
      if (img) c.drawImage(img, o.x, o.y, o.w, o.h); else { c.save(); c.fillStyle = '#F1F5F9'; c.fillRect(o.x, o.y, o.w, o.h); c.restore(); }
      if (sang(o) && c === ctx) {
        c.save(); c.setLineDash([6 * px, 4 * px]); c.strokeStyle = mauSang; c.lineWidth = 1.6 * px; c.strokeRect(o.x, o.y, o.w, o.h); c.setLineDash([]);
        var kN = 7 * px; c.fillStyle = '#fff'; c.strokeStyle = '#2457C5'; c.lineWidth = 1.6 * px; c.fillRect(o.x + o.w - kN, o.y + o.h - kN, 2 * kN, 2 * kN); c.strokeRect(o.x + o.w - kN, o.y + o.h - kN, 2 * kN, 2 * kN); c.restore();
      }
    });
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
      if (nhanP && o.hienTen !== false) { c.font = '600 ' + (17 * px) + 'px ' + FONT_TEX; c.fillStyle = mau; c.textAlign = 'left'; c.textBaseline = 'bottom'; c.fillText(v.ve, nhanP.x + 6 * px, nhanP.y - 6 * px); }
    });
    // đường thẳng, đoạn, tia, đường tròn
    t.hinh.forEach(function (o) {
      var v = gt[o.id]; if (!v || !hien(o)) return;
      if (v.k === 'thang') { keThang(v, o); if (o.loai === 'vuongGoc' && o.kyHieuVuong !== false) veKyHieuVuong(o, v); }
      else if (v.k === 'tron') {
        var wT = datNet(c, o, px, sang(o), 2.6, mauChinh); c.beginPath(); c.arc(v.c.x, v.c.y, v.r, 0, Math.PI * 2); keNet(c, sang(o), wT, px);
        if (o.ten && hienTenCua(o)) { var a = -Math.PI / 4; veTen(c, o.ten, v.c.x + Math.cos(a) * v.r + 6 * px, v.c.y + Math.sin(a) * v.r - 4 * px, px, o.mau || mauChu, o); }
      }
    });
    // cung, hình quạt, đường gấp khúc
    t.hinh.forEach(function (o) {
      var v = gt[o.id]; if (!v || !hien(o)) return;
      if (v.k === 'cung') {
        c.beginPath();
        if (v.quat) { c.moveTo(v.c.x, v.c.y); c.arc(v.c.x, v.c.y, v.r, v.a0, v.a0 + v.da, v.da < 0); c.closePath();
          c.save(); c.globalAlpha = o.doMo == null ? 0.18 : o.doMo; c.fillStyle = o.mau || (kieuNen().toi ? '#93C5FD' : '#F87171'); c.fill(); c.restore(); }
        else c.arc(v.c.x, v.c.y, v.r, v.a0, v.a0 + v.da, v.da < 0);
        var wc = datNet(c, o, px, sang(o), 2.6, mauChinh); c.lineJoin = 'round'; keNet(c, sang(o), wc, px);
        if (o.ten && hienTenCua(o)) { var am = v.a0 + v.da / 2; veTen(c, o.ten, v.c.x + Math.cos(am) * (v.r + 10 * px), v.c.y + Math.sin(am) * (v.r + 10 * px), px, o.mau || mauChu, o); }
      } else if (v.k === 'cong') {
        c.beginPath(); v.nhanh.forEach(function (ds) { ds.forEach(function (P, i) { i ? c.lineTo(P.x, P.y) : c.moveTo(P.x, P.y); }); if (v.kin) c.closePath(); });
        var wk = datNet(c, o, px, sang(o), 2.6, mauChinh); c.lineJoin = 'round'; keNet(c, sang(o), wk, px);
        if (o.ten && hienTenCua(o)) { var Pk = v.nhanh[0][Math.round(v.nhanh[0].length * 0.12)]; veTen(c, o.ten, Pk.x + 8 * px, Pk.y - 6 * px, px, o.mau || mauChu, o); }
      } else if (v.k === 'khoi') {
        veKhoi(o, v);
      } else if (v.k === 'gapKhuc') {
        c.beginPath(); v.ds.forEach(function (P, i) { i ? c.lineTo(P.x, P.y) : c.moveTo(P.x, P.y); });
        var wg = datNet(c, o, px, sang(o), 2.6, mauChinh); c.lineJoin = 'round'; keNet(c, sang(o), wg, px);
      }
    });
    // số đo
    t.hinh.forEach(function (o) {
      var v = gt[o.id]; if (!v || !hien(o)) return;
      if (v.k === 'gocVuong') {
        // kí hiệu góc vuông: ô vuông nhỏ, chỉ có nét (không tô), cùng màu với hình
        var a = 18 * px * (o.rong ? o.rong / 1.6 : 1), P1 = { x: v.o.x + v.u1.x * a, y: v.o.y + v.u1.y * a }, P2 = { x: v.o.x + v.u2.x * a, y: v.o.y + v.u2.y * a }, Q = { x: P1.x + v.u2.x * a, y: P1.y + v.u2.y * a };
        c.beginPath(); c.moveTo(P1.x, P1.y); c.lineTo(Q.x, Q.y); c.lineTo(P2.x, P2.y); c.lineJoin = 'miter';
        keNet(c, sang(o), datNet(c, o, px, sang(o), 1.6, mauChinh), px);
        return;
      }
      if (v.k === 'dienTich' && hienSo) {
        var chuS = (o.ten ? o.ten + ' = ' : 'S = ') + soVN(v.S / DV / DV, 2) + ' cm²';
        c.font = '700 ' + (17 * px) + 'px ' + fam; var wS = c.measureText(chuS).width + 14 * px;
        bo(c, v.vi.x - wS / 2, v.vi.y - 12 * px, wS, 24 * px, 12 * px); c.fillStyle = o.mau || '#1D4ED8'; c.fill();
        if (sang(o)) { c.strokeStyle = mauSang; c.lineWidth = 3 * px; c.stroke(); }
        c.fillStyle = '#fff'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(chuS, v.vi.x, v.vi.y + px);
        return;
      }
      if (v.k === 'goc') {
        // kí hiệu góc: 1–3 nét cung, có thể thêm 1 gạch ở giữa; không tô màu
        var r = 26 * px, kc2 = 5 * px, soCung = o.cung || 1, mauG = o.mau || mauChinh, am = v.a1 + v.da / 2, rNgoai = r + (soCung - 1) * kc2;
        c.save(); c.strokeStyle = sang(o) ? mauSang : mauG; c.lineWidth = (sang(o) ? 2.6 : 1.6) * px * (o.rong ? o.rong / 1.6 : 1); c.setLineDash([]);
        if (o.cung === 0) { soCung = 0; rNgoai = r; }
        for (var ic = 0; ic < soCung; ic++) { c.beginPath(); c.arc(v.o.x, v.o.y, r + ic * kc2, v.a1, v.a1 + v.da, v.da < 0); c.stroke(); }
        var soGach = o.gach === true ? 1 : (o.gach || 0);
        for (var ig = 0; ig < soGach; ig++) { var ag = am + (soGach > 1 ? (ig - (soGach - 1) / 2) * 5 * px / r : 0); c.beginPath(); c.moveTo(v.o.x + Math.cos(ag) * (r - 6 * px), v.o.y + Math.sin(ag) * (r - 6 * px)); c.lineTo(v.o.x + Math.cos(ag) * (rNgoai + 6 * px), v.o.y + Math.sin(ag) * (rNgoai + 6 * px)); c.stroke(); }
        c.restore();
        (o.nhanGoc || []).forEach(function (n) {   // nhãn ghi trong mã (vd "$1$", "$82^\circ$")
          var dN = Math.max(12 * px, r * (n.e || 0.6)); c.save(); c.font = (/^[A-Za-zα-ω]$/.test(n.nd) ? 'italic ' : '') + (19 * px) + 'px ' + FONT_TEN; c.fillStyle = mauG; c.textAlign = 'center'; c.textBaseline = 'middle';
          c.fillText(n.nd, v.o.x + Math.cos(am) * dN, v.o.y + Math.sin(am) * dN); c.restore();
        });
        if (hienSo && !o.anSo) { c.font = '700 ' + (18 * px) + 'px ' + fam; c.fillStyle = mauG; c.textAlign = 'center'; c.textBaseline = 'middle';
          c.fillText(soVN(v.do, 1) + '°', v.o.x + Math.cos(am) * (rNgoai + 22 * px), v.o.y + Math.sin(am) * (rNgoai + 22 * px)); }
      } else if (v.k === 'doDai' && hienSo) {
        var mx = (v.a.x + v.b.x) / 2, my = (v.a.y + v.b.y) / 2, nx = -(v.b.y - v.a.y) / v.d, ny = (v.b.x - v.a.x) / v.d;
        if (ny > 0) { nx = -nx; ny = -ny; }
        var ta = timTheoId(o.a), tb = timTheoId(o.b), chu = (ta && tb && ta.ten && tb.ten ? ta.ten + tb.ten + ' = ' : '') + soVN(v.d / DV, 2) + ' cm';
        c.font = '700 ' + (17 * px) + 'px ' + fam; var w = c.measureText(chu).width + 14 * px, X2 = mx + nx * 20 * px, Y2 = my + ny * 20 * px;
        bo(c, X2 - w / 2, Y2 - 12 * px, w, 24 * px, 12 * px); c.fillStyle = sang(o) ? mauSang : (o.mau || '#DC2626'); c.fill();
        c.fillStyle = '#fff'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(chu, X2, Y2 + px);
      }
    });
    // chữ, thanh trượt
    t.hinh.forEach(function (o) {
      var v = gt[o.id]; if (!v || !hien(o)) return;
      if (o.loai === 'nhanTZ') {
        var gN = o.huong == null ? null : o.huong * Math.PI / 180, dN = gN == null ? 0 : Math.max(12, (o.kc || 0.25) * 40 * 1.5 * 1.15) * px, motChu = /^[A-Za-zα-ω]'*\d*$/.test(o.nd);
        c.save(); c.font = (motChu ? 'italic ' : '') + (21 * px) + 'px ' + FONT_TEN; c.textAlign = 'center'; c.textBaseline = 'middle';
        var xN = v.x + (gN == null ? 0 : Math.cos(gN) * dN), yN = v.y - (gN == null ? 0 : Math.sin(gN) * dN);
        c.lineWidth = 4 * px; c.strokeStyle = kieuNen().mau; c.lineJoin = 'round'; c.strokeText(o.nd, xN, yN); c.fillStyle = o.mau || mauChu; c.fillText(o.nd, xN, yN); c.restore();
        return;
      }
      if (o.loai === 'chu' || o.loai === 'congThuc') {
        if (o === dangSoan) { o._khung = o._khung || { x0: o.x, y0: o.y, x1: o.x + 100, y1: o.y + 30 }; return; }   // đang mở khung soạn
        o._khung = o.loai === 'chu' ? GI.vanBan.ve(c, o, mauChu) : GI.congThuc.ve(c, o, mauChu, canVe);
        if (sang(o) && c === ctx) {
          var k = o._khung; c.save(); c.setLineDash([5 * px, 4 * px]); c.strokeStyle = mauSang; c.lineWidth = 1.5 * px; c.strokeRect(k.x0 - 5 * px, k.y0 - 5 * px, k.x1 - k.x0 + 10 * px, k.y1 - k.y0 + 10 * px); c.restore();
          veKhoa(c, oKhoa(o), !!o.coDinh, px);
        }
      } else if (o.loai === 'thanhTruot') {
        var L = o.dai * px, tt = (o.gt - o.min) / ((o.max - o.min) || 1), X = o.x + L * Math.max(0, Math.min(1, tt));
        c.save(); c.lineCap = 'round';
        c.beginPath(); c.moveTo(o.x, o.y); c.lineTo(o.x + L, o.y); c.strokeStyle = '#CBD5E1'; c.lineWidth = 5 * px; c.stroke();
        c.beginPath(); c.moveTo(o.x, o.y); c.lineTo(X, o.y); c.strokeStyle = o.mau || '#2563EB'; c.lineWidth = 5 * px; c.stroke();
        c.beginPath(); c.arc(X, o.y, (sang(o) ? 10 : 8) * px, 0, Math.PI * 2); c.fillStyle = o.mau || '#2563EB'; c.fill(); c.strokeStyle = '#fff'; c.lineWidth = 2 * px; c.stroke();
        c.font = (18 * px) + 'px ' + FONT_TEX; c.fillStyle = mauChu; c.textAlign = 'left'; c.textBaseline = 'bottom';
        c.fillText(o.ten + ' = ' + soVN(o.gt, 2), o.x, o.y - 12 * px);
        c.restore();
      }
    });
    // điểm và tên điểm
    t.hinh.forEach(function (o) {
      var v = gt[o.id]; if (!v || v.k !== 'diem' || !hien(o)) return;
      var tuDo = o.loai === 'diem' || o.loai === 'diemTren', r = o.rong || 5;
      if (sang(o)) { c.beginPath(); c.arc(v.x, v.y, (r + 6) * px, 0, Math.PI * 2); c.fillStyle = 'rgba(249,115,22,.4)'; c.fill(); }
      if (!o.chamAn) {
        c.beginPath(); c.arc(v.x, v.y, r * px, 0, Math.PI * 2);
        c.fillStyle = o.mau || (tuDo ? '#2451C7' : (kieuNen().toi ? '#E5E7EB' : '#334155')); c.fill();
        c.lineWidth = 1.5 * px; c.strokeStyle = kieuNen().toi ? '#111827' : '#FFFFFF'; c.stroke();
      }
      if (o.ten && hienTenCua(o)) {
        if (o.huongTZ) {   // tên đặt theo hướng ghi trong mã TikZ: tâm chữ cách điểm một khoảng theo góc g
          c.save(); c.font = 'italic ' + (22 * px) + 'px ' + FONT_TEN; var wT = c.measureText(o.ten).width; c.restore();
          var dT = Math.max(15, o.huongTZ.kc * 40 * 1.5 * 1.15) * px, gT = o.huongTZ.g * Math.PI / 180;
          veTen(c, o.ten, v.x + Math.cos(gT) * dT - wT / 2, v.y - Math.sin(gT) * dT + 8 * px, px, mauChu, o);
        } else veTen(c, o.ten, v.x + (r + 2) * px, v.y - (r) * px, px, mauChu, o);
      }
    });
  }

  var giaTri = {};   // toạ độ đã tính của trang hiện tại
  function ve() {
    var t = trang(), vn = vungNhin(), s = V.s;
    ctx.setTransform(dpr * s, 0, 0, dpr * s, -V.x * s * dpr, -V.y * s * dpr);
    veNen(ctx, vn, s);
    veTrangPdf(ctx, vn, s, false);
    if (coTruc()) veTruc(ctx, vn, s);
    giaTri = H.tinh(t.hinh);
    vungTen = [];
    var sang = {}; if (diDuoi) sang[diDuoi] = 1; if (chonId) sang[chonId] = 1; nhom.forEach(function (x) { if (x.h) sang[x.h] = 1; }); choChon.forEach(function (x) { if (x.id) sang[x.id] = 1; });
    veHinh(ctx, vn, s, giaTri, sang);
    t.moHinh.forEach(function (m) { veTheMoHinh(ctx, m, trongNhom({ m: m })); });
    t.net.forEach(function (n) { veNet(ctx, n); });
    nhom.forEach(function (x) { if (!x.n) return; ctx.save(); ctx.setLineDash([6 / s, 5 / s]); ctx.strokeStyle = '#2451C7'; ctx.lineWidth = 1.5 / s; var bb = khungNet(x.n); ctx.strokeRect(bb.x0 - 6 / s, bb.y0 - 6 / s, bb.x1 - bb.x0 + 12 / s, bb.y1 - bb.y0 + 12 / s); ctx.restore(); });
    var gMau = mauDangChon(); if (gMau && cc === 'chon') { var kM = khungMau(gMau); if (kM) veNutXoay(ctx, viTriNutXoay(kM), 1 / s); }
    if (dangKeo && dangKeo.loai === 'khung') {   // khung chọn
      var ka = dangKeo.a, kb = dangKeo.b; ctx.save(); ctx.fillStyle = 'rgba(37,99,235,.08)'; ctx.strokeStyle = '#2563EB'; ctx.lineWidth = 1.2 / s; ctx.setLineDash([5 / s, 4 / s]);
      ctx.fillRect(Math.min(ka.x, kb.x), Math.min(ka.y, kb.y), Math.abs(kb.x - ka.x), Math.abs(kb.y - ka.y)); ctx.strokeRect(Math.min(ka.x, kb.x), Math.min(ka.y, kb.y), Math.abs(kb.x - ka.x), Math.abs(kb.y - ka.y)); ctx.restore();
    }
    veXemTruoc(ctx, s);
    dungCuDS.forEach(function (dc) { GI.dungCu.ve(ctx, dc, 1 / s, dangKeo && dangKeo.loai === 'xoayDC' && dangKeo.dc === dc); });
    capNhatThanhCuon();
  }

  // ----- Thanh trượt dọc bên phải: cuộn bảng lên / xuống -----
  var cuon = { A: 0, B: 1, keo: null };
  function bienNoiDung() {   // mép trên / dưới của mọi thứ trên trang (toạ độ thế giới)
    var t = trang(), y0 = Infinity, y1 = -Infinity;
    function y(v) { if (v < y0) y0 = v; if (v > y1) y1 = v; }
    t.net.forEach(function (n) { n.pts.forEach(function (q) { y(q[1]); }); });
    t.hinh.forEach(function (o) {
      if (o.an) return; var v = giaTri[o.id]; if (!v) return;
      if (o.loai === 'anh') { y(o.y); y(o.y + o.h); }
      else if (o._khung) { y(o._khung.y0); y(o._khung.y1); }
      else if (v.k === 'diem') y(v.y); else if (v.k === 'tron') { y(v.c.y - v.r); y(v.c.y + v.r); }
      else if (v.k === 'thang' && v.loai === 'doan') { y(v.p.y); y(v.q.y); }
      else if (v.k === 'khoi' && v.khung) { y(v.khung.y0); y(v.khung.y1); }
    });
    t.moHinh.forEach(function (m) { y(m.y); y(m.y + KT_THE.h); });
    if (t.pdf) viTriTrangPdf(t.pdf).forEach(function (r) { y(r.y); y(r.y + r.h); });
    return isFinite(y0) ? { y0: y0, y1: y1 } : null;
  }
  function capNhatThanhCuon() {
    var el = $('#cuon-doc'), nut = $('#cuon-nut'); if (!el) return;
    var caoNhin = Hh / V.s, nd = bienNoiDung();
    if (!cuon.keo) {
      cuon.A = Math.min(nd ? nd.y0 - 40 / V.s : V.y, V.y);
      cuon.B = Math.max(nd ? nd.y1 + caoNhin * 0.6 : V.y + caoNhin * 1.5, V.y + caoNhin);
    }
    var T = el.clientHeight, dai = cuon.B - cuon.A, nh = Math.max(32, Math.min(T, T * caoNhin / dai)), du = Math.max(1e-6, dai - caoNhin);
    nut.style.height = nh + 'px'; nut.style.top = Math.max(0, Math.min(T - nh, (V.y - cuon.A) / du * (T - nh))) + 'px';
  }
  (function () {
    var el = $('#cuon-doc'), nut = $('#cuon-nut'); if (!el) return;
    nut.addEventListener('pointerdown', function (e) {
      e.preventDefault(); e.stopPropagation(); nut.setPointerCapture(e.pointerId); el.classList.add('dang');
      cuon.keo = { y: e.clientY, Vy: V.y, he: (cuon.B - cuon.A - Hh / V.s) / Math.max(1, el.clientHeight - nut.offsetHeight) };
    });
    nut.addEventListener('pointermove', function (e) { if (!cuon.keo) return; V.y = cuon.keo.Vy + (e.clientY - cuon.keo.y) * cuon.keo.he; canVe(); });
    function tha() { if (!cuon.keo) return; cuon.keo = null; el.classList.remove('dang'); canVe(); }
    nut.addEventListener('pointerup', tha); nut.addEventListener('pointercancel', tha);
    el.addEventListener('pointerdown', function (e) {   // bấm vào rãnh: cuộn một trang
      if (e.target !== el) return; e.preventDefault(); var r = nut.getBoundingClientRect();
      V.y += (e.clientY < r.top ? -1 : 1) * 0.9 * Hh / V.s; canVe();
    });
  })();

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
    if (!o.ten && (H.LA_THANG[o.loai] || H.LA_TRON[o.loai] || H.LA_CUNG[o.loai] || o.loai === 'gapKhuc' || H.LA_CONIC[o.loai])) o.ten = tenDuongMoi();
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
     CÔNG CỤ DỰNG HÌNH (kiểu GeoGebra): mỗi công cụ là một dãy bước chọn
     Loại bước: diem (chọn hoặc tạo điểm) · diemCo (điểm có sẵn) · thang (đường thẳng/đoạn/tia)
                tron (đường tròn) · vung (đa giác, đường tròn, hình quạt) · hinh (đối tượng để biến hình)
     ===================================================================== */
  function laTron(o, v) { return v.k === 'tron'; }
  function laVung(o, v) { return v.k === 'daGiac' || v.k === 'tron' || (v.k === 'cung' && v.quat); }
  function laHinh(o, v) { return { thang: 1, tron: 1, daGiac: 1, gapKhuc: 1, cung: 1, cong: 1 }[v.k] === 1; }
  function trongDaGiac(ds, M) { var c = false; for (var i = 0, j = ds.length - 1; i < ds.length; j = i++) { var a = ds[i], b = ds[j]; if ((a.y > M.y) !== (b.y > M.y) && M.x < (b.x - a.x) * (M.y - a.y) / (b.y - a.y) + a.x) c = !c; } return c; }
  function timVung(M) {
    var o = timDoiTuong(M, laVung); if (o) return o;
    var ds = trang().hinh.filter(function (x) { var v = giaTri[x.id]; return v && !x.an && v.k === 'daGiac' && trongDaGiac(v.ds, M); });
    if (ds.length) return ds[ds.length - 1];
    var tr = trang().hinh.filter(function (x) { var v = giaTri[x.id]; return v && !x.an && v.k === 'tron' && H.kc(v.c, M) < v.r; });
    return tr[tr.length - 1] || null;
  }
  // Tìm ứng viên cho một bước (không tạo mới) — dùng để làm sáng khi rê chuột
  function ungVien(M, kieu) {
    if (kieu === 'diem' || kieu === 'diemCo') { var d = timDiem(M); return d ? d.id : null; }
    var o = kieu === 'thang' ? timDoiTuong(M, laThang) : kieu === 'tron' ? timDoiTuong(M, laTron) : kieu === 'vung' ? timVung(M)
      : kieu === 'hinh' ? (timDiem(M) || timDoiTuong(M, laHinh)) : kieu === 'duongTron' ? timDoiTuong(M, function (x, v) { return v.k === 'thang' || v.k === 'tron'; }) : null;
    return o ? o.id : null;
  }
  var TEN_BUOC = { diem: 'một điểm', diemCo: 'một điểm có sẵn', thang: 'một đường thẳng, đoạn hoặc tia', tron: 'một đường tròn', vung: 'một đa giác, đường tròn hoặc hình quạt', hinh: 'hình cần biến đổi (điểm, đoạn, đường, đa giác, đường tròn…)', duongTron: 'một đường thẳng hoặc đường tròn' };
  function tenPhay(o) { var t = o && o.ten; if (!t) return undefined; var dung = {}; trang().hinh.forEach(function (x) { if (x.ten) dung[x.ten] = 1; }); t += "'"; while (dung[t]) t += "'"; return t; }
  function themBienHinh(o) { var src = timTheoId(o.nguon), v = giaTri[o.nguon]; o.id = idMoi('h'); o.ten = v && v.k === 'diem' ? (tenPhay(src) || tenDiemMoi()) : (tenPhay(src) || tenDuongMoi()); return themHinh(o); }
  // Danh sách công cụ: [tên, các bước, gợi ý từng bước, hàm tạo (ids) → có thể trả Promise]
  var CONG_CU = {
    diem: { buoc: ['diem'], goiY: ['Bấm để đặt điểm (bấm lên đường thẳng, đường tròn để đặt điểm trên đó)'], tao: function () {} },
    diemTren: { buoc: ['duongTron'], goiY: ['Bấm lên đường thẳng hoặc đường tròn để đặt điểm thuộc đối tượng'], tao: function (ids, M) { themHinh({ id: idMoi('d'), loai: 'diemTren', tren: ids[0], t: H.thamSo(giaTri[ids[0]], M), ten: tenDiemMoi() }); } },
    giao: { buoc: ['duongTron', 'duongTron'], goiY: ['Chọn đối tượng thứ nhất', 'Chọn đối tượng thứ hai'], tao: function (ids) {
      var c2 = H.catNhau(giaTri[ids[0]], giaTri[ids[1]]); if (!c2.length) return thongBao('Hai đối tượng này không cắt nhau');
      c2.forEach(function (P, k) { themHinh({ id: idMoi('d'), loai: 'giao', o1: ids[0], o2: ids[1], k: k, ten: tenDiemMoi() }); }); } },
    trungDiem: { buoc: ['diem', 'diem'], goiY: ['Chọn hai điểm (hoặc bấm vào một đoạn thẳng / đường tròn để lấy trung điểm / tâm)', 'Chọn điểm thứ hai'], tao: function (ids) { themHinh({ id: idMoi('d'), loai: 'trungDiem', a: ids[0], b: ids[1], ten: tenDiemMoi() }); } },
    duong: { buoc: ['diem', 'diem'], goiY: ['Chọn điểm thứ nhất', 'Chọn điểm thứ hai'], tao: function (ids) { themHinh({ id: idMoi('h'), loai: 'duong', a: ids[0], b: ids[1] }); } },
    doan: { buoc: ['diem', 'diem'], goiY: ['Chọn điểm đầu', 'Chọn điểm cuối'], tao: function (ids) { themHinh({ id: idMoi('h'), loai: 'doan', a: ids[0], b: ids[1] }); } },
    doanCoDinh: { buoc: ['diem'], goiY: ['Chọn điểm đầu của đoạn thẳng'], tao: function (ids) {
      return hoi({ tieuDe: 'Đoạn thẳng với độ dài cố định', nhan: 'Độ dài (cm)', macDinh: '3' }).then(function (l) {
        if (!(l > 0)) return; var B = themHinh({ id: idMoi('d'), loai: 'diemCach', a: ids[0], l: l, t: 0, ten: tenDiemMoi() }); themHinh({ id: idMoi('h'), loai: 'doan', a: ids[0], b: B.id }); }); } },
    tia: { buoc: ['diem', 'diem'], goiY: ['Chọn gốc của tia', 'Chọn điểm tia đi qua'], tao: function (ids) { themHinh({ id: idMoi('h'), loai: 'tia', a: ids[0], b: ids[1] }); } },
    elip: { buoc: ['diem', 'diem', 'diem'], goiY: ['Chọn tiêu điểm thứ nhất', 'Chọn tiêu điểm thứ hai', 'Chọn một điểm trên elip'], tao: function (ids) { themHinh({ id: idMoi('h'), loai: 'elip', a: ids[0], b: ids[1], c: ids[2] }); } },
    hypebol: { buoc: ['diem', 'diem', 'diem'], goiY: ['Chọn tiêu điểm thứ nhất', 'Chọn tiêu điểm thứ hai', 'Chọn một điểm trên hypebol'], tao: function (ids) { if (!H.tinh(trang().hinh.concat([{ id: '_t', loai: 'hypebol', a: ids[0], b: ids[1], c: ids[2] }]))._t) return thongBao('Điểm này không tạo được hypebol'); themHinh({ id: idMoi('h'), loai: 'hypebol', a: ids[0], b: ids[1], c: ids[2] }); } },
    parabol: { buoc: ['diem', 'thang'], goiY: ['Chọn tiêu điểm', 'Chọn đường chuẩn (đường thẳng)'], tao: function (ids) { themHinh({ id: idMoi('h'), loai: 'parabol', a: ids[0], d: ids[1] }); } },
    gapKhuc: { buoc: ['nhieu'], goiY: ['Chọn lần lượt các điểm, bấm lại điểm cuối để kết thúc'] },
    vuongGoc: { buoc: ['diem', 'thang'], linhHoat: true, goiY: ['Chọn một điểm và một đường thẳng', 'Chọn đường thẳng (hoặc điểm) còn lại'], tao: function (ids) { themHinh({ id: idMoi('h'), loai: 'vuongGoc', a: ids[0], d: ids[1] }); } },
    songSong: { buoc: ['diem', 'thang'], linhHoat: true, goiY: ['Chọn một điểm và một đường thẳng', 'Chọn đường thẳng (hoặc điểm) còn lại'], tao: function (ids) { themHinh({ id: idMoi('h'), loai: 'songSong', a: ids[0], d: ids[1] }); } },
    trungTruc: { buoc: ['diem', 'diem'], goiY: ['Chọn hai điểm (hoặc bấm vào một đoạn thẳng)', 'Chọn điểm thứ hai'], tao: function (ids) { themHinh({ id: idMoi('h'), loai: 'trungTruc', a: ids[0], b: ids[1] }); } },
    phanGiac: { buoc: ['diem', 'diem', 'diem'], goiY: ['Chọn điểm trên cạnh thứ nhất', 'Chọn đỉnh của góc', 'Chọn điểm trên cạnh thứ hai'], tao: function (ids) { themHinh({ id: idMoi('h'), loai: 'phanGiac', a: ids[0], o: ids[1], b: ids[2] }); } },
    daGiac: { buoc: ['nhieu'], goiY: ['Chọn lần lượt các đỉnh, bấm lại đỉnh đầu để khép kín'] },
    daGiacDeu: { buoc: ['diem', 'diem'], goiY: ['Chọn đỉnh thứ nhất', 'Chọn đỉnh thứ hai'], tao: function (ids) {
      return hoi({ tieuDe: 'Đa giác đều', nhan: 'Số đỉnh', macDinh: '6', nguyen: true }).then(function (n) {
        n = Math.round(n); if (!(n >= 3 && n <= 40)) return thongBao('Số đỉnh từ 3 đến 40');
        var dg = themHinh({ id: idMoi('h'), loai: 'daGiacDeu', a: ids[0], b: ids[1], n: n });
        for (var i = 2; i < n; i++) themHinh({ id: idMoi('d'), loai: 'dinhDG', dg: dg.id, i: i, ten: tenDiemMoi() }); }); } },
    tron: { buoc: ['diem', 'diem'], goiY: ['Chọn tâm', 'Chọn một điểm trên đường tròn'], tao: function (ids) { themHinh({ id: idMoi('h'), loai: 'tron', o: ids[0], a: ids[1] }); } },
    tronBanKinh: { buoc: ['diem'], goiY: ['Chọn tâm đường tròn'], tao: function (ids) {
      return hoi({ tieuDe: 'Đường tròn khi biết tâm và bán kính', nhan: 'Bán kính (cm)', macDinh: '2' }).then(function (r) { if (r > 0) themHinh({ id: idMoi('h'), loai: 'tronBanKinh', o: ids[0], r: r }); }); } },
    compa: { buoc: ['diem', 'diem', 'diem'], goiY: ['Chọn điểm đầu của đoạn làm bán kính (hoặc bấm vào một đoạn thẳng)', 'Chọn điểm cuối của đoạn làm bán kính', 'Chọn tâm đường tròn'], tao: function (ids) { themHinh({ id: idMoi('h'), loai: 'compa', a: ids[0], b: ids[1], o: ids[2] }); } },
    tron3Diem: { buoc: ['diem', 'diem', 'diem'], goiY: ['Chọn điểm thứ nhất', 'Chọn điểm thứ hai', 'Chọn điểm thứ ba'], tao: function (ids) { themHinh({ id: idMoi('h'), loai: 'tron3', a: ids[0], b: ids[1], c: ids[2] }); } },
    banNguyet: { buoc: ['diem', 'diem'], goiY: ['Chọn điểm đầu đường kính', 'Chọn điểm cuối đường kính'], tao: function (ids) { themHinh({ id: idMoi('h'), loai: 'banNguyet', a: ids[0], b: ids[1] }); } },
    cungTam: { buoc: ['diem', 'diem', 'diem'], goiY: ['Chọn tâm', 'Chọn điểm đầu cung', 'Chọn điểm cuối cung (theo chiều ngược kim đồng hồ)'], tao: function (ids) { themHinh({ id: idMoi('h'), loai: 'cungTam', o: ids[0], a: ids[1], b: ids[2] }); } },
    cung3Diem: { buoc: ['diem', 'diem', 'diem'], goiY: ['Chọn điểm đầu cung', 'Chọn điểm cung đi qua', 'Chọn điểm cuối cung'], tao: function (ids) { themHinh({ id: idMoi('h'), loai: 'cung3', a: ids[0], b: ids[1], c: ids[2] }); } },
    quatTam: { buoc: ['diem', 'diem', 'diem'], goiY: ['Chọn tâm', 'Chọn điểm đầu', 'Chọn điểm cuối (theo chiều ngược kim đồng hồ)'], tao: function (ids) { themHinh({ id: idMoi('h'), loai: 'quatTam', o: ids[0], a: ids[1], b: ids[2] }); } },
    quat3Diem: { buoc: ['diem', 'diem', 'diem'], goiY: ['Chọn điểm đầu', 'Chọn điểm hình quạt đi qua', 'Chọn điểm cuối'], tao: function (ids) { themHinh({ id: idMoi('h'), loai: 'quat3', a: ids[0], b: ids[1], c: ids[2] }); } },
    goc: { buoc: ['diem', 'diem', 'diem'], goiY: ['Chọn điểm trên cạnh thứ nhất', 'Chọn đỉnh góc', 'Chọn điểm trên cạnh thứ hai'], tao: function (ids) { themHinh({ id: idMoi('h'), loai: 'goc', a: ids[0], o: ids[1], b: ids[2] }); } },
    gocChoTruoc: { buoc: ['diem', 'diem'], goiY: ['Chọn điểm trên cạnh thứ nhất', 'Chọn đỉnh góc'], tao: function (ids) {
      return hoi({ tieuDe: 'Góc với độ lớn cho trước', nhan: 'Số đo góc (độ, ngược chiều kim đồng hồ)', macDinh: '45' }).then(function (g) {
        if (!isFinite(g)) return; var B = themBienHinh({ loai: 'bienHinh', kieu: 'quay', nguon: ids[0], tam: ids[1], goc: g });
        themHinh({ id: idMoi('h'), loai: 'goc', a: ids[0], o: ids[1], b: B.id }); }); } },
    goc2: { buoc: ['diem', 'diem', 'diem'], goiY: ['Chọn điểm trên cạnh thứ nhất', 'Chọn đỉnh góc', 'Chọn điểm trên cạnh thứ hai'], tao: function (ids) { taoGoc(ids, 2, false); } },
    goc3: { buoc: ['diem', 'diem', 'diem'], goiY: ['Chọn điểm trên cạnh thứ nhất', 'Chọn đỉnh góc', 'Chọn điểm trên cạnh thứ hai'], tao: function (ids) { taoGoc(ids, 3, false); } },
    gocGach1: { buoc: ['diem', 'diem', 'diem'], goiY: ['Chọn điểm trên cạnh thứ nhất', 'Chọn đỉnh góc', 'Chọn điểm trên cạnh thứ hai'], tao: function (ids) { taoGoc(ids, 1, true); } },
    gocGach2: { buoc: ['diem', 'diem', 'diem'], goiY: ['Chọn điểm trên cạnh thứ nhất', 'Chọn đỉnh góc', 'Chọn điểm trên cạnh thứ hai'], tao: function (ids) { taoGoc(ids, 2, true); } },
    d_trungTuyen: { buoc: ['diem', 'diem', 'diem'], goiY: ['Chọn đỉnh kẻ đường trung tuyến', 'Chọn đầu thứ nhất của cạnh đối diện', 'Chọn đầu thứ hai của cạnh đối diện'], tao: function (ids) {
      var M = themHinh({ id: idMoi('d'), loai: 'trungDiem', a: ids[1], b: ids[2], ten: tenDiemMoi() }); themHinh({ id: idMoi('h'), loai: 'doan', a: ids[0], b: M.id }); tenRaNgoai(M.id, ids[0]); } },
    d_trongTam: { buoc: ['diem', 'diem', 'diem'], goiY: ['Chọn đỉnh thứ nhất của tam giác', 'Chọn đỉnh thứ hai', 'Chọn đỉnh thứ ba'], tao: function (ids) { themHinh({ id: idMoi('d'), loai: 'trongTam', a: ids[0], b: ids[1], c: ids[2], ten: tenUuTien('G') }); } },
    d_duongCao: { buoc: ['diem', 'diem', 'diem'], goiY: ['Chọn đỉnh kẻ đường cao', 'Chọn đầu thứ nhất của cạnh đối diện', 'Chọn đầu thứ hai của cạnh đối diện'], tao: function (ids) {
      var Hc = themHinh({ id: idMoi('d'), loai: 'chanCao', a: ids[0], b: ids[1], c: ids[2], ten: tenDiemMoi() }), v = H.tinh(trang().hinh)[Hc.id];
      themHinh({ id: idMoi('h'), loai: 'doan', a: ids[0], b: Hc.id }); tenRaNgoai(Hc.id, ids[0]);
      // kí hiệu góc vuông ở chân đường cao, cạnh về phía đầu xa hơn
      var xa = v && Math.abs(v.t) > Math.abs(1 - v.t) ? ids[1] : ids[2]; themHinh({ id: idMoi('h'), loai: 'gocVuong', a: ids[0], o: Hc.id, b: xa });
      // chân đường cao nằm ngoài cạnh: kéo dài cạnh bằng nét đứt
      if (v && (v.t < -1e-6 || v.t > 1 + 1e-6)) themHinh({ id: idMoi('h'), loai: 'doan', a: Hc.id, b: v.t < 0 ? ids[1] : ids[2], kieuNet: 'dut', rong: 1.8 });
    } },
    d_trucTam: { buoc: ['diem', 'diem', 'diem'], goiY: ['Chọn đỉnh thứ nhất của tam giác', 'Chọn đỉnh thứ hai', 'Chọn đỉnh thứ ba'], tao: function (ids) { themHinh({ id: idMoi('d'), loai: 'trucTam', a: ids[0], b: ids[1], c: ids[2], ten: tenUuTien('H') }); } },
    gocVuong: { buoc: ['diem', 'diem', 'diem'], goiY: ['Chọn điểm trên cạnh thứ nhất', 'Chọn đỉnh góc vuông', 'Chọn điểm trên cạnh thứ hai'], tao: function (ids) { themHinh({ id: idMoi('h'), loai: 'gocVuong', a: ids[0], o: ids[1], b: ids[2] }); } },
    doDai: { buoc: ['diem', 'diem'], goiY: ['Chọn hai điểm (hoặc bấm vào một đoạn thẳng)', 'Chọn điểm thứ hai'], tao: function (ids) { themHinh({ id: idMoi('h'), loai: 'doDai', a: ids[0], b: ids[1] }); } },
    dienTich: { buoc: ['vung'], goiY: ['Bấm vào đa giác, đường tròn hoặc hình quạt'], tao: function (ids) { themHinh({ id: idMoi('h'), loai: 'dienTich', d: ids[0] }); } },
    dxTruc: { buoc: ['hinh', 'thang'], goiY: ['Chọn hình cần lấy đối xứng', 'Chọn trục đối xứng (đường thẳng)'], tao: function (ids) { themBienHinh({ loai: 'bienHinh', kieu: 'dxTruc', nguon: ids[0], truc: ids[1] }); } },
    dxTam: { buoc: ['hinh', 'diem'], goiY: ['Chọn hình cần lấy đối xứng', 'Chọn tâm đối xứng'], tao: function (ids) { themBienHinh({ loai: 'bienHinh', kieu: 'dxTam', nguon: ids[0], tam: ids[1] }); } },
    nghichDao: { buoc: ['diemCo', 'tron'], goiY: ['Chọn điểm', 'Chọn đường tròn'], tao: function (ids) { themBienHinh({ loai: 'bienHinh', kieu: 'nghichDao', nguon: ids[0], tron: ids[1] }); } },
    quay: { buoc: ['hinh', 'diem'], goiY: ['Chọn hình cần quay', 'Chọn tâm quay'], tao: function (ids) {
      return hoi({ tieuDe: 'Quay quanh một điểm', nhan: 'Góc quay (độ, dương: ngược chiều kim đồng hồ)', macDinh: '90' }).then(function (g) { if (isFinite(g)) themBienHinh({ loai: 'bienHinh', kieu: 'quay', nguon: ids[0], tam: ids[1], goc: g }); }); } },
    tinhTien: { buoc: ['hinh', 'diem', 'diem'], goiY: ['Chọn hình cần tịnh tiến', 'Chọn điểm đầu của vectơ tịnh tiến', 'Chọn điểm cuối của vectơ'], tao: function (ids) { themBienHinh({ loai: 'bienHinh', kieu: 'tinhTien', nguon: ids[0], v1: ids[1], v2: ids[2] }); } },
    viTu: { buoc: ['hinh', 'diem'], goiY: ['Chọn hình', 'Chọn tâm vị tự'], tao: function (ids) {
      return hoi({ tieuDe: 'Phép vị tự', nhan: 'Tỉ số k', macDinh: '2' }).then(function (k) { if (isFinite(k) && k !== 0) themBienHinh({ loai: 'bienHinh', kieu: 'viTu', nguon: ids[0], tam: ids[1], k: k }); }); } },
    thanhTruot: { buoc: ['viTri'], goiY: ['Bấm vào chỗ muốn đặt thanh trượt'], tao: function (ids, M) {
      var dung = {}; trang().hinh.forEach(function (x) { if (x.ten) dung[x.ten] = 1; });
      var ten = ['a', 'b', 'c', 'k', 'm', 'n', 'p', 'q', 'r', 's'].filter(function (x) { return !dung[x]; })[0] || ('a' + demId);
      themHinh({ id: idMoi('h'), loai: 'thanhTruot', ten: ten, min: -5, max: 5, buoc: 0.1, gt: 1, x: M.x, y: M.y, dai: 200 });
      thongBao('Đã thêm thanh trượt ' + ten + ' · kéo nút tròn để đổi giá trị'); } },
    chu: { buoc: ['viTri'], goiY: ['Bấm vào chỗ muốn gõ chữ (bấm vào chữ có sẵn để sửa)'], tao: function (ids, M) {
      var cu = timChuTruot(M); if (cu && cu.loai === 'chu') { truoc.pop(); moSoanChu(cu, false); return; }
      var o = themHinh({ id: idMoi('h'), loai: 'chu', x: M.x, y: M.y, co: 26, font: 'Arial', doan: [{ canh: 'trai', runs: [] }] }); moSoanChu(o, true); } },
  };

  function taoGoc(ids, cung, gach) { themHinh({ id: idMoi('h'), loai: 'goc', a: ids[0], o: ids[1], b: ids[2], cung: cung > 1 ? cung : undefined, gach: gach || undefined, anSo: true }); }
  // đặt tên điểm (chân đường cao, trung điểm) ra phía ngoài, ngược với đỉnh kẻ xuống
  function tenRaNgoai(idDiem, idDinh) {
    var g = giaTri[idDiem], A = giaTri[idDinh], o = timTheoId(idDiem); if (!g || !A || !o) return;
    var dx = g.x - A.x, dy = g.y - A.y, L = Math.hypot(dx, dy); if (L < 1e-9) return; dx /= L; dy /= L;
    o.nhan = { dx: Math.round(dx * 17 - 13), dy: Math.round(dy * 17 + 13) };
  }
  function tenUuTien(t) { return trang().hinh.some(function (o) { return o.ten === t; }) ? tenDiemMoi() : t; }
  function xongDung() { choChon = []; capNhatGoiY(); canVe(); if (chonId) veThuocTinh(); }
  function bamDungHinh(M) {
    var t = trang();
    if (cc === 'xoa') {
      var mh = timMoHinh(M), dx = timDiem(M) || timDoiTuong(M) || timSoDo(M) || timChuTruot(M);
      if (!dx && mh) { ghiLichSu(); t.moHinh.splice(t.moHinh.indexOf(mh), 1); canVe(); return; }
      if (!dx) return thongBao('Không có hình ở đây. Để xoá nét viết, dùng Tẩy.');
      ghiLichSu(); var bo2 = H.phuThuoc(t.hinh, dx.id);
      t.hinh = t.hinh.filter(function (o) { return !bo2[o.id]; }); if (chonId && !timTheoId(chonId)) dongThuocTinh(); else if (chonId) veThuocTinh(); canVe(); return;
    }
    if (cc === 'ganDiem') {   // dán điểm tự do lên đối tượng / huỷ dán điểm thuộc đối tượng
      var d0 = timDiem(M);
      if (!choChon.length) {
        if (!d0) return thongBao('Hãy chọn một điểm');
        if (d0.loai === 'diemTren') { ghiLichSu(); var v0 = giaTri[d0.id]; delete d0.tren; delete d0.t; d0.loai = 'diem'; d0.x = v0.x; d0.y = v0.y; thongBao('Đã huỷ dán điểm ' + (d0.ten || '')); return xongDung(); }
        if (d0.loai !== 'diem') return thongBao('Chỉ dán được điểm tự do');
        choChon.push({ id: d0.id }); capNhatGoiY(); canVe(); return;
      }
      var lt = timDoiTuong(M, function (x, v) { return (v.k === 'thang' || v.k === 'tron') && x.id !== choChon[0].id; });
      if (!lt) return thongBao('Hãy chọn đường thẳng hoặc đường tròn để dán điểm');
      ghiLichSu(); var dd0 = timTheoId(choChon[0].id); dd0.loai = 'diemTren'; dd0.tren = lt.id; dd0.t = H.thamSo(giaTri[lt.id], { x: dd0.x, y: dd0.y }); delete dd0.x; delete dd0.y;
      return xongDung();
    }
    var cu = CONG_CU[cc]; if (!cu) return;
    // Đa giác, đường gấp khúc: chọn nhiều điểm
    if (cu.buoc[0] === 'nhieu') {
      var dd = timDiem(M), dong = cc === 'daGiac' ? choChon.length >= 3 && dd && dd.id === choChon[0].id : choChon.length >= 2 && dd && dd.id === choChon[choChon.length - 1].id;
      if (dong) { themHinh({ id: idMoi('h'), loai: cc, ds: choChon.map(function (x) { return x.id; }) }); return xongDung(); }
      if (!choChon.length) ghiLichSu();
      var idm = layDiem(M); if (!choChon.some(function (x) { return x.id === idm; }) || cc === 'gapKhuc') choChon.push({ id: idm });
      capNhatGoiY(); canVe(); return;
    }
    // Bấm thẳng vào đoạn thẳng / đường tròn ở bước đầu (trung điểm, độ dài, trung trực, compa)
    if (!choChon.length && !timDiem(M)) {
      var dn = timDoiTuong(M, function (o) { return o.loai === 'doan'; });
      if (dn && (cc === 'trungDiem' || cc === 'doDai' || cc === 'trungTruc')) { ghiLichSu(); cu.tao([dn.a, dn.b], M); return xongDung(); }
      if (dn && cc === 'compa') { ghiLichSu(); choChon = [{ id: dn.a }, { id: dn.b }]; capNhatGoiY(); canVe(); return; }
      var tr = cc === 'trungDiem' && timDoiTuong(M, function (o, v) { return v.k === 'tron' || v.k === 'cung'; });
      if (tr) { ghiLichSu(); themHinh({ id: idMoi('d'), loai: 'tam', d: tr.id, ten: tenDiemMoi() }); return xongDung(); }
    }
    var kieu = cu.buoc[choChon.length], id = null;
    if (cu.linhHoat) {   // vuông góc / song song: điểm và đường theo thứ tự bất kì
      var daD = choChon.filter(function (x) { return x.kieu === 'diem'; })[0], daT = choChon.filter(function (x) { return x.kieu === 'thang'; })[0];
      var th = !daT && timDoiTuong(M, laThang), dm = timDiem(M);
      if (!choChon.length) ghiLichSu();
      if (!daT && th && (!dm || daD)) choChon.push({ id: th.id, kieu: 'thang' });
      else if (!daD) choChon.push({ id: layDiem(M), kieu: 'diem' });
      else return thongBao('Hãy chọn ' + TEN_BUOC.thang);
      daD = choChon.filter(function (x) { return x.kieu === 'diem'; })[0]; daT = choChon.filter(function (x) { return x.kieu === 'thang'; })[0];
      if (daD && daT) { cu.tao([daD.id, daT.id], M); return xongDung(); }
      capNhatGoiY(); canVe(); return;
    }
    if (kieu === 'viTri') { ghiLichSu(); var kq0 = cu.tao([], M); return kq0 && kq0.then ? kq0.then(xongDung) : xongDung(); }
    if (kieu === 'diem') { if (!choChon.length) ghiLichSu(); id = layDiem(M); }
    else { id = ungVien(M, kieu); if (!id) return thongBao('Hãy chọn ' + TEN_BUOC[kieu]); if (!choChon.length) ghiLichSu(); }
    if (choChon.length && choChon[choChon.length - 1].id === id && kieu === 'diem') return;
    choChon.push({ id: id, kieu: kieu });
    if (choChon.length < cu.buoc.length) { capNhatGoiY(); canVe(); return; }
    var ids = choChon.map(function (x) { return x.id; });
    var kq = cu.tao(ids, M);
    if (kq && kq.then) { choChon = []; capNhatGoiY(); kq.then(xongDung); } else xongDung();
  }
  // Chữ và thanh trượt dưới con trỏ (theo khung bao)
  function timChuTruot(M) {
    var ds = trang().hinh, px = 1 / V.s;
    for (var i = ds.length - 1; i >= 0; i--) {
      var o = ds[i]; if (o.an) continue;
      if ((o.loai === 'chu' || o.loai === 'congThuc') && o._khung && M.x >= o._khung.x0 - 4 * px && M.x <= o._khung.x1 + 4 * px && M.y >= o._khung.y0 - 4 * px && M.y <= o._khung.y1 + 4 * px) return o;
      if (o.loai === 'thanhTruot' && M.x >= o.x - 10 * px && M.x <= o.x + o.dai * px + 10 * px && M.y >= o.y - 30 * px && M.y <= o.y + 14 * px) return o;
    }
    return null;
  }
  // Hộp nhập số / chữ (Electron không có window.prompt)
  function hoi(o) {
    return new Promise(function (xong) {
      var h = $('#hop-nhap');
      h.querySelector('h2').textContent = o.tieuDe; h.querySelector('label span').textContent = o.nhan;
      var ip = h.querySelector('input'), ta = h.querySelector('textarea'); ip.classList.toggle('an', !!o.chu); ta.classList.toggle('an', !o.chu);
      var o2 = o.chu ? ta : ip; o2.value = o.macDinh || ''; h.querySelector('.loi').textContent = '';
      h.classList.remove('an'); setTimeout(function () { o2.focus(); o2.select(); }, 30);
      function dong(gt) { h.classList.add('an'); h.querySelector('.chinh').onclick = null; h.querySelector('[data-huy]').onclick = null; o2.onkeydown = null; xong(gt); }
      function dongY() {
        if (o.chu) return dong(ta.value);
        if (o.van) return dong(String(ip.value));   // nhập chữ một dòng (đổi tên…)
        var so = parseFloat(String(ip.value).replace(',', '.').replace('−', '-'));
        if (!isFinite(so)) { h.querySelector('.loi').textContent = 'Hãy nhập một số'; return; }
        dong(so);
      }
      h.querySelector('.chinh').onclick = dongY; h.querySelector('[data-huy]').onclick = function () { dong(null); };
      o2.onkeydown = function (e) { if (e.key === 'Enter' && (!o.chu || e.ctrlKey)) { e.preventDefault(); dongY(); } if (e.key === 'Escape') dong(null); };
    });
  }
  function datTruot(o, M) {
    var t = Math.max(0, Math.min(1, (M.x - o.x) / (o.dai / V.s))), g = o.min + t * (o.max - o.min);
    g = Math.round(g / (o.buoc || 0.1)) * (o.buoc || 0.1); o.gt = parseFloat(g.toFixed(6)); daSua = true; canVe(); if (chonId === o.id) veThuocTinh();
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
    GI.taiKhoan.moTrang(d.url);   // mang theo phiên GeoLab nếu đã đăng nhập
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
  var diDuoi = null, laser = [];
  function toaDo(e) { var r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
  function lucNhan(e) { return e.pointerType === 'pen' ? (e.pressure || 0.5) : 0.5; }

  cv.addEventListener('pointerdown', function (e) {
    if (e.button === 2) return;   // chuột phải: để menu chuột phải xử lí
    dongMenuPhai();
    if (moChinh) { moChinh = null; veBangChinh(); return; }   // chạm ra ngoài chỉ để đóng bảng chỉnh bút
    if ($('#xo-nhom')) { dongXoNhom(); return; }
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
    if (dungCuDS.length && e.button === 0 && batDauDungCu(e, M)) return;
    var keoTrang = e.button === 1 || cc === 'keo' || (e.pointerType === 'touch' && daThayBut && (cc === 'but' || cc === 'dq' || cc === 'tay' || cc === 'thang'));
    if (keoTrang) { dangKeo = { loai: 'trang', p: p, V: { x: V.x, y: V.y } }; cv.style.cursor = 'grabbing'; return; }
    if (e.button === 2) return;
    if (cc === 'thang') { netDang = { loai: 'net', kieu: 'but', mau: butCfg.mau, co: butCfg.co, thang: true, pts: [[M.x, M.y, 0.6], [M.x, M.y, 0.6]] }; veNhap(); return; }
    if (cc === 'but' || cc === 'dq') {
      var cfg = cc === 'but' ? butCfg : dqCfg;
      netDang = { loai: 'net', kieu: cc, mau: cfg.mau, co: cfg.co, pts: [[M.x, M.y, lucNhan(e)]] };
      if (cc === 'but' && (!butCfg.lucNhan || e.pointerType !== 'pen')) netDang.lucNhan = false;
      veNhap(); return;
    }
    if (cc === 'tay') { daGhiTay = false; tay(M); dangKeo = { loai: 'tay' }; veNhap(M); return; }
    if (cc === 'laser') { laser.push({ x: M.x, y: M.y, t: performance.now(), moi: true }); dangKeo = { loai: 'laser' }; chayLaser(); return; }
    if (laMau(cc) && e.button === 0) { chenMau(cc, M); return; }
    if (cc === 'chon' && chonId) {   // ổ khoá của chữ / công thức đang chọn
      var oc = timTheoId(chonId);
      if (oc && (oc.loai === 'chu' || oc.loai === 'congThuc') && oc._khung) { var PK = oKhoa(oc); if (Math.hypot(M.x - PK.x, M.y - PK.y) < 13 / V.s) { ghiLichSu(); oc.coDinh = oc.coDinh ? undefined : true; thongBao(oc.coDinh ? 'Đã khoá: không kéo được' : 'Đã mở khoá'); if (!$('#thuoc-tinh').classList.contains('an')) veThuocTinh(); canVe(); return; } }
    }
    if (cc === 'chon' && !(e.ctrlKey || e.metaKey)) {
      var tk = timTayNam(M);
      if (tk) { dangKeo = tk; if (tk.o && !trongNhom({ h: tk.o.id })) { nhom = [{ h: tk.o.id }]; capNhatChon(false); } canVe(); return; }
    }
    if (cc === 'chon') {
      var ten0 = !(e.ctrlKey || e.metaKey) && !timDiem(M) && timTen(M);
      if (ten0) { var o0 = ten0.o; dangKeo = { loai: 'ten', o: o0, bat: M, dx0: o0.nhan ? o0.nhan.dx : 0, dy0: o0.nhan ? o0.nhan.dy : 0, daGhi: false }; nhom = [{ h: o0.id }]; capNhatChon(false); return; }
      var muc = timMuc(M);
      if (e.ctrlKey || e.metaKey) {   // Ctrl: thêm / bớt đối tượng; Ctrl + kéo chỗ trống: khung chọn thêm
        if (muc) { if (trongNhom(muc)) nhom = nhom.filter(function (y) { return !cungMuc(muc, y); }); else nhom.push(muc); capNhatChon(false); return; }
        dangKeo = { loai: 'khung', a: M, b: M, them: true }; return;
      }
      if (muc && nhom.length > 1 && trongNhom(muc)) { batDauKeoNhom(M); return; }
      if (!muc) { nhom = []; capNhatChon(false); dangKeo = { loai: 'khung', a: M, b: M }; canVe(); return; }
      nhom = [muc];
      var d = muc.o && laDiemO(muc.o) ? muc.o : null;
      if (d) { chonMot(d.id); if ((d.loai === 'diem' || d.loai === 'diemTren' || d.loai === 'diemCach') && !d.coDinh) { ghiLichSu(); dangKeo = { loai: 'diem', o: d }; } else batDauKeoNhom(M); return; }
      var ct = muc.o && (muc.o.loai === 'chu' || muc.o.loai === 'congThuc' || muc.o.loai === 'thanhTruot') ? muc.o : null;
      if (ct) {
        chonMot(ct.id); ghiLichSu();
        if (ct.loai === 'thanhTruot' && Math.abs(M.y - ct.y) < 14 / V.s && M.x >= ct.x - 10 / V.s && M.x <= ct.x + (ct.dai + 10) / V.s) { dangKeo = { loai: 'truot', o: ct }; datTruot(ct, M); }
        else if (!ct.coDinh) dangKeo = { loai: 'dichChu', o: ct, dx: M.x - ct.x, dy: M.y - ct.y };
        return;
      }
      if (muc.h) { chonMot(muc.h); batDauKeoNhom(M); return; }   // kéo đường, đa giác… = kéo các điểm tự do tạo ra nó
      dongThuocTinh(); batDauKeoNhom(M); canVe(); return;
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
    if (netDang && netDang.compa) { quayCompa(netDang.compa, M); veNhap(); canVe(); return; }
    if (netDang && netDang.thang) {
      var A0 = netDang.pts[0], dx0 = M.x - A0[0], dy0 = M.y - A0[1], gocN = Math.atan2(dy0, dx0) * 180 / Math.PI, Q = { x: M.x, y: M.y };
      var gan = Math.round(gocN / 45) * 45; if (Math.abs(gocN - gan) < 4) { var L0 = Math.hypot(dx0, dy0), ra = gan * Math.PI / 180; Q = { x: A0[0] + L0 * Math.cos(ra), y: A0[1] + L0 * Math.sin(ra) }; }
      netDang.pts[1] = [Q.x, Q.y, 0.6]; veNhap(); return;
    }
    if (netDang) {
      var evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
      evs.forEach(function (ev) { var q = toaDo(ev), W2 = veTG(q.x, q.y), cuoi = netDang.pts[netDang.pts.length - 1]; if (netDang.mep) W2 = GI.dungCu.chieuMep(netDang.mep, W2); if (Math.hypot(W2.x - cuoi[0], W2.y - cuoi[1]) * V.s >= 1.2) netDang.pts.push([W2.x, W2.y, lucNhan(ev)]); });
      veNhap(); return;
    }
    if (dangKeo) {
      if (dangKeo.loai === 'trang') { V.x = dangKeo.V.x - (p.x - dangKeo.p.x) / V.s; V.y = dangKeo.V.y - (p.y - dangKeo.p.y) / V.s; canVe(); return; }
      if (dangKeo.loai === 'tay') { tay(M); veNhap(M); return; }
      if (dangKeo.loai === 'laser') { laser.push({ x: M.x, y: M.y, t: performance.now() }); return; }
      if (dangKeo.loai === 'diem') {
        var o = dangKeo.o;
        if (o.loai === 'diem') { var P = batLuoi(M); o.x = P.x; o.y = P.y; }
        else if (o.loai === 'diemCach') { var Ag = giaTri[o.a]; if (Ag) o.t = Math.atan2(M.y - Ag.y, M.x - Ag.x); }
        else { var tren = giaTri[o.tren]; if (tren) o.t = H.thamSo(tren, M); }
        daSua = true; canVe(); return;
      }
      if (dangKeo.loai === 'truot') { datTruot(dangKeo.o, M); return; }
      if (dangKeo.loai === 'khung') { dangKeo.b = M; canVe(); return; }
      if (dangKeo.loai === 'xoayDC' || dangKeo.loai === 'doiDC' || dangKeo.loai === 'butCompa') { keoDungCu(dangKeo, M); canVe(); return; }
      if (dangKeo.loai === 'tayKhoi' || dangKeo.loai === 'xoayKhoi' || dangKeo.loai === 'xoayMau' || dangKeo.loai === 'coAnh') { if (!dangKeo.daGhi) { ghiLichSu(); dangKeo.daGhi = true; } keoTayNam(dangKeo, M, p); daSua = true; canVe(); return; }
      if (dangKeo.loai === 'ten') {
        if (!dangKeo.daGhi) { ghiLichSu(); dangKeo.daGhi = true; }
        datViTriTen(dangKeo.o, dangKeo.dx0 + (M.x - dangKeo.bat.x) * V.s, dangKeo.dy0 + (M.y - dangKeo.bat.y) * V.s); daSua = true; canVe(); return;
      }
      if (dangKeo.loai === 'nhom') { keoNhom(M); return; }
      if (dangKeo.loai === 'dichChu') { dangKeo.o.x = M.x - dangKeo.dx; dangKeo.o.y = M.y - dangKeo.dy; daSua = true; canVe(); return; }
      if (dangKeo.loai === 'moHinh') { dangKeo.m.x = M.x - dangKeo.dx; dangKeo.m.y = M.y - dangKeo.dy; canVe(); return; }
      if (dangKeo.loai === 'net') { var dx = M.x - dangKeo.truoc.x, dy = M.y - dangKeo.truoc.y; dangKeo.n.pts.forEach(function (q) { q[0] += dx; q[1] += dy; }); dangKeo.n._vien = null; dangKeo.truoc = M; canVe(); return; }
    }
    // Rê chuột trên dụng cụ học tập
    if (dungCuDS.length) {
      var hd = GI.dungCu.tim(dungCuDS, M, 1 / V.s, cc === 'but' || cc === 'dq');
      if (hd) { cv.style.cursor = hd.phan === 'mep' ? conTroCC() : hd.phan === 'than' ? 'move' : hd.phan === 'ghim' ? 'pointer' : 'grab'; if (diDuoi) { diDuoi = null; canVe(); } return; }
    }
    // Rê chuột: làm sáng đối tượng sẽ được chọn
    var cu = diDuoi; diDuoi = null;
    if (cc === 'chon') {
      if (timTayNam(M)) { cv.style.cursor = 'grab'; return; }
      var dd = timDiem(M), tenR = dd ? null : timTen(M), dt2 = dd || tenR ? null : (timChuTruot(M) || timDoiTuong(M) || timSoDo(M));
      if (tenR) { diDuoi = null; cv.style.cursor = 'move'; if (cu) canVe(); return; }
      diDuoi = dd ? dd.id : dt2 ? dt2.id : null;
      cv.style.cursor = dd && (dd.loai === 'diem' || dd.loai === 'diemTren' || dd.loai === 'diemCach') && !dd.coDinh ? 'move' : dt2 && (dt2.loai === 'chu' || dt2.loai === 'thanhTruot') ? 'move' : dt2 ? 'pointer' : timMoHinh(M) || timNet(M) ? 'move' : 'default';
      if (cu !== diDuoi) canVe();
    }
    else if (CONG_CU[cc] || cc === 'xoa' || cc === 'ganDiem') {
      var cuR = CONG_CU[cc], kieuR = cc === 'xoa' ? 'xoa' : cc === 'ganDiem' ? (choChon.length ? 'duongTron' : 'diem') : cuR.buoc[0] === 'nhieu' || cuR.buoc[0] === 'viTri' ? 'diem' : cuR.linhHoat ? (timDiem(M) ? 'diem' : 'thang') : cuR.buoc[Math.min(choChon.length, cuR.buoc.length - 1)];
      if (kieuR === 'xoa') { var ox = timDiem(M) || timDoiTuong(M) || timSoDo(M) || timChuTruot(M); diDuoi = ox ? ox.id : null; }
      else {
        diDuoi = ungVien(M, kieuR);
        if (!diDuoi && !choChon.length && (cc === 'trungDiem' || cc === 'doDai' || cc === 'trungTruc' || cc === 'compa')) { var ob = timDoiTuong(M, function (o2, v2) { return o2.loai === 'doan' || (cc === 'trungDiem' && (v2.k === 'tron' || v2.k === 'cung')); }); diDuoi = ob ? ob.id : null; }
      }
      canVe();
    }
    if (cc !== 'chon' && trongNutMoHinh(M) && cc !== 'but' && cc !== 'dq' && cc !== 'tay') cv.style.cursor = 'pointer';
    else if (cc !== 'chon') cv.style.cursor = conTroCC();
    if (cu !== diDuoi || choChon.length) canVe();
    if (cc === 'tay') veNhap(M);
  });
  function thaTay(e) {
    delete conTroDS[e.pointerId];
    if (chum) { if (Object.keys(conTroDS).length < 2) chum = null; return; }
    if (netDang) {
      var laCompa = !!netDang.compa;
      delete netDang.thang; delete netDang.mep; delete netDang.compa;
      if (laCompa && netDang.pts.length < 3) { huyNetDang(); canVe(); return; }   // chỉ bấm núm, chưa quay
      ghiLichSu(); trang().net.push(netDang); netDang = null; nctx.setTransform(1, 0, 0, 1, 0, 0); nctx.clearRect(0, 0, cvN.width, cvN.height); canVe(); return;
    }
    if (dangKeo && dangKeo.loai === 'trang') cv.style.cursor = conTroCC();
    if (dangKeo && dangKeo.loai === 'khung') { var dsK = chonTrongKhung(dangKeo.a, dangKeo.b); if (dangKeo.them) dsK.forEach(function (x) { if (!trongNhom(x)) nhom.push(x); }); else nhom = dsK; capNhatChon(false); canVe();
      if (choXuatTex) { choXuatTex = false; capNhatGoiY(); var idsK = nhom.filter(function (x) { return x.h; }).map(function (x) { return x.h; }); if (idsK.length) xuatTexChon(idsK); else thongBao('Không có hình nào trong khung'); } }
    if (dangKeo && dangKeo.loai === 'laser') laser.forEach(function (l) { l.ketThuc = true; });
    dangKeo = null; veNhap();
  }
  cv.addEventListener('pointerup', thaTay);
  cv.addEventListener('pointercancel', function (e) { huyNetDang(); thaTay(e); });
  cv.addEventListener('pointerleave', function () { conTro = null; if (cc === 'tay' && !dangKeo) veNhap(); });
  // Đổi tên điểm, đường…: tên nào cũng được (chữ thường, chữ in, số), trùng tên cũng được
  function doiTenHinh(o) {
    if (!o) return;
    hoi({ tieuDe: 'Đổi tên ' + tenLoai(o).toLowerCase(), nhan: 'Tên mới', macDinh: o.ten || '', van: true }).then(function (ten) {
      if (ten == null) return; ten = String(ten).trim(); if (!ten || ten === o.ten) return;
      ghiLichSu(); o.ten = ten; o.hienTen = true; daSua = true; capNhatTieuDe(); if (chonId) veThuocTinh(); canVe();
    });
  }
  cv.addEventListener('dblclick', function (e) {   // bấm đúp: vào tên điểm / đường → đổi tên; vào chữ / công thức → sửa
    var p = toaDo(e), M = veTG(p.x, p.y);
    if (cc === 'chon' || cc === 'keo') {
      var tenR = timTen(M); if (tenR && tenR.o) { dangKeo = null; return doiTenHinh(tenR.o); }
    }
    var o = timChuTruot(M);
    if (!o && cc === 'chon') { var h = timDiem(M) || timDoiTuong(M); if (h && coTen(h)) return doiTenHinh(h); }
    if (!o) return;
    if (o.loai === 'chu') moSoanChu(o, false); else if (o.loai === 'congThuc') moHopCongThuc(o);
  });
  cv.addEventListener('contextmenu', function (e) {   // chuột phải vào hình → menu nhanh
    e.preventDefault(); var p = toaDo(e), M = veTG(p.x, p.y), muc = timMuc(M);
    if (!muc) { dongMenuPhai(); return; }
    if (!trongNhom(muc)) nhom = [muc];
    capNhatChon(false); moMenuPhai(e.clientX, e.clientY);
  });
  cv.addEventListener('wheel', function (e) {
    e.preventDefault(); var p = toaDo(e);
    // Ctrl + lăn (hoặc chụm hai ngón trên bàn di chuột): phóng to / thu nhỏ; lăn thường: cuộn lên xuống, Shift + lăn: cuộn ngang
    if (e.ctrlKey) thuPhong(Math.exp(-e.deltaY * (Math.abs(e.deltaY) < 40 ? 0.01 : 0.0025)), p.x, p.y);
    else { var dx = e.shiftKey && !e.deltaX ? e.deltaY : e.deltaX, dy = e.shiftKey && !e.deltaX ? 0 : e.deltaY, he = e.deltaMode === 1 ? 32 : 1; V.x += dx * he / V.s; V.y += dy * he / V.s; canVe(); }
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
    choChon = []; nhom = []; diDuoi = null; dongMenuPhai();
    if (chonId && !timTheoId(chonId)) dongThuocTinh(); else if (chonId) veThuocTinh();
    capNhatThongTin(); veTabTrang(); veMenuNen(); veDsTrangPdf();
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
    var dung = {}; tl.trang.forEach(function (t) { if (t.pdf && taiNguyen[t.pdf.id]) dung[t.pdf.id] = taiNguyen[t.pdf.id]; t.hinh.forEach(function (o) { if (o.loai === 'anh' && taiNguyen[o.tn]) dung[o.tn] = taiNguyen[o.tn]; }); });
    var nd = Object.keys(dung).length ? JSON.stringify(Object.assign({}, tl, { taiNguyen: dung }), boPhanPhu) : chup();
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
    taiNguyen = {}; boNhoPdf = {}; boNhoNho = {}; hangDoiPdf = [];
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
    if (t.pdf) viTriTrangPdf(t.pdf).forEach(function (r) { them(r.x, r.y); them(r.x + r.w, r.y + r.h); });
    return isFinite(b.x0) ? b : null;
  }
  function vuaNoiDung() {
    if (trang().pdf) return vuaPdf();
    var b = khungNoiDung(); if (!b) { V = { x: -W / 2, y: -Hh / 2, s: 1 }; }
    else { var le = 60, s = Math.max(0.2, Math.min(2, Math.min(W / (b.x1 - b.x0 + 2 * le), Hh / (b.y1 - b.y0 + 2 * le)))); V = { s: s, x: (b.x0 + b.x1) / 2 - W / 2 / s, y: (b.y0 + b.y1) / 2 - Hh / 2 / s }; }
    capNhatThongTin(); canVe();
  }
  function xuatAnh() {
    var pdf = trang().pdf;
    if (pdf && !xuatAnh.daVe) {
      var iT = trangPdfGiua(), rT = viTriTrangPdf(pdf)[iT];
      thongBao('Đang chuẩn bị ảnh trang ' + (iT + 1) + '…');
      return veTrangPdfNgay(pdf.id, iT, Math.min(2400, rT.w * 2)).then(function (c) {
        var k = pdf.id + '|' + iT; boNhoPdf[k] = boNhoPdf[k] || {}; boNhoPdf[k].cv = c; boNhoPdf[k].px = c.width;
        xuatAnh.daVe = { x0: rT.x, y0: rT.y, x1: rT.x + rT.w, y1: rT.y + rT.h }; try { xuatAnh(); } finally { xuatAnh.daVe = null; }
      }).catch(function (e) { thongBao('Không xuất được: ' + e.message); });
    }
    var b = xuatAnh.daVe || khungNoiDung(); if (!b) return thongBao('Trang đang trống');
    var le = xuatAnh.daVe ? 0 : 40, k = 2, w = b.x1 - b.x0 + 2 * le, h = b.y1 - b.y0 + 2 * le, s = Math.min(k, 6000 / Math.max(w, h));
    var c = document.createElement('canvas'); c.width = Math.round(w * s); c.height = Math.round(h * s);
    var x2 = c.getContext('2d'), vn = { x0: b.x0 - le, y0: b.y0 - le, x1: b.x1 + le, y1: b.y1 + le };
    x2.setTransform(s, 0, 0, s, -vn.x0 * s, -vn.y0 * s);
    veNen(x2, vn, s); veTrangPdf(x2, vn, s, true); if (coTruc()) veTruc(x2, vn, s);
    veHinh(x2, vn, s, H.tinh(trang().hinh), {}); trang().moHinh.forEach(function (m) { veTheMoHinh(x2, m, false); });
    trang().net.forEach(function (n) { veNet(x2, n); });
    var url = c.toDataURL('image/png'), ten = (tenTep ? tenTep.split(/[\\/]/).pop().replace(/\.geoink$/i, '') : 'GeoInk') + '-trang-' + (tl.so + 1) + '.png';
    if (MT) MT.xuatAnh(url, ten).then(function (kq) { if (kq.ten) thongBao('Đã xuất ảnh'); else if (kq.loi) thongBao('Không xuất được: ' + kq.loi); });
    else { var a = document.createElement('a'); a.href = url; a.download = ten; a.click(); }
  }

  var LENH = {
    moi: moi, mo: mo, nhapPdf: nhapPdf, congThuc: function () { moHopCongThuc(null); }, dungCu: function () { moMenuDungCu($('[data-lenh="dungCu"]')); }, mayTinh: function () { GI.mayTinh.batTat(); }, luu: function () { luu(false); }, luuThanh: function () { luu(true); }, xuatAnh: xuatAnh, hoanTac: hoanTac, lamLai: lamLai,
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
    nhapTex: function () { LENH.nhapTikz(); },
    catHinh: function () {
      if (!MT || !MT.catManHinh) return thongBao('Cắt hình chỉ dùng được trong app GeoInk');
      MT.catManHinh().then(function (kq) { if (!kq) return; if (kq.loi) return thongBao('Không cắt được hình: ' + kq.loi); chenAnh(kq.duLieu, 'Ảnh cắt màn hình'); });
    },
    kiemTraCapNhat: function () { $('#menu').classList.add('an'); if (!MT || !MT.kiemTraCapNhat) return thongBao('Chỉ kiểm tra cập nhật được trong app đã cài'); capNhat.tay = true; thongBao('Đang kiểm tra bản mới…'); MT.kiemTraCapNhat(); },
    xuatTex: function () {
      var ids = nhom.filter(function (x) { return x.h; }).map(function (x) { return x.h; });
      if (ids.length) return xuatTexChon(ids);
      choXuatTex = true; chonCongCu('chon');
      var el = $('#goi-y'); el.innerHTML = '<b>Xuất mã TeX:</b> kéo khung quanh hình cần xuất (Esc để huỷ)'; el.classList.remove('an');
    },
    nhapTikz: function () { $('#menu').classList.add('an'); $('#tikz-loi').innerHTML = ''; $('#hop-tikz').classList.remove('an'); setTimeout(function () { $('#tikz-ma').focus(); }, 30); },
    toanManHinh: function () { if (MT) MT.toanManHinh(); else if (!document.fullscreenElement) document.documentElement.requestFullscreen(); else document.exitFullscreen(); },
    thuNho: function () { thuPhong(1 / 1.25); }, phongTo: function () { thuPhong(1.25); },
    vuaKhung: function () { thuPhong(1 / V.s); },
  };

  /* =====================================================================
     HỘP THOẠI: hàm số, mô hình GeoLab
     ===================================================================== */
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
  function kieuGT(o) { var v = giaTri[o.id]; return v ? v.k : ''; }
  var NHOM_TT = [
    ['Điểm', function (o) { return kieuGT(o) === 'diem'; }],
    ['Đoạn thẳng', function (o) { var v = giaTri[o.id]; return v && v.k === 'thang' && v.loai === 'doan'; }],
    ['Đường thẳng', function (o) { var v = giaTri[o.id]; return v && v.k === 'thang' && v.loai !== 'doan' && v.loai !== 'tia'; }],
    ['Tia', function (o) { var v = giaTri[o.id]; return v && v.k === 'thang' && v.loai === 'tia'; }],
    ['Đường gấp khúc', function (o) { return kieuGT(o) === 'gapKhuc'; }],
    ['Đường tròn', function (o) { return kieuGT(o) === 'tron'; }],
    ['Cung tròn, hình quạt', function (o) { return kieuGT(o) === 'cung'; }],
    ['Đường conic', function (o) { return kieuGT(o) === 'cong'; }],
    ['Đa giác', function (o) { return kieuGT(o) === 'daGiac'; }],
    ['Số đo', function (o) { return o.loai === 'doDai' || o.loai === 'goc' || o.loai === 'dienTich' || o.loai === 'gocVuong'; }],
    ['Hình không gian', function (o) { return o.loai === 'khoi'; }],
    ['Thanh trượt', function (o) { return o.loai === 'thanhTruot'; }], ['Chữ', function (o) { return o.loai === 'chu'; }], ['Công thức', function (o) { return o.loai === 'congThuc'; }],
    ['Hàm số', function (o) { return o.loai === 'hamSo'; }],
    ['Ảnh', function (o) { return o.loai === 'anh'; }],
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
      case 'tam': return 'Tâm(' + T(o.d) + ')';
      case 'trongTam': return 'Trọng tâm(' + T(o.a) + ', ' + T(o.b) + ', ' + T(o.c) + ')';
      case 'trucTam': return 'Trực tâm(' + T(o.a) + ', ' + T(o.b) + ', ' + T(o.c) + ')';
      case 'chanCao': return 'Chân đường cao từ ' + T(o.a) + ' xuống ' + T(o.b) + T(o.c);
      case 'khoi': return GI.khoi.TEN[o.dang] || 'Hình không gian';
      case 'diemCach': return 'Điểm cách ' + T(o.a) + ' ' + soVN(o.l, 2) + ' cm';
      case 'dinhDG': return 'Đỉnh ' + (o.i + 1) + ' của ' + T(o.dg);
      case 'trungTruc': return 'Đường trung trực(' + T(o.a) + ', ' + T(o.b) + ')';
      case 'phanGiac': return 'Đường phân giác(' + T(o.a) + ', ' + T(o.o) + ', ' + T(o.b) + ')';
      case 'daGiacDeu': return 'Đa giác đều(' + T(o.a) + ', ' + T(o.b) + ', ' + o.n + ' cạnh)';
      case 'tronBanKinh': return 'Đường tròn(tâm ' + T(o.o) + ', bán kính ' + soVN(o.r, 2) + ' cm)';
      case 'compa': return 'Compa(tâm ' + T(o.o) + ', bán kính ' + T(o.a) + T(o.b) + ')';
      case 'tron3': return 'Đường tròn(' + T(o.a) + ', ' + T(o.b) + ', ' + T(o.c) + ')';
      case 'banNguyet': return 'Hình bán nguyệt(' + T(o.a) + ', ' + T(o.b) + ')';
      case 'cungTam': return 'Cung tròn(tâm ' + T(o.o) + ', ' + T(o.a) + ', ' + T(o.b) + ')';
      case 'quatTam': return 'Hình quạt(tâm ' + T(o.o) + ', ' + T(o.a) + ', ' + T(o.b) + ')';
      case 'cung3': return 'Cung tròn(' + T(o.a) + ', ' + T(o.b) + ', ' + T(o.c) + ')';
      case 'quat3': return 'Hình quạt(' + T(o.a) + ', ' + T(o.b) + ', ' + T(o.c) + ')';
      case 'elip': return 'Elip(' + T(o.a) + ', ' + T(o.b) + ', ' + T(o.c) + ')';
      case 'hypebol': return 'Hypebol(' + T(o.a) + ', ' + T(o.b) + ', ' + T(o.c) + ')';
      case 'parabol': return 'Parabol(' + T(o.a) + ', ' + T(o.d) + ')';
      case 'gapKhuc': return 'Đường gấp khúc(' + o.ds.map(T).join(', ') + ')';
      case 'gocVuong': return 'Kí hiệu góc vuông(' + T(o.a) + ', ' + T(o.o) + ', ' + T(o.b) + ')';
      case 'dienTich': return 'Diện tích(' + T(o.d) + ')';
      case 'thanhTruot': return 'Thanh trượt ' + o.ten + ' từ ' + soVN(o.min, 2) + ' đến ' + soVN(o.max, 2);
      case 'chu': return 'Chữ: ' + GI.vanBan.chuan(o).map(function (d) { return d.runs.map(function (r) { return r.t; }).join(''); }).join(' ').slice(0, 30);
      case 'congThuc': return 'Công thức: ' + (o.latex || '').slice(0, 40);
      case 'anh': return 'Ảnh ' + Math.round(o.w) + ' × ' + Math.round(o.h);
      case 'bienHinh': {
        var tenBH = { dxTruc: 'Đối xứng qua ' + T(o.truc), dxTam: 'Đối xứng qua ' + T(o.tam), quay: 'Quay quanh ' + T(o.tam) + ' góc ' + soVN(o.goc, 1) + '°',
          tinhTien: 'Tịnh tiến theo ' + T(o.v1) + T(o.v2), viTu: 'Vị tự tâm ' + T(o.tam) + ', k = ' + soVN(o.k, 2), nghichDao: 'Nghịch đảo qua ' + T(o.tron) }[o.kieu] || o.kieu;
        return tenBH + ' của ' + T(o.nguon);
      }
    }
    return o.loai;
  }
  function mauMacDinh(o) {
    if (o.mau) return o.mau;
    if (laDiemO(o)) return o.loai === 'diem' || o.loai === 'diemTren' ? '#2451C7' : '#334155';
    if (o.loai === 'goc' || o.loai === 'gocVuong') return mauNet(); if (o.loai === 'doDai' || o.loai === 'dienTich') return '#DC2626';
    if (o.loai === 'thanhTruot') return '#2563EB'; if (o.loai === 'chu' || o.loai === 'congThuc') return kieuNen().toi ? '#F8FAFC' : '#16213A';
    return mauNet();
  }
  // chọn một hình: bảng Thuộc tính chỉ đổi theo nếu đang mở (mở bảng bằng chuột phải → Thuộc tính…)
  function chonMot(id) { chonId = id; if (!$('#thuoc-tinh').classList.contains('an')) veThuocTinh(); canVe(); }
  function moThuocTinh(id) { chonId = id; $('#thuoc-tinh').classList.remove('an'); veThuocTinh(); canVe(); }
  function dongThuocTinh() { if (!chonId && $('#thuoc-tinh').classList.contains('an')) return; chonId = null; $('#thuoc-tinh').classList.add('an'); canVe(); }
  function cacHinhChon() {
    var o = timTheoId(chonId); if (!o) return [];
    var ds = nhom.filter(function (x) { return x.h; }).map(function (x) { return timTheoId(x.h); }).filter(Boolean);
    return ds.indexOf(o) >= 0 ? ds : [o];
  }
  function doi(khoa, f) {
    var o = timTheoId(chonId); if (!o) return; ghiLichSuGop(chonId + ':' + khoa);
    (khoa === 'ten' || khoa === 'nd' || khoa.indexOf('tt-') === 0 ? [o] : cacHinhChon()).forEach(f);   // đổi màu, kiểu… áp dụng cho mọi hình đang chọn
    canVe(); veDanhSachTT();
  }

  function taoBangTT() {
    var el = document.createElement('div'); el.id = 'thuoc-tinh'; el.className = 'an';
    el.innerHTML = '<div class="tt-dau" id="tt-dau"><span><i data-bt="caiDat"></i>Thuộc tính</span><button class="tt-dong" title="Đóng (Esc)"><i data-bt="xoaX"></i></button></div>' +
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
      h += '<button class="tt-nhom" data-nhom-tt="' + NHOM_TT.indexOf(n) + '" title="Chọn tất cả ' + n[0].toLowerCase() + '">' + n[0] + ' <small>(' + ds.length + ')</small></button>' + ds.map(function (o) {
        return '<button class="tt-muc' + (o.id === chonId || trongNhom({ h: o.id }) ? ' bat' : '') + '" data-id="' + o.id + '" title="' + dinhNghia(o).replace(/"/g, '&quot;') + '">' +
          '<span class="tt-cham' + (o.an ? ' rong' : '') + '" style="--m:' + mauMacDinh(o) + '"></span>' + (o.ten || dinhNghia(o)) + '</button>';
      }).join('');
    });
    $('#tt-ds').innerHTML = h || '<div class="tt-trong">Chưa có hình nào</div>';
    $$('#tt-ds [data-nhom-tt]').forEach(function (b) { b.onclick = function (e) {
      var ds = trang().hinh.filter(NHOM_TT[+b.dataset.nhomTt][1]); if (!ds.length) return;
      if (!(e.ctrlKey || e.metaKey)) nhom = [];
      ds.forEach(function (o) { if (!trongNhom({ h: o.id })) nhom.push({ h: o.id }); });
      chonId = ds[0].id; veThuocTinh(); canVe(); thongBao('Đã chọn ' + ds.length + ' ' + NHOM_TT[+b.dataset.nhomTt][0].toLowerCase());
    }; });
    $$('#tt-ds [data-id]').forEach(function (b) { b.onclick = function (e) {
      var m = { h: b.dataset.id };
      if (e.ctrlKey || e.metaKey) { if (trongNhom(m)) nhom = nhom.filter(function (y) { return !cungMuc(m, y); }); else nhom.push(m); } else nhom = [m];
      chonId = b.dataset.id; veThuocTinh(); canVe(); }; });
  }
  function svgNet(kieu, w) { var k = KIEU_NET[kieu] || KIEU_NET.lien; return '<svg width="150" height="16"><line x1="6" y1="8" x2="144" y2="8" stroke="#111827" stroke-width="' + (w || 2.6) + '" stroke-linecap="' + (kieu === 'cham' || kieu === 'gachCham' ? 'round' : 'butt') + '" stroke-dasharray="' + k.dash.join(' ') + '"/></svg>'; }
  function svgKyHieu(kh) {
    var g = '<line x1="6" y1="10" x2="144" y2="10" stroke="#111827" stroke-width="2"/>', so = kh.length === 1 && kh !== '>' ? +kh : kh.length;
    for (var i = 0; i < (kh ? so : 0); i++) { var x = 75 + (i - (so - 1) / 2) * (kh.charAt(0) === '>' ? 7 : 5); g += kh.charAt(0) === '>' ? '<path d="M' + (x - 6) + ' 4 L' + x + ' 10 L' + (x - 6) + ' 16" fill="none" stroke="#111827" stroke-width="2"/>' : '<line x1="' + x + '" y1="3" x2="' + x + '" y2="17" stroke="#111827" stroke-width="2"/>'; }
    return '<svg width="150" height="20">' + g + '</svg>';
  }
  var KIEU_GOC = [['1', '1 nét cung'], ['2', '2 nét cung'], ['3', '3 nét cung'], ['1g', '1 nét cung có gạch'], ['2g', '2 nét cung có gạch']];
  function svgGoc(k) {
    var n = +k.charAt(0), g = '<path d="M8 34H70M8 34L52 6" fill="none" stroke="#111827" stroke-width="1.8"/>', a = Math.atan2(-28, 44);
    for (var i = 0; i < n; i++) { var r = 18 + i * 4.5; g += '<path d="M' + (8 + r) + ' 34A' + r + ' ' + r + ' 0 0 0 ' + (8 + r * Math.cos(a)).toFixed(1) + ' ' + (34 + r * Math.sin(a)).toFixed(1) + '" fill="none" stroke="#111827" stroke-width="1.6"/>'; }
    if (k.indexOf('g') > 0) { var m = a / 2, r1 = 13, r2 = 18 + (n - 1) * 4.5 + 5; g += '<line x1="' + (8 + r1 * Math.cos(m)).toFixed(1) + '" y1="' + (34 + r1 * Math.sin(m)).toFixed(1) + '" x2="' + (8 + r2 * Math.cos(m)).toFixed(1) + '" y2="' + (34 + r2 * Math.sin(m)).toFixed(1) + '" stroke="#111827" stroke-width="1.6"/>'; }
    return '<svg width="80" height="40">' + g + '</svg>';
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
    var gtO = giaTri[o.id] || {}, laDiem = gtO.k === 'diem', laDoan = gtO.k === 'thang' && gtO.loai === 'doan' && o.loai !== 'bienHinh';
    var coNet = !laDiem && ['doDai', 'dienTich', 'chu', 'thanhTruot', 'gocVuong', 'goc', 'anh'].indexOf(o.loai) < 0, coTo = gtO.k === 'daGiac' || (gtO.k === 'cung' && gtO.quat) || o.loai === 'banNguyet';
    var TAB = [['coBan', 'Cơ bản'], ['mauSac', 'Màu sắc']]; if (coNet || laDiem) TAB.push(['kieu', 'Kiểu']);
    if (!TAB.some(function (x) { return x[0] === tabTT; })) tabTT = 'coBan';
    $('#tt-tab').innerHTML = TAB.map(function (x) { return '<button data-tab="' + x[0] + '"' + (x[0] === tabTT ? ' class="bat"' : '') + '>' + x[1] + '</button>'; }).join('');
    $$('#tt-tab [data-tab]').forEach(function (b) { b.onclick = function () { tabTT = b.dataset.tab; veThuocTinh(); }; });
    var noi = $('#tt-noi'); noi.innerHTML = '';
    var dsChon = cacHinhChon(), soHinh = dsChon.length;
    if (soHinh > 1) {
      var nn = document.createElement('div'); nn.className = 'tt-nhieu';
      var tenDs = dsChon.map(function (x) { return x.ten || '?'; }); if (tenDs.length > 8) tenDs = tenDs.slice(0, 8).concat('…');
      nn.textContent = 'Đang chọn ' + soHinh + ' đối tượng (' + tenDs.join(', ') + '): ' + (tabTT === 'coBan' ? 'hiển thị đối tượng, hiển thị tên áp dụng cho tất cả.' : 'thay đổi ở đây áp dụng cho tất cả.');
      noi.appendChild(nn);
    }
    if (tabTT === 'coBan') {
      var oTen = document.createElement('input'); oTen.className = 'tt-o'; oTen.value = o.ten || ''; oTen.placeholder = o.loai === 'hamSo' ? '(không cần tên)' : '';
      oTen.onchange = function () {
        var ten = oTen.value.trim(); if (ten === (o.ten || '')) return;
        doi('ten', function (x) { x.ten = ten || undefined; if (ten && x.hienTen == null && !laDiemO(x)) x.hienTen = true; }); veThuocTinh();
      };
      oTen.onkeydown = function (e) { if (e.key === 'Enter') oTen.blur(); };
      noi.appendChild(dong('Tên:', oTen));
      var dn = document.createElement('div'); dn.className = 'tt-o tt-dn'; dn.textContent = dinhNghia(o); noi.appendChild(dong('Định nghĩa:', dn));
      noi.appendChild(oTich('Hiển thị đối tượng', !o.an, function (v) { doi('an', function (x) { x.an = !v || undefined; }); }));
      if (o.loai === 'chu' || o.loai === 'congThuc') {
        var sua = document.createElement('button'); sua.className = 'tt-xoa nhe'; sua.textContent = o.loai === 'chu' ? 'Sửa nội dung…' : 'Sửa công thức…';
        sua.onclick = function () { if (o.loai === 'chu') moSoanChu(o, false); else moHopCongThuc(o); };
        noi.appendChild(dong('Nội dung:', sua));
        if (o.loai === 'chu') {
          var chonF = document.createElement('select'); chonF.className = 'tt-o'; chonF.innerHTML = GI.vanBan.FONT.map(function (f) { return '<option' + ((o.font || 'Arial') === f[0] ? ' selected' : '') + '>' + f[0] + '</option>'; }).join('');
          chonF.onchange = function () { doi('font', function (x) { if (x.loai === 'chu') x.font = chonF.value; }); };
          noi.appendChild(dong('Phông chữ:', chonF));
        }
        noi.appendChild(dong('Cỡ chữ:', thanhTruot(12, 120, 1, o.co || (o.loai === 'chu' ? 26 : 40), function (v) { doi('co', function (x) { x.co = v; }); })));
      }
      if (o.loai === 'thanhTruot') {
        var hangTT = document.createElement('div'); hangTT.className = 'tt-hang tt-so';
        [['min', 'Nhỏ nhất'], ['max', 'Lớn nhất'], ['buoc', 'Bước'], ['gt', 'Giá trị']].forEach(function (f) {
          var l = document.createElement('label'); l.innerHTML = '<span>' + f[1] + '</span><input class="tt-o" inputmode="decimal" value="' + String(o[f[0]]).replace('.', ',') + '">';
          var ip = l.querySelector('input');
          ip.onchange = function () {
            var v = parseFloat(ip.value.replace(',', '.')); if (!isFinite(v) || (f[0] === 'buoc' && v <= 0)) { ip.value = String(o[f[0]]).replace('.', ','); return; }
            doi('tt-' + f[0], function (x) { x[f[0]] = v; if (x.min > x.max) { var t = x.min; x.min = x.max; x.max = t; } x.gt = Math.max(x.min, Math.min(x.max, x.gt)); }); veThuocTinh();
          };
          hangTT.appendChild(l);
        });
        noi.appendChild(hangTT);
      }
      if (['doDai', 'goc', 'dienTich', 'gocVuong', 'chu', 'congThuc', 'anh'].indexOf(o.loai) < 0) noi.appendChild(oTich('Hiển thị tên', o.loai === 'hamSo' ? o.hienTen !== false : hienTenCua(o), function (v) { doi('hienTen', function (x) { x.hienTen = v; if (v && !x.ten && x.loai !== 'hamSo') x.ten = laDiemO(x) ? tenDiemMoi() : tenDuongMoi(); }); veThuocTinh(); }));
      if (o.loai === 'goc') {
        noi.appendChild(dong('Kí hiệu góc:', hopXo(KIEU_GOC.map(function (k) { return { gt: k[0], ten: k[1], html: svgGoc(k[0]) }; }), (o.cung || 1) + (o.gach ? 'g' : ''), function (v) {
          doi('kieuGoc', function (x) { if (x.loai !== 'goc') return; var n = +v.charAt(0); x.cung = n > 1 ? n : undefined; x.gach = v.indexOf('g') > 0 || undefined; }); })));
        noi.appendChild(oTich('Hiện số đo góc', !o.anSo, function (v) { doi('anSo', function (x) { if (x.loai === 'goc') x.anSo = v ? undefined : true; }); }));
      }
      if (o.loai === 'diem' || o.loai === 'diemTren' || o.loai === 'chu' || o.loai === 'congThuc' || o.loai === 'thanhTruot' || o.loai === 'anh') noi.appendChild(oTich('Cố định đối tượng (không kéo được)', !!o.coDinh, function (v) { doi('coDinh', function (x) { x.coDinh = v || undefined; }); }));
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
      if (coTo) noi.appendChild(dong('Độ mờ tô:', thanhTruot(0, 1, 0.05, o.doMo == null ? 0.16 : o.doMo, function (v) { doi('doMo', function (x) { x.doMo = v; }); }, function (v) { return Math.round(v * 100) + '%'; })));
      var mac = document.createElement('button'); mac.className = 'tt-xoa nhe'; mac.textContent = 'Về màu mặc định';
      mac.onclick = function () { doi('mau', function (x) { delete x.mau; }); veThuocTinh(); }; noi.appendChild(mac);
    } else {
      if (laDiem) noi.appendChild(dong('Kích thước điểm:', thanhTruot(2, 10, 0.5, o.rong || 5, function (v) { doi('rong', function (x) { x.rong = v; }); })));
      else {
        noi.appendChild(dong('Độ dày nét:', thanhTruot(1, 12, 0.5, o.rong || (o.loai === 'hamSo' ? 3 : 2.6), function (v) { doi('rong', function (x) { x.rong = v; }); })));
        noi.appendChild(dong('Kiểu nét:', hopXo(Object.keys(KIEU_NET).map(function (k) { return { gt: k, ten: KIEU_NET[k].ten, html: svgNet(k) }; }), o.kieuNet || 'lien', function (v) { doi('kieuNet', function (x) { x.kieuNet = v === 'lien' ? undefined : v; }); })));
      }
      if (o.loai === 'vuongGoc') noi.appendChild(oTich('Kí hiệu vuông góc ở chân đường', o.kyHieuVuong !== false, function (v) { doi('kyHieuVuong', function (x) { if (x.loai === 'vuongGoc') x.kyHieuVuong = v ? undefined : false; }); }));
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
     TỆP PDF: trang PDF đặt trên bảng (từ trên xuống), ảnh nhỏ ở cột trái
     ===================================================================== */
  var boNhoAnh = {};
  function anhCua(id) {   // ảnh (Image) theo id tài nguyên; nạp xong thì vẽ lại
    var r = taiNguyen[id]; if (!r) return null;
    var b = boNhoAnh[id]; if (b) return b.complete && b.naturalWidth ? b : null;
    b = boNhoAnh[id] = new Image(); b.onload = canVe; b.src = r.duLieu; return null;
  }
  // Chèn ảnh (data URL) lên bảng: vừa khoảng 60% khung nhìn, tâm ở giữa màn hình (hoặc chỗ chỉ định)
  function chenAnh(duLieu, ten, viTri) {
    var img = new Image();
    img.onload = function () {
      var id = 'anh' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); taiNguyen[id] = { ten: ten || 'Ảnh', duLieu: duLieu, loai: 'anh' }; boNhoAnh[id] = img;
      var rongTG = W / V.s, caoTG = Hh / V.s, k = Math.min(1 / (window.devicePixelRatio || 1) / V.s, 0.6 * rongTG / img.naturalWidth, 0.6 * caoTG / img.naturalHeight);
      var w = img.naturalWidth * k, h = img.naturalHeight * k, tam = viTri || veTG(W / 2, Hh / 2);
      ghiLichSu(); var o = { id: idMoi('a'), loai: 'anh', x: tam.x - w / 2, y: tam.y - h / 2, w: w, h: h, tn: id }; trang().hinh.push(o); giaTri = H.tinh(trang().hinh);
      chonCongCu('chon'); nhom = [{ h: o.id }]; capNhatChon(false); canVe();
      thongBao('Đã chèn ảnh · kéo để di chuyển, kéo ô vuông ở góc để đổi cỡ');
    };
    img.onerror = function () { thongBao('Không đọc được ảnh'); };
    img.src = duLieu;
  }
  var taiNguyen = {};                     // id → { ten, duLieu (base64) } – không nằm trong lịch sử hoàn tác
  var RONG_PDF = 900, CACH_PDF = 28;      // bề rộng mỗi trang PDF trên bảng, khoảng cách giữa hai trang
  var boNhoPdf = {}, boNhoNho = {}, hangDoiPdf = [], dangVePdf = false, demDung = 0, dsPdfHien = '', trangPdfBat = -1;
  if (window.pdfjsLib) window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'thu-vien/pdf.worker.min.js';
  function b64SangMang(b64) { var s = atob(b64), a = new Uint8Array(s.length); for (var i = 0; i < s.length; i++) a[i] = s.charCodeAt(i); return a; }
  function mangSangB64(u8) { var s = ''; for (var i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000)); return btoa(s); }
  function moTaiLieuPdf(id) {
    var r = taiNguyen[id]; if (!r) return Promise.reject(new Error('Bảng thiếu dữ liệu của tệp PDF'));
    if (!r._doc) r._doc = window.pdfjsLib.getDocument({ data: b64SangMang(r.duLieu), isEvalSupported: false, standardFontDataUrl: 'thu-vien/standard_fonts/' }).promise;
    return r._doc;
  }
  function viTriTrangPdf(pdf) {
    if (pdf._vt) return pdf._vt;
    var y = pdf.y0; pdf._vt = pdf.trang.map(function (t) { var r = { x: pdf.x0, y: y, w: t.w, h: t.h }; y += t.h + CACH_PDF; return r; });
    return pdf._vt;
  }
  function veTrangPdfNgay(id, i, px) {
    return moTaiLieuPdf(id).then(function (doc) { return doc.getPage(i + 1); }).then(function (pg) {
      var vp = pg.getViewport({ scale: px / pg.getViewport({ scale: 1 }).width });
      var c = document.createElement('canvas'); c.width = Math.max(1, Math.round(vp.width)); c.height = Math.max(1, Math.round(vp.height));
      var x = c.getContext('2d'); x.fillStyle = '#FFFFFF'; x.fillRect(0, 0, c.width, c.height);
      return pg.render({ canvasContext: x, viewport: vp }).promise.then(function () { return c; });
    });
  }
  function chayHangDoiPdf() {
    if (dangVePdf || !hangDoiPdf.length) return;
    var v = hangDoiPdf.shift(); dangVePdf = true;
    veTrangPdfNgay(v.id, v.i, v.px).then(v.xong).catch(function (e) { console.error(e); if (v.loi) v.loi(e); })
      .then(function () { dangVePdf = false; chayHangDoiPdf(); });
  }
  // Ảnh trang ở độ nét hợp với mức phóng hiện tại (vẽ dần trong nền, trong lúc chờ thì dùng ảnh nhỏ)
  function anhTrangPdf(pdf, i, w) {
    var muc = Math.pow(2, Math.ceil(Math.log(Math.max(0.25, V.s * dpr)) / Math.LN2 * 2) / 2);
    var px = Math.max(200, Math.min(2200, Math.round(w * muc))), k = pdf.id + '|' + i, m = boNhoPdf[k] || (boNhoPdf[k] = {});
    m.dung = ++demDung;
    if ((!m.cv || m.px !== px) && m.cho !== px) {
      m.cho = px;
      hangDoiPdf.unshift({ k: k, loai: 'chinh', id: pdf.id, i: i, px: px, xong: function (c) { m.cv = c; m.px = px; m.cho = null; donBoNhoPdf(); canVe(); }, loi: function () { m.cho = null; } });
      chayHangDoiPdf();
    }
    return m.cv || anhNhoPdf(pdf.id, i);
  }
  function donBoNhoPdf() {
    var ds = Object.keys(boNhoPdf).filter(function (k) { return boNhoPdf[k].cv; }).sort(function (a, b) { return boNhoPdf[b].dung - boNhoPdf[a].dung; });
    ds.slice(8).forEach(function (k) { boNhoPdf[k].cv = null; boNhoPdf[k].px = 0; });
  }
  function anhNhoPdf(id, i) {
    var k = id + '|' + i;
    if (boNhoNho[k] === undefined) {
      boNhoNho[k] = null;
      hangDoiPdf.push({ k: k, loai: 'nho', id: id, i: i, px: 300, xong: function (c) {
        boNhoNho[k] = c; canVe();
        var o = document.querySelector('#ds-trang-pdf [data-k="' + k + '"] canvas');
        if (o) { o.width = c.width; o.height = c.height; o.getContext('2d').drawImage(c, 0, 0); }
      } });
      chayHangDoiPdf();
    }
    return boNhoNho[k];
  }
  function veTrangPdf(c, vn, s, xuat) {
    var pdf = trang().pdf; if (!pdf) return;
    var vt = viTriTrangPdf(pdf), thay = {};
    vt.forEach(function (r, i) {
      if (r.y > vn.y1 || r.y + r.h < vn.y0 || r.x > vn.x1 || r.x + r.w < vn.x0) return;
      thay[pdf.id + '|' + i] = 1;
      c.save(); if (!xuat) { c.shadowColor = 'rgba(15,23,42,.28)'; c.shadowBlur = 10; c.shadowOffsetY = 2; }
      c.fillStyle = '#FFFFFF'; c.fillRect(r.x, r.y, r.w, r.h); c.restore();
      var anh = xuat ? (boNhoPdf[pdf.id + '|' + i] && boNhoPdf[pdf.id + '|' + i].cv) || boNhoNho[pdf.id + '|' + i] : anhTrangPdf(pdf, i, r.w);
      if (anh) { c.save(); c.imageSmoothingQuality = 'high'; c.drawImage(anh, r.x, r.y, r.w, r.h); c.restore(); }
      else if (!xuat) { c.fillStyle = '#94A3B8'; c.font = (16 / s) + 'px ' + FONT_TEX; c.textAlign = 'center'; c.fillText('Đang tải trang ' + (i + 1) + '…', r.x + r.w / 2, r.y + 60 / s); c.textAlign = 'start'; }
    });
    if (xuat) return;
    // bỏ yêu cầu vẽ những trang đã cuộn khỏi màn hình
    hangDoiPdf = hangDoiPdf.filter(function (v) { if (v.loai !== 'chinh' || thay[v.k]) return true; if (boNhoPdf[v.k]) boNhoPdf[v.k].cho = null; return false; });
    var g = trangPdfGiua(); if (g !== trangPdfBat) { trangPdfBat = g; danhDauTrangNho(true); }
  }
  function trangPdfGiua() {
    var pdf = trang().pdf; if (!pdf) return -1;
    var yg = V.y + Hh / 2 / V.s, vt = viTriTrangPdf(pdf), tot = 0;
    vt.forEach(function (r, i) { if (r.y <= yg) tot = i; });
    return tot;
  }
  function danhDauTrangNho(cuon) {
    $$('#ds-trang-pdf .trang-nho').forEach(function (b) {
      var bat = +b.dataset.i === trangPdfBat; b.classList.toggle('bat', bat);
      if (bat && cuon && !dangKeoTrangNho) { var ds = $('#ds-trang-pdf'), r = b.getBoundingClientRect(), rd = ds.getBoundingClientRect(); if (r.top < rd.top || r.bottom > rd.bottom) ds.scrollTop += r.top - rd.top - 10; }
    });
  }
  var dangKeoTrangNho = false;
  function veDsTrangPdf() {
    var pdf = trang().pdf, khoa = pdf ? tl.so + ':' + pdf.id + ':' + pdf.trang.length : '';
    if (khoa === dsPdfHien) return; dsPdfHien = khoa; trangPdfBat = -1;
    var ds = $('#ds-trang-pdf'); ds.innerHTML = ''; if (!pdf) return;
    var tieuDe = document.createElement('div'); tieuDe.className = 'tieu-de-pdf'; tieuDe.textContent = pdf.ten + ' · ' + pdf.trang.length + ' trang'; ds.appendChild(tieuDe);
    pdf.trang.forEach(function (t, i) {
      var k = pdf.id + '|' + i, b = document.createElement('button'); b.className = 'trang-nho'; b.dataset.k = k; b.dataset.i = i; b.title = 'Trang ' + (i + 1);
      var c = document.createElement('canvas'); c.width = 150; c.height = Math.round(150 * t.h / t.w);
      var anh = anhNhoPdf(pdf.id, i); if (anh) { c.width = anh.width; c.height = anh.height; c.getContext('2d').drawImage(anh, 0, 0); }
      b.appendChild(c); var so = document.createElement('span'); so.textContent = i + 1; b.appendChild(so);
      b.onclick = function () { denTrangPdf(i); };
      ds.appendChild(b);
    });
  }
  function denTrangPdf(i) {
    var pdf = trang().pdf; if (!pdf) return; var r = viTriTrangPdf(pdf)[i]; if (!r) return;
    if (r.w * V.s > W - 20) V.s = Math.max(0.2, (W - 60) / r.w);
    V.x = r.x + r.w / 2 - W / 2 / V.s; V.y = r.y - 16 / V.s;
    trangPdfBat = i; danhDauTrangNho(false); capNhatThongTin(); canVe();
  }
  function vuaPdf() {
    var pdf = trang().pdf; if (!pdf) return;
    V.s = Math.max(0.2, Math.min(1.6, (W - 60) / RONG_PDF)); V.x = pdf.x0 + RONG_PDF / 2 - W / 2 / V.s; V.y = pdf.y0 - 20 / V.s;
    capNhatThongTin(); canVe();
  }
  function nhapPdf() {
    if (!window.pdfjsLib) return thongBao('Thiếu bộ đọc PDF');
    var lay = MT && MT.moPdf ? MT.moPdf() : new Promise(function (xong) {
      var inp = document.createElement('input'); inp.type = 'file'; inp.accept = '.pdf,application/pdf';
      inp.onchange = function () { var f = inp.files[0]; if (!f) return xong({ huy: true }); f.arrayBuffer().then(function (b) { xong({ ten: f.name, duLieu: mangSangB64(new Uint8Array(b)) }); }); };
      inp.click();
    });
    var id = null;
    lay.then(function (kq) {
      if (!kq || kq.huy) return; if (kq.loi) return thongBao('Không mở được tệp PDF: ' + kq.loi);
      thongBao('Đang mở ' + kq.ten + '…');
      id = 'pdf' + Date.now().toString(36); taiNguyen[id] = { ten: kq.ten, duLieu: kq.duLieu };
      return moTaiLieuPdf(id).then(function (doc) {
        var ds = []; for (var i = 1; i <= doc.numPages; i++) ds.push(doc.getPage(i).then(function (pg) { var v = pg.getViewport({ scale: 1 }); return { w: RONG_PDF, h: Math.round(RONG_PDF * v.height / v.width) }; }));
        return Promise.all(ds);
      }).then(function (kt) {
        ghiLichSu();
        var t = trang();
        if (t.pdf || t.net.length || t.hinh.length || t.moHinh.length) { tl.trang.splice(tl.so + 1, 0, trangMoi('xam')); tl.so++; t = trang(); } else t.nen = 'xam';
        t.pdf = { id: id, ten: kq.ten.replace(/\.pdf$/i, ''), x0: -RONG_PDF / 2, y0: 0, trang: kt };
        if (cc === 'chon' || cc === 'keo') chonCongCu('but');
        sauKhiDoiTrang(); vuaPdf();
        thongBao('Đã nhập ' + kt.length + ' trang PDF · viết, vẽ thẳng lên trang; lăn chuột để cuộn');
      });
    }).catch(function (e) { if (id) delete taiNguyen[id]; thongBao('Không mở được tệp PDF: ' + (e && e.message || e)); });
  }

  /* =====================================================================
     THANH BÊN TRÁI: kéo tay nắm để mở rộng / thu hẹp, bấm để đóng / mở
     ===================================================================== */
  function ganThanhTrai() {
    var tk = $('#tay-keo-trai'), rong = 190, rongCu = 190;
    try { var l = localStorage.getItem('geoink.rongTrai'); if (l != null && isFinite(+l)) rong = +l; } catch (e) { }
    function dat(w, luu) {
      rong = Math.round(Math.max(0, Math.min(420, w))); if (rong < 60) rong = 0; if (rong) rongCu = rong;
      document.documentElement.style.setProperty('--rong-trai', rong + 'px'); $('#thanh-trai').classList.toggle('dong', rong === 0);
      doiKichThuoc();
      if (luu) try { localStorage.setItem('geoink.rongTrai', String(rong)); } catch (e) { }
    }
    dat(rong);
    var keo = null;
    tk.addEventListener('pointerdown', function (e) { keo = { x: e.clientX, w: rong, di: false }; tk.setPointerCapture(e.pointerId); tk.classList.add('dang'); e.preventDefault(); });
    tk.addEventListener('pointermove', function (e) { if (!keo) return; var dx = e.clientX - keo.x; if (Math.abs(dx) > 3) keo.di = true; if (keo.di) dat(keo.w + dx); });
    function tha() { if (!keo) return; tk.classList.remove('dang'); if (!keo.di) dat(rong ? 0 : rongCu); keo = null; dat(rong, true); }
    tk.addEventListener('pointerup', tha); tk.addEventListener('pointercancel', tha);
  }





  /* =====================================================================
     DỤNG CỤ HỌC TẬP: thước kẻ, thước đo độ, ê-ke, thước parabol, compa
     ===================================================================== */
  var dungCuDS = [];
  function batDauDungCu(e, M) {
    var dangVe = cc === 'but' || cc === 'dq', h = GI.dungCu.tim(dungCuDS, M, 1 / V.s, dangVe); if (!h) return false;
    var dc = h.dc; dungCuDS = dungCuDS.filter(function (x) { return x !== dc; }).concat([dc]);   // đưa lên trên cùng
    if (h.phan === 'mep') {   // vẽ bám mép thước
      var cfg = cc === 'but' ? butCfg : dqCfg, P = GI.dungCu.chieuMep(h, M);
      netDang = { loai: 'net', kieu: cc, mau: cfg.mau, co: cfg.co, pts: [[P.x, P.y, 0.6]], lucNhan: false, mep: h }; veNhap(); return true;
    }
    if (h.phan === 'ghim') { dc.ghim = !dc.ghim; thongBao(dc.ghim ? 'Đã ghim: kéo dụng cụ sẽ quay quanh điểm đỏ' : 'Đã bỏ ghim: kéo để di chuyển dụng cụ'); canVe(); return true; }
    if (h.phan === 'xoay') { dangKeo = { loai: 'xoayDC', dc: dc, tam: h.tam, a0: Math.atan2(M.y - h.tam.y, M.x - h.tam.x), goc0: dc.goc, x0: dc.x, y0: dc.y }; canVe(); return true; }
    if (h.phan === 'butCompa') { dangKeo = { loai: 'butCompa', dc: dc }; return true; }
    if (h.phan === 'quayCompa') {
      var C = GI.dungCu.compa(dc);
      netDang = { loai: 'net', kieu: 'but', mau: butCfg.mau, co: butCfg.co, pts: [[C.P.x, C.P.y, 0.6]], lucNhan: false, compa: { dc: dc, a: dc.goc, a0: Math.atan2(M.y - dc.y, M.x - dc.x) - dc.goc } };
      return true;
    }
    dangKeo = { loai: 'doiDC', dc: dc, dx: M.x - dc.x, dy: M.y - dc.y }; cv.style.cursor = 'move'; return true;
  }
  function keoDungCu(k, M) {
    var dc = k.dc;
    if (k.loai === 'doiDC') { dc.x = M.x - k.dx; dc.y = M.y - k.dy; return; }
    if (k.loai === 'butCompa') { dc.r = Math.max(0.3 * DV, Math.min(GI.dungCu.CHAN * 1.94, Math.hypot(M.x - dc.x, M.y - dc.y))); dc.goc = Math.atan2(M.y - dc.y, M.x - dc.x); return; }
    // xoay quanh tâm dụng cụ; gần bội 15° thì hút về
    var a = Math.atan2(M.y - k.tam.y, M.x - k.tam.x) - k.a0, g = k.goc0 + a, deg = g * 180 / Math.PI, gan = Math.round(deg / 15) * 15;
    if (Math.abs(deg - gan) < 1.5) { g = gan * Math.PI / 180; a = g - k.goc0; }
    var ca = Math.cos(a), sa = Math.sin(a), dx = k.x0 - k.tam.x, dy = k.y0 - k.tam.y;
    dc.goc = g; dc.x = k.tam.x + dx * ca - dy * sa; dc.y = k.tam.y + dx * sa + dy * ca;
  }
  function quayCompa(q, M) {   // quay compa: vẽ cung theo đầu bút
    var dc = q.dc, aMoi = Math.atan2(M.y - dc.y, M.x - dc.x) - q.a0, d = aMoi - q.a;
    while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI;
    var buoc = Math.max(1, Math.ceil(Math.abs(d) / (Math.PI / 180)));
    for (var i = 1; i <= buoc; i++) { var a = q.a + d * i / buoc; netDang.pts.push([dc.x + dc.r * Math.cos(a), dc.y + dc.r * Math.sin(a), 0.6]); }
    q.a += d; dc.goc = q.a;
  }
  function batTatDungCu(loai) {
    var co = dungCuDS.filter(function (x) { return x.loai === loai; })[0];
    if (co) dungCuDS = dungCuDS.filter(function (x) { return x !== co; });
    else dungCuDS.push(GI.dungCu.tao(loai, veTG(W / 2, Hh / 2)));
    canVe();
  }
  function catDungCu() { if (!dungCuDS.length) return; dungCuDS = []; canVe(); thongBao('Đã cất dụng cụ'); }
  function moMenuDungCu(nut) {
    var cu = $('#menu-dc'); if (cu) { cu.remove(); return; }
    var el = document.createElement('div'); el.id = 'menu-dc';
    var DS = [['thuoc', 'Thước kẻ 20 cm', '<path d="M3 15L15 3l6 6L9 21z"/><path d="M6.5 11.5l1.6 1.6M9 9l2.4 2.4M11.5 6.5l1.6 1.6M14 4l2.4 2.4"/>'],
      ['doDo', 'Thước đo độ', '<path d="M3 17a9 9 0 0 1 18 0z"/><path d="M7 17a5 5 0 0 1 10 0M12 8v2M7.3 10.2l1.2 1.4M16.7 10.2l-1.2 1.4"/>'],
      ['eke30', 'Ê-ke 30° – 60°', '<path d="M4 20V4l16 16z"/><path d="M7.5 16.5v-4l4 4zM4 17h3v3"/>'],
      ['eke45', 'Ê-ke 45°', '<path d="M4 20V6l14 14z"/><path d="M7.5 16.5v-3l3 3z"/>'],
      ['parabol', 'Thước parabol', '<path d="M3 4c2 12 16 12 18 0"/><path d="M3 9c3 10 15 10 18 0"/>'],
      ['compa', 'Compa', '<path d="M12 3v3M12 6L7 20M12 6l5 14"/><circle cx="12" cy="6.5" r="1.6"/>']];
    el.innerHTML = DS.map(function (d) { var bat = dungCuDS.some(function (x) { return x.loai === d[0]; }); return '<button data-dc="' + d[0] + '"' + (bat ? ' class="bat"' : '') + '><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' + d[2] + '</svg>' + d[1] + '</button>'; }).join('') +
      '<button data-dc="cat"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>Cất dụng cụ (R)</button>';
    document.body.appendChild(el);
    var r = nut.getBoundingClientRect(); el.style.left = Math.min(r.left, window.innerWidth - el.offsetWidth - 8) + 'px'; el.style.top = (r.bottom + 6) + 'px';
    el.querySelectorAll('[data-dc]').forEach(function (b) { b.onclick = function () { if (b.dataset.dc === 'cat') catDungCu(); else batTatDungCu(b.dataset.dc); el.remove(); }; });
  }
  document.addEventListener('pointerdown', function (e) { if (!e.target.closest('#menu-dc') && !e.target.closest('[data-lenh="dungCu"]')) { var m = $('#menu-dc'); if (m) m.remove(); } });
  /* =====================================================================
     KHUNG SOẠN VĂN BẢN (nút ABC) và HỘP CHÈN CÔNG THỨC
     ===================================================================== */
  var dangSoan = null, soanMoi = false, rongDau = 0;
  function taoKhungSoan() {
    var el = document.createElement('div'); el.id = 'soan-chu'; el.className = 'an';
    var nut = function (lenh, html, tieuDe) { return '<button data-sc="' + lenh + '" title="' + tieuDe + '">' + html + '</button>'; };
    var svgCanh = function (d) { return '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">' + d + '</svg>'; };
    el.innerHTML = '<div class="sc-thanh"><span class="sc-keo" title="Kéo để di chuyển khung">⠿</span>' +
      '<select class="sc-font" title="Phông chữ">' + GI.vanBan.FONT.map(function (f) { return '<option>' + f[0] + '</option>'; }).join('') + '</select>' +
      '<select class="sc-co" title="Cỡ chữ">' + [14, 16, 18, 20, 22, 24, 26, 28, 32, 36, 40, 48, 56, 64, 72, 96].map(function (n) { return '<option>' + n + '</option>'; }).join('') + '</select><span class="ke"></span>' +
      nut('bold', '<b>B</b>', 'Đậm (Ctrl+B)') + nut('italic', '<i style="font-family:Georgia,serif">I</i>', 'Nghiêng (Ctrl+I)') + nut('underline', '<u>U</u>', 'Gạch chân (Ctrl+U)') + nut('strikeThrough', '<s>ab</s>', 'Gạch ngang') +
      '<label class="sc-mau" title="Màu chữ"><span>A</span><input type="color" value="#111827"></label><span class="ke"></span>' +
      nut('insertUnorderedList', svgCanh('<circle cx="4" cy="5" r="1.2" fill="currentColor"/><circle cx="4" cy="10" r="1.2" fill="currentColor"/><circle cx="4" cy="15" r="1.2" fill="currentColor"/><path d="M8 5h9M8 10h9M8 15h9"/>'), 'Danh sách chấm') +
      nut('insertOrderedList', svgCanh('<path d="M8 5h9M8 10h9M8 15h9"/><text x="1.5" y="7" font-size="5.5" fill="currentColor" stroke="none" font-family="Arial">1</text><text x="1.5" y="12" font-size="5.5" fill="currentColor" stroke="none" font-family="Arial">2</text><text x="1.5" y="17" font-size="5.5" fill="currentColor" stroke="none" font-family="Arial">3</text>'), 'Danh sách số') + '<span class="ke"></span>' +
      nut('justifyLeft', svgCanh('<path d="M3 5h14M3 10h9M3 15h12"/>'), 'Căn trái') + nut('justifyCenter', svgCanh('<path d="M3 5h14M5.5 10h9M4 15h12"/>'), 'Căn giữa') + nut('justifyRight', svgCanh('<path d="M3 5h14M8 10h9M5 15h12"/>'), 'Căn phải') + '<span class="ke"></span>' +
      '<button class="sc-khoa" title="Khoá: cố định khung chữ"></button>' +
      '<button class="sc-xong" title="Xong (Esc)"><svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10.5l4 4 8-9"/></svg>Xong</button></div>' +
      '<div class="sc-noi" contenteditable="true" spellcheck="false"></div>';
    $('#bang').appendChild(el);
    var noi = el.querySelector('.sc-noi');
    el.querySelectorAll('[data-sc]').forEach(function (b) {
      b.addEventListener('mousedown', function (e) { e.preventDefault(); });
      b.onclick = function () { noi.focus(); document.execCommand(b.dataset.sc, false, null); capNhatNutSoan(); };
    });
    var ipMau = el.querySelector('.sc-mau input');
    ipMau.addEventListener('input', function () { el.querySelector('.sc-mau').style.setProperty('--m', ipMau.value); });
    ipMau.addEventListener('change', function () { noi.focus(); khoiPhucChon(); document.execCommand('foreColor', false, ipMau.value); });
    ipMau.addEventListener('mousedown', luuChon);
    el.querySelector('.sc-font').onchange = function (e) { dangSoan.font = e.target.value; datKieuSoan(); noi.focus(); };
    el.querySelector('.sc-co').onchange = function (e) { dangSoan.co = +e.target.value; datKieuSoan(); noi.focus(); };
    el.querySelector('.sc-khoa').onclick = function () { dangSoan.coDinh = dangSoan.coDinh ? undefined : true; veNutKhoa(); };
    el.querySelector('.sc-xong').onclick = xongSoan;
    noi.addEventListener('keyup', capNhatNutSoan); noi.addEventListener('mouseup', capNhatNutSoan);
    noi.addEventListener('keydown', function (e) { if (e.key === 'Escape') { e.preventDefault(); xongSoan(); } e.stopPropagation(); });
    noi.addEventListener('paste', function (e) { e.preventDefault(); document.execCommand('insertText', false, (e.clipboardData || window.clipboardData).getData('text/plain')); });
    // kéo khung
    var keo = null, tay = el.querySelector('.sc-keo');
    tay.addEventListener('pointerdown', function (e) { keo = { x: e.clientX, y: e.clientY, ox: dangSoan.x, oy: dangSoan.y }; tay.setPointerCapture(e.pointerId); e.preventDefault(); });
    tay.addEventListener('pointermove', function (e) { if (!keo || dangSoan.coDinh) return; dangSoan.x = keo.ox + (e.clientX - keo.x) / V.s; dangSoan.y = keo.oy + (e.clientY - keo.y) / V.s; datViTriSoan(); });
    tay.addEventListener('pointerup', function () { keo = null; });
  }
  var chonLuu = null;
  function luuChon() { var s = window.getSelection(); if (s.rangeCount) chonLuu = s.getRangeAt(0).cloneRange(); }
  function khoiPhucChon() { if (!chonLuu) return; var s = window.getSelection(); s.removeAllRanges(); s.addRange(chonLuu); }
  function capNhatNutSoan() {
    $$('#soan-chu [data-sc]').forEach(function (b) { var bat = false; try { bat = document.queryCommandState(b.dataset.sc); } catch (e) { } b.classList.toggle('bat', bat); });
  }
  function veNutKhoa() {
    var b = $('#soan-chu .sc-khoa'), khoa = !!dangSoan.coDinh;
    b.innerHTML = '<svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="4.5" y="9" width="11" height="8" rx="1.5" fill="' + (khoa ? 'currentColor' : 'none') + '"/>' + (khoa ? '<path d="M7 9V6.5a3 3 0 016 0V9"/>' : '<path d="M7 9V6.5a3 3 0 015.6-1.5"/>') + '</svg>';
    b.classList.toggle('bat', khoa); b.title = khoa ? 'Đang khoá (không kéo được) · bấm để mở' : 'Khoá: cố định khung chữ';
  }
  function datViTriSoan() { var el = $('#soan-chu'), o = dangSoan; el.style.left = ((o.x - V.x) * V.s - 6) + 'px'; el.style.top = ((o.y - V.y) * V.s - 4) + 'px'; }
  function datKieuSoan() {
    var o = dangSoan, noi = $('#soan-chu .sc-noi');
    noi.style.fontFamily = GI.vanBan.css(o.font); noi.style.fontSize = (o.co || 26) * V.s + 'px'; noi.style.color = o.mau || (kieuNen().toi ? '#F8FAFC' : '#16213A');
    noi.style.width = o.rong ? (o.rong * V.s + 8) + 'px' : 'auto'; noi.style.maxWidth = (W * 0.8) + 'px';
    $('#soan-chu .sc-font').value = o.font || 'Arial'; $('#soan-chu .sc-co').value = String(o.co || 26);
  }
  function moSoanChu(o, moi) {
    if (dangSoan) xongSoan();
    if (!$('#soan-chu')) taoKhungSoan();
    if (!moi) ghiLichSu();
    dangSoan = o; soanMoi = moi; chonCongCu('chon'); nhom = [{ h: o.id }];
    var el = $('#soan-chu'), noi = el.querySelector('.sc-noi');
    noi.innerHTML = GI.vanBan.sangHtml(o); datKieuSoan(); datViTriSoan(); veNutKhoa();
    el.classList.remove('an'); rongDau = noi.offsetWidth; canVe();
    setTimeout(function () { noi.focus(); var r = document.createRange(); r.selectNodeContents(noi); r.collapse(false); var s = window.getSelection(); s.removeAllRanges(); s.addRange(r); capNhatNutSoan(); }, 20);
  }
  function xongSoan() {
    var o = dangSoan; if (!o) return; var el = $('#soan-chu'), noi = el.querySelector('.sc-noi');
    o.doan = GI.vanBan.tuHtml(noi); delete o.nd; delete o.dam;
    // người dùng kéo góc khung (resize) thì trình duyệt ghi bề rộng px → dùng làm bề rộng xuống dòng
    if (/px$/.test(noi.style.width)) o.rong = Math.max(40, (parseFloat(noi.style.width) - 8) / V.s); else delete o.rong;
    dangSoan = null; el.classList.add('an'); noi.blur();
    if (GI.vanBan.laTrong(o)) { trang().hinh = trang().hinh.filter(function (x) { return x !== o; }); nhom = []; if (soanMoi) truoc.pop(); }
    daSua = true; capNhatTieuDe(); canVe();
  }
  document.addEventListener('pointerdown', function (e) { if (dangSoan && !e.target.closest('#soan-chu')) xongSoan(); }, true);

  // ---- Hộp chèn công thức (MathLive) ----
  var ctDangSua = null, mfCT = null;
  function moHopCongThuc(o) {
    ctDangSua = o; var hop = $('#hop-cong-thuc'); hop.classList.remove('an');
    $('#ct-latex').value = o ? o.latex : ''; $('#ct-mau').value = o && o.mau ? o.mau : (kieuNen().toi ? '#F8FAFC' : '#111827');
    $('#ct-co').value = o ? o.co : 40; $('#ct-co-so').textContent = $('#ct-co').value; $('#ct-lon').checked = o ? !!o.lon : true;
    $('#ct-chen').textContent = o ? 'Cập nhật' : 'Chèn'; $('#ct-xem').textContent = '';
    GI.congThuc.napMathLive().then(function () {
      if (!mfCT) {
        mfCT = new window.MathfieldElement(); mfCT.mathVirtualKeyboardPolicy = 'manual'; $('#ct-o').appendChild(mfCT);
        mfCT.addEventListener('input', function () { $('#ct-latex').value = mfCT.value; $('#ct-xem').textContent = ''; });
        mfCT.addEventListener('focusin', function () { if (window.mathVirtualKeyboard) window.mathVirtualKeyboard.show(); });
        $('#ct-latex').addEventListener('input', function () { mfCT.value = $('#ct-latex').value; });
      }
      mfCT.value = $('#ct-latex').value; setTimeout(function () { mfCT.focus(); }, 30);
    }).catch(function (e) { $('#ct-xem').textContent = 'Không nạp được bộ soạn công thức: ' + e.message; });
    GI.congThuc.napMathJax().catch(function () { });
  }
  function dongHopCongThuc() { $('#hop-cong-thuc').classList.add('an'); if (window.mathVirtualKeyboard) window.mathVirtualKeyboard.hide(); }
  function chenCongThuc() {
    var latex = $('#ct-latex').value.trim(); if (!latex) { $('#ct-xem').textContent = 'Hãy nhập công thức.'; return; }
    var mau = $('#ct-mau').value, co = +$('#ct-co').value, lon = $('#ct-lon').checked;
    ghiLichSu();
    if (ctDangSua) { ctDangSua.latex = latex; ctDangSua.mau = mau; ctDangSua.co = co; ctDangSua.lon = lon || undefined; }
    else { var tam = veTG(W / 2, Hh / 2), o = themHinh({ id: idMoi('h'), loai: 'congThuc', x: tam.x - 80, y: tam.y - 30, latex: latex, mau: mau, co: co, lon: lon || undefined }); chonCongCu('chon'); nhom = [{ h: o.id }]; }
    dongHopCongThuc(); canVe(); thongBao(ctDangSua ? 'Đã cập nhật công thức' : 'Đã chèn công thức · kéo để di chuyển, bấm đúp để sửa');
  }
  /* =====================================================================
     MẪU HÌNH: hình không gian, đường tròn, hình phẳng, đường đặc biệt
     ===================================================================== */

  // Tay nắm của hình không gian và nút xoay
  function timTayNam(M) {
    var r = 9 / V.s, ds = trang().hinh;
    for (var ia = ds.length - 1; ia >= 0; ia--) {   // góc dưới phải của ảnh đang chọn: kéo để đổi cỡ (giữ tỉ lệ)
      var a = ds[ia]; if (a.loai !== 'anh' || a.an || a.coDinh || !(trongNhom({ h: a.id }) || a.id === chonId)) continue;
      if (Math.abs(M.x - (a.x + a.w)) < r && Math.abs(M.y - (a.y + a.h)) < r) return { loai: 'coAnh', o: a, tl: a.h / a.w };
    }
    for (var i = ds.length - 1; i >= 0; i--) {
      var o = ds[i], v = giaTri[o.id]; if (!v || o.an || v.k !== 'khoi') continue;
      if (trongNhom({ h: o.id }) || o.id === chonId) { var X0 = viTriNutXoay(v.khung); if (Math.hypot(M.x - X0.x, M.y - X0.y) < 15 / V.s) return { loai: 'xoayKhoi', o: o, bat: { x: M.x * V.s, y: M.y * V.s }, xoay0: o.xoay || 0, alpha0: o.alpha == null ? 40 : o.alpha }; }
      for (var j = 0; j < v.tay.length; j++) if (Math.hypot(M.x - v.tay[j].P.x, M.y - v.tay[j].P.y) < r) { var dh = GI.khoi.daoHam(o, j); return { loai: 'tayKhoi', o: o, ts: dh.ts, P0: dh.P0, g: dh.g, p0: dh.p0, N0: dh.N0 }; }
    }
    if (window.timNutXoayMau) return window.timNutXoayMau(M);
    return null;
  }
  function keoTayNam(k, M, p) {
    if (k.loai === 'tayKhoi') {
      var o = k.o; GI.khoi.keo(o, k.ts, M, k.P0, k.g, k.p0);
      if (o.dang === 'lapPhuong' && k.ts === 'a') { o.b = o.a; o.c = o.a; }
      GI.khoi.giuNeo(o, k.N0);
    } else if (k.loai === 'xoayKhoi') {
      var dx = M.x * V.s - k.bat.x, dy = M.y * V.s - k.bat.y;
      k.o.xoay = Math.round((k.xoay0 + dx * 0.6) * 10) / 10; k.o.alpha = Math.max(8, Math.min(80, Math.round((k.alpha0 - dy * 0.35) * 10) / 10));
    } else if (k.loai === 'coAnh') { var wA = Math.max(24 / V.s, M.x - k.o.x); k.o.w = wA; k.o.h = wA * k.tl; }
    else if (window.keoNutXoayMau) window.keoNutXoayMau(k, M);
  }
  function chenMau(k, viTri) {
    var tam = viTri || veTG(W / 2, Hh / 2), lech = viTri ? 0 : (trang().hinh.filter(function (o) { return o.loai === 'khoi'; }).length % 4) * 30;
    if (k.indexOf('k_') === 0) {
      ghiLichSu(); var o = GI.khoi.moi(k.slice(2), tam.x + lech, tam.y + lech);
      var kh0 = (GI.khoi.tinh(o) || {}).khung; if (kh0) { o.x += tam.x - (kh0.x0 + kh0.x1) / 2; o.y += tam.y - (kh0.y0 + kh0.y1) / 2; } o.id = idMoi('k'); themHinh(o);   // tâm hình đúng chỗ bấm
      chonCongCu('chon'); nhom = [{ h: o.id }]; capNhatChon(false);
      thongBao('Đã chèn ' + GI.khoi.TEN[o.dang].toLowerCase() + ' · kéo điểm có vòng tròn để đổi kích thước, nút ↻ để xoay');
      return;
    }
    chenMauPhang(k, tam);
  }
  // Dựng mẫu bằng các đối tượng hình học thường (kéo đỉnh hình vẫn giữ đúng tính chất)
  function boDung(tam) {
    var gid = 'g' + (demId++) + Date.now().toString(36).slice(-3), dung = {}, ds = [];
    trang().hinh.forEach(function (o) { if (o.ten) dung[o.ten] = 1; });
    function ten(t) { if (t && !dung[t]) { dung[t] = 1; return t; } var m = tenDiemMoi(); dung[m] = 1; return m; }
    function them(o, tienTo) { o.id = idMoi(tienTo || 'h'); o.nhomMau = gid; themHinh(o); ds.push(o.id); return o.id; }
    var B = {
      gid: gid, ds: ds,
      diem: function (t, x, y) { return them({ loai: 'diem', x: tam.x + x, y: tam.y + y, ten: ten(t) }, 'd'); },
      tren: function (duong, t, x, y) { return them({ loai: 'diemTren', tren: duong, t: H.thamSo(giaTri[duong], { x: tam.x + x, y: tam.y + y }), ten: ten(t) }, 'd'); },
      dt: function (loai, thamSo, t) { var o = Object.assign({ loai: loai }, thamSo); if (t !== undefined) o.ten = t === null ? undefined : ten(t); return them(o, H.LA_DIEM[loai] ? 'd' : 'h'); },
      doan: function (a, b, an) { var id = them({ loai: 'doan', a: a, b: b }); if (an) timTheoId(id).an = true; return id; },
      an: function (id) { timTheoId(id).an = true; return id; },
      // giao điểm khác điểm 'tranh' (khi một giao điểm đã là đỉnh có sẵn)
      giao: function (o1, o2, t, tranh, khiChon) {
        var c2 = H.catNhau(giaTri[o1], giaTri[o2]), k = 0;
        if (c2.length > 1) { var T = tranh && giaTri[tranh]; if (T) k = H.kc(c2[0], T) > H.kc(c2[1], T) ? 0 : 1; else if (khiChon) k = khiChon(c2); }
        return them({ loai: 'giao', o1: o1, o2: o2, k: k, ten: t === null ? undefined : ten(t) }, 'd');
      },
      vuong: function (a, o, b) { return them({ loai: 'gocVuong', a: a, o: o, b: b }); },
    };
    return B;
  }
  function chenMauPhang(k, tam) {
    ghiLichSu(); var B = boDung(tam), D = B.diem, dt = B.dt, doan = B.doan, R = 110;
    function cuc(goc, r) { return [Math.cos(goc * Math.PI / 180) * (r || R), Math.sin(goc * Math.PI / 180) * (r || R)]; }
    function tamGiacTuDo(dx, dy) { var A = D('A', -30 + (dx || 0), -110 + (dy || 0)), Bp = D('B', -130 + (dx || 0), 80 + (dy || 0)), C = D('C', 140 + (dx || 0), 80 + (dy || 0)); doan(A, Bp); doan(Bp, C); doan(C, A); return [A, Bp, C]; }
    switch (k) {
      /* ----- Đường tròn ----- */
      case 'm_noiTiep': {
        var O = D('O', 0, 0), pA = cuc(-100), A = D('A', pA[0], pA[1]), tr = dt('tron', { o: O, a: A });
        var pB = cuc(150), Bp = B.tren(tr, 'B', pB[0], pB[1]), pC = cuc(30), C = B.tren(tr, 'C', pC[0], pC[1]);
        doan(A, Bp); doan(Bp, C); doan(C, A); break;
      }
      case 'm_catHaiCanh': {
        var Bc = D('B', -120, 40), Cc = D('C', 120, 40), Oc = dt('trungDiem', { a: Bc, b: Cc }, 'O'), trc = dt('tron', { o: Oc, a: Bc });
        var Ac = D('A', -40, -150), sAB = doan(Ac, Bc), sAC = doan(Ac, Cc); doan(Bc, Cc);
        B.giao(sAB, trc, 'D', Bc); B.giao(sAC, trc, 'E', Cc); break;
      }
      case 'm_duongKinh': { var Ad = D('A', -110, 0), Bd = D('B', 110, 0), Od = dt('trungDiem', { a: Ad, b: Bd }, 'O'); dt('tron', { o: Od, a: Ad }); doan(Ad, Bd); break; }
      case 'm_veDuongKinh': { var Ov = D('O', 0, 0), Av = D('A', -100, -45), trv = dt('tron', { o: Ov, a: Av }), Bv = dt('bienHinh', { kieu: 'dxTam', nguon: Av, tam: Ov }, 'B'); doan(Av, Bv); break; }
      case 'm_tiepTuyen1': case 'm_tiepTuyen2': {
        var Ot = D('O', -90, 0), pR = cuc(130, R), Rt = D('A', -90 + pR[0], pR[1]), trt = dt('tron', { o: Ot, a: Rt }), Mt = D('M', 170, 0);
        var sOM = doan(Ot, Mt), It = B.an(dt('trungDiem', { a: Ot, b: Mt }, null)), phu = B.an(dt('tron', { o: It, a: Ot }));
        B.giao(sOM, trt, 'K', null, function (c2) { return c2[0].x > c2[1].x ? 0 : 1; });
        var soT = k === 'm_tiepTuyen2' ? 2 : 1;
        for (var i = 0; i < soT; i++) {
          var T = B.giao(trt, phu, i ? 'C' : 'B', null, function (c2) { return (i === 0) === (c2[0].y < c2[1].y) ? 0 : 1; });
          doan(Ot, T); doan(Mt, T); B.vuong(Ot, T, Mt);
        }
        break;
      }
      case 'm_tiepTuyenChung': {
        var O1 = D('O', -120, 10), A1 = D('A', -120 + 95 * Math.cos(2.4), 10 + 95 * Math.sin(2.4)), C1 = dt('tron', { o: O1, a: A1 });
        var O2 = D("O'", 110, 25), A2 = D('B', 110 + 55 * Math.cos(0.6), 25 + 55 * Math.sin(0.6)), C2 = dt('tron', { o: O2, a: A2 });
        var tt = dt('tiepTuyenChung', { o1: C1, o2: C2, k: 0 }), Tp = dt('dauDoan', { d: tt, i: 0 }, 'M'), Tq = dt('dauDoan', { d: tt, i: 1 }, 'N');
        doan(O1, Tp); doan(O2, Tq); B.vuong(O1, Tp, Tq); B.vuong(O2, Tq, Tp); doan(O1, O2); break;
      }
      /* ----- Hình phẳng ----- */
      case 'p_tamGiac': { var tg = [D('A', -30, -110), D('B', -130, 80), D('C', 140, 80)]; dt('daGiac', { ds: tg }); break; }
      case 'p_tamGiacCan': {
        var Bn = D('B', -110, 80), Cn = D('C', 110, 80), tt2 = B.an(dt('trungTruc', { a: Bn, b: Cn })), An = B.tren(tt2, 'A', 0, -120);
        dt('daGiac', { ds: [An, Bn, Cn] }); break;
      }
      case 'p_tamGiacDeu': { var Be = D('B', -110, 70), Ce = D('C', 110, 70), Ae = dt('bienHinh', { kieu: 'quay', nguon: Ce, tam: Be, goc: 60 }, 'A'); dt('daGiac', { ds: [Ae, Be, Ce] }); break; }
      case 'p_tamGiacVuong': {
        var Aq = D('A', -110, 80), Bq = D('B', 130, 80), dq = B.an(dt('duong', { a: Aq, b: Bq })), vg = B.an(dt('vuongGoc', { d: dq, a: Aq, kyHieuVuong: false })), Cq = B.tren(vg, 'C', -110, -100);
        dt('daGiac', { ds: [Aq, Bq, Cq] }); B.vuong(Bq, Aq, Cq); break;
      }
      case 'p_hcn': case 'p_hv': case 'p_hbh': case 'p_thoi': {
        var A4 = D('A', -120, 70), B4 = D('B', 120, 70), D4;
        if (k === 'p_hcn') { var d4 = B.an(dt('duong', { a: A4, b: B4 })), v4 = B.an(dt('vuongGoc', { d: d4, a: A4, kyHieuVuong: false })); D4 = B.tren(v4, 'D', -120, -60); }
        else if (k === 'p_hv') D4 = dt('bienHinh', { kieu: 'quay', nguon: B4, tam: A4, goc: 90 }, 'D');
        else if (k === 'p_hbh') D4 = D('D', -60, -70);
        else { var t4 = B.an(dt('tron', { o: A4, a: B4 })); D4 = B.tren(t4, 'D', -120 + 240 * Math.cos(-1.1), 70 + 240 * Math.sin(-1.1)); }
        var C4 = dt('bienHinh', { kieu: 'tinhTien', nguon: D4, v1: A4, v2: B4 }, 'C');
        dt('daGiac', { ds: [A4, B4, C4, D4] }); if (k === 'p_hcn' || k === 'p_hv') B.vuong(B4, A4, D4); break;
      }
      case 'p_thang': case 'p_thangCan': case 'p_thangVuong': {
        var At = D('A', -140, 70), Bt = D('B', 140, 70), Dt, Ct;
        if (k === 'p_thangCan') { Dt = D('D', -70, -60); var tr5 = B.an(dt('trungTruc', { a: At, b: Bt })); Ct = dt('bienHinh', { kieu: 'dxTruc', nguon: Dt, truc: tr5 }, 'C'); }
        else {
          if (k === 'p_thangVuong') { var d5 = B.an(dt('duong', { a: At, b: Bt })), v5 = B.an(dt('vuongGoc', { d: d5, a: At, kyHieuVuong: false })); Dt = B.tren(v5, 'D', -140, -60); }
          else Dt = D('D', -70, -60);
          var ab = B.an(dt('duong', { a: At, b: Bt })), ss = B.an(dt('songSong', { d: ab, a: Dt })); Ct = B.tren(ss, 'C', 60, -60);
        }
        dt('daGiac', { ds: [At, Bt, Ct, Dt] }); if (k === 'p_thangVuong') { B.vuong(Bt, At, Dt); B.vuong(At, Dt, Ct); } break;
      }
      case 'p_lucGiac': {
        var A6 = D('A', -55, 95), B6 = D('B', 55, 95), dg = dt('daGiacDeu', { a: A6, b: B6, n: 6 });
        for (var j = 2; j < 6; j++) dt('dinhDG', { dg: dg, i: j }, String.fromCharCode(65 + j)); break;
      }
      /* ----- Đường đặc biệt trong tam giác ----- */
      case 'd_phanGiac': {
        var t3 = tamGiacTuDo(), pg = [];
        [[0, 1, 2, 'D'], [1, 0, 2, 'E'], [2, 0, 1, 'F']].forEach(function (q) {
          var l = B.an(dt('phanGiac', { a: t3[q[1]], o: t3[q[0]], b: t3[q[2]] })), canh = B.an(dt('duong', { a: t3[q[1]], b: t3[q[2]] }));
          doan(t3[q[0]], B.giao(l, canh, q[3])); pg.push(l);
        });
        var Ip = B.giao(pg[0], pg[1], 'I'), bc = B.an(dt('duong', { a: t3[1], b: t3[2] })), vgI = B.an(dt('vuongGoc', { d: bc, a: Ip, kyHieuVuong: false }));
        var chanI = B.an(B.giao(vgI, bc, null)); dt('tron', { o: Ip, a: chanI }); break;
      }
      case 'd_trungTruc': {
        var t4b = tamGiacTuDo(), tt3 = B.an(dt('trungTruc', { a: t4b[1], b: t4b[2] })), tt4 = B.an(dt('trungTruc', { a: t4b[0], b: t4b[2] }));
        var Ot2 = B.giao(tt3, tt4, 'O');
        [[1, 2, 'M'], [0, 2, 'N'], [0, 1, 'P']].forEach(function (q) { var Mq = dt('trungDiem', { a: t4b[q[0]], b: t4b[q[1]] }, q[2]); doan(Ot2, Mq); B.vuong(Ot2, Mq, t4b[q[1]]); });
        dt('tron', { o: Ot2, a: t4b[0] }); break;
      }
      case 'd_trungBinh': { var t5 = tamGiacTuDo(), Mb = dt('trungDiem', { a: t5[0], b: t5[1] }, 'M'), Nb = dt('trungDiem', { a: t5[0], b: t5[2] }, 'N'); doan(Mb, Nb); break; }
    }
    giaTri = H.tinh(trang().hinh);
    var kb = khungMau(B.gid);
    if (kb) { var dxm = tam.x - (kb.x0 + kb.x1) / 2, dym = tam.y - (kb.y0 + kb.y1) / 2; trang().hinh.forEach(function (o) { if (o.nhomMau === B.gid && o.loai === 'diem') { o.x += dxm; o.y += dym; } }); giaTri = H.tinh(trang().hinh); }
    // chọn sẵn hình chính (để hiện nút xoay); kéo đỉnh vẫn đổi hình như thường
    var chinh = B.ds.filter(function (id) { var o = timTheoId(id); return o && !o.an && !laDiemO(o) && o.loai !== 'gocVuong'; });
    var uuTien = chinh.filter(function (id) { var v = giaTri[id]; return v && (v.k === 'daGiac' || v.k === 'tron'); });
    chonCongCu('chon'); nhom = (uuTien.length ? uuTien : chinh).slice(0, 1).map(function (id) { return { h: id }; }); capNhatChon(false);
    thongBao('Đã chèn ' + tenCongCu(k).toLowerCase() + ' · kéo đỉnh để đổi hình, nút ↻ để xoay');
  }
  // Nút xoay của mẫu hình phẳng: quay mọi điểm tự do của mẫu quanh tâm khung
  function khungMau(gid) {
    var b = { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity };
    trang().hinh.forEach(function (o) { if (o.nhomMau !== gid || o.an) return; var v = giaTri[o.id]; if (!v) return; diemDaiDien(o, v).forEach(function (P) { b.x0 = Math.min(b.x0, P.x); b.y0 = Math.min(b.y0, P.y); b.x1 = Math.max(b.x1, P.x); b.y1 = Math.max(b.y1, P.y); }); });
    return isFinite(b.x0) ? b : null;
  }
  function mauDangChon() { var g = null; nhom.forEach(function (x) { var o = x.h && timTheoId(x.h); if (o && o.nhomMau) g = o.nhomMau; }); return g; }
  function timNutXoayMau(M) {
    var g = mauDangChon(); if (!g) return null; var k = khungMau(g); if (!k) return null; var P = viTriNutXoay(k);
    if (Math.hypot(M.x - P.x, M.y - P.y) > 15 / V.s) return null;
    var tam = { x: (k.x0 + k.x1) / 2, y: (k.y0 + k.y1) / 2 }, ds = trang().hinh.filter(function (o) { return o.nhomMau === g && (o.loai === 'diem' || (o.loai === 'diemTren' && giaTri[o.tren] && giaTri[o.tren].k === 'tron')); });
    return { loai: 'xoayMau', tam: tam, goc0: Math.atan2(M.y - tam.y, M.x - tam.x), dau: ds.map(function (o) { return { o: o, x: o.x, y: o.y, t: o.t }; }) };
  }
  function keoNutXoayMau(k, M) {
    var a = Math.atan2(M.y - k.tam.y, M.x - k.tam.x) - k.goc0, ca = Math.cos(a), sa = Math.sin(a);
    k.dau.forEach(function (d) { if (d.o.loai === 'diem') { var x = d.x - k.tam.x, y = d.y - k.tam.y; d.o.x = k.tam.x + x * ca - y * sa; d.o.y = k.tam.y + x * sa + y * ca; } else d.o.t = d.t + a; });
  }
  window.timNutXoayMau = timNutXoayMau; window.keoNutXoayMau = keoNutXoayMau;
  /* =====================================================================
     CHỌN NHIỀU (Ctrl, khung chọn, Ctrl+A) và MENU CHUỘT PHẢI
     ===================================================================== */
  var nhom = [];   // đối tượng đang chọn: { h: id hình } | { n: nét viết } | { m: mô hình }
  function cungMuc(a, b) { return a.h ? a.h === b.h : a.n ? a.n === b.n : !!a.m && a.m === b.m; }
  function trongNhom(x) { return nhom.some(function (y) { return cungMuc(x, y); }); }
  function timAnh(M) { var ds = trang().hinh; for (var i = ds.length - 1; i >= 0; i--) { var o = ds[i]; if (o.loai === 'anh' && !o.an && M.x >= o.x && M.x <= o.x + o.w && M.y >= o.y && M.y <= o.y + o.h) return o; } return null; }
  function timMuc(M) {
    var o = timDiem(M) || timChuTruot(M) || timDoiTuong(M) || timSoDo(M) || timAnh(M);
    if (o) return { h: o.id, o: o };
    var mh = timMoHinh(M); if (mh) return { m: mh };
    var n = timNet(M); if (n) return { n: n };
    return null;
  }
  // chonId (bảng Thuộc tính) theo hình chọn sau cùng
  function capNhatChon(moBang) {
    nhom.forEach(function (x) { delete x.o; });
    var hs = nhom.filter(function (x) { return x.h && timTheoId(x.h); });
    if (!hs.length) { if (chonId) dongThuocTinh(); canVe(); return; }
    var id = hs[hs.length - 1].h;
    if (moBang || !$('#thuoc-tinh').classList.contains('an')) moThuocTinh(id); else { chonId = id; canVe(); }
  }
  function chonTatCa() {
    if (cc !== 'chon') chonCongCu('chon');
    var t = trang(); nhom = [];
    t.hinh.forEach(function (o) { if (!o.an && giaTri[o.id]) nhom.push({ h: o.id }); });
    t.net.forEach(function (n) { nhom.push({ n: n }); }); t.moHinh.forEach(function (m) { nhom.push({ m: m }); });
    capNhatChon(false); thongBao('Đã chọn ' + nhom.length + ' đối tượng');
  }
  // Những điểm đặc trưng của hình (để biết hình có nằm trọn trong khung chọn không)
  function diemDaiDien(o, v) {
    if (o.loai === 'anh') return [{ x: o.x, y: o.y }, { x: o.x + o.w, y: o.y + o.h }];
    if (o.loai === 'chu' || o.loai === 'congThuc' || o.loai === 'thanhTruot') return o._khung && o.loai !== 'thanhTruot' ? [{ x: o._khung.x0, y: o._khung.y0 }, { x: o._khung.x1, y: o._khung.y1 }] : [{ x: o.x, y: o.y }];
    if (v.k === 'diem') return [v];
    if (v.k === 'thang' && v.loai === 'doan') return [v.p, v.q];
    if (v.k === 'tron') return [{ x: v.c.x - v.r, y: v.c.y - v.r }, { x: v.c.x + v.r, y: v.c.y + v.r }];
    if (v.k === 'daGiac' || v.k === 'gapKhuc') return v.ds;
    if (v.k === 'cung') return [v.c, { x: v.c.x + v.r * Math.cos(v.a0), y: v.c.y + v.r * Math.sin(v.a0) }, { x: v.c.x + v.r * Math.cos(v.a0 + v.da), y: v.c.y + v.r * Math.sin(v.a0 + v.da) }];
    return H.cha(o).map(function (id) { return giaTri[id]; }).filter(function (P) { return P && P.k === 'diem'; });
  }
  function chonTrongKhung(a, b) {
    var x0 = Math.min(a.x, b.x), x1 = Math.max(a.x, b.x), y0 = Math.min(a.y, b.y), y1 = Math.max(a.y, b.y), t = trang(), ds = [];
    if (x1 - x0 < 3 / V.s && y1 - y0 < 3 / V.s) return [];
    function trong(P) { return P.x >= x0 && P.x <= x1 && P.y >= y0 && P.y <= y1; }
    t.hinh.forEach(function (o) { var v = giaTri[o.id]; if (!v || o.an) return; var ps = diemDaiDien(o, v); if (ps.length && ps.every(trong)) ds.push({ h: o.id }); });
    t.net.forEach(function (n) { var k = khungNet(n); if (trong({ x: k.x0, y: k.y0 }) && trong({ x: k.x1, y: k.y1 })) ds.push({ n: n }); });
    t.moHinh.forEach(function (m) { if (trong(m) && trong({ x: m.x + KT_THE.w, y: m.y + KT_THE.h })) ds.push({ m: m }); });
    return ds;
  }
  // Kéo cả nhóm: dời các điểm tự do (và chữ, thanh trượt, nét viết, mô hình) đã tạo ra các hình đang chọn
  function batDauKeoNhom(M) {
    var diem = {}, chu = [], net = [], mh = [], daXet = {};
    function leo(id) {
      if (daXet[id]) return; daXet[id] = 1; var o = timTheoId(id); if (!o) return;
      if (o.loai === 'diem') { if (!o.coDinh) diem[o.id] = o; return; }
      if (o.loai === 'chu' || o.loai === 'congThuc' || o.loai === 'thanhTruot' || o.loai === 'khoi' || o.loai === 'anh') { if (!o.coDinh) chu.push(o); return; }
      H.cha(o).forEach(leo);
    }
    nhom.forEach(function (x) { if (x.h) leo(x.h); else if (x.n) net.push(x.n); else if (x.m) mh.push(x.m); });
    var ds = Object.keys(diem).map(function (k) { return diem[k]; });
    if (!ds.length && !chu.length && !net.length && !mh.length) { canVe(); return; }
    dangKeo = { loai: 'nhom', truoc: M, diem: ds, chu: chu, net: net, mh: mh, daGhi: false }; canVe();
  }
  function keoNhom(M) {
    var k = dangKeo, dx = M.x - k.truoc.x, dy = M.y - k.truoc.y; if (!dx && !dy) return;
    if (!k.daGhi) { ghiLichSu(); k.daGhi = true; }
    k.diem.concat(k.chu, k.mh).forEach(function (o) { o.x += dx; o.y += dy; });
    k.net.forEach(function (n) { n.pts.forEach(function (q) { q[0] += dx; q[1] += dy; }); n._vien = null; });
    k.truoc = M; daSua = true; canVe();
  }
  function xoaNhom() {
    if (!nhom.length) return; ghiLichSu(); var t = trang(), bo = {};
    nhom.forEach(function (x) {
      if (x.h) { var b = H.phuThuoc(t.hinh, x.h); Object.keys(b).forEach(function (k) { bo[k] = 1; }); }
      if (x.n) t.net = t.net.filter(function (n) { return n !== x.n; });
      if (x.m) t.moHinh = t.moHinh.filter(function (m) { return m !== x.m; });
    });
    t.hinh = t.hinh.filter(function (o) { return !bo[o.id]; });
    nhom = []; dongMenuPhai(); dongThuocTinh(); canVe();
  }
  function tenLoai(o) {
    var t = 'Đối tượng'; NHOM_TT.some(function (n) { if (n[1](o)) { t = n[0]; return true; } return false; });
    if (o.loai === 'khoi') return GI.khoi.TEN[o.dang];
    return { 'Cung tròn, hình quạt': giaTri[o.id] && giaTri[o.id].quat ? 'Hình quạt' : 'Cung tròn', 'Đường conic': { elip: 'Elip', hypebol: 'Hypebol', parabol: 'Parabol' }[o.loai] || 'Đường conic', 'Số đo': { doDai: 'Độ dài', goc: 'Góc', dienTich: 'Diện tích', gocVuong: 'Kí hiệu góc vuông' }[o.loai] || 'Số đo' }[t] || t;
  }
  function coTen(o) { return ['doDai', 'goc', 'dienTich', 'gocVuong', 'chu', 'congThuc', 'anh'].indexOf(o.loai) < 0; }
  function dongMenuPhai() { var m = $('#menu-phai'); if (m) m.remove(); }
  function moMenuPhai(x, y) {
    dongMenuPhai();
    var hs = nhom.filter(function (q) { return q.h; }).map(function (q) { return timTheoId(q.h); }).filter(Boolean), conLai = nhom.length - hs.length;
    var el = document.createElement('div'); el.id = 'menu-phai';
    var dau = nhom.length > 1 ? 'Đã chọn ' + nhom.length + ' đối tượng'
      : hs.length ? tenLoai(hs[0]) + (hs[0].ten ? ' <b>' + hs[0].ten.replace(/</g, '&lt;') + '</b>' : '') : nhom[0].n ? 'Nét viết tay' : 'Mô hình GeoLab';
    function tich(trangThai) { return '<span class="o-tich ' + (trangThai === 1 ? 'co' : trangThai === 0.5 ? 'mo' : '') + '">' + (trangThai === 1 ? '✓' : '') + '</span>'; }
    function ds(f) { var n = hs.filter(f).length; return n === hs.length ? 1 : n ? 0.5 : 0; }
    var h = '<div class="mp-dau">' + dau + '</div>';
    if (hs.length) {
      h += '<button data-mp="hien">' + tich(ds(function (o) { return !o.an; })) + 'Hiển thị đối tượng</button>';
      var coT = hs.filter(coTen); if (coT.length) h += '<button data-mp="ten">' + tich(coT.filter(function (o) { return o.loai === 'hamSo' ? o.hienTen !== false : hienTenCua(o); }).length === coT.length ? 1 : coT.some(hienTenCua) ? 0.5 : 0) + 'Hiển thị tên</button>';
      var dsGoc = hs.filter(function (o) { return o.loai === 'goc'; });
      if (dsGoc.length) h += '<button data-mp="soGoc">' + tich(dsGoc.every(function (o) { return !o.anSo; }) ? 1 : dsGoc.some(function (o) { return !o.anSo; }) ? 0.5 : 0) + 'Hiện số đo góc</button>';
      if (hs.some(function (o) { return o.nhan; })) h += '<button data-mp="datLaiTen"><span class="o-tich" style="border:0">↺</span>Đặt lại vị trí tên</button>';
      if (hs.length === 1 && coTen(hs[0]) && nhom.length === 1) h += '<button data-mp="doiTen"><span class="o-tich" style="border:0">✎</span>Đổi tên…</button>';
      h += '<hr>';
    }
    h += '<button data-mp="xoa" class="do"><span class="o-tich" style="border:0">🗑</span>Xoá' + (nhom.length > 1 ? ' ' + nhom.length + ' đối tượng' : '') + '</button>';
    if (hs.length) h += '<button data-mp="thuocTinh"><span class="o-tich" style="border:0">⚙</span>Thuộc tính…</button>';
    el.innerHTML = h; document.body.appendChild(el);
    el.style.left = Math.min(x, window.innerWidth - el.offsetWidth - 6) + 'px'; el.style.top = Math.min(y, window.innerHeight - el.offsetHeight - 6) + 'px';
    el.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    el.querySelectorAll('[data-mp]').forEach(function (b) {
      b.onclick = function () {
        var k = b.dataset.mp; dongMenuPhai();
        if (k === 'hien') { var hien = ds(function (o) { return !o.an; }) !== 1; ghiLichSu(); hs.forEach(function (o) { o.an = hien ? undefined : true; }); if (!hien) nhom = nhom.filter(function (q) { return !q.h; }); capNhatChon(false); }
        else if (k === 'ten') { var coT2 = hs.filter(coTen), bat = !coT2.every(hienTenCua); ghiLichSu(); coT2.forEach(function (o) { o.hienTen = bat; if (bat && !o.ten && o.loai !== 'hamSo' && o.loai !== 'khoi') o.ten = laDiemO(o) ? tenDiemMoi() : tenDuongMoi(); }); }
        else if (k === 'doiTen') {
          doiTenHinh(hs[0]);
        }
        else if (k === 'soGoc') { var gs = hs.filter(function (o) { return o.loai === 'goc'; }), batSo = !gs.every(function (o) { return !o.anSo; }); ghiLichSu(); gs.forEach(function (o) { o.anSo = batSo ? undefined : true; }); if (batSo && !hienSo) { hienSo = true; capNhatNutBat(); } }
        else if (k === 'datLaiTen') { ghiLichSu(); hs.forEach(function (o) { delete o.nhan; }); }
        else if (k === 'xoa') xoaNhom();
        else if (k === 'thuocTinh') { chonId = hs[hs.length - 1].id; moThuocTinh(chonId); }
        if (chonId && !$('#thuoc-tinh').classList.contains('an')) veThuocTinh();
        canVe();
      };
    });
  }
  document.addEventListener('pointerdown', function (e) { if (!e.target.closest('#menu-phai') && e.button !== 2) dongMenuPhai(); });

  /* =====================================================================
     KHỞI ĐỘNG
     ===================================================================== */
  ganBieuTuong(); veThanhCongCu(); taoBangTT(); ganThanhTrai();
  $$('[data-lenh]').forEach(function (b) { b.addEventListener('click', function () { $('#menu').classList.add('an'); LENH[b.dataset.lenh](); }); });
  $$('[data-xo]').forEach(function (b) { b.onclick = function (e) { e.stopPropagation(); moBangChinh(b.dataset.xo, b.parentNode); }; });
  document.addEventListener('pointerdown', function (e) { if (moChinh && !e.target.closest('#tuy-chon-but') && !e.target.closest('[data-xo]')) { moChinh = null; veBangChinh(); } });
  $('#nut-menu').onclick = function (e) { e.stopPropagation(); $('#menu').classList.toggle('an'); veMenuNen(); };
  document.addEventListener('pointerdown', function (e) { if (!e.target.closest('#menu') && !e.target.closest('#nut-menu')) $('#menu').classList.add('an'); });
  $('#thong-tin').onclick = function () { thuPhong(1 / V.s); };
  if (MT) MT.phienBan().then(function (v) { $('#phien-ban').textContent = 'GeoInk ' + v + ' · Nhóm nghiên cứu khoa học trường TH-THCS An Lạc'; });
  $$('.hop [data-dong]').forEach(function (b) { b.onclick = function () { b.closest('.hop').classList.add('an'); if (window.mathVirtualKeyboard) window.mathVirtualKeyboard.hide(); }; });
  $('#ct-chen').onclick = chenCongThuc;
  // ----- Nhập hình từ mã TikZ -----
  function nhapTikz(ma) {
    var kq;
    try { var vtTZ = veTG(W / 2, Hh / 2 + 10); kq = GI.tikz.nhap(ma, { taoId: idMoi, viTri: vtTZ, khung: { w: W / V.s, h: (Hh - 120) / V.s } }); }
    catch (e) { return { loi: 'Không đọc được mã: ' + (e.message || e) }; }
    if (!kq.hinh.length) return { loi: 'Không tìm thấy hình nào để dựng.' + (kq.canhBao.length ? '<br>' + kq.canhBao.map(escHtml).join('<br>') : '') };
    ghiLichSu();
    var gid = 'g' + (demId++) + Date.now().toString(36).slice(-3), dung = {};
    trang().hinh.forEach(function (o) { if (o.ten) dung[o.ten] = 1; });
    kq.hinh.forEach(function (o) {
      if (o.ten) { var t = o.ten, k = 1; while (dung[t]) t = o.ten + (k++); o.ten = t; dung[t] = 1; }
      o.nhomMau = gid; trang().hinh.push(o);
    });
    giaTri = H.tinh(trang().hinh);
    chonCongCu('chon'); nhom = []; capNhatChon(false); canVe();
    var so = kq.so || {}, mo = [so.diem ? so.diem + ' điểm' : '', so.doan ? so.doan + ' đoạn' : '', so.tron ? so.tron + ' đường tròn' : '', so.goc ? so.goc + ' kí hiệu góc' : ''].filter(Boolean).join(', ');
    thongBao('Đã dựng hình từ mã TikZ' + (mo ? ': ' + mo : '') + (kq.canhBao.length ? ' · ' + kq.canhBao.length + ' chỗ bỏ qua' : ''));
    return kq;
  }
  // ----- Tự cập nhật: báo có bản mới → bấm Cập nhật → tải về → cài và mở lại -----
  var capNhat = { ban: null, dangTai: false, tay: false };
  function theCapNhat(tieuDe, noiDung, nut, tien) {
    var el = $('#the-cap-nhat'); el.classList.remove('an');
    $('#tcn-tieu-de').textContent = tieuDe; $('#tcn-noi-dung').innerHTML = noiDung;
    $('#tcn-thanh').classList.toggle('an', tien == null); if (tien != null) $('#tcn-tien').style.width = tien + '%';
    var kn = $('#tcn-nut'); kn.innerHTML = '';
    (nut || []).forEach(function (n) { var b = document.createElement('button'); b.className = 'nut chu' + (n.chinh ? ' chinh' : ''); b.textContent = n.ten; b.onclick = n.lam; kn.appendChild(b); });
  }
  function dongTheCapNhat() { $('#the-cap-nhat').classList.add('an'); }
  function moiCapNhat() {
    if (!capNhat.ban) return;
    theCapNhat('Có bản GeoInk ' + capNhat.ban + ' mới', 'Bản bạn đang dùng cũ hơn. Bấm <b>Cập nhật</b> để tải về và cài; GeoInk sẽ tự mở lại sau khi cài xong.',
      [{ ten: 'Để sau', lam: dongTheCapNhat }, { ten: 'Cập nhật', chinh: true, lam: batDauTai }]);
  }
  function batDauTai() {
    if (capNhat.dangTai) return; capNhat.dangTai = true;
    theCapNhat('Đang tải GeoInk ' + capNhat.ban, 'Vẫn dùng bảng bình thường trong lúc tải.', [], 0);
    MT.taiCapNhat();
  }
  function caiDat() {
    theCapNhat('Đang cài GeoInk ' + capNhat.ban, 'GeoInk sẽ đóng lại và tự mở lên sau khi cài xong.', []);
    setTimeout(function () { MT.caiCapNhat(); }, 600);
  }
  function taiXong() {
    capNhat.dangTai = false;
    if (!daSua) return caiDat();
    theCapNhat('Đã tải xong GeoInk ' + capNhat.ban, 'Bảng đang có thay đổi chưa lưu. Lưu lại trước khi cài bản mới?',
      [{ ten: 'Để sau', lam: function () { dongTheCapNhat(); thongBao('Bản mới sẽ tự cài khi bạn đóng GeoInk'); } },
       { ten: 'Cài, không lưu', lam: caiDat },
       { ten: 'Lưu rồi cài', chinh: true, lam: function () { luu().then(function (ok) { if (ok) caiDat(); }); } }]);
  }
  if (MT && MT.khiCapNhat) MT.khiCapNhat(function (d) {
    if (d.loai === 'co') { capNhat.ban = d.phienBan; var nb = $('#nut-cap-nhat'); nb.classList.remove('an'); nb.title = 'Có bản GeoInk ' + d.phienBan + ' — bấm để cập nhật'; if (!capNhat.dangTai) moiCapNhat(); capNhat.tay = false; }
    else if (d.loai === 'khong') { if (capNhat.tay) thongBao('Bạn đang dùng bản GeoInk mới nhất'); capNhat.tay = false; }
    else if (d.loai === 'tien') { if (capNhat.dangTai) { $('#tcn-thanh').classList.remove('an'); $('#tcn-tien').style.width = d.phanTram + '%'; $('#tcn-noi-dung').textContent = 'Đã tải ' + d.phanTram + '% · vẫn dùng bảng bình thường trong lúc tải.'; } }
    else if (d.loai === 'xong') taiXong();
    else if (d.loai === 'loi') {
      if (capNhat.dangTai) { capNhat.dangTai = false; theCapNhat('Chưa cập nhật được', 'Lỗi: ' + escHtml(d.loi) + '<br>Kiểm tra mạng rồi thử lại.', [{ ten: 'Đóng', lam: dongTheCapNhat }, { ten: 'Thử lại', chinh: true, lam: batDauTai }]); }
      else if (capNhat.tay) thongBao('Không kiểm tra được cập nhật: ' + d.loi);
      capNhat.tay = false;
    }
  });
  $('#nut-cap-nhat').onclick = function () { if (capNhat.dangTai) $('#the-cap-nhat').classList.remove('an'); else moiCapNhat(); };
  $('#tcn-dong').onclick = dongTheCapNhat;
  var choXuatTex = false;
  function xuatTexChon(ids) {
    var ma = null; try { ma = GI.xuatTex.xuat(trang().hinh, ids, giaTri); } catch (e) { return thongBao('Không xuất được mã: ' + (e.message || e)); }
    if (!ma) return thongBao('Chưa có hình nào trong vùng chọn để xuất mã');
    $('#xuat-tex-ma').value = ma; $('#hop-xuat-tex').classList.remove('an'); $('#xuat-tex-ma').scrollTop = 0;
  }
  $('#xuat-tex-chep').onclick = function () {
    var ta = $('#xuat-tex-ma'), ma = ta.value;
    function xong() { thongBao('Đã sao chép mã TikZ'); }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(ma).then(xong, function () { ta.select(); document.execCommand('copy'); xong(); });
    else { ta.select(); document.execCommand('copy'); xong(); }
  };
  function escHtml(t) { return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
  $('#tikz-dung').onclick = function () {
    var kq = nhapTikz($('#tikz-ma').value);
    if (kq.loi) { $('#tikz-loi').innerHTML = kq.loi; return; }
    if (kq.canhBao.length) { $('#tikz-loi').innerHTML = '<b>Đã dựng hình. Một số chỗ chưa hỗ trợ nên bị bỏ qua:</b><br>' + kq.canhBao.map(escHtml).join('<br>'); return; }
    $('#hop-tikz').classList.add('an');
  };
  function danChu(ma) {
    if (!/\\(draw|path|coordinate|begin\{tikzpicture\})/.test(ma)) return false;
    var kq = nhapTikz(ma);
    if (kq.loi || kq.canhBao.length) { $('#tikz-ma').value = ma; LENH.nhapTikz(); $('#tikz-loi').innerHTML = kq.loi || '<b>Đã dựng hình. Một số chỗ chưa hỗ trợ nên bị bỏ qua:</b><br>' + kq.canhBao.map(escHtml).join('<br>'); }
    return true;
  }
  document.addEventListener('paste', function (e) {
    if (document.body.classList.contains('chua-dang-nhap')) return;
    var el = e.target; if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable || el.tagName === 'MATH-FIELD')) return;
    var cd = e.clipboardData || window.clipboardData, tep = cd && Array.prototype.filter.call(cd.items || [], function (it) { return it.kind === 'file' && /^image\//.test(it.type); })[0];
    if (tep) { e.preventDefault(); var f = tep.getAsFile(), fr = new FileReader(); fr.onload = function () { chenAnh(fr.result, f.name || 'Ảnh dán'); }; fr.readAsDataURL(f); return; }
    if (danChu(cd.getData('text/plain') || '')) e.preventDefault();
  });
  // Trong app: Ctrl+V đọc thẳng clipboard của máy (ảnh chụp Win+Shift+S, ảnh sao chép từ web, mã TikZ)
  function danTuMay() {
    MT.docClipboard().then(function (kq) {
      if (kq.anh) return chenAnh(kq.anh, 'Ảnh dán');
      if (!danChu(kq.chu || '')) thongBao('Clipboard chưa có ảnh để dán');
    });
  }
  $('#ct-co').oninput = function () { $('#ct-co-so').textContent = $('#ct-co').value; };
  $$('.hop').forEach(function (h) { h.addEventListener('pointerdown', function (e) { if (e.target === h) h.classList.add('an'); }); });

  window.addEventListener('keydown', function (e) {
    if (document.body.classList.contains('chua-dang-nhap')) return;   // đang ở trang đăng nhập
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable || e.target.tagName === 'MATH-FIELD') { if (e.key === 'Escape') $$('.hop').forEach(function (h) { h.classList.add('an'); }); return; }
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
      else if (k === 'a') { e.preventDefault(); chonTatCa(); }
      else if (k === 'v' && MT && MT.docClipboard) { e.preventDefault(); danTuMay(); }
      return;
    }
    if (e.key === 'Escape') { choXuatTex = false; dongMenuPhai(); nhom = []; dongThuocTinh(); choChon = []; $$('.hop').forEach(function (h) { h.classList.add('an'); }); capNhatGoiY(); canVe(); }
    else if (e.key === 'PageDown') LENH.trangSau(); else if (e.key === 'PageUp') LENH.trangTruoc();
    else if (e.key === 'F11') { e.preventDefault(); LENH.toanManHinh(); }
    else if ((e.key === 'Delete' || e.key === 'Backspace') && (nhom.length || chonId)) { if (!nhom.length) nhom = [{ h: chonId }]; xoaNhom(); }
    else if (k === 'r') catDungCu();
    else { var phim = { p: 'but', t: 'chon', v: 'chon', h: 'keo', e: 'tay' }[k]; if (phim) chonCongCu(phim); }
  });

  if (document.fonts) document.fonts.load('italic 22px "LM Roman"', 'ABCabc').then(canVe, function () { });
  window.addEventListener('resize', doiKichThuoc);
  doiKichThuoc();
  chonCongCu('but'); sauKhiDoiTrang(); requestAnimationFrame(vong);
  GI.taiKhoan.batDau();
  if (MT) {
    MT.tepKhoiDong().then(function (d) { if (d) napTep(d); });
    MT.khiMoTep(function (d) { if (hoiBoThayDoi()) napTep(d); });
    MT.khiHoiDong(function () { if (!daSua || window.confirm('Bảng có thay đổi chưa lưu. Thoát mà không lưu?')) MT.dongThat(); });
  } else {
    window.addEventListener('beforeunload', function (e) { if (daSua) { e.preventDefault(); e.returnValue = ''; } });
  }
  window.GeoInk = { tl: function () { return tl; }, nhom: function () { return nhom.map(function (x) { return x.h || (x.n ? 'net' : 'mh'); }); }, V: function () { return V; }, chonCongCu: chonCongCu, chenMau: chenMau, lenh: LENH, giaTri: function () { return giaTri; } };   // để kiểm thử
})();
