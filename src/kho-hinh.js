// Kho hình thực tế (bản máy tính): đọc các hình SVG trong một thư mục trên máy, mỗi thư mục con là một chủ đề.
// Nên đặt thư mục kho trong Google Drive cho máy tính (ổ G:\My Drive) để mọi máy cùng tài khoản có chung kho.
// Bấm một hình là chèn lên bảng (thành ảnh: kéo, đổi cỡ, khoá như ảnh dán).
var GI = window.GI || (window.GI = {});
GI.khoHinh = (function () {
  var MT = window.mayTinh || null;
  var hop = null, ds = null, chon = 0, tim = '', anhDem = {}, khiChen = null;
  function $(s) { return hop.querySelector(s); }
  function thoat(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function tenHinh(tep) { return tep.split('/').pop().replace(/\.[a-z]+$/i, '').replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim(); }
  function boDau(s) { return String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase(); }

  function tao() {
    hop = document.createElement('div'); hop.id = 'hop-kho-hinh'; hop.className = 'hop an'; hop.setAttribute('role', 'dialog');
    hop.innerHTML = '<div class="hop-noi-dung kh-hop">' +
      '<div class="kh-dau"><h2>Hình thực tế</h2><input class="kh-tim" placeholder="Tìm hình… (ví dụ: cây, thang, cột cờ)" spellcheck="false">' +
      '<button class="nut chu" data-kh="lamMoi" title="Đọc lại thư mục kho">↻ Làm mới</button><button class="nut chu" data-kh="moThuMuc" title="Mở thư mục kho để thêm hình">📂 Mở thư mục kho</button>' +
      '<button class="nut chu" data-kh="doiThuMuc" title="Chọn thư mục khác làm kho">Đổi thư mục…</button><button class="nut chu" data-kh="dong">Đóng</button></div>' +
      '<div class="kh-than"><div class="kh-chu-de"></div><div class="kh-luoi"></div></div>' +
      '<div class="kh-chan"></div></div>';
    document.body.appendChild(hop);
    hop.addEventListener('pointerdown', function (e) { if (e.target === hop) dong(); });
    hop.addEventListener('click', function (e) {
      var b = e.target.closest('[data-kh]'); if (b) return lenh(b.dataset.kh);
      var cd = e.target.closest('[data-cd]'); if (cd) { chon = +cd.dataset.cd; tim = ''; $('.kh-tim').value = ''; ve(); return; }
      var h = e.target.closest('[data-tep]'); if (h) return chenHinh(h.dataset.tep);
    });
    $('.kh-tim').addEventListener('input', function () { tim = this.value.trim(); ve(); });
    hop.addEventListener('keydown', function (e) { if (e.key === 'Escape') dong(); e.stopPropagation(); });
  }
  function lenh(k) {
    if (k === 'dong') return dong();
    if (k === 'moThuMuc') return MT.khoHinh('moThuMuc');
    if (k === 'doiThuMuc') return MT.khoHinh('chonThuMuc').then(function (r) { if (r && !r.huy) quet(); });
    if (k === 'lamMoi') { anhDem = {}; return quet(); }
  }
  function quet() {
    $('.kh-luoi').innerHTML = '<p class="kh-rong">Đang đọc kho hình…</p>';
    return MT.khoHinh('quet').then(function (r) {
      if (!r || r.loi) { $('.kh-luoi').innerHTML = '<p class="kh-rong">Không đọc được kho: ' + thoat(r && r.loi) + '</p>'; return; }
      ds = r; if (chon >= ds.chuDe.length) chon = 0;
      // mở chủ đề đầu tiên có hình
      if (!ds.chuDe[chon] || !ds.chuDe[chon].hinh.length) { for (var i = 0; i < ds.chuDe.length; i++) if (ds.chuDe[i].hinh.length) { chon = i; break; } }
      var tong = ds.chuDe.reduce(function (t, c) { return t + c.hinh.length; }, 0);
      $('.kh-chan').innerHTML = 'Thư mục kho: <b>' + thoat(ds.thuMuc) + '</b> · ' + tong + ' hình' +
        (ds.coDrive ? '' : ' · <span class="kh-nhac">Mẹo: cài Google Drive cho máy tính rồi chọn thư mục kho trong ổ Google Drive để mọi máy có chung kho.</span>');
      ve();
    });
  }
  function ve() {
    if (!ds) return;
    $('.kh-chu-de').innerHTML = ds.chuDe.map(function (c, i) {
      return '<button data-cd="' + i + '" class="' + (i === chon && !tim ? 'bat' : '') + '"><span>' + thoat(c.ten) + '</span><b>' + c.hinh.length + '</b></button>';
    }).join('');
    var dsHinh;
    if (tim) { var q = boDau(tim); dsHinh = []; ds.chuDe.forEach(function (c) { c.hinh.forEach(function (t) { if (boDau(tenHinh(t) + ' ' + c.ten).indexOf(q) >= 0) dsHinh.push(t); }); }); }
    else dsHinh = (ds.chuDe[chon] || { hinh: [] }).hinh;
    var luoi = $('.kh-luoi');
    if (!dsHinh.length) {
      luoi.innerHTML = tim ? '<p class="kh-rong">Không có hình nào khớp “' + thoat(tim) + '”.</p>'
        : '<div class="kh-rong"><b>Chủ đề này chưa có hình.</b><br>Bấm <b>📂 Mở thư mục kho</b>, bỏ các tệp .svg vào đúng thư mục chủ đề, rồi bấm <b>↻ Làm mới</b>.</div>';
      return;
    }
    luoi.innerHTML = dsHinh.map(function (t) {
      return '<button class="kh-o" data-tep="' + thoat(t) + '" title="' + thoat(tenHinh(t)) + ' · bấm để chèn lên bảng"><span class="kh-anh">' +
        (anhDem[t] ? '<img src="' + anhDem[t] + '" alt="">' : '') + '</span><small>' + thoat(tenHinh(t)) + '</small></button>';
    }).join('');
    // tải ảnh thu nhỏ dần dần (ít một), không làm đứng app
    var can = dsHinh.filter(function (t) { return !anhDem[t]; }), dang = 0;
    (function tiep() {
      while (dang < 6 && can.length) {
        var t = can.shift(); dang++;
        MT.khoHinh('doc', t).then(function (t2) { return function (r) {
          dang--; if (r && r.duLieu) { anhDem[t2] = r.duLieu; var o = luoi.querySelector('[data-tep="' + CSS.escape(t2) + '"] .kh-anh'); if (o) o.innerHTML = '<img src="' + r.duLieu + '" alt="">'; }
          tiep();
        }; }(t));
      }
    })();
  }
  function chenHinh(t) {
    var xong = function (d) { if (!d) return; dong(); if (khiChen) khiChen(d, tenHinh(t)); };
    if (anhDem[t]) return xong(anhDem[t]);
    MT.khoHinh('doc', t).then(function (r) { if (r && r.duLieu) { anhDem[t] = r.duLieu; xong(r.duLieu); } });
  }
  function dong() { if (hop) hop.classList.add('an'); }
  function mo(chen) {
    khiChen = chen; if (!hop) tao();
    hop.classList.remove('an'); setTimeout(function () { $('.kh-tim').focus(); }, 30);
    quet();
  }
  return { mo: mo };
})();
