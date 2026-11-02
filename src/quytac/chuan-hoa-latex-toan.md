<!-- quy-tac-geoink phien-ban: 2026-11-02 -->
# Chuẩn hóa LaTeX Toán THCS – THPT

Skill này phục vụ một quy trình biên soạn tài liệu Toán bằng LaTeX (gói `ex_test` / `exam` kiểu Việt Nam). Bốn nhóm việc:

1. **Chuẩn hóa** mã LaTeX có sẵn (hoặc chuyển văn bản/ảnh thành LaTeX chuẩn).
2. **Soạn đề mới** kèm lời giải theo đúng mẫu.
3. **Kiểm tra** tính hợp lý của số liệu, logic, dữ kiện thiếu, thông tin thực tế.
4. **Viết lý thuyết đầu chương** (`tomtat`, `luuy`, `nx`, `dang`).

Khâu **vẽ hình** nằm ngay trong skill này (mục "Vẽ hình TikZ"), không phải đi tìm ở nơi khác.

## Quy trình

1. Xác định người dùng cần nhóm việc nào (có thể nhiều nhóm cùng lúc).
2. Đọc file tham chiếu tương ứng **trước khi viết**:

| Yêu cầu | Đọc file |
|---|---|
| Chuẩn hóa mã, xóa nguồn đề, chuẩn môi trường, công thức, số liệu | `references/quy-tac-chuan-hoa.md` |
| Viết/định dạng lời giải | `references/mau-loi-giai.md` |
| Soạn đề mới, chọn tình huống thực tế, chọn số liệu đẹp | `references/soan-de-moi.md` |
| Viết `tomtat` / `luuy` / `nx` / `dang` đầu chương | `references/ly-thuyet-dau-chuong.md` |
| Vẽ bất kỳ hình phẳng nào (đường thẳng song song, tam giác, tứ giác, đường tròn, phân giác, tiếp tuyến, cát tuyến, biểu đồ...) | dùng ngay mục "Vẽ hình TikZ" bên dưới — đã gộp sẵn toàn bộ quy tắc và mẫu, không cần đọc file ngoài hay skill khác |
| Người dùng muốn tự xử lý hàng loạt trong TeXstudio | `references/regex-texstudio.md` |

3. Làm việc, **tự kiểm tra bằng cách thế ngược nghiệm vào mọi dữ kiện của đề**.
4. Xuất kết quả trong code block LaTeX; ghi chú (nếu có) đặt **ngoài** code block.

## Vẽ hình TikZ (dùng chung cho mọi loại hình phẳng)

Nguyên tắc bao trùm: **TikZ thuần** — không dùng `tkz-euclide`, không dùng `pgfplots`. Thư viện cần có trong preamble: `\usetikzlibrary{angles, quotes, calc, intersections}` (thêm `decorations.markings` nếu cần mũi tên giữa đoạn, ví dụ mô hình ba đường song song chữ M). Mọi tham số độ dài khai báo bằng `\def` hoặc `declare function`, không gõ số trần trong `\draw`. Đường khuất trong hình không gian dùng `[dashed]`. Nhãn không được đè lên đường thẳng.

Định dạng trả về: hình ghép vào một bài `bt`/`ex`/`vd` thì bọc trong `\begin{center}...\end{center}` và đặt SAU TOÀN BỘ phần đề — nếu đề có nhiều ý a), b), c) trình bày trong `enumerate` thì hình đặt SAU `\end{enumerate}` (trước `\loigiai{...}` nếu bài có lời giải, hoặc trước khi đóng `\end{bt}`/`\end{ex}`/`\end{vd}` nếu không có lời giải); TUYỆT ĐỐI không chen hình vào giữa câu dẫn và `enumerate` dù đề chỉ có một câu dẫn ngắn. Riêng hình chỉ phục vụ riêng cho lời giải (không phải hình chung minh họa cả đề) thì đặt trong `\loigiai{...}`. Khi Hữu chỉ yêu cầu MỘT hình độc lập (không kèm đề) thì chỉ trả về khối code TikZ, cần giải thích thì viết bằng `%` comment ngay trong code. Khung đúng khi đề có nhiều ý:
```latex
\begin{bt}
	Câu dẫn của đề...
	\begin{enumerate}
		\item Ý 1.
		\item Ý 2.
	\end{enumerate}
	\begin{center}
	\begin{tikzpicture}
	...
	\end{tikzpicture}
	\end{center}
\end{bt}
```

### Khung chuẩn 4 bước — bắt buộc đúng thứ tự

```latex
\begin{tikzpicture}[scale=1, font=\footnotesize, line join=round, line cap=round, >=stealth, declare function={r=3;}]
  % BƯỚC 1 — KHAI BÁO: mọi điểm dựng bằng \path ... coordinate (X)
  % BƯỚC 2 — VẼ: các \draw nối hình
  % BƯỚC 3 — CHÚ THÍCH: góc, kí hiệu đoạn bằng nhau, số đo
  % BƯỚC 4 — XUẤT HIỆN ĐIỂM: \foreach vẽ chấm tròn + nhãn
\end{tikzpicture}
```

Không được xuất hiện điểm (bước 4) trước khi vẽ (bước 2), nhãn sẽ bị đường đè lên.

### Thư viện dựng điểm bằng phép biến hình — ưu tiên tuyệt đối, không tự tính tọa độ

| Phép dựng | Cú pháp |
|---|---|
| Điểm gốc | `\path (0,0) coordinate (O);` |
| Điểm theo góc–bán kính | `\path (60:r) coordinate (A);` |
| Trung điểm $AB$ | `\path ($(A)!0.5!(B)$) coordinate (M);` |
| Đối xứng của $B$ qua $O$ | `\path ($(B)!2!(O)$) coordinate (Q);` (đối xứng qua điểm nào thì điểm đó ở vị trí số 2) |
| Hình chiếu $A$ lên $BC$ | `\path ($(B)!(A)!(C)$) coordinate (H);` |
| Đỉnh $D$ hình bình hành $ABCD$ | `\path ($(A)+(C)-(B)$) coordinate (D);` |
| Quay $B$ quanh $O$ góc $-90^\circ$ (**tâm quay đứng TRƯỚC**) | `\path ($(O)!1!-90:(B)$) coordinate (Q);` |
| Đường vuông góc với $XY$ **tại $X$** | `\path ($(X)!1!90:(Y)$) coordinate (Xx);` — đường cần tìm là `X--Xx` |
| Trung trực của $AB$ | `\path ($(A)!0.5!(B)$) coordinate (M) ($(M)!1!90:(B)$) coordinate (Mx);` — đường `M--Mx` |
| Điểm quay quanh tâm $O$ góc $40^\circ$ | `\path ($(O)+(40:r)$) coordinate (C);` |
| Giao hai đường thẳng | `\path (intersection of A--O and B--C) coordinate (H);` |
| Tiếp tuyến tại $A$ của $(O)$ | `\path ($(A)!1!-90:(O)$) coordinate (B);` (quay $O$ quanh $A$ nên $AB\perp AO$: $AB$ là tiếp tuyến) |

**CẢNH BÁO cú pháp quay — lỗi âm thầm nguy hiểm nhất.** Trong `($(X)!1!<góc>:(Y)$)` thì **TÂM QUAY là `X`, điểm đứng TRƯỚC dấu `!`**; `Y` là điểm bị quay. Muốn dựng đường vuông góc với $XY$ **tại $X$** phải viết `($(X)!1!90:(Y)$)`; viết ngược thành `($(Y)!1!90:(X)$)` là quay quanh $Y$ — đường thu được KHÔNG vuông góc tại $X$ và mọi giao điểm dựng sau đó đều sai vị trí, nhưng file VẪN BIÊN DỊCH BÌNH THƯỜNG, không báo lỗi. Mẫu đúng cho bài "hai đường trung trực cắt nhau tại $T$":
```latex
\path ($(D)!0.5!(E)$) coordinate (I)
      ($(I)!1!90:(E)$) coordinate (Ix)   % ĐÚNG: quay E quanh I => I--Ix vuông góc DE tại I
      ($(B)!0.5!(C)$) coordinate (K)
      ($(K)!1!90:(C)$) coordinate (Kx)   % ĐÚNG: quay C quanh K => K--Kx vuông góc BC tại K
      (intersection of I--Ix and K--Kx) coordinate (T)
;
```
Sau khi dựng, BẮT BUỘC đánh ký hiệu góc vuông tại đúng điểm (`right angle = T--I--D`, `right angle = T--K--B`) để nhìn hình là biết phép quay đúng hay sai, và đối chiếu vị trí giao điểm với dự đoán hình học (nằm trong hay ngoài tam giác). Khi nghi ngờ, biên dịch thử bằng `standalone` và xem ảnh trước khi gửi.

Nguyên tắc: điểm nào tính được bằng phép dựng hình (trung điểm, đối xứng, hình chiếu, quay) thì BẮT BUỘC dùng cú pháp `calc` ở trên. Giao **hai đường thẳng** luôn dùng `(intersection of ... and ...)`, TUYỆT ĐỐI không dùng thư viện `intersections`. Chỉ khi không còn cách nào (có đường tròn) mới dùng `intersections`. Các đỉnh chính đã biết số liệu (ví dụ ba đỉnh tam giác dựng từ độ dài cạnh cho trước) được phép gõ tọa độ tay như điểm gốc.

### Giao điểm với đường tròn — chỗ sai nhiều nhất

Một đường thẳng cắt đường tròn tại HAI điểm. `name intersections` đánh số `intersection-1`/`intersection-2` theo thứ tự thuật toán quét, KHÔNG theo thứ tự hình học — cấm dựa vào quy ước "intersection-1 thường là...". Đổi bán kính, đổi góc, đổi thứ tự khai báo path là số thứ tự đảo ngay.

**Cách 1 (ưu tiên tuyệt đối, không cần thư viện)** — đối xứng qua hình chiếu tâm. Dây cung qua $D$ (đã biết trên đường tròn) và $M$, cắt đường tròn lần hai tại $C$:
```latex
\path ($(M)!(O)!(D)$) coordinate (x)   % x = hình chiếu tâm O lên dây MD
      ($(D)!2!(x)$)   coordinate (C);  % C = đối xứng của D qua x (hình chiếu tâm = trung điểm dây)
```

**Cách 2** — `name intersections` có định hướng bằng `sort by` (khi chưa biết trước điểm nào trên đường tròn):
```latex
\draw[name path=dtO] (O) circle (r);
\path[name path=dtAB] (A)--(B);   % hướng quét: từ A sang B
\path[name intersections={of=dtO and dtAB, by=F, sort by=dtAB}];
% sort by=dtAB => giao ĐẦU TIÊN (gần A nhất) là F, xác định tuyệt đối
```
`sort by=` là BẮT BUỘC mỗi khi cắt đường tròn. Cần điểm xa hơn thì ĐẢO CHIỀU path thành `(B)--(A)`, không khai báo thêm biến.

**Cách 3** — chỉ khi thực sự cần CẢ HAI giao điểm (2 tiếp điểm, 2 đường tròn cắt nhau):
```latex
\path[name path=dtOA] (d/2,0) let \p1 = ($(d/2,0)-(A)$) in circle ({veclen(\x1,\y1)});
\path[name intersections={of=dtO and dtOA}]
      coordinate (B) at (intersection-1)
      coordinate (C) at (intersection-2);
```

CẤM: `by={E, D_dummy}` (sinh biến rác); `by={E, F}` khi chỉ cần `E`; thiếu `sort by`. Tự kiểm sau khi lấy giao điểm: điểm mới có trùng điểm đã biết trên đường tròn không (trùng => lấy nhầm, đảo chiều path); vị trí nhãn đúng phía như hình đề không; nhiều giao điểm cùng loại thì kiểm tra từng điểm một, không kiểm tra gộp.

### Kéo dài bằng điểm ảo

Khi đoạn thẳng chưa chạm tới đường tròn/đường thẳng kia, TikZ báo lỗi "no intersection" hoặc bỏ qua im lặng. Ba quy tắc:

1. Điểm ảo tạo bằng nội suy hệ số $>1$: `($(A)!1.5!(D)$)`, hoặc bằng vector `+(góc:độ dài)`.
2. Đường chứa điểm ảo phải là `\path`, KHÔNG BAO GIỜ `\draw` (nếu không sẽ lòi đoạn thừa).
3. `\path` đó phải có `overlay` để không tính vào khung bao.

```latex
\draw[name path=circleO] (O) circle (\R);
\path[name path=lineAD, overlay] (D) -- +(90:2*\R);
\path[name intersections={of=circleO and lineAD, by=A, sort by=lineAD}];
```

Hệ số kéo dài khuyến nghị:

- Cắt đường tròn bán kính $R$: `+(góc:2*\R)` ($2R$ luôn đủ).
- Cắt đường thẳng khác: `($(A)!2!(B)$)` (hệ số $1{,}5$–$2$).
- Kéo dài 2 phía để vẽ đường thẳng đầy đủ: `($(A)!1.5!(B)$)` và `($(B)!1.5!(A)$)` ($1{,}3$–$1{,}5$).
- Vẽ tia ra ngoài có nhãn $x$, $y$, $z$: `($(O)!1.5!(A)$)` ($1{,}2$–$1{,}5$).
- Vẽ TRỌN một đường phụ (trung trực, đường vuông góc) đã biết đi qua HAI điểm $P$ và $T$: lấy luôn hai đầu mút `($(T)!1.3!(P)$)` và `($(P)!1.2!(T)$)` — cách này luôn đi qua đúng cả hai điểm, không phụ thuộc hướng quay.

Đặt tên điểm ảo có hậu tố (`Bx`, `Ax`, `b'`, `y_end`) và TUYỆT ĐỐI không đưa vào `\foreach` xuất hiện điểm ở bước 4. PHÂN BIỆT: `overlay` chỉ dùng cho đường PHỤ TRỢ vô hình; tia THỰC SỰ được vẽ ra (có nhãn `$x$`) thì dùng `\draw` và KHÔNG dùng `overlay`, vì đoạn đó cần nằm trong khung bao.

### Đường phân giác

CẤM dùng hàm tính góc (`atan2`, `\pgfmathanglebetweenpoints`...). Dùng nguyên lý tam giác cân: lấy hai điểm cách đỉnh MỘT KHOẢNG BẰNG NHAU trên hai cạnh, trung điểm của chúng nằm trên tia phân giác.

Mẫu gọn (phân giác $MQ$ của góc $M$ trong tam giác $MNP$):
```latex
\path (intersection of M--{$($(M)!1mm!(P)$)!.5!($(M)!1mm!(N)$)$} and N--P) coordinate (Q);
\draw (M)--(Q);
```

Mẫu tách bước (phân giác $AD$ của tam giác $ABC$):
```latex
\path ($(A)!1cm!(B)$) coordinate (Ap)
      ($(A)!1cm!(C)$) coordinate (Aq)      % PHẢI cùng 1cm
      ($(Ap)!.5!(Aq)$) coordinate (At)
      (intersection of A--At and B--C) coordinate (D);
\draw (A)--(D);
```
Ba lỗi thường gặp: hai khoảng cách khác nhau (`!1cm!` và `!2cm!`) => không phải phân giác, chỉ là tia bất kỳ; dùng `!0.5!` thay `!1cm!` => thành trung tuyến khi $AB\neq AC$; quên `(intersection of ...)` mà vẽ thẳng `(A)--(At)` => tia quá ngắn, không chạm $BC$.

Ký hiệu hai góc ở đỉnh phân giác (bán kính lệch nhau có chủ đích để hai cung sát nhau không dính thành một):
```latex
\foreach \x/\y/\z/\r in {N/M/Q/12, Q/M/P/15}
  \path pic[draw=black, angle radius=\r] {angle=\x--\y--\z};
```
Muốn nhấn mạnh hai góc BẰNG NHAU thì giữ cùng bán kính và thêm gạch đánh dấu (xem mục dưới).

### Ký hiệu góc/đoạn bằng nhau — luôn gộp vào MỘT `\foreach`

