// Đồng bộ thư viện sổ với Google Drive của giáo viên (máy tính Windows ↔ máy tính bảng Android).
//   Trên Drive: thư mục "GeoInk – Thư viện sổ" gồm
//     thu-vien.json        chỉ mục chung: project, sổ (tên, project, thùng rác…), danh sách sổ đã xoá hẳn
//     <tên sổ>.geoink      nội dung từng sổ (appProperties: geoink=so, soId)
//     <id>.bia.txt         ảnh bìa (appProperties: geoink=bia, soId)
//   Quyền drive.file: GeoInk chỉ thấy các tệp do chính nó tạo.
//   Trên máy: dong-bo.json trong thư mục thư viện ghi lần đồng bộ trước của từng sổ (id tệp Drive, md5, giờ sửa).
//   Nội dung: sổ chỉ đổi ở một bên thì chép sang bên kia; đổi ở cả hai bên thì giữ cả hai (bản trên Drive thành
//   sổ mới "… (bản từ máy khác)"). Tên, project, thùng rác: lấy bên đổi sau (trường ct).
window.GI = window.GI || {};
GI.dongBo = (function () {
  'use strict';
  var MT = window.mayTinh || null;
  var API = 'https://www.googleapis.com/drive/v3/files', UP = 'https://www.googleapis.com/upload/drive/v3/files';
  var MIME_TM = 'application/vnd.google-apps.folder', TEN_TM = 'GeoInk – Thư viện sổ';
  var NGAY_GIU_XOA = 120, GIAY_CHO = 15, PHUT_DINH_KY = 5;
  var tv = null;                              // phần trong của thư viện (GI.thuVien.noiBo)
  var tt = { cauHinh: false, ketNoi: false, email: '', dang: false, loi: '', luc: 0 };
  var chay = null, chayLai = false, hen = null, nutEl = null, menuEl = null;

  function coDung() { return !!(MT && MT.ggGoi); }
  function thoat(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function hai(n) { return (n < 10 ? '0' : '') + n; }
  function gio(t) { var d = new Date(t); return hai(d.getHours()) + ':' + hai(d.getMinutes()); }
  function thongBao(s) { if (tv && tv.app) tv.app.thongBao(s); }

  // ---------- gọi Google Drive ----------
  function loiDrive(r) {
    var t = String(r.text || '');
    try { var j = JSON.parse(t); if (j && j.error) t = j.error.message || t; } catch (e) { }
    var e = new Error(r.canDangNhap ? 'Cần kết nối lại Google Drive' : r.status ? 'Google Drive báo lỗi ' + r.status + ': ' + t.slice(0, 160) : 'Không có mạng hoặc không kết nối được Google Drive');
    e.status = r.status; e.canDangNhap = !!r.canDangNhap; return e;
  }
  function goi(method, url, body, headers) {
    return MT.ggGoi({ method: method, url: url, body: body == null ? null : body, headers: headers || {} }).then(function (r) {
      if (!r || !(r.status >= 200 && r.status < 300)) throw loiDrive(r || {});
      return r;
    });
  }
  function goiJson(method, url, obj) {
    return goi(method, url, obj == null ? null : JSON.stringify(obj), obj == null ? {} : { 'Content-Type': 'application/json; charset=UTF-8' })
      .then(function (r) { return r.text ? JSON.parse(r.text) : {}; });
  }
  function q(s) { return encodeURIComponent(s); }
  function timThuMuc() {
    return goiJson('GET', API + '?spaces=drive&fields=files(id)&q=' + q("mimeType='" + MIME_TM + "' and appProperties has { key='geoink' and value='thuVien' } and trashed=false")).then(function (k) {
      if (k.files && k.files.length) return k.files[0].id;
      return goiJson('POST', API + '?fields=id', { name: TEN_TM, mimeType: MIME_TM, appProperties: { geoink: 'thuVien' } }).then(function (f) { return f.id; });
    });
  }
  function dsTep(thuMuc) {
    var kq = [];
    function trang(tok) {
      return goiJson('GET', API + '?spaces=drive&pageSize=1000&fields=' + q('nextPageToken,files(id,name,md5Checksum,appProperties)') + '&q=' + q("'" + thuMuc + "' in parents and trashed=false") + (tok ? '&pageToken=' + q(tok) : ''))
        .then(function (k) { kq = kq.concat(k.files || []); return k.nextPageToken ? trang(k.nextPageToken) : kq; });
    }
    return trang(null);
  }
  function taiVe(id) { return goi('GET', API + '/' + id + '?alt=media').then(function (r) { return r.text; }); }
  // Tải tệp chữ lên Drive (id rỗng: tạo mới). Tệp lớn (sổ có PDF) tải kiểu resumable.
  function taiLen(id, meta, noiDung, mime) {
    mime = mime || 'text/plain';
    var duoi = '?fields=id,md5Checksum&uploadType=';
    if (noiDung.length < 3e6) {
      var B = 'geoink' + Math.random().toString(36).slice(2);
      var than = '--' + B + '\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n' + JSON.stringify(meta) + '\r\n--' + B + '\r\nContent-Type: ' + mime + '; charset=UTF-8\r\n\r\n' + noiDung + '\r\n--' + B + '--';
      return goi(id ? 'PATCH' : 'POST', UP + (id ? '/' + id : '') + duoi + 'multipart', than, { 'Content-Type': 'multipart/related; boundary=' + B }).then(function (r) { return JSON.parse(r.text); });
    }
    return goi(id ? 'PATCH' : 'POST', UP + (id ? '/' + id : '') + duoi + 'resumable', JSON.stringify(meta), { 'Content-Type': 'application/json; charset=UTF-8', 'X-Upload-Content-Type': mime + '; charset=UTF-8' })
      .then(function (r) { if (!r.location) throw new Error('Google Drive không trả địa chỉ tải lên'); return goi('PUT', r.location, noiDung, { 'Content-Type': mime + '; charset=UTF-8' }); })
      .then(function (r) { return JSON.parse(r.text); });
  }
  function boVaoRac(id) { return id ? goiJson('PATCH', API + '/' + id + '?fields=id', { trashed: true }).catch(function () { }) : Promise.resolve(); }
  function tenTep(s) { return String(s.ten || 'Sổ').replace(/[\\/:*?"<>|]+/g, '-').trim() + '.geoink'; }
  function chuoi(ds, f) { return ds.reduce(function (p, x) { return p.then(function () { return f(x); }); }, Promise.resolve()); }

  // ---------- một lần đồng bộ ----------
  var META_SO = ['ten', 'project', 'xoa', 'ct'], META_PRJ = ['ten', 'xoa', 'ct'];
  function chepMeta(dich, nguon, ds) { ds.forEach(function (k) { if (nguon[k] == null) delete dich[k]; else dich[k] = nguon[k]; }); }
  function thucHien() {
    var L, st, thuMuc, fChiMuc = null, fSo = {}, fBia = {}, R, doiL = false, xung = [], soMoMoi = null, conViec = false;
    return Promise.all([tv.napChiMuc(), tv.kho('doc', 'dong-bo.json')]).then(function (a) {
      L = a[0]; try { st = JSON.parse(a[1].noiDung || 'null'); } catch (e) { st = null; }
      if (!st || !st.so) st = { so: {} };
      return timThuMuc();
    }).then(function (id) {
      if (st.thuMuc !== id) st = { thuMuc: id, so: {} };   // thư mục trên Drive mới / bị xoá: đồng bộ lại từ đầu
      thuMuc = id; return dsTep(id);
    }).then(function (ds) {
      ds.forEach(function (f) {
        var a = f.appProperties || {};
        if (a.geoink === 'chiMuc') fChiMuc = fChiMuc || f;
        else if (a.geoink === 'so' && a.soId) fSo[a.soId] = f;
        else if (a.geoink === 'bia' && a.soId) fBia[a.soId] = f;
      });
      return fChiMuc ? taiVe(fChiMuc.id) : null;
    }).then(function (chu) {
      try { R = JSON.parse(chu || 'null'); } catch (e) { R = null; }
      if (!R || !Array.isArray(R.so)) R = { project: [], so: [], xoaHan: [] };
      // 1. sổ / project đã xoá hẳn ở một trong hai bên
      var han = Date.now() - NGAY_GIU_XOA * 864e5, xh = {};
      (L.xoaHan || []).concat(R.xoaHan || []).forEach(function (x) { if (x && x.id && x.luc > han && !(xh[x.id] >= x.luc)) xh[x.id] = x.luc; });
      L.xoaHan = Object.keys(xh).map(function (id) { return { id: id, luc: xh[id] }; });
      L.so = L.so.filter(function (s) {
        if (!xh[s.id]) return true;
        if (tv.soDangMo() === s.id) tv.dongSoMo();
        tv.xoaTep(s.id); doiL = true; return false;
      });
      L.project = L.project.filter(function (p) { if (!xh[p.id]) return true; doiL = true; return false; });
      var rac = [];
      Object.keys(xh).forEach(function (id) { if (fSo[id]) rac.push(fSo[id].id); if (fBia[id]) rac.push(fBia[id].id); delete fSo[id]; delete fBia[id]; delete st.so[id]; });
      // 2. project: lấy bản đổi sau
      var mp = {}; L.project.forEach(function (p) { mp[p.id] = p; });
      (R.project || []).forEach(function (rp) {
        if (!rp || !rp.id || xh[rp.id]) return;
        var lp = mp[rp.id];
        if (!lp) { lp = { id: rp.id, tao: rp.tao }; chepMeta(lp, rp, META_PRJ); L.project.push(lp); doiL = true; }
        else if ((rp.ct || rp.tao || 0) > (lp.ct || lp.tao || 0)) { chepMeta(lp, rp, META_PRJ); doiL = true; }
      });
      // 3. từng sổ
      var ml = {}, mr = {}, ids = {};
      L.so.forEach(function (s) { ml[s.id] = s; ids[s.id] = 1; });
      R.so.forEach(function (s) { if (s && s.id && !xh[s.id]) { mr[s.id] = s; ids[s.id] = 1; } });
      Object.keys(fSo).forEach(function (id) { ids[id] = 1; });
      return chuoi(rac, boVaoRac).then(function () { return chuoi(Object.keys(ids), function (id) { return motSo(id, ml[id], mr[id], fSo[id], fBia[id]); }); });
    }).then(function () {
      // 4. ghi chỉ mục trên máy, trạng thái đồng bộ, chỉ mục trên Drive
      var viec = [tv.kho('ghi', 'dong-bo.json', JSON.stringify(st))];
      if (doiL) viec.push(tv.ghiChiMuc());
      var theoId = function (a, b) { return a.id < b.id ? -1 : 1; };
      var Rm = { phienBan: 1,
        project: L.project.map(function (p) { var x = { id: p.id, tao: p.tao }; chepMeta(x, p, META_PRJ); return x; }).sort(theoId),
        so: L.so.map(function (s) { var x = { id: s.id, tao: s.tao, sua: s.sua }; chepMeta(x, s, META_SO); return x; }).sort(theoId),
        xoaHan: (L.xoaHan || []).slice().sort(theoId) };
      var chu = JSON.stringify(Rm), cu = JSON.stringify({ phienBan: 1, project: (R.project || []).slice().sort(theoId), so: R.so.slice().sort(theoId), xoaHan: (R.xoaHan || []).slice().sort(theoId) });
      if (chu !== cu || !fChiMuc) viec.push(taiLen(fChiMuc && fChiMuc.id, fChiMuc ? { name: 'thu-vien.json' } : { name: 'thu-vien.json', parents: [thuMuc], appProperties: { geoink: 'chiMuc' } }, chu, 'application/json'));
      return Promise.all(viec);
    }).then(function () {
      if (soMoMoi) {   // sổ đang mở vừa được cập nhật từ máy khác (và chưa sửa gì ở máy này): mở lại
        var s = tv.timSo(soMoMoi.id);
        if (s && tv.soDangMo() === s.id && !tv.app.daSua()) { tv.app.nap(soMoMoi.nd, s); thongBao('Sổ "' + s.ten + '" vừa được cập nhật từ máy khác'); }
      }
      if (xung.length) thongBao('Sổ bị sửa ở cả hai máy, đã giữ cả hai bản: ' + xung.join(', '));
      if (doiL) tv.ve();
      if (conViec) chayLai = true;   // vừa tạo bản sao khi trùng: đồng bộ thêm một lượt để đưa lên Drive
      return doiL;
    });

    function ghiTT(id, f, b, sua, md5) { st.so[id] = { f: f, b: b || null, sua: sua || 0, md5: md5 || '' }; }
    function guiLen(l, f, fb) {
      return tv.kho('doc', 'so/' + l.id + '.geoink').then(function (kq) {
        if (!kq.noiDung) return false;
        var meta = { name: tenTep(l), appProperties: { geoink: 'so', soId: l.id } };
        if (!f) meta.parents = [thuMuc];
        return taiLen(f && f.id, meta, kq.noiDung).then(function (k) { ghiTT(l.id, k.id, fb && fb.id, l.sua, k.md5Checksum); return true; });
      }).then(function (daGui) {
        if (!daGui) return;
        return tv.kho('doc', 'anh/' + l.id + '.txt').then(function (a) {
          if (!a.noiDung) return;
          var m = { name: l.id + '.bia.txt', appProperties: { geoink: 'bia', soId: l.id } }; if (!fb) m.parents = [thuMuc];
          return taiLen(fb && fb.id, m, a.noiDung).then(function (k) { st.so[l.id].b = k.id; });
        });
      });
    }
    function taiBia(id, fb) { return fb ? taiVe(fb.id).then(function (a) { return tv.kho('ghi', 'anh/' + id + '.txt', a); }).then(function () { tv.xoaAnh(id); }, function () { }) : Promise.resolve(); }
    function banSao(l, r, f) {   // sửa ở cả hai bên: bản trên Drive thành sổ mới
      var m = { id: tv.idMoi('s'), ten: ((r && r.ten) || l.ten) + ' (bản từ máy khác)', project: l.project, tao: Date.now(), sua: Date.now(), ct: Date.now() };
      if (!m.project) delete m.project;
      return taiVe(f.id).then(function (nd) { return tv.kho('ghi', 'so/' + m.id + '.geoink', nd); }).then(function () { L.so.push(m); doiL = true; conViec = true; xung.push('"' + l.ten + '"'); });
    }
    function motSo(id, l, r, f, fb) {
      var s = st.so[id] || {};
      if (!r && f) r = { id: id, ten: String(f.name || 'Sổ').replace(/\.geoink$/i, ''), tao: Date.now(), sua: 0 };
      if (!l) {
        if (!f) return;   // chỉ mục có nhưng tệp trên Drive không còn
        return taiVe(f.id).then(function (nd) { return tv.kho('ghi', 'so/' + id + '.geoink', nd); }).then(function () { return taiBia(id, fb); }).then(function () {
          var m = { id: id, tao: r.tao || Date.now(), sua: r.sua || Date.now() }; chepMeta(m, r, META_SO);
          L.so.push(m); doiL = true; ghiTT(id, f.id, fb && fb.id, m.sua, f.md5Checksum);
        });
      }
      if (r && (r.ct || 0) > (l.ct || 0)) { chepMeta(l, r, META_SO); doiL = true; }
      if (!f) return guiLen(l, null, null);
      var Lc, Rc;
      if (s.md5) { Lc = (l.sua || 0) > (s.sua || 0); Rc = f.md5Checksum !== s.md5; }
      else { Lc = (l.sua || 0) > ((r && r.sua) || 0); Rc = ((r && r.sua) || 0) > (l.sua || 0); }
      var dangSua = tv.soDangMo() === id && tv.app.daSua();
      if (Rc && (Lc || dangSua)) return banSao(l, r, f).then(function () { return guiLen(l, f, fb); });
      if (Lc) return guiLen(l, f, fb);
      if (Rc) {
        return taiVe(f.id).then(function (nd) {
          return tv.kho('ghi', 'so/' + id + '.geoink', nd).then(function () {
            l.sua = (r && r.sua) || Date.now(); doiL = true; ghiTT(id, f.id, fb && fb.id, l.sua, f.md5Checksum);
            if (tv.soDangMo() === id) soMoMoi = { id: id, nd: nd };
          });
        }).then(function () { return taiBia(id, fb); });
      }
      if (!s.md5) ghiTT(id, f.id, fb && fb.id, l.sua, f.md5Checksum);
      if (f.name !== tenTep(l)) return goiJson('PATCH', API + '/' + f.id + '?fields=id', { name: tenTep(l) }).catch(function () { });
    }
  }

  function dongBo() {
    if (!coDung() || !tt.ketNoi || !tv) return Promise.resolve(false);
    clearTimeout(hen); hen = null;
    if (chay) { chayLai = true; return chay; }
    tt.dang = true; bao();
    chay = tv.luuNeuCan().then(thucHien).then(function (kq) { tt.luc = Date.now(); tt.loi = ''; return kq; }, function (e) {
      tt.loi = String((e && e.message) || e);
      if (e && e.canDangNhap) { tt.ketNoi = false; thongBao('Cần kết nối lại Google Drive để đồng bộ thư viện'); }
      try { console.warn('Đồng bộ Drive:', e); } catch (er) { }
      return false;
    }).then(function (kq) {
      tt.dang = false; chay = null; bao();
      if (chayLai) { chayLai = false; henDongBo(2); }
      return kq;
    });
    return chay;
  }
  function henDongBo(giay) {
    if (!tt.ketNoi) return;
    clearTimeout(hen); hen = setTimeout(dongBo, (giay == null ? GIAY_CHO : giay) * 1000);
  }
  // Trước khi đóng app: đẩy nốt thay đổi (chờ tối đa 10 giây)
  function truocKhiThoat() {
    if (!tt.ketNoi || (!hen && !chay)) return Promise.resolve();
    return Promise.race([dongBo(), new Promise(function (x) { setTimeout(x, 10000); })]);
  }

  // ---------- kết nối / ngắt kết nối ----------
  function ketNoi() {
    if (!tt.cauHinh) return hopThongTin('Chưa cài đặt đồng bộ', 'Bản GeoInk này chưa có mã kết nối Google. Nhóm phát triển cần tạo mã trong Google Cloud (xem hướng dẫn) rồi phát hành bản mới.');
    hopThongTin('Đồng bộ thư viện với Google Drive',
      'Thư viện sổ sẽ được lưu thêm vào Google Drive của bạn (thư mục <b>' + TEN_TM + '</b>). Dùng cùng một tài khoản Google trên máy tính và máy tính bảng thì sổ viết ở máy này sẽ có ở máy kia.<br><br>GeoInk chỉ được xem và sửa các tệp do chính nó tạo, không đọc được tài liệu khác trên Drive của bạn.',
      'Kết nối Google', function () {
        thongBao('Đang mở trang đăng nhập Google…');
        MT.ggDangNhap().then(function (kq) {
          if (!kq || kq.huy) return thongBao('Chưa kết nối Google Drive');
          if (kq.loi) return thongBao('Không kết nối được: ' + kq.loi);
          tt.ketNoi = true; tt.email = kq.email || ''; tt.loi = ''; bao();
          thongBao('Đã kết nối Google Drive' + (tt.email ? ' (' + tt.email + ')' : '') + ' · đang đồng bộ thư viện…');
          dongBo();
        });
      });
  }
  function ngatKetNoi() {
    if (!window.confirm('Ngắt kết nối Google Drive? Sổ trên máy này và trên Drive vẫn giữ nguyên, chỉ thôi đồng bộ.')) return;
    MT.ggDangXuat().then(function () { tt.ketNoi = false; tt.email = ''; tt.loi = ''; bao(); thongBao('Đã ngắt kết nối Google Drive'); });
  }
  function hopThongTin(tieuDe, noiDung, nutChinh, lam) {
    var h = document.createElement('div'); h.className = 'tv-hop';
    h.innerHTML = '<div class="tv-hop-nd hop-dong-bo"><h3>' + thoat(tieuDe) + '</h3><p class="tv-mo-ta">' + noiDung + '</p><div class="tv-hop-chan">' +
      (nutChinh ? '<button data-huy>Để sau</button>&nbsp;<button data-ok class="chinh">' + thoat(nutChinh) + '</button>' : '<button data-huy>Đóng</button>') + '</div></div>';
    document.body.appendChild(h);
    h.onclick = function (e) {
      if (e.target === h || e.target.hasAttribute('data-huy')) return h.remove();
      if (e.target.hasAttribute('data-ok')) { h.remove(); lam(); }
    };
  }

  // ---------- nút trên đầu thư viện ----------
  var IC = {
    may: '<svg viewBox="0 0 24 24"><path d="M7 18h10.5a4 4 0 0 0 .6-7.95A6 6 0 0 0 6.6 9.1 4.5 4.5 0 0 0 7 18z"/></svg>',
    ok: '<svg viewBox="0 0 24 24"><path d="M7 18h10.5a4 4 0 0 0 .6-7.95A6 6 0 0 0 6.6 9.1 4.5 4.5 0 0 0 7 18z"/><path d="M9.5 13.2l2 2 3.6-3.8"/></svg>',
    xoay: '<svg viewBox="0 0 24 24" class="xoay"><path d="M20 12a8 8 0 1 1-2.34-5.66M20 4v4h-4"/></svg>',
    loi: '<svg viewBox="0 0 24 24"><path d="M12 3l9.5 17h-19z"/><path d="M12 10v4M12 17.2v.3"/></svg>',
  };
  function bao() {
    if (!nutEl || !document.contains(nutEl)) return;
    if (!coDung()) { nutEl.innerHTML = ''; return; }
    var nd;
    if (!tt.ketNoi) nd = IC.may + '<span>Đồng bộ Google Drive</span>';
    else if (tt.dang) nd = IC.xoay + '<span>Đang đồng bộ…</span>';
    else if (tt.loi) nd = IC.loi + '<span>Chưa đồng bộ được</span>';
    else nd = IC.ok + '<span>' + (tt.luc ? 'Đã đồng bộ ' + gio(tt.luc) : 'Google Drive') + '</span>';
    nutEl.innerHTML = '<button class="tv-nut tv-gg' + (tt.ketNoi ? ' bat' : '') + (tt.loi && tt.ketNoi ? ' loi' : '') + '" title="' + thoat(tt.ketNoi ? 'Google Drive: ' + tt.email + (tt.loi ? '\n' + tt.loi : '') : 'Đồng bộ thư viện với Google Drive') + '">' + nd + '</button>';
    nutEl.firstChild.onclick = function (e) { e.stopPropagation(); if (!tt.ketNoi) ketNoi(); else moMenu(nutEl.firstChild); };
  }
  function dongMenu() { if (menuEl) { menuEl.remove(); menuEl = null; } }
  function moMenu(nut) {
    dongMenu(); menuEl = document.createElement('div'); menuEl.className = 'tv-menu tv-menu-gg';
    menuEl.innerHTML = '<div class="tv-gg-tk">' + IC.ok + '<div><b>Google Drive</b><small>' + thoat(tt.email || 'đã kết nối') + '</small></div></div>' +
      (tt.loi ? '<p class="tv-gg-loi">' + thoat(tt.loi) + '</p>' : (tt.luc ? '<p class="tv-gg-luc">Lần đồng bộ cuối: ' + gio(tt.luc) + '</p>' : '')) +
      '<button data-gg="ngay">Đồng bộ ngay</button><hr><button data-gg="ngat" class="do">Ngắt kết nối</button>';
    document.body.appendChild(menuEl);
    var r = nut.getBoundingClientRect(); menuEl.style.top = (r.bottom + 4) + 'px'; menuEl.style.left = Math.max(8, Math.min(r.right - menuEl.offsetWidth, window.innerWidth - menuEl.offsetWidth - 8)) + 'px';
    menuEl.onclick = function (e) {
      var b = e.target.closest('[data-gg]'); if (!b) return; dongMenu();
      if (b.dataset.gg === 'ngay') dongBo().then(function (kq) { thongBao(tt.loi ? 'Chưa đồng bộ được: ' + tt.loi : 'Đã đồng bộ thư viện với Google Drive'); return kq; });
      if (b.dataset.gg === 'ngat') ngatKetNoi();
    };
  }
  function veNut(el) { nutEl = el; bao(); }

  function khoiTao(noiBo) {
    tv = noiBo;
    if (!coDung()) return;
    document.addEventListener('pointerdown', function (e) { if (menuEl && !e.target.closest('.tv-menu-gg')) dongMenu(); });
    MT.ggTrangThai().then(function (t) {
      tt.cauHinh = !!t.cauHinh; tt.ketNoi = !!t.daKetNoi; tt.email = t.email || ''; bao();
      if (tt.ketNoi) henDongBo(4);
    });
    setInterval(function () { if (tt.ketNoi && !chay && !hen) dongBo(); }, PHUT_DINH_KY * 60e3);   // lấy thay đổi từ máy khác
    window.addEventListener('online', function () { henDongBo(3); });
    window.addEventListener('geoink-tam-dung', function () { setTimeout(dongBo, 300); });   // máy tính bảng: app xuống nền
  }
  return { khoiTao: khoiTao, dongBo: dongBo, henDongBo: henDongBo, truocKhiThoat: truocKhiThoat, veNut: veNut, ketNoi: ketNoi, trangThai: function () { return tt; } };
})();
