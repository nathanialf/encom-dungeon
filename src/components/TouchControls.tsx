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

    const rect = lookAreaRef.current?.getBoundingClientRect();
    if (!rect) return;

    setLookTouch({
      identifier: availableTouch.identifier,
      startX: rect.left + rect.width / 2, // Center of the bar
      startY: rect.top + rect.height / 2,
      currentX: availableTouch.clientX,
      currentY: availableTouch.clientY,
    });
  }, [lookTouch, moveTouch]);

  const handleLookMove = useCallback((event: TouchEvent) => {
    if (!lookTouch) return;
    
    const touch = Array.from(event.touches).find(t => t.identifier === lookTouch.identifier);
    if (!touch) return;

    const rect = lookAreaRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const barCenterX = rect.left + rect.width / 2;
    const deltaX = touch.clientX - barCenterX;
    
    // Constrain to bar width
    const maxDistance = rect.width / 2 - 20; // Leave some padding
    const constrainedDeltaX = Math.max(-maxDistance, Math.min(maxDistance, deltaX));
    
    // Convert to normalized value (-1 to 1)
    const normalizedX = constrainedDeltaX / maxDistance;
    
    setLookTouch(prev => prev ? { ...prev, currentX: touch.clientX, currentY: touch.clientY } : null);
    
    // Send continuous horizontal rotation with exponential scaling for faster movement at extremes
    const exponentialX = Math.sign(normalizedX) * Math.pow(Math.abs(normalizedX), 1.5);
    onLook(exponentialX * 35, 0); // Much higher multiplier for responsive looking (7x increase)
  }, [lookTouch, onLook]);

  const handleLookEnd = useCallback((event: TouchEvent) => {
    if (!lookTouch) return;
    
    const touch = Array.from(event.changedTouches).find(t => t.identifier === lookTouch.identifier);
    if (!touch) return;

    setLookTouch(null);
    onLook(0, 0); // Stop looking when released
  }, [lookTouch, onLook]);

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

  // Calculate look bar knob position
  const lookKnobX = lookTouch && lookAreaRef.current ? 
    (() => {
      const rect = lookAreaRef.current.getBoundingClientRect();
      const barCenterX = rect.left + rect.width / 2;
      const deltaX = lookTouch.currentX - barCenterX;
      const maxDistance = rect.width / 2 - 20;
      return Math.max(-maxDistance, Math.min(maxDistance, deltaX));
    })() : 0;

  // Detect orientation and device size for joystick positioning
  const isPortrait = window.innerHeight > window.innerWidth;
  const isTabletSize = Math.min(window.innerWidth, window.innerHeight) >= 768; // iPad mini and larger
  const isPortraitPhone = isPortrait && !isTabletSize;
  
  return (
    <>
      {/* Movement Joystick - Responsive positioning */}
      <div
        ref={moveJoystickRef}
        onTouchStart={handleMoveStart}
        style={{
          position: 'fixed',
          top: isPortraitPhone ? 'auto' : (isPortrait ? '60%' : '50%'), // Bottom for phones, centered for tablets/landscape
          bottom: isPortraitPhone ? '60px' : 'auto',
          left: '30px',
          transform: isPortraitPhone ? 'none' : 'translateY(-50%)', // No transform for phones, center for others
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

      {/* Look Bar Joystick - Horizontal bar for looking left/right, positioned at bottom */}
      <div
        ref={lookAreaRef}
        onTouchStart={handleLookStart}
        style={{
          position: 'fixed',
          top: isPortraitPhone ? 'auto' : (isPortrait ? '60%' : '50%'), // Match movement joystick positioning
          bottom: isPortraitPhone ? '95px' : 'auto', // Align with joystick center for phones
          transform: isPortraitPhone ? 'none' : 'translateY(-50%)', // Match joystick transform
          right: '30px', // Consistent right positioning
          left: 'auto', // Auto left positioning for both orientations
          width: '180px', // Fixed width for both orientations
          height: '50px', // Slightly smaller than movement joystick
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          border: '4px solid #ffffff',
          borderRadius: '25px', // Pill shape
          pointerEvents: 'auto',
          zIndex: 1001,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Look Bar Knob */}
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            border: '2px solid #ffffff',
            transform: `translateX(${lookKnobX}px)`,
            transition: lookTouch ? 'none' : 'transform 0.2s ease-out',
          }}
        />
        
        {/* Look label */}
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
          LOOK
        </div>
      </div>
    </>
  );
};