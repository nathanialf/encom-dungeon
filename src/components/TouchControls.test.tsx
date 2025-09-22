/* eslint-disable testing-library/no-node-access */
import React from 'react';
import { render, screen } from '@testing-library/react';
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

  beforeEach(() => {
    jest.clearAllMocks();
    mockGameStore.isTouchDevice = true;
    
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
    
    // Mock addEventListener and removeEventListener
    document.addEventListener = jest.fn();
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

  test('should render look control area', () => {
    render(<TouchControls onMove={mockOnMove} onLook={mockOnLook} />);
    
    // Find the look area (invisible overlay on the right)
    const elements = document.querySelectorAll('[style*="position: fixed"]');
    const lookArea = Array.from(elements).find(el => 
      el.getAttribute('style')?.includes('right: 0') &&
      el.getAttribute('style')?.includes('left: 200px')
    );
    
    expect(lookArea).toBeInTheDocument();
    expect(lookArea).toHaveStyle({
      position: 'fixed',
      top: '0',
      right: '0',
      bottom: '0',
      left: '200px',
    });
  });

  test('should show movement label with correct styling', () => {
    render(<TouchControls onMove={mockOnMove} onLook={mockOnLook} />);
    
    const label = screen.getByText('MOVE');
    expect(label).toBeInTheDocument();
    expect(label).toHaveStyle({
      fontSize: '10px',
      color: '#00ff00',
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
      backgroundColor: 'rgba(0, 255, 0, 0.2)',
      border: '2px solid rgba(0, 255, 0, 0.5)',
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

  test('should have transparent look area', () => {
    const { container } = render(<TouchControls onMove={mockOnMove} onLook={mockOnLook} />);
    
    // Look area should be the second child (after joystick)
    const lookArea = container.children[1];
    
    expect(lookArea).toBeInTheDocument();
    expect(lookArea).toHaveStyle({
      backgroundColor: 'transparent',
      pointerEvents: 'auto',
      zIndex: '1000',
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
    
    // Second child should be the look area
    const secondChild = container.children[1];
    expect(secondChild).toHaveStyle({ position: 'fixed' });
    expect(secondChild).toHaveStyle({ backgroundColor: 'transparent' });
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
    const lookArea = container.children[1]; // Second child is look area
    
    expect(joystick).toHaveStyle({ zIndex: '1001' });
    expect(lookArea).toHaveStyle({ zIndex: '1000' });
  });

  test('should handle empty callback functions', () => {
    expect(() => {
      render(<TouchControls onMove={() => {}} onLook={() => {}} />);
    }).not.toThrow();
  });
});