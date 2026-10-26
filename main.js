// GeoInk – tiến trình chính (cửa sổ, hộp thoại lưu/mở, mở link GeoLab)
const { app, BrowserWindow, ipcMain, dialog, shell, Menu, net, clipboard, nativeImage, safeStorage } = require('electron');
const path = require('path');
const fs = require('fs');

let cuaSo = null;
let tepMoKhiChay = process.argv.find((a) => a.toLowerCase().endsWith('.geoink')) || null;

function taoCuaSo() {
  cuaSo = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    backgroundColor: '#F6F8FC',
    title: 'GeoInk',
    icon: path.join(__dirname, 'src', 'icon.png'),
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false, spellcheck: false },
  });
  Menu.setApplicationMenu(null);
  cuaSo.maximize();
  cuaSo.loadFile(path.join(__dirname, 'src', 'index.html'));
  // Mọi đường link ngoài (GeoLab) mở bằng trình duyệt mặc định
  cuaSo.webContents.setWindowOpenHandler(({ url }) => { if (/^https?:\/\//.test(url)) shell.openExternal(url); return { action: 'deny' }; });
  cuaSo.webContents.on('will-navigate', (e, url) => { if (!url.startsWith('file://')) { e.preventDefault(); if (/^https?:\/\//.test(url)) shell.openExternal(url); } });
  // Hỏi trước khi đóng nếu còn thay đổi chưa lưu
  let choDong = false;
  cuaSo.on('close', (e) => {
    if (choDong) return;
    e.preventDefault();
    cuaSo.webContents.send('hoi-dong');
  });
  ipcMain.removeAllListeners('dong-that');
  ipcMain.on('dong-that', () => { choDong = true; if (!cuaSo.isDestroyed()) cuaSo.close(); });
  // Bấm X: ẩn cửa sổ ngay cho người dùng thấy app đã tắt; lưu sổ + đồng bộ Drive chạy nốt phía sau rồi mới thoát hẳn
  ipcMain.removeAllListeners('an-cua-so');
  ipcMain.on('an-cua-so', () => {
    if (!cuaSo || cuaSo.isDestroyed()) return;
    cuaSo.webContents.setBackgroundThrottling(false);   // ẩn rồi vẫn chạy đủ nhanh để lưu xong
    cuaSo.hide();
    setTimeout(() => { if (cuaSo && !cuaSo.isDestroyed()) { choDong = true; cuaSo.close(); } }, 15000);   // chốt an toàn
  });
  ipcMain.removeAllListeners('cap-nhat-cai');
  ipcMain.on('cap-nhat-cai', () => { choDong = true; setImmediate(() => autoUpdater.quitAndInstall(true, true)); });
  cuaSo.webContents.once('did-finish-load', () => setTimeout(() => kiemTraCapNhat(false), 4000));
}

// ----- Tự cập nhật (bản mới phát hành trên GitHub Releases) -----
// Có bản mới: báo giao diện hiện nút "Cập nhật"; người dùng bấm thì tải về, tải xong cài và mở lại app.
const { autoUpdater } = require('electron-updater');
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;
let dangKiemTra = false, banMoi = null;
function guiCapNhat(loai, duLieu) { if (cuaSo && !cuaSo.isDestroyed()) cuaSo.webContents.send('cap-nhat', Object.assign({ loai }, duLieu || {})); }
autoUpdater.on('update-available', (i) => { banMoi = i; guiCapNhat('co', { phienBan: i.version, ghiChu: typeof i.releaseNotes === 'string' ? i.releaseNotes : '' }); });
autoUpdater.on('update-not-available', () => guiCapNhat('khong'));
autoUpdater.on('download-progress', (p) => guiCapNhat('tien', { phanTram: Math.round(p.percent || 0) }));
autoUpdater.on('update-downloaded', (i) => guiCapNhat('xong', { phienBan: i.version }));
autoUpdater.on('error', (e) => guiCapNhat('loi', { loi: String((e && e.message) || e).split('\n')[0] }));
function kiemTraCapNhat(tay) {
  if (!app.isPackaged) { if (tay) guiCapNhat('loi', { loi: 'Chỉ kiểm tra được ở bản đã cài đặt' }); return; }
  if (dangKiemTra) return; dangKiemTra = true;
  autoUpdater.checkForUpdates().catch((e) => { if (tay) guiCapNhat('loi', { loi: String((e && e.message) || e).split('\n')[0] }); }).finally(() => { dangKiemTra = false; });
}
ipcMain.handle('cap-nhat-kiem-tra', () => { kiemTraCapNhat(true); return true; });
ipcMain.handle('cap-nhat-tai', () => autoUpdater.downloadUpdate().then(() => true, (e) => { guiCapNhat('loi', { loi: String((e && e.message) || e).split('\n')[0] }); return false; }));

// Chỉ chạy một cửa sổ; mở tệp .geoink khi đã chạy thì đưa vào cửa sổ hiện có
if (!app.requestSingleInstanceLock()) app.quit();
else {
  app.on('second-instance', (e, argv) => {
    const tep = argv.find((a) => a.toLowerCase().endsWith('.geoink'));
    if (cuaSo) { if (cuaSo.isMinimized()) cuaSo.restore(); cuaSo.focus(); if (tep) cuaSo.webContents.send('mo-tep', docTep(tep)); }
  });
  app.whenReady().then(taoCuaSo);
  app.on('window-all-closed', () => app.quit());
}

function docTep(tep) {
  try { return { ten: tep, noiDung: fs.readFileSync(tep, 'utf8') }; } catch (e) { return { loi: String(e.message || e) }; }
}

ipcMain.handle('tep-khoi-dong', () => { const t = tepMoKhiChay; tepMoKhiChay = null; return t ? docTep(t) : null; });

ipcMain.handle('luu', async (e, { noiDung, ten, hoiLai }) => {
  let duongDan = ten;
  if (!duongDan || hoiLai) {
    const kq = await dialog.showSaveDialog(cuaSo, { title: 'Lưu bảng', defaultPath: duongDan || 'Bang-GeoInk.geoink', filters: [{ name: 'Bảng GeoInk', extensions: ['geoink'] }] });
    if (kq.canceled || !kq.filePath) return { huy: true };
    duongDan = kq.filePath;
  }
  try { fs.writeFileSync(duongDan, noiDung, 'utf8'); return { ten: duongDan }; } catch (err) { return { loi: String(err.message || err) }; }
});

ipcMain.handle('mo', async () => {
  const kq = await dialog.showOpenDialog(cuaSo, { title: 'Mở bảng', properties: ['openFile'], filters: [{ name: 'Bảng GeoInk', extensions: ['geoink'] }] });
  if (kq.canceled || !kq.filePaths[0]) return { huy: true };
  return docTep(kq.filePaths[0]);
});

ipcMain.handle('mo-pdf', async () => {
  const kq = await dialog.showOpenDialog(cuaSo, { title: 'Nhập tệp PDF', properties: ['openFile'], filters: [{ name: 'Tệp PDF', extensions: ['pdf'] }] });
  if (kq.canceled || !kq.filePaths[0]) return { huy: true };
  try { return { ten: path.basename(kq.filePaths[0]), duLieu: fs.readFileSync(kq.filePaths[0]).toString('base64') }; } catch (err) { return { loi: String(err.message || err) }; }
});

ipcMain.handle('xuat-anh', async (e, { duLieu, ten }) => {
  const kq = await dialog.showSaveDialog(cuaSo, { title: 'Xuất ảnh', defaultPath: ten || 'GeoInk.png', filters: [{ name: 'Ảnh PNG', extensions: ['png'] }] });
  if (kq.canceled || !kq.filePath) return { huy: true };
  try { fs.writeFileSync(kq.filePath, Buffer.from(duLieu.split(',')[1], 'base64')); return { ten: kq.filePath }; } catch (err) { return { loi: String(err.message || err) }; }
});

// ---- Thư viện sổ trên máy: Tài liệu\GeoInk Thư viện (chỉ đọc / ghi trong thư mục này) ----
function thuMucThuVien() { return path.join(app.getPath('documents'), 'GeoInk Thư viện'); }
function duongThuVien(tuongDoi) {
  if (typeof tuongDoi !== 'string' || !/^[A-Za-z0-9_\-./]+$/.test(tuongDoi) || tuongDoi.split('/').some((p) => p === '..' || p === '')) throw new Error('Đường dẫn không hợp lệ');
  return path.join(thuMucThuVien(), ...tuongDoi.split('/'));
}
ipcMain.handle('thu-vien', (e, { hd, duong, noiDung }) => {
  try {
    if (hd === 'moThuMuc') { fs.mkdirSync(thuMucThuVien(), { recursive: true }); shell.openPath(thuMucThuVien()); return { ok: true }; }
    const f = duongThuVien(duong);
    if (hd === 'doc') return fs.existsSync(f) ? { ok: true, noiDung: fs.readFileSync(f, 'utf8') } : { ok: true, noiDung: null };
    if (hd === 'ghi') { fs.mkdirSync(path.dirname(f), { recursive: true }); const tam = f + '.tam'; fs.writeFileSync(tam, noiDung, 'utf8'); fs.renameSync(tam, f); return { ok: true }; }
    if (hd === 'xoa') { fs.rmSync(f, { recursive: true, force: true }); return { ok: true }; }
    if (hd === 'ds') return { ok: true, ds: fs.existsSync(f) ? fs.readdirSync(f) : [] };
    return { ok: false, loi: 'Lệnh không hợp lệ' };
  } catch (err) { return { ok: false, loi: String(err.message || err) }; }
});
ipcMain.handle('mo-link', (e, url) => { if (/^https?:\/\//.test(url)) shell.openExternal(url); return true; });
ipcMain.handle('toan-man-hinh', () => { if (cuaSo) cuaSo.setFullScreen(!cuaSo.isFullScreen()); return cuaSo ? cuaSo.isFullScreen() : false; });
ipcMain.handle('phien-ban', () => app.getVersion());

// ----- Tài khoản GeoLab (dùng chung với trang nckh-geolab.com) -----
// Gọi cùng máy chủ Apps Script mà trang GeoLab dùng: { hd: 'dangNhap' | 'kiemTra' | 'dangXuat', token, ... }
const GEOLAB_API = 'https://script.google.com/macros/s/AKfycbyDF-5Rkt6jlgPU1SoAExgp3gzU7hmgel7WP8cMqKc0YclwLS-eGdHNXCyhlzcwYu72RQ/exec';
ipcMain.handle('tai-khoan', async (e, { hd, duLieu }) => {
  if (!/^(dangNhap|kiemTra|dangXuat|doiMatKhau)$/.test(hd)) return { ok: false, loi: 'Yêu cầu không hợp lệ.' };
  try {
    const r = await net.fetch(GEOLAB_API, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(Object.assign({ hd }, duLieu || {})), redirect: 'follow' });
    const t = await r.text();
    try { return JSON.parse(t); } catch (err) { return { ok: false, mang: true, loi: 'Máy chủ trả lời không hợp lệ. Thử lại sau.' }; }
  } catch (err) {
    return { ok: false, mang: true, loi: 'Không kết nối được máy chủ GeoLab. Kiểm tra mạng rồi thử lại.' };
  }
});

// ----- Google Drive: đồng bộ thư viện sổ (mỗi giáo viên dùng Drive của chính mình) -----
// Đăng nhập kiểu "ứng dụng trên máy" của Google: mở trình duyệt, Google trả mã về 127.0.0.1 (PKCE).
// Chỉ xin quyền drive.file: app chỉ thấy các tệp do chính GeoInk tạo trên Drive.
// Mã ứng dụng (client id / secret) nằm ở google-config.json, do GitHub Actions tạo từ secrets khi đóng gói.
const http = require('http'), crypto = require('crypto');
const GG_PHAM_VI = 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.email';
function ggCauHinh() { try { const c = JSON.parse(fs.readFileSync(path.join(__dirname, 'google-config.json'), 'utf8')); return c.clientId && c.clientSecret ? c : null; } catch (e) { return null; } }
function ggTep() { return path.join(app.getPath('userData'), 'google-drive.dat'); }
function ggDoc() {
  try { const raw = fs.readFileSync(ggTep()); return JSON.parse(safeStorage.isEncryptionAvailable() ? safeStorage.decryptString(raw) : raw.toString('utf8')); } catch (e) { return null; }
}
function ggGhi(d) {
  try { if (!d) { fs.rmSync(ggTep(), { force: true }); return; } const s = JSON.stringify(d); fs.writeFileSync(ggTep(), safeStorage.isEncryptionAvailable() ? safeStorage.encryptString(s) : s); } catch (e) { }
}
let ggToken = null;   // { token, het }
function b64url(b) { return b.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
async function ggDoiMa(thamSo) {
  const ch = ggCauHinh(); if (!ch) throw new Error('Bản GeoInk này chưa có mã kết nối Google.');
  const r = await net.fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(Object.assign({ client_id: ch.clientId, client_secret: ch.clientSecret }, thamSo)).toString() });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) { const loi = new Error(j.error_description || j.error || ('Lỗi ' + r.status)); loi.ma = j.error; throw loi; }
  ggToken = { token: j.access_token, het: Date.now() + ((j.expires_in || 3600) - 120) * 1000 };
  return j;
}
async function ggLayToken() {
  if (ggToken && ggToken.het > Date.now()) return ggToken.token;
  const d = ggDoc(); if (!d || !d.refresh) { const e = new Error('Chưa kết nối Google Drive'); e.ma = 'CAN_DANG_NHAP'; throw e; }
  try { await ggDoiMa({ refresh_token: d.refresh, grant_type: 'refresh_token' }); }
  catch (e) { if (e.ma === 'invalid_grant') { ggGhi(null); e.ma = 'CAN_DANG_NHAP'; } throw e; }
  return ggToken.token;
}
async function ggEmail(token) {
  try { const r = await net.fetch('https://www.googleapis.com/oauth2/v3/userinfo', { headers: { Authorization: 'Bearer ' + token } }); const j = await r.json(); return j.email || ''; } catch (e) { return ''; }
}
let ggDangCho = null;
ipcMain.handle('gg-dang-nhap', () => {
  const ch = ggCauHinh(); if (!ch) return { loi: 'Bản GeoInk này chưa có mã kết nối Google (xem hướng dẫn cài đặt đồng bộ).' };
  if (ggDangCho) ggDangCho.huy();
  return new Promise((xong) => {
    const ver = b64url(crypto.randomBytes(32)), chal = b64url(crypto.createHash('sha256').update(ver).digest()), trangThai = b64url(crypto.randomBytes(16));
    let redirect = '', daXong = false;
    const ket = (kq) => { if (daXong) return; daXong = true; clearTimeout(hen); try { sv.close(); } catch (e) { } ggDangCho = null; if (cuaSo && !cuaSo.isDestroyed()) { if (cuaSo.isMinimized()) cuaSo.restore(); cuaSo.focus(); } xong(kq); };
    const trang = (res, ok, chu) => { res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end('<!doctype html><meta charset="utf-8"><title>GeoInk</title><body style="font-family:Segoe UI,Arial;background:#EEF5FF;display:flex;align-items:center;justify-content:center;height:100vh;margin:0"><div style="background:#fff;padding:32px 40px;border-radius:16px;box-shadow:0 10px 30px rgba(30,64,175,.15);text-align:center"><h2 style="color:' + (ok ? '#1E3A8A' : '#B91C1C') + '">' + chu + '</h2><p>Bạn có thể đóng trang này và quay lại GeoInk.</p></div>'); };
    const sv = http.createServer(async (req, res) => {
      const u = new URL(req.url, 'http://127.0.0.1');
      if (u.pathname !== '/') { res.writeHead(404); res.end(); return; }
      const ma = u.searchParams.get('code'), loi = u.searchParams.get('error');
      if (u.searchParams.get('state') !== trangThai) { trang(res, false, 'Yêu cầu không hợp lệ'); return; }
      if (!ma) { trang(res, false, 'Chưa kết nối Google Drive'); ket(loi === 'access_denied' ? { huy: true } : { loi: loi || 'Không nhận được mã đăng nhập' }); return; }
      try {
        const j = await ggDoiMa({ code: ma, code_verifier: ver, redirect_uri: redirect, grant_type: 'authorization_code' });
        if (!j.refresh_token) throw new Error('Google không trả mã làm mới. Thử ngắt kết nối GeoInk trong tài khoản Google rồi kết nối lại.');
        const email = await ggEmail(j.access_token);
        ggGhi({ refresh: j.refresh_token, email });
        trang(res, true, 'Đã kết nối Google Drive' + (email ? ' (' + email + ')' : ''));
        ket({ ok: true, email });
      } catch (e) { trang(res, false, 'Không kết nối được'); ket({ loi: String(e.message || e) }); }
    });
    const hen = setTimeout(() => ket({ loi: 'Hết thời gian chờ đăng nhập Google.' }), 5 * 60e3);
    ggDangCho = { huy: () => ket({ huy: true }) };
    sv.listen(0, '127.0.0.1', () => {
      redirect = 'http://127.0.0.1:' + sv.address().port;
      shell.openExternal('https://accounts.google.com/o/oauth2/v2/auth?' + new URLSearchParams({ client_id: ch.clientId, redirect_uri: redirect, response_type: 'code',
        scope: GG_PHAM_VI, code_challenge: chal, code_challenge_method: 'S256', state: trangThai, access_type: 'offline', prompt: 'consent' }).toString());
    });
  });
});
ipcMain.handle('gg-trang-thai', () => { const d = ggDoc(); return { cauHinh: !!ggCauHinh(), daKetNoi: !!(d && d.refresh), email: (d && d.email) || '' }; });
ipcMain.handle('gg-dang-xuat', async () => {
  const d = ggDoc(); ggGhi(null); ggToken = null;
  if (d && d.refresh) { try { await net.fetch('https://oauth2.googleapis.com/revoke?token=' + encodeURIComponent(d.refresh), { method: 'POST' }); } catch (e) { } }
  return { ok: true };
});
// Gọi Google Drive API (chỉ www.googleapis.com), tự gắn mã truy cập, tự làm mới khi hết hạn
ipcMain.handle('gg-goi', async (e, yc) => {
  const url = String((yc && yc.url) || '');
  if (!/^https:\/\/www\.googleapis\.com\//.test(url)) return { status: 0, text: 'Địa chỉ không hợp lệ' };
  for (let lan = 0; lan < 2; lan++) {
    let tk;
    try { tk = await ggLayToken(); } catch (err) { return { status: 401, text: String(err.message || err), canDangNhap: err.ma === 'CAN_DANG_NHAP' }; }
    try {
      const r = await net.fetch(url, { method: yc.method || 'GET', headers: Object.assign({}, yc.headers || {}, { Authorization: 'Bearer ' + tk }), body: yc.body == null ? undefined : yc.body });
      if (r.status === 401 && lan === 0) { ggToken = null; continue; }
      return { status: r.status, text: await r.text(), location: r.headers.get('location') || '' };
    } catch (err) { return { status: 0, text: String(err.message || err) }; }
  }
  return { status: 401, text: 'Không xác thực được với Google' };
});

// Cắt hình trên bảng: ghi ảnh (PNG data URL) vào clipboard của máy để dán sang Word…
ipcMain.handle('chep-anh', (e, duLieu) => { try { clipboard.writeImage(nativeImage.createFromDataURL(duLieu)); return true; } catch (err) { return false; } });
// Dán: đọc ảnh / chữ trong clipboard của máy
ipcMain.handle('doc-clipboard', () => {
  const anh = clipboard.readImage();
  if (anh && !anh.isEmpty()) { const kt = anh.getSize(); return { anh: anh.toDataURL(), rong: kt.width, cao: kt.height }; }
  return { chu: clipboard.readText() || '' };
});
