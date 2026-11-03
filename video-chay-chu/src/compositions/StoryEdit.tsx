import React from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, OffthreadVideo, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig, CalculateMetadataFunction} from 'remotion';
import {FONT, CONDENSED} from '../fonts';
import {IconGlyph, IconKind} from './TalkKinetic';

// Kiểu dựng "tiểu phẩm vấn đề → giải pháp" (KB13 Lean Body): tag nhân vật, bong bóng thoại, nhãn dinh dưỡng kiểu bao bì,
// dải 3 bước pha, tem giá. Phụ đề karaoke: từ đang nói có nền cam. Giữ nguyên màu video gốc.
type W = {t: string; at: number; k?: boolean};
type Sub = {start: number; end: number; words: W[]};
type Shot = {from: number; to: number; scale: number; oy?: number; hard?: boolean};
type El = {kind: 'personas' | 'bubble' | 'reveal' | 'label' | 'goals' | 'steps' | 'price' | 'cta'; from: number; to: number; at: Record<string, number>; side?: 'l' | 'r'; text?: string};
export type StoryProps = {src: string; durationSec: number; accent: string; subs: Sub[]; shots: Shot[]; els: El[];
  sfx?: {at: number; file: string; v: number}[]; bgm?: {src: string; keys: [number, number][]}; subY?: number};
export const calcStory: CalculateMetadataFunction<StoryProps> = async ({props}) => ({durationInFrames: Math.round(props.durationSec * 30), fps: 30});
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const OUT = '0 0 3px rgba(0,0,0,.9), 0 3px 10px rgba(0,0,0,.6)';

