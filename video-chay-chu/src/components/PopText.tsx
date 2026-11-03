import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import {FONT, SERIF} from '../fonts';

export type TextStyle = {accent?: string; centerY?: number; keySerif?: boolean};

// "*...*" đánh dấu từ khóa nhấn mạnh
const parse = (line: string) =>
  line.split(/(\*[^*]+\*)/).filter(Boolean).map((p) => (p.startsWith('*') ? {t: p.slice(1, -1), k: true} : {t: p, k: false}));

const OUTLINE = [
  '0 0 3px rgba(0,0,0,0.7)', '1.5px 1.5px 0 rgba(0,0,0,0.45)', '-1.5px 1.5px 0 rgba(0,0,0,0.45)',
  '1.5px -1.5px 0 rgba(0,0,0,0.45)', '-1.5px -1.5px 0 rgba(0,0,0,0.45)', '0 3px 12px rgba(0,0,0,0.55)',
].join(',');

export const PopText: React.FC<{lines: string[]; durationInFrames: number; style?: TextStyle}> = ({lines, durationInFrames, style}) => {
  const frame = useCurrentFrame();
  const {fps, height} = useVideoConfig();
  const accent = style?.accent ?? '#E6D3B3';
  const keySerif = style?.keySerif ?? false;
  const centerY = style?.centerY ?? 0.31;
  const out = interpolate(frame, [durationInFrames - 9, durationInFrames], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.4, 0, 1, 1)});
  const inAll = interpolate(frame, [0, 15], [0, 1], {extrapolateRight: 'clamp', easing: Easing.bezier(0.2, 0.8, 0.2, 1)});
  const scrim = inAll * out;
  return (
    <>
      <div style={{position: 'absolute', left: 0, right: 0, top: `${centerY * 100 - 17}%`, height: '34%', opacity: scrim,
        background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.55) 50%, rgba(0,0,0,0) 100%)'}} />
      <div style={{position: 'absolute', left: '5%', right: '5%', top: `${centerY * 100}%`, transform: 'translateY(-50%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: FONT, color: '#fff', textAlign: 'center'}}>
        {lines.map((line, j) => {
          const p = spring({frame: frame - Math.round(j * 0.3 * fps), fps, config: {damping: 200}, durationInFrames: 14});
          return (
            <div key={j} style={{height: height * 0.039, display: 'flex', alignItems: 'center', whiteSpace: 'nowrap',
              opacity: p * out, transform: `translateY(${12 * (1 - p)}px)`, filter: `blur(${4 * (1 - p)}px)`, textShadow: OUTLINE}}>
              {parse(line).map((r, i) => (
                <span key={i} style={r.k
                  ? {fontWeight: 800, fontSize: height * (keySerif ? 0.031 : 0.029), fontFamily: keySerif ? SERIF : FONT, letterSpacing: keySerif ? '0.02em' : 0, color: accent, textTransform: 'uppercase', whiteSpace: 'pre'}
                  : {fontWeight: 500, fontSize: height * 0.0265, whiteSpace: 'pre'}}>{r.t}</span>
              ))}
            </div>
          );
        })}
      </div>
    </>
  );
};
