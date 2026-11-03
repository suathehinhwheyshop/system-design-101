import React from 'react';
import {Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {FONT} from '../fonts';
import {Sparkle} from './Sparkle';

// Một cụm chữ trong dòng, hiện đúng lúc giọng đọc tới (at = giây, tính từ đầu thẻ)
export type Part = {t: string; at: number; k?: boolean; sparkle?: boolean};
export type WordsStyle = {accent?: string; centerY?: number; lineGap?: number};

const SHADOW = ['0 0 3px rgba(0,0,0,0.75)', '1.5px 1.5px 0 rgba(0,0,0,0.4)', '-1.5px 1.5px 0 rgba(0,0,0,0.4)',
  '1.5px -1.5px 0 rgba(0,0,0,0.4)', '-1.5px -1.5px 0 rgba(0,0,0,0.4)', '0 3px 14px rgba(0,0,0,0.55)'].join(',');

const PartSpan: React.FC<{p: Part; accent: string; out: number; h: number}> = ({p, accent, out, h}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const at = Math.round(p.at * fps);
  const x = interpolate(frame, [at, at + 9], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.2, 0.8, 0.2, 1)});
  if (frame < at) return <span style={{opacity: 0, whiteSpace: 'pre'}}>{p.t}</span>; // giữ chỗ để dòng không xô lệch
  return (
    <span style={{position: 'relative', display: 'inline-block'}}>
    <span style={{display: 'inline-block', whiteSpace: 'pre', opacity: x * out,
      transform: `translateX(${-8 * (1 - x)}px)`, filter: `blur(${3 * (1 - x)}px)`,
      // lộ dần trái → phải như mẫu
      WebkitMaskImage: `linear-gradient(90deg, #000 ${x * 120 - 20}%, transparent ${x * 120}%)`,
      ...(p.k ? {fontWeight: 800, fontStyle: 'italic', fontSize: h * 0.027, color: accent, textTransform: 'uppercase', letterSpacing: '0.01em'}
        : {fontWeight: 500, fontSize: h * 0.025})}}>
      {p.t}
    </span>
    {p.sparkle && <span style={{opacity: out}}><Sparkle atFrame={at + 6} /></span>}
    </span>
  );
};

export const PopWords: React.FC<{lines: Part[][]; durationInFrames: number; style?: WordsStyle}> = ({lines, durationInFrames, style}) => {
  const frame = useCurrentFrame();
  const {height} = useVideoConfig();
  const accent = style?.accent ?? '#E6D3B3';
  const out = interpolate(frame, [durationInFrames - 8, durationInFrames], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <div style={{position: 'absolute', left: '6%', right: '6%', top: `${(style?.centerY ?? 0.3) * 100}%`, transform: 'translateY(-50%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: (style?.lineGap ?? 0.008) * height,
      fontFamily: FONT, color: '#fff', textAlign: 'center', textShadow: SHADOW}}>
      {lines.map((parts, j) => (
        <div key={j} style={{whiteSpace: 'nowrap', lineHeight: 1.25}}>
          {parts.map((p, i) => <PartSpan key={i} p={p} accent={accent} out={out} h={height} />)}
        </div>
      ))}
    </div>
  );
};
