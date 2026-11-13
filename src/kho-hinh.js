// Kho hình thực tế (bản máy tính): đọc các hình SVG trong một thư mục trên máy, mỗi thư mục con là một chủ đề.
// Nên đặt thư mục kho trong Google Drive cho máy tính (ổ G:\My Drive) để mọi máy cùng tài khoản có chung kho.
//  · Bấm một hình là chèn lên bảng (thành ảnh: kéo, đổi cỡ, khoá như ảnh dán).
//  · Nhập từ Freepik: chọn gói .zip / .ai / .eps → đổi sang SVG (Inkscape), tự xoá nền, tách từng hình, xem trước rồi lưu vào chủ đề.
//  · Chuột phải vào hình: đổi tên, chuyển chủ đề, xoá. Chuột phải vào chủ đề: đổi tên, xoá. Nút + Chủ đề.
var GI = window.GI || (window.GI = {});
GI.khoHinh = (function () {
  var MT = window.mayTinh || null;
  var hop = null, ds = null, chon = 0, tim = '', anhDem = {}, khiChen = null;
  function $(s) { return hop.querySelector(s); }
  function thoat(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function tenHinh(tep) { return tep.split('/').pop().replace(/\.[a-z]+$/i, '').replace(/[_]+/g, ' ').replace(/\s+/g, ' ').trim(); }
  function boDau(s) { return String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase(); }
  function bao(s, loi) { var e = $('.kh-bao'); e.textContent = s || ''; e.className = 'kh-bao' + (loi ? ' loi' : ''); if (s && !loi) { clearTimeout(bao.t); bao.t = setTimeout(function () { e.textContent = ''; }, 4000); } }

  // ---------- hộp hỏi nhỏ (nhập chữ / chọn) ----------
  function hoiNho(tieuDe, o) {
    return new Promise(function (ok) {
      var n = document.createElement('div'); n.className = 'kh-hoi';
      n.innerHTML = '<div class="kh-hoi-the"><b>' + thoat(tieuDe) + '</b>' +
        (o.ds ? '<select>' + o.ds.map(function (x, i) { return '<option value="' + i + '"' + (i === o.chon ? ' selected' : '') + '>' + thoat(x) + '</option>'; }).join('') + '</select>' : '<input spellcheck="false">') +
        (o.ghiChu ? '<small>' + thoat(o.ghiChu) + '</small>' : '') +
        '<div><button class="nut chu" data-h="0">Huỷ</button><button class="nut chu chinh" data-h="1">' + thoat(o.nut || 'Đồng ý') + '</button></div></div>';
      hop.appendChild(n);
      var vao = n.querySelector('input, select'); if (o.gt != null && vao.tagName === 'INPUT') vao.value = o.gt;
      setTimeout(function () { vao.focus(); if (vao.select) vao.select(); }, 20);
      function xong(dong) { var v = dong ? (vao.tagName === 'SELECT' ? +vao.value : vao.value.trim()) : null; n.remove(); ok(v); }
      n.addEventListener('click', function (e) { var b = e.target.closest('[data-h]'); if (b) xong(b.dataset.h === '1'); else if (e.target === n) xong(false); });
      vao.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); xong(true); } if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); xong(false); } });
    });
  }
  function xacNhan(tieuDe, ghiChu) { return hoiNho(tieuDe, { ds: ['Có, ' + (ghiChu || 'tiếp tục')], chon: 0, nut: 'Đồng ý' }).then(function (v) { return v != null; }); }
  function menuNho(x, y, muc) {
    var cu = document.getElementById('kh-menu'); if (cu) cu.remove();
    var m = document.createElement('div'); m.id = 'kh-menu';
    m.innerHTML = muc.map(function (x2, i) { return '<button data-m="' + i + '"' + (x2.do ? ' class="do"' : '') + '>' + thoat(x2.ten) + '</button>'; }).join('');
    document.body.appendChild(m);
    m.style.left = Math.min(x, window.innerWidth - m.offsetWidth - 8) + 'px'; m.style.top = Math.min(y, window.innerHeight - m.offsetHeight - 8) + 'px';
    m.addEventListener('click', function (e) { var b = e.target.closest('[data-m]'); m.remove(); if (b) muc[+b.dataset.m].f(); });
    setTimeout(function () { document.addEventListener('pointerdown', function bo(e) { if (!m.contains(e.target)) { m.remove(); document.removeEventListener('pointerdown', bo, true); } }, true); }, 0);
  }

  // ---------- bảng kho ----------
  function tao() {
    hop = document.createElement('div'); hop.id = 'hop-kho-hinh'; hop.className = 'hop an'; hop.setAttribute('role', 'dialog');
    hop.innerHTML = '<div class="hop-noi-dung kh-hop">' +
      '<div class="kh-dau"><h2>Hình thực tế</h2><input class="kh-tim" placeholder="Tìm hình… (ví dụ: cây, thang, cột cờ)" spellcheck="false">' +
      '<button class="nut chu chinh" data-kh="nhap" title="Chọn gói .zip (hoặc .ai, .eps, .svg) tải từ Freepik: tự đổi sang SVG, xoá nền, tách từng hình">⬇ Nhập từ Freepik…</button>' +
      '<button class="nut chu" data-kh="lamMoi" title="Đọc lại thư mục kho">↻</button><button class="nut chu" data-kh="moThuMuc" title="Mở thư mục kho trong Windows">📂</button>' +
      '<button class="nut chu" data-kh="doiThuMuc" title="Chọn thư mục khác làm kho">Đổi thư mục…</button><button class="nut chu" data-kh="dong">Đóng</button></div>' +
      '<div class="kh-than"><div class="kh-trai"><div class="kh-chu-de"></div><button class="nut chu kh-them-cd" data-kh="themChuDe">＋ Chủ đề mới</button></div><div class="kh-luoi"></div></div>' +
      '<div class="kh-chan"><span class="kh-bao"></span><span class="kh-tt"></span></div></div>';
    document.body.appendChild(hop);
    hop.addEventListener('pointerdown', function (e) { if (e.target === hop) dong(); });
    hop.addEventListener('click', function (e) {
      var b = e.target.closest('[data-kh]'); if (b) return lenh(b.dataset.kh);
      var cd = e.target.closest('[data-cd]'); if (cd) { chon = +cd.dataset.cd; tim = ''; $('.kh-tim').value = ''; ve(); return; }
      var h = e.target.closest('[data-tep]'); if (h) return chenHinh(h.dataset.tep);
    });
    hop.addEventListener('contextmenu', function (e) {
      var h = e.target.closest('[data-tep]'), cd = e.target.closest('[data-cd]');
      if (h) { e.preventDefault(); return menuHinh(h.dataset.tep, e.clientX, e.clientY); }
      if (cd) { e.preventDefault(); return menuChuDe(+cd.dataset.cd, e.clientX, e.clientY); }
    });
    $('.kh-tim').addEventListener('input', function () { tim = this.value.trim(); ve(); });
    hop.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !hop.querySelector('.kh-hoi') && !hop.querySelector('.kh-nhap')) dong(); e.stopPropagation(); });
  }
  function dsChuDeThat() { return (ds ? ds.chuDe : []).filter(function (c) { return c.thuMuc; }); }
  function lenh(k) {
    if (k === 'dong') return dong();
    if (k === 'moThuMuc') return MT.khoHinh('moThuMuc');
    if (k === 'doiThuMuc') return MT.khoHinh('chonThuMuc').then(function (r) { if (r && !r.huy) { anhDem = {}; quet(); } });
    if (k === 'lamMoi') { anhDem = {}; return quet(); }
    if (k === 'nhap') return nhapFreepik();
    if (k === 'themChuDe') return hoiNho('Tên chủ đề mới', { gt: '', nut: 'Tạo' }).then(function (ten) {
      if (!ten) return; MT.khoHinh('taoChuDe', null, { ten: ten }).then(function (r) {
        if (r && r.loi) return bao(r.loi, true);
        quet().then(function () { var i = ds.chuDe.findIndex(function (c) { return c.thuMuc === r.thuMuc; }); if (i >= 0) { chon = i; ve(); } });
      });
    });
  }
  function menuHinh(tep, x, y) {
    var cds = dsChuDeThat();
    menuNho(x, y, [
      { ten: 'Chèn lên bảng', f: function () { chenHinh(tep); } },
      { ten: 'Đổi tên…', f: function () { hoiNho('Đổi tên hình', { gt: tenHinh(tep), nut: 'Đổi tên' }).then(function (ten) { if (ten) MT.khoHinh('doiTen', tep, { ten: ten }).then(xongSua); }); } },
      { ten: 'Chuyển sang chủ đề…', f: function () {
        var hien = tep.split('/')[0];
        hoiNho('Chuyển “' + tenHinh(tep) + '” sang chủ đề', { ds: cds.map(function (c) { return c.ten; }), chon: Math.max(0, cds.findIndex(function (c) { return c.thuMuc === hien; })), nut: 'Chuyển' })
          .then(function (i) { if (i != null) MT.khoHinh('chuyen', tep, { chuDe: cds[i].thuMuc }).then(xongSua); });
      } },
      { ten: 'Xoá (vào Thùng rác)', do: true, f: function () { MT.khoHinh('xoa', tep).then(xongSua); } },
    ]);
  }
  function menuChuDe(i, x, y) {
    var c = ds.chuDe[i]; if (!c || !c.thuMuc) return;
    menuNho(x, y, [
      { ten: 'Đổi tên chủ đề…', f: function () { hoiNho('Đổi tên chủ đề', { gt: c.ten, nut: 'Đổi tên' }).then(function (ten) { if (ten) MT.khoHinh('doiTenChuDe', null, { thuMuc: c.thuMuc, ten: ten }).then(xongSua); }); } },
      { ten: 'Xoá chủ đề (vào Thùng rác)', do: true, f: function () {
        (c.hinh.length ? xacNhan('Xoá chủ đề “' + c.ten + '” cùng ' + c.hinh.length + ' hình?', 'xoá') : Promise.resolve(true))
          .then(function (dongY) { if (dongY) MT.khoHinh('xoaChuDe', null, { thuMuc: c.thuMuc }).then(xongSua); });
      } },
    ]);
  }
  function xongSua(r) { if (r && r.loi) bao(r.loi, true); else { anhDem = {}; quet(); } }
  function quet() {
    if (!ds) $('.kh-luoi').innerHTML = '<p class="kh-rong">Đang đọc kho hình…</p>';
    return MT.khoHinh('quet').then(function (r) {
      if (!r || r.loi) { $('.kh-luoi').innerHTML = '<p class="kh-rong">Không đọc được kho: ' + thoat(r && r.loi) + '</p>'; return; }
      ds = r; if (chon >= ds.chuDe.length) chon = 0;
      if (!ds.chuDe[chon] || !ds.chuDe[chon].hinh.length) { for (var i = 0; i < ds.chuDe.length; i++) if (ds.chuDe[i].hinh.length) { chon = i; break; } }
      var tong = ds.chuDe.reduce(function (t, c) { return t + c.hinh.length; }, 0);
      $('.kh-tt').innerHTML = 'Thư mục kho: <b>' + thoat(ds.thuMuc) + '</b> · ' + tong + ' hình' +
        (ds.coDrive ? '' : ' · <span class="kh-nhac">Mẹo: cài Google Drive cho máy tính rồi chọn thư mục kho trong ổ Google Drive để mọi máy có chung kho.</span>');
      ve();
    });
  }
  function ve() {
    if (!ds) return;
    $('.kh-chu-de').innerHTML = ds.chuDe.map(function (c, i) {
      return '<button data-cd="' + i + '" class="' + (i === chon && !tim ? 'bat' : '') + '" title="Chuột phải: đổi tên, xoá chủ đề"><span>' + thoat(c.ten) + '</span><b>' + c.hinh.length + '</b></button>';
    }).join('');
    var dsHinh;
    if (tim) { var q = boDau(tim); dsHinh = []; ds.chuDe.forEach(function (c) { c.hinh.forEach(function (t) { if (boDau(tenHinh(t) + ' ' + c.ten).indexOf(q) >= 0) dsHinh.push(t); }); }); }
    else dsHinh = (ds.chuDe[chon] || { hinh: [] }).hinh;
    var luoi = $('.kh-luoi');
    if (!dsHinh.length) {
      luoi.innerHTML = tim ? '<p class="kh-rong">Không có hình nào khớp “' + thoat(tim) + '”.</p>'
        : '<div class="kh-rong"><b>Chủ đề này chưa có hình.</b><br>Bấm <b>⬇ Nhập từ Freepik…</b> để thêm hình (chọn gói .zip vừa tải về),<br>hoặc kéo thả tệp .svg vào đây.</div>';
      return;
    }
    luoi.innerHTML = dsHinh.map(function (t) {
      return '<button class="kh-o" data-tep="' + thoat(t) + '" title="' + thoat(tenHinh(t)) + ' · bấm để chèn lên bảng · chuột phải: đổi tên, chuyển chủ đề, xoá"><span class="kh-anh">' +
        (anhDem[t] ? '<img src="' + anhDem[t] + '" alt="">' : '') + '</span><small>' + thoat(tenHinh(t)) + '</small></button>';
    }).join('');
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

  // ---------- tách hình trong một trang SVG ----------
  var VE = { path: 1, rect: 1, circle: 1, ellipse: 1, line: 1, polyline: 1, polygon: 1, text: 1, image: 1, use: 1 };
  var BO_QUA = { defs: 1, clippath: 1, mask: 1, pattern: 1, symbol: 1, marker: 1, lineargradient: 1, radialgradient: 1, filter: 1, style: 1, title: 1, desc: 1, metadata: 1, script: 1, foreignobject: 1 };
  function lamSach(goc) {   // bỏ mã chạy được và liên kết ra ngoài
    goc.querySelectorAll('script, foreignObject').forEach(function (n) { n.remove(); });
    goc.querySelectorAll('*').forEach(function (n) {
      Array.prototype.slice.call(n.attributes).forEach(function (a) {
        if (/^on/i.test(a.name)) n.removeAttribute(a.name);
        if (/href$/i.test(a.name) && /^\s*(javascript:|https?:)/i.test(a.value)) n.removeAttribute(a.name);
      });
    });
  }
  function hienThi(el) {   // phần tử có vẽ gì không (không tô, không nét, ẩn → bỏ)
    var cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0) return false;
    var tag = el.tagName.toLowerCase(); if (tag === 'image' || tag === 'use' || tag === 'text') return true;
    return !(cs.fill === 'none' && (cs.stroke === 'none' || parseFloat(cs.strokeWidth) === 0));
  }
  function laMauNhat(el) { var m = getComputedStyle(el).fill.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/); return m && +m[1] > 225 && +m[2] > 225 && +m[3] > 225; }
  function tachTrang(svgText) {
    var doc = new DOMParser().parseFromString(svgText, 'image/svg+xml'), goc = doc.documentElement;
    if (!goc || goc.tagName.toLowerCase() !== 'svg') throw new Error('Không đọc được SVG');
    lamSach(goc);
    var vb = (goc.getAttribute('viewBox') || '').split(/[\s,]+/).map(parseFloat);
    if (vb.length !== 4 || !(vb[2] > 0)) vb = [0, 0, parseFloat(goc.getAttribute('width')) || 1000, parseFloat(goc.getAttribute('height')) || 1000];
    var W = vb[2], H = vb[3], tl = Math.min(1, 1600 / Math.max(W, H));
    var hopDo = document.createElement('div'); hopDo.style.cssText = 'position:fixed;left:-30000px;top:0;pointer-events:none;contain:strict;width:2000px;height:2000px';
    var song = document.importNode(goc, true); song.setAttribute('width', W * tl); song.setAttribute('height', H * tl); song.setAttribute('viewBox', vb.join(' '));
    hopDo.appendChild(song); document.body.appendChild(hopDo);
    var R = song.getBoundingClientRect(), k = W / R.width, la = [];
    (function di(n) {
      for (var c = n.firstElementChild; c; c = c.nextElementSibling) {
        var tag = c.tagName.toLowerCase();
        if (BO_QUA[tag]) continue;
        if (VE[tag]) {
          if (!hienThi(c)) continue;
          var b = c.getBoundingClientRect(); if (!(b.width > 0 || b.height > 0)) continue;
          var x0 = vb[0] + (b.left - R.left) * k, y0 = vb[1] + (b.top - R.top) * k, x1 = x0 + b.width * k, y1 = y0 + b.height * k;
          // bỏ phần nằm hẳn ngoài trang
          if (x1 < vb[0] || y1 < vb[1] || x0 > vb[0] + W || y0 > vb[1] + H) continue;
          c.setAttribute('data-kh', la.length);
          la.push({ el: c, x0: x0, y0: y0, x1: x1, y1: y1, tag: tag });
        } else di(c);
      }
    })(song);
    // nền: phủ gần kín trang; mảng màu nhạt rất lớn; chữ "Freepik", "Designed by…"
    la.forEach(function (o) {
      var rong = (o.x1 - o.x0) / W, cao = (o.y1 - o.y0) / H;
      if (rong > 0.9 && cao > 0.9) o.nen = true;
      else if (rong * cao > 0.45 && laMauNhat(o.el)) o.nen = true;
      if (o.tag === 'text' && /freepik|designed by|www\./i.test(o.el.textContent || '')) o.nen = true;
    });
    var con = la.filter(function (o) { return !o.nen; });
    // gom các phần nằm sát / chồng nhau thành một hình
    var m = 0.012 * Math.max(W, H), cha = con.map(function (o, i) { return i; });
    function goc2(i) { while (cha[i] !== i) { cha[i] = cha[cha[i]]; i = cha[i]; } return i; }
    var thu = con.map(function (o, i) { return i; }).sort(function (a, b) { return con[a].x0 - con[b].x0; });
    for (var a = 0; a < thu.length; a++) {
      var A = con[thu[a]];
      for (var b2 = a + 1; b2 < thu.length; b2++) {
        var B = con[thu[b2]]; if (B.x0 > A.x1 + m) break;
        if (B.y0 <= A.y1 + m && B.y1 >= A.y0 - m) { var ra = goc2(thu[a]), rb = goc2(thu[b2]); if (ra !== rb) cha[ra] = rb; }
      }
    }
    var nhom = {};
    con.forEach(function (o, i) { var r = goc2(i), g = nhom[r] || (nhom[r] = { ds: [], x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity }); g.ds.push(o); g.x0 = Math.min(g.x0, o.x0); g.y0 = Math.min(g.y0, o.y0); g.x1 = Math.max(g.x1, o.x1); g.y1 = Math.max(g.y1, o.y1); });
    var dsN = Object.keys(nhom).map(function (k2) { return nhom[k2]; });
    dsN.forEach(function (g) { g.nho = (g.x1 - g.x0) * (g.y1 - g.y0) < 0.004 * W * H; });
    var hang = H * 0.15;   // thứ tự đọc: từng hàng, trái sang phải
    dsN.sort(function (p, q) { return Math.round(p.y0 / hang) - Math.round(q.y0 / hang) || p.x0 - q.x0; });
    var trang = { song: song, hopDo: hopDo, W: W, H: H, nhom: dsN };
    return trang;
  }
  function xuatNhom(trang, dsLa) {   // một hình: giữ các phần thuộc hình, bỏ phần khác, cắt khung sát mép
    var giu = {}, x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    dsLa.forEach(function (o) { giu[o.el.getAttribute('data-kh')] = 1; x0 = Math.min(x0, o.x0); y0 = Math.min(y0, o.y0); x1 = Math.max(x1, o.x1); y1 = Math.max(y1, o.y1); });
    var ban = trang.song.cloneNode(true);
    ban.querySelectorAll('[data-kh]').forEach(function (n) { if (!giu[n.getAttribute('data-kh')]) n.remove(); });
    for (var lan = 0; lan < 6; lan++) ban.querySelectorAll('g').forEach(function (g) { if (!g.querySelector('[data-kh]')) g.remove(); });
    ban.querySelectorAll('[data-kh]').forEach(function (n) { n.removeAttribute('data-kh'); });
    var le = 0.01 * Math.max(x1 - x0, y1 - y0); x0 -= le; y0 -= le; x1 += le; y1 += le;
    var w = x1 - x0, h = y1 - y0;
    ban.setAttribute('viewBox', [x0, y0, w, h].map(function (v) { return Math.round(v * 100) / 100; }).join(' '));
    ban.setAttribute('width', Math.round(w * 100) / 100); ban.setAttribute('height', Math.round(h * 100) / 100);
    ban.removeAttribute('style');
    var s = new XMLSerializer().serializeToString(ban);
    if (!/^<svg[^>]*xmlns=/.test(s)) s = s.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    return s;
  }
  function anhSvg(s) { return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(s); }

  // ---------- Nhập từ Freepik ----------
  function nhapFreepik() {
    bao('Đang chọn tệp…');
    MT.khoHinh('nhapFreepik').then(function (r) {
      bao('');
      if (!r || r.huy) return;
      if (r.canInkscape) return hoiNho('Cần cài Inkscape (miễn phí) để đọc tệp .ai / .eps', { ds: ['Mở trang tải Inkscape'], chon: 0, nut: 'Mở', ghiChu: 'Cài xong, mở lại GeoInk rồi bấm Nhập từ Freepik lần nữa. Tệp .eps cần cài thêm Ghostscript (ghostscript.com).' })
        .then(function (v) { if (v != null && MT.moLink) MT.moLink('https://inkscape.org/release/'); });
      if (r.loi && r.loi.length && !r.ds.length) return bao(r.loi.join(' · '), true);
      moXemTruoc(r.ds, r.loi || []);
    }, function (e) { bao('Không nhập được: ' + (e && e.message || e), true); });
  }
  function moXemTruoc(dsTrang, dsLoi) {
    var cds = dsChuDeThat(), cdMacDinh = ds && ds.chuDe[chon] && ds.chuDe[chon].thuMuc ? cds.findIndex(function (c) { return c.thuMuc === ds.chuDe[chon].thuMuc; }) : 0;
    var n = document.createElement('div'); n.className = 'kh-nhap';
    n.innerHTML = '<div class="kh-nhap-the"><div class="kh-nhap-dau"><h3>Nhập từ Freepik</h3><span>Kiểm tra từng hình: bỏ tích hình không cần, đặt tên, chọn chủ đề rồi bấm Lưu.</span></div>' +
      '<div class="kh-nhap-than"><p class="kh-rong">Đang tách hình…</p></div>' +
      '<div class="kh-nhap-chan"><label>Chủ đề cho tất cả <select class="kh-cd-chung"><option value="">(chọn theo từng hình)</option>' + cds.map(function (c, i) { return '<option value="' + i + '">' + thoat(c.ten) + '</option>'; }).join('') + '</select></label>' +
      '<span class="gian"></span><button class="nut chu" data-n="huy">Huỷ</button><button class="nut chu chinh" data-n="luu">Lưu vào kho</button></div></div>';
    hop.appendChild(n);
    var than = n.querySelector('.kh-nhap-than'), cacTrang = [];
    setTimeout(function () {
      var h = '';
      dsTrang.forEach(function (t, ti) {
        var tr; try { tr = tachTrang(t.svg); } catch (e) { dsLoi.push(t.nguon + ': ' + e.message); return; }
        tr.nguon = t.nguon; tr.hinh = tr.nhom.map(function (g) { return { la: g.ds, nho: g.nho }; }); cacTrang.push(tr);
        h += veTrang(cacTrang.length - 1);
      });
      than.innerHTML = (dsLoi.length ? '<p class="kh-loi">' + dsLoi.map(thoat).join('<br>') + '</p>' : '') + (h || '<p class="kh-rong">Không tách được hình nào.</p>');
      capNhatAnh();
    }, 30);
    function veTrang(ti) {
      var tr = cacTrang[ti];
      return '<section data-tr="' + ti + '"><div class="kh-tr-dau"><b>' + thoat(tr.nguon) + '</b> · ' + tr.hinh.length + ' hình' +
        '<button class="nut chu" data-n="gop" title="Gộp các hình đang tích trong gói này thành một hình">Gộp các hình đã tích</button>' +
        '<button class="nut chu" data-n="nguyen" title="Giữ nguyên cả trang thành một hình (chỉ bỏ nền)">Giữ cả trang</button></div><div class="kh-tr-luoi">' +
        tr.hinh.map(function (hh, hi) {
          return '<div class="kh-the' + (hh.nho ? ' tat' : '') + '" data-h="' + hi + '"><label class="kh-tich"><input type="checkbox"' + (hh.nho ? '' : ' checked') + '></label>' +
            '<span class="kh-anh"></span><input class="kh-ten" value="' + thoat(tr.nguon + ' ' + (hi + 1)) + '" spellcheck="false">' +
            '<select class="kh-cd">' + cds.map(function (c, i) { return '<option value="' + i + '"' + (i === Math.max(0, cdMacDinh) ? ' selected' : '') + '>' + thoat(c.ten) + '</option>'; }).join('') + '</select></div>';
        }).join('') + '</div></section>';
    }
    function capNhatAnh() {
      cacTrang.forEach(function (tr, ti) {
        tr.hinh.forEach(function (hh, hi) {
          if (!hh.svg) hh.svg = xuatNhom(tr, hh.la);
          var o = than.querySelector('[data-tr="' + ti + '"] [data-h="' + hi + '"] .kh-anh'); if (o && !o.firstChild) o.innerHTML = '<img src="' + anhSvg(hh.svg) + '" alt="">';
        });
      });
    }
    n.addEventListener('change', function (e) {
      if (e.target.classList.contains('kh-cd-chung') && e.target.value !== '') than.querySelectorAll('.kh-cd').forEach(function (s) { s.value = e.target.value; });
      if (e.target.type === 'checkbox') e.target.closest('.kh-the').classList.toggle('tat', !e.target.checked);
    });
    n.addEventListener('click', function (e) {
      var b = e.target.closest('[data-n]'); if (!b) return;
      var k = b.dataset.n;
      if (k === 'huy') return dongNhap();
      if (k === 'gop' || k === 'nguyen') {
        var sec = b.closest('[data-tr]'), ti = +sec.dataset.tr, tr = cacTrang[ti];
        var chonH = k === 'nguyen' ? tr.hinh.map(function (x, i) { return i; }) : Array.prototype.map.call(sec.querySelectorAll('.kh-the'), function (d) { return d.querySelector('input[type=checkbox]').checked ? +d.dataset.h : -1; }).filter(function (i) { return i >= 0; });
        if (chonH.length < 2) return bao('Tích ít nhất hai hình để gộp', true);
        var laGop = []; chonH.forEach(function (i) { laGop = laGop.concat(tr.hinh[i].la); });
        tr.hinh = tr.hinh.filter(function (x, i) { return chonH.indexOf(i) < 0; }); tr.hinh.unshift({ la: laGop, nho: false });
        var moi = document.createElement('div'); moi.innerHTML = veTrang(ti); sec.replaceWith(moi.firstChild); capNhatAnh(); return;
      }
      if (k === 'luu') {
        var luu = [];
        than.querySelectorAll('[data-tr]').forEach(function (sec2) {
          var tr2 = cacTrang[+sec2.dataset.tr];
          sec2.querySelectorAll('.kh-the').forEach(function (d) {
            if (!d.querySelector('input[type=checkbox]').checked) return;
            var hh = tr2.hinh[+d.dataset.h]; luu.push({ chuDe: (cds[+d.querySelector('.kh-cd').value] || {}).thuMuc || '', ten: d.querySelector('.kh-ten').value.trim() || tr2.nguon, svg: hh.svg });
          });
        });
        if (!luu.length) return bao('Chưa tích hình nào để lưu', true);
        b.disabled = true; b.textContent = 'Đang lưu…';
        MT.khoHinh('luuNhieu', null, { ds: luu }).then(function (r) {
          if (r && r.loi) { b.disabled = false; b.textContent = 'Lưu vào kho'; return bao(r.loi, true); }
          dongNhap(); bao('Đã lưu ' + r.so + ' hình vào kho'); anhDem = {}; quet();
        });
      }
    });
    function dongNhap() { cacTrang.forEach(function (tr) { tr.hopDo.remove(); }); n.remove(); }
  }

  // ---------- kéo thả tệp .svg / gói Freepik vào bảng ----------
  function ganKeoTha() {
    hop.addEventListener('dragover', function (e) { e.preventDefault(); hop.classList.add('keo-vao'); });
    hop.addEventListener('dragleave', function (e) { if (e.target === hop) hop.classList.remove('keo-vao'); });
    hop.addEventListener('drop', function (e) {
      e.preventDefault(); e.stopPropagation(); hop.classList.remove('keo-vao');
      var tep = Array.prototype.filter.call(e.dataTransfer.files || [], function (f) { return /\.svg$/i.test(f.name); });
      if (!tep.length) return bao('Kéo thả nhận tệp .svg; gói .zip / .ai / .eps hãy dùng nút Nhập từ Freepik', true);
      Promise.all(tep.map(function (f) { return f.text().then(function (s) { return { nguon: f.name.replace(/\.svg$/i, ''), svg: s }; }); })).then(function (dsT) { moXemTruoc(dsT, []); });
    });
  }

  // ---------- lưu ảnh đang có trên bảng vào kho ----------
  function luuAnh(duLieu, tenMacDinh, chen) {
    if (!MT || !MT.khoHinh) return;
    var mo = function () {
      var cds = dsChuDeThat();
      hoiNho('Lưu vào kho: chọn chủ đề', { ds: cds.map(function (c) { return c.ten; }), chon: Math.max(0, cds.findIndex(function (c) { return ds.chuDe[chon] && c.thuMuc === ds.chuDe[chon].thuMuc; })), nut: 'Tiếp' }).then(function (i) {
        if (i == null) return;
        hoiNho('Tên hình', { gt: tenMacDinh || 'hinh', nut: 'Lưu' }).then(function (ten) {
          if (!ten) return;
          MT.khoHinh('luuNhieu', null, { ds: [{ chuDe: cds[i].thuMuc, ten: ten, duLieu: duLieu }] }).then(function (r) { bao(r && r.so ? 'Đã lưu “' + ten + '” vào kho' : 'Không lưu được', !(r && r.so)); anhDem = {}; quet(); });
        });
      });
    };
    if (!hop) tao(), ganKeoTha();
    hop.classList.remove('an'); if (chen) khiChen = chen;
    if (ds) mo(); else quet().then(mo);
  }

  function dong() { if (hop) hop.classList.add('an'); }
  function mo(chen) {
    khiChen = chen; if (!hop) { tao(); ganKeoTha(); }
    hop.classList.remove('an'); setTimeout(function () { $('.kh-tim').focus(); }, 30);
    quet();
  }
  return { mo: mo, luuAnh: luuAnh, tachTrang: tachTrang, xuatNhom: xuatNhom };
})();
