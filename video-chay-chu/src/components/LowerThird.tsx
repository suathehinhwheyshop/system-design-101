import React from 'react';
import {spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {FONT} from '../fonts';

export const LowerThird: React.FC<{text: string; style?: React.CSSProperties}> = ({text, style}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame, fps, config: {damping: 200}});
  return (
    <div style={{position: 'absolute', left: '5%', bottom: '10%', padding: '10px 18px', background: 'rgba(0,0,0,0.55)', borderRadius: 10,
      fontFamily: FONT, fontWeight: 600, fontSize: 30, color: '#fff', opacity: p, transform: `translateX(${-24 * (1 - p)}px)`, ...style}}>
      {text}
    </div>
  );
};
