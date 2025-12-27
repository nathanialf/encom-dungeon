import React, { useMemo, useEffect } from 'react';
import { CRTGridEffect } from './CRTGridEffect';
import { useGameStore } from '../../store/gameStore';

interface CRTGridProps {
  pixelSize?: number;
  gridIntensity?: number;
  intensity?: number;
}

export const CRTGrid: React.FC<CRTGridProps> = ({
  pixelSize = 4,
  gridIntensity = 0.8,
  intensity = 1.0
}) => {
  const { dungeonMetadata } = useGameStore();

  // Round to nearest multiple of 4 for uniform strip widths
  const dpr = window.devicePixelRatio || 1;
  const physicalPixelSize = Math.round((pixelSize * dpr) / 4) * 4 || 4;

  const effect = useMemo(
    () => new CRTGridEffect(physicalPixelSize, gridIntensity),
    [physicalPixelSize, gridIntensity]
  );

  useEffect(() => {
    effect.intensity = intensity;
  }, [intensity, effect]);

  useEffect(() => {
    const mapSeed = dungeonMetadata.mapSeed;
    if (mapSeed !== null) {
      let hash = 0;
      for (let i = 0; i < mapSeed.length; i++) {
        const char = mapSeed.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      const seedValue = Math.abs(hash);
      const moduloResult = seedValue % 5;
      const colorIndex = moduloResult * 3;
      effect.colorIndex = colorIndex;
    }
  }, [dungeonMetadata.mapSeed, effect]);

  return <primitive object={effect} />;
};
