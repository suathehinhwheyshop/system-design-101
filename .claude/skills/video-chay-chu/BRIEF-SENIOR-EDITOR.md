# Brief chuẩn: Senior Short-form Video Editor (WheyShop · Fitness / dinh dưỡng / TPBS)

Áp dụng cho MỌI video short (TikTok / Shorts / Reels). Ưu tiên: tự nhiên, chính xác, giữ chân người xem > số lượng hiệu ứng.

## 1. Phân tích trước khi dựng (bắt buộc, ghi ra timeline)
- Lời thoại + mốc từng từ (pipeline.sh / moc_tu_am_thanh.py), điểm nhấn, biểu cảm, cử chỉ tay, lúc cầm/giơ sản phẩm.
- Chia khối: Hook → giải thích → minh hoạ sản phẩm → kết luận/CTA.
- Cắt khoảng lặng (auto-editor, margin 0.15s), từ đệm ("à", "ờ", "thì là"), câu lặp, nhịp thừa — KHÔNG đổi ý nghĩa. Jump cut ở ranh giới từ.

## 2. Phong cách dựng
- KHÔNG lặp template cố định giữa các video: đổi cách mở đầu, chuyển cảnh, typography, kiểu infographic, nhịp dựng theo nội dung.
- Ưu tiên jump cut tự nhiên, punch-in zoom có chủ đích (từ khoá / cảm xúc), thay đổi cỡ cảnh (rộng ↔ trung ↔ cận) để che jump cut.
- Không zoom liên tục, không hiệu ứng phô trương. Điểm nhấn hình ảnh chỉ ở thông tin quan trọng.

## 3. Phụ đề & đồ hoạ
- Phụ đề tiếng Việt TOÀN BỘ lời thoại, đồng bộ chính xác; mỗi cụm 3–7 từ; từ khoá tô cam WheyShop #ED802E.
- Kinetic typography / infographic / icon / so sánh trực quan khi phù hợp.
- Không che mặt, logo áo, nhãn sản phẩm (đo faceZones + vùng logo + vùng sản phẩm từng cảnh; chạy kiem_chu.py = 0 lỗi).

## 4. Âm thanh & hình ảnh
- Giữ giọng tự nhiên: lọc tạp âm nhẹ (highpass ~80 Hz + afftdn), cân bằng âm lượng (-14 LUFS, đỉnh -1 dB).
- Nhạc nền nhẹ (≥ 13 dB dưới giọng); SFX theo sfx/README.md (ưu tiên tiếng của chủ site).
- Chỉnh màu chân thực: cân trắng / tương phản nhẹ, giữ màu da và màu nhãn sản phẩm; không filter màu mạnh.
- KHÔNG tự tạo thông tin, số liệu, lời thoại mới. Chữ trên màn hình chỉ rút gọn từ lời nói; số liệu ghi chú để đội Muse kiểm.

## 5. Kỹ thuật
- 1080×1920, 9:16, 30 fps, H.264 (yuv420p), AAC 192k, MP4.
- FFmpeg + Remotion có sẵn; kiểm tra thư viện trước khi cài (venv .venv-video).
- Bàn giao: MP4 hoàn chỉnh + timeline chỉnh sửa (bảng: thời gian · cảnh/cắt · chữ · đồ hoạ · zoom · SFX · ghi chú).
