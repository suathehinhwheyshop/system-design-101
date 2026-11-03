import React from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig, CalculateMetadataFunction} from 'remotion';
import {FONT, CONDENSED} from '../fonts';
import {IconGlyph} from './TalkKinetic';
import {Video, SubLine, STROKE} from './ShortEdit';

// Video so sánh (VS): thẻ trên đỉnh đầu đổi theo mạch kể — VS mở đầu → lợi ích → bảng so sánh điền số theo lời → kết luận chọn bản nào → CTA.
// Phụ đề toàn bộ lời thoại ở dưới. Không che mặt (thẻ ≤ 18,5% khung), không che logo áo/sản phẩm đang cầm.
type Card = {kind: 'vs' | 'benefits' | 'board' | 'verdict' | 'cta'; from: number; to: number; at: Record<string, number>};
export type VersusProps = {src: string; durationSec: number; accent: string; subs: any[]; cards: Card[]; punches: {from: number; to: number; scale?: number}[];
  sfx?: {at: number; file: string; v: number}[]; bgm?: {src: string; keys: [number, number][]}; subY?: number; cardY?: number; originY?: number};
export const calcVersus: CalculateMetadataFunction<VersusProps> = async ({props}) => ({durationInFrames: Math.round(props.durationSec * 30), fps: 30});
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const PANEL: React.CSSProperties = {background: 'rgba(14,14,14,0.82)', backdropFilter: 'blur(6px)', borderRadius: 22, border: '2px solid rgba(255,255,255,0.12)'};

const useAt = (c: Card) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return {f, fps, on: (k: string) => c.at[k] !== undefined && f >= Math.round((c.at[k] - c.from) * fps),
    pop: (k: string) => c.at[k] === undefined ? 1 : spring({frame: f - Math.round((c.at[k] - c.from) * fps), fps, config: {damping: 12, stiffness: 200}})};
};
const P: React.FC<{p: number; children: React.ReactNode; style?: React.CSSProperties}> = ({p, children, style}) => (
  <div style={{opacity: Math.min(1, Math.max(0, p) * 1.5), transform: `scale(${0.6 + 0.4 * Math.max(0, p)})`, ...style}}>{children}</div>
);

const VS: React.FC<{c: Card; accent: string}> = ({c, accent}) => {
  const {pop} = useAt(c);
  const big: React.CSSProperties = {fontFamily: CONDENSED, fontWeight: 800, fontSize: 110, color: '#fff', lineHeight: 1.1, textShadow: STROKE};
  return (
    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 26}}>
      <P p={pop('a')}><div style={big}>300G</div></P>
      <P p={pop('vs')}><div style={{width: 92, height: 92, borderRadius: 999, background: accent, color: '#111', fontFamily: CONDENSED, fontWeight: 800, fontSize: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'rotate(-8deg)', boxShadow: '0 6px 18px rgba(0,0,0,.5)'}}>VS</div></P>
      <P p={pop('b')}><div style={{...big, color: accent}}>500G</div></P>
    </div>
  );
};

const Benefits: React.FC<{c: Card; accent: string}> = ({c, accent}) => {
  const {pop} = useAt(c);
  const chip = (t: string, k: string) => (
    <P p={pop(k)} key={k}><div style={{...PANEL, display: 'flex', alignItems: 'center', gap: 12, padding: '10px 22px 10px 12px', borderRadius: 999}}>
      <div style={{width: 46, height: 46, borderRadius: 999, background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><IconGlyph kind={k === 'a' ? 'muscle' : 'bolt'} size={28} color="#111" /></div>
      <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 38, color: '#fff', whiteSpace: 'nowrap'}}>{t}</div></div></P>
  );
  return <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12}}>{chip('Phát triển cơ bắp', 'a')}{chip('Hiệu suất khi tập', 'b')}</div>;
};

// Bảng so sánh: cột 300G | 500G, số điền đúng lúc được nói; cột thắng sáng viền cam + nhãn "TIẾT KIỆM HƠN"
const Board: React.FC<{c: Card; accent: string}> = ({c, accent}) => {
  const {on, pop} = useAt(c);
  const win = on('win');
  const cell = (t: string, k: string, hi?: boolean) => (
    <div style={{flex: 1, textAlign: 'center'}}>{on(k) ? <P p={pop(k)}><div style={{fontFamily: CONDENSED, fontWeight: 800, fontSize: 56, lineHeight: 1.18, color: hi ? accent : '#fff'}}>{t}</div></P>
      : <div style={{fontFamily: CONDENSED, fontWeight: 800, fontSize: 56, lineHeight: 1.18, color: '#555'}}>—</div>}</div>
  );
  const lbl = (t: string) => <div style={{width: 230, fontFamily: FONT, fontWeight: 700, fontSize: 32, color: '#d6d6d6', whiteSpace: 'nowrap'}}>{t}</div>;
  return (
    <div style={{...PANEL, padding: '14px 22px', position: 'relative'}}>
      <div style={{display: 'flex', alignItems: 'center'}}>
        {lbl('Creatine')}
        <div style={{flex: 1, textAlign: 'center', fontFamily: CONDENSED, fontWeight: 800, fontSize: 46, color: '#fff'}}>300G</div>
        <div style={{flex: 1, textAlign: 'center', fontFamily: CONDENSED, fontWeight: 800, fontSize: 46, color: win ? '#111' : accent, background: win ? accent : 'transparent', borderRadius: 12}}>500G</div>
      </div>
      <div style={{height: 2, background: '#333', margin: '6px 0'}} />
      <div style={{display: 'flex', alignItems: 'center'}}>{lbl('Số lần dùng')}{cell('100', 'n300')}{cell('166', 'n500', win)}</div>
      <div style={{display: 'flex', alignItems: 'center'}}>{lbl('Mỗi lần ~')}{cell('4.000đ', 'p300')}{cell('3.900đ', 'p500', win)}</div>
      {win && <P p={pop('win')} style={{position: 'absolute', right: 10, top: -26}}>
        <div style={{background: accent, color: '#111', fontFamily: FONT, fontWeight: 800, fontSize: 28, padding: '4px 14px', borderRadius: 999, transform: 'rotate(4deg)', boxShadow: '0 4px 12px rgba(0,0,0,.5)'}}>TIẾT KIỆM HƠN</div>
      </P>}
    </div>
  );
};

