# GeoInk

Bảng viết tay cho giáo viên Toán trên Windows: viết bằng bút như Scrble Ink, kết hợp dựng hình kiểu GeoGebra, đo đạc, và chèn mô hình của [GeoLab](https://nckh-geolab.com).

## Cài đặt

1. Vào mục [**Releases**](https://github.com/tthuu-pixel/geoink/releases/latest), tải tệp **`GeoInk-Setup-<phiên bản>.exe`** (khoảng 1–2 MB).
2. Bấm đúp để cài. **Máy cần có mạng** trong lúc cài: trình cài đặt sẽ tải phần mềm từ GitHub về.
3. Lần đầu chạy, Windows có thể hiện *“Windows protected your PC”* (vì phần mềm chưa có chữ ký số). Bấm **More info → Run anyway**.

Sau khi cài, GeoInk chạy **không cần mạng**. Chỉ khi bấm nút **“Mở mô hình GeoLab”** mới cần mạng để mở trang GeoLab.

## Giao diện

Ba hàng công cụ phía trên, tab trang ở đáy (giống Scrble Ink, biểu tượng nét mảnh; công cụ đang dùng hiện trong ô đỏ sẫm):
- **Hàng trên:** menu ☰ (bảng mới, mở, lưu, nhập PDF, xuất ảnh, nền trang, thêm/xoá trang), mở, lưu, hoàn tác, làm lại, nhập PDF, thêm trang; giữa là số trang và mức phóng; bên phải là toàn màn hình.
- **Hàng viết tay:** bút chì, tẩy, bút dạ quang (biểu tượng có màu) (mũi tên ⌄ để chỉnh độ dày, màu), các chấm màu bút, độ dày, màu dạ quang; bên phải là mũi tên chọn và bàn tay kéo trang.
- **Hàng hình học (sắp xếp như GeoGebra):** điểm · đường · đường đặc biệt · đa giác · đường tròn · đường conic · góc và đo · biến hình · thanh trượt · di chuyển hình vẽ · chữ ABC, rồi mô hình GeoLab. Mỗi ô có tam giác ▽ ở góc; bấm lại vào ô đang chọn để mở danh sách công cụ cùng nhóm. Bên phải là nút bật/tắt số đo và hệ trục.
- Chữ trong phần mềm dùng font Arial giống GeoGebra; tên điểm, tên đường trên bảng dùng font LaTeX (Latin Modern, in nghiêng như $A$).
- **Cột trái:** vùng trắng riêng, hiện các trang nhỏ của tệp PDF. Kéo tay nắm ở mép phải cột để mở rộng / thu hẹp, bấm vào tay nắm để đóng / mở cột.

## Chức năng (bản 0.10)

**Viết**
- Bút có lực nhấn (nét to nhỏ theo tay), nét được làm mượt; bút dạ quang; chỉnh độ dày bằng thanh kéo (có xem trước nét), bảng màu.
- Tẩy (rê qua nét để xoá), chỉnh cỡ tẩy.
- Chọn và kéo nét vẽ, kéo trang, phóng to/thu nhỏ (lăn chuột, hai ngón tay trên màn hình cảm ứng).
- Khi đã dùng bút cảm ứng, chạm bằng ngón tay sẽ dời trang chứ không vẽ (tránh vẽ nhầm bằng lòng bàn tay).
- Nhiều trang (tab ở đáy); nền giấy kẻ dòng (không có lề đỏ), trắng, ô vuông, ô ly, bảng xanh, nền đen, xám.
- Hoàn tác / làm lại, lưu và mở tệp `.geoink`, xuất trang ra ảnh PNG.

**Văn bản (nút ABC)**: bấm lên bảng để gõ chữ trong khung soạn có thanh định dạng: phông, cỡ chữ, đậm, nghiêng, gạch chân, gạch ngang, màu chữ, danh sách chấm / số, căn trái / giữa / phải. Kéo khung để di chuyển, bấm ổ khoá để cố định; bấm đúp để sửa.

**Công thức (nút Σ)**: soạn công thức trực quan với bàn phím toán (MathLive) hoặc gõ LaTeX; chọn màu, cỡ, kiểu hiển thị lớn. Công thức đặt lên bảng, kéo được, bấm đúp để sửa. Chạy không cần mạng.

**Máy tính khoa học** (bố cục kiểu fx-880BTG, phần THCS): tính toán hiển thị tự nhiên (phân số, căn, luỹ thừa, sin cos tan và hàm ngược, log, ln, n!, nCr, nPr, %, độ phút giây, Ans, biến nhớ A–F x y M, STO, M+), kết quả dạng phân số / căn / bội của π và nút S⇔D; MENU: Thống kê (một biến, hai biến y = a + bx), Bảng giá trị f(x), g(x), Phương trình (hệ 2–4 ẩn, đa thức bậc 2–4), Bất phương trình bậc 2–4. SETUP đổi độ / radian.

**Dụng cụ học tập**: thước kẻ 20 cm, thước đo độ, ê-ke 30°–60° và 45°, thước parabol, compa — đúng tỉ lệ thật, kéo để dời, nút ↻ để xoay (hiện số độ). Viết bút sát mép dụng cụ thì nét bám theo mép. Compa: kéo đầu kim để dời, kéo đầu bút để chỉnh bán kính, kéo núm trên để quay vẽ cung. Phím R cất dụng cụ.

**Mẫu hình** (cạnh nút GeoLab, bấm nút rồi bấm lên bảng: hình hiện đúng chỗ bấm): hình không gian (hộp chữ nhật, lập phương, lăng trụ đứng, chóp đều, trụ, nón, cầu — kéo điểm có vòng tròn để đổi kích thước theo đúng hướng, nút ↻ để xoay), đường tròn (nội tiếp, đường kính, tiếp tuyến…), hình phẳng (tam giác, tứ giác đặc biệt, lục giác đều), đường đặc biệt trong tam giác (phân giác, trung trực, đường trung bình). Nhóm này còn có công cụ dựng trên tam giác có sẵn: đường trung tuyến, đường cao (bấm đỉnh rồi 2 đầu cạnh đối diện; đường cao tự có kí hiệu góc vuông và nét đứt kéo dài cạnh khi chân nằm ngoài), trọng tâm, trực tâm (bấm 3 đỉnh). Kéo đỉnh thì hình vẫn giữ đúng tính chất.

**Nhập tệp PDF**: bấm nút PDF (hoặc menu ☰ → Nhập tệp PDF…). Các trang PDF xếp từ trên xuống trên bảng, cột trái hiện trang nhỏ (bấm để đến trang đó). Viết, vẽ, dựng hình thẳng lên trang; lăn chuột để cuộn, Ctrl + lăn chuột để phóng to. Tệp PDF được lưu kèm trong tệp `.geoink`. Xuất ảnh PNG sẽ xuất trang PDF đang xem.

**Dựng hình (thao tác như GeoGebra)**: chọn công cụ rồi bấm lên bảng.
- **Điểm:** điểm mới, điểm thuộc đối tượng, dán / huỷ dán điểm, giao điểm của 2 đối tượng, trung điểm hoặc tâm.
- **Đường:** đường thẳng qua 2 điểm, đoạn thẳng, đoạn thẳng với độ dài cố định, tia, đường gấp khúc.
- **Đường đặc biệt:** đường vuông góc (tự vẽ dấu góc vuông ở chân đường, tắt được trong Thuộc tính → Kiểu), song song, trung trực, phân giác.
- **Đa giác:** đa giác, đa giác đều.
- **Đường tròn:** tâm và 1 điểm, tâm và bán kính, compa, qua 3 điểm, hình bán nguyệt, cung tròn (tâm + 2 điểm, qua 3 điểm), hình quạt (tâm + 2 điểm, qua 3 điểm).
- **Đường conic:** elip (2 tiêu điểm + 1 điểm), hypebol (2 tiêu điểm + 1 điểm), parabol (tiêu điểm + đường chuẩn).
- **Góc, đo:** góc 1/2/3 nét cung, góc 1/2 nét cung có gạch (không tô màu; bật/tắt số đo từng góc bằng chuột phải hoặc Thuộc tính), góc với độ lớn cho trước, kí hiệu góc vuông (bấm 3 điểm), khoảng cách / độ dài, diện tích.
- **Biến hình:** đối xứng qua đường thẳng, qua điểm, đối xứng điểm qua đường tròn, phép quay, tịnh tiến, vị tự.
- **Thanh trượt**, **chèn chữ**, di chuyển hình vẽ (kéo trang), xoá đối tượng.
- Bấm lên đường thẳng / đường tròn để đặt điểm nằm trên đó; bấm gần chỗ hai hình cắt nhau để lấy giao điểm.
- Dùng công cụ **Chọn / kéo** để kéo điểm: mọi hình dựng từ điểm đó tự đổi theo.

**Đăng nhập bằng tài khoản GeoLab**: mở GeoInk sẽ gặp trang đăng nhập; dùng chính tài khoản được cấp trên nckh-geolab.com (cùng máy chủ tài khoản). Tick *Ghi nhớ đăng nhập* thì lần sau mở thẳng vào bảng (mất mạng vẫn dùng được; phiên hết hạn thì đăng nhập lại). Tên người dùng ở góc trên: *Mở GeoLab (đã đăng nhập)*, *Đăng xuất*. Mọi liên kết sang GeoLab (kể cả nút mở mô hình) mang theo phiên nên vào thẳng, không phải đăng nhập lại.

**Tự cập nhật**: mỗi lần mở, GeoInk (bản đã cài) tự kiểm tra bản mới trên GitHub Releases. Có bản mới thì hiện thẻ thông báo ở góc dưới và nút xanh **Cập nhật** trên thanh trên cùng; bấm *Cập nhật* để tải về, tải xong tự cài và mở lại (nếu bảng chưa lưu thì hỏi lưu trước). Có thể kiểm tra tay ở menu ☰ → *Kiểm tra cập nhật*.

**Hai nút TeX** (cạnh nút Dụng cụ học tập): nút *Nhập mã TeX* mở hộp dán mã TikZ để dựng hình; nút *Xuất mã TeX* — bấm nút rồi kéo khung quét quanh hình (hoặc chọn sẵn hình rồi bấm) để lấy mã TikZ thuần theo khung 4 bước: điểm dựng giữ cách dựng bằng `calc` / `intersection of` (trung điểm, chân đường cao, trọng tâm, trực tâm, giao điểm, điểm trên đường tròn, phép quay…), các đoạn ghép thành chuỗi dài nhất (`--cycle` khi khép kín), đường tròn khai báo bán kính bằng `declare function`, góc / góc vuông / gạch đánh dấu gộp trong `\foreach`, nhãn điểm theo góc. Có nút sao chép mã.

**Nhập hình từ mã TikZ** (menu ☰ → *Nhập hình từ mã TikZ…*, hoặc dán thẳng lên bảng bằng Ctrl+V): đọc TikZ thuần theo khung 4 bước — `\def`, `declare function`, `\foreach` (cả lồng nhau), `\path … coordinate`, `\coordinate`, phép dựng `calc` (trung điểm, tỉ lệ, hình chiếu `$(B)!(A)!(C)$`, phép quay `$(O)!1!90:(B)$`, khoảng cách `!1cm!`, tổng hiệu toạ độ), `intersection of`, `name path` + `name intersections` (có `sort by`), `let … veclen`, đường tròn, cung `arc`, nét đứt, mũi tên, `pic {angle}` / `pic {right angle}` (gộp nhiều cung, nhãn trong ngoặc kép), gạch đánh dấu góc, nhãn `node`, và `\foreach` xuất hiện điểm `(\d) circle(1pt) + (\g:9pt) node {$\d$}`. Mỗi điểm giữ nguyên cách dựng nên kéo điểm gốc thì hình đổi theo; điểm tự do nằm trên đường tròn đã vẽ thì chỉ chạy trên đường tròn đó. Hình tự co vừa khung nhìn.

**Chọn nhiều, menu chuột phải** (công cụ Chọn – mũi tên ở hàng viết tay, phím T):
- Giữ **Ctrl** và bấm để thêm / bớt từng đối tượng (điểm, đường, đường tròn, đa giác, chữ, nét viết tay, mô hình).
- Kéo chỗ trống để **chọn bằng khung**; **Ctrl+A** chọn tất cả.
- Kéo một hình đang chọn: cả nhóm di chuyển theo. **Delete** xoá cả nhóm. Đổi màu, kiểu trong bảng Thuộc tính áp dụng cho cả nhóm.
- **Kéo tên** điểm, đường, đường tròn… để đặt tên chỗ dễ nhìn (tên đi được trong vòng khoảng 40 điểm ảnh quanh chỗ mặc định).
- **Chuột phải** vào hình: Hiển thị đối tượng, Hiển thị tên, Đặt lại vị trí tên, Đổi tên, Xoá, Thuộc tính.

**Thuộc tính (giống GeoGebra)**: bấm **chuột phải** vào hình → **Thuộc tính…** để mở bảng (bấm chuột trái chỉ để chọn, kéo). Khi bảng đang mở, chọn hình khác thì bảng đổi theo.
- Bấm vào tên nhóm (Điểm, Đường thẳng…) để chọn hết các đối tượng trong nhóm.
- Danh sách mọi đối tượng theo nhóm (điểm, đoạn thẳng, đường thẳng, tia, đường gấp khúc, đường tròn, cung / quạt, đa giác, số đo, thanh trượt, chữ) để chọn nhanh, kể cả hình đang ẩn.
- **Cơ bản**: tên, định nghĩa, hiển thị đối tượng, hiển thị tên, cố định điểm, xoá đối tượng.
- **Màu sắc**: bảng 24 màu và màu tự chọn; độ mờ tô với đa giác.
- **Kiểu**: độ dày nét (thanh kéo), kiểu nét (liền, nét đứt, gạch nhỏ, chấm, gạch – chấm), mũi tên ở đầu / cuối đoạn thẳng và kiểu mũi tên, kí hiệu đoạn bằng nhau (|, ||, |||) hoặc song song (>, >>, >>>); kích thước điểm.
- Phím Delete xoá hình đang chọn; mọi thay đổi hoàn tác được.

**Đo đạc**: độ dài đoạn thẳng (cm), số đo góc. Nút **Số đo** để ẩn/hiện số đo.

**Đồ thị hàm số**: tạm bỏ từ bản 0.5, sẽ làm lại.

**Mô hình GeoLab**: chèn 64 mô hình (hình phẳng lớp 6–9, hình không gian). Mỗi thẻ có nút **“Mở mô hình GeoLab ↗”** mở đúng trang mô hình trên nckh-geolab.com.

## Phím tắt

| Phím | Việc |
|---|---|
| Ctrl+Z / Ctrl+Y | Hoàn tác / làm lại |
| Ctrl+S, Ctrl+Shift+S | Lưu, lưu thành tệp khác |
| Ctrl+O, Ctrl+N | Mở, bảng mới |
| P, T, H, E | Bút, mũi tên (chọn), bàn tay (kéo trang), tẩy |
| Esc | Huỷ thao tác dựng hình đang dở |
| Page Up / Page Down | Trang trước / sau |
| F11 | Toàn màn hình |
| Delete | Xoá các đối tượng đang chọn |
| Ctrl+A | Chọn tất cả trên trang |

## Dành cho người phát triển

```bash
npm install
npm start          # chạy thử
```

Mã nguồn: `main.js` (cửa sổ, lưu/mở tệp), `preload.js`, `src/app.js` (giao diện, bút, công cụ), `src/hinh.js` (bộ dựng hình), `src/bieuthuc.js` (đọc biểu thức hàm số), `src/mohinh.js` (danh mục mô hình GeoLab), `src/bieutuong.js` (biểu tượng màu, con trỏ bút chì), `src/thu-vien/` (pdf.js 3.11 – Apache 2.0; MathLive 0.111 – MIT; MathJax 3.2 – Apache 2.0; font Latin Modern Roman – GUST Font License).

**Phát hành bản mới**: tăng `version` trong `package.json` (ví dụ `0.1.1`) rồi đẩy lên nhánh `main`. GitHub Actions đóng gói trên máy Windows, tạo bản phát hành `v0.1.1` và đăng tệp cài đặt lên Releases. Đẩy lên `main` mà không đổi `version` thì chỉ đóng gói thử.
