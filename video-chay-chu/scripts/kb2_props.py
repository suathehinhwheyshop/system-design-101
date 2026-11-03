"""Props cho bản KB11 v2 (brief Senior Editor): phụ đề cụm 3–7 từ theo mốc từ, từ khoá cam, nhãn sản phẩm, tiêu đề nhóm, punch-in."""
import json, re
W = json.load(open('work/kb2/words.json'))
norm = lambda s: re.sub(r'[.,?!]+$', '', s).lower()
KEY = {'thực', 'phẩm', 'bổ', 'sung', 'từng', 'nhóm', 'người.', 'sức', 'mạnh', 'hiệu', 'suất', 'miễn', 'dịch', 'phát', 'triển', 'cơ', 'bắp',
       'nắng', 'xương', 'ổ', 'khớp', 'da', 'comment', 'ngay', 'wheyshop'}
KEYPH = [['thực', 'phẩm', 'bổ', 'sung'], ['từng', 'nhóm', 'người'], ['sức', 'mạnh'], ['hiệu', 'suất'], ['miễn', 'dịch'], ['cơ', 'bắp'],
         ['nắng'], ['xương'], ['ổ', 'khớp'], ['chăm', 'sóc', 'da'], ['comment', 'ngay'], ['wheyshop'], ['vận', 'động', 'nặng'], ['dân', 'văn', 'phòng'], ['người', 'tập', 'thể', 'thao']]
low = [norm(w['word']) for w in W]
key = [False] * len(W)
for ph in KEYPH:
    for i in range(len(W) - len(ph) + 1):
        if low[i:i + len(ph)] == ph:
            for j in range(i, i + len(ph)): key[j] = True
# sản phẩm: cụm riêng dạng nhãn
PROD = [(['creatine', 'monohydrate'], 'bolt', 'Gợi ý'), (['vitamin', 'd3', 'k2', 'canxi'], 'sun', 'Gợi ý'),
        (['ostrovit', 'glucosamine'], 'bone', 'Gợi ý'), (['msm', 'và', 'chondroitin'], 'bone', None), (['ostrovit', 'astaxanthin'], 'spark', 'Gợi ý')]
prod_at = {}
for ph, ic, lb in PROD:
    for i in range(len(W) - len(ph) + 1):
        if low[i:i + len(ph)] == ph:
            prod_at[i] = (len(ph), ic, lb)
# cụm phụ đề chia tay theo cụm nghĩa (3–7 từ, không tách từ ghép); 'P:' = cụm nhãn sản phẩm
CH = ["Sau đây sẽ là", "thực phẩm bổ sung", "dành cho từng nhóm người.", "Đầu tiên, người tập thể thao", "có thể tham khảo",
      "P:creatine monohydrate", "bổ trợ sức mạnh", "cũng như cải thiện", "hiệu suất tập luyện,", "kết hợp bổ sung cả vitamin",
      "hỗ trợ hệ miễn dịch", "và cải thiện hiệu suất", "toàn diện hơn.", "Từ đó kết hợp lại", "tối ưu khả năng", "phát triển cơ bắp tốt hơn.",
      "Dân văn phòng", "ít tiếp xúc với nắng", "thì rất cần bổ sung vitamin D.", "Anh em có thể tìm hiểu sản phẩm",
      "P:vitamin D3, K2, canxi", "để bổ sung những vi chất", "quan trọng đối với", "sức khỏe xương", "và hệ miễn dịch.",
      "Đối với anh em nào", "đang vận động nặng", "hoặc cần cải thiện ổ khớp", "thì có thể tham khảo", "P:OstroVit Glucosamine",
      "kết hợp với", "P:MSM và Chondroitin.", "Còn anh em nào", "quan tâm chăm sóc da", "thì có thể tham khảo", "P:OstroVit Astaxanthin Forte.",
      "Anh em thuộc nhóm người nào", "thì comment ngay phía dưới", "để WheyShop tư vấn nha."]
ICON = {'creatine': ('bolt', 'Gợi ý'), 'vitamin': ('sun', 'Gợi ý'), 'ostrovit': ('bone', 'Gợi ý'), 'msm': ('bone', None)}
m, i = [], 0
for c in CH:
    isp = c.startswith('P:'); txt = c[2:] if isp else c
    n = len(txt.split())
    assert [norm(x) for x in txt.split()] == low[i:i + n], (c, low[i:i + n])
    if isp:
        ic, lb = ICON[low[i]]
        if low[i] == 'ostrovit' and low[i + 1] == 'astaxanthin': ic = 'spark'
        m.append(('p', list(range(i, i + n)), ic, lb))
    else: m.append(('n', list(range(i, i + n))))
    i += n
assert i == len(W)
subs = []
for c in m:
    idx = c[1]
    s = {'start': round(W[idx[0]]['start'] - 0.04, 3), 'end': round(W[idx[-1]]['end'] + 0.25, 3),
         'words': [dict(t=W[j]['word'].rstrip(',.') if (c[0] == 'p' or j == idx[-1]) else W[j]['word'], at=W[j]['start'], **({'k': True} if key[j] else {})) for j in idx]}
    if c[0] == 'p':
        s['prod'] = {'icon': c[2], **({'label': c[3]} if c[3] else {})}
        for w in s['words']: w['k'] = True
    subs.append(s)