const Verdict: React.FC<{c: Card; accent: string}> = ({c, accent}) => {
  const {on, pop} = useAt(c);
  const row = (k: string, cond: string, pick: string, active: boolean) => on(k) && (
    <P p={pop(k)} key={k}><div style={{...PANEL, display: 'flex', alignItems: 'center', gap: 16, padding: '8px 12px 8px 22px', opacity: active ? 1 : 0.62, borderColor: active ? accent : 'rgba(255,255,255,0.12)'}}>
      <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 34, color: '#fff', whiteSpace: 'nowrap'}}>{cond}</div>
      <div style={{background: accent, color: '#111', fontFamily: CONDENSED, fontWeight: 800, fontSize: 44, lineHeight: 1.18, padding: '0 16px', borderRadius: 12}}>{pick}</div>
    </div></P>
  );
  const second = on('b');
  return <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10}}>
    {row('a', 'Tập lâu dài, dùng đều →', '500G', !second)}{row('b', 'Muốn thử vị, chưa chắc →', '300G', true)}</div>;
};

const Cta: React.FC<{c: Card; accent: string}> = ({c, accent}) => {
  const {pop, f} = useAt(c);
  const pulse = 1 + 0.04 * Math.sin(f / 4);
  return <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10}}>
    <P p={pop('a')}><div style={{fontFamily: CONDENSED, fontWeight: 800, fontSize: 64, color: '#fff', textShadow: STROKE, lineHeight: 1.18}}>CÓ SẴN TẠI WHEYSHOP</div></P>
    <P p={pop('b')}><div style={{background: accent, color: '#111', fontFamily: CONDENSED, fontWeight: 800, fontSize: 56, lineHeight: 1.18, padding: '2px 26px', borderRadius: 14, transform: `scale(${pulse})`}}>CHỐT ĐƠN NGAY</div></P>
  </div>;
};

const CardView: React.FC<{c: Card; accent: string; y: number}> = ({c, accent, y}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const dur = Math.round((c.to - c.from) * fps);
  const k = interpolate(f, [0, 8, dur - 7, dur], [0, 1, 1, 0], {...clamp, easing: Easing.bezier(0.3, 0, 0.2, 1)});
  const V = {vs: VS, benefits: Benefits, board: Board, verdict: Verdict, cta: Cta}[c.kind];
  return (
    <div style={{position: 'absolute', left: '7%', right: '16%', top: `${y * 100}%`, display: 'flex', justifyContent: 'center', opacity: k, transform: `translateY(${-30 * (1 - k)}px)`}}>
      <div style={{width: '100%'}}><V c={c} accent={accent} /></div>
    </div>
  );
};

export const VersusEdit: React.FC<VersusProps> = ({src, accent, subs, cards, punches, sfx, bgm, subY = 0.705, cardY = 0.078, originY = 0.35}) => {
  const {fps} = useVideoConfig();
  const F = (t: number) => Math.round(t * fps);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Video src={src} punches={punches} originY={originY} />
      {cards.map((c, i) => (
        <Sequence key={'c' + i} from={F(c.from)} durationInFrames={F(c.to) - F(c.from)} name={c.kind}><CardView c={c} accent={accent} y={cardY} /></Sequence>
      ))}
      {subs.map((s, i) => (
        <Sequence key={'s' + i} from={F(s.start)} durationInFrames={Math.max(1, F(s.end) - F(s.start))} name={`sub ${i + 1}`}><SubLine s={s} accent={accent} y={subY} /></Sequence>
      ))}
      {bgm && <Audio src={staticFile(bgm.src)} volume={(f) => interpolate(f / fps, bgm.keys.map((k) => k[0]), bgm.keys.map((k) => k[1]), clamp)} />}
      {(sfx ?? []).map((x, i) => (
        <Sequence key={'x' + i} from={F(x.at)} durationInFrames={F(2)} name={`sfx ${x.file}`}><Audio src={staticFile(x.file)} volume={x.v} /></Sequence>
      ))}
    </AbsoluteFill>
  );
};
