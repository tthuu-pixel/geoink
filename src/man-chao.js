// Màn chào hoạt hình lúc mở app (khung #man-chao trong index.html, dùng cho cả máy tính và Android).
// Lúc đầu logo nằm giữa màn hình: dời logo sang phải nửa bề rộng phần chữ, rồi CSS trượt về chỗ.
(function () {
  var m = document.getElementById('man-chao'); if (!m) return;
  var hang = m.querySelector('.mc-hang'), chu = m.querySelector('.mc-chu');
  hang.style.setProperty('--dx', Math.round(chu.getBoundingClientRect().width / 2) + 'px');
  var tat = function () { if (!m) return; var x = m; m = null; x.classList.add('xong'); setTimeout(function () { x.remove(); }, 500); };
  var hen = setTimeout(tat, 4200);   // chạy xong khoảng 4,2 giây
  m.addEventListener('pointerdown', function () { clearTimeout(hen); tat(); });
})();
