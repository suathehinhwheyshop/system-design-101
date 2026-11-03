import React from 'react';
import {AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import {FONT, CONDENSED} from '../fonts';

// 5 ý tưởng bảng infographic bằng hình cho video Creatine (ảnh tĩnh để duyệt; khi chốt sẽ thêm chuyển động theo lời nói).
// Bảng đặt ở nửa dưới (từ 40% khung) để giữ mặt người nói; nội dung trong vùng an toàn TikTok: x 6–84%, y ≤ 74%.
const OR = '#ED802E';
const INK = '#111';
const GRID = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='72' height='72'%3E%3Cpath d='M0 0H72M0 0V72' stroke='%23ffffff' stroke-opacity='0.06' stroke-width='2'/%3E%3C/svg%3E")`;

// Khung người nói phóng nhẹ ×1,1 neo mép trên → mặt hạ xuống khoảng 1/3 trên màn hình.
// Bảng là thẻ nổi vừa nội dung (~28–30% khung), nền tối trong suốt 86% để vẫn thấy kệ hàng; đáy thẻ ≤ 75,5% (trên vùng caption TikTok).
type Live = {t0: number; dur: number; at: Record<string, number>};
const LiveCtx = React.createContext<Live | null>(null);
// Phần tử hiện đúng lúc được nói (key = tên mốc trong at). Ảnh tĩnh: hiện ngay.
const A: React.FC<{k: string; children: React.ReactNode; from?: 'up' | 'left' | 'scale'; style?: React.CSSProperties; dl?: number}> = ({k, children, from = 'up', style, dl = 0}) => {
  const L = React.useContext(LiveCtx);
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (!L || L.at[k] === undefined) return <div style={style}>{children}</div>;
  const d = Math.max(0, Math.round((L.at[k] + dl - L.t0) * fps));
  const p = spring({frame: f - d, fps, config: {damping: 14, stiffness: 170}});
  if (f < d) return <div style={{...style, opacity: 0}}>{children}</div>;
  const tf = from === 'left' ? `translateX(${-40 * (1 - p)}px)` : from === 'scale' ? `scale(${0.7 + 0.3 * p})` : `translateY(${26 * (1 - p)}px)`;
  return <div style={{...style, opacity: Math.min(1, p * 1.5), transform: tf}}>{children}</div>;
};

// Tiến độ 0→1 từ mốc k trong `sec` giây (ảnh tĩnh: 1)
const useProg = (k: string, sec: number) => {
  const L = React.useContext(LiveCtx);
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (!L || L.at[k] === undefined) return 1;
  return interpolate(f, [(L.at[k] - L.t0) * fps, (L.at[k] - L.t0 + sec) * fps], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.3, 0, 0.2, 1)});
};