const Video: React.FC<{src: string; shots: Shot[]}> = ({src, shots}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps;
  let sc = 1, oy = 0.3;
  for (const s of shots) {
    if (t < s.from || t > s.to + 0.2) continue;
    const k = s.hard ? (t <= s.to ? 1 : 0) : interpolate(t, [s.from, s.from + 0.12, s.to, s.to + 0.18], [0, 1, 1, 0], {...clamp, easing: Easing.bezier(0.3, 0, 0.2, 1)});
    if (k > 0) { sc = Math.max(sc, 1 + (s.scale - 1) * k); oy = s.oy ?? oy; }
  }
  return <OffthreadVideo src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${sc})`, transformOrigin: `50% ${oy * 100}%`}} />;
};

const useEl = (e: El) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const d = (k: string) => Math.round(((e.at[k] ?? e.from) - e.from) * fps);
  return {f, fps, on: (k: string) => f >= d(k), sp: (k: string, damping = 12) => spring({frame: f - d(k), fps, config: {damping, stiffness: 210}})};
};
const Pp: React.FC<{p: number; style?: React.CSSProperties; children: React.ReactNode; from?: 'up' | 'left' | 'right'}> = ({p, style, children, from}) => {
  const q = Math.max(0, p);
  const tf = from === 'left' ? `translateX(${-60 * (1 - q)}px)` : from === 'right' ? `translateX(${60 * (1 - q)}px)` : from === 'up' ? `translateY(${30 * (1 - q)}px)` : `scale(${0.5 + 0.5 * q})`;
  return <div style={{opacity: Math.min(1, q * 1.6), transform: tf, ...style}}>{children}</div>;
};

// 1. Tag nhân vật: 1 hàng 3 tag căn giữa khung + nhãn "không có thời gian" hàng dưới (toàn bộ trong y 7,5–16%, trên đỉnh đầu)
const Personas: React.FC<{e: El; accent: string}> = ({e, accent}) => {
  const {sp, on} = useEl(e);
  const tag = (t: string, k: string, rot: number) => (
    <Pp p={sp(k)} from="up" key={k}><div style={{background: '#fff', color: '#111', fontFamily: CONDENSED, fontWeight: 800, fontSize: 38, lineHeight: 1.18,
      padding: '2px 14px', borderRadius: 10, transform: `rotate(${rot}deg)`, boxShadow: '0 6px 16px rgba(0,0,0,.45)', whiteSpace: 'nowrap'}}>{t}</div></Pp>
  );
  return (
    <div style={{position: 'absolute', left: '5%', right: '5%', top: '7.5%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14}}>
      <div style={{display: 'flex', justifyContent: 'center', gap: 12}}>{tag('DÂN VĂN PHÒNG', 'a', -2)}{tag('HỌC SINH · SINH VIÊN', 'b', 2)}{tag('NGƯỜI TẬP LUYỆN', 'c', -2)}</div>
      <div style={{height: 56}}>{on('d') && <Pp p={sp('d')} from="up"><div style={{display: 'flex', alignItems: 'center', gap: 10, background: accent, borderRadius: 999, padding: '5px 18px 5px 7px'}}>
        <div style={{width: 42, height: 42, borderRadius: 999, background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><IconGlyph kind="clock" size={26} color={accent} /></div>
        <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 32, color: '#111', whiteSpace: 'nowrap'}}>không có thời gian ăn uống</div></div></Pp>}</div>
    </div>
  );
};

// Icon cảm xúc kiểu meme cho đoạn thoại phản bác: nồi nấu + "?!" nổ + giọt mồ hôi, bật nối nhau rồi lắc nhẹ
const ReactIcons: React.FC<{d: number}> = ({d}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const q = (k: number) => Math.max(0, spring({frame: f - d - k, fps, config: {damping: 8, stiffness: 220}}));
  const wob = Math.sin(f / 3) * 6;
  return (
    <div style={{position: 'absolute', left: '100%', top: -18, marginLeft: 18, display: 'flex', alignItems: 'flex-start', gap: 6}}>
      <div style={{transform: `scale(${q(4)}) rotate(${-10 + wob}deg)`}}>
        <svg width="150" height="150" viewBox="0 0 100 100" style={{filter: 'drop-shadow(0 4px 8px rgba(0,0,0,.55))'}}>
          <path d="M50 4l9 18 20-6-4 20 19 8-16 13 10 18-21-1-4 20-13-15-15 13-3-20-21 0 11-17-16-14 20-7-4-20 20 7z" fill="#ffd22e" stroke="#111" strokeWidth="3" />
          <text x="50" y="64" textAnchor="middle" fontFamily="Barlow Condensed" fontWeight="800" fontSize="40" fill="#e2231a">?!</text>
        </svg>
      </div>
      <div style={{transform: `scale(${q(9)}) rotate(${8 - wob}deg)`, marginTop: 34}}>
        <svg width="124" height="124" viewBox="0 0 100 100" style={{filter: 'drop-shadow(0 4px 8px rgba(0,0,0,.55))'}}>
          <path d="M30 18c0-8 10-8 10 0M50 14c0-8 10-8 10 0M70 18c0-8 10-8 10 0" stroke="#fff" strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.9" />
          <rect x="14" y="40" width="72" height="44" rx="10" fill="#9aa3ad" stroke="#111" strokeWidth="3" />
          <rect x="8" y="32" width="84" height="12" rx="6" fill="#c3cad1" stroke="#111" strokeWidth="3" />
          <rect x="2" y="50" width="12" height="8" rx="3" fill="#111" /><rect x="86" y="50" width="12" height="8" rx="3" fill="#111" />
        </svg>
      </div>
      <div style={{transform: `scale(${q(13)})`, marginTop: -6}}>
        <svg width="52" height="72" viewBox="0 0 40 56"><path d="M20 2C12 18 4 28 4 38a16 16 0 0 0 32 0C36 28 28 18 20 2z" fill="#6fc3ff" stroke="#111" strokeWidth="3" /></svg>
      </div>
    </div>
  );
};

// 2. Bong bóng thoại (tiểu phẩm): trái = câu phản bác, phải = câu đáp
const Bubble: React.FC<{e: El; accent: string}> = ({e, accent}) => {
  const {sp} = useEl(e);
  const p = sp('a', 9);
  const left = e.side !== 'r';
  return (
    <div style={{position: 'absolute', top: '9%', left: left ? '6%' : undefined, right: left ? undefined : '17%', transformOrigin: left ? '0% 100%' : '100% 100%',
      transform: `scale(${0.4 + 0.6 * Math.max(0, p)}) rotate(${left ? -3 : 3}deg)`, opacity: Math.min(1, p * 1.8)}}>
      <div style={{background: left ? '#fff' : accent, color: '#111', borderRadius: 30, padding: '16px 28px', fontFamily: FONT, fontWeight: 800, fontSize: 44, lineHeight: 1.22,
        boxShadow: '0 8px 22px rgba(0,0,0,.45)', whiteSpace: 'pre', position: 'relative'}}>
        {e.text}
        <div style={{position: 'absolute', bottom: -22, [left ? 'left' : 'right']: 46, width: 0, height: 0, borderLeft: '18px solid transparent', borderRight: '18px solid transparent',
          borderTop: `26px solid ${left ? '#fff' : accent}`}} />
      </div>
      {left && <ReactIcons d={0} />}
    </div>
  );
};

// 3. Lộ tên sản phẩm: "LEAN BODY" kiểu tem bao bì đỏ, trượt + rung nhẹ
const Reveal: React.FC<{e: El; accent: string}> = ({e}) => {
  const {sp, on, f, fps} = useEl(e);
  const p = sp('a', 10);
  const shake = on('a') ? Math.sin(f * 1.7) * 4 * Math.exp(-(f - Math.round((e.at.a - e.from) * fps)) / 6) : 0;
  return (
    <div style={{position: 'absolute', left: '7%', right: '17%', top: '8.5%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6}}>
      <Pp p={p}><div style={{background: '#e2231a', color: '#fff', fontFamily: CONDENSED, fontWeight: 800, fontSize: 96, lineHeight: 1.12, padding: '0 30px', borderRadius: 14,
        transform: `rotate(-3deg) translateX(${shake}px)`, boxShadow: '0 8px 24px rgba(0,0,0,.5)', letterSpacing: '0.02em'}}>LEAN BODY</div></Pp>
      {on('b') && <Pp p={sp('b')} from="up"><div style={{fontFamily: FONT, fontWeight: 800, fontSize: 42, color: '#fff', textShadow: OUT}}>lo được hết!</div></Pp>}
    </div>
  );
};

// 4. Nhãn dinh dưỡng kiểu bao bì: thẻ ngang căn giữa, lưới 2×2 chia đều, tem ÍT ĐƯỜNG / CHẤT BÉO TỐT hàng dưới (y 7,5–19%, không chạm đầu)
const Label: React.FC<{e: El; accent: string}> = ({e, accent}) => {
  const {sp, on} = useEl(e);
  const cell = (t: string, k: string) => (
    <div key={k} style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, borderTop: '2px solid #111', padding: '4px 4px', opacity: on(k) ? 1 : 0.3}}>
      <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 30, color: '#111', whiteSpace: 'nowrap'}}>{t}</div>
      <div style={{width: 34, height: 34, borderRadius: 8, background: on(k) ? accent : '#ddd', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none',
        transform: `scale(${on(k) ? 0.6 + 0.4 * Math.max(0, sp(k)) : 1})`}}>{on(k) && <IconGlyph kind="check" size={24} color="#111" />}</div>
    </div>
  );
  const stamp = (t: string, k: string, rot: number) => (
    <div key={k} style={{width: 260, display: 'flex', justifyContent: 'center'}}>{on(k) && <Pp p={sp(k, 9)}><div style={{border: `4px solid ${accent}`, color: accent, background: 'rgba(14,14,14,0.82)',
      fontFamily: CONDENSED, fontWeight: 800, fontSize: 34, lineHeight: 1.18, padding: '1px 14px', borderRadius: 10, transform: `rotate(${rot}deg)`, whiteSpace: 'nowrap'}}>{t}</div></Pp>}</div>
  );
  return (
    <div style={{position: 'absolute', left: '7%', right: '7%', top: '7.5%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10}}>
      <Pp p={sp('title')} from="up" style={{width: '100%'}}>
        <div style={{background: '#fff', borderRadius: 14, padding: '8px 18px 10px', boxShadow: '0 10px 28px rgba(0,0,0,.45)'}}>
          <div style={{fontFamily: CONDENSED, fontWeight: 800, fontSize: 40, color: '#111', lineHeight: 1.1, textAlign: 'center', borderBottom: '5px solid #111', paddingBottom: 2}}>TRONG 1 GÓI</div>
          <div style={{display: 'flex', gap: 22}}>{cell('Carb', 'carb')}{cell('Protein', 'pro')}</div>
          <div style={{display: 'flex', gap: 22}}>{cell('Chất xơ', 'fib')}{cell('21+ vitamin, khoáng', 'vit')}</div>
        </div>
      </Pp>
      <div style={{display: 'flex', justifyContent: 'center', gap: 40}}>{stamp('ÍT ĐƯỜNG', 'sug', -3)}{stamp('CHẤT BÉO TỐT', 'fat', 3)}</div>
    </div>
  );
};

const Goals: React.FC<{e: El; accent: string}> = ({e, accent}) => {
  const {sp} = useEl(e);
  const g = (t: string, k: string, ic: IconKind) => (
    <Pp p={sp(k)} key={k}><div style={{display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(14,14,14,0.82)', border: `3px solid ${accent}`, borderRadius: 999, padding: '6px 22px 6px 8px'}}>
      <div style={{width: 50, height: 50, borderRadius: 999, background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><IconGlyph kind={ic} size={30} color="#111" /></div>
      <div style={{fontFamily: CONDENSED, fontWeight: 800, fontSize: 46, color: '#fff', lineHeight: 1.18}}>{t}</div></div></Pp>
  );
  return <div style={{position: 'absolute', left: '7%', right: '17%', top: '9%', display: 'flex', justifyContent: 'center', gap: 16}}>{g('BUILD CƠ', 'a', 'muscle')}{g('GIỮ DÁNG', 'b', 'spark')}</div>;
};

// 5. Dải 3 bước: xé gói → pha nước → uống ngay; bước hiện tại sáng, thanh nối chạy theo
const Steps: React.FC<{e: El; accent: string}> = ({e, accent}) => {
  const {sp, on} = useEl(e);
  const S = [{k: 'a', t: 'XÉ GÓI', ic: 'capsule' as IconKind}, {k: 'b', t: 'PHA NƯỚC', ic: 'drop' as IconKind}, {k: 'c', t: 'UỐNG NGAY', ic: 'bolt' as IconKind}];
  const done = S.filter((s) => on(s.k)).length;
  return (
    <div style={{position: 'absolute', left: '6%', right: '16%', top: '8.5%'}}>
      <div style={{position: 'relative', display: 'flex', justifyContent: 'space-between'}}>
        <div style={{position: 'absolute', left: '12%', right: '12%', top: 44, height: 8, borderRadius: 4, background: 'rgba(255,255,255,.25)'}} />
        <div style={{position: 'absolute', left: '12%', top: 44, height: 8, borderRadius: 4, background: accent, width: `${Math.max(0, done - 1) * 38}%`}} />
        {S.map((s, i) => (
          <div key={s.k} style={{position: 'relative', width: '30%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6}}>
            <Pp p={on(s.k) ? sp(s.k) : 1}><div style={{width: 96, height: 96, borderRadius: 999, background: on(s.k) ? accent : 'rgba(14,14,14,0.8)', border: `4px solid ${on(s.k) ? '#fff' : 'rgba(255,255,255,.35)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center'}}><IconGlyph kind={s.ic} size={50} color={on(s.k) ? '#111' : '#bbb'} /></div></Pp>
            <div style={{fontFamily: CONDENSED, fontWeight: 800, fontSize: 38, color: on(s.k) ? '#fff' : '#cfcfcf', textShadow: OUT, whiteSpace: 'nowrap'}}>{i + 1}. {s.t}</div>
          </div>
        ))}
      </div>
      {on('d') && <Pp p={sp('d')} from="up" style={{display: 'flex', justifyContent: 'center', marginTop: 10}}>
        <div style={{background: 'rgba(14,14,14,0.82)', borderRadius: 999, padding: '6px 20px', fontFamily: FONT, fontWeight: 800, fontSize: 32, color: '#fff'}}>không cần chế biến · <span style={{color: accent}}>đủ chất như bữa phụ</span></div></Pp>}
    </div>
  );
};

