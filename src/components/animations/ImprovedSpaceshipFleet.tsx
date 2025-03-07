// src/components/animations/ImprovedSpaceshipFleet.tsx
import React from 'react';
import ImprovedSpaceship from './ImprovedSpaceship';

interface ImprovedSpaceshipFleetProps {
  count?: number;
  minSize?: number;
  maxSize?: number;
  minSpeed?: number;
  maxSpeed?: number;
}

const ImprovedSpaceshipFleet: React.FC<ImprovedSpaceshipFleetProps> = ({
  count = 5,
  minSize = 30,
  maxSize = 60,
  minSpeed = 0.7,
  maxSpeed = 1.5
}) => {
  // Create fleet with varying characteristics
  const generateFleet = () => {
    return Array.from({ length: count }, (_, index) => {
      // Calculate random size and speed
      const size = minSize + Math.random() * (maxSize - minSize);
      const speed = minSpeed + Math.random() * (maxSpeed - minSpeed);
      
      // Stagger initial spawn times for more natural appearance
      const initialDelay = index * 1000;
      
      return {
        id: `spaceship-${index}`,
        size,
        speed,
        initialDelay
      };
    });
  };
  
  const spaceships = generateFleet();
  
  return (
    <>
      {spaceships.map(ship => (
        <ImprovedSpaceship
          key={ship.id}
          id={ship.id}
          size={ship.size}
          speed={ship.speed}
          initialDelay={ship.initialDelay}
        />
      ))}
    </>
  );
};

export default ImprovedSpaceshipFleet;