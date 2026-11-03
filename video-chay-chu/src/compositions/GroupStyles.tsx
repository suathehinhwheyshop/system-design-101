import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {FONT, CONDENSED} from '../fonts';
import {IconGlyph, IconKind} from './TalkKinetic';

// 3 phương án bảng "nhóm người → sản phẩm" nhỏ gọn, không che mặt (ảnh tĩnh để duyệt).
// Mặt người nói ~16–33% khung (không phóng). Mọi nội dung: x 6–84%, y 8–74,5%.
const OR = '#ED802E';
const INK = '#111';
type Prod = {name: string; icon: IconKind; chips: string[]};
type G = {bg: string; tag: string; title: string; sub?: string; products: Prod[]; result?: string};
const G1: G = {bg: 'kb/bg15.jpg', tag: 'NHÓM 1', title: 'Người tập thể thao', products: [
  {name: 'Creatine Monohydrate', icon: 'bolt', chips: ['Sức mạnh', 'Hiệu suất tập']},
  {name: 'Vitamin', icon: 'capsule', chips: ['Miễn dịch', 'Toàn diện']}], result: 'Phát triển cơ bắp tốt hơn'};
const G2: G = {bg: 'kb/bg30.jpg', tag: 'NHÓM 2', title: 'Dân văn phòng', sub: 'ít tiếp xúc nắng', products: [
  {name: 'Vitamin D3 + K2 + Canxi', icon: 'sun', chips: ['Xương', 'Miễn dịch']}]};

const Txt: React.FC<{s: number; c?: string; w?: number; f?: string; style?: React.CSSProperties; children: React.ReactNode}> = ({s, c = '#fff', w = 800, f = FONT, style, children}) => (
  <div style={{fontFamily: f, fontWeight: w, fontSize: s, color: c, lineHeight: 1.25, whiteSpace: 'nowrap', ...style}}>{children}</div>
);
const Chip: React.FC<{t: string; s?: number}> = ({t, s = 26}) => (
  <div style={{fontFamily: FONT, fontWeight: 700, fontSize: s, color: '#fff', background: `${OR}2e`, border: `2px solid ${OR}`, borderRadius: 999, padding: '2px 12px', whiteSpace: 'nowrap'}}>{t}</div>
);
const Tag: React.FC<{t: string; s?: number}> = ({t, s = 34}) => (
  <div style={{background: OR, color: INK, fontFamily: CONDENSED, fontWeight: 800, fontSize: s, lineHeight: 1.18, padding: '2px 14px', borderRadius: 10, whiteSpace: 'nowrap'}}>{t}</div>
);
const SH = '0 0 2px rgba(0,0,0,.6), 0 3px 10px rgba(0,0,0,.6)';

