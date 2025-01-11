// src/hooks/useTokenExchange.ts
import { useState } from 'react';

export interface ExchangeStatus {
  isProcessing: boolean;
  error?: string;
}

export interface ExchangeResult {
  signature: string;
}

export function useTokenExchange() {
  const [exchangeStatus, setExchangeStatus] = useState<ExchangeStatus>({
    isProcessing: false
  });

  const exchangeTokens = async (xynAmount: string): Promise<ExchangeResult> => {
    try {
      setExchangeStatus({ isProcessing: true });
      
      const response = await fetch('/api/distribute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ xynAmount })
      });

      if (!response.ok) {
        throw new Error('Exchange failed');
      }

      const result = await response.json();
      setExchangeStatus({ isProcessing: false });
      return result;
    } catch (error) {
      setExchangeStatus({
        isProcessing: false,
        error: error instanceof Error ? error.message : 'Exchange failed'
      });
      throw error;
    }
  };

  return { exchangeTokens, exchangeStatus };
}

// 2. Create the animation components: