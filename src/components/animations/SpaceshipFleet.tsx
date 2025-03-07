// src/components/animations/SpaceshipFleet.tsx
import React from 'react';
import SpaceshipAnimation from './SpaceshipAnimation';

interface SpaceshipFleetProps {
  count?: number;  // Number of spaceships to display
}

const SpaceshipFleet: React.FC<SpaceshipFleetProps> = ({ count = 3 }) => {
  // Create an array of spaceships with different properties
  const spaceships = Array.from({ length: count }, (_, index) => ({
    id: `spaceship-${index}`,
    size: 30 + Math.random() * 20, // Random size between 30-50px
    speed: 35 + Math.random() * 25  // Random speed between 35-60 seconds
  }));
  
  return (
    <>
      {spaceships.map(ship => (
        <SpaceshipAnimation 
          key={ship.id} 
          size={ship.size} 
          speed={ship.speed} 
        />
      ))}
    </>
  );
};

export default SpaceshipFleet;