"""Tạo giọng đọc liền mạch + mốc thời gian từng từ (WordBoundary của edge-tts), rồi xử lý cho giọng ấm, mềm.
python3 scripts/tao_giong.py public/giong-v2/kichban.txt public/giong-v2.wav props/words-v2.json --voice vi-VN-HoaiMyNeural --rate +8%"""
import argparse, asyncio, json, os, subprocess
import edge_tts

# EQ ấm (+2dB ~220Hz), giảm chói (-2.5dB ~3.8kHz), giảm xì, nén nhẹ, phòng rất nhỏ, chuẩn -16 LUFS
CHAIN = ('highpass=f=70,equalizer=f=220:t=q:w=1:g=2,equalizer=f=3800:t=q:w=1.2:g=-2.5,deesser=i=0.4,'
         'acompressor=threshold=-20dB:ratio=2.5:attack=8:release=150:makeup=2,aecho=0.85:0.5:28|55:0.10|0.06,'
         'loudnorm=I=-16:TP=-1.5:LRA=9')


async def run(text, raw, voice, rate):
    c = edge_tts.Communicate(text, voice, rate=rate, boundary='WordBoundary', proxy=os.environ.get('HTTPS_PROXY') or None)
    words = []
    with open(raw, 'wb') as f:
        async for ch in c.stream():
            if ch['type'] == 'audio':
                f.write(ch['data'])
            elif ch['type'] == 'WordBoundary':
                st = ch['offset'] / 1e7
                words.append({'w': ch['text'], 'start': round(st, 3), 'end': round(st + ch['duration'] / 1e7, 3)})
    return words


ap = argparse.ArgumentParser()
ap.add_argument('script'); ap.add_argument('wav'); ap.add_argument('words')
ap.add_argument('--voice', default='vi-VN-HoaiMyNeural'); ap.add_argument('--rate', default='+8%')
a = ap.parse_args()
text = ' '.join(open(a.script, encoding='utf-8').read().split())
raw = a.wav.rsplit('.', 1)[0] + '-raw.mp3'
words = asyncio.run(run(text, raw, a.voice, a.rate))
subprocess.check_call(['ffmpeg', '-v', 'error', '-y', '-i', raw, '-af', CHAIN, '-ar', '44100', '-ac', '2', a.wav])
json.dump(words, open(a.words, 'w'), ensure_ascii=False, indent=0)
print(len(words), 'từ, dài', subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', a.wav]).decode().strip(), 's')
