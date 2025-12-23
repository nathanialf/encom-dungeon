import React, { useMemo } from 'react';
import { CompositeBlurEffect } from './CompositeBlurEffect';

interface CompositeBlurProps {
  blurAmount?: number;
  chromaBleed?: number;
}

export const CompositeBlur: React.FC<CompositeBlurProps> = ({
  blurAmount = 1.0,
  chromaBleed = 3.0
}) => {
  const effect = useMemo(
    () => new CompositeBlurEffect(blurAmount, chromaBleed),
    [blurAmount, chromaBleed]
  );

  return <primitive object={effect} />;
};
