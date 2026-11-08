// GeoLab cho Windows: chạy toàn bộ trang GeoLab ngay trong máy (không cần mạng để mở mô hình).
//  · Nội dung trang nằm trong thư mục web/ đóng gói kèm app, phục vụ qua địa chỉ geolab://app/…
//  · Có mạng: tự lấy nội dung mới nhất của GeoLab từ GitHub (chỉ tải tệp đã đổi), lưu vào thư mục dữ liệu của app.
//  · Đăng nhập lần đầu cần mạng; phiên được ghi nhớ 30 ngày nên mất mạng vẫn vào được.
//  · Bản app mới (phần khung) tự cập nhật qua GitHub Releases như GeoInk.
const { app, BrowserWindow, protocol, net, shell, Menu, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

const KHO = 'tthuu-pixel/hinh-hoc-tuong-tac', NHANH = 'main';
const GOC_WEB = app.isPackaged ? path.join(process.resourcesPath, 'web') : path.join(__dirname, 'web');   // nội dung đóng gói kèm app
const DU_LIEU = () => path.join(app.getPath('userData'), 'web');   // nội dung đã cập nhật
const GIO_PHIEN = 24 * 30;                                          // giữ đăng nhập 30 ngày trên app

protocol.registerSchemesAsPrivileged([{ scheme: 'geolab', privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true, stream: true } }]);

let cuaSo = null;

// ---------- thư mục nội dung đang dùng ----------
function docJson(f) { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { return null; } }
function thuMucDangDung() {
  const d = DU_LIEU(), ttDl = docJson(path.join(d, '.phien-ban.json')), ttGoc = docJson(path.join(GOC_WEB, '.phien-ban.json')) || {};
  // nội dung đã tải mới hơn bản đóng gói thì dùng; cài bản app mới hơn thì quay về bản đóng gói
  if (ttDl && ttDl.sha && (ttDl.luc || 0) >= (ttGoc.luc || 0)) return d;
  return GOC_WEB;
}
let WEB = GOC_WEB;

const KIEU = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif', '.ico': 'image/x-icon',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.txt': 'text/plain; charset=utf-8', '.mp4': 'video/mp4', '.glb': 'model/gltf-binary' };

