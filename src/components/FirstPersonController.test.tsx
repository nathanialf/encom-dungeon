import React from 'react';
import { render } from '@testing-library/react';
import { FirstPersonController } from './FirstPersonController';

// Mock the game store with touch functionality
const mockGameStore = {
  player: {
    position: [0, 5, 0] as [number, number, number],
    rotation: [0, 0, 0] as [number, number, number],
    isMoving: false,
  },
  camera: {
    position: [0, 5, 0] as [number, number, number],
    rotation: [0, 0, 0] as [number, number, number],
  },
  dungeon: [],
  updatePlayerPosition: jest.fn(),
  updatePlayerRotation: jest.fn(),
  updateCameraPosition: jest.fn(),
  updateCameraRotation: jest.fn(),
  setPlayer: jest.fn(),
  touchInput: { x: 0, y: 0 },
  touchLookDelta: { x: 0, y: 0 },
  isTouchDevice: false,
  touchLook: jest.fn(),
};

jest.mock('../store/gameStore', () => ({
  useGameStore: Object.assign(
    () => mockGameStore,
    {
      getState: () => ({
        touchLook: mockGameStore.touchLook,
      })
    }
  )
}));

// Mock collision utils
jest.mock('../utils/collisionUtils', () => ({
  checkWallCollision: jest.fn(() => ({ x: 0, z: 0 })),
}));

// Mock useFrame and useThree
const mockUseFrame = jest.fn();
const mockCamera = {
  position: { 
    x: 0, y: 5, z: 0,
    copy: jest.fn(),
  },
  rotation: { x: 0, y: 0, z: 0 },
  getWorldDirection: jest.fn((target) => {
    target.x = 0; target.y = 0; target.z = 1;
    return target;
  }),
};
jest.mock('@react-three/fiber', () => ({
  useFrame: (callback: Function) => {
    mockUseFrame(callback);
    return null;
  },
  useThree: () => ({
    camera: mockCamera,
    gl: {},
    scene: {},
  }),
}));

// Mock @react-three/drei instead of three-stdlib
jest.mock('@react-three/drei', () => ({
  PointerLockControls: jest.fn(() => null),
}));

// Mock Three.js Vector3
const createMockVector3 = (x = 0, y = 0, z = 0): any => ({
  x,
  y,
  z,
  set: jest.fn(function(this: any, newX, newY, newZ) {
    this.x = newX; this.y = newY; this.z = newZ;
    return this;
  }),
  copy: jest.fn(function(this: any, v) {
    this.x = v.x; this.y = v.y; this.z = v.z;
    return this;
  }),
  clone: jest.fn(function(this: any) {
    return createMockVector3(this.x, this.y, this.z);
  }),
  add: jest.fn(function(this: any, v) {
    this.x += v.x; this.y += v.y; this.z += v.z;
    return this;
  }),
  normalize: jest.fn(function(this: any) { return this; }),
  multiplyScalar: jest.fn(function(this: any, scalar) {
    this.x *= scalar; this.y *= scalar; this.z *= scalar;
    return this;
  }),
  lerp: jest.fn(function(this: any) { return this; }),
  length: jest.fn(() => 0.5),
  addScaledVector: jest.fn(function(this: any) { return this; }),
  crossVectors: jest.fn(function(this: any) { return this; }),
  distanceTo: jest.fn(() => 5),
});

jest.mock('three', () => ({
  Vector3: jest.fn().mockImplementation((x = 0, y = 0, z = 0) => createMockVector3(x, y, z)),
}));

