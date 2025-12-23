import { useState, useEffect } from 'react';

/**
 * Returns a pixel size value for shader effects that scales with device type.
 *
 * The CRT shader divides each pixel block into 4 columns (R, G, B, gap),
 * so pixel size must be a multiple of 4. Larger pixels reduce the
 * "screen door" effect by making RGB strips wider.
 *
 * - Touch devices (phones, tablets, foldables): 8px (2px per RGB strip)
 * - Desktop screens: 12px (3px per RGB strip)
 */
export function useResponsivePixelSize(): number {
  const [pixelSize, setPixelSize] = useState(() => calculatePixelSize());

  useEffect(() => {
    const handleResize = () => {
      setPixelSize(calculatePixelSize());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return pixelSize;
}

function calculatePixelSize(): number {
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  // Touch devices (phones, tablets, foldables) are held closer to the face
  if (hasTouch) {
    return 8;
  }

  // Desktop displays get chunkier pixels for a more pronounced CRT effect
  return 12;
}
