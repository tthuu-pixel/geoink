// Biểu tượng nhiều màu (SVG 24 × 24) kiểu GeoGebra và con trỏ chuột
//   điểm: chấm xanh viền đậm · nét: xám đen · đối tượng được tạo: đỏ · tô: hồng nhạt
window.GI = window.GI || {};
(function () {
  var XANH = '#2563EB', VIEN = '#1E3A8A', DEN = '#1F2937', DO = '#DC2626', TO = '#FCA5A5', VANG = '#F59E0B', LA = '#16A34A';
  function d(x, y, mau) { return '<circle cx="' + x + '" cy="' + y + '" r="2.7" fill="' + (mau || XANH) + '" stroke="' + VIEN + '" stroke-width="1"/>'; }
  function n(x1, y1, x2, y2, mau, w, dash) { return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + (mau || DEN) + '" stroke-width="' + (w || 1.8) + '" stroke-linecap="round"' + (dash ? ' stroke-dasharray="' + dash + '"' : '') + '/>'; }
  function p(dd, mau, w, to) { return '<path d="' + dd + '" fill="' + (to || 'none') + '" stroke="' + (mau || DEN) + '" stroke-width="' + (w || 1.8) + '" stroke-linecap="round" stroke-linejoin="round"/>'; }
  function tron(cx, cy, r, mau, w, to) { return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + (to || 'none') + '" stroke="' + (mau || DEN) + '" stroke-width="' + (w || 1.8) + '"/>'; }
  function chu(x, y, t, mau, co) { return '<text x="' + x + '" y="' + y + '" font-family="Arial,Liberation Sans,Helvetica,sans-serif" font-size="' + (co || 9) + '" fill="' + (mau || DEN) + '">' + t + '</text>'; }

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
    tay: '<g transform="rotate(-40 12 12)"><rect x="3.5" y="8" width="17" height="8.5" rx="2" fill="#F472B6"/><rect x="3.5" y="8" width="7" height="8.5" rx="2" fill="#F8FAFC"/><path d="M10.5 8v8.5" stroke="#9D174D" stroke-width="1"/><rect x="3.5" y="8" width="17" height="8.5" rx="2" fill="none" stroke="#9D174D" stroke-width="1.3"/><path d="M13 10.2h5.5" stroke="#FBCFE8" stroke-width="1.2" stroke-linecap="round"/></g><path d="M4 21.5h7" stroke="#94A3B8" stroke-width="1.4" stroke-linecap="round"/>',
    dq: '<g transform="rotate(40 12 12)"><rect x="9" y="1.2" width="6" height="11.5" rx="1.6" fill="#FACC15" stroke="#A16207" stroke-width="1"/><rect x="9" y="5" width="6" height="2" fill="#FDE68A"/><rect x="9" y="12.2" width="6" height="3.4" rx=".5" fill="#475569"/><path d="M9.7 15.6h4.6l-.9 4.3h-2.8z" fill="#FDE047" stroke="#A16207" stroke-width="1"/><path d="M10.6 19.9h2.8v1.1h-2.8z" fill="#EAB308"/></g><path d="M2.5 21.8h12.5" stroke="#FDE047" stroke-width="3.2" stroke-linecap="round"/>',
    chon: '<path d="M5.5 3.5L18 11.6l-5.7 1.5 3.4 6-2.4 1.4-3.4-6-4.4 4z" fill="#fff" stroke="#111827" stroke-width="1.6" stroke-linejoin="round"/>',
    keo: '<path d="M8 13V5.6a1.4 1.4 0 0 1 2.8 0V11M10.8 10.6V4.4a1.4 1.4 0 0 1 2.8 0v6.2M13.6 10.8V5.6a1.4 1.4 0 0 1 2.8 0v5.2M16.4 11.2V8.2a1.4 1.4 0 0 1 2.8 0v6.3c0 4-2.8 7-6.6 7-2.9 0-4.4-1.4-5.8-3.6L4.9 14.4a1.5 1.5 0 0 1 2.5-1.6L8 13.6" fill="#FDE7C8" stroke="#9A5B1F" stroke-width="1.4" stroke-linejoin="round"/>',
    toanManHinh: p('M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5', DEN, 2),
    // thư viện: ba cuốn sổ trên giá
    thuVien: '<rect x="3" y="4" width="4.2" height="16" rx=".8" fill="#2563EB"/><rect x="8" y="4" width="4.2" height="16" rx=".8" fill="#F59E0B"/><path d="M13.6 6.3l3.9-1.1 4 14.6-3.9 1.1z" fill="#DC2626"/><path d="M4.2 8h1.8M9.2 8h1.8" stroke="#fff" stroke-width="1.2"/><path d="M2 21h20" stroke="#334155" stroke-width="1.6" stroke-linecap="round"/>',
    // chèn khoảng trống: hai đường kẻ tách ra, mũi tên lên / xuống
    chenKhoang: p('M3 4.5h18M3 19.5h18', '#334155', 1.8) + p('M3 12h4M10 12h4M17 12h4', '#94A3B8', 1.6) + p('M12 6.5v3.2M12 14.3v3.2', '#2563EB', 2) + p('M9.8 8.4L12 6.2l2.2 2.2M9.8 15.6L12 17.8l2.2-2.2', '#2563EB', 2),
    che: '<rect x="3" y="4" width="18" height="16" rx="2" fill="#fff" stroke="#334155" stroke-width="1.5"/><path d="M6 8h12M6 11.5h7" stroke="#94A3B8" stroke-width="1.6" stroke-linecap="round"/><rect x="9" y="12.5" width="10.5" height="5.5" rx="1" fill="#DBEAFE" stroke="#2563EB" stroke-width="1.3" stroke-dasharray="2 1.5"/><path d="M12 15.3c1.2-1.4 3.3-1.4 4.5 0-1.2 1.4-3.3 1.4-4.5 0z" fill="none" stroke="#2563EB" stroke-width="1.1"/>',
        caiDatBut: p('M4 20l3.5-1 10-10-2.5-2.5-10 10z', '#2563EB', 1.8) + p('M15 6.5l2.5 2.5', '#2563EB', 1.8) + '<circle cx="18.5" cy="18.5" r="2.6" fill="none" stroke="#334155" stroke-width="1.5"/><path d="M18.5 14.6v1.3M18.5 21.1v1.3M14.6 18.5h1.3M21.1 18.5h1.3" stroke="#334155" stroke-width="1.5" stroke-linecap="round"/>',
    thuNho: tron(11, 11, 7, DEN, 2) + p('M8 11h6M21 21l-5-5', DEN, 2),
    phongTo: tron(11, 11, 7, DEN, 2) + p('M8 11h6M11 8v6M21 21l-5-5', DEN, 2),
    moi: '<path d="M6 2.5h8.5L19 7v14.5H6z" fill="#fff" stroke="#2563EB" stroke-width="1.6" stroke-linejoin="round"/>' + p('M12.5 10.5v7M9 14h7', LA, 2.2),
    themTrang: '<path d="M6 2.5h8.5L19 7v14.5H6z" fill="#fff" stroke="#2563EB" stroke-width="1.6" stroke-linejoin="round"/>' + p('M12.5 10.5v7M9 14h7', LA, 2.2),
    nhapTex: '<rect x="2" y="2" width="20" height="20" rx="5" fill="#DBEAFE" stroke="#2563EB" stroke-width="1.3"/><text x="12" y="10.4" text-anchor="middle" font-family="Times New Roman,serif" font-weight="700" font-size="7.4" fill="#1E3A8A">TeX</text><path d="M12 12.3v6.2M9.2 15.8l2.8 2.8 2.8-2.8" fill="none" stroke="#EA580C" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
    xuatTex: '<rect x="2" y="2" width="20" height="20" rx="5" fill="#DCFCE7" stroke="#16A34A" stroke-width="1.3"/><rect x="4.6" y="4.6" width="10.6" height="10.6" rx="1" fill="none" stroke="#15803D" stroke-width="1.1" stroke-dasharray="2 1.4"/><path d="M7 13l2.9-5.6L13 13z" fill="#fff" stroke="#15803D" stroke-width="1.1" stroke-linejoin="round"/><text x="16.3" y="20.4" text-anchor="middle" font-family="Times New Roman,serif" font-weight="700" font-size="6.2" fill="#166534">TeX</text>',
    capNhat: '<circle cx="12" cy="12" r="10" fill="#16A34A"/><path d="M12 17V7.5M7.8 11.2L12 7l4.2 4.2" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>',
    dangXuat: '<path d="M10 4H5.5A1.5 1.5 0 0 0 4 5.5v13A1.5 1.5 0 0 0 5.5 20H10" fill="none" stroke="#DC2626" stroke-width="1.8" stroke-linecap="round"/><path d="M11 12h9M16.5 8.5L20 12l-3.5 3.5" fill="none" stroke="#DC2626" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
    catHinh: '<rect x="2" y="2" width="20" height="20" rx="5" fill="#FCE7F3" stroke="#DB2777" stroke-width="1.3"/><rect x="5" y="5" width="14" height="10" rx="1" fill="none" stroke="#9D174D" stroke-width="1.1" stroke-dasharray="2 1.5"/><circle cx="8.3" cy="17.6" r="2.1" fill="#fff" stroke="#BE185D" stroke-width="1.4"/><circle cx="15.7" cy="17.6" r="2.1" fill="#fff" stroke="#BE185D" stroke-width="1.4"/><path d="M9.6 16.1L14.6 9.2M14.4 16.1L9.4 9.2" stroke="#BE185D" stroke-width="1.5" stroke-linecap="round"/>',
    tikz: '<rect x="2.5" y="4" width="19" height="16" rx="2.5" fill="#EEF2FF" stroke="#4F46E5" stroke-width="1.5"/><path d="M8 9l-3 3 3 3M16 9l3 3-3 3" fill="none" stroke="#4F46E5" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M13 8.5l-2 7" stroke="#DB2777" stroke-width="1.6" stroke-linecap="round"/>',
    anh: '<rect x="3" y="4.5" width="18" height="15" rx="2" fill="#E0F2FE" stroke="#0284C7" stroke-width="1.5"/><circle cx="8.5" cy="9.5" r="2" fill="#F59E0B"/><path d="M3.5 18l5.5-5.5 4 4 3-3 4.5 4.5" fill="#86EFAC" stroke="#16A34A" stroke-width="1.4" stroke-linejoin="round"/>',
    xoaTrang: p('M4 7h16M10 11v6M14 11v6', DO, 1.8) + p('M6 7l1 13h10l1-13M9 7V4h6v3', DO, 1.8),
    caiDat: tron(12, 12, 3, '#fff', 2) + p('M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1', '#fff', 2),
    xuong: p('M6 9l6 6 6-6', '#6B7280', 2),
    xoaX: p('M6 6l12 12M18 6L6 18', 'currentColor', 2.2),
    soDo: p('M3 18l6-11 6 11z', DEN, 1.6, '#FEE2E2') + chu(13.5, 10, '60°', DO, 7.5),
    truc: n(4, 20, 4, 3, DEN, 1.6) + n(4, 20, 21, 20, DEN, 1.6) + p('M2.3 5L4 3l1.7 2M19 18.3l2 1.7-2 1.7', DEN, 1.4) + p('M6 17c4-1 6-10 13-12', DO, 1.8),
    congThuc: '<rect x="2" y="2" width="20" height="20" rx="5" fill="#EDE9FE" stroke="#7C3AED" stroke-width="1.3"/><path d="M15.5 6.5H7.5l4.6 5.5-4.6 5.5h8" fill="none" stroke="#5B21B6" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/><text x="15.6" y="10.2" font-family="Arial" font-weight="700" font-size="5.6" fill="#EA580C">n</text>',
    mayTinh: '<rect x="4.5" y="1.5" width="15" height="21" rx="2.6" fill="#334155"/><rect x="6.5" y="3.6" width="11" height="5" rx="1" fill="#BBF7D0"/><path d="M8 6.2h5" stroke="#166534" stroke-width="1.1" stroke-linecap="round"/>' +
      '<circle cx="8" cy="11.8" r="1.15" fill="#F8FAFC"/><circle cx="12" cy="11.8" r="1.15" fill="#F8FAFC"/><circle cx="16" cy="11.8" r="1.15" fill="#F59E0B"/><circle cx="8" cy="15.3" r="1.15" fill="#F8FAFC"/><circle cx="12" cy="15.3" r="1.15" fill="#F8FAFC"/><circle cx="16" cy="15.3" r="1.15" fill="#F59E0B"/><circle cx="8" cy="18.8" r="1.15" fill="#F8FAFC"/><circle cx="12" cy="18.8" r="1.15" fill="#F8FAFC"/><rect x="14.9" y="17.7" width="2.2" height="2.2" rx=".6" fill="#22C55E"/>',
    dungCu: '<path d="M2.5 16.5a9.5 9.5 0 0 1 19 0z" fill="#FDE68A" fill-opacity=".9" stroke="#B45309" stroke-width="1.2" stroke-linejoin="round"/><path d="M5.6 16.5a6.4 6.4 0 0 1 12.8 0" fill="none" stroke="#B45309" stroke-width=".8"/>' +
      '<path d="M12 7v2.2M7.3 8.3l1 1.8M16.7 8.3l-1 1.8M4.2 12l1.9.9M19.8 12l-1.9.9" stroke="#92400E" stroke-width=".9" stroke-linecap="round"/><path d="M12 16.5l4.6-6.4" stroke="#DC2626" stroke-width="1.4" stroke-linecap="round"/><circle cx="12" cy="16.5" r="1.3" fill="#DC2626"/>' +
      '<rect x="2" y="18.6" width="20" height="3.6" rx=".8" fill="#93C5FD" stroke="#1D4ED8" stroke-width=".9"/><path d="M5 18.6v1.6M8 18.6v1M11 18.6v1.6M14 18.6v1M17 18.6v1.6M20 18.6v1" stroke="#1D4ED8" stroke-width=".7"/>',
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
    compa: C(20, 13, 9, R, 2.2) + D(20, 13) + L(6, 27.5, 15, 27.5) + D(6, 27.5) + D(15, 27.5),
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
    quay: L(8, 24, 28, 24, XAM, 1.4, '2 2') + L(8, 24, 19.5, 7.6, XAM, 1.4, '2 2') + P('M20 24A12 12 0 0 0 15.4 14.6', R, 2) + muiTen(14.9, 14.2, -145, R) + D(8, 24, '#3A3F47') + D(28, 24) + D(19.5, 7.6, R),
    tinhTien: d(4, 17) + d(14, 17, DO) + d(8, 9) + d(18, 9, DO) + n(10, 9, 15.5, 9, DEN, 1.4) + p('M14 7l2 2-2 2', DEN, 1.4),
    viTu: n(3, 20, 21, 4, DEN, 1.2, '2 2') + d(3, 20, '#111827') + d(10, 13.8) + d(19, 5.8, DO) + chu(14, 19, 'k', DEN, 9),
    thanhTruot: n(3, 15, 21, 15, DEN, 2) + '<circle cx="11" cy="15" r="3" fill="#2563EB" stroke="#1E3A8A" stroke-width="1"/>' + chu(5, 9, 'a = 2', DEN, 7.5),
    chu: '<text x="12" y="16.5" text-anchor="middle" font-family="Segoe UI,Arial" font-weight="700" font-size="10" fill="#111827">ABC</text>',
    xoa: '<path d="M9 4h6M5 7h14M7 7l1 13h8l1-13" fill="#FEE2E2" stroke="#DC2626" stroke-width="1.6" stroke-linejoin="round"/>' + p('M10.5 10.5v6M13.5 10.5v6', DO, 1.4),
    hamSo: n(3, 21, 3, 3, DEN, 1.4) + n(3, 21, 21, 21, DEN, 1.4) + p('M4 18c3-1 4-12 8-12s4 10 9 10', DO, 2),
    moHinh: '<path d="M12 2.8l8 4.5v9.2L12 21l-8-4.5V7.3z" fill="#BFDBFE" stroke="#1D4ED8" stroke-width="1.4" stroke-linejoin="round"/><path d="M12 12l8-4.7M12 12L4 7.3M12 12v9" stroke="#1D4ED8" stroke-width="1.4"/><path d="M12 12L4 7.3 12 2.8l8 4.5z" fill="#DBEAFE" stroke="#1D4ED8" stroke-width="1.4" stroke-linejoin="round"/>',
  };
  // ----- Hàng 2: biểu tượng kiểu GeoGebra, vẽ trên lưới 32 × 32 cho nét -----
  var X = '#2F6FD8', XV = '#0E2A5C', K = '#22272E', R = '#E0352B', RT = 'rgba(224,53,43,.22)', NAU = '#8A4B2A', NAUT = '#EDBFA6', XAM = '#8D97A5';
  var FONT = "Arial,'Liberation Sans',Helvetica,sans-serif";
  function D(x, y, mau, r) { return '<circle cx="' + x + '" cy="' + y + '" r="' + (r || 2.7) + '" fill="' + (mau || X) + '" stroke="' + XV + '" stroke-width="1.2"/>'; }
  function L(x1, y1, x2, y2, mau, w, dash) { return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + (mau || K) + '" stroke-width="' + (w || 2.2) + '" stroke-linecap="round"' + (dash ? ' stroke-dasharray="' + dash + '"' : '') + '/>'; }
  function P(dd, mau, w, to, dash) { return '<path d="' + dd + '" fill="' + (to || 'none') + '" stroke="' + (mau || K) + '" stroke-width="' + (w || 2.2) + '" stroke-linecap="round" stroke-linejoin="round"' + (dash ? ' stroke-dasharray="' + dash + '"' : '') + '/>'; }
  function C(cx, cy, r, mau, w, to) { return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + (to || 'none') + '" stroke="' + (mau || K) + '" stroke-width="' + (w || 2.2) + '"/>'; }
  function T(x, y, t, mau, co, kieu, giua) { return '<text x="' + x + '" y="' + y + '"' + (giua ? ' text-anchor="middle"' : '') + ' font-family="' + FONT + '"' + (kieu === 'nghieng' ? ' font-style="italic"' : '') + (kieu === 'dam' ? ' font-weight="700"' : '') + ' font-size="' + (co || 12) + '" fill="' + (mau || K) + '">' + t + '</text>'; }
  function muiTen(x, y, goc, mau) { return '<path d="M0 0 L-6 -3.6 L-6 3.6 Z" fill="' + (mau || K) + '" transform="translate(' + x + ' ' + y + ') rotate(' + goc + ')"/>'; }
  function to24(k) { return '<g transform="scale(1.3333)">' + B[k] + '</g>'; }
  var B32 = {
    chon: '<path d="M8 4v21.5l5.4-4.9 3.9 8 3.4-1.6-3.9-7.9h7.3z" fill="#fff" stroke="' + K + '" stroke-width="2" stroke-linejoin="round"/>',
    diem: D(11, 21, X, 3.3) + T(16.5, 14.5, 'A', X, 14),
    diemTren: P('M5 25L13 6l14 8-6 13z', K, 2, '#F6E3D8') + D(9, 15.5),
    ganDiem: P('M4 27C11 23 20 13 28 5', K, 2.2) + D(10, 22.6) + P('M14 20.5l6 3', XAM, 1.6, null, '2 2.4') + D(23, 25, R),
    giao: L(4, 8, 28, 24) + L(4, 26, 28, 6) + D(16, 16, R),
    trungDiem: L(5, 25, 27, 7, XAM, 1.6, '2.5 2.5') + D(5, 25) + D(27, 7) + D(16, 16, R),
    duong: L(2, 28, 30, 4) + D(10, 21.1) + D(22, 10.9),
    doan: L(6, 25, 26, 7, K, 2.4) + D(6, 25) + D(26, 7),
    doanCoDinh: L(6, 25, 26, 7, K, 2.4) + D(6, 25) + D(26, 7, R) + T(5, 14, 'a', R, 13),
    tia: L(6, 25, 30, 4) + D(6, 25) + D(17, 15.4),
    gapKhuc: P('M4 24L11 8l9 16 8-15', K, 2.2) + D(4, 24) + D(11, 8) + D(20, 24) + D(28, 9),
    vuongGoc: L(2, 23, 30, 23) + L(14, 3, 14, 30, R, 2.4) + P('M14 16.5h6.5V23', R, 1.8) + D(14, 9),
    songSong: L(2, 24, 30, 16) + L(2, 13, 30, 5, R, 2.4) + D(10, 10.7),
    trungTruc: L(5, 22, 27, 10) + L(10, 4.5, 22, 27.5, R, 2.4) + D(5, 22) + D(27, 10),
    phanGiac: L(5, 26, 29, 26) + L(5, 26, 17, 4) + L(5, 26, 29, 11.8, R, 2.4) + D(5, 26) + D(17, 4) + D(27, 26),
    daGiac: P('M5 25L12 6l15 6-5 15z', NAU, 2, NAUT) + D(5, 25) + D(12, 6) + D(27, 12) + D(22, 27),
    daGiacDeu: P('M16 5.5l10.5 7.6-4 12.4h-13l-4-12.4z', NAU, 2, NAUT) + D(16, 5.5) + D(26.5, 13.1) + D(22.5, 25.5) + D(9.5, 25.5) + D(5.5, 13.1),
    tron: C(16, 16, 11) + D(16, 16) + D(23.8, 23.8),
    tronBanKinh: C(16, 16, 11) + L(16, 16, 23.8, 8.2, R, 2) + D(16, 16) + T(19.5, 21.5, 'r', R, 11),
    compa: C(20, 13, 9, R, 2.2) + D(20, 13) + L(6, 27.5, 15, 27.5) + D(6, 27.5) + D(15, 27.5),
    tron3Diem: C(16, 16, 11) + D(6.5, 10.5) + D(26.5, 12.6) + D(12.2, 26.3),
    banNguyet: P('M5 21A11 11 0 0 1 27 21', K, 2.2) + L(5, 21, 27, 21, XAM, 1.4, '2.5 2.5') + D(5, 21) + D(27, 21),
    cungTam: L(9, 23, 25, 23, XAM, 1.3, '2 2') + L(9, 23, 9, 7, XAM, 1.3, '2 2') + P('M25 23A16 16 0 0 0 9 7', K, 2.2) + D(9, 23, '#3A3F47') + D(25, 23) + D(9, 7),
    cung3Diem: P('M5.2 18.1A11 11 0 0 1 26.3 16.2', K, 2.2) + D(5.2, 18.1) + D(16, 9) + D(26.3, 16.2),
    quatTam: P('M8 25h19A19 19 0 0 0 17.5 8.6z', NAU, 2, NAUT) + D(8, 25, '#3A3F47') + D(27, 25) + D(17.5, 8.6),
    quat3Diem: P('M16 24L3.8 19.6A13 13 0 0 1 28.2 19.6z', NAU, 2, NAUT) + D(3.8, 19.6) + D(16, 11) + D(28.2, 19.6),
    goc: L(5, 26, 29, 26) + L(5, 26, 20, 6) + P('M15 26A10 10 0 0 0 11 18', R, 1.8) + T(17, 23, 'α', R, 12) + D(5, 26) + D(29, 26) + D(20, 6),
    gocChoTruoc: L(5, 26, 29, 26) + L(5, 26, 20, 6) + P('M5 26h10A10 10 0 0 0 11 18z', R, 1.4, RT) + T(15.5, 22.5, '45°', R, 9.5, 'dung') + D(5, 26) + D(29, 26) + D(20, 6, R),
    gocVuong: L(6, 26, 29, 26) + L(6, 26, 6, 4) + P('M6 16h10v10', R, 2) + D(6, 26) + D(29, 26) + D(6, 4),
    doDai: L(5, 24, 27, 24) + D(5, 24) + D(27, 24) + L(7, 12, 25, 12, R, 1.5) + muiTen(5.5, 12, 180, R) + muiTen(26.5, 12, 0, R) + L(5, 8, 5, 16, R, 1.2) + L(27, 8, 27, 16, R, 1.2) + T(16, 9, 'cm', R, 8.5, 'dung', 1),
    dienTich: P('M4 27l6-12 7 5 11-15v22z', '#1D4ED8', 2, '#A9C9F7') + T(4, 11, 'S', '#1D4ED8', 13),
    dxTruc: L(7, 3, 25, 29) + L(8, 19, 21.6, 9.6, XAM, 1.4, '2 2.2') + D(8, 19) + D(21.6, 9.6, R),
    dxTam: L(6, 24, 26, 8, XAM, 1.4, '2 2.2') + D(6, 24) + D(16, 16, '#3A3F47') + D(26, 8, R),
    nghichDao: C(12, 20, 9.5, K, 2) + L(12, 20, 26, 4, XAM, 1.3, '2 2') + D(12, 20, '#3A3F47', 2.1) + D(16.5, 14.9) + D(26, 4, R),
    quay: L(8, 24, 28, 24, XAM, 1.4, '2 2') + L(8, 24, 19.5, 7.6, XAM, 1.4, '2 2') + P('M20 24A12 12 0 0 0 15.4 14.6', R, 2) + muiTen(14.9, 14.2, -145, R) + D(8, 24, '#3A3F47') + D(28, 24) + D(19.5, 7.6, R),
    tinhTien: P('M3 28h9l-5-8z', NAU, 1.8, NAUT) + P('M18 15h9l-5-8z', R, 1.8, RT) + L(9, 21, 19.5, 13.3, K, 1.8) + muiTen(21, 12.2, -36, K),
    viTu: L(4, 28, 29, 5, XAM, 1.4, '2.2 2.2') + D(4, 28, '#3A3F47') + D(13, 19.7) + D(26, 7.8, R) + T(19, 28, 'k', K, 14),
    thanhTruot: T(16, 12.5, 'a = 2', K, 11, 'dung', 1) + L(4, 22, 28, 22, K, 2) + C(13, 22, 3.8, XV, 1.3, X),
    diChuyen: P('M16 5v22M5 16h22', K, 2.4) + muiTen(16, 3, -90) + muiTen(16, 29, 90) + muiTen(3, 16, 180) + muiTen(29, 16, 0),
    chu: T(16, 21, 'ABC', K, 12.5, 'dung', 1),
    elip: '<ellipse cx="16" cy="16" rx="13" ry="8.5" transform="rotate(-25 16 16)" fill="none" stroke="' + K + '" stroke-width="2.2"/>' + D(9.2, 19.2) + D(22.8, 12.8) + D(22.4, 23.4),
    hypebol: P('M3 4Q13 16 3 28', K, 2.2) + P('M29 4Q19 16 29 28', K, 2.2) + D(16, 16, '#3A3F47', 2.4) + D(6.4, 16) + D(25.6, 16),
    parabol: P('M4 4Q16 40 28 4', K, 2.2) + L(3, 29, 29, 29, R, 2) + D(16, 13),
    xoa: '<g transform="rotate(-35 16 16)"><rect x="5" y="10.5" width="22" height="11" rx="2.2" fill="#F9A8D4" stroke="#BE185D" stroke-width="1.6"/><rect x="5" y="10.5" width="8.5" height="11" rx="2.2" fill="#fff" stroke="#BE185D" stroke-width="1.6"/></g>' + L(15, 28.5, 28, 28.5, XAM, 1.6),
  };
  // các kiểu kí hiệu góc: n nét cung, có / không có gạch
  function iconGoc(n, gach) {
    var g = L(4, 26, 29, 26) + L(4, 26, 20, 5), a = Math.atan2(-21, 16);
    for (var i = 0; i < n; i++) { var r = 9 + i * 3.4; g += P('M' + (4 + r) + ' 26A' + r + ' ' + r + ' 0 0 0 ' + (4 + r * Math.cos(a)).toFixed(2) + ' ' + (26 + r * Math.sin(a)).toFixed(2), R, 1.8); }
    if (gach) { var m = a / 2, r1 = 6, r2 = 9 + (n - 1) * 3.4 + 4; g += L(4 + r1 * Math.cos(m), 26 + r1 * Math.sin(m), 4 + r2 * Math.cos(m), 26 + r2 * Math.sin(m), R, 1.8); }
    return g + D(4, 26) + D(29, 26) + D(20, 5);
  }
  B32.goc2 = iconGoc(2); B32.goc3 = iconGoc(3); B32.gocGach1 = iconGoc(1, true); B32.gocGach2 = iconGoc(2, true);
  // ----- Nhóm hình không gian (nét liền: cạnh thấy, nét đứt: cạnh khuất) -----
  function NL(dd) { return P(dd, K, 1.9); }
  function ND(dd) { return P(dd, K, 1.5, null, '2.4 2'); }
  function d2(x, y) { return D(x, y, X, 2.2); }
  B32.k_hop = NL('M4 13h17v14H4zM4 13l7-6h17l-7 6M28 7v14l-7 6') + ND('M4 27l7-6h17M11 21V7') + d2(4, 27) + d2(21, 27) + d2(4, 13);
  B32.k_lapPhuong = NL('M5 11h15v16H5zM5 11l6-6h16l-7 6M27 5v16l-7 6') + ND('M5 27l6-6h16M11 21V5') + d2(5, 27) + d2(20, 27);
  B32.k_lang3 = NL('M5 9v17M24 9v17M15 13v17M5 9L15 13 24 9zM5 26l10 4 9-4') + ND('M5 26h19') + d2(5, 26) + d2(15, 30) + d2(24, 26);
  B32.k_lang4 = NL('M4 12h16v16H4zM4 12l7-6h17l-8 6M28 6v16l-8 6') + ND('M4 28l7-6h17M11 22V6') + d2(4, 28) + d2(20, 28);
  B32.k_chop3 = NL('M16 4L4 25M16 4l12 21M16 4l-2 25M4 25l10 4 14-4') + ND('M4 25h24') + d2(16, 4) + d2(4, 25) + d2(14, 29) + d2(28, 25);
  B32.k_chop4 = NL('M15 3L3 26M15 3l5 23M15 3l13 15M3 26h17l8-8') + ND('M3 26l8-8h17M15 3l-4 15') + d2(15, 3) + d2(3, 26) + d2(20, 26);
  B32.k_tru = '<ellipse cx="16" cy="8" rx="10" ry="3.6" fill="none" stroke="' + K + '" stroke-width="1.9"/>' + NL('M6 8v17M26 8v17M6 25a10 3.6 0 0 0 20 0') + ND('M6 25a10 3.6 0 0 1 20 0M16 8v17h10') + d2(16, 8) + d2(16, 25);
  B32.k_non = NL('M16 4L5 24M16 4l11 20M5 24a11 4 0 0 0 22 0') + ND('M5 24a11 4 0 0 1 22 0M16 4v20h11') + d2(16, 4) + d2(16, 24);
  // dựng tự do (bấm đỉnh), có mũi tên xoay
  function muiXoay() { return P('M22 27.5a5.5 5.5 0 1 0 -5 -3', K, 1.5) + P('M15.4 22.2l1.8 2.6 2.4-1.9', K, 1.5); }
  B32.k_dungChop = NL('M13 3L3 18M13 3l10 9M13 3l-2 16M3 18l8 1 12-7') + ND('M3 18l12-6h8') + d2(13, 3) + d2(3, 18) + d2(11, 19) + d2(23, 12) + muiXoay();
  B32.k_dungLang = NL('M3 7l7 4 11-4M3 7v11l7 4 11-4V7M10 11v11') + ND('M3 18l11-4 7 0M14 3v11') + NL('M3 7l11-4 7 4') + d2(3, 7) + d2(10, 11) + d2(21, 7) + muiXoay();
  B32.k_cau = C(16, 16, 12, K, 1.9) + NL('M4 16a12 4 0 0 0 24 0') + ND('M4 16a12 4 0 0 1 24 0M16 16h12') + d2(16, 16);
  // đồ thị hàm số: hệ trục có mũi tên, đường thẳng xanh, parabol đỏ
  B32.doThi = P('M3 22h25M10 29V4', K, 1.7) + muiTen(29.5, 22, 0) + muiTen(10, 2.5, -90) + P('M4 28L26 6', X, 2.3) + P('M4 7.5Q10 34 17 7.5', R, 2.3);
  // ----- Nhóm đường tròn -----
  function d3(x, y, m) { return D(x, y, m || X, 2.3); }
  B32.m_noiTiep = C(16, 16, 12, K, 1.8) + NL('M12.9 4.4L5.6 22 26.4 22z') + d3(12.9, 4.4) + d3(5.6, 22) + d3(26.4, 22) + d3(16, 16, '#3A3F47');
  B32.m_catHaiCanh = C(16, 20, 11, K, 1.8) + NL('M11 4L5 20 27 20zM11 4l16 16') + d3(11, 4) + d3(5, 20) + d3(27, 20) + d3(7.3, 13.8, R) + d3(19.5, 12.5, R);
  B32.m_duongKinh = C(16, 16, 12, K, 1.8) + NL('M4 16h24') + d3(4, 16) + d3(28, 16) + d3(16, 16, '#3A3F47');
  B32.m_veDuongKinh = C(16, 16, 12, K, 1.8) + P('M7 8.5l18 15', R, 2) + d3(7, 8.5) + d3(25, 23.5, R) + d3(16, 16, '#3A3F47');
  B32.m_tiepTuyen1 = C(12, 18, 9, K, 1.8) + NL('M12 18h18M12 18l4.5-7.8L30 18') + P('M14.6 13.4l2.2 1.2 1.2-2.2', R, 1.3) + d3(12, 18, '#3A3F47') + d3(16.5, 10.2, R) + d3(30, 18);
  B32.m_tiepTuyen2 = C(12, 16, 9, K, 1.8) + NL('M12 16h18M30 16L16.5 8.2M30 16l-13.5 7.8') + d3(12, 16, '#3A3F47') + d3(16.5, 8.2, R) + d3(16.5, 23.8, R) + d3(30, 16);
  B32.m_tiepTuyenChung = C(10, 18, 7.5, K, 1.8) + C(24, 20, 5, K, 1.8) + P('M7.5 10.9L22.4 15.2', R, 2) + d3(10, 18, '#3A3F47') + d3(24, 20, '#3A3F47');
  // ----- Nhóm hình phẳng -----
  function DG(dd, ps) { return P(dd, NAU, 1.8, NAUT) + ps.map(function (q) { return d3(q[0], q[1]); }).join(''); }
  B32.p_tamGiac = DG('M12 5L4 26h24z', [[12, 5], [4, 26], [28, 26]]);
  B32.p_tamGiacCan = DG('M16 4L6 27h20z', [[16, 4], [6, 27], [26, 27]]) + L(9.6, 15, 12.4, 16.4, NAU, 1.3) + L(19.6, 16.4, 22.4, 15, NAU, 1.3);
  B32.p_tamGiacDeu = DG('M16 5L4 26h24z', [[16, 5], [4, 26], [28, 26]]);
  B32.p_tamGiacVuong = DG('M5 5v21h22z', [[5, 5], [5, 26], [27, 26]]) + P('M5 21h5v5', R, 1.4);
  B32.p_hcn = DG('M4 9h24v15H4z', [[4, 9], [28, 9], [28, 24], [4, 24]]);
  B32.p_hv = DG('M6 6h20v20H6z', [[6, 6], [26, 6], [26, 26], [6, 26]]);
  B32.p_hbh = DG('M10 8h19l-7 16H3z', [[10, 8], [29, 8], [22, 24], [3, 24]]);
  B32.p_thoi = DG('M16 3l11 13-11 13L5 16z', [[16, 3], [27, 16], [16, 29], [5, 16]]);
  B32.p_thang = DG('M10 8h12l7 16H3z', [[10, 8], [22, 8], [29, 24], [3, 24]]);
  B32.p_thangCan = DG('M10 8h12l6 16H4z', [[10, 8], [22, 8], [28, 24], [4, 24]]);
  B32.p_thangVuong = DG('M5 8h14l9 16H5z', [[5, 8], [19, 8], [28, 24], [5, 24]]);
  B32.p_lucGiac = DG('M10 4.5h12l6 11.5-6 11.5H10L4 16z', [[10, 4.5], [22, 4.5], [28, 16], [22, 27.5], [10, 27.5], [4, 16]]);
  // ----- Nhóm đường đặc biệt trong tam giác -----
  function TG() { return NL('M12 4L3 27h26z'); }
  B32.d_trungTuyen = TG() + P('M12 4l4 23', R, 2) + L(8.5, 25, 8.5, 29, R, 1.2) + L(22.5, 25, 22.5, 29, R, 1.2) + d3(12, 4) + d3(3, 27) + d3(29, 27) + d3(16, 27, R);
  B32.d_trongTam = TG() + P('M12 4l4 23M3 27l17.5-11.5M29 27L7.5 15.5', R, 1.1, null, '2 1.6') + d3(12, 4) + d3(3, 27) + d3(29, 27) + D(14.7, 19.3, R, 2.6);
  B32.d_duongCao = TG() + P('M12 4v23', R, 2) + P('M12 22.5h4.5v4.5', R, 1.3) + d3(12, 4) + d3(3, 27) + d3(29, 27) + d3(12, 27, R);
  B32.d_trucTam = TG() + P('M12 4v23M3 27L19.8 14.6M29 27L6.5 18.2', R, 1.1, null, '2 1.6') + d3(12, 4) + d3(3, 27) + d3(29, 27) + D(12, 20.4, R, 2.6);
  B32.d_phanGiac = TG() + C(13.5, 20.5, 5.6, R, 1.4) + P('M12 4l3 23M3 27l20-11', R, 1.2) + d3(12, 4) + d3(3, 27) + d3(29, 27) + d3(13.5, 20.5, R);
  B32.d_trungTruc = C(16, 18, 13, R, 1.3) + TG() + P('M16 30V8', R, 1.3) + d3(12, 4) + d3(3, 27) + d3(29, 27) + d3(16, 18, R);
  B32.d_trungBinh = TG() + P('M7.5 15.5h13', R, 2) + d3(12, 4) + d3(3, 27) + d3(29, 27) + d3(7.5, 15.5, R) + d3(20.5, 15.5, R);
  // Logo GeoLab (giống trang web nckh-geolab.com)
  var LOGO_GEOLAB = '<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><rect x="1" y="1" width="38" height="38" rx="10" fill="#2451C7"/>' +
    '<path d="M11 15 L22 10 L30 15 L30 27 L19 31 L11 27 Z" fill="#fff" fill-opacity=".16" stroke="#fff" stroke-width="1.8" stroke-linejoin="round"/>' +
    '<path d="M11 15 L19 19 L30 15 M19 19 L19 31" fill="none" stroke="#fff" stroke-width="1.8" stroke-linejoin="round"/>' +
    '<path d="M22 10 L22 22 L11 27 M22 22 L30 27" fill="none" stroke="#fff" stroke-width="1.2" stroke-dasharray="2 2" opacity=".75"/></svg>';
  B32.moHinh = to24('moHinh');
  GI.BIEU_TUONG_CC = B;
  // biểu tượng hàng GeoGebra: nét mảnh (0,7 lần), khung nhìn sát hơn để hình to hơn
  function svg32(k) { return '<svg viewBox="1 1 30 30" xmlns="http://www.w3.org/2000/svg">' + B32[k].replace(/stroke-width="([\d.]+)"/g, function (m, w) { return 'stroke-width="' + (+w * 0.7).toFixed(2) + '"'; }) + '</svg>'; }
  // Icon mẫu hình kiểu logo GeoLab: ô vuông bo góc tô một màu, hình vẽ nét trắng
  var MAU_NHOM = { k: '#7C3AED', m: '#0D9488', p: '#EA580C', d: '#DB2777' };
  function iconMau(k) {
    var mau = MAU_NHOM[k.charAt(0)], g = B32[k]
      .replace(/<circle([^>]*?)fill="(?!none)[^"]*"([^>]*?)stroke="[^"]*"([^>]*?)stroke-width="[^"]*"/g, '<circle$1fill="#fff"$2stroke="none"$3stroke-width="0"')
      .replace(/stroke="#[0-9A-Fa-f]{3,6}"/g, 'stroke="#fff"')
      .replace(/fill="(#EDBFA6|#F6E3D8|#A9C9F7|rgba\(224,53,43,\.22\))"/g, 'fill="#fff" fill-opacity=".2"')
      .replace(/stroke-dasharray="([^"]*)"/g, 'stroke-dasharray="$1" stroke-opacity=".8"')
      .replace(/stroke-width="([\d.]+)"/g, function (m, w) { return 'stroke-width="' + Math.max(0.9, +w * 0.85).toFixed(2) + '"'; })
      .replace(/<text([^>]*?)fill="[^"]*"/g, '<text$1fill="#fff"')
      .replace(/(<circle[^>]*?)r="([\d.]+)"([^>]*?fill="#fff")/g, function (m, a1, r, a2) { return a1 + 'r="' + Math.min(+r, 1.6) + '"' + a2; });
    return '<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><rect x="1" y="1" width="38" height="38" rx="10" fill="' + mau + '"/>' +
      '<g transform="translate(5.6 5.6) scale(0.9)">' + g + '</g></svg>';
  }
  GI.bieuTuong = function (k, hang2) {
    if (k === 'moHinh' && hang2) return LOGO_GEOLAB;
    if (/^[kmpd]_/.test(k) && B32[k]) return iconMau(k);
    if (hang2 && B32[k]) return svg32(k);
    if (B32[k] && !B[k]) return svg32(k);
    return '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">' + (B[k] || '') + '</svg>';
  };

  // ----- Con trỏ chuột (vẽ ra PNG để mọi máy đều hiển thị) -----
  GI.CON_TRO = {};
  function taoConTro(ten, svg, kt, hx, hy, duPhong) {
    GI.CON_TRO[ten] = duPhong;
    var img = new Image();
    img.onload = function () {
      function anh(k) { var c = document.createElement('canvas'); c.width = kt * k; c.height = kt * k; c.getContext('2d').drawImage(img, 0, 0, kt * k, kt * k); return c.toDataURL('image/png'); }
      var mot = anh(1), hai = anh(2);
      // màn hình phóng to (125%, 150%…) dùng ảnh 2x cho nét; máy không hỗ trợ image-set thì dùng ảnh thường
      var thu = document.createElement('div'), coBo = 'image-set(url("' + hai + '") 2x, url("' + mot + '") 1x) ' + hx + ' ' + hy + ', ' + duPhong;
      thu.style.cursor = coBo;
      GI.CON_TRO[ten] = thu.style.cursor ? coBo : 'url(' + mot + ') ' + hx + ' ' + hy + ', ' + duPhong;
      if (GI.khiCoConTro) GI.khiCoConTro();
    };
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="' + kt * 2 + '" height="' + kt * 2 + '">' + svg + '</svg>');
  }
  // bút chì: đầu ngòi ở góc dưới trái
  taoConTro('but', '<g transform="translate(-1.5 1.5)">' + BUT_CHI + '</g>', 48, 5, 42, 'crosshair');
  taoConTro('dq', '<g transform="translate(1 -1)">' + B.dq.replace(/<path d="M2\.5 21\.8.*$/, '') + '</g>', 32, 7, 26, 'crosshair');
  // chữ thập đen viền trắng (dễ thấy trên nền trắng lẫn nền tối)
  var THAP = '<path d="M12 2v8M12 14v8M2 12h8M14 12h8" stroke="#fff" stroke-width="4" stroke-linecap="round"/><path d="M12 2.5v7.5M12 14v7.5M2.5 12h7.5M14 12h7.5" stroke="#111827" stroke-width="1.8" stroke-linecap="round"/><circle cx="12" cy="12" r="1.3" fill="#111827" stroke="#fff" stroke-width=".8"/>';
  taoConTro('thap', THAP, 24, 12, 12, 'crosshair');
})();
