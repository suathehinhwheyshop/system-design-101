"""Lồng giọng đọc cho ChayChu.

Đọc props (segments có text), tạo giọng bằng edge-tts cho từng thẻ chữ, đặt mỗi câu
vào đúng thời điểm thẻ chữ hiện, ghép thành public/giong.wav và ghi props mới có
"voice". Tùy chọn --align: căn thời gian từng từ bằng whisperx (model căn chỉnh tiếng
Việt) theo đúng chữ kịch bản, ghi vào segments[i].words.

Ví dụ:
  python3 scripts/long_giong.py props/props-ghep.json props/props-ghep-giong.json \
      --voice vi-VN-HoaiMyNeural --rate +0% --align
"""
import argparse, asyncio, json, os, re, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUB = os.path.join(ROOT, 'public')
TMP = os.path.join(PUB, 'giong')


def spoken(seg):
    # câu đọc = trường "voiceText" nếu có, không thì ghép các dòng chữ, bỏ dấu * và ký hiệu
    if seg.get('voiceText'):
        return seg['voiceText']
    t = ' '.join(seg['text'])
    t = re.sub(r'\*([^*]+)\*', lambda m: m.group(1).lower(), t)
    return re.sub(r'[♡🤍]', '', t).strip()


def dur(path):
    return float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path]))


async def tts(text, out, voice, rate):
    import edge_tts
    proxy = os.environ.get('HTTPS_PROXY') or None
    await edge_tts.Communicate(text, voice, rate=rate, proxy=proxy).save(out)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('props_in'); ap.add_argument('props_out')
    ap.add_argument('--voice', default='vi-VN-HoaiMyNeural')
    ap.add_argument('--rate', default='+0%')
    ap.add_argument('--lead', type=float, default=0.25, help='giọng bắt đầu sau khi thẻ chữ hiện (giây)')
    ap.add_argument('--music-volume', type=float, default=0.25, help='âm lượng nhạc khi có giọng (0–1)')
    ap.add_argument('--align', action='store_true')
    a = ap.parse_args()

    P = json.load(open(a.props_in))
    os.makedirs(TMP, exist_ok=True)
    rows, inputs, delays = [], [], []
    for i, s in enumerate(P['segments']):
        text = spoken(s)
        mp3 = os.path.join(TMP, f'cau-{i + 1:02d}.mp3')
        asyncio.run(tts(text, mp3, a.voice, a.rate))
        d = dur(mp3)
        start = s['fromSec'] + a.lead
        room = s['durationSec'] - a.lead - 0.3  # chừa 0,3 s cho chữ mờ đi
        s['voiceFromSec'], s['voiceDurSec'] = round(start, 3), round(d, 3)
        rows.append((i + 1, text, start, d, room))
        inputs += ['-i', mp3]; delays.append(int(start * 1000))

    out = os.path.join(PUB, 'giong.wav')
    fc = ';'.join(f'[{k}:a]aresample=44100,aformat=channel_layouts=stereo,adelay={ms}|{ms}[a{k}]' for k, ms in enumerate(delays))
    fc += ';' + ''.join(f'[a{k}]' for k in range(len(delays))) + f'amix=inputs={len(delays)}:normalize=0,loudnorm=I=-16:TP=-1.5[v]'
    subprocess.check_call(['ffmpeg', '-v', 'error', '-y', *inputs, '-filter_complex', fc, '-map', '[v]', '-ar', '44100', out])

    if a.align:
        import whisperx
        audio = whisperx.load_audio(out)
        am, meta = whisperx.load_align_model(language_code='vi', device='cpu')
        segs = [{'text': t, 'start': st, 'end': st + d} for _, t, st, d, _ in rows]
        res = whisperx.align(segs, am, meta, audio, 'cpu', return_char_alignments=False)
        for s, r in zip(P['segments'], res['segments']):
            s['words'] = [{'w': w['word'], 'start': round(float(w['start']), 3), 'end': round(float(w['end']), 3)} for w in r['words'] if 'start' in w]

    P['voice'] = 'giong.wav'
    P['musicVolume'] = a.music_volume
    json.dump(P, open(a.props_out, 'w'), ensure_ascii=False, indent=1)

    print(f'{"#":>2}  {"giọng":>12}  {"dài":>5}  {"chỗ":>5}  câu')
    bad = 0
    for n, t, st, d, room in rows:
        flag = 'TRÀN' if d > room else ''
        bad += bool(flag)
        print(f'{n:>2}  {st:5.2f}–{st + d:5.2f}  {d:5.2f}  {room:5.2f}  {flag:4} {t}')
    print(f'giong.wav: {dur(out):.2f}s · props: {a.props_out} · thẻ tràn: {bad}')
    sys.exit(2 if bad else 0)


if __name__ == '__main__':
    main()
