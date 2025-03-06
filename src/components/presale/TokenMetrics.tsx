import React from 'react';

interface TokenMetricsProps {
  totalSupply: string;
  exchangeRate: string;
  sold?: string;
}

export const TokenMetrics: React.FC<TokenMetricsProps> = ({ 
  totalSupply, 
  exchangeRate, 
  sold = "324,857,345" 
}) => {
  return (
    <div className="w-full max-w-xl mx-auto bg-[#2D1264]/50 backdrop-blur-sm border border-[#8B5CF6]/20 rounded-xl p-4 mt-6">
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-[#93C5FD]/70 text-sm">Total Supply</p>
          <p className="text-[#93C5FD] font-bold">{totalSupply}</p>
        </div>
        <div>
          <p className="text-[#93C5FD]/70 text-sm">Exchange Rate</p>
          <p className="text-[#93C5FD] font-bold">{exchangeRate}</p>
        </div>
        <div>
          <p className="text-[#93C5FD]/70 text-sm">Tokens Distributed</p>
          <p className="text-[#93C5FD] font-bold">{sold}</p>
        </div>
      </div>
    </div>
  );
};