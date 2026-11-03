# Hướng dẫn & lưu ý khi dựng video chữ động (Remotion) — tổng hợp từ dự án HF + WheyShop

Tài liệu này gom toàn bộ quy tắc đã chốt với chủ site và các lỗi đã mắc, để lần sau không lặp lại.
Đi kèm skill `video-chay-chu` (SKILL.md). Khi mâu thuẫn, ưu tiên mục "Lỗi đã gặp" và "Quy tắc bắt buộc".

---

## 1. Quy trình bắt buộc (theo thứ tự)

1. **Phân tích nguồn & mẫu**: ffprobe (độ phân giải, fps, thời lượng); trích khung mỗi cảnh; nghe/lấy lời thoại.
2. **Đo khung hình từng cảnh** (xem mục 3): vị trí mặt, cằm, logo trên áo, tay/sản phẩm, điểm cắt cảnh.
3. **Lấy mốc thời gian từng từ** từ âm thanh thật (`scripts/moc_tu_am_thanh.py`, model small) + kịch bản đúng chữ.
4. **Viết props**: mỗi phần chữ có `at` = giây được nói.
5. **Chạy kiểm tra chữ**: `python3 scripts/kiem_chu.py <Composition> <props.json>` → **chỉ render khi "Tổng lỗi: 0"**.
6. **Render ảnh các đoạn chính** → tự xem lại (kẻ vạch giữa khung, vạch 75%, cột icon phải).
7. **Render thử 10 giây** → gửi duyệt → **chỉ render full khi chủ site duyệt**.
8. **Kiểm tiếng sau render**: so với tiếng gốc → lệch 0 ms, tỉ lệ ≈ 1; tiếng hiệu ứng chỉ ở đúng mốc.

---

## 2. Quy tắc bắt buộc về CHỮ

| Quy tắc | Chi tiết |
|---|---|
| Không dính chữ | Khoảng cách giữa 2 phần chữ ≥ 12 px (khung 1080). Chữ to `lineHeight ≥ 1.18` (dấu nặng dưới "Ệ", dấu chồng trên chữ hoa nhô khỏi dòng). Khoảng cách hàng ≥ 22 px. Chữ to giãn ký tự ~0.025em (font hẹp), chữ nhỏ `lineHeight 1.3`. |
| Hiện/tắt theo lời | Mỗi phần chữ hiện **đúng lúc từ đó được nói**; cụm tắt ngay khi câu xong (~0,1 s). Không để chữ đứng lâu sau khi thoại đã chuyển ý. |
| Không xếp ngang dài | Không đặt số to + chữ nhỏ đứng cạnh nhau, không gộp 2 ý trên 1 hàng ("60 viên dùng thử \| 120 viên tiết kiệm hơn"). **Xếp dọc, mỗi hàng 1 ý.** Nhiều từ khóa → tách thành nhiều cụm nối tiếp ("MẤT NGỦ" → "CĂNG THẲNG" → …). |
| Dòng nhỏ quá dài | Tách thành 2 hàng ("người tập gym / mới cần magie"), không thu nhỏ chữ. |
| Cỡ chữ (1080×1920, video nói) | Chữ to 95–150 px (hook tối đa ~150), chữ nhỏ 40–50 px, mỗi cụm 2–3 hàng. Không dùng 170–210 px (che mặt). |
| Không chữ trần, không khối đen | Dùng **bóng mờ bám theo nét chữ** (`scrim: false` → HALO). **Không dùng khối nền tối** sau cụm chữ (hiện ra trước chữ, phản cảm). |
| Từ khóa | IN HOA, màu nhấn thương hiệu; tối đa 2 màu chữ (trắng + màu nhấn). |
| Nội dung chữ | Rút gọn ý chính; không đưa lên màn hình câu dễ vi phạm quảng cáo ("tốt nhất", "đủ hàm lượng cơ thể cần"); xưng hô thống nhất ("bạn"). Số liệu/giá/chính sách lấy theo lời nói thì phải ghi chú để đội Muse kiểm. |
| Font | Be Vietnam Pro (chữ thường, chủ site thích hơn serif). WheyShop: chữ to Barlow Condensed ExtraBold. HF: Be Vietnam Pro 800. Mọi font phải render thử chữ "ĐẸP" trước. |

---

## 3. Quy tắc bắt buộc về KHUNG HÌNH

