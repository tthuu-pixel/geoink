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

  var ngheDong = null;
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
    moLink: function (url) { if (/^https?:\/\//.test(url)) return goi('Browser', 'open', { url: url }).then(function () { return true; }, function () { return false; }); return Promise.resolve(false); },
    toanManHinh: function () { return Promise.resolve(true); },   // app Android luôn toàn màn hình
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
    khiCapNhat: function (f) { ngheCapNhat.push(f); },
    kiemTraCapNhat: function () { kiemTraCapNhat(true); return Promise.resolve(true); },
    // bản Android: tải tệp APK mới bằng trình duyệt, tải xong bấm vào tệp để cài
    taiCapNhat: function () { return goi('Browser', 'open', { url: 'https://github.com/' + REPO + '/releases/latest/download/' + TEP_APK }).then(function () { return true; }, function (e) { guiCapNhat('loi', { loi: loiChu(e) }); return false; }); },
    caiCapNhat: function () { }
  };

  // Nút Quay lại của Android: đóng hộp thoại / menu đang mở trước, không còn gì thì thoát (tự lưu như trên Windows)
  nghe('App', 'backButton', function () {
    var GI = window.GI;
    if (GI && GI.quayLai && GI.quayLai()) return;
    if (!window.confirm('Thoát GeoInk?')) return;
    if (ngheDong) ngheDong(); else goi('App', 'exitApp');
  });
  // App bị đưa xuống nền (về màn hình chính, tắt màn hình): báo để tự lưu sổ
  nghe('App', 'pause', function () { window.dispatchEvent(new Event('geoink-tam-dung')); });
  setTimeout(function () { kiemTraCapNhat(false); }, 5000);
  document.documentElement.classList.add('android');
})();
