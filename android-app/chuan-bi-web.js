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
const goi = require('./package.json');
console.log('Đã chép giao diện GeoInk ' + goi.version + ' vào www/');
