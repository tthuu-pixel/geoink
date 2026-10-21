// Thư viện sổ trên máy: mỗi sổ là một bảng GeoInk (nhiều trang), xếp theo project.
//   Lưu ở Tài liệu\GeoInk Thư viện:  chi-muc.json · so/<id>.geoink · anh/<id>.txt (ảnh bìa) · lich-su/<id>/<thời điểm>.geoink
//   Sổ đang mở tự lưu sau mỗi thay đổi; cứ ~10 phút giữ một bản trong Lịch sử phiên bản (tối đa 30 bản / sổ).
//   Xoá sổ, project → vào Thùng rác (lấy lại được; tự xoá hẳn sau 30 ngày).
window.GI = window.GI || {};
GI.thuVien = (function () {
  var MT = window.mayTinh || null;
  var PHUT_PHIEN_BAN = 10, SO_PHIEN_BAN = 30, NGAY_THUNG_RAC = 30;
  var app = null;            // các hàm của app.js: layNoiDung, anhBia, nap, thongBao, hoiBoThayDoi
  var chiMuc = null;         // { project: [{id, ten, tao, xoa}], so: [{id, ten, project, tao, sua, xoa}] }
  var loc = 'tatCa';         // 'tatCa' | 'khong' | 'rac' | id project
  var anhBo = {};            // ảnh bìa đã đọc

  // ---------- lưu trữ (Electron: tệp trên máy; trình duyệt: localStorage để chạy thử) ----------
  function kho(hd, duong, noiDung) {
    if (MT && MT.thuVien) return MT.thuVien(hd, duong, noiDung).then(function (kq) { if (!kq.ok) throw new Error(kq.loi); return kq; });
    try {
      var K = 'geoink_tv:';
      if (hd === 'doc') return Promise.resolve({ ok: true, noiDung: localStorage.getItem(K + duong) });
      if (hd === 'ghi') { localStorage.setItem(K + duong, noiDung); return Promise.resolve({ ok: true }); }
      if (hd === 'xoa') { Object.keys(localStorage).forEach(function (k) { if (k === K + duong || k.indexOf(K + duong + '/') === 0) localStorage.removeItem(k); }); return Promise.resolve({ ok: true }); }
      if (hd === 'ds') { var ds = []; Object.keys(localStorage).forEach(function (k) { if (k.indexOf(K + duong + '/') === 0) ds.push(k.slice((K + duong + '/').length).split('/')[0]); }); return Promise.resolve({ ok: true, ds: ds }); }
    } catch (e) { return Promise.reject(e); }
    return Promise.reject(new Error('Lệnh không hợp lệ'));
  }
  function napChiMuc() {
    if (chiMuc) return Promise.resolve(chiMuc);
    return kho('doc', 'chi-muc.json').then(function (kq) {
      try { chiMuc = JSON.parse(kq.noiDung || 'null'); } catch (e) { chiMuc = null; }
      if (!chiMuc || !Array.isArray(chiMuc.so)) chiMuc = { project: [], so: [] };
      chiMuc.project = chiMuc.project || [];
      // dọn thùng rác quá hạn
      var han = Date.now() - NGAY_THUNG_RAC * 864e5, bo = chiMuc.so.filter(function (s) { return s.xoa && s.xoa < han; });
      if (bo.length) { bo.forEach(function (s) { xoaTep(s.id); }); chiMuc.so = chiMuc.so.filter(function (s) { return bo.indexOf(s) < 0; }); }
      chiMuc.project = chiMuc.project.filter(function (p) { return !(p.xoa && p.xoa < han); });
      return chiMuc;
    });
  }
  function ghiChiMuc() { return kho('ghi', 'chi-muc.json', JSON.stringify(chiMuc)); }
  function xoaTep(id) { kho('xoa', 'so/' + id + '.geoink'); kho('xoa', 'anh/' + id + '.txt'); kho('xoa', 'lich-su/' + id); delete anhBo[id]; }
  function idMoi(t) { return t + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function timSo(id) { return chiMuc && chiMuc.so.filter(function (s) { return s.id === id; })[0]; }
  function timProject(id) { return chiMuc && chiMuc.project.filter(function (p) { return p.id === id; })[0]; }
  function hai(n) { return (n < 10 ? '0' : '') + n; }
  function tenTuDong() { var d = new Date(); return 'Sổ ' + d.getFullYear() + '-' + hai(d.getMonth() + 1) + '-' + hai(d.getDate()) + ' ' + hai(d.getHours()) + '.' + hai(d.getMinutes()); }
  function ngayVN(t) { var d = new Date(t); return d.getDate() + ' thg ' + (d.getMonth() + 1) + ', ' + d.getFullYear(); }
  function gioVN(t) { var d = new Date(t); return hai(d.getHours()) + ':' + hai(d.getMinutes()) + ' · ' + hai(d.getDate()) + '/' + hai(d.getMonth() + 1) + '/' + d.getFullYear(); }
  function thoat(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  // ---------- sổ đang mở ----------
  var soMo = null, dangLuu = false, choLai = false;
  function soDangMo() { return soMo; }
  function datSoMo(id) { soMo = id; }
  // Lưu sổ đang mở (tạo sổ mới nếu bảng chưa thuộc sổ nào). Trả về Promise.
  function luuSo(taoNeuChua) {
    if (!app) return Promise.resolve(false);
    if (dangLuu) { choLai = true; return Promise.resolve(false); }
    dangLuu = true;
    var nd = app.layNoiDung(), anh = app.anhBia(), soLuc = soMo;   // chụp nội dung ngay lúc gọi
    return napChiMuc().then(function () {
      var s = soLuc && timSo(soLuc);
      if (!s) {
        if (!taoNeuChua) return false;
        s = { id: idMoi('s'), ten: tenTuDong(), project: (loc !== 'tatCa' && loc !== 'khong' && loc !== 'rac' && timProject(loc)) ? loc : null, tao: Date.now(), sua: 0 };
        chiMuc.so.push(s); if (soMo === soLuc) soMo = s.id;
      }
      var luc = Date.now(), cu = s.banCuoi || 0;
      var viec = [kho('ghi', 'so/' + s.id + '.geoink', nd)];
      if (anh) { anhBo[s.id] = anh; viec.push(kho('ghi', 'anh/' + s.id + '.txt', anh)); }
      if (luc - cu > PHUT_PHIEN_BAN * 60e3) { s.banCuoi = luc; viec.push(kho('ghi', 'lich-su/' + s.id + '/' + luc + '.geoink', nd).then(function () { return donPhienBan(s.id); })); }
      s.sua = luc;
      viec.push(ghiChiMuc());
      return Promise.all(viec).then(function () { return true; });
    }).catch(function (e) { app.thongBao('Không lưu được vào thư viện: ' + e.message); return false; })
      .then(function (kq) { dangLuu = false; if (choLai) { choLai = false; return luuSo(taoNeuChua); } return kq; });
  }
  function donPhienBan(id) {
    return kho('ds', 'lich-su/' + id).then(function (kq) {
      var ds = (kq.ds || []).filter(function (t) { return /^\d+\.geoink$/.test(t); }).sort();
      return Promise.all(ds.slice(0, Math.max(0, ds.length - SO_PHIEN_BAN)).map(function (t) { return kho('xoa', 'lich-su/' + id + '/' + t); }));
    });
  }
  function moSo(id) {
    return kho('doc', 'so/' + id + '.geoink').then(function (kq) {
      if (!kq.noiDung) throw new Error('Không tìm thấy nội dung sổ');
      var s = timSo(id); soMo = id; app.nap(kq.noiDung, s); dong(); return true;
    }).catch(function (e) { app.thongBao('Không mở được sổ: ' + e.message); });
  }

  // ---------- giao diện ----------
  function $(s, g) { return (g || document).querySelector(s); }
  function moTV() {
    var el = $('#thu-vien'); el.classList.remove('an'); document.body.classList.add('dang-thu-vien');
    // lưu sổ đang mở trước để ảnh bìa, giờ sửa mới nhất
    var truoc = soMo && app.daSua() ? luuSo(false) : Promise.resolve();
    truoc.then(napChiMuc).then(function () { if (loc !== 'tatCa' && loc !== 'khong' && loc !== 'rac' && !timProject(loc)) loc = 'tatCa'; ve(); })
      .catch(function (e) { app.thongBao('Không mở được thư viện: ' + e.message); });
  }
  function dong() { $('#thu-vien').classList.add('an'); document.body.classList.remove('dang-thu-vien'); dongMenu(); }
  function dangMo() { return !$('#thu-vien').classList.contains('an'); }
  function soCon(f) { return chiMuc.so.filter(function (s) { return !s.xoa && f(s); }).length; }
  function prjSong() { return chiMuc.project.filter(function (p) { return !p.xoa; }); }
  var IC = {
    tatCa: '<svg viewBox="0 0 24 24"><rect x="3.5" y="4" width="3.5" height="16" rx=".6"/><rect x="8.5" y="4" width="3.5" height="16" rx=".6"/><path d="M13.6 5.6l3.2-.9 4 15-3.2.9z"/></svg>',
    khong: '<svg viewBox="0 0 24 24"><path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/></svg>',
    prj: '<svg viewBox="0 0 24 24"><path d="M3 6.5h6l2 2h10v11H3z"/></svg>',
    rac: '<svg viewBox="0 0 24 24"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6"/></svg>',
    them: '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
  };
  function ve() {
    var el = $('#thu-vien'), ps = prjSong();
    var muc = function (k, ic, ten, so, lop) { return '<button class="tv-muc' + (loc === k ? ' bat' : '') + (lop ? ' ' + lop : '') + '" data-loc="' + thoat(k) + '">' + ic + '<span>' + thoat(ten) + '</span>' + (so == null ? '' : '<b>' + so + '</b>') + '</button>'; };
    var trai = muc('tatCa', IC.tatCa, 'Tất cả sổ', soCon(function () { return true; })) +
      muc('khong', IC.khong, 'Không thuộc project', soCon(function (s) { return !s.project || !timProject(s.project) || timProject(s.project).xoa; })) +
      '<div class="tv-nhom">PROJECT</div>' +
      ps.map(function (p) { return muc(p.id, IC.prj, p.ten, soCon(function (s) { return s.project === p.id; }), 'tv-prj'); }).join('') +
      '<button class="tv-muc tv-them-prj" data-hd="themPrj">' + IC.them + '<span>Project mới</span></button>' +
      '<div class="tv-gian"></div>' + muc('rac', IC.rac, 'Thùng rác', chiMuc.so.filter(function (s) { return s.xoa; }).length + chiMuc.project.filter(function (p) { return p.xoa; }).length || null);
    var ds, tieuDe, rac = loc === 'rac';
    if (rac) { ds = chiMuc.so.filter(function (s) { return s.xoa; }); tieuDe = 'Thùng rác'; }
    else if (loc === 'tatCa') { ds = chiMuc.so.filter(function (s) { return !s.xoa; }); tieuDe = 'Tất cả sổ'; }
    else if (loc === 'khong') { ds = chiMuc.so.filter(function (s) { return !s.xoa && (!s.project || !timProject(s.project) || timProject(s.project).xoa); }); tieuDe = 'Không thuộc project'; }
    else { ds = chiMuc.so.filter(function (s) { return !s.xoa && s.project === loc; }); tieuDe = timProject(loc).ten; }
    ds.sort(function (a, b) { return (b.sua || b.tao) - (a.sua || a.tao); });
    var the = ds.map(function (s) {
      return '<div class="tv-so' + (s.id === soMo ? ' dang-mo' : '') + '" data-so="' + s.id + '"><div class="tv-bia">' + (anhBo[s.id] ? '<img src="' + anhBo[s.id] + '" alt="">' : '<span class="tv-cho"></span>') + (s.id === soMo ? '<i class="tv-nhan">Đang mở</i>' : '') + '</div>' +
        '<div class="tv-dong"><div><b title="' + thoat(s.ten) + '">' + thoat(s.ten) + '</b><small>' + (rac ? 'Xoá lúc ' + gioVN(s.xoa) : ngayVN(s.sua || s.tao)) + '</small></div><button class="tv-ba" data-menu="' + s.id + '" title="Tuỳ chọn">⋯</button></div></div>';
    }).join('');
    var prjRac = rac ? chiMuc.project.filter(function (p) { return p.xoa; }) : [];
    el.innerHTML = '<div class="tv-dau"><button class="tv-ve" data-hd="ve">‹ Về sổ</button><h1>Thư viện</h1><span class="gian"></span>' +
      '<button class="tv-nut" data-hd="thuMuc" title="Mở thư mục chứa thư viện trên máy">Mở thư mục</button></div>' +
      '<div class="tv-than"><nav class="tv-trai">' + trai + '</nav><section class="tv-phai">' +
      '<h2>' + thoat(tieuDe) + ' <small>' + ds.length + ' sổ</small>' + (!rac && loc !== 'tatCa' && loc !== 'khong' ? '<button class="tv-ba lon" data-menu-prj="' + loc + '" title="Tuỳ chọn project">⋯</button>' : '') + '</h2>' +
      (prjRac.length ? '<div class="tv-prj-rac">' + prjRac.map(function (p) { return '<div><span>' + IC.prj + thoat(p.ten) + ' <small>(project · xoá lúc ' + gioVN(p.xoa) + ')</small></span><button data-hd="khoiPhucPrj" data-id="' + p.id + '">Khôi phục</button><button class="do" data-hd="xoaHanPrj" data-id="' + p.id + '">Xoá hẳn</button></div>'; }).join('') + '</div>' : '') +
      '<div class="tv-luoi">' + (rac ? '' : '<button class="tv-so-moi" data-hd="soMoi"><span>' + IC.them + '</span>Sổ mới</button>') + the + '</div>' +
      (rac ? '<p class="tv-chu-y">Sổ và project trong Thùng rác tự xoá hẳn sau ' + NGAY_THUNG_RAC + ' ngày.</p>' : (!ds.length && loc !== 'tatCa' ? '' : '<p class="tv-chu-y">Trên máy tính, sổ và project bị xoá nằm trong Thùng rác, lấy lại được.</p>')) +
      '</section></div>';
    // nạp ảnh bìa còn thiếu
    ds.forEach(function (s) {
      if (anhBo[s.id] !== undefined) return; anhBo[s.id] = null;
      kho('doc', 'anh/' + s.id + '.txt').then(function (kq) { if (kq.noiDung) { anhBo[s.id] = kq.noiDung; var b = el.querySelector('[data-so="' + s.id + '"] .tv-bia'); if (b) b.innerHTML = '<img src="' + kq.noiDung + '" alt="">' + (s.id === soMo ? '<i class="tv-nhan">Đang mở</i>' : ''); } });
    });
  }
  // ---------- thao tác ----------
  function hoiTen(tieuDe, macDinh) { var t = window.prompt(tieuDe, macDinh || ''); return t == null ? null : t.trim(); }
  function xacNhan(cau) { return window.confirm(cau); }
  function taoSoMoi() {
    if (!app.hoiBoThayDoi()) return;
    var truoc = soMo && app.daSua() ? luuSo(false) : Promise.resolve();
    truoc.then(function () {
      app.moi(); soMo = null;
      return luuSo(true);
    }).then(function () { dong(); app.thongBao('Đã tạo ' + (timSo(soMo) || {}).ten + ' · tự lưu vào thư viện'); });
  }
  function bam(e) {
    var t = e.target.closest('[data-hd],[data-loc],[data-so],[data-menu],[data-menu-prj]'); if (!t || !dangMo()) return;
    if (t.dataset.menu) { e.stopPropagation(); return menuSo(t.dataset.menu, t); }
    if (t.dataset.menuPrj) { e.stopPropagation(); return menuPrj(t.dataset.menuPrj, t); }
    if (t.dataset.loc) { loc = t.dataset.loc; return ve(); }
    var hd = t.dataset.hd;
    if (hd === 've') return dong();
    if (hd === 'thuMuc') { if (MT) kho('moThuMuc', 'chi-muc.json'); else app.thongBao('Chạy thử trên trình duyệt: thư viện lưu trong trình duyệt'); return; }
    if (hd === 'soMoi') return taoSoMoi();
    if (hd === 'themPrj') { var ten = hoiTen('Tên project mới', ''); if (!ten) return; var p = { id: idMoi('p'), ten: ten, tao: Date.now() }; chiMuc.project.push(p); loc = p.id; ghiChiMuc(); return ve(); }
    if (hd === 'khoiPhucPrj') { var p2 = timProject(t.dataset.id), x = p2.xoa; delete p2.xoa; chiMuc.so.forEach(function (s) { if (s.project === p2.id && s.xoa === x) delete s.xoa; }); ghiChiMuc(); loc = p2.id; return ve(); }
    if (hd === 'xoaHanPrj') {
      var p3 = timProject(t.dataset.id); if (!xacNhan('Xoá hẳn project "' + p3.ten + '" và các sổ của nó trong Thùng rác? Không lấy lại được.')) return;
      chiMuc.so.filter(function (s) { return s.project === p3.id && s.xoa; }).forEach(function (s) { xoaTep(s.id); });
      chiMuc.so = chiMuc.so.filter(function (s) { return !(s.project === p3.id && s.xoa); }); chiMuc.project = chiMuc.project.filter(function (p) { return p !== p3; });
      chiMuc.so.forEach(function (s) { if (s.project === p3.id) s.project = null; });
      ghiChiMuc(); return ve();
    }
    if (t.dataset.so && loc !== 'rac') {
      var id = t.dataset.so; if (id === soMo) return dong();
      if (!app.hoiBoThayDoi()) return;
      (soMo && app.daSua() ? luuSo(false) : Promise.resolve()).then(function () { moSo(id); });
    }
  }
  var menuEl = null;
  function dongMenu() { if (menuEl) { menuEl.remove(); menuEl = null; } }
  function moMenu(nut, ds) {
    dongMenu(); menuEl = document.createElement('div'); menuEl.className = 'tv-menu';
    menuEl.innerHTML = ds.map(function (m, i) { return m === '-' ? '<hr>' : '<button data-i="' + i + '"' + (m.do ? ' class="do"' : '') + (m.tat ? ' disabled' : '') + '>' + thoat(m.ten) + '</button>'; }).join('');
    document.body.appendChild(menuEl);
    var r = nut.getBoundingClientRect(); menuEl.style.top = Math.min(r.bottom + 4, window.innerHeight - menuEl.offsetHeight - 8) + 'px'; menuEl.style.left = Math.max(8, Math.min(r.right - menuEl.offsetWidth, window.innerWidth - menuEl.offsetWidth - 8)) + 'px';
    menuEl.onclick = function (e) { var b = e.target.closest('button[data-i]'); if (!b) return; var m = ds[+b.dataset.i]; dongMenu(); m.lam(); };
  }
  function menuSo(id, nut) {
    var s = timSo(id);
    if (s.xoa) return moMenu(nut, [
      { ten: 'Khôi phục', lam: function () { delete s.xoa; if (s.project && timProject(s.project) && timProject(s.project).xoa) s.project = null; ghiChiMuc(); ve(); } },
      { ten: 'Xoá hẳn', do: true, lam: function () { if (!xacNhan('Xoá hẳn "' + s.ten + '"? Không lấy lại được.')) return; xoaTep(s.id); chiMuc.so = chiMuc.so.filter(function (x) { return x !== s; }); ghiChiMuc(); ve(); } }]);
    var chuyen = prjSong().filter(function (p) { return p.id !== s.project; }).map(function (p) { return { ten: '→ ' + p.ten, lam: function () { s.project = p.id; ghiChiMuc(); ve(); app.thongBao('Đã chuyển vào ' + p.ten); } }; });
    if (s.project) chuyen.push({ ten: '→ Không thuộc project', lam: function () { s.project = null; ghiChiMuc(); ve(); } });
    moMenu(nut, [
      { ten: 'Mở', lam: function () { var el = $('#thu-vien [data-so="' + id + '"]'); bam({ target: el }); } },
      { ten: 'Đổi tên', lam: function () { var ten = hoiTen('Tên sổ', s.ten); if (!ten) return; s.ten = ten; ghiChiMuc(); ve(); if (id === soMo) app.doiTen(); } },
      { ten: 'Nhân bản', lam: function () { kho('doc', 'so/' + id + '.geoink').then(function (kq) { var m = { id: idMoi('s'), ten: s.ten + ' (bản sao)', project: s.project, tao: Date.now(), sua: Date.now() }; chiMuc.so.push(m); return Promise.all([kho('ghi', 'so/' + m.id + '.geoink', kq.noiDung), anhBo[id] ? kho('ghi', 'anh/' + m.id + '.txt', anhBo[id]) : 0, ghiChiMuc()]).then(function () { anhBo[m.id] = anhBo[id]; ve(); }); }); } },
      { ten: 'Lịch sử phiên bản…', lam: function () { lichSu(s); } },
      '-'].concat(chuyen.length ? [{ ten: 'Chuyển đến project:', tat: true, lam: function () {} }].concat(chuyen, ['-']) : []).concat([
      { ten: 'Xoá (vào Thùng rác)', do: true, lam: function () { s.xoa = Date.now(); if (id === soMo) { app.moi(true); soMo = null; } ghiChiMuc(); ve(); app.thongBao('Đã chuyển "' + s.ten + '" vào Thùng rác'); } }]));
  }
  function menuPrj(id, nut) {
    var p = timProject(id);
    moMenu(nut, [
      { ten: 'Đổi tên project', lam: function () { var ten = hoiTen('Tên project', p.ten); if (!ten) return; p.ten = ten; ghiChiMuc(); ve(); } },
      { ten: 'Xoá project (vào Thùng rác)', do: true, lam: function () {
        var luc = Date.now(); p.xoa = luc; chiMuc.so.forEach(function (s) { if (s.project === p.id && !s.xoa) { s.xoa = luc; if (s.id === soMo) { app.moi(true); soMo = null; } } });
        loc = 'tatCa'; ghiChiMuc(); ve(); app.thongBao('Đã chuyển project "' + p.ten + '" vào Thùng rác'); } }]);
  }
  function lichSu(s) {
    kho('ds', 'lich-su/' + s.id).then(function (kq) {
      var ds = (kq.ds || []).filter(function (t) { return /^\d+\.geoink$/.test(t); }).map(function (t) { return +t.split('.')[0]; }).sort(function (a, b) { return b - a; });
      var hop = document.createElement('div'); hop.className = 'tv-hop';
      hop.innerHTML = '<div class="tv-hop-nd"><h3>Lịch sử phiên bản · ' + thoat(s.ten) + '</h3><p class="tv-mo-ta">Tự giữ một bản khoảng ' + PHUT_PHIEN_BAN + ' phút một lần khi đang sửa (tối đa ' + SO_PHIEN_BAN + ' bản). Khôi phục một bản sẽ mở nó thành sổ hiện tại; bản đang có vẫn được giữ lại trong lịch sử.</p>' +
        (ds.length ? '<div class="tv-ds-ban">' + ds.map(function (t) { return '<div><span>' + gioVN(t) + '</span><button data-ban="' + t + '">Khôi phục bản này</button></div>'; }).join('') + '</div>' : '<p class="tv-mo-ta"><i>Chưa có phiên bản nào.</i></p>') +
        '<div class="tv-hop-chan"><button data-dong>Đóng</button></div></div>';
      document.body.appendChild(hop);
      hop.onclick = function (e) {
        if (e.target === hop || e.target.hasAttribute('data-dong')) return hop.remove();
        var b = e.target.closest('[data-ban]'); if (!b) return;
        if (!xacNhan('Khôi phục "' + s.ten + '" về bản lúc ' + gioVN(+b.dataset.ban) + '?')) return;
        var luc = Date.now();
        kho('doc', 'so/' + s.id + '.geoink').then(function (cu) { return cu.noiDung ? kho('ghi', 'lich-su/' + s.id + '/' + luc + '.geoink', cu.noiDung) : 0; })
          .then(function () { return kho('doc', 'lich-su/' + s.id + '/' + b.dataset.ban + '.geoink'); })
          .then(function (kq2) { return kho('ghi', 'so/' + s.id + '.geoink', kq2.noiDung); })
          .then(function () { s.sua = luc; s.banCuoi = luc; delete anhBo[s.id]; return ghiChiMuc(); })
          .then(function () { hop.remove(); return moSo(s.id); })
          .then(function () { app.thongBao('Đã khôi phục bản lúc ' + gioVN(+b.dataset.ban)); });
      };
    });
  }
  function khoiTao(h) {
    app = h;
    $('#thu-vien').addEventListener('click', bam);
    document.addEventListener('pointerdown', function (e) { if (menuEl && !e.target.closest('.tv-menu')) dongMenu(); });
    napChiMuc().catch(function () { });
  }
  return { khoiTao: khoiTao, mo: moTV, dong: dong, dangMo: dangMo, luuSo: luuSo, soDangMo: soDangMo, datSoMo: datSoMo, tenSo: function () { var s = soMo && timSo(soMo); return s ? s.ten : null; } };
})();