Từ 2 ký hiệu cùng loại trở lên PHẢI gộp vào một `\foreach`, không viết lặp từng dòng.

```latex
% Góc thường
\foreach \x/\y/\z in {A/B/C}
  \path pic[draw=black, angle radius=6] {angle = \x--\y--\z};
% Góc vuông (KHÔNG dùng \tkzMarkRightAngle)
\foreach \x/\y/\z in {B/A/C, D/A/E}
  \path pic[draw=black, angle radius=6] {right angle = \x--\y--\z};
% Góc hai vòng cung
\foreach \x/\y/\z in {B/O/A} \foreach \solan in {10,14}
  \path pic[draw=black, angle radius=\solan] {angle = \x--\y--\z};
% Góc 1 gạch đánh dấu
\foreach \x/\y/\z/\t in {C/B/A/10, A/C/B/6}
{\path pic[draw=black, angle radius=\t] {angle = \x--\y--\z}
       ($(\x)!0.5!(\z)$) coordinate (tdxz);
 \draw ($(\y)!\t-2pt!(tdxz)$)--($(\y)!\t+2pt!(tdxz)$);}
% Góc 2 gạch đánh dấu
\foreach \x/\y/\z/\t in {C/B/A/10, A/C/B/6}
{\path pic[draw=black, angle radius=\t] {angle = \x--\y--\z} ;
 \path ($(\x)!0.4!(\z)$) coordinate (tdxz);
 \draw ($(\y)!\t-2pt!(tdxz)$)--($(\y)!\t+2pt!(tdxz)$);
 \path ($(\x)!0.6!(\z)$) coordinate (tdxz);
 \draw ($(\y)!\t-2pt!(tdxz)$)--($(\y)!\t+2pt!(tdxz)$);}
% Đoạn thẳng 1 gạch
\foreach \x/\y in {A/B, A/C}
  \draw ($(\x)!0.5!(\y)!4pt!90:(\x)$)--($(\x)!0.5!(\y)!4pt!-90:(\x)$);
% Đoạn thẳng 2 gạch
\foreach \x/\y in {A/B, A/C} \foreach \tl in {.49,.51}
  \draw ($(\x)!\tl!(\y)!4pt!90:(\x)$)--($(\x)!\tl!(\y)!4pt!-90:(\x)$);
% Đoạn thẳng dấu X
\foreach \x/\y in {A/B, A/C}
  \draw ($(\x)!.5!(\y)!4pt!60:(\x)$)--($(\x)!.5!(\y)$)--($(\x)!.5!(\y)!4pt!-120:(\x)$)
        ($(\x)!.5!(\y)!4pt!120:(\x)$)--($(\x)!.5!(\y)$)--($(\x)!.5!(\y)!4pt!-60:(\x)$);
% Đoạn thẳng dấu XX
\foreach \x/\y in {A/B, A/C} \foreach \tl in {.48,.52}
  \draw ($(\x)!\tl!(\y)!4pt!60:(\x)$)--($(\x)!\tl!(\y)$)--($(\x)!\tl!(\y)!4pt!-120:(\x)$)
        ($(\x)!\tl!(\y)!4pt!120:(\x)$)--($(\x)!\tl!(\y)$)--($(\x)!\tl!(\y)!4pt!-60:(\x)$);
% Đánh số góc quanh một điểm (1,2,3,4)
\foreach \x/\y/\z/\t in {D/145/5/3, D/45/4/1, D/215/5/4, C/-50/4/1}
  \node at ($(\x)+(\y:\z mm)$) {$\t$};
```

### Nhãn số đo và đơn vị trong hình vẽ — SỐ trong `$`, ĐƠN VỊ ngoài `$`

Quy tắc này áp dụng cho mọi nhãn số liệu trong hình vẽ (độ dài cạnh, bán kính, diện tích, chu vi, số đo góc).

| Đúng | Sai |
|---|---|
| `$5$ cm` | `$5\text{cm}$`, `$5 \text{ cm}$`, `$5cm$` |
| `$5$ cm$^2$` | `$5\text{cm}^2$` |
| `$1{,}5$ m` | `$1,5$ m` |
| `$45^\circ$` | `$45$ độ`, `$45\text{độ}$` |
| `$30\%$` | `$30$%` |

Chỉ SỐ nằm trong cặp `$`; ĐƠN VỊ (cm, m, dm, kg, s...) viết thường ngoài `$`, cách số đúng một khoảng trắng; số mũ của đơn vị vẫn bọc `$`: `cm$^2$`. Riêng `^\circ` và `\%` là ký hiệu toán nên nằm TRONG `$`. TUYỆT ĐỐI không dùng `\text{}` để bọc đơn vị trong nhãn hình vẽ. Ví dụ áp dụng:
```latex
\draw (A)--(B) node[midway,sloped,above]{$6$ cm};
\draw[<->] ($(A)+(0,-.7)$)--($(B)+(0,-.7)$) node[midway,above]{$12{,}5$ cm};
\path (O) +(45:1.2) node {$S=240$ cm$^2$};
```

### Quy tắc xuất hiện điểm (bước 4)

```latex
\foreach \d/\g in {O/-45, A/180, B/90, C/-90}
  \path[draw=black, fill=white] (\d) circle (1pt) + (\g:9pt) node {$\d$};
```
Đổi tên hiển thị khác tên tọa độ thì dùng 3 tham số và IN RA `\z`:
```latex
\foreach \d/\g/\z in {A/180/M, B/-90/N, C/0/P}
  \path[draw=black, fill=white] (\d) circle (1pt) + (\g:9pt) node {$\z$};
```

- BẮT BUỘC dùng `\foreach` với tham số GÓC (độ). TUYỆT ĐỐI KHÔNG dùng `above/below/left/right/north/south...` cho NHÃN ĐIỂM (A, B, C, O, H...) — luôn dùng `\foreach` góc như trên. Không dùng `\tkzLabelPoints`.
- Nhãn TIA/ĐƯỜNG THẲNG (x, y, z, a, b) thì ĐƯỢC PHÉP dùng `above/below/left/right`, ví dụ `(O)--(x) node[below]{$x$};`.
- Nhãn ĐỘ DÀI trên cạnh ĐƯỢC PHÉP dùng `node[midway,sloped,above]{$6$ cm}`.
- Nhãn số đo GÓC quanh một đỉnh dùng `\node at ($(\x)+(\y:\z mm)$) {$\t$};`.
- Bán kính chấm $1$–$1{,}5$pt; khoảng cách nhãn $8$–$9$pt; `fill=white` cho chấm rỗng, giữ nhất quán trong cùng một đề. Chọn góc đặt nhãn theo hướng đi ra khỏi hình (trái $180$, phải $0$, trên $90$, dưới $-90$, chéo $\pm45$/$\pm135$).
- Danh sách `\foreach` này CHỈ chứa điểm THẬT. Điểm ảo/phụ trợ (Ap, Aq, At, x, y_end) KHÔNG được liệt kê.

### Nối điểm liên tục — không tách \draw rời rạc

| Sai | Đúng |
|---|---|
| `\draw (A)--(B) (B)--(C);` | `\draw (A)--(B)--(C);` |
| `\draw (A)--(B) (B)--(C) (C)--(A);` | `\draw (A)--(B)--(C)--cycle;` |
| `\draw (A)--(B); \draw (B)--(C);` | `\draw (A)--(B)--(C);` |

Lý do: mỗi lệnh `--(X)` rời tạo một path riêng; với `line cap=round` hai path gặp nhau tạo cục u, và `line join` không áp dụng giữa hai path khác nhau.

Cách xây chuỗi tối ưu:

1. Liệt kê tất cả các đoạn cần vẽ.
2. Ghép các đoạn có điểm chung thành chuỗi dài nhất (đi một nét bút).
3. Chuỗi khép kín kết thúc bằng `--cycle` (không lặp lại điểm đầu).
4. Các chuỗi rời nhau và các đường tròn gộp chung vào MỘT lệnh `\draw`.

Chỉ tách sang `\draw` riêng khi cần thuộc tính khác (`dashed`, màu, mũi tên). Không lặp lại một đoạn ở hai chuỗi khác nhau.

### Hai mẫu nhanh cho hình "đường thẳng song song bị cắt bởi cát tuyến" — dùng ngay, khỏi dựng lại từ đầu

**Mẫu 1 — hai (hoặc ba) đường thẳng song song bị cắt bởi cát tuyến**, góc so le/đồng vị/trong cùng phía:

```latex
\begin{tikzpicture}[scale=.8,font=\footnotesize,line cap=round,line join=round,>=stealth,angle radius=.75cm]
	\def\r{4.5}
	\path 
	(0,0) coordinate (b) node[left]{$b$} ++(0:\r) coordinate (b') node[right]{$b'$}
	(0,2.2) coordinate (a) node[left]{$a$} ++(0:\r) coordinate (a') node[right]{$a'$}
	(2.5,-0.8) coordinate (c') node[right]{$c'$} ++(98:3.9) coordinate (c) node[right]{$c$}
	(intersection of a--a' and c--c') coordinate (M)
	(intersection of b--b' and c--c') coordinate (N)
	pic[draw, angle radius = 9pt, "$1$", angle eccentricity = .6]{angle = c'--M--a'}
	pic[angle radius = 8pt, "$82^\circ$", angle eccentricity = 1.8]{angle = c'--M--a'}
	pic[draw, angle radius = 9pt, "$2$", angle eccentricity = 0.6]{angle = c--N--b}
	pic[angle radius = 8pt, "$82^\circ$", angle eccentricity = 1.8]{angle = c--N--b}
	;
	\draw (a)--(a') (b)--(b') (c)--(c');
	\foreach \x/\g in {M/60,N/-40}
	\draw[fill=black] (\x) circle (.03)+(\g:.3) node{$\x$};
\end{tikzpicture}
```

Quy tắc rút ra từ mẫu này:

- Header cố định: `[scale=.8,font=\footnotesize,line cap=round,line join=round,>=stealth,angle radius=.75cm]`, cùng `\def\r{...}` cho độ dài chính (thường 4–5, KHÔNG để dài quá 5–6 vì hình sẽ dư khoảng trắng) — chọn tọa độ điểm gốc của cát tuyến (`c'`) sao cho giao điểm `M`, `N` rơi gần giữa đoạn `a`, `b`, không lệch hẳn về một phía.
- **Một khối `\path` duy nhất**: khai báo tất cả tọa độ + `node` tên đường + toàn bộ `pic` góc, dấu `;` xuống dòng riêng ở cuối khối.
- Đầu mút đường và cát tuyến dựng bằng `++(góc:độ dài)` để góc nghiêng chính xác (không gõ tọa độ đầu kia tay); đường song song thứ ba (khi có 3 đường) lặp lại một gốc khác ở tung độ khác cùng `++(0:\r)`.
- Vẽ tất cả các đường trong **một** lệnh `\draw (a)--(a') (b)--(b') (c)--(c');` đặt ngay sau khối `\path`.
- Chấm điểm kèm nhãn bằng `\foreach \x/\g in {M/60,N/-40} \draw[fill=black] (\x) circle (.03)+(\g:.3) node{$\x$};` — tên coordinate trùng chữ hiển thị, `\g` (độ) là hướng dời nhãn ra khỏi giao điểm, chọn sao cho nhãn không đè lên cung góc.
- Góc có số thứ tự (ẩn số cần tính) dùng `pic[draw, angle radius = 9pt, "$1$", angle eccentricity = .6]{angle = ...}` (có `draw` để hiện cung); góc đã cho số đo sẵn (chỉ hiện số, không cần cung riêng) dùng `pic[angle radius = 8pt, "$82^\circ$", angle eccentricity = 1.8]{angle = ...}` (KHÔNG có `draw`) với `angle eccentricity` lớn hơn (1.8–2.1) để nhãn số đo nằm xa tâm hơn cung góc số thứ tự (0.6) — tránh hai nhãn chồng lên nhau tại cùng một đỉnh.
- Cặp góc bằng nhau thứ hai tại một đỉnh khác (để phân biệt với cặp thứ nhất) thêm `double, cap = butt` và đổi bán kính cung (6pt/8pt) để không trùng ký hiệu.
- Quy ước tên: chữ thường cho đầu mút/tia của đường thẳng (a, a', b, b', c, c', x, y, z, t, m, n); chữ hoa cho giao điểm (M, N, C, D, G, H).
- Khi hình có 3 đường song song (dạng "zigzag" D–B–C, ví dụ bài chứng minh song song qua điểm gãy), dựng điểm gãy bằng giao điểm của tia nghiêng `++(góc:độ dài)` với đường song song giữa, rồi lặp lại cho điểm gãy thứ hai — không nhập tọa độ tay để góc luôn khớp số đo đề cho.

**Mẫu 2 — nhiều cát tuyến, nhiều nhãn một điểm, đánh dấu góc/đoạn bằng blend ratio**: dùng khi hình có hai đường song song bị cắt bởi HAI cát tuyến (thường vẽ dọc, ví dụ $x=0$ và $x=3$), khi một đỉnh cần hiển thị nhiều nhãn cùng lúc (tên điểm + nhiều số thứ tự góc), hoặc khi cần đánh dấu hai góc/đoạn bằng nhau mà không muốn định nghĩa `\tikzset{...pic}` riêng.

```latex
\begin{tikzpicture}[scale=.8,font=\footnotesize,line cap=round,line join=round,>=stealth,angle radius=.75cm]
	\coordinate (m) at (0,-0.5);
	\coordinate (m') at (0,4.5);
	\coordinate (n) at (3,-0.5);
	\coordinate (n') at (3,4.5);
	\coordinate (x) at (-1.5,0.5);
	\coordinate (x') at (4.5,3.2);
	\coordinate (y) at (-1.5,3.5);
	\coordinate (y') at (4.5,1.2);
	\path
	(intersection of m--m' and x--x') coordinate (A)
	(intersection of n--n' and x--x') coordinate (B)
	(intersection of m--m' and y--y') coordinate (C)
	(intersection of n--n' and y--y') coordinate (D)
	;
	\draw (m)--(m') (n)--(n') (x)--(x') (y)--(y');
	\foreach \p/\g/\t in {m/180/m,m'/90/m',n/0/n,n'/90/n',x/-160/x,x'/20/x',y/160/y,y'/20/y',A/20/A,A/110/2,A/-60/1,B/160/B,C/20/C,D/160/D}
	\draw[fill=black] (\p) circle (.1pt) node[shift={(\g:.3)},scale=1]{$\t$};
	\foreach \i/\j/\k/\t in {A/x/C/6, D/y/B/6}
	{\def\dgiua{\i}\def\dmot{\j}\def\dhai{\k}\def\tyso{\t pt}
	\draw ($(\dgiua)!\tyso!(\dmot)$)--($(\dgiua)!2!($($(\dgiua)!\tyso!(\dmot)$)!.5!($(\dgiua)!\tyso!(\dhai)$)$)$)--($(\dgiua)!\tyso!(\dhai)$);}
\end{tikzpicture}
```

Quy tắc rút ra từ biến thể này:

- Khai báo từng điểm gốc/mút đường bằng `\coordinate (tên) at (x,y);` **riêng lẻ**, KHÔNG gói trong một khối `\path` như mẫu 1 — hợp với trường hợp cần đặt tọa độ tay cho nhiều đường không cùng dựng bởi một phép biến hình.
- Giao điểm vẫn dựng bằng một khối `\path (intersection of ... and ...) coordinate (...) ... ;` **riêng**, đặt sau khi đã khai báo xong toàn bộ coordinate mút đường.
- `\draw` tất cả các đường ngay sau khối `\path` giao điểm, cùng cú pháp một dòng như mẫu 1.
- **Gắn nhãn + chấm điểm gộp trong một `\foreach \p/\g/\t in {...}`**: `\draw[fill=black] (\p) circle (.1pt) node[shift={(\g:.3)},scale=1]{$\t$};` — `\p` là tên coordinate, `\g` là hướng (độ) dời nhãn, `\t` là CHỮ HIỂN THỊ (có thể khác tên điểm). Muốn đặt **nhiều nhãn tại cùng một điểm** (ví dụ tên điểm + hai số thứ tự góc kề nhau), lặp lại tên điểm đó nhiều lần với `\g`/`\t` khác nhau, ví dụ `A/20/A,A/110/2,A/-60/1`.
- **Đánh dấu góc/đoạn bằng nhau không dùng `\tikzset{markx/.pic=...}`**: dùng vòng lặp blend ratio thủ công `\foreach \i/\j/\k/\t in {D/m/C/6, ...}{\def\dgiua{\i}\def\dmot{\j}\def\dhai{\k}\def\tyso{\t pt} \draw ($(\dgiua)!\tyso!(\dmot)$)--($(\dgiua)!2!($($(\dgiua)!\tyso!(\dmot)$)!.5!($(\dgiua)!\tyso!(\dhai)$)$)$)--($(\dgiua)!\tyso!(\dhai)$);}` — vẽ một nét gấp khúc nhỏ (⌃) cách đỉnh `\dgiua` đúng `\tyso` (pt, thường 6–8pt) về phía hai điểm `\dmot`/`\dhai`. Muốn đánh dấu hai cặp góc/đoạn bằng nhau khác nhau ở hai đỉnh khác nhau, thêm hai dòng trong cùng danh sách `{...}` của `\foreach`, mỗi dòng một bộ bốn `đỉnh/điểm1/điểm2/khoảng cách`.
- Dùng cho hình có cát tuyến/đường không dựng được thuận tiện bằng `++(góc:độ dài)` từ một gốc chung (ví dụ hai cát tuyến cắt nhau lệch phía, đường song song dọc) — khi đường dễ dựng bằng phép biến hình từ một gốc, ưu tiên mẫu 1.

### Thư viện mẫu hình vẽ cơ bản khác — copy và chỉnh lại tọa độ/tên điểm/góc, không chép máy móc số liệu

**1. Tam giác nội tiếp đường tròn $(O)$, $AH$ là đường cao**
```latex
\begin{tikzpicture}[scale=1, font=\footnotesize, line join=round, line cap=round, >=stealth, declare function={r=3;}]
\def\gocA{110}
\path (0,0) coordinate (O)
      (\gocA:r) coordinate (A)
      (210:r) coordinate (B)
      (-30:r) coordinate (C)
      ($(B)!(A)!(C)$) coordinate (H)
;
\draw (A)--(B)--(C)--cycle (O) circle(r) (A)--(H);
\foreach \x/\y/\z in {A/H/C}
  \path pic[draw=black, angle radius=6] {right angle = \x--\y--\z};
\foreach \d/\g in {A/100, B/-135, C/-30, H/-90}
  \path[draw, fill=white] (\d) circle(1pt) + (\g:9pt) node {$\d$};
\end{tikzpicture}
```

**2. Tiếp tuyến $AB$, $AC$ kẻ từ $A$ đến đường tròn $(O)$**
```latex
\begin{tikzpicture}[scale=1, font=\footnotesize, line join=round, line cap=round, >=stealth, declare function={r=3;d=7;}]
\path (0,0) coordinate (O)
      (d,0) coordinate (A);
\draw [name path=dtO] (O) circle (r);
\path[name path=dtOA] (d/2,0) let \p1 = ($(d/2,0)-(A)$) in circle ({veclen(\x1,\y1)});
\path[name intersections={of=dtO and dtOA}] coordinate (B) at (intersection-1)
                                             coordinate (C) at (intersection-2);
\draw (A)--(B)--(O)--(C)--cycle (O)--(A) (O) circle(r);
\foreach \x/\y/\z in {A/B/O, A/C/O}
  \path pic[draw=black, angle radius=6] {right angle = \x--\y--\z};
\foreach \d/\g in {O/135, A/0, B/90, C/-90}
  \path[draw=black, fill=white] (\d) circle(1pt) + (\g:9pt) node {$\d$};
\end{tikzpicture}
```

**3. Cát tuyến $MCD$ và hai tiếp tuyến $MA$, $MB$**
```latex
\begin{tikzpicture}[scale=1, font=\footnotesize, line join=round, line cap=round, >=stealth, declare function={r=3;d=7;}]
\path (0,0) coordinate (O)
      (d,0) coordinate (M)
      (140:r) coordinate (D)
      ($(M)!(O)!(D)$) coordinate (x)
      ($(D)!2!(x)$) coordinate (C);
\draw [name path=dtO] (O) circle (r);
\path[name path=dtOM] (d/2,0) let \p1 = ($(d/2,0)-(M)$) in circle ({veclen(\x1,\y1)});
\path[name intersections={of=dtO and dtOM}] coordinate (A) at (intersection-1)
                                             coordinate (B) at (intersection-2);
\path (intersection of A--C and M--B) coordinate (E)
      (intersection of A--B and M--D) coordinate (K)
      (intersection of A--B and M--O) coordinate (H)
;
\draw (M)--(B)--(O)--(A)--cycle
      (O)--(M)--(D)--(A) (H)--(C)--(B)--(A)--(E)--(H)--(D)--(O)--(C);
\foreach \d/\g in {O/-135, A/90, B/-90, M/0, C/60, D/180, E/-90, K/120, H/-45}
  \path[draw=black, fill=white] (\d) circle(1pt) + (\g:9pt) node {$\d$};
\foreach \x/\y/\z in {M/A/O, M/B/O, O/H/B}
  \path pic[draw=black, angle radius=6] {right angle = \x--\y--\z};
\end{tikzpicture}
```

**4. Tam giác $ABC$, đường tròn đường kính $BC$ cắt $AB$, $AC$ tại $F$, $E$**
```latex
\begin{tikzpicture}[scale=1, font=\footnotesize, line join=round, line cap=round, >=stealth, declare function={r=3;}]
\path (0,0) coordinate(O);
\draw[name path=dtO] (O) circle(r);
\path (-r,0) coordinate(B)
      ( r,0) coordinate(C);
\path (-1.5,4) coordinate(A);
\path[name path=dtAB] (A)--(B);
\path[name path=dtAC] (A)--(C);
\path[name intersections={of=dtO and dtAB, by=F, sort by=dtAB}];
\path[name intersections={of=dtO and dtAC, by=E, sort by=dtAC}];
\draw (A)--(B) (A)--(C)--(B)
      (C)--(F) (B)--(E)
      (O) circle(r);
\foreach \x/\y/\z in {B/E/C, B/F/C}
  \path pic[draw=black, angle radius=6] {right angle = \x--\y--\z};
\foreach \d/\g in {O/-90, A/90, B/180, C/0, E/60, F/120}
  \path[draw, fill=white] (\d) circle(1pt) + (\g:9pt) node {$\d$};
\end{tikzpicture}
```

**5. Hai góc kề bù**
```latex
\begin{tikzpicture}[scale=1, font=\footnotesize, line join=round, line cap=round, >=stealth]
\foreach \x/\y/\z in {0/0/O, 0/3/y, 50/3/m, 180/2.5/x}
  \path (\x:\y) coordinate (\z);
\draw (y) node[below]{$y$}--(O)--(x) node[below]{$x$} (O)--(m) node[left]{$z$};
\foreach \x/\y/\z/\t in {y/O/m/12}
{\path pic[draw=black, angle radius=\t] {angle = \x--\y--\z}
       ($(\x)!0.5!(\z)$) coordinate (tdxz);
 \draw ($(\y)!\t-2pt!(tdxz)$)--($(\y)!\t+2pt!(tdxz)$);}
\foreach \x/\y/\z in {m/O/x}
  \path pic[draw=black, angle radius=10] {angle = \x--\y--\z};
\foreach \d/\g in {O/-90}
  \path[draw=black, fill=white] (\d) circle(1pt) + (\g:9pt) node {$\d$};
\end{tikzpicture}
```

**6. Hai góc đối đỉnh**
```latex
\begin{tikzpicture}[scale=1, font=\footnotesize, line join=round, line cap=round, >=stealth]
\foreach \x/\y/\z in {0/0/O, -20/2/m, 28/2.5/n, 160/2/a, 208/2.5/b}
  \path (\x:\y) coordinate (\z);
\draw (m)--(a) node[above]{$a$} (n)--(b) node[below]{$b$};
\foreach \x/\y/\z/\t in {O/0/5/4, O/90/4/2, O/180/5/1, O/-60/5/3}
  \node at ($(\x)+(\y:\z mm)$) {$\t$};
\foreach \d/\g in {O/-90}
  \path[draw=black, fill=white] (\d) circle(1pt) + (\g:9pt) node {$\d$};
\end{tikzpicture}
```

**7. Ba đường thẳng song song, mô hình chữ M** (mũi tên giữa đoạn biểu thị đường thẳng, dùng `decorations.markings`):
```latex
\begin{tikzpicture}[font=\footnotesize, line cap=round, line join=round, >=Stealth, declare function={r=3;},
  arrowmid/.style={decoration={markings, mark=at position 0.5 with {\arrow{>}}}, postaction={decorate}}]
\foreach \x/\y/\z in {0/0/A, -3/0/B, -3/1.5/x, 2.5/1.5/y, -2/-2/m, 2.5/-2/n}
  \path(\x,\y) coordinate(\z);
\path ($(A)+(120:1)$) coordinate (Ax)
      ($(A)+(-110:1)$) coordinate (Ay)
      (intersection of A--Ax and x--y) coordinate (D)
      (intersection of A--Ay and m--n) coordinate (E)
      ($(A)!1.5!(D)$) coordinate (z)
;
\draw[arrowmid] (D)--(x) node[above]{$x$};
\draw[arrowmid] (A)--(B);
\draw[arrowmid] (E)--(n) node[below]{$n$};
\draw (z) node[above]{$z$}--(A)--(E);
\foreach \x/\y/\z/\t in {D/145/6/60}
  \node at ($(\x)+(\y:\z mm)$) {$\t^\circ$};
\foreach \t/\g in {A/0, B/180, D/0, E/180}
  \draw[fill=black] (\t) circle (1pt) node[shift={(\g:8pt)}]{$\t$};
\end{tikzpicture}
```

Biến thể 2 đường cắt (hai góc so le trong, dùng khi cần thể hiện 2 cặp góc và 2 nhãn tia $z$, $t$):
```latex
\begin{tikzpicture}[font=\footnotesize, line cap=round, line join=round, >=Stealth, declare function={r=3;},
  arrowmid/.style={decoration={markings, mark=at position 0.5 with {\arrow{>}}}, postaction={decorate}}]
\foreach \x/\y/\z in {0/0/A, 3/0/B, -2/1.5/x, 4/1.5/y, -2/-2/m, 4/-2/n}
  \path(\x,\y) coordinate(\z);
\path ($(A)+(45:1)$) coordinate (Ax)
      ($(A)+(-55:1)$) coordinate (Ay)
      (intersection of A--Ax and x--y) coordinate (M)
      (intersection of A--Ay and m--n) coordinate (N)
      ($(A)!1.5!(M)$) coordinate (z)
      ($(A)!1.5!(N)$) coordinate (t)
;
\draw[arrowmid] (M)--(y) node[above]{$y$};
\draw[arrowmid] (A)--(B);
\draw[arrowmid] (N)--(n) node[below]{$n$};
\draw (z) node[above]{$z$}--(A)--(t) node[above]{$t$};
\foreach \x/\y/\z/\t in {M/20/7/45, N/-20/7/55}
  \node at ($(\x)+(\y:\z mm)$) {$\t^\circ$};
\foreach \t/\g in {A/180, B/0, M/180, N/180}
  \draw[fill=black] (\t) circle (1pt) node[shift={(\g:8pt)}]{$\t$};
\end{tikzpicture}
```

**8. Hình thang $ABCD$ ($AB \parallel CD$, hai cạnh bên kéo dài thành tia)**
```latex
\begin{tikzpicture}[font=\footnotesize, line cap=round, line join=round, >=Stealth, declare function={r=3;}]
\foreach \x/\y/\z in {0/0/A, 3/0/D, -1/0/n, 4/0/x, 0/3/m, 3.5/3/y}
  \path(\x,\y) coordinate(\z);
\path ($(A)+(71:4)$) coordinate (a) node[left]{$a$}
      ($(D)+(97:3.75)$) coordinate (b) node[right]{$b$}
      (intersection of A--a and m--y) coordinate (B)
      (intersection of D--b and m--y) coordinate (C)
      ($(B)!1.3!(A)$) coordinate (z)
      ($(C)!1.3!(D)$) coordinate (t)
;
\draw (m) node[above]{$m$}--(y) (n) node[above]{$n$}--(x) (z)--(a) (t)--(b);
\foreach \x/\y/\z/\t in {D/145/5/3, D/45/4/1, D/215/5/4, C/-50/4/1}
  \node at ($(\x)+(\y:\z mm)$) {$\t$};
\foreach \t/\g in {A/130, B/140, D/-50, C/40}
  \draw[fill=black] (\t) circle (1pt) node[shift={(\g:8pt)}]{$\t$};
\end{tikzpicture}
```

**9. Hình thang có hai cạnh bên $AB$, $CD$ cắt nhau tại một điểm (góc tùy chỉnh)**
```latex
\begin{tikzpicture}[scale=1, line join=round, line cap=round, >=stealth]
\def\a{1.5}
\def\gH{80} \def\gK{120}
\path (0,0) coordinate (H)
      (\gH:\a) coordinate (F)
      (0:{\a+1}) coordinate (K)
      ($(F)+(180:1.4)$) coordinate (a)
      ($(K)+(\gK:1)$) coordinate (i)
      (intersection of F--a and K--i) coordinate (I)
;
\draw (a)--($(a)!1.5!(I)$) coordinate(y)
      ($(H)+(180:.9)$)--($(K)+(0:1)$)
      ($(F)!1.5!(H)$) node[right]{$x$}--($(H)!1.5!(F)$) coordinate(Kx)
      ($(K)!1.5!(I)$)--($(I)!1.5!(K)$) coordinate(Ix)
;
\path pic[draw=black, angle radius=.4cm, angle eccentricity=1.6, "$80^\circ$"] {angle = I--F--Kx};
\path pic[draw=black, angle radius=.4cm, angle eccentricity=1.6, "$80^\circ$"] {angle = K--H--F};
\path pic[draw=black, angle radius=.5cm, angle eccentricity=1.6, "$60^\circ$"] {angle = I--K--H};
\foreach \x/\g/\ten in {H/140/B, K/-120/C, F/120/A, I/60/D}
  \fill[black](\x) circle (1pt) +(\g:5mm) node {$\ten$};
\end{tikzpicture}
```

**10. Hình thang có 2 góc vuông (ba tia song song $y$, $z$, cạnh xiên $x$, đáy $c$)**
```latex
\begin{tikzpicture}[font=\footnotesize, line join=round, line cap=round, >=stealth, scale=1]
\def\h{2.5}
\path (1.5,0) coordinate (B)
      (6,0) coordinate (N)
      (6,\h) coordinate (M)
      ($(B)+(60:{\h/sin(60)})$) coordinate (A)
      ($(A)+(-2,0)$) coordinate (y_start)
      ($(M)+(2,0)$) coordinate (y_end)
      ($(B)+(-2,0)$) coordinate (z_start)
      ($(N)+(2,0)$) coordinate (z_end)
      ($(A)+(60:1.2)$) coordinate (x_top)
      ($(B)+(-120:1.2)$) coordinate (x_bot)
      ($(M)+(0,1)$) coordinate (c_top)
      ($(N)+(0,-1)$) coordinate (c_bot)
;
\draw (y_start)--(y_end) node[pos=0.1, above]{$y$} node[pos=0.9, above]{$y'$};
\draw (z_start)--(z_end) node[pos=0.1, above]{$z$} node[pos=0.9, above]{$z'$};
\draw (x_bot) node[left]{$x'$}--(x_top) node[left]{$x$};
\draw (c_bot) node[right]{$c$}--(c_top);
\path pic[draw=black, fill=orange!30, angle radius=5mm, "$60^\circ$"] {angle = M--A--x_top};
\foreach \p/\q/\r in {A/M/N, M/N/B}
  \path pic[draw=black!60, fill=green!15, angle radius=3mm] {right angle = \p--\q--\r};
\foreach \x/\pos in {A/180, B/-60, M/45, N/-45}
  \filldraw[fill=blue!70, draw=black] (\x) circle (1.2pt) node[shift={(\pos:3.5mm)}]{$\x$};
\end{tikzpicture}
```

**11. Tam giác $ABC$ có $MN \parallel BC$**
```latex
\begin{tikzpicture}[font=\footnotesize, line cap=round, line join=round, scale=1, >=Stealth, declare function={r=3;}]
\foreach \x/\y/\z in {0/0/B, 4/0/C}
  \path(\x,\y) coordinate(\z);
\path ($(B)+(55:1)$) coordinate (Bx)
      ($(C)+(140:1)$) coordinate (Cx)
      (intersection of B--Bx and C--Cx) coordinate (A)
      ($(A)+(0:2)$) coordinate (N)
      ($(A)+(180:2)$) coordinate (M)
;
\foreach \x/\y/\z/\t in {B/25/6/55, A/210/6/55, A/-20/6/40, C/160/6/40}
  \node at ($(\x)+(\y:\z mm)$) {$\t^\circ$};
\draw (A)--(B)--(C)--cycle (M)--(N);   % vẽ MỘT lần, đặt \draw NGOÀI mọi \foreach
\foreach \t/\g in {A/90, B/210, C/-30, M/90, N/90}
  \draw[fill=black] (\t) circle (1pt) node[shift={(\g:8pt)}]{$\t$};
\end{tikzpicture}
```

### Checklist tự kiểm TikZ trước khi trả kết quả

- [ ] Mọi điểm dùng trong `\draw` đều đã khai báo ở bước 1 (bằng `\path`/`coordinate`, không gõ tọa độ tay trừ điểm gốc/đỉnh đã biết số liệu).
- [ ] **Mọi phép quay `($(X)!1!<góc>:(Y)$)` đã đặt TÂM QUAY (`X`) đứng TRƯỚC** — đường vuông góc/trung trực dựng xong có ký hiệu góc vuông tại đúng điểm và vị trí giao điểm khớp dự đoán hình học (trong hay ngoài tam giác).
- [ ] Mọi giao điểm với đường tròn có `sort by=` hoặc dùng phép đối xứng (Cách 1); điểm mới lấy được khác điểm đã biết trên đường tròn.
- [ ] Mọi `\path` phụ trợ tìm điểm ảo có `overlay`.
- [ ] Không còn `\draw (A)--(B) (B)--(C)` rời rạc — đã gộp chuỗi; các chuỗi rời nhau và đường tròn đã gộp vào một `\draw`.
- [ ] Danh sách xuất hiện điểm (bước 4) không lẫn điểm ảo/phụ trợ.
- [ ] Không còn `above/below/left/right/north/south` cho NHÃN ĐIỂM; không còn `\tkzLabelPoints`, `\tkzMarkRightAngle`; không dùng `atan2`/`\pgfmathanglebetweenpoints` cho phân giác.
- [ ] Các ký hiệu góc/đoạn cùng loại đã gộp chung một `\foreach`.
- [ ] `\draw` nằm NGOÀI mọi `\foreach` chú thích góc (đặt `\draw` bên trong `\foreach` sẽ vẽ lặp nhiều lần).
- [ ] Nhãn số đo/đơn vị đúng quy tắc "số trong `$`, đơn vị ngoài `$`".
- [ ] Đã đóng dấu `;` sau mỗi lệnh `\path`/`\draw`.
- [ ] Hình đặt SAU `\end{enumerate}` (sau toàn bộ phần đề, kể cả các ý a/b/c) chứ không chen giữa câu dẫn và `enumerate`.

## Mười quy tắc bất di bất dịch

1. **Giữ nguyên 100% nội dung toán học gốc.** Không tự sửa đề, đáp án, lời giải, không thêm bớt dữ kiện — trừ khi người dùng yêu cầu rõ. Phát hiện sai sót thì ghi chú ngoài code block.
2. **Không để dòng trống** trong mã kết quả. Thụt lề bằng **tab**: nội dung trong `ex`/`bt`/`vd` thụt 1 tab, trong `enumerate` thụt 2 tab (lồng thêm cấp thì thụt thêm 1 tab mỗi cấp). Các ý nhỏ (1, 2, 3... hoặc a, b, c...) trong CẢ ĐỀ BÀI lẫn LỜI GIẢI đều phải bọc trong `\begin{enumerate}...\end{enumerate}` và dùng `\item` TRƠN (không nhãn tùy chỉnh) — TUYỆT ĐỐI không dùng `\item[1)]`, `\item[a)]`, `\item[1\]`,... và không tự gõ chữ "1)", "2)", "a)", "b)" làm nhãn thủ công trong văn bản; số/chữ thứ tự do `enumerate` tự sinh (theo style đã định nghĩa sẵn trong lớp tài liệu). Khi đề có nhiều ý (ví dụ 1), 2), 3) với riêng ý 1) lại có a), b), c) con) thì lời giải trong `\loigiai{...}` cũng phải bọc trong `enumerate` (lồng nhau nếu cần) với số `\item` tương ứng từng ý của đề, KHÔNG viết "1) ... 2) ..." hay "a) ... b) ..." dạng văn bản thuần trong lời giải. Ví dụ khung đúng:
   ```latex
   \begin{bt}
   	Cho ...
   	\begin{enumerate}
   		\item Nội dung ý 1.
   		\item Nội dung ý 2.
   	\end{enumerate}
   	\loigiai{
   	\begin{enumerate}
   		\item Lời giải ý 1.
   		\item Lời giải ý 2.
   	\end{enumerate}
   	}
   \end{bt}
   ```