// 6. Tem giá xoay + nhãn combo
const Price: React.FC<{e: El; accent: string}> = ({e, accent}) => {
  const {sp, on, f} = useEl(e);
  const p = sp('a', 8);
  return (
    <div style={{position: 'absolute', left: '7%', right: '17%', top: '8.5%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18}}>
      <div style={{width: 200, height: 200, transform: `scale(${0.3 + 0.7 * Math.max(0, p)}) rotate(${-14 + 4 * Math.sin(f / 10)}deg)`, opacity: Math.min(1, p * 1.6)}}>
        <svg width="200" height="200" viewBox="0 0 100 100">{Array.from({length: 16}).map((_, i) => {
          const a = (i / 16) * Math.PI * 2; return <circle key={i} cx={50 + 42 * Math.cos(a)} cy={50 + 42 * Math.sin(a)} r="9" fill={accent} />; })}
          <circle cx="50" cy="50" r="42" fill={accent} /></svg>
        <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: CONDENSED, fontWeight: 800, color: '#111', lineHeight: 1}}>
          <div style={{fontSize: 34}}>GIÁ</div><div style={{fontSize: 62}}>HỜI</div></div>
      </div>
      {on('b') && <Pp p={sp('b')} from="right"><div style={{background: '#fff', color: '#111', borderRadius: 16, padding: '8px 22px', fontFamily: FONT, fontWeight: 800, fontSize: 38, lineHeight: 1.25, boxShadow: '0 8px 20px rgba(0,0,0,.45)'}}>
        Mua <span style={{color: accent}}>COMBO</span><br />còn hời hơn</div></Pp>}
    </div>
  );
};

