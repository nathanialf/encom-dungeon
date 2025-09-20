import React from 'react';
import { render } from '@testing-library/react';
import { Effects } from './Effects';

// Mock the child components
jest.mock('./effects/Pixelation', () => ({
  Pixelation: ({ pixelSize }: { pixelSize: number }) => (
    <div data-testid="pixelation" data-pixel-size={pixelSize}>Pixelation Effect</div>
  )
}));

jest.mock('./effects/TerminalGreen', () => ({
  TerminalGreen: () => <div data-testid="terminal-green">Terminal Green Effect</div>
}));

// Mock @react-three/postprocessing
jest.mock('@react-three/postprocessing', () => ({
  EffectComposer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="effect-composer">{children}</div>
  ),
  Bloom: () => <div data-testid="bloom">Bloom Effect</div>
}));

describe('Effects', () => {
  test('should render without errors', () => {
    expect(() => render(<Effects />)).not.toThrow();
  });

  test('should render EffectComposer', () => {
    const { getByTestId } = render(<Effects />);
    
    expect(getByTestId('effect-composer')).toBeInTheDocument();
  });

  test('should render Pixelation effect', () => {
    const { getByTestId } = render(<Effects />);
    
    expect(getByTestId('pixelation')).toBeInTheDocument();
  });

  test('should render TerminalGreen effect', () => {
    const { getByTestId } = render(<Effects />);
    
    expect(getByTestId('terminal-green')).toBeInTheDocument();
  });

  test('should render Bloom effect', () => {
    const { getByTestId } = render(<Effects />);
    
    expect(getByTestId('bloom')).toBeInTheDocument();
  });

  test('should pass correct pixel size to Pixelation', () => {
    const { getByTestId } = render(<Effects />);
    
    const pixelationElement = getByTestId('pixelation');
    expect(pixelationElement).toHaveAttribute('data-pixel-size', '6');
  });

  test('should contain all effect text content', () => {
    const { getByText } = render(<Effects />);
    
    expect(getByText('Pixelation Effect')).toBeInTheDocument();
    expect(getByText('Terminal Green Effect')).toBeInTheDocument();
    expect(getByText('Bloom Effect')).toBeInTheDocument();
  });
});