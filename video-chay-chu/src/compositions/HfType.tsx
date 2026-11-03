import React from 'react';
import {AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig, CalculateMetadataFunction} from 'remotion';
import {INTER} from '../fonts';

// HF-01 (House de Forme): chữ đánh máy theo lời thoại, màu kem thương hiệu + viền/glow đen, chữ nhấn Inter nghiêng.
// Mốc từng ký tự (times) và tiếng gõ phím do scripts/hf01_props.py tạo cùng lúc → khớp tuyệt đối.
type Row = {small: string};
type Card = {kind: 'lockup'; fromSec: number; toSec: number; pos: 'top' | 'low'; rows: Row[]; times: number[]};
export type HfTypeProps = {src: string; videoSec: number; durationSec: number; typing?: string; typingVolume?: number;
  color: string; fontSize: number; topY: number; lowY: number; scenes: Card[]; lastFrame?: string; audio?: string; debugRows?: boolean};
export const calcHfType: CalculateMetadataFunction<HfTypeProps> = async ({props}) => ({durationInFrames: Math.round(props.durationSec * 30), fps: 30});

const PAL = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
const O = 'rgba(0,0,0,.85)';
const SHADOW = [`-2px -2px 0 ${O}`, `2px -2px 0 ${O}`, `-2px 2px 0 ${O}`, `2px 2px 0 ${O}`, `0 2px 0 ${O}`, `0 -2px 0 ${O}`,
  '0 0 4px rgba(0,0,0,.95)', '0 0 14px rgba(0,0,0,.7)', '0 0 32px rgba(0,0,0,.5)'].join(', ');

const parse = (r: string) => r.split(/(\*[^*]+\*)/).filter(Boolean).map((p) => ({t: p.replace(/\*/g, '').normalize('NFC'), em: p.startsWith('*')}));

const CardView: React.FC<{c: Card; p: HfTypeProps; last: boolean}> = ({c, p, last}) => {
  const f = useCurrentFrame();
  const {fps, height} = useVideoConfig();
  const t = c.fromSec + f / fps;
  const out = last || p.debugRows ? 1 : interpolate(t, [c.toSec - 0.16, c.toSec], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const done = c.times[c.times.length - 1];
  let n = 0;
  for (const x of c.times) if (t >= x) n++;
  if (p.debugRows) n = c.times.length;
  const blinkOn = t < done + 0.05 || Math.floor((t - done) / 0.45) % 2 === 1;
  let i = 0;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: (c.pos === 'top' ? p.topY : p.lowY) * height, opacity: out,
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10}}>
      {c.rows.map((r, ri) => (
        <div key={ri} style={{fontFamily: INTER, fontSize: p.fontSize, lineHeight: 1.22, letterSpacing: '0.002em', whiteSpace: 'pre',
          color: p.debugRows ? PAL[ri % PAL.length] : p.color, textShadow: p.debugRows ? 'none' : SHADOW}}>
          {parse(r.small).map((seg, si) => (
            <span key={si} style={{fontStyle: seg.em ? 'italic' : 'normal', fontWeight: seg.em ? 600 : 420}}>
              {Array.from(seg.t).map((ch, k) => {
                const idx = i++;
                const vis = idx < n;
                const cur = !p.debugRows && idx === n - 1 && blinkOn && !(last && t > p.durationSec - 0.4);
                return (
                  <span key={k} style={{visibility: vis ? 'visible' : 'hidden', position: 'relative'}}>
                    {ch}
                    {cur ? <span style={{position: 'absolute', right: -10, top: '0.14em', width: 5, height: '1.02em', background: p.color,
                      boxShadow: '0 0 2px rgba(0,0,0,.9), 0 0 10px rgba(0,0,0,.6)', visibility: 'visible'}} /> : null}
                  </span>
                );
              })}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
};

export const HfType: React.FC<HfTypeProps> = (p) => {
  const {fps} = useVideoConfig();
  const vf = Math.round(p.videoSec * fps);
  if (p.debugRows) {
    return <AbsoluteFill style={{background: '#000'}}>
      {p.scenes.map((c, k) => <CardView key={k} c={c} p={p} last={false} />)}
    </AbsoluteFill>;
  }
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Sequence durationInFrames={vf}>
        <OffthreadVideo muted src={staticFile(p.src)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      </Sequence>
      <Sequence from={vf}>
        {p.lastFrame ? <Img src={staticFile(p.lastFrame)} style={{width: '100%', height: '100%', objectFit: 'cover'}} /> : null}
      </Sequence>
      {p.scenes.map((c, k) => (
        <Sequence key={k} from={Math.round(c.fromSec * fps)} durationInFrames={Math.round((c.toSec - c.fromSec) * fps)}>
          <CardView c={c} p={p} last={k === p.scenes.length - 1} />
        </Sequence>
      ))}
      {p.audio ? <Audio src={staticFile(p.audio)} volume={(f) => interpolate(f, [p.durationSec * fps - 36, p.durationSec * fps - 2], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} /> : null}
      {p.typing ? <Audio src={staticFile(p.typing)} volume={p.typingVolume ?? 0.3} /> : null}
    </AbsoluteFill>
  );
};
