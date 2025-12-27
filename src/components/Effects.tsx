import React from 'react';
import { EffectComposer } from '@react-three/postprocessing';
import { CRTGrid } from './effects/CRTGrid';
import { useResponsivePixelSize } from '../hooks/useResponsivePixelSize';

export const Effects: React.FC = () => {
  const pixelSize = useResponsivePixelSize();

  return (
    <EffectComposer>
      <CRTGrid pixelSize={pixelSize} gridIntensity={1.0} />
    </EffectComposer>
  );
};