3. **Mỗi code block chứa đúng một `\section` hoặc một `\deontap{N}`** (hoặc một `\chapter` + phần lý thuyết). Không gộp, không chia nhỏ.
4. **Không dùng** `$$...$$`, `\[...\]`, `\quad`, `\hoac{}`, `\implies`, `\Rightarrow`, `\Leftrightarrow` trong lời giải. Thay bằng chữ **"Suy ra"**, chữ **"hoặc"**. Trình bày dọc bằng `align*` khi cần các dòng thẳng hàng theo dấu `=`; khi chứng minh gồm nhiều bước "suy ra" liên tiếp trong văn xuôi, xuống dòng bằng `\\` sau mỗi bước để dễ đọc thay vì dồn tất cả vào một câu dài — ví dụ:
   ```latex
   suy ra $\triangle ABI\backsim\triangle CBA$ (g.g)\\
   suy ra $\dfrac{AB}{CB}=\dfrac{BI}{BA}$\\
   suy ra $AB^2=BI\cdot BC$ (đpcm).
   ```
   Dấu nhân giữa hai đại lượng dùng `\cdot` (không dùng dấu chấm `.`); khi phát biểu hai tam giác đồng dạng, LUÔN dùng ký hiệu $\triangle A\backsim\triangle B$ (dấu `\backsim`, không dùng `\sim`) — TUYỆT ĐỐI không viết chữ "tam giác $A$ đồng dạng tam giác $B$".

   **Không trích dẫn hệ thức lượng trong tam giác vuông** ($b^2=ab'$, $c^2=ac'$, $h^2=b'c'$, $ah=bc$, $\dfrac{1}{h^2}=\dfrac{1}{b^2}+\dfrac{1}{c^2}$...) như một định lý có sẵn trong lời giải, kể cả khi đề thuộc chương "Hệ thức lượng trong tam giác vuông". Mọi đẳng thức dạng tích/tổng bình phương hai đoạn thẳng phải được suy ra lại tại chỗ bằng hai tam giác đồng dạng (g.g), đúng theo mẫu ở ví dụ trên (nêu ký hiệu hai tam giác đồng dạng, suy ra tỉ số cạnh tương ứng, rồi suy ra đẳng thức tích) — trừ khi người dùng nói rõ được phép dùng trực tiếp.

   **Khi trích dẫn trực tiếp một định lý/tính chất được phép dùng ngay** (không cần chứng minh lại) — ví dụ định lý Pythagore, tính chất đường trung tuyến ứng với cạnh huyền trong tam giác vuông, tính chất hai tiếp tuyến cắt nhau, tính chất đường trung trực — trình bày theo khuôn: dòng đầu nêu rõ đối tượng/giả thiết đang xét (dùng "Xét $\triangle ABC$ vuông tại $A$, ta có" khi giả thiết gắn với một hình cụ thể như tam giác/tứ giác; dùng "Ta có: [giả thiết]" khi giả thiết không gắn với một hình cần "xét", ví dụ nêu quan hệ giữa hai đường/hai đoạn thẳng), tiếp theo là dòng nêu giả thiết/đối tượng liên quan nếu cần, và luôn KẾT THÚC bằng một câu "Suy ra ..." nêu kết luận, có ghi tên định lý/tính chất trong ngoặc ở cuối câu (ví dụ "(định lý Pythagore)", "(tính chất)", "(tính chất hai tiếp tuyến cắt nhau)"). TUYỆT ĐỐI không viết theo kiểu "Vì ... nên ..." gộp giả thiết và kết luận vào một câu, và không dồn cả phép tính lẫn kết luận vào một dòng thiếu câu "Suy ra". Khi lập luận cần thêm MỘT giả thiết/dữ kiện độc lập thứ hai trước khi kết hợp cả hai để ra kết luận, nối bằng chữ **"Mà"** (KHÔNG dùng "Lại có"). Khi từ cùng một "Suy ra" có thể rút thêm một kết luận phụ liên quan (ví dụ vừa suy ra quan hệ vuông góc vừa suy ra luôn một điểm là trung điểm), gộp chung các kết luận đó vào MỘT dòng "Suy ra ... và ..." thay vì tách riêng một câu "Vậy ..." ngay sau chỉ để nhắc lại nội dung "Suy ra" liền trước — "Vậy" chỉ dùng cho kết luận tổng kết cuối cùng của cả ý/bài (đpcm), không dùng để lặp lại một "Suy ra" vừa viết. Ví dụ:
   ```latex
   Xét $\triangle ABC$ vuông tại $A$, ta có $BC^2=AB^2+AC^2$ (định lý Pythagore).\\
   Suy ra $AC=\sqrt{BC^2-AB^2}=\sqrt{10^2-6^2}=8$ cm.
   ```
   ```latex
   Xét $\triangle ABC$ vuông tại $A$, ta có\\
   $AM$ là trung tuyến ứng với cạnh huyền $BC$ ($M$ là trung điểm của $BC$)\\
   Suy ra $AM=BM=CM=\dfrac{BC}{2}$ (tính chất).
   ```
   ```latex
   Ta có: $DA$, $DC$ là hai tiếp tuyến của $(O)$ cắt nhau tại $D$\\
   Suy ra $DA=DC$ (tính chất hai tiếp tuyến cắt nhau).\\
   Mà $OA=OC=R$.\\
   Suy ra $OD$ là đường trung trực của đoạn thẳng $AC$.\\
   Suy ra $OD\perp AC$ và $H$ là trung điểm của $AC$.
   ```
5. **Mọi công thức trong `$...$`**, `\frac` → `\dfrac`, số thập phân `$2{,}5$`, số lớn `$100\,000$`.
6. **Xóa sạch nguồn đề**: mã phân loại `%[0D1H2-1]`, dòng `[THPT ... - GHKI]`, `\textit{(Trích đề ...)}`, tùy chọn `[...]` sau `\begin{ex}`/`\begin{bt}`/`\begin{vd}` nếu chỉ là tên trường/năm học/mã đề. Không xóa `\loigiai{...}`.
7. **`dang` rỗng, `bt` nằm ngoài** khi dùng trong phần bài tập:
   ```latex
   \begin{dang}[Tên dạng]
   \end{dang}
   \begin{bt}
   	...
   \end{bt}
   ```
   Riêng phần **lý thuyết đầu chương**, `dang` có nội dung bên trong và dùng ngoặc nhọn: `\begin{dang}{Tên dạng}...\end{dang}`. Hỏi người dùng nếu không rõ đang ở ngữ cảnh nào.
8. **Ưu tiên phương pháp tổng hợp (tam giác đồng dạng, định lý Talet, tính chất hình học, quan hệ song song/vuông góc...), KHÔNG dùng phương pháp tọa độ (hệ trục Oxy/vector)** để chứng minh hình học, trừ khi người dùng yêu cầu rõ dùng tọa độ. Quy tắc này áp dụng cho MỌI bài, kể cả bài khó (ví dụ chứng minh hai đường thẳng vuông góc mà không có sẵn tam giác vuông chứa cả hai đường): phải dựng thêm đường phụ phù hợp (đường song song để dùng Talet/tam giác đồng dạng, đường vuông góc để tạo tam giác vuông rồi dùng tỉ số lượng giác, đường trung trực/trung điểm để dùng tính chất hình...) và suy luận từng bước bằng tam giác đồng dạng/Talet/tính chất hình học, đúng trình độ học sinh THCS — không nhảy sang đặt hệ trục tọa độ dù cách đó ngắn hơn.
9. **Chỉ dùng kiến thức học sinh ĐÃ HỌC tính đến thời điểm của đề.** Theo chương trình 2018 (Toán 9), học kỳ I gồm CẢ HAI mảng: "Tỉ số lượng giác của góc nhọn / Hệ thức lượng trong tam giác vuông" VÀ chương "Đường tròn" ở mức vị trí tương đối đường thẳng–đường tròn, tiếp tuyến, tính chất hai tiếp tuyến cắt nhau — nhưng **góc nội tiếp, góc ở tâm, góc tạo bởi tia tiếp tuyến và dây, tứ giác nội tiếp** (tổng hai góc đối bằng $180^\circ$), phương tích, định lý Ptolemy **đã bị dời sang học kỳ II**. Do đó dù đề thuộc chương hệ thức lượng HAY đề thuộc chương đường tròn/tiếp tuyến, hễ còn là đề học kỳ I thì TUYỆT ĐỐI không được dùng các công cụ vừa nêu, cũng như các công cụ ngoài chương trình THCS (định lý sin/cosin, Menelaus, Ceva, tọa độ, vector). Công cụ được phép dùng ở giai đoạn học kỳ I: tam giác đồng dạng, định lý Pythagore, định lý Talet, tính chất hình chữ nhật/hình bình hành/hình thoi, đường trung bình, đường trung trực, tỉ số lượng giác của góc nhọn, tính chất hai tiếp tuyến cắt nhau, quan hệ vuông góc giữa bán kính và tiếp tuyến tại tiếp điểm, định lý đảo của đường trung tuyến ứng với cạnh huyền.

   **Ba mẫu thay thế tránh dùng kiến thức chương đường tròn học kỳ II:**
   - *Mẫu hai đường trung trực vuông góc nhau (tránh tứ giác nội tiếp cho dạng "chứng minh một điểm cách đều bốn điểm"):* gọi $K$ là giao điểm của HAI đường trung trực dễ dựng nhất (thường là trung trực của hai đoạn nằm trên hai cạnh góc vuông, nên chúng vuông góc với nhau và tạo hình chữ nhật với đỉnh góc vuông), dùng tính chất hình chữ nhật để quy các khoảng cách về hai cạnh, dùng định lý Pythagore viết $KD^2$ và $KE^2$, rồi xét hiệu $KD^2-KE^2$ và đưa về đẳng thức tích đã chứng minh ở ý trước (ví dụ $AD\cdot AB=AH^2=AE\cdot AC$) để suy ra $KD=KE$; từ đó $K$ nằm trên đường trung trực còn lại nên $K$ trùng điểm cần xét, và kết luận bốn khoảng cách bằng nhau.
   - *Mẫu hình bình hành (gọn hơn khi đề cho sẵn hai trung điểm):* với $I$ là trung điểm $AH$ (tâm hình chữ nhật $ADHE$, nên $IA=ID=IE$) và $K$ là trung điểm cạnh huyền $BC$ (nên $KA=KB=KC$), chứng minh $AK\perp DE$ bằng hai tam giác cân $\triangle IAE$, $\triangle KAC$ cộng tổng ba góc trong tam giác; suy ra trung trực của $DE$ song song $AK$ và trung trực của $BC$ song song $AH$, do đó $AITK$ là hình bình hành, cho $KT=AI=ID$ và $IT=AK=KB$; cuối cùng dùng định lý Pythagore trong hai tam giác vuông $TID$, $TKB$ để suy ra $TD=TB$, ghép với tính chất trung trực ra bốn đoạn bằng nhau.
   - *Mẫu định lý đảo của đường trung tuyến ứng với cạnh huyền (tránh "góc nội tiếp chắn nửa đường tròn" cho dạng "chứng minh tam giác nội tiếp đường tròn có một cạnh là đường kính thì vuông"):* với $\triangle ABC$ nội tiếp $(O)$ và $AB$ là đường kính ($O$ là trung điểm $AB$), thay vì dùng góc nội tiếp chắn nửa đường tròn, trình bày: "Xét $\triangle ABC$, ta có $CO$ là đường trung tuyến ứng với cạnh $AB$ ($O$ là trung điểm $AB$) và $CO=\dfrac{1}{2}AB$ (vì $CO=R$, $AB=2R$).\\ Suy ra $\triangle ABC$ vuông tại $C$ (định lý đảo của đường trung tuyến ứng với cạnh huyền)." — áp dụng tương tự cho bất kỳ đỉnh nào của tam giác nội tiếp có một cạnh là đường kính, không riêng đỉnh $C$.

   Khi không chắc một định lý đã được học ở thời điểm của đề hay chưa, chọn cách chứng minh sơ cấp hơn hoặc hỏi người dùng, tuyệt đối không mặc định là học sinh đã biết.
