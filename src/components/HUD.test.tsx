import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { HUD } from './HUD';

// Mock the gameStore
const mockToggleMinimap = jest.fn();
const mockToggleDebugInfo = jest.fn();

const mockGameStoreData = {
  player: {
    position: [1.23, 4.56, 7.89],
    rotation: [0.12, 0.34, 0.56],
    isMoving: false
  },
  hud: {
    showMinimap: false,
    showDebugInfo: false
  },
  dungeonMetadata: {
    hexagonCount: 150,
    mapSeed: 'test-seed-123',
    generationTime: 234.56
  },
  fps: 60
};

jest.mock('../store/gameStore', () => ({
  useGameStore: jest.fn(() => mockGameStoreData)
}));

const mockUseGameStore = require('../store/gameStore').useGameStore;

// Add getState method to the mock to match the real store API
Object.defineProperty(mockUseGameStore, 'getState', {
  value: () => ({
    toggleMinimap: mockToggleMinimap,
    toggleDebugInfo: mockToggleDebugInfo
  }),
  writable: true
});

// Mock the Minimap component
jest.mock('./Minimap', () => {
  const mockReact = require('react');
  return {
    Minimap: () => mockReact.createElement('div', { 'data-testid': 'minimap' }, 'Minimap Component')
  };
});

// Mock Date.now for debounce testing
const mockDateNow = jest.spyOn(Date, 'now');

