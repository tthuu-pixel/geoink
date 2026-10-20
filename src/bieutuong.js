// Biểu tượng nhiều màu (SVG 24 × 24) kiểu GeoGebra và con trỏ chuột
//   điểm: chấm xanh viền đậm · nét: xám đen · đối tượng được tạo: đỏ · tô: hồng nhạt
window.GI = window.GI || {};
(function () {
  var XANH = '#2563EB', VIEN = '#1E3A8A', DEN = '#1F2937', DO = '#DC2626', TO = '#FCA5A5', VANG = '#F59E0B', LA = '#16A34A';
  function d(x, y, mau) { return '<circle cx="' + x + '" cy="' + y + '" r="2.7" fill="' + (mau || XANH) + '" stroke="' + VIEN + '" stroke-width="1"/>'; }
  function n(x1, y1, x2, y2, mau, w, dash) { return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + (mau || DEN) + '" stroke-width="' + (w || 1.8) + '" stroke-linecap="round"' + (dash ? ' stroke-dasharray="' + dash + '"' : '') + '/>'; }
  function p(dd, mau, w, to) { return '<path d="' + dd + '" fill="' + (to || 'none') + '" stroke="' + (mau || DEN) + '" stroke-width="' + (w || 1.8) + '" stroke-linecap="round" stroke-linejoin="round"/>'; }
  function tron(cx, cy, r, mau, w, to) { return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + (to || 'none') + '" stroke="' + (mau || DEN) + '" stroke-width="' + (w || 1.8) + '"/>'; }
  function chu(x, y, t, mau, co) { return '<text x="' + x + '" y="' + y + '" font-family="Cambria Math,Times New Roman,serif" font-style="italic" font-weight="700" font-size="' + (co || 9) + '" fill="' + (mau || DEN) + '">' + t + '</text>'; }

  // Cây bút chì (thân xanh, đầu tẩy cam, gỗ vàng, ngòi đen) — giống hình mẫu
  var BUT_CHI = '<g transform="rotate(45 12 12)">' +
    '<rect x="9" y="0.6" width="6" height="4.6" rx="2.6" fill="#FF6B57"/>' +
    '<rect x="9" y="4.4" width="6" height="2.8" fill="#3E5367"/>' +
    '<rect x="9" y="7.2" width="2" height="10" fill="#4FC3F7"/><rect x="11" y="7.2" width="2" height="10" fill="#9BE0FA"/><rect x="13" y="7.2" width="2" height="10" fill="#2AA3D3"/>' +
    '<path d="M9 17.2 L15 17.2 L12 22.6 Z" fill="#FFD45C"/><path d="M12 17.2 L15 17.2 L12 22.6 Z" fill="#FBE3A0"/>' +
    '<path d="M10.95 20.7 L13.05 20.7 L12 22.6 Z" fill="#2F3E4E"/></g>';

  var B = {
    // ----- hàng 1 -----
    menu: p('M4 6h16M4 12h16M4 18h16', DEN, 2),
    mo: '<path d="M2.5 6.5a1.5 1.5 0 0 1 1.5-1.5h5l2 2h8a1.5 1.5 0 0 1 1.5 1.5V9H2.5z" fill="#F7B731"/><path d="M2.5 9h19l-1.6 9.2a1.5 1.5 0 0 1-1.5 1.3H4.1a1.5 1.5 0 0 1-1.5-1.3z" fill="#FBD155"/>',
    luu: '<rect x="3" y="3" width="18" height="18" rx="2.5" fill="#2563EB"/><rect x="7" y="3" width="10" height="6.5" rx="1" fill="#DBEAFE"/><rect x="13.2" y="4.2" width="2" height="4" fill="#2563EB"/><rect x="6" y="13" width="12" height="8" rx="1" fill="#fff"/><path d="M8 16h8M8 18.5h6" stroke="#93C5FD" stroke-width="1.2"/>',
    hoanTac: p('M9 14L4 9l5-5', '#2563EB', 2.2) + p('M4 9h11a5 5 0 0 1 0 10h-3', '#2563EB', 2.2),
    lamLai: p('M15 14l5-5-5-5', '#2563EB', 2.2) + p('M20 9H9a5 5 0 0 0 0 10h3', '#2563EB', 2.2),
    pdf: '<path d="M6 2.5h8.5L19 7v14.5H6z" fill="#fff" stroke="#DC2626" stroke-width="1.6" stroke-linejoin="round"/><path d="M14.5 2.5V7H19" fill="#FECACA" stroke="#DC2626" stroke-width="1.6" stroke-linejoin="round"/><rect x="3" y="11" width="13" height="7" rx="1.6" fill="#DC2626"/><text x="9.5" y="16.6" text-anchor="middle" font-family="Segoe UI,Arial" font-weight="800" font-size="5.6" fill="#fff">PDF</text>',
    but: BUT_CHI,
    tay: '<g transform="rotate(-40 12 12)"><rect x="4" y="8" width="16" height="9" rx="2" fill="#F9A8D4"/><rect x="4" y="8" width="7" height="9" rx="2" fill="#fff" stroke="#DB2777" stroke-width="1.2"/><rect x="4" y="8" width="16" height="9" rx="2" fill="none" stroke="#DB2777" stroke-width="1.4"/></g>',
    dq: '<g transform="rotate(40 12 12)"><rect x="9" y="1.5" width="6" height="11" rx="1.5" fill="#FACC15" stroke="#A16207" stroke-width="1"/><rect x="9" y="12" width="6" height="3.5" fill="#64748B"/><path d="M9.6 15.5h4.8l-1 4.6h-2.8z" fill="#FDE047" stroke="#A16207" stroke-width="1"/></g><path d="M3 21.5h12" stroke="#FDE047" stroke-width="3" stroke-linecap="round" opacity=".9"/>',
    chon: '<path d="M5.5 3.5L18 11.6l-5.7 1.5 3.4 6-2.4 1.4-3.4-6-4.4 4z" fill="#fff" stroke="#111827" stroke-width="1.6" stroke-linejoin="round"/>',
    keo: '<path d="M8 13V5.6a1.4 1.4 0 0 1 2.8 0V11M10.8 10.6V4.4a1.4 1.4 0 0 1 2.8 0v6.2M13.6 10.8V5.6a1.4 1.4 0 0 1 2.8 0v5.2M16.4 11.2V8.2a1.4 1.4 0 0 1 2.8 0v6.3c0 4-2.8 7-6.6 7-2.9 0-4.4-1.4-5.8-3.6L4.9 14.4a1.5 1.5 0 0 1 2.5-1.6L8 13.6" fill="#FDE7C8" stroke="#9A5B1F" stroke-width="1.4" stroke-linejoin="round"/>',
    toanManHinh: p('M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5', DEN, 2),
    thuNho: tron(11, 11, 7, DEN, 2) + p('M8 11h6M21 21l-5-5', DEN, 2),
    phongTo: tron(11, 11, 7, DEN, 2) + p('M8 11h6M11 8v6M21 21l-5-5', DEN, 2),
    moi: '<path d="M6 2.5h8.5L19 7v14.5H6z" fill="#fff" stroke="#2563EB" stroke-width="1.6" stroke-linejoin="round"/>' + p('M12.5 10.5v7M9 14h7', LA, 2.2),
    themTrang: '<path d="M6 2.5h8.5L19 7v14.5H6z" fill="#fff" stroke="#2563EB" stroke-width="1.6" stroke-linejoin="round"/>' + p('M12.5 10.5v7M9 14h7', LA, 2.2),
    anh: '<rect x="3" y="4.5" width="18" height="15" rx="2" fill="#E0F2FE" stroke="#0284C7" stroke-width="1.5"/><circle cx="8.5" cy="9.5" r="2" fill="#F59E0B"/><path d="M3.5 18l5.5-5.5 4 4 3-3 4.5 4.5" fill="#86EFAC" stroke="#16A34A" stroke-width="1.4" stroke-linejoin="round"/>',
    xoaTrang: p('M4 7h16M10 11v6M14 11v6', DO, 1.8) + p('M6 7l1 13h10l1-13M9 7V4h6v3', DO, 1.8),
    caiDat: tron(12, 12, 3, '#fff', 2) + p('M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1', '#fff', 2),
    xuong: p('M6 9l6 6 6-6', '#6B7280', 2),
    xoaX: p('M6 6l12 12M18 6L6 18', 'currentColor', 2.2),
    soDo: p('M3 18l6-11 6 11z', DEN, 1.6, '#FEE2E2') + chu(13.5, 10, '60°', DO, 7.5),
    truc: n(4, 20, 4, 3, DEN, 1.6) + n(4, 20, 21, 20, DEN, 1.6) + p('M2.3 5L4 3l1.7 2M19 18.3l2 1.7-2 1.7', DEN, 1.4) + p('M6 17c4-1 6-10 13-12', DO, 1.8),
    // ----- hàng 2: hình học -----
    diem: d(9, 14) + chu(13, 10, 'A', VIEN, 10),
    diemTren: '<path d="M3 17L10 5l11 7-6 9z" fill="#F5D0C5" stroke="#9A3412" stroke-width="1.4" stroke-linejoin="round"/>' + d(11, 13) + chu(13.5, 11, 'A', VIEN, 8),
    ganDiem: p('M3 20c5-2 10-8 18-16', DEN, 1.6) + d(6, 18.4, DO) + p('M9 14l7-6', DEN, 1.6, null) + p('M14 6l3 1.6-1.4 3', DEN, 1.6) + d(18, 5, DO),
    giao: n(3, 6, 21, 18) + p('M3 20c5-1 12-9 17-17', DEN, 1.8) + d(12.6, 12.4, DO),
    trungDiem: d(4, 18) + d(20, 6) + d(12, 12, DO) + n(7, 15.7, 9.5, 13.9, DEN, 1.2, '1.5 1.5') + n(14.5, 10.1, 17, 8.3, DEN, 1.2, '1.5 1.5'),
    duong: n(2, 21, 22, 3) + d(8, 15.6) + d(16, 8.4),
    doan: n(4.5, 18.5, 19.5, 5.5, DO, 2) + d(4.5, 18.5) + d(19.5, 5.5),
    doanCoDinh: n(4.5, 18.5, 19.5, 5.5, DO, 2) + d(4.5, 18.5) + d(19.5, 5.5, DO) + chu(5, 9, 'a', DO, 9),
    tia: n(4.5, 18.5, 22, 3.5) + d(4.5, 18.5) + d(13, 11.2),
    gapKhuc: p('M3 17l6-10 6 11 6-12', DO, 1.8) + d(3, 17) + d(9, 7) + d(15, 18) + d(21, 6),
    vuongGoc: n(2, 17, 22, 12) + n(9.5, 3, 13.5, 21, DO, 2) + d(10.7, 8.5) + p('M12.2 15.1l3.1-.8.8 3.1', DEN, 1.2),
    songSong: n(2, 18, 22, 12) + n(2, 11, 22, 5, DO, 2) + d(8, 9.2),
    trungTruc: n(4, 16, 20, 8, DEN, 1.6) + d(4, 16) + d(20, 8) + n(8, 3, 16, 21, DO, 2),
    phanGiac: n(4, 20, 21, 20) + n(4, 20, 14, 4) + n(4, 20, 21, 10.5, DO, 2) + d(4, 20) + d(14, 4) + d(19, 20),
    daGiac: p('M4 18L11 4l9 7-4 9z', DO, 1.8, TO) + d(4, 18) + d(11, 4) + d(20, 11) + d(16, 20),
    daGiacDeu: p('M12 3l8.5 6.2-3.2 10H6.7l-3.2-10z', DO, 1.8, TO) + d(12, 3) + d(20.5, 9.2) + d(17.3, 19.2) + d(6.7, 19.2) + d(3.5, 9.2),
    tron: tron(12, 12, 8.5, DEN, 1.8) + d(12, 12) + d(18, 18),
    tronBanKinh: tron(12, 12, 8.5, DEN, 1.8) + d(12, 12) + n(12, 12, 18, 6, DO, 1.6),
    compa: tron(14, 13, 7.5, DO, 1.8) + d(14, 13) + n(3, 21, 9, 21, DEN, 1.6) + d(3, 21) + d(9, 21),
    tron3Diem: tron(12, 12, 8.5, DEN, 1.8) + d(5, 7.5) + d(19.6, 9) + d(9, 20),
    banNguyet: p('M4 16a8 8 0 0 1 16 0', DEN, 1.8) + d(4, 16) + d(20, 16),
    cungTam: p('M19 12a7 7 0 0 0-10.5-6', DEN, 1.8) + d(12, 12) + d(19, 12) + d(8.5, 6),
    cung3Diem: p('M4 15a8.5 8.5 0 0 1 15.5-7', DEN, 1.8) + d(4, 15) + d(9, 6.4) + d(19.5, 8),
    quatTam: p('M6 19L4.2 7.2A12 12 0 0 1 16.8 6z', DEN, 1.6, TO) + d(6, 19) + d(4.2, 7.2) + d(16.8, 6),
    quat3Diem: p('M12 15L4 10a9 9 0 0 1 16 0z', DEN, 1.6, TO) + d(4, 10) + d(12, 4.5) + d(20, 10),
    goc: p('M4 20h16M4 20L15 6', DEN, 1.6) + p('M4 20l7.5 0A7.5 7.5 0 0 0 8.6 14.1z', DO, 1.2, TO) + d(4, 20) + d(20, 20) + d(15, 6) + chu(14.5, 17, 'α', DO, 8),
    gocChoTruoc: p('M4 20h16M4 20L15 6', DEN, 1.6) + p('M4 20l7.5 0A7.5 7.5 0 0 0 8.6 14.1z', DO, 1.2, TO) + d(4, 20) + d(20, 20) + d(15, 6, DO) + chu(15, 17, '45°', DO, 6.5),
    gocVuong: p('M4 20h16M4 20V4', DEN, 1.6) + p('M4 13.5h6.5V20', DO, 1.8) + d(4, 20) + d(20, 20) + d(4, 4),
    doDai: '<rect x="2" y="7" width="20" height="10" rx="1.5" fill="#FEF3C7" stroke="#B45309" stroke-width="1.2"/>' + p('M5 7v3.5M8 7v2M11 7v3.5M14 7v2M17 7v3.5M20 7v2', '#B45309', 1) + chu(6, 16, 'cm', '#B45309', 6.5),
    dienTich: '<path d="M3 20l5-9 5 4 8-11v16z" fill="#93C5FD" stroke="#1D4ED8" stroke-width="1.4" stroke-linejoin="round"/>' + chu(3, 9, 'cm²', '#1D4ED8', 6.5),
    dxTruc: n(4, 3, 20, 21) + d(7, 15) + d(17, 9, DO),
    dxTam: d(5, 18) + d(12, 12, '#111827') + d(19, 6, DO),
    nghichDao: p('M3 21a17 17 0 0 1 18-18', DEN, 1.6) + d(7, 16) + d(15, 8, DO),
    quay: p('M12 4a8 8 0 1 1-7.4 5', DEN, 1.5, null) + p('M3 6l1.6 3.4 3.3-1.6', DEN, 1.5) + d(12, 12, '#111827') + d(12, 4) + d(20, 12, DO),
    tinhTien: d(4, 17) + d(14, 17, DO) + d(8, 9) + d(18, 9, DO) + n(10, 9, 15.5, 9, DEN, 1.4) + p('M14 7l2 2-2 2', DEN, 1.4),
    viTu: n(3, 20, 21, 4, DEN, 1.2, '2 2') + d(3, 20, '#111827') + d(10, 13.8) + d(19, 5.8, DO) + chu(14, 19, 'k', DEN, 9),
    thanhTruot: n(3, 15, 21, 15, DEN, 2) + '<circle cx="11" cy="15" r="3" fill="#2563EB" stroke="#1E3A8A" stroke-width="1"/>' + chu(5, 9, 'a = 2', DEN, 7.5),
    chu: '<text x="12" y="16.5" text-anchor="middle" font-family="Segoe UI,Arial" font-weight="700" font-size="10" fill="#111827">ABC</text>',
    xoa: '<path d="M9 4h6M5 7h14M7 7l1 13h8l1-13" fill="#FEE2E2" stroke="#DC2626" stroke-width="1.6" stroke-linejoin="round"/>' + p('M10.5 10.5v6M13.5 10.5v6', DO, 1.4),
    hamSo: n(3, 21, 3, 3, DEN, 1.4) + n(3, 21, 21, 21, DEN, 1.4) + p('M4 18c3-1 4-12 8-12s4 10 9 10', DO, 2),
    moHinh: '<path d="M12 2.8l8 4.5v9.2L12 21l-8-4.5V7.3z" fill="#BFDBFE" stroke="#1D4ED8" stroke-width="1.4" stroke-linejoin="round"/><path d="M12 12l8-4.7M12 12L4 7.3M12 12v9" stroke="#1D4ED8" stroke-width="1.4"/><path d="M12 12L4 7.3 12 2.8l8 4.5z" fill="#DBEAFE" stroke="#1D4ED8" stroke-width="1.4" stroke-linejoin="round"/>',
  };
  GI.BIEU_TUONG_CC = B;
  GI.bieuTuong = function (k) { return '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">' + (B[k] || '') + '</svg>'; };

  // ----- Con trỏ chuột (vẽ ra PNG để mọi máy đều hiển thị) -----
  GI.CON_TRO = {};
  function taoConTro(ten, svg, kt, hx, hy, duPhong) {
    GI.CON_TRO[ten] = duPhong;
    var img = new Image();
    img.onload = function () {
      var c = document.createElement('canvas'); c.width = kt; c.height = kt; c.getContext('2d').drawImage(img, 0, 0, kt, kt);
      GI.CON_TRO[ten] = 'url(' + c.toDataURL('image/png') + ') ' + hx + ' ' + hy + ', ' + duPhong;
      if (GI.khiCoConTro) GI.khiCoConTro();
    };
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="' + kt + '" height="' + kt + '">' + svg + '</svg>');
  }
  // bút chì: đầu ngòi ở góc dưới trái
  taoConTro('but', '<g transform="translate(-1.5 1.5)">' + BUT_CHI + '</g>', 32, 3, 28, 'crosshair');
  taoConTro('dq', '<g transform="translate(1 -1)">' + B.dq.replace(/<path d="M3 21.5h12".*$/, '') + '</g>', 32, 7, 26, 'crosshair');
  // chữ thập đen viền trắng (dễ thấy trên nền trắng lẫn nền tối)
  var THAP = '<path d="M12 2v8M12 14v8M2 12h8M14 12h8" stroke="#fff" stroke-width="4" stroke-linecap="round"/><path d="M12 2.5v7.5M12 14v7.5M2.5 12h7.5M14 12h7.5" stroke="#111827" stroke-width="1.8" stroke-linecap="round"/><circle cx="12" cy="12" r="1.3" fill="#111827" stroke="#fff" stroke-width=".8"/>';
  taoConTro('thap', THAP, 24, 12, 12, 'crosshair');
})();
