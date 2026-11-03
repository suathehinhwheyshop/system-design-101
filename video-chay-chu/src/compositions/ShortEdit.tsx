import React from 'react';
import {AbsoluteFill, Audio, Img, Easing, interpolate, OffthreadVideo, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig, CalculateMetadataFunction} from 'remotion';
import {FONT, CONDENSED} from '../fonts';
import {IconGlyph, IconKind} from './TalkKinetic';

// Short edit theo brief Senior Editor: phụ đề toàn bộ lời thoại (cụm 3–7 từ, từ khoá cam), thanh tiêu đề nhóm phía trên
// (tiến độ 4 chấm), tên sản phẩm hiện dạng "nhãn sản phẩm" ngay trong phụ đề, punch-in có chủ đích ở từ khoá.
type Word = {t: string; at: number; k?: boolean};
type Sub = {start: number; end: number; words: Word[]; prod?: {icon: IconKind; label?: string}};
type Head = {fromSec: number; toSec: number; idx: number; title: string; icon: IconKind};
type Punch = {from: number; to: number; scale?: number};
export type ShortEditProps = {src: string; durationSec: number; accent: string; subs: Sub[]; heads: Head[]; punches: Punch[]; total: number;
  hook?: {fromSec: number; toSec: number; title: string; iconsAt: number}; sfx?: {at: number; file: string; v: number}[];
  products?: {src: string; from: number; to: number; h?: number}[]; prodBottom?: number;
  bgm?: {src: string; keys: [number, number][]}; subY?: number; headY?: number; originY?: number};

export const calcShortEdit: CalculateMetadataFunction<ShortEditProps> = async ({props}) => ({durationInFrames: Math.round(props.durationSec * 30), fps: 30});
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const STROKE = '0 0 3px rgba(0,0,0,.9), 2px 2px 0 rgba(0,0,0,.85), -2px 2px 0 rgba(0,0,0,.85), 2px -2px 0 rgba(0,0,0,.85), -2px -2px 0 rgba(0,0,0,.85), 0 4px 12px rgba(0,0,0,.6)';
const ICONS: IconKind[] = ['muscle', 'sun', 'bone', 'spark'];

export const Video: React.FC<{src: string; punches: Punch[]; originY: number}> = ({src, punches, originY}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps;
  let sc = 1;
  for (const p of punches) {
    if (t < p.from - 0.01 || t > p.to + 0.25) continue;
    const s = p.scale ?? 1.1;
    const k = interpolate(t, [p.from, p.from + 0.13, p.to, p.to + 0.2], [0, 1, 1, 0], {...clamp, easing: Easing.bezier(0.3, 0, 0.2, 1)});
    sc = Math.max(sc, 1 + (s - 1) * k);
  }
  return <OffthreadVideo src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${sc})`, transformOrigin: `50% ${originY * 100}%`}} />;
};

// Phụ đề: từ hiện dần theo lời (từ chưa nói mờ 45%), cụm bật nhẹ khi vào; cụm có sản phẩm hiện như nhãn sản phẩm cam
export const SubLine: React.FC<{s: Sub; accent: string; y: number}> = ({s, accent, y}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: f, fps, config: {damping: 16, stiffness: 220}, durationInFrames: 8});
  const words = s.words.map((w, i) => {
    const on = f >= Math.round((w.at - s.start) * fps);
    return <span key={i} style={{color: w.k ? accent : '#fff', opacity: on ? 1 : 0.45}}>{w.t}{i < s.words.length - 1 ? ' ' : ''}</span>;
  });
  const base: React.CSSProperties = {position: 'absolute', left: '7%', right: '17%', top: `${y * 100}%`, transform: `translateY(-50%) scale(${0.92 + 0.08 * p})`,
    opacity: Math.min(1, p * 1.6), display: 'flex', justifyContent: 'center'};
  if (s.prod) {
    return (
      <div style={base}>
        <div style={{display: 'flex', alignItems: 'center', gap: 16, background: 'rgba(14,14,14,0.84)', border: `3px solid ${accent}`, borderRadius: 22, padding: '10px 22px 10px 12px', maxWidth: '100%'}}>
          <div style={{width: 64, height: 64, borderRadius: 16, background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none'}}>
            <IconGlyph kind={s.prod.icon} size={40} color="#111" />
          </div>
          <div>
            {s.prod.label && <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 26, color: '#cfcfcf', lineHeight: 1.2}}>{s.prod.label}</div>}
            <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 46, lineHeight: 1.22}}>{words}</div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div style={base}>
      <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 56, lineHeight: 1.25, textAlign: 'center', textShadow: STROKE}}>{words}</div>
    </div>
  );
};

// Thanh tiêu đề nhóm (trên cùng, trên đỉnh đầu): "01/04 · tên nhóm" + 4 chấm tiến độ
const HeadBar: React.FC<{h: Head; accent: string; y: number; total: number}> = ({h, accent, y, total}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const dur = Math.round((h.toSec - h.fromSec) * fps);
  const p = spring({frame: f, fps, config: {damping: 15, stiffness: 180}});
  const out = interpolate(f, [dur - 6, dur], [1, 0], clamp);
  return (
    <div style={{position: 'absolute', left: '7%', right: '17%', top: `${y * 100}%`, display: 'flex', justifyContent: 'center', opacity: Math.min(1, p * 1.5) * out,
      transform: `translateY(${-24 * (1 - p)}px)`}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 14, background: 'rgba(14,14,14,0.78)', borderRadius: 999, padding: '6px 20px 6px 6px', border: `2px solid ${accent}66`}}>
        <div style={{width: 54, height: 54, borderRadius: 999, background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><IconGlyph kind={h.icon} size={32} color="#111" /></div>
        {h.idx > 0 && <div style={{fontFamily: CONDENSED, fontWeight: 800, fontSize: 38, color: accent, lineHeight: 1.18}}>{String(h.idx).padStart(2, '0')}/{String(total).padStart(2, '0')}</div>}
        <div style={{fontFamily: CONDENSED, fontWeight: 800, fontSize: 44, color: '#fff', letterSpacing: '0.02em', lineHeight: 1.18, textTransform: 'uppercase', whiteSpace: 'nowrap'}}>{h.title}</div>
        {h.idx > 0 && <div style={{display: 'flex', gap: 6, marginLeft: 4}}>
          {Array.from({length: total}).map((_, i) => <div key={i} style={{width: 12, height: 12, borderRadius: 99, background: i < h.idx ? accent : '#555'}} />)}
        </div>}
      </div>
    </div>
  );
};

// Hook: tiêu đề + 4 biểu tượng nhóm bật lần lượt (xem trước 4 nhóm sẽ nói)
const Hook: React.FC<{title: string; iconsAt: number; fromSec: number; dur: number; accent: string; y: number}> = ({title, iconsAt, fromSec, dur, accent, y}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: f, fps, config: {damping: 15, stiffness: 180}});
  const out = interpolate(f, [dur - 6, dur], [1, 0], clamp);
  const d0 = Math.round((iconsAt - fromSec) * fps);
  return (
    <div style={{position: 'absolute', left: '7%', right: '17%', top: `${y * 100}%`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, opacity: Math.min(1, p * 1.5) * out}}>
      <div style={{fontFamily: CONDENSED, fontWeight: 800, fontSize: 46, color: '#fff', textShadow: STROKE, whiteSpace: 'nowrap', lineHeight: 1.18}}>{title}</div>
      {ICONS.map((k, i) => {
        const q = spring({frame: f - d0 - i * 3, fps, config: {damping: 10, stiffness: 200}});
        return (
          <div key={k} style={{width: 52, height: 52, borderRadius: 999, background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${Math.max(0, q)})`}}>
            <IconGlyph kind={k} size={30} color="#111" />
          </div>
        );
      })}
    </div>
  );
};

