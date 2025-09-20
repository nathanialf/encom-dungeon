import React, { useMemo, useRef } from 'react';
import { PixelationEffect } from './PixelationEffect';

interface PixelationProps {
  pixelSize?: number;
}

export const Pixelation: React.FC<PixelationProps> = ({ pixelSize = 4 }) => {
  const effect = useMemo(() => new PixelationEffect(pixelSize), [pixelSize]);
  
  return <primitive object={effect} />;
};