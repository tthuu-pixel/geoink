// Cầu nối an toàn giữa giao diện và tiến trình chính
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('mayTinh', {
  luu: (noiDung, ten, hoiLai) => ipcRenderer.invoke('luu', { noiDung, ten, hoiLai }),
  mo: () => ipcRenderer.invoke('mo'),
  moPdf: () => ipcRenderer.invoke('mo-pdf'),
  xuatAnh: (duLieu, ten) => ipcRenderer.invoke('xuat-anh', { duLieu, ten }),
  moLink: (url) => ipcRenderer.invoke('mo-link', url),
  toanManHinh: () => ipcRenderer.invoke('toan-man-hinh'),
  phienBan: () => ipcRenderer.invoke('phien-ban'),
  tepKhoiDong: () => ipcRenderer.invoke('tep-khoi-dong'),
  khiMoTep: (f) => ipcRenderer.on('mo-tep', (e, d) => f(d)),
  khiHoiDong: (f) => ipcRenderer.on('hoi-dong', () => f()),
  dongThat: () => ipcRenderer.send('dong-that'),
  chepAnh: (duLieu) => ipcRenderer.invoke('chep-anh', duLieu),
  docClipboard: () => ipcRenderer.invoke('doc-clipboard'),
  // thư viện sổ trên máy
  thuVien: (hd, duong, noiDung) => ipcRenderer.invoke('thu-vien', { hd, duong, noiDung }),
  // tài khoản GeoLab
  taiKhoan: (hd, duLieu) => ipcRenderer.invoke('tai-khoan', { hd, duLieu }),
  // tự cập nhật
  khiCapNhat: (f) => ipcRenderer.on('cap-nhat', (e, d) => f(d)),
  kiemTraCapNhat: () => ipcRenderer.invoke('cap-nhat-kiem-tra'),
  taiCapNhat: () => ipcRenderer.invoke('cap-nhat-tai'),
  caiCapNhat: () => ipcRenderer.send('cap-nhat-cai'),
});
