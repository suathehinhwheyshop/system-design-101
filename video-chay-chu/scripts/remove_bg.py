#!/usr/bin/env python3
"""Tách nền hàng loạt ảnh sản phẩm: assets/products → assets/products_nobg (PNG nền trong suốt).

  .venv-video/bin/python scripts/remove_bg.py
  .venv-video/bin/python scripts/remove_bg.py --src assets/products --dst assets/products_nobg --model isnet-general-use

Bỏ qua ảnh đã có bản tách (trừ khi --force). Model mặc định u2net (tự tải lần đầu vào ~/.u2net).
"""
import argparse, os, sys

from PIL import Image
from rembg import new_session, remove

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EXT = ('.png', '.jpg', '.jpeg', '.webp', '.bmp')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--src', default=os.path.join(ROOT, 'assets', 'products'))
    ap.add_argument('--dst', default=os.path.join(ROOT, 'assets', 'products_nobg'))
    ap.add_argument('--model', default='u2net')
    ap.add_argument('--force', action='store_true')
    a = ap.parse_args()

    os.makedirs(a.dst, exist_ok=True)
    files = sorted(f for f in os.listdir(a.src) if f.lower().endswith(EXT))
    if not files:
        sys.exit(f'[nobg] không có ảnh trong {a.src}')
    session = new_session(a.model)
    done = skipped = 0
    for f in files:
        out = os.path.join(a.dst, os.path.splitext(f)[0] + '.png')
        if os.path.exists(out) and not a.force:
            skipped += 1
            continue
        img = Image.open(os.path.join(a.src, f)).convert('RGB')
        res = remove(img, session=session)
        res.save(out)
        alpha = res.getchannel('A')
        kept = sum(1 for v in alpha.getdata() if v > 128) / (alpha.width * alpha.height)
        print(f'[nobg] {f} → {os.path.basename(out)} (giữ {100 * kept:.0f}% diện tích)', file=sys.stderr)
        done += 1
    print(f'[nobg] xong {done} ảnh, bỏ qua {skipped} ảnh đã có → {a.dst}', file=sys.stderr)


if __name__ == '__main__':
    main()
