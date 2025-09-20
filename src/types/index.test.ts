import type { DungeonHex, HexPosition, HexCoordinate } from './index';

describe('TypeScript types', () => {
  test('HexPosition should have correct structure', () => {
    const position: HexPosition = { x: 1, y: 2, z: 3 };
    
    expect(position).toHaveProperty('x');
    expect(position).toHaveProperty('y');
    expect(position).toHaveProperty('z');
    expect(typeof position.x).toBe('number');
    expect(typeof position.y).toBe('number');
    expect(typeof position.z).toBe('number');
  });

  test('HexCoordinate should have correct structure', () => {
    const hex: HexCoordinate = { q: 1, r: 2, s: -3 };
    
    expect(hex).toHaveProperty('q');
    expect(hex).toHaveProperty('r');
    expect(hex).toHaveProperty('s');
    expect(typeof hex.q).toBe('number');
    expect(typeof hex.r).toBe('number');
    expect(typeof hex.s).toBe('number');
  });

  test('DungeonHex should have correct structure', () => {
    const dungeonHex: DungeonHex = {
      id: 'test-hex',
      coordinate: { q: 0, r: 0, s: 0 },
      position: { x: 0, y: 0, z: 0 },
      height: 5,
      isWalkable: true,
      hasWalls: {
        north: false,
        northeast: false,
        southeast: false,
        south: false,
        southwest: false,
        northwest: false
      },
      lighting: {
        color: [0, 1, 0] as [number, number, number],
        intensity: 1,
        castsShadow: false
      },
      type: 'ROOM' as const,
      connections: []
    };
    
    expect(dungeonHex).toHaveProperty('id');
    expect(dungeonHex).toHaveProperty('coordinate');
    expect(dungeonHex).toHaveProperty('position');
    expect(dungeonHex).toHaveProperty('height');
    expect(dungeonHex).toHaveProperty('isWalkable');
    expect(dungeonHex).toHaveProperty('hasWalls');
    expect(dungeonHex).toHaveProperty('lighting');
    expect(dungeonHex).toHaveProperty('type');
    expect(dungeonHex).toHaveProperty('connections');
    
    expect(typeof dungeonHex.id).toBe('string');
    expect(typeof dungeonHex.coordinate).toBe('object');
    expect(typeof dungeonHex.position).toBe('object');
    expect(typeof dungeonHex.height).toBe('number');
    expect(typeof dungeonHex.isWalkable).toBe('boolean');
    expect(typeof dungeonHex.hasWalls).toBe('object');
    expect(typeof dungeonHex.lighting).toBe('object');
    expect(typeof dungeonHex.type).toBe('string');
    expect(Array.isArray(dungeonHex.connections)).toBe(true);
  });

  test('DungeonHex lighting should have correct structure', () => {
    const lighting = {
      color: [1, 0, 0] as [number, number, number],
      intensity: 0.8,
      castsShadow: true
    };
    
    expect(lighting).toHaveProperty('color');
    expect(lighting).toHaveProperty('intensity');
    expect(lighting).toHaveProperty('castsShadow');
    expect(Array.isArray(lighting.color)).toBe(true);
    expect(lighting.color.length).toBe(3);
    expect(typeof lighting.intensity).toBe('number');
    expect(typeof lighting.castsShadow).toBe('boolean');
  });
});