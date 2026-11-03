#!/usr/bin/env bash
# Cài môi trường dựng video (chạy 1 lần mỗi phiên/máy mới).
#   scripts/setup.sh          → chỉ cài Node (Remotion) + kiểm tra font
#   scripts/setup.sh --py     → thêm venv .venv-video cho giọng đọc / mốc từ / tách nền (nặng, torch CPU)
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

echo "== Node / Remotion"
npm ci --no-audit --no-fund
command -v ffmpeg >/dev/null || { echo "Thiếu ffmpeg"; exit 1; }
mkdir -p out
npx remotion still src/index.ts FontTest out/fonttest.png --log=error
echo "   Font OK → out/fonttest.png (xem có chữ ĐẸP đúng dấu)"

if [[ "${1:-}" == "--py" ]]; then
  echo "== Python venv .venv-video (torch CPU)"
  python3 -m venv .venv-video
  P=.venv-video/bin/pip
  $P install -q --upgrade pip
  $P install -q torch torchaudio --index-url https://download.pytorch.org/whl/cpu
  $P install -q -c .venv-video-constraints.txt \
    whisperx faster-whisper ctranslate2 edge-tts pysubs2 \
    "ctc-forced-aligner @ git+https://github.com/MahmoudAshraf97/ctc-forced-aligner.git" \
    auto-editor ffmpeg-normalize rembg onnxruntime mediapipe scipy pillow numpy
  .venv-video/bin/python -c "import whisperx, edge_tts, faster_whisper, rembg, mediapipe, scipy; print('   Python OK')"
fi
echo "Xong."
