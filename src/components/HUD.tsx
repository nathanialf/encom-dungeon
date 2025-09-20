import React from 'react';
import { useGameStore } from '../store/gameStore';
import { Minimap } from './Minimap';

export const HUD: React.FC = () => {
  const { player, hud, toggleMinimap, toggleDebugInfo } = useGameStore();

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
            top: '20px',
            right: '20px',
            pointerEvents: 'auto',
          }}
        >
          <Minimap />
        </div>
      )}

      {hud.showDebugInfo && (
        <div
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            padding: '10px',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            border: '1px solid #00ff00',
            fontSize: '12px',
            pointerEvents: 'auto',
          }}
        >
          <div>Position: {player.position.map(p => p.toFixed(2)).join(', ')}</div>
          <div>Rotation: {player.rotation.map(r => r.toFixed(2)).join(', ')}</div>
          <div>Moving: {player.isMoving ? 'Yes' : 'No'}</div>
        </div>
      )}

      <div
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          fontSize: '12px',
          opacity: 0.7,
        }}
      >
        <div>WASD: Move | Mouse: Look | M: Minimap | F1: Debug</div>
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          pointerEvents: 'auto',
        }}
      >
        <button
          onClick={toggleMinimap}
          style={{
            marginRight: '10px',
            padding: '5px 10px',
            backgroundColor: 'transparent',
            color: '#00ff00',
            border: '1px solid #00ff00',
            fontFamily: 'monospace',
            cursor: 'pointer',
          }}
        >
          MAP
        </button>
        <button
          onClick={toggleDebugInfo}
          style={{
            padding: '5px 10px',
            backgroundColor: 'transparent',
            color: '#00ff00',
            border: '1px solid #00ff00',
            fontFamily: 'monospace',
            cursor: 'pointer',
          }}
        >
          DEBUG
        </button>
      </div>
    </div>
  );
};