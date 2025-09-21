import React from 'react';
import { render } from '@testing-library/react';
import { TimeUpdater } from './TimeUpdater';
import { useFrame } from '@react-three/fiber';

// Mock the stores
const mockSetFps = jest.fn();
const mockUpdateTime = jest.fn();

jest.mock('../store/gameStore', () => ({
  useGameStore: () => ({
    setFps: mockSetFps
  })
}));

jest.mock('../store/timeStore', () => ({
  useTimeStore: () => ({
    updateTime: mockUpdateTime
  })
}));

// Mock @react-three/fiber
jest.mock('@react-three/fiber', () => ({
  useFrame: jest.fn()
}));

// Mock console.log for testing debug output
const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

describe('TimeUpdater', () => {
  let frameCallback: (state: any, delta: number) => void;
  const mockUseFrame = useFrame as jest.MockedFunction<typeof useFrame>;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleSpy.mockClear();
    
    // Capture the callback passed to useFrame
    mockUseFrame.mockImplementation((callback) => {
      frameCallback = callback;
      return null;
    });
  });

  afterAll(() => {
    consoleSpy.mockRestore();
  });

  test('should be a functional component', () => {
    expect(typeof TimeUpdater).toBe('function');
  });

  test('should return null (invisible component)', () => {
    const { container } = render(<TimeUpdater />);
    expect(container).toBeEmptyDOMElement();
  });

  test('should register useFrame callback', () => {
    render(<TimeUpdater />);
    expect(mockUseFrame).toHaveBeenCalledWith(expect.any(Function));
  });

  test('should update time store every frame', () => {
    render(<TimeUpdater />);
    
    const mockState = { clock: { elapsedTime: 1.0 } };
    const delta = 0.016;
    
    frameCallback(mockState, delta);
    
    expect(mockUpdateTime).toHaveBeenCalledWith(delta);
  });

  test('should calculate and update FPS every 10 frames', () => {
    render(<TimeUpdater />);
    
    const mockState = { clock: { elapsedTime: 1.0 } };
    const delta = 0.016; // ~62.5 fps
    
    // First 9 frames should not update FPS
    for (let i = 1; i <= 9; i++) {
      frameCallback(mockState, delta);
    }
    expect(mockSetFps).not.toHaveBeenCalled();
    
    // 10th frame should update FPS
    frameCallback(mockState, delta);
    expect(mockSetFps).toHaveBeenCalledWith(Math.round(1 / delta)); // ~63
  });

  test('should log debug info for low FPS every 60 frames', () => {
    render(<TimeUpdater />);
    
    const mockState = { clock: { elapsedTime: 2.5 } };
    const lowFpsDelta = 0.025; // 40 fps (below 55 threshold)
    
    // Simulate 60 frames with low FPS
    for (let i = 1; i <= 60; i++) {
      frameCallback(mockState, lowFpsDelta);
    }
    
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Low FPS detected: 40fps')
    );
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('RAF timestamp: 2.5')
    );
  });

  test('should not log debug info for good FPS', () => {
    render(<TimeUpdater />);
    
    const mockState = { clock: { elapsedTime: 2.5 } };
    const goodFpsDelta = 0.016; // ~62.5 fps (above 55 threshold)
    
    // Simulate 60 frames with good FPS
    for (let i = 1; i <= 60; i++) {
      frameCallback(mockState, goodFpsDelta);
    }
    
    expect(consoleSpy).not.toHaveBeenCalledWith(
      expect.stringContaining('Low FPS detected')
    );
  });

  test('should only log debug info on exact 60-frame intervals with low FPS', () => {
    render(<TimeUpdater />);
    
    const mockState = { clock: { elapsedTime: 2.5 } };
    const lowFpsDelta = 0.025; // 40 fps
    
    // Simulate 59 frames (should not log)
    for (let i = 1; i <= 59; i++) {
      frameCallback(mockState, lowFpsDelta);
    }
    expect(consoleSpy).not.toHaveBeenCalled();
    
    // 60th frame should log
    frameCallback(mockState, lowFpsDelta);
    expect(consoleSpy).toHaveBeenCalledTimes(2); // Two console.log calls
    
    // 61st frame should not log
    consoleSpy.mockClear();
    frameCallback(mockState, lowFpsDelta);
    expect(consoleSpy).not.toHaveBeenCalled();
  });

  test('should accumulate time across multiple frames', () => {
    render(<TimeUpdater />);
    
    const mockState = { clock: { elapsedTime: 1.0 } };
    const delta = 0.016;
    
    // Call multiple times - internal timeRef should accumulate
    frameCallback(mockState, delta);
    frameCallback(mockState, delta);
    frameCallback(mockState, delta);
    
    // We can't directly test timeRef but we can verify behavior
    expect(mockUpdateTime).toHaveBeenCalledTimes(3);
    expect(mockUpdateTime).toHaveBeenNthCalledWith(1, delta);
    expect(mockUpdateTime).toHaveBeenNthCalledWith(2, delta);
    expect(mockUpdateTime).toHaveBeenNthCalledWith(3, delta);
  });

  test('should handle zero delta time', () => {
    render(<TimeUpdater />);
    
    const mockState = { clock: { elapsedTime: 1.0 } };
    const delta = 0;
    
    expect(() => {
      frameCallback(mockState, delta);
    }).not.toThrow();
    
    expect(mockUpdateTime).toHaveBeenCalledWith(0);
    // FPS calculation with zero delta would be Infinity, but Math.round should handle it
    expect(mockSetFps).not.toHaveBeenCalled(); // First frame, not 10th
  });

  test('should handle very small delta times', () => {
    render(<TimeUpdater />);
    
    const mockState = { clock: { elapsedTime: 1.0 } };
    const smallDelta = 0.001; // 1000 fps
    
    frameCallback(mockState, smallDelta);
    
    expect(mockUpdateTime).toHaveBeenCalledWith(smallDelta);
  });

  test('should handle very large delta times (low FPS)', () => {
    render(<TimeUpdater />);
    
    const mockState = { clock: { elapsedTime: 1.0 } };
    const largeDelta = 0.1; // 10 fps
    
    // Run 10 frames to trigger FPS update
    for (let i = 1; i <= 10; i++) {
      frameCallback(mockState, largeDelta);
    }
    
    expect(mockSetFps).toHaveBeenCalledWith(10);
  });

  test('should update lastFrameTime correctly', () => {
    render(<TimeUpdater />);
    
    const mockState = { clock: { elapsedTime: 1.0 } };
    const delta = 0.016;
    
    frameCallback(mockState, delta);
    
    // We can't directly access lastFrameTime, but we can verify the calculation doesn't throw
    expect(mockUpdateTime).toHaveBeenCalledWith(delta);
  });

  test('should increment frame count correctly', () => {
    render(<TimeUpdater />);
    
    const mockState = { clock: { elapsedTime: 1.0 } };
    const delta = 0.016;
    
    // Run exactly 20 frames
    for (let i = 1; i <= 20; i++) {
      frameCallback(mockState, delta);
    }
    
    // Should have called setFps twice (at frame 10 and 20)
    expect(mockSetFps).toHaveBeenCalledTimes(2);
  });
});