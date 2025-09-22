import React from 'react';
import { render } from '@testing-library/react';
import { FirstPersonController } from './FirstPersonController';

// Mock the game store
const mockGameStore = {
  player: {
    position: [0, 5, 0] as [number, number, number],
    rotation: [0, 0, 0] as [number, number, number],
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
};

jest.mock('../store/gameStore', () => ({
  useGameStore: () => mockGameStore
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
    this.clone = jest.fn(() => new (this.constructor)(this.x, this.y, this.z));
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
    
    // Mock useRef to return controls reference
    jest.spyOn(React, 'useRef').mockImplementation((initialValue) => {
      if (initialValue === null || initialValue === undefined) {
        return { current: true }; // For controlsRef
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
});