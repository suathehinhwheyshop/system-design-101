"""Bản v3: dùng nguyên âm thanh (giọng + nhạc) của video mẫu v2. Tạo props theo nhịp giọng: mỗi cụm chữ gắn với 1 cụm từ trong giọng đọc (neo), hiện đúng lúc từ đó được đọc."""
import json, re, unicodedata
W = json.load(open('props/words-mau-v2.json'))
norm = lambda s: unicodedata.normalize('NFC', re.sub(r'[^\w-]', '', s.lower()))
toks = [norm(w['w']) for w in W]
pos = 0
def at(phrase):  # thời điểm bắt đầu của cụm từ, tìm tuần tự
    global pos
    q = [norm(x) for x in phrase.split()]
    for i in range(pos, len(toks)):
        if toks[i:i + len(q)] == q:
            pos = i + 1; return W[i]['start']
    raise SystemExit(f'không thấy neo: {phrase}')

# (dòng: [(chữ hiển thị, neo trong giọng, từ khóa?, tia sáng?)]), kết thúc thẻ (giây), vị trí, khoảng cách dòng
CARDS = [
 ([[("Một cơ thể ", "Một cơ thể", 0, 0), ("khỏe mạnh", "khỏe mạnh", 1, 1)]], 1.78, 0.30, None),
 ([[("Buổi tập hiệu quả", "buổi tập", 0, 0)], [("Và cách bạn ", "và cách bạn", 0, 0), ("vận động", "vận động", 1, 0)]], 4.62, 0.30, None),
 ([[("đi bộ", "Đi bộ", 1, 0)], [("đạp xe", "đạp xe", 1, 0)], [("giảm thời gian ngồi", "giảm thời gian", 1, 0)]], 8.1, 0.36, 0.035),
 ([[("Cải thiện ", "cải thiện", 0, 0), ("sức khỏe", "sức khỏe", 1, 0)], [("Tăng ", "tăng", 0, 0), ("sức bền", "sức bền", 1, 0)]], 9.98, 0.32, None),
 ([[("Hình thành", "hình thành", 0, 0)], [("thói quen tích cực", "thói quen", 1, 1)]], 11.75, 0.32, None),
 ([[("Khuyến khích học viên", "khuyến khích", 0, 0)], [("vận động ", "vận động cả", 0, 0), ("ngoài giờ tập", "ngoài giờ", 1, 0)]], 16.45, 0.24, None),
 ([[("Ghé House de Forme để đi bộ", "ghé", 0, 0)], [("không mất phí", "không mất", 1, 1)]], 19.9, 0.30, None),
 ([[("Không chỉ ", "không chỉ", 0, 0), ("giúp bạn ", "giúp bạn", 0, 0), ("tập tốt hơn", "tập tốt", 1, 0)]], 23.3, 0.30, None),
 ([[("Xây dựng ", "xây dựng", 0, 0), ("lối sống lành mạnh", "lối sống", 1, 0)], [("năng động", "năng động", 1, 0), (" và ", "và", 0, 0), ("bền vững", "bền vững", 1, 1)]], 26.5, 0.30, None),
]
segs = []
for lines, end, cy, gap in CARDS:
    abs_lines = [[(t, at(a), k, sp) for t, a, k, sp in ln] for ln in lines]
    st = max(0.0, round(min(p[1] for ln in abs_lines for p in ln) - 0.05, 3))
    parts = [[{'t': t, 'at': round(a - st, 3), **({'k': True} if k else {}), **({'sparkle': True} if sp else {})} for t, a, k, sp in ln] for ln in abs_lines]
    ws = {'accent': '#E6D3B3', 'centerY': cy, **({'lineGap': gap} if gap else {})}
    segs.append({'text': [''.join(p['t'] for p in ln) for ln in parts], 'fromSec': st, 'durationSec': round(end - st, 3), 'parts': parts, 'wordsStyle': ws})

D = 0.4; FR = 0.6
shots = [
 dict(src='nguon-04.mp4', fromSec=6.5, start=0, end=4.75),
 dict(src='nguon-05-cham050.mp4', fromSec=0, start=4.75, end=8.15, transitionIn={'type': 'frame', 'durSec': FR}),
 dict(src='nguon-02.mp4', fromSec=0, start=8.15, end=11.85, transitionIn={'type': 'dissolve', 'durSec': D}),
 dict(src='nguon-01-cham075.mp4', fromSec=0, start=11.85, end=16.55, transitionIn={'type': 'dissolve', 'durSec': D}),
 dict(src='nguon-02.mp4', fromSec=6.5, start=16.55, end=19.95, transitionIn={'type': 'frame', 'durSec': FR}),
 dict(src='nguon-04.mp4', fromSec=28.0, start=19.95, end=23.35, transitionIn={'type': 'dissolve', 'durSec': D}),
 dict(src='nguon-03.mp4', fromSec=0, start=23.35, end=26.6, transitionIn={'type': 'dissolve', 'durSec': D}),
]
# fromSec là điểm vào của media tại lúc cảnh bắt đầu chồng (start - nửa chuyển cảnh)
P = {'durationSec': 26.6, 'shots': shots, 'segments': segs,
     'stepCards': {'images': ['img/s4.png', 'img/s3.png', 'img/s1.png', 'img/s2.png'], 'fromSec': 13.8, 'durationSec': 2.7, 'gapSec': 0.45, 'layout': 'cascade'},
     'voice': 'am-thanh-mau-v2.wav', 'music': '',  # giọng + nhạc gốc của mẫu; music rỗng để không lấy nhạc từ props mặc định
     'logo': 'img/logo-trang.png', 'fadeOutSec': 0.4}
json.dump(P, open('props/props-v3.json', 'w'), ensure_ascii=False, indent=1)
for s in segs: print(s['fromSec'], '→', round(s['fromSec'] + s['durationSec'], 2), ' | '.join(s['text']))
print('stepCards', P['stepCards']['fromSec'])
