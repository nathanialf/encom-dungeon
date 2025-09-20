import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

export const useShaderTime = (material: THREE.ShaderMaterial | null) => {
  const timeRef = useRef(0);

  useFrame((state, delta) => {
    timeRef.current += delta;
    if (material && material.uniforms.uTime) {
      material.uniforms.uTime.value = timeRef.current;
    }
  });

  return timeRef.current;
};