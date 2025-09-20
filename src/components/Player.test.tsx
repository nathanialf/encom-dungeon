import React from 'react';
import { render } from '@testing-library/react';
import { Player } from './Player';

// Mock @react-three/fiber completely
jest.mock('@react-three/fiber', () => ({
  extend: jest.fn(),
}));

// Mock the game store
jest.mock('../store/gameStore', () => ({
  useGameStore: () => ({
    player: {
      position: [0, 2, 0],
      rotation: [0, 0, 0],
    }
  })
}));

describe('Player', () => {
  test('should be a functional component', () => {
    expect(typeof Player).toBe('function');
  });

  test('should render without throwing', () => {
    expect(() => render(<Player />)).not.toThrow();
  });

  test('should return JSX element when called as React component', () => {
    const view = render(<Player />);
    expect(view).toBeDefined();
  });

  test('should be exported properly', () => {
    expect(Player).toBeDefined();
    expect(typeof Player).toBe('function');
  });
});