import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, interpolate, OffthreadVideo, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig, CalculateMetadataFunction} from 'remotion';
import {FONT, CONDENSED} from '../fonts';
import {IconSvg} from './InfoStyles';
import {InfoCreatineLive} from './InfoCreatine';

// Video nói trước camera, phong cách "kinetic typography" (mẫu snaptik): cụm chữ so le — từ khóa cực lớn font hẹp
// + chữ nhỏ trắng bên cạnh/bên dưới, chữ neon phát sáng, gõ chữ, slide giải thích nền giấy kẻ ô.
export type IconKind = 'battery' | 'moon' | 'question' | 'clock' | 'drop' | 'flag' | 'capsule' | 'sun' | 'bone' | 'calendar' | 'spark' | 'check' | 'cross' | 'bolt' | 'muscle';
type Floater = {kind: IconKind; at: number; x: number; y: number; size?: number; rot?: number};
type Row = {tag?: string; icon?: IconKind; iconScale?: number; big?: string; neon?: boolean; side?: string[]; big2?: string; side2?: string[]; small?: string; type?: string; color?: string; bigSize?: number; sideSize?: number;
  at?: number; sideAt?: number[]; big2At?: number; side2At?: number[]}; // at = giây trên timeline, hiện đúng lúc được nói
type Item = {t: string; at: number; icon?: number};
type Scene = {kind: 'lockup' | 'slide' | 'blur' | 'stat' | 'dose' | 'flow' | 'list' | 'crinfo' | 'group' | 'groupB' | 'groupA'; floaters?: Floater[]; data?: any;
  num?: number; numSuffix?: string; numAt?: number; sub?: string; subAt?: number; rel?: string; relAt?: number; fromSec: number; durationSec: number; y?: number; rows?: Row[];
  title?: string; kicker?: string; titleAt?: number; items?: Item[]; image?: string; imageAt?: number};
export type KineticProps = {src: string; durationSec: number; accent: string; scenes: Scene[]; disclaimer?: string;
  safe?: {left: number; right: number}; disclaimerTop?: number;
  videoFx?: {fromSec: number; toSec: number; zoomFrom: number; zoomTo: number; punchAt?: number[]; originY?: number}[]; // đẩy cận + giật nhẹ
  debugRows?: boolean;
  bgm?: {src: string; volume: number; keys?: [number, number][]}; // nhạc nền; keys = [giây, âm lượng] để nâng/hạ theo đoạn // kiểm tra chữ: chỉ vẽ chữ, mỗi phần 1 màu, không video // vùng an toàn TikTok (tỉ lệ khung)
  scrim?: boolean; // false = không dùng khối nền tối sau cụm chữ, chỉ dùng bóng mờ theo chữ
  bigFont?: 'condensed' | 'sans'; slideBg?: string; slideAccent?: string;
  // tiếng hiệu ứng: whoosh ở chuyển cảnh (blur, slide, whooshAt), pop khi từ khóa lớn bật ra, tick khi ý trên slide hiện
  sfx?: {cues?: {at: number; file: string; v: number}[]; whoosh?: string; pop: string; tick?: string; whooshAt?: number[]; vWhoosh?: number; vPop?: number; vTick?: number}}; // sans = Be Vietnam Pro 800 (tông thương hiệu HF)
export const calcKinetic: CalculateMetadataFunction<KineticProps> = async ({props}) => ({durationInFrames: Math.round(props.durationSec * 30), fps: 30});

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const DEBUG_COLORS = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ff8000', '#8000ff'];
const DebugCtx = React.createContext<{on: boolean; next: () => string}>({on: false, next: () => ''});
// màu kiểm tra cho phần chữ tiếp theo (mỗi phần 1 màu); khi không kiểm tra thì trả undefined
const useDebugColor = () => {
  const d = React.useContext(DebugCtx);
  const ref = React.useRef<string | null>(null);
  if (d.on && ref.current === null) ref.current = d.next();
  return d.on ? ref.current! : undefined;
};
const SH = '0 3px 10px rgba(0,0,0,.55), 0 0 2px rgba(0,0,0,.6)';
const HALO = '0 0 2px rgba(0,0,0,.55), 0 2px 8px rgba(0,0,0,.5), 0 0 26px rgba(0,0,0,.4)'; // bóng mờ quanh nét chữ, thay khối nền tối

const useIn = (delay: number) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: f - delay, fps, config: {damping: 13, stiffness: 170}});
};

const Big: React.FC<{t: string; color: string; neon?: boolean; size: number; delay: number; sans?: boolean; halo?: boolean}> = ({t, color, neon, size, delay, sans, halo}) => {
  const p = useIn(delay);
  const f = useCurrentFrame();
  const flick = neon ? 0.82 + 0.18 * Math.abs(Math.sin(f / 3.1)) * (f % 23 < 2 ? 0.3 : 1) : 1; // neon nhấp nháy nhẹ
  const dbg = useDebugColor();
  const style: React.CSSProperties = dbg ? {color: dbg, opacity: 1} : neon
    ? {color: 'rgba(25,12,0,0.55)', WebkitTextStroke: `3px ${color}`, textShadow: `0 0 10px ${color}, 0 0 26px ${color}, 0 0 48px ${color}`, opacity: Math.min(1, p) * flick}
    : {color, textShadow: halo ? HALO : SH, opacity: Math.min(1, p * 1.5)};
  return (
    <div style={{fontFamily: sans ? FONT : CONDENSED, fontWeight: 800, fontSize: size, lineHeight: 1.18, textTransform: 'uppercase', letterSpacing: sans ? '0.01em' : '0.025em',
      transform: dbg ? undefined : `scale(${1.25 - 0.25 * p})`, filter: dbg ? undefined : `blur(${Math.max(0, 6 * (1 - p))}px)`, whiteSpace: 'nowrap', ...style}}>{t}</div>
  );
};

const Small: React.FC<{t: string; delay: number; size?: number; color?: string; fromRight?: boolean; halo?: boolean}> = ({t, delay, size = 54, color = '#fff', fromRight, halo}) => {
  const f = useCurrentFrame();
  const dbg = useDebugColor();
  const x = dbg ? 1 : interpolate(f, [delay, delay + 8], [0, 1], {...clamp, easing: Easing.bezier(0.2, 0.8, 0.2, 1)});
  return (
    <div style={{fontFamily: FONT, fontWeight: 700, fontSize: size, lineHeight: 1.3, letterSpacing: '0.01em', color: dbg ?? color, textShadow: dbg ? 'none' : halo ? HALO : SH, whiteSpace: 'nowrap', opacity: x,
      transform: fromRight ? `translateX(${30 * (1 - x)}px)` : `translateY(${16 * (1 - x)}px)`}}>{t}</div>
  );
};

