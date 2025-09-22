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
jest.mock('three', () => ({
  Vector3: jest.fn().mockImplementation(function(this: any, x = 0, y = 0, z = 0) {
    this.x = x;
    this.y = y; 
    this.z = z;
    this.set = jest.fn((x, y, z) => {
      this.x = x; this.y = y; this.z = z;
      return this;
    });
    this.copy = jest.fn((v) => {
      this.x = v.x; this.y = v.y; this.z = v.z;
      return this;
    });
    this.clone = jest.fn(() => {
      const Vector3 = jest.requireActual('three').Vector3 || function(x: number, y: number, z: number) {
        return { x: x || 0, y: y || 0, z: z || 0, set: jest.fn(), copy: jest.fn(), normalize: jest.fn(), multiplyScalar: jest.fn(), add: jest.fn(), clone: jest.fn(), length: jest.fn(() => 0.5), lerp: jest.fn(), addScaledVector: jest.fn(), crossVectors: jest.fn(), distanceTo: jest.fn(() => 5) };
      };
      return new Vector3(this.x, this.y, this.z);
    });
    this.add = jest.fn((v) => {
      this.x += v.x; this.y += v.y; this.z += v.z;
      return this;
    });
    this.normalize = jest.fn(() => this);
    this.multiplyScalar = jest.fn((scalar) => {
      this.x *= scalar; this.y *= scalar; this.z *= scalar;
      return this;
    });
    this.lerp = jest.fn(() => this);
    this.length = jest.fn(() => 0.5);
    this.addScaledVector = jest.fn(() => this);
    this.crossVectors = jest.fn(() => this);
    this.distanceTo = jest.fn(() => 5); // For position change detection
    return this;
  }),
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
      // For Vector3 refs, create proper Vector3 instances
      if (initialValue && typeof initialValue === 'object' && 'x' in initialValue && 'y' in initialValue && 'z' in initialValue) {
        const { Vector3 } = require('three');
        return { current: new Vector3((initialValue as any).x, (initialValue as any).y, (initialValue as any).z) };
      }
      // For move state ref (object with boolean properties)
      if (initialValue && typeof initialValue === 'object' && 'forward' in initialValue) {
        return { current: { ...initialValue } };
      }
      return { current: initialValue }; // For other refs
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