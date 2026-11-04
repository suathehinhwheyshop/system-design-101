import React from 'react';
import {AbsoluteFill, Easing, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig, CalculateMetadataFunction} from 'remotion';
import {INTER} from '../fonts';

// HF 123: chỉ thêm chữ lên video đã dựng sẵn (giữ nguyên hình, tiếng, thời lượng).
// Kiểu chủ đạo: cả cụm trượt nhẹ từ dưới lên + hiện dần (0,3 s), mờ đi 0,2 s. Riêng câu anim 'type': gõ từng chữ ~0,7 s, không con trỏ.
type Row = {small: string};
type Line = {kind: 'lockup'; fromSec: number; toSec: number; rows: Row[]; anim?: 'fade' | 'type' | 'left' | 'static'; hold?: boolean; y?: number; inSec?: number; outSec?: number};
export type HfSoftProps = {src: string; durationSec: number; color: string; fontSize: number; weight: number; y: number;
  rise: number; inSec: number; outSec: number; typeSec: number; scenes: Line[]; debugRows?: boolean};
export const calcHfSoft: CalculateMetadataFunction<HfSoftProps> = async ({props}) => ({durationInFrames: Math.round(props.durationSec * 30), fps: 30});

const PAL = ['#ff0000', '#00ff00', '#0000ff', '#ffff00'];
// bóng tối mỏng bám nét chữ (không hộp nền)
const SHADOW = '0 1px 3px rgba(0,0,0,.78), 0 0 8px rgba(0,0,0,.55), 0 0 16px rgba(0,0,0,.28)';
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const LineView: React.FC<{l: Line; p: HfSoftProps}> = ({l, p}) => {
  const f = useCurrentFrame();
  const {fps, height} = useVideoConfig();
  const t = p.debugRows ? 99 : f / fps;            // giây tính từ lúc câu bắt đầu
  const dur = l.toSec - l.fromSec;
  const type = l.anim === 'type';
  const anim = l.anim ?? 'fade';
  const inS = l.inSec ?? (anim === 'static' ? 0.15 : anim === 'left' ? 0.6 : p.inSec);
  const outS = l.outSec ?? p.outSec;
  const kIn = p.debugRows || type ? 1 : interpolate(t, [0, inS], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const kOut = p.debugRows || l.hold ? 1 : interpolate(t, [dur - outS, dur], [1, 0], clamp);
  const op = anim === 'left' ? Math.min(1, kIn * 2.5) : kIn;
  const tf = anim === 'left' ? `translateX(${-(1 - kIn) * 760}px)` : anim === 'fade' ? `translateY(${(1 - kIn) * p.rise}px)` : 'none';
  const chars = l.rows.reduce((n, r) => n + Array.from(r.small).length, 0);
  const shown = type ? Math.floor(interpolate(t, [0, p.typeSec], [0, chars], clamp) + 1e-6) : chars;
  let i = 0;
  return (
    <div style={{position: 'absolute', left: 60, right: 60, top: (l.y ?? p.y) * height, display: 'flex', flexDirection: 'column', alignItems: 'center',
      opacity: op * kOut, transform: tf}}>
      {l.rows.map((r, ri) => (
        <div key={ri} style={{fontFamily: INTER, fontSize: p.fontSize, fontWeight: p.weight, lineHeight: 1.32, whiteSpace: 'pre', textAlign: 'center',
          color: p.debugRows ? PAL[ri % PAL.length] : p.color, textShadow: p.debugRows ? 'none' : SHADOW}}>
          {Array.from(r.small).map((ch, k) => {
            const vis = i++ < shown;
            return <span key={k} style={{visibility: vis ? 'visible' : 'hidden'}}>{ch}</span>;
          })}
        </div>
      ))}
    </div>
  );
};

export const HfSoft: React.FC<HfSoftProps> = (p) => {
  const {fps} = useVideoConfig();
  if (p.debugRows) {
    return <AbsoluteFill style={{background: '#000'}}>{p.scenes.map((l, k) => <LineView key={k} l={l} p={p} />)}</AbsoluteFill>;
  }
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <OffthreadVideo src={staticFile(p.src)} style={{width: '100%', height: '100%'}} />
      {p.scenes.map((l, k) => (
        <Sequence key={k} from={Math.round(l.fromSec * fps)} durationInFrames={Math.round((l.toSec - l.fromSec) * fps)}>
          <LineView l={l} p={p} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
