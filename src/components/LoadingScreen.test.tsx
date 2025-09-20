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
    const { container } = render(<LoadingScreen />);
    
    expect(container.firstChild).toHaveStyle({
      position: 'fixed',
      top: '0px',
      left: '0px',
      width: '100vw',
      height: '100vh'
    });
  });

  test('has loading animation element', () => {
    const { container } = render(<LoadingScreen />);
    
    const loadingBar = container.querySelector('div[style*="animation: loading"]');
    expect(loadingBar).toBeInTheDocument();
  });
});