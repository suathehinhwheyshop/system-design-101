import React from 'react';
import {AbsoluteFill, Audio, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig, CalculateMetadataFunction} from 'remotion';
import {PopText, TextStyle} from '../components/PopText';
import {StepCards} from '../components/StepCards';
import {PopWords, Part, WordsStyle} from '../components/PopWords';
import {ShotLayer, Transition} from '../components/ShotLayer';

// Kiểu cũ: fromSec/toSec nối liền nhau. Kiểu theo nhịp giọng: start/end trên timeline + transitionIn.
export type Shot = {src: string; fromSec: number; toSec?: number; blur?: boolean; start?: number; end?: number; transitionIn?: Transition};
export type Segment = {
  text: string[]; fromSec: number; durationSec: number; style?: TextStyle;
  voiceText?: string; voiceFromSec?: number; voiceDurSec?: number; // do scripts/long_giong.py ghi
  words?: {w: string; start: number; end: number}[];
  parts?: Part[][]; // chữ hiện theo từng cụm, đồng bộ giọng (thay cho text)
  wordsStyle?: WordsStyle;
};
export type ChayChuProps = {
  srcFile?: string; // 1 nguồn duy nhất (khi không cắt ghép)
  shots?: Shot[]; // cắt ghép nhiều nguồn, nối liền theo thứ tự
  segments: Segment[];
  stepCards?: {images: string[]; fromSec: number; durationSec: number; gapSec?: number; layout?: 'stack' | 'cascade'};
  music?: string; // có nhạc thì tắt tiếng gốc
  voice?: string; // giọng đọc (public/giong.wav); có giọng thì nhạc tự hạ khi đang đọc
  musicVolume?: number; // âm lượng nhạc lúc có giọng (mặc định 0.25)
  voiceSpan?: [number, number]; // giọng đọc liền mạch: khoảng có giọng để hạ nhạc
  logo?: string; // logo mờ góc trên (vd img/logo-trang.png)
  durationSec?: number; // tổng thời lượng (kiểu theo nhịp giọng)
  fadeOutSec?: number;
};

const shotFrames = (s: Shot, fps: number) => Math.round(((s.toSec ?? 0) - s.fromSec) * fps);

export const calcChayChu: CalculateMetadataFunction<ChayChuProps> = async ({props}) => {
  const fps = 30;
  if (props.durationSec) return {durationInFrames: Math.round(props.durationSec * fps), fps};
  if (props.shots?.length) return {durationInFrames: props.shots.reduce((a, s) => a + shotFrames(s, fps), 0), fps};
  return {};
};

const BlurShot: React.FC<{children: React.ReactNode; dur: number}> = ({children, dur}) => {
  const f = useCurrentFrame();
  const a = interpolate(f, [0, 15, dur - 15, dur], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{filter: `blur(${10 * a}px)`, transform: 'scale(1.04)'}}>{children}</AbsoluteFill>
      <AbsoluteFill style={{background: `rgba(0,0,0,${0.24 * a})`}} />
    </AbsoluteFill>
  );
};

// Nhạc hạ xuống musicVolume trong lúc giọng đọc, lên/xuống mượt 0,3 s
const duckedVolume = (f: number, fps: number, segments: Segment[], duck: number, span?: [number, number]) => {
  let v = 1;
  if (span) {
    const a = span[0] * fps, b = span[1] * fps, r = 0.5 * fps;
    return interpolate(f, [a - r, a, b, b + r], [1, duck, duck, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  }
  for (const g of segments) {
    if (g.voiceFromSec === undefined || g.voiceDurSec === undefined) continue;
    const a = g.voiceFromSec * fps, b = (g.voiceFromSec + g.voiceDurSec) * fps, r = 0.3 * fps;
    v = Math.min(v, interpolate(f, [a - r, a, b, b + r], [1, duck, duck, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
  }
  return v;
};

export const ChayChu: React.FC<ChayChuProps> = ({srcFile, shots, segments, stepCards, music, voice, musicVolume = 0.25, voiceSpan, logo, fadeOutSec = 0.6}) => {
  const {fps, durationInFrames} = useVideoConfig();
  const frame = useCurrentFrame();
  let cursor = 0;
  const fade = interpolate(frame, [durationInFrames - fadeOutSec * fps, durationInFrames], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {shots?.length && shots[0].start !== undefined
        ? shots.map((s, i) => {
            const inT = i > 0 ? s.transitionIn : undefined, outT = shots[i + 1]?.transitionIn;
            const a = (s.start ?? 0) - (inT ? inT.durSec / 2 : 0), b = (s.end ?? 0) + (outT ? outT.durSec / 2 : 0);
            const from = Math.round(a * fps), d = Math.round(b * fps) - from;
            return (
              <Sequence key={i} from={from} durationInFrames={d} name={`shot ${i + 1}: ${s.src}`}>
                <ShotLayer src={s.src} startFrom={Math.round(s.fromSec * fps)} muted={!!(music || voice)} dur={d} inT={inT} outT={outT} fps={fps} />
              </Sequence>
            );
          })
        : shots?.length
        ? shots.map((s, i) => {
            const d = shotFrames(s, fps);
            const v = <OffthreadVideo src={staticFile(s.src)} startFrom={Math.round(s.fromSec * fps)} muted={!!(music || voice)} />;
            const el = (
              <Sequence key={i} from={cursor} durationInFrames={d} name={`shot ${i + 1}: ${s.src}`}>
                {s.blur ? <BlurShot dur={d}>{v}</BlurShot> : v}
              </Sequence>
            );
            cursor += d;
            return el;
          })
        : srcFile && <OffthreadVideo src={staticFile(srcFile)} muted={!!(music || voice)} />}
      {stepCards && (
        <Sequence from={Math.round(stepCards.fromSec * fps)} durationInFrames={Math.round(stepCards.durationSec * fps)} name="step cards">
          <StepCards images={stepCards.images} durationInFrames={Math.round(stepCards.durationSec * fps)} gapSec={stepCards.gapSec} layout={stepCards.layout} />
        </Sequence>
      )}
      {segments.map((g, i) => {
        const d = Math.round(g.durationSec * fps);
        return (
          <Sequence key={i} from={Math.round(g.fromSec * fps)} durationInFrames={d} name={`chữ ${i + 1}`}>
            {g.parts ? <PopWords lines={g.parts} durationInFrames={d} style={g.wordsStyle} /> : <PopText lines={g.text} durationInFrames={d} style={g.style} />}
          </Sequence>
        );
      })}
      {music && <Audio src={staticFile(music)} volume={(f) => (voice ? duckedVolume(f, fps, segments, musicVolume, voiceSpan) : 1)} />}
      {voice && <Audio src={staticFile(voice)} />}
      {logo && <Img src={staticFile(logo)} style={{position: 'absolute', top: '4.2%', left: '50%', width: 118, transform: 'translateX(-50%)', opacity: 0.88, filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.45))'}} />}
      <AbsoluteFill style={{background: '#000', opacity: fade}} />
    </AbsoluteFill>
  );
};
