import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";

const connection = new Connection("https://api.devnet.solana.com");

export function usePresale() {
  const { publicKey, connected } = useWallet();
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    let cleanup: (() => void) | undefined;

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
      fetchBalance();
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
    publicKey
  };
}