| Quy tắc | Chi tiết |
|---|---|
| Không che mặt | Trích khung từng cảnh, đo vùng mặt (đỉnh đầu → cằm) → ghi `faceZones` trong props. Video WheyShop: cằm ~42% (cảnh xa ~39%), dải chữ = **ngực 43–56%**. Đoạn có đẩy cận (zoom ×1.08) mặt tụt xuống → nới vùng mặt tới ~47%, hạ chữ xuống ~57%. |
| Tránh logo & sản phẩm | Không đặt chữ màu nhấn đè lên logo cùng màu (cam trên cam). Chữ nằm trên logo áo; khi người nói giơ chai lên ngực thì nâng cụm chữ nhưng không lấn cằm. |
| Vùng an toàn TikTok | Trên ~7% (thanh tab), **cột icon phải ~14%** (y 35–85%), **dưới ~25%** (caption, tên, nhạc). Chữ trong x 6–84%, y 8–74%. Không đặt gì quan trọng dưới 75%. |
| Slide full màn hình | Cũng tuân vùng an toàn: nội dung không chạm cột icon phải (x > 84% từ y 35%) và không xuống dưới 74%. |
| Ảnh cắt từ video | Chọn khung nét nhất (đo độ nét Laplacian), cắt sát, phóng ×3 lanczos + unsharp; hiển thị ≤ 2 lần kích thước gốc. Ảnh chụp sản phẩm gốc luôn tốt hơn → xin đội Muse. |

---

## 4. Quy tắc bắt buộc về CĂN LỀ

- Cụm chữ trên video **căn đúng trục giữa khung** (thẳng người nói đứng giữa). Khung chứa chữ đối xứng `safe: {left: 0.16, right: 0.16}`; giới hạn kiểm tra riêng `safeCheck: {left: 0.06, right: 0.16}`.
- Mọi phần trong cụm cùng trục giữa (lệch ≤ 2% khung) — `kiem_chu.py` báo **LỆCH TÂM / CỤM LỆCH KHỎI GIỮA KHUNG**.
- Slide liệt kê ý (công dụng, lợi ích): **căn lề trái**, có nhãn số, ý hiện đúng lúc được nói, ý đang nói đậm, ý đã nói lùi màu.
- Lỗi cũ: chừa 16% phải nhưng chỉ 6% trái → chữ lệch trái so với người nói.

---

## 4b. Slide thông tin đã chốt cho WheyShop: mẫu 5 "con số lớn"
- Scene kind `stat` trong TalkKinetic: nền = video đang chạy làm mờ 16px + tối 55% (hiện/tắt trong 8 khung), tiêu đề nhỏ → số rất lớn đếm lên (0→300 trong 0,4 s) → dòng phụ → "liên quan đến" → nhãn viên thuốc (pill) có icon, căn trái, bật đúng lúc được nói + tiếng tick.
- 10 mẫu tham khảo: src/compositions/InfoStyles.tsx (composition InfoStyles, prop v = 1..10).

## 5. Hiệu ứng & âm thanh

| Hạng mục | Quy tắc |
|---|---|
| Hook 3 giây đầu | Dòng dẫn nhỏ → từ khóa đau rất to + icon minh hoạ (pin yếu, trăng) → nhãn ô màu chữ đen ("KHÓ NGỦ?"). Video đẩy cận chậm ×1.0→1.08, giật nhẹ (punch) đúng từ khóa, tiếng "hit" trầm. |
| Chữ vào | Phóng từ to về + hết nhòe (từ khóa), trượt lên/sang (chữ nhỏ), gõ chữ có con trỏ (tên sản phẩm), neon chỉ khi nền tối (neon màu nhạt trên nền sáng khó đọc). |
| Chuyển cảnh | Nhòe nhanh (~0,4 s) hoặc khung ảnh viền trắng trượt; hoà cảnh. |
| Tiếng hiệu ứng | **Chỉ định tay (sfx.cues), ≤ ~0,5 tiếng/giây**: pop cho từ khóa chính (không phải mọi từ), swish mềm cho chuyển nhòe, tick cho ý trên slide, ding cho giá/ưu đãi, hit cho hook. **Không dùng whoosh gắt** (chủ site bỏ). Âm tự tạo bằng numpy (không bản quyền), đặt nhỏ (0,2–0,32). |
| Giọng | Không dùng giọng AI khi đã có giọng thật. Nếu buộc dùng TTS: đọc liền mạch cả kịch bản (không cắt theo thẻ), xử lý EQ/de-ess/nén. Tên riêng nước ngoài viết phiên âm trong kịch bản đọc. |
| Tiếng gốc | Giữ nguyên; muốn chuẩn hoá thì -14 LUFS, đỉnh -1 dB (chỉ làm khi được duyệt). |

---

## 6. Lỗi đã gặp — KHÔNG lặp lại

