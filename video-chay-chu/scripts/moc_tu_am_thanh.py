"""Lấy mốc thời gian từng từ từ 1 file âm thanh có sẵn giọng đọc (vd tiếng của video mẫu),
rồi khớp với kịch bản đúng chữ (model nghe có thể sai chữ, nhưng thời gian vẫn dùng được).
python3 scripts/moc_tu_am_thanh.py public/am-thanh-mau-v2.wav kichban.txt props/words-mau-v2.json"""
import json, re, sys, unicodedata, difflib
from faster_whisper import WhisperModel
wav, script, out = sys.argv[1:4]
norm = lambda s: unicodedata.normalize('NFC', re.sub(r'[^\w]', '', s.lower()))
m = WhisperModel('small', device='cpu', compute_type='int8')  # chỉ dùng model small
import whisperx  # đọc âm thanh bằng ffmpeg (tránh lỗi thư viện av)
segs, _ = m.transcribe(whisperx.load_audio(wav), language='vi', word_timestamps=True, vad_filter=False, beam_size=5)
heard = [w for s in segs for w in s.words]
H = [norm(w.word) for w in heard]
S_words = open(script, encoding='utf-8').read().split()
S = [norm(w) for w in S_words]
times = [None] * len(S)
for a, b, n in difflib.SequenceMatcher(None, S, H, autojunk=False).get_matching_blocks():
    for k in range(n):
        times[a + k] = (heard[b + k].start, heard[b + k].end)
# từ không khớp: nội suy giữa 2 từ khớp gần nhất
for i in range(len(S)):
    if times[i] is None:
        p = next((j for j in range(i - 1, -1, -1) if times[j]), None); q = next((j for j in range(i + 1, len(S)) if times[j]), None)
        t0 = times[p][1] if p is not None else 0.0; t1 = times[q][0] if q is not None else t0 + 0.3
        span = (q if q is not None else len(S)) - (p if p is not None else -1)
        k = i - (p if p is not None else -1); st = t0 + (t1 - t0) * (k - 1) / span; times[i] = (st, st + (t1 - t0) / span)
W = [{'w': w, 'start': round(t[0], 3), 'end': round(t[1], 3)} for w, t in zip(S_words, times)]
json.dump(W, open(out, 'w'), ensure_ascii=False, indent=0)
print('nghe được:', ' '.join(w.word.strip() for w in heard))
print('khớp', sum(1 for a, b, n in difflib.SequenceMatcher(None, S, H, autojunk=False).get_matching_blocks() for _ in range(n)), '/', len(S))
