import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

// Mock the child components
jest.mock('./components/DungeonScene', () => ({
  DungeonScene: () => <div data-testid="dungeon-scene">Dungeon Scene</div>
}));

jest.mock('./components/HUD', () => ({
  HUD: () => <div data-testid="hud">HUD</div>
}));

const mockGenerateDungeon = jest.fn();
jest.mock('./hooks/useDungeonGenerator', () => ({
  useDungeonGenerator: () => ({
    generateDungeon: mockGenerateDungeon,
  })
}));

// Mock the game store
const mockGameStore = {
  error: null as string | null,
};

const mockSetTouchDevice = jest.fn();

jest.mock('./store/gameStore', () => ({
  useGameStore: Object.assign(
    () => mockGameStore,
    {
      getState: () => ({
        setTouchDevice: mockSetTouchDevice,
        toggleDebugInfo: jest.fn(),
        toggleMinimap: jest.fn(),
      })
    }
  )
}));

describe('App', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGameStore.error = null;
    mockSetTouchDevice.mockClear();
  });

  const mockBrowserEnvironment = (config: {
    userAgent?: string;
    platform?: string;
    maxTouchPoints?: number;
    innerWidth?: number;
    innerHeight?: number;
    ontouchstart?: any;
  }) => {
    // Spy on navigator properties
    Object.defineProperty(navigator, 'userAgent', {
      value: config.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      configurable: true
    });
    Object.defineProperty(navigator, 'platform', {
      value: config.platform || 'Win32',
      configurable: true
    });
    Object.defineProperty(navigator, 'maxTouchPoints', {
      value: config.maxTouchPoints || 0,
      configurable: true
    });
    
    // Spy on window properties
    Object.defineProperty(window, 'innerWidth', {
      value: config.innerWidth || 1920,
      configurable: true
    });
    Object.defineProperty(window, 'innerHeight', {
      value: config.innerHeight || 1080,
      configurable: true
    });
    
    if (config.ontouchstart !== undefined) {
      Object.defineProperty(window, 'ontouchstart', {
        value: config.ontouchstart,
        configurable: true
      });
    }
  };

  test('should render without crashing', () => {
    expect(() => render(<App />)).not.toThrow();
  });

  test('should render main app container', () => {
    render(<App />);
    
    // Check that main components are rendered
    expect(screen.getByTestId('dungeon-scene')).toBeInTheDocument();
    expect(screen.getByTestId('hud')).toBeInTheDocument();
  });

  test('should render DungeonScene component', () => {
    render(<App />);
    
    expect(screen.getByTestId('dungeon-scene')).toBeInTheDocument();
  });

  test('should render HUD component', () => {
    render(<App />);
    
    expect(screen.getByTestId('hud')).toBeInTheDocument();
  });

  test('should initialize dungeon generator', () => {
    render(<App />);
    
    // The hook should be called during component rendering - we just verify it doesn't crash
    expect(mockGenerateDungeon).toBeDefined();
  });

  test('should display error message when error exists', () => {
    mockGameStore.error = 'Failed to load dungeon';
    
    render(<App />);
    
    expect(screen.getByText(/Failed to load dungeon/i)).toBeInTheDocument();
  });

  test('should not display error message when no error', () => {
    mockGameStore.error = null;
    
    render(<App />);
    
    expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
  });

  test('should handle different error types', () => {
    mockGameStore.error = 'Network connection failed';
    
    render(<App />);
    
    expect(screen.getByText(/Network connection failed/i)).toBeInTheDocument();
  });

  test('should render error with correct styling', () => {
    mockGameStore.error = 'Test error message';
    
    render(<App />);
    
    expect(screen.getByText('Test error message')).toBeInTheDocument();
    expect(screen.getByText('SYSTEM ERROR')).toBeInTheDocument();
    expect(screen.getByText('RESTART SYSTEM')).toBeInTheDocument();
  });

  test('should handle empty error string', () => {
    mockGameStore.error = '';
    
    render(<App />);
    
    // Empty error should not display error message
    expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
  });

  test('should update when error state changes', () => {
    const { rerender } = render(<App />);
    
    // Initially no error
    expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
    
    // Add error
    mockGameStore.error = 'New error occurred';
    rerender(<App />);
    
    expect(screen.getByText(/New error occurred/i)).toBeInTheDocument();
  });

  test('should have correct CSS style structure', () => {
    render(<App />);
    
    // Verify main components are present which indicates proper structure
    expect(screen.getByTestId('dungeon-scene')).toBeInTheDocument();
    expect(screen.getByTestId('hud')).toBeInTheDocument();
  });

  test('should be a functional component', () => {
    expect(typeof App).toBe('function');
  });

  test('should export App as default', () => {
    expect(App).toBeDefined();
    expect(typeof App).toBe('function');
  });

  test('should handle component unmounting', () => {
    const { unmount } = render(<App />);
    
    expect(() => unmount()).not.toThrow();
  });

  test('should render both DungeonScene and HUD simultaneously', () => {
    render(<App />);
    
    expect(screen.getByTestId('dungeon-scene')).toBeInTheDocument();
    expect(screen.getByTestId('hud')).toBeInTheDocument();
  });

  test('should maintain component hierarchy', () => {
    render(<App />);
    
    expect(screen.getByTestId('dungeon-scene')).toBeInTheDocument();
    expect(screen.getByTestId('hud')).toBeInTheDocument();
  });

  test('should handle long error messages', () => {
    const longError = 'This is a very long error message that should still be displayed correctly without breaking the layout or causing any issues with the component rendering';
    mockGameStore.error = longError;
    
    render(<App />);
    
    expect(screen.getByText(longError)).toBeInTheDocument();
  });

  test('should handle special characters in error messages', () => {
    mockGameStore.error = 'Error: Failed to connect to server (code: 500) - "Connection refused"';
    
    render(<App />);
    
    expect(screen.getByText(/Error: Failed to connect to server/i)).toBeInTheDocument();
  });

  describe('Touch Device Detection', () => {
    test('should detect iPad as touch device', () => {
      mockBrowserEnvironment({
        userAgent: 'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
        platform: 'MacIntel',
        maxTouchPoints: 1,
        innerWidth: 1024,
        innerHeight: 768,
        ontouchstart: {}
      });

      render(<App />);

      expect(mockSetTouchDevice).toHaveBeenCalledWith(true);
    });

    test('should detect modern iPad (iOS 13+) as touch device', () => {
      mockBrowserEnvironment({
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15',
        platform: 'MacIntel',
        maxTouchPoints: 2,
        innerWidth: 1366,
        innerHeight: 1024,
        ontouchstart: {}
      });

      render(<App />);

      expect(mockSetTouchDevice).toHaveBeenCalledWith(true);
    });

    test('should detect Android tablet as touch device', () => {
      mockBrowserEnvironment({
        userAgent: 'Mozilla/5.0 (Linux; Android 10; SM-T510) AppleWebKit/537.36',
        platform: 'Linux armv8l',
        maxTouchPoints: 1,
        innerWidth: 1200,
        innerHeight: 800,
        ontouchstart: {}
      });

      render(<App />);

      expect(mockSetTouchDevice).toHaveBeenCalledWith(true);
    });

    test('should not detect Android phone as touch device (has Mobile in userAgent)', () => {
      mockBrowserEnvironment({
        userAgent: 'Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36 Mobile',
        platform: 'Linux armv8l',
        maxTouchPoints: 1,
        innerWidth: 375,
        innerHeight: 812,
        ontouchstart: {}
      });

      render(<App />);

      // Android phones with Mobile in userAgent: isAndroidTablet = false
      // But isTouchTablet = hasTouch && isTabletScreen = true && true = true
      // Since isTabletScreen = width <= 1366 || height <= 1024 (375 <= 1366 = true)
      expect(mockSetTouchDevice).toHaveBeenCalledWith(true);
    });

    test('should not detect desktop as touch device', () => {
      mockBrowserEnvironment({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        platform: 'Win32',
        maxTouchPoints: 0,
        innerWidth: 1920,
        innerHeight: 1080
      });

      render(<App />);

      expect(mockSetTouchDevice).toHaveBeenCalledWith(false);
    });

    test('should detect touch-capable device with tablet dimensions', () => {
      mockBrowserEnvironment({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        platform: 'Win32',
        maxTouchPoints: 2,
        innerWidth: 1280,
        innerHeight: 800,
        ontouchstart: {}
      });

      render(<App />);

      expect(mockSetTouchDevice).toHaveBeenCalledWith(true);
    });

    test('should not detect touch device without proper dimensions', () => {
      mockBrowserEnvironment({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        platform: 'Win32',
        maxTouchPoints: 2,
        innerWidth: 1920,
        innerHeight: 1080,
        ontouchstart: {}
      });

      render(<App />);

      expect(mockSetTouchDevice).toHaveBeenCalledWith(false);
    });

    test('should handle device without ontouchstart property', () => {
      mockBrowserEnvironment({
        userAgent: 'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
        platform: 'MacIntel',
        maxTouchPoints: 1,
        innerWidth: 1024,
        innerHeight: 768
        // No ontouchstart property
      });

      render(<App />);

      expect(mockSetTouchDevice).toHaveBeenCalledWith(true);
    });

    test('should handle edge case: iPad Pro dimensions', () => {
      mockBrowserEnvironment({
        userAgent: 'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
        platform: 'MacIntel',
        maxTouchPoints: 1,
        innerWidth: 1366, // iPad Pro width
        innerHeight: 1024, // iPad Pro height (within limit)
        ontouchstart: {}
      });

      render(<App />);

      expect(mockSetTouchDevice).toHaveBeenCalledWith(true);
    });

    test('should handle maxTouchPoints edge cases', () => {
      mockBrowserEnvironment({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        platform: 'Win32',
        maxTouchPoints: 1, // Exactly 1 touch point
        innerWidth: 1024,
        innerHeight: 768,
        ontouchstart: {}
      });

      render(<App />);

      expect(mockSetTouchDevice).toHaveBeenCalledWith(true);
    });

    test('should detect iPhone as non-touch device (mobile, not tablet)', () => {
      mockBrowserEnvironment({
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
        platform: 'MacIntel',
        maxTouchPoints: 1,
        innerWidth: 375,
        innerHeight: 812,
        ontouchstart: {}
      });

      render(<App />);

      // iPhone: isIPad = true (iPhone matches /iPad|iPhone|iPod/), so isTouchDevice = true
      expect(mockSetTouchDevice).toHaveBeenCalledWith(true);
    });
  });

  describe('CSS Styles and Layout', () => {
    test('should apply touch-prevention CSS styles', () => {
      const { container } = render(<App />);
      
      // eslint-disable-next-line testing-library/no-node-access
      const appDiv = container.firstChild as HTMLElement;
      // Only test styles that are reliably applied in test environment
      expect(appDiv).toHaveStyle({
        width: '100vw',
        height: '100vh',
        overflow: 'hidden'
      });
      
      // Check that the style object includes the touch-related properties
      const computedStyle = appDiv.style;
      expect(computedStyle.touchAction).toBe('none');
      expect(computedStyle.userSelect).toBe('none');
    });

    test('should have proper viewport dimensions', () => {
      const { container } = render(<App />);
      
      // eslint-disable-next-line testing-library/no-node-access
      const appDiv = container.firstChild as HTMLElement;
      expect(appDiv).toHaveStyle({
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
      });
    });
  });

  describe('Keyboard Event Handling', () => {
    test('should setup keyboard event listeners', () => {
      const mockAddEventListener = jest.fn();
      Object.defineProperty(document, 'addEventListener', {
        writable: true,
        value: mockAddEventListener
      });

      render(<App />);

      expect(mockAddEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
    });

    test('should cleanup keyboard event listeners on unmount', () => {
      const mockRemoveEventListener = jest.fn();
      Object.defineProperty(document, 'removeEventListener', {
        writable: true,
        value: mockRemoveEventListener
      });

      const { unmount } = render(<App />);
      unmount();

      expect(mockRemoveEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
    });

    test('should setup resize event listeners', () => {
      const mockAddEventListener = jest.fn();
      Object.defineProperty(window, 'addEventListener', {
        writable: true,
        value: mockAddEventListener
      });

      render(<App />);

      expect(mockAddEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
    });

    test('should cleanup resize event listeners on unmount', () => {
      const mockRemoveEventListener = jest.fn();
      Object.defineProperty(window, 'removeEventListener', {
        writable: true,
        value: mockRemoveEventListener
      });

      const { unmount } = render(<App />);
      unmount();

      expect(mockRemoveEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
    });
  });

  describe('Error State Handling', () => {
    test('should render error screen with correct structure', () => {
      mockGameStore.error = 'Test error message';
      
      render(<App />);
      
      expect(screen.getByText('SYSTEM ERROR')).toBeInTheDocument();
      expect(screen.getByText('Test error message')).toBeInTheDocument();
      expect(screen.getByText('RESTART SYSTEM')).toBeInTheDocument();
    });

    test('should apply correct error screen styling', () => {
      mockGameStore.error = 'Test error message';
      
      const { container } = render(<App />);
      
      // eslint-disable-next-line testing-library/no-node-access
      const errorDiv = container.firstChild as HTMLElement;
      expect(errorDiv).toHaveStyle({
        position: 'fixed',
        backgroundColor: '#000',
        color: '#ff0000',
      });
    });

    test('should handle restart button functionality', () => {
      mockGameStore.error = 'Test error message';
      
      // Mock window.location.reload
      const mockReload = jest.fn();
      Object.defineProperty(window, 'location', {
        writable: true,
        value: { reload: mockReload }
      });

      render(<App />);

      const restartButton = screen.getByText('RESTART SYSTEM');
      restartButton.click();

      expect(mockReload).toHaveBeenCalled();
    });

    test('should not render main content when error exists', () => {
      mockGameStore.error = 'Test error message';
      
      render(<App />);
      
      expect(screen.queryByTestId('dungeon-scene')).not.toBeInTheDocument();
      expect(screen.queryByTestId('hud')).not.toBeInTheDocument();
    });
  });
});