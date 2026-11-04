# Timeline chỉnh sửa — HF-01 v3 · House de Forme (sắp cảnh theo lời thoại + chữ đánh máy)

File: out/hf01-ketqua-v3.mp4 · 1080×1920 · 9:16 · 30 fps · H.264 yuv420p + AAC 192k · 28,9 s

## 1. Thay đổi so với v1
- Sắp lại thứ tự cảnh cho khớp nghĩa: mang bầu → bế con → bây giờ; cảnh mang bầu đi với "cơ thể cần thời gian" (không đi với "chẳng hài lòng").
- Bỏ các khung chuyển cảnh mờ/lóa của bản gốc (5,7–6,3 s; 10,7–11,1 s; 27,9–28,2 s).
- Cảnh ngắn quay chậm có nội suy khung: bầu ×0,75, bây giờ ×0,7, squat quần jean ×0,8.
- v3: chỉ 3 câu mở đầu (cụm "thế này", 0–5 s) đánh máy + tiếng máy đánh chữ cổ, chuông hết dòng khi gõ xong câu 3; các câu sau hiện mềm từng hàng (cách 0,3 s), không tiếng gõ.
- Chữ to hơn (58 → 70 px), viền đen 2 px + glow đen đậm hơn, giãn hàng; câu dài tách tối đa 3 hàng ngắn.

## 2. Âm thanh & màu
- Tiếng gốc chạy liền mạch từ đầu (không cắt theo cảnh), giảm dần 1,2 s cuối; chuẩn hóa -14 LUFS, đỉnh -1 dBTP.
- Giữ nguyên màu video gốc. Chữ kem #F4EFE6 (nền logo) + viền/glow đen (chữ logo); nhấn = Inter nghiêng SemiBold.

## 3. Bảng thời gian
| Vào | Gõ xong | Ra | Cảnh (giây gốc) | Vị trí | Chữ (*nghiêng* = nhấn) | SFX |
|---|---|---|---|---|---|---|
| 0.08 s | 0.96 s | 1.51 s | J bầu soi gương (26.73–27.90 s, chậm ×0.75) | vùng chân | Mình từng / như *thế này.* | |
| 1.65 s | 2.57 s | 3.14 s | E bế con soi gương (9.03–10.67 s) | dưới logo | Rồi lại *thế này.* | |
| 3.28 s | 4.33 s | 5.01 s | K bây giờ soi gương (28.23–29.53 s, chậm ×0.7) | dưới logo | Và bây giờ / là *thế này.* | |
| 5.15 s | 6.47 s | 7.37 s | C squat smith (3.30–5.67 s) | dưới logo | Có lúc soi gương / thấy *rất thích.* | |
| 7.51 s | 8.89 s | 9.84 s | G đá chân quần xanh (15.43–17.90 s) | dưới logo | Có lúc lại / *chẳng hài lòng.* | |
| 9.98 s | 11.10 s | 11.84 s | B squat quần jean (1.70–3.30 s, chậm ×0.8) | dưới logo | Mình cũng từng / *sốt ruột,* | |
| 11.98 s | 13.54 s | 14.64 s | H tập cáp đeo địu (17.90–20.70 s) | dưới logo | muốn thay đổi / *nhanh hơn.* | |
| 14.78 s | 16.03 s | 16.87 s | F tập lúc mang bầu (13.20–15.43 s) | dưới logo | Nhưng cơ thể / cần *thời gian.* | |
| 17.01 s | 18.69 s | 19.87 s | I1 đẩy tạ (20.70–23.70 s) | dưới logo | Nên mình cứ / tiếp tục / *từng buổi một.* | |
| 20.01 s | 21.52 s | 22.57 s | D chống đẩy (6.33–9.03 s) | dưới logo | Cả những ngày / chưa thấy khác, / mình *vẫn cố gắng.* | |
| 22.71 s | 24.41 s | 25.61 s | I2 đẩy tạ (23.70–26.73 s) | dưới logo | Vì mình biết / cứ *kiên trì,* | |
| 25.75 s | 27.56 s | 28.87 s | A squat quần hồng (0.00–1.70 s) | vùng chân | thì những thay đổi / *tích cực* sẽ ghé thăm | |

Khung cuối giữ 1,5 s để kịp đọc câu kết.

## 4. Kiểm tra
- kiem_chu.py HfType props/hf01.json: Tổng lỗi 0 (không dính, không tràn vùng an toàn TikTok, không che mặt, căn giữa).
- Quét toàn bộ bản ghép: không còn khung chồng hình.

Dựng lại: `python3 scripts/hf01_props.py && python3 scripts/kiem_chu.py HfType props/hf01.json && npx remotion render src/index.ts HfType out/hf01-raw.mp4 --crf=18 --pixel-format=yuv420p` rồi loudnorm -14 LUFS.