for a, b in zip(subs, subs[1:]): a['end'] = round(min(a['end'], b['start']), 3)
subs[-1]['end'] = 49.2
T = lambda word, n=0: [w['start'] for w in W if norm(w['word']) == word][n]
heads = [
 {'fromSec': T('đầu'), 'toSec': T('dân') - 0.05, 'idx': 1, 'title': 'Người tập thể thao', 'icon': 'muscle'},
 {'fromSec': T('dân') - 0.04, 'toSec': T('đối', 1) - 0.05, 'idx': 2, 'title': 'Dân văn phòng', 'icon': 'sun'},
 {'fromSec': T('đối', 1) - 0.04, 'toSec': T('còn') - 0.05, 'idx': 3, 'title': 'Vận động nặng', 'icon': 'bone'},
 {'fromSec': T('còn') - 0.04, 'toSec': T('anh', 3) - 0.1, 'idx': 4, 'title': 'Chăm sóc da', 'icon': 'spark'},
 {'fromSec': T('anh', 3) - 0.05, 'toSec': 49.2, 'idx': 0, 'title': 'Bạn thuộc nhóm nào?', 'icon': 'question'},
]
punch = lambda w, n=0, d=1.6, s=1.1: {'from': T(w, n), 'to': T(w, n) + d, 'scale': s}
punches = [punch('từng', d=0.6, s=1.12), punch('creatine', d=1.5), punch('phát', d=1.15),
           punch('ổ', d=1.2), punch('ostrovit', 0, d=1.0), punch('chăm', d=1.4), punch('comment', d=2.2, s=1.12)]
S = lambda at, f, v: {'at': round(at, 3), 'file': 'sfx/' + f + '.wav', 'v': v}
sfx = [S(T('từng') - 1.0, 'riser', 0.2), S(T('từng'), 'user/boom', 0.18), S(T('nhóm') + 0.15, 'pop2', 0.14),
       S(T('đầu') - 0.05, 'swoosh', 0.2), S(T('creatine'), 'user/ting', 0.08), S(T('vitamin', 0), 'pop', 0.18), S(T('phát'), 'user/boom', 0.11),
       S(T('dân') - 0.05, 'swoosh', 0.2), S(T('nắng'), 'pop', 0.16), S(T('vitamin', 2), 'user/ting', 0.08),
       S(T('đối', 1) - 0.05, 'swoosh', 0.2), S(T('khớp'), 'pop', 0.16), S(T('ostrovit', 0), 'user/ting', 0.08), S(T('msm'), 'pop2', 0.14),
       S(T('còn') - 0.05, 'swoosh', 0.2), S(T('da'), 'pop', 0.16), S(T('ostrovit', 1), 'user/ting', 0.08),
       S(T('anh', 3) - 0.08, 'swoosh', 0.2), S(T('comment'), 'user/boom', 0.18), S(T('wheyshop'), 'sparkle', 0.12)]
PRODS = [('kb/prod/creatine.png', T('creatine'), T('cũng')), ('kb/prod/vitmin.png', T('vitamin', 0), T('từ') - 0.1),
         ('kb/prod/d3k2-calcium.png', T('vitamin', 2), T('quan')), ('kb/prod/glucosamine.png', T('ostrovit', 0), T('còn') - 0.1),
         ('kb/prod/astaxanthin.png', T('ostrovit', 1), T('anh', 3) - 0.1)]
P = {'products': [{'src': a, 'from': round(b - 0.05, 3), 'to': round(c, 3), 'h': 330 if 'd3k2' in a else 420} for a, b, c in PRODS], 'prodBottom': 0.672,
     'src': 'kb2.mp4', 'durationSec': 49.2, 'accent': '#ED802E', 'total': 4, 'subs': subs, 'heads': heads, 'punches': punches,
     'hook': {'fromSec': 0.0, 'toSec': T('đầu') - 0.05, 'title': '4 NHÓM · 4 LỰA CHỌN', 'iconsAt': T('từng')},
     'sfx': sorted(sfx, key=lambda x: x['at']), 'subY': 0.72, 'headY': 0.082, 'originY': 0.3,
     'bgm': {'src': 'bgm/kb2.wav', 'keys': [[0, 0.16], [T('từng'), 0.16], [T('từng') + 0.4, 0.07], [47.5, 0.07], [48.2, 0.12], [49.2, 0.12]]}}
json.dump(P, open('props/kb2.json', 'w'), ensure_ascii=False, indent=1)
for s in subs: print(f"{s['start']:6.2f}-{s['end']:6.2f} {'[SP] ' if 'prod' in s else ''}" + ' '.join(('*' + w['t'] + '*') if w.get('k') else w['t'] for w in s['words']))
