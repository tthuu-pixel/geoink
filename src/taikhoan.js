// Đăng nhập bằng tài khoản GeoLab (dùng chung với trang nckh-geolab.com) — KHÔNG bắt buộc.
//  - Mở app là vào thẳng bảng. Nút "Đăng nhập GeoLab" ở góc trên mở trang đăng nhập (có nút "Để sau").
//  - Chưa đăng nhập mà mở mô hình GeoLab: mở thẳng trang GeoLab, trang đó tự hỏi đăng nhập.
//  - "Ghi nhớ đăng nhập": lần sau mở thẳng vào bảng; app hỏi lại máy chủ, phiên hết hạn thì đăng nhập lại.
//    Mất mạng thì vẫn dùng tiếp bằng phiên đã ghi nhớ.
//  - Mở trang GeoLab từ app: gắn phiên lên đường dẫn (#p=…) để vào thẳng, không phải đăng nhập lại.
window.GI = window.GI || {};
GI.taiKhoan = (function () {
  var MT = window.mayTinh || null, KHOA = 'geoink_phien', WEB = 'https://nckh-geolab.com/', GIO_PHIEN_WEB = 12;
  var TEN_VAI_TRO = { admin: 'Quản trị', giaovien: 'Giáo viên', hocsinh: 'Học sinh' };
  var phien = null, khiDoi = [];
  function $(s) { return document.querySelector(s); }
  function doc() { try { return JSON.parse(localStorage.getItem(KHOA) || sessionStorage.getItem(KHOA) || 'null'); } catch (e) { return null; } }
  function ghi(p, nho) {
    try { localStorage.removeItem(KHOA); sessionStorage.removeItem(KHOA); if (p) (nho ? localStorage : sessionStorage).setItem(KHOA, JSON.stringify(p)); } catch (e) { }
  }
  function goi(hd, duLieu) {
    if (!MT || !MT.taiKhoan) return Promise.resolve({ ok: false, mang: true, loi: 'Chỉ đăng nhập được trong app GeoInk.' });
    return MT.taiKhoan(hd, Object.assign({ token: phien ? phien.token : '' }, duLieu || {}));
  }
  function thoat(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  // ---------- trang đăng nhập ----------
  function hienDangNhap(thongDiep) {
    var el = $('#dang-nhap'); el.classList.remove('an'); document.body.classList.add('chua-dang-nhap');
    var loi = $('#dn-loi'); loi.textContent = thongDiep || ''; loi.classList.toggle('hien', !!thongDiep);
    $('#dn-mk').value = ''; setTimeout(function () { ($('#dn-ten').value ? $('#dn-mk') : $('#dn-ten')).focus(); }, 50);
  }
  function anDangNhap() { $('#dang-nhap').classList.add('an'); document.body.classList.remove('chua-dang-nhap'); }
  function dangNhap(e) {
    if (e) e.preventDefault();
    var ten = $('#dn-ten').value.trim().toLowerCase(), mk = $('#dn-mk').value, nho = $('#dn-nho').checked, nut = $('#dn-nut'), loi = $('#dn-loi');
    if (!ten || !mk) { loi.textContent = 'Nhập tên đăng nhập và mật khẩu.'; loi.classList.add('hien'); return; }
    nut.disabled = true; nut.classList.add('dang'); loi.classList.remove('hien');
    goi('dangNhap', { ten: ten, matKhau: mk }).then(function (kq) {
      nut.disabled = false; nut.classList.remove('dang');
      if (!kq || !kq.ok) { loi.textContent = (kq && kq.loi) || 'Đăng nhập không thành công.'; loi.classList.add('hien'); $('#dn-mk').select(); return; }
      phien = { token: kq.token, ten: kq.ten || ten, hoTen: kq.hoTen || ten, vaiTro: kq.vaiTro || '', lop: kq.lop || '', luc: Date.now(), nho: nho };
      ghi(phien, nho); try { localStorage.setItem('geoink_ten_cu', phien.ten); } catch (er) { }
      anDangNhap(); veNguoiDung(); khiDoi.forEach(function (f) { f(phien); });
    });
  }
  function dangXuat() {
    dongMenu();
    var cu = phien; phien = null; ghi(null); veNguoiDung();
    if (cu) MT && MT.taiKhoan && MT.taiKhoan('dangXuat', { token: cu.token });
    khiDoi.forEach(function (f) { f(null); });
  }

  // ---------- người dùng trên thanh trên cùng ----------
  function chuCai(t) { var p = String(t || '?').trim().split(/\s+/); return (p.length > 1 ? p[p.length - 1].charAt(0) : p[0].charAt(0)).toUpperCase(); }
  function veNguoiDung() {
    var el = $('#nguoi-dung'); if (!el) return;
    if (!phien) {   // chưa đăng nhập: nút mời đăng nhập (chỉ trong app; mở bằng trình duyệt thì ẩn)
      el.classList.toggle('an', !MT); el.classList.add('chua'); el.textContent = 'Đăng nhập GeoLab'; el.title = 'Đăng nhập tài khoản GeoLab để mở mô hình không phải đăng nhập lại (không bắt buộc)'; return;
    }
    el.classList.remove('an', 'chua');
    el.innerHTML = '<span class="nd-chu">' + thoat(chuCai(phien.hoTen)) + '</span><span class="nd-ten">' + thoat(phien.hoTen) + '</span>';
    el.title = phien.hoTen + ' · ' + (TEN_VAI_TRO[phien.vaiTro] || '') + ' (tài khoản GeoLab)';
  }
  function dongMenu() { var m = $('#menu-nguoi-dung'); if (m) m.remove(); }
  function moMenu() {
    if ($('#menu-nguoi-dung')) return dongMenu();
    var r = $('#nguoi-dung').getBoundingClientRect(), m = document.createElement('div'); m.id = 'menu-nguoi-dung';
    m.innerHTML = '<div class="mnd-dau"><span class="nd-chu lon">' + thoat(chuCai(phien.hoTen)) + '</span><div><b>' + thoat(phien.hoTen) + '</b><small>' + thoat(phien.ten) + ' · ' + thoat(TEN_VAI_TRO[phien.vaiTro] || '') + (phien.lop ? ' · lớp ' + thoat(phien.lop) : '') + '</small></div></div>' +
      '<button data-mnd="geolab"><i data-bt="moHinh"></i>Mở GeoLab (đã đăng nhập)</button>' +
      '<button data-mnd="dangXuat" class="do"><i data-bt="dangXuat"></i>Đăng xuất</button>';
    document.body.appendChild(m);
    m.querySelectorAll('i[data-bt]').forEach(function (i) { i.innerHTML = GI.bieuTuong(i.dataset.bt, i.dataset.bt === 'moHinh'); });
    m.style.top = (r.bottom + 6) + 'px'; m.style.right = Math.max(8, window.innerWidth - r.right) + 'px';
    m.querySelector('[data-mnd="geolab"]').onclick = function () { dongMenu(); moTrang(WEB + 'thu-vien.html'); };
    m.querySelector('[data-mnd="dangXuat"]').onclick = dangXuat;
  }
  document.addEventListener('pointerdown', function (e) { if (!e.target.closest('#menu-nguoi-dung') && !e.target.closest('#nguoi-dung')) dongMenu(); });

  // ---------- đường dẫn sang GeoLab mang theo phiên ----------
  function maHoa(o) { return encodeURIComponent(btoa(unescape(encodeURIComponent(JSON.stringify(o))))); }
  function link(url) {
    if (!phien || !/^https:\/\/(www\.)?nckh-geolab\.com\//.test(url)) return url;
    var p = { token: phien.token, ten: phien.ten, hoTen: phien.hoTen, vaiTro: phien.vaiTro, lop: phien.lop, hetHan: Date.now() + GIO_PHIEN_WEB * 3600 * 1000 };
    return url.split('#')[0] + '#p=' + maHoa({ phien: p });
  }
  function moTrang(url) { url = link(url); if (MT) MT.moLink(url); else window.open(url, '_blank', 'noopener'); }

  // ---------- khởi động ----------
  function batDau() {
    $('#dn-form').addEventListener('submit', dangNhap);
    $('#dn-hien-mk').onclick = function () { var i = $('#dn-mk'); i.type = i.type === 'password' ? 'text' : 'password'; this.classList.toggle('bat', i.type === 'text'); i.focus(); };
    $('#nguoi-dung').onclick = function () { if (phien) moMenu(); else hienDangNhap(''); };
    $('#dn-bo-qua').onclick = anDangNhap;
    $('#dang-nhap').addEventListener('keydown', function (e) { if (e.key === 'Escape') anDangNhap(); });
    try { $('#dn-ten').value = localStorage.getItem('geoink_ten_cu') || ''; } catch (e) { }
    if (!MT) { veNguoiDung(); return; }   // mở bằng trình duyệt (chạy thử): không bắt đăng nhập
    phien = doc();
    if (!phien || !phien.token) { phien = null; veNguoiDung(); return; }   // không bắt đăng nhập: vào thẳng bảng
    veNguoiDung();
    // hỏi máy chủ phiên còn hợp lệ không (mất mạng thì vẫn dùng tiếp); hết hạn thì chỉ bỏ phiên, không chặn bảng
    goi('kiemTra').then(function (kq) {
      if (kq && kq.ok === false && !kq.mang) { phien = null; ghi(null); veNguoiDung(); }
    });
  }
  return { batDau: batDau, link: link, moTrang: moTrang, phien: function () { return phien; }, khiDoi: function (f) { khiDoi.push(f); }, dangXuat: dangXuat };
})();
