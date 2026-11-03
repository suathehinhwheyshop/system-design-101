import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {FONT, CONDENSED, HAND} from '../fonts';

// 10 mẫu slide thông tin (đoạn "Magie liên quan đến nhiều chức năng") cho video WheyShop.
// Ảnh tĩnh ở trạng thái đã hiện đủ; khi chọn mẫu sẽ thêm chuyển động (ý hiện theo lời nói).
// Mọi mẫu giữ vùng an toàn TikTok: nội dung x 8%–84%, y 8%–74%; ý liệt kê căn lề trái.
const OR = '#ED802E';
const KICK = 'Magie liên quan đến';
const ITEMS = ['Chức năng cơ', 'Thần kinh', 'Tạo năng lượng', 'Nhịp tim bình thường'];
const SH = '0 3px 10px rgba(0,0,0,.55), 0 0 2px rgba(0,0,0,.6)';

export const IconSvg: React.FC<{i: number; size: number; color?: string}> = ({i, size, color = '#fff'}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{flex: 'none'}}>
    {i === 0 && ( // tạ: chức năng cơ
      <g fill={color}><rect x="8" y="34" width="12" height="32" rx="3" /><rect x="22" y="26" width="12" height="48" rx="3" /><rect x="34" y="45" width="32" height="10" rx="3" />
        <rect x="66" y="26" width="12" height="48" rx="3" /><rect x="80" y="34" width="12" height="32" rx="3" /></g>
    )}
    {i === 1 && ( // tế bào thần kinh
      <g stroke={color} strokeWidth="6" strokeLinecap="round" fill="none"><circle cx="50" cy="50" r="14" fill={color} />
        <path d="M50 36V12M62 44l20-14M64 58l22 10M50 64v24M38 58l-22 12M36 44L16 30" /></g>
    )}
    {i === 2 && <path d="M58 6L18 56h26l-6 38 44-54H54z" fill={color} />}
    {i === 3 && <path d="M50 88S10 62 10 36a20 20 0 0 1 40-6 20 20 0 0 1 40 6c0 26-40 52-40 52z" fill={color} />}
    {i === 4 && ( // mặt trời: vitamin D3
      <g fill={color} stroke={color} strokeWidth="7" strokeLinecap="round"><circle cx="50" cy="50" r="17" stroke="none" />
        <path d="M50 8v12M50 80v12M8 50h12M80 50h12M20 20l9 9M71 71l9 9M80 20l-9 9M29 71l-9 9" /></g>
    )}
    {i === 5 && ( // xương
      <g fill={color} transform="rotate(-35 50 50)"><rect x="24" y="42" width="52" height="16" rx="6" />
        <circle cx="22" cy="40" r="11" /><circle cx="22" cy="60" r="11" /><circle cx="78" cy="40" r="11" /><circle cx="78" cy="60" r="11" /></g>
    )}
    {i === 6 && <path d="M50 8C38 30 22 46 22 64a28 28 0 0 0 56 0C78 46 62 30 50 8z" fill={color} />}
    {i === 7 && ( // viên nang
      <g><rect x="12" y="32" width="76" height="36" rx="18" fill="none" stroke={color} strokeWidth="7" /><path d="M50 32h20a18 18 0 0 1 0 36H50z" fill={color} /></g>
    )}
  </svg>
);

const Bg: React.FC<{blur?: number; dim?: number}> = ({blur = 0, dim = 0}) => (
  <AbsoluteFill>
    <Img src={staticFile('ws/bg9.png')} style={{width: '100%', height: '100%', objectFit: 'cover', filter: blur ? `blur(${blur}px)` : undefined, transform: blur ? 'scale(1.08)' : undefined}} />
    {dim > 0 && <AbsoluteFill style={{background: `rgba(0,0,0,${dim})`}} />}
  </AbsoluteFill>
);

