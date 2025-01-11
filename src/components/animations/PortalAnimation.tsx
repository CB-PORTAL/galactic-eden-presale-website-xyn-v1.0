// src/components/animations/PortalAnimation.tsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PortalAnimationProps {
  active: boolean;
  className?: string;
}

export function PortalAnimation({ active, className = "" }: PortalAnimationProps) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div 
          className={`absolute inset-0 pointer-events-none ${className}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            initial={{ scale: 0 }}
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 360]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            <div className="w-96 h-96 rounded-full bg-gradient-conic from-blue-500/20 via-purple-500/20 to-blue-500/20" />
          </motion.div>
          
          <motion.div
            className="absolute inset-0"
            animate={{
              background: [
                "radial-gradient(circle at center, rgba(59,130,246,0.1) 0%, transparent 70%)",
                "radial-gradient(circle at center, rgba(59,130,246,0.2) 0%, transparent 70%)",
                "radial-gradient(circle at center, rgba(59,130,246,0.1) 0%, transparent 70%)"
              ]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}