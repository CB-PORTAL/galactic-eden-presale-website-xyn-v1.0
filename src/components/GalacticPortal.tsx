import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '@solana/wallet-adapter-react';
import { ConnectButton } from "./wallet/ConnectButton";
import { PurchaseInterface } from "./presale/PurchaseInterface";

export default function GalacticPortal() {
  const { connected } = useWallet();

  return (
    <div className="min-h-screen bg-[#0a0d1f] text-white relative overflow-hidden">
      {/* Header */}
      <header className="absolute top-0 w-full z-50 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-400">XYN Presale</h1>
          <ConnectButton />
        </div>
      </header>

      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-radial from-blue-500/10 via-transparent to-transparent" />
        {Array.from({ length: 50 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-400/30 rounded-full"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: Math.random() * 2 + 1,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <main className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative z-10 w-full max-w-xl">
          {/* Portal Rings */}
          <AnimatePresence>
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={`ring-${i}`}
                className="absolute left-1/2 top-1/2 border-2 rounded-full border-blue-500/30"
                style={{
                  width: '500px',
                  height: '500px',
                  transform: 'translate(-50%, -50%)'
                }}
                animate={{
                  rotate: 360,
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 8 + i * 2,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
            ))}
          </AnimatePresence>

          {/* Content Card */}
          <motion.div 
            className="backdrop-blur-md bg-black/40 p-8 rounded-lg border border-blue-500/20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {!connected ? (
              <div className="text-center space-y-6">
                <h2 className="text-2xl font-bold text-blue-400">Welcome to Galactic Eden</h2>
                <p className="text-gray-300">Connect your wallet to begin the journey</p>
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