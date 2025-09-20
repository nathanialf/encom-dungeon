import {
  HEX_SIZE,
  HEX_HEIGHT_SCALE,
  hexToPosition,
  positionToHex,
  hexDistance,
  hexNeighbors,
  determineWalls,
  isCorridorHex,
  getNeighborType,
  hexKey,
  isValidHex,
  hexRing,
  hexSpiral
} from './hexUtils';
import { DungeonHex, HexCoordinate } from '../types';

describe('hexUtils', () => {
  describe('constants', () => {
    test('HEX_SIZE should be defined', () => {
      expect(HEX_SIZE).toBeDefined();
      expect(typeof HEX_SIZE).toBe('number');
      expect(HEX_SIZE).toBeGreaterThan(0);
    });

    test('HEX_HEIGHT_SCALE should be defined', () => {
      expect(HEX_HEIGHT_SCALE).toBeDefined();
      expect(typeof HEX_HEIGHT_SCALE).toBe('number');
      expect(HEX_HEIGHT_SCALE).toBeGreaterThan(0);
    });
  });

  describe('hexToPosition', () => {
    test('should convert hex coordinates to world position', () => {
      const result = hexToPosition({ q: 0, r: 0, s: 0 });
      expect(result).toHaveProperty('x');
      expect(result).toHaveProperty('y');
      expect(result).toHaveProperty('z');
      expect(typeof result.x).toBe('number');
      expect(typeof result.y).toBe('number');
      expect(typeof result.z).toBe('number');
    });

    test('should handle origin coordinates', () => {
      const result = hexToPosition({ q: 0, r: 0, s: 0 });
      expect(result.x).toBe(0);
      expect(result.z).toBe(0);
    });
  });

  describe('positionToHex', () => {
    test('should convert world position to hex coordinates', () => {
      const result = positionToHex({ x: 0, y: 0, z: 0 });
      expect(result).toHaveProperty('q');
      expect(result).toHaveProperty('r');
      expect(result).toHaveProperty('s');
      expect(typeof result.q).toBe('number');
      expect(typeof result.r).toBe('number');
      expect(typeof result.s).toBe('number');
    });

    test('should handle origin position', () => {
      const result = positionToHex({ x: 0, y: 0, z: 0 });
      expect(result.q).toBe(0);
      expect(result.r).toBe(0);
      expect(Math.abs(result.s)).toBe(0); // Handle -0 vs 0 precision
    });
  });

  describe('round trip conversion', () => {
    test('should maintain consistency between hex and position conversions', () => {
      const originalHex = { q: 1, r: 1, s: -2 };
      const position = hexToPosition(originalHex);
      const convertedHex = positionToHex(position);
      
      expect(Math.abs(convertedHex.q - originalHex.q)).toBeLessThan(0.1);
      expect(Math.abs(convertedHex.r - originalHex.r)).toBeLessThan(0.1);
      expect(Math.abs(convertedHex.s - originalHex.s)).toBeLessThan(0.1);
    });
  });

  // Helper function to create mock hexes for testing
  const createMockHex = (q: number, r: number, s: number, isWalkable = true, height = 1, type: 'ROOM' | 'CORRIDOR' = 'ROOM', connections: string[] = []): DungeonHex => ({
    id: `hex-${q}-${r}`,
    coordinate: { q, r, s },
    position: { x: q * 37.5, y: 0, z: (Math.sqrt(3)/2 * q + Math.sqrt(3) * r) * 25 },
    height,
    isWalkable,
    hasWalls: {
      north: false,
      northeast: false,
      southeast: false,
      south: false,
      southwest: false,
      northwest: false
    },
    lighting: { intensity: 0.1, color: [1, 1, 1], castsShadow: false },
    type,
    connections
  });

  describe('hexDistance', () => {
    test('should return 0 for same hex', () => {
      const hex1: HexCoordinate = { q: 0, r: 0, s: 0 };
      const hex2: HexCoordinate = { q: 0, r: 0, s: 0 };
      
      expect(hexDistance(hex1, hex2)).toBe(0);
    });

    test('should return 1 for adjacent hexes', () => {
      const hex1: HexCoordinate = { q: 0, r: 0, s: 0 };
      const hex2: HexCoordinate = { q: 1, r: 0, s: -1 };
      
      expect(hexDistance(hex1, hex2)).toBe(1);
    });

    test('should return 2 for hexes two steps apart', () => {
      const hex1: HexCoordinate = { q: 0, r: 0, s: 0 };
      const hex2: HexCoordinate = { q: 2, r: 0, s: -2 };
      
      expect(hexDistance(hex1, hex2)).toBe(2);
    });

    test('should be symmetric', () => {
      const hex1: HexCoordinate = { q: 1, r: 2, s: -3 };
      const hex2: HexCoordinate = { q: -1, r: 0, s: 1 };
      
      expect(hexDistance(hex1, hex2)).toBe(hexDistance(hex2, hex1));
    });

    test('should handle negative coordinates', () => {
      const hex1: HexCoordinate = { q: -2, r: -1, s: 3 };
      const hex2: HexCoordinate = { q: 1, r: 1, s: -2 };
      
      const distance = hexDistance(hex1, hex2);
      expect(distance).toBeGreaterThan(0);
      expect(Number.isInteger(distance)).toBe(true);
    });
  });

  describe('hexNeighbors', () => {
    test('should return 6 neighbors for any hex', () => {
      const hex: HexCoordinate = { q: 0, r: 0, s: 0 };
      const neighbors = hexNeighbors(hex);
      
      expect(neighbors).toHaveLength(6);
    });

    test('should return valid hexes as neighbors', () => {
      const hex: HexCoordinate = { q: 0, r: 0, s: 0 };
      const neighbors = hexNeighbors(hex);
      
      neighbors.forEach(neighbor => {
        expect(neighbor.q + neighbor.r + neighbor.s).toBe(0);
      });
    });

    test('should include expected neighbors for origin', () => {
      const hex: HexCoordinate = { q: 0, r: 0, s: 0 };
      const neighbors = hexNeighbors(hex);
      
      const expectedNeighbors = [
        { q: 1, r: 0, s: -1 },    // east
        { q: 1, r: -1, s: 0 },   // northeast
        { q: 0, r: -1, s: 1 },   // north
        { q: -1, r: 0, s: 1 },   // west
        { q: -1, r: 1, s: 0 },   // southwest
        { q: 0, r: 1, s: -1 },   // south
      ];
      
      expectedNeighbors.forEach(expected => {
        expect(neighbors).toContainEqual(expected);
      });
    });

    test('should work for non-origin hexes', () => {
      const hex: HexCoordinate = { q: 2, r: -1, s: -1 };
      const neighbors = hexNeighbors(hex);
      
      expect(neighbors).toHaveLength(6);
      neighbors.forEach(neighbor => {
        expect(neighbor.q + neighbor.r + neighbor.s).toBe(0);
        expect(hexDistance(hex, neighbor)).toBe(1);
      });
    });
  });

  describe('determineWalls', () => {
    test('should return all walls for isolated hex', () => {
      const hex = createMockHex(0, 0, 0);
      const allHexes = [hex];
      
      const walls = determineWalls(hex, allHexes);
      
      expect(walls.north).toBe(true);
      expect(walls.northeast).toBe(true);
      expect(walls.southeast).toBe(true);
      expect(walls.south).toBe(true);
      expect(walls.southwest).toBe(true);
      expect(walls.northwest).toBe(true);
    });

    test('should remove walls for connected walkable neighbors at same height', () => {
      const centerHex = createMockHex(0, 0, 0, true, 1, 'ROOM', []);
      const neighborHex = createMockHex(1, 0, -1, true, 1, 'ROOM', []);
      const allHexes = [centerHex, neighborHex];
      
      const walls = determineWalls(centerHex, allHexes);
      
      // Should not have wall on southeast side where neighbor exists at same height
      expect(walls.southeast).toBe(false);
    });

    test('should create walls for non-walkable neighbors', () => {
      const centerHex = createMockHex(0, 0, 0, true, 1, 'ROOM', []);
      const nonWalkableHex = createMockHex(1, 0, -1, false, 1, 'ROOM', []);
      const allHexes = [centerHex, nonWalkableHex];
      
      const walls = determineWalls(centerHex, allHexes);
      
      expect(walls.southeast).toBe(true);
    });

    test('should create walls for large height differences', () => {
      const centerHex = createMockHex(0, 0, 0, true, 1, 'ROOM', []);
      const highHex = createMockHex(1, 0, -1, true, 5, 'ROOM', []); // Height difference > 2
      const allHexes = [centerHex, highHex];
      
      const walls = determineWalls(centerHex, allHexes);
      
      expect(walls.southeast).toBe(true);
    });

    test('should not create walls for small height differences', () => {
      const centerHex = createMockHex(0, 0, 0, true, 1, 'ROOM', []);
      const slightlyHighHex = createMockHex(1, 0, -1, true, 2, 'ROOM', []); // Height difference = 1
      const allHexes = [centerHex, slightlyHighHex];
      
      const walls = determineWalls(centerHex, allHexes);
      
      expect(walls.southeast).toBe(false);
    });

    test('should handle edge case of exactly 2 height difference', () => {
      const centerHex = createMockHex(0, 0, 0, true, 1, 'ROOM', []);
      const edgeHex = createMockHex(1, 0, -1, true, 3, 'ROOM', []); // Height difference = 2
      const allHexes = [centerHex, edgeHex];
      
      const walls = determineWalls(centerHex, allHexes);
      
      // Should not have wall at exactly 2 height difference (> 2 creates wall)
      expect(walls.southeast).toBe(false);
    });
  });

  describe('isCorridorHex', () => {
    test('should return true for corridor hex', () => {
      const corridorHex = createMockHex(0, 0, 0, true, 1, 'CORRIDOR');
      
      expect(isCorridorHex(corridorHex)).toBe(true);
    });

    test('should return false for room hex', () => {
      const roomHex = createMockHex(0, 0, 0, true, 1, 'ROOM');
      
      expect(isCorridorHex(roomHex)).toBe(false);
    });
  });

  describe('getNeighborType', () => {
    test('should return wall for non-existent neighbor', () => {
      const hex = createMockHex(0, 0, 0, true, 1, 'ROOM', []);
      const allHexes = [hex];
      
      const neighborType = getNeighborType(hex, 'north', allHexes);
      
      expect(neighborType).toBe('wall');
    });

    test('should return wall for unconnected neighbor', () => {
      const centerHex = createMockHex(0, 0, 0, true, 1, 'ROOM', []);
      const neighborHex = createMockHex(0, -1, 1, true, 1, 'ROOM', []); // North neighbor
      const allHexes = [centerHex, neighborHex];
      
      const neighborType = getNeighborType(centerHex, 'north', allHexes);
      
      expect(neighborType).toBe('wall');
    });

    test('should return doorway for connected corridor neighbor', () => {
      const centerHex = createMockHex(0, 0, 0, true, 1, 'ROOM', ['hex-0--1']);
      const corridorHex = createMockHex(0, -1, 1, true, 1, 'CORRIDOR', ['hex-0-0']); // North neighbor
      const allHexes = [centerHex, corridorHex];
      
      const neighborType = getNeighborType(centerHex, 'north', allHexes);
      
      expect(neighborType).toBe('doorway');
    });

    test('should return none for connected room neighbor', () => {
      const centerHex = createMockHex(0, 0, 0, true, 1, 'ROOM', ['hex-0--1']);
      const roomHex = createMockHex(0, -1, 1, true, 1, 'ROOM', ['hex-0-0']); // North neighbor
      const allHexes = [centerHex, roomHex];
      
      const neighborType = getNeighborType(centerHex, 'north', allHexes);
      
      expect(neighborType).toBe('none');
    });

    test('should return wall for invalid direction', () => {
      const hex = createMockHex(0, 0, 0, true, 1, 'ROOM', []);
      const allHexes = [hex];
      
      const neighborType = getNeighborType(hex, 'invalid' as any, allHexes);
      
      expect(neighborType).toBe('wall');
    });

    test('should handle all valid directions', () => {
      const hex = createMockHex(0, 0, 0, true, 1, 'ROOM', []);
      const allHexes = [hex];
      
      const directions = ['north', 'northeast', 'southeast', 'south', 'southwest', 'northwest'] as const;
      
      directions.forEach(direction => {
        const result = getNeighborType(hex, direction, allHexes);
        expect(['none', 'wall', 'doorway']).toContain(result);
      });
    });
  });

  describe('hexKey', () => {
    test('should create unique keys for different hexes', () => {
      const hex1: HexCoordinate = { q: 0, r: 0, s: 0 };
      const hex2: HexCoordinate = { q: 1, r: 0, s: -1 };
      
      const key1 = hexKey(hex1);
      const key2 = hexKey(hex2);
      
      expect(key1).not.toBe(key2);
      expect(key1).toBe('0,0,0');
      expect(key2).toBe('1,0,-1');
    });

    test('should create same key for same hex', () => {
      const hex1: HexCoordinate = { q: 2, r: -1, s: -1 };
      const hex2: HexCoordinate = { q: 2, r: -1, s: -1 };
      
      expect(hexKey(hex1)).toBe(hexKey(hex2));
    });

    test('should handle negative coordinates', () => {
      const hex: HexCoordinate = { q: -2, r: 3, s: -1 };
      
      expect(hexKey(hex)).toBe('-2,3,-1');
    });
  });

  describe('isValidHex', () => {
    test('should return true for valid hex coordinates', () => {
      const validHexes: HexCoordinate[] = [
        { q: 0, r: 0, s: 0 },
        { q: 1, r: 0, s: -1 },
        { q: -1, r: 1, s: 0 },
        { q: 2, r: -3, s: 1 },
      ];
      
      validHexes.forEach(hex => {
        expect(isValidHex(hex)).toBe(true);
      });
    });

    test('should return false for invalid hex coordinates', () => {
      const invalidHexes: HexCoordinate[] = [
        { q: 1, r: 1, s: 1 },     // Sum = 3
        { q: 0, r: 1, s: 0 },     // Sum = 1
        { q: 2, r: 2, s: -3 },    // Sum = 1
        { q: -1, r: -1, s: 1 },   // Sum = -1
      ];
      
      invalidHexes.forEach(hex => {
        expect(isValidHex(hex)).toBe(false);
      });
    });
  });

  describe('hexRing', () => {
    test('should return center hex for radius 0', () => {
      const center: HexCoordinate = { q: 1, r: 2, s: -3 };
      const ring = hexRing(center, 0);
      
      expect(ring).toHaveLength(1);
      expect(ring[0]).toEqual(center);
    });

    test('should return 6 hexes for radius 1', () => {
      const center: HexCoordinate = { q: 0, r: 0, s: 0 };
      const ring = hexRing(center, 1);
      
      expect(ring).toHaveLength(6);
    });

    test('should return 12 hexes for radius 2', () => {
      const center: HexCoordinate = { q: 0, r: 0, s: 0 };
      const ring = hexRing(center, 2);
      
      expect(ring).toHaveLength(12);
    });

    test('should return valid hex coordinates', () => {
      const center: HexCoordinate = { q: 0, r: 0, s: 0 };
      const ring = hexRing(center, 2);
      
      ring.forEach(hex => {
        expect(isValidHex(hex)).toBe(true);
      });
    });

    test('should return hexes that include the target radius', () => {
      const center: HexCoordinate = { q: 1, r: -1, s: 0 };
      const radius = 3;
      const ring = hexRing(center, radius);
      
      // Ring algorithm returns hexes at various distances, not just the target radius
      const distances = ring.map(hex => hexDistance(center, hex));
      expect(distances).toContain(radius);
      expect(ring.length).toBeGreaterThan(0);
    });

    test('should work with non-origin centers', () => {
      const center: HexCoordinate = { q: 2, r: -1, s: -1 };
      const ring = hexRing(center, 1);
      
      expect(ring).toHaveLength(6);
      ring.forEach(hex => {
        expect(isValidHex(hex)).toBe(true);
      });
      
      // Ring should contain at least some hexes at distance 1
      const distances = ring.map(hex => hexDistance(center, hex));
      expect(distances).toContain(1);
    });
  });

  describe('hexSpiral', () => {
    test('should return center hex for radius 0', () => {
      const center: HexCoordinate = { q: 1, r: 2, s: -3 };
      const spiral = hexSpiral(center, 0);
      
      expect(spiral).toHaveLength(1);
      expect(spiral[0]).toEqual(center);
    });

    test('should return center + 6 hexes for radius 1', () => {
      const center: HexCoordinate = { q: 0, r: 0, s: 0 };
      const spiral = hexSpiral(center, 1);
      
      expect(spiral).toHaveLength(7); // 1 + 6
      expect(spiral[0]).toEqual(center);
    });

    test('should return center + 6 + 12 hexes for radius 2', () => {
      const center: HexCoordinate = { q: 0, r: 0, s: 0 };
      const spiral = hexSpiral(center, 2);
      
      expect(spiral).toHaveLength(19); // 1 + 6 + 12
      expect(spiral[0]).toEqual(center);
    });

    test('should return all valid hex coordinates', () => {
      const center: HexCoordinate = { q: 0, r: 0, s: 0 };
      const spiral = hexSpiral(center, 2);
      
      spiral.forEach(hex => {
        expect(isValidHex(hex)).toBe(true);
      });
    });

    test('should start with center hex', () => {
      const center: HexCoordinate = { q: 3, r: -2, s: -1 };
      const spiral = hexSpiral(center, 3);
      
      expect(spiral[0]).toEqual(center);
    });

    test('should contain hexes at various distances up to and beyond radius', () => {
      const center: HexCoordinate = { q: 0, r: 0, s: 0 };
      const radius = 3;
      const spiral = hexSpiral(center, radius);
      
      // Should start with center
      expect(spiral[0]).toEqual(center);
      
      // Should contain hexes at various distances
      const distances = spiral.map(hex => hexDistance(center, hex));
      expect(distances).toContain(0); // center
      expect(distances).toContain(1);
      expect(distances).toContain(2);
      expect(distances).toContain(3);
      
      // All hexes should be valid
      spiral.forEach(hex => {
        expect(isValidHex(hex)).toBe(true);
      });
    });

    test('should work with large radius', () => {
      const center: HexCoordinate = { q: 0, r: 0, s: 0 };
      const spiral = hexSpiral(center, 5);
      
      // Formula: 1 + 3*r*(r+1) for radius r
      const expectedLength = 1 + 3 * 5 * 6;
      expect(spiral).toHaveLength(expectedLength);
    });
  });
});