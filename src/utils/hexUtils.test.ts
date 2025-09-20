import { 
  HEX_SIZE, 
  HEX_HEIGHT_SCALE, 
  hexToPosition, 
  positionToHex 
} from './hexUtils';

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
});