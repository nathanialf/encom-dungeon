import React from 'react';

export const LoadingScreen: React.FC = () => {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: '#000',
        color: '#00ff00',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'monospace',
        fontSize: '18px',
      }}
    >
      <div style={{ marginBottom: '20px' }}>
        ENCOM DUNGEON EXPLORER
      </div>
      <div style={{ marginBottom: '20px' }}>
        INITIALIZING SYSTEM...
      </div>
      <div
        style={{
          width: '300px',
          height: '4px',
          backgroundColor: '#333',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#00ff00',
            animation: 'loading 2s infinite',
          }}
        />
      </div>
      <style>
        {`
          @keyframes loading {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
        `}
      </style>
    </div>
  );
};