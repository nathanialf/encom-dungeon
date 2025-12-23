import { Effect } from 'postprocessing';
import { Uniform } from 'three';

const fragmentShader = `
  uniform float uBlurAmount;
  uniform float uChromaBleed;

  // Convert RGB to YIQ (NTSC color space used in composite video)
  vec3 rgb2yiq(vec3 rgb) {
    return vec3(
      0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b,  // Y (luma)
      0.596 * rgb.r - 0.274 * rgb.g - 0.322 * rgb.b,  // I (in-phase)
      0.211 * rgb.r - 0.523 * rgb.g + 0.312 * rgb.b   // Q (quadrature)
    );
  }

  // Convert YIQ back to RGB
  vec3 yiq2rgb(vec3 yiq) {
    return vec3(
      yiq.x + 0.956 * yiq.y + 0.621 * yiq.z,
      yiq.x - 0.272 * yiq.y - 0.647 * yiq.z,
      yiq.x - 1.106 * yiq.y + 1.703 * yiq.z
    );
  }

  void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    vec2 texelSize = 1.0 / resolution.xy;

    // Sample center pixel for luma (stays relatively sharp)
    vec3 centerColor = texture2D(inputBuffer, uv).rgb;
    vec3 centerYIQ = rgb2yiq(centerColor);

    // Horizontal blur for chroma (I and Q channels)
    // This simulates the bandwidth limitation of composite video
    vec2 chromaSum = vec2(0.0);
    float lumaSum = 0.0;
    float weightSum = 0.0;

    // Gaussian-like weights for blur
    float weights[5];
    weights[0] = 0.227027;
    weights[1] = 0.1945946;
    weights[2] = 0.1216216;
    weights[3] = 0.054054;
    weights[4] = 0.016216;

    // Sample horizontally for chroma bleeding
    for (int i = -4; i <= 4; i++) {
      float weight = weights[abs(i)];
      vec2 offset = vec2(float(i) * texelSize.x * uChromaBleed, 0.0);
      vec3 sampleColor = texture2D(inputBuffer, uv + offset).rgb;
      vec3 sampleYIQ = rgb2yiq(sampleColor);

      chromaSum += sampleYIQ.yz * weight;
      weightSum += weight;
    }

    chromaSum /= weightSum;

    // Slight vertical softening (simulates interlace/signal softness)
    vec3 topColor = texture2D(inputBuffer, uv + vec2(0.0, texelSize.y * uBlurAmount)).rgb;
    vec3 bottomColor = texture2D(inputBuffer, uv - vec2(0.0, texelSize.y * uBlurAmount)).rgb;
    vec3 topYIQ = rgb2yiq(topColor);
    vec3 bottomYIQ = rgb2yiq(bottomColor);

    // Blend luma vertically just slightly
    float blendedLuma = centerYIQ.x * 0.6 + topYIQ.x * 0.2 + bottomYIQ.x * 0.2;

    // Also blend some chroma vertically
    chromaSum = chromaSum * 0.7 + (topYIQ.yz + bottomYIQ.yz) * 0.15;

    // Recombine with blurred chroma
    vec3 finalYIQ = vec3(
      mix(centerYIQ.x, blendedLuma, uBlurAmount * 0.5),
      chromaSum
    );

    // Convert back to RGB
    vec3 finalColor = yiq2rgb(finalYIQ);

    // Clamp to valid range
    finalColor = clamp(finalColor, 0.0, 1.0);

    outputColor = vec4(finalColor, inputColor.a);
  }
`;

export class CompositeBlurEffect extends Effect {
  constructor(blurAmount = 1.0, chromaBleed = 3.0) {
    super('CompositeBlurEffect', fragmentShader, {
      uniforms: new Map([
        ['uBlurAmount', new Uniform(blurAmount)],
        ['uChromaBleed', new Uniform(chromaBleed)]
      ])
    });
  }

  set blurAmount(value: number) {
    this.uniforms.get('uBlurAmount')!.value = value;
  }

  get blurAmount(): number {
    return this.uniforms.get('uBlurAmount')!.value;
  }

  set chromaBleed(value: number) {
    this.uniforms.get('uChromaBleed')!.value = value;
  }

  get chromaBleed(): number {
    return this.uniforms.get('uChromaBleed')!.value;
  }
}
