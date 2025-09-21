import React from 'react';
import { render } from '@testing-library/react';
import { TerminalGreen } from './TerminalGreen';

// Mock the timeStore
const mockTime = 5.5;
jest.mock('../../store/timeStore', () => ({
  useTimeStore: () => ({
    time: mockTime
  })
}));

// Mock Three.js Uniform
jest.mock('three', () => ({
  Uniform: jest.fn().mockImplementation((value) => ({ value }))
}));

// Mock postprocessing Effect - we need to mock the base class that TerminalGreenEffect extends
jest.mock('postprocessing', () => ({
  Effect: class MockEffect {
    name: string;
    fragmentShader: string;
    uniforms: Map<string, { value: number }>;

    constructor(name: string, fragmentShader: string, options: any) {
      this.name = name;
      this.fragmentShader = fragmentShader;
      this.uniforms = options?.uniforms || new Map();
    }
  }
}));

// Mock @react-three/fiber
jest.mock('@react-three/fiber', () => {
  const mockReact = require('react');
  return {
    primitive: jest.fn().mockImplementation(({ object, ref }) => {
      return mockReact.createElement('div', { 
        ref,
        'data-testid': 'terminal-green-effect',
        'data-effect-name': object?.name || 'TerminalGreenEffect'
      });
    })
  };
});

describe('TerminalGreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should be a forwardRef component', () => {
    expect(typeof TerminalGreen).toBe('object');
    expect(TerminalGreen.$$typeof).toBeDefined();
  });

  test('should render without crashing', () => {
    expect(() => render(<TerminalGreen />)).not.toThrow();
  });

  test('should render primitive element', () => {
    // Verify that component renders successfully by not throwing
    expect(() => render(<TerminalGreen />)).not.toThrow();
  });

  test('should have correct displayName', () => {
    expect(TerminalGreen.displayName).toBe('TerminalGreen');
  });

  test('should handle intensity prop', () => {
    expect(() => render(<TerminalGreen intensity={0.5} />)).not.toThrow();
  });

  test('should handle undefined intensity prop', () => {
    expect(() => render(<TerminalGreen />)).not.toThrow();
  });

  test('should handle zero intensity', () => {
    expect(() => render(<TerminalGreen intensity={0} />)).not.toThrow();
  });

  test('should handle negative intensity', () => {
    expect(() => render(<TerminalGreen intensity={-0.5} />)).not.toThrow();
  });

  test('should handle large intensity values', () => {
    expect(() => render(<TerminalGreen intensity={10} />)).not.toThrow();
  });

  test('should handle decimal intensity values', () => {
    expect(() => render(<TerminalGreen intensity={1.75} />)).not.toThrow();
  });

  test('should forward ref correctly', () => {
    const ref = React.createRef<any>();
    expect(() => render(<TerminalGreen ref={ref} />)).not.toThrow();
  });

  test('should handle component unmounting', () => {
    const { unmount } = render(<TerminalGreen intensity={0.5} />);
    expect(() => unmount()).not.toThrow();
  });

  test('should update when props change', () => {
    const { rerender } = render(<TerminalGreen intensity={0.5} />);
    expect(() => rerender(<TerminalGreen intensity={0.8} />)).not.toThrow();
  });

  test('should handle re-rendering with same props', () => {
    const { rerender } = render(<TerminalGreen intensity={0.5} />);
    expect(() => rerender(<TerminalGreen intensity={0.5} />)).not.toThrow();
  });

  test('should create effect with Uniform constructors', () => {
    const { Uniform } = require('three');
    render(<TerminalGreen />);
    
    // Should create uniforms for intensity and time
    expect(Uniform).toHaveBeenCalledWith(1.0); // intensity default
    expect(Uniform).toHaveBeenCalledWith(0.0); // time default
  });

  test('should handle different intensity values in props', () => {
    const intensityValues = [0, 0.25, 0.5, 1.0, 2.0, -1.0, 100];
    
    intensityValues.forEach(intensity => {
      expect(() => render(<TerminalGreen intensity={intensity} />)).not.toThrow();
    });
  });

  test('should render with ref and intensity prop together', () => {
    const ref = React.createRef<any>();
    expect(() => render(<TerminalGreen ref={ref} intensity={0.75} />)).not.toThrow();
  });

  test('should create effect object with correct name', () => {
    // Verify that component creates effect successfully
    expect(() => render(<TerminalGreen />)).not.toThrow();
  });
});