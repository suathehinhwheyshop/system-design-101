---
name: video-chay-chu
description: Edit video có chữ chạy/chữ động bằng Remotion theo video mẫu, có bước lồng giọng đọc tiếng Việt (edge-tts + whisperx) — dùng cho mọi video nguồn cần gắn chữ giống mẫu
---

# Video chữ chạy bằng Remotion

> VỊ TRÍ: project nằm ở `video-chay-chu/` trong repo; mọi đường dẫn (public/, src/, scripts/, props/, out/) tính từ thư mục đó. Phiên mới: `cd video-chay-chu && scripts/setup.sh` (thêm `--py` khi cần giọng đọc/mốc từ).

> ĐỌC TRƯỚC: BRIEF-SENIOR-EDITOR.md (brief chuẩn của chủ site, áp dụng mọi video) và HUONG-DAN-LUU-Y.md (cùng thư mục skill) — toàn bộ quy tắc chữ, khung hình, căn lề, âm thanh và 16 lỗi đã gặp. Bắt buộc chạy scripts/kiem_chu.py trước mọi lần render.

## Công nghệ
- Render bằng Remotion (React + Chromium + ffmpeg), KHÔNG dùng ffmpeg drawtext.
- Video nguồn phát qua <OffthreadVideo>, lớp chữ là component React phủ lên trên.
- Font mặc định: Be Vietnam Pro (nạp qua @remotion/google-fonts/BeVietnamPro; nếu gói không có hoặc Chromium render không tải được Google Fonts — báo lỗi timeout "Fetching Be Vietnam Pro font" — thì tải file .ttf vào public/fonts và nạp bằng @remotion/fonts, xem src/fonts.ts). Lấy link .ttf đầy đủ bằng `curl "https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@500;600;800"` (curl mặc định nhận về .ttf, không bị chia subset). Font PHẢI hỗ trợ tiếng Việt có dấu — kiểm tra bằng cách render thử 1 frame có chữ "ĐẸP" trước khi làm tiếp (composition FontTest).
- Trên máy cloud: trỏ Remotion vào Chromium có sẵn trong remotion.config.ts (`Config.setBrowserExecutable(...)`). Trên máy khác thì xóa dòng đó để Remotion tự tải.

## Cấu trúc thư mục (giữ nguyên)
- public/: chứa mau.mp4 và các nguon-XX.mp4 (copy vào, không di chuyển file gốc); public/fonts/ (font), public/img/ (ảnh chèn), nhạc nền, giong.wav + public/giong/ (giọng đọc từng câu).
- src/compositions/ChayChu.tsx: composition chính, nhận props {srcFile | shots, segments:[{text, fromSec, durationSec, style}], stepCards?, music?, voice?, musicVolume?}.
  - srcFile: 1 video nguồn. shots: cắt ghép nhiều nguồn [{src, fromSec, toSec, blur?}], tổng thời lượng tự tính.
  - text là mảng dòng; bọc từ khóa trong *...* để nhấn mạnh (IN HOA, đậm, màu nhấn).
- src/components/: Ticker.tsx, PopText.tsx, LowerThird.tsx, StepCards.tsx (xấp ảnh chèn), PopWords.tsx (chữ hiện theo giọng), Sparkle.tsx (tia sáng), ShotLayer.tsx (chuyển cảnh).
- props/: props-01.json ... props-05.json — dữ liệu chữ cho từng video; props-ghep.json khi ghép nhiều nguồn thành 1 video; props-*-giong.json là bản đã lồng giọng.
- scripts/: tao_giong.py (giọng liền mạch + mốc từ), props_v2.py (props theo nhịp giọng), long_giong.py (giọng theo từng thẻ), canh_tu.py (căn từ bằng whisperx).
- out/: file kết quả ketqua-XX.mp4 (hoặc ketqua.mp4 khi ghép).

