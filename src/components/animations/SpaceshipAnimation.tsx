// src/components/animations/SpaceshipAnimation.tsx
import React, { useEffect, useState } from 'react';

interface SpaceshipProps {
  speed?: number;  // Controls animation speed (lower = faster)
  size?: number;   // Size of the spaceship in pixels
}

const SpaceshipAnimation: React.FC<SpaceshipProps> = ({ 
  speed = 45, 
  size = 40 
}) => {
  const [position, setPosition] = useState({
    x: Math.random() * 100,
    y: Math.random() * 100,
    rotation: Math.random() * 360,
    scale: 0.8 + Math.random() * 0.4
  });
  
  // Create a new random position
  const generateNewPosition = () => {
    return {
      x: Math.random() * 100,
      y: Math.random() * 100,
      rotation: Math.random() * 360,
      scale: 0.8 + Math.random() * 0.4
    };
  };
  
  // Update position periodically
  useEffect(() => {
    const updateInterval = setInterval(() => {
      setPosition(generateNewPosition());
    }, speed * 1000);
    
    return () => clearInterval(updateInterval);
  }, [speed]);
  
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
        transform: `rotate(${position.rotation}deg) scale(${position.scale})`,
        transition: `all ${speed}s cubic-bezier(0.34, 1.56, 0.64, 1)`,
        filter: 'drop-shadow(0 0 10px rgba(147, 197, 253, 0.5))'
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
        
        {/* Engine Glow */}
        <circle
          cx="50"
          cy="85"
          r="8"
          fill="#EC4899"
          opacity="0.8"
          style={{
            animation: 'pulse 1.5s infinite alternate'
          }}
        />
      </svg>
      
      {/* Engine trail particles */}
      <div
        style={{
          position: 'absolute',
          top: '85%',
          left: '45%',
          width: '10%',
          height: '30%',
          background: 'linear-gradient(to top, transparent, #EC4899)',
          opacity: 0.5,
          filter: 'blur(2px)',
          zIndex: -1
        }}
      />
      
      <style jsx>{`
        @keyframes pulse {
          0% { opacity: 0.5; transform: scale(0.8); }
          100% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
};

export default SpaceshipAnimation;