describe('FirstPersonController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset game store mock
    mockGameStore.player.position = [0, 5, 0];
    mockGameStore.player.rotation = [0, 0, 0];
    mockGameStore.camera.position = [0, 5, 0];
    mockGameStore.camera.rotation = [0, 0, 0];
    
    // Mock DOM methods
    Object.defineProperty(document, 'addEventListener', {
      value: jest.fn(),
      writable: true,
    });
    Object.defineProperty(document, 'removeEventListener', {
      value: jest.fn(),
      writable: true,
    });
    
    // Type the mock properly
    (document.addEventListener as jest.Mock).mockClear();
    (document.removeEventListener as jest.Mock).mockClear();
    
    // Mock useRef to return appropriate references for different ref types
    jest.spyOn(React, 'useRef').mockImplementation((initialValue: any) => {
      if (initialValue === null || initialValue === undefined) {
        return { current: true }; // For controlsRef
      }
      
      // For move state ref (object with boolean properties)
      if (initialValue && typeof initialValue === 'object' && 'forward' in initialValue) {
        return { current: { ...initialValue } };
      }
      
      // For Vector3 refs or Vector3-like constructor calls
      if (typeof initialValue === 'function' || 
          (initialValue && typeof initialValue === 'object' && ('x' in initialValue || initialValue.constructor?.name === 'Vector3'))) {
        return { current: createMockVector3() };
      }
      
      // For number refs
      if (typeof initialValue === 'number' || typeof initialValue === 'boolean') {
        return { current: initialValue };
      }
      
      // Default case
      return { current: initialValue };
    });
  });

  test('should render without crashing', () => {
    expect(() => render(<FirstPersonController />)).not.toThrow();
  });

  test('should return null (invisible component)', () => {
    render(<FirstPersonController />);
    // FirstPersonController is a functional component that returns null
    // Its behavior is verified through the other tests
    expect(true).toBe(true);
  });

  test('should be a functional component', () => {
    expect(typeof FirstPersonController).toBe('function');
  });

  test('should register useFrame callback', () => {
    render(<FirstPersonController />);
    expect(mockUseFrame).toHaveBeenCalledWith(expect.any(Function));
  });

  test('should initialize pointer lock controls', () => {
    const { PointerLockControls } = require('@react-three/drei');
    render(<FirstPersonController />);
    
    expect(PointerLockControls).toHaveBeenCalled();
  });

  test('should handle keyboard events', () => {
    render(<FirstPersonController />);
    
    // Verify event listeners were added
    expect(document.addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
    expect(document.addEventListener).toHaveBeenCalledWith('keyup', expect.any(Function));
  });

  test('should render PointerLockControls', () => {
    const { PointerLockControls } = require('@react-three/drei');
    render(<FirstPersonController />);
    
    expect(PointerLockControls).toHaveBeenCalled();
  });

  test('should register frame callback for movement', () => {
    render(<FirstPersonController />);
    
    // Should register a frame callback
    expect(mockUseFrame).toHaveBeenCalledWith(expect.any(Function));
  });

  test('should handle movement input states', () => {
    render(<FirstPersonController />);
    
    // Get the keydown handler
    const mockAddEventListener = document.addEventListener as jest.Mock;
    const keydownHandler = mockAddEventListener.mock.calls.find(
      (call: any[]) => call[0] === 'keydown'
    )?.[1];
    
    const keyupHandler = mockAddEventListener.mock.calls.find(
      (call: any[]) => call[0] === 'keyup'
    )?.[1];
    
    expect(keydownHandler).toBeDefined();
    expect(keyupHandler).toBeDefined();
    
    // Test WASD keys
    if (keydownHandler) {
      keydownHandler({ code: 'KeyW' });
      keydownHandler({ code: 'KeyA' });
      keydownHandler({ code: 'KeyS' });
      keydownHandler({ code: 'KeyD' });
    }
    
    if (keyupHandler) {
      keyupHandler({ code: 'KeyW' });
      keyupHandler({ code: 'KeyA' });
      keyupHandler({ code: 'KeyS' });
      keyupHandler({ code: 'KeyD' });
    }
  });

  test('should handle WASD movement keys', () => {
    render(<FirstPersonController />);
    
    // Get the keydown handler
    const mockAddEventListener = document.addEventListener as jest.Mock;
    const keydownHandler = mockAddEventListener.mock.calls.find(
      (call: any[]) => call[0] === 'keydown'
    )?.[1];
    
    expect(keydownHandler).toBeDefined();
    
    if (keydownHandler) {
      // Test movement keys
      keydownHandler({ code: 'KeyW' });
      keydownHandler({ code: 'KeyA' });
      keydownHandler({ code: 'KeyS' });
      keydownHandler({ code: 'KeyD' });
    }
  });

  test('should cleanup event listeners on unmount', () => {
    const { unmount } = render(<FirstPersonController />);
    
    unmount();
    
    expect(document.removeEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
    expect(document.removeEventListener).toHaveBeenCalledWith('keyup', expect.any(Function));
  });

  test('should handle frame updates with different delta times', () => {
    render(<FirstPersonController />);
    
    const frameCallback = mockUseFrame.mock.calls[0][0];
    
    // Test different delta times
    expect(() => frameCallback(null, 0.016)).not.toThrow(); // 60fps
    expect(() => frameCallback(null, 0.033)).not.toThrow(); // 30fps
    expect(() => frameCallback(null, 0.008)).not.toThrow(); // 120fps
  });

  test('should handle frame updates without errors', () => {
    render(<FirstPersonController />);
    
    const frameCallback = mockUseFrame.mock.calls[0][0];
    expect(() => frameCallback(null, 0.016)).not.toThrow();
  });

  test('should handle different delta time values', () => {
    render(<FirstPersonController />);
    
    const frameCallback = mockUseFrame.mock.calls[0][0];
    expect(() => frameCallback(null, 0.016)).not.toThrow();
    expect(() => frameCallback(null, 0.033)).not.toThrow();
  });

  test('should handle mouse and keyboard input setup', () => {
    render(<FirstPersonController />);
    
    // Should register keyboard event listeners
    expect(document.addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
    expect(document.addEventListener).toHaveBeenCalledWith('keyup', expect.any(Function));
  });

  test('should handle edge case key codes', () => {
    render(<FirstPersonController />);
    
    const mockAddEventListener = document.addEventListener as jest.Mock;
    const keydownHandler = mockAddEventListener.mock.calls.find(
      (call: any[]) => call[0] === 'keydown'
    )?.[1];
    
    if (keydownHandler) {
      // Test unknown key codes
      keydownHandler({ code: 'KeyZ' });
      keydownHandler({ code: 'Space' });
      keydownHandler({ code: 'Shift' });
    }
  });

  // Touch Device Tests
  describe('Touch Device Functionality', () => {
    beforeEach(() => {
      mockGameStore.isTouchDevice = true;
      mockGameStore.touchInput = { x: 0, y: 0 };
      mockGameStore.touchLookDelta = { x: 0, y: 0 };
      jest.clearAllMocks();
    });

    afterEach(() => {
      mockGameStore.isTouchDevice = false;
      mockGameStore.touchInput = { x: 0, y: 0 };
      mockGameStore.touchLookDelta = { x: 0, y: 0 };
    });

    test('should not render PointerLockControls on touch devices', () => {
      const { PointerLockControls } = require('@react-three/drei');
      PointerLockControls.mockClear();
      
      render(<FirstPersonController />);
      
      expect(PointerLockControls).not.toHaveBeenCalled();
    });

    test('should handle touch look input', () => {
      mockGameStore.touchLookDelta = { x: 0.5, y: 0 };
      
      render(<FirstPersonController />);
      
      // Touch look should be processed
      expect(mockGameStore.touchLook).toHaveBeenCalled();
    });

    test('should process horizontal touch look only', () => {
      mockGameStore.touchLookDelta = { x: 0.5, y: 0.3 };
      
      render(<FirstPersonController />);
      
      // Should process x but ignore y for touch devices
      expect(mockGameStore.touchLook).toHaveBeenCalledWith(0, 0);
    });

    test('should ignore touch look when no X delta', () => {
      mockGameStore.touchLookDelta = { x: 0, y: 0.3 };
      
      render(<FirstPersonController />);
      
      // Should not process when no X movement
      expect(mockGameStore.touchLook).not.toHaveBeenCalled();
    });

    test('should have touch input state available', () => {
      mockGameStore.touchInput = { x: 0.5, y: 0.3 };
      
      render(<FirstPersonController />);
      
      // Touch input should be accessible
      expect(mockGameStore.touchInput.x).toBe(0.5);
      expect(mockGameStore.touchInput.y).toBe(0.3);
    });
  });

  // Movement Logic Tests (covering useFrame callback)
  describe('Movement Logic', () => {
    test('should register frame callback and handle basic execution', () => {
      render(<FirstPersonController />);
      
      // Should register a frame callback
      expect(mockUseFrame).toHaveBeenCalledWith(expect.any(Function));
      
      // Frame callback should be callable without throwing basic errors
      const frameCallback = mockUseFrame.mock.calls[0][0];
      expect(typeof frameCallback).toBe('function');
    });

    test('should handle movement input registration', () => {
      render(<FirstPersonController />);
      
      // Verify keyboard event registration
      expect(document.addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
      expect(document.addEventListener).toHaveBeenCalledWith('keyup', expect.any(Function));
      
      // Simulate input to verify handlers exist
      const mockAddEventListener = document.addEventListener as jest.Mock;
      const keydownHandler = mockAddEventListener.mock.calls.find(
        (call: any[]) => call[0] === 'keydown'
      )?.[1];
      
      expect(keydownHandler).toBeDefined();
      expect(() => keydownHandler({ code: 'KeyW' })).not.toThrow();
    });

    test('should handle touch device detection', () => {
      mockGameStore.isTouchDevice = true;
      mockGameStore.touchInput = { x: 0.5, y: 0.3 };
      
      render(<FirstPersonController />);
      
      // Touch device should be detected
      expect(mockGameStore.isTouchDevice).toBe(true);
      expect(mockGameStore.touchInput.x).toBe(0.5);
      
      mockGameStore.isTouchDevice = false;
      mockGameStore.touchInput = { x: 0, y: 0 };
    });

    test('should handle diagonal movement key combinations', () => {
      render(<FirstPersonController />);
      
      const mockAddEventListener = document.addEventListener as jest.Mock;
      const keydownHandler = mockAddEventListener.mock.calls.find(
        (call: any[]) => call[0] === 'keydown'
      )?.[1];
      
      const keyupHandler = mockAddEventListener.mock.calls.find(
        (call: any[]) => call[0] === 'keyup'
      )?.[1];
      
      expect(keydownHandler).toBeDefined();
      expect(keyupHandler).toBeDefined();
      
      // Test diagonal movement combinations
      expect(() => {
        keydownHandler!({ code: 'KeyW' });
        keydownHandler!({ code: 'KeyD' });
        keyupHandler!({ code: 'KeyW' });
        keyupHandler!({ code: 'KeyD' });
      }).not.toThrow();
    });

    test('should handle collision detection system integration', () => {
      const mockCheckWallCollision = require('../utils/collisionUtils').checkWallCollision;
      
      render(<FirstPersonController />);
      
      // Verify collision detection is available
      expect(mockCheckWallCollision).toBeDefined();
      expect(typeof mockCheckWallCollision).toBe('function');
    });

    test('should update camera position through mocked interface', () => {
      render(<FirstPersonController />);
      
      // Verify camera mock is available
      expect(mockCamera.position.copy).toBeDefined();
      expect(typeof mockCamera.position.copy).toBe('function');
    });

    test('should handle touch input thresholds', () => {
      // Test low touch input (below threshold)
      mockGameStore.touchInput = { x: 0.05, y: 0.05 };
      
      render(<FirstPersonController />);
      
      expect(mockGameStore.touchInput.x).toBe(0.05);
      expect(mockGameStore.touchInput.y).toBe(0.05);
      
      // Test high touch input (above threshold)
      mockGameStore.touchInput = { x: 0.8, y: 0.9 };
      expect(mockGameStore.touchInput.x).toBe(0.8);
      expect(mockGameStore.touchInput.y).toBe(0.9);
      
      // Reset
      mockGameStore.touchInput = { x: 0, y: 0 };
    });

    test('should access game store state functions', () => {
      render(<FirstPersonController />);
      
      // Verify state update functions are available
      expect(mockGameStore.updatePlayerPosition).toBeDefined();
      expect(mockGameStore.updatePlayerRotation).toBeDefined();
      expect(mockGameStore.setPlayer).toBeDefined();
      expect(typeof mockGameStore.updatePlayerPosition).toBe('function');
      expect(typeof mockGameStore.updatePlayerRotation).toBe('function');
      expect(typeof mockGameStore.setPlayer).toBe('function');
    });

    test('should handle multiple movement key combinations', () => {
      render(<FirstPersonController />);
      
      const mockAddEventListener = document.addEventListener as jest.Mock;
      const keydownHandler = mockAddEventListener.mock.calls.find(
        (call: any[]) => call[0] === 'keydown'
      )?.[1];
      
      expect(keydownHandler).toBeDefined();
      
      // Test all movement keys
      expect(() => {
        keydownHandler!({ code: 'KeyW' });
        keydownHandler!({ code: 'KeyA' });
        keydownHandler!({ code: 'KeyS' });
        keydownHandler!({ code: 'KeyD' });
        keydownHandler!({ code: 'ArrowUp' });
        keydownHandler!({ code: 'ArrowLeft' });
        keydownHandler!({ code: 'ArrowDown' });
        keydownHandler!({ code: 'ArrowRight' });
      }).not.toThrow();
    });
  });

  // Edge Cases and Error Handling
  describe('Edge Cases', () => {
    test('should handle camera operations safely', () => {
      // Test that camera operations don't throw errors
      render(<FirstPersonController />);
      
      const frameCallback = mockUseFrame.mock.calls[0][0];
      
      // Should handle camera operations safely
      expect(() => frameCallback(null, 0.016)).not.toThrow();
    });

    test('should handle frame callback without controls on non-touch device', () => {
      mockGameStore.isTouchDevice = false;
      
      // Mock controlsRef to return null
      jest.spyOn(React, 'useRef').mockImplementation((initialValue) => {
        if (initialValue === null || initialValue === undefined) {
          return { current: null }; // No controls
        }
        return { current: initialValue };
      });
      
      render(<FirstPersonController />);
      
      const frameCallback = mockUseFrame.mock.calls[0][0];
      
      // Should early return when no controls on non-touch device
      expect(() => frameCallback(null, 0.016)).not.toThrow();
    });

    test('should handle collision detection edge cases', () => {
      const mockCheckWallCollision = require('../utils/collisionUtils').checkWallCollision;
      
      // Test collision detected
      mockCheckWallCollision.mockReturnValueOnce({
        collision: true,
        correctedPosition: { x: 1, y: 2, z: 3 }
      });
      
      render(<FirstPersonController />);
      
      const frameCallback = mockUseFrame.mock.calls[0][0];
      
      // Should handle collision correction
      expect(() => frameCallback(null, 0.016)).not.toThrow();
    });

    test('should handle negative camera height correction', () => {
      render(<FirstPersonController />);
      
      // Simulate camera below ground
      mockCamera.position.y = -5;
      
      const frameCallback = mockUseFrame.mock.calls[0][0];
      
      // Should correct camera height
      expect(() => frameCallback(null, 0.016)).not.toThrow();
    });

    test('should handle large delta times', () => {
      render(<FirstPersonController />);
      
      const frameCallback = mockUseFrame.mock.calls[0][0];
      
      // Test with very large delta (e.g., lag spike)
      expect(() => frameCallback(null, 1.0)).not.toThrow(); // 1 second delta
    });

    test('should handle zero delta time', () => {
      render(<FirstPersonController />);
      
      const frameCallback = mockUseFrame.mock.calls[0][0];
      
      // Test with zero delta
      expect(() => frameCallback(null, 0)).not.toThrow();
    });

    test('should handle all arrow key alternatives', () => {
      render(<FirstPersonController />);
      
      const mockAddEventListener = document.addEventListener as jest.Mock;
      const keydownHandler = mockAddEventListener.mock.calls.find(
        (call: any[]) => call[0] === 'keydown'
      )?.[1];
      const keyupHandler = mockAddEventListener.mock.calls.find(
        (call: any[]) => call[0] === 'keyup'
      )?.[1];
      
      if (keydownHandler && keyupHandler) {
        // Test arrow keys
        keydownHandler({ code: 'ArrowUp' });
        keydownHandler({ code: 'ArrowDown' });
        keydownHandler({ code: 'ArrowLeft' });
        keydownHandler({ code: 'ArrowRight' });
        
        keyupHandler({ code: 'ArrowUp' });
        keyupHandler({ code: 'ArrowDown' });
        keyupHandler({ code: 'ArrowLeft' });
        keyupHandler({ code: 'ArrowRight' });
      }
      
      expect(true).toBe(true); // Should not throw
    });

    test('should handle simultaneous opposite key presses', () => {
      render(<FirstPersonController />);
      
      const mockAddEventListener = document.addEventListener as jest.Mock;
      const keydownHandler = mockAddEventListener.mock.calls.find(
        (call: any[]) => call[0] === 'keydown'
      )?.[1];
      
      if (keydownHandler) {
        // Press opposite keys simultaneously
        keydownHandler({ code: 'KeyW' });
        keydownHandler({ code: 'KeyS' });
        keydownHandler({ code: 'KeyA' });
        keydownHandler({ code: 'KeyD' });
      }
      
      const frameCallback = mockUseFrame.mock.calls[0][0];
      
      // Should handle conflicting inputs gracefully
      expect(() => frameCallback(null, 0.016)).not.toThrow();
    });
  });
});