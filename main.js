// GeoInk – tiến trình chính (cửa sổ, hộp thoại lưu/mở, mở link GeoLab)
const { app, BrowserWindow, ipcMain, dialog, shell, Menu } = require('electron');
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
}

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
