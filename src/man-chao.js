// Màn chào hoạt hình lúc mở app, chỉ dùng cho bản Android (khung #man-chao nằm sẵn trong index.html; bản máy tính bỏ đi ngay).
// Lúc đầu logo nằm giữa màn hình: dời logo sang phải nửa bề rộng phần chữ, rồi CSS trượt về chỗ.
(function () {
  var m = document.getElementById('man-chao'); if (!m) return;
  var cap = window.Capacitor, laAndroid = !!(cap && (window.androidBridge || (cap.getPlatform && cap.getPlatform() === 'android')));
  if (!laAndroid) { m.remove(); return; }   // chỉ bản máy tính bảng có màn chào (Capacitor nạp cầu nối trước mọi script của trang)
  var hang = m.querySelector('.mc-hang'), chu = m.querySelector('.mc-chu');
  hang.style.setProperty('--dx', Math.round(chu.getBoundingClientRect().width / 2) + 'px');
  var tat = function () { if (!m) return; var x = m; m = null; x.classList.add('xong'); setTimeout(function () { x.remove(); }, 500); };
  var hen = setTimeout(tat, 4200);   // chạy xong khoảng 4,2 giây
  m.addEventListener('pointerdown', function () { clearTimeout(hen); tat(); });
})();
