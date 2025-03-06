"use client";

import React, { useCallback, useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletName } from "@solana/wallet-adapter-base";
import { useConnection } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

export function ConnectButton() {
  const { connected, publicKey, select, connect, disconnect } = useWallet();
  const { connection } = useConnection();
  const [showDropdown, setShowDropdown] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [network, setNetwork] = useState<string>("Loading...");
  const [isConnecting, setIsConnecting] = useState(false);

  // Get wallet balance and network
  useEffect(() => {
    if (connected && publicKey) {
      // Get balance
      connection.getBalance(publicKey).then(bal => {
        setBalance(bal / LAMPORTS_PER_SOL);
      }).catch(err => {
        console.error("Error fetching balance:", err);
      });
     
      // Determine network
      connection.getVersion().then(version => {
        if (connection.rpcEndpoint.includes("devnet")) {
          setNetwork("Devnet");
        } else if (connection.rpcEndpoint.includes("testnet")) {
          setNetwork("Testnet");
        } else {
          setNetwork("Mainnet");
        }
      }).catch(err => {
        console.error("Error identifying network:", err);
      });
    }
  }, [connected, publicKey, connection]);

  const handleConnect = useCallback(async () => {
    try {
      setIsConnecting(true);
      
      if (!window.solana) {
        window.open("https://phantom.app/", "_blank");
        return;
      }
     
      select("Phantom" as WalletName);
      await connect();
      setShowDropdown(false);
    } catch (err) {
      console.error("Connection failed:", err);
      alert("Failed to connect. Please try again.");
    } finally {
      setIsConnecting(false);
    }
  }, [connect, select]);

  const handleDisconnect = useCallback(async () => {
    try {
      await disconnect();
    } catch (err) {
      console.error("Disconnect failed:", err);
    }
  }, [disconnect]);

  // Create a shortened version of the public key for display
  const shortenedPublicKey = publicKey ? 
    `${publicKey.toString().substring(0, 6)}...${publicKey.toString().substring(publicKey.toString().length - 4)}` : 
    "";

  // If connected, show wallet details
  if (connected && publicKey) {
    return (
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div
          style={{
            width: '100%',
            padding: '12px 16px',
            backgroundColor: 'rgba(76, 29, 149, 0.7)',
            borderRadius: '8px',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            color: 'white'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ height: '10px', width: '10px', backgroundColor: '#4ade80', borderRadius: '50%' }}/>
              <span style={{ fontWeight: 'bold' }}>Connected:</span>
            </span>
            <span style={{ color: '#93C5FD', fontSize: '14px' }}>{network}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '14px' }}>Address:</span>
            <span style={{ color: '#93C5FD', fontSize: '14px' }} title={publicKey.toString()}>
              {shortenedPublicKey}
            </span>
          </div>
          {balance !== null && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
              <span>Balance:</span>
              <span>{balance.toFixed(4)} SOL</span>
            </div>
          )}
          <button
            onClick={handleDisconnect}
            style={{
              width: '100%',
              padding: '8px 0',
              marginTop: '8px',
              fontSize: '14px',
              color: 'white',
              background: 'linear-gradient(to right, #2563eb, #7c3aed)',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Disconnect
          </button>
        </div>
      </div>
    );
  }

  // Not connected - show connect button with dropdown
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        style={{
          width: '100%',
          padding: '12px 0',
          fontSize: '16px',
          fontWeight: '500',
          color: 'white',
          background: 'linear-gradient(to right, #2563eb, #7c3aed)',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        {isConnecting ? (
          <>
            <span style={{
              width: '16px',
              height: '16px',
              border: '2px solid #ffffff',
              borderBottomColor: 'transparent',
              borderRadius: '50%',
              display: 'inline-block',
              animation: 'spin 1s linear infinite'
            }}></span>
            Connecting...
          </>
        ) : (
          'Connect Wallet'
        )}
      </button>

      {showDropdown && (
        <>
          <button
            onClick={() => {
              window.open("https://phantom.app/", "_blank");
              setShowDropdown(false);
            }}
            style={{
              width: '100%',
              padding: '12px 0',
              fontSize: '16px',
              fontWeight: '500',
              color: 'white',
              backgroundColor: '#4C1D95',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              borderRadius: '8px',
              cursor: 'pointer',
              marginBottom: '4px'
            }}
          >
            Install Phantom
          </button>
         
          <button
            onClick={handleConnect}
            style={{
              width: '100%',
              padding: '12px 0',
              fontSize: '16px',
              fontWeight: '500',
              color: 'white',
              backgroundColor: '#4C1D95',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Already Installed
          </button>
        </>
      )}
      
      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}