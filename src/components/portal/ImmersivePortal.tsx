// src/components/portal/ImmersivePortal.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '@solana/wallet-adapter-react';
import { PurchaseInterface } from '@/components/presale/PurchaseInterface';
import { ConnectButton } from '@/components/wallet/ConnectButton';
import { useTokenExchange } from '@/hooks/useTokenExchange';

const ParticleField = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden">
    {[...Array(50)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-1 h-1 bg-blue-400/30 rounded-full"
        initial={{ 
          x: `${Math.random() * 100}%`,
          y: `${Math.random() * 100}%`
        }}
        animate={{
          y: ['0%', '100%'],
          x: Math.random() > 0.5 ? [null, '+100px'] : [null, '-100px']
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

const PortalEffect = ({ active }: { active: boolean }) => (
  <AnimatePresence>
    {active && (
      <motion.div
        className="absolute inset-0 bg-blue-500/10 rounded-full"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.7, 0.3]
        }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    )}
  </AnimatePresence>
);

export function ImmersivePortal() {
  const { connected } = useWallet();
  const { exchangeStatus } = useTokenExchange();
  const [portalActive, setPortalActive] = useState(false);

  // Activate portal effect when transaction starts
  useEffect(() => {
    if (exchangeStatus.isProcessing) {
      setPortalActive(true);
    } else {
      setTimeout(() => setPortalActive(false), 2000);
    }
  }, [exchangeStatus.isProcessing]);

  return (
    <div className="min-h-screen bg-[#020617] relative overflow-hidden">
      <ParticleField />
      
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-black/20 backdrop-blur-md border-b border-blue-500/20">
        <div className="container mx-auto px-4 h-16 flex justify-between items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-xl font-bold text-white"
          >
            Galactic Eden
          </motion.div>
          <ConnectButton />
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 pt-24 pb-16 min-h-screen">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto space-y-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-4"
            >
              <h1 className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                Enter The Portal
              </h1>
              <p className="text-xl text-blue-300">Your Gateway to Galactic Eden</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg blur-xl" />
              <div className="relative bg-black/40 border border-blue-500/20 rounded-lg p-8 backdrop-blur-xl">
                <PortalEffect active={portalActive} />
                <PurchaseInterface />
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}