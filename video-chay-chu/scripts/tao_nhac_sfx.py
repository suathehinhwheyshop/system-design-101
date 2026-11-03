#!/usr/bin/env python3
"""Tạo bộ tiếng hiệu ứng mới + nhạc nền tự tổng hợp (numpy, không bản quyền) cho video short.

  python3 scripts/tao_nhac_sfx.py                       # tạo sfx vào public/sfx/
  python3 scripts/tao_nhac_sfx.py --music public/bgm/creatine.wav --dur 59.8 --drop 0.92 --bpm 112

Nhạc: 4/4, A thứ (Am–F–C–G), trống + bass + pluck arp + pad. Đoạn trước "drop" là đoạn dâng (riser, lọc tần cao)
để cú bùng nổ (drop) trùng đúng mốc từ khoá hook. Cuối bài dừng ở hợp âm chủ rồi tắt dần.
"""
import argparse, os, wave
import numpy as np

SR = 44100
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
rng = np.random.default_rng(42)


def save(path, x, stereo_width=0.0):
    x = np.asarray(x, np.float64)
    if x.ndim == 1:
        l = r = x
        if stereo_width:  # mở rộng âm trường nhẹ bằng trễ vài ms
            d = int(0.012 * SR)
            r = np.concatenate([np.zeros(d), x[:-d]]) * (1 - stereo_width) + x * stereo_width
        x = np.stack([l, r], 1)
    x = x / (np.max(np.abs(x)) + 1e-9) * 0.9
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with wave.open(path, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((x * 32767).astype(np.int16).tobytes())


def t_(sec):
    return np.arange(int(sec * SR)) / SR


def lowpass(x, fc):
    """Lọc thấp 1 cực, fc có thể là mảng (lọc quét)."""
    fc = np.broadcast_to(np.asarray(fc, float), x.shape)
    a = 1 - np.exp(-2 * np.pi * fc / SR)
    y = np.zeros_like(x); s = 0.0
    for i in range(len(x)):
        s += a[i] * (x[i] - s); y[i] = s
    return y


def env(n, a=0.002, d=0.2):
    t = np.arange(n) / SR
    return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / d)


# ================= SFX =================
def make_sfx():
    out = os.path.join(ROOT, 'public', 'sfx')
    # riser: nhiễu + sóng vuông quét lên 1,0 s, mạnh dần → dẫn vào cú drop
    t = t_(1.0); f = 200 * (2 ** (t * 4.5))
    tone = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * 0.25
    noise = lowpass(rng.standard_normal(len(t)), 300 + 9000 * t ** 2)
    save(f'{out}/riser.wav', (tone + noise) * (t ** 2.2), 0.6)
    # impact: sub trầm 60→35 Hz + tiếng nổ nhiễu ngắn + đuôi vang
    t = t_(1.2); f = 35 + 50 * np.exp(-t / 0.06)
    sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.35)
    crack = lowpass(rng.standard_normal(len(t)), 4000) * np.exp(-t / 0.05)
    tail = lowpass(rng.standard_normal(len(t)), 900) * np.exp(-t / 0.4) * 0.25
    save(f'{out}/impact.wav', np.tanh(1.8 * (sub + 0.6 * crack + tail)), 0.4)
    # swoosh: gió quét nhanh 0,35 s (mềm hơn whoosh cũ)
    t = t_(0.35); fc = 400 + 5000 * np.sin(np.pi * t / 0.35) ** 2
    save(f'{out}/swoosh.wav', lowpass(rng.standard_normal(len(t)), fc) * np.sin(np.pi * t / 0.35) ** 2, 0.5)
    # pop2: bụp cao, vui tai (cho nhãn/thẻ)
    t = t_(0.12); f = 700 + 900 * np.exp(-t / 0.015)
    save(f'{out}/pop2.wav', np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.03))
    # sparkle: chuỗi chuông cao lấp lánh 0,6 s
    t = t_(0.7); x = np.zeros(len(t))
    for k, (fr, at) in enumerate([(2637, 0), (3136, .05), (3520, .1), (4186, .16), (5274, .22)]):
        i = int(at * SR); n = len(t) - i
        x[i:] += np.sin(2 * np.pi * fr * t[:n]) * env(n, 0.001, 0.12) * (0.9 - k * 0.1)
    save(f'{out}/sparkle.wav', x, 0.7)
    # click: tiếng gõ phím / UI
    t = t_(0.04)
    save(f'{out}/click.wav', (np.sin(2 * np.pi * 2400 * t) + lowpass(rng.standard_normal(len(t)), 6000)) * np.exp(-t / 0.006))
    # cash: "ting" 2 nốt cho giá / ưu đãi
    t = t_(0.8); x = np.zeros(len(t))
    for fr, at in [(1568, 0), (2093, 0.09)]:
        i = int(at * SR); n = len(t) - i
        x[i:] += (np.sin(2 * np.pi * fr * t[:n]) + 0.4 * np.sin(2 * np.pi * fr * 2 * t[:n])) * env(n, 0.002, 0.2)
    save(f'{out}/cash.wav', x)
    # boom-drop: bass rơi 120→40 Hz (bùng nổ cảm xúc)
    t = t_(0.9); f = 40 + 80 * np.exp(-t / 0.18)
    save(f'{out}/drop.wav', np.tanh(2 * np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.45)))
    print('sfx: riser impact swoosh pop2 sparkle click cash drop →', out)


