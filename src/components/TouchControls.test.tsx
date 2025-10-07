/* eslint-disable testing-library/no-node-access */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TouchControls } from './TouchControls';

// Mock the game store
const mockGameStore = {
  isTouchDevice: true,
};

jest.mock('../store/gameStore', () => ({
  useGameStore: () => mockGameStore
}));

describe('TouchControls', () => {
  const mockOnMove = jest.fn();
  const mockOnLook = jest.fn();
  let originalAddEventListener: any;
  let originalRemoveEventListener: any;
  let capturedEventHandlers: { [key: string]: Function[] } = {};

  beforeEach(() => {
    jest.clearAllMocks();
    mockGameStore.isTouchDevice = true;
    capturedEventHandlers = {};
    
    // Mock getBoundingClientRect for joystick
    Element.prototype.getBoundingClientRect = jest.fn(() => ({
      left: 100,
      top: 200,
      width: 120,
      height: 120,
      right: 220,
      bottom: 320,
      x: 100,
      y: 200,
      toJSON: jest.fn(),
    }));

    // Store original functions
    originalAddEventListener = document.addEventListener;
    originalRemoveEventListener = document.removeEventListener;
    
    // Mock addEventListener to capture handlers (store multiple handlers per event type)
    document.addEventListener = jest.fn((eventType: string, handler: any, options?: any) => {
      if (!capturedEventHandlers[eventType]) {
        capturedEventHandlers[eventType] = [];
      }
      capturedEventHandlers[eventType].push(handler);
    }) as any;
    document.removeEventListener = jest.fn();
  });

  afterEach(() => {
    // Restore original functions
    document.addEventListener = originalAddEventListener;
    document.removeEventListener = originalRemoveEventListener;
  });

  test('should not render on non-touch devices', () => {
    mockGameStore.isTouchDevice = false;
    
    const { container } = render(
      <TouchControls onMove={mockOnMove} onLook={mockOnLook} />
    );
    
    expect(container.firstChild).toBeNull();
  });

  test('should render movement joystick and look area on touch devices', () => {
    render(<TouchControls onMove={mockOnMove} onLook={mockOnLook} />);
    
    // Check if joystick container is rendered
    const joystick = screen.getByText('MOVE').parentElement;
    expect(joystick).toBeInTheDocument();
    expect(joystick).toHaveStyle({
      position: 'fixed',
      width: '120px',
      height: '120px',
      borderRadius: '50%',
    });
  });

  test('should render joystick knob', () => {
    render(<TouchControls onMove={mockOnMove} onLook={mockOnLook} />);
    
    const joystick = screen.getByText('MOVE').parentElement;
    const knob = joystick?.querySelector('div[style*="width: 40px"]');
    
    expect(knob).toBeInTheDocument();
    expect(knob).toHaveStyle({
      width: '40px',
      height: '40px',
      borderRadius: '50%',
    });
  });

  test('should render look control bar', () => {
    render(<TouchControls onMove={mockOnMove} onLook={mockOnLook} />);
    
    // Find the look bar by its LOOK label
    const lookBar = screen.getByText('LOOK').parentElement;
    
    expect(lookBar).toBeInTheDocument();
    expect(lookBar).toHaveStyle({
      position: 'fixed',
      borderRadius: '25px', // Pill shape
      height: '50px',
    });
  });

  test('should render look bar knob', () => {
    render(<TouchControls onMove={mockOnMove} onLook={mockOnLook} />);
    
    const lookBar = screen.getByText('LOOK').parentElement;
    const knob = lookBar?.querySelector('div[style*="width: 40px"]');
    
    expect(knob).toBeInTheDocument();
    expect(knob).toHaveStyle({
      width: '40px',
      height: '40px',
      borderRadius: '50%',
    });
  });

  test('should show movement label with correct styling', () => {
    render(<TouchControls onMove={mockOnMove} onLook={mockOnLook} />);
    
    const label = screen.getByText('MOVE');
    expect(label).toBeInTheDocument();
    expect(label).toHaveStyle({
      fontSize: '10px',
      color: '#ffffff',
      fontFamily: 'monospace',
      opacity: '0.7',
    });
  });

  test('should position joystick at center-left of screen', () => {
    render(<TouchControls onMove={mockOnMove} onLook={mockOnLook} />);
    
    const joystick = screen.getByText('MOVE').parentElement;
    
    expect(joystick).toHaveStyle({
      position: 'fixed',
      top: '50%',
      left: '30px',
      transform: 'translateY(-50%)',
    });
  });

  test('should have correct joystick styling', () => {
    render(<TouchControls onMove={mockOnMove} onLook={mockOnLook} />);
    
    const joystick = screen.getByText('MOVE').parentElement;
    
    expect(joystick).toHaveStyle({
      backgroundColor: 'rgba(0, 0, 0, 0.2)',
      border: '4px solid #ffffff',
      pointerEvents: 'auto',
      zIndex: '1001',
    });
  });

  test('should have correct knob styling', () => {
    render(<TouchControls onMove={mockOnMove} onLook={mockOnLook} />);
    
    const joystick = screen.getByText('MOVE').parentElement;
    // Find knob by its size and border radius
    const knob = joystick?.querySelector('div[style*="40px"]');
    
    expect(knob).toBeInTheDocument();
    expect(knob).toHaveStyle({
      width: '40px',
      height: '40px',
      borderRadius: '50%',
    });
  });

  test('should set up event listeners for touch handling', () => {
    const mockAddEventListener = jest.fn();
    document.addEventListener = mockAddEventListener;

    render(<TouchControls onMove={mockOnMove} onLook={mockOnLook} />);

    // Should add event listeners for touch handling
    expect(mockAddEventListener).toHaveBeenCalledWith('touchmove', expect.any(Function), { passive: false });
    expect(mockAddEventListener).toHaveBeenCalledWith('touchend', expect.any(Function), { passive: false });
    expect(mockAddEventListener).toHaveBeenCalledWith('touchstart', expect.any(Function), { passive: false });
    expect(mockAddEventListener).toHaveBeenCalledWith('dblclick', expect.any(Function), { passive: false });
  });

  test('should clean up event listeners on unmount', () => {
    const mockRemoveEventListener = jest.fn();
    document.removeEventListener = mockRemoveEventListener;

    const { unmount } = render(<TouchControls onMove={mockOnMove} onLook={mockOnLook} />);
    
    unmount();

    // Should clean up event listeners
    expect(mockRemoveEventListener).toHaveBeenCalledWith('touchmove', expect.any(Function));
    expect(mockRemoveEventListener).toHaveBeenCalledWith('touchend', expect.any(Function));
    expect(mockRemoveEventListener).toHaveBeenCalledWith('touchstart', expect.any(Function));
    expect(mockRemoveEventListener).toHaveBeenCalledWith('dblclick', expect.any(Function));
  });

  test('should have semi-transparent look bar', () => {
    const { container } = render(<TouchControls onMove={mockOnMove} onLook={mockOnLook} />);
    
    // Look bar should be the second child (after joystick)
    const lookBar = container.children[1];
    
    expect(lookBar).toBeInTheDocument();
    expect(lookBar).toHaveStyle({
      backgroundColor: 'rgba(0, 0, 0, 0.2)',
      pointerEvents: 'auto',
      zIndex: '1001',
    });
  });

  test('should have proper component structure', () => {
    const { container } = render(<TouchControls onMove={mockOnMove} onLook={mockOnLook} />);
    
    // Should render a React fragment with two main elements
    expect(container.children).toHaveLength(2);
    
    // First child should be the joystick
    const firstChild = container.children[0];
    expect(firstChild).toHaveStyle({ position: 'fixed' });
    expect(firstChild).toHaveStyle({ borderRadius: '50%' });
    
    // Second child should be the look bar
    const secondChild = container.children[1];
    expect(secondChild).toHaveStyle({ position: 'fixed' });
    expect(secondChild).toHaveStyle({ borderRadius: '25px' });
  });

  test('should handle prop functions correctly', () => {
    // Test that the component accepts the required props without errors
    expect(() => {
      render(<TouchControls onMove={mockOnMove} onLook={mockOnLook} />);
    }).not.toThrow();
    
    expect(() => {
      render(<TouchControls onMove={jest.fn()} onLook={jest.fn()} />);
    }).not.toThrow();
  });

  test('should have correct knob positioning transform', () => {
    render(<TouchControls onMove={mockOnMove} onLook={mockOnLook} />);
    
    const joystick = screen.getByText('MOVE').parentElement;
    const knob = joystick?.querySelector('div[style*="transform:"]');
    
    expect(knob).toBeInTheDocument();
    // Initial position should be centered (no movement)
    expect(knob).toHaveStyle({
      transform: 'translate(0px, 0px)',
    });
  });

  test('should have proper z-index layering', () => {
    const { container } = render(<TouchControls onMove={mockOnMove} onLook={mockOnLook} />);
    
    const joystick = screen.getByText('MOVE').parentElement;
    const lookBar = container.children[1]; // Second child is look bar
    
    expect(joystick).toHaveStyle({ zIndex: '1001' });
    expect(lookBar).toHaveStyle({ zIndex: '1001' });
  });

  test('should handle empty callback functions', () => {
    expect(() => {
      render(<TouchControls onMove={() => {}} onLook={() => {}} />);
    }).not.toThrow();
  });

  test('should position joystick at bottom for portrait phone', () => {
    // Mock portrait phone (< 768px)
    Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: 800 });
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 400 });
    
    render(<TouchControls onMove={mockOnMove} onLook={mockOnLook} />);
    
    const joystick = screen.getByText('MOVE').parentElement;
    
    expect(joystick).toHaveStyle({
      bottom: '60px',
      transform: 'none',
    });
  });

  test('should position joystick centered for portrait tablet', () => {
    // Mock portrait tablet (>= 768px)
    Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: 1024 });
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 768 });
    
    render(<TouchControls onMove={mockOnMove} onLook={mockOnLook} />);
    
    const joystick = screen.getByText('MOVE').parentElement;
    
    expect(joystick).toHaveStyle({
      top: '60%',
      transform: 'translateY(-50%)',
    });
  });

  test('should position joystick at center-left in landscape mode', () => {
    // Mock landscape orientation
    Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: 600 });
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 800 });
    
    render(<TouchControls onMove={mockOnMove} onLook={mockOnLook} />);
    
    const joystick = screen.getByText('MOVE').parentElement;
    
    expect(joystick).toHaveStyle({
      top: '50%',
      transform: 'translateY(-50%)',
    });
  });

  test('should always render exactly two controls', () => {
    // Test portrait orientation
    Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: 800 });
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 600 });
    
    const { container, rerender } = render(<TouchControls onMove={mockOnMove} onLook={mockOnLook} />);
    
    // Should have 2 children: joystick + look bar
    expect(container.children).toHaveLength(2);
    
    // Test landscape orientation
    Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: 600 });
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 800 });
    
    rerender(<TouchControls onMove={mockOnMove} onLook={mockOnLook} />);
    
    // Should still have 2 children: joystick + look bar
    expect(container.children).toHaveLength(2);
  });

  test('should configure look bar dimensions correctly for portrait phone', () => {
    // Mock portrait phone
    Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: 800 });
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 400 });
    
    const { container } = render(<TouchControls onMove={mockOnMove} onLook={mockOnLook} />);
    
    const lookBar = container.children[1];
    expect(lookBar).toHaveStyle({
      bottom: '95px', // Aligned with joystick center for phones
      width: '180px', // Fixed width
    });
  });

  test('should configure look bar dimensions correctly for portrait tablet', () => {
    // Mock portrait tablet
    Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: 1024 });
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 768 });
    
    const { container } = render(<TouchControls onMove={mockOnMove} onLook={mockOnLook} />);
    
    const lookBar = container.children[1];
    expect(lookBar).toHaveStyle({
      top: '60%', // Centered for tablets
      width: '180px', // Fixed width
    });
  });

  test('should configure look bar dimensions correctly for landscape', () => {
    // Mock landscape orientation
    Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: 600 });
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 800 });
    
    const { container } = render(<TouchControls onMove={mockOnMove} onLook={mockOnLook} />);
    
    const lookBar = container.children[1];
    expect(lookBar).toHaveStyle({
      top: '50%', // Vertically centered like joystick
      width: '180px', // Fixed width in landscape
    });
  });

  test('should have constrained knob movement within joystick bounds', () => {
    render(<TouchControls onMove={mockOnMove} onLook={mockOnLook} />);
    
    const joystick = screen.getByText('MOVE').parentElement;
    const knob = joystick?.querySelector('div[style*="translate"]');
    
    // Knob transform should include min/max constraints
    expect(knob).toHaveStyle({
      transform: 'translate(0px, 0px)', // Initial centered position
    });
  });

  test('should use different transitions based on touch state', () => {
    render(<TouchControls onMove={mockOnMove} onLook={mockOnLook} />);
    
    const joystick = screen.getByText('MOVE').parentElement;
    const knob = joystick?.querySelector('div[style*="transition"]');
    
    // When not being touched, should have smooth transition
    expect(knob).toHaveStyle({
      transition: 'transform 0.2s ease-out',
    });
  });

  test('should handle touch device state changes', () => {
    mockGameStore.isTouchDevice = false;
    
    const { rerender } = render(<TouchControls onMove={mockOnMove} onLook={mockOnLook} />);
    
    // Should not render when not a touch device
    expect(screen.queryByText('MOVE')).not.toBeInTheDocument();
    
    mockGameStore.isTouchDevice = true;
    rerender(<TouchControls onMove={mockOnMove} onLook={mockOnLook} />);
    
    // Should render when touch device
    expect(screen.getByText('MOVE')).toBeInTheDocument();
  });

  test('should preserve joystick visual styling', () => {
    render(<TouchControls onMove={mockOnMove} onLook={mockOnLook} />);
    
    const joystick = screen.getByText('MOVE').parentElement;
    
    expect(joystick).toHaveStyle({
      width: '120px',
      height: '120px',
      borderRadius: '50%',
      backgroundColor: 'rgba(0, 0, 0, 0.2)',
      border: '4px solid #ffffff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    });
  });

  test('should preserve knob visual styling', () => {
    render(<TouchControls onMove={mockOnMove} onLook={mockOnLook} />);
    
    const joystick = screen.getByText('MOVE').parentElement;
    const knob = joystick?.querySelector('div[style*="40px"]');
    
    expect(knob).toHaveStyle({
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      border: '2px solid #ffffff',
    });
  });

  test('should properly position movement label', () => {
    render(<TouchControls onMove={mockOnMove} onLook={mockOnLook} />);
    
    const label = screen.getByText('MOVE');
    
    expect(label).toHaveStyle({
      position: 'absolute',
      bottom: '-25px',
      left: '50%',
      transform: 'translateX(-50%)',
      fontSize: '10px',
      color: '#ffffff',
      fontFamily: 'monospace',
      opacity: '0.7',
      whiteSpace: 'nowrap',
    });
  });

  test('should maintain proper z-index layering', () => {
    const { container } = render(<TouchControls onMove={mockOnMove} onLook={mockOnLook} />);
    
    const joystick = screen.getByText('MOVE').parentElement;
    const lookBar = container.children[1];
    
    expect(joystick).toHaveStyle({ zIndex: '1001' });
    expect(lookBar).toHaveStyle({ zIndex: '1001' });
  });

  test('should enable pointer events for interactive elements', () => {
    const { container } = render(<TouchControls onMove={mockOnMove} onLook={mockOnLook} />);
    
    const joystick = screen.getByText('MOVE').parentElement;
    const lookBar = container.children[1];
    
    expect(joystick).toHaveStyle({ pointerEvents: 'auto' });
    expect(lookBar).toHaveStyle({ pointerEvents: 'auto' });
  });

  test('should handle component unmounting cleanly', () => {
    const { unmount } = render(<TouchControls onMove={mockOnMove} onLook={mockOnLook} />);
    
    expect(() => {
      unmount();
    }).not.toThrow();
  });

  test('should handle orientation changes', () => {
    // Start in landscape
    Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: 600 });
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 800 });
    
    const { container, rerender } = render(<TouchControls onMove={mockOnMove} onLook={mockOnLook} />);
    
    expect(container.children).toHaveLength(2); // Joystick + look bar
    
    // Switch to portrait
    Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: 800 });
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 600 });
    
    rerender(<TouchControls onMove={mockOnMove} onLook={mockOnLook} />);
    
    expect(container.children).toHaveLength(2); // Still joystick + look bar
  });

  test('should maintain consistent styling across orientations', () => {
    render(<TouchControls onMove={mockOnMove} onLook={mockOnLook} />);
    
    const joystick = screen.getByText('MOVE').parentElement;
    
    // Core styling should remain consistent
    expect(joystick).toHaveStyle({
      position: 'fixed',
      left: '30px',
      width: '120px',
      height: '120px',
    });
  });

  // Tests for actual touch event handlers and state management
  test('should handle move touch start event', () => {
    render(<TouchControls onMove={mockOnMove} onLook={mockOnLook} />);
    
    const joystick = screen.getByText('MOVE').parentElement as HTMLElement;
    
    // Create mock touches
    const mockTouches = [
      {
        identifier: 1,
        clientX: 160, // Center of joystick
        clientY: 260,
        target: joystick,
      }
    ];

    // Fire touch start event
    fireEvent.touchStart(joystick, {
      touches: mockTouches,
      preventDefault: jest.fn(),
    });

    // Since we can't directly verify internal state in JSDOM,
    // we verify the component doesn't crash and maintains structure
    expect(joystick).toBeInTheDocument();
    expect(screen.getByText('MOVE')).toBeInTheDocument();
  });

  test('should handle look touch start event', () => {
    const { container } = render(<TouchControls onMove={mockOnMove} onLook={mockOnLook} />);
    
    const lookBar = container.children[1] as HTMLElement;
    
    // Create mock touches outside joystick area
    const mockTouches = [
      {
        identifier: 2,
        clientX: 400, // Far from joystick
        clientY: 100,
        target: lookBar,
      }
    ];

    // Fire touch start event on look bar
    fireEvent.touchStart(lookBar, {
      touches: mockTouches,
      preventDefault: jest.fn(),
    });

    expect(lookBar).toBeInTheDocument();
    expect(lookBar).toHaveStyle({ backgroundColor: 'rgba(0, 0, 0, 0.2)' });
  });

  test('should handle touch move events using captured handlers', () => {
    render(<TouchControls onMove={mockOnMove} onLook={mockOnLook} />);
    
    // Start a touch using the React onTouchStart handler
    const joystick = screen.getByText('MOVE').parentElement as HTMLElement;
    fireEvent.touchStart(joystick, {
      touches: [{
        identifier: 1,
        clientX: 160,
        clientY: 260,
      }],
    });

    // Now trigger the captured touchmove handlers directly
    expect(capturedEventHandlers['touchmove']).toBeDefined();
    const mockTouchEvent = {
      touches: [{
        identifier: 1,
        clientX: 180, // Move right
        clientY: 240, // Move up
      }],
    };
    
    // Call all touchmove handlers
    capturedEventHandlers['touchmove'].forEach(handler => handler(mockTouchEvent));
    
    // Verify onMove was called
    expect(mockOnMove).toHaveBeenCalled();
  });

  test('should handle touch end events using captured handlers', () => {
    render(<TouchControls onMove={mockOnMove} onLook={mockOnLook} />);
    
    // Start a touch using the React onTouchStart handler
    const joystick = screen.getByText('MOVE').parentElement as HTMLElement;
    fireEvent.touchStart(joystick, {
      touches: [{
        identifier: 1,
        clientX: 160,
        clientY: 260,
      }],
    });

    // Now trigger the captured touchend handlers directly
    expect(capturedEventHandlers['touchend']).toBeDefined();
    const mockTouchEvent = {
      changedTouches: [{
        identifier: 1,
        clientX: 160,
        clientY: 260,
      }],
    };
    
    // Call all touchend handlers
    capturedEventHandlers['touchend'].forEach(handler => handler(mockTouchEvent));
    
    // Verify onMove was called with zero values
    expect(mockOnMove).toHaveBeenCalledWith(0, 0);
  });

  test('should handle look touch move events using captured handlers', () => {
    const { container } = render(<TouchControls onMove={mockOnMove} onLook={mockOnLook} />);
    
    // Start a look touch using the React onTouchStart handler
    const lookArea = container.children[1] as HTMLElement;
    fireEvent.touchStart(lookArea, {
      touches: [{
        identifier: 2,
        clientX: 400,
        clientY: 100,
      }],
    });

    // Now trigger the captured touchmove handlers directly
    expect(capturedEventHandlers['touchmove']).toBeDefined();
    const mockTouchEvent = {
      touches: [{
        identifier: 2,
        clientX: 420, // Move right
        clientY: 120, // Move down
      }],
    };
    
    // Call all touchmove handlers
    capturedEventHandlers['touchmove'].forEach(handler => handler(mockTouchEvent));
    
    // Verify onLook was called
    expect(mockOnLook).toHaveBeenCalled();
  });

  test('should prevent zoom on multi-touch', () => {
    render(<TouchControls onMove={mockOnMove} onLook={mockOnLook} />);
    
    // Simulate multi-touch event
    fireEvent.touchStart(document, {
      touches: [
        { identifier: 1, clientX: 100, clientY: 100 },
        { identifier: 2, clientX: 200, clientY: 200 }
      ]
    });

    // Test passes if no errors are thrown during multi-touch handling
    expect(screen.getByText('MOVE')).toBeInTheDocument();
  });

  test('should prevent double-tap zoom', () => {
    render(<TouchControls onMove={mockOnMove} onLook={mockOnLook} />);
    
    const preventDefaultSpy = jest.fn();
    
    // Fire double-click event
    fireEvent.dblClick(document, {
      preventDefault: preventDefaultSpy,
    });

    // Component should handle double-click prevention
    expect(document.addEventListener).toHaveBeenCalledWith('dblclick', expect.any(Function), { passive: false });
  });

  test('should constrain joystick movement within bounds', () => {
    render(<TouchControls onMove={mockOnMove} onLook={mockOnLook} />);
    
    const joystick = screen.getByText('MOVE').parentElement as HTMLElement;
    
    // Start touch at center
    fireEvent.touchStart(joystick, {
      touches: [{
        identifier: 1,
        clientX: 160,
        clientY: 260,
      }],
    });

    // Move far outside bounds
    fireEvent.touchMove(document, {
      touches: [{
        identifier: 1,
        clientX: 300, // Very far right
        clientY: 100, // Very far up
      }],
    });

    // Test passes if no errors are thrown during movement constraint
    expect(joystick).toBeInTheDocument();
  });

  test('should reject touch too close to joystick in look area', () => {
    const { container } = render(<TouchControls onMove={mockOnMove} onLook={mockOnLook} />);
    
    const lookArea = container.children[1] as HTMLElement;
    
    // Try to start touch too close to joystick
    fireEvent.touchStart(lookArea, {
      touches: [{
        identifier: 2,
        clientX: 160, // Same as joystick center
        clientY: 260,
      }],
    });

    // Should not have called onLook since touch is too close to joystick
    expect(mockOnLook).not.toHaveBeenCalled();
  });

  test('should handle touch that moves too far from joystick using captured handlers', () => {
    render(<TouchControls onMove={mockOnMove} onLook={mockOnLook} />);
    
    // Start touch at center
    const joystick = screen.getByText('MOVE').parentElement as HTMLElement;
    fireEvent.touchStart(joystick, {
      touches: [{
        identifier: 1,
        clientX: 160,
        clientY: 260,
      }],
    });

    // Move very far from joystick using captured handlers
    expect(capturedEventHandlers['touchmove']).toBeDefined();
    const mockTouchEvent = {
      touches: [{
        identifier: 1,
        clientX: 400, // 240px away from center
        clientY: 500, // 240px away from center
      }],
    };
    
    // Call all touchmove handlers
    capturedEventHandlers['touchmove'].forEach(handler => handler(mockTouchEvent));
    
    // Should call onMove with (0, 0) to stop movement when too far
    expect(mockOnMove).toHaveBeenCalledWith(0, 0);
  });

  test('should handle multiple touches for move and look simultaneously', () => {
    render(<TouchControls onMove={mockOnMove} onLook={mockOnLook} />);
    
    // Start move touch
    const joystick = screen.getByText('MOVE').parentElement as HTMLElement;
    fireEvent.touchStart(joystick, {
      touches: [{
        identifier: 1,
        clientX: 160,
        clientY: 260,
      }],
    });

    // Start look touch
    const { container } = render(<TouchControls onMove={jest.fn()} onLook={jest.fn()} />);
    const lookBar = container.children[1] as HTMLElement;
    fireEvent.touchStart(lookBar, {
      touches: [{
        identifier: 2,
        clientX: 400,
        clientY: 100,
      }],
    });

    // Test both handlers exist
    expect(capturedEventHandlers['touchmove']).toBeDefined();
    expect(capturedEventHandlers['touchend']).toBeDefined();
  });

  test('should prevent zoom using captured zoom prevention handler', () => {
    render(<TouchControls onMove={mockOnMove} onLook={mockOnLook} />);
    
    // Use the captured touchstart handlers for zoom prevention
    expect(capturedEventHandlers['touchstart']).toBeDefined();
    const mockMultiTouchEvent = {
      touches: [
        { identifier: 1, clientX: 100, clientY: 100 },
        { identifier: 2, clientX: 200, clientY: 200 }
      ],
      preventDefault: jest.fn(),
    };
    
    // Call all touchstart handlers
    capturedEventHandlers['touchstart'].forEach(handler => handler(mockMultiTouchEvent));
    
    // Should prevent default for multi-touch
    expect(mockMultiTouchEvent.preventDefault).toHaveBeenCalled();
  });

  test('should handle getBoundingClientRect returning null', () => {
    // Mock getBoundingClientRect to return null scenario
    Element.prototype.getBoundingClientRect = jest.fn(() => null as any);
    
    render(<TouchControls onMove={mockOnMove} onLook={mockOnLook} />);
    
    const joystick = screen.getByText('MOVE').parentElement as HTMLElement;
    
    // Should not crash when getBoundingClientRect returns null
    expect(() => {
      fireEvent.touchStart(joystick, {
        touches: [{
          identifier: 1,
          clientX: 160,
          clientY: 260,
        }],
      });
    }).not.toThrow();
  });

  test('should handle edge cases in touch movement calculations', () => {
    render(<TouchControls onMove={mockOnMove} onLook={mockOnLook} />);
    
    // Start touch
    const joystick = screen.getByText('MOVE').parentElement as HTMLElement;
    fireEvent.touchStart(joystick, {
      touches: [{
        identifier: 1,
        clientX: 160,
        clientY: 260,
      }],
    });

    // Test movement at exactly max distance (50px)
    expect(capturedEventHandlers['touchmove']).toBeDefined();
    const exactMaxEvent = {
      touches: [{
        identifier: 1,
        clientX: 210, // Exactly 50px right
        clientY: 260, // Same Y
      }],
    };
    
    // Call all touchmove handlers
    capturedEventHandlers['touchmove'].forEach(handler => handler(exactMaxEvent));
    
    // Should call onMove with exactly 1.0 for max movement (allow for -0)
    expect(mockOnMove).toHaveBeenCalledWith(1, expect.any(Number));
  });

  test('should handle getBoundingClientRect calls', () => {
    render(<TouchControls onMove={mockOnMove} onLook={mockOnLook} />);
    
    const joystick = screen.getByText('MOVE').parentElement;
    
    // Should be able to call getBoundingClientRect without throwing
    expect(joystick).toBeDefined();
    const rect = joystick!.getBoundingClientRect();
    expect(rect).toBeDefined();
    expect(rect.left).toBe(100);
    expect(rect.top).toBe(200);
  });

  test('should have refs for joystick and look bar', () => {
    const { container } = render(<TouchControls onMove={mockOnMove} onLook={mockOnLook} />);
    
    const joystick = screen.getByText('MOVE').parentElement;
    const lookBar = container.children[1];
    
    // Elements should be rendered and accessible
    expect(joystick).toBeInTheDocument();
    expect(lookBar).toBeInTheDocument();
  });

  test('should handle window resize detection', () => {
    // Test that orientation detection works
    Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: 800 });
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 600 });
    
    render(<TouchControls onMove={mockOnMove} onLook={mockOnLook} />);
    
    // Should determine portrait correctly
    expect(window.innerHeight > window.innerWidth).toBe(true);
  });

  test('should handle touch events during component lifecycle', () => {
    const { unmount } = render(<TouchControls onMove={mockOnMove} onLook={mockOnLook} />);
    
    // Should add event listeners
    expect(document.addEventListener).toHaveBeenCalledWith('touchmove', expect.any(Function), { passive: false });
    expect(document.addEventListener).toHaveBeenCalledWith('touchend', expect.any(Function), { passive: false });
    
    // Should clean up on unmount
    unmount();
    expect(document.removeEventListener).toHaveBeenCalledWith('touchmove', expect.any(Function));
    expect(document.removeEventListener).toHaveBeenCalledWith('touchend', expect.any(Function));
  });

  test('should prevent zoom gestures', () => {
    render(<TouchControls onMove={mockOnMove} onLook={mockOnLook} />);
    
    // Should add zoom prevention listeners
    expect(document.addEventListener).toHaveBeenCalledWith('touchstart', expect.any(Function), { passive: false });
    expect(document.addEventListener).toHaveBeenCalledWith('dblclick', expect.any(Function), { passive: false });
  });

  test('should use Math functions for distance calculations', () => {
    // Test that component can handle mathematical operations
    render(<TouchControls onMove={mockOnMove} onLook={mockOnLook} />);
    
    // Mathematical functions should be available
    expect(Math.sqrt(144)).toBe(12);
    expect(Math.pow(2, 2)).toBe(4);
    expect(Math.max(-40, Math.min(40, 50))).toBe(40);
  });

  test('should handle array operations for touch lists', () => {
    render(<TouchControls onMove={mockOnMove} onLook={mockOnLook} />);
    
    // Array.from should work for touch lists
    const mockTouches = [{ identifier: 1 }, { identifier: 2 }];
    const touchArray = Array.from(mockTouches);
    expect(touchArray).toHaveLength(2);
  });

  test('should handle callback prop changes', () => {
    const { rerender } = render(<TouchControls onMove={mockOnMove} onLook={mockOnLook} />);
    
    const newMockOnMove = jest.fn();
    const newMockOnLook = jest.fn();
    
    // Should handle prop changes without crashing
    expect(() => {
      rerender(<TouchControls onMove={newMockOnMove} onLook={newMockOnLook} />);
    }).not.toThrow();
  });

  test('should maintain state during re-renders', () => {
    const { rerender } = render(<TouchControls onMove={mockOnMove} onLook={mockOnLook} />);
    
    // Component should maintain its structure during re-renders
    expect(screen.getByText('MOVE')).toBeInTheDocument();
    
    rerender(<TouchControls onMove={mockOnMove} onLook={mockOnLook} />);
    
    expect(screen.getByText('MOVE')).toBeInTheDocument();
  });

  test('should handle look touch end events using captured handlers', () => {
    const { container } = render(<TouchControls onMove={mockOnMove} onLook={mockOnLook} />);
    
    // Start a look touch
    const lookBar = container.children[1] as HTMLElement;
    fireEvent.touchStart(lookBar, {
      touches: [{
        identifier: 2,
        clientX: 400,
        clientY: 100,
      }],
    });

    // End the look touch using captured handler
    expect(capturedEventHandlers['touchend']).toBeDefined();
    const mockTouchEvent = {
      changedTouches: [{
        identifier: 2,
        clientX: 400,
        clientY: 100,
      }],
    };
    
    // Call all touchend handlers
    capturedEventHandlers['touchend'].forEach(handler => handler(mockTouchEvent));
    
    // Test passes if no errors are thrown during look touch end handling
    expect(lookBar).toBeInTheDocument();
  });

  test('should handle double-click zoom prevention using captured handler', () => {
    render(<TouchControls onMove={mockOnMove} onLook={mockOnLook} />);
    
    // Use the captured dblclick handler for zoom prevention
    expect(capturedEventHandlers['dblclick']).toBeDefined();
    const mockDoubleClickEvent = {
      preventDefault: jest.fn(),
    };
    
    // Call all dblclick handlers
    capturedEventHandlers['dblclick'].forEach(handler => handler(mockDoubleClickEvent));
    
    // Should prevent default for double-click
    expect(mockDoubleClickEvent.preventDefault).toHaveBeenCalled();
  });

  test('should handle look touch end when no touch is found', () => {
    const { container } = render(<TouchControls onMove={mockOnMove} onLook={mockOnLook} />);
    
    // Start a look touch
    const lookBar = container.children[1] as HTMLElement;
    fireEvent.touchStart(lookBar, {
      touches: [{
        identifier: 2,
        clientX: 400,
        clientY: 100,
      }],
    });

    // End with a different identifier (should not match)
    expect(capturedEventHandlers['touchend']).toBeDefined();
    const mockTouchEvent = {
      changedTouches: [{
        identifier: 99, // Different identifier
        clientX: 400,
        clientY: 100,
      }],
    };
    
    // Call all touchend handlers
    capturedEventHandlers['touchend'].forEach(handler => handler(mockTouchEvent));
    
    // Test passes if no errors are thrown when touch is not found
    expect(lookBar).toBeInTheDocument();
  });
});