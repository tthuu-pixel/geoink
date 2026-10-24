// Chép giao diện ../src sang www/ cho bản Android.
// Nới chính sách nội dung (CSP) để Capacitor chạy được: cho phép script cầu nối do app chèn vào.
const fs = require('fs'), path = require('path');
const nguon = path.join(__dirname, '..', 'src'), dich = path.join(__dirname, 'www');
fs.rmSync(dich, { recursive: true, force: true });
fs.cpSync(nguon, dich, { recursive: true });
const f = path.join(dich, 'index.html');
let html = fs.readFileSync(f, 'utf8');
html = html.replace(/<meta http-equiv="Content-Security-Policy"[^>]*>/,
  `<meta http-equiv="Content-Security-Policy" content="default-src 'self' https://localhost capacitor: ; img-src 'self' data: blob: https://localhost; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' https://localhost; connect-src 'self' https://localhost">`);
html = html.replace('<meta name="viewport" content="width=device-width, initial-scale=1">',
  '<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover">');
fs.writeFileSync(f, html);
// Màn chào hoạt hình (chỉ bản Android): logo tự vẽ ở giữa, trượt sang trái, chữ GeoInk hiện bên phải.
// Kiểu dáng ở style.css (#man-chao); src/man-chao.js căn giữa logo lúc đầu và tắt màn chào khi chạy xong / khi chạm vào.
const MAN_CHAO = `<div id="man-chao" aria-hidden="true"><div class="mc-hang"><div class="mc-truot"><div class="mc-logo">
<svg viewBox="0 0 100 100"><defs><linearGradient id="mc-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2452C4"/><stop offset="1" stop-color="#1A3A9C"/></linearGradient></defs>
<rect x="4" y="4" width="92" height="92" rx="20" fill="url(#mc-g)"/>
<path class="mc-tg" d="M54.7 24.4 L24.4 74.2 L77.1 74.2 Z" fill="none" stroke="#fff" stroke-width="4.2" stroke-linejoin="round" pathLength="100"/>
<g class="mc-dinh" fill="#fff"><circle cx="54.7" cy="24.4" r="3.9"/><circle cx="24.4" cy="74.2" r="3.9"/><circle cx="77.1" cy="74.2" r="3.9"/></g>
<path class="mc-song" d="M29.3 62.3 C35 54 39 49.5 42 49.3 C47 49 52 57 58 66 C62 72 65 75.5 68 75.3 C72 75 76 69 79.8 63.3" fill="none" stroke="#FACC15" stroke-width="4.6" stroke-linecap="round" pathLength="100"/>
</svg></div></div><div class="mc-chu"><span class="mc-ten">Geo<b>Ink</b></span><span class="mc-phu">Bảng viết tay &amp; dựng hình cho giáo viên Toán</span></div></div></div>`;
html = html.replace(/<body([^>]*)>/, (m) => m + '\n' + MAN_CHAO + '\n<script src="man-chao.js"></script>');
fs.writeFileSync(f, html);
const goi = require('./package.json');
console.log('Đã chép giao diện GeoInk ' + goi.version + ' vào www/');
