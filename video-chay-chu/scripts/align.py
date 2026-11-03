#!/usr/bin/env python3
"""Căn thời gian từng từ theo kịch bản có sẵn (ctc-forced-aligner, model MMS) → words.json [{word, start, end}].

  .venv-video/bin/python scripts/align.py audio.wav script.txt -o words.json

Chữ trong words.json giữ đúng kịch bản (có dấu, dấu câu); thời gian lấy từ căn chỉnh âm học.
Thiết bị: CUDA nếu có (float16), ngược lại CPU (float32).
"""
import argparse, json, subprocess, sys

import torch
from ctc_forced_aligner import (generate_emissions, get_alignments, get_spans, load_alignment_model,
                                postprocess_results, preprocess_text)


def load_audio(path, dtype, device, sr=16000):
    # đọc bằng ffmpeg → tensor 1D 16 kHz (không phụ thuộc backend torchaudio)
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-vn', '-ac', '1', '-ar', str(sr), '-f', 'f32le', '-'],
                         check=True, capture_output=True).stdout
    return torch.frombuffer(bytearray(raw), dtype=torch.float32).to(dtype).to(device)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('audio')
    ap.add_argument('script')
    ap.add_argument('-o', '--output', default='words.json')
    ap.add_argument('--language', default='vie', help='mã ISO-639-3 (tiếng Việt: vie)')
    ap.add_argument('--batch', type=int, default=4)
    a = ap.parse_args()

    device = 'cuda' if torch.cuda.is_available() else 'cpu'
    dtype = torch.float16 if device == 'cuda' else torch.float32
    print(f'[align] device={device}', file=sys.stderr)
    model, tokenizer = load_alignment_model(device, dtype=dtype)
    wave = load_audio(a.audio, model.dtype, model.device)
    text = ' '.join(open(a.script, encoding='utf-8').read().split())

    emissions, stride = generate_emissions(model, wave, batch_size=a.batch)
    tokens_starred, text_starred = preprocess_text(text, romanize=True, language=a.language)
    segments, scores, blank = get_alignments(emissions, tokens_starred, tokenizer)
    spans = get_spans(tokens_starred, segments, blank)
    stamps = postprocess_results(text_starred, spans, stride, scores)

    words = [{'word': s['text'], 'start': round(s['start'], 3), 'end': round(s['end'], 3)} for s in stamps]
    with open(a.output, 'w', encoding='utf-8') as f:
        json.dump(words, f, ensure_ascii=False, indent=1)
    print(f'[align] {len(words)} từ → {a.output}', file=sys.stderr)


if __name__ == '__main__':
    main()
