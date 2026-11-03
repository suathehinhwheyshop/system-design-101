#!/usr/bin/env python3
"""Ảnh sản phẩm đã tách nền → sticker: giữ mảng lớn nhất, viền trắng ~18px, bóng đổ mềm. 
  .venv-video/bin/python scripts/sticker.py <thư mục nobg> <thư mục ra>"""
import glob, os, sys
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage
src, dst = sys.argv[1], sys.argv[2]
os.makedirs(dst, exist_ok=True)
for p in sorted(glob.glob(src + '/*.png')):
    im = Image.open(p).convert('RGBA'); a = np.array(im.getchannel('A'))
    m = a > 110; lab, n = ndimage.label(m); keep = lab == (1 + int(np.argmax(ndimage.sum(m, lab, range(1, n + 1)))))
    keep = ndimage.binary_fill_holes(keep); arr = np.array(im); arr[..., 3] = np.where(keep, 255, 0); im = Image.fromarray(arr)
    im = im.crop(im.getchannel('A').getbbox())
    s = 900 / max(im.size); im = im.resize((int(im.width * s), int(im.height * s)), Image.LANCZOS)
    pad = 60; W, H = im.width + 2 * pad, im.height + 2 * pad
    A = Image.new('L', (W, H), 0); A.paste(im.getchannel('A'), (pad, pad))
    stroke = A.point(lambda v: 255 if v > 60 else 0).filter(ImageFilter.MaxFilter(37)).filter(ImageFilter.GaussianBlur(1.5))
    shadow = stroke.filter(ImageFilter.GaussianBlur(18)).point(lambda v: int(v * 0.45))
    out = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    sh = Image.new('RGBA', (W, H), (0, 0, 0, 255)); sh.putalpha(shadow); out.alpha_composite(sh, (0, 10))
    wh = Image.new('RGBA', (W, H), (255, 255, 255, 255)); wh.putalpha(stroke); out.alpha_composite(wh)
    out.alpha_composite(im, (pad, pad)); out.save(os.path.join(dst, os.path.basename(p)))
    print(os.path.basename(p), out.size)