// Ảnh sản phẩm (sticker tách nền viền trắng) chính giữa khung, đáy ảnh ngay trên phụ đề; bật lên + nhún nhẹ, mờ ra khi chuyển ý
const Product: React.FC<{src: string; dur: number; h: number; bottom: number}> = ({src, dur, h, bottom}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: f, fps, config: {damping: 11, stiffness: 190}});
  const out = interpolate(f, [dur - 7, dur], [1, 0], clamp);
  const bob = Math.sin(f / 9) * 5;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, bottom: `${(1 - bottom) * 100}%`, display: 'flex', justifyContent: 'center', opacity: Math.min(1, p * 1.6) * out}}>
      <Img src={staticFile(src)} style={{height: h, transform: `translateY(${bob + 40 * (1 - p)}px) scale(${0.6 + 0.4 * p}) rotate(${(1 - p) * -8}deg)`, transformOrigin: '50% 100%'}} />
    </div>
  );
};

export const ShortEdit: React.FC<ShortEditProps> = ({src, accent, subs, heads, punches, hook, sfx, bgm, products, prodBottom = 0.675, subY = 0.7, headY = 0.082, originY = 0.3, total}) => {
  const {fps} = useVideoConfig();
  const F = (t: number) => Math.round(t * fps);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Video src={src} punches={punches} originY={originY} />
      {hook && <Sequence from={F(hook.fromSec)} durationInFrames={F(hook.toSec - hook.fromSec)}>
        <Hook title={hook.title} iconsAt={hook.iconsAt} fromSec={hook.fromSec} dur={F(hook.toSec - hook.fromSec)} accent={accent} y={headY} />
      </Sequence>}
      {heads.map((h, i) => (
        <Sequence key={'h' + i} from={F(h.fromSec)} durationInFrames={F(h.toSec - h.fromSec)} name={`nhóm ${h.idx}`}>
          <HeadBar h={h} accent={accent} y={headY} total={total} />
        </Sequence>
      ))}
      {(products ?? []).map((p, i) => (
        <Sequence key={'p' + i} from={F(p.from)} durationInFrames={F(p.to - p.from)} name={`sp ${p.src}`}>
          <Product src={p.src} dur={F(p.to - p.from)} h={p.h ?? 400} bottom={prodBottom} />
        </Sequence>
      ))}
      {subs.map((s, i) => (
        <Sequence key={'s' + i} from={F(s.start)} durationInFrames={Math.max(1, F(s.end) - F(s.start))} name={`sub ${i + 1}`}>
          <SubLine s={s} accent={accent} y={subY} />
        </Sequence>
      ))}
      {bgm && <Audio src={staticFile(bgm.src)} volume={(f) => interpolate(f / fps, bgm.keys.map((k) => k[0]), bgm.keys.map((k) => k[1]), clamp)} />}
      {(sfx ?? []).map((x, i) => (
        <Sequence key={'x' + i} from={F(x.at)} durationInFrames={F(2)} name={`sfx ${x.file}`}>
          <Audio src={staticFile(x.file)} volume={x.v} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
