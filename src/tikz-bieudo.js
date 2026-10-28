// Nhận ra BIỂU ĐỒ trong mã TikZ rồi lấy số liệu, để vẽ bằng chức năng Biểu đồ thống kê của GeoInk (GI.bieuDo)
// thay cho việc vẽ lại từng nét.
//   GI.tikzBieuDo.doc(ma) → null (không phải biểu đồ) hoặc
//     { kieu: 'cot' | 'cotKep' | 'duong' | 'duongKep' | 'tron', tieuDe, tenX, tenY, dm: [...], ds: [{ ten, so: [...], mau }], ghiSo, luoi, buoc, tiLe (rộng / cao) }
//   Đọc được: biểu đồ cột vẽ bằng \draw … rectangle … (cả cột ghép nhiều dãy, chú thích, vạch chia trục tung),
//             pgfplots (\begin{axis}[ybar …] \addplot coordinates {…} \legend{…}), pgf-pie (\pie{30/A, 20/B}).
window.GI = window.GI || {};
GI.tikzBieuDo = (function () {
  function laSo(t) {
    t = String(t == null ? '' : t).trim().replace(/\s+/g, '').replace(/[{}$]/g, '').replace(/\\,|~/g, '').replace('−', '-');
    if (/^-?\d{1,3}([.,]\d{3})+$/.test(t) && !/^-?\d+[.,]\d{1,2}$/.test(t)) t = t.replace(/[.,]/g, '');   // 10.000 / 10,000 (phân nhóm nghìn)
    t = t.replace(',', '.').replace(/%$/, '');
    return /^-?\d+(\.\d+)?$/.test(t) ? parseFloat(t) : null;
  }
  function lamTron(v) { var r = Math.round(v * 100) / 100; return Math.abs(r - Math.round(r)) < 0.02 ? Math.round(r) : r; }
  function khop(s, i) { var mo = s.charAt(i), dong = { '{': '}', '[': ']', '(': ')' }[mo], sau = 0; for (var j = i; j < s.length; j++) { var c = s.charAt(j); if (c === '\\') { j++; continue; } if (c === mo) sau++; else if (c === dong) { sau--; if (!sau) return j; } } return s.length - 1; }
  function tach(s, sep) { var ra = [], hien = '', sau = 0; for (var i = 0; i < s.length; i++) { var c = s.charAt(i); if (c === '{' || c === '(' || c === '[') sau++; else if (c === '}' || c === ')' || c === ']') sau--; if (c === sep && !sau) { ra.push(hien); hien = ''; } else hien += c; } ra.push(hien); return ra.map(function (x) { return x.trim(); }).filter(function (x) { return x !== ''; }); }
  function boNgoac(t) { t = String(t || '').trim(); while (t.charAt(0) === '{' && khop(t, 0) === t.length - 1) t = t.slice(1, -1).trim(); return t; }
  function chu(t) { return GI.tikz && GI.tikz.chuNhan ? GI.tikz.chuNhan(t) : String(t).replace(/[${}]/g, ''); }
  function tuyChon(s) { var o = {}; tach(s || '', ',').forEach(function (p) { var i = p.indexOf('='); if (i < 0) o[p] = true; else o[p.slice(0, i).trim()] = boNgoac(p.slice(i + 1)); }); return o; }

  function doc(ma) {
    ma = String(ma || '').split('\n').map(function (d) { return d.replace(/(^|[^\\])%.*$/, '$1'); }).join('\n');
    try {
      if (/\\begin\{axis\}/.test(ma)) return pgfplots(ma);
      if (/\\pie\s*(\[[^\]]*\])?\s*\{/.test(ma)) return pie(ma);
      if (!/rectangle/.test(ma) || !GI.tikz) return null;
      return cot(GI.tikz.nhap(ma, { thuThap: true }));
    } catch (e) { return null; }
  }

  // ----- biểu đồ cột vẽ tay bằng rectangle -----
  function cot(r) {
    var hcn = (r.hcn || []).filter(function (h) { return h.x1 - h.x0 > 1e-6; });
    if (hcn.length < 3) return null;
    var cao = Math.max.apply(null, hcn.map(function (h) { return h.y1; })) - Math.min.apply(null, hcn.map(function (h) { return h.y0; })) || 1, eps = cao * 1e-3 + 1e-6;
    // đường chân: đáy chung của nhiều hình chữ nhật nhất
    var dem = {}; hcn.forEach(function (h) { var k = Math.round(h.y0 / eps); dem[k] = (dem[k] || 0) + 1; });
    var kDay = Object.keys(dem).sort(function (a, b) { return dem[b] - dem[a]; })[0], day = +kDay * eps;
    var cotDs = hcn.filter(function (h) { return Math.abs(h.y0 - day) < eps * 2; }), khac = hcn.filter(function (h) { return cotDs.indexOf(h) < 0; });
    if (cotDs.length < 3) return null;
    // dãy số liệu: theo kiểu tô của cột (fill / pattern / màu)
    var khoa = []; cotDs.forEach(function (h) { if (khoa.indexOf(h.kieu) < 0) khoa.push(h.kieu); });
    // nhóm theo danh mục: các cột sát nhau là một nhóm
    var sx = cotDs.slice().sort(function (a, b) { return a.x0 - b.x0; }), rongMin = Math.min.apply(null, sx.map(function (h) { return h.x1 - h.x0; })), nhom = [];
    sx.forEach(function (h) { var g = nhom[nhom.length - 1]; if (g && h.x0 <= g.x1 + rongMin * 0.3) { g.cot.push(h); g.x1 = Math.max(g.x1, h.x1); } else nhom.push({ x0: h.x0, x1: h.x1, cot: [h] }); });
    var soDay = khoa.length, theoViTri = false;
    if (soDay === 1) { var lon = Math.max.apply(null, nhom.map(function (g) { return g.cot.length; })); if (lon > 1) { soDay = lon; theoViTri = true; } }
    if (soDay > 6) return null;
    var minX = sx[0].x0, maxX = Math.max.apply(null, sx.map(function (h) { return h.x1; })), dinh = Math.max.apply(null, cotDs.map(function (h) { return h.y1; }));
    var nhan = (r.nhan || []).map(function (n) { return { x: n.x, y: n.y, chu: chu(n.chu), so: laSo(chu(n.chu)) }; });
    // vạch chia trục tung: số nằm bên trái các cột
    var vach = nhan.filter(function (n) { return n.so != null && n.x < minX - rongMin * 0.2; });
    var fit = null;
    if (vach.length >= 2) {
      var mx = 0, my = 0; vach.forEach(function (v) { mx += v.y; my += v.so; }); mx /= vach.length; my /= vach.length;
      var sxy = 0, sxx = 0; vach.forEach(function (v) { sxy += (v.y - mx) * (v.so - my); sxx += (v.y - mx) * (v.y - mx); });
      if (sxx > 1e-9) { var m = sxy / sxx; fit = { m: m, c: my - m * mx }; }
    }
    // số ghi trên đầu cột
    function soTren(h) {
      var best = null, bd = Infinity;
      nhan.forEach(function (n) { if (n.so == null || n.x < h.x0 - rongMin * 0.6 || n.x > h.x1 + rongMin * 0.6 || n.y < h.y1 - eps * 5) return; var d = Math.abs(n.y - h.y1) + Math.abs(n.x - (h.x0 + h.x1) / 2) * 0.5; if (d < bd && d < cao * 0.12) { bd = d; best = n; } });
      return best;
    }
    var coSoTren = 0;
    function giaTri(h) {
      var t = soTren(h); if (t) coSoTren++;
      var tuTruc = fit ? fit.m * h.y1 + fit.c : null;
      if (t && (tuTruc == null || Math.abs(t.so - tuTruc) <= Math.max(1, Math.abs(tuTruc) * 0.08))) return t.so;
      return lamTron(tuTruc != null ? tuTruc : (h.y1 - h.y0));
    }
    var ds = []; for (var j = 0; j < soDay; j++) ds.push({ ten: '', so: [] });
    nhom.forEach(function (g, gi) {
      g.cot.forEach(function (h, k) { var idx = theoViTri ? k : khoa.indexOf(h.kieu); if (idx >= 0 && idx < soDay) ds[idx].so[gi] = giaTri(h); });
      for (var j2 = 0; j2 < soDay; j2++) if (ds[j2].so[gi] == null) ds[j2].so[gi] = '';
    });
    // tên danh mục: chữ dưới đường chân, gần giữa nhóm
    var buocNhom = nhom.length > 1 ? (nhom[nhom.length - 1].x0 - nhom[0].x0) / (nhom.length - 1) : (maxX - minX);
    var dm = nhom.map(function (g, gi) {
      var cx = (g.x0 + g.x1) / 2, best = null, bd = Infinity;
      nhan.forEach(function (n) { if (n.so != null || n.y > day + eps || Math.abs(n.x - cx) > buocNhom * 0.55) return; var d = (day - n.y) + Math.abs(n.x - cx) * 0.3; if (d < bd) { bd = d; best = n; } });
      if (!best) nhan.forEach(function (n) { if (n.so == null || n.y > day + eps || Math.abs(n.x - cx) > buocNhom * 0.3) return; var d = day - n.y; if (d < bd) { bd = d; best = n; } });   // danh mục là số (năm, lớp…)
      return best ? best.chu : String(gi + 1);
    });
    // tên dãy: chữ bên phải ô chú thích cùng kiểu tô
    ds.forEach(function (d, j) {
      if (theoViTri) { d.ten = 'Dãy ' + (j + 1); return; }
      var o = khac.filter(function (h) { return h.kieu === khoa[j]; })[0];
      if (o) { var cy = (o.y0 + o.y1) / 2, best = null, bd = Infinity; nhan.forEach(function (n) { if (n.so != null || n.x < o.x1 - eps) return; var d = Math.abs(n.y - cy) * 3 + (n.x - o.x1); if (Math.abs(n.y - cy) < Math.max(o.y1 - o.y0, cao * 0.04) * 1.5 && d < bd) { bd = d; best = n; } }); if (best) d.ten = best.chu; }
      var mau = cotDs.filter(function (h) { return h.kieu === khoa[j]; })[0].mau;
      if (mau && !laXam(mau)) d.mau = mau;   // đen, xám, trắng (in đề đen trắng) → dùng bảng màu của GeoInk
      if (!d.ten) d.ten = soDay === 1 ? 'Số liệu' : 'Dãy ' + (j + 1);
    });
    // tiêu đề / tên trục: chữ phía trên cùng, chữ gần đầu trục
    var conLai = nhan.filter(function (n) { return n.so == null && dm.indexOf(n.chu) < 0 && !ds.some(function (d) { return d.ten === n.chu; }); });
    var tren = conLai.filter(function (n) { return n.y > dinh + cao * 0.02; }).sort(function (a, b) { return b.y - a.y; });
    var tenY = tren.filter(function (n) { return n.x <= minX + rongMin; })[0];
    var tieuDe = tren.filter(function (n) { return n !== tenY && n.x > minX; })[0];
    var tenX = conLai.filter(function (n) { return n.x > maxX && Math.abs(n.y - day) < cao * 0.12; })[0];
    // lưới ngang, bước chia
    var luoi = (r.doan || []).filter(function (d) { return Math.abs(d.A.y - d.B.y) < eps && d.A.y > day + eps && Math.abs(d.A.x - d.B.x) > (maxX - minX) * 0.5; }).length >= 2;
    var gtVach = vach.map(function (v) { return v.so; }).sort(function (a, b) { return a - b; }).filter(function (v, i, a) { return i === 0 || v !== a[i - 1]; }), buoc = 0;
    if (gtVach.length >= 3) { var b0 = gtVach[1] - gtVach[0]; if (gtVach.every(function (v, i) { return i === 0 || Math.abs(v - gtVach[i - 1] - b0) < 1e-6; })) buoc = b0; }
    return { kieu: soDay > 1 ? 'cotKep' : 'cot', tieuDe: tieuDe ? tieuDe.chu : '', tenX: tenX ? tenX.chu : '', tenY: tenY ? tenY.chu : '', dm: dm, ds: ds,
      ghiSo: coSoTren >= cotDs.length * 0.5, luoi: luoi, buoc: buoc, tiLe: Math.max(1, Math.min(3, (maxX - minX) / Math.max(dinh - day, 1e-6))) };
  }
  function laXam(hex) { var n = parseInt(hex.slice(1), 16), r = n >> 16 & 255, g = n >> 8 & 255, b = n & 255; return Math.max(r, g, b) - Math.min(r, g, b) < 24; }

  // ----- pgfplots -----
  function pgfplots(ma) {
    var iA = ma.search(/\\begin\{axis\}/), s = ma.slice(iA + '\\begin{axis}'.length), opt = {};
    var j0 = s.search(/\S/); if (s.charAt(j0) === '[') { var j1 = khop(s, j0); opt = tuyChon(s.slice(j0 + 1, j1)); s = s.slice(j1 + 1); }
    var het = s.indexOf('\\end{axis}'); if (het >= 0) s = s.slice(0, het);
    var tron = /\bxbar\b|\bybar\b/.test(Object.keys(opt).join(' ')) ? 'cot' : 'duong';
    var symb = opt['symbolic x coords'] ? tach(boNgoac(opt['symbolic x coords']), ',').map(chu) : null;
    var nhanX = opt.xticklabels ? tach(boNgoac(opt.xticklabels), ',').map(chu) : null;
    var dsPlot = [], re = /\\addplot\+?\s*(\[[^\]]*\])?\s*coordinates\s*\{/g, m;
    while ((m = re.exec(s))) {
      var k = s.indexOf('{', m.index + m[0].length - 1), e = khop(s, k), noi = s.slice(k + 1, e), diem = [], rp = /\(([^()]*)\)/g, q;
      while ((q = rp.exec(noi))) { var p = tach(q[1], ','); if (p.length >= 2) diem.push({ x: chu(p[0]), y: laSo(p[1]) }); }
      var o2 = tuyChon((m[1] || '').slice(1, -1)), mau = null; Object.keys(o2).forEach(function (k2) { if (o2[k2] === true && /^[a-z]+(!\d+)?$/.test(k2) && GI.tikz && GI.tikz.mau) mau = GI.tikz.mau(k2) || mau; if (k2 === 'fill' || k2 === 'color') mau = GI.tikz && GI.tikz.mau ? GI.tikz.mau(o2[k2]) || mau : mau; });
      dsPlot.push({ diem: diem, mau: mau }); re.lastIndex = e;
    }
    if (!dsPlot.length) return null;
    var dm = [];
    if (symb) dm = symb.slice();
    else dsPlot.forEach(function (p) { p.diem.forEach(function (d) { if (dm.indexOf(d.x) < 0) dm.push(d.x); }); });
    if (nhanX && !symb) { var soX = dm.map(laSo); if (soX.every(function (v) { return v != null; })) { var xs = soX.slice().sort(function (a, b) { return a - b; }); dm = xs.map(String); dsPlot.forEach(function (p) { p.diem.forEach(function (d) { d.x = String(laSo(d.x)); }); }); var ten = nhanX; var dm2 = dm.map(function (_, i) { return ten[i] != null ? ten[i] : dm[i]; }); dsPlot.forEach(function (p) { p.diem.forEach(function (d) { d.x = dm2[dm.indexOf(d.x)]; }); }); dm = dm2; } }
    var legend = [];
    var mL = /\\legend\s*\{/.exec(s); if (mL) { var kL = s.indexOf('{', mL.index); legend = tach(s.slice(kL + 1, khop(s, kL)), ',').map(chu); }
    var reE = /\\addlegendentry\s*\{/g, mE; while ((mE = reE.exec(s))) { var kE = s.indexOf('{', mE.index); legend.push(chu(s.slice(kE + 1, khop(s, kE)))); }
    var ds = dsPlot.map(function (p, i) { return { ten: legend[i] || (dsPlot.length === 1 ? (chu(opt.ylabel || '') || 'Số liệu') : 'Dãy ' + (i + 1)), mau: p.mau || undefined, so: dm.map(function (x) { var d = p.diem.filter(function (q) { return q.x === x; })[0]; return d && d.y != null ? d.y : ''; }) }; });
    return { kieu: dsPlot.length > 1 ? tron + 'Kep' : tron, tieuDe: chu(opt.title || ''), tenX: chu(opt.xlabel || ''), tenY: chu(opt.ylabel || ''), dm: dm, ds: ds.slice(0, 6),
      ghiSo: /nodes near coords/.test(Object.keys(opt).join(' ')), luoi: true, buoc: 0, tiLe: 1.35 };
  }

  // ----- pgf-pie: \pie[...]{30/Toán, 20/Văn} -----
  function pie(ma) {
    var m = /\\pie\s*(\[[^\]]*\])?\s*\{/.exec(ma), k = ma.indexOf('{', m.index + m[0].length - 1), dsM = tach(ma.slice(k + 1, khop(ma, k)), ',');
    var dm = [], so = [];
    dsM.forEach(function (p) { var i = p.indexOf('/'); if (i < 0) return; var v = laSo(p.slice(0, i)); if (v == null) return; so.push(v); dm.push(chu(boNgoac(p.slice(i + 1)))); });
    if (dm.length < 2) return null;
    var tdM = /\\node[^;]*\{([^}]*)\}\s*;/.exec(ma);
    return { kieu: 'tron', tieuDe: '', tenX: '', tenY: '', dm: dm, ds: [{ ten: 'Tỉ lệ', so: so }], ghiSo: true, luoi: false, buoc: 0, tiLe: 1.3, _td: tdM ? chu(tdM[1]) : '' };
  }

  return { doc: doc };
})();
