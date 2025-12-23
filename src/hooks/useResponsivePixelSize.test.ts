import { renderHook, act } from '@testing-library/react';
import { useResponsivePixelSize } from './useResponsivePixelSize';

describe('useResponsivePixelSize', () => {
  const originalInnerWidth = window.innerWidth;

  afterEach(() => {
    // Reset window width after each test
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth
    });
  });

  test('returns 8 for small screens (< 600px)', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 400
    });

    const { result } = renderHook(() => useResponsivePixelSize());
    expect(result.current).toBe(8);
  });

  test('returns 4 for medium/large screens (>= 600px)', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 800
    });

    const { result } = renderHook(() => useResponsivePixelSize());
    expect(result.current).toBe(4);
  });

  test('returns 4 at boundary (600px)', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 600
    });

    const { result } = renderHook(() => useResponsivePixelSize());
    expect(result.current).toBe(4);
  });

  test('updates pixel size on window resize', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1920
    });

    const { result } = renderHook(() => useResponsivePixelSize());
    expect(result.current).toBe(4);

    // Resize to small screen
    act(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 400
      });
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