10. **Khi lời giải cần kết hợp từ 3 đẳng thức/tỉ số trung gian trở lên để suy ra kết luận cuối cùng** (ví dụ ghép nhiều cặp tam giác đồng dạng để rút ra một đẳng thức/tỉ lệ cuối), đánh số các đẳng thức đó ngay cuối dòng bằng `(1)`, `(2)`, `(3)`... rồi kết luận bằng đúng MỘT dòng dạng "Từ (1), (2), ..., ($n$) suy ra <kết luận>." — KHÔNG dùng chuỗi `\Rightarrow` nối tiếp, cũng KHÔNG diễn giải lại toàn bộ dây chuyền suy luận bằng lời khi số đẳng thức cần ghép từ 3 trở lên (làm vậy sẽ rất dài dòng và khó theo dõi). Khi chỉ có 1–2 đẳng thức cần ghép thì vẫn dùng chuỗi "Suy ra" trơn theo quy tắc 4, không cần đánh số. Ví dụ mẫu (bài toán ghép 5 kết quả trung gian để suy ra một tỉ số cuối):
    ```latex
    Xét tam giác $ADN$ vuông tại $D$, ta có $\sin\widehat{DAN}=\dfrac{DN}{AN}$, suy ra $AN=\dfrac{DN}{\sin\widehat{DAN}}$ (1)\\
    Xét tam giác $AEM$ vuông tại $E$, ta có $\sin\widehat{MAE}=\dfrac{ME}{AM}$, suy ra $AM=\dfrac{ME}{\sin\widehat{MAE}}$ (2)\\
    Xét tam giác $ADN$ và tam giác $ANB$ có\\
    $\widehat{ADN}=\widehat{ANB}=90^\circ$; $\widehat{A}$ chung\\
    Suy ra $\triangle ADN\backsim\triangle ANB$ (g.g)\\
    Do đó $\dfrac{AD}{AN}=\dfrac{AN}{AB}$ hay $AN^2=AB\cdot AD$ (3)\\
    Xét tam giác $AEM$ và tam giác $AMC$ có\\
    $\widehat{AEM}=\widehat{AMC}=90^\circ$; $\widehat{A}$ chung\\
    Suy ra $\triangle AEM\backsim\triangle AMC$ (g.g)\\
    Do đó $\dfrac{AE}{AM}=\dfrac{AM}{AC}$ hay $AM^2=AC\cdot AE$ (4)\\
    Xét tam giác $AEB$ và tam giác $ADC$ có\\
    $\widehat{AEB}=\widehat{ADC}=90^\circ$; $\widehat{A}$ chung\\
    Suy ra $\triangle AEB\backsim\triangle ADC$ (g.g)\\
    Do đó $\dfrac{AE}{AD}=\dfrac{AB}{AC}$ hay $AC\cdot AE=AB\cdot AD$ (5)\\
    Từ (1), (2), (3), (4), (5) suy ra $\dfrac{DN}{\sin\widehat{DAN}}=\dfrac{ME}{\sin\widehat{MAE}}$.\\
    Vậy $\dfrac{DN}{\sin\widehat{DAN}}=\dfrac{ME}{\sin\widehat{MAE}}$.
    ```

## Khuôn dạng đề cố định khi soạn đề mới

### Phương trình chứa ẩn ở mẫu (Toán 9)

Khi soạn câu giải phương trình chứa ẩn ở mẫu, đề phải đạt đủ bốn yêu cầu:

1. Có một mẫu cần phân tích thành nhân tử mới tìm được mẫu chung, theo MỘT trong hai cách: đặt nhân tử chung ($x^2-3x=x(x-3)$, $2x-4=2(x-2)$) hoặc hằng đẳng thức $a^2-b^2$ ($x^2-4=(x-2)(x+2)$, $x^2-9=(x-3)(x+3)$).
2. Sau khi quy đồng, khử mẫu và rút gọn, phương trình thu được có dạng $ax^2+bx=0$ hoặc $ax^2-bx=0$ (không có hạng tử tự do).
3. Giải bằng cách đặt nhân tử chung đưa về phương trình tích, được hai nghiệm $x=0$ và $x=\pm\dfrac{b}{a}$.
4. Trong hai nghiệm đó có ĐÚNG MỘT nghiệm vi phạm điều kiện xác định (bị loại), nghiệm còn lại thỏa mãn. Nếu mẫu có nhân tử $x$ thì $x=0$ tự bị loại, nên nghiệm $\pm\dfrac{b}{a}$ phải hợp lệ; nếu mẫu dạng $a^2-b^2$ thì chọn hệ số sao cho $\pm\dfrac{b}{a}$ trùng một giá trị bị loại.

Cách dựng ngược: viết sẵn hai phân thức vế trái, khai triển tử số sau khi quy đồng, rồi chọn tử số vế phải để triệt tiêu hạng tử tự do và để lại đúng phần $ax^2\pm bx$ mong muốn. Thế cả hai nghiệm vào phương trình gốc để kiểm tra.

Hai mẫu đã kiểm chứng:

```latex
% Hằng đẳng thức a^2-b^2: rút gọn được 2x^2-4x=0, nghiệm x=0 (nhận), x=2 (loại)
$\dfrac{x+1}{x-2}+\dfrac{x-1}{x+2}=\dfrac{4x+4}{x^2-4}$
% Đặt nhân tử chung: rút gọn được x^2-4x=0, nghiệm x=0 (loại), x=4 (nhận)
$\dfrac{x+3}{x-3}-\dfrac{3}{x}=\dfrac{4x+9}{x^2-3x}$
```

Khuôn lời giải (mẫu hằng đẳng thức):

```latex
\item Điều kiện xác định: $x\neq 2$ và $x\neq -2$.\\
Ta có $x^2-4=(x-2)(x+2)$.\\
Quy đồng và khử mẫu phương trình đã cho, ta được
\begin{align*}
	(x+1)(x+2)+(x-1)(x-2)&=4x+4\\
	x^2+3x+2+x^2-3x+2&=4x+4\\
	2x^2-4x&=0\\
	2x(x-2)&=0.
\end{align*}
Suy ra $x=0$ hoặc $x=2$.\\
Giá trị $x=0$ thỏa mãn điều kiện xác định, giá trị $x=2$ không thỏa mãn điều kiện xác định.\\
Vậy tập nghiệm của phương trình là $S=\{0\}$.
```

## Checklist trước khi xuất

- [ ] Không còn dòng trống, không còn `%%%====`, không còn mã nguồn đề (quy tắc 2, 6).
- [ ] Không còn `\Rightarrow`, `\Leftrightarrow`, `\hoac`, `\quad`, `$$`; mọi `\frac` đã thành `\dfrac`; số thập phân dùng `{,}`; số ≥ 1000 dùng `\,` (quy tắc 4, 5).
- [ ] Tự luận dùng `bt`, trắc nghiệm dùng `ex` (đúng 4 phương án, có `\True`), ví dụ dùng `vd[Tên dạng]`; `\choiceTFt`→`\choiceTF`, `\loigiaiTF`→`\loigiai`.
- [ ] `\Opensolutionfile`/`\Closesolutionfile` khớp cặp; không tự thêm `ansbook` nếu bản gốc không có; câu hỏi chia cột (`multicols`), lời giải một cột.
- [ ] Cả đề bài lẫn lời giải đều dùng `enumerate`/`\item` TRƠN, số `\item` trong lời giải khớp số ý của đề — không còn `\item[1)]`, `\item[a)]` hay chữ "1)", "a)" gõ tay (quy tắc 2).
- [ ] **Hình vẽ dựng theo mục "Vẽ hình TikZ"**, đã chạy hết checklist tự kiểm TikZ của mục đó, nằm trong `\begin{center}...\end{center}`, và đặt SAU `\end{enumerate}` (sau toàn bộ phần đề) chứ không chen giữa câu dẫn và enumerate.
- [ ] Trình bày lời giải đúng quy tắc 4: dùng $\triangle A\backsim\triangle B$; không trích hệ thức lượng trực tiếp mà chứng minh lại bằng tam giác đồng dạng; khuôn "Xét ..., ta có [giả thiết]" (hoặc "Ta có: [giả thiết]") rồi "Suy ra ... (tên định lý/tính chất)", không viết "Vì ... nên ..."; giả thiết độc lập thứ hai nối bằng "Mà" (không dùng "Lại có"); kết luận phụ gộp vào "Suy ra ... và ..."; "Vậy" chỉ dành cho kết luận cuối ý/bài.
- [ ] Không dùng phương pháp tọa độ (Oxy/vector) để chứng minh hình học (quy tắc 8).
- [ ] Không dùng kiến thức chưa học ở thời điểm của đề — với đề HK1 không góc nội tiếp/góc ở tâm/góc tạo bởi tia tiếp tuyến và dây/tứ giác nội tiếp, dùng ba mẫu thay thế (quy tắc 9).
- [ ] Ghép từ 3 đẳng thức trung gian trở lên đã đánh số `(1)`, `(2)`... và kết luận bằng đúng một dòng "Từ (1), ..., ($n$) suy ra ..." (quy tắc 10).
- [ ] Câu phương trình chứa ẩn ở mẫu (nếu có) đúng khuôn: mẫu phân tích bằng đặt nhân tử chung hoặc $a^2-b^2$, rút gọn về $ax^2\pm bx=0$, đúng một nghiệm bị loại.
- [ ] **Đã thế ngược mọi nghiệm vào từng dữ kiện của đề để kiểm tra.**
- [ ] Ghi chú về mâu thuẫn/số liệu phi thực tế đặt ngoài code block.

## Đầu ra

- Kết quả luôn ở trong code block ```latex.
- Không viết giải thích trong code block.
- Ngoài code block chỉ viết: (a) tóm tắt những chỗ đã sửa, (b) cảnh báo về số liệu/dữ kiện cần người dùng quyết định.
- Nếu tài liệu dài (>10 bài), vẫn xuất trong một code block theo đúng quy tắc 3, không cắt bớt nội dung.

---

# Tệp tham chiếu references/quy-tac-chuan-hoa.md

# Bộ quy tắc chuẩn hóa LaTeX Toán THCS – THPT

## I. Nguyên tắc chung

1. Giữ nguyên 100% nội dung gốc.
2. Không kiểm tra, không tự ý sửa đúng sai của đề bài, đáp án hoặc lời giải (trừ khi được yêu cầu).
3. Không tự thêm, bớt hoặc thay đổi dữ kiện toán học.
4. Giữ nguyên thứ tự các bài, câu hỏi, ý hỏi, phương án và lời giải.
5. Xuất kết quả trong code block LaTeX.
6. Không viết giải thích trong code block.
7. Không để bất kỳ dòng trống nào.
8. Không cắt mất nội dung.
9. Giữ nguyên bảng biểu, `center`, `immini`, `multicols`, `listEX`…
10. Không xóa `\loigiai{...}`, không tự ý đổi nội dung lời giải.
11. Chỉ chuẩn hóa cú pháp, định dạng và môi trường.

## II. Xóa dòng trống, comment và thông tin nguồn

1. Xóa toàn bộ dòng trống.
2. Xóa các dòng phân cách: `%%%=====EX_1=====%%%`, `%%%=====VD_1=====%%%`, `%%%==========%%%`.
3. Xóa mã phân loại: `%[0D1H2-1]`, `%[0D2V1-3]%`, `%[Dự án ...]`, `%[Dự án ...]%[0D2N2-1]`.
4. Xóa tùy chọn nguồn đề sau môi trường nếu `[...]` chỉ là nguồn đề, trường, năm học hoặc mã đề:
   `\begin{ex}[Trích đề ...]` → `\begin{ex}`.
5. Xóa dòng nguồn đề đứng riêng: `[THPT Nguyễn Thị Minh Khai - GHKI-NH24-25]`, `[SGK Toán 10 - Kết nối tri thức]`, `[SBT Toán 10 - Cánh Diều]`, `[Tài liệu Thầy ...]`.
6. Xóa các dòng nguồn đề dạng `\textit{(Trích đề ...)}\\`, `(\textit{Trích đề ...})\\`, `[\textit{Trích đề ...}]`, `(\textit{\footnotesize Trích đề ...})\\`.
7. Xóa dấu `\\` thừa đi kèm trước hoặc sau các dòng nguồn đề.
8. **Không** xóa `\textit{...}` thuộc nội dung thực sự của bài học.

## III. Chuẩn hóa tiêu đề phần

```latex
\subsubsection{\textbf{PHẦN I. }Câu trắc nghiệm nhiều phương án lựa chọn.}
```
đổi thành
```latex
\ind{PHẦN I.}
\inden{Câu trắc nghiệm nhiều phương án lựa chọn.}
```
Tương tự với PHẦN II, III, IV, V, PHẦN 1, PHẦN 2… Dạng `{\bf PHẦN I. ...}` cũng đổi tương tự. Không để `\\` sau `\inden{...}`.

## IIIb. Cấu trúc đề ôn tập (chuẩn `\deontap`)

Mỗi đề ôn tập bắt đầu bằng `\deontap{N}`, **không** dùng `\section{...}`, **không** ghi dòng “Thời gian làm bài”.

```latex
\deontap{1}
\ind{A.}
\inden{TRẮC NGHIỆM (3,0 điểm)}
\setcounter{ex}{0}
\Opensolutionfile{ans}[ans/6C1-De1]
\Opensolutionfile{ansbook}[ansbook/6C1-De1]
\begin{ex}
	...
\end{ex}
\Closesolutionfile{ans}
\Closesolutionfile{ansbook}
\ind{B.}
\inden{TỰ LUẬN (7,0 điểm)}
\setcounter{bt}{0}
\begin{bt}
	...
\end{bt}
```

- Đề ôn tập dùng `\deontap{N}`; bài học/chuyên đề dùng `\section{Tên bài}`.
- Thụt lề bằng tab: nội dung trong `ex`/`bt` thụt 1 tab; trong `enumerate` thụt 2 tab; trong `center`/`tikzpicture` thụt lùi dần theo cấp lồng nhau.

## IV. Trắc nghiệm nhiều lựa chọn

```latex
\begin{ex}
	Nội dung câu hỏi
	\choice
	{Phương án A}
	{\True Phương án B}
	{Phương án C}
	{Phương án D}
	\loigiai{
		Lời giải
	}
