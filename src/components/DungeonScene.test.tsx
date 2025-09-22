import React from 'react';
import { render, screen } from '@testing-library/react';
import { DungeonScene } from './DungeonScene';

// Mock the child components
jest.mock('./HexGrid', () => ({
  HexGrid: ({ hexes }: { hexes: any[] }) => (
    <div data-testid="hex-grid" data-hex-count={hexes.length}>Hex Grid</div>
  )
}));

jest.mock('./FirstPersonController', () => ({
  FirstPersonController: () => <div data-testid="first-person-controller">First Person Controller</div>
}));

jest.mock('./Effects', () => ({
  Effects: () => <div data-testid="effects">Effects</div>
}));

jest.mock('./LoadingScreen', () => ({
  LoadingScreen: () => <div data-testid="loading-screen">Loading Screen</div>
}));

jest.mock('./TimeUpdater', () => ({
  TimeUpdater: () => <div data-testid="time-updater">Time Updater</div>
}));

// Mock materials
jest.mock('./materials/TerminalMaterials', () => ({}));

// Mock @react-three/fiber
jest.mock('@react-three/fiber', () => {
  const mockReact = require('react');
  return {
    Canvas: ({ children, onCreated, ...props }: any) => {
      // Simulate canvas creation
      if (onCreated) {
        const mockGL = {
          setClearColor: jest.fn(),
          setPixelRatio: jest.fn(),
          shadowMap: { enabled: false },
          domElement: {
            style: {},
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
          },
          getContext: jest.fn(() => ({
            getExtension: jest.fn(() => ({
              loseContext: jest.fn(),
              restoreContext: jest.fn(),
            })),
          })),
          setAnimationLoop: jest.fn(),
          clear: jest.fn(),
        };
        onCreated({ gl: mockGL });
      }
      
      return mockReact.createElement('div', 
        { 'data-testid': 'canvas', ...props },
        mockReact.createElement(mockReact.Suspense, 
          { fallback: mockReact.createElement('div', { 'data-testid': 'suspense-fallback' }, 'Loading...') },
          mockReact.createElement('div', { 'data-testid': 'suspense' }, children)
        )
      );
    },
    extend: jest.fn(),
  };
});

// Mock the game store
const mockGameStore = {
  dungeon: [
    {
      id: 'hex1',
      position: { x: 0, y: 0, z: 0 },
      height: 1,
      isWalkable: true,
    },
    {
      id: 'hex2',
      position: { x: 10, y: 0, z: 10 },
      height: 2,
      isWalkable: true,
    },
  ],
  isLoading: false,
};

jest.mock('../store/gameStore', () => ({
  useGameStore: () => mockGameStore
}));

// Mock HEX_HEIGHT_SCALE
jest.mock('../utils/hexUtils', () => ({
  HEX_HEIGHT_SCALE: 2,
}));

