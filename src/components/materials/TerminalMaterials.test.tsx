
// Mock Three.js completely
export {};
jest.mock('three', () => ({
  TextureLoader: jest.fn().mockImplementation(() => ({
    load: jest.fn().mockReturnValue({
      wrapS: undefined,
      wrapT: undefined,
      repeat: { set: jest.fn() },
      offset: { set: jest.fn() },
      magFilter: undefined,
      minFilter: undefined,
    }),
  })),
  RepeatWrapping: 'RepeatWrapping',
  ClampToEdgeWrapping: 'ClampToEdgeWrapping',
  NearestFilter: 'NearestFilter',
  MeshBasicMaterial: jest.fn().mockImplementation(function(this: any, options: any) {
    Object.assign(this, options);
    return this;
  }),
  DoubleSide: 'DoubleSide',
}));

// Mock @react-three/fiber
jest.mock('@react-three/fiber', () => ({
  extend: jest.fn(),
}));

describe('TerminalMaterials', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  test('should load module without errors', () => {
    expect(() => require('./TerminalMaterials')).not.toThrow();
  });

  test('should export material classes', () => {
    const materials = require('./TerminalMaterials');
    
    expect(materials.FloorMaterial).toBeDefined();
    expect(materials.WallMaterial).toBeDefined();
    expect(materials.CeilingMaterial).toBeDefined();
  });

  test('should create materials on import', () => {
    const { extend } = require('@react-three/fiber');
    require('./TerminalMaterials');
    
    expect(extend).toHaveBeenCalledWith({
      FloorMaterial: expect.any(Function),
      WallMaterial: expect.any(Function),
      CeilingMaterial: expect.any(Function),
    });
  });

  test('should use TextureLoader on import', () => {
    const { TextureLoader } = require('three');
    require('./TerminalMaterials');
    
    expect(TextureLoader).toHaveBeenCalled();
  });

  test('should handle material creation without errors', () => {
    expect(() => require('./TerminalMaterials')).not.toThrow();
  });
});