\end{ex}
```
- Đúng 4 phương án, giữ hoặc thêm `\True` theo dữ liệu gốc.
- Xóa dấu `\\` thừa ở cuối câu hỏi.
- Không để `}\end{ex}` trên cùng một dòng.

## V. Trắc nghiệm đúng – sai

- Đổi `\choiceTFt` → `\choiceTF`; `\loigiaiTF` → `\loigiai`.
- Giữ `\True` ở các ý đúng, không thêm chữ Đúng/Sai nếu bản gốc không có.

```latex
\begin{ex}
	Nội dung chung.
	\choiceTF
	{\True Mệnh đề a}
	{Mệnh đề b}
	{\True Mệnh đề c}
	{Mệnh đề d}
	\loigiai{
		\begin{itemchoice}
			\itemch Lời giải ý a.
			\itemch Lời giải ý b.
			\itemch Lời giải ý c.
			\itemch Lời giải ý d.
		\end{itemchoice}
	}
\end{ex}
```

## VI. Trả lời ngắn

```latex
\begin{ex}
	Nội dung câu hỏi.
	\shortans[oly]{Đáp án}
	\loigiai{
		Lời giải.
	}
\end{ex}
```
Xóa `\par` đứng trước `\shortans`.

## VII. Phần tự luận

- Đổi `\begin{ex}` → `\begin{bt}`, `\end{ex}` → `\end{bt}`, `\setcounter{ex}{0}` → `\setcounter{bt}{0}`.
- Giữ nguyên `\loigiai{...}`, TikZ, bảng biểu, `immini`, `enumerate`, `itemize`…
- `dang` phải rỗng, `bt` nằm ngoài, đề mục dạng dùng `[...]`:
```latex
\begin{dang}[Tên dạng]
\end{dang}
\begin{bt}
	...
\end{bt}
```

## VIII. Môi trường ví dụ

- Giữ `\begin{vd}[Tên dạng]…\end{vd}`; bắt buộc có tiêu đề ngắn trong `[...]`.
- Nếu bản gốc thiếu tiêu đề thì tự đặt tiêu đề ngắn phù hợp nội dung.
- Không đưa tên trường, nguồn đề hoặc năm học vào `[...]`.

## IX. Lý thuyết và hộp

1. Xóa môi trường `khung4`, giữ nội dung bên trong.
2. Đổi `note` → `luuy`.
3. Xóa môi trường `boxdn`, giữ nội dung bên trong.
4. `\indam{Nội dung}` → chỉ giữ `Nội dung`.
5. Giữ nguyên: `dang`, `tomtat`, `luuy`, `nx`, `tc`, `dn`, `kttrongtam`, `ghinho`, `itemize`, `enumerate`…

## X. Enumerate và itemize

- Xóa các tùy chọn `[a)]`, `[1)]`, `[•]` → `\begin{enumerate}`.
- Giữ nguyên các `\item`, không đổi thứ tự, không tự thêm nhãn a), b), c).
- Không để dòng trống trong `enumerate` hoặc `itemize`.

## XI. Công thức toán

1. Tất cả công thức đặt trong `$...$`. Không dùng `\[...\]` hay `$$...$$`.
2. `\frac` → `\dfrac`.
3. Xóa toàn bộ `\quad`. Có thể dùng `\;` khi cần phân cách nhẹ.
4. Không dư dấu `$`; không dùng `${13}$`, viết `$13$`.
5. Chuẩn khoảng trắng: `$x\in\mathbb{R}$`, `$A\subset B$`, `$x=1$`.
6. Dùng `\neq`, `\geq`, `\leq`.
7. Hệ phương trình: `$\heva{&2x+3y=5\\&x-y=1}$`.
8. Không tự sửa biểu thức toán học có thể sai trong bản gốc.

## XII. Số, số thập phân và đơn vị

1. Các số trong nội dung toán học đặt trong `$...$`.
2. Số lớn dùng dấu cách mảnh: `$100\,000$`, `$46\,656$`.
3. Không tách số nếu là năm học, mã bài hoặc chỉ số cần giữ ngữ nghĩa.
4. Số thập phân dùng dấu phẩy trong ngoặc nhọn: `$2{,}5$`, `$812{,}5$`.
5. Đơn vị: `$10$ cm`, `$240$ cm$^2$`, `$50\,000$ đồng`, `$100\,000$ đồng/vé`.
6. Lũy thừa: `$2^3$`, `$5^{20}$`, `$\left(\dfrac{4}{9}\right)^5$`.

## XIII. Tập hợp, khoảng và dấu phân cách

- Xóa khoảng trắng thừa: `$\{1;2;3\}$`.
- Chuẩn hóa: `$(-\infty;1)$`, `$[-2;3)$`, `$\left[\dfrac{1}{3};+\infty\right)$`.
- Dùng `$\{x\in\mathbb{R}\mid x<1\}$`, `$\{x\in\mathbb{N}\mid x\text{ là số lẻ}\}$`.

## XIV. Ký hiệu hình học

- `//` → `\parallel`; `\angle AIB` → `\widehat{AIB}`.
- Góc `$xOy$` → `$\widehat{xOy}$`; khi đã dùng `\widehat{...}` thì bỏ chữ “góc” nếu câu vẫn tự nhiên.
- Điểm, tia, đường thẳng đặt trong math mode: `$A$`, `$Ox$`, `$Oy$`.
- Tam giác: `$\triangle ABC$`. Vuông góc: `\perp`.

## XV. Lệnh mở và đóng file đáp án

Chỉ áp dụng cho phần trắc nghiệm:
```latex
\setcounter{ex}{0}
\Opensolutionfile{ans}[ans/ten-file]
\Opensolutionfile{ansbook}[ansbook/ten-file]
...
\Closesolutionfile{ans}
\Closesolutionfile{ansbook}
```
- Tên file theo quy ước: `ans/6C1-De1`, `ansbook/6C1-De1` (đề 2 là `6C1-De2`…).
- Nếu bản gốc chỉ mở `ans` mà không mở `ansbook` thì giữ nguyên, **không** tự thêm.
- Không đóng `ansbook` nếu chưa mở. Không tự xóa các lệnh đã có.
- Phần tự luận **không** dùng `\Opensolutionfile`.

## XVI. Cấu trúc xuất kết quả

1. Mỗi code block chứa đúng 1 `\section` hoặc đúng 1 `\deontap{N}`.
2. `dang` rỗng, `bt` nằm ngoài; đề mục dạng dùng `[...]`.
3. Mọi hình vẽ đặt trong `\begin{center}...\end{center}`.

## XVII. Chia cột

- Phần câu hỏi: mặc định tối thiểu 2 cột (`\begin{multicols}{2}`).
  - Câu ngắn (đáp số một dòng, số/căn/phân số đơn giản) → 3 hoặc 4 cột.
  - Câu dài (nhiều bước biến đổi, biểu thức cồng kềnh) → 1 cột.
- Phần lời giải: không chia cột.

## XVIII. Trình bày lời giải

Xem chi tiết ở `mau-loi-giai.md`. Tóm tắt:

1. Ngôn ngữ lớp 7 trở xuống: không dùng “phương trình”, “nghiệm”; dùng “bài toán tìm $x$”, “không có giá trị nào của $x$ thỏa mãn”.
2. Không dùng `\Rightarrow`, `\implies` — thay bằng chữ “Suy ra”.
3. Không dùng `\hoac{}` — dùng chữ “hoặc” căn cột trong `align*` với một dấu `&` duy nhất ngay trước `\text{ hoặc }`.
4. Phép tính dài → trình bày dọc bằng `align*`.
5. Phép tính ngắn → gộp một dòng.
6. Lời giải chi tiết nhưng không dài dòng bằng lời; ưu tiên công thức.
7. Xuống dòng trong lời giải dùng `\\`, không để dòng trống.

## XIX–XX. TikZ

Xem `tikz.md`.

## XXI. Regex xóa nguồn đề

Xem `regex-texstudio.md`.

## XXII. Mẫu kết quả chuẩn

```latex
\ind{PHẦN I.}
\inden{Câu trắc nghiệm nhiều phương án lựa chọn.}
\setcounter{ex}{0}
\Opensolutionfile{ans}[ans/ten-file]
\begin{ex}
	Nội dung câu hỏi.
	\choice
	{Phương án A}
	{\True Phương án B}
	{Phương án C}
	{Phương án D}
	\loigiai{
		Lời giải.
	}
\end{ex}
\Closesolutionfile{ans}
```

Tự luận:
```latex
\ind{PHẦN IV.}
\inden{Tự luận}
\setcounter{bt}{0}
\begin{dang}[Tên dạng]
\end{dang}
\begin{bt}
	Nội dung bài toán.
	\begin{multicols}{2}
		\begin{enumerate}
			\item Ý thứ nhất.
			\item Ý thứ hai.
		\end{enumerate}
	\end{multicols}
	\loigiai{
		Lời giải.
	}
\end{bt}
```

## XXIII. Lưu ý cuối

1. Không dư dấu `$`, không sai cú pháp môi trường, không để dòng trống.
2. Không xóa lời giải; không tự sửa nội dung toán học.
3. Không giữ nguồn đề, tên trường, dự án hoặc mã phân loại.
4. Tự luận dùng `bt`; trắc nghiệm dùng `ex`; ví dụ dùng `vd[Tên dạng]`.
5. Đúng – sai dùng `\choiceTF` và `itemchoice`; trả lời ngắn giữ `\shortans[oly]{...}`.
6. Mỗi code block một `\section` hoặc một `\deontap{N}`.
7. Câu hỏi chia cột, lời giải một cột.
8. Dùng chữ “Suy ra”, chữ “hoặc”.
9. Chỉ vẽ cung cho góc đề nhắc tới.
10. `\tikzset` đặt NGOÀI `tikzpicture`; không dùng biến `e`, `y` trong `declare function`.
11. Trình bày sạch, gọn, biên dịch được ngay.

## XXIV. Nhắc việc khi xử lý

Nếu phát hiện đề gốc có mâu thuẫn số liệu hoặc lỗi gõ: **không tự sửa đề**, giữ nguyên, viết lời giải theo đúng dữ kiện đã cho, và ghi chú riêng **ngoài** code block để người dùng kiểm tra lại. Xem thêm `soan-de-moi.md` mục “Kiểm tra tính hợp lý”.

---

# Tệp tham chiếu references/mau-loi-giai.md

# Mẫu trình bày lời giải (bắt buộc theo đúng khuôn này)

## 0. Quy tắc chung

- Mỗi câu một dòng, kết thúc bằng `\\` (trừ dòng cuối và dòng ngay trước `align*`/`itemize`/`enumerate`).
- Không dòng trống. Nội dung `\loigiai{` thụt thêm 1 tab so với `\loigiai`.
- Không `\Rightarrow`, `\Leftrightarrow`, `\implies`, `\hoac{}`, `$$...$$`, `\[...\]`.
- Biến đổi nhiều bước → `align*`, dấu `&` đặt trước dấu `=`.
- Kết luận luôn bắt đầu bằng “Vậy …” và có đơn vị.

## 1. Khung chuẩn — bài toán lập phương trình

```latex
\loigiai{
	Gọi <đại lượng cần tìm> là $x$ (<đơn vị>, <điều kiện>).\\
	<Biểu diễn đại lượng 1> là $\dfrac{...}{x}$ (<đơn vị>).\\
	<Biểu diễn đại lượng 2> là $x+a$ (<đơn vị>).\\
	<Biểu diễn đại lượng 3> là $\dfrac{...}{x+a}$ (<đơn vị>).\\
	Vì <dữ kiện then chốt> nên ta có phương trình
	\begin{align*}
		\dfrac{S}{x}-\dfrac{S}{x+a}&=k.
	\end{align*}
	Quy đồng và khử mẫu phương trình trên, ta được
	\begin{align*}
		S(x+a)-Sx&=kx(x+a)\\
		\ldots&=\ldots\\
		x^2+bx+c&=0.
	\end{align*}
	Giải phương trình trên, ta được $x=x_1$ (thỏa mãn) và $x=x_2$ (loại).\\
	Vậy <trả lời đúng câu hỏi của đề> là $x_1$ <đơn vị>.
}
```

Ghi chú:
- Ghi rõ **giá trị** của nghiệm bị loại (`$x=-30$ (loại)`), không viết “một nghiệm âm”.
- Nếu đề hỏi đại lượng khác với ẩn (thời gian khi ẩn là vận tốc, số người thực tế…), phải thêm một dòng tính rồi mới kết luận.

## 2. Khung chuẩn — bài toán lập hệ phương trình

```latex
\loigiai{
	Gọi <đại lượng 1> là $x$ (<đơn vị>) và <đại lượng 2> là $y$ (<đơn vị>), điều kiện <...>.\\
	<Diễn giải dữ kiện 1> nên ta có phương trình <pt 1>.\\
	<Diễn giải dữ kiện 2> nên ta có phương trình <pt 2>.\\
	Ta có hệ phương trình $\heva{&<pt 1>&(1)\\&<pt 2>&(2)}$\\
	Nhân hai vế của $(1)$ với $k$, ta được <...>.\\
	Trừ vế theo vế phương trình $(2)$ cho đẳng thức vừa nhận được, ta có
	\begin{align*}
		\ldots&=\ldots\\
		x&=x_0.
	\end{align*}
	Suy ra $y=y_0$ (thỏa mãn điều kiện).\\
	Vậy <kết luận>.
}
```

Khi phương trình cần rút gọn trước khi vào hệ:
```latex
	Rút gọn phương trình thứ nhất, ta được
	\begin{align*}
		\ldots&=\ldots\\
		x-y&=3.
	\end{align*}
```

## 3. Đặt ẩn phụ (vòi nước, công việc, xuôi ngược dòng)

```latex
	Đặt $u=\dfrac{1}{x}$ và $v=\dfrac{1}{y}$ với $u>0$, $v>0$, ta được hệ phương trình $\heva{&u+v=\dfrac{1}{6}&(1)\\&3u+8v=\dfrac{5}{6}&(2)}$\\
	...
	Suy ra $x=10$ và $y=15$ (thỏa mãn điều kiện).\\
```

## 4. Bài có nhiều ý (a, b)

```latex
\loigiai{
	\begin{enumerate}
		\item <lời giải ý a, các dòng kết thúc bằng \\>
		\item <lời giải ý b>
	\end{enumerate}
}
```
`\item` thụt 2 tab, nội dung tiếp theo cùng mức với `\item`.

## 5. Chữ “hoặc” thay cho `\hoac{}`

```latex
\begin{align*}
	\left|x-\dfrac{1}{2}\right|-5 &= -2\\
	\left|x-\dfrac{1}{2}\right| &= 3\\
	\text{Suy ra } x-\dfrac{1}{2} = 3 &\text{ hoặc } x-\dfrac{1}{2} = -3\\
	\text{Suy ra } x = \dfrac{7}{2} &\text{ hoặc } x = -\dfrac{5}{2}.
\end{align*}
```
Hai điều kiện đồng thời thì dùng `\text{ và }`.

## 6. Phép tính dài trình bày dọc

```latex
\begin{align*}
	1\dfrac{3}{5} - \left|\dfrac{5}{2}\right| + \dfrac{-1}{4} + \dfrac{21}{8} &= \dfrac{8}{5} - \dfrac{5}{2} - \dfrac{1}{4} + \dfrac{21}{8}\\
	&= \dfrac{64}{40} - \dfrac{100}{40} - \dfrac{10}{40} + \dfrac{105}{40}\\
	&= \dfrac{59}{40}.
\end{align*}
```

## 7. Phép tính ngắn gộp một dòng

`Vì $Bm$ là tia phân giác của $\widehat{ABC}$ nên $\widehat{ABC}=2\cdot\widehat{ABm}=2\cdot 37^\circ=74^\circ$.`

