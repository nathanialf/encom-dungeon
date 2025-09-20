import { Effect } from 'postprocessing';
import { Uniform } from 'three';

const fragmentShader = `
  uniform float uPixelSize;
  
  void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    // Calculate pixel size in screen space
    vec2 pixelSize = vec2(uPixelSize) / resolution.xy;
    
    // Snap UV coordinates to pixel grid
    vec2 pixelatedUv = floor(uv / pixelSize) * pixelSize + pixelSize * 0.5;
    
    // Clamp to valid UV range
    pixelatedUv = clamp(pixelatedUv, vec2(0.0), vec2(1.0));
    
    // Sample the input buffer at pixelated coordinates
    outputColor = texture2D(inputBuffer, pixelatedUv);
  }
`;

export class PixelationEffect extends Effect {
  constructor(pixelSize = 4) {
    super('PixelationEffect', fragmentShader, {
      uniforms: new Map([
        ['uPixelSize', new Uniform(pixelSize)]
      ])
    });
  }

  set pixelSize(value: number) {
    this.uniforms.get('uPixelSize')!.value = value;
  }

  get pixelSize(): number {
    return this.uniforms.get('uPixelSize')!.value;
  }
}