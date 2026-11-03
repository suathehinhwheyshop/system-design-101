"""HF-01 (House de Forme) — sắp lại cảnh theo lời thoại + chữ đánh máy + tiếng gõ phím.
  python3 scripts/hf01_props.py          → public/hf01-edit.mp4 (cảnh đã sắp, không tiếng), public/hf01-audio.wav,
                                           public/hf01-last.png, public/sfx/hf01-typing.wav, props/hf01.json
Nguồn: public/hf01.mp4 (bản gốc, 30 fps). Cảnh lấy theo số khung [đầu, cuối) của bản gốc."""
import json, os, random, subprocess, unicodedata, wave
import numpy as np

FPS, SR = 30, 48000
SRC = 'public/hf01.mp4'
HOLD = 1.5  # giữ khung cuối để kịp đọc câu kết

# (tên cảnh, khung đầu, khung cuối, tốc độ, vị trí chữ, các hàng chữ, vùng mặt y trên–dưới)
#   tốc độ < 1 = quay chậm có nội suy khung (minterpolate) cho cảnh quá ngắn
#   *...* = chữ nhấn (Inter nghiêng). 'top' = dưới logo, 'low' = vùng chân (cảnh mặt ở trên khung)
EDIT = [
    ('J bầu soi gương',      802, 837, 0.75, 'low', ['Mình từng', 'như *thế này.*'], (0.09, 0.26)),
    ('E bế con soi gương',   271, 320, 1.0,  'top', ['Rồi lại *thế này.*'], (0.36, 0.53)),
    ('K bây giờ soi gương',  847, 886, 0.7,  'top', ['Và bây giờ', 'là *thế này.*'], (0.34, 0.48)),
    ('C squat smith',         99, 170, 1.0,  'top', ['Có lúc soi gương', 'thấy *rất thích.*'], (0.26, 0.41)),
    ('G đá chân quần xanh',  463, 537, 1.0,  'top', ['Có lúc lại', '*chẳng hài lòng.*'], (0.31, 0.46)),
    ('B squat quần jean',     51,  99, 0.8,  'top', ['Mình cũng từng', '*sốt ruột,*'], (0.35, 0.50)),
    ('H tập cáp đeo địu',    537, 621, 1.0,  'top', ['muốn thay đổi', '*nhanh hơn.*'], (0.35, 0.48)),
    ('F tập lúc mang bầu',   396, 463, 1.0,  'top', ['Nhưng cơ thể', 'cần *thời gian.*'], (0.37, 0.48)),
    ('I1 đẩy tạ',            621, 711, 1.0,  'top', ['Nên mình cứ', 'tiếp tục', '*từng buổi một.*'], (0.39, 0.50)),
    ('D chống đẩy',          190, 271, 1.0,  'top', ['Cả những ngày', 'chưa thấy khác,', 'mình *vẫn cố gắng.*'], (0.53, 0.64)),
    ('I2 đẩy tạ',            711, 802, 1.0,  'top', ['Vì mình biết', 'cứ *kiên trì,*'], (0.39, 0.50)),
    ('A squat quần hồng',      0,  51, 1.0,  'low', ['thì những thay đổi', '*tích cực* sẽ ghé thăm'], (0.04, 0.36)),
]
TYPE_N = 3       # chỉ 3 câu mở đầu đánh máy (+ tiếng máy chữ); các câu sau hiện mềm từng hàng
CPS = 14.0       # tốc độ gõ gốc (ký tự/giây), tự tăng nếu thẻ ngắn
MAX_TYPE = 0.55  # gõ xong trước 55% thời lượng thẻ để còn thời gian đọc
random.seed(11)
rng = np.random.default_rng(11)


def out_frames(a, b, sp):
    return round((b - a) / sp)


