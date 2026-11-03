# Bộ tiếng hiệu ứng (SFX) — dùng cho mọi video short WheyShop / HF

Copy cả thư mục này vào `public/sfx/` của project Remotion. File của chủ site nằm ở `public/sfx/user/` (giữ đường dẫn này).

## Tiếng của chủ site (ƯU TIÊN dùng trước) — đã cắt khoảng lặng đầu, chuẩn đỉnh -1 dB
| File | Gốc | Dùng cho | Âm lượng (v) gợi ý |
|---|---|---|---|
| user/boom.wav | BOOM sound effect | Cú bùng nổ: từ khoá hook (sau riser), con số/kết quả quan trọng, chữ chốt cuối video | 0.14–0.22 |
| user/ting.wav | ting | Thông số / con số nổi bật (liều dùng, hàm lượng), nhãn tên sản phẩm | 0.08–0.10 (file to, -5,5 LUFS) |
| user/tinh-tien.wav | tính tiền | Giá, ưu đãi, "giá ok", tiết kiệm, mua ngay | 0.30–0.35 |
| user/bonk.wav | Bonk | Ý phủ định vui / bác bỏ hiểu lầm: "không bắt buộc", "không phải…", "không cần…" | 0.18–0.20 |
| user/drip.wav | Drip | Liên quan nước / chất lỏng: giữ nước, uống, hấp thu | 0.18–0.22 |

## Tiếng tự tạo (numpy, không bản quyền) — scripts/tao_nhac_sfx.py
riser (dâng trước bùng nổ), swoosh (bảng/thẻ trượt vào), pop / pop2 (chữ, thẻ bật ra), sparkle (lấp lánh kết), click, cash, drop, impact, tick, ding, hit, swish.

## Quy tắc (chủ site đã duyệt)
- Chỉ nhấn vào TỪ MẠNH và chuyển cảnh chính; ~1 tiếng / 2–3 giây (video 60 s ≈ 24 tiếng). Không tick cho mọi ý, không whoosh trùng.
- Nhạc nền nhỏ: volume 0.075 (đoạn mở/kết 0.13–0.2); nhạc + sfx thấp hơn giọng ≥ 13 dB.
- Sequence sfx dài 2 s (không cắt cụt âm dài như boom/riser).
- Sau render: alimiter đỉnh -1 dB (ffmpeg -c:v copy -af alimiter=limit=0.89).
