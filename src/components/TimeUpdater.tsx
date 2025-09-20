import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { useGameStore } from '../store/gameStore';

export const TimeUpdater: React.FC = () => {
  const timeRef = useRef(0);
  const frameCountRef = useRef(0);
  const { player } = useGameStore();

  useFrame((state, delta) => {
    timeRef.current += delta;
    frameCountRef.current++;
    
    // Only update uniforms every 3rd frame to reduce overhead
    if (frameCountRef.current % 3 === 0) {
      state.scene.traverse((child) => {
        if ((child as any).material && (child as any).material.uniforms) {
          const uniforms = (child as any).material.uniforms;
          if (uniforms.uTime) {
            uniforms.uTime.value = timeRef.current;
          }
          if (uniforms.uPlayerPosition) {
            uniforms.uPlayerPosition.value.set(player.position[0], player.position[1], player.position[2]);
          }
        }
      });
    }
  });

  return null;
};