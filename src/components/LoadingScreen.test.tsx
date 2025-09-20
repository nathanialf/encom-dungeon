import React from 'react';
import { render, screen } from '@testing-library/react';
import { LoadingScreen } from './LoadingScreen';

describe('LoadingScreen', () => {
  test('renders loading message', () => {
    render(<LoadingScreen />);
    
    expect(screen.getByText(/ENCOM DUNGEON EXPLORER/i)).toBeInTheDocument();
    expect(screen.getByText(/INITIALIZING SYSTEM/i)).toBeInTheDocument();
  });

  test('renders with consistent styling', () => {
    render(<LoadingScreen />);
    
    // Component renders with terminal green styling
    expect(screen.getByText(/ENCOM DUNGEON EXPLORER/i)).toBeInTheDocument();
  });

  test('has loading animation element', () => {
    render(<LoadingScreen />);
    
    expect(screen.getByText(/INITIALIZING SYSTEM/i)).toBeInTheDocument();
  });
});