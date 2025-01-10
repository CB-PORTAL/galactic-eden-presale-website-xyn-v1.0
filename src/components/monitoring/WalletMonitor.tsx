// src/components/monitoring/WalletMonitor.tsx
"use client";

import { useState, useEffect } from 'react';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { PRESALE_CONFIG } from '@/config/presale';

interface TransactionLog {
  timestamp: number;
  balance: number;
  change: number;
}

export function WalletMonitor() {
  const [logs, setLogs] = useState<TransactionLog[]>([]);
  const [currentBalance, setCurrentBalance] = useState<number>(0);

  useEffect(() => {
    const connection = new Connection('https://api.mainnet-beta.solana.com');
    const presaleAddress = new PublicKey(PRESALE_CONFIG.PRESALE_ADDRESS);

    // Initial balance check
    const checkBalance = async () => {
      const balance = await connection.getBalance(presaleAddress);
      setCurrentBalance(balance / LAMPORTS_PER_SOL);
    };
    
    // Subscribe to changes
    const subscriptionId = connection.onAccountChange(
      presaleAddress,
      (accountInfo, context) => {
        const newBalance = accountInfo.lamports / LAMPORTS_PER_SOL;
        const change = newBalance - currentBalance;
        
        setLogs(prevLogs => [{
          timestamp: Date.now(),
          balance: newBalance,
          change
        }, ...prevLogs]);
        
        setCurrentBalance(newBalance);
      }
    );

    checkBalance();

    return () => {
      connection.removeAccountChangeListener(subscriptionId);
    };
  }, [currentBalance]);

  return (
    <div className="cyber-card p-4">
      <h2 className="text-xl font-bold mb-4">Wallet Monitor</h2>
      <div className="mb-4">
        <p>Current Balance: {currentBalance.toFixed(8)} SOL</p>
      </div>
      <div className="overflow-auto max-h-60">
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left">Time</th>
              <th className="text-right">Change</th>
              <th className="text-right">Balance</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, i) => (
              <tr key={i} className="border-t border-blue-500/20">
                <td className="py-2">{new Date(log.timestamp).toLocaleTimeString()}</td>
                <td className={`text-right ${log.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {log.change.toFixed(8)}
                </td>
                <td className="text-right">{log.balance.toFixed(8)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}