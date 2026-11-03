#!/usr/bin/env python3
"""Nhận dạng giọng nói tiếng Việt → words.json dạng [{word, start, end}] (faster-whisper, word_timestamps).

  .venv-video/bin/python scripts/transcribe.py input.mp4 -o words.json
  .venv-video/bin/python scripts/transcribe.py input.wav -o words.json --model large-v3

Thiết bị: tự dò GPU NVIDIA/CUDA → device=cuda (float16); không có → cpu, compute_type=int8.
Model mặc định: large-v3 khi có CUDA; máy CPU (yếu) → medium. Có thể ép bằng --model.
"""
import argparse, json, os, subprocess, sys

import numpy as np


def pick_device():
    try:
        import ctranslate2
        if ctranslate2.get_cuda_device_count() > 0:
            return 'cuda', 'float16'
    except Exception:
        pass
    return 'cpu', 'int8'


def pick_model(device):
    if device == 'cuda':
        return 'large-v3'
    ram_gb = os.sysconf('SC_PAGE_SIZE') * os.sysconf('SC_PHYS_PAGES') / 2**30
    # CPU mạnh (≥ 8 nhân, ≥ 32 GB RAM) mới chạy large-v3 trong thời gian chấp nhận được
    return 'large-v3' if (os.cpu_count() or 1) >= 8 and ram_gb >= 32 else 'medium'


def load_audio(path, sr=16000):
    # đọc bằng ffmpeg (tránh lỗi thư viện av khi faster-whisper tự giải mã)
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-vn', '-ac', '1', '-ar', str(sr), '-f', 'f32le', '-'],
                         check=True, capture_output=True).stdout
    return np.frombuffer(raw, np.float32)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('input')
    ap.add_argument('-o', '--output', default='words.json')
    ap.add_argument('--model', default=None, help='mặc định: large-v3 nếu có CUDA, ngược lại medium')
    ap.add_argument('--language', default='vi')
    ap.add_argument('--beam', type=int, default=5)
    a = ap.parse_args()

    from faster_whisper import WhisperModel
    device, ctype = pick_device()
    model_name = a.model or pick_model(device)
    print(f'[transcribe] device={device} compute_type={ctype} model={model_name}', file=sys.stderr)
    model = WhisperModel(model_name, device=device, compute_type=ctype)
    segments, info = model.transcribe(load_audio(a.input), language=a.language, word_timestamps=True,
                                      beam_size=a.beam, vad_filter=True)
    words = [{'word': w.word.strip(), 'start': round(w.start, 3), 'end': round(w.end, 3)}
             for s in segments for w in (s.words or []) if w.word.strip()]
    with open(a.output, 'w', encoding='utf-8') as f:
        json.dump(words, f, ensure_ascii=False, indent=1)
    print(f'[transcribe] {len(words)} từ → {a.output}', file=sys.stderr)


if __name__ == '__main__':
    main()
