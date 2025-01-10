// src/hooks/useFeeCalculator.ts
import { useMemo } from 'react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

export function useFeeCalculator(amount: string) {
  return useMemo(() => {
    const tokenAccountFee = 0.00204428;
    const rentFee = 0.00089776;
    const ataFee = 0.00061280;
    
    return {
      tokenAccountFee,
      rentFee,
      ataFee,
      total: tokenAccountFee + rentFee + ataFee
    };
  }, [amount]);
}