# ---- 1. ghép cảnh theo thứ tự mới ----
parts, labels = [], []
for k, (name, a, b, sp, *_r) in enumerate(EDIT):
    f = f"[0:v]trim=start_frame={a}:end_frame={b},setpts=PTS-STARTPTS"
    if sp != 1:
        f += f",setpts=PTS/{sp},minterpolate=fps={FPS}:mi_mode=mci:mc_mode=aobmc:vsbmc=1"
    f += f",fps={FPS},trim=end_frame={out_frames(a, b, sp)},setpts=PTS-STARTPTS[v{k}]"
    parts.append(f)
    labels.append(f'[v{k}]')
fc = ';'.join(parts) + ';' + ''.join(labels) + f'concat=n={len(EDIT)}:v=1:a=0[v]'
subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', SRC, '-filter_complex', fc, '-map', '[v]',
                '-c:v', 'libx264', '-crf', '12', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-r', str(FPS), 'public/hf01-edit.mp4'], check=True)
subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', SRC, '-vn', '-ac', '2', '-ar', str(SR), 'public/hf01-audio.wav'], check=True)
n_edit = sum(out_frames(a, b, sp) for _, a, b, sp, *_r in EDIT)
subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', 'public/hf01-edit.mp4', '-vf', f'select=eq(n\\,{n_edit - 1})',
                '-frames:v', '1', '-update', '1', 'public/hf01-last.png'], check=True)
VIDEO_SEC = n_edit / FPS
DUR = round(VIDEO_SEC + HOLD, 3)


# ---- 2. thẻ chữ + mốc từng ký tự ----
def nfc(s):
    return unicodedata.normalize('NFC', s)


scenes, keys, faces, cuts = [], [], [], []
fr = 0
for k, (name, a, b, sp, pos, rows, face) in enumerate(EDIT):
    n = out_frames(a, b, sp)
    s0, s1 = fr / FPS, (fr + n) / FPS
    fr += n
    cuts.append((round(s0, 3), name, a / FPS, b / FPS, sp))
    if k == len(EDIT) - 1:
        s1 = DUR
    faces.append([round(s0, 3), round(s1, 3), face[0], face[1]])
    a_t, b_t = s0 + 0.08, s1 - (0 if k == len(EDIT) - 1 else 0.06)
    plain_rows = [nfc(r.replace('*', '')) for r in rows]
    gaps = []
    for ri, r in enumerate(plain_rows):
        for ci, ch in enumerate(r):
            g = random.uniform(0.75, 1.25)
            if ci == 0 and ri > 0:
                g += 2.0      # xuống dòng
            if ci > 0 and r[ci - 1] in ',.':
                g += 2.5      # nghỉ sau dấu câu
            gaps.append(g)
    gaps[0] = 0
    total = sum(gaps) / CPS
    sc = min(1.0, (min(b_t, s0 + 4) - a_t) * MAX_TYPE / total)
    t, times = a_t + 0.1, []
    for g in gaps:
        t += g / CPS * sc
        times.append(round(t, 3))
    i = 0
    for r in plain_rows:
        for ch in r:
            if k < TYPE_N:
                keys.append((times[i], ch))
            i += 1
    scenes.append({'kind': 'lockup', 'fromSec': round(a_t, 3), 'toSec': round(b_t, 3), 'pos': pos, 'shot': name,
                   'rows': [{'small': nfc(r)} for r in rows], 'times': times, 'type': k < TYPE_N,
                   'rowAt': [round(a_t + 0.05 + 0.3 * ri, 3) for ri in range(len(rows))]})


# ---- 3. tiếng máy đánh chữ cổ (tự tổng hợp, không bản quyền) ----
def bandnoise(n, lo, hi):
    x = np.fft.rfft(rng.standard_normal(n))
    fq = np.fft.rfftfreq(n, 1 / SR)
    x[(fq < lo) | (fq > hi)] = 0
    return np.fft.irfft(x, n)