const Tag: React.FC<{t: string; delay: number; accent: string; size?: number}> = ({t, delay, accent, size = 66}) => {
  const dbg = useDebugColor();
  const p = useIn(delay);
  return (
    <div style={{fontFamily: CONDENSED, fontWeight: 800, fontSize: size, lineHeight: 1.1, letterSpacing: '0.03em', textTransform: 'uppercase', whiteSpace: 'nowrap',
      color: dbg ?? '#111', background: dbg ?? accent, padding: '4px 22px', borderRadius: 10, transform: dbg ? undefined : `rotate(-2deg) scale(${0.6 + 0.4 * p})`,
      opacity: dbg ? 1 : Math.min(1, p * 1.5), boxShadow: dbg ? 'none' : '0 6px 18px rgba(0,0,0,.45)'}}>{t}</div>
  );
};

// Biểu tượng nhỏ cạnh từ khóa (không phải chữ): pin yếu nhấp nháy cho "mệt mỏi", trăng cho "khó ngủ"
const ICON_IDX: Partial<Record<IconKind, number>> = {sun: 4, bone: 5, drop: 6, capsule: 7};
export const IconGlyph: React.FC<{kind: IconKind; size: number; color: string; blink?: number}> = ({kind, size, color, blink = 1}) => {
  if (ICON_IDX[kind] !== undefined) return <IconSvg i={ICON_IDX[kind]!} size={size} color={color} />;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{flex: 'none', overflow: 'visible'}}>
      {kind === 'battery' && (
        <g>
          <rect x="8" y="28" width="76" height="44" rx="8" fill="none" stroke="#fff" strokeWidth="7" />
          <rect x="86" y="40" width="8" height="20" rx="3" fill="#fff" />
          <rect x="16" y="36" width="16" height="28" rx="3" fill="#ff3b30" opacity={blink} />
        </g>
      )}
      {kind === 'moon' && <path d="M62 14a38 38 0 1 0 24 62A32 32 0 0 1 62 14z" fill="#fff" />}
      {kind === 'question' && (
        <g><circle cx="50" cy="50" r="44" fill={color} /><path d="M36 38a14 14 0 1 1 20 12c-4 2-6 5-6 9v3" stroke="#111" strokeWidth="9" fill="none" strokeLinecap="round" />
          <circle cx="50" cy="76" r="6" fill="#111" /></g>
      )}
      {kind === 'clock' && (
        <g><circle cx="50" cy="50" r="40" fill="none" stroke={color} strokeWidth="9" /><path d="M50 26v26l16 10" stroke={color} strokeWidth="9" fill="none" strokeLinecap="round" /></g>
      )}
      {kind === 'calendar' && (
        <g><rect x="12" y="20" width="76" height="68" rx="10" fill="none" stroke={color} strokeWidth="8" /><rect x="12" y="20" width="76" height="20" rx="8" fill={color} />
          <path d="M32 10v18M68 10v18" stroke={color} strokeWidth="8" strokeLinecap="round" /><circle cx="35" cy="60" r="6" fill={color} /><circle cx="50" cy="60" r="6" fill={color} /><circle cx="65" cy="60" r="6" fill={color} /></g>
      )}
      {kind === 'flag' && (
        <g><rect x="6" y="20" width="88" height="60" rx="6" fill="#fff" />
          {[0, 1, 2, 3, 4].map((k) => <rect key={k} x="6" y={20 + k * 12.5} width="88" height="6.2" fill="#d62b2b" />)}
          <rect x="6" y="20" width="40" height="32" fill="#1f3c8a" /><circle cx="18" cy="30" r="2.5" fill="#fff" /><circle cx="30" cy="30" r="2.5" fill="#fff" /><circle cx="24" cy="40" r="2.5" fill="#fff" /><circle cx="36" cy="40" r="2.5" fill="#fff" /></g>
      )}
      {kind === 'spark' && <path d="M50 4l10 34 34 12-34 12-10 34-10-34L6 50l34-12z" fill={color} />}
      {kind === 'check' && <path d="M20 52l20 20 42-44" stroke={color} strokeWidth="13" fill="none" strokeLinecap="round" strokeLinejoin="round" />}
      {kind === 'cross' && <path d="M24 24l52 52M76 24L24 76" stroke={color} strokeWidth="13" fill="none" strokeLinecap="round" />}
      {kind === 'bolt' && <path d="M58 6L18 56h26l-6 38 44-54H54z" fill={color} />}
      {kind === 'muscle' && <path d="M14 70c4-22 16-40 30-48 6-3 12 0 12 6 0 5-5 8-10 9l-2 12c10-6 24-6 34 2 8 7 8 20-2 27-14 9-46 9-62-8z" fill={color} />}
    </svg>
  );
};

// Biểu tượng nhỏ cạnh từ khóa (không phải chữ): bật lên + nhún nhẹ; pin yếu nhấp nháy
const Icon: React.FC<{kind: IconKind; delay: number; size: number; color?: string}> = ({kind, delay, size, color = '#fff'}) => {
  const f = useCurrentFrame();
  const p = useIn(delay);
  const d = React.useContext(DebugCtx);
  if (d.on) return <div style={{width: size, height: size, flex: 'none'}} />;
  const blink = Math.floor((f - delay) / 6) % 2 === 0 ? 1 : 0.35;
  const bob = f > delay ? Math.sin((f - delay) / 7) * 4 : 0;
  return (
    <div style={{opacity: f < delay ? 0 : Math.min(1, p * 1.5), transform: `translateY(${bob}px) scale(${0.4 + 0.6 * p}) rotate(${(1 - p) * -25}deg)`,
      filter: 'drop-shadow(0 3px 6px rgba(0,0,0,.6))', flex: 'none', display: 'flex'}}>
      <IconGlyph kind={kind} size={size} color={color} blink={blink} />
    </div>
  );
};

