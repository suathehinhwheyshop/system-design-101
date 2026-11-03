"""Props KB13 Lean Body — kiểu tiểu phẩm vấn đề → giải pháp."""
import json, re
W = json.load(open('work/kb13/words.json'))
norm = lambda s: re.sub(r'[.,?!]+$', '', s).lower()
low = [norm(w['word']) for w in W]
CH = ["Anh em nào dân văn phòng,", "học sinh sinh viên", "hoặc người tập luyện", "không có thời gian ăn uống", "nhưng vẫn muốn có", "một bữa phụ tiện lợi, đủ chất.",
      "Ê, làm gì có,", "muốn ăn thì phải ăn ở bếp.", "Ai bảo thế,", "Lean Body lo được hết.", "Nhìn thế thôi,", "trong 1 gói này cung cấp", "đầy đủ carb, protein,",
      "chất xơ cùng hơn 21 loại", "vitamin và khoáng chất.", "Đặc biệt là ít đường", "và sử dụng chất béo tốt.", "Ai đang muốn build cơ,", "giữ dáng thì sử dụng cái này.",
      "Quá là tiện lợi rồi còn gì.", "Chỉ cần xé gói", "rồi pha với nước", "là uống được ngay.", "Chẳng cần chế biến gì thêm", "nhưng vẫn cung cấp", "đầy đủ dinh dưỡng",
      "như một bữa phụ", "cho anh em luôn nhớ.", "Giá đã hời,", "mua theo combo", "còn hời hơn nữa.", "Anh em tranh thủ tham khảo", "rồi đặt hàng sớm nhớ."]
KEYPH = [['dân', 'văn', 'phòng'], ['học', 'sinh', 'sinh', 'viên'], ['người', 'tập', 'luyện'], ['bữa', 'phụ'], ['tiện', 'lợi'], ['đủ', 'chất'], ['lean', 'body'], ['carb'], ['protein'],
         ['chất', 'xơ'], ['21'], ['ít', 'đường'], ['chất', 'béo', 'tốt'], ['build', 'cơ'], ['giữ', 'dáng'], ['xé', 'gói'], ['pha'], ['uống', 'được', 'ngay'], ['dinh', 'dưỡng'],
         ['hời'], ['combo'], ['đặt', 'hàng']]
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
                 'words': [dict(t=W[j]['word'].rstrip(',.') if j == idx[-1] else W[j]['word'], at=W[j]['start'], **({'k': True} if key[j] else {})) for j in idx]})
assert i == len(W)
for a, b in zip(subs, subs[1:]): a['end'] = round(min(a['end'], b['start']), 3)
subs[-1]['end'] = 48.77
def T(word, n=0): return [W[k]['start'] for k in range(len(W)) if low[k] == word][n]
els = [
 {'kind': 'personas', 'from': 0.6, 'to': T('ê') - 0.05, 'at': {'a': T('dân'), 'b': T('học'), 'c': T('người'), 'd': T('không')}},
 {'kind': 'bubble', 'side': 'l', 'text': 'Làm gì có!\nMuốn ăn phải vào bếp 🍳'.replace(' 🍳', ''), 'from': T('ê') - 0.05, 'to': T('ai') - 0.05, 'at': {'a': T('ê')}},
 {'kind': 'reveal', 'from': T('ai') - 0.05, 'to': T('nhìn') - 0.1, 'at': {'a': T('lean'), 'b': T('lo')}},
 {'kind': 'bubble', 'side': 'r', 'text': 'Ai bảo thế?', 'from': T('ai') - 0.05, 'to': T('lean') - 0.05, 'at': {'a': T('ai')}},
 {'kind': 'label', 'from': T('nhìn') - 0.05, 'to': T('ai', 1) - 0.05, 'at': {'title': T('trong'), 'carb': T('carb'), 'pro': T('protein'), 'fib': T('chất', 1), 'vit': T('21'), 'sug': T('ít'), 'fat': T('béo')}},
 {'kind': 'goals', 'from': T('ai', 1) - 0.05, 'to': T('quá') - 0.05, 'at': {'a': T('build'), 'b': T('giữ')}},
 {'kind': 'steps', 'from': T('quá') - 0.05, 'to': T('giá') - 0.05, 'at': {'a': T('xé'), 'b': T('pha'), 'c': T('uống', 1), 'd': T('chẳng')}},
 {'kind': 'price', 'from': T('giá') - 0.05, 'to': T('tranh') - 0.3, 'at': {'a': T('giá'), 'b': T('combo')}},
 {'kind': 'cta', 'from': T('tranh') - 0.3, 'to': 48.77, 'at': {'a': T('đặt')}},
]
# đổi cỡ cảnh: đoạn đối thoại "Ê làm gì có" cắt sang cận (giữ), "Ai bảo thế" trở lại trung cảnh + punch ở Lean Body
shots = [{'from': T('ê'), 'to': T('ai') - 0.02, 'scale': 1.22, 'oy': 0.2, 'hard': True},
         {'from': T('lean'), 'to': T('lean') + 1.3, 'scale': 1.1, 'oy': 0.3},
         {'from': T('21'), 'to': T('21') + 1.0, 'scale': 1.08, 'oy': 0.3},
         {'from': T('xé'), 'to': T('uống', 1) + 0.9, 'scale': 1.14, 'oy': 0.25, 'hard': True},
         {'from': T('combo'), 'to': T('combo') + 1.0, 'scale': 1.08, 'oy': 0.3}]
S = lambda at, f, v: {'at': round(at, 3), 'file': 'sfx/' + f + '.wav', 'v': v}
sfx = [S(T('dân'), 'pop', 0.2), S(T('học'), 'pop', 0.2), S(T('người'), 'pop', 0.2), S(T('không'), 'tick', 0.16), S(T('không') + 0.35, 'tick', 0.16),
       S(T('ê'), 'user/bonk', 0.34), S(T('ê') + 0.3, 'pop2', 0.2), S(T('ê') + 0.45, 'user/drip', 0.22), S(T('ai'), 'pop2', 0.18), S(T('lean') - 0.85, 'riser', 0.18), S(T('lean'), 'user/boom', 0.2),
       S(T('nhìn') - 0.05, 'swoosh', 0.2), S(T('carb'), 'pop2', 0.15), S(T('protein'), 'pop2', 0.15), S(T('chất', 1), 'pop2', 0.15), S(T('21'), 'user/ting', 0.08),
       S(T('ít'), 'pop', 0.18), S(T('béo'), 'pop', 0.18), S(T('build'), 'pop2', 0.16), S(T('giữ'), 'pop2', 0.16),
       S(T('quá') - 0.05, 'swoosh', 0.2), S(T('xé'), 'swish', 0.22), S(T('pha'), 'user/drip', 0.22), S(T('uống', 1), 'user/ting', 0.08),
       S(T('giá'), 'user/tinh-tien', 0.3), S(T('combo'), 'user/ting', 0.08), S(T('đặt'), 'user/boom', 0.16)]
P = {'src': 'kb13b.mp4', 'durationSec': 48.77, 'accent': '#ED802E', 'subs': subs, 'shots': shots, 'els': els, 'sfx': sorted(sfx, key=lambda x: x['at']),
     'bgm': {'src': 'bgm/kb13.wav', 'keys': [[0, 0.07], [T('lean'), 0.07], [47.0, 0.07], [47.6, 0.12], [48.77, 0.12]]}, 'subY': 0.725}
json.dump(P, open('props/kb13.json', 'w'), ensure_ascii=False, indent=1)
print([(e['kind'], round(e['from'], 2), round(e['to'], 2)) for e in els])
