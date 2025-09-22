import React from 'react';
import { render } from '@testing-library/react';
import { HexGrid } from './HexGrid';
import { DungeonHex } from '../types';

// Mock the HexTile component
jest.mock('./HexTile', () => ({
  HexTile: ({ hex }: { hex: DungeonHex }) => (
    <div data-testid={`hex-tile-${hex.id}`} data-hex-id={hex.id}>
      Hex Tile {hex.id}
    </div>
  )
}));

// Mock the game store
const mockGameStore = {
  player: {
    position: [0, 0, 0] as [number, number, number]
  }
};

jest.mock('../store/gameStore', () => ({
  useGameStore: () => mockGameStore
}));

// Helper function to create mock hexes
const createMockHex = (id: string, x: number, z: number): DungeonHex => ({
  id,
  coordinate: { q: 0, r: 0, s: 0 },
  position: { x, y: 0, z },
  height: 1,
  isWalkable: true,
  type: 'CORRIDOR' as const,
  lighting: {
    intensity: 0.5,
    color: [1, 1, 1] as [number, number, number],
    castsShadow: false,
  },
  hasWalls: { north: false, northeast: false, southeast: false, south: false, southwest: false, northwest: false },
  connections: [],
});

describe('HexGrid', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGameStore.player.position = [0, 0, 0];
  });

  test('should render without crashing', () => {
    const hexes: DungeonHex[] = [createMockHex('hex1', 0, 0)];
    expect(() => render(<HexGrid hexes={hexes} />)).not.toThrow();
  });

  test('should render empty hex grid', () => {
    const hexes: DungeonHex[] = [];
    expect(() => render(<HexGrid hexes={hexes} />)).not.toThrow();
  });

  test('should handle multiple hexes', () => {
    const hexes: DungeonHex[] = [
      createMockHex('hex1', 10, 10),
      createMockHex('hex2', 20, 20),
      createMockHex('hex3', 30, 30),
    ];
    expect(() => render(<HexGrid hexes={hexes} />)).not.toThrow();
  });

  test('should handle player position changes', () => {
    const hexes: DungeonHex[] = [createMockHex('hex1', 0, 0)];
    
    const { rerender } = render(<HexGrid hexes={hexes} />);
    
    // Update player position
    mockGameStore.player.position = [100, 0, 100];
    
    expect(() => rerender(<HexGrid hexes={hexes} />)).not.toThrow();
  });

  test('should handle render distance filtering', () => {
    const hexes: DungeonHex[] = [
      createMockHex('hex1', 10, 10),   // Close to player
      createMockHex('hex2', 20, 20),   // Close to player
      createMockHex('hex3', 500, 500), // Far from player - should be filtered
    ];

    expect(() => render(<HexGrid hexes={hexes} />)).not.toThrow();
  });

  test('should handle large numbers of hexes', () => {
    const hexes: DungeonHex[] = Array.from({ length: 200 }, (_, i) => 
      createMockHex(`hex${i}`, i * 10, i * 10)
    );
    
    expect(() => render(<HexGrid hexes={hexes} />)).not.toThrow();
  });

  test('should be a functional component', () => {
    expect(typeof HexGrid).toBe('function');
  });

  test('should accept hexes prop', () => {
    const hexes: DungeonHex[] = [createMockHex('hex1', 0, 0)];
    expect(() => render(<HexGrid hexes={hexes} />)).not.toThrow();
  });

  test('should handle different hex types', () => {
    const hexes: DungeonHex[] = [
      { ...createMockHex('hex1', 0, 0), type: 'CORRIDOR' },
      { ...createMockHex('hex2', 10, 10), type: 'ROOM' },
    ];
    expect(() => render(<HexGrid hexes={hexes} />)).not.toThrow();
  });

  test('should handle walkable and non-walkable hexes', () => {
    const hexes: DungeonHex[] = [
      { ...createMockHex('hex1', 0, 0), isWalkable: true },
      { ...createMockHex('hex2', 10, 10), isWalkable: false },
    ];
    expect(() => render(<HexGrid hexes={hexes} />)).not.toThrow();
  });
});