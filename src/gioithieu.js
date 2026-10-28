// Giới thiệu GeoInk: lời giới thiệu, nhóm nghiên cứu, hướng dẫn sử dụng, phím tắt (menu ☰ → Giới thiệu GeoInk)
// Muốn đổi thông tin nhóm: sửa THONG_TIN bên dưới.
(function () {
  'use strict';
  window.GI = window.GI || {};

  var THONG_TIN = {
    ten: 'GeoInk',
    phuDe: 'Bảng viết tay & dựng hình cho giáo viên Toán',
    donVi: 'Nhóm nghiên cứu khoa học · Trường TH-THCS An Lạc',
    namHoc: '2026 – 2027',
    thanhVien: [
      { vaiTro: 'Học sinh', ten: 'Nguyễn Khuê', ghi: 'Lớp 9.1' },
      { vaiTro: 'Học sinh', ten: 'Ngô Bảo Châu', ghi: 'Lớp 9.2' },
      { vaiTro: 'Giáo viên hướng dẫn', ten: 'Cô Đinh Thanh Tuyền', ghi: 'Giáo viên bộ môn Toán' },
    ],
    web: 'https://nckh-geolab.com',
  };

  var MT = window.mayTinh || null;
  function bt(k) { return GI.bieuTuong ? '<i class="gt-ic">' + GI.bieuTuong(k, true) + '</i>' : ''; }
  function phim(s) { return s.split('+').map(function (x) { return '<kbd>' + x + '</kbd>'; }).join('+'); }

  // ---------- Nội dung ----------
  // an-android: chỉ hiện trên máy tính · chi-android: chỉ hiện trên máy tính bảng
  var MUC = [
    { id: 'gioi-thieu', ten: 'Giới thiệu', nhom: 'GeoInk', html: function () {
      var soMH = (GI.MO_HINH || []).length;
      return '<div class="gt-bia"><img src="icon.png" alt=""><div><h3>' + THONG_TIN.ten + '</h3><p>' + THONG_TIN.phuDe + '</p><small id="gt-phien-ban">' + THONG_TIN.donVi + '</small></div></div>' +
        '<p><b>GeoInk</b> là bảng viết tay dành cho giáo viên Toán THCS. Thầy cô viết, vẽ bằng bút như trên bảng thật, đồng thời dựng hình chính xác như GeoGebra, vẽ đồ thị, biểu đồ, chèn công thức và mô hình của <b>GeoLab</b> ngay trên cùng một trang.</p>' +
        '<p>GeoInk ra đời từ nhu cầu dạy học hằng ngày: một bài giảng hình học thường phải chuyển qua lại giữa phần mềm trình chiếu, phần mềm vẽ hình và bảng viết. GeoInk gom tất cả vào một chỗ, chạy được không cần mạng, trên cả máy tính Windows lẫn máy tính bảng Android.</p>' +
        '<div class="gt-the-luoi">' +
        the('but', 'Viết tay mượt', 'Bút có lực nhấn, bút dạ quang, tẩy, nhiều kiểu nền giấy. Chống chạm lòng bàn tay khi dùng bút cảm ứng.') +
        the('trungTruc', 'Dựng hình kiểu GeoGebra', 'Điểm, đường, đường tròn, góc, biến hình… Kéo điểm gốc thì cả hình đổi theo.') +
        the('k_hop', 'Hình không gian 3D', 'Hộp, lăng trụ, chóp, trụ, nón, cầu: xoay, tô mặt, nét khuất, trải phẳng.') +
        the('bieuDo', 'Đồ thị & biểu đồ', 'Đồ thị hàm số, hệ trục Oxy, biểu đồ cột, đoạn thẳng, hình quạt theo kiểu SGK.') +
        the('tikz', 'TikZ & LaTeX', 'Dán mã TikZ để dựng hình (cả biểu đồ)<span class="an-android">, xuất mã TikZ, nhập đề \\begin{ex}, \\begin{bt}</span>.') +
        the('moHinh', 'Mô hình GeoLab', (soMH ? soMH + ' mô hình' : 'Các mô hình') + ' hình phẳng, hình không gian lớp 6–9 mở ngay từ bảng.') +
        '</div>';
    } },
    { id: 'nhom', ten: 'Nhóm nghiên cứu', nhom: 'GeoInk', html: function () {
      return '<p>GeoInk là sản phẩm của <b>' + THONG_TIN.donVi + '</b>, cùng hệ thống với <b>GeoLab – Hình học tương tác THCS</b> (khẩu hiệu: <i>Từ trực quan đến khám phá</i>).</p>' +
        '<div class="gt-tv">' + THONG_TIN.thanhVien.map(function (t) {
          var chu = t.ten.replace(/^(Cô|Thầy)\s+/, '').split(/\s+/).pop().charAt(0);
          return '<div class="gt-tv-the"><span class="gt-tv-chu">' + chu + '</span><div><small>' + t.vaiTro + '</small><b>' + t.ten + '</b><span>' + t.ghi + '</span></div></div>';
        }).join('') + '</div>' +
        '<table class="gt-bang"><tr><th>Đơn vị</th><td>' + THONG_TIN.donVi + '</td></tr><tr><th>Năm học</th><td>' + THONG_TIN.namHoc + '</td></tr>' +
        '<tr><th>Trang web</th><td><a href="#" data-gt-web>nckh-geolab.com</a></td></tr><tr><th>Phiên bản</th><td id="gt-pb">GeoInk</td></tr></table>' +
        '<p class="gt-nho">Thư viện dùng trong GeoInk: pdf.js (Apache 2.0), MathLive (MIT), MathJax (Apache 2.0), phông Latin Modern (GUST Font License), Electron, Capacitor.</p>';
    } },

    { id: 'bat-dau', ten: 'Bắt đầu, giao diện', nhom: 'Hướng dẫn sử dụng', html: function () {
      return '<p>Màn hình GeoInk có ba hàng công cụ phía trên, bảng viết ở giữa và tab trang ở dưới đáy. Công cụ đang dùng hiện trong ô viền đỏ sẫm.</p><ul>' +
        '<li><b>Hàng trên cùng:</b> ' + bt('menu') + ' menu, ' + bt('thuVien') + ' thư viện sổ, mở, lưu, hoàn tác, làm lại, nhập PDF, thêm trang, ' + bt('chenKhoang') + ' chèn khoảng trống, ' + bt('che') + ' che đáp án. Bên phải: số trang và mức phóng, nút <b>Đăng nhập GeoLab</b>, <b>Khoá / Mở</b>, nút toàn màn hình.</li>' +
        '<li><b>Hàng viết tay:</b> bút, tẩy, bút dạ quang (mũi tên ⌄ để chỉnh độ dày, màu), khay màu, công thức, máy tính, dụng cụ học tập, các nút TeX, cắt hình; bên phải là ' + bt('chon') + ' con trỏ chọn và ' + bt('keo') + ' bàn tay kéo trang.</li>' +
        '<li><b>Hàng hình học</b> (sắp như GeoGebra): mỗi ô là một nhóm công cụ có tam giác ▽ ở góc. Bấm lại vào ô đang chọn để xổ danh sách các công cụ cùng nhóm.</li>' +
        '<li>Mở app là đang cầm <b>con trỏ chọn</b>. Bấm <b>Esc</b> bất cứ lúc nào để quay về con trỏ.</li>' +
        '<li>Dòng gợi ý màu đen ở trên bảng cho biết bước tiếp theo khi dựng hình, tự ẩn sau một lúc.</li>' +
        '<li>Cuộn: lăn chuột (Shift + lăn để cuộn ngang) hoặc kéo thanh cuộn bên phải. Phóng to / thu nhỏ: Ctrl + lăn chuột, hai ngón tay, hoặc hộp <b>− % +</b> góc dưới phải; nút <b>M</b> về 100%.</li></ul>';
    } },
    { id: 'viet', ten: 'Viết tay', nhom: 'Hướng dẫn sử dụng', html: function () {
      return '<ul><li>' + bt('but') + ' <b>Bút</b>: nét to nhỏ theo lực nhấn, được làm mượt. Chọn màu ở khay màu, độ dày ở khay độ dày hoặc mũi tên ⌄ cạnh nút bút (có xem trước nét).</li>' +
        '<li>' + bt('dq') + ' <b>Bút dạ quang</b>: tô nổi chữ, màu trong suốt, không che nét bên dưới.</li>' +
        '<li>' + bt('tay') + ' <b>Tẩy</b>: rê qua nét để xoá; mũi tên ⌄ để chỉnh cỡ tẩy.</li>' +
        '<li>GeoInk <b>nhớ</b> thiết đặt bút, dạ quang, cỡ tẩy, nền và thiết lập trang cho lần mở sau.</li>' +
        '<li><b>Chống chạm lòng bàn tay:</b> khi đã viết bằng bút cảm ứng, tay chạm vào bảng chỉ để kéo trang chứ không vẽ.</li>' +
        '<li class="an-android"><b>Bút cảm ứng</b> (menu ☰ → Bút cảm ứng…): gắn việc cho nút trên, nút dưới của bút và đầu tẩy (Tẩy, Kéo bảng, Con trỏ, Hoàn tác, Menu chuột phải). Dùng được với Wacom, GAOMON, XP-Pen…</li></ul>';
    } },
    { id: 'trang', ten: 'Trang, nền, PDF', nhom: 'Hướng dẫn sử dụng', html: function () {
      return '<ul><li><b>Nền trang</b> (menu ☰): giấy kẻ dòng, nền trắng, ô vuông, ô ly, bảng xanh, nền đen, nền xám.</li>' +
        '<li><b>Thiết lập trang</b> (menu ☰, dưới mục Nền trang): <i>Trang vô cực</i> (một mặt bảng rộng vô hạn) hoặc <i>Theo trang giấy A4</i> (các tờ A4 xếp dọc, tự thêm tờ khi viết xuống dưới); chỉnh độ đậm và khoảng cách dòng kẻ, ô tiêu đề Bài / Ngày, đường ngắt trang.</li>' +
        '<li><b>Thêm trang</b>, <b>Xoá hết nội dung trang này</b>, <b>Xoá trang này</b> trong menu ☰. Chuyển trang bằng tab ở đáy<span class="an-android"> hoặc Page Up / Page Down</span>.</li>' +
        '<li>' + bt('pdf') + ' <b>Nhập tệp PDF</b>: các trang PDF xếp từ trên xuống, cột trái hiện trang nhỏ để bấm chuyển nhanh. Viết, dựng hình thẳng lên trang PDF; tệp PDF được lưu kèm trong bảng.</li>' +
        '<li>' + bt('chenKhoang') + ' <b>Chèn khoảng trống</b>: bấm vào chỗ cần chèn rồi kéo xuống để có chỗ ghi lời giải (kéo lên để thu bớt). Bấm vào giữa trang PDF thì trang được cắt ra, chen dải trống kiểu ô lưới, kẻ dòng hoặc trắng.</li>' +
        '<li>' + bt('che') + ' <b>Che đáp án</b>: kéo khung trắng che chỗ cần giấu; bấm đúp vào khung để mở / che lại.</li>' +
        '<li>' + bt('anh') + ' <b>Xuất trang ra ảnh PNG</b> trong menu ☰.</li></ul>';
    } },
    { id: 'dung-hinh', ten: 'Dựng hình', nhom: 'Hướng dẫn sử dụng', html: function () {
      function dong(k, ten, mo) { return '<tr><td>' + bt(k) + '</td><td><b>' + ten + '</b><br>' + mo + '</td></tr>'; }
      return '<p>Chọn công cụ ở hàng hình học rồi bấm lên bảng, làm theo dòng gợi ý. Bấm lên đường thẳng, đường tròn để đặt điểm nằm trên đó; bấm gần chỗ hai hình cắt nhau để lấy giao điểm. Dùng con trỏ kéo điểm gốc thì mọi hình dựng từ điểm đó đổi theo.</p>' +
        '<table class="gt-cc">' +
        dong('diem', 'Điểm', 'Điểm mới, điểm thuộc đối tượng, dán / huỷ dán điểm, giao điểm, trung điểm hoặc tâm.') +
        dong('doan', 'Đường', 'Đường thẳng qua 2 điểm, đoạn thẳng, đoạn có độ dài cố định, tia, đường gấp khúc.') +
        dong('vuongGoc', 'Đường đặc biệt', 'Vuông góc, song song, trung trực, phân giác, hình chiếu vuông góc. Hộp thoại hỏi tên chân đường, tự vẽ kí hiệu góc vuông, các đoạn bằng nhau.') +
        dong('daGiac', 'Đa giác', 'Đa giác (bấm các đỉnh, bấm lại đỉnh đầu để khép), đa giác đều.') +
        dong('tron', 'Đường tròn', 'Tâm và 1 điểm, tâm và bán kính, compa, qua 3 điểm, bán nguyệt, cung tròn, hình quạt.') +
        dong('elip', 'Conic', 'Elip, hypebol, parabol.') +
        dong('goc', 'Góc và đo', 'Góc 1–3 nét cung, có gạch, góc cho trước, kí hiệu góc vuông, độ dài, diện tích. Nút Số đo để ẩn / hiện số đo.') +
        dong('dxTruc', 'Biến hình', 'Đối xứng trục, đối xứng tâm, nghịch đảo, phép quay, tịnh tiến, vị tự.') +
        dong('thanhTruot', 'Thanh trượt', 'Tạo tham số thay đổi được để hình chuyển động.') +
        dong('chu', 'Chèn chữ', 'Gõ chữ lên bảng.') +
        dong('xoa', 'Di chuyển, xoá', 'Kéo trang, xoá đối tượng.') +
        '</table>' +
        '<p><b>Mẫu hình</b> (các ô màu sau nút GeoLab): bấm nút rồi bấm lên bảng để đặt hình có sẵn: tam giác, tứ giác đặc biệt, lục giác đều, đường tròn nội tiếp, tiếp tuyến…, các đường đặc biệt trong tam giác (trung tuyến, đường cao, trọng tâm, trực tâm, phân giác, trung trực, đường trung bình). Kéo đỉnh thì hình vẫn giữ đúng tính chất.</p>';
    } },
    { id: 'sua', ten: 'Chọn, sửa hình', nhom: 'Hướng dẫn sử dụng', html: function () {
      return '<ul><li>' + bt('chon') + ' <b>Con trỏ chọn</b>: bấm vào hình để chọn, kéo để di chuyển. Kéo chỗ trống để chọn bằng khung<span class="an-android">; giữ Ctrl và bấm để thêm / bớt; Ctrl+A chọn tất cả</span>.</li>' +
        '<li><b>Thanh tuỳ chọn nổi</b> hiện ngay trên hình đang chọn: hiện / ẩn tên, chấm điểm, cỡ điểm, kiểu nét, độ dày, màu, tô, ghi độ dài, ẩn, sao chép, nhân bản, cắt, xoá, Thuộc tính.</li>' +
        '<li><b>Đổi tên</b>: bấm đúp vào điểm (hoặc tên) để đặt tên và chọn <b>cỡ chữ</b> của tên. Kéo tên để đặt chỗ dễ nhìn.</li>' +
        '<li><b><span class="an-android">Chuột phải</span><span class="chi-android">Chạm giữ</span></b> vào hình: hiện đối tượng, hiện tên, đổi tên, xoá, <b>Thuộc tính…</b> (bảng kiểu GeoGebra: tên, định nghĩa, màu, độ mờ, kiểu nét, mũi tên, kí hiệu đoạn bằng nhau, cỡ điểm).</li>' +
        '<li class="an-android"><b>Ẩn nhanh</b>: ' + phim('Ctrl+H') + ' ẩn các hình đang chọn; ' + phim('Ctrl+Shift+H') + ' hiện lại tất cả.</li>' +
        '<li class="chi-android">Chạm vào hình bằng con trỏ là hiện nút <b>Xoá</b> đỏ ngay cạnh.</li>' +
        '<li>Mọi thay đổi đều hoàn tác được (' + bt('hoanTac') + '<span class="an-android"> hoặc Ctrl+Z</span>).</li></ul>';
    } },
    { id: 'khong-gian', ten: 'Hình không gian 3D', nhom: 'Hướng dẫn sử dụng', html: function () {
      return '<ul><li>' + bt('k_hop') + ' Nhóm <b>hình không gian</b>: hộp chữ nhật, lập phương, lăng trụ đứng, chóp đều, trụ, nón, cầu. Kéo điểm có vòng tròn để đổi kích thước, kéo nút ↻ để xoay.</li>' +
        '<li><b>Dựng hình chóp</b>: bấm lần lượt các đỉnh đáy, bấm lại đỉnh đầu để khép đáy, rồi bấm đỉnh S. <b>Dựng hình lăng trụ</b>: bấm các đỉnh đáy rồi bấm đỉnh A′.</li>' +
        '<li>Chọn một hình không gian thì hiện <b>thanh hiệu chỉnh</b>: góc nhìn chuẩn SGK, tự quay, quay / nghiêng / xiên, tô mặt bên và mặt đáy, nét khuất đứt hoặc ẩn, tên đỉnh, đường cao.</li>' +
        '<li><b>Trải phẳng</b> (trừ hình cầu): nút trên thanh hiệu chỉnh mở dần các mặt của khối thành hình khai triển (có hoạt hình), bấm lần nữa để gấp lại.</li></ul>';
    } },
    { id: 'do-thi', ten: 'Đồ thị, biểu đồ', nhom: 'Hướng dẫn sử dụng', html: function () {
      return '<ul><li>' + bt('doThi') + ' <b>Đồ thị hàm số</b>: nhập y = … (ví dụ <code>2x + 1</code>, <code>1/2x^2</code>, <code>-x^2</code>), thêm nhiều đồ thị, chọn giới hạn Ox, Oy, lưới, nhãn phương trình. <b>Bảng giá trị</b> tự tính y, chấm điểm và kẻ nét gióng xuống hai trục. Có khung xem trước.</li>' +
        '<li><b>Hệ trục toạ độ Oxy</b> và <b>Điểm có toạ độ</b> (cùng nhóm, bấm ▽): nhập tên và toạ độ “x; y” (nhận 1,5 và 1/2), điểm ghi kiểu A(2; 3).</li>' +
        '<li>' + bt('bieuDo') + ' <b>Biểu đồ thống kê</b>: cột, cột kép, đoạn thẳng, đoạn thẳng kép, hình quạt tròn. Nhập tiêu đề, tên trục, bảng số liệu (dán thẳng từ Excel được), chọn tô màu hoặc đen trắng để in đề.</li>' +
        '<li>Trên bảng: bấm đúp để <b>sửa số liệu</b>; khi đã chọn biểu đồ thì kéo đỉnh cột lên xuống để đổi số, kéo thân cột sang ngang để đổi chỗ, thanh nổi có thêm / xoá cột, ẩn số liệu (để học sinh tự điền), đổi kiểu.</li>' +
        '<li><b>Biểu đồ từ mã TikZ</b>: dán mã TikZ của một biểu đồ (vẽ bằng <code>rectangle</code>, pgfplots hoặc <code>\\pie</code>), GeoInk tự đọc danh mục, các dãy số liệu và tên chú thích rồi vẽ bằng chức năng Biểu đồ, sửa số liệu được như biểu đồ thường.</li></ul>';
    } },
    { id: 'cong-cu', ten: 'Chữ, công thức, máy tính, dụng cụ', nhom: 'Hướng dẫn sử dụng', html: function () {
      return '<ul><li>' + bt('chu') + ' <b>Văn bản</b>: bấm lên bảng để gõ chữ; thanh định dạng có phông, cỡ, đậm, nghiêng, gạch chân, màu, danh sách, căn lề. Bấm đúp để sửa, bấm ổ khoá để cố định.</li>' +
        '<li>' + bt('congThuc') + ' <b>Công thức</b>: soạn bằng bàn phím toán hoặc gõ LaTeX, chọn màu, cỡ. Bấm đúp để sửa.</li>' +
        '<li>' + bt('mayTinh') + ' <b>Máy tính khoa học</b> (kiểu fx-880BTG): phân số, căn, luỹ thừa, lượng giác, độ phút giây, biến nhớ; MENU có thống kê, bảng giá trị, giải hệ phương trình, phương trình và bất phương trình bậc 2–4.</li>' +
        '<li>' + bt('dungCu') + ' <b>Dụng cụ học tập</b>: thước 20 cm, thước đo độ, ê-ke 30°–60° và 45°, thước parabol, compa, đúng tỉ lệ thật. Kéo để dời, nút ↻ để xoay, nút − % + để phóng to. Viết sát mép thước thì nét bám theo mép. Compa: kéo đầu kim, đầu bút, núm trên để quay vẽ cung.<span class="an-android"> Phím R cất dụng cụ.</span></li>' +
        '<li>' + bt('catHinh') + ' <b>Cắt hình</b>: kéo khung quanh hình, ảnh nét cao được chép sẵn<span class="an-android"> để dán sang Word (Ctrl+V)</span><span class="chi-android">, bấm Gửi để chia sẻ</span>; có nút lưu ra tệp PNG.</li>' +
        '<li class="an-android"><b>Dán ảnh</b>: chụp bằng Win+Shift+S rồi Ctrl+V lên bảng; kéo góc để đổi cỡ.</li></ul>';
    } },
    { id: 'tex', ten: 'TikZ, LaTeX', nhom: 'Hướng dẫn sử dụng', html: function () {
      return '<ul><li>' + bt('tikz') + ' <b>Nhập hình từ mã TikZ</b> (menu ☰ hoặc nút Nhập mã TeX<span class="an-android">, hoặc dán thẳng lên bảng bằng Ctrl+V</span>): đọc TikZ thuần: <code>\\def</code>, <code>declare function</code>, <code>\\foreach</code>, <code>coordinate</code>, <code>calc</code>, <code>intersection of</code>, <code>name intersections</code>, đường tròn, cung, <code>plot</code>, <code>scope</code>, góc, nhãn. Điểm giữ cách dựng nên kéo điểm gốc thì hình đổi theo.</li>' +
        '<li class="an-android">' + bt('xuatTex') + ' <b>Xuất mã TeX</b>: bấm nút rồi kéo khung quanh hình (hoặc chọn sẵn hình) để lấy mã TikZ thuần theo khung 4 bước, có nút sao chép.</li>' +
        '<li class="an-android">' + bt('nhapDe') + ' <b>Nhập đề từ mã LaTeX</b>: dán đề có <code>\\begin{ex}</code> (trắc nghiệm → khung <b>Câu</b>, màu đỏ nâu) và <code>\\begin{bt}</code> (tự luận → khung <b>Bài</b>, màu xanh). Mỗi câu, mỗi bài thành một khung xếp thẳng hàng; lời giải nằm trong khung, <b>bấm đúp vào thanh “Lời giải”</b> để mở / đóng. Đọc được bảng Đúng/Sai, <code>tabular</code>, <code>multicols</code>, <code>immini</code>, hình TikZ đi kèm. Kéo góc dưới phải khung để đổi cỡ.</li>' +
        '<li class="an-android"><b>Nhập tệp .tex</b> (menu ☰): chọn tệp trên máy, có ex / bt thì đưa đề lên bảng, có tikzpicture thì dựng hình.</li></ul>';
    } },
    { id: 'geolab', ten: 'Mô hình GeoLab, tài khoản', nhom: 'Hướng dẫn sử dụng', html: function () {
      return '<ul><li>' + bt('moHinh') + ' <b>Chèn mô hình GeoLab</b>: chọn mô hình hình phẳng, hình không gian lớp 6–9 để đặt lên bảng. Bấm <b>“Mở mô hình GeoLab ↗”</b> trên thẻ để mở mô hình tương tác (cần mạng).</li>' +
        '<li><b>Đăng nhập GeoLab</b> là tuỳ chọn: bấm nút <b>Đăng nhập GeoLab</b> ở góc trên, dùng tài khoản được cấp trên nckh-geolab.com, hoặc bấm <b>Để sau</b> để dùng GeoInk ngay. Đã đăng nhập thì mọi liên kết sang GeoLab vào thẳng, không phải đăng nhập lại.</li></ul>';
    } },
    { id: 'luu', ten: 'Lưu, thư viện, đồng bộ', nhom: 'Hướng dẫn sử dụng', html: function () {
      return '<ul><li>' + bt('thuVien') + ' <b>Thư viện sổ</b>: mọi bảng tự thành một <i>sổ</i> và tự lưu sau mỗi thay đổi, không cần bấm Lưu. Có Project (thư mục), ảnh bìa, đổi tên, nhân bản, <b>lịch sử phiên bản</b> (khôi phục được), Thùng rác giữ 30 ngày.</li>' +
        '<li>' + bt('luu') + ' <b>Lưu / Mở</b> tệp <code>.geoink</code><span class="an-android"> (Ctrl+S, Ctrl+O)</span><span class="chi-android">; tệp lưu vào Tài liệu/GeoInk. Menu ☰ → <b>Gửi bảng</b> để gửi qua Zalo, Drive, Gmail</span>.</li>' +
        '<li><b>Đồng bộ Google Drive</b> (menu ☰): đăng nhập Gmail trên cả máy tính và máy tính bảng bằng <b>cùng một tài khoản</b>, thư viện sổ tự đồng bộ hai chiều. Không có mạng vẫn dùng bình thường.</li>' +
        '<li>' + bt('capNhat') + ' <b>Cập nhật</b>: có bản mới thì hiện nút xanh <b>Cập nhật</b> trên thanh trên cùng; kiểm tra tay ở menu ☰ → Kiểm tra cập nhật.</li></ul>';
    } },
    { id: 'khoa', ten: 'Toàn màn hình, khoá', nhom: 'Hướng dẫn sử dụng', html: function () {
      return '<ul><li>GeoInk mở <b>toàn màn hình</b>. Nút góc trên bên phải thu nhỏ vừa khung màn hình hoặc phóng lại toàn màn hình<span class="an-android"> (F11)</span>.</li>' +
        '<li><b>Khoá</b>: chỉ dùng được GeoInk (và mở GeoLab); không chuyển sang chương trình khác, không hiện thông báo, không thoát app. Hợp khi cho học sinh lên bảng. Bấm <b>Mở</b> (cạnh nút Khoá) để thoát chế độ khoá.</li></ul>';
    } },
    { id: 'bang', ten: 'Trên máy tính bảng', nhom: 'Hướng dẫn sử dụng', chi: 'android', html: function () {
      return '<ul><li><b>Hai ngón tay</b>: chụm để phóng to / thu nhỏ, kéo để dời bảng. <b>Chạm giữ</b> vào hình để mở menu (thay chuột phải).</li>' +
        '<li>Chạm vào nhóm công cụ có ▽ là xổ danh sách ngay dưới nút.</li>' +
        '<li>Nút <b>Quay lại</b> của Android đóng hộp thoại, menu đang mở; ở màn hình chính thì hỏi trước khi thoát.</li>' +
        '<li>Thư viện sổ lưu trong bộ nhớ riêng của app: nên bật đồng bộ Google Drive hoặc Gửi bảng ra Drive cho sổ quan trọng.</li>' +
        '<li>Bản máy tính bảng không có xuất mã TikZ và nhập đề LaTeX (chỉ có trên máy tính).</li></ul>';
    } },
    { id: 'phim-tat', ten: 'Phím tắt', nhom: 'Hướng dẫn sử dụng', chi: 'pc', html: function () {
      var ds = [['Ctrl+Z', 'Hoàn tác'], ['Ctrl+Y', 'Làm lại'], ['Ctrl+S', 'Lưu'], ['Ctrl+Shift+S', 'Lưu thành tệp khác'], ['Ctrl+O', 'Mở'], ['Ctrl+N', 'Bảng mới'],
        ['P', 'Bút'], ['E', 'Tẩy'], ['T', 'Con trỏ chọn'], ['H', 'Bàn tay kéo trang'], ['Space', 'Giữ để kéo trang tạm thời'], ['[', 'Nét bút nhỏ hơn'], [']', 'Nét bút to hơn'],
        ['Ctrl+A', 'Chọn tất cả'], ['Ctrl+C', 'Sao chép'], ['Ctrl+X', 'Cắt'], ['Ctrl+V', 'Dán (cả ảnh, mã TikZ)'], ['Ctrl+D', 'Nhân bản'], ['Ctrl+H', 'Ẩn hình đang chọn'], ['Ctrl+Shift+H', 'Hiện lại tất cả'], ['Delete', 'Xoá hình đang chọn'],
        ['Ctrl++', 'Phóng to'], ['Ctrl+-', 'Thu nhỏ'], ['M', 'Về tỉ lệ 100%'], ['Page Up', 'Trang trước'], ['Page Down', 'Trang sau'], ['F11', 'Toàn màn hình / vừa khung'], ['R', 'Cất dụng cụ học tập'], ['Esc', 'Thôi thao tác, về con trỏ chọn']];
      return '<table class="gt-phim">' + ds.map(function (d) { return '<tr><td>' + (d[0] === 'Ctrl++' ? '<kbd>Ctrl</kbd>+<kbd>+</kbd>' : phim(d[0])) + '</td><td>' + d[1] + '</td></tr>'; }).join('') + '</table>';
    } },
  ];
  function the(k, ten, mo) { return '<div class="gt-the">' + bt(k) + '<b>' + ten + '</b><span>' + mo + '</span></div>'; }

  // ---------- Hộp thoại ----------
  var hop = null, dangChon = 'gioi-thieu';
  function laBang() { return document.documentElement.classList.contains('android'); }
  function hien(m) { return !m.chi || (m.chi === 'android') === laBang(); }

  function dung() {
    hop = document.createElement('div');
    hop.id = 'hop-gioi-thieu'; hop.className = 'hop an'; hop.setAttribute('role', 'dialog'); hop.setAttribute('aria-label', 'Giới thiệu GeoInk');
    var nhom = '', nav = '';
    MUC.forEach(function (m) {
      if (!hien(m)) return;
      if (m.nhom !== nhom) { nhom = m.nhom; nav += '<div class="gt-nhom">' + nhom + '</div>'; }
      nav += '<button data-gt="' + m.id + '">' + m.ten + '</button>';
    });
    hop.innerHTML = '<div class="hop-noi-dung gt-khung">' +
      '<div class="gt-dau"><h2>Giới thiệu GeoInk</h2><input type="search" id="gt-tim" placeholder="Tìm chức năng…" spellcheck="false"><button class="gt-x" data-dong title="Đóng">✕</button></div>' +
      '<div class="gt-than"><nav class="gt-nav">' + nav + '</nav><div class="gt-noi" id="gt-noi"></div></div></div>';
    document.body.appendChild(hop);
    hop.addEventListener('pointerdown', function (e) { if (e.target === hop) dong(); });
    hop.querySelector('[data-dong]').onclick = dong;
    hop.querySelector('.gt-nav').onclick = function (e) { var b = e.target.closest('[data-gt]'); if (b) { hop.querySelector('#gt-tim').value = ''; chon(b.getAttribute('data-gt')); } };
    hop.querySelector('#gt-tim').oninput = function () { tim(this.value); };
    hop.querySelector('#gt-noi').onclick = function (e) {
      if (e.target.closest('[data-gt-web]')) { e.preventDefault(); if (MT && MT.moLink) MT.moLink(THONG_TIN.web); else window.open(THONG_TIN.web, '_blank', 'noopener'); }
    };
  }
  function phienBan() {
    if (!MT || !MT.phienBan) return;
    MT.phienBan().then(function (v) {
      var a = document.getElementById('gt-pb'); if (a) a.textContent = 'GeoInk ' + v;
      var b = document.getElementById('gt-phien-ban'); if (b) b.textContent = 'Phiên bản ' + v + ' · ' + THONG_TIN.donVi;
    }, function () { });
  }
  function chon(id) {
    dangChon = id; var m = MUC.filter(function (x) { return x.id === id; })[0] || MUC[0];
    var noi = hop.querySelector('#gt-noi');
    noi.innerHTML = '<h3 class="gt-tieu-de">' + m.ten + '</h3>' + m.html(); noi.scrollTop = 0;
    hop.querySelectorAll('.gt-nav [data-gt]').forEach(function (b) { b.classList.toggle('chon', b.getAttribute('data-gt') === id); });
    phienBan();
  }
  function boDau(s) { return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase(); }
  function tim(q) {
    q = boDau(q.trim()); if (!q) return chon(dangChon);
    var noi = hop.querySelector('#gt-noi'), kq = '';
    MUC.forEach(function (m) {
      if (!hien(m) || m.id === 'gioi-thieu' || m.id === 'nhom') return;
      var tam = document.createElement('div'); tam.innerHTML = m.html();
      var dong = [].slice.call(tam.querySelectorAll('li, tr, p')).filter(function (el) {
        if (el.classList.contains(laBang() ? 'an-android' : 'chi-android')) return false;
        return boDau(el.textContent).indexOf(q) >= 0;
      });
      if (!dong.length && boDau(m.ten).indexOf(q) < 0) return;
      kq += '<h4 class="gt-kq"><a href="#" data-gt-den="' + m.id + '">' + m.ten + ' ›</a></h4>';
      if (dong.length) kq += dong[0].tagName === 'TR' ? '<table class="' + (m.id === 'phim-tat' ? 'gt-phim' : 'gt-cc') + '">' + dong.map(function (d) { return d.outerHTML; }).join('') + '</table>'
        : '<ul>' + dong.map(function (d) { return '<li>' + d.innerHTML + '</li>'; }).join('') + '</ul>';
    });
    noi.innerHTML = kq || '<p class="gt-nho">Không tìm thấy chức năng nào khớp “' + q + '”.</p>';
    noi.querySelectorAll('[data-gt-den]').forEach(function (a) { a.onclick = function (e) { e.preventDefault(); hop.querySelector('#gt-tim').value = ''; chon(a.getAttribute('data-gt-den')); }; });
    hop.querySelectorAll('.gt-nav [data-gt]').forEach(function (b) { b.classList.remove('chon'); });
  }
  function mo(id) {
    var menu = document.getElementById('menu'); if (menu) menu.classList.add('an');
    if (!hop) dung();
    hop.querySelector('#gt-tim').value = '';
    chon(id || 'gioi-thieu'); hop.classList.remove('an');
  }
  function dong() { if (hop) hop.classList.add('an'); }

  GI.gioiThieu = { mo: mo, dong: dong, THONG_TIN: THONG_TIN };
})();
