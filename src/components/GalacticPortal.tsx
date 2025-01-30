import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '@solana/wallet-adapter-react';
import { ConnectButton } from "./wallet/ConnectButton";
import { PurchaseInterface } from "./presale/PurchaseInterface";

// Radial dot pattern background
const RadialDots = () => (
  <div className="fixed inset-0 overflow-hidden">
    <div className="absolute inset-0 flex items-center justify-center">
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="absolute w-full h-full"
          style={{
            transform: `rotate(${i * 45}deg)`
          }}
        >
          {[...Array(12)].map((_, j) => (
            <motion.div
              key={j}
              className="absolute w-1 h-1 bg-blue-400/20 rounded-full"
              style={{
                left: '50%',
                top: `${j * 8}%`
              }}
              animate={{
                opacity: [0.2, 0.5, 0.2]
              }}
              transition={{
                duration: 3,
                delay: j * 0.2,
                repeat: Infinity
              }}
            />
          ))}
        </div>
      ))}
    </div>
  </div>
);

// Portal glow effect
const PortalGlow = () => (
  <motion.div
    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px]"
    animate={{
      scale: [1, 1.2, 1],
      opacity: [0.3, 0.6, 0.3]
    }}
    transition={{
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut"
    }}
  >
    <div className="absolute inset-0 rounded-full bg-gradient-radial from-blue-500/20 via-purple-500/10 to-transparent blur-xl" />
  </motion.div>
);

export default function GalacticPortal() {
  const { connected } = useWallet();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0d1f] flex items-center justify-center overflow-hidden">
      <RadialDots />
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-radial from-blue-500/5 via-transparent to-transparent" />
      </div>
      
      <div className="relative z-10 w-full max-w-lg mx-auto">
        <PortalGlow />
        <motion.div
          className="relative backdrop-blur-xl bg-black/40 p-8 rounded-xl border border-blue-500/20 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            Galactic Eden Presale
          </h2>
          <p className="text-blue-300/80 mb-8">Exchange SOL for XYN tokens</p>
          
          <div className="space-y-6">
            {!connected ? (
              <ConnectButton />
            ) : (
              <PurchaseInterface />
            )}
            <div className="text-sm text-blue-300/60">
              Total supply: {(10_000_000_000).toLocaleString()} XYN
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} // <-- This was the missing closing brace