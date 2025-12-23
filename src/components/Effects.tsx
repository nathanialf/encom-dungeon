import React from 'react';
import { EffectComposer } from '@react-three/postprocessing';
import { Pixelation } from './effects/Pixelation';
import { CRTGrid } from './effects/CRTGrid';
import { TerminalGreen } from './effects/TerminalGreen';
import { useResponsivePixelSize } from '../hooks/useResponsivePixelSize';

export const Effects: React.FC = () => {
  const pixelSize = useResponsivePixelSize();

  return (
    <EffectComposer>
      <Pixelation pixelSize={pixelSize} />
      {/* <CompositeBlur blurAmount={1.0} chromaBleed={3.0} /> */}
      <TerminalGreen />
      <CRTGrid pixelSize={pixelSize} gridIntensity={1.0} />
    </EffectComposer>
  );
};