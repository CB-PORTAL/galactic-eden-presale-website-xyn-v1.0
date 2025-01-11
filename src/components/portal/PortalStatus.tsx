// src/components/portal/PortalStatus.tsx
import React from 'react';
import type { ExchangeStatus } from '@/hooks/useTokenExchange';

interface PortalStatusProps {
  status: ExchangeStatus;
  transactionHash?: string;
}

export const PortalStatus: React.FC<PortalStatusProps> = ({ 
  status,
  transactionHash 
}) => {
  if (!status.isProcessing && !status.error && !transactionHash) return null;

  return (
    <div className="mt-6 p-4 rounded-lg bg-black/30 border border-blue-500/30">
      {status.isProcessing && (
        <div className="flex items-center text-blue-400">
          <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full mr-2" />
          <span>Opening portal...</span>
        </div>
      )}
      
      {status.error && (
        <div className="text-red-500">
          Error: {status.error}
        </div>
      )}
      
      {transactionHash && (
        <div className="text-green-400">
          Portal opened! Transaction: {transactionHash.slice(0, 8)}...
          <a
            href={`https://explorer.solana.com/tx/${transactionHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 text-blue-400 hover:text-blue-300"
          >
            View on Explorer
          </a>
        </div>
      )}
    </div>
  );
};