"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '@solana/wallet-adapter-react';
import { ConnectButton } from "./wallet/ConnectButton";
import { PurchaseInterface } from "./presale/PurchaseInterface";

const PortalRing = ({ delay = 0, size = 400 }) => (
  <motion.div
    className="absolute left-1/2 top-1/2 border border-blue-500/30 rounded-full"
    style={{
      width: size,
      height: size,
      transform: 'translate(-50%, -50%)'
    }}
    animate={{
      rotate: 360,
      scale: [1, 1.1, 1],
      opacity: [0.3, 0.5, 0.3]
    }}
    transition={{
      duration: 10,
      delay,
      repeat: Infinity,
      ease: "linear"
    }}
  />
);

const Star = ({ index }: { index: number }) => {
  const randomSize = Math.random() * 2 + 1;
  return (
    <motion.div
      className="absolute bg-blue-400 rounded-full"
      style={{
        width: randomSize,
        height: randomSize,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
      }}
      animate={{
        scale: [1, 1.5, 1],
        opacity: [0.3, 0.8, 0.3],
      }}
      transition={{
        duration: Math.random() * 2 + 2,
        repeat: Infinity,
        delay: Math.random() * 2,
      }}
    />
  );
};

export default function GalacticPortal() {
  const { connected } = useWallet();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0d1f] text-white relative overflow-hidden">
      {/* Starfield Background */}
      <div className="fixed inset-0">
        <div className="absolute inset-0 bg-gradient-radial from-blue-500/10 via-transparent to-transparent" />
        {mounted && Array.from({ length: 50 }).map((_, i) => (
          <Star key={i} index={i} />
        ))}
      </div>

      {/* Header */}
      <header className="relative z-50 p-6 bg-black/20 backdrop-blur-sm border-b border-blue-500/20">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            XYN Presale
          </h1>
          <ConnectButton />
        </div>
      </header>

      {/* Portal Effect */}
      <main className="relative flex items-center justify-center min-h-[calc(100vh-88px)]">
        <div className="relative">
          <PortalRing size={400} delay={0} />
          <PortalRing size={500} delay={0.5} />
          <PortalRing size={600} delay={1} />

          {/* Content Card */}
          <motion.div 
            className="relative z-10 w-full max-w-xl mx-auto backdrop-blur-xl bg-black/40 p-8 rounded-xl border border-blue-500/20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {!connected ? (
              <div className="text-center space-y-6">
                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                  Welcome to Galactic Eden
                </h2>
                <p className="text-blue-300/80">
                  Connect your wallet to begin the journey
                </p>
              </div>
            ) : (
              <PurchaseInterface />
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
}