// src/components/animations/ImprovedSpaceship.tsx
import React, { useEffect, useState, useRef } from 'react';

interface ImprovedSpaceshipProps {
  id?: string;
  size?: number;
  speed?: number;
  initialDelay?: number;
}

const ImprovedSpaceship: React.FC<ImprovedSpaceshipProps> = ({
  id = 'ship-1',
  size = 40,
  speed = 1,
  initialDelay = 0
}) => {
  // State to track spaceship position and animation properties
  const [position, setPosition] = useState({
    x: Math.random() * 80 + 10, // 10-90% of screen width
    y: Math.random() * 80 + 10, // 10-90% of screen height
    rotation: Math.random() * 360,
    scale: 0.8 + Math.random() * 0.4,
    opacity: 1,
    enginePower: 0.5 + Math.random() * 0.5,
  });

  const [isFlying, setIsFlying] = useState(false);
  const [engineBoost, setEngineBoost] = useState(false);
  
  // Animation frame ID for cleanup
  const animationFrameId = useRef<number | null>(null);
  
  // Flight path data
  const flightData = useRef({
    startX: 0,
    startY: 0,
    targetX: 0,
    targetY: 0,
    startTime: 0,
    duration: 0,
    distanceFactor: 0
  });
  
  // Component mounted flag
  const isMounted = useRef(true);

  // Calculate rotation angle based on flight direction
  const calculateRotation = (fromX: number, fromY: number, toX: number, toY: number) => {
    const angleRad = Math.atan2(toY - fromY, toX - fromX);
    return (angleRad * 180) / Math.PI + 90; // +90 to adjust for ship orientation
  };

  // Generate a new target destination
  const generateNewDestination = () => {
    if (!isMounted.current) return;
    
    const startX = position.x;
    const startY = position.y;
    
    // Generate destination coordinates - towards screen edges for more interesting paths
    const targetX = Math.random() > 0.5 ? Math.random() * 30 : 70 + Math.random() * 30;
    const targetY = Math.random() > 0.5 ? Math.random() * 30 : 70 + Math.random() * 30;
    
    // Calculate the distance for dynamic duration
    const distanceX = targetX - startX;
    const distanceY = targetY - startY;
    const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
    
    // Longer distance = longer flight duration, scaled by speed factor
    const distanceFactor = Math.min(Math.max(distance / 100, 0.5), 1.5);
    const baseDuration = 8000 / speed; // Base duration modified by speed property
    const duration = baseDuration * distanceFactor;
    
    // Calculate rotation based on new direction
    const newRotation = calculateRotation(startX, startY, targetX, targetY);
    
    // Update visual rotation first for a smoother look
    setPosition(prev => ({
      ...prev,
      rotation: newRotation
    }));
    
    // Store flight data
    flightData.current = {
      startX,
      startY,
      targetX,
      targetY,
      startTime: Date.now(),
      duration,
      distanceFactor
    };
    
    // Start flying
    setIsFlying(true);
    setEngineBoost(true);
    
    // Briefly boost engine, then normalize
    setTimeout(() => {
      if (isMounted.current) setEngineBoost(false);
    }, 500);
  };

  // Animate the spaceship along the path
  const animateSpaceship = () => {
    if (!isMounted.current) return;
    
    const {
      startX,
      startY,
      targetX,
      targetY,
      startTime,
      duration,
      distanceFactor
    } = flightData.current;
    
    const now = Date.now();
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Use a custom easing function for more realistic movement
    // Slow start, fast middle, slow end
    const easeInOutQuart = (t: number): number => {
      return t < 0.5
        ? 8 * t * t * t * t
        : 1 - Math.pow(-2 * t + 2, 4) / 2;
    };
    
    const easedProgress = easeInOutQuart(progress);
    
    if (progress < 1) {
      // Calculate new position
      const newX = startX + (targetX - startX) * easedProgress;
      const newY = startY + (targetY - startY) * easedProgress;
      
      // Apply slight oscillation for more realistic flight
      const oscillation = Math.sin(elapsed / 200) * 0.5;
      
      // Update position
      setPosition(prev => ({
        ...prev,
        x: newX,
        y: newY,
        // Simulate banking/turning by adding slight tilt
        rotation: prev.rotation + oscillation,
        // Engine power increases with speed
        enginePower: 0.5 + (distanceFactor * 0.5) * (1 - Math.abs(progress - 0.5) * 1.5)
      }));
      
      // Continue animation loop
      animationFrameId.current = requestAnimationFrame(animateSpaceship);
    } else {
      // Reached destination
      setIsFlying(false);
      
      // Schedule next flight with random delay
      const nextFlightDelay = 1000 + Math.random() * 3000; // 1-4 second delay
      setTimeout(() => {
        if (isMounted.current) generateNewDestination();
      }, nextFlightDelay);
    }
  };

  // Start animation when component mounts
  useEffect(() => {
    // Initial delay before first flight
    const timer = setTimeout(() => {
      if (isMounted.current) generateNewDestination();
    }, initialDelay);
    
    // Cleanup function
    return () => {
      isMounted.current = false;
      clearTimeout(timer);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [initialDelay]); // Only run on mount and when initialDelay changes

  // Start/stop animation when flying state changes
  useEffect(() => {
    if (isFlying && isMounted.current) {
      animationFrameId.current = requestAnimationFrame(animateSpaceship);
    }
    
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }
    };
  }, [isFlying]);

  return (
    <div
      style={{
        position: 'fixed',
        zIndex: 5,
        pointerEvents: 'none',
        width: `${size}px`,
        height: `${size}px`,
        top: `${position.y}%`,
        left: `${position.x}%`,
        transform: `translate(-50%, -50%) rotate(${position.rotation}deg) scale(${position.scale})`,
        transition: 'transform 0.2s ease-out',
        filter: 'drop-shadow(0 0 8px rgba(147, 197, 253, 0.4))'
      }}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Spaceship Body */}
        <path
          d="M50 10C45 35 45 65 50 90C55 65 55 35 50 10Z"
          fill="#93C5FD"
          opacity="0.8"
        />
        
        {/* Wings */}
        <path
          d="M50 40L20 65L25 70L50 50L75 70L80 65L50 40Z"
          fill="#3B82F6"
          opacity="0.9"
        />
        
        {/* Cockpit */}
        <circle cx="50" cy="35" r="10" fill="#1E40AF" opacity="0.7" />
        
        {/* Engine Glow - changes size based on engine power */}
        <circle
          cx="50"
          cy="85"
          r={8 * (engineBoost ? 1.5 : 1) * position.enginePower}
          fill="#EC4899"
          opacity={0.7 * position.enginePower}
        />
      </svg>
      
      {/* Engine trail particles */}
      <div
        style={{
          position: 'absolute',
          top: '85%',
          left: '45%',
          width: '10%',
          height: `${30 * position.enginePower * (engineBoost ? 2 : 1)}%`,
          background: 'linear-gradient(to top, transparent, #EC4899)',
          opacity: 0.5 * position.enginePower,
          filter: 'blur(2px)',
          zIndex: -1
        }}
      />
    </div>
  );
};

export default ImprovedSpaceship;