import React from 'react';
import {Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';

const ROT = [-4, 3, -2, 4];
const OFF = [[-14, -10], [16, 4], [-8, 14], [10, -4]];

// Xấp ảnh số bước: hiện lần lượt, phóng 92%→100%, nghiêng so le
// Kiểu 'cascade' (giống mẫu v2): ảnh nhỏ bật lần lượt, so le trái/phải, không nghiêng, không làm nhòe nền
const CASCADE = [{x: 215, y: 560, w: 330}, {x: 505, y: 680, w: 330}, {x: 235, y: 850, w: 370}, {x: 500, y: 975, w: 330}];

export const StepCards: React.FC<{images: string[]; durationInFrames: number; gapSec?: number; layout?: 'stack' | 'cascade'}> = ({images, durationInFrames, gapSec = 2.2, layout = 'stack'}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const out = interpolate(frame, [durationInFrames - 15, durationInFrames], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <>
      {images.map((src, k) => {
        const p = spring({frame: frame - Math.round((layout === 'cascade' ? k * gapSec : 0.5 + k * gapSec) * fps), fps, config: {damping: 200}, durationInFrames: 12});
        if (p <= 0) return null;
        if (layout === 'cascade') {
          const c = CASCADE[k % 4];
          return (
            <Img key={k} src={staticFile(src)} style={{position: 'absolute', width: c.w, left: c.x, top: c.y, borderRadius: 16,
              boxShadow: '0 6px 24px rgba(0,0,0,0.45)', opacity: p * out, transform: `translate(-50%, -50%) scale(${0.85 + 0.15 * p})`}} />
          );
        }
        return (
          <Img key={k} src={staticFile(src)} style={{position: 'absolute', width: 540, left: 360 + OFF[k % 4][0], top: 830 + OFF[k % 4][1],
            borderRadius: 28, boxShadow: '0 8px 32px rgba(0,0,0,0.5)', opacity: p * out,
            transform: `translate(-50%, -50%) scale(${0.92 + 0.08 * p}) rotate(${ROT[k % 4]}deg)`}} />
        );
      })}
    </>
  );
};
