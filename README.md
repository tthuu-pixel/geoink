# GeoInk

Bảng viết tay cho giáo viên Toán trên Windows: viết bằng bút như Scrble Ink, kết hợp dựng hình kiểu GeoGebra, đo đạc, đồ thị hàm số, và chèn mô hình của [GeoLab](https://nckh-geolab.com).

## Cài đặt

1. Vào mục [**Releases**](https://github.com/tthuu-pixel/geoink/releases/latest), tải tệp **`GeoInk-Setup-<phiên bản>.exe`** (khoảng 1–2 MB).
2. Bấm đúp để cài. **Máy cần có mạng** trong lúc cài: trình cài đặt sẽ tải phần mềm từ GitHub về.
3. Lần đầu chạy, Windows có thể hiện *“Windows protected your PC”* (vì phần mềm chưa có chữ ký số). Bấm **More info → Run anyway**.

Sau khi cài, GeoInk chạy **không cần mạng**. Chỉ khi bấm nút **“Mở mô hình GeoLab”** mới cần mạng để mở trang GeoLab.

## Chức năng (bản 0.1)

**Viết**
- Bút có lực nhấn (nét to nhỏ theo tay), bút dạ quang, bảng màu và độ dày.
- Tẩy (rê qua nét để xoá), bút chỉ (nét đỏ tự mờ).
- Chọn và kéo nét vẽ, kéo trang, phóng to/thu nhỏ (lăn chuột, hai ngón tay trên màn hình cảm ứng).
- Khi đã dùng bút cảm ứng, chạm bằng ngón tay sẽ dời trang chứ không vẽ (tránh vẽ nhầm bằng lòng bàn tay).
- Nhiều trang; nền trắng, ô vuông, ô ly, bảng xanh, nền đen.
- Hoàn tác / làm lại, lưu và mở tệp `.geoink`, xuất trang ra ảnh PNG.

**Dựng hình (thao tác như GeoGebra)**: chọn công cụ rồi bấm lên bảng.
- Điểm, đoạn thẳng, đường thẳng, tia, đường tròn, trung điểm, đường vuông góc, đường song song, giao điểm, đa giác, xoá hình.
- Bấm lên đường thẳng / đường tròn để đặt điểm nằm trên đó; bấm gần chỗ hai hình cắt nhau để lấy giao điểm.
- Dùng công cụ **Chọn / kéo** để kéo điểm: mọi hình dựng từ điểm đó tự đổi theo.

**Đo đạc**: độ dài đoạn thẳng (cm), số đo góc. Nút **Số đo** để ẩn/hiện số đo.

**Đồ thị hàm số**: gõ `2x + 1`, `x^2`, `-1/2x^2 + 3`, `sqrt(x)`, `|x|`, `sin(x)`… Hệ trục toạ độ tự hiện.

**Mô hình GeoLab**: chèn 64 mô hình (hình phẳng lớp 6–9, hình không gian). Mỗi thẻ có nút **“Mở mô hình GeoLab ↗”** mở đúng trang mô hình trên nckh-geolab.com.

## Phím tắt

| Phím | Việc |
|---|---|
| Ctrl+Z / Ctrl+Y | Hoàn tác / làm lại |
| Ctrl+S, Ctrl+Shift+S | Lưu, lưu thành tệp khác |
| Ctrl+O, Ctrl+N | Mở, bảng mới |
| P, H, E, V, L | Bút, dạ quang, tẩy, chọn, bút chỉ |
| Esc | Huỷ thao tác dựng hình đang dở |
| Page Up / Page Down | Trang trước / sau |
| F11 | Toàn màn hình |
| Delete | Xoá nét / mô hình đang chọn |

## Dành cho người phát triển

```bash
npm install
npm start          # chạy thử
```

Mã nguồn: `main.js` (cửa sổ, lưu/mở tệp), `preload.js`, `src/app.js` (giao diện, bút, công cụ), `src/hinh.js` (bộ dựng hình), `src/bieuthuc.js` (đọc biểu thức hàm số), `src/mohinh.js` (danh mục mô hình GeoLab).

**Phát hành bản mới**: tăng `version` trong `package.json`, rồi đẩy tag cùng số, ví dụ `git tag v0.1.1 && git push origin v0.1.1`. GitHub Actions sẽ đóng gói trên máy Windows và đăng tệp cài đặt lên Releases.
