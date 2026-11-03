"""Căn thời gian từng từ của giọng đọc theo đúng kịch bản (whisperx, model căn chỉnh tiếng Việt).
python3 scripts/canh_tu.py public/giong-v2.wav public/giong-v2/kichban.txt props/words-v2.json"""
import json, sys, whisperx
wav, txt, out = sys.argv[1:4]
text = ' '.join(open(txt, encoding='utf-8').read().split())
audio = whisperx.load_audio(wav)
am, meta = whisperx.load_align_model(language_code='vi', device='cpu')
res = whisperx.align([{'text': text, 'start': 0.0, 'end': len(audio) / 16000}], am, meta, audio, 'cpu')
words = [{'w': w['word'], 'start': round(float(w['start']), 3), 'end': round(float(w['end']), 3)}
         for s in res['segments'] for w in s['words'] if 'start' in w]
json.dump(words, open(out, 'w'), ensure_ascii=False, indent=0)
print(len(words), 'từ;', words[0], words[-1])
