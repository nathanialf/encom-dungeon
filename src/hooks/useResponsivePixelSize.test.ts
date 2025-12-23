import { renderHook, act } from '@testing-library/react';
import { useResponsivePixelSize } from './useResponsivePixelSize';

describe('useResponsivePixelSize', () => {
  const originalOntouchstart = window.ontouchstart;
  const originalMaxTouchPoints = navigator.maxTouchPoints;

  const setTouchDevice = (hasTouch: boolean) => {
    if (hasTouch) {
      Object.defineProperty(window, 'ontouchstart', {
        writable: true,
        configurable: true,
        value: () => {}
      });
    } else {
      delete (window as unknown as Record<string, unknown>).ontouchstart;
    }
    Object.defineProperty(navigator, 'maxTouchPoints', {
      writable: true,
      configurable: true,
      value: hasTouch ? 5 : 0
    });
  };

  afterEach(() => {
    // Reset touch capabilities after each test
    if (originalOntouchstart !== undefined) {
      Object.defineProperty(window, 'ontouchstart', {
        writable: true,
        configurable: true,
        value: originalOntouchstart
      });
    } else {
      delete (window as unknown as Record<string, unknown>).ontouchstart;
    }
    Object.defineProperty(navigator, 'maxTouchPoints', {
      writable: true,
      configurable: true,
      value: originalMaxTouchPoints
    });
  });

  test('returns 8 for touch devices', () => {
    setTouchDevice(true);

    const { result } = renderHook(() => useResponsivePixelSize());
    expect(result.current).toBe(8);
  });

  test('returns 12 for non-touch desktop devices', () => {
    setTouchDevice(false);

    const { result } = renderHook(() => useResponsivePixelSize());
    expect(result.current).toBe(12);
  });

  test('detects touch via ontouchstart property', () => {
    Object.defineProperty(window, 'ontouchstart', {
      writable: true,
      configurable: true,
      value: () => {}
    });
    Object.defineProperty(navigator, 'maxTouchPoints', {
      writable: true,
      configurable: true,
      value: 0
    });

    const { result } = renderHook(() => useResponsivePixelSize());
    expect(result.current).toBe(8);
  });

  test('detects touch via maxTouchPoints', () => {
    delete (window as unknown as Record<string, unknown>).ontouchstart;
    Object.defineProperty(navigator, 'maxTouchPoints', {
      writable: true,
      configurable: true,
      value: 10
    });

    const { result } = renderHook(() => useResponsivePixelSize());
    expect(result.current).toBe(8);
  });

  test('updates pixel size on window resize when touch capability changes', () => {
    setTouchDevice(false);

    const { result } = renderHook(() => useResponsivePixelSize());
    expect(result.current).toBe(12);

    // Simulate touch device (e.g., external touchscreen connected)
    act(() => {
      setTouchDevice(true);
      window.dispatchEvent(new Event('resize'));
    });

    expect(result.current).toBe(8);
  });

  test('cleans up resize listener on unmount', () => {
    const addEventListenerSpy = jest.spyOn(window, 'addEventListener');
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() => useResponsivePixelSize());

    expect(addEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));

    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });
});
