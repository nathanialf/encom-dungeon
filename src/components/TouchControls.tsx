import React, { useRef, useCallback, useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';

interface TouchControlsProps {
  onMove: (x: number, y: number) => void; // -1 to 1 for both axes
  onLook: (deltaX: number, deltaY: number) => void; // mouse delta equivalents
}

interface TouchState {
  identifier: number;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

export const TouchControls: React.FC<TouchControlsProps> = ({ onMove, onLook }) => {
  const moveJoystickRef = useRef<HTMLDivElement>(null);
  const lookAreaRef = useRef<HTMLDivElement>(null);
  const [moveTouch, setMoveTouch] = useState<TouchState | null>(null);
  const [lookTouch, setLookTouch] = useState<TouchState | null>(null);
  const { isTouchDevice } = useGameStore();

  const handleMoveStart = useCallback((event: React.TouchEvent) => {
    event.preventDefault();
    
    // Find a touch that's not already being used for looking
    const availableTouch = Array.from(event.touches).find(
      touch => !lookTouch || touch.identifier !== lookTouch.identifier
    );
    
    if (!availableTouch || moveTouch) return;

    const rect = moveJoystickRef.current?.getBoundingClientRect();
    if (!rect) return;

    setMoveTouch({
      identifier: availableTouch.identifier,
      startX: rect.left + rect.width / 2,
      startY: rect.top + rect.height / 2,
      currentX: availableTouch.clientX,
      currentY: availableTouch.clientY,
    });
  }, [moveTouch, lookTouch]);

  const handleMoveMove = useCallback((event: TouchEvent) => {
    if (!moveTouch) return;
    
    const touch = Array.from(event.touches).find(t => t.identifier === moveTouch.identifier);
    if (!touch) return;

    // Only process this touch if it's still within reasonable distance of the joystick
    const rect = moveJoystickRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const joystickCenterX = rect.left + rect.width / 2;
    const joystickCenterY = rect.top + rect.height / 2;
    const distanceFromCenter = Math.sqrt(
      Math.pow(touch.clientX - joystickCenterX, 2) + 
      Math.pow(touch.clientY - joystickCenterY, 2)
    );
    
    // If touch has moved too far from joystick, end the movement
    if (distanceFromCenter > 150) { // 150px max distance from joystick center
      setMoveTouch(null);
      onMove(0, 0);
      return;
    }

    const deltaX = touch.clientX - moveTouch.startX;
    const deltaY = touch.clientY - moveTouch.startY;
    
    // Constrain to joystick radius
    const maxDistance = 50;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const constrainedDeltaX = distance > maxDistance ? (deltaX / distance) * maxDistance : deltaX;
    const constrainedDeltaY = distance > maxDistance ? (deltaY / distance) * maxDistance : deltaY;
    
    // Convert to -1 to 1 range
    const normalizedX = constrainedDeltaX / maxDistance;
    const normalizedY = constrainedDeltaY / maxDistance;
    
    setMoveTouch(prev => prev ? { ...prev, currentX: touch.clientX, currentY: touch.clientY } : null);
    onMove(normalizedX, -normalizedY); // Flip Y: joystick UP (negative deltaY) becomes positive value for forward
  }, [moveTouch, onMove]);

  const handleMoveEnd = useCallback((event: TouchEvent) => {
    if (!moveTouch) return;
    
    const touch = Array.from(event.changedTouches).find(t => t.identifier === moveTouch.identifier);
    if (!touch) return;

    setMoveTouch(null);
    onMove(0, 0);
  }, [moveTouch, onMove]);

  const handleLookStart = useCallback((event: React.TouchEvent) => {
    event.preventDefault();
    
    // Find a touch that's not already being used for movement
    const availableTouch = Array.from(event.touches).find(
      touch => !moveTouch || touch.identifier !== moveTouch.identifier
    );
    
    if (!availableTouch || lookTouch) return;

    // Don't start look if touch is too close to the joystick
    const rect = moveJoystickRef.current?.getBoundingClientRect();
    if (rect) {
      const joystickCenterX = rect.left + rect.width / 2;
      const joystickCenterY = rect.top + rect.height / 2;
      const distanceFromJoystick = Math.sqrt(
        Math.pow(availableTouch.clientX - joystickCenterX, 2) + 
        Math.pow(availableTouch.clientY - joystickCenterY, 2)
      );
      
      // Don't start look if within joystick area
      if (distanceFromJoystick < 180) { // 180px exclusion zone around joystick
        return;
      }
    }

    setLookTouch({
      identifier: availableTouch.identifier,
      startX: availableTouch.clientX,
      startY: availableTouch.clientY,
      currentX: availableTouch.clientX,
      currentY: availableTouch.clientY,
    });
  }, [lookTouch, moveTouch]);

  const handleLookMove = useCallback((event: TouchEvent) => {
    if (!lookTouch) return;
    
    const touch = Array.from(event.touches).find(t => t.identifier === lookTouch.identifier);
    if (!touch) return;

    const deltaX = touch.clientX - lookTouch.currentX;
    const deltaY = touch.clientY - lookTouch.currentY;
    
    setLookTouch(prev => prev ? { ...prev, currentX: touch.clientX, currentY: touch.clientY } : null);
    onLook(deltaX * 2, deltaY * 2); // Amplify for responsiveness
  }, [lookTouch, onLook]);

  const handleLookEnd = useCallback((event: TouchEvent) => {
    if (!lookTouch) return;
    
    const touch = Array.from(event.changedTouches).find(t => t.identifier === lookTouch.identifier);
    if (!touch) return;

    setLookTouch(null);
  }, [lookTouch]);

  // Add global touch event listeners and prevent zoom
  useEffect(() => {
    if (!isTouchDevice) return;

    // Prevent zoom/pinch gestures
    const preventZoom = (event: TouchEvent) => {
      if (event.touches.length > 1) {
        event.preventDefault();
      }
    };

    // Prevent double-tap zoom
    const preventDoubleClickZoom = (event: Event) => {
      event.preventDefault();
    };

    document.addEventListener('touchmove', handleMoveMove, { passive: false });
    document.addEventListener('touchend', handleMoveEnd, { passive: false });
    document.addEventListener('touchmove', handleLookMove, { passive: false });
    document.addEventListener('touchend', handleLookEnd, { passive: false });
    document.addEventListener('touchstart', preventZoom, { passive: false });
    document.addEventListener('touchmove', preventZoom, { passive: false });
    document.addEventListener('dblclick', preventDoubleClickZoom, { passive: false });

    return () => {
      document.removeEventListener('touchmove', handleMoveMove);
      document.removeEventListener('touchend', handleMoveEnd);
      document.removeEventListener('touchmove', handleLookMove);
      document.removeEventListener('touchend', handleLookEnd);
      document.removeEventListener('touchstart', preventZoom);
      document.removeEventListener('touchmove', preventZoom);
      document.removeEventListener('dblclick', preventDoubleClickZoom);
    };
  }, [isTouchDevice, handleMoveMove, handleMoveEnd, handleLookMove, handleLookEnd]);

  if (!isTouchDevice) return null;

  const moveKnobX = moveTouch ? moveTouch.currentX - moveTouch.startX : 0;
  const moveKnobY = moveTouch ? moveTouch.currentY - moveTouch.startY : 0;

  // Detect orientation for joystick positioning
  const isPortrait = window.innerHeight > window.innerWidth;
  
  return (
    <>
      {/* Movement Joystick - Responsive positioning */}
      <div
        ref={moveJoystickRef}
        onTouchStart={handleMoveStart}
        style={{
          position: 'fixed',
          top: isPortrait ? 'auto' : '50%',
          bottom: isPortrait ? '60px' : 'auto',
          left: '30px',
          transform: isPortrait ? 'none' : 'translateY(-50%)',
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          border: '4px solid #ffffff',
          pointerEvents: 'auto',
          zIndex: 1001,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Joystick Knob */}
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            border: '2px solid #ffffff',
            transform: `translate(${Math.max(-40, Math.min(40, moveKnobX))}px, ${Math.max(-40, Math.min(40, moveKnobY))}px)`,
            transition: moveTouch ? 'none' : 'transform 0.2s ease-out',
          }}
        />
        
        {/* Movement label */}
        <div
          style={{
            position: 'absolute',
            bottom: '-25px',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '10px',
            color: '#ffffff',
            fontFamily: 'monospace',
            opacity: 0.7,
            whiteSpace: 'nowrap',
          }}
        >
          MOVE
        </div>
      </div>

      {/* Look Control Area - Top area in portrait, right side in landscape */}
      <div
        ref={lookAreaRef}
        onTouchStart={handleLookStart}
        style={{
          position: 'fixed',
          top: '0',
          right: '0',
          bottom: isPortrait ? '200px' : '0', // Leave space for joystick at bottom in portrait
          left: isPortrait ? '0' : '200px', // Full width in portrait, leave space for joystick on left in landscape
          backgroundColor: 'transparent',
          pointerEvents: 'auto',
          zIndex: 1000,
        }}
      />

      {/* Additional Look Control Area - Right side of joystick in portrait mode */}
      {isPortrait && (
        <div
          onTouchStart={handleLookStart}
          style={{
            position: 'fixed',
            top: 'auto',
            bottom: '0',
            right: '0',
            height: '200px', // Same height as joystick exclusion zone
            left: '170px', // Start just right of the joystick (30px + 120px + 20px margin)
            backgroundColor: 'transparent',
            pointerEvents: 'auto',
            zIndex: 1000,
          }}
        />
      )}
    </>
  );
};