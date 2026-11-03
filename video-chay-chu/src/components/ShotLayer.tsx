import React from 'react';
import {AbsoluteFill, Easing, interpolate, OffthreadVideo, staticFile, useCurrentFrame} from 'remotion';

export type Transition = {type: 'dissolve' | 'frame'; durSec: number};
const E = Easing.bezier(0.65, 0, 0.35, 1);
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// 1 cảnh, kèm chuyển cảnh vào (inT) và ra (outT). Hai cảnh chồng nhau đúng bằng thời lượng chuyển cảnh.
// 'frame': cảnh cũ thu nhỏ vào khung viền trắng rồi trượt sang trái, cảnh mới trong khung trượt từ phải vào rồi phóng to.
export const ShotLayer: React.FC<{src: string; startFrom: number; muted: boolean; dur: number; inT?: Transition; outT?: Transition; fps: number}> =
  ({src, startFrom, muted, dur, inT, outT, fps}) => {
    const f = useCurrentFrame();
    const video = <OffthreadVideo src={staticFile(src)} startFrom={startFrom} muted={muted} style={{width: '100%', height: '100%', objectFit: 'cover'}} />;
    let opacity = 1, scale = 1, x = 0, border = 0, bg = false;
    if (inT) {
      const p = f / (inT.durSec * fps);
      if (p < 1) {
        if (inT.type === 'dissolve') opacity = interpolate(p, [0, 1], [0, 1], {...clamp, easing: E});
        else {
          x = interpolate(p, [0, 0.6], [108, 0], {...clamp, easing: E});
          scale = interpolate(p, [0.6, 1], [0.8, 1], {...clamp, easing: E});
          border = interpolate(p, [0.7, 1], [1, 0], clamp);
        }
      }
    }
    if (outT && outT.type === 'frame') {
      const q = (f - (dur - outT.durSec * fps)) / (outT.durSec * fps);
      if (q > 0) {
        scale = interpolate(q, [0, 0.4], [1, 0.8], {...clamp, easing: E});
        x = interpolate(q, [0.4, 1], [0, -108], {...clamp, easing: E});
        border = interpolate(q, [0, 0.25], [0, 1], clamp);
        bg = true;
      }
    }
    return (
      <AbsoluteFill style={{opacity}}>
        {bg && <AbsoluteFill style={{filter: 'blur(14px) brightness(0.85)', transform: 'scale(1.1)'}}>{video}</AbsoluteFill>}
        <AbsoluteFill style={{transform: `translateX(${x}%) scale(${scale})`, boxShadow: border ? `0 0 0 ${14 * border}px #fff, 0 10px 40px rgba(0,0,0,${0.45 * border})` : undefined, overflow: 'hidden'}}>
          {video}
        </AbsoluteFill>
      </AbsoluteFill>
    );
  };
