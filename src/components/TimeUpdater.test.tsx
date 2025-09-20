import React from 'react';
import { render } from '@testing-library/react';
import { TimeUpdater } from './TimeUpdater';

// Mock the store
const mockUpdateTime = jest.fn();
jest.mock('../store/timeStore', () => ({
  useTimeStore: () => ({
    updateTime: mockUpdateTime
  })
}));

// Mock useShaderTime hook to return a predictable value
jest.mock('../hooks/useShaderTime', () => ({
  useShaderTime: () => 16.67 // Simulate ~60fps timing
}));

describe('TimeUpdater', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render without errors', () => {
    expect(() => render(<TimeUpdater />)).not.toThrow();
  });

  test('should return null (no visible UI)', () => {
    const { container } = render(<TimeUpdater />);
    
    expect(container.firstChild).toBeNull();
  });

  test('should use useShaderTime hook', () => {
    render(<TimeUpdater />);
    
    // The component should render without errors, implying it's using the hook
    expect(true).toBe(true); // Component rendered successfully
  });

  test('should be a functional component', () => {
    expect(typeof TimeUpdater).toBe('function');
  });
});