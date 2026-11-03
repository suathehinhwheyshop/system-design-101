"""Tạo props theo nhịp giọng: mỗi cụm chữ gắn với 1 cụm từ trong giọng đọc (neo), hiện đúng lúc từ đó được đọc."""
import json, re, unicodedata
W = json.load(open('props/words-v2.json'))
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
 ([[("Một cơ thể ", "Một cơ thể", 0, 0), ("khỏe mạnh", "khỏe mạnh", 1, 1)]], 1.85, 0.30, None),
 ([[("Buổi tập hiệu quả", "buổi tập", 0, 0)], [("Và cách bạn ", "và cách bạn", 0, 0), ("vận động", "vận động", 1, 0)]], 4.75, 0.30, None),
 ([[("đi bộ", "Đi bộ", 1, 0)], [("đạp xe", "đạp xe", 1, 0)], [("giảm thời gian ngồi", "giảm thời gian", 1, 0)]], 8.45, 0.36, 0.035),
 ([[("Cải thiện ", "cải thiện", 0, 0), ("sức khỏe", "sức khỏe", 1, 0)], [("Tăng ", "tăng", 0, 0), ("sức bền", "sức bền", 1, 0)]], 11.05, 0.32, None),
 ([[("Hình thành", "hình thành", 0, 0)], [("thói quen tích cực", "thói quen", 1, 1)]], 13.35, 0.32, None),
 ([[("Khuyến khích học viên", "khuyến khích", 0, 0)], [("vận động ", "vận động cả", 0, 0), ("ngoài giờ tập", "ngoài giờ", 1, 0)]], 19.05, 0.24, None),
 ([[("Ghé House de Forme để đi bộ", "ghé", 0, 0)], [("không mất phí", "không mất", 1, 1)]], 23.75, 0.30, None),
 ([[("Không chỉ ", "không chỉ", 0, 0), ("giúp bạn ", "giúp bạn", 0, 0), ("tập tốt hơn", "tập tốt", 1, 0)]], 28.15, 0.30, None),
 ([[("Xây dựng ", "xây dựng", 0, 0), ("lối sống lành mạnh", "lối sống", 1, 0)], [("năng động", "năng động", 1, 0), (" và ", "và", 0, 0), ("bền vững", "bền vững", 1, 1)]], 32.6, 0.30, None),
]
segs = []
for lines, end, cy, gap in CARDS:
    abs_lines = [[(t, at(a), k, sp) for t, a, k, sp in ln] for ln in lines]
    st = round(min(p[1] for ln in abs_lines for p in ln) - 0.05, 3)
    parts = [[{'t': t, 'at': round(a - st, 3), **({'k': True} if k else {}), **({'sparkle': True} if sp else {})} for t, a, k, sp in ln] for ln in abs_lines]
    ws = {'accent': '#E6D3B3', 'centerY': cy, **({'lineGap': gap} if gap else {})}
    segs.append({'text': [''.join(p['t'] for p in ln) for ln in parts], 'fromSec': st, 'durationSec': round(end - st, 3), 'parts': parts, 'wordsStyle': ws})

D = 0.4; FR = 0.6
shots = [
 dict(src='nguon-04.mp4', fromSec=6.5, start=0, end=4.95),
 dict(src='nguon-05-cham050.mp4', fromSec=0, start=4.95, end=8.55, transitionIn={'type': 'frame', 'durSec': FR}),
 dict(src='nguon-02.mp4', fromSec=0, start=8.55, end=13.9, transitionIn={'type': 'dissolve', 'durSec': D}),
 dict(src='nguon-01-cham075.mp4', fromSec=0, start=13.9, end=19.2, transitionIn={'type': 'dissolve', 'durSec': D}),
 dict(src='nguon-02.mp4', fromSec=6.5, start=19.2, end=23.9, transitionIn={'type': 'frame', 'durSec': FR}),
 dict(src='nguon-04.mp4', fromSec=28.0, start=23.9, end=27.5, transitionIn={'type': 'dissolve', 'durSec': D}),
 dict(src='nguon-03.mp4', fromSec=0, start=27.5, end=33.0, transitionIn={'type': 'dissolve', 'durSec': D}),
]
# fromSec là điểm vào của media tại lúc cảnh bắt đầu chồng (start - nửa chuyển cảnh)
P = {'durationSec': 33.0, 'shots': shots, 'segments': segs,
     'stepCards': {'images': ['img/s4.png', 'img/s3.png', 'img/s1.png', 'img/s2.png'], 'fromSec': 15.7, 'durationSec': 3.45, 'gapSec': 0.45, 'layout': 'cascade'},
     'music': 'nhac.wav', 'voice': 'giong-v2.wav', 'musicVolume': 0.22, 'voiceSpan': [W[0]['start'], W[-1]['end']],
     'logo': 'img/logo-trang.png', 'fadeOutSec': 0.6}
json.dump(P, open('props/props-v2.json', 'w'), ensure_ascii=False, indent=1)
for s in segs: print(s['fromSec'], '→', round(s['fromSec'] + s['durationSec'], 2), ' | '.join(s['text']))
print('stepCards', P['stepCards']['fromSec'])
