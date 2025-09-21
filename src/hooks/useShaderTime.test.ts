import { renderHook } from '@testing-library/react';
import { useShaderTime } from './useShaderTime';
import { useFrame } from '@react-three/fiber';

// Mock @react-three/fiber
jest.mock('@react-three/fiber', () => ({
  useFrame: jest.fn()
}));

describe('useShaderTime', () => {
  let frameCallback: (state: any, delta: number) => void;
  const mockUseFrame = useFrame as jest.MockedFunction<typeof useFrame>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Capture the callback passed to useFrame
    mockUseFrame.mockImplementation((callback) => {
      frameCallback = callback;
      return null;
    });
  });

  test('should return a number when given null material', () => {
    const { result } = renderHook(() => useShaderTime(null));
    expect(typeof result.current).toBe('number');
  });

  test('should return a number when given material', () => {
    const mockMaterial = {
      uniforms: {
        uTime: { value: 0 }
      }
    };
    
    const { result } = renderHook(() => useShaderTime(mockMaterial as any));
    expect(typeof result.current).toBe('number');
  });

  test('should start with zero', () => {
    const { result } = renderHook(() => useShaderTime(null));
    expect(result.current).toBe(0);
  });

  test('should update time when useFrame callback is called', () => {
    const { result, rerender } = renderHook(() => useShaderTime(null));
    
    // Initial time should be 0
    expect(result.current).toBe(0);
    
    // Simulate frame update
    frameCallback({}, 0.016);
    rerender();
    
    // Time should have increased
    expect(result.current).toBeGreaterThan(0);
  });

  test('should update material uniforms when material has uTime uniform', () => {
    const mockMaterial = {
      uniforms: {
        uTime: { value: 0 }
      }
    };
    
    renderHook(() => useShaderTime(mockMaterial as any));
    
    // Simulate frame update
    frameCallback({}, 0.016);
    
    // Material uniform should be updated
    expect(mockMaterial.uniforms.uTime.value).toBe(0.016);
  });

  test('should handle material without uTime uniform', () => {
    const mockMaterial = {
      uniforms: {
        someOtherUniform: { value: 0 }
      }
    };
    
    expect(() => {
      renderHook(() => useShaderTime(mockMaterial as any));
      frameCallback({}, 0.016);
    }).not.toThrow();
  });

  test('should handle material with undefined uniforms', () => {
    const mockMaterial = {
      uniforms: undefined
    };
    
    expect(() => {
      renderHook(() => useShaderTime(mockMaterial as any));
      frameCallback({}, 0.016);
    }).toThrow('Cannot read properties of undefined (reading \'uTime\')');
  });

  test('should accumulate time across multiple frame updates', () => {
    const { result, rerender } = renderHook(() => useShaderTime(null));
    
    // First frame
    frameCallback({}, 0.016);
    rerender();
    expect(result.current).toBe(0.016);
    
    // Second frame
    frameCallback({}, 0.016);
    rerender();
    expect(result.current).toBe(0.032);
    
    // Third frame with different delta
    frameCallback({}, 0.033);
    rerender();
    expect(result.current).toBeCloseTo(0.065, 3);
  });

  test('should continuously update material uniform with accumulated time', () => {
    const mockMaterial = {
      uniforms: {
        uTime: { value: 0 }
      }
    };
    
    renderHook(() => useShaderTime(mockMaterial as any));
    
    // First frame
    frameCallback({}, 0.016);
    expect(mockMaterial.uniforms.uTime.value).toBe(0.016);
    
    // Second frame
    frameCallback({}, 0.020);
    expect(mockMaterial.uniforms.uTime.value).toBeCloseTo(0.036, 3);
  });

  test('should register useFrame callback', () => {
    renderHook(() => useShaderTime(null));
    expect(mockUseFrame).toHaveBeenCalledWith(expect.any(Function));
  });

  test('should handle zero delta time', () => {
    const { result, rerender } = renderHook(() => useShaderTime(null));
    
    frameCallback({}, 0);
    rerender();
    
    expect(result.current).toBe(0);
  });

  test('should handle negative delta time', () => {
    const { result, rerender } = renderHook(() => useShaderTime(null));
    
    frameCallback({}, -0.016);
    rerender();
    
    expect(result.current).toBe(-0.016);
  });
});