const Panel: React.FC<{bg: string; num: string; title: string; children: React.ReactNode; top?: number}> = ({bg, num, title, children, top = 0.455}) => {
  const L = React.useContext(LiveCtx);
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const dur = L ? Math.round(L.dur * fps) : 1;
  // trong video: thẻ trượt lên khi vào, trượt xuống khi ra
  const slide = L ? interpolate(f, [0, 10, dur - 10, dur], [1, 0, 0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.3, 0, 0.2, 1)}) : 0;
  return (
    <AbsoluteFill>
      {!L && <Img src={staticFile(bg)} style={{width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1.1)', transformOrigin: '50% 0%'}} />}
      <div style={{position: 'absolute', left: '3%', right: '3%', top: `${top * 100}%`, padding: '28px 0 30px', borderRadius: 40,
        background: 'rgba(14,14,14,0.86)', backdropFilter: 'blur(6px)', borderTop: `7px solid ${OR}`, boxShadow: '0 18px 40px rgba(0,0,0,.45)',
        transform: `translateY(${slide * 120}%)`, opacity: 1 - slide * 0.6}}>
        <div style={{marginLeft: '4%', marginRight: '14.5%'}}>
          <A k="title" style={{display: 'flex', alignItems: 'center', gap: 20, marginBottom: 22}}>
            <div style={{background: OR, color: INK, fontFamily: CONDENSED, fontWeight: 800, fontSize: 58, lineHeight: 1.18, padding: '2px 20px', borderRadius: 14}}>{num}</div>
            <div style={{fontFamily: CONDENSED, fontWeight: 800, fontSize: 84, color: '#fff', letterSpacing: '0.02em', lineHeight: 1.18, textTransform: 'uppercase', whiteSpace: 'nowrap'}}>{title}</div>
          </A>
          {children}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const T: React.FC<{s?: number; c?: string; w?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({s = 44, c = '#fff', w = 800, children, style}) => (
  <div style={{fontFamily: FONT, fontWeight: w, fontSize: s, color: c, lineHeight: 1.25, ...style}}>{children}</div>
);

// ---- Icon vẽ tay đơn giản ----
const Person: React.FC<{size: number; color: string; kind: 'gym' | 'female' | 'veg'}> = ({size, color, kind}) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <circle cx="50" cy="26" r="14" fill={color} />
    {kind === 'female' ? <path d="M50 42c-14 0-22 10-24 22l-4 26h56l-4-26c-2-12-10-22-24-22z" fill={color} />
      : <path d="M28 92V62c0-12 10-20 22-20s22 8 22 20v30z" fill={color} />}
    {kind === 'gym' && <g fill={color}><rect x="4" y="56" width="10" height="22" rx="3" /><rect x="86" y="56" width="10" height="22" rx="3" /><rect x="12" y="63" width="76" height="8" rx="3" /></g>}
    {kind === 'veg' && <path d="M66 56c14-14 30-10 30-10s4 16-10 30c-8 8-20 8-20 8s-8-20 0-28zM70 78l18-22" fill="#5fd068" stroke="#0d0d0d" strokeWidth="3" />}
  </svg>
);
const Scoop: React.FC<{size: number}> = ({size}) => (
  <svg width={size} height={size} viewBox="0 0 120 100">
    <path d="M10 40h70l-8 42a10 10 0 0 1-10 8H28a10 10 0 0 1-10-8z" fill={OR} />
    <rect x="78" y="42" width="38" height="12" rx="6" fill={OR} />
    <path d="M18 40c4-12 16-18 26-18s20 6 26 18z" fill="#fff" opacity="0.92" />
  </svg>
);

// 1. Dành cho ai? — 3 thẻ chân dung
const I1 = () => (
  <Panel bg="cr/bg8.jpg" num="01" title="Dành cho ai?">
    <div style={{display: 'flex', gap: 22}}>
      {[{k: 'gym' as const, t: 'Người tập\nthể thao'}, {k: 'female' as const, t: 'Nam & nữ'}, {k: 'veg' as const, t: 'Người\năn chay'}].map((p, i) => (
        <A key={i} k={'c' + i} from="scale" style={{flex: 1, display: 'flex'}}>
        <div style={{flex: 1, background: '#1b1b1b', border: `3px solid ${OR}`, borderRadius: 28, padding: '22px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12}}>
          <div style={{width: 128, height: 128, borderRadius: 999, background: `${OR}22`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Person size={100} color={OR} kind={p.k} /></div>
          <T s={36} style={{textAlign: 'center', whiteSpace: 'pre-line'}}>{p.t}</T>
        </div>
        </A>
      ))}
    </div>
    <A k="badge" from="left" style={{marginTop: 26, width: 'fit-content'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 16, background: OR, borderRadius: 18, padding: '12px 22px'}}>
        <T s={34} c={INK}>Tối ưu hiệu suất & phát triển cơ</T>
      </div>
    </A>
  </Panel>
);

// 2. Cách dùng — muỗng 5 g + lịch 7 ngày đều đặn
const I2 = () => (
  <Panel bg="cr/bg21.jpg" num="02" title="Cách dùng">
    <div style={{display: 'flex', alignItems: 'center', gap: 30}}>
      <A k="dose" from="scale"><Scoop size={160} /></A>
      <div>
        <A k="dose" from="scale"><div style={{fontFamily: CONDENSED, fontWeight: 800, fontSize: 130, color: OR, lineHeight: 1.05}}>5 G</div></A>
        <A k="dose" dl={0.15}><T s={42} w={700}>mỗi ngày · 1 muỗng</T></A>
        <A k="any"><T s={32} w={700} c="#dedede">có tập hay nghỉ đều dùng</T></A>
      </div>
    </div>
    <div style={{display: 'flex', gap: 8, marginTop: 20}}>
      {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((d, i) => {
        const gym = [0, 2, 4].includes(i);
        return (
          <A key={d} k="cal" dl={i * 0.12} from="scale" style={{flex: 1, minWidth: 0, display: 'flex'}}>
          <div style={{flex: 1, minWidth: 0, borderRadius: 16, background: OR, padding: '10px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4}}>
            <T s={28} c={INK}>{d}</T>
            <svg width="40" height="40" viewBox="0 0 24 24"><path d="M4 12l5 5L20 6" stroke={INK} strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
            <T s={20} c={INK} w={700} style={{whiteSpace: 'nowrap'}}>{gym ? 'có tập' : 'nghỉ'}</T>
          </div>
          </A>
        );
      })}
    </div>
  </Panel>
);

// 3. Uống lúc nào? — trục thời gian trong ngày
const I3 = () => {
  const marks = [{x: 9, t: 'Sáng', on: false}, {x: 35, t: 'Bữa phụ', on: true}, {x: 61, t: 'Tập', on: false}, {x: 84, t: 'Sau tập', on: true}];
  return (
    <Panel bg="cr/bg28.jpg" num="03" title="Uống lúc nào?">
      <div style={{position: 'relative', height: 250, marginTop: 0}}>
        <div style={{position: 'absolute', left: 0, right: 0, top: 120, height: 10, borderRadius: 5, background: 'linear-gradient(90deg, #3a3a3a, #555)'}} />
        {marks.map((m, i) => (
          <div key={i} style={{position: 'absolute', left: `${m.x}%`, top: 0, transform: 'translateX(-50%)'}}>
          <A k={'m' + i} from="scale" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10}}>
            <div style={{height: 64, display: 'flex', alignItems: 'flex-end'}}>
              {m.on && <div style={{background: OR, color: INK, fontFamily: FONT, fontWeight: 800, fontSize: 28, padding: '4px 14px', borderRadius: 999, whiteSpace: 'nowrap'}}>UỐNG ✓</div>}
            </div>
            <div style={{width: m.on ? 76 : 50, height: m.on ? 76 : 50, borderRadius: 999, background: m.on ? OR : '#2a2a2a', border: `4px solid ${m.on ? '#fff' : '#555'}`, marginTop: m.on ? 0 : 13}} />
            <T s={32} c={m.on ? '#fff' : '#c4c4c4'} style={{whiteSpace: 'nowrap'}}>{m.t}</T>
          </A>
          </div>
        ))}
      </div>
      <A k="tip" from="left" style={{width: 'fit-content'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 14, background: '#1b1b1b', border: `3px solid ${OR}`, borderRadius: 18, padding: '12px 22px'}}>
        <T s={38}>Uống cùng bữa → <span style={{color: OR}}>hấp thu tốt hơn</span></T>
      </div>
      </A>
    </Panel>
  );
};

// 4. Cần loading? — thanh tiến độ tuần 1 → 4 tới mức bão hoà
const I4 = () => {
  const fill = useProg('bar', 2.6);
  return (
  <Panel bg="cr/bg37.jpg" num="04" title="Cần loading?">
    <A k="no" from="left" style={{display: 'flex', alignItems: 'center', gap: 16, marginBottom: 26}}>
      <div style={{width: 64, height: 64, borderRadius: 999, background: OR, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none'}}>
        <svg width="34" height="34" viewBox="0 0 100 100"><circle cx="50" cy="20" r="10" fill={INK} /><rect x="41" y="38" width="18" height="50" rx="8" fill={INK} /></svg>
      </div>
      <div><T s={46}>Không bắt buộc</T><T s={36} w={700} c={OR}>chỉ cần dùng đều mỗi ngày</T></div>
    </A>
    <A k="daily"><T s={34} w={700} c="#d2d2d2">Mức creatine trong cơ</T></A>
    <div style={{position: 'relative', height: 74, borderRadius: 37, background: '#262626', marginTop: 12, overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${96 * fill}%`, borderRadius: 37, background: `linear-gradient(90deg, ${OR}55, ${OR})`}} />
      <div style={{position: 'absolute', right: 40, top: 0, bottom: 0, display: 'flex', alignItems: 'center', opacity: fill > 0.95 ? 1 : 0}}><T s={34} c={INK}>BÃO HOÀ</T></div>
    </div>
    <div style={{display: 'flex', justifyContent: 'space-between', marginTop: 12}}>
      {['Tuần 1', 'Tuần 2', 'Tuần 3', 'Tuần 4'].map((w, i) => <T key={w} s={32} c={i >= 2 && fill >= (i + 0.6) / 4 ? OR : '#c4c4c4'}>{w}</T>)}
    </div>
    <A k="tip"><T s={38} style={{marginTop: 22}}>→ 3–4 tuần: phát huy hiệu quả</T></A>
  </Panel>
  );
};

// 5. Có giữ nước? — so sánh tế bào cơ ✓ và dưới da ✗
const I5 = () => (
  <Panel bg="cr/bg48.jpg" num="05" title="Có giữ nước?">
    <div style={{display: 'flex', gap: 22}}>
      {[{ok: true, t: 'Trong tế bào cơ', d: 'Cơ căng, đầy hơn'}, {ok: false, t: 'Dưới da', d: 'Không gây phù'}].map((c, i) => (
        <A key={i} k={c.ok ? 'ok' : 'no'} from="scale" style={{flex: 1, display: 'flex'}}>
        <div style={{flex: 1, background: c.ok ? `${OR}1f` : '#1b1b1b', border: `3px solid ${c.ok ? OR : '#555'}`, borderRadius: 28, padding: '22px 18px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12}}>
          <svg width="190" height="150" viewBox="0 0 190 150">
            {c.ok ? (
              <g>
                {[0, 1, 2].map((k) => <ellipse key={k} cx={95} cy={35 + k * 40} rx={80} ry={17} fill="#c9563a" stroke="#ffb08f" strokeWidth="3" />)}
                {[[50, 35], [120, 35], [80, 75], [140, 75], [60, 115], [125, 115]].map(([x, y], k) => <path key={k} d={`M${x} ${y - 9}c-6 8-6 11-6 13a6 6 0 0 0 12 0c0-2 0-5-6-13z`} fill="#6fc3ff" />)}
              </g>
            ) : (
              <g>
                <rect x="10" y="20" width="170" height="30" rx="8" fill="#e7b89a" /><rect x="10" y="54" width="170" height="40" rx="8" fill="#f2d3a8" opacity="0.6" />
                <rect x="10" y="98" width="170" height="40" rx="8" fill="#c9563a" opacity="0.7" />
                <path d="M95 60l40 30M135 60l-40 30" stroke="#ff5a4f" strokeWidth="9" strokeLinecap="round" />
              </g>
            )}
          </svg>
          <div style={{width: 60, height: 60, borderRadius: 999, background: c.ok ? OR : '#3a1a1a', border: c.ok ? 'none' : '4px solid #ff5a4f', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <svg width="32" height="32" viewBox="0 0 100 100">{c.ok ? <path d="M18 52l22 22 44-46" stroke={INK} strokeWidth="14" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              : <path d="M24 24l52 52M76 24L24 76" stroke="#ff5a4f" strokeWidth="14" strokeLinecap="round" />}</svg>
          </div>
          <T s={38} style={{textAlign: 'center'}}>{c.t}</T>
          <T s={30} w={600} c="#d2d2d2" style={{textAlign: 'center'}}>{c.d}</T>
        </div>
        </A>
      ))}
    </div>
  </Panel>
);

const V = [I1, I2, I3, I4, I5];
// Dùng trong video: chỉ vẽ thẻ (nền là video đang chạy), các phần hiện theo mốc lời nói
export const InfoCreatineLive: React.FC<{v: number; t0: number; dur: number; at: Record<string, number>}> = ({v, t0, dur, at}) => {
  const C = V[(v - 1) % V.length];
  return <LiveCtx.Provider value={{t0, dur, at}}><C /></LiveCtx.Provider>;
};
export const InfoCreatine: React.FC<{v: number; guides?: boolean}> = ({v, guides}) => {
  const C = V[(v - 1) % V.length];
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <C />
      {guides && (
        <AbsoluteFill>
          <div style={{position: 'absolute', left: 0, right: 0, top: '74%', height: 3, background: 'cyan'}} />
          <div style={{position: 'absolute', left: '84%', top: '35%', bottom: '15%', width: 3, background: 'cyan'}} />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
