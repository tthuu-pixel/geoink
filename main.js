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
    backgroundColor: '#DCEBFF',   // trùng màu nền màn chào, không bị chớp trắng lúc mở
    title: 'GeoInk',
    icon: path.join(__dirname, 'src', 'icon.png'),
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false, spellcheck: false },
  });
  Menu.setApplicationMenu(null);
  cuaSo.maximize();   // thoát toàn màn hình thì về cửa sổ vừa khung màn hình laptop
  cuaSo.setFullScreen(true);   // mở app: toàn màn hình
  cuaSo.loadFile(path.join(__dirname, 'src', 'index.html'));
  const baoManHinh = () => { if (!cuaSo.isDestroyed()) cuaSo.webContents.send('trang-thai-man-hinh', { toan: cuaSo.isFullScreen() || cuaSo.isKiosk(), khoa: dangKhoa }); };
  cuaSo.on('enter-full-screen', baoManHinh); cuaSo.on('leave-full-screen', baoManHinh);
  cuaSo.webContents.on('did-finish-load', baoManHinh);
  // Đang khoá: cửa sổ bị chuyển đi (Alt+Tab, phím Windows…) thì kéo về lại ngay, trừ lúc đang nhường cho trình duyệt mở GeoLab
  cuaSo.on('blur', () => { if (dangKhoa && !nhuongGeoLab) setTimeout(giuKhoa, 120); });
  cuaSo.on('focus', () => { if (dangKhoa && nhuongGeoLab) { nhuongGeoLab = false; cuaSo.setAlwaysOnTop(true, 'screen-saver'); } });
  // Mọi đường link ngoài (GeoLab) mở bằng trình duyệt mặc định
  cuaSo.webContents.setWindowOpenHandler(({ url }) => { if (/^https?:\/\//.test(url)) shell.openExternal(url); return { action: 'deny' }; });
  cuaSo.webContents.on('will-navigate', (e, url) => { if (!url.startsWith('file://')) { e.preventDefault(); if (/^https?:\/\//.test(url)) shell.openExternal(url); } });
  // Hỏi trước khi đóng nếu còn thay đổi chưa lưu
  let choDong = false;
  cuaSo.on('close', (e) => {
    if (dangKhoa && !choDong) { e.preventDefault(); cuaSo.webContents.send('khoa-chan-dong'); return; }   // đang khoá: không thoát được
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
ipcMain.handle('mo-link', (e, url) => {
  if (!/^https?:\/\//.test(url)) return true;
  // đang khoá: chỉ cho mở GeoLab; tạm thôi "luôn nằm trên" để trình duyệt hiện lên, quay lại GeoInk là khoá tiếp
  if (dangKhoa) { if (!/^https:\/\/(www\.)?nckh-geolab\.com\//.test(url)) return false; nhuongGeoLab = true; cuaSo.setAlwaysOnTop(false); }
  shell.openExternal(url); return true;
});
// ----- Khoá GeoInk: chỉ dùng GeoInk (và mở GeoLab), không chuyển sang chương trình khác, không thoát -----
let dangKhoa = false, nhuongGeoLab = false, henGiu = null;
function giuKhoa() { if (!dangKhoa || nhuongGeoLab || !cuaSo || cuaSo.isDestroyed()) return; if (cuaSo.isMinimized()) cuaSo.restore(); cuaSo.show(); cuaSo.moveTop(); cuaSo.focus(); }
ipcMain.handle('khoa-app', (e, bat) => {
  if (!cuaSo || cuaSo.isDestroyed()) return false;
  dangKhoa = !!bat; nhuongGeoLab = false; clearInterval(henGiu);
  if (dangKhoa) {
    if (cuaSo.isMinimized()) cuaSo.restore();
    if (!cuaSo.isFullScreen()) cuaSo.setFullScreen(true);   // đang thu nhỏ vừa khung: bật toàn màn hình rồi mới khoá
    cuaSo.setKiosk(true); cuaSo.setAlwaysOnTop(true, 'screen-saver'); cuaSo.setMinimizable(false); cuaSo.setSkipTaskbar(true);
    henGiu = setInterval(() => { if (dangKhoa && !nhuongGeoLab && !cuaSo.isFocused()) giuKhoa(); }, 1500);
    giuKhoa();
  } else {
    cuaSo.setAlwaysOnTop(false); cuaSo.setKiosk(false); cuaSo.setMinimizable(true); cuaSo.setSkipTaskbar(false); cuaSo.setFullScreen(true);
  }
  cuaSo.webContents.send('trang-thai-man-hinh', { toan: true, khoa: dangKhoa });
  return dangKhoa;
});
ipcMain.handle('toan-man-hinh', () => { if (cuaSo && !dangKhoa) cuaSo.setFullScreen(!cuaSo.isFullScreen()); return cuaSo ? cuaSo.isFullScreen() : false; });
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

// ----- AI (đọc biểu đồ, ảnh → LaTeX): khoá API do từng thầy cô tự nhập -----
// Khoá cất mã hoá trên máy (safeStorage của Windows), KHÔNG bao giờ gửi sang giao diện: giao diện chỉ gửi yêu cầu,
// tiến trình chính gắn khoá rồi gọi thẳng nhà cung cấp.
const AI_NCC = {
  openai: { goc: 'https://api.openai.com/', dau: (k) => ({ Authorization: 'Bearer ' + k }) },
  deepseek: { goc: 'https://api.deepseek.com/', dau: (k) => ({ Authorization: 'Bearer ' + k }) },
  claude: { goc: 'https://api.anthropic.com/', dau: (k) => ({ 'x-api-key': k, 'anthropic-version': '2023-06-01' }) },
  gemini: { goc: 'https://generativelanguage.googleapis.com/', dau: (k) => ({ 'x-goog-api-key': k }) },
};
function aiTep() { return path.join(app.getPath('userData'), 'ai-khoa.dat'); }
function aiDoc() {
  try { const raw = fs.readFileSync(aiTep()); return JSON.parse(safeStorage.isEncryptionAvailable() ? safeStorage.decryptString(raw) : raw.toString('utf8')) || {}; } catch (e) { return {}; }
}
function aiGhi(d) {
  try { const s = JSON.stringify(d || {}); fs.writeFileSync(aiTep(), safeStorage.isEncryptionAvailable() ? safeStorage.encryptString(s) : s); } catch (e) { }
}
ipcMain.handle('ai-khoa', (e, { hd, ncc, khoa }) => {
  const d = aiDoc();
  if ((hd === 'ghi' || hd === 'xoa') && !AI_NCC[ncc]) return { ok: false };
  if (hd === 'ghi') { d[ncc] = String(khoa || '').trim(); aiGhi(d); }
  if (hd === 'xoa') { delete d[ncc]; aiGhi(d); }
  const tt = {};   // chỉ trả về có khoá hay không và 4 kí tự cuối để nhận ra
  Object.keys(AI_NCC).forEach((k) => { tt[k] = d[k] ? { co: true, duoi: d[k].slice(-4) } : { co: false }; });
  return { ok: true, trangThai: tt };
});
ipcMain.handle('ai-goi', async (e, yc) => {
  const n = AI_NCC[yc && yc.ncc], url = String((yc && yc.url) || '');
  if (!n || !url.startsWith(n.goc)) return { status: 0, text: 'Địa chỉ không hợp lệ' };
  const khoa = aiDoc()[yc.ncc]; if (!khoa) return { status: 401, text: 'Chưa nhập khoá API', chuaCoKhoa: true };
  try {
    const r = await net.fetch(url, { method: yc.method || 'GET', headers: Object.assign({ 'Content-Type': 'application/json' }, n.dau(khoa)), body: yc.body == null ? undefined : yc.body });
    return { status: r.status, text: await r.text() };
  } catch (err) { return { status: 0, text: 'Không kết nối được: ' + (err && err.message || err) }; }
});

// ----- Quy tắc chuẩn hoá LaTeX gửi kèm cho AI: lấy bản mới nhất trên GitHub, lưu tạm trên máy, không có mạng thì dùng bản đóng gói -----
const QT_URL = 'https://raw.githubusercontent.com/tthuu-pixel/geoink/main/src/quytac/chuan-hoa-latex-toan.md';
function qtPhienBan(t) { const m = String(t || '').match(/phien-ban:\s*([\d-]+)/); return m ? m[1] : ''; }
ipcMain.handle('quy-tac-latex', async () => {
  const tepTam = path.join(app.getPath('userData'), 'quy-tac-latex.md');
  let ds = [];
  try { ds.push({ ma: fs.readFileSync(path.join(__dirname, 'src', 'quytac', 'chuan-hoa-latex-toan.md'), 'utf8'), nguon: 'đóng gói' }); } catch (e) { }
  try { ds.push({ ma: fs.readFileSync(tepTam, 'utf8'), nguon: 'đã tải' }); } catch (e) { }
  try {
    const ctl = new AbortController(), hen = setTimeout(() => ctl.abort(), 8000);
    const r = await net.fetch(QT_URL + '?t=' + Date.now(), { signal: ctl.signal }); clearTimeout(hen);
    const t = r.ok ? await r.text() : '';
    if (t.length > 5000 && qtPhienBan(t)) { ds.push({ ma: t, nguon: 'mới tải' }); try { fs.writeFileSync(tepTam, t, 'utf8'); } catch (e) { } }
  } catch (e) { }
  ds = ds.filter((x) => qtPhienBan(x.ma)).sort((a, b) => qtPhienBan(b.ma).localeCompare(qtPhienBan(a.ma)));
  return ds.length ? { ma: ds[0].ma, phienBan: qtPhienBan(ds[0].ma), nguon: ds[0].nguon } : { loi: 'Không có bộ quy tắc' };
});
// ----- Kho hình thực tế: một thư mục trên máy (nên đặt trong Google Drive của máy tính để mọi máy cùng có) -----
//   mỗi thư mục con là một chủ đề; trong đó là các tệp .svg (cũng nhận .png, .jpg, .webp)
const KH_CHU_DE = ['01 Nhà cửa - công trình', '02 Cột - trụ - đèn', '03 Cây cối - thiên nhiên', '04 Người', '05 Xe cộ - tàu thuyền',
  '06 Thang - dốc - vui chơi', '07 Hình hộp - lập phương', '08 Hình trụ', '09 Hình nón - cầu', '10 Hình tròn',
  '11 Mua bán - đời sống', '12 Đồng ruộng - vườn', '13 Khác'];
const KH_TEN = 'GeoInk - Kho hình thực tế', KH_DUOI = /\.(svg|png|jpe?g|webp)$/i;
function khCaiDat() { try { return JSON.parse(fs.readFileSync(path.join(app.getPath('userData'), 'kho-hinh.json'), 'utf8')); } catch (e) { return {}; } }
function khGhiCaiDat(c) { try { fs.writeFileSync(path.join(app.getPath('userData'), 'kho-hinh.json'), JSON.stringify(c)); } catch (e) { } }
function khTimDrive() {   // Google Drive cho máy tính: ổ G:\My Drive (hoặc "Drive của tôi")
  if (process.platform !== 'win32') return null;
  for (const o of 'GHIJKLMNOPQRSTUVWXYZDEF') for (const t of ['My Drive', 'Drive của tôi']) { const p = o + ':\\' + t; try { if (fs.statSync(p).isDirectory()) return p; } catch (e) { } }
  return null;
}
function khThuMuc() { const c = khCaiDat(); if (c.thuMuc) return c.thuMuc; return path.join(khTimDrive() || app.getPath('documents'), KH_TEN); }
function khTaoKhung(goc) {   // lần đầu: tạo thư mục kho với đủ các chủ đề; về sau người dùng tự thêm / đổi tên / xoá chủ đề
  if (fs.existsSync(goc)) return;
  fs.mkdirSync(goc, { recursive: true }); KH_CHU_DE.forEach((t) => fs.mkdirSync(path.join(goc, t), { recursive: true }));
}
// ---- nhập gói Freepik (.zip / .ai / .eps / .svg): đổi sang SVG bằng Inkscape (EPS qua Ghostscript) ----
const { execFile } = require('child_process');
function khChay(exe, args, ms) {
  return new Promise((ok, loi) => execFile(exe, args, { timeout: ms || 180000, windowsHide: true, maxBuffer: 64 * 1024 * 1024 }, (e, so, se) => {
    if (e) loi(new Error(String(se || '').split(/\r?\n/).filter((d) => d && !/WARNING|Gtk|GLib/.test(d)).slice(-2).join(' ') || e.message)); else ok(so);
  }));
}
function khTimTrong(ds) { for (const p of ds) { try { if (p && fs.statSync(p).isFile()) return p; } catch (e) { } } return null; }
function khTimInkscape() {
  if (process.platform === 'win32') {
    const goc = [process.env.ProgramFiles, process.env['ProgramFiles(x86)'], process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, 'Programs')].filter(Boolean);
    return khTimTrong([].concat(...goc.map((g) => [path.join(g, 'Inkscape', 'bin', 'inkscape.com'), path.join(g, 'Inkscape', 'bin', 'inkscape.exe'), path.join(g, 'Inkscape', 'inkscape.com')])));
  }
  return khTimTrong(['/usr/bin/inkscape', '/usr/local/bin/inkscape', '/opt/homebrew/bin/inkscape', '/Applications/Inkscape.app/Contents/MacOS/inkscape']);
}
function khTimGs() {
  if (process.platform === 'win32') {
    for (const g of [process.env.ProgramFiles, process.env['ProgramFiles(x86)']].filter(Boolean)) {
      let ds = []; try { ds = fs.readdirSync(path.join(g, 'gs')).sort().reverse(); } catch (e) { continue; }
      for (const d of ds) { const p = khTimTrong([path.join(g, 'gs', d, 'bin', 'gswin64c.exe'), path.join(g, 'gs', d, 'bin', 'gswin32c.exe')]); if (p) return p; }
    }
    return null;
  }
  return khTimTrong(['/usr/bin/gs', '/usr/local/bin/gs', '/opt/homebrew/bin/gs']);
}
async function khSangSvg(tep, tam) {
  const d = path.extname(tep).toLowerCase();
  if (d === '.svg') return fs.readFileSync(tep, 'utf8');
  const ink = khTimInkscape(); if (!ink) throw new Error('CHUA_CO_INKSCAPE');
  let vao = tep;
  if (d === '.eps' || d === '.ps') {   // EPS: Ghostscript đổi sang PDF trước (Inkscape đọc PDF ổn định hơn)
    const gs = khTimGs(); if (!gs) throw new Error('CHUA_CO_GHOSTSCRIPT');
    vao = path.join(tam, path.basename(tep) + '.pdf');
    await khChay(gs, ['-q', '-dNOPAUSE', '-dBATCH', '-dSAFER', '-dEPSCrop', '-sDEVICE=pdfwrite', '-sOutputFile=' + vao, tep]);
  } else if (d === '.ai') {   // tệp .ai đời mới là PDF: đổi đuôi cho Inkscape đọc như PDF
    vao = path.join(tam, path.basename(tep) + '.pdf'); fs.copyFileSync(tep, vao);
  }
  const ra = path.join(tam, path.basename(tep) + '.svg');
  await khChay(ink, [vao, '--export-type=svg', '--export-plain-svg', '--export-filename=' + ra]);
  return fs.readFileSync(ra, 'utf8');
}
function khTenTep(ten) { return String(ten || 'hinh').replace(/[\\/:*?"<>|]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 80) || 'hinh'; }
function khTepMoi(thu, ten, duoi) { let f = path.join(thu, ten + duoi), i = 2; while (fs.existsSync(f)) f = path.join(thu, ten + ' (' + (i++) + ')' + duoi); return f; }
function khTrongKho(g, p) { const f = path.normalize(path.join(g, p || '')); if (!f.startsWith(g)) throw new Error('Đường dẫn không hợp lệ'); return f; }

ipcMain.handle('kho-hinh', async (e, { hd, tep, du }) => {
  try {
    du = du || {};
    if (hd === 'nhapFreepik') {
      const kq = await dialog.showOpenDialog(cuaSo, { title: 'Chọn gói tải từ Freepik', properties: ['openFile', 'multiSelections'],
        filters: [{ name: 'Gói Freepik (.zip, .ai, .eps, .svg)', extensions: ['zip', 'ai', 'eps', 'svg'] }] });
      if (kq.canceled || !kq.filePaths.length) return { huy: true };
      const tam = fs.mkdtempSync(path.join(app.getPath('temp'), 'geoink-freepik-')), ra = [], loi = [];
      for (const f of kq.filePaths) {
        const ten = path.basename(f).replace(/\.[^.]+$/, '');
        try {
          let ds = [f];
          if (/\.zip$/i.test(f)) {   // giải nén; ưu tiên .ai (không cần Ghostscript), không có mới dùng .eps, rồi .svg
            const AdmZip = require('adm-zip'), z = new AdmZip(f), muc = z.getEntries().filter((x) => !x.isDirectory && !/__MACOSX/.test(x.entryName));
            const chon = ['.ai', '.eps', '.svg'].map((d) => muc.filter((x) => path.extname(x.entryName).toLowerCase() === d)).find((x) => x.length) || [];
            if (!chon.length) { loi.push(path.basename(f) + ': trong gói không có tệp .ai, .eps hay .svg'); continue; }
            const thu = path.join(tam, String(ra.length) + '-' + ten); fs.mkdirSync(thu, { recursive: true });
            ds = chon.map((x) => { const p = path.join(thu, path.basename(x.entryName)); fs.writeFileSync(p, x.getData()); return p; });
          }
          for (const p of ds) ra.push({ nguon: path.basename(p).replace(/\.[^.]+$/, ''), svg: await khSangSvg(p, tam) });
        } catch (err) {
          const m = String(err.message || err);
          if (m === 'CHUA_CO_INKSCAPE') return { canInkscape: true };
          loi.push(path.basename(f) + ': ' + (m === 'CHUA_CO_GHOSTSCRIPT' ? 'tệp .eps cần cài thêm Ghostscript (ghostscript.com)' : m));
        }
      }
      try { fs.rmSync(tam, { recursive: true, force: true }); } catch (e2) { }
      return { ds: ra, loi: loi };
    }
    if (hd === 'luuNhieu') {   // du.ds = [{ chuDe (tên thư mục), ten, svg | duLieu (data URL) }]
      const g = khThuMuc(); khTaoKhung(g); const da = [];
      for (const h of du.ds || []) {
        const thu = khTrongKho(g, h.chuDe || ''); fs.mkdirSync(thu, { recursive: true });
        if (h.svg != null) { const f = khTepMoi(thu, khTenTep(h.ten), '.svg'); fs.writeFileSync(f, h.svg, 'utf8'); da.push(f); }
        else if (h.duLieu) {
          const m = String(h.duLieu).match(/^data:image\/(svg\+xml|png|jpeg|webp)[^,]*,(.*)$/); if (!m) continue;
          const duoi = { 'svg+xml': '.svg', png: '.png', jpeg: '.jpg', webp: '.webp' }[m[1]];
          const b = /;base64/.test(h.duLieu.slice(0, 60)) ? Buffer.from(m[2], 'base64') : Buffer.from(decodeURIComponent(m[2]), 'utf8');
          const f = khTepMoi(thu, khTenTep(h.ten), duoi); fs.writeFileSync(f, b); da.push(f);
        }
      }
      return { ok: true, so: da.length };
    }
    if (hd === 'doiTen' || hd === 'chuyen') {   // tep: "thư mục/tên.svg"
      const g = khThuMuc(), f = khTrongKho(g, tep), duoi = path.extname(f);
      const thuMoi = hd === 'chuyen' ? khTrongKho(g, du.chuDe || '') : path.dirname(f);
      const moi = khTepMoi(thuMoi, hd === 'doiTen' ? khTenTep(du.ten) : path.basename(f, duoi), duoi);
      fs.renameSync(f, moi); return { ok: true };
    }
    if (hd === 'xoa') { await shell.trashItem(khTrongKho(khThuMuc(), tep)); return { ok: true }; }
    if (hd === 'taoChuDe') {
      const g = khThuMuc(); khTaoKhung(g);
      const so = fs.readdirSync(g, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => parseInt(d.name, 10)).filter((n) => n > 0);
      const ten = String(so.length ? Math.max.apply(null, so) + 1 : 1).padStart(2, '0') + ' ' + khTenTep(du.ten);
      fs.mkdirSync(path.join(g, ten), { recursive: true }); return { ok: true, thuMuc: ten };
    }
    if (hd === 'doiTenChuDe') {
      const g = khThuMuc(), cu = khTrongKho(g, du.thuMuc), so = (String(du.thuMuc).match(/^\d+\s*/) || [''])[0];
      fs.renameSync(cu, path.join(g, so + khTenTep(du.ten))); return { ok: true };
    }
    if (hd === 'xoaChuDe') { await shell.trashItem(khTrongKho(khThuMuc(), du.thuMuc)); return { ok: true }; }
    if (hd === 'chonThuMuc') {
      const kq = await dialog.showOpenDialog(cuaSo, { title: 'Chọn thư mục kho hình', properties: ['openDirectory', 'createDirectory'], defaultPath: khThuMuc() });
      if (kq.canceled || !kq.filePaths[0]) return { huy: true };
      const c = khCaiDat(); c.thuMuc = kq.filePaths[0]; khGhiCaiDat(c);
    }
    if (hd === 'moThuMuc') { const g = khThuMuc(); khTaoKhung(g); shell.openPath(g); return { ok: true }; }
    if (hd === 'doc') {   // nội dung một hình (data URL)
      const g = khThuMuc(), f = path.normalize(path.join(g, tep));
      if (!f.startsWith(g) || !KH_DUOI.test(f)) return { loi: 'Tệp không hợp lệ' };
      let b = fs.readFileSync(f); const d = path.extname(f).toLowerCase();
      if (d === '.svg') {   // SVG thiếu width/height: lấy theo viewBox để vẽ đúng tỉ lệ
        let t = b.toString('utf8'); const m = t.match(/<svg\b[^>]*>/i);
        if (m && !/\swidth=/i.test(m[0])) { const vb = m[0].match(/viewBox=["']\s*[-\d.]+[\s,]+[-\d.]+[\s,]+([\d.]+)[\s,]+([\d.]+)/i); if (vb) { t = t.replace(m[0], m[0].replace(/<svg/i, '<svg width="' + vb[1] + '" height="' + vb[2] + '"')); b = Buffer.from(t, 'utf8'); } }
      }
      const loai = d === '.svg' ? 'image/svg+xml' : d === '.png' ? 'image/png' : d === '.webp' ? 'image/webp' : 'image/jpeg';
      return { duLieu: 'data:' + loai + ';base64,' + b.toString('base64') };
    }
    // quét: danh sách chủ đề và hình
    const g = khThuMuc(); khTaoKhung(g);
    const chuDe = [];
    const quet = (thu, ten) => {
      let ds = []; try { ds = fs.readdirSync(path.join(g, thu), { withFileTypes: true }); } catch (e) { return; }
      const hinh = ds.filter((d) => d.isFile() && KH_DUOI.test(d.name)).map((d) => (thu ? thu + '/' : '') + d.name).sort((a, b) => a.localeCompare(b, 'vi'));
      if (thu) chuDe.push({ ten: ten, thuMuc: thu, hinh: hinh });
      else if (hinh.length) chuDe.push({ ten: 'Chưa xếp chủ đề', thuMuc: '', hinh: hinh });
      if (!thu) ds.filter((d) => d.isDirectory()).sort((a, b) => a.name.localeCompare(b.name, 'vi')).forEach((d) => quet(d.name, d.name.replace(/^\d+\s*/, '')));
    };
    quet('', '');
    return { thuMuc: g, chuDe: chuDe, coDrive: !!khTimDrive() };
  } catch (err) { return { loi: String(err.message || err) }; }
});

ipcMain.handle('luu-chu', async (e, { noiDung, ten, loai }) => {   // lưu tệp chữ (.tex) qua hộp thoại Lưu
  const kq = await dialog.showSaveDialog(cuaSo, { title: 'Lưu tệp', defaultPath: ten || 'de.tex', filters: [{ name: loai || 'Tệp LaTeX', extensions: [String(ten || 'de.tex').split('.').pop()] }] });
  if (kq.canceled || !kq.filePath) return { huy: true };
  try { fs.writeFileSync(kq.filePath, noiDung, 'utf8'); return { ten: kq.filePath }; } catch (err) { return { loi: String(err.message || err) }; }
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
