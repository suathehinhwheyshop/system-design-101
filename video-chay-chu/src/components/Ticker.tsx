import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';

export const Ticker: React.FC<{text: string; speedPxPerSec: number; style?: React.CSSProperties}> = ({text, speedPxPerSec, style}) => {
  const frame = useCurrentFrame();
  const {fps, width} = useVideoConfig();
  const x = -(((frame / fps) * speedPxPerSec) % (width / 2));
  return (
    <div style={{position: 'absolute', bottom: '6%', left: 0, width: '200%', display: 'flex', transform: `translateX(${x}px)`, ...style}}>
      <span style={{width: '50%'}}>{text}</span>
      <span style={{width: '50%'}}>{text}</span>
    </div>
  );
};