const Cta: React.FC<{e: El; accent: string}> = ({e, accent}) => {
  const {sp, f} = useEl(e);
  return (
    <div style={{position: 'absolute', left: '7%', right: '17%', top: '9%', display: 'flex', justifyContent: 'center'}}>
      <Pp p={sp('a')}><div style={{display: 'flex', alignItems: 'center', gap: 14, background: accent, borderRadius: 18, padding: '10px 28px', transform: `scale(${1 + 0.035 * Math.sin(f / 4)})`}}>
        <IconGlyph kind="spark" size={44} color="#111" /><div style={{fontFamily: CONDENSED, fontWeight: 800, fontSize: 60, color: '#111', lineHeight: 1.18}}>ĐẶT HÀNG SỚM</div></div></Pp>
    </div>
  );
};

const ElView: React.FC<{e: El; accent: string}> = ({e, accent}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const dur = Math.round((e.to - e.from) * fps);
  const out = interpolate(f, [dur - 6, dur], [1, 0], clamp);
  const V = {personas: Personas, bubble: Bubble, reveal: Reveal, label: Label, goals: Goals, steps: Steps, price: Price, cta: Cta}[e.kind];
  return <AbsoluteFill style={{opacity: out}}><V e={e} accent={accent} /></AbsoluteFill>;
};

