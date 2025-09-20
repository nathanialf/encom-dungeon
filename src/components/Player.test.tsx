import React from 'react';
import { Player } from './Player';

// Mock @react-three/fiber completely
jest.mock('@react-three/fiber', () => ({
  extend: jest.fn(),
}));

describe('Player', () => {
  test('should be a functional component', () => {
    expect(typeof Player).toBe('function');
  });

  test('should not throw when called', () => {
    expect(() => {
      Player({});
    }).not.toThrow();
  });

  test('should return JSX element', () => {
    const result = Player({});
    expect(result).toBeDefined();
  });

  test('should be exported properly', () => {
    expect(Player).toBeDefined();
    expect(typeof Player).toBe('function');
  });
});