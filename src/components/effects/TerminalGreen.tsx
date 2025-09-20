import React, { forwardRef } from 'react';
import { Effect } from 'postprocessing';
import { Uniform } from 'three';
import { useTimeStore } from '../../store/timeStore';

const fragmentShader = `
uniform float intensity;
uniform float time;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  // Convert to grayscale first
  float gray = dot(inputColor.rgb, vec3(0.299, 0.587, 0.114));
  
  // Create color palettes for transition
  // Green palette
  vec3 darkGreen = vec3(0.0, 0.1, 0.0);
  vec3 mediumGreen = vec3(0.0, 0.4, 0.1);
  vec3 brightGreen = vec3(0.0, 0.7, 0.15);
  
  // Bright cyan palette (#01F9C6)
  vec3 darkCyan = vec3(0.0, 0.25, 0.20);
  vec3 mediumCyan = vec3(0.0, 0.65, 0.50);
  vec3 brightCyan = vec3(0.004, 0.976, 0.776);
  
  // Purple palette (#6e59b5)
  vec3 darkPurple = vec3(0.11, 0.09, 0.18);
  vec3 mediumPurple = vec3(0.28, 0.23, 0.46);
  vec3 brightPurple = vec3(0.43, 0.35, 0.71);
  
  // Create slow time progression (80 second cycle)
  // 30s hold green, 10s transition to purple, 30s hold purple, 10s transition back to green
  float cycle = mod(time * 0.0125, 1.0); // 80 seconds total, normalized to 0-1 range
  
  vec3 darkColor, mediumColor, brightColor;
  
  // Phase boundaries: 30/80=0.375, 40/80=0.5, 70/80=0.875, 80/80=1.0
  
  if (cycle < 0.375) {
    // Phase 1: Hold Green (30s)
    darkColor = darkGreen;
    mediumColor = mediumGreen;
    brightColor = brightGreen;
  } else if (cycle < 0.5) {
    // Phase 2: Green to Purple transition (10s)
    float t = (cycle - 0.375) / 0.125; // normalize 10s transition
    darkColor = mix(darkGreen, darkPurple, t);
    mediumColor = mix(mediumGreen, mediumPurple, t);
    brightColor = mix(brightGreen, brightPurple, t);
  } else if (cycle < 0.875) {
    // Phase 3: Hold Purple (30s)
    darkColor = darkPurple;
    mediumColor = mediumPurple;
    brightColor = brightPurple;
  } else {
    // Phase 4: Purple to Green transition (10s)
    float t = (cycle - 0.875) / 0.125; // normalize 10s transition
    darkColor = mix(darkPurple, darkGreen, t);
    mediumColor = mix(mediumPurple, mediumGreen, t);
    brightColor = mix(brightPurple, brightGreen, t);
  }
  
  // Map grayscale to color palette
  vec3 terminalColor;
  if (gray < 0.3) {
    // Dark areas
    terminalColor = mix(darkColor, mediumColor, gray / 0.3);
  } else if (gray < 0.7) {
    // Mid areas
    terminalColor = mix(mediumColor, brightColor, (gray - 0.3) / 0.4);
  } else {
    // Bright areas
    terminalColor = brightColor * (0.8 + 0.4 * ((gray - 0.7) / 0.3));
  }
  
  outputColor = vec4(terminalColor * intensity, inputColor.a);
}
`;

class TerminalGreenEffect extends Effect {
  constructor() {
    super('TerminalGreenEffect', fragmentShader, {
      uniforms: new Map([
        ['intensity', new Uniform(1.0)],
        ['time', new Uniform(0.0)]
      ])
    });
  }
}

export const TerminalGreen = forwardRef<TerminalGreenEffect, { intensity?: number }>((props, ref) => {
  const effect = React.useMemo(() => new TerminalGreenEffect(), []);
  const { time } = useTimeStore();
  
  React.useEffect(() => {
    if (props.intensity !== undefined) {
      effect.uniforms.get('intensity')!.value = props.intensity;
    }
  }, [props.intensity, effect]);

  React.useEffect(() => {
    effect.uniforms.get('time')!.value = time;
  }, [time, effect]);

  return <primitive ref={ref} object={effect} />;
});

TerminalGreen.displayName = 'TerminalGreen';