// Gọi máy chủ tài khoản (Apps Script) qua tiến trình chính: không vướng CORS của địa chỉ geolab://
async function goiMayChu(req) {
  try {
    const r = await net.fetch(API_THAT, { method: 'POST', body: await req.text(), headers: { 'Content-Type': 'text/plain;charset=utf-8' }, redirect: 'follow' });
    return new Response(await r.text(), { status: r.status, headers: { 'Content-Type': 'application/json; charset=utf-8' } });
  } catch (e) { return new Response(JSON.stringify({ ok: false, mang: true, loi: 'Không kết nối được máy chủ. Kiểm tra mạng rồi thử lại.' }), { headers: { 'Content-Type': 'application/json' } }); }
}
let API_THAT = '';
function phucVu(req) {
  const u = new URL(req.url);
  if (u.host === 'api') return goiMayChu(req);
  let p = decodeURIComponent(u.pathname); if (p.endsWith('/')) p += 'index.html';
  const tep = path.normalize(path.join(WEB, p));
  if (!tep.startsWith(WEB)) return new Response('Không có', { status: 403 });
  let duLieu;
  try { duLieu = fs.readFileSync(tep); } catch (e) {
    try { duLieu = fs.readFileSync(path.normalize(path.join(GOC_WEB, p))); } catch (e2) { return new Response('Không tìm thấy ' + p, { status: 404 }); }
  }
  // trên app: giữ phiên đăng nhập lâu (dùng được khi mất mạng)
  if (p === '/chung/cau-hinh.js') {
    const m = duLieu.toString('utf8').match(/API_URL:\s*'([^']*)'/); API_THAT = m ? m[1] : '';
    duLieu = Buffer.concat([duLieu, Buffer.from('\nwindow.CAU_HINH.GIO_PHIEN = ' + GIO_PHIEN + ';\nwindow.CAU_HINH.LA_APP = true;\n' +
      (API_THAT ? 'window.CAU_HINH.API_URL = "geolab://api/";\n' : ''))]);
  }
  return new Response(duLieu, { headers: { 'Content-Type': KIEU[path.extname(tep).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-cache' } });
}

// ---------- cửa sổ ----------
function taoCuaSo() {
  cuaSo = new BrowserWindow({
    width: 1400, height: 900, minWidth: 900, minHeight: 600, backgroundColor: '#F4F7FF', title: 'GeoLab',
    icon: path.join(__dirname, 'build', 'icon.png'),
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false, spellcheck: false },
  });
  Menu.setApplicationMenu(null);
  cuaSo.maximize();
  cuaSo.setFullScreen(true);   // mở app: toàn màn hình như GeoInk
  cuaSo.loadURL('geolab://app/index.html');
  const baoManHinh = () => { if (!cuaSo.isDestroyed()) cuaSo.webContents.send('man-hinh', cuaSo.isFullScreen()); };
  cuaSo.on('enter-full-screen', baoManHinh); cuaSo.on('leave-full-screen', baoManHinh);
  cuaSo.webContents.on('did-finish-load', baoManHinh);
  // link ngoài mở bằng trình duyệt; link nckh-geolab.com mở ngay trong app
  const diaChiTrong = (url) => { const m = url.match(/^https?:\/\/(?:www\.)?nckh-geolab\.com(\/[^#]*)?(#.*)?$/); return m ? 'geolab://app' + (m[1] || '/index.html') + (m[2] || '') : null; };
  cuaSo.webContents.setWindowOpenHandler(({ url }) => {
    const t = diaChiTrong(url); if (t) cuaSo.loadURL(t); else if (/^https?:|^mailto:/.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });
  cuaSo.webContents.on('will-navigate', (e, url) => {
    if (url.startsWith('geolab://')) return;
    e.preventDefault(); const t = diaChiTrong(url); if (t) cuaSo.loadURL(t); else if (/^https?:|^mailto:/.test(url)) shell.openExternal(url);
  });
  // phím: F11 toàn màn hình, F5 / Ctrl+R tải lại, Alt+← quay lại
  cuaSo.webContents.on('before-input-event', (e, k) => {
    if (k.type !== 'keyDown') return;
    if (k.key === 'F11') { e.preventDefault(); cuaSo.setFullScreen(!cuaSo.isFullScreen()); }
    else if (k.key === 'F5' || ((k.control || k.meta) && k.key.toLowerCase() === 'r')) { e.preventDefault(); cuaSo.webContents.reload(); }
    else if (k.alt && k.key === 'ArrowLeft' && cuaSo.webContents.navigationHistory.canGoBack()) { e.preventDefault(); cuaSo.webContents.navigationHistory.goBack(); }
  });
  cuaSo.webContents.once('did-finish-load', () => { setTimeout(capNhatNoiDung, 5000); setTimeout(kiemTraBanApp, 8000); });
  setInterval(capNhatNoiDung, 2 * 3600 * 1000);
}
ipcMain.on('toan-man-hinh', () => { if (cuaSo) cuaSo.setFullScreen(!cuaSo.isFullScreen()); });
ipcMain.on('thu-nho', () => { if (cuaSo) { if (cuaSo.isFullScreen()) cuaSo.setFullScreen(false); cuaSo.minimize(); } });
ipcMain.on('thoat', () => app.quit());
ipcMain.on('tai-lai', () => { WEB = thuMucDangDung(); if (cuaSo) cuaSo.webContents.reload(); });
ipcMain.handle('phien-ban', () => ({ app: app.getVersion(), noiDung: (docJson(path.join(WEB, '.phien-ban.json')) || {}).sha || '' }));
function bao(loai, duLieu) { if (cuaSo && !cuaSo.isDestroyed()) cuaSo.webContents.send('thong-bao', Object.assign({ loai }, duLieu || {})); }

// ---------- cập nhật nội dung GeoLab (chỉ tải các tệp đã đổi) ----------
let dangCapNhat = false;
async function layJson(url) {
  const r = await net.fetch(url, { headers: { 'User-Agent': 'GeoLab-PC', Accept: 'application/vnd.github+json' } });
  if (!r.ok) throw new Error('GitHub trả lời ' + r.status); return r.json();
}
function chepThuMuc(nguon, dich) { fs.cpSync(nguon, dich, { recursive: true }); }
async function capNhatNoiDung() {
  if (dangCapNhat) return; dangCapNhat = true;
  try {
    const hien = docJson(path.join(WEB, '.phien-ban.json')) || {}, dsCu = docJson(path.join(WEB, '.ds.json')) || {};
    const cm = await layJson('https://api.github.com/repos/' + KHO + '/commits/' + NHANH);
    if (!cm || !cm.sha || cm.sha === hien.sha) return;
    const cay = await layJson('https://api.github.com/repos/' + KHO + '/git/trees/' + cm.sha + '?recursive=1');
    const dsMoi = {};
    (cay.tree || []).forEach((x) => { if (x.type === 'blob' && !/(^|\/)\./.test(x.path) && x.path !== 'CNAME') dsMoi[x.path] = x.sha; });
    if (!Object.keys(dsMoi).length) return;
    // dựng bản mới trong thư mục tạm: chép bản đang dùng, tải tệp đổi, xoá tệp bỏ
    const tam = DU_LIEU() + '-moi'; fs.rmSync(tam, { recursive: true, force: true }); chepThuMuc(WEB, tam);
    const doi = Object.keys(dsMoi).filter((p) => dsCu[p] !== dsMoi[p]);
    for (const p of doi) {
      const r = await net.fetch('https://raw.githubusercontent.com/' + KHO + '/' + cm.sha + '/' + p.split('/').map(encodeURIComponent).join('/'));
      if (!r.ok) throw new Error('Không tải được ' + p);
      const f = path.join(tam, p); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, Buffer.from(await r.arrayBuffer()));
    }
    Object.keys(dsCu).forEach((p) => { if (!dsMoi[p]) fs.rmSync(path.join(tam, p), { force: true }); });
    fs.writeFileSync(path.join(tam, '.ds.json'), JSON.stringify(dsMoi));
    fs.writeFileSync(path.join(tam, '.phien-ban.json'), JSON.stringify({ sha: cm.sha, luc: Date.parse(cm.commit && cm.commit.committer && cm.commit.committer.date) || Date.now(), tai: Date.now() }));
    const d = DU_LIEU(), cu = d + '-cu';
    fs.rmSync(cu, { recursive: true, force: true });
    if (fs.existsSync(d)) fs.renameSync(d, cu);
    fs.renameSync(tam, d); fs.rmSync(cu, { recursive: true, force: true });
    if (doi.length) bao('noiDung', { soTep: doi.length }); else WEB = thuMucDangDung();
  } catch (e) {
    // mất mạng, GitHub giới hạn lượt hỏi…: lần sau thử lại, vẫn dùng nội dung đang có
  } finally { dangCapNhat = false; }
}

// ---------- cập nhật phần khung app (bản cài đặt mới) ----------
let autoUpdater = null;
function kiemTraBanApp() {
  if (!app.isPackaged) return;
  try { autoUpdater = autoUpdater || require('electron-updater').autoUpdater; } catch (e) { return; }
  autoUpdater.autoDownload = false; autoUpdater.autoInstallOnAppQuit = true;
  autoUpdater.removeAllListeners();
  autoUpdater.on('update-available', (i) => bao('banApp', { phienBan: i.version }));
  autoUpdater.on('download-progress', (p) => bao('tien', { phanTram: Math.round(p.percent || 0) }));
  autoUpdater.on('update-downloaded', () => autoUpdater.quitAndInstall(true, true));
  autoUpdater.on('error', (e) => bao('loi', { loi: String((e && e.message) || e).split('\n')[0] }));
  autoUpdater.checkForUpdates().catch(() => { });
}
ipcMain.on('cai-ban-app', () => { if (autoUpdater) autoUpdater.downloadUpdate().catch((e) => bao('loi', { loi: String(e.message || e) })); });

if (!app.requestSingleInstanceLock()) app.quit();
else {
  app.on('second-instance', () => { if (cuaSo) { if (cuaSo.isMinimized()) cuaSo.restore(); cuaSo.focus(); } });
  app.whenReady().then(() => {
    WEB = thuMucDangDung();
    protocol.handle('geolab', phucVu);
    taoCuaSo();
  });
  app.on('window-all-closed', () => app.quit());
}