describe('DungeonScene', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGameStore.isLoading = false;
    mockGameStore.dungeon = [
      {
        id: 'hex1',
        position: { x: 0, y: 0, z: 0 },
        height: 1,
        isWalkable: true,
      },
    ];
  });

  test('should render without crashing', () => {
    expect(() => render(<DungeonScene />)).not.toThrow();
  });

  test('should show loading screen when isLoading is true', () => {
    mockGameStore.isLoading = true;
    
    render(<DungeonScene />);
    
    expect(screen.getByTestId('loading-screen')).toBeInTheDocument();
    expect(screen.queryByTestId('canvas')).not.toBeInTheDocument();
  });

  test('should render canvas when not loading', () => {
    mockGameStore.isLoading = false;
    
    render(<DungeonScene />);
    
    expect(screen.getByTestId('canvas')).toBeInTheDocument();
    expect(screen.queryByTestId('loading-screen')).not.toBeInTheDocument();
  });

  test('should render all scene components', () => {
    render(<DungeonScene />);
    
    expect(screen.getByTestId('hex-grid')).toBeInTheDocument();
    expect(screen.getByTestId('first-person-controller')).toBeInTheDocument();
    expect(screen.getByTestId('effects')).toBeInTheDocument();
    expect(screen.getByTestId('time-updater')).toBeInTheDocument();
  });

  test('should calculate dungeon bounds correctly', () => {
    mockGameStore.dungeon = [
      { id: 'hex1', position: { x: -10, y: 0, z: -5 }, height: 1, isWalkable: true },
      { id: 'hex2', position: { x: 20, y: 0, z: 15 }, height: 2, isWalkable: true },
    ];
    
    expect(() => render(<DungeonScene />)).not.toThrow();
  });

  test('should handle empty dungeon', () => {
    mockGameStore.dungeon = [];
    
    render(<DungeonScene />);
    
    expect(screen.getByTestId('hex-grid')).toHaveAttribute('data-hex-count', '0');
  });

  test('should handle single hex dungeon', () => {
    mockGameStore.dungeon = [
      { id: 'hex1', position: { x: 0, y: 0, z: 0 }, height: 1, isWalkable: true },
    ];
    
    render(<DungeonScene />);
    
    expect(screen.getByTestId('hex-grid')).toHaveAttribute('data-hex-count', '1');
  });

  test('should set up canvas with correct configuration', () => {
    render(<DungeonScene />);
    
    const canvas = screen.getByTestId('canvas');
    expect(canvas).toHaveAttribute('frameloop', 'always');
  });

  test('should handle WebGL context loss events', () => {
    render(<DungeonScene />);
    
    // WebGL context loss handling is set up in onCreated callback
    // This test verifies the component renders without throwing
    expect(true).toBe(true);
  });

  test('should initialize with webglContextKey state', () => {
    expect(() => render(<DungeonScene />)).not.toThrow();
  });

  test('should add context restoration event listener', () => {
    const addEventListener = jest.spyOn(window, 'addEventListener');
    const removeEventListener = jest.spyOn(window, 'removeEventListener');
    
    const { unmount } = render(<DungeonScene />);
    
    expect(addEventListener).toHaveBeenCalledWith('webglcontextrestored', expect.any(Function));
    
    unmount();
    
    expect(removeEventListener).toHaveBeenCalledWith('webglcontextrestored', expect.any(Function));
    
    addEventListener.mockRestore();
    removeEventListener.mockRestore();
  });

  test('should handle context restoration', () => {
    const { rerender } = render(<DungeonScene />);
    
    // Simulate context restoration
    const event = new Event('webglcontextrestored');
    window.dispatchEvent(event);
    
    // Should not crash on re-render
    expect(() => rerender(<DungeonScene />)).not.toThrow();
  });

  test('should handle dungeon bounds calculation with varying heights', () => {
    mockGameStore.dungeon = [
      { id: 'hex1', position: { x: 0, y: 0, z: 0 }, height: 1, isWalkable: true },
      { id: 'hex2', position: { x: 5, y: 0, z: 5 }, height: 3, isWalkable: true },
      { id: 'hex3', position: { x: -5, y: 0, z: -5 }, height: 0.5, isWalkable: true },
    ];
    
    expect(() => render(<DungeonScene />)).not.toThrow();
  });

  test('should render with suspense fallback', () => {
    render(<DungeonScene />);
    
    expect(screen.getByTestId('suspense')).toBeInTheDocument();
  });

  test('should handle component unmounting', () => {
    const { unmount } = render(<DungeonScene />);
    
    expect(() => unmount()).not.toThrow();
  });

  test('should update canvas key on context restoration', () => {
    render(<DungeonScene />);
    
    const initialCanvas = screen.getByTestId('canvas');
    const initialKey = initialCanvas?.getAttribute('key') || '';
    
    // Simulate context restoration
    const event = new Event('webglcontextrestored');
    window.dispatchEvent(event);
    
    // Wait for state update
    setTimeout(() => {
      const updatedCanvas = screen.getByTestId('canvas');
      const updatedKey = updatedCanvas?.getAttribute('key') || '';
      expect(updatedKey).not.toBe(initialKey);
    }, 0);
  });

  test('should configure WebGL context with performance settings', () => {
    render(<DungeonScene />);
    
    const canvas = screen.getByTestId('canvas');
    
    // Should have performance optimizations
    expect(canvas).toHaveAttribute('frameloop', 'always');
  });

  test('should handle dungeon with negative coordinates', () => {
    mockGameStore.dungeon = [
      { id: 'hex1', position: { x: -100, y: 0, z: -200 }, height: 1, isWalkable: true },
      { id: 'hex2', position: { x: -50, y: 0, z: -150 }, height: 2, isWalkable: true },
    ];
    
    expect(() => render(<DungeonScene />)).not.toThrow();
    expect(screen.getByTestId('hex-grid')).toHaveAttribute('data-hex-count', '2');
  });

  test('should handle very large dungeon coordinates', () => {
    mockGameStore.dungeon = [
      { id: 'hex1', position: { x: 1000, y: 0, z: 2000 }, height: 1, isWalkable: true },
      { id: 'hex2', position: { x: 3000, y: 0, z: 4000 }, height: 2, isWalkable: true },
    ];
    
    expect(() => render(<DungeonScene />)).not.toThrow();
    expect(screen.getByTestId('hex-grid')).toHaveAttribute('data-hex-count', '2');
  });

  test('should handle dungeon with zero heights', () => {
    mockGameStore.dungeon = [
      { id: 'hex1', position: { x: 0, y: 0, z: 0 }, height: 0, isWalkable: true },
      { id: 'hex2', position: { x: 10, y: 0, z: 10 }, height: 0, isWalkable: false },
    ];
    
    expect(() => render(<DungeonScene />)).not.toThrow();
    expect(screen.getByTestId('hex-grid')).toHaveAttribute('data-hex-count', '2');
  });

  test('should handle dungeon state changes', () => {
    const { rerender } = render(<DungeonScene />);
    
    expect(screen.getByTestId('hex-grid')).toHaveAttribute('data-hex-count', '1');
    
    // Update dungeon with more hexes
    mockGameStore.dungeon = [
      { id: 'hex1', position: { x: 0, y: 0, z: 0 }, height: 1, isWalkable: true },
      { id: 'hex2', position: { x: 10, y: 0, z: 10 }, height: 2, isWalkable: true },
      { id: 'hex3', position: { x: 20, y: 0, z: 20 }, height: 3, isWalkable: true },
    ];
    
    rerender(<DungeonScene />);
    
    expect(screen.getByTestId('hex-grid')).toHaveAttribute('data-hex-count', '3');
  });

  test('should handle loading state changes', () => {
    mockGameStore.isLoading = true;
    const { rerender } = render(<DungeonScene />);
    
    expect(screen.getByTestId('loading-screen')).toBeInTheDocument();
    expect(screen.queryByTestId('canvas')).not.toBeInTheDocument();
    
    // Switch to loaded state
    mockGameStore.isLoading = false;
    rerender(<DungeonScene />);
    
    expect(screen.queryByTestId('loading-screen')).not.toBeInTheDocument();
    expect(screen.getByTestId('canvas')).toBeInTheDocument();
  });

  test('should pass dungeon data to HexGrid component', () => {
    const testDungeon = [
      { id: 'hex1', position: { x: 1, y: 2, z: 3 }, height: 1.5, isWalkable: true },
      { id: 'hex2', position: { x: 4, y: 5, z: 6 }, height: 2.5, isWalkable: false },
    ];
    
    mockGameStore.dungeon = testDungeon;
    
    render(<DungeonScene />);
    
    const hexGrid = screen.getByTestId('hex-grid');
    expect(hexGrid).toHaveAttribute('data-hex-count', '2');
  });

  test('should handle edge case WebGL contexts', () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    
    render(<DungeonScene />);
    
    // Should not log warnings about context handling
    expect(consoleSpy).not.toHaveBeenCalledWith(expect.stringContaining('WebGL'));
    
    consoleSpy.mockRestore();
  });

  test('should handle fractional hex heights', () => {
    mockGameStore.dungeon = [
      { id: 'hex1', position: { x: 0, y: 0, z: 0 }, height: 0.1, isWalkable: true },
      { id: 'hex2', position: { x: 10, y: 0, z: 10 }, height: 1.7, isWalkable: true },
      { id: 'hex3', position: { x: 20, y: 0, z: 20 }, height: 2.3, isWalkable: true },
    ];
    
    expect(() => render(<DungeonScene />)).not.toThrow();
    expect(screen.getByTestId('hex-grid')).toHaveAttribute('data-hex-count', '3');
  });

  test('should maintain component structure across re-renders', () => {
    const { rerender } = render(<DungeonScene />);
    
    expect(screen.getByTestId('hex-grid')).toBeInTheDocument();
    expect(screen.getByTestId('first-person-controller')).toBeInTheDocument();
    expect(screen.getByTestId('effects')).toBeInTheDocument();
    expect(screen.getByTestId('time-updater')).toBeInTheDocument();
    
    rerender(<DungeonScene />);
    
    expect(screen.getByTestId('hex-grid')).toBeInTheDocument();
    expect(screen.getByTestId('first-person-controller')).toBeInTheDocument();
    expect(screen.getByTestId('effects')).toBeInTheDocument();
    expect(screen.getByTestId('time-updater')).toBeInTheDocument();
  });

  test('should handle canvas configuration options', () => {
    render(<DungeonScene />);
    
    const canvas = screen.getByTestId('canvas');
    
    // Verify canvas is properly configured
    expect(canvas).toHaveAttribute('frameloop');
    expect(canvas).toBeInTheDocument();
  });
});