const Title: React.FC<{color?: string; kick?: string; top?: string; left?: string; align?: 'left' | 'center'}> = ({color = '#fff', kick = OR, top = '12%', left = '10%', align = 'left'}) => (
  <div style={{position: 'absolute', top, left, right: align === 'center' ? left : undefined, textAlign: align}}>
    <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 44, color: kick, letterSpacing: '0.02em'}}>{KICK}</div>
    <div style={{fontFamily: CONDENSED, fontWeight: 800, fontSize: 120, color, lineHeight: 1.18, letterSpacing: '0.02em', textTransform: 'uppercase'}}>4 chức năng</div>
  </div>
);

// 1. Thẻ checklist trắng trên nền video mờ
const V1 = () => (
  <AbsoluteFill>
    <Bg blur={18} dim={0.25} />
    <div style={{position: 'absolute', left: '10%', right: '18%', top: '17%', background: '#fff', borderRadius: 36, padding: '54px 50px', boxShadow: '0 24px 60px rgba(0,0,0,.45)'}}>
      <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 40, color: OR}}>{KICK}</div>
      <div style={{fontFamily: CONDENSED, fontWeight: 800, fontSize: 104, color: '#111', lineHeight: 1.18, textTransform: 'uppercase'}}>4 chức năng</div>
      <div style={{height: 2, background: '#eee', margin: '24px 0 30px'}} />
      {ITEMS.map((t, i) => (
        <div key={i} style={{display: 'flex', alignItems: 'center', gap: 24, marginBottom: 30}}>
          <div style={{width: 64, height: 64, borderRadius: 999, background: OR, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none'}}>
            <svg width="36" height="36" viewBox="0 0 24 24"><path d="M4 12l5 5L20 6" stroke="#fff" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
          <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 52, color: '#1a1a1a'}}>{t}</div>
        </div>
      ))}
    </div>
  </AbsoluteFill>
);

// 2. Lưới icon 2×2 nền tối
const V2 = () => (
  <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 30%, #2a1a0e 0%, #0d0d0d 60%)'}}>
    <Title align="center" left="8%" />
    <div style={{position: 'absolute', left: '16%', right: '16%', top: '33%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28}}>
      {ITEMS.map((t, i) => (
        <div key={i} style={{background: '#1a1a1a', border: `3px solid ${OR}`, borderRadius: 28, height: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22}}>
          <IconSvg i={i} size={110} color={OR} />
          <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 40, color: '#fff', textAlign: 'center', lineHeight: 1.25, padding: '0 16px'}}>{t}</div>
        </div>
      ))}
    </div>
  </AbsoluteFill>
);

// 3. Chú thích chỉ vào cơ thể người nói (giữ nguyên video, không che mặt)
const Callout: React.FC<{x: number; y: number; tx: number; ty: number; t: string; i: number; side: 'l' | 'r'}> = ({x, y, tx, ty, t, i, side}) => (
  <>
    <svg width="1080" height="1920" style={{position: 'absolute', left: 0, top: 0}}>
      <line x1={x} y1={y} x2={tx} y2={ty} stroke="#fff" strokeWidth="4" strokeDasharray="10 8" />
      <circle cx={x} cy={y} r="14" fill={OR} stroke="#fff" strokeWidth="5" />
    </svg>
    <div style={{position: 'absolute', top: ty - 40, ...(side === 'l' ? {right: 1080 - tx} : {left: tx}), display: 'flex', alignItems: 'center', gap: 14,
      background: 'rgba(15,15,15,.82)', border: `3px solid ${OR}`, borderRadius: 18, padding: '12px 22px'}}>
      <IconSvg i={i} size={46} color={OR} />
      <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 38, color: '#fff', whiteSpace: 'pre-line', lineHeight: 1.25}}>{t}</div>
    </div>
  </>
);
const V3 = () => (
  <AbsoluteFill>
    <Bg />
    <Title top="9%" left="8%" />
    <Callout x={310} y={1080} tx={250} ty={1240} t={'Chức năng\ncơ'} i={0} side="l" />
    <Callout x={540} y={560} tx={300} ty={560} t={'Thần\nkinh'} i={1} side="l" />
    <Callout x={600} y={900} tx={630} ty={790} t={'Tạo năng\nlượng'} i={2} side="r" />
    <Callout x={470} y={860} tx={180} ty={930} t={'Nhịp\ntim'} i={3} side="l" />
  </AbsoluteFill>
);

