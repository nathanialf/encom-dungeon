import React, { useCallback, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { Minimap } from './Minimap';
import { TouchControls } from './TouchControls';

export const HUD: React.FC = () => {
  const { player, hud, dungeonMetadata, fps, isTouchDevice } = useGameStore();
  const lastToggleTime = useRef<{ minimap: number; debug: number }>({ minimap: 0, debug: 0 });

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
        color: '#00ff00',
      }}
    >
      {hud.showMinimap && (
        <div
          style={{
            position: 'absolute',
            top: isTouchDevice ? '10px' : '20px',
            right: isTouchDevice ? '10px' : '20px',
            pointerEvents: 'auto',
            transform: isTouchDevice ? 'scale(0.8)' : 'none', // Slightly smaller on tablets
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
            border: '1px solid #00ff00',
            fontSize: isTouchDevice ? '10px' : '12px',
            pointerEvents: 'auto',
            maxWidth: isTouchDevice ? '200px' : 'none', // Constrain width on tablets
          }}
        >
          <div>FPS: {fps}</div>
          <div>Position: {player.position[0].toFixed(2)}, {player.position[1].toFixed(2)}, {player.position[2].toFixed(2)}</div>
          <div>Rotation: {player.rotation[0].toFixed(2)}, {player.rotation[1].toFixed(2)}, {player.rotation[2].toFixed(2)}</div>
          <div>Moving: {player.isMoving ? 'Yes' : 'No'}</div>
          <div style={{ marginTop: '10px', borderTop: '1px solid #00ff00', paddingTop: '5px' }}>
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
          border: '1px solid #00ff00',
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
            color: '#00ff00',
            border: '1px solid #00ff00',
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
            padding: isTouchDevice ? '8px 12px' : '5px 10px', // Larger touch targets
            backgroundColor: 'transparent',
            color: '#00ff00',
            border: '1px solid #00ff00',
            borderRadius: '2px',
            fontFamily: 'monospace',
            cursor: 'pointer',
            fontSize: isTouchDevice ? '11px' : '12px',
            minWidth: isTouchDevice ? '60px' : 'auto',
          }}
        >
          DEBUG{!isTouchDevice ? ' (F1)' : ''}
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