// Phụ đề karaoke: từ đang nói có nền cam (pill), từ đã nói trắng, từ chưa nói mờ
const SubK: React.FC<{s: Sub; accent: string; y: number}> = ({s, accent, y}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: f, fps, config: {damping: 18, stiffness: 240}, durationInFrames: 7});
  const t = s.start + f / fps;
  return (
    <div style={{position: 'absolute', left: '6%', right: '16%', top: `${y * 100}%`, transform: `translateY(-50%) translateY(${10 * (1 - p)}px)`, opacity: Math.min(1, p * 1.6),
      display: 'flex', flexWrap: 'nowrap', justifyContent: 'center', gap: '2px 6px', whiteSpace: 'nowrap'}}>
      {s.words.map((w, i) => {
        const nx = s.words[i + 1]?.at ?? s.end;
        const cur = t >= w.at && t < nx;
        const said = t >= w.at;
        return <span key={i} style={{fontFamily: FONT, fontWeight: 800, fontSize: 52, lineHeight: 1.3, padding: '0 8px', borderRadius: 10,
          background: cur ? accent : 'transparent', color: cur ? '#111' : w.k ? accent : '#fff', opacity: said ? 1 : 0.5, textShadow: cur ? 'none' : OUT}}>{w.t}</span>;
      })}
    </div>
  );
};

export const StoryEdit: React.FC<StoryProps> = ({src, accent, subs, shots, els, sfx, bgm, subY = 0.725}) => {
  const {fps} = useVideoConfig();
  const F = (t: number) => Math.round(t * fps);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Video src={src} shots={shots} />
      {els.map((e, i) => <Sequence key={'e' + i} from={F(e.from)} durationInFrames={F(e.to) - F(e.from)} name={e.kind}><ElView e={e} accent={accent} /></Sequence>)}
      {subs.map((s, i) => <Sequence key={'s' + i} from={F(s.start)} durationInFrames={Math.max(1, F(s.end) - F(s.start))} name={`sub ${i + 1}`}><SubK s={s} accent={accent} y={subY} /></Sequence>)}
      {bgm && <Audio src={staticFile(bgm.src)} volume={(f) => interpolate(f / fps, bgm.keys.map((k) => k[0]), bgm.keys.map((k) => k[1]), clamp)} />}
      {(sfx ?? []).map((x, i) => <Sequence key={'x' + i} from={F(x.at)} durationInFrames={F(2)} name={`sfx ${x.file}`}><Audio src={staticFile(x.file)} volume={x.v} /></Sequence>)}
    </AbsoluteFill>
  );
};
