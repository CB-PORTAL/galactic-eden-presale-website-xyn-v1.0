import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";

// 1) Pull endpoint from env
const RPC = process.env.NEXT_PUBLIC_RPC_ENDPOINT || "fallback-if-empty";

// 2) Create a single Connection instance
const connection = new Connection(RPC);

export function usePresale() {
  const { publicKey, connected } = useWallet();
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    let cleanup: undefined | (() => void);

    const fetchBalance = async () => {
      if (!publicKey || !connected) {
        setBalance(null);
        return;
      }
      try {
        setLoading(true);
        const lamports = await connection.getBalance(publicKey);
        setBalance(lamports / LAMPORTS_PER_SOL);
      } catch (error) {
        console.error("Error fetching balance:", error);
        setBalance(null);
      } finally {
        setLoading(false);
      }
    };

    if (publicKey && connected) {
      // fetch initial balance
      fetchBalance();

      // listen for changes
      const id = connection.onAccountChange(publicKey, async () => {
        fetchBalance();
      });
      cleanup = () => {
        connection.removeAccountChangeListener(id);
      };
    }

    return () => {
      if (cleanup) cleanup();
    };
  }, [publicKey, connected]);

  return {
    balance,
    loading,
    connected,
    publicKey,
  };
}