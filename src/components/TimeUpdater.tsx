import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { useTimeStore } from '../store/timeStore';

export const TimeUpdater: React.FC = () => {
  const timeRef = useRef(0);
  const frameCountRef = useRef(0);
  const lastFrameTime = useRef(0);
  const { setFps } = useGameStore();
  const { updateTime } = useTimeStore();

  useFrame((state, delta) => {
    timeRef.current += delta;
    frameCountRef.current++;
    
    // Update time store every frame
    updateTime(delta);
    
    // Calculate FPS using delta time (instantaneous FPS)
    const currentFps = Math.round(1 / delta);
    
    // Update FPS display every 10 frames to smooth out fluctuations
    if (frameCountRef.current % 10 === 0) {
      setFps(currentFps);
      
      // Debug logging removed to prevent memory accumulation
    }
    
    lastFrameTime.current = delta * 1000;
  });

  return null;
};