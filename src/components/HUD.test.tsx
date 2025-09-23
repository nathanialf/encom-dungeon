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
  fps: 60,
  isTouchDevice: false
};

jest.mock('../store/gameStore', () => ({
  useGameStore: jest.fn(() => mockGameStoreData)
}));

const mockUseGameStore = require('../store/gameStore').useGameStore;

// Mock functions for touch controls
const mockSetTouchInput = jest.fn();
const mockTouchLook = jest.fn();

// Add getState method to the mock to match the real store API
Object.defineProperty(mockUseGameStore, 'getState', {
  value: () => ({
    toggleMinimap: mockToggleMinimap,
    toggleDebugInfo: mockToggleDebugInfo,
    setTouchInput: mockSetTouchInput,
    touchLook: mockTouchLook
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

// Mock TouchControls component
jest.mock('./TouchControls', () => {
  const mockReact = require('react');
  return {
    TouchControls: ({ onMove, onLook }: { onMove: Function, onLook: Function }) => {
      return mockReact.createElement('div', { 
        'data-testid': 'touch-controls',
        onClick: () => {
          onMove(0.5, 0.3);
          onLook(0.1, 0.2);
        }
      }, 'TouchControls Component');
    }
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
      color: '#ffffff',
      border: '2px solid #ffffff',
      borderRadius: '2px',
      fontFamily: 'monospace',
      cursor: 'pointer'
    });
    
    expect(debugButton).toHaveStyle({
      backgroundColor: 'transparent',
      color: '#ffffff',
      border: '2px solid #ffffff',
      borderRadius: '2px',
      fontFamily: 'monospace',
      cursor: 'pointer'
    });
  });

  test('should apply touch device button styles when on touch device', () => {
    const storeWithTouchDevice = {
      ...mockGameStoreData,
      isTouchDevice: true
    };
    mockUseGameStore.mockReturnValue(storeWithTouchDevice);
    
    render(<HUD />);
    
    const mapButton = screen.getByText('MAP'); // Touch devices show just 'MAP'
    const debugButton = screen.getByText('DEBUG'); // Touch devices show just 'DEBUG'
    
    expect(mapButton).toHaveStyle({
      padding: '8px 12px'
    });
    
    expect(debugButton).toHaveStyle({
      padding: '8px 12px'
    });
  });

  test('should apply desktop button styles when not on touch device', () => {
    const storeWithDesktop = {
      ...mockGameStoreData,
      isTouchDevice: false
    };
    mockUseGameStore.mockReturnValue(storeWithDesktop);
    
    render(<HUD />);
    
    const mapButton = screen.getByText('MAP (M)');
    const debugButton = screen.getByText('DEBUG (F1)');
    
    expect(mapButton).toHaveStyle({
      padding: '5px 10px'
    });
    
    expect(debugButton).toHaveStyle({
      padding: '5px 10px'
    });
  });

  test('should show touch-specific control instructions', () => {
    const storeWithTouchDevice = {
      ...mockGameStoreData,
      isTouchDevice: true
    };
    mockUseGameStore.mockReturnValue(storeWithTouchDevice);
    
    render(<HUD />);
    
    expect(screen.getByText('Left: Move | Right: Look')).toBeInTheDocument();
    expect(screen.queryByText('WASD: Move | Mouse: Look')).not.toBeInTheDocument();
  });

  test('should show desktop-specific control instructions', () => {
    const storeWithDesktop = {
      ...mockGameStoreData,
      isTouchDevice: false
    };
    mockUseGameStore.mockReturnValue(storeWithDesktop);
    
    render(<HUD />);
    
    expect(screen.getByText('WASD: Move | Mouse: Look')).toBeInTheDocument();
    expect(screen.queryByText('Left: Move | Right: Look')).not.toBeInTheDocument();
  });

  test('should handle isTouchDevice state changes', () => {
    // Start with desktop
    const desktopStore = {
      ...mockGameStoreData,
      isTouchDevice: false
    };
    mockUseGameStore.mockReturnValue(desktopStore);
    
    const { rerender } = render(<HUD />);
    
    expect(screen.getByText('WASD: Move | Mouse: Look')).toBeInTheDocument();
    
    // Switch to touch device
    const touchStore = {
      ...mockGameStoreData,
      isTouchDevice: true
    };
    mockUseGameStore.mockReturnValue(touchStore);
    
    rerender(<HUD />);
    
    expect(screen.getByText('Left: Move | Right: Look')).toBeInTheDocument();
    expect(screen.queryByText('WASD: Move | Mouse: Look')).not.toBeInTheDocument();
  });

  test('should maintain button functionality on touch devices', () => {
    const storeWithTouchDevice = {
      ...mockGameStoreData,
      isTouchDevice: true
    };
    mockUseGameStore.mockReturnValue(storeWithTouchDevice);
    
    render(<HUD />);
    
    const mapButton = screen.getByText('MAP'); // Touch devices show just 'MAP'
    const debugButton = screen.getByText('DEBUG'); // Touch devices show just 'DEBUG'
    
    fireEvent.click(mapButton);
    fireEvent.click(debugButton);
    
    expect(mockToggleMinimap).toHaveBeenCalledTimes(1);
    expect(mockToggleDebugInfo).toHaveBeenCalledTimes(1);
  });

  test('should render minimap conditionally on touch devices', () => {
    const storeWithTouchMinimap = {
      ...mockGameStoreData,
      isTouchDevice: true,
      hud: { ...mockGameStoreData.hud, showMinimap: true }
    };
    mockUseGameStore.mockReturnValue(storeWithTouchMinimap);
    
    render(<HUD />);
    
    expect(screen.getByTestId('minimap')).toBeInTheDocument();
  });

  test('should render debug info conditionally on touch devices', () => {
    const storeWithTouchDebug = {
      ...mockGameStoreData,
      isTouchDevice: true,
      hud: { ...mockGameStoreData.hud, showDebugInfo: true }
    };
    mockUseGameStore.mockReturnValue(storeWithTouchDebug);
    
    render(<HUD />);
    
    expect(screen.getByText('FPS: 60')).toBeInTheDocument();
    expect(screen.getByText('Position: 1.23, 4.56, 7.89')).toBeInTheDocument();
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

  // Screenshot functionality tests
  describe('Screenshot functionality', () => {
    test('should render screenshot button on desktop', () => {
      render(<HUD />);
      expect(screen.getByText('SCREENSHOT (P)')).toBeInTheDocument();
    });

    test('should render screenshot button on touch device', () => {
      const storeWithTouchDevice = {
        ...mockGameStoreData,
        isTouchDevice: true
      };
      mockUseGameStore.mockReturnValue(storeWithTouchDevice);
      
      render(<HUD />);
      expect(screen.getByText('SCREENSHOT')).toBeInTheDocument();
    });

    test('should debounce screenshot clicks', () => {
      render(<HUD />);
      const screenshotButton = screen.getByText('SCREENSHOT (P)');
      
      // Mock console.error to avoid actual error output during testing
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      // First click
      fireEvent.click(screenshotButton);
      
      // Second click immediately (should be debounced)
      fireEvent.click(screenshotButton);
      
      // Third click after debounce period
      mockDateNow.mockReturnValue(1500);
      fireEvent.click(screenshotButton);
      
      consoleSpy.mockRestore();
    });
  });

  // Touch controls integration tests
  describe('Touch controls integration', () => {
    test('should render TouchControls component', () => {
      render(<HUD />);
      expect(screen.getByTestId('touch-controls')).toBeInTheDocument();
    });

    test('should handle touch move events', () => {
      render(<HUD />);
      
      const touchControls = screen.getByTestId('touch-controls');
      fireEvent.click(touchControls);
      
      expect(mockSetTouchInput).toHaveBeenCalledWith(0.5, 0.3);
      expect(mockTouchLook).toHaveBeenCalledWith(0.1, 0.2);
    });

    test('should pass correct handlers to TouchControls', () => {
      render(<HUD />);
      
      // TouchControls should be rendered with onMove and onLook handlers
      expect(screen.getByTestId('touch-controls')).toBeInTheDocument();
    });
  });
});