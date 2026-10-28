// Cầu nối cho bản Android (máy tính bảng): thay cho preload.js của Electron.
// Chỉ chạy khi GeoInk được mở trong app Android (Capacitor); mở bằng trình duyệt hay trên Windows thì không làm gì.
(function () {
  var cap = window.Capacitor;
  if (!cap || typeof cap.nativePromise !== 'function' || !(window.androidBridge || (cap.getPlatform && cap.getPlatform() === 'android'))) return;

  var GEOLAB_API = 'https://script.google.com/macros/s/AKfycbyDF-5Rkt6jlgPU1SoAExgp3gzU7hmgel7WP8cMqKc0YclwLS-eGdHNXCyhlzcwYu72RQ/exec';
  var REPO = 'tthuu-pixel/geoink', TEP_APK = 'GeoInk-Android.apk';
  var THU_MUC_TV = 'GeoInk Thư viện';   // thư viện sổ: trong bộ nhớ riêng của app

  function goi(plugin, ham, tuyChon) { return cap.nativePromise(plugin, ham, tuyChon || {}); }
  function nghe(plugin, su, f) { try { return cap.addListener(plugin, su, f); } catch (e) { return null; } }
  var FS = function (ham, tc) { return goi('Filesystem', ham, tc); };
  function loiChu(e) { return String((e && (e.message || e.errorMessage)) || e || 'Lỗi không rõ'); }
  function sachTen(t) { return String(t || 'Bang-GeoInk').replace(/[\\/:*?"<>|]+/g, '-').trim() || 'Bang-GeoInk'; }
  function hoiTen(tieuDe, macDinh) {
    var GI = window.GI || {};
    if (GI.hoi) return GI.hoi({ tieuDe: tieuDe, nhan: 'Tên tệp', macDinh: macDinh, van: true });
    return Promise.resolve(window.prompt(tieuDe, macDinh));
  }
  // chọn tệp bằng bộ chọn tệp của Android
  function chonTep(accept, docLaChu) {
    return new Promise(function (xong) {
      var inp = document.createElement('input'); inp.type = 'file'; if (accept) inp.accept = accept;
      inp.onchange = function () {
        var f = inp.files[0]; if (!f) return xong({ huy: true });
        if (docLaChu) f.text().then(function (s) { xong({ ten: f.name, noiDung: s }); }, function (e) { xong({ loi: loiChu(e) }); });
        else f.arrayBuffer().then(function (b) {
          var u = new Uint8Array(b), s = '', k = 0x8000;
          for (var i = 0; i < u.length; i += k) s += String.fromCharCode.apply(null, u.subarray(i, i + k));
          xong({ ten: f.name, duLieu: btoa(s) });
        }, function (e) { xong({ loi: loiChu(e) }); });
      };
      inp.click();
    });
  }
  // ghi tạm vào bộ nhớ đệm rồi mở bảng "Chia sẻ" của Android (Zalo, Drive, Gmail…)
  function chiaSe(duLieu, ten, laChu, tieuDe) {
    var tc = { path: 'chia-se/' + sachTen(ten), directory: 'CACHE', data: duLieu, recursive: true };
    if (laChu) tc.encoding = 'utf8';
    return FS('writeFile', tc).then(function (kq) {
      return goi('Share', 'share', { title: tieuDe || ten, files: [kq.uri], dialogTitle: tieuDe || 'Gửi ' + ten });
    }).then(function () { return { ok: true }; }, function (e) {
      var s = loiChu(e); return /cancel/i.test(s) ? { huy: true } : { loi: s };
    });
  }

  // ---- thông báo cập nhật (giống autoUpdater của Electron) ----
  var ngheCapNhat = [], banMoi = null;
  function guiCapNhat(loai, d) { var x = Object.assign({ loai: loai }, d || {}); ngheCapNhat.forEach(function (f) { try { f(x); } catch (e) { } }); }
  function soPB(v) { return String(v || '0').replace(/^v/, '').split('.').map(function (x) { return parseInt(x, 10) || 0; }); }
  function moiHon(a, b) { a = soPB(a); b = soPB(b); for (var i = 0; i < 3; i++) { if ((a[i] || 0) !== (b[i] || 0)) return (a[i] || 0) > (b[i] || 0); } return false; }
  var phienBanApp = null;
  function layPhienBan() { if (!phienBanApp) phienBanApp = goi('App', 'getInfo').then(function (i) { return i.version; }, function () { return '0.0.0'; }); return phienBanApp; }
  function kiemTraCapNhat(tay) {
    return Promise.all([layPhienBan(), goi('CapacitorHttp', 'request', { url: 'https://api.github.com/repos/' + REPO + '/releases/latest', method: 'GET', headers: { Accept: 'application/vnd.github+json' } })])
      .then(function (r) {
        var d = r[1].data; if (typeof d === 'string') d = JSON.parse(d);
        var coApk = (d.assets || []).some(function (a) { return a.name === TEP_APK; });
        if (coApk && moiHon(d.tag_name, r[0])) { banMoi = String(d.tag_name).replace(/^v/, ''); guiCapNhat('co', { phienBan: banMoi }); }
        else guiCapNhat('khong');
      }, function (e) { if (tay) guiCapNhat('loi', { loi: loiChu(e) }); });
  }

  // mã truy cập Google Drive: lấy từ Google Identity (plugin GoogleDrive), giữ khoảng 45 phút
  var ggTk = null, KHOA_GG = 'geoink_google_drive';
  function ggDoc() { try { return JSON.parse(localStorage.getItem(KHOA_GG) || '{}') || {}; } catch (e) { return {}; } }
  function ggGhi(d) { try { if (d) localStorage.setItem(KHOA_GG, JSON.stringify(d)); else localStorage.removeItem(KHOA_GG); } catch (e) { } }
  // Hai cách đăng nhập: (1) Google Play Services (hộp chọn tài khoản của Android);
  // (2) máy không có Play Services chính hãng: mở trình duyệt, nhận mã qua 127.0.0.1 như bản Windows,
  //     dùng mã ứng dụng Desktop trong google-config.json (GitHub Actions ghi vào khi đóng gói), giữ mã làm mới trên máy.
  var GG_PHAM_VI = 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.email', ggCauHinh = null, ggRefreshMoi = null;
  function layCauHinh() {
    if (!ggCauHinh) ggCauHinh = fetch('google-config.json').then(function (r) { return r.ok ? r.json() : null; }).then(function (c) { return c && c.clientId && c.clientSecret ? c : null; }, function () { return null; });
    return ggCauHinh;
  }
  function qs(o) { return Object.keys(o).map(function (k) { return encodeURIComponent(k) + '=' + encodeURIComponent(o[k]); }).join('&'); }
  function b64url(u8) { var s = ''; for (var i = 0; i < u8.length; i++) s += String.fromCharCode(u8[i]); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
  function ngauNhien(n) { var a = new Uint8Array(n); crypto.getRandomValues(a); return b64url(a); }
  function ggDoiMa(thamSo) {
    return layCauHinh().then(function (ch) {
      if (!ch) throw { code: 'LOI', message: 'Bản GeoInk này chưa có mã kết nối Google' };
      return goi('CapacitorHttp', 'request', { url: 'https://oauth2.googleapis.com/token', method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        data: qs(Object.assign({ client_id: ch.clientId, client_secret: ch.clientSecret }, thamSo)), responseType: 'text' });
    }).then(function (r) {
      var d = r.data; if (typeof d === 'string') { try { d = JSON.parse(d); } catch (e) { d = {}; } }
      if (r.status !== 200 || !d.access_token) throw { code: d && d.error === 'invalid_grant' ? 'CAN_DANG_NHAP' : 'LOI', message: (d && (d.error_description || d.error)) || ('Lỗi ' + r.status) };
      ggTk = { token: d.access_token, het: Date.now() + ((d.expires_in || 3600) - 120) * 1000 };
      return d;
    });
  }
  function gmsToken(hoi) { return goi('GoogleDrive', 'layToken', { hoi: !!hoi }).then(function (k) { ggTk = { token: k.token, het: Date.now() + 45 * 60e3 }; return k.token; }); }
  function dangNhapTrinhDuyet() {
    var ver = ngauNhien(48), trangThai = ngauNhien(16);
    return layCauHinh().then(function (ch) {
      if (!ch) throw { code: 'LOI', message: 'Máy này không có Google Play Services và bản GeoInk này chưa có mã đăng nhập dự phòng' };
      return crypto.subtle.digest('SHA-256', new TextEncoder().encode(ver)).then(function (h) {
        return goi('GoogleDrive', 'dangNhapTrinhDuyet', { url: 'https://accounts.google.com/o/oauth2/v2/auth?' + qs({ client_id: ch.clientId, response_type: 'code', scope: GG_PHAM_VI,
          code_challenge: b64url(new Uint8Array(h)), code_challenge_method: 'S256', state: trangThai, access_type: 'offline', prompt: 'consent' }) });
      });
    }).then(function (k) {
      if (!k.code) throw { code: k.error === 'access_denied' ? 'HUY' : 'LOI', message: k.error || 'Chưa đăng nhập Google' };
      if (k.state !== trangThai) throw { code: 'LOI', message: 'Phản hồi đăng nhập không hợp lệ' };
      return ggDoiMa({ code: k.code, code_verifier: ver, redirect_uri: k.redirect, grant_type: 'authorization_code' });
    }).then(function (d) {
      if (!d.refresh_token) throw { code: 'LOI', message: 'Google không trả mã làm mới, thử ngắt kết nối GeoInk trong tài khoản Google rồi kết nối lại' };
      ggRefreshMoi = d.refresh_token; return d.access_token;
    });
  }
  function ggLayToken(hoi) {
    if (!hoi && ggTk && ggTk.het > Date.now()) return Promise.resolve(ggTk.token);
    var d = ggDoc();
    if (!hoi) {
      if (!d.daKetNoi) return Promise.reject({ code: 'CAN_DANG_NHAP', message: 'Chưa kết nối Google Drive' });
      if (d.refresh) return ggDoiMa({ refresh_token: d.refresh, grant_type: 'refresh_token' }).then(function () { return ggTk.token; }, function (e) { if (e && e.code === 'CAN_DANG_NHAP') ggGhi(null); throw e; });
      return gmsToken(false);
    }
    ggRefreshMoi = null;
    // máy có Play Services: hộp chọn tài khoản; không có (hoặc lỗi): đăng nhập bằng trình duyệt
    return gmsToken(true).catch(function (e) { if (e && (e.code || e.errorCode) === 'HUY') throw e; return dangNhapTrinhDuyet(); });
  }
  var ngheDong = null;
  // ----- Toàn màn hình / khoá GeoInk (ghim ứng dụng) -----
  var toanMH = true, dangKhoa = false, cbManHinh = null, cbChanDong = null, henKhoa = null;
  function baoManHinh() { if (cbManHinh) cbManHinh({ toan: toanMH, khoa: dangKhoa }); }
  function theoDoiKhoa() {   // người dùng có thể tự bỏ ghim bằng thao tác của hệ thống: kiểm tra lại để nút trong app đúng trạng thái
    clearInterval(henKhoa); if (!dangKhoa) return;
    henKhoa = setInterval(function () { goi('CheDoManHinh', 'trangThai').then(function (r) { if (r && !r.khoa && dangKhoa) { dangKhoa = false; clearInterval(henKhoa); baoManHinh(); } }, function () { }); }, 3000);
  }
  // Đang khoá: không mở được trình duyệt, nên GeoLab hiện trong một khung ngay trong app
  function moKhungGeoLab(url) {
    var cu = document.getElementById('khung-geolab'); if (cu) cu.remove();
    var k = document.createElement('div'); k.id = 'khung-geolab';
    k.innerHTML = '<div class="kg-dau"><b>GeoLab</b><span>đang khoá GeoInk · mở trong app</span><button type="button">Đóng ✕</button></div><iframe allow="fullscreen" referrerpolicy="no-referrer"></iframe>';
    document.body.appendChild(k); k.querySelector('iframe').src = url; k.querySelector('button').onclick = function () { k.remove(); };
  }
  window.mayTinh = {
    nenTang: 'android',
    luu: function (noiDung, ten, hoiLai) {
      // lưu vào Tài liệu (Documents)/GeoInk trên máy tính bảng
      var tv = window.GI && window.GI.thuVien, tenGoiY = ten ? ten.split('/').pop().replace(/\.geoink$/i, '') : (tv && tv.tenSo && tv.tenSo()) || 'Bang-GeoInk';
      var buoc = (!ten || hoiLai) ? hoiTen('Lưu bảng vào thư mục Tài liệu/GeoInk', sachTen(tenGoiY)) : Promise.resolve(null);
      return buoc.then(function (t) {
        if ((!ten || hoiLai) && (t == null || !String(t).trim())) return { huy: true };
        var duong = (!ten || hoiLai) ? 'GeoInk/' + sachTen(String(t).replace(/\.geoink$/i, '')) + '.geoink' : ten;
        return FS('writeFile', { path: duong, directory: 'DOCUMENTS', data: noiDung, encoding: 'utf8', recursive: true })
          .then(function () { return { ten: duong }; }, function (e) {
            // không ghi được vào Tài liệu (máy cũ, chưa cho quyền): gửi tệp qua bảng Chia sẻ
            return chiaSe(noiDung, duong.split('/').pop(), true, 'Lưu bảng GeoInk').then(function (k) { return k.ok ? { ten: duong.split('/').pop() } : (k.huy ? { huy: true } : { loi: loiChu(e) }); });
          });
      });
    },
    mo: function () { return chonTep('', true); },
    moPdf: function () { return chonTep('application/pdf', false); },
    xuatAnh: function (duLieu, ten) {
      var b64 = String(duLieu).split(',')[1], duong = 'Pictures/GeoInk/' + sachTen(ten);
      return FS('writeFile', { path: duong, directory: 'EXTERNAL_STORAGE', data: b64, recursive: true })
        .then(function () { return { ten: 'Ảnh/GeoInk/' + sachTen(ten) }; }, function () {
          return chiaSe(b64, ten, false, 'Lưu ảnh').then(function (k) { return k.ok ? { ten: ten } : k.huy ? { huy: true } : { loi: k.loi }; });
        });
    },
    // Gửi bảng / ảnh qua Zalo, Drive, Gmail…
    chiaSe: function (duLieu, ten, laChu) { return chiaSe(laChu ? duLieu : String(duLieu).split(',').pop(), ten, laChu); },
    moLink: function (url) {
      if (dangKhoa) { if (/^https:\/\/(www\.)?nckh-geolab\.com\//.test(url)) { moKhungGeoLab(url); return Promise.resolve(true); } return Promise.resolve(false); }
      if (/^https?:\/\//.test(url)) return goi('Browser', 'open', { url: url }).then(function () { return true; }, function () { return false; }); return Promise.resolve(false); },
    toanManHinh: function () {   // bật / tắt toàn màn hình (ẩn / hiện thanh trạng thái và thanh điều hướng)
      toanMH = !toanMH; return goi('CheDoManHinh', 'datToanManHinh', { toan: toanMH }).then(function () { baoManHinh(); return toanMH; }, function () { toanMH = !toanMH; return toanMH; });
    },
    khoaApp: function (bat) {
      return goi('CheDoManHinh', bat ? 'khoa' : 'moKhoa').then(function () { dangKhoa = !!bat; if (dangKhoa) { toanMH = true; baoManHinh(); } if (!dangKhoa) { var kg = document.getElementById('khung-geolab'); if (kg) kg.remove(); } theoDoiKhoa(); return dangKhoa; },
        function (e) { alert(loiChu(e)); return dangKhoa; });
    },
    khiManHinh: function (f) { cbManHinh = f; setTimeout(baoManHinh, 0); },
    khiChanDong: function (f) { cbChanDong = f; },
    phienBan: layPhienBan,
    tepKhoiDong: function () { return Promise.resolve(null); },
    khiMoTep: function () { },
    khiHoiDong: function (f) { ngheDong = f; },
    dongThat: function () { goi('App', 'exitApp'); },
    thuVien: function (hd, duong, noiDung) {
      if (hd === 'moThuMuc') return Promise.resolve({ ok: true });
      if (typeof duong !== 'string' || !/^[A-Za-z0-9_\-./]+$/.test(duong) || duong.split('/').some(function (p) { return p === '..' || p === ''; })) return Promise.resolve({ ok: false, loi: 'Đường dẫn không hợp lệ' });
      var f = THU_MUC_TV + '/' + duong, D = 'DATA';
      if (hd === 'doc') return FS('readFile', { path: f, directory: D, encoding: 'utf8' }).then(function (k) { return { ok: true, noiDung: k.data }; }, function () { return { ok: true, noiDung: null }; });
      if (hd === 'ghi') {
        var tam = f + '.tam';
        return FS('writeFile', { path: tam, directory: D, data: noiDung, encoding: 'utf8', recursive: true })
          .then(function () { return FS('deleteFile', { path: f, directory: D }).catch(function () { }); })
          .then(function () { return FS('rename', { from: tam, to: f, directory: D, toDirectory: D }); })
          .then(function () { return { ok: true }; }, function (e) { return { ok: false, loi: loiChu(e) }; });
      }
      if (hd === 'xoa') return FS('stat', { path: f, directory: D }).then(function (s) {
        return s.type === 'directory' ? FS('rmdir', { path: f, directory: D, recursive: true }) : FS('deleteFile', { path: f, directory: D });
      }).then(function () { return { ok: true }; }, function () { return { ok: true }; });
      if (hd === 'ds') return FS('readdir', { path: f, directory: D }).then(function (k) { return { ok: true, ds: (k.files || []).map(function (x) { return typeof x === 'string' ? x : x.name; }) }; }, function () { return { ok: true, ds: [] }; });
      return Promise.resolve({ ok: false, loi: 'Lệnh không hợp lệ' });
    },
    taiKhoan: function (hd, duLieu) {
      if (!/^(dangNhap|kiemTra|dangXuat|doiMatKhau)$/.test(hd)) return Promise.resolve({ ok: false, loi: 'Yêu cầu không hợp lệ.' });
      return goi('CapacitorHttp', 'request', { url: GEOLAB_API, method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, data: JSON.stringify(Object.assign({ hd: hd }, duLieu || {})) })
        .then(function (r) {
          var d = r.data; if (d && typeof d === 'object') return d;
          try { return JSON.parse(d); } catch (e) { return { ok: false, mang: true, loi: 'Máy chủ trả lời không hợp lệ. Thử lại sau.' }; }
        }, function () { return { ok: false, mang: true, loi: 'Không kết nối được máy chủ GeoLab. Kiểm tra mạng rồi thử lại.' }; });
    },
    // ---- Google Drive (đồng bộ thư viện sổ) ----
    ggTrangThai: function () { var d = ggDoc(); return Promise.resolve({ cauHinh: true, daKetNoi: !!d.daKetNoi, email: d.email || '' }); },
    ggDangNhap: function () {
      return ggLayToken(true).then(function (tk) {
        return goi('CapacitorHttp', 'request', { url: 'https://www.googleapis.com/oauth2/v3/userinfo', method: 'GET', headers: { Authorization: 'Bearer ' + tk } })
          .then(function (r) { var d = r.data; if (typeof d === 'string') { try { d = JSON.parse(d); } catch (e) { d = {}; } } return (d && d.email) || ''; }, function () { return ''; });
      }).then(function (email) { var d = { daKetNoi: true, email: email }; if (ggRefreshMoi) d.refresh = ggRefreshMoi; ggRefreshMoi = null; ggGhi(d); return { ok: true, email: email }; },
        function (e) { var ma = e && (e.code || e.errorCode); return ma === 'HUY' ? { huy: true } : { loi: loiChu(e) }; });
    },
    ggDangXuat: function () {
      var tk = ggDoc().refresh || (ggTk && ggTk.token); ggTk = null; ggGhi(null);
      if (tk) goi('CapacitorHttp', 'request', { url: 'https://oauth2.googleapis.com/revoke?token=' + encodeURIComponent(tk), method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, data: '' }).catch(function () { });
      return Promise.resolve({ ok: true });
    },
    ggGoi: function (yc) {
      var url = String((yc && yc.url) || '');
      if (!/^https:\/\/www\.googleapis\.com\//.test(url)) return Promise.resolve({ status: 0, text: 'Địa chỉ không hợp lệ' });
      var lan = function (thu) {
        return ggLayToken(false).then(function (tk) {
          var tc = { url: url, method: yc.method || 'GET', headers: Object.assign({}, yc.headers || {}, { Authorization: 'Bearer ' + tk }), responseType: 'text' };
          if (tc.method === 'PATCH') { tc.method = 'POST'; tc.headers['X-HTTP-Method-Override'] = 'PATCH'; }   // HttpURLConnection của Android không có PATCH
          if (yc.body != null) tc.data = yc.body;
          return goi('CapacitorHttp', 'request', tc).then(function (r) {
            if (r.status === 401 && thu === 0) { ggTk = null; return lan(1); }
            var h = r.headers || {}, loc = '';
            Object.keys(h).forEach(function (k) { if (k.toLowerCase() === 'location') loc = h[k]; });
            return { status: r.status, text: typeof r.data === 'string' ? r.data : JSON.stringify(r.data), location: loc };
          });
        }, function (e) { var ma = e && (e.code || e.errorCode); return { status: 401, text: loiChu(e), canDangNhap: ma === 'CAN_DANG_NHAP' }; });
      };
      return lan(0).catch(function (e) { return { status: 0, text: loiChu(e) }; });
    },
    khiCapNhat: function (f) { ngheCapNhat.push(f); },
    kiemTraCapNhat: function () { kiemTraCapNhat(true); return Promise.resolve(true); },
    // bản Android: tải tệp APK mới bằng trình duyệt, tải xong bấm vào tệp để cài
    taiCapNhat: function () { return goi('Browser', 'open', { url: 'https://github.com/' + REPO + '/releases/latest/download/' + TEP_APK }).then(function () { return true; }, function (e) { guiCapNhat('loi', { loi: loiChu(e) }); return false; }); },
    caiCapNhat: function () { }
  };

  // Nút Quay lại của Android: đóng hộp thoại / menu đang mở trước, không còn gì thì thoát (tự lưu như trên Windows)
  nghe('App', 'backButton', function () {
    var GI = window.GI;
    var kg = document.getElementById('khung-geolab'); if (kg) { kg.remove(); return; }
    if (GI && GI.quayLai && GI.quayLai()) return;
    if (dangKhoa) { if (cbChanDong) cbChanDong(); return; }   // đang khoá: không thoát
    if (!window.confirm('Thoát GeoInk?')) return;
    if (ngheDong) ngheDong(); else goi('App', 'exitApp');
  });
  // App bị đưa xuống nền (về màn hình chính, tắt màn hình): báo để tự lưu sổ
  nghe('App', 'pause', function () { window.dispatchEvent(new Event('geoink-tam-dung')); });
  setTimeout(function () { kiemTraCapNhat(false); }, 5000);
  document.documentElement.classList.add('android');
})();
