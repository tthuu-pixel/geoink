// Cầu nối cho lớp phủ cắt hình (chọn vùng trên ảnh chụp màn hình)
const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('catHinh', {
  khiCoAnh: (f) => ipcRenderer.on('anh-man-hinh', (e, d) => f(d)),
  chon: (vung) => ipcRenderer.send('cat-chon', vung),
});
