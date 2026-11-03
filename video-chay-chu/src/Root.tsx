import React from 'react';
import {Composition, AbsoluteFill} from 'remotion';
import {FONT as fontFamily} from './fonts';
import {ChayChu, calcChayChu, ChayChuProps} from './compositions/ChayChu';
import props from '../props/props-ghep.json';
import wsProps from '../props/ws-magie.json';
import {TalkSub, calcTalkSub, TalkSubProps} from './compositions/TalkSub';
import kinProps from '../props/ws-kinetic.json';
import hfKinProps from '../props/hf-kinetic.json';
import {InfoStyles} from './compositions/InfoStyles';
import {InfoCreatine} from './compositions/InfoCreatine';
import {GroupStyles} from './compositions/GroupStyles';
import {ShortEdit, calcShortEdit, ShortEditProps} from './compositions/ShortEdit';
import kb2Props from '../props/kb2.json';
import {VersusEdit, calcVersus, VersusProps} from './compositions/VersusEdit';
import kb12Props from '../props/kb12.json';
import {StoryEdit, calcStory, StoryProps} from './compositions/StoryEdit';
import kb13Props from '../props/kb13.json';
import {TalkKinetic, calcKinetic, KineticProps} from './compositions/TalkKinetic';

const FontTest: React.FC = () => (
  <AbsoluteFill style={{background: '#222', justifyContent: 'center', alignItems: 'center', fontFamily, color: 'white'}}>
    <div style={{fontSize: 140, fontWeight: 800}}>ĐẸP</div>
    <div style={{fontSize: 44, fontWeight: 500}}>Một cơ thể khỏe mạnh · bền vững</div>
  </AbsoluteFill>
);
export const Root: React.FC = () => (
  <>
    <Composition id="FontTest" component={FontTest} durationInFrames={1} fps={30} width={720} height={1280} />
    <Composition id="ChayChu" component={ChayChu} durationInFrames={1800} fps={30} width={720} height={1280}
      defaultProps={props as ChayChuProps} calculateMetadata={calcChayChu} />
    <Composition id="TalkSub" component={TalkSub} durationInFrames={1041} fps={30} width={1080} height={1920}
      defaultProps={wsProps as unknown as TalkSubProps} calculateMetadata={calcTalkSub} />
    <Composition id="TalkKinetic" component={TalkKinetic} durationInFrames={1041} fps={30} width={1080} height={1920}
      defaultProps={kinProps as unknown as KineticProps} calculateMetadata={calcKinetic} />
    <Composition id="HfKinetic" component={TalkKinetic} durationInFrames={798} fps={30} width={1080} height={1920}
      defaultProps={hfKinProps as unknown as KineticProps} calculateMetadata={calcKinetic} />
    <Composition id="InfoStyles" component={InfoStyles} durationInFrames={1} fps={30} width={1080} height={1920} defaultProps={{v: 1, guides: false}} />
    <Composition id="InfoCreatine" component={InfoCreatine} durationInFrames={1} fps={30} width={1080} height={1920} defaultProps={{v: 1, guides: false}} />
    <Composition id="GroupStyles" component={GroupStyles} durationInFrames={1} fps={30} width={1080} height={1920} defaultProps={{v: 1, g: 1, guides: false}} />
    <Composition id="ShortEdit" component={ShortEdit} durationInFrames={1476} fps={30} width={1080} height={1920}
      defaultProps={kb2Props as unknown as ShortEditProps} calculateMetadata={calcShortEdit} />
    <Composition id="VersusEdit" component={VersusEdit} durationInFrames={1863} fps={30} width={1080} height={1920}
      defaultProps={kb12Props as unknown as VersusProps} calculateMetadata={calcVersus} />
    <Composition id="StoryEdit" component={StoryEdit} durationInFrames={1463} fps={30} width={1080} height={1920}
      defaultProps={kb13Props as unknown as StoryProps} calculateMetadata={calcStory} />
  </>
);
