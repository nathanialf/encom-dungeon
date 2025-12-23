import React from 'react';
import { EffectComposer } from '@react-three/postprocessing';
import { Pixelation } from './effects/Pixelation';
import { CRTGrid } from './effects/CRTGrid';
import { TerminalGreen } from './effects/TerminalGreen';

export const Effects: React.FC = () => {
  return (
    <EffectComposer>
      <Pixelation pixelSize={4} />
      {/* <CompositeBlur blurAmount={1.0} chromaBleed={3.0} /> */}
      <TerminalGreen />
      <CRTGrid pixelSize={4} gridIntensity={1.0} />
    </EffectComposer>
  );
};