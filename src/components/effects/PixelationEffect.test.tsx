import { PixelationEffect } from './PixelationEffect';
import { Effect } from 'postprocessing';
import { Uniform } from 'three';

// Mock postprocessing Effect class
jest.mock('postprocessing', () => ({
  Effect: jest.fn().mockImplementation(function(this: any, name, fragmentShader, options) {
    this.name = name;
    this.fragmentShader = fragmentShader;
    // Make uniforms writable for testing
    Object.defineProperty(this, 'uniforms', {
      value: options?.uniforms || new Map(),
      writable: true,
      configurable: true
    });
    return this;
  })
}));

// Mock Three.js Uniform
jest.mock('three', () => ({
  Uniform: jest.fn().mockImplementation((value) => ({ value }))
}));

describe('PixelationEffect', () => {
  const MockedEffect = Effect as jest.MockedClass<typeof Effect>;
  const MockedUniform = Uniform as jest.MockedClass<typeof Uniform>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should be a class', () => {
    expect(typeof PixelationEffect).toBe('function');
    expect(PixelationEffect.prototype.constructor).toBe(PixelationEffect);
  });

  test('should extend Effect class', () => {
    new PixelationEffect();
    expect(MockedEffect).toHaveBeenCalled();
  });

  test('should create with default pixelSize of 4', () => {
    new PixelationEffect();
    
    expect(MockedEffect).toHaveBeenCalledWith(
      'PixelationEffect',
      expect.stringContaining('uniform float uPixelSize'),
      expect.objectContaining({
        uniforms: expect.any(Map)
      })
    );
    
    expect(MockedUniform).toHaveBeenCalledWith(4);
  });

  test('should create with custom pixelSize', () => {
    const customPixelSize = 8;
    new PixelationEffect(customPixelSize);
    
    expect(MockedUniform).toHaveBeenCalledWith(customPixelSize);
  });

  test('should create with zero pixelSize', () => {
    new PixelationEffect(0);
    expect(MockedUniform).toHaveBeenCalledWith(0);
  });

  test('should create with negative pixelSize', () => {
    new PixelationEffect(-2);
    expect(MockedUniform).toHaveBeenCalledWith(-2);
  });

  test('should create with decimal pixelSize', () => {
    new PixelationEffect(3.5);
    expect(MockedUniform).toHaveBeenCalledWith(3.5);
  });

  test('should create with large pixelSize', () => {
    new PixelationEffect(1000);
    expect(MockedUniform).toHaveBeenCalledWith(1000);
  });

  test('should pass correct fragment shader to Effect', () => {
    new PixelationEffect();
    
    const fragmentShaderCall = MockedEffect.mock.calls[0][1];
    expect(fragmentShaderCall).toContain('uniform float uPixelSize');
    expect(fragmentShaderCall).toContain('void mainImage');
    expect(fragmentShaderCall).toContain('vec2 pixelSize = vec2(uPixelSize) / resolution.xy');
    expect(fragmentShaderCall).toContain('floor(uv / pixelSize) * pixelSize');
    expect(fragmentShaderCall).toContain('texture2D(inputBuffer, pixelatedUv)');
  });

  test('should create uniforms Map with uPixelSize', () => {
    new PixelationEffect(6);
    
    const options = MockedEffect.mock.calls[0][2];
    expect(options).toBeDefined();
    expect(options!.uniforms).toBeInstanceOf(Map);
    expect(options!.uniforms!.has('uPixelSize')).toBe(true);
  });

  test('should set pixelSize via setter', () => {
    const effect = new PixelationEffect();
    const mockUniform = { value: 4 };
    const mockGet = jest.fn().mockReturnValue(mockUniform);
    Object.defineProperty(effect, 'uniforms', {
      value: { get: mockGet },
      writable: true,
      configurable: true
    });
    
    effect.pixelSize = 10;
    
    expect(mockGet).toHaveBeenCalledWith('uPixelSize');
    expect(mockUniform.value).toBe(10);
  });

  test('should get pixelSize via getter', () => {
    const effect = new PixelationEffect();
    const mockUniform = { value: 12 };
    const mockGet = jest.fn().mockReturnValue(mockUniform);
    Object.defineProperty(effect, 'uniforms', {
      value: { get: mockGet },
      writable: true,
      configurable: true
    });
    
    const pixelSize = effect.pixelSize;
    
    expect(mockGet).toHaveBeenCalledWith('uPixelSize');
    expect(pixelSize).toBe(12);
  });

  test('should handle multiple pixelSize changes', () => {
    const effect = new PixelationEffect();
    const mockUniform = { value: 4 };
    const mockGet = jest.fn().mockReturnValue(mockUniform);
    Object.defineProperty(effect, 'uniforms', {
      value: { get: mockGet },
      writable: true,
      configurable: true
    });
    
    effect.pixelSize = 5;
    expect(mockUniform.value).toBe(5);
    
    effect.pixelSize = 15;
    expect(mockUniform.value).toBe(15);
    
    effect.pixelSize = 1;
    expect(mockUniform.value).toBe(1);
  });

  test('should set zero pixelSize via setter', () => {
    const effect = new PixelationEffect();
    const mockUniform = { value: 4 };
    const mockGet = jest.fn().mockReturnValue(mockUniform);
    Object.defineProperty(effect, 'uniforms', {
      value: { get: mockGet },
      writable: true,
      configurable: true
    });
    
    effect.pixelSize = 0;
    expect(mockUniform.value).toBe(0);
  });

  test('should set negative pixelSize via setter', () => {
    const effect = new PixelationEffect();
    const mockUniform = { value: 4 };
    const mockGet = jest.fn().mockReturnValue(mockUniform);
    Object.defineProperty(effect, 'uniforms', {
      value: { get: mockGet },
      writable: true,
      configurable: true
    });
    
    effect.pixelSize = -3;
    expect(mockUniform.value).toBe(-3);
  });

  test('should set decimal pixelSize via setter', () => {
    const effect = new PixelationEffect();
    const mockUniform = { value: 4 };
    const mockGet = jest.fn().mockReturnValue(mockUniform);
    Object.defineProperty(effect, 'uniforms', {
      value: { get: mockGet },
      writable: true,
      configurable: true
    });
    
    effect.pixelSize = 2.7;
    expect(mockUniform.value).toBe(2.7);
  });

  test('should get zero pixelSize via getter', () => {
    const effect = new PixelationEffect();
    const mockUniform = { value: 0 };
    const mockGet = jest.fn().mockReturnValue(mockUniform);
    Object.defineProperty(effect, 'uniforms', {
      value: { get: mockGet },
      writable: true,
      configurable: true
    });
    
    expect(effect.pixelSize).toBe(0);
  });

  test('should get negative pixelSize via getter', () => {
    const effect = new PixelationEffect();
    const mockUniform = { value: -5 };
    const mockGet = jest.fn().mockReturnValue(mockUniform);
    Object.defineProperty(effect, 'uniforms', {
      value: { get: mockGet },
      writable: true,
      configurable: true
    });
    
    expect(effect.pixelSize).toBe(-5);
  });

  test('should get decimal pixelSize via getter', () => {
    const effect = new PixelationEffect();
    const mockUniform = { value: 4.2 };
    const mockGet = jest.fn().mockReturnValue(mockUniform);
    Object.defineProperty(effect, 'uniforms', {
      value: { get: mockGet },
      writable: true,
      configurable: true
    });
    
    expect(effect.pixelSize).toBe(4.2);
  });

  test('should pass correct effect name to parent Effect class', () => {
    new PixelationEffect();
    expect(MockedEffect).toHaveBeenCalledWith(
      'PixelationEffect',
      expect.any(String),
      expect.any(Object)
    );
  });

  test('fragment shader should contain required GLSL components', () => {
    new PixelationEffect();
    const fragmentShader = MockedEffect.mock.calls[0][1];
    
    // Check for uniform declaration
    expect(fragmentShader).toMatch(/uniform\s+float\s+uPixelSize/);
    
    // Check for main function
    expect(fragmentShader).toMatch(/void\s+mainImage/);
    
    // Check for function parameters
    expect(fragmentShader).toMatch(/const\s+in\s+vec4\s+inputColor/);
    expect(fragmentShader).toMatch(/const\s+in\s+vec2\s+uv/);
    expect(fragmentShader).toMatch(/out\s+vec4\s+outputColor/);
    
    // Check for core logic
    expect(fragmentShader).toContain('resolution.xy');
    expect(fragmentShader).toContain('floor(uv / pixelSize)');
    expect(fragmentShader).toContain('clamp');
    expect(fragmentShader).toContain('texture2D(inputBuffer');
  });

  test('should create uniforms map with correct structure', () => {
    new PixelationEffect(7);
    
    const options = MockedEffect.mock.calls[0][2];
    expect(options).toBeDefined();
    const uniforms = options!.uniforms;
    
    expect(uniforms).toBeInstanceOf(Map);
    expect(uniforms!.size).toBe(1);
    expect(uniforms!.has('uPixelSize')).toBe(true);
    
    // Check that Uniform constructor was called with correct value
    expect(MockedUniform).toHaveBeenCalledWith(7);
  });
});