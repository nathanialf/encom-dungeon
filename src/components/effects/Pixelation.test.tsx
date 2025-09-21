import React from 'react';
import { render } from '@testing-library/react';
import { Pixelation } from './Pixelation';
import { PixelationEffect } from './PixelationEffect';

// Mock the PixelationEffect
jest.mock('./PixelationEffect', () => ({
  PixelationEffect: jest.fn().mockImplementation((pixelSize) => ({
    pixelSize,
    name: 'PixelationEffect',
    type: 'effect',
  })),
}));

// Mock the primitive element for react-three-fiber
jest.mock('@react-three/fiber', () => ({
  primitive: ({ object }: { object: any }) => <div data-testid="pixelation-effect" data-pixel-size={object.pixelSize} />
}));

describe('Pixelation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should be a functional component', () => {
    expect(typeof Pixelation).toBe('function');
  });

  test('should render without crashing', () => {
    expect(() => render(<Pixelation />)).not.toThrow();
  });

  test('should use default pixelSize of 4 when no prop provided', () => {
    render(<Pixelation />);
    
    expect(PixelationEffect).toHaveBeenCalledWith(4);
  });

  test('should use provided pixelSize prop', () => {
    render(<Pixelation pixelSize={8} />);
    
    expect(PixelationEffect).toHaveBeenCalledWith(8);
  });

  test('should create new PixelationEffect with correct pixelSize', () => {
    const testPixelSize = 12;
    render(<Pixelation pixelSize={testPixelSize} />);
    
    expect(PixelationEffect).toHaveBeenCalledTimes(1);
    expect(PixelationEffect).toHaveBeenCalledWith(testPixelSize);
  });

  test('should render primitive object with effect', () => {
    // Verify that component renders successfully by not throwing
    expect(() => render(<Pixelation pixelSize={6} />)).not.toThrow();
  });

  test('should memoize effect based on pixelSize', () => {
    const { rerender } = render(<Pixelation pixelSize={4} />);
    
    expect(PixelationEffect).toHaveBeenCalledTimes(1);
    expect(PixelationEffect).toHaveBeenCalledWith(4);
    
    // Re-render with same props - should not create new effect
    rerender(<Pixelation pixelSize={4} />);
    expect(PixelationEffect).toHaveBeenCalledTimes(1);
    
    // Re-render with different pixelSize - should create new effect
    rerender(<Pixelation pixelSize={8} />);
    expect(PixelationEffect).toHaveBeenCalledTimes(2);
    expect(PixelationEffect).toHaveBeenLastCalledWith(8);
  });

  test('should handle zero pixelSize', () => {
    render(<Pixelation pixelSize={0} />);
    
    expect(PixelationEffect).toHaveBeenCalledWith(0);
  });

  test('should handle large pixelSize values', () => {
    render(<Pixelation pixelSize={100} />);
    
    expect(PixelationEffect).toHaveBeenCalledWith(100);
  });

  test('should handle decimal pixelSize values', () => {
    render(<Pixelation pixelSize={3.5} />);
    
    expect(PixelationEffect).toHaveBeenCalledWith(3.5);
  });

  test('should handle negative pixelSize values', () => {
    render(<Pixelation pixelSize={-2} />);
    
    expect(PixelationEffect).toHaveBeenCalledWith(-2);
  });

  test('should properly type pixelSize prop as optional', () => {
    // TypeScript compilation test - this should not cause type errors
    const validProps: React.ComponentProps<typeof Pixelation> = {};
    const validPropsWithPixelSize: React.ComponentProps<typeof Pixelation> = { pixelSize: 6 };
    
    expect(validProps).toBeDefined();
    expect(validPropsWithPixelSize.pixelSize).toBe(6);
  });

  test('should re-create effect when pixelSize changes from undefined to defined', () => {
    const { rerender } = render(<Pixelation />);
    
    expect(PixelationEffect).toHaveBeenCalledTimes(1);
    expect(PixelationEffect).toHaveBeenCalledWith(4); // default value
    
    rerender(<Pixelation pixelSize={10} />);
    expect(PixelationEffect).toHaveBeenCalledTimes(2);
    expect(PixelationEffect).toHaveBeenLastCalledWith(10);
  });
});