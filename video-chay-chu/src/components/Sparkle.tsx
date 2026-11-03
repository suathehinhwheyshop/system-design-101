import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';

// Tia sáng nhỏ cạnh từ khóa (5 nét toả ra), bật lên rồi nhấp nháy nhẹ
export const Sparkle: React.FC<{atFrame: number; size?: number; color?: string}> = ({atFrame, size = 46, color = '#fff'}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - atFrame, fps, config: {damping: 12, stiffness: 180}, durationInFrames: 14});
  if (frame < atFrame) return null;
  const tw = 0.85 + 0.15 * Math.sin((frame - atFrame) / 4);
  const rays = [-80, -50, -20, 10, 40];
  return (
    <svg width={size} height={size} viewBox="-20 -20 40 40" style={{position: 'absolute', right: -size * 0.85, top: -size * 0.75,
      opacity: interpolate(p, [0, 0.3], [0, 1], {extrapolateRight: 'clamp'}) * tw, transform: `scale(${0.5 + 0.5 * p})`, overflow: 'visible'}}>
      {rays.map((a, i) => {
        const r = (a * Math.PI) / 180, r1 = 7 + 3 * p, r2 = r1 + (i % 2 ? 6 : 9);
        return <line key={i} x1={Math.cos(r) * r1 - 8} y1={Math.sin(r) * r1 + 8} x2={Math.cos(r) * r2 - 8} y2={Math.sin(r) * r2 + 8}
          stroke={color} strokeWidth={2.6} strokeLinecap="round" style={{filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.6))'}} />;
      })}
    </svg>
  );
};
