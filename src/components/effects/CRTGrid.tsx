import React, { useMemo } from 'react';
import { CRTGridEffect } from './CRTGridEffect';

interface CRTGridProps {
  pixelSize?: number;
  gridIntensity?: number;
}

export const CRTGrid: React.FC<CRTGridProps> = ({
  pixelSize = 4,
  gridIntensity = 0.8
}) => {
  const effect = useMemo(
    () => new CRTGridEffect(pixelSize, gridIntensity),
    [pixelSize, gridIntensity]
  );

  return <primitive object={effect} />;
};