## Phân tích video mẫu (làm 1 lần, trước khi code)
1. ffprobe mau.mp4: độ phân giải, fps, thời lượng.
2. ffmpeg trích frame mỗi 0,25 giây trong đoạn có chữ chạy, lưu frames/.
3. Từ các frame đó xác định và ghi vào file tokens.md: vị trí vùng chữ (theo % chiều ngang/dọc), cỡ chữ (theo % chiều cao khung hình), font gần nhất, màu chữ + màu viền + màu nền dải (lấy mã hex gần đúng), tốc độ chạy (pixel/giây), kiểu xuất hiện (chạy ngang / nảy từng từ / trượt vào), thời điểm bắt đầu–kết thúc.
4. Composition phải bám tokens.md; không tự chế phong cách khác mẫu. Nếu mẫu không có chữ chạy (chỉ có tiêu đề tĩnh) hoặc chủ site chốt kiểu khác mẫu, ghi rõ cả hai bộ thông số trong tokens.md và báo lại trước khi làm.
5. Có logo thương hiệu thì lấy màu nhấn từ logo; nếu màu logo trùng/quá gần chữ trắng (vd nền kem) thì đẩy đậm/ấm hơn để tách khỏi trắng (HF: kem #F3EEE5 → nhấn #E6D3B3).

## Chuẩn thiết kế (khi mẫu không quy định rõ thì dùng các giá trị này)
- Chữ luôn có ít nhất 1 trong 2: viền text-shadow nhiều lớp (giả outline 3–4px) hoặc dải nền (đen mờ 55% / gradient). Không chữ trần.
- Tối đa 2 màu chữ: trắng + 1 màu nhấn. Từ khóa mới dùng màu nhấn.
- Vùng an toàn: chữ cách mép trái/phải ≥ 5% chiều ngang.
- Chuyển động: vào bằng spring (damping 200) hoặc interpolate + Easing.bezier; cấm chuyển động tuyến tính cứng cho chữ tĩnh. Ticker chạy đều, lặp liền mạch (nhân đôi nội dung, dịch chuyển modulo bề rộng 1 bản).
- Thẻ chữ nhiều dòng: các dòng hiện nối nhau cách 0,3 s; mỗi thẻ ≤ 3 dòng, ngắt theo cụm nghĩa.
- Quay chậm: không dùng playbackRate của OffthreadVideo (giật); render sẵn bản chậm có nội suy khung bằng ffmpeg minterpolate vào public/ rồi dùng như 1 nguồn.

## Component mẫu — Ticker (chữ chạy ngang liền mạch)
export const Ticker = ({text, speedPxPerSec, style}) => {
  const frame = useCurrentFrame();
  const {fps, width} = useVideoConfig();
  const x = -((frame / fps * speedPxPerSec) % (width / 2));
  return (
    <div style={{position:'absolute', bottom:'6%', left:0, width:'200%',
      display:'flex', transform:`translateX(${x}px)`, ...style}}>
      <span style={{width:'50%'}}>{text}</span>
      <span style={{width:'50%'}}>{text}</span>
    </div>);
};

## Lồng giọng đọc (khi được yêu cầu)
### Cách ưu tiên — giọng liền mạch, chữ chạy theo giọng (theo mẫu v2 chủ site gửi)
- KHÔNG cắt giọng theo từng thẻ (nghe thô, cứng). Đọc cả kịch bản 1 lần:
  python3 scripts/tao_giong.py public/giong-v2/kichban.txt public/giong-v2.wav props/words-v2.json --voice vi-VN-HoaiMyNeural --rate +8%
  → lấy mốc từng từ từ WordBoundary của edge-tts (chính xác hơn whisperx khi căn cả đoạn dài) và xử lý giọng ấm/mềm (EQ, de-ess, nén nhẹ, phòng nhỏ, -16 LUFS).
- Tên riêng tiếng nước ngoài viết phiên âm trong kịch bản đọc (vd "house de Forme" → "Hao-xơ đơ Phom"), chữ hiển thị vẫn viết đúng "House de Forme". Kiểm tra bằng cách cho whisperx small nghe lại.
- Chữ trên màn hình rút gọn thành cụm ý chính (theo mẫu), mỗi cụm có "neo" là cụm từ trong giọng → hiện đúng lúc được đọc: scripts/props_v2.py tạo props (segments[i].parts) → component PopWords.
- Video dài theo giọng (giọng + ~1 s), cảnh cắt theo ranh giới câu; chuyển cảnh 'frame' (khung viền trắng trượt) xen 'dissolve' (ShotLayer); logo trắng mờ trên cùng (props.logo); tia sáng nhỏ cạnh từ khóa quan trọng (sparkle); ảnh số bước kiểu 'cascade'.

### Dùng nguyên âm thanh có sẵn (giọng + nhạc của video mẫu) — khi chủ site yêu cầu, không dùng giọng AI
- Tách tiếng: ffmpeg -i mau-v2.mp4 -vn -ar 44100 -ac 2 public/am-thanh-mau-v2.wav; đặt props "voice" = file đó, "music": "" (không thêm nhạc).
- Lấy mốc từ: python3 scripts/moc_tu_am_thanh.py public/am-thanh-mau-v2.wav <kịch bản đúng chữ> props/words-mau-v2.json (faster-whisper small, khớp với kịch bản, từ nghe sai thì nội suy). Kịch bản phải theo lời thực tế trong âm thanh (vd mẫu nói "chúng mình", "Bởi vì điều chúng mình...").
- Tổng thời lượng = độ dài âm thanh; cắt cảnh theo ranh giới câu. scripts/props_v3.py là ví dụ.
- Sau render, so âm lượng bản xuất với file gốc (volumedetect) — phải bằng nhau.

### LƯU Ý props mặc định
- Remotion GỘP --props với defaultProps trong Root.tsx. Trường không muốn dùng phải ghi đè rõ ("music": ""), nếu không sẽ lấy giá trị mặc định (lỗi đã gặp: nhạc nền cũ phát chồng lên tiếng mẫu, to hơn 6 dB).

### Cách cũ — mỗi thẻ 1 câu (chỉ dùng khi chủ site yêu cầu)
Mục tiêu: mỗi thẻ chữ có 1 câu giọng đọc, giọng vào ngay sau khi chữ hiện; nhạc nền tự hạ khi đang đọc.

1. Kịch bản: lấy từ chính segments (ghép các dòng, bỏ dấu *). Câu cần đọc khác chữ hiển thị thì ghi trường "voiceText" trong segment.
   - Chữ viết tắt / tên riêng phải nghe thử: "HF" có thể bị đọc thành chữ cái tiếng Anh → nếu chủ site muốn đọc khác thì ghi voiceText (vd "house de Forme").
2. Chạy:
   python3 scripts/long_giong.py props/props-ghep.json props/props-ghep-giong.json --voice vi-VN-HoaiMyNeural --rate +8% --lead 0.15 --align
   - Giọng có sẵn: vi-VN-HoaiMyNeural (nữ), vi-VN-NamMinhNeural (nam).
   - --lead: giọng bắt đầu sau khi thẻ chữ hiện (giây). --music-volume: âm lượng nhạc lúc có giọng (mặc định 0.25).
   - Script tạo public/giong/cau-XX.mp3, ghép thành public/giong.wav (chuẩn hóa -16 LUFS), ghi voiceFromSec/voiceDurSec vào từng segment, thêm "voice" và "musicVolume" vào props mới.
3. Đọc bảng script in ra. Có thẻ "TRÀN" (giọng dài hơn thời gian chữ hiện) thì xử lý theo thứ tự: tăng --rate tối đa +10% → giảm --lead → kéo dài thẻ chữ/cảnh trong props. Script trả mã 2 khi còn thẻ tràn; KHÔNG render khi còn tràn.
4. --align: whisperx căn thời gian từng từ theo đúng chữ kịch bản (không dùng chữ model tự nghe), ghi segments[i].words — dùng cho hiệu ứng chữ theo giọng (karaoke) nếu cần.
   - Chỉ dùng model căn chỉnh tiếng Việt (nguyenvulebinh/wav2vec2-base-vi-vlsp2020). Khi cần nhận dạng giọng (không có kịch bản) thì dùng model small, KHÔNG dùng large. Model small nghe sai vài từ (vd "buổi tập" → "nguổi tập") nên luôn ưu tiên chữ kịch bản.
5. Nghe thử giong.wav trước khi render. Composition tự tắt tiếng gốc khi có music hoặc voice.

### Cài đặt cho bước lồng giọng
- pip install edge-tts pysubs2 whisperx (torch từ PyPI khá nặng, khoảng 10 GB kèm thư viện CUDA; không có GPU thì chạy CPU).
- edge-tts phải truyền proxy: script tự lấy HTTPS_PROXY (CLI: `edge-tts --proxy "$HTTPS_PROXY" ...`).
- nltk cần punkt_tab: `python3 -c "import nltk, nltk.pathsec as p; p.ALLOW_PROXIED_FETCH=True; nltk.download('punkt_tab')"`.
- Tên miền mạng cần mở: speech.platform.bing.com (edge-tts); huggingface.co, *.hf.co (cas-server.xethub.hf.co, cas-bridge.xethub.hf.co, us.aws.cdn.hf.co, cdn-lfs.hf.co) để tải model; raw.githubusercontent.com (nltk). Model đã tải thì chạy với HF_HUB_OFFLINE=1.
- Kiểm tra ffmpeg có libass (`ffmpeg -filters | grep ass`) nếu cần xuất phụ đề .ass bằng pysubs2.

## Quy trình render
1. Render thử: 10 giây đầu của nguon-01 (dùng <Sequence> cắt đoạn hoặc --frames) → out/thu-01.mp4. Dừng, chờ duyệt.
2. Có lồng giọng: chạy scripts/long_giong.py, hết thẻ tràn, nghe thử giong.wav, rồi render thử lại 10 giây đầu với props *-giong.json. Dừng, chờ duyệt.
3. Được duyệt mới render full: npx remotion render src/index.ts ChayChu out/ketqua-01.mp4 --props=props/props-01.json — lặp lại cho 02–05 (bản ghép: --props=props/props-ghep.json hoặc props-ghep-giong.json → out/ketqua.mp4).
4. Chất lượng xuất: giữ nguyên độ phân giải + fps của video nguồn, --crf 18.
5. Báo bảng kết quả: từng file thành công/lỗi, thời lượng, dung lượng.

## Video nói trước camera — phong cách chữ động (kinetic typography)
- Composition TalkKinetic (src/compositions/TalkKinetic.tsx), props mẫu props/ws-kinetic.json: cụm chữ = từ khóa cực lớn (Barlow Condensed ExtraBold, IN HOA, màu nhấn) + chữ nhỏ trắng (Be Vietnam Pro 700); neon cho tên sản phẩm; gõ chữ có con trỏ; slide giải thích nền giấy kẻ ô; chuyển cảnh nhòe (kind 'blur').
- Mỗi phần trong cụm có "at" = giây trên timeline lấy từ mốc từ (moc_tu_am_thanh.py) → hiện đúng lúc được nói; cụm tắt ngay khi câu nói xong (~0,1 s). KHÔNG để cụm chữ đứng lâu sau khi thoại đã chuyển ý.
- Slide giải thích: tiêu đề trái trên, các ý CĂN LỀ TRÁI có nhãn số, ý hiện đúng lúc được nói, ý đang nói đậm – ý đã nói lùi màu xám.
- Ảnh cắt từ video: chọn khung nét nhất (đo độ nét Laplacian), cắt sát, phóng ×3 lanczos + unsharp; vẫn nên xin ảnh chụp sản phẩm gốc.
- Chữ giãn: chữ to letterSpacing ≈0.025em, lineHeight 1.0; chữ nhỏ lineHeight 1.3; khoảng cách hàng ≥16px. Chữ màu nhấn trùng màu logo trên áo → thêm nền tối mờ (radial) sau cụm chữ.

### LƯU Ý (chủ site góp ý — bắt buộc tránh)
- KHÔNG xếp cụm chữ thành hàng ngang dài (vd "60 viên dùng thử | 120 viên tiết kiệm hơn" trên 1 hàng, hoặc số to + chữ nhỏ đứng cạnh nhau) → khó nhìn. Ưu tiên xếp dọc, mỗi hàng 1 ý.
- KHÔNG để chữ che mặt người nói: trước khi chốt vị trí, xem khung ở từng cảnh (cận/xa) – cảnh cận mặt thì đẩy chữ xuống ngực hoặc thu nhỏ cụm chữ; cụm chữ nhiều hàng phải kiểm tra không lấn lên cằm/mặt.
- KHÔNG dùng khối nền tối sau cụm chữ (hiện ra trước chữ, trông phản cảm). Dùng bóng mờ bám theo nét chữ (props "scrim": false → HALO), bóng hiện/tắt cùng chữ.
- Tiếng hiệu ứng: chỉ "pop" nhẹ khi từ khóa lớn bật ra và "tick" khi ý trên slide hiện (public/sfx, tự tạo bằng numpy – không bản quyền). KHÔNG dùng "whoosh" ở chuyển cảnh (chủ site bỏ). Đặt nhỏ (vPop ~0.28, vTick ~0.22).
- Kiểm tiếng sau render: tương quan với file tiếng gốc → lệch phải 0 ms, gain ≈ 1; phần dư chỉ nằm ở các mốc tiếng hiệu ứng.
- VÙNG AN TOÀN TIKTOK (khung 1080×1920): trên cùng ~7% (thanh tab), cột icon phải ~14% từ y 35%–85%, dưới ~25% (caption, tên, nhạc). Chữ đặt trong x 6%–84%, y 8%–74% (props "safe": {left: 0.06, right: 0.16}); câu cảnh báo đặt trên cùng ("disclaimerTop": 0.075), không đặt ở đáy.
- Video nói trước camera: trước khi đặt chữ, trích khung mỗi cảnh và kẻ vạch (cằm, logo/chai, 75%, cột icon) để chọn dải chữ; WheyShop Magie: dải ngực 43–56%, chữ to ~95–120px (không quá 130), chữ nhỏ ~40–50px, tối đa 2–3 hàng.
- Tiếng hiệu ứng nên chỉ định tay (sfx.cues), ~0,5 tiếng/giây là tối đa: pop cho từ khóa chính (không phải mọi từ), swish mềm cho chuyển cảnh nhòe, tick cho ý trên slide, ding cho giá/ưu đãi.

## QUY TẮC BẮT BUỘC: KIỂM TRA CHỮ TRƯỚC KHI RENDER (chủ site yêu cầu)
- Mọi lần trước khi render (thử hay full) PHẢI chạy: python3 scripts/kiem_chu.py <Composition> <props.json>
  và chỉ render khi "Tổng lỗi: 0". Script vẽ từng cụm ở chế độ debugRows (mỗi phần 1 màu) và báo:
  DÍNH (2 phần chữ cách < 12px), TRÀN AN TOÀN (ra ngoài vùng TikTok), CHE MẶT (đè props.faceZones).
- faceZones phải đo từ khung thật của từng cảnh; đoạn có đẩy cận (videoFx) thì mặt tụt xuống → nới vùng mặt theo mức zoom.
- Dấu tiếng Việt (dấu nặng dưới, dấu chồng trên chữ hoa) nhô khỏi dòng: chữ to dùng lineHeight ≥ 1.18, khoảng cách hàng ≥ 22px.
- Sau khi script OK vẫn xem ảnh khung ở các đoạn chính trước khi gửi.

## Hook 3 giây đầu (pain point)
- Đẩy cận chậm ×1.0→1.08 + "punch" giật nhẹ đúng từ khóa đau (videoFx.punchAt), tiếng "hit" trầm tại đó.
- Cụm: dòng dẫn nhỏ → từ khóa đau rất to màu nhấn + icon minh hoạ (pin yếu nhấp nháy / trăng) → nhãn ô màu nhấn chữ đen (tag) cho ý phụ ("KHÓ NGỦ?", "NHƯ TRƯỚC?").
- CĂN LỀ: cụm chữ phải căn đúng trục giữa khung (thẳng người nói). Khung chứa chữ đối xứng ("safe": {left: 0.16, right: 0.16}); giới hạn kiểm tra riêng ("safeCheck": {left: 0.06, right: 0.16}). kiem_chu.py báo LỆCH TÂM / CỤM LỆCH KHỎI GIỮA KHUNG. Dòng nhỏ quá dài → tách 2 hàng, không thu nhỏ chữ.
- Câu cảnh báo "không phải là thuốc…": chủ site xác nhận video WheyShop KHÔNG cần → không thêm, trừ khi được yêu cầu.

## Tiếng hiệu ứng & nhạc nền (bộ đã duyệt)
- Bộ SFX lưu tại thư mục skill `sfx/` (kèm README.md: bảng tiếng → khi nào dùng → âm lượng). Copy vào `public/sfx/` khi làm video mới.
- ƯU TIÊN tiếng của chủ site (`sfx/user/`): boom = bùng nổ/từ khoá hook; ting = con số, thông số; tinh-tien = giá/ưu đãi; bonk = phủ định vui ("không bắt buộc", "không phải…"); drip = nước/uống.
- Nhạc nền tự tạo: `python3 scripts/tao_nhac_sfx.py --music public/bgm/<ten>.wav --dur <giây> --drop <mốc từ khoá hook>`; volume 0.075.
