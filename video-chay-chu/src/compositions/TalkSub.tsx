import React from 'react';
import {AbsoluteFill, Easing, interpolate, OffthreadVideo, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig, CalculateMetadataFunction} from 'remotion';
import {FONT} from '../fonts';

// Video nói trước camera: sub chạy theo lời (cụm ngắn, từ khóa màu nhấn) + thẻ thông tin ở ý chính + câu cảnh báo cố định.
type W = {t: string; at: number; k?: boolean};
type Sub = {start: number; end: number; words: W[]};
type Overlay = {type: 'hook' | 'chips' | 'card' | 'sizes' | 'price' | 'cta'; fromSec: number; durationSec: number; title?: string; sub?: string; items?: any[]};
export type TalkSubProps = {src: string; durationSec: number; accent: string; subs: Sub[]; subY: number; subYAt?: [number, number][]; overlays: Overlay[]; disclaimer?: string};

export const calcTalkSub: CalculateMetadataFunction<TalkSubProps> = async ({props}) => ({durationInFrames: Math.round(props.durationSec * 30), fps: 30});

const OUT = '0 0 4px rgba(0,0,0,.85),2px 2px 0 #000,-2px 2px 0 #000,2px -2px 0 #000,-2px -2px 0 #000,0 4px 14px rgba(0,0,0,.6)';
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const SubLine: React.FC<{s: Sub; accent: string; y: number}> = ({s, accent, y}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: f, fps, config: {damping: 200}, durationInFrames: 7});
  return (
    <div style={{position: 'absolute', left: '7%', right: '7%', top: `${y * 100}%`, transform: `translateY(-50%) scale(${0.94 + 0.06 * p})`, opacity: p,
      textAlign: 'center', fontFamily: FONT, fontWeight: 800, fontSize: 60, lineHeight: 1.2, whiteSpace: 'nowrap', color: '#fff', textShadow: OUT}}>
      {s.words.map((w, i) => {
        const on = f >= Math.round((w.at - s.start) * fps); // từ đang/đã đọc sáng hẳn, từ chưa đọc mờ nhẹ
        return <span key={i} style={{color: w.k ? accent : '#fff', textTransform: w.k ? 'uppercase' : undefined, opacity: on ? 1 : 0.55}}>{w.t}{i < s.words.length - 1 ? ' ' : ''}</span>;
      })}
    </div>
  );
};

const Pop: React.FC<{delay?: number; children: React.ReactNode; dur: number; style?: React.CSSProperties}> = ({delay = 0, children, dur, style}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: f - delay, fps, config: {damping: 14, stiffness: 160}});
  const out = interpolate(f, [dur - 8, dur], [1, 0], clamp);
  return <div style={{transform: `scale(${0.6 + 0.4 * p})`, opacity: Math.min(1, p * 1.4) * out, ...style}}>{children}</div>;
};

const Card: React.FC<{title: string; sub?: string; accent: string; big?: boolean}> = ({title, sub, accent, big}) => (
  <div style={{background: 'rgba(12,12,12,0.78)', border: `3px solid ${accent}`, borderRadius: 26, padding: big ? '22px 40px' : '18px 30px', textAlign: 'center',
    boxShadow: '0 10px 30px rgba(0,0,0,.45)', fontFamily: FONT, color: '#fff'}}>
    <div style={{fontWeight: 800, fontSize: big ? 84 : 52, color: accent, letterSpacing: '0.01em', lineHeight: 1.1}}>{title}</div>
    {sub && <div style={{fontWeight: 600, fontSize: big ? 40 : 34, marginTop: 6}}>{sub}</div>}
  </div>
);

const OverlayView: React.FC<{o: Overlay; accent: string}> = ({o, accent}) => {
  const {fps} = useVideoConfig();
  const f = useCurrentFrame();
  const dur = Math.round(o.durationSec * fps);
  const top: React.CSSProperties = {position: 'absolute', left: 0, right: 0, top: '9%', display: 'flex', justifyContent: 'center', gap: 22};
  if (o.type === 'hook')
    return (
      <div style={{...top, top: '8%', flexDirection: 'column', alignItems: 'center'}}>
        <Pop dur={dur}><div style={{fontFamily: FONT, fontWeight: 800, fontSize: 80, color: '#fff', textShadow: OUT, textAlign: 'center', lineHeight: 1.05, whiteSpace: 'nowrap'}}>{o.title}</div></Pop>
        <Pop dur={dur} delay={8}><div style={{marginTop: 18, background: accent, color: '#111', fontFamily: FONT, fontWeight: 800, fontSize: 44, padding: '8px 26px', borderRadius: 14}}>{o.sub}</div></Pop>
      </div>
    );
  if (o.type === 'chips')
    return (
      <div style={top}>
        {o.items!.map(([t, at]: [string, number], i: number) => (
          <Pop key={i} dur={dur} delay={Math.max(0, Math.round((at - o.fromSec) * fps))}>
            <div style={{background: accent, color: '#111', fontFamily: FONT, fontWeight: 800, fontSize: 46, padding: '12px 26px', borderRadius: 999, boxShadow: '0 6px 18px rgba(0,0,0,.4)'}}>{t}</div>
          </Pop>
        ))}
      </div>
    );
  if (o.type === 'sizes')
    return (
      <div style={top}>
        {o.items!.map(([t, s, at]: [string, string, number], i: number) => (
          <Pop key={i} dur={dur} delay={Math.max(0, Math.round((at - o.fromSec) * fps))}><Card title={t} sub={s} accent={accent} /></Pop>
        ))}
      </div>
    );
  if (o.type === 'cta') {
    const bob = Math.sin(f / 5) * 10;
    return (
      <div style={{...top, top: '5.5%', flexDirection: 'column', alignItems: 'center'}}>
        <Pop dur={dur}><Card title={o.title!} sub={o.sub} accent={accent} /></Pop>
        <Pop dur={dur} delay={10}><div style={{fontSize: 60, marginTop: 8, color: accent, transform: `translateY(${bob}px)`, textShadow: OUT, fontFamily: FONT, fontWeight: 800}}>↓ MUA NGAY</div></Pop>
      </div>
    );
  }
  return <div style={top}><Pop dur={dur}><Card title={o.title!} sub={o.sub} accent={accent} big={o.type === 'price'} /></Pop></div>;
};

export const TalkSub: React.FC<TalkSubProps> = ({src, accent, subs, subY, subYAt, overlays, disclaimer}) => {
  const yAt = (t: number) => (subYAt ?? []).reduce((y, [from, v]) => (t >= from ? v : y), subY);
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <OffthreadVideo src={staticFile(src)} />
      {subs.map((s, i) => (
        <Sequence key={i} from={Math.round(s.start * fps)} durationInFrames={Math.max(1, Math.round((s.end - s.start) * fps))} name={`sub ${i + 1}`}>
          <SubLine s={s} accent={accent} y={yAt(s.start)} />
        </Sequence>
      ))}
      {overlays.map((o, i) => (
        <Sequence key={i} from={Math.round(o.fromSec * fps)} durationInFrames={Math.round(o.durationSec * fps)} name={o.type}>
          <OverlayView o={o} accent={accent} />
        </Sequence>
      ))}
      {disclaimer && (
        <div style={{position: 'absolute', left: '6%', right: '6%', top: '80.5%', textAlign: 'center', fontFamily: FONT, fontWeight: 500, fontSize: 27,
          color: 'rgba(255,255,255,0.92)', background: 'rgba(0,0,0,0.45)', borderRadius: 10, padding: '6px 14px', lineHeight: 1.3}}>{disclaimer}</div>
      )}
    </AbsoluteFill>
  );
};