// A. Thẻ gọn đáy khung: 1 thẻ nhỏ y 54–74%, mỗi sản phẩm 1 dòng (tên + nhãn công dụng cùng hàng)
const A: React.FC<{g: G}> = ({g}) => (
  <div style={{position: 'absolute', left: '5%', right: '17%', bottom: '25.5%', padding: '18px 22px', borderRadius: 30,
    background: 'rgba(14,14,14,0.82)', backdropFilter: 'blur(6px)', borderLeft: `8px solid ${OR}`, boxShadow: '0 12px 30px rgba(0,0,0,.4)'}}>
    <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
      <Tag t={g.tag} /><Txt s={50} f={CONDENSED} style={{textTransform: 'uppercase', letterSpacing: '0.02em', lineHeight: 1.18}}>{g.title}</Txt>
    </div>
    {g.sub && <Txt s={28} w={700} c="#dedede">{g.sub}</Txt>}
    <div style={{display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12}}>
      {g.products.map((p, i) => (
        <div key={i}>
          <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
            <div style={{width: 46, height: 46, borderRadius: 999, background: OR, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none'}}><IconGlyph kind={p.icon} size={28} color={INK} /></div>
            <Txt s={34} c={OR}>{p.name}</Txt>
          </div>
          <div style={{display: 'flex', gap: 8, marginTop: 6, marginLeft: 58}}>{p.chips.map((c) => <Chip key={c} t={c} />)}</div>
        </div>
      ))}
    </div>
    {g.result && <div style={{marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 10, background: OR, borderRadius: 12, padding: '4px 14px'}}>
      <IconGlyph kind="muscle" size={30} color={INK} /><Txt s={28} c={INK}>{g.result}</Txt></div>}
  </div>
);

// B. Tách trên/dưới: nhãn nhóm nằm trên đầu (y ~11%), sản phẩm hiện dạng thanh lower-third mỏng sát vùng an toàn dưới
const B: React.FC<{g: G}> = ({g}) => (
  <>
    <div style={{position: 'absolute', left: '16%', right: '16%', top: '8.5%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6}}>
      <Tag t={g.tag} s={38} />
      <Txt s={62} f={CONDENSED} style={{textTransform: 'uppercase', letterSpacing: '0.02em', lineHeight: 1.18, textShadow: SH}}>{g.title}</Txt>
      {g.sub && <Txt s={30} w={700} style={{textShadow: SH}}>{g.sub}</Txt>}
    </div>
    <div style={{position: 'absolute', left: '5%', right: '17%', bottom: '25.5%', display: 'flex', flexDirection: 'column', gap: 10}}>
      {g.products.map((p, i) => (
        <div key={i} style={{display: 'flex', alignItems: 'center', gap: 14, background: 'rgba(14,14,14,0.82)', backdropFilter: 'blur(6px)', borderRadius: 999, padding: '8px 22px 8px 8px', border: `3px solid ${OR}`}}>
          <div style={{width: 58, height: 58, borderRadius: 999, background: OR, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none'}}><IconGlyph kind={p.icon} size={34} color={INK} /></div>
          <div>
            <Txt s={32} c={OR}>{p.name}</Txt>
            <Txt s={24} w={700} c="#e6e6e6">{p.chips.join(' · ')}</Txt>
          </div>
        </div>
      ))}
      {g.result && <div style={{alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 10, background: OR, borderRadius: 999, padding: '6px 18px'}}>
        <IconGlyph kind="muscle" size={30} color={INK} /><Txt s={28} c={INK}>{g.result}</Txt></div>}
    </div>
  </>
);

// C. Thẻ dọc bên trái: cột hẹp x 5–50%, y 42–74%, để nguyên mặt và nửa phải người nói
const C: React.FC<{g: G}> = ({g}) => (
  <div style={{position: 'absolute', left: '4%', width: '47%', bottom: '25.5%', padding: '18px 18px 20px', borderRadius: 28,
    background: 'rgba(14,14,14,0.82)', backdropFilter: 'blur(6px)', borderTop: `7px solid ${OR}`, boxShadow: '0 12px 30px rgba(0,0,0,.4)'}}>
    <div style={{display: 'flex'}}><Tag t={g.tag} s={32} /></div>
    <Txt s={46} f={CONDENSED} style={{textTransform: 'uppercase', letterSpacing: '0.02em', lineHeight: 1.18, marginTop: 6, whiteSpace: 'normal'}}>{g.title}</Txt>
    {g.sub && <Txt s={26} w={700} c="#dedede" style={{whiteSpace: 'normal'}}>{g.sub}</Txt>}
    <div style={{display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12}}>
      {g.products.map((p, i) => (
        <div key={i} style={{borderTop: '2px solid #333', paddingTop: 10}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
            <IconGlyph kind={p.icon} size={34} color={OR} />
            <Txt s={30} c={OR} style={{whiteSpace: 'normal'}}>{p.name}</Txt>
          </div>
          <div style={{display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6}}>{p.chips.map((c) => <Chip key={c} t={c} s={24} />)}</div>
        </div>
      ))}
    </div>
    {g.result && <div style={{marginTop: 12, display: 'flex', alignItems: 'center', gap: 8, background: OR, borderRadius: 12, padding: '6px 12px'}}>
      <IconGlyph kind="muscle" size={28} color={INK} /><Txt s={24} c={INK} style={{whiteSpace: 'normal'}}>{g.result}</Txt></div>}
  </div>
);

const V = [A, B, C];
export const GroupStyles: React.FC<{v: number; g: number; guides?: boolean}> = ({v, g, guides}) => {
  const C0 = V[(v - 1) % 3];
  const gg = g === 2 ? G2 : G1;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Img src={staticFile(gg.bg)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      <C0 g={gg} />
      {guides && <AbsoluteFill>
        <div style={{position: 'absolute', left: 0, right: 0, top: '74.5%', height: 3, background: 'cyan'}} />
        <div style={{position: 'absolute', left: '84%', top: '35%', bottom: '15%', width: 3, background: 'cyan'}} />
      </AbsoluteFill>}
    </AbsoluteFill>
  );
};
