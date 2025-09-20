import { renderHook } from '@testing-library/react';
import { useShaderTime } from './useShaderTime';

// Mock @react-three/fiber
jest.mock('@react-three/fiber', () => ({
  useFrame: jest.fn((callback) => {
    // Simulate a frame call
    callback({ clock: { elapsedTime: 1.0 } }, 0.016);
  })
}));

// Mock THREE.js
const mockMaterial = {
  uniforms: {
    uTime: { value: 0 }
  }
};

describe('useShaderTime', () => {
  test('should return a number when given null material', () => {
    const { result } = renderHook(() => useShaderTime(null));
    expect(typeof result.current).toBe('number');
  });

  test('should return a number when given material', () => {
    const { result } = renderHook(() => useShaderTime(mockMaterial as any));
    expect(typeof result.current).toBe('number');
  });

  test('should start with zero', () => {
    const { result } = renderHook(() => useShaderTime(null));
    expect(result.current).toBe(0);
  });

  test('should accept shader material parameter', () => {
    expect(() => {
      renderHook(() => useShaderTime(mockMaterial as any));
    }).not.toThrow();
  });

  test('should accept null parameter', () => {
    expect(() => {
      renderHook(() => useShaderTime(null));
    }).not.toThrow();
  });
});