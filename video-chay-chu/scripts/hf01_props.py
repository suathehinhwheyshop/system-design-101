"""HF-01 (House de Forme) — chữ đánh máy theo lời thoại + tiếng gõ phím.
Tạo props/hf01.json (mốc hiện từng ký tự) và public/sfx/hf01-typing.wav (tiếng gõ khớp đúng mốc đó).
  python3 scripts/hf01_props.py"""
import json, random, unicodedata, wave
import numpy as np

SR = 48000
VIDEO_SEC = 29.533
HOLD = 1.5                     # giữ khung cuối để kịp đọc câu kết
DUR = round(VIDEO_SEC + HOLD, 2)
random.seed(7)
rng = np.random.default_rng(7)

# (vào, ra, vị trí, các hàng) — *...* = chữ nhấn (Inter nghiêng). Vị trí: 'top' dưới logo / 'low' vùng chân khi mặt ở trên.
CARDS = [
    (0.10, 1.66, 'low', ['Mình từng như *thế này.*']),
    (1.76, 3.26, 'top', ['Rồi lại *thế này.*']),
    (3.36, 5.96, 'top', ['Và bây giờ', 'là *thế này.*']),
    (6.08, 8.98, 'top', ['Có lúc soi gương', 'thấy *rất thích.*']),
    (9.12, 13.14, 'top', ['Có lúc lại', '*chẳng hài lòng.*']),
    (13.28, 15.38, 'top', ['Mình cũng từng', '*sốt ruột,*']),
    (15.52, 17.84, 'top', ['muốn thay đổi', '*nhanh hơn.*']),
    (17.98, 20.64, 'top', ['Nhưng cơ thể', 'cần *thời gian.*']),
    (20.80, 23.45, 'top', ['Nên mình cứ tiếp tục', '*từng buổi một.*']),
    (23.60, 26.66, 'top', ['Cả những ngày', 'chưa thấy khác,', 'mình *vẫn cố gắng.*']),
    (26.80, 27.86, 'low', ['Vì mình biết', 'cứ *kiên trì,*']),
    (27.98, DUR, 'top', ['thì những thay đổi', '*tích cực*', 'sẽ ghé thăm']),
]
# Vùng mặt đo từ khung gốc (giây vào, ra, y trên, y dưới — theo chiều cao khung)
FACES = [[0, 1.7, 0.04, 0.36], [1.7, 3.3, 0.35, 0.50], [3.3, 6.0, 0.26, 0.41], [6.0, 9.03, 0.53, 0.64],
         [9.03, 13.2, 0.28, 0.54], [13.2, 15.43, 0.37, 0.48], [15.43, 17.9, 0.31, 0.46], [17.9, 20.7, 0.35, 0.48],
         [20.7, 26.73, 0.39, 0.50], [26.73, 27.9, 0.09, 0.26], [27.9, DUR, 0.34, 0.48]]
CPS = 15.0       # tốc độ gõ gốc (ký tự/giây), tự tăng nếu thẻ ngắn
MAX_TYPE = 0.58  # gõ xong trước 58% thời lượng thẻ để còn thời gian đọc


def plain(r):
    return unicodedata.normalize('NFC', r.replace('*', ''))


scenes, keys = [], []
for a, b, pos, rows in CARDS:
    rows = [unicodedata.normalize('NFC', r) for r in rows]
    gaps = []  # khoảng chờ trước mỗi ký tự (đơn vị "nhịp")
    for ri, r in enumerate(plain_rows := [plain(r) for r in rows]):
        for ci, ch in enumerate(r):
            g = random.uniform(0.7, 1.3)
            if ci == 0 and ri > 0:
                g += 2.2                     # xuống dòng
            if ci > 0 and r[ci - 1] in ',.':
                g += 2.5                     # nghỉ sau dấu câu
            gaps.append(g)
    gaps[0] = 0
    total = sum(gaps) / CPS
    k = min(1.0, (b - a - 0.12) * MAX_TYPE / total) if total else 1
    t, times = a + 0.12, []
    for g in gaps:
        t += g / CPS * k
        times.append(round(t, 3))
    i = 0
    for r in plain_rows:
        for ch in r:
            keys.append((times[i], ch))
            i += 1
    scenes.append({'kind': 'lockup', 'fromSec': a, 'toSec': b, 'pos': pos,
                   'rows': [{'small': r} for r in rows], 'times': times})


# ---- tiếng gõ phím (tự tổng hợp, không bản quyền) ----
def click(space=False):
    n = int(SR * (0.07 if space else 0.045))
    t = np.arange(n) / SR
    noise = rng.standard_normal(n)
    # tiếng "tách" cao: nhiễu lọc thông cao, tắt rất nhanh
    hi = np.diff(noise, prepend=0) * np.exp(-t / 0.0022)
    # thân phím: nhiễu dải giữa tắt chậm hơn
    f = rng.uniform(1600, 2600) * (0.6 if space else 1)
    body = np.sin(2 * np.pi * f * t + rng.uniform(0, 6)) * np.exp(-t / 0.006) * 0.35
    mid = np.convolve(noise, np.ones(6) / 6, 'same') * np.exp(-t / (0.012 if space else 0.007)) * 0.6
    thump = np.sin(2 * np.pi * rng.uniform(140, 200) * t) * np.exp(-t / 0.01) * (0.5 if space else 0.3)
    s = hi * 0.55 + body + mid + thump
    # tiếng nhả phím nhỏ sau ~25 ms
    off = int(SR * rng.uniform(0.022, 0.03))
    rel = np.zeros(n)
    m = n - off
    rel[off:] = np.diff(rng.standard_normal(m), prepend=0) * np.exp(-np.arange(m) / SR / 0.0015) * 0.25
    s = s + rel
    return s / np.abs(s).max() * rng.uniform(0.75, 1.0) * (0.8 if space else 1)


out = np.zeros(int(SR * (DUR + 0.5)))
for t, ch in keys:
    s = click(ch == ' ')
    i = int(t * SR)
    out[i:i + len(s)] += s[:len(out) - i]
out = out / np.abs(out).max() * 0.5   # đỉnh -6 dBFS; âm lượng thật chỉnh trong props (typingVolume)
pcm = (np.clip(out, -1, 1) * 32767).astype('<i2')
with wave.open('public/sfx/hf01-typing.wav', 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())

props = {'src': 'hf01.mp4', 'videoSec': VIDEO_SEC, 'durationSec': DUR, 'typing': 'sfx/hf01-typing.wav', 'typingVolume': 0.6,
         'color': '#F4EFE6', 'fontSize': 58, 'topY': 0.125, 'lowY': 0.655, 'lastFrame': 'hf01-last.png',
         'safe': {'left': 0.16, 'right': 0.16}, 'safeCheck': {'left': 0.06, 'right': 0.16},
         'faceZones': FACES, 'scenes': scenes}
json.dump(props, open('props/hf01.json', 'w'), ensure_ascii=False, indent=1)
print(f'{len(scenes)} thẻ, {len(keys)} ký tự, {DUR}s')
for s in scenes:
    print(f"{s['fromSec']:6.2f}–{s['toSec']:5.2f}  gõ xong {s['times'][-1]:6.2f}  {' / '.join(plain(r['small']) for r in s['rows'])}")
