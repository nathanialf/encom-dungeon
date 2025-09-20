import React, { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { HexGrid } from './HexGrid';
import { HEX_HEIGHT_SCALE } from '../utils/hexUtils';
import { FirstPersonController } from './FirstPersonController';
import { Effects } from './Effects';
import { LoadingScreen } from './LoadingScreen';
import { useGameStore } from '../store/gameStore';
import './materials/TerminalMaterials';
import { TimeUpdater } from './TimeUpdater';

// Scene content component that runs inside Canvas
const SceneContent: React.FC<{ dungeon: any; dungeonBounds: any }> = ({ dungeon, dungeonBounds }) => {
  
  return (
    <>
      <ambientLight intensity={0.01} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={0.02}
      />
      <pointLight position={[0, 10, 0]} intensity={0.05} color="#ffffff" />
      
      {/* Floor */}
      <mesh position={[dungeonBounds.centerX, -0.1, dungeonBounds.centerZ]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[dungeonBounds.width, dungeonBounds.height]} />
        <floorMaterial />
      </mesh>
      
      
      <HexGrid hexes={dungeon} />
      <FirstPersonController />
      
      <Effects />
      <TimeUpdater />
    </>
  );
};

export const DungeonScene: React.FC = () => {
  const { dungeon, isLoading } = useGameStore();

  // Calculate dungeon bounding box for ceiling
  const dungeonBounds = useMemo(() => {
    if (dungeon.length === 0) return { width: 200, height: 200, centerX: 0, centerZ: 0, ceilingHeight: 10 };
    
    let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
    
    dungeon.forEach(hex => {
      minX = Math.min(minX, hex.position.x);
      maxX = Math.max(maxX, hex.position.x);
      minZ = Math.min(minZ, hex.position.z);
      maxZ = Math.max(maxZ, hex.position.z);
    });
    
    const padding = 50; // Extra space around edges
    const hexHeight = dungeon.length > 0 ? dungeon[0].height : 1;
    const ceilingHeight = hexHeight * HEX_HEIGHT_SCALE + 5; // Hex height + small clearance
    
    return {
      width: maxX - minX + padding * 2,
      height: maxZ - minZ + padding * 2,
      centerX: (minX + maxX) / 2,
      centerZ: (minZ + maxZ) / 2,
      ceilingHeight
    };
  }, [dungeon]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas
        camera={{
          position: [0, 5, 0],
          rotation: [0, 0, 0],
          fov: 90,
          near: 0.5,
          far: 120, // Further reduced to match render distance
        }}
      >
        <Suspense fallback={null}>
          <SceneContent dungeon={dungeon} dungeonBounds={dungeonBounds} />
        </Suspense>
      </Canvas>
    </div>
  );
};