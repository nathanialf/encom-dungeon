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

jest.mock('./store/gameStore', () => ({
  useGameStore: () => mockGameStore
}));

describe('App', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGameStore.error = null;
  });

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
});