| # | Lỗi | Nguyên nhân | Cách tránh |
|---|---|---|---|
| 1 | Chữ dính nhau ("MỆT MỎI" dính "KHÓ NGỦ?") | lineHeight 1.0, dấu tiếng Việt nhô ra | lineHeight ≥ 1.18, gap ≥ 22, chạy `kiem_chu.py` |
| 2 | Chữ to quá, che hết mặt | Cỡ 170–210 px, đặt y 42–62% | Đo `faceZones`, dải ngực, cỡ ≤ 150 |
| 3 | Bị che khi đăng TikTok | Câu cảnh báo ở đáy 80%, chữ sát mép phải | Vùng an toàn TikTok (mục 3) |
| 4 | Chữ lệch trái | Lề không đối xứng | `safe` đối xứng + kiểm LỆCH TÂM |
| 5 | Bố cục ngang khó nhìn | Số to + chữ nhỏ cạnh nhau | Xếp dọc, tách cụm |
| 6 | Chữ nổi bật đứng lâu sau khi thoại xong | Thời lượng cụm cố định | Thời lượng theo mốc từ |
| 7 | Vùng đen hiện trước chữ | Khối nền radial bật từ đầu cụm | Bỏ khối nền, dùng HALO theo chữ |
| 8 | Nhạc cũ phát chồng lên tiếng mẫu (+6 dB) | Remotion **gộp --props với defaultProps** | Ghi đè rõ (`"music": ""`), đo volumedetect sau render |
| 9 | Chữ cam lẫn vào logo cam trên áo | Đặt chữ đè logo | Đặt trên logo / bóng theo chữ |
| 10 | Ảnh chai nhỏ, mờ | Cắt khung bất kỳ, hiển thị to | Khung nét nhất + phóng có làm nét |
| 11 | Slide công dụng căn giữa lộn xộn, hiện hết 1 lúc | Thiết kế cũ | Căn trái, hiện theo lời |
| 12 | Tiếng whoosh khó chịu | Âm gắt, nhiều | Bỏ whoosh, dùng swish mềm, ít |
| 13 | Giọng AI thô, cứng | Cắt câu theo thẻ, tăng tốc | Dùng giọng thật / đọc liền mạch |
| 14 | Câu cảnh báo "không phải là thuốc" thừa | Tự thêm | Video WheyShop không cần — chỉ thêm khi được yêu cầu |
| 15 | Sparkle/hiệu ứng bị che | mask-image cắt phần ngoài span | Đặt hiệu ứng ngoài lớp mask |
| 16 | Quay chậm bị giật | playbackRate của OffthreadVideo | Render sẵn bản chậm bằng ffmpeg minterpolate |

---

## 7. Lệnh hay dùng

```bash
# kiểm tra chữ (bắt buộc trước render)
python3 scripts/kiem_chu.py TalkKinetic props/ws-kinetic.json
# render 1 khung để xem
npx remotion still src/index.ts TalkKinetic out/anh.png --frame=60
# render thử 10 giây
npx remotion render src/index.ts TalkKinetic out/thu.mp4 --frames=0-299 --crf=18
# render full
npx remotion render src/index.ts TalkKinetic out/ketqua.mp4 --crf=18
```

## 8. Bảng infographic chia đôi màn hình (góp ý chủ site 02/11)
- Bảng là THẺ NỔI vừa nội dung (~28–30% khung, bắt đầu ~45,5%, đáy ≤ 74–75%), không kéo bảng đen tới đáy khung (đáy trống nặng nề).
- Khung người nói phóng ×1,1 neo mép trên → mặt hạ xuống ~1/3 trên màn hình, cằm cách mép bảng; không để mặt sát mép trên hay cằm chạm bảng.
- Nền bảng tối trong suốt 86% (rgba(14,14,14,0.86) + blur 6px) để vẫn thấy kệ hàng phía sau.
- Chữ phụ / ý đã nói: sáng ≥ 65–80% trắng (#c4c4c4–#dedede), không dùng #999 hay opacity 0.6.
- Ý mang nghĩa "không bắt buộc / tuỳ chọn": dùng icon trung tính (chữ i, gạch ngang), KHÔNG dùng ✗ (dễ hiểu thành "sai / không nên"). ✗ chỉ dùng cho so sánh đúng/sai rõ ràng.
- Mẫu: src/compositions/InfoCreatine.tsx (v = 1..5).

## Tiếng hiệu ứng & nhạc nền (bộ đã duyệt)
- Bộ SFX lưu tại thư mục skill `sfx/` (kèm README.md: bảng tiếng → khi nào dùng → âm lượng). Copy vào `public/sfx/` khi làm video mới.
- ƯU TIÊN tiếng của chủ site (`sfx/user/`): boom = bùng nổ/từ khoá hook; ting = con số, thông số; tinh-tien = giá/ưu đãi; bonk = phủ định vui ("không bắt buộc", "không phải…"); drip = nước/uống.
- Nhạc nền tự tạo: `python3 scripts/tao_nhac_sfx.py --music public/bgm/<ten>.wav --dur <giây> --drop <mốc từ khoá hook>`; volume 0.075.
