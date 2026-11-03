"""Kiểm tra TOÀN BỘ chữ trước khi render (bắt buộc chạy, phải 0 lỗi mới render).
Mỗi cụm chữ được vẽ ở chế độ debugRows (mỗi phần 1 màu, không video, không bóng) rồi đo:
  1. DÍNH: khoảng cách giữa 2 phần chữ < GAP px (dòng trên/dưới, chữ to cạnh chữ nhỏ...)
  2. TRÀN AN TOÀN: chữ ra ngoài vùng an toàn TikTok (props.safe, y 8%–74%)
  3. CHE MẶT: chữ đè vùng mặt (props.faceZones: [[từ giây, đến giây, yTrên, yDưới]])
python3 scripts/kiem_chu.py TalkKinetic props/ws-kinetic.json"""
import json, os, subprocess, sys, tempfile
import numpy as np
from PIL import Image
from scipy import ndimage

comp, props_path = sys.argv[1], sys.argv[2]
GAP = int(os.environ.get('GAP', 12))       # khoảng cách tối thiểu giữa 2 phần chữ (px, khung 1080)
YMIN, YMAX = 0.08, 0.74
P = json.load(open(props_path))
safe = P.get('safeCheck', P.get('safe', {'left': 0.06, 'right': 0.16}))
faces = P.get('faceZones', [])
PAL = np.array([[255, 0, 0], [0, 255, 0], [0, 0, 255], [255, 255, 0], [255, 0, 255], [0, 255, 255], [255, 128, 0], [128, 0, 255]], float)
tmp = tempfile.mkdtemp()
dbg = dict(P, debugRows=True); json.dump(dbg, open(f'{tmp}/p.json', 'w'), ensure_ascii=False)
errs = 0
for k, s in enumerate(P['scenes']):
    if s['kind'] != 'lockup':
        continue
    t = s['fromSec'] + 0.05
    png = f'{tmp}/s{k}.png'
    # vẽ riêng cụm này (cụm khác hiện cùng lúc ở vùng khác không bị gộp vào phép đo)
    json.dump(dict(dbg, scenes=[s]), open(f'{tmp}/p{k}.json', 'w'), ensure_ascii=False)
    subprocess.run(['npx', 'remotion', 'still', 'src/index.ts', comp, png, f'--frame={round(t * 30)}', f'--props={tmp}/p{k}.json', '--log=error'], check=True)
    a = np.asarray(Image.open(png).convert('RGB'), float)
    H, W = a.shape[:2]
    lit = a.max(2) > 90
    norm = a / (np.linalg.norm(a, axis=2, keepdims=True) + 1e-6)
    lab = np.argmax(norm @ (PAL / np.linalg.norm(PAL, axis=1, keepdims=True)).T, axis=2)
    masks = [(lit & (lab == i)) for i in range(len(PAL))]
    masks = [m for m in masks if m.sum() > 50]
    label = ' / '.join(r.get('big') or r.get('small') or r.get('tag') or r.get('type') or '' for r in s['rows'])
    msgs = []
    for i in range(len(masks)):
        di = ndimage.distance_transform_edt(~masks[i])
        for j in range(i + 1, len(masks)):
            g = di[masks[j]].min()
            if g < GAP:
                msgs.append(f'DÍNH phần {i + 1}–{j + 1}: cách {g:.0f}px (< {GAP})')
    u = np.any(masks, axis=0)
    ys, xs = np.nonzero(u)
    x0, x1, y0, y1 = xs.min() / W, xs.max() / W, ys.min() / H, ys.max() / H
    if x0 < safe['left'] - 0.005 or x1 > 1 - safe['right'] + 0.005 or y0 < YMIN or y1 > YMAX:
        msgs.append(f'TRÀN AN TOÀN: x {x0:.2f}–{x1:.2f}, y {y0:.2f}–{y1:.2f}')
    # CĂN LỀ: từng phần chữ phải cùng trục giữa (lệch tâm so với cả cụm ≤ 2% khung), trừ hàng có icon
    cx = (x0 + x1) / 2
    for i, m in enumerate(masks):
        xs_i = np.nonzero(m.any(0))[0]
        c_i = (xs_i.min() + xs_i.max()) / 2 / W
        has_icon = any(r.get('icon') for r in s['rows'])
        if abs(c_i - cx) > 0.02 and not has_icon:
            msgs.append(f'LỆCH TÂM phần {i + 1}: {abs(c_i - cx) * 100:.1f}% khung')
    if abs(cx - 0.5) > 0.03:
        msgs.append(f'CỤM LỆCH KHỎI GIỮA KHUNG: tâm x {cx:.2f}')
    for f0, f1, fy0, fy1 in faces:
        if f0 <= t < f1 and y0 < fy1 and y1 > fy0:
            msgs.append(f'CHE MẶT: chữ y {y0:.2f}–{y1:.2f} đè mặt y {fy0:.2f}–{fy1:.2f}')
    errs += len(msgs)
    print(f"{s['fromSec']:6.2f}s  x {x0:.2f}–{x1:.2f}  y {y0:.2f}–{y1:.2f}  {'OK ' if not msgs else 'LỖI'}  {label}" + ''.join('\n          → ' + m for m in msgs))
print(f'Tổng lỗi: {errs}')
sys.exit(1 if errs else 0)