// Icon nhỏ trang trí rải quanh cụm chữ (toạ độ px khung 1080×1920), bật lên rồi trôi nhẹ
const Floaters: React.FC<{s: Scene; accent: string; out: number}> = ({s, accent, out}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const d = React.useContext(DebugCtx);
  if (d.on || !s.floaters) return null;
  return (
    <AbsoluteFill style={{opacity: out, pointerEvents: 'none'}}>
      {s.floaters.map((fl, i) => {
        const dl = Math.max(0, Math.round((fl.at - s.fromSec) * fps));
        const p = spring({frame: f - dl, fps, config: {damping: 10, stiffness: 170}});
        if (f < dl) return null;
        const sz = fl.size ?? 64;
        const drift = Math.sin((f - dl) / 10 + i) * 6;
        return (
          <div key={i} style={{position: 'absolute', left: fl.x - sz / 2, top: fl.y - sz / 2 + drift, transform: `scale(${p}) rotate(${(fl.rot ?? 0) + (1 - p) * 40}deg)`,
            filter: 'drop-shadow(0 3px 6px rgba(0,0,0,.55))'}}>
            <IconGlyph kind={fl.kind} size={sz} color={accent} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const Typed: React.FC<{t: string; delay: number}> = ({t, delay}) => {
  const f = useCurrentFrame();
  const dbg = useDebugColor();
  const n = dbg ? t.length : Math.max(0, Math.min(t.length, Math.floor((f - delay) / 1.6)));
  const cursor = n < t.length || Math.floor(f / 8) % 2 === 0;
  return <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 50, color: dbg ?? '#fff', textShadow: dbg ? 'none' : SH, whiteSpace: 'pre'}}>{t.slice(0, n)}{!dbg && <span style={{opacity: cursor ? 1 : 0, fontWeight: 400}}>|</span>}</div>;
};

const useOut = (s: Scene, n = 6) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const dur = Math.round(s.durationSec * fps);
  return interpolate(f, [dur - n, dur], [1, 0], clamp);
};

// Chuyển cảnh nhòe (như mẫu): làm nhòe cả khung rồi rõ lại trong ~0,4 s
const BlurFlash: React.FC<{s: Scene}> = ({s}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const dur = Math.round(s.durationSec * fps);
  const b = interpolate(f, [0, dur / 2, dur], [0, 22, 0], clamp);
  return <AbsoluteFill style={{backdropFilter: `blur(${b}px)`, WebkitBackdropFilter: `blur(${b}px)`, background: `rgba(255,255,255,${0.008 * b})`}} />;
};

const Lockup: React.FC<{s: Scene; accent: string; sans?: boolean; scrim?: boolean; safe?: {left: number; right: number}}> = ({s, accent, sans, scrim: useScrim = true, safe}) => {
  const dbgOn = React.useContext(DebugCtx).on;
  const out = dbgOn ? 1 : useOut(s);
  const {fps} = useVideoConfig();
  let d = 0;
  const next = (step = 6) => (d += step) - step;
  const at = (t: number | undefined, step = 6) => (t === undefined ? next(step) : Math.max(0, Math.round((t - s.fromSec) * fps)));
  const firstAt = Math.min(...s.rows!.flatMap((r) => [r.at, ...(r.sideAt ?? [])]).filter((x): x is number => x !== undefined).map((x) => Math.round((x - s.fromSec) * fps)), 0 + 1e9);
  const f = useCurrentFrame();
  const scrim = interpolate(f, [firstAt === 1e9 ? 0 : firstAt, (firstAt === 1e9 ? 0 : firstAt) + 8], [0, 1], clamp);
  return (
    <>
    <Floaters s={s} accent={accent} out={out} />
    <div style={{position: 'absolute', left: `${(safe?.left ?? 0.05) * 100}%`, right: `${(safe?.right ?? 0.05) * 100}%`, top: `${(s.y ?? 0.62) * 100}%`, transform: `translateY(-50%) scale(${0.96 + 0.04 * out})`, opacity: out,
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22}}>
      {/* nền tối mờ sau cụm chữ để không lẫn vào logo/hoạ tiết áo */}
      {useScrim && <div style={{position: 'absolute', inset: '-10% -4%', zIndex: -1, opacity: scrim,
        background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.38) 0%, rgba(0,0,0,0.2) 45%, rgba(0,0,0,0) 68%)'}} />}
      {s.rows!.map((r, i) => (
        <div key={i} style={{display: 'flex', alignItems: 'center', gap: 26}}>
          {r.type && <Typed t={r.type} delay={at(r.at, 4)} />}
          {(r.tag || r.big) && (
            // icon treo bên trái từ khóa (không chiếm chỗ) → chữ vẫn đúng trục giữa khung
            <div style={{position: 'relative', display: 'flex'}}>
              {r.icon && (
                <div style={{position: 'absolute', right: '100%', top: '50%', transform: 'translateY(-50%)', marginRight: 18}}>
                  <Icon kind={r.icon} delay={at(r.at)} size={Math.round((r.bigSize ?? 170) * (r.iconScale ?? 0.85))} color={accent} />
                </div>
              )}
              {r.tag && <Tag t={r.tag} delay={at(r.at)} accent={accent} />}
              {r.big && <Big t={r.big} color={r.color ?? accent} neon={r.neon} size={r.bigSize ?? 170} delay={at(r.at)} sans={sans} halo={!useScrim} />}
            </div>
          )}
          {!r.big && !r.tag && r.icon && <Icon kind={r.icon} delay={at(r.at)} size={Math.round((r.bigSize ?? 170) * (r.iconScale ?? 0.85))} color={accent} />}
          {r.side && (
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2}}>
              {r.side.map((t, j) => <Small key={j} t={t} delay={at(r.sideAt?.[j], 4)} fromRight size={r.sideSize ?? 50} halo={!useScrim} />)}
            </div>
          )}
          {r.big2 && <div style={{width: 14}} />}
          {r.big2 && <Big t={r.big2} color={r.color ?? accent} size={r.bigSize ?? 170} delay={at(r.big2At, 10)} sans={sans} halo={!useScrim} />}
          {r.side2 && (
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
              {r.side2.map((t, j) => <Small key={j} t={t} delay={at(r.side2At?.[j], 4)} fromRight size={r.sideSize ?? 50} halo={!useScrim} />)}
            </div>
          )}
          {r.small && <Small t={r.small} delay={at(r.at, 5)} halo={!useScrim} />}
        </div>
      ))}
    </div>
    </>
  );
};

// Slide giải thích: nền giấy kẻ ô, tiêu đề + các ý căn lề trái. Mỗi ý bật lên đúng lúc được nói (ý đang nói to và đậm màu,
// ý đã nói lùi về). Ảnh sản phẩm dán kiểu sticker góc phải dưới.
const SlideItem: React.FC<{it: Item; next?: number; from: number; accent: string; idx: number}> = ({it, next, from, accent, idx}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const a = Math.round((it.at - from) * fps), b = next === undefined ? 1e9 : Math.round((next - from) * fps);
  const p = spring({frame: f - a, fps, config: {damping: 14, stiffness: 180}});
  const line = interpolate(f, [a + 3, a + 12], [0, 1], {...clamp, easing: Easing.bezier(0.2, 0.8, 0.2, 1)});
  const active = interpolate(f, [b, b + 6], [1, 0], clamp); // ý sau xuất hiện thì ý này lùi về
  if (f < a) return null;
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 30, opacity: Math.min(1, p * 1.5), transform: `translateX(${-60 * (1 - p)}px) scale(${0.94 + 0.06 * active})`, transformOrigin: 'left center'}}>
      <div style={{width: 86, height: 86, borderRadius: 999, background: accent, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: CONDENSED, fontWeight: 800, fontSize: 52, boxShadow: '0 6px 14px rgba(0,0,0,.18)', flex: 'none'}}>{String(idx + 1).padStart(2, '0')}</div>
      <div style={{position: 'relative'}}>
        <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 76, letterSpacing: '0.005em', color: active > 0.5 ? '#1f1b16' : '#6f6757', whiteSpace: 'nowrap'}}>{it.t}</div>
        <div style={{position: 'absolute', left: 0, bottom: 2, height: 14, width: `${line * 100}%`, background: accent, opacity: 0.35 + 0.45 * active, borderRadius: 7, zIndex: -1}} />
      </div>
    </div>
  );
};

