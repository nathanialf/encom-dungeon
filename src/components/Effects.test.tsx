import React from 'react';
import { render, screen } from '@testing-library/react';
import { Effects } from './Effects';

// Mock the responsive pixel size hook
jest.mock('../hooks/useResponsivePixelSize', () => ({
  useResponsivePixelSize: () => 2
}));

// Mock the child components
jest.mock('./effects/CRTGrid', () => ({
  CRTGrid: ({ pixelSize, gridIntensity }: { pixelSize: number; gridIntensity: number }) => (
    <div data-testid="crt-grid" data-pixel-size={pixelSize} data-grid-intensity={gridIntensity}>CRT Grid Effect</div>
  )
}));

// Mock @react-three/postprocessing
jest.mock('@react-three/postprocessing', () => ({
  EffectComposer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="effect-composer">{children}</div>
  )
}));

describe('Effects', () => {
  test('should render without errors', () => {
    expect(() => render(<Effects />)).not.toThrow();
  });

  test('should render EffectComposer', () => {
    render(<Effects />);

    expect(screen.getByTestId('effect-composer')).toBeInTheDocument();
  });

  test('should render CRTGrid effect', () => {
    render(<Effects />);

    expect(screen.getByTestId('crt-grid')).toBeInTheDocument();
  });

  test('should pass responsive pixel size to CRTGrid', () => {
    render(<Effects />);

    const crtGridElement = screen.getByTestId('crt-grid');
    expect(crtGridElement).toHaveAttribute('data-pixel-size', '2');
  });

  test('should contain CRT effect text content', () => {
    render(<Effects />);

    expect(screen.getByText('CRT Grid Effect')).toBeInTheDocument();
  });
});
