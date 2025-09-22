import React from 'react';
import { render } from '@testing-library/react';
import { HexTile } from './HexTile';
import { DungeonHex } from '../types';

// Mock Three.js globally
(global as any).THREE = {
  BoxGeometry: jest.fn(() => ({ dispose: jest.fn() })),
  CylinderGeometry: jest.fn(() => ({ dispose: jest.fn() })),
  Float32BufferAttribute: jest.fn(),
  BufferGeometry: jest.fn(() => ({
    setIndex: jest.fn(),
    setAttribute: jest.fn(),
    computeVertexNormals: jest.fn(),
    dispose: jest.fn(),
  })),
};

// Mock @react-three/fiber
jest.mock('@react-three/fiber', () => ({
  useFrame: jest.fn(),
  extend: jest.fn(),
}));

// Mock materials
jest.mock('./materials/TerminalMaterials', () => ({}));

// Helper function to create mock hex
const createMockHex = (id: string, type: 'CORRIDOR' | 'ROOM' = 'CORRIDOR'): DungeonHex => ({
  id,
  coordinate: { q: 0, r: 0, s: 0 },
  position: { x: 0, y: 0, z: 0 },
  height: 1,
  isWalkable: true,
  type,
  lighting: {
    intensity: 0.5,
    color: [1, 1, 1] as [number, number, number],
    castsShadow: false,
  },
  hasWalls: { north: false, northeast: false, southeast: false, south: false, southwest: false, northwest: false },
  connections: [],
});

// Helper function to create hex map
const createHexMap = (hexes: DungeonHex[]) => {
  return new Map(hexes.map(h => [`${h.coordinate.q},${h.coordinate.r}`, h]));
};

describe('HexTile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render without crashing', () => {
    const hex = createMockHex('hex1');
    const hexMap = createHexMap([hex]);
    
    expect(() => render(<HexTile hex={hex} hexMap={hexMap} />)).not.toThrow();
  });

  test('should handle corridor type hex', () => {
    const hex = createMockHex('hex1', 'CORRIDOR');
    const hexMap = createHexMap([hex]);
    
    expect(() => render(<HexTile hex={hex} hexMap={hexMap} />)).not.toThrow();
  });

  test('should handle room type hex', () => {
    const hex = createMockHex('hex1', 'ROOM');
    const hexMap = createHexMap([hex]);
    
    expect(() => render(<HexTile hex={hex} hexMap={hexMap} />)).not.toThrow();
  });

  test('should handle non-walkable hex', () => {
    const hex = { ...createMockHex('hex1'), isWalkable: false };
    const hexMap = createHexMap([hex]);
    
    expect(() => render(<HexTile hex={hex} hexMap={hexMap} />)).not.toThrow();
  });

  test('should handle different heights', () => {
    const hex = { ...createMockHex('hex1'), height: 2.5 };
    const hexMap = createHexMap([hex]);
    
    expect(() => render(<HexTile hex={hex} hexMap={hexMap} />)).not.toThrow();
  });

  test('should handle different positions', () => {
    const hex = { ...createMockHex('hex1'), position: { x: 100, y: 0, z: 200 } };
    const hexMap = createHexMap([hex]);
    
    expect(() => render(<HexTile hex={hex} hexMap={hexMap} />)).not.toThrow();
  });

  test('should handle hex with neighbors', () => {
    const hex1 = createMockHex('hex1');
    const hex2 = { ...createMockHex('hex2'), coordinate: { q: 1, r: 0, s: -1 } };
    const hex3 = { ...createMockHex('hex3'), coordinate: { q: 0, r: 1, s: -1 } };
    const hexMap = createHexMap([hex1, hex2, hex3]);
    
    expect(() => render(<HexTile hex={hex1} hexMap={hexMap} />)).not.toThrow();
  });

  test('should be a React component', () => {
    expect(typeof HexTile).toBe('object'); // HexTile is wrapped with React.memo()
    expect(HexTile).toBeDefined(); // Verify it's a React component
  });

  test('should accept required props', () => {
    const hex = createMockHex('hex1');
    const hexMap = createHexMap([hex]);
    
    expect(() => render(<HexTile hex={hex} hexMap={hexMap} />)).not.toThrow();
  });

  test('should handle empty hex map', () => {
    const hex = createMockHex('hex1');
    const hexMap = new Map();
    
    expect(() => render(<HexTile hex={hex} hexMap={hexMap} />)).not.toThrow();
  });

  test('should handle various coordinate combinations', () => {
    const coords = [
      { q: 0, r: 0, s: 0 },
      { q: 1, r: -1, s: 0 },
      { q: -1, r: 1, s: 0 },
      { q: 2, r: -1, s: -1 },
    ];
    
    coords.forEach((coord, index) => {
      const hex = { ...createMockHex(`hex${index}`), coordinate: coord };
      const hexMap = createHexMap([hex]);
      
      expect(() => render(<HexTile hex={hex} hexMap={hexMap} />)).not.toThrow();
    });
  });
});