const Slide: React.FC<{s: Scene; accent: string; bg?: string; sans?: boolean}> = ({s, accent, bg = '#F1EDDB', sans}) => {
  const grid = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='90' height='90'%3E%3Cpath d='M0 0H90M0 0V90' stroke='%23d3cdb2' stroke-width='2' stroke-dasharray='6 6'/%3E%3Ccircle cx='0' cy='0' r='3' fill='%23bdb699'/%3E%3C/svg%3E")`;
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = useIn(0);
  const pT = useIn(Math.round(((s.titleAt ?? s.fromSec) - s.fromSec) * fps));
  const pImg = useIn(Math.round(((s.imageAt ?? s.fromSec + 0.4) - s.fromSec) * fps));
  const out = useOut(s, 8);
  const float = Math.sin(f / 14) * 6;
  return (
    <AbsoluteFill style={{background: bg, backgroundImage: grid, opacity: Math.min(1, p * 2) * out}}>
      <div style={{position: 'absolute', left: '9%', top: '15%', opacity: pT, transform: `translateY(${20 * (1 - pT)}px)`}}>
        <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 46, color: '#7a7058', letterSpacing: '0.02em'}}>{s.kicker}</div>
        <div style={{fontFamily: sans ? FONT : CONDENSED, fontWeight: 800, fontSize: sans ? 96 : 112, color: '#1f1b16', letterSpacing: sans ? '0.005em' : '0.02em', lineHeight: 1.0, textTransform: 'uppercase', whiteSpace: 'pre-line'}}>{s.title}</div>
        <div style={{width: 130, height: 10, background: accent, borderRadius: 5, marginTop: 14}} />
      </div>
      <div style={{position: 'absolute', left: '9%', top: '41%', display: 'flex', flexDirection: 'column', gap: 38}}>
        {s.items!.map((it, i) => <SlideItem key={i} it={it} next={s.items![i + 1]?.at} from={s.fromSec} accent={accent} idx={i} />)}
      </div>
      {s.image && (
        <Img src={staticFile(s.image)} style={{position: 'absolute', right: '7%', top: '10.5%', width: 310, borderRadius: 22, border: '12px solid #fff',
          boxShadow: '0 18px 40px rgba(0,0,0,.28)', opacity: Math.min(1, pImg * 1.5), transform: `rotate(5deg) translateY(${float}px) scale(${0.7 + 0.3 * pImg})`}} />
      )}
    </AbsoluteFill>
  );
};

