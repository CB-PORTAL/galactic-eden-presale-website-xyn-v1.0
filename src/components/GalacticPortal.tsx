import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PortalAnimationProps {
  active: boolean;
}

interface ParticleFieldProps {
  density?: number;
}

interface PurchaseFormProps {
  onSubmit: (amount: string) => Promise<void>;
  connected: boolean;
}

const PortalAnimation: React.FC<PortalAnimationProps> = ({ active }) => {
  return (
    <div className="fixed inset-0 pointer-events-none">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1),transparent_70%)]" />
      <motion.div 
        className="absolute inset-0"
        initial={false}
        animate={active ? {
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.7, 0.3]
        } : {}}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(59,130,246,0.2),transparent)]" 
             style={{ animation: active ? 'spin 4s linear infinite' : 'none' }} />
      </motion.div>
    </div>
  );
};

const ParticleField: React.FC<ParticleFieldProps> = ({ density = 50 }) => {
  return (
    <div className="fixed inset-0 pointer-events-none">
      {[...Array(density)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-blue-400/30 rounded-full"
          initial={{ 
            x: Math.random() * 100 + '%',
            y: Math.random() * 100 + '%',
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
};

const PurchaseForm: React.FC<PurchaseFormProps> = ({ onSubmit, connected }) => {
  const [amount, setAmount] = useState<string>('');
  const solCost = Number(amount) * 0.001;

  return (
    <form onSubmit={async (e) => {
      e.preventDefault();
      await onSubmit(amount);
    }}
    className="relative z-10 space-y-6">
      <div className="space-y-2">
        <label className="block text-blue-300">Amount of XYN</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full bg-black/20 border border-blue-500/30 p-4 rounded-lg
                     text-white placeholder-blue-500/50 focus:border-blue-500
                     backdrop-blur transition-colors"
          placeholder="Enter amount (min 100,000)"
          disabled={!connected}
        />
        <p className="text-sm text-blue-400">
          Estimated cost: {solCost.toFixed(4)} SOL
        </p>
      </div>

      <button
        type="submit"
        disabled={!connected || !amount}
        className="w-full bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/50
                   text-blue-300 py-4 px-6 rounded-lg backdrop-blur 
                   transition-all duration-300 disabled:opacity-50
                   disabled:cursor-not-allowed"
      >
        {connected ? 'Enter Portal' : 'Connect Wallet to Enter'}
      </button>
    </form>
  );
};

const GalacticPortal: React.FC = () => {
  const [portalActive, setPortalActive] = useState<boolean>(false);
  const [connected, setConnected] = useState<boolean>(false);
  
  useEffect(() => {
    const checkConnection = () => {
      setConnected(!!window.solana?.isConnected);
    };

    checkConnection();
    window.solana?.on('connect', checkConnection);
    return () => {
      window.solana?.removeListener('connect', checkConnection);
    };
  }, []);

  const handlePurchase = async (amount: string): Promise<void> => {
    setPortalActive(true);
    // Your existing purchase logic here
  };

  return (
    <div className="min-h-screen relative bg-[#020617] text-white overflow-hidden">
      <ParticleField />
      <PortalAnimation active={portalActive} />
      
      <div className="relative z-10 container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto space-y-12">
          <header className="text-center space-y-4">
            <motion.h1 
              className="text-6xl font-bold bg-clip-text text-transparent 
                         bg-gradient-to-r from-blue-400 to-purple-400"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Galactic Eden Portal
            </motion.h1>
            <p className="text-blue-300 text-xl">Enter the Future</p>
          </header>

          <motion.div 
            className="bg-black/40 border border-blue-500/20 p-8 rounded-2xl 
                       backdrop-blur-lg shadow-2xl"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <PurchaseForm onSubmit={handlePurchase} connected={connected} />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default GalacticPortal;