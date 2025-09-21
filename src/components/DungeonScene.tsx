import React, { Suspense, useMemo, useEffect, useState } from 'react';
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
  const [webglContextKey, setWebglContextKey] = useState(0);

  // Listen for WebGL context restoration events
  useEffect(() => {
    const handleGlobalContextRestored = () => {
      console.log('Global context restoration detected. Remounting Canvas...');
      setWebglContextKey(prev => prev + 1);
    };

    window.addEventListener('webglcontextrestored', handleGlobalContextRestored);
    return () => window.removeEventListener('webglcontextrestored', handleGlobalContextRestored);
  }, []);

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
    <div style={{ 
      width: '100vw', 
      height: '100vh',
      // Force high refresh rate hints
      willChange: 'transform',
      transform: 'translateZ(0)', // Force GPU acceleration
    }}>
      <Canvas
        key={`webgl-context-${webglContextKey}`} // Force remount on context restoration
        onCreated={({ gl }) => {
          gl.setClearColor('#ffffff');
          // Force 60fps performance optimizations
          gl.setPixelRatio(1); // Force 1x pixel ratio for maximum performance
          gl.shadowMap.enabled = false;
          
          // Force WebGL to prioritize performance over quality
          const canvas = gl.domElement;
          // Try to hint browser to use 60fps
          canvas.style.imageRendering = 'pixelated';
          
          // Add debug function for testing context loss
          if (process.env.NODE_ENV === 'development') {
            (window as any).forceWebGLContextLoss = () => {
              const ext = gl.getContext().getExtension('WEBGL_lose_context');
              if (ext) {
                console.log('Forcing WebGL context loss for testing...');
                ext.loseContext();
              }
            };
          }
          
          // Add WebGL context loss handlers
          const handleContextLost = (event: Event) => {
            event.preventDefault(); // Tell browser to attempt context restoration
            console.warn('WebGL context lost. Stopping rendering and preparing for recovery...');
            
            // Stop the render loop immediately
            gl.setAnimationLoop(null);
          };
          
          const handleContextRestored = () => {
            console.log('WebGL context restored. Recreating scene...');
            
            // Reinitialize WebGL state
            gl.setClearColor('#ffffff');
            gl.setPixelRatio(1);
            gl.shadowMap.enabled = false;
            
            // Force a complete re-render by triggering React state update
            // This will recreate all Three.js objects and shaders
            setTimeout(() => {
              const event = new Event('webglcontextrestored');
              window.dispatchEvent(event);
            }, 100);
          };
          
          canvas.addEventListener('webglcontextlost', handleContextLost, false);
          canvas.addEventListener('webglcontextrestored', handleContextRestored, false);
        }}
        gl={{ 
          powerPreference: 'high-performance',
          antialias: false, // Disable antialiasing for performance
          alpha: false, // Disable alpha channel
          stencil: false, // Disable stencil buffer
          depth: true, // Keep depth buffer for 3D
          preserveDrawingBuffer: false, // Don't preserve to save memory
          failIfMajorPerformanceCaveat: false, // Allow fallback
        }}
        frameloop="always" // Force continuous rendering
        performance={{ min: 0.3 }} // Lower threshold to be more forgiving
        camera={{
          position: [0, 5, 0],
          rotation: [0, 0, 0],
          fov: 90,
          near: 0.5,
          far: 200, // Increased render distance for larger dungeons
        }}
      >
        <Suspense fallback={null}>
          <SceneContent dungeon={dungeon} dungeonBounds={dungeonBounds} />
        </Suspense>
      </Canvas>
    </div>
  );
};