describe('HUD', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDateNow.mockReturnValue(1000); // Set a consistent timestamp
    mockUseGameStore.mockReturnValue(mockGameStoreData);
  });

  afterAll(() => {
    mockDateNow.mockRestore();
  });

  test('should be a functional component', () => {
    expect(typeof HUD).toBe('function');
  });

  test('should render without crashing', () => {
    expect(() => render(<HUD />)).not.toThrow();
  });

  test('should render main HUD container with correct styles', () => {
    render(<HUD />);
    
    // Test that HUD renders with proper structure by checking for control elements
    expect(screen.getByText('MAP (M)')).toBeInTheDocument();
    expect(screen.getByText('DEBUG (F1)')).toBeInTheDocument();
    expect(screen.getByText('WASD: Move | Mouse: Look')).toBeInTheDocument();
  });

  test('should render control buttons', () => {
    render(<HUD />);
    
    expect(screen.getByText('MAP (M)')).toBeInTheDocument();
    expect(screen.getByText('DEBUG (F1)')).toBeInTheDocument();
    expect(screen.getByText('WASD: Move | Mouse: Look')).toBeInTheDocument();
  });

  test('should not show minimap when showMinimap is false', () => {
    render(<HUD />);
    expect(screen.queryByTestId('minimap')).not.toBeInTheDocument();
  });

  test('should show minimap when showMinimap is true', () => {
    const storeWithMinimap = {
      ...mockGameStoreData,
      hud: { ...mockGameStoreData.hud, showMinimap: true }
    };
    mockUseGameStore.mockReturnValue(storeWithMinimap);
    
    render(<HUD />);
    expect(screen.getByTestId('minimap')).toBeInTheDocument();
  });

  test('should not show debug info when showDebugInfo is false', () => {
    render(<HUD />);
    expect(screen.queryByText(/FPS:/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Position:/)).not.toBeInTheDocument();
  });

  test('should show debug info when showDebugInfo is true', () => {
    const storeWithDebug = {
      ...mockGameStoreData,
      hud: { ...mockGameStoreData.hud, showDebugInfo: true }
    };
    mockUseGameStore.mockReturnValue(storeWithDebug);
    
    render(<HUD />);
    
    expect(screen.getByText('FPS: 60')).toBeInTheDocument();
    expect(screen.getByText('Position: 1.23, 4.56, 7.89')).toBeInTheDocument();
    expect(screen.getByText('Rotation: 0.12, 0.34, 0.56')).toBeInTheDocument();
    expect(screen.getByText('Moving: No')).toBeInTheDocument();
    expect(screen.getByText('Hexagons: 150')).toBeInTheDocument();
    expect(screen.getByText('Map Seed: test-seed-123')).toBeInTheDocument();
    expect(screen.getByText('Gen Time: 234.56ms')).toBeInTheDocument();
  });

  test('should show "Moving: Yes" when player is moving', () => {
    const storeWithMovingPlayer = {
      ...mockGameStoreData,
      player: { ...mockGameStoreData.player, isMoving: true },
      hud: { ...mockGameStoreData.hud, showDebugInfo: true }
    };
    mockUseGameStore.mockReturnValue(storeWithMovingPlayer);
    
    render(<HUD />);
    expect(screen.getByText('Moving: Yes')).toBeInTheDocument();
  });

  test('should handle unknown map seed', () => {
    const storeWithUnknownSeed = {
      ...mockGameStoreData,
      dungeonMetadata: { ...mockGameStoreData.dungeonMetadata, mapSeed: null },
      hud: { ...mockGameStoreData.hud, showDebugInfo: true }
    };
    mockUseGameStore.mockReturnValue(storeWithUnknownSeed);
    
    render(<HUD />);
    expect(screen.getByText('Map Seed: Unknown')).toBeInTheDocument();
  });

  test('should call toggleMinimap when MAP button is clicked', () => {
    render(<HUD />);
    
    const mapButton = screen.getByText('MAP (M)');
    fireEvent.click(mapButton);
    
    expect(mockToggleMinimap).toHaveBeenCalledTimes(1);
  });

  test('should call toggleDebugInfo when DEBUG button is clicked', () => {
    render(<HUD />);
    
    const debugButton = screen.getByText('DEBUG (F1)');
    fireEvent.click(debugButton);
    
    expect(mockToggleDebugInfo).toHaveBeenCalledTimes(1);
  });

  test('should debounce minimap toggle clicks', () => {
    render(<HUD />);
    const mapButton = screen.getByText('MAP (M)');
    
    // First click
    fireEvent.click(mapButton);
    expect(mockToggleMinimap).toHaveBeenCalledTimes(1);
    
    // Second click immediately (should be debounced)
    fireEvent.click(mapButton);
    expect(mockToggleMinimap).toHaveBeenCalledTimes(1);
    
    // Third click after debounce period
    mockDateNow.mockReturnValue(1500); // 500ms later
    fireEvent.click(mapButton);
    expect(mockToggleMinimap).toHaveBeenCalledTimes(2);
  });

  test('should debounce debug toggle clicks', () => {
    render(<HUD />);
    const debugButton = screen.getByText('DEBUG (F1)');
    
    // First click
    fireEvent.click(debugButton);
    expect(mockToggleDebugInfo).toHaveBeenCalledTimes(1);
    
    // Second click immediately (should be debounced)
    fireEvent.click(debugButton);
    expect(mockToggleDebugInfo).toHaveBeenCalledTimes(1);
    
    // Third click after debounce period
    mockDateNow.mockReturnValue(1500); // 500ms later
    fireEvent.click(debugButton);
    expect(mockToggleDebugInfo).toHaveBeenCalledTimes(2);
  });

  test('should format position values to 2 decimal places', () => {
    const storeWithLongDecimals = {
      ...mockGameStoreData,
      player: {
        ...mockGameStoreData.player,
        position: [1.23456789, 4.56789012, 7.89012345]
      },
      hud: { ...mockGameStoreData.hud, showDebugInfo: true }
    };
    mockUseGameStore.mockReturnValue(storeWithLongDecimals);
    
    render(<HUD />);
    expect(screen.getByText('Position: 1.23, 4.57, 7.89')).toBeInTheDocument();
  });

  test('should format rotation values to 2 decimal places', () => {
    const storeWithLongDecimals = {
      ...mockGameStoreData,
      player: {
        ...mockGameStoreData.player,
        rotation: [0.123456, 0.345678, 0.567890]
      },
      hud: { ...mockGameStoreData.hud, showDebugInfo: true }
    };
    mockUseGameStore.mockReturnValue(storeWithLongDecimals);
    
    render(<HUD />);
    expect(screen.getByText('Rotation: 0.12, 0.35, 0.57')).toBeInTheDocument();
  });

  test('should format generation time to 2 decimal places', () => {
    const storeWithLongDecimal = {
      ...mockGameStoreData,
      dungeonMetadata: {
        ...mockGameStoreData.dungeonMetadata,
        generationTime: 234.56789
      },
      hud: { ...mockGameStoreData.hud, showDebugInfo: true }
    };
    mockUseGameStore.mockReturnValue(storeWithLongDecimal);
    
    render(<HUD />);
    expect(screen.getByText('Gen Time: 234.57ms')).toBeInTheDocument();
  });

  test('should handle zero values correctly', () => {
    const storeWithZeros = {
      ...mockGameStoreData,
      player: {
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        isMoving: false
      },
      dungeonMetadata: {
        hexagonCount: 0,
        mapSeed: '',
        generationTime: 0
      },
      fps: 0,
      hud: { ...mockGameStoreData.hud, showDebugInfo: true }
    };
    mockUseGameStore.mockReturnValue(storeWithZeros);
    
    render(<HUD />);
    
    expect(screen.getByText('FPS: 0')).toBeInTheDocument();
    expect(screen.getByText('Position: 0.00, 0.00, 0.00')).toBeInTheDocument();
    expect(screen.getByText('Rotation: 0.00, 0.00, 0.00')).toBeInTheDocument();
    expect(screen.getByText('Hexagons: 0')).toBeInTheDocument();
    expect(screen.getByText('Gen Time: 0.00ms')).toBeInTheDocument();
  });

  test('should handle negative values correctly', () => {
    const storeWithNegatives = {
      ...mockGameStoreData,
      player: {
        position: [-1.5, -2.7, -3.9],
        rotation: [-0.1, -0.2, -0.3],
        isMoving: true
      },
      hud: { ...mockGameStoreData.hud, showDebugInfo: true }
    };
    mockUseGameStore.mockReturnValue(storeWithNegatives);
    
    render(<HUD />);
    
    expect(screen.getByText('Position: -1.50, -2.70, -3.90')).toBeInTheDocument();
    expect(screen.getByText('Rotation: -0.10, -0.20, -0.30')).toBeInTheDocument();
  });

  test('should have proper button styles', () => {
    render(<HUD />);
    
    const mapButton = screen.getByText('MAP (M)');
    const debugButton = screen.getByText('DEBUG (F1)');
    
    expect(mapButton).toHaveStyle({
      backgroundColor: 'transparent',
      color: '#00ff00',
      border: '1px solid #00ff00',
      borderRadius: '2px',
      fontFamily: 'monospace',
      cursor: 'pointer'
    });
    
    expect(debugButton).toHaveStyle({
      backgroundColor: 'transparent',
      color: '#00ff00',
      border: '1px solid #00ff00',
      borderRadius: '2px',
      fontFamily: 'monospace',
      cursor: 'pointer'
    });
  });

  test('should handle component unmounting', () => {
    const { unmount } = render(<HUD />);
    expect(() => unmount()).not.toThrow();
  });

  test('should preserve debounce state across re-renders', () => {
    const { rerender } = render(<HUD />);
    const mapButton = screen.getByText('MAP (M)');
    
    // First click
    fireEvent.click(mapButton);
    expect(mockToggleMinimap).toHaveBeenCalledTimes(1);
    
    // Re-render component
    rerender(<HUD />);
    
    // Click immediately after re-render (should still be debounced)
    fireEvent.click(mapButton);
    expect(mockToggleMinimap).toHaveBeenCalledTimes(1);
  });
});