def clack(space=False):
    n = int(SR * 0.12)
    t = np.arange(n) / SR
    s = np.zeros(n)
    if not space:
        # cần chữ đập vào trục cuốn giấy: "cạch" sắc, sáng
        strike = bandnoise(n, 1200, 7500) * np.exp(-t / 0.0028)
        s += strike / (np.abs(strike).max() + 1e-9)
        # tiếng kim loại ngân ngắn (tần số không điều hoà)
        f0 = rng.uniform(2000, 2600)
        for r, amp, dec in [(1.0, 0.30, 0.018), (1.63, 0.18, 0.012), (2.41, 0.10, 0.008)]:
            s += np.sin(2 * np.pi * f0 * r * t + rng.uniform(0, 6)) * np.exp(-t / dec) * amp
    # thân máy rung: "cộp" trầm
    body = np.sin(2 * np.pi * rng.uniform(110, 160) * t) * np.exp(-t / (0.03 if space else 0.022))
    s += body * (0.9 if space else 0.55) + bandnoise(n, 200, 1200) * np.exp(-t / 0.006) * (0.6 if space else 0.25)
    # cơ cấu trả phím + bánh răng nhích trục: 2 tiếng tách nhỏ phía sau
    for d, amp in [(rng.uniform(0.028, 0.036), 0.28), (rng.uniform(0.05, 0.062), 0.18)]:
        o = int(SR * d)
        m = n - o
        s[o:] += bandnoise(m, 1500, 6000) * np.exp(-np.arange(m) / SR / 0.0012) * amp
    s *= np.minimum(1, t / 0.0002)
    return s / np.abs(s).max() * rng.uniform(0.75, 1.0) * (0.7 if space else 1)


def bell():
    # chuông hết dòng của máy đánh chữ
    n = int(SR * 1.2)
    t = np.arange(n) / SR
    f = 3150
    s = sum(np.sin(2 * np.pi * f * r * t) * np.exp(-t / d) * a for r, a, d in [(1, 1, 0.45), (2.76, 0.35, 0.18), (5.40, 0.15, 0.08)])
    s += bandnoise(n, 2000, 8000) * np.exp(-t / 0.002) * 0.4
    return s / np.abs(s).max() * 0.55


out = np.zeros(int(SR * (DUR + 1.5)))
def put(t, s):
    i = int(t * SR)
    out[i:i + len(s)] += s[:len(out) - i]
for t, ch in keys:
    put(t, clack(ch == ' '))
put(scenes[TYPE_N - 1]['times'][-1] + 0.18, bell())  # chuông khi gõ xong cụm mở đầu
ir = np.exp(-np.arange(int(SR * 0.05)) / SR / 0.012) * rng.standard_normal(int(SR * 0.05)) * 0.06
ir[0] = 1
out = np.convolve(out, ir)[:len(out)]  # chút phòng nhỏ cho tự nhiên
out = out[:int(SR * (DUR + 0.5))]
out = out / np.abs(out).max() * 0.5
pcm = (np.clip(out, -1, 1) * 32767).astype('<i2')
os.makedirs('public/sfx', exist_ok=True)
with wave.open('public/sfx/hf01-typing.wav', 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())

props = {'src': 'hf01-edit.mp4', 'audio': 'hf01-audio.wav', 'videoSec': round(VIDEO_SEC, 3), 'durationSec': DUR,
         'lastFrame': 'hf01-last.png', 'typing': 'sfx/hf01-typing.wav', 'typingVolume': 0.5,
         'color': '#F4EFE6', 'fontSize': 70, 'topY': 0.12, 'lowY': 0.6,
         'safe': {'left': 0.16, 'right': 0.16}, 'safeCheck': {'left': 0.06, 'right': 0.16},
         'faceZones': faces, 'scenes': scenes}
json.dump(props, open('props/hf01.json', 'w'), ensure_ascii=False, indent=1)
print(f'{len(scenes)} thẻ, {len(keys)} ký tự, video {VIDEO_SEC:.2f}s + giữ {HOLD}s = {DUR}s')
for (c, name, a, b, sp), s in zip(cuts, scenes):
    print(f"{c:6.2f}s  {name:20s} gốc {a:5.2f}–{b:5.2f}s ×{sp}  gõ xong {s['times'][-1]:6.2f}  {' / '.join(r['small'] for r in s['rows'])}")
