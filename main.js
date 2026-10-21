// GeoInk – tiến trình chính (cửa sổ, hộp thoại lưu/mở, mở link GeoLab)
const { app, BrowserWindow, ipcMain, dialog, shell, Menu, net, clipboard, nativeImage } = require('electron');
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
  ipcMain.on('dong-that', () => { choDong = true; cuaSo.close(); });
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

// Cắt hình trên bảng: ghi ảnh (PNG data URL) vào clipboard của máy để dán sang Word…
ipcMain.handle('chep-anh', (e, duLieu) => { try { clipboard.writeImage(nativeImage.createFromDataURL(duLieu)); return true; } catch (err) { return false; } });
// Dán: đọc ảnh / chữ trong clipboard của máy
ipcMain.handle('doc-clipboard', () => {
  const anh = clipboard.readImage();
  if (anh && !anh.isEmpty()) { const kt = anh.getSize(); return { anh: anh.toDataURL(), rong: kt.width, cao: kt.height }; }
  return { chu: clipboard.readText() || '' };
});
