// src/components/animations/EnhancedPortal.tsx
import React from 'react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface EnhancedPortalProps {
  isActive: boolean;
  children: React.ReactNode;
}

export function EnhancedPortal({ isActive, children }: EnhancedPortalProps) {
  const [depth, setDepth] = useState(0);
  
  useEffect(() => {
    if (isActive) {
      setDepth(100);
    } else {
      setDepth(0);
    }
  }, [isActive]);

  return (
    <div className="relative w-full h-screen flex flex-col items-center justify-center">
      {/* Deep Space Background */}
      <div className="fixed inset-0 bg-[#020617]">
        <div className="absolute inset-0 bg-gradient-radial from-blue-500/5 via-transparent to-transparent" />
      </div>

      {/* Portal Ring Effects */}
      <AnimatePresence>
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={`ring-${i}`}
            className="absolute"
            style={{
              width: '600px',
              height: '600px',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)'
            }}
            initial={{ scale: 1, opacity: 0 }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.1, 0.3, 0.1],
              rotate: [0, 180, 360]
            }}
            transition={{
              duration: 4,
              delay: i * 0.5,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            <div className="w-full h-full rounded-full border-2 border-blue-500/30" />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Energy Field */}
      <div className="absolute inset-0 backdrop-blur-sm">
        <motion.div
          className="absolute"
          style={{
            width: '800px',
            height: '800px',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)'
          }}
          animate={{
            rotate: [0, 360]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <div className="w-full h-full rounded-full bg-gradient-conic from-blue-500/20 via-purple-500/20 to-blue-500/20" />
        </motion.div>
      </div>

      {/* Content Container */}
      <motion.div
        className="relative z-10 max-w-xl mx-auto w-full"
        animate={{
          scale: isActive ? 1.05 : 1,
          perspective: depth
        }}
        transition={{
          type: "spring",
          stiffness: 100
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}