// 4. Sơ đồ trung tâm: chai ở giữa, 4 ý toả ra
const V4 = () => {
  const pos = [[305, 640], [775, 640], [305, 1250], [775, 1250]];
  return (
    <AbsoluteFill style={{background: '#101010'}}>
      <Title align="center" left="8%" top="9%" />
      <svg width="1080" height="1920" style={{position: 'absolute'}}>
        {pos.map(([x, y], i) => <line key={i} x1={540} y1={945} x2={x} y2={y} stroke={OR} strokeWidth="4" strokeDasharray="12 10" opacity="0.8" />)}
      </svg>
      <div style={{position: 'absolute', left: 540 - 170, top: 945 - 170, width: 340, height: 340, borderRadius: 999, overflow: 'hidden', border: `8px solid ${OR}`, boxShadow: `0 0 60px ${OR}55`}}>
        <Img src={staticFile('ws/chai-net.png')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      </div>
      {pos.map(([x, y], i) => (
        <div key={i} style={{position: 'absolute', left: x - 125, top: y - 105, width: 250, height: 210, borderRadius: 30, background: '#1c1c1c', border: '3px solid #333',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12}}>
          <IconSvg i={i} size={70} color={OR} />
          <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 34, color: '#fff', textAlign: 'center', lineHeight: 1.25}}>{ITEMS[i]}</div>
        </div>
      ))}
    </AbsoluteFill>
  );
};

// 5. Con số lớn "300+" + 4 nhãn
const V5 = () => (
  <AbsoluteFill>
    <Bg blur={16} dim={0.55} />
    <div style={{position: 'absolute', left: '16%', right: '16%', top: '14%', textAlign: 'center'}}>
      <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 46, color: '#fff', textShadow: SH}}>Magie tham gia</div>
      <div style={{fontFamily: CONDENSED, fontWeight: 800, fontSize: 300, color: OR, lineHeight: 1.05, textShadow: `0 0 40px ${OR}66`}}>300+</div>
      <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 50, color: '#fff', textShadow: SH}}>phản ứng trong cơ thể</div>
      <div style={{fontFamily: FONT, fontWeight: 500, fontSize: 40, color: '#ddd', marginTop: 50}}>liên quan đến</div>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 22, marginTop: 26, paddingLeft: 70}}>
        {ITEMS.map((t, i) => (
          <div key={i} style={{display: 'flex', alignItems: 'center', gap: 18, background: 'rgba(237,128,46,.16)', border: `2px solid ${OR}`, borderRadius: 999, padding: '10px 30px 10px 14px'}}>
            <IconSvg i={i} size={48} color={OR} />
            <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 42, color: '#fff'}}>{t}</div>
          </div>
        ))}
      </div>
    </div>
  </AbsoluteFill>
);

// 6. Chia đôi màn hình: trên video (người nói), dưới bảng thông tin
const V6 = () => (
  <AbsoluteFill style={{background: '#0d0d0d'}}>
    <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: '44%', overflow: 'hidden'}}>
      <Img src={staticFile('ws/bg9.png')} style={{width: '100%', position: 'absolute', top: -120}} />
    </div>
    <div style={{position: 'absolute', left: 0, right: 0, top: '44%', height: 10, background: OR}} />
    <div style={{position: 'absolute', left: '9%', right: '18%', top: '47.5%'}}>
      <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 40, color: OR}}>{KICK}</div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 18, marginTop: 20}}>
        {ITEMS.map((t, i) => (
          <div key={i} style={{display: 'flex', alignItems: 'center', gap: 24}}>
            <div style={{fontFamily: CONDENSED, fontWeight: 800, fontSize: 64, color: OR, width: 80, lineHeight: 1.18}}>{String(i + 1).padStart(2, '0')}</div>
            <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 50, color: '#fff'}}>{t}</div>
          </div>
        ))}
      </div>
    </div>
  </AbsoluteFill>
);

