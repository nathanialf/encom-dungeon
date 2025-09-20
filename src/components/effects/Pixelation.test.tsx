import React from 'react';
import { render } from '@testing-library/react';
import { Pixelation } from './Pixelation';

// Mock the PixelationEffect
jest.mock('./PixelationEffect', () => ({
  PixelationEffect: jest.fn().mockImplementation((pixelSize) => ({
    pixelSize,
    type: 'PixelationEffect',
    // Mock Three.js object structure
    dispose: jest.fn(),
    uuid: 'mock-uuid'
  }))
}));

describe('Pixelation', () => {
  test('should render without errors', () => {
    expect(() => render(<Pixelation />)).not.toThrow();
  });

  test('should render with default pixel size', () => {
    const { container } = render(<Pixelation />);
    expect(container.firstChild).toBeInTheDocument();
  });

  test('should render with custom pixel size', () => {
    const { container } = render(<Pixelation pixelSize={8} />);
    expect(container.firstChild).toBeInTheDocument();
  });

  test('should create PixelationEffect with correct pixel size', () => {
    const customPixelSize = 12;
    render(<Pixelation pixelSize={customPixelSize} />);
    
    const { PixelationEffect } = require('./PixelationEffect');
    expect(PixelationEffect).toHaveBeenCalledWith(customPixelSize);
  });

  test('should use default pixel size when not provided', () => {
    render(<Pixelation />);
    
    const { PixelationEffect } = require('./PixelationEffect');
    expect(PixelationEffect).toHaveBeenCalledWith(4);
  });

  test('should be a functional component', () => {
    expect(typeof Pixelation).toBe('function');
  });
});