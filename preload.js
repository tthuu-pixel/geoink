// Cầu nối an toàn giữa giao diện và tiến trình chính
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('mayTinh', {
  luu: (noiDung, ten, hoiLai) => ipcRenderer.invoke('luu', { noiDung, ten, hoiLai }),
  mo: () => ipcRenderer.invoke('mo'),
  xuatAnh: (duLieu, ten) => ipcRenderer.invoke('xuat-anh', { duLieu, ten }),
  moLink: (url) => ipcRenderer.invoke('mo-link', url),
  toanManHinh: () => ipcRenderer.invoke('toan-man-hinh'),
  phienBan: () => ipcRenderer.invoke('phien-ban'),
  tepKhoiDong: () => ipcRenderer.invoke('tep-khoi-dong'),
  khiMoTep: (f) => ipcRenderer.on('mo-tep', (e, d) => f(d)),
  khiHoiDong: (f) => ipcRenderer.on('hoi-dong', () => f()),
  dongThat: () => ipcRenderer.send('dong-that'),
});
