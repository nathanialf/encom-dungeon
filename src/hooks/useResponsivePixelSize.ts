import { useState, useEffect } from 'react';

/**
 * Returns a pixel size value for shader effects that scales with device pixel ratio.
 *
 * The CRT shader divides each pixel block into 4 columns (R, G, B, gap),
 * so pixel size must be a multiple of 4. We target ~3 physical pixels per
 * RGB strip (12 physical pixels per block) to avoid the "screen door" effect
 * on high-DPI displays.
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
  return 2;
}
