import React, { forwardRef } from 'react';
import { Effect } from 'postprocessing';
import { Uniform } from 'three';
import { useGameStore } from '../../store/gameStore';
import { useTimeStore } from '../../store/timeStore';

const fragmentShader = `
uniform float intensity;
uniform float mapSeed;
uniform float colorIndex;
uniform float time;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  // Convert to grayscale first
  float gray = dot(inputColor.rgb, vec3(0.299, 0.587, 0.114));
  
  // Color lookup matrix - dark, medium, bright for each color
  vec3 colorMatrix[15] = vec3[15](
    // Green colors (index 0) - #00b300
    vec3(0.0, 0.1, 0.0),    // dark green
    vec3(0.0, 0.4, 0.1),    // medium green  
    vec3(0.0, 0.7, 0.15),   // bright green
    // Purple colors (index 1) - #8500ad
    vec3(0.1, 0.0, 0.1),    // dark purple
    vec3(0.3, 0.0, 0.4),    // medium purple
    vec3(0.52, 0.0, 0.68),  // bright purple
    // Teal colors (index 2) - #018c6c
    vec3(0.0, 0.1, 0.08),   // dark teal
    vec3(0.0, 0.3, 0.25),   // medium teal
    vec3(0.0, 0.55, 0.42),  // bright teal
    // Red colors (index 3) - #8b0000
    vec3(0.1, 0.0, 0.0),    // dark red
    vec3(0.3, 0.0, 0.0),    // medium red
    vec3(0.55, 0.0, 0.0),   // bright red
    // Amber colors (index 4) - #d53600
    vec3(0.1, 0.02, 0.0),   // dark amber
    vec3(0.5, 0.12, 0.0),   // medium amber
    vec3(0.84, 0.21, 0.0)   // bright amber
  );
  
  // Use the pre-calculated colorIndex from JavaScript
  int baseIndex = int(colorIndex);
  
  // Use colors as lookup[colorIndex], lookup[colorIndex+1], lookup[colorIndex+2]
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
  
  // Subtle glitch effect - every 15 seconds for 1 second
  float cycleMod = mod(time, 15.0);
  float glitchIntensity = max(0.0, cycleMod - 14.0); // 0 for first 14s, then 0-1 for last 1s
  
  // Subtle brightness changes during glitch
  float glitchNoise = sin(time * 10.0) * 0.5 + 0.5; // 0 to 1
  float glitchBrightness = 0.8 + glitchNoise * 0.4; // 0.8 to 1.2 (subtle range)
  
  float brightnessShift = 1.0 + glitchIntensity * (glitchBrightness - 1.0);
  
  outputColor = vec4(terminalColor * intensity * brightnessShift, inputColor.a);
}
`;

class TerminalGreenEffect extends Effect {
  constructor() {
    super('TerminalGreenEffect', fragmentShader, {
      uniforms: new Map([
        ['intensity', new Uniform(1.0)],
        ['mapSeed', new Uniform(0.0)],
        ['colorIndex', new Uniform(0.0)],
        ['time', new Uniform(0.0)]
      ])
    });
  }
}

export const TerminalGreen = forwardRef<TerminalGreenEffect, { intensity?: number }>((props, ref) => {
  const { dungeonMetadata } = useGameStore();
  const { time } = useTimeStore();
  const effect = React.useMemo(() => new TerminalGreenEffect(), []);
  
  React.useEffect(() => {
    if (props.intensity !== undefined) {
      effect.uniforms.get('intensity')!.value = props.intensity;
    }
  }, [props.intensity, effect]);

  React.useEffect(() => {
    const mapSeed = dungeonMetadata.mapSeed;
    if (mapSeed !== null) {
      // Convert string to hash number
      let hash = 0;
      for (let i = 0; i < mapSeed.length; i++) {
        const char = mapSeed.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
      }
      const seedValue = Math.abs(hash);
      const moduloResult = seedValue % 5;
      const colorIndex = moduloResult * 3;
      effect.uniforms.get('mapSeed')!.value = seedValue;
      effect.uniforms.get('colorIndex')!.value = colorIndex;
    }
  }, [dungeonMetadata.mapSeed, effect]);

  React.useEffect(() => {
    effect.uniforms.get('time')!.value = time;
  }, [time, effect]);

  return <primitive ref={ref} object={effect} />;
});

TerminalGreen.displayName = 'TerminalGreen';