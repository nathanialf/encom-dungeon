import { generateDeduplicatedWalls } from './wallDeduplication';
import { DungeonHex } from '../types';
import { HEX_SIZE } from './hexUtils';

// Mock hex data for testing
const createMockHex = (
  q: number, 
  r: number, 
  s: number, 
  isWalkable = true, 
  height = 1, 
  type: 'ROOM' | 'CORRIDOR' = 'ROOM', 
  connections: string[] = []
): DungeonHex => ({
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

describe('wallDeduplication', () => {
  describe('generateDeduplicatedWalls', () => {
    test('should return empty walls and doorways for empty dungeon', () => {
      const result = generateDeduplicatedWalls([]);
      
      expect(result.walls).toEqual([]);
      expect(result.doorways).toEqual([]);
    });

    test('should return empty walls for non-walkable hexes', () => {
      const dungeon = [
        createMockHex(0, 0, 0, false), // Non-walkable
        createMockHex(1, 0, -1, false) // Non-walkable
      ];
      
      const result = generateDeduplicatedWalls(dungeon);
      
      expect(result.walls).toEqual([]);
      expect(result.doorways).toEqual([]);
    });

    test('should generate walls for isolated hex', () => {
      const dungeon = [createMockHex(0, 0, 0, true, 1, 'ROOM', [])];
      
      const result = generateDeduplicatedWalls(dungeon);
      
      // Should have 6 walls (all directions)
      expect(result.walls).toHaveLength(6);
      expect(result.doorways).toHaveLength(0);
      
      // Verify wall properties
      result.walls.forEach(wall => {
        expect(wall.id).toBeDefined();
        expect(wall.type).toBe('wall');
        expect(wall.height).toBe(12); // height * HEX_HEIGHT_SCALE
        expect(wall.width).toBe(HEX_SIZE);
        expect(wall.hexIds).toEqual(['hex-0-0']);
      });
    });

    test('should generate doorway for corridor connection', () => {
      const roomHex = createMockHex(0, 0, 0, true, 1, 'ROOM', ['hex-1-0']);
      const corridorHex = createMockHex(1, 0, -1, true, 1, 'CORRIDOR', ['hex-0-0']);
      const dungeon = [roomHex, corridorHex];
      
      const result = generateDeduplicatedWalls(dungeon);
      
      // Should have some walls and at least one doorway
      expect(result.walls.length).toBeGreaterThan(0);
      expect(result.doorways.length).toBeGreaterThan(0);
      
      // Verify doorway properties
      const doorway = result.doorways[0];
      expect(doorway.type).toBe('doorway');
      expect(doorway.height).toBe(12);
      expect(doorway.width).toBe(HEX_SIZE);
    });

    test('should not create walls between connected rooms', () => {
      const room1 = createMockHex(0, 0, 0, true, 1, 'ROOM', ['hex-1-0']);
      const room2 = createMockHex(1, 0, -1, true, 1, 'ROOM', ['hex-0-0']);
      const dungeon = [room1, room2];
      
      const result = generateDeduplicatedWalls(dungeon);
      
      // Should have fewer walls due to open connection
      const totalWalls = result.walls.length + result.doorways.length;
      expect(totalWalls).toBeLessThan(12); // Less than 6 walls per hex
    });

    test('should deduplicate walls between adjacent hexes', () => {
      const hex1 = createMockHex(0, 0, 0, true, 1, 'ROOM', []);
      const hex2 = createMockHex(1, 0, -1, true, 1, 'ROOM', []);
      const dungeon = [hex1, hex2];
      
      const result = generateDeduplicatedWalls(dungeon);
      
      // Should have walls but no duplicates between neighbors
      expect(result.walls.length).toBeGreaterThan(0);
      
      // Verify no duplicate wall IDs
      const wallIds = result.walls.map(w => w.id);
      const uniqueIds = new Set(wallIds);
      expect(wallIds.length).toBe(uniqueIds.size);
    });

    test('should handle multiple corridor connections', () => {
      const centerRoom = createMockHex(0, 0, 0, true, 2, 'ROOM', ['hex-1-0', 'hex-0-1']);
      const corridor1 = createMockHex(1, 0, -1, true, 1, 'CORRIDOR', ['hex-0-0']);
      const corridor2 = createMockHex(0, 1, -1, true, 1, 'CORRIDOR', ['hex-0-0']);
      const dungeon = [centerRoom, corridor1, corridor2];
      
      const result = generateDeduplicatedWalls(dungeon);
      
      // Should have multiple doorways
      expect(result.doorways.length).toBeGreaterThanOrEqual(2);
      
      // Verify doorway heights match hex heights
      const centerDoorway = result.doorways.find(d => d.hexIds.includes('hex-0-0'));
      expect(centerDoorway?.height).toBe(24); // height 2 * 12
    });

    test('should calculate correct wall positions and rotations', () => {
      const hex = createMockHex(0, 0, 0, true, 1, 'ROOM', []);
      const dungeon = [hex];
      
      const result = generateDeduplicatedWalls(dungeon);
      
      // Verify all walls have valid positions and rotations
      result.walls.forEach(wall => {
        expect(wall.position).toHaveLength(3);
        expect(wall.rotation).toHaveLength(3);
        expect(wall.startPosition).toHaveLength(3);
        expect(wall.endPosition).toHaveLength(3);
        
        // Positions should be numbers
        wall.position.forEach(coord => expect(typeof coord).toBe('number'));
        wall.rotation.forEach(angle => expect(typeof angle).toBe('number'));
      });
    });

    test('should handle negative coordinate hexes', () => {
      const negativeHex = createMockHex(-2, -3, 5, true, 1.5, 'ROOM', []);
      const dungeon = [negativeHex];
      
      const result = generateDeduplicatedWalls(dungeon);
      
      expect(result.walls).toHaveLength(6);
      
      // Verify walls are positioned correctly relative to negative hex
      result.walls.forEach(wall => {
        expect(wall.height).toBe(18); // 1.5 * 12
        expect(wall.hexIds).toEqual(['hex--2--3']);
      });
    });

    test('should handle varying hex heights', () => {
      const tallHex = createMockHex(0, 0, 0, true, 3, 'ROOM', []);
      const shortHex = createMockHex(1, 0, -1, true, 0.5, 'ROOM', []);
      const dungeon = [tallHex, shortHex];
      
      const result = generateDeduplicatedWalls(dungeon);
      
      // Find walls for each hex
      const tallWalls = result.walls.filter(w => w.hexIds.includes('hex-0-0'));
      const shortWalls = result.walls.filter(w => w.hexIds.includes('hex-1-0'));
      
      // Verify heights are scaled correctly
      expect(tallWalls.length).toBeGreaterThan(0);
      expect(shortWalls.length).toBeGreaterThan(0);
      expect(tallWalls[0].height).toBe(36); // 3 * 12
      expect(shortWalls[0].height).toBe(6); // 0.5 * 12
    });

    test('should handle complex dungeon layout', () => {
      // Create a more complex dungeon with rooms and corridors
      const centerRoom = createMockHex(0, 0, 0, true, 2, 'ROOM', ['hex-1-0', 'hex--1-1']);
      const eastCorridor = createMockHex(1, 0, -1, true, 1, 'CORRIDOR', ['hex-0-0', 'hex-2--1']);
      const westRoom = createMockHex(-1, 1, 0, true, 1.5, 'ROOM', ['hex-0-0']);
      const farEastRoom = createMockHex(2, -1, -1, true, 1, 'ROOM', ['hex-1-0']);
      const isolatedRoom = createMockHex(5, 5, -10, true, 1, 'ROOM', []);
      
      const dungeon = [centerRoom, eastCorridor, westRoom, farEastRoom, isolatedRoom];
      
      const result = generateDeduplicatedWalls(dungeon);
      
      // Should have mix of walls and doorways
      expect(result.walls.length).toBeGreaterThan(0);
      expect(result.doorways.length).toBeGreaterThan(0);
      
      // Isolated room should contribute 6 walls
      const isolatedWalls = result.walls.filter(w => w.hexIds.includes('hex-5-5'));
      expect(isolatedWalls.length).toBe(6);
      
      // Verify no duplicate walls
      const allWallIds = [...result.walls, ...result.doorways].map(w => w.id);
      const uniqueIds = new Set(allWallIds);
      expect(allWallIds.length).toBe(uniqueIds.size);
    });

    test('should handle zero-height hexes', () => {
      const flatHex = createMockHex(0, 0, 0, true, 0, 'ROOM', []);
      const dungeon = [flatHex];
      
      const result = generateDeduplicatedWalls(dungeon);
      
      expect(result.walls).toHaveLength(6);
      
      // Verify walls have zero height
      result.walls.forEach(wall => {
        expect(wall.height).toBe(0);
      });
    });

    test('should properly handle all wall directions', () => {
      const hex = createMockHex(0, 0, 0, true, 1, 'ROOM', []);
      const dungeon = [hex];
      
      const result = generateDeduplicatedWalls(dungeon);
      
      // Should have exactly 6 walls (one for each direction)
      expect(result.walls).toHaveLength(6);
      
      // Verify different rotations for different directions
      const rotations = result.walls.map(w => w.rotation[1]); // Y rotation
      const uniqueRotations = new Set(rotations);
      expect(uniqueRotations.size).toBeGreaterThan(1); // Should have different rotations
    });

    test('should handle edge case coordinate calculations', () => {
      // Test with extreme coordinates to ensure calculations don't break
      const extremeHex = createMockHex(100, -200, 100, true, 1, 'ROOM', []);
      const dungeon = [extremeHex];
      
      const result = generateDeduplicatedWalls(dungeon);
      
      expect(result.walls).toHaveLength(6);
      
      // Verify no NaN or infinite values in positions
      result.walls.forEach(wall => {
        wall.position.forEach(coord => {
          expect(isFinite(coord)).toBe(true);
          expect(isNaN(coord)).toBe(false);
        });
        wall.startPosition.forEach(coord => {
          expect(isFinite(coord)).toBe(true);
          expect(isNaN(coord)).toBe(false);
        });
        wall.endPosition.forEach(coord => {
          expect(isFinite(coord)).toBe(true);
          expect(isNaN(coord)).toBe(false);
        });
      });
    });

    test('should maintain consistent wall IDs', () => {
      const hex1 = createMockHex(0, 0, 0, true, 1, 'ROOM', []);
      const hex2 = createMockHex(1, 0, -1, true, 1, 'ROOM', []);
      
      // Generate walls twice with same input
      const result1 = generateDeduplicatedWalls([hex1, hex2]);
      const result2 = generateDeduplicatedWalls([hex1, hex2]);
      
      // Should have same wall IDs
      const ids1 = result1.walls.map(w => w.id).sort();
      const ids2 = result2.walls.map(w => w.id).sort();
      
      expect(ids1).toEqual(ids2);
    });

    test('should handle mixed walkable and non-walkable hexes', () => {
      const walkableHex = createMockHex(0, 0, 0, true, 1, 'ROOM', []);
      const nonWalkableHex = createMockHex(1, 0, -1, false, 1, 'ROOM', []);
      const dungeon = [walkableHex, nonWalkableHex];
      
      const result = generateDeduplicatedWalls(dungeon);
      
      // Only walkable hex should contribute walls
      expect(result.walls.length).toBeGreaterThan(0);
      result.walls.forEach(wall => {
        expect(wall.hexIds).toContain('hex-0-0');
        expect(wall.hexIds).not.toContain('hex-1-0');
      });
    });
  });

  describe('WallSegment interface', () => {
    test('should properly define wall segment structure', () => {
      const hex = createMockHex(0, 0, 0, true, 1, 'ROOM', []);
      const result = generateDeduplicatedWalls([hex]);
      
      const wall = result.walls[0];
      
      expect(typeof wall.id).toBe('string');
      expect(Array.isArray(wall.startPosition)).toBe(true);
      expect(Array.isArray(wall.endPosition)).toBe(true);
      expect(Array.isArray(wall.position)).toBe(true);
      expect(Array.isArray(wall.rotation)).toBe(true);
      expect(typeof wall.width).toBe('number');
      expect(typeof wall.height).toBe('number');
      expect(['wall', 'doorway']).toContain(wall.type);
      expect(Array.isArray(wall.hexIds)).toBe(true);
    });
  });

  describe('WallSystem interface', () => {
    test('should properly define wall system structure', () => {
      const result = generateDeduplicatedWalls([]);
      
      expect(Array.isArray(result.walls)).toBe(true);
      expect(Array.isArray(result.doorways)).toBe(true);
    });
  });
});