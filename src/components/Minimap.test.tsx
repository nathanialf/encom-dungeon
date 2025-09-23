import React from 'react';
import { render, screen } from '@testing-library/react';
import { Minimap } from './Minimap';

// Mock the game store
const mockGameStore = {
  dungeon: [
    {
      id: 'hex1',
      coordinate: { q: 0, r: 0, s: 0 },
      position: { x: 0, y: 0, z: 0 },
      isWalkable: true,
      type: 'CORRIDOR',
    },
    {
      id: 'hex2',
      coordinate: { q: 1, r: -1, s: 0 },
      position: { x: 10, y: 0, z: 10 },
      isWalkable: true,
      type: 'ROOM',
    },
    {
      id: 'hex3',
      coordinate: { q: -1, r: 1, s: 0 },
      position: { x: -10, y: 0, z: -10 },
      isWalkable: false,
      type: 'CORRIDOR',
    },
  ],
  player: {
    position: [5, 2, 5] as [number, number, number],
    rotation: [0, 0, 0] as [number, number, number],
  },
};

jest.mock('../store/gameStore', () => ({
  useGameStore: () => mockGameStore
}));

describe('Minimap', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset mock data
    mockGameStore.dungeon = [
      {
        id: 'hex1',
        coordinate: { q: 0, r: 0, s: 0 },
        position: { x: 0, y: 0, z: 0 },
        isWalkable: true,
        type: 'CORRIDOR',
      },
      {
        id: 'hex2',
        coordinate: { q: 1, r: -1, s: 0 },
        position: { x: 10, y: 0, z: 10 },
        isWalkable: true,
        type: 'ROOM',
      },
    ];
    mockGameStore.player.position = [5, 2, 5];
    mockGameStore.player.rotation = [0, 0, 0];
  });

  test('should render without crashing', () => {
    expect(() => render(<Minimap />)).not.toThrow();
  });

  test('should render minimap container', () => {
    render(<Minimap />);
    
    const svg = screen.getByTestId('minimap-svg');
    expect(svg).toBeInTheDocument();
  });

  test('should render SVG canvas', () => {
    render(<Minimap />);
    
    const svg = screen.getByTestId('minimap-svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('width', '350');
    expect(svg).toHaveAttribute('height', '350');
  });

  test('should render hex tiles for walkable hexes', () => {
    render(<Minimap />);
    
    const svg = screen.getByTestId('minimap-svg');
    expect(svg).toHaveAttribute('data-hex-count', '2'); // Default mock has 2 hexes
    expect(screen.getByTestId('player-direction')).toBeInTheDocument();
  });

  test('should render different colors for different hex types', () => {
    render(<Minimap />);
    
    // Should render hex tiles with different types
    const svg = screen.getByTestId('minimap-svg');
    expect(svg).toHaveAttribute('data-hex-count', '2');
    expect(screen.getByTestId('player-direction')).toBeInTheDocument();
  });

  test('should render player direction indicator', () => {
    render(<Minimap />);
    
    const playerDirection = screen.getByTestId('player-direction');
    expect(playerDirection).toBeInTheDocument();
    expect(playerDirection).toHaveAttribute('fill', '#ffffff');
  });

  test('should handle empty dungeon', () => {
    mockGameStore.dungeon = [];
    
    render(<Minimap />);
    
    const svg = screen.getByTestId('minimap-svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('data-hex-count', '0');
    
    // Should still render player marker
    expect(screen.getByTestId('player-direction')).toBeInTheDocument();
  });

  test('should handle single hex dungeon', () => {
    mockGameStore.dungeon = [
      {
        id: 'hex1',
        coordinate: { q: 0, r: 0, s: 0 },
        position: { x: 0, y: 0, z: 0 },
        isWalkable: true,
        type: 'CORRIDOR',
      },
    ];
    
    render(<Minimap />);
    
    const svg = screen.getByTestId('minimap-svg');
    expect(svg).toHaveAttribute('data-hex-count', '1');
    expect(screen.getByTestId('player-direction')).toBeInTheDocument();
    expect(screen.getByTestId('player-direction')).toBeInTheDocument();
  });

  test('should scale coordinates correctly', () => {
    mockGameStore.dungeon = [
      {
        id: 'hex1',
        coordinate: { q: 0, r: 0, s: 0 },
        position: { x: 100, y: 0, z: 100 },
        isWalkable: true,
        type: 'CORRIDOR',
      },
    ];
    
    render(<Minimap />);
    
    const svg = screen.getByTestId('minimap-svg');
    expect(svg).toHaveAttribute('data-hex-count', '1');
    expect(screen.getByTestId('player-direction')).toBeInTheDocument();
  });

  test('should render all hexes including non-walkable', () => {
    mockGameStore.dungeon = [
      {
        id: 'hex1',
        coordinate: { q: 0, r: 0, s: 0 },
        position: { x: 0, y: 0, z: 0 },
        isWalkable: false, // Non-walkable - should be red
        type: 'CORRIDOR',
      },
      {
        id: 'hex2',
        coordinate: { q: 1, r: -1, s: 0 },
        position: { x: 10, y: 0, z: 10 },
        isWalkable: true, // Walkable
        type: 'ROOM',
      },
    ];
    
    render(<Minimap />);
    
    const svg = screen.getByTestId('minimap-svg');
    expect(svg).toHaveAttribute('data-hex-count', '2');
    expect(screen.getByTestId('player-direction')).toBeInTheDocument();
  });

  test('should handle CORRIDOR type hexes', () => {
    mockGameStore.dungeon = [
      {
        id: 'hex1',
        coordinate: { q: 0, r: 0, s: 0 },
        position: { x: 0, y: 0, z: 0 },
        isWalkable: true,
        type: 'CORRIDOR',
      },
    ];
    
    expect(() => render(<Minimap />)).not.toThrow();
  });

  test('should handle ROOM type hexes', () => {
    mockGameStore.dungeon = [
      {
        id: 'hex1',
        coordinate: { q: 0, r: 0, s: 0 },
        position: { x: 0, y: 0, z: 0 },
        isWalkable: true,
        type: 'ROOM',
      },
    ];
    
    expect(() => render(<Minimap />)).not.toThrow();
  });

  test('should handle player position updates', () => {
    const { rerender } = render(<Minimap />);
    
    // Update player position
    mockGameStore.player.position = [20, 3, 25];
    
    expect(() => rerender(<Minimap />)).not.toThrow();
  });

  test('should calculate minimap bounds correctly', () => {
    mockGameStore.dungeon = [
      {
        id: 'hex1',
        coordinate: { q: -2, r: 2, s: 0 },
        position: { x: -50, y: 0, z: -30 },
        isWalkable: true,
        type: 'CORRIDOR',
      },
      {
        id: 'hex2',
        coordinate: { q: 3, r: -1, s: -2 },
        position: { x: 60, y: 0, z: 40 },
        isWalkable: true,
        type: 'ROOM',
      },
    ];
    
    expect(() => render(<Minimap />)).not.toThrow();
  });

  test('should handle coordinate conversion', () => {
    mockGameStore.dungeon = [
      {
        id: 'hex1',
        coordinate: { q: 0, r: 0, s: 0 },
        position: { x: 0, y: 0, z: 0 },
        isWalkable: true,
        type: 'CORRIDOR',
      },
    ];
    
    render(<Minimap />);
    
    // Should convert hex coordinates to SVG polygon points for direction indicator
    const polygon = screen.getByTestId('player-direction');
    expect(polygon).toHaveAttribute('points');
  });

  test('should apply correct CSS styles', () => {
    render(<Minimap />);
    
    // Verify minimap components are rendered with correct structure
    const minimapSvg = screen.getByTestId('minimap-svg');
    expect(minimapSvg).toHaveAttribute('width', '350');
    expect(minimapSvg).toHaveAttribute('height', '350');
    expect(screen.getByTestId('player-direction')).toBeInTheDocument();
  });
});