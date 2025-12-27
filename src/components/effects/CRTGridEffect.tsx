import { Effect } from 'postprocessing';
import { Uniform } from 'three';

const fragmentShader = `
  uniform float uPixelSize;
  uniform float uGridIntensity;
  uniform float uColorIndex;
  uniform float uIntensity;

  void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    // === Pixelation (work in physical pixel space) ===
    vec2 pixelCoord = uv * resolution.xy;
    vec2 bigPixelCoord = floor(pixelCoord / uPixelSize);

    // Sample from center of big pixel
    vec2 pixelatedCoord = (bigPixelCoord + 0.5) * uPixelSize;
    vec2 pixelatedUV = pixelatedCoord / resolution.xy;
    pixelatedUV = clamp(pixelatedUV, vec2(0.0), vec2(1.0));

    // Sample at pixelated coordinates
    vec4 pixelColor = texture2D(inputBuffer, pixelatedUV);

    // === Terminal Color Conversion ===
    float gray = dot(pixelColor.rgb, vec3(0.299, 0.587, 0.114));

    vec3 colorMatrix[15] = vec3[15](
      // Green (index 0)
      vec3(0.0, 0.03, 0.0),
      vec3(0.0, 0.4, 0.1),
      vec3(0.0, 0.7, 0.15),
      // Purple (index 1)
      vec3(0.03, 0.0, 0.03),
      vec3(0.3, 0.0, 0.4),
      vec3(0.52, 0.0, 0.68),
      // Teal (index 2)
      vec3(0.0, 0.03, 0.02),
      vec3(0.0, 0.3, 0.25),
      vec3(0.0, 0.55, 0.42),
      // Red (index 3)
      vec3(0.03, 0.0, 0.0),
      vec3(0.3, 0.0, 0.0),
      vec3(0.55, 0.0, 0.0),
      // Amber (index 4)
      vec3(0.03, 0.01, 0.0),
      vec3(0.5, 0.12, 0.0),
      vec3(0.84, 0.21, 0.0)
    );

    int baseIndex = int(uColorIndex);
    vec3 dark = colorMatrix[baseIndex];
    vec3 medium = colorMatrix[baseIndex + 1];
    vec3 bright = colorMatrix[baseIndex + 2];

    vec3 terminalColor;
    if (gray < 0.3) {
      terminalColor = mix(dark, medium, gray / 0.3);
    } else if (gray < 0.7) {
      terminalColor = mix(medium, bright, (gray - 0.3) / 0.4);
    } else {
      terminalColor = bright * (0.8 + 0.4 * ((gray - 0.7) / 0.3));
    }

    vec3 color = terminalColor * uIntensity;

    // === CRT Phosphor Strip Effect ===
    // Position within current big pixel (reuse pixelCoord and bigPixelCoord from above)
    vec2 posInPixel = pixelCoord - bigPixelCoord * uPixelSize;

    // Which column (0, 1, 2, 3 for R, G, B, gap) - use physical pixels
    float stripWidth = uPixelSize / 4.0;
    float column = floor(posInPixel.x / stripWidth);
    column = clamp(column, 0.0, 3.0);
    // Which row (0, 1, 2, 3 - bottom is gap)
    float row = floor(posInPixel.y / stripWidth);
    row = clamp(row, 0.0, 3.0);
    float isGapRow = step(3.0, row);

    vec3 stripColor;
    if (column == 0.0) {
      stripColor = vec3(color.r, 0.0, 0.0);
    } else if (column == 1.0) {
      stripColor = vec3(0.0, color.g, 0.0);
    } else if (column == 2.0) {
      stripColor = vec3(0.0, 0.0, color.b);
    } else {
      stripColor = vec3(0.0);
    }

    // Apply row gap
    stripColor *= (1.0 - isGapRow);

    // Boost to compensate for gaps (3/4 columns * 3/4 rows visible)
    vec3 crtColor = stripColor * 2.5;

    vec3 finalColor = mix(color, crtColor, uGridIntensity);
    outputColor = vec4(finalColor, pixelColor.a);
  }
`;

export class CRTGridEffect extends Effect {
  constructor(pixelSize = 4, gridIntensity = 0.8) {
    super('CRTGridEffect', fragmentShader, {
      uniforms: new Map([
        ['uPixelSize', new Uniform(pixelSize)],
        ['uGridIntensity', new Uniform(gridIntensity)],
        ['uColorIndex', new Uniform(0.0)],
        ['uIntensity', new Uniform(1.0)]
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

  set colorIndex(value: number) {
    this.uniforms.get('uColorIndex')!.value = value;
  }

  get colorIndex(): number {
    return this.uniforms.get('uColorIndex')!.value;
  }

  set intensity(value: number) {
    this.uniforms.get('uIntensity')!.value = value;
  }

  get intensity(): number {
    return this.uniforms.get('uIntensity')!.value;
  }
}
