import { renderHook } from '@testing-library/react';
import { useResponsivePixelSize } from './useResponsivePixelSize';

describe('useResponsivePixelSize', () => {
  test('returns 2 CSS pixels', () => {
    const { result } = renderHook(() => useResponsivePixelSize());
    expect(result.current).toBe(2);
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
