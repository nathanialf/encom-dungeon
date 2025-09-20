import { 
  HEX_SIZE,
  HEX_HEIGHT_SCALE 
} from './hexUtils';

describe('hexUtils extended functionality', () => {
  describe('constants validation', () => {
    test('HEX_SIZE should be reasonable', () => {
      expect(HEX_SIZE).toBeGreaterThan(0);
      expect(HEX_SIZE).toBeLessThan(1000);
      expect(typeof HEX_SIZE).toBe('number');
    });

    test('HEX_HEIGHT_SCALE should be reasonable', () => {
      expect(HEX_HEIGHT_SCALE).toBeGreaterThan(0);
      expect(HEX_HEIGHT_SCALE).toBeLessThan(100);
      expect(typeof HEX_HEIGHT_SCALE).toBe('number');
    });

    test('constants should be defined', () => {
      expect(HEX_SIZE).toBeDefined();
      expect(HEX_HEIGHT_SCALE).toBeDefined();
    });

    test('constants should not be NaN', () => {
      expect(isNaN(HEX_SIZE)).toBe(false);
      expect(isNaN(HEX_HEIGHT_SCALE)).toBe(false);
    });

    test('constants should be finite', () => {
      expect(isFinite(HEX_SIZE)).toBe(true);
      expect(isFinite(HEX_HEIGHT_SCALE)).toBe(true);
    });
  });
});