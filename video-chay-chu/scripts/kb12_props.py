"""Props KB12 (so sánh Creatine 300G vs 500G) — phong cách VS, khác KB11."""
import json, re
W = json.load(open('work/kb12/words.json'))
norm = lambda s: re.sub(r'[.,?!]+$', '', s).lower()
low = [norm(w['word']) for w in W]
CH = ["OstroVit Creatine", "300g và 500g", "thì nên lựa chọn loại nào", "để tiết kiệm chi phí?", "Một trong những thực phẩm bổ sung",
      "dành cho anh em gymer", "hoặc anh em newbie mới tập", "thì WheyShop luôn recommend", "sử dụng creatine,", "bởi creatine giúp hỗ trợ",
      "phát triển cơ bắp", "và cải thiện hiệu suất", "trong khi tập.", "Đồng thời thì nhiều anh em", "cũng trăn trở trong việc lựa chọn",
      "sẽ tiết kiệm hơn.", "Hiện creatine thì WheyShop", "đang có sẵn 2 phiên bản", "300g và 500g.", "Bản 300g sẽ sử dụng",
      "được 100 lần,", "tính ra thì 4.000 đồng", "mỗi lần dùng.", "Còn bản 500g thì được", "166 serving,", "chỉ khoảng 3.900 đồng",
      "thôi anh em ạ.", "Vậy thì bản 500g", "sẽ tiết kiệm hơn một chút", "trong chi phí", "và cung cấp số lần dùng", "nhiều hơn so với bản 300.",
      "Nếu anh em đã xác định", "tập luyện lâu dài", "và sử dụng creatine đều đặn", "thì bản 500g", "sẽ là lựa chọn tối ưu.",
      "Còn nếu muốn trải nghiệm trước", "về hương vị", "hoặc là xem có phù hợp hay không", "hoặc chưa chắc chắn", "về nhu cầu sử dụng",
      "thì cứ lựa chọn bản 300g nhé.", "Hàng có sẵn tại WheyShop,", "anh em tranh thủ", "chốt đơn luôn nhé."]
KEYPH = [['300g'], ['500g'], ['300'], ['tiết', 'kiệm'], ['chi', 'phí'], ['phát', 'triển', 'cơ', 'bắp'], ['hiệu', 'suất'], ['100', 'lần'], ['4.000', 'đồng'],
         ['166', 'serving'], ['3.900', 'đồng'], ['lâu', 'dài'], ['đều', 'đặn'], ['tối', 'ưu'], ['hương', 'vị'], ['wheyshop'], ['chốt', 'đơn'], ['creatine'], ['ostrovit']]
key = [False] * len(W)
for ph in KEYPH:
    for i in range(len(W) - len(ph) + 1):
        if low[i:i + len(ph)] == ph:
            for j in range(i, i + len(ph)): key[j] = True
subs, i = [], 0
for c in CH:
    n = len(c.split()); assert [norm(x) for x in c.split()] == low[i:i + n], (c, low[i:i + n])
    idx = list(range(i, i + n)); i += n
    subs.append({'start': round(W[idx[0]]['start'] - 0.04, 3), 'end': round(W[idx[-1]]['end'] + 0.25, 3),
                 'words': [dict(t=W[j]['word'].rstrip(',.?') if j == idx[-1] else W[j]['word'], at=W[j]['start'], **({'k': True} if key[j] else {})) for j in idx]})
assert i == len(W)
for a, b in zip(subs, subs[1:]): a['end'] = round(min(a['end'], b['start']), 3)
subs[-1]['end'] = 62.1
def T(word, n=0): return [W[k]['start'] for k in range(len(W)) if low[k] == word][n]
cards = [
 {'kind': 'vs', 'from': 0.0, 'to': T('một') - 0.1, 'at': {'a': T('300g'), 'vs': T('và'), 'b': T('500g')}},
 {'kind': 'benefits', 'from': T('bởi') - 0.05, 'to': T('đồng') - 0.1, 'at': {'a': T('phát'), 'b': T('cải')}},
 {'kind': 'board', 'from': T('hiện') - 0.05, 'to': T('nếu') - 0.1, 'at': {'n300': T('100'), 'p300': T('4.000'), 'n500': T('166'), 'p500': T('3.900'), 'win': T('tiết', 2)}},
 {'kind': 'verdict', 'from': T('nếu') - 0.05, 'to': T('hàng') - 0.1, 'at': {'a': T('500g', 4), 'b': T('300g', 3)}},
 {'kind': 'cta', 'from': T('hàng') - 0.05, 'to': 62.1, 'at': {'a': T('hàng'), 'b': T('chốt')}},
]
pn = lambda t, d, s=1.08: {'from': round(t, 3), 'to': round(t + d, 3), 'scale': s}
punches = [pn(T('500g'), 0.9, 1.1), pn(T('phát'), 1.0), pn(T('166'), 1.0), pn(T('tối'), 0.9), pn(T('chốt'), 0.9, 1.1)]
S = lambda at, f, v: {'at': round(at, 3), 'file': 'sfx/' + f + '.wav', 'v': v}
sfx = [S(T('300g'), 'pop', 0.22), S(T('và') - 0.6, 'riser', 0.16), S(T('500g'), 'user/boom', 0.18),
       S(T('bởi') - 0.05, 'swoosh', 0.18), S(T('phát'), 'pop2', 0.16), S(T('cải'), 'pop2', 0.16),
       S(T('hiện') - 0.05, 'swoosh', 0.2), S(T('100'), 'pop', 0.18), S(T('4.000'), 'user/tinh-tien', 0.26), S(T('166'), 'pop', 0.18), S(T('3.900'), 'user/tinh-tien', 0.26),
       S(T('tiết', 2), 'user/ting', 0.08), S(T('nếu') - 0.05, 'swoosh', 0.18), S(T('500g', 4), 'user/ting', 0.08), S(T('300g', 3), 'user/ting', 0.08),
       S(T('hàng') - 0.05, 'swoosh', 0.18), S(T('chốt'), 'user/boom', 0.18)]
P = {'src': 'kb12.mp4', 'durationSec': 62.1, 'accent': '#ED802E', 'subs': subs, 'cards': cards, 'punches': punches, 'sfx': sorted(sfx, key=lambda x: x['at']),
     'bgm': {'src': 'bgm/kb12.wav', 'keys': [[0, 0.15], [T('500g'), 0.15], [T('500g') + 0.4, 0.07], [60.3, 0.07], [61, 0.12], [62.1, 0.12]]},
     'subY': 0.705, 'cardY': 0.078, 'originY': 0.35}
json.dump(P, open('props/kb12.json', 'w'), ensure_ascii=False, indent=1)
print([(c['kind'], round(c['from'], 2), round(c['to'], 2)) for c in cards])
