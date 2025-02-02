// src/components/GalacticPortal.tsx
'use client';

import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { ConnectButton } from "./wallet/ConnectButton";

const GalacticPortal: React.FC = () => {
  const { connected } = useWallet();
  
  return (
    // Black background with centered content
    <div className="fixed inset-0 bg-black flex items-center justify-center">
      {/* White bordered container matching screenshot dimensions */}
      <div className="relative w-[400px] h-[750px] border border-white/10 rounded-xl overflow-hidden">
        {/* Main gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#4C1D95] via-[#3B0764] to-[#2D1264]">
          {/* Twinkling stars */}
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute w-[2px] h-[2px] bg-white rounded-full animate-twinkle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                opacity: 0.6
              }}
            />
          ))}

          {/* Main content with proper spacing */}
          <div className="relative z-10 flex flex-col items-center px-8 pt-12 pb-6 h-full">
            {/* Title */}
            <h1 className="text-[40px] font-bold text-[#93C5FD] text-center leading-tight mb-12">
              Gateway<br />to Galactic<br />Eden
            </h1>

            {/* Card section with exact styling */}
            <div className="w-full bg-[#3B0764]/60 backdrop-blur-lg rounded-xl p-6 space-y-4">
              <p className="text-[#93C5FD] text-center">
                Enter to acquire XYN tokens -<br />
                your key to the new world
              </p>

              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Amount of XYN tokens"
                  className="w-full p-3 bg-[#2D1264]/90 rounded-lg text-[#93C5FD] placeholder-[#93C5FD]/50 border border-[#93C5FD]/20 focus:outline-none"
                />

                <p className="text-sm text-[#93C5FD]/80 text-center">
                  Exchange Rate: 1 SOL = 1,000,000 XYN
                </p>

                <button className="w-full py-3 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:from-[#5258EA] hover:to-[#7C4DEF] text-white rounded-lg font-medium transition-colors">
                  Begin Journey
                </button>
              </div>
            </div>

            {/* Footer with exact spacing */}
            <div className="mt-auto text-center space-y-1">
              <p className="text-[#93C5FD]/70">Total Supply: 10,000,000,000 XYN</p>
              <p className="text-[#93C5FD]/70">Tokens Distributed: 324,857,345 XYN</p>
              <p className="text-sm text-[#93C5FD]/50">Powered by Solana</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GalacticPortal;