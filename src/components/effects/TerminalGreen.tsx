import React, { forwardRef } from 'react';
import { Effect } from 'postprocessing';
import { Uniform } from 'three';

const fragmentShader = `
uniform float intensity;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  // Convert to grayscale first
  float gray = dot(inputColor.rgb, vec3(0.299, 0.587, 0.114));
  
  // Create terminal green color palette
  vec3 darkGreen = vec3(0.0, 0.1, 0.0);      // Very dark green for blacks
  vec3 mediumGreen = vec3(0.0, 0.4, 0.1);    // Medium green for mid-tones
  vec3 brightGreen = vec3(0.0, 0.7, 0.15);   // Darker green for highlights
  
  // Map grayscale to green palette
  vec3 terminalColor;
  if (gray < 0.3) {
    // Dark areas - interpolate between dark and medium green
    terminalColor = mix(darkGreen, mediumGreen, gray / 0.3);
  } else if (gray < 0.7) {
    // Mid areas - interpolate between medium and bright green
    terminalColor = mix(mediumGreen, brightGreen, (gray - 0.3) / 0.4);
  } else {
    // Bright areas - pure neon green with extra intensity
    terminalColor = brightGreen * (0.8 + 0.4 * ((gray - 0.7) / 0.3));
  }
  
  outputColor = vec4(terminalColor * intensity, inputColor.a);
}
`;

class TerminalGreenEffect extends Effect {
  constructor() {
    super('TerminalGreenEffect', fragmentShader, {
      uniforms: new Map([
        ['intensity', new Uniform(1.0)]
      ])
    });
  }
}

export const TerminalGreen = forwardRef<TerminalGreenEffect, { intensity?: number }>((props, ref) => {
  const effect = React.useMemo(() => new TerminalGreenEffect(), []);
  
  React.useEffect(() => {
    if (props.intensity !== undefined) {
      effect.uniforms.get('intensity')!.value = props.intensity;
    }
  }, [props.intensity, effect]);

  return <primitive ref={ref} object={effect} />;
});

TerminalGreen.displayName = 'TerminalGreen';