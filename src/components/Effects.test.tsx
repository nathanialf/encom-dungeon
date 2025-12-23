import React from 'react';
import { render, screen } from '@testing-library/react';
import { Effects } from './Effects';

// Mock the responsive pixel size hook
jest.mock('../hooks/useResponsivePixelSize', () => ({
  useResponsivePixelSize: () => 4
}));

// Mock the child components
jest.mock('./effects/Pixelation', () => ({
  Pixelation: ({ pixelSize }: { pixelSize: number }) => (
    <div data-testid="pixelation" data-pixel-size={pixelSize}>Pixelation Effect</div>
  )
}));

jest.mock('./effects/CRTGrid', () => ({
  CRTGrid: ({ pixelSize, gridIntensity }: { pixelSize: number; gridIntensity: number }) => (
    <div data-testid="crt-grid" data-pixel-size={pixelSize} data-grid-intensity={gridIntensity}>CRT Grid Effect</div>
  )
}));

jest.mock('./effects/TerminalGreen', () => ({
  TerminalGreen: () => <div data-testid="terminal-green">Terminal Green Effect</div>
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

  test('should render Pixelation effect', () => {
    render(<Effects />);

    expect(screen.getByTestId('pixelation')).toBeInTheDocument();
  });

  test('should render TerminalGreen effect', () => {
    render(<Effects />);

    expect(screen.getByTestId('terminal-green')).toBeInTheDocument();
  });

  test('should render CRTGrid effect', () => {
    render(<Effects />);

    expect(screen.getByTestId('crt-grid')).toBeInTheDocument();
  });

  test('should pass responsive pixel size to Pixelation and CRTGrid', () => {
    render(<Effects />);

    const pixelationElement = screen.getByTestId('pixelation');
    const crtGridElement = screen.getByTestId('crt-grid');

    // Both should receive the same pixel size from useResponsivePixelSize hook
    expect(pixelationElement).toHaveAttribute('data-pixel-size', '4');
    expect(crtGridElement).toHaveAttribute('data-pixel-size', '4');
  });

  test('should contain all effect text content', () => {
    render(<Effects />);

    expect(screen.getByText('Pixelation Effect')).toBeInTheDocument();
    expect(screen.getByText('Terminal Green Effect')).toBeInTheDocument();
    expect(screen.getByText('CRT Grid Effect')).toBeInTheDocument();
  });
});