import React from 'react';
import { EffectComposer, Bloom, BrightnessContrast } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { Pixelation } from './effects/Pixelation';
import { TerminalGreen } from './effects/TerminalGreen';

export const Effects: React.FC = () => {
  return (
    <EffectComposer>
      <Pixelation pixelSize={6} />
      <TerminalGreen />
      <Bloom
        intensity={0.3}
        luminanceThreshold={0.9}
        luminanceSmoothing={0.9}
        blendFunction={BlendFunction.SCREEN}
      />
    </EffectComposer>
  );
};