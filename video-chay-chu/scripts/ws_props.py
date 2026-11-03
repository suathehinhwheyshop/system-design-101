"""Props cho video nói (WheyShop Magie): chia sub thành cụm ngắn theo mốc từ, đánh dấu từ khóa, thêm thẻ thông tin."""
import json, re
W = json.load(open('props/ws-words.json'))
KEY = ['mệt mỏi', 'khó ngủ', 'thiếu magie', '300 phản ứng', 'cơ,', 'thần kinh', 'năng lượng', 'nhịp tim', 'webber magnesium',
       '200mg', '1 viên', '60 viên', '120 viên', 'tiết kiệm hơn', '5.000', 'magie', 'mất ngủ', 'căng thẳng', 'free ship', 'wheyshop']
low = [re.sub(r'[.,?!]+$', '', w['w'].lower()) for w in W]
lowp = [w['w'].lower() for w in W]  # giữ dấu câu (để 'cơ,' chỉ khớp 'chức năng cơ,' không khớp 'cơ thể')
key = [False] * len(W)
for k in KEY:
    ks = k.split(); src = lowp if k.endswith(',') else low
    for i in range(len(W) - len(ks) + 1):
        if src[i:i + len(ks)] == ks:
            for j in range(i, i + len(ks)): key[j] = True
# chia theo câu/dấu phẩy, rồi chia đều mỗi đoạn thành cụm ≤ 5 từ (không để từ lẻ)
phr, cur = [], []
for i, w in enumerate(W):
    cur.append(i)
    if w['w'][-1] in ',.?!' or (i + 1 < len(W) and W[i + 1]['start'] - w['end'] > 0.35):
        phr.append(cur); cur = []
if cur: phr.append(cur)
merged = []  # đoạn 1 từ thì nhập vào đoạn trước
for p in phr:
    if merged and (len(p) == 1 or len(merged[-1]) == 1) and len(merged[-1]) + len(p) <= 6: merged[-1] += p
    else: merged.append(p)
chunks = []
for p in merged:
    n = -(-len(p) // 4); size = -(-len(p) // n)
    chunks += [p[k:k + size] for k in range(0, len(p), size)]
subs = []
for c in chunks:
    subs.append({'start': W[c[0]]['start'], 'end': W[c[-1]]['end'],
                 'words': [{'t': W[i]['w'].rstrip(','), 'at': W[i]['start'], **({'k': True} if key[i] else {})} for i in c]})
for a, b in zip(subs, subs[1:]):  # giữ sub tới khi cụm sau hiện (tối đa 0,6 s sau từ cuối)
    a['end'] = round(min(b['start'], a['end'] + 0.6), 3)
subs[-1]['end'] = round(subs[-1]['end'] + 0.5, 3)
T = lambda s: next(W[i]['start'] for i in range(len(W)) if low[i] == s)
P = {'src': 'ws-magie.mp4', 'durationSec': 34.7, 'accent': '#ED802E', 'subs': subs, 'subY': 0.5,
     # vị trí sub theo từng cảnh (cảnh cận mặt 0–2,3 s thì hạ sub xuống ngực)
     'subYAt': [[0, 0.6], [2.3, 0.5]],
     'disclaimer': 'Thực phẩm này không phải là thuốc và không có tác dụng thay thế thuốc chữa bệnh.',
     'overlays': [
       {'type': 'hook', 'fromSec': 0.0, 'durationSec': 2.3, 'title': 'HAY MỆT MỎI, KHÓ NGỦ?', 'sub': 'Có thể bạn đang thiếu Magie'},
       {'type': 'chips', 'fromSec': T('chức') - 0.1, 'durationSec': 3.6, 'items': [['CƠ', T('cơ')], ['THẦN KINH', T('thần')], ['NĂNG LƯỢNG', T('năng')]]},
       {'type': 'card', 'fromSec': T('webber'), 'durationSec': 4.6, 'title': 'MAGNESIUM BISGLYCINATE', 'sub': '200mg / viên · 1 viên / ngày'},
       {'type': 'sizes', 'fromSec': T('60'), 'durationSec': round(T('tính') - T('60') - 0.05, 2), 'items': [['60 VIÊN', 'dùng thử', T('60')], ['120 VIÊN', 'tiết kiệm hơn', T('120')]]},
       {'type': 'price', 'fromSec': T('tính'), 'durationSec': 1.9, 'title': '≈ 5.000đ', 'sub': '/ ngày'},
       {'type': 'cta', 'fromSec': T('ưu'), 'durationSec': 3.5, 'title': 'ƯU ĐÃI GIÁ TỐT', 'sub': 'Free ship toàn quốc tại WheyShop'},
     ]}
json.dump(P, open('props/ws-magie.json', 'w'), ensure_ascii=False, indent=1)
for s in subs: print(f"{s['start']:5.2f}-{s['end']:5.2f}", ' '.join(('['+w['t']+']') if w.get('k') else w['t'] for w in s['words']))
print([(o['type'], round(o['fromSec'], 2)) for o in P['overlays']])
