import { type PublicKey, type Transaction } from "@solana/web3.js";

declare global {
  interface Window {
    solana?: {
      isPhantom?: boolean;
      connect: () => Promise<{ publicKey: PublicKey }>;
      disconnect: () => Promise<void>;
      signTransaction: (transaction: Transaction) => Promise<Transaction>;
      signAllTransactions: (transactions: Transaction[]) => Promise<Transaction[]>;
      signAndSendTransaction: (transaction: Transaction) => Promise<{ signature: string }>;
      request: (params: { method: string; params?: any[] }) => Promise<any>;
      publicKey: PublicKey | null;
    };
  }
}