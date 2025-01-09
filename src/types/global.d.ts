// src/types/global.d.ts
import { PublicKey } from "@solana/web3.js";

interface Window {
  solana?: {
    isPhantom?: boolean;
    connect: () => Promise<{ publicKey: PublicKey }>;
    disconnect: () => Promise<void>;
    signTransaction: (transaction: Transaction) => Promise<Transaction>;
    signAllTransactions: (transactions: Transaction[]) => Promise<Transaction[]>;
    request: (params: { method: string; params?: any[] }) => Promise<any>;
    isConnected: boolean;
    publicKey: PublicKey;
    on: (event: string, callback: (args: any) => void) => void;
    removeListener: (event: string, callback: (args: any) => void) => void;
  };
}