#!/usr/bin/env python3
"""Xuất video mask trắng/đen của người (selfie segmentation, MediaPipe Tasks) cho một khoảng thời gian.

  .venv-video/bin/python scripts/person_mask.py input.mp4 --start 2.0 --end 5.0 -o mask.mp4
  .venv-video/bin/python scripts/person_mask.py input.mp4 --start 0 --end 3 -o mask.mp4 --soft

Trắng = người, đen = nền. Giữ nguyên độ phân giải + fps của nguồn. --soft: mask mềm (xám ở viền) thay vì cắt ngưỡng.
Model: models/selfie_segmenter.tflite (tự tải lần đầu từ kho model chính thức của MediaPipe).
"""
import argparse, json, os, subprocess, sys, urllib.request

import numpy as np
import mediapipe as mp
from mediapipe.tasks.python import BaseOptions, vision

MODEL_URL = 'https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite'
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def probe(path):
    j = json.loads(subprocess.check_output(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries',
                                            'stream=width,height,r_frame_rate', '-of', 'json', path]))['streams'][0]
    num, den = map(int, j['r_frame_rate'].split('/'))
    return j['width'], j['height'], num / den, j['r_frame_rate']


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('input')
    ap.add_argument('--start', type=float, default=0.0)
    ap.add_argument('--end', type=float, required=True)
    ap.add_argument('-o', '--output', default='mask.mp4')
    ap.add_argument('--threshold', type=float, default=0.5)
    ap.add_argument('--soft', action='store_true')
    ap.add_argument('--model', default=os.path.join(ROOT, 'models', 'selfie_segmenter.tflite'))
    a = ap.parse_args()

    if not os.path.exists(a.model):
        os.makedirs(os.path.dirname(a.model), exist_ok=True)
        print(f'[mask] tải model → {a.model}', file=sys.stderr)
        urllib.request.urlretrieve(MODEL_URL, a.model)

    W, H, fps, rate = probe(a.input)
    seg = vision.ImageSegmenter.create_from_options(vision.ImageSegmenterOptions(
        base_options=BaseOptions(model_asset_path=a.model), running_mode=vision.RunningMode.VIDEO,
        output_confidence_masks=True, output_category_mask=False))

    dec = subprocess.Popen(['ffmpeg', '-v', 'error', '-ss', str(a.start), '-to', str(a.end), '-i', a.input,
                            '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], stdout=subprocess.PIPE)
    enc = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'gray', '-s', f'{W}x{H}', '-r', rate,
                            '-i', '-', '-c:v', 'libx264', '-crf', '16', '-pix_fmt', 'yuv420p', a.output], stdin=subprocess.PIPE)
    n, cover = 0, []
    while True:
        buf = dec.stdout.read(W * H * 3)
        if len(buf) < W * H * 3:
            break
        frame = mp.Image(image_format=mp.ImageFormat.SRGB, data=np.frombuffer(buf, np.uint8).reshape(H, W, 3))
        conf = seg.segment_for_video(frame, int(n * 1000 / fps)).confidence_masks[0].numpy_view()
        conf = conf.reshape(H, W) if conf.ndim == 3 else conf
        m = (np.clip(conf, 0, 1) * 255).astype(np.uint8) if a.soft else np.where(conf >= a.threshold, 255, 0).astype(np.uint8)
        cover.append((m > 127).mean())
        enc.stdin.write(m.tobytes())
        n += 1
    enc.stdin.close(); enc.wait(); dec.wait(); seg.close()
    print(f'[mask] {n} khung ({n / fps:.2f}s), người chiếm trung bình {100 * np.mean(cover):.1f}% khung → {a.output}', file=sys.stderr)


if __name__ == '__main__':
    main()