# ================= NHẠC NỀN =================
def note(n):  # số MIDI → Hz
    return 440 * 2 ** ((n - 69) / 12)


def make_music(path, dur, drop, bpm):
    beat = 60 / bpm
    N = int((dur + 0.5) * SR); mix = np.zeros((N, 2))

    def add(sig, at, pan=0.0, gain=1.0):
        i = int(at * SR)
        if i >= N or i + len(sig) <= 0: return
        sig = sig[: N - i] * gain
        mix[i:i + len(sig), 0] += sig * (1 - max(0, pan))
        mix[i:i + len(sig), 1] += sig * (1 + min(0, pan))

    # mẫu nhạc cụ
    tk = t_(0.35); kick = np.sin(2 * np.pi * np.cumsum(45 + 110 * np.exp(-tk / 0.03)) / SR) * np.exp(-tk / 0.16)
    tc = t_(0.25); clap = lowpass(rng.standard_normal(len(tc)), 3500) * np.exp(-tc / 0.06)
    th = t_(0.06); hat = (rng.standard_normal(len(th)) - lowpass(rng.standard_normal(len(th)), 5000)) * np.exp(-th / 0.015)
    prog = [(57, [57, 60, 64]), (53, [53, 57, 60]), (48, [48, 52, 55]), (55, [55, 59, 62])]  # Am F C G
    bar = 4 * beat
    end_t = dur - 1.8                       # dừng nhịp ở hợp âm chủ, tắt dần
    # đoạn dâng trước drop: pad lọc + riser nhịp nhanh dần
    pre = t_(drop)
    if len(pre):
        pad = sum(np.sin(2 * np.pi * note(n + 12) * pre) for n in [57, 60, 64]) / 3
        add(pad * (pre / max(drop, 1e-3)) ** 1.5 * 0.35, 0)
        k = 0.0; step = beat
        while k < drop - 0.05:
            add(hat * 0.5, k); step = max(beat / 4, step * 0.8); k += step
    # groove từ drop
    t0 = drop; b = 0
    while t0 + b * beat < end_t:
        tb = t0 + b * beat; bi = b % 4; chord_i = (b // 4) % 4
        root, triad = prog[chord_i]
        add(kick, tb, gain=0.9)
        if bi in (1, 3): add(clap, tb, gain=0.45)
        for h in range(2): add(hat, tb + h * beat / 2, pan=0.3, gain=0.22 if h else 0.14)
        # bass: nốt gốc nhịp 8, nghỉ nhẹ để kick rõ
        for h in range(2):
            tt = t_(beat / 2 * 0.9); fr = note(root - 12)
            bs = (np.sin(2 * np.pi * fr * tt) + 0.3 * np.sin(4 * np.pi * fr * tt)) * env(len(tt), 0.005, 0.18)
            add(bs, tb + h * beat / 2, gain=0.55)
        # pluck arp 16th
        for h in range(4):
            n = triad[(bi * 4 + h) % 3] + 12 * (1 + (h == 3))
            tt = t_(0.22); pl = np.sign(np.sin(2 * np.pi * note(n) * tt)) * env(len(tt), 0.002, 0.07)
            add(lowpass(pl, 2500), tb + h * beat / 4, pan=-0.35 if h % 2 else 0.35, gain=0.12)
        # pad mỗi ô nhịp
        if bi == 0:
            tt = t_(bar)
            pad = sum(np.sin(2 * np.pi * note(n) * tt) + 0.5 * np.sin(2 * np.pi * note(n) * 1.003 * tt) for n in triad) / 6
            add(pad * np.minimum(1, tt / 0.3) * np.minimum(1, (bar - tt) / 0.3), tb, gain=0.22)
        b += 1
    # kết: hợp âm Am ngân + kick cuối
    tt = t_(dur - end_t + 0.5)
    fin = sum(np.sin(2 * np.pi * note(n) * tt) for n in [45, 57, 60, 64]) / 4 * np.exp(-tt / 0.9)
    add(fin, end_t, gain=0.5); add(kick, end_t, gain=0.9)
    # nén nhẹ + chuẩn mức + fade cuối
    mix = np.tanh(1.3 * mix / (np.max(np.abs(mix)) + 1e-9))
    fade = int(0.8 * SR); mix[int(dur * SR) - fade:int(dur * SR)] *= np.linspace(1, 0, fade)[:, None]
    mix = mix[:int(dur * SR)]
    save(path, mix)
    print(f'nhạc nền: {dur:.1f}s, {bpm} BPM, drop @ {drop}s →', path)


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('--music'); ap.add_argument('--dur', type=float, default=60); ap.add_argument('--drop', type=float, default=1.0)
    ap.add_argument('--bpm', type=float, default=112); ap.add_argument('--no-sfx', action='store_true')
    a = ap.parse_args()
    if not a.no_sfx: make_sfx()
    if a.music: make_music(a.music, a.dur, a.drop, a.bpm)
