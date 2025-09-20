import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { useTimeStore } from '../store/timeStore';

export const TimeUpdater: React.FC = () => {
  const timeRef = useRef(0);
  const frameCountRef = useRef(0);
  const lastFrameTime = useRef(0);
  const { player, setFps } = useGameStore();
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
      
      // Debug: Log FPS and frame time every 60 frames if we're not hitting 60fps
      if (frameCountRef.current % 60 === 0 && currentFps < 55) {
        console.log(`Low FPS detected: ${currentFps}fps (${(delta * 1000).toFixed(2)}ms frame time)`);
        console.log(`RAF timestamp: ${state.clock.elapsedTime}`);
      }
    }
    
    lastFrameTime.current = delta * 1000;
  });

  return null;
};