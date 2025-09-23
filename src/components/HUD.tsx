import React, { useCallback, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { Minimap } from './Minimap';
import { TouchControls } from './TouchControls';

export const HUD: React.FC = () => {
  const { player, hud, dungeonMetadata, fps, isTouchDevice } = useGameStore();
  const isPortrait = window.innerHeight > window.innerWidth;
  const lastToggleTime = useRef<{ minimap: number; debug: number; screenshot: number }>({ minimap: 0, debug: 0, screenshot: 0 });

  const handleToggleMinimap = useCallback(() => {
    const now = Date.now();
    if (now - lastToggleTime.current.minimap > 200) { // 200ms debounce
      lastToggleTime.current.minimap = now;
      useGameStore.getState().toggleMinimap();
    }
  }, []);

  const handleToggleDebug = useCallback(() => {
    const now = Date.now();
    if (now - lastToggleTime.current.debug > 200) { // 200ms debounce
      lastToggleTime.current.debug = now;
      useGameStore.getState().toggleDebugInfo();
    }
  }, []);

  const handleScreenshot = useCallback(() => {
    const now = Date.now();
    if (now - lastToggleTime.current.screenshot > 200) { // 200ms debounce
      lastToggleTime.current.screenshot = now;
      
      try {
        // Find the WebGL canvas (React Three Fiber canvas)
        const canvas = document.querySelector('canvas') as HTMLCanvasElement;
        
        if (canvas) {
          // Wait for next frame to ensure render is complete
          requestAnimationFrame(() => {
            try {
              // Create data URL directly from canvas
              const dataURL = canvas.toDataURL('image/png');
              
              if (dataURL === 'data:,' || dataURL.length < 100) {
                console.error('Canvas appears to be empty or not properly rendered');
                return;
              }
              
              // Handle download differently for touch vs desktop
              if (isTouchDevice) {
                // For touch devices, open in new window for easier saving
                const newWindow = window.open();
                if (newWindow) {
                  newWindow.document.write(`<img src="${dataURL}" style="max-width:100%; height:auto;" />`);
                  newWindow.document.title = 'ENCOM Dungeon Screenshot';
                }
              } else {
                // For desktop, use direct download
                const link = document.createElement('a');
                link.href = dataURL;
                link.download = `encom-dungeon-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.png`;
                link.style.display = 'none';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }
            } catch (error) {
              console.error('Screenshot capture failed:', error);
            }
          });
        } else {
          console.error('Canvas not found or not accessible');
        }
      } catch (error) {
        console.error('Screenshot failed:', error);
      }
    }
  }, [isTouchDevice]);

  const handleTouchMove = useCallback((x: number, y: number) => {
    useGameStore.getState().setTouchInput(x, y);
  }, []);

  const handleTouchLook = useCallback((deltaX: number, deltaY: number) => {
    useGameStore.getState().touchLook(deltaX, deltaY);
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 1000,
        fontFamily: 'monospace',
        color: '#ffffff',
      }}
    >
      {hud.showMinimap && (
        <div
          style={{
            position: 'absolute',
            top: isTouchDevice ? '10px' : '20px',
            right: isTouchDevice ? '10px' : '20px',
            pointerEvents: 'auto',
            transform: isTouchDevice && isPortrait ? 'scale(0.5)' : isTouchDevice ? 'scale(0.8)' : 'none', // 50% smaller on portrait touch devices
            transformOrigin: 'top right',
          }}
        >
          <Minimap />
        </div>
      )}

      {hud.showDebugInfo && (
        <div
          style={{
            position: 'absolute',
            top: isTouchDevice ? '10px' : '20px',
            left: isTouchDevice ? '10px' : '20px',
            padding: isTouchDevice ? '8px' : '10px',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            border: '3px solid #ffffff',
            fontSize: isTouchDevice ? '10px' : '12px',
            pointerEvents: 'auto',
            maxWidth: isTouchDevice ? '200px' : 'none', // Constrain width on tablets
          }}
        >
          <div>FPS: {fps}</div>
          <div>Position: {player.position[0].toFixed(2)}, {player.position[1].toFixed(2)}, {player.position[2].toFixed(2)}</div>
          <div>Rotation: {player.rotation[0].toFixed(2)}, {player.rotation[1].toFixed(2)}, {player.rotation[2].toFixed(2)}</div>
          <div>Moving: {player.isMoving ? 'Yes' : 'No'}</div>
          <div style={{ marginTop: '10px', borderTop: '1px solid #ffffff', paddingTop: '5px' }}>
            <div>Hexagons: {dungeonMetadata.hexagonCount}</div>
            <div>Map Seed: {dungeonMetadata.mapSeed || 'Unknown'}</div>
            <div>Gen Time: {dungeonMetadata.generationTime.toFixed(2)}ms</div>
          </div>
        </div>
      )}

      <div
        style={{
          position: 'fixed', // Changed from absolute to fixed for better viewport handling
          bottom: isTouchDevice ? '20px' : '20px', // Increased bottom margin for tablets
          right: isTouchDevice ? '20px' : '20px', // Reset right position - we'll move touch controls instead
          padding: isTouchDevice ? '8px' : '10px',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          border: '3px solid #ffffff',
          borderRadius: '4px',
          pointerEvents: 'auto',
          fontSize: isTouchDevice ? '11px' : '12px',
          zIndex: 1002, // Ensure it's above touch controls
        }}
      >
        <div style={{ 
          fontSize: isTouchDevice ? '9px' : '12px', 
          opacity: 0.7, 
          marginBottom: '10px',
          textAlign: 'center',
          lineHeight: isTouchDevice ? '1.1' : 'normal',
          whiteSpace: isTouchDevice ? 'nowrap' : 'normal',
          minWidth: isTouchDevice ? '140px' : 'auto',
        }}>
          {isTouchDevice ? 'Left: Move | Right: Look' : 'WASD: Move | Mouse: Look'}
        </div>
        <button
          onClick={handleToggleMinimap}
          style={{
            marginRight: isTouchDevice ? '8px' : '10px',
            padding: isTouchDevice ? '8px 12px' : '5px 10px', // Larger touch targets
            backgroundColor: 'transparent',
            color: '#ffffff',
            border: '2px solid #ffffff',
            borderRadius: '2px',
            fontFamily: 'monospace',
            cursor: 'pointer',
            fontSize: isTouchDevice ? '11px' : '12px',
            minWidth: isTouchDevice ? '60px' : 'auto',
          }}
        >
          MAP{!isTouchDevice ? ' (M)' : ''}
        </button>
        <button
          onClick={handleToggleDebug}
          style={{
            marginRight: isTouchDevice ? '8px' : '10px',
            padding: isTouchDevice ? '8px 12px' : '5px 10px', // Larger touch targets
            backgroundColor: 'transparent',
            color: '#ffffff',
            border: '2px solid #ffffff',
            borderRadius: '2px',
            fontFamily: 'monospace',
            cursor: 'pointer',
            fontSize: isTouchDevice ? '11px' : '12px',
            minWidth: isTouchDevice ? '60px' : 'auto',
          }}
        >
          DEBUG{!isTouchDevice ? ' (F1)' : ''}
        </button>
        <button
          onClick={handleScreenshot}
          style={{
            padding: isTouchDevice ? '8px 12px' : '5px 10px', // Larger touch targets
            backgroundColor: 'transparent',
            color: '#ffffff',
            border: '2px solid #ffffff',
            borderRadius: '2px',
            fontFamily: 'monospace',
            cursor: 'pointer',
            fontSize: isTouchDevice ? '11px' : '12px',
            minWidth: isTouchDevice ? '60px' : 'auto',
          }}
        >
          SCREENSHOT{!isTouchDevice ? ' (P)' : ''}
        </button>
      </div>
      
      {/* Touch Controls */}
      <TouchControls 
        onMove={handleTouchMove}
        onLook={handleTouchLook}
      />
      
    </div>
  );
};