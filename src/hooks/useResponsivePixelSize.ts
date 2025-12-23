import { useState, useEffect } from 'react';

/**
 * Returns a pixel size value for shader effects that scales with screen width.
 *
 * The CRT shader divides each pixel block into 4 columns (R, G, B, gap),
 * so pixel size must be a multiple of 4. Larger pixels on smaller screens
 * reduce the "screen door" effect by making RGB strips wider.
 *
 * - Small screens (< 600px): 8px (2px per RGB strip)
 * - Medium/Large screens (>= 600px): 4px (1px per RGB strip)
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
  const width = window.innerWidth;

  if (width < 600) {
    return 8;
  } else {
    return 4;
  }
}
