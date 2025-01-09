// src/app/page.tsx
"use client";

import { useEffect, useState } from "react";
import { PurchaseInterface } from "@/components/presale/PurchaseInterface";

export default function Home() {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const checkConnection = () => {
      setIsConnected(!!window.solana?.isConnected);
    };

    checkConnection();
    window.solana?.on('connect', checkConnection);
    return () => {
      window.solana?.removeListener('connect', checkConnection);
    };
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">XYN Token Presale</h1>
      
      {isConnected ? (
        <PurchaseInterface />
      ) : (
        <div className="text-center text-gray-400">
          Connect your wallet to participate in the presale
        </div>
      )}
    </div>
  );
}