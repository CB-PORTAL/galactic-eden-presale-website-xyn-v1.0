// src/config/connection.ts
import { Connection, clusterApiUrl } from '@solana/web3.js';

export const getConnection = (): Connection => {
  const endpoint = process.env.NEXT_PUBLIC_RPC_ENDPOINT || clusterApiUrl('mainnet-beta');
  return new Connection(endpoint, {
    commitment: 'confirmed',
    confirmTransactionInitialTimeout: 60000
  });
};

export const getWssConnection = (): string => {
  return process.env.NEXT_PUBLIC_WSS_ENDPOINT || '';
};