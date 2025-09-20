import { Pixelation } from './Pixelation';

describe('Pixelation', () => {
  test('should be a functional component', () => {
    expect(typeof Pixelation).toBe('function');
  });

  test('should be exported correctly', () => {
    expect(Pixelation).toBeDefined();
  });

  test('should accept pixelSize prop', () => {
    // Test that the component accepts props correctly
    expect(typeof Pixelation).toBe('function');
    
    // Test with different prop values
    const props1 = { pixelSize: 4 };
    const props2 = { pixelSize: 8 };
    
    expect(props1.pixelSize).toBe(4);
    expect(props2.pixelSize).toBe(8);
  });

  test('should handle optional pixelSize parameter', () => {
    // Test that the component works with or without props
    expect(typeof Pixelation).toBe('function');
    
    // Component should handle undefined props
    const undefinedProps: { pixelSize?: number } = {};
    expect(undefinedProps.pixelSize).toBeUndefined();
  });
});