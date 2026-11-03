#!/usr/bin/env bash
# Pipeline short video 9:16 (WheyShop):
#   raw.mp4 → auto-editor cắt khoảng lặng (margin 0.15s) → ffmpeg-normalize -14 LUFS
#           → align.py (nếu có script.txt) hoặc transcribe.py → words.json
#
# Dùng:  scripts/pipeline.sh <raw.mp4> [script.txt] [thư-mục-ra]
#   - Không truyền script.txt nhưng có file script.txt cạnh raw.mp4 → tự dùng file đó.
#   - Kết quả: <ra>/cut.mp4, <ra>/normalized.mp4, <ra>/words.json
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VENV="$ROOT/.venv-video/bin"
RAW="${1:?Cần file raw.mp4: scripts/pipeline.sh <raw.mp4> [script.txt] [thư-mục-ra]}"
SCRIPT="${2:-}"
OUT="${3:-$(dirname "$RAW")/pipeline-out}"
[[ -z "$SCRIPT" && -f "$(dirname "$RAW")/script.txt" ]] && SCRIPT="$(dirname "$RAW")/script.txt"
[[ -x "$VENV/python" ]] || { echo "Thiếu môi trường $ROOT/.venv-video"; exit 1; }
mkdir -p "$OUT"

dur() { ffprobe -v error -show_entries format=duration -of csv=p=0 "$1"; }
lufs() { ffmpeg -hide_banner -i "$1" -af ebur128=peak=true -f null - 2>&1 | awk '/^ +I:/{i=$2} /^ +Peak:/{p=$2} END{print i" LUFS, peak "p" dBFS"}'; }

echo "== 1/3 Cắt khoảng lặng (auto-editor, margin 0.15s)"
"$VENV/auto-editor" "$RAW" --margin 0.15s --no-open --progress none -o "$OUT/cut.mp4"
echo "   $(dur "$RAW")s → $(dur "$OUT/cut.mp4")s"

echo "== 2/3 Chuẩn hoá âm lượng (ffmpeg-normalize, -14 LUFS, đỉnh -1 dBTP)"
"$VENV/ffmpeg-normalize" "$OUT/cut.mp4" -nt ebu -t -14 -tp -1 -c:a aac -b:a 192k -o "$OUT/normalized.mp4" -f -q
echo "   trước: $(lufs "$OUT/cut.mp4") | sau: $(lufs "$OUT/normalized.mp4")"

echo "== 3/3 Mốc thời gian từng từ → words.json"
if [[ -n "$SCRIPT" ]]; then
  echo "   có kịch bản ($SCRIPT) → align.py"
  "$VENV/python" "$ROOT/scripts/align.py" "$OUT/normalized.mp4" "$SCRIPT" -o "$OUT/words.json"
else
  echo "   không có kịch bản → transcribe.py"
  "$VENV/python" "$ROOT/scripts/transcribe.py" "$OUT/normalized.mp4" -o "$OUT/words.json"
fi
echo "   $(python3 -c "import json,sys;print(len(json.load(open(sys.argv[1]))))" "$OUT/words.json") từ → $OUT/words.json"
echo "Xong: $OUT"
