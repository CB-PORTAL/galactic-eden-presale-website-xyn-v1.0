'use client';

import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { usePresale } from '@/hooks/usePresale';

export default function PresaleInfo() {
  const { connected } = useWallet();
  const { balance, loading } = usePresale();

  return (
    <div className="cyber-card p-8 rounded-lg relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5" />
      <div className="relative z-10">
        <h3 className="text-2xl font-bold mb-6 neon-text">Presale Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h4 className="text-lg font-medium mb-4 text-blue-400">Token Details</h4>
            <ul className="space-y-3">
              <li className="flex justify-between">
                <span className="text-gray-400">Token Name:</span>
                <span className="font-medium">XYN</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-400">Total Supply:</span>
                <span className="font-medium">10,000,000,000</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-400">Initial Price:</span>
                <span className="font-medium">0.001 SOL</span>
              </li>
              {connected && (
                <li className="flex justify-between">
                  <span className="text-gray-400">Your Balance:</span>
                  <span className="font-medium">
                    {loading ? 'Loading...' : `${(balance || 0).toFixed(4)} SOL`}
                  </span>
                </li>
              )}
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-medium mb-4 text-blue-400">Current Stage</h4>
            <div className="bg-blue-500/10 p-4 rounded-lg">
              <div className="flex justify-between mb-2">
                <span>Progress</span>
                <span>25%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '25%' }} />
              </div>
              <div className="mt-4 text-sm text-gray-400">
                62,500,000 / 250,000,000 XYN sold
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-blue-500/20">
          <h4 className="text-lg font-medium mb-4 text-blue-400">How to Participate</h4>
          <ol className="space-y-4">
            <li className="flex items-start">
              <span className="cyber-card w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0">1</span>
              <p>Connect your Solana wallet using the button above</p>
            </li>
            <li className="flex items-start">
              <span className="cyber-card w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0">2</span>
              <p>Ensure you have sufficient SOL in your wallet</p>
            </li>
            <li className="flex items-start">
              <span className="cyber-card w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0">3</span>
              <p>Enter the amount of XYN you wish to purchase (minimum 100,000 XYN)</p>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}