// 7. Giấy note dán tường, chữ viết tay
const V7 = () => {
  const notes = [{c: '#FFE36E', r: -4, x: 175, y: 600}, {c: '#FFC48A', r: 3, x: 565, y: 640}, {c: '#FFFFFF', r: 2, x: 185, y: 1000}, {c: '#FFD9B8', r: -3, x: 565, y: 1040}];
  return (
    <AbsoluteFill style={{background: '#EFE6D6', backgroundImage: 'radial-gradient(#d9ccb4 2px, transparent 2px)', backgroundSize: '34px 34px'}}>
      <div style={{position: 'absolute', top: '11%', left: '10%'}}>
        <div style={{fontFamily: HAND, fontSize: 58, color: '#7a6a52'}}>{KICK}...</div>
        <div style={{fontFamily: CONDENSED, fontWeight: 800, fontSize: 116, color: '#1a1a1a', lineHeight: 1.18, textTransform: 'uppercase'}}>4 chức năng</div>
        <svg width="420" height="30"><path d="M5 18 C120 2, 260 30, 415 10" stroke={OR} strokeWidth="9" fill="none" strokeLinecap="round" /></svg>
      </div>
      {notes.map((n, i) => (
        <div key={i} style={{position: 'absolute', left: n.x, top: n.y, width: 320, height: 320, background: n.c, transform: `rotate(${n.r}deg)`, boxShadow: '0 14px 26px rgba(0,0,0,.18)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24}}>
          <div style={{position: 'absolute', top: -14, width: 34, height: 34, borderRadius: 999, background: i % 2 ? '#d63b2f' : '#2f6fd6', boxShadow: '0 3px 5px rgba(0,0,0,.3)'}} />
          <IconSvg i={i} size={76} color="#2b2b2b" />
          <div style={{fontFamily: HAND, fontSize: 52, color: '#222', textAlign: 'center', lineHeight: 1.15, marginTop: 14}}>{ITEMS[i]}</div>
        </div>
      ))}
    </AbsoluteFill>
  );
};

// 8. Dòng thời gian dọc (các nút nối nhau)
const V8 = () => (
  <AbsoluteFill>
    <Bg blur={20} dim={0.62} />
    <Title top="11%" left="10%" />
    <div style={{position: 'absolute', left: 160, top: 690, width: 6, height: 640, background: `linear-gradient(${OR}, ${OR}33)`}} />
    {ITEMS.map((t, i) => (
      <div key={i} style={{position: 'absolute', left: 124, top: 660 + i * 190, display: 'flex', alignItems: 'center', gap: 34}}>
        <div style={{width: 78, height: 78, borderRadius: 999, background: '#111', border: `5px solid ${OR}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <IconSvg i={i} size={40} color={OR} />
        </div>
        <div>
          <div style={{fontFamily: CONDENSED, fontWeight: 800, fontSize: 34, color: OR, letterSpacing: '0.08em'}}>{String(i + 1).padStart(2, '0')}</div>
          <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 54, color: '#fff', lineHeight: 1.2}}>{t}</div>
        </div>
      </div>
    ))}
  </AbsoluteFill>
);

// 9. Thẻ kính mờ (glassmorphism) trên video
const V9 = () => (
  <AbsoluteFill>
    <Bg blur={6} dim={0.2} />
    <div style={{position: 'absolute', left: '10%', right: '18%', top: '13%', padding: '30px 36px', borderRadius: 30, background: 'rgba(255,255,255,.14)',
      border: '2px solid rgba(255,255,255,.35)', backdropFilter: 'blur(18px)'}}>
      <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 42, color: '#fff'}}>{KICK}</div>
      <div style={{fontFamily: CONDENSED, fontWeight: 800, fontSize: 106, color: OR, lineHeight: 1.18, textTransform: 'uppercase', textShadow: SH}}>4 chức năng</div>
    </div>
    <div style={{position: 'absolute', left: '10%', right: '18%', top: '34%', display: 'flex', flexDirection: 'column', gap: 24}}>
      {ITEMS.map((t, i) => (
        <div key={i} style={{display: 'flex', alignItems: 'center', gap: 26, padding: '22px 30px', borderRadius: 26, background: 'rgba(255,255,255,.13)',
          border: '2px solid rgba(255,255,255,.3)', backdropFilter: 'blur(16px)'}}>
          <div style={{width: 74, height: 74, borderRadius: 20, background: OR, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none'}}><IconSvg i={i} size={46} /></div>
          <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 48, color: '#fff', textShadow: SH}}>{t}</div>
        </div>
      ))}
    </div>
  </AbsoluteFill>
);

// 10. Poster khối màu cam kiểu tạp chí
const V10 = () => (
  <AbsoluteFill style={{background: OR}}>
    <div style={{position: 'absolute', right: -60, top: 120, fontFamily: CONDENSED, fontWeight: 800, fontSize: 460, color: 'rgba(0,0,0,.08)', lineHeight: 1}}>Mg</div>
    <div style={{position: 'absolute', left: '9%', top: '11%'}}>
      <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 44, color: '#111'}}>{KICK.toUpperCase()}</div>
      <div style={{fontFamily: CONDENSED, fontWeight: 800, fontSize: 150, color: '#fff', lineHeight: 1.18, textTransform: 'uppercase'}}>4 chức</div>
      <div style={{fontFamily: CONDENSED, fontWeight: 800, fontSize: 150, color: '#fff', lineHeight: 1.18, textTransform: 'uppercase'}}>năng</div>
    </div>
    <div style={{position: 'absolute', left: '9%', right: '18%', top: '43%', display: 'flex', flexDirection: 'column', gap: 0}}>
      {ITEMS.map((t, i) => (
        <div key={i} style={{display: 'flex', alignItems: 'baseline', gap: 26, borderTop: '4px solid #111', padding: '18px 0'}}>
          <div style={{fontFamily: CONDENSED, fontWeight: 800, fontSize: 72, color: '#111', width: 90, lineHeight: 1.18}}>{String(i + 1).padStart(2, '0')}</div>
          <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 52, color: '#111', lineHeight: 1.2}}>{t}</div>
        </div>
      ))}
    </div>
    <Img src={staticFile('ws/chai-net.png')} style={{position: 'absolute', right: '17%', top: '9%', width: 210, borderRadius: 16, border: '8px solid #fff', transform: 'rotate(6deg)', boxShadow: '0 14px 30px rgba(0,0,0,.3)'}} />
  </AbsoluteFill>
);

const VARIANTS = [V1, V2, V3, V4, V5, V6, V7, V8, V9, V10];

export const InfoStyles: React.FC<{v: number; guides?: boolean}> = ({v, guides}) => {
  const C = VARIANTS[(v - 1) % VARIANTS.length];
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <C />
      {guides && ( // vạch vùng an toàn TikTok để soát
        <AbsoluteFill style={{pointerEvents: 'none'}}>
          <div style={{position: 'absolute', left: 0, right: 0, top: '74%', height: 3, background: 'cyan'}} />
          <div style={{position: 'absolute', left: '84%', top: '35%', bottom: '15%', width: 3, background: 'cyan'}} />
          <div style={{position: 'absolute', left: 0, right: 0, top: '7%', height: 3, background: 'cyan'}} />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
