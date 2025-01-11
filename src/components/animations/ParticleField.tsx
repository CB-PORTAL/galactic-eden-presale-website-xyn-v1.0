// src/components/animations/ParticleField.tsx
import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface ParticleFieldProps {
  density?: number;
  speed?: number;
  className?: string;
}

export function ParticleField({ 
  density = 50, 
  speed = 1,
  className = ""
}: ParticleFieldProps) {
  return (
    <div className={`fixed inset-0 pointer-events-none ${className}`}>
      {[...Array(density)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-blue-400/30 rounded-full"
          initial={{ 
            x: `${Math.random() * 100}%`,
            y: `${Math.random() * 100}%`,
            scale: Math.random() * 0.5 + 0.5,
          }}
          animate={{
            y: [null, '100%'],
            x: Math.random() > 0.5 ? '+100px' : '-100px'
          }}
          transition={{
            duration: Math.random() * 5 + 5,
            repeat: Infinity,
            ease: 'linear'
          }}
        />
      ))}
    </div>
  );
}