## 8. Câu chữ chuẩn hay dùng

| Tình huống | Câu chuẩn |
|---|---|
| Đổi đơn vị | `Đổi $1$ giờ $40$ phút $=\dfrac{5}{3}$ giờ.\\` |
| Đặt ẩn | `Gọi ... là $x$ (<đơn vị>, $x>0$).\\` |
| Lập pt | `Vì ... nên ta có phương trình` |
| Khử mẫu | `Quy đồng và khử mẫu phương trình trên, ta được` |
| Khai triển | `Khai triển và rút gọn phương trình thứ nhất, ta được` |
| Cộng/trừ hệ | `Cộng vế theo vế hai phương trình trên, ta được` |
| Thế | `Từ phương trình thứ hai suy ra $y=x+4$, thay vào phương trình thứ nhất ta được` |
| Nghiệm | `Giải phương trình trên, ta được $x=a$ (thỏa mãn) và $x=b$ (loại).\\` |
| Kết luận | `Vậy ... là $...$ <đơn vị>.` |

## 9. Ngôn ngữ theo cấp lớp

- Lớp 7 trở xuống: không dùng “phương trình”, “nghiệm”. Dùng “bài toán tìm $x$”; vô nghiệm ghi “không có giá trị nào của $x$ thỏa mãn”.
- Lớp 8, 9: dùng bình thường “phương trình”, “hệ phương trình”, “nghiệm”.

---

# Tệp tham chiếu references/tikz.md

# Vẽ hình và biểu đồ bằng TikZ

## Preamble

```latex
\usepackage{tikz}
\usetikzlibrary{calc,intersections,angles,quotes,patterns,through}
```

# PHẦN 1. HÌNH HỌC

## Quy tắc dựng hình

1. Toạ độ khai báo qua `declare function={...}`, không quá 8 biến, **không dùng `scale`**, số thập phân tối đa 2 chữ số.
2. **KHÔNG dùng `e` và `y` làm tên biến** trong `declare function` (`e` là hằng số Euler, `y` trùng trục tung). Thay bằng `dx`, `dy`, `y0`, `w`, `hg`, `uu`…
3. Điểm phụ thuộc dựng bằng phép biến hình, **không nhập toạ độ tay**:

| Khai báo | Mã TikZ |
|---|---|
| $M$ là trung điểm $AB$ | `\path ($(A)!0.5!(B)$) coordinate (M);` |
| $A$, $B$ đối xứng qua $M$ | `\path ($(M)!-1!(B)$) coordinate (A);` |
| $B$ đối xứng $A$ qua $CD$ | `\path ($(C)!(A)!(D)$) coordinate (Ah) (barycentric cs:A=1,Ah=-2) coordinate (B);` |
| Quay $60^\circ$ biến $B$ thành $C$ | `\path ($(O)!1!60:(B)$) coordinate (C);` |
| $H$ là hình chiếu của $A$ lên $BC$ | `\path ($(B)!(A)!(C)$) coordinate (H);` |
| $AD$ là phân giác góc $A$ | `\path ($(A)!1cm!(B)$) coordinate (AB) ($(A)!1cm!(C)$) coordinate (AC) ($(AB)!0.5!(AC)$) coordinate (At) (intersection of A--At and B--C) coordinate (D);` |
| $G$ là trọng tâm $\triangle ABC$ | `\path (barycentric cs:A=1,B=1,C=1) coordinate (G);` |
| $H$ là trực tâm $\triangle ABC$ | `\path ($(B)!(A)!(C)$) coordinate (AH) ($(A)!(B)!(C)$) coordinate (BH) (intersection of A--AH and B--BH) coordinate (H);` |
| $E$ là giao của $AB$ và $CD$ | `\path (intersection of A--B and C--D) coordinate (E);` |

4. **Thứ tự vẽ**: khai báo điểm → ký hiệu góc vuông/góc → ký hiệu độ dài → nét đứt → nét liền → nhãn điểm.
5. Nhãn hiển thị bằng `\foreach`, vị trí dời theo toạ độ cực:
```latex
\foreach \t/\g in {x/-90,y/-90,z/90}
\node at (\t) [shift={(\g:7pt)}]{$\t$};
\foreach \t/\g in {O/-90,A/135}
\draw[fill=black] (\t) circle (1pt) node[shift={(\g:7pt)}]{$\t$};
```
Điểm có chấm dùng `\draw[fill=black] ... circle (1pt)`; tên tia/đường thẳng chỉ dùng `\node`.
6. Gom khai báo lặp bằng `\foreach`, code ngắn nhất có thể, **không dòng chú thích `%`**.
7. Khai báo chuẩn:
```latex
\begin{tikzpicture}[font=\footnotesize,line join=round,line cap=round,declare function={r=2.5; goc=70;}]
```

## Ký hiệu góc

Cú pháp đầy đủ:
```latex
pic["$60^\circ$", draw, angle radius=12pt, angle eccentricity=1.6]{angle=B--A--C}
```

| Trường hợp | Ký hiệu |
|---|---|
| Cặp góc bằng nhau thứ nhất | `pic[draw, angle radius=12pt]` — 1 nét |
| Cặp góc bằng nhau thứ hai | `pic[draw, double, cap=butt, angle radius=12pt]` — 2 nét |
| Cặp góc bằng nhau thứ ba | 1 nét + 2 nét chồng, bán kính lệch $1{,}5$pt |
| Góc vuông | `pic[draw, angle radius=6pt]{right angle=...}` |
| Góc đã cho số đo | cung + nhãn `"$60^\circ$"` |
| Góc đề không nhắc tới | **không vẽ cung** |

- Hai nửa của tia phân giác dùng cùng ký hiệu, cùng bán kính.
- Các cặp bằng nhau khác nhau trong cùng một hình phải dùng ký hiệu khác nhau.
- `angle eccentricity`: nhãn số đo dùng $1{,}9$–$2{,}2$; nhãn đánh số góc dùng $1{,}7$–$1{,}8$.

## Ký hiệu đoạn thẳng bằng nhau

Đặt `\tikzset` **NGAY TRƯỚC** `\begin{tikzpicture}` hoặc ngoài hình, **KHÔNG** đặt bên trong:
```latex
\tikzset{
	markx/.pic={\draw[thin] (45:.1)--(-135:.1) (-45:.1)--(135:.1);},
	markl/.pic={\draw[thin] (90:.1)--(-90:.1);},
	markll/.pic={\draw[thin,shift={(180:.02)}] (90:.1)--(-90:.1); \draw[thin,shift={(0:.02)}] (90:.1)--(-90:.1);},
	marklll/.pic={\draw[thin,shift={(180:.03)}] (90:.1)--(-90:.1); \draw[thin] (90:.1)--(-90:.1); \draw[thin,shift={(0:.03)}] (90:.1)--(-90:.1);}
}
```
Cách dùng: `\path (A)--(B) pic[pos=.5, sloped]{markl};`. Hình không có ký hiệu đoạn bằng nhau thì bỏ khối này.

## Mẫu: hai đường thẳng song song bị cắt bởi cát tuyến

```latex
\path (0,h) coordinate (a) (w,h) coordinate (x) (0,0) coordinate (b) (w,0) coordinate (y)
($(b)!0.55!(y)$) coordinate (B) ($(B)!1!goc:(y)$) coordinate (Bt)
(intersection of B--Bt and a--x) coordinate (A)
($(A)!-0.45!(B)$) coordinate (c1) ($(B)!-0.45!(A)$) coordinate (c2);
\draw (a)--(x) (b)--(y) (c1)--(c2);
```
Vị trí bốn góc quanh giao điểm (cát tuyến nghiêng góc `goc`): trên trái `{(goc+180)/2}`, trên phải `{goc/2}`, dưới phải `{goc/2-90}`, dưới trái `{goc/2+180}`.

## Một số mẫu hình cơ bản

- Đường tròn tâm $O$ bán kính $3$: `\draw[name path=dtron1] (O) circle (3);`
- Đường tròn tâm $O$ qua $A$: `\draw[name path=dtron1] let \p1=($(O)-(A)$) in (O) circle ({veclen(\x1,\y1)});`
- Đường tròn đường kính $AB$: `\path ($(A)!0.5!(B)$) coordinate (O);` rồi vẽ như trên.
- Tiếp tuyến tại $A$ dài $5$cm:
```latex
\begin{scope}[overlay]
	\path ($(A)!2.5cm!90:(O)$) coordinate (OA1) ($(A)!2.5cm!-90:(O)$) coordinate (OA2);
	\draw (O)--(A) (OA1)--(OA2);
\end{scope}
```
- Giao điểm cát tuyến với đường tròn: xác định hình chiếu vuông góc từ tâm $O$ xuống cát tuyến rồi lấy đối xứng.

# PHẦN 2. BIỂU ĐỒ

## Nguyên tắc chung

- Trục hoành là trục số tuyến tính, các mốc cách đều, mỗi cột nằm chính giữa mốc, có mũi tên chỉ chiều dương, nhãn đặt sau mũi tên.
- Trục tung có vạch ngang song song trục hoành, giá trị tăng đều, giá trị lớn nhất lớn hơn nhưng sát giá trị lớn nhất của dữ liệu; số trên trục tung màu đen.
- **Chiều cao cột = giá trị ghi trên cột = giá trị trên trục tung.** Không dùng “giá trị giả”.
- Mỗi cột/điểm ghi giá trị số, đặt giữa cột theo phương ngang và ngay trên đỉnh theo phương đứng.
- Tên biểu đồ in đậm, canh giữa; biểu đồ cột đặt dưới trục hoành, biểu đồ đường và tròn đặt phía trên.

## 1. Biểu đồ cột đơn

```latex
\begin{center}
	\begin{tikzpicture}[>=stealth,declare function={kc=2.4; rc=1.2; kcy=0.25;}]
		\foreach \yt in {5,10,15,20,25}{
			\draw[gray!35] (0,{\yt*kcy}) node[left,text=black]{\yt} -- +(9,0);
		}
		\foreach \i/\yt in {1/10,2/15,3/20}{
			\fill[blue!60] ({\i*kc-0.5*rc},0) rectangle +(rc,{\yt*kcy});
			\node[above=2pt] at (\i*kc,{\yt*kcy}) {\yt};
		}
		\foreach \i in {0,1,2,3}{
			\path (\i*kc,0) node[below=3pt]{\i};
		}
		\draw[->] (0,0)--({3*kc+0.5*kc},0) node[below right=4pt]{Tên trục hoành};
		\draw[->] (0,0)--(0,{26*kcy}) node[above left]{Tên trục tung};
		\node[below=14pt, font=\bfseries] at ({(3*kc+0.5*kc)/2},0) {Tên biểu đồ};
	\end{tikzpicture}
\end{center}
```

## 2. Biểu đồ cột ghép

```latex
\begin{center}
	\begin{tikzpicture}[>=stealth,declare function={kc=2.6; rc=0.8; kcy=0.1;}]
		\foreach \yt in {10,20,30,40,50,60}{
			\draw[gray!35] (0,{\yt*kcy}) node[left,text=black]{\yt} -- +(9.2,0);
		}
		\foreach \i/\a/\b in {1/10/20,2/12/25,3/14/30}{
			\draw[pattern=north east lines] ({\i*kc-rc},0) rectangle +(rc,{\a*kcy});
			\node[above=2pt] at ({\i*kc-0.5*rc},{\a*kcy}) {\a};
			\draw[blue,pattern=vertical lines,pattern color=blue] ({\i*kc},0) rectangle +(rc,{\b*kcy});
			\node[above=2pt] at ({\i*kc+0.5*rc},{\b*kcy}) {\b};
		}
		\foreach \i in {0,1,2,3}{
			\node[below=3pt] at (\i*kc,0) {\i};
		}
		\draw[->] (0,0)--({3*kc+0.7*kc},0) node[below right=4pt]{Tên trục hoành};
		\draw[->] (0,0)--(0,{62*kcy}) node[above left]{Tên trục tung};
		\node[below=16pt,font=\bfseries] at ({(3*kc+0.7*kc)/2},0) {Tên biểu đồ};
	\end{tikzpicture}
\end{center}
```

## 3. Biểu đồ đường (một đường)

```latex
\begin{center}
	\begin{tikzpicture}[>=stealth,declare function={ox=-0.6; kc=2.4; kcy=0.2;}]
		\foreach \y in {5,10,15,20,25,30}{
			\draw[gray!35] (0,{\y*kcy}) -- +(9.5,0);
			\node[left,text=black] at (0,{\y*kcy}) {\y};
		}
		\path ({ox+kc},{10*kcy}) coordinate (A);
		\foreach[count=\i] \yt/\xt in {10/1,15/2,20/3}{
			\draw[blue,very thick] (A)--({ox+\i*kc},{\yt*kcy}) coordinate (A);
			\draw[blue,dashed] ({ox+\i*kc},0)--({ox+\i*kc},{\yt*kcy});
			\fill[blue] ({ox+\i*kc},0) circle (1.2pt) ({ox+\i*kc},{\yt*kcy}) circle (1.8pt);
			\node[below=4pt] at ({ox+\i*kc},0) {\xt};
			\node[above=4pt] at ({ox+\i*kc},{\yt*kcy}) {\yt};
		}
		\draw[->] (0,0)--(9.5,0) node[below right=4pt]{Tên trục hoành};
		\draw[->] (0,0)--(0,{32*kcy}) node[above left]{Tên trục tung};
		\node[left] at (0,0) {0};
		\node[font=\bfseries,align=center] at (4.75,{35*kcy}) {Tên biểu đồ};
	\end{tikzpicture}
\end{center}
```

## 4. Biểu đồ đường (hai đường)

```latex
\begin{center}
	\begin{tikzpicture}[>=stealth,declare function={ox=-0.6; kc=2.6; kcy=0.12;}]
		\foreach \y in {20,40,60,80,100}{
			\draw[gray!35] (0,{\y*kcy}) -- +(11,0);
			\node[left,text=black] at (0,{\y*kcy}) {\y};
		}
		\path ({ox+kc},{50*kcy}) coordinate (A);
		\foreach[count=\i] \y/\x in {50/1,60/2,47/3,70/4}{
			\draw[blue,ultra thick,dashed] (A)--({ox+\i*kc},{\y*kcy}) coordinate (A);
			\fill[blue] ({ox+\i*kc},{\y*kcy}) circle (2pt);
			\node[below right=3pt] at ({ox+\i*kc},{\y*kcy}) {\y};
			\node[below=4pt] at ({ox+\i*kc},0) {\x};
		}
		\path ({ox+kc},{60*kcy}) coordinate (B);
		\foreach[count=\i] \y in {60,40,55,88}{
			\draw[orange!85!black,ultra thick] (B)--({ox+\i*kc},{\y*kcy}) coordinate (B);
			\fill[orange!85!black] ({ox+\i*kc},{\y*kcy}) circle (2pt);
			\node[above=4pt] at ({ox+\i*kc},{\y*kcy}) {\y};
		}
		\draw[->] (0,0)--(11,0);
		\draw[->] (0,0)--(0,{105*kcy});
		\node[left] at (0,0) {0};
		\begin{scope}[shift={(2.2,-1.2)}]
			\draw[blue,ultra thick,dashed] (0,0)--+(1.2,0);
			\node[right] at (1.4,0) {Chú giải 1};
			\draw[orange!85!black,ultra thick] (6,0)--+(1.2,0);
			\node[right] at (7.4,0) {Chú giải 2};
		\end{scope}
		\node[font=\bfseries,align=center] at (5.5,{112*kcy}) {TÊN BIỂU ĐỒ\\DÒNG THỨ HAI};
	\end{tikzpicture}
\end{center}
```

## 5. Biểu đồ tròn

Góc bắt đầu $90^\circ$, vẽ theo chiều kim đồng hồ, góc mỗi phần $=$ phần trăm $\times\,3{,}6$. Tổng các phần bằng $100$. Mỗi lát một pattern khác nhau, nhãn phần trăm đặt trong lát trên nền trắng, chú giải bên phải.