// Màn "con số lớn" (mẫu 5): nền là video đang chạy làm mờ + tối, các phần hiện đúng lúc được nói, số đếm lên
const Stat: React.FC<{s: Scene; accent: string}> = ({s, accent}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const dur = Math.round(s.durationSec * fps);
  const rel = (t?: number) => Math.round(((t ?? s.fromSec) - s.fromSec) * fps);
  const bgIn = interpolate(f, [0, 8, dur - 8, dur], [0, 1, 1, 0], clamp);
  const pNum = useIn(rel(s.numAt));
  const count = Math.round(interpolate(f, [rel(s.numAt), rel(s.numAt) + 12], [0, s.num ?? 0], {...clamp, easing: Easing.bezier(0.2, 0.8, 0.2, 1)}));
  const fade = (t?: number) => interpolate(f, [rel(t), rel(t) + 8], [0, 1], {...clamp, easing: Easing.bezier(0.2, 0.8, 0.2, 1)});
  const SHD = '0 3px 10px rgba(0,0,0,.55), 0 0 2px rgba(0,0,0,.6)';
  return (
    <AbsoluteFill style={{opacity: interpolate(f, [dur - 8, dur], [1, 0], clamp)}}>
      <AbsoluteFill style={{backdropFilter: `blur(${16 * bgIn}px)`, background: `rgba(0,0,0,${0.55 * bgIn})`}} />
      <div style={{position: 'absolute', left: '16%', right: '16%', top: '14%', textAlign: 'center'}}>
        <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 46, color: '#fff', textShadow: SHD, opacity: fade(s.titleAt), transform: `translateY(${14 * (1 - fade(s.titleAt))}px)`}}>{s.title}</div>
        <div style={{fontFamily: CONDENSED, fontWeight: 800, fontSize: 280, whiteSpace: 'nowrap', color: accent, lineHeight: 1.05, textShadow: `0 0 40px ${accent}66`,
          opacity: Math.min(1, pNum * 1.5), transform: `scale(${1.2 - 0.2 * pNum})`, filter: `blur(${Math.max(0, 6 * (1 - pNum))}px)`}}>{count.toLocaleString('vi-VN')}<span style={{fontSize: '0.42em', marginLeft: 12}}>{s.numSuffix}</span></div>
        <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 50, color: '#fff', textShadow: SHD, opacity: fade(s.subAt), transform: `translateY(${14 * (1 - fade(s.subAt))}px)`}}>{s.sub}</div>
        <div style={{fontFamily: FONT, fontWeight: 500, fontSize: 40, color: '#ddd', marginTop: 50, opacity: fade(s.relAt)}}>{s.rel}</div>
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 22, marginTop: 26, paddingLeft: 70}}>
          {s.items!.map((it, i) => {
            const p = useIn(rel(it.at));
            return (
              <div key={i} style={{display: 'flex', alignItems: 'center', gap: 18, background: 'rgba(237,128,46,.16)', border: `2px solid ${accent}`, borderRadius: 999,
                padding: '10px 30px 10px 14px', opacity: f < rel(it.at) ? 0 : Math.min(1, p * 1.5), transform: `translateX(${-50 * (1 - p)}px) scale(${0.9 + 0.1 * p})`, transformOrigin: 'left center'}}>
                <IconSvg i={it.icon ?? i} size={48} color={accent} />
                <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 42, color: '#fff'}}>{it.t}</div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ===== Infographic =====
const GRID = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='72' height='72'%3E%3Cpath d='M0 0H72M0 0V72' stroke='%23ffffff' stroke-opacity='0.06' stroke-width='2'/%3E%3C/svg%3E")`;
const rel = (s: Scene, t: number, fps: number) => Math.max(0, Math.round((t - s.fromSec) * fps));

const Pop: React.FC<{d: number; children: React.ReactNode; from?: 'left' | 'up' | 'scale'; style?: React.CSSProperties}> = ({d, children, from = 'scale', style}) => {
  const f = useCurrentFrame();
  const p = useIn(d);
  if (f < d) return <div style={{opacity: 0, ...style}}>{children}</div>;
  const tf = from === 'left' ? `translateX(${-50 * (1 - p)}px)` : from === 'up' ? `translateY(${30 * (1 - p)}px)` : `scale(${0.6 + 0.4 * p})`;
  return <div style={{opacity: Math.min(1, p * 1.5), transform: tf, ...style}}>{children}</div>;
};

// Màn hàm lượng: 2 thẻ D3 / K2 xếp dọc, số đếm lên, nền tối kẻ ô (thay cho ảnh nền mờ)
const Dose: React.FC<{s: Scene; accent: string}> = ({s, accent}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const D = s.data;
  const dur = Math.round(s.durationSec * fps);
  const fade = interpolate(f, [0, 8, dur - 8, dur], [0, 1, 1, 0], clamp);
  const count = (v: number, t: number) => Math.round(interpolate(f, [rel(s, t, fps), rel(s, t, fps) + 14], [0, v], {...clamp, easing: Easing.bezier(0.2, 0.8, 0.2, 1)}));
  const card = (c: any, i: number) => (
    <Pop d={rel(s, c.at, fps)} from="left" key={i}>
      <div style={{display: 'flex', alignItems: 'center', gap: 34, background: 'rgba(255,255,255,0.05)', border: `3px solid ${accent}`, borderRadius: 34, padding: '30px 38px', width: 760}}>
        <div style={{width: 150, height: 150, borderRadius: 999, background: `${accent}22`, border: `3px solid ${accent}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none'}}>
          <IconGlyph kind={c.icon} size={88} color={accent} />
        </div>
        <div>
          <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 44, color: '#fff', letterSpacing: '0.02em'}}>{c.name}</div>
          <div style={{fontFamily: CONDENSED, fontWeight: 800, fontSize: 132, color: accent, lineHeight: 1.12, whiteSpace: 'nowrap'}}>
            {count(c.value, c.valueAt).toLocaleString('vi-VN')}<span style={{fontSize: 60, marginLeft: 12}}>{c.unit}</span></div>
          {c.chip && (
            <Pop d={rel(s, c.chipAt, fps)} from="up" style={{display: 'inline-block'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: 12, marginTop: 6, background: accent, color: '#111', fontFamily: FONT, fontWeight: 800, fontSize: 36, padding: '6px 20px', borderRadius: 999}}>
                <IconGlyph kind="drop" size={34} color="#111" />{c.chip}</div>
            </Pop>
          )}
        </div>
      </div>
    </Pop>
  );
  return (
    <AbsoluteFill style={{opacity: fade, background: 'radial-gradient(ellipse at 50% 30%, #2a1a0e 0%, #0b0b0b 65%)', backgroundImage: `${GRID}, radial-gradient(ellipse at 50% 30%, #2a1a0e 0%, #0b0b0b 65%)`}}>
      <div style={{position: 'absolute', left: '9%', top: '12%'}}>
        <Pop d={rel(s, D.titleAt, fps)} from="up">
          <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 46, color: '#cfcfcf'}}>{D.kicker}</div>
          <div style={{fontFamily: CONDENSED, fontWeight: 800, fontSize: 118, color: '#fff', lineHeight: 1.18, textTransform: 'uppercase', letterSpacing: '0.02em'}}>{D.title}</div>
          <div style={{width: 130, height: 10, background: accent, borderRadius: 5, marginTop: 10}} />
        </Pop>
      </div>
      <div style={{position: 'absolute', left: '9%', top: '33%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 26}}>
        {card(D.cards[0], 0)}
        <Pop d={rel(s, D.plusAt, fps)} style={{marginLeft: 330}}>
          <div style={{width: 88, height: 88, borderRadius: 999, background: accent, color: '#111', fontFamily: CONDENSED, fontWeight: 800, fontSize: 74, display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1}}>+</div>
        </Pop>
        {card(D.cards[1], 1)}
      </div>
    </AbsoluteFill>
  );
};

// Sơ đồ công dụng chia đôi: trên là người nói (giữ mặt), dưới là bảng infographic hiện từng bước theo lời nói
const Node: React.FC<{d: number; icon: IconKind; label: string; accent: string; hi?: boolean}> = ({d, icon, label, accent, hi}) => (
  <Pop d={d}>
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, width: 200}}>
      <div style={{width: 112, height: 112, borderRadius: 999, background: hi ? accent : '#1b1b1b', border: `5px solid ${accent}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <IconGlyph kind={icon} size={66} color={hi ? '#111' : accent} />
      </div>
      <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 38, color: '#fff', textAlign: 'center', lineHeight: 1.2, whiteSpace: 'nowrap'}}>{label}</div>
    </div>
  </Pop>
);
const Arrow: React.FC<{d: number; accent: string; w?: number}> = ({d, accent, w = 90}) => {
  const f = useCurrentFrame();
  const k = interpolate(f, [d, d + 8], [0, 1], clamp);
  if (k <= 0) return <svg width={w} height={40} style={{flex: 'none', marginBottom: 54}} />;
  return (
    <svg width={w} height={40} style={{flex: 'none', marginBottom: 54}}>
      <line x1={4} y1={20} x2={4 + (w - 22) * k} y2={20} stroke={accent} strokeWidth={6} strokeLinecap="round" />
      {k > 0.95 && <path d={`M${w - 22} 8 L${w - 4} 20 L${w - 22} 32`} fill="none" stroke={accent} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />}
    </svg>
  );
};
const Chip: React.FC<{d: number; t: string; accent: string}> = ({d, t, accent}) => (
  <Pop d={d} from="up">
    <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 40, color: '#fff', background: `${accent}2a`, border: `3px solid ${accent}`, borderRadius: 999, padding: '8px 24px', whiteSpace: 'nowrap'}}>{t}</div>
  </Pop>
);

const Flow: React.FC<{s: Scene; accent: string}> = ({s, accent}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const D = s.data;
  const dur = Math.round(s.durationSec * fps);
  const slide = interpolate(f, [0, 10, dur - 10, dur], [1, 0, 0, 1], {...clamp, easing: Easing.bezier(0.3, 0, 0.2, 1)});
  const R = (t: number) => rel(s, t, fps);
  const hiAt = R(D.highlightAt);
  const pulse = f >= hiAt ? 1 + 0.06 * Math.exp(-(f - hiAt) / 6) * Math.cos((f - hiAt) / 1.5) : 1;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: `${D.top * 100}%`, bottom: 0, transform: `translateY(${slide * 110}%)`,
        background: 'linear-gradient(180deg, rgba(14,14,14,0.96) 0%, #0d0d0d 100%)', backgroundImage: `${GRID}, linear-gradient(180deg, rgba(14,14,14,0.96), #0d0d0d)`,
        borderTop: `8px solid ${accent}`, borderRadius: '44px 44px 0 0', boxShadow: '0 -18px 40px rgba(0,0,0,.5)'}}>
        <div style={{position: 'absolute', left: '5%', right: '15%', top: 22}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 22}}>
            <Pop d={R(D.titleAt)} from="up">
              <div style={{fontFamily: CONDENSED, fontWeight: 800, fontSize: 64, color: accent, letterSpacing: '0.03em', lineHeight: 1.18}}>CÔNG DỤNG</div>
            </Pop>
            {/* nhãn MK-7 đặt cạnh tiêu đề để toàn bộ bảng nằm trên 74% khung (vùng caption TikTok) */}
            <Pop d={R(D.badgeAt)} from="up">
              <div style={{display: 'flex', alignItems: 'center', gap: 10, background: accent, color: '#111', borderRadius: 16, padding: '8px 18px', transform: `scale(${pulse})`, transformOrigin: 'left center'}}>
                <IconGlyph kind="clock" size={38} color="#111" />
                <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 32, lineHeight: 1.25, whiteSpace: 'nowrap'}}>{D.badge}</div>
              </div>
            </Pop>
          </div>
          {D.rows.map((r: any, i: number) => (
            <div key={i} style={{display: 'flex', alignItems: 'center', gap: 6, marginTop: 10}}>
              <Node d={R(r.at)} icon={r.icon} label={r.name} accent={accent} hi />
              <Arrow d={R(r.arrowAt)} accent={accent} />
              <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 14, marginBottom: 54, minWidth: 220}}>
                {r.chips.map((c: any, j: number) => <Chip key={j} d={R(c.at)} t={c.t} accent={accent} />)}
              </div>
              <Arrow d={R(r.endAt) - 4} accent={accent} w={70} />
              <Node d={R(r.endAt)} icon={r.endIcon} label={r.end} accent={accent} />
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Bảng checklist chia đôi màn hình: tiêu đề câu hỏi (số thứ tự) + các ý có icon, hiện theo lời nói; ý đang nói sáng, ý trước lùi màu
const ListPanel: React.FC<{s: Scene; accent: string}> = ({s, accent}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const D = s.data;
  const dur = Math.round(s.durationSec * fps);
  const slide = interpolate(f, [0, 10, dur - 10, dur], [1, 0, 0, 1], {...clamp, easing: Easing.bezier(0.3, 0, 0.2, 1)});
  const R = (t: number) => rel(s, t, fps);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: `${D.top * 100}%`, bottom: 0, transform: `translateY(${slide * 110}%)`,
        backgroundImage: `${GRID}, linear-gradient(180deg, rgba(14,14,14,0.95), #0d0d0d)`, borderTop: `8px solid ${accent}`, borderRadius: '44px 44px 0 0', boxShadow: '0 -18px 40px rgba(0,0,0,.5)'}}>
        <div style={{position: 'absolute', left: '7%', right: '16%', top: 36}}>
          <Pop d={R(D.titleAt)} from="up">
            <div style={{display: 'flex', alignItems: 'center', gap: 20}}>
              <div style={{background: accent, color: '#111', fontFamily: CONDENSED, fontWeight: 800, fontSize: 62, lineHeight: 1.18, padding: '2px 22px', borderRadius: 14}}>{D.num}</div>
              <div style={{fontFamily: CONDENSED, fontWeight: 800, fontSize: 92, color: '#fff', letterSpacing: '0.02em', lineHeight: 1.18, textTransform: 'uppercase', whiteSpace: 'nowrap'}}>{D.title}</div>
            </div>
          </Pop>
          <div style={{display: 'flex', flexDirection: 'column', gap: 18, marginTop: 26}}>
            {D.items.map((it: any, i: number) => {
              const nx = D.items[i + 1]?.at;
              const active = nx === undefined || f < R(nx) ? 1 : 0;
              return (
                <Pop key={i} d={R(it.at)} from="left">
                  <div style={{display: 'flex', alignItems: 'center', gap: 24, opacity: active ? 1 : 0.6}}>
                    <div style={{width: 104, height: 104, borderRadius: 999, background: active ? accent : '#1d1d1d', border: `4px solid ${accent}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none'}}>
                      <IconGlyph kind={it.icon ?? 'check'} size={60} color={active ? '#111' : accent} />
                    </div>
                    <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 54, color: '#fff', lineHeight: 1.25, whiteSpace: 'nowrap'}}>{it.t}</div>
                  </div>
                </Pop>
              );
            })}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Thẻ "nhóm người → sản phẩm phù hợp" (kiểu thẻ nổi đã duyệt: nền trong suốt 86%, vừa nội dung, chữ phụ sáng ≥ 80%)
const GroupPanel: React.FC<{s: Scene; accent: string}> = ({s, accent}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const D = s.data;
  const dur = Math.round(s.durationSec * fps);
  const slide = interpolate(f, [0, 10, dur - 10, dur], [1, 0, 0, 1], {...clamp, easing: Easing.bezier(0.3, 0, 0.2, 1)});
  const R = (t: number) => rel(s, t, fps);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: '3%', right: '3%', top: `${D.top * 100}%`, padding: '26px 0 28px', borderRadius: 40,
        background: 'rgba(14,14,14,0.86)', backdropFilter: 'blur(6px)', borderTop: `7px solid ${accent}`, boxShadow: '0 18px 40px rgba(0,0,0,.45)',
        transform: `translateY(${slide * 120}%)`, opacity: 1 - slide * 0.6}}>
        <div style={{marginLeft: '4%', marginRight: '14.5%'}}>
          <Pop d={R(D.titleAt)} from="up">
            <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
              <div style={{background: accent, color: '#111', fontFamily: CONDENSED, fontWeight: 800, fontSize: 46, lineHeight: 1.18, padding: '2px 16px', borderRadius: 12, whiteSpace: 'nowrap'}}>{D.tag}</div>
              <div style={{fontFamily: CONDENSED, fontWeight: 800, fontSize: 76, color: '#fff', letterSpacing: '0.02em', lineHeight: 1.18, textTransform: 'uppercase', whiteSpace: 'nowrap'}}>{D.title}</div>
            </div>
          </Pop>
          {D.sub && (
            <Pop d={R(D.subAt)} from="up" style={{marginTop: 6}}>
              <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 36, color: '#dedede', lineHeight: 1.3}}>{D.sub}</div>
            </Pop>
          )}
          <div style={{display: 'flex', flexDirection: 'column', gap: 16, marginTop: 18}}>
            {D.products.map((p: any, i: number) => (
              <Pop key={i} d={R(p.at)} from="left">
                <div style={{display: 'flex', alignItems: 'flex-start', gap: 20, background: 'rgba(255,255,255,0.05)', border: `3px solid ${accent}`, borderRadius: 26, padding: '16px 22px'}}>
                  <div style={{width: 76, height: 76, borderRadius: 999, background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none'}}>
                    <IconGlyph kind={p.icon ?? 'capsule'} size={44} color="#111" />
                  </div>
                  <div style={{minWidth: 0}}>
                    <div style={{fontFamily: FONT, fontWeight: 800, fontSize: p.size ?? 44, color: accent, lineHeight: 1.25}}>{p.name}</div>
                    <div style={{display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 8}}>
                      {(p.chips ?? []).map((c: any, j: number) => (
                        <Pop key={j} d={R(c.at)} from="up">
                          <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 32, color: '#fff', background: `${accent}2a`, border: `2px solid ${accent}`, borderRadius: 999, padding: '4px 16px', whiteSpace: 'nowrap'}}>{c.t}</div>
                        </Pop>
                      ))}
                    </div>
                  </div>
                </div>
              </Pop>
            ))}
          </div>
          {D.result && (
            <Pop d={R(D.resultAt)} from="up" style={{marginTop: 16, display: 'inline-block'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: 12, background: accent, color: '#111', borderRadius: 16, padding: '8px 20px'}}>
                <IconGlyph kind={D.resultIcon ?? 'muscle'} size={40} color="#111" />
                <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 36, whiteSpace: 'nowrap'}}>{D.result}</div>
              </div>
            </Pop>
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Phương án B (đã duyệt): tên nhóm to phía trên đầu + sản phẩm dạng thanh viên thuốc mỏng sát đáy vùng an toàn; không phóng khung
const GroupB: React.FC<{s: Scene; accent: string}> = ({s, accent}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const D = s.data;
  const dur = Math.round(s.durationSec * fps);
  const out = interpolate(f, [dur - 8, dur], [1, 0], clamp);
  const R = (t: number) => rel(s, t, fps);
  const SHD = '0 0 2px rgba(0,0,0,.6), 0 3px 10px rgba(0,0,0,.6)';
  const shown = (t: number) => f >= R(t);
  return (
    <AbsoluteFill style={{pointerEvents: 'none', opacity: out}}>
      <div style={{position: 'absolute', left: '16%', right: '16%', top: '8.5%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6}}>
        <Pop d={R(D.titleAt)} from="scale">
          <div style={{background: accent, color: '#111', fontFamily: CONDENSED, fontWeight: 800, fontSize: 38, lineHeight: 1.18, padding: '2px 14px', borderRadius: 10}}>{D.tag}</div>
        </Pop>
        <Pop d={R(D.titleAt) + 3} from="up">
          <div style={{fontFamily: CONDENSED, fontWeight: 800, fontSize: 62, color: '#fff', letterSpacing: '0.02em', lineHeight: 1.18, textTransform: 'uppercase', whiteSpace: 'nowrap', textShadow: SHD}}>{D.title}</div>
        </Pop>
        {D.sub && <Pop d={R(D.subAt)} from="up"><div style={{fontFamily: FONT, fontWeight: 700, fontSize: 32, color: '#fff', whiteSpace: 'nowrap', textShadow: SHD}}>{D.sub}</div></Pop>}
      </div>
      <div style={{position: 'absolute', left: '5%', right: '17%', bottom: '25.5%', display: 'flex', flexDirection: 'column', gap: 10}}>
        {D.products.map((p: any, i: number) => (
          <Pop key={i} d={R(p.at)} from="left">
            <div style={{display: 'flex', alignItems: 'center', gap: 14, background: 'rgba(14,14,14,0.82)', backdropFilter: 'blur(6px)', borderRadius: 999, padding: '8px 24px 8px 8px', border: `3px solid ${accent}`}}>
              <div style={{width: 62, height: 62, borderRadius: 999, background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none'}}>
                <IconGlyph kind={p.icon ?? 'capsule'} size={36} color="#111" />
              </div>
              <div style={{minWidth: 0}}>
                <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 34, color: accent, lineHeight: 1.25, whiteSpace: 'nowrap'}}>{p.name}</div>
                <div style={{display: 'flex', gap: 0, minHeight: 30}}>
                  {(p.chips ?? []).map((c: any, j: number) => (
                    <div key={j} style={{fontFamily: FONT, fontWeight: 700, fontSize: 26, color: '#e6e6e6', whiteSpace: 'nowrap', opacity: shown(c.at) ? 1 : 0,
                      transform: `translateY(${shown(c.at) ? 0 : 8}px)`}}>{j > 0 ? ' · ' : ''}{c.t}</div>
                  ))}
                </div>
              </div>
            </div>
          </Pop>
        ))}
        {D.result && (
          <Pop d={R(D.resultAt)} from="up" style={{alignSelf: 'flex-start'}}>
            <div style={{display: 'inline-flex', alignItems: 'center', gap: 10, background: accent, borderRadius: 999, padding: '6px 18px'}}>
              <IconGlyph kind={D.resultIcon ?? 'muscle'} size={32} color="#111" />
              <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 30, color: '#111', whiteSpace: 'nowrap'}}>{D.result}</div>
            </div>
          </Pop>
        )}
      </div>
    </AbsoluteFill>
  );
};

// Phương án A (chủ site chọn): 1 thẻ gọn ở đáy (mép dưới 74,5%), viền cam bên trái; chữ cỡ lớn hơn bản ảnh mẫu ~20%; không phóng khung
const GroupA: React.FC<{s: Scene; accent: string}> = ({s, accent}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const D = s.data;
  const dur = Math.round(s.durationSec * fps);
  const slide = interpolate(f, [0, 9, dur - 9, dur], [1, 0, 0, 1], {...clamp, easing: Easing.bezier(0.3, 0, 0.2, 1)});
  const R = (t: number) => rel(s, t, fps);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: '4%', right: '16.5%', bottom: '25.5%', padding: '20px 26px 22px', borderRadius: 30,
        background: 'rgba(14,14,14,0.82)', backdropFilter: 'blur(6px)', borderLeft: `9px solid ${accent}`, boxShadow: '0 12px 30px rgba(0,0,0,.4)',
        transform: `translateX(${-slide * 110}%)`, opacity: 1 - slide * 0.5}}>
        <Pop d={R(D.titleAt)} from="up">
          <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
            <div style={{background: accent, color: '#111', fontFamily: CONDENSED, fontWeight: 800, fontSize: 40, lineHeight: 1.18, padding: '2px 14px', borderRadius: 10, whiteSpace: 'nowrap'}}>{D.tag}</div>
            <div style={{fontFamily: CONDENSED, fontWeight: 800, fontSize: 60, color: '#fff', letterSpacing: '0.02em', lineHeight: 1.18, textTransform: 'uppercase', whiteSpace: 'nowrap'}}>{D.title}</div>
          </div>
        </Pop>
        {D.sub && <Pop d={R(D.subAt)} from="up"><div style={{fontFamily: FONT, fontWeight: 700, fontSize: 34, color: '#dedede', lineHeight: 1.3}}>{D.sub}</div></Pop>}
        <div style={{display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12}}>
          {D.products.map((p: any, i: number) => (
            <Pop key={i} d={R(p.at)} from="left">
              <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
                <div style={{width: 56, height: 56, borderRadius: 999, background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none'}}>
                  <IconGlyph kind={p.icon ?? 'capsule'} size={34} color="#111" />
                </div>
                <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 41, color: accent, lineHeight: 1.25, whiteSpace: 'nowrap'}}>{p.name}</div>
              </div>
              <div style={{display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 6, marginLeft: 70, minHeight: (p.chips ?? []).length ? 44 : 0}}>
                {(p.chips ?? []).map((c: any, j: number) => (
                  <Pop key={j} d={R(c.at)} from="up">
                    <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 31, color: '#fff', background: `${accent}2e`, border: `2px solid ${accent}`, borderRadius: 999, padding: '2px 14px', whiteSpace: 'nowrap'}}>{c.t}</div>
                  </Pop>
                ))}
              </div>
            </Pop>
          ))}
        </div>
        {D.result && (
          <Pop d={R(D.resultAt)} from="up" style={{marginTop: 12, display: 'inline-block'}}>
            <div style={{display: 'inline-flex', alignItems: 'center', gap: 10, background: accent, borderRadius: 12, padding: '4px 16px'}}>
              <IconGlyph kind={D.resultIcon ?? 'muscle'} size={36} color="#111" />
              <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 34, color: '#111', whiteSpace: 'nowrap'}}>{D.result}</div>
            </div>
          </Pop>
        )}
      </div>
    </AbsoluteFill>
  );
};

const sfxList = (scenes: Scene[], sfx: NonNullable<KineticProps['sfx']>) => {
  if (sfx.cues) return sfx.cues;
  const L: {at: number; file: string; v: number}[] = [];
  const W = (at: number) => { if (sfx.whoosh) L.push({at: at - 0.22, file: sfx.whoosh, v: sfx.vWhoosh ?? 0.35}); }; // đỉnh whoosh trùng điểm chuyển
  for (const s of scenes) {
    if (s.kind === 'blur') W(s.fromSec + s.durationSec / 2);
    if (s.kind === 'slide') {
      W(s.fromSec);
      if (sfx.tick) for (const it of s.items ?? []) L.push({at: it.at, file: sfx.tick, v: sfx.vTick ?? 0.25});
    }
    if (s.kind === 'lockup') for (const r of s.rows ?? []) {
      if (r.big && r.at !== undefined) L.push({at: r.at, file: sfx.pop, v: sfx.vPop ?? 0.3});
      if (r.big2 && r.big2At !== undefined) L.push({at: r.big2At, file: sfx.pop, v: sfx.vPop ?? 0.3});
    }
  }
  for (const a of sfx.whooshAt ?? []) W(a);
  return L.filter((x) => x.at >= 0);
};

const VideoLayer: React.FC<{src: string; fx?: KineticProps['videoFx']}> = ({src, fx}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps;
  let sc = 1, dx = 0, dy = 0, oy = 0.35;
  for (const z of fx ?? []) {
    if (t < z.fromSec || t > z.toSec) continue;
    sc = interpolate(t, [z.fromSec, z.toSec], [z.zoomFrom, z.zoomTo], {...clamp, easing: Easing.bezier(0.3, 0, 0.3, 1)});
    oy = z.originY ?? oy;
    for (const p of z.punchAt ?? []) {
      const k = t - p;
      if (k >= 0 && k < 0.35) { const e = Math.exp(-k / 0.08); sc += 0.06 * e; dx += Math.sin(k * 90) * 10 * e; dy += Math.cos(k * 70) * 6 * e; }
    }
  }
  return <OffthreadVideo src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `translate(${dx}px, ${dy}px) scale(${sc})`, transformOrigin: `50% ${oy * 100}%`}} />;
};

export const TalkKinetic: React.FC<KineticProps> = ({src, accent, scenes, disclaimer, bigFont, slideBg, slideAccent, sfx, scrim = true, safe, disclaimerTop, videoFx, debugRows, bgm}) => {
  const {fps} = useVideoConfig();
  const counter = React.useRef(0);
  counter.current = 0;
  const dbg = {on: !!debugRows, next: () => DEBUG_COLORS[counter.current++ % DEBUG_COLORS.length]};
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <DebugCtx.Provider value={dbg}>
      {!debugRows && <VideoLayer src={src} fx={videoFx} />}
      {scenes.map((s, i) => (
        <Sequence key={i} from={Math.round(s.fromSec * fps)} durationInFrames={Math.round(s.durationSec * fps)} name={`${s.kind} ${i + 1}`}>
          {debugRows && s.kind !== 'lockup' ? null : s.kind === 'stat' ? <Stat s={s} accent={accent} /> : s.kind === 'dose' ? <Dose s={s} accent={accent} /> : s.kind === 'flow' ? <Flow s={s} accent={accent} /> : s.kind === 'list' ? <ListPanel s={s} accent={accent} /> : s.kind === 'groupA' ? <GroupA s={s} accent={accent} /> : s.kind === 'groupB' ? <GroupB s={s} accent={accent} /> : s.kind === 'group' ? <GroupPanel s={s} accent={accent} /> : s.kind === 'crinfo' ? <InfoCreatineLive v={s.data.v} t0={s.fromSec} dur={s.durationSec} at={s.data.at} /> : s.kind === 'slide' ? <Slide s={s} accent={slideAccent ?? accent} bg={slideBg} sans={bigFont === 'sans'} /> : s.kind === 'blur' ? <BlurFlash s={s} /> : <Lockup s={s} accent={accent} sans={bigFont === 'sans'} scrim={scrim} safe={safe} />}
        </Sequence>
      ))}
      {!debugRows && bgm && (
        <Audio src={staticFile(bgm.src)} volume={(f) => {
          const k = bgm.keys;
          if (!k || k.length < 2) return bgm.volume;
          return interpolate(f / fps, k.map((x) => x[0]), k.map((x) => x[1]), clamp);
        }} />
      )}
      {!debugRows && sfx && sfxList(scenes, sfx).map((x, i) => (
        <Sequence key={`sfx${i}`} from={Math.round(x.at * fps)} durationInFrames={Math.round(2.0 * fps)} name={`sfx ${x.file}`}>
          <Audio src={staticFile(x.file)} volume={x.v} />
        </Sequence>
      ))}
      {!debugRows && disclaimer && (
        <div style={{position: 'absolute', left: `${(safe?.left ?? 0.06) * 100}%`, right: `${(safe?.right ?? 0.06) * 100}%`, top: `${(disclaimerTop ?? 0.805) * 100}%`, textAlign: 'center', fontFamily: FONT, fontWeight: 500, fontSize: 25,
          color: 'rgba(255,255,255,0.92)', background: 'rgba(0,0,0,0.45)', borderRadius: 10, padding: '6px 14px', lineHeight: 1.3}}>{disclaimer}</div>
      )}
      </DebugCtx.Provider>
    </AbsoluteFill>
  );
};
