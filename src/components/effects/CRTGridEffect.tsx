import { Effect } from 'postprocessing';
import { Uniform } from 'three';

const fragmentShader = `
  uniform float uPixelSize;
  uniform float uGridIntensity;

  void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    // Use inputColor directly - it's already the terminal-colored, pixelated output
    // (Pixelation already made all fragments in a 4x4 block the same color)
    vec4 color = inputColor;

    // Screen pixel coordinates
    vec2 pixelCoord = uv * resolution.xy;

    // Position within the current upscaled pixel (0 to uPixelSize)
    vec2 posInPixel = mod(pixelCoord, uPixelSize);

    // Which column within the upscaled pixel (0, 1, 2, 3 for R, G, B, gap)
    float column = floor(posInPixel.x / (uPixelSize / 4.0));

    // Which row within the upscaled pixel (bottom row is gap)
    float row = floor(posInPixel.y / (uPixelSize / 4.0));
    float isBottomGap = step(3.0, row); // 1.0 if in bottom row (gap)

    // RGB strips - each strip is fully lit with its channel from terminal color
    vec3 stripColor;

    if (column == 0.0) {
      // Red strip - fully lit with red channel intensity
      stripColor = vec3(color.r, 0.0, 0.0);
    } else if (column == 1.0) {
      // Green strip - fully lit with green channel intensity
      stripColor = vec3(0.0, color.g, 0.0);
    } else if (column == 2.0) {
      // Blue strip - fully lit with blue channel intensity
      stripColor = vec3(0.0, 0.0, color.b);
    } else {
      // Gap column - dark
      stripColor = vec3(0.0);
    }

    // Apply bottom gap (darken bottom row)
    stripColor *= (1.0 - isBottomGap);

    // Boost to compensate for only 3 of 4 columns lit, and 3 of 4 rows lit
    // 4/3 for columns * 4/3 for rows = 16/9 ≈ 1.78, but perceptually need more
    vec3 crtColor = stripColor * 2.5;

    // Blend with original based on intensity
    vec3 finalColor = mix(color.rgb, crtColor, uGridIntensity);

    outputColor = vec4(finalColor, color.a);
  }
`;

export class CRTGridEffect extends Effect {
  constructor(pixelSize = 4, gridIntensity = 0.8) {
    super('CRTGridEffect', fragmentShader, {
      uniforms: new Map([
        ['uPixelSize', new Uniform(pixelSize)],
        ['uGridIntensity', new Uniform(gridIntensity)]
      ])
    });
  }

  set pixelSize(value: number) {
    this.uniforms.get('uPixelSize')!.value = value;
  }

  get pixelSize(): number {
    return this.uniforms.get('uPixelSize')!.value;
  }

  set gridIntensity(value: number) {
    this.uniforms.get('uGridIntensity')!.value = value;
  }

  get gridIntensity(): number {
    return this.uniforms.get('uGridIntensity')!.value;
  }
}
