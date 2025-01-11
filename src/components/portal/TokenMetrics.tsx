// src/components/portal/TokenMetrics.tsx
import React from 'react';
import type { PublicKey } from '@solana/web3.js';

interface TokenMetricsProps {
  className?: string;
  publicKey: PublicKey | null;
}

export const TokenMetrics: React.FC<TokenMetricsProps> = ({ className, publicKey }) => {
  return (
    <div className={`${className} p-6 space-y-6`}>
      <div className="grid grid-cols-2 gap-4">
        <div className="cyber-card p-4 text-center">
          <div className="text-2xl text-blue-400 font-bold">10B</div>
          <div className="text-sm text-blue-300">Total XYN Supply</div>
        </div>
        <div className="cyber-card p-4 text-center">
          <div className="text-2xl text-blue-400 font-bold">0.001</div>
          <div className="text-sm text-blue-300">SOL per XYN</div>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-xl mb-4">Portal Statistics</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Portal Energy</span>
              <span>75%</span>
            </div>
            <div className="h-2 bg-black/50 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500" style={{ width: '75%' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};