```latex
\begin{center}
	\begin{tikzpicture}[join=round, cap=round, font=\scriptsize]
		\def\R{3}
		\def\gocbd{90}
		\def\patA{dots}
		\def\patB{north east lines}
		\def\patC{crosshatch}
		\def\patD{horizontal lines}
		\foreach \name/\p/\pat [count=\i from 0] in
		{%
			{Phần thứ nhất}/43/\patA,
			{Phần thứ hai}/36/\patB,
			{Phần thứ ba}/14/\patC,
			{Phần thứ tư}/7/\patD
		}
		{
			\pgfmathsetmacro\gockt{\gocbd-\p*3.6}
			\draw[pattern=\pat] (0,0) -- (\gocbd:\R) arc (\gocbd:\gockt:\R) -- cycle;
			\node[fill=white,inner sep=1pt] at ({(\gocbd+\gockt)/2}:0.65*\R) {\p\%};
			\draw[pattern=\pat] (\R+1.5,\R-0.7*\i) rectangle +(0.5,-0.5);
			\node[right] at (\R+2.1,\R-0.7*\i-0.25) {\name};
			\global\let\gocbd=\gockt
		}
		\node[above=10pt,font=\bfseries] at (current bounding box.north) {Tên biểu đồ};
	\end{tikzpicture}
\end{center}
```

---

# Tệp tham chiếu references/soan-de-moi.md

# Soạn đề mới và kiểm tra tính hợp lý

## A. Quy trình soạn một bài toán mới

1. **Chọn dạng** (chuyển động, năng suất, hỗn hợp, phần trăm, đếm – tính điểm, hình học…).
2. **Chọn nghiệm đẹp trước, số liệu sau.** Luôn làm ngược: ấn định đáp số nguyên đẹp rồi tính ra các dữ kiện của đề. Không bao giờ chọn dữ kiện trước rồi hy vọng nghiệm đẹp.
3. **Khoác tình huống thực tế** (xem mục C).
4. **Viết lời giải** theo `mau-loi-giai.md`.
5. **Thế ngược nghiệm vào TỪNG dữ kiện của đề** để kiểm tra. Bắt buộc, không bỏ qua.
6. **Rà tính hợp lý số liệu** (mục D).

## B. Yêu cầu về độ khó

Khi người dùng yêu cầu “đề khó”, “nhiều dữ kiện”, “logic nhiều”:

- Hai phương trình phải **cần biến đổi mới lập được**, không lấy trực tiếp từ câu chữ của đề: đặt ẩn phụ, khai triển tích, quy về phần trăm, khử thuế, đổi đơn vị, dùng đại lượng bất biến.
- Ưu tiên bài có **giả thiết phản thực** (“giả sử A thắng tất cả vòng 1 và thua tất cả vòng 2 thì…”).
- Bài có **ba loại đối tượng nhưng chỉ đặt hai ẩn**, loại thứ ba biểu diễn qua dữ kiện phụ.
- Thêm **ý b** làm tầng kiểm chứng: đổi thang điểm, so sánh hai phương án, kiểm tra đủ/thiếu nguyên liệu, ước lượng số lượng tối thiểu — buộc học sinh dùng lại kết quả ý a.
- Nếu người dùng yêu cầu **“không dùng phương trình có mẫu thức”**: phát biểu lại mọi điều kiện dạng “bằng một nửa”, “bằng $\dfrac{1}{3}$” theo hướng nhân lên (`$x=2(\ldots)$`, `$y=3(\ldots)$`), và tránh đặt ẩn ở mẫu.

## C. Thư viện tình huống thực tế (Việt Nam)

| Dạng | Tình huống dùng được |
|---|---|
| Chuyển động | cứu trợ vùng lũ, xe khách liên tỉnh, ca nô chở khách mùa lễ hội, đi thăm ông bà cuối tuần, xe tải lên công trường |
| Năng suất | may đồng phục trước tựu trường, gói quà 1/6, đóng gói kiện hàng trước Tết, may khẩu trang mùa dịch, chở lương thực cứu trợ |
| Vòi nước | bể bơi lớp học bơi miễn phí, hồ chứa nước tưới có cống xả, bể nước khu bán trú |
| Hỗn hợp | trộn quặng luyện kim, dung dịch phòng thí nghiệm, phối trộn cà phê Robusta – Arabica có hao hụt khi rang |
| Phần trăm – kinh tế | điện bậc thang kèm thuế GTGT, gửi tiết kiệm hai ngân hàng, ngày hội mua sắm giảm giá, gói cước điện thoại |
| Đếm – tính điểm | đề kiểm tra hai thang điểm, Olympic Toán có điểm âm, bóng rổ 1–2–3 điểm, giải bóng đá 3-1-0, cờ vua, ném vòng hội chợ, trò chơi Nối chữ, gameshow lượt mình – lượt đối phương, máy bán nước theo mệnh giá, vé sự kiện ba hạng |
| Hình học | mảnh vườn rau sạch, mảnh đất tam giác vuông rào lưới, hàng ghế hội trường |
| Chia đều chi phí | góp tiền mua quà 20/11, thuê xe dã ngoại, mua thiết bị “Lớp học thông minh”, chuyến tham quan về nguồn |

**Cách khoác tình huống**: thêm 1–2 câu mở đầu giải thích *vì sao* sự việc xảy ra (mưa lũ nên cần tiếp tế; sát ngày nên có người báo bận; nâng cấp dây chuyền nên năng suất tăng). Tình huống phải giải thích được logic của bài, không chỉ là trang trí.

## D. Kiểm tra tính hợp lý số liệu

Rà từng nhóm sau, nếu bất hợp lý thì **báo ngoài code block**; chỉ tự sửa khi người dùng cho phép.

| Đại lượng | Khoảng hợp lý |
|---|---|
| Xe máy | 30 – 60 km/h |
| Ô tô, xe khách | 40 – 80 km/h |
| Xe đạp, xe đạp điện | 10 – 25 km/h |
| Ca nô, xuồng máy | 20 – 40 km/h (riêng); dòng nước 2 – 5 km/h |
| Du thuyền | chậm hơn ca nô — nếu vận tốc > 25 km/h nên đổi thành “ca nô” |
| Sĩ số một lớp | 30 – 45 học sinh |
| Tiền quà tặng cá nhân | 300 – 1 000 nghìn đồng |
| Thuê xe du lịch | 4 – 12 triệu đồng |
| Thiết bị dạy học | vài triệu đồng trở lên |
| Tiền góp mỗi học sinh | 20 – 200 nghìn đồng |
| Điện sinh hoạt | 1 800 – 3 500 đồng/kWh |
| Lãi suất tiết kiệm | 4 – 8 %/năm |
| Năng suất công nhân | phải ra số ngày làm việc hợp lý (không phải 0,5 ngày hay 300 ngày) |

Ngoài số liệu, còn phải rà:

1. **Đề thiếu dữ kiện**: ví dụ “ca nô xuôi dòng nhanh hơn ca nô ngược dòng 9 km/h” mà không nói ca nô nào xuôi, ca nô nào ngược → phải bổ sung “dòng nước chảy từ $A$ đến $B$”.
2. **Lời giải lạc đề**: đoạn lời giải của bài khác lẫn vào (thường do copy) → báo và đề nghị bỏ.
3. **Điều kiện của ẩn bị thiếu** so với các mẫu `x-a` xuất hiện trong bài.
4. **Nghiệm loại không được ghi giá trị**.
5. **Thông tin thực tế**: tên di tích, địa danh, đơn vị hành chính (Việt Nam đã sáp nhập tỉnh từ 2025 — kiểm tra bằng web search khi cần), tên gọi sự kiện lịch sử. Ví dụ đã gặp: Căn cứ Tà Thiết là Căn cứ **Bộ Chỉ huy Quân giải phóng miền Nam** (xã Lộc Thành, tỉnh Đồng Nai), khác với Căn cứ **Trung ương Cục miền Nam** (Tây Ninh).
6. **Tính nhất quán nội bộ**: tổng các phần bằng tổng đề cho; kết quả ý b khớp với bất biến đã tính ở ý a.

## E. Bộ số liệu mẫu đã kiểm chứng

Dùng lại hoặc biến tấu (đổi bối cảnh, giữ cấu trúc số):

- Năng suất: $S=120$, $+10$, sớm $2$ ngày → $x=20$. $S=900$, $+15$, sớm $3$ → $x=60$. $S=240$, $+10$ người, ít hơn $2$ → $x=30$.
- Chia đều chi phí: $S=600$, vắng $2$, thêm $10$ → $12$ người. $S=6\,000$, vắng $3$, thêm $100$ → $15$ người. $S=3\,800$, miễn $2$, thêm $5$ → $40$ học sinh.
- Chuyển động: $s=200$, $\Delta v=10$, sớm $1$ giờ → $40$ và $50$ km/h. $s=420$, $\pm10$ km/h, sớm $45'$ / muộn $1$ giờ → $v=70$, $t=6$.
- Xuôi ngược dòng (ẩn phụ): $108$ xuôi $+63$ ngược $=7$ giờ; $81$ xuôi $+84$ ngược $=7$ giờ → $v=24$, $v_n=3$.
- Vòi nước: chung $4$ giờ $48'$; vòi 1 chảy $3$ giờ + vòi 2 chảy $4$ giờ $=75\%$ → $12$ và $8$ giờ.
- Hệ tuyến tính đếm điểm: cờ vua $18$ ván, $26$ điểm, thắng hơn hòa $4$ → $10/6/2$. Bóng đá $30$ trận, $54$ điểm, hòa ít hơn thua $2$ → $16/6/8$.
- Hình học: HCN $20\times10$; tam giác vuông $5$–$12$–$13$; hội trường $12$ hàng $\times$ $9$ ghế.

---

# Tệp tham chiếu references/ly-thuyet-dau-chuong.md

# Viết phần lý thuyết đầu chương

## Bố cục chuẩn

```latex
\chapter{Tên chương}
\begin{tomtat}[Phương pháp thực hiện]
	...các bước...
\end{tomtat}
\begin{luuy}
	...các lưu ý bám sát bộ bài tập bên dưới...
\end{luuy}
\begin{nx}
	...kĩ thuật lập bảng + một bảng minh họa...
\end{nx}
\begin{dang}{Tên dạng 1}
	Các quan hệ cần nhớ.
	\begin{enumerate}
		\item ...
	\end{enumerate}
\end{dang}
\begin{dang}{Tên dạng 2}
	...
\end{dang}
\baitap
```

**Chú ý phân biệt hai ngữ cảnh của `dang`:**

| Ngữ cảnh | Cú pháp |
|---|---|
| Lý thuyết đầu chương (có nội dung bên trong) | `\begin{dang}{Tên dạng} ... \end{dang}` — ngoặc nhọn |
| Phân loại trong phần bài tập (rỗng, `bt` nằm ngoài) | `\begin{dang}[Tên dạng]\end{dang}` — ngoặc vuông |

## Cách viết mục `luuy`

**Không** viết lưu ý chung chung. Đọc toàn bộ bộ bài tập của chương rồi rút ra $6$–$8$ ý, mỗi ý:
- mở đầu bằng một cụm in đậm đặt tên tình huống (`\textbf{Ba loại đối tượng, hai ẩn}`, `\textbf{Dạng kế hoạch -- thực tế}`),
- nêu đúng thao tác then chốt của các bài trong chương,
- kèm công thức tổng quát nếu có.

Hai ý cuối luôn dành cho:
- **điều kiện của ẩn và việc loại nghiệm** (nguyên dương, lớn hơn vận tốc dòng nước, lớn hơn số người vắng…);
- **trả lời đúng câu hỏi**: nhiều đề hỏi đại lượng khác với ẩn đã đặt.

## Cách viết mục `nx`

Luôn là kĩ thuật **lập bảng**, kèm một bảng `tabular` minh họa lấy số liệu từ chính bài đầu tiên của chương.

```latex
\begin{center}
	\begin{tabular}{|l|c|c|c|}
		\hline
		& Tổng khối lượng & Năng suất mỗi ngày & Số ngày\\
		\hline
		Kế hoạch & $120$ & $x$ & $\dfrac{120}{x}$\\
		\hline
		Thực tế & $120$ & $x+10$ & $\dfrac{120}{x+10}$\\
		\hline
	\end{tabular}
\end{center}
```

## Kho nội dung cho các khối `dang`

### Toán chuyển động
- $s=vt$, $v=\dfrac{s}{t}$, $t=\dfrac{s}{v}$; đổi thời gian về giờ trước khi lập phương trình.
- Dòng nước: $v_{\text{xuôi}}=v+v_n$, $v_{\text{ngược}}=v-v_n$, điều kiện $v>v_n$.
- Ngược chiều gặp nhau: $s_1+s_2=AB$. Cùng chiều đuổi kịp: hai quãng đường bằng nhau.
- Xuất phát lệch giờ: xe đi trước có thời gian nhiều hơn đúng bằng khoảng lệch; có nghỉ thì trừ thời gian nghỉ.

### Toán năng suất, công việc, vòi nước
- Khối lượng công việc $=$ năng suất $\times$ thời gian.
- Không cho khối lượng cụ thể thì coi cả công việc là $1$; làm xong trong $x$ thì mỗi đơn vị thời gian làm được $\dfrac{1}{x}$.
- Làm chung: $\dfrac{1}{x}+\dfrac{1}{y}=\dfrac{1}{t}$. Có vòi tháo: $\dfrac{1}{x}-\dfrac{1}{y}$, cần $\dfrac{1}{x}>\dfrac{1}{y}$.
- Đặt ẩn phụ $u=\dfrac{1}{x}$, $v=\dfrac{1}{y}$.
- Vượt mức $a\%$: nhân $\left(1+\dfrac{a}{100}\right)$.

### Toán hỗn hợp, dung dịch, hợp kim
- Khối lượng chất tan $=$ nồng độ $\times$ khối lượng dung dịch.
- Trộn: khối lượng hỗn hợp và khối lượng chất quan tâm đều cộng lại.
- Thêm nước / bay hơi: lượng chất tan không đổi.
- Hao hụt $a\%$: thành phẩm bằng $\left(1-\dfrac{a}{100}\right)$ lần nguyên liệu.

### Toán đếm, tính điểm, mua bán
- Hai phương trình: **số lượng** và **giá trị**.
- Ba loại đối tượng → dùng dữ kiện phụ để biểu diễn loại thứ ba theo hai ẩn.
- Điểm $=$ điểm cộng $-$ điểm trừ; số câu sai $=$ tổng $-$ đúng $-$ bỏ trống.
- Trò chơi đối kháng: tìm **đại lượng bất biến**.
- Giảm $a\%$: nhân $\left(1-\dfrac{a}{100}\right)$; tiền lãi một năm $=$ vốn $\times$ lãi suất.

### Toán chia đều chi phí
- Mỗi người đóng $=\dfrac{\text{tổng chi phí}}{\text{số người}}$.
- Vắng $a$ người, mỗi người đóng thêm $m$: $\dfrac{S}{x-a}-\dfrac{S}{x}=m$.
- Chi phí hỗn hợp: $T=\dfrac{k}{x}+px$; tìm GTNN trên $\mathbb{N}^*$ bằng cách tách $T=\dfrac{(x-x_0)(px-q)}{x}+T_0$ rồi xét ba trường hợp $x<x_0$, $x=x_0$, $x>x_0$.

### Toán hình học, số học, tuổi
- HCN: chu vi $2(a+b)$, diện tích $ab$; thay đổi kích thước thì khai triển tích mới rồi trừ tích cũ.
- Tam giác vuông: $a^2+b^2=c^2$, diện tích $\dfrac{1}{2}ab$; hệ gồm một pt bậc nhất và một pt bậc hai.
- Số hai chữ số: $\overline{ab}=10a+b$, số ngược lại $10b+a$.
- Tuổi: hiệu số tuổi không đổi.
