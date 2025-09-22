import React, { useEffect } from 'react';
import { DungeonScene } from './components/DungeonScene';
import { HUD } from './components/HUD';
import { useDungeonGenerator } from './hooks/useDungeonGenerator';
import { useGameStore } from './store/gameStore';

function App() {
  const { error } = useGameStore();
  const { generateDungeon } = useDungeonGenerator();

  // Set touch device detection once at app level
  useEffect(() => {
    const checkTouchDevice = () => {
      // Enhanced iPad/tablet detection
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isTabletScreen = window.innerWidth <= 1366 || window.innerHeight <= 1024; // Increased for iPad Pro
      
      // iPad-specific detection (iOS 13+ reports as desktop)
      const isIPad = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      
      // Android tablet detection
      const isAndroidTablet = /Android/.test(navigator.userAgent) && !/Mobile/.test(navigator.userAgent);
      
      // Any touch-capable device with tablet-like dimensions
      const isTouchTablet = hasTouch && isTabletScreen;
      
      const isTouchDevice = isIPad || isAndroidTablet || isTouchTablet;
      
      
      useGameStore.getState().setTouchDevice(isTouchDevice);
    };
    
    checkTouchDevice();
    window.addEventListener('resize', checkTouchDevice);
    return () => window.removeEventListener('resize', checkTouchDevice);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'F1') {
        event.preventDefault();
        useGameStore.getState().toggleDebugInfo();
      }
      if (event.key === 'm' || event.key === 'M') {
        event.preventDefault();
        useGameStore.getState().toggleMinimap();
      }
      if (event.key === 'r' || event.key === 'R') {
        event.preventDefault();
        generateDungeon(300);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [generateDungeon]);

  if (error) {
    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: '#000',
          color: '#ff0000',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'monospace',
          fontSize: '18px',
        }}
      >
        <div style={{ marginBottom: '20px' }}>
          SYSTEM ERROR
        </div>
        <div style={{ marginBottom: '20px', maxWidth: '600px', textAlign: 'center' }}>
          {error}
        </div>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '10px 20px',
            backgroundColor: 'transparent',
            color: '#ff0000',
            border: '1px solid #ff0000',
            fontFamily: 'monospace',
            cursor: 'pointer',
          }}
        >
          RESTART SYSTEM
        </button>
      </div>
    );
  }

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      overflow: 'hidden',
      touchAction: 'none', // Disable all touch gestures like zoom, pan
      userSelect: 'none', // Prevent text selection on touch
      WebkitUserSelect: 'none',
      WebkitTouchCallout: 'none', // Disable iOS callout menu
    }}>
      <DungeonScene />
      <HUD />
    </div>
  );
}

export default App;