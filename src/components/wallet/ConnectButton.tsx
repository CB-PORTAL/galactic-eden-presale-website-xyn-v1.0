// src/components/wallet/ConnectButton.tsx
"use client";

import { useCallback, useState, useEffect } from "react";

export function ConnectButton() {
  const [connected, setConnected] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [publicKey, setPublicKey] = useState<string | null>(null);

  // Check initial connection status
  useEffect(() => {
    if (window.solana?.isConnected) {
      setConnected(true);
      setPublicKey(window.solana.publicKey?.toString() || null);
    }
  }, []);

  const handleConnect = useCallback(async () => {
    try {
      if (!window.solana) {
        alert("Please install Phantom wallet");
        return;
      }

      const response = await window.solana.connect();
      console.log("Connected!", response);
      setConnected(true);
      setPublicKey(response.publicKey.toString());
      setShowDropdown(false);
    } catch (err: any) {
      console.error("Connection failed:", err);
      alert("Failed to connect: " + (err.message || "Unknown error"));
    }
  }, []);

  const handleDisconnect = useCallback(async () => {
    try {
      if (window.solana) {
        await window.solana.disconnect();
        setConnected(false);
        setPublicKey(null);
      }
    } catch (err: any) {
      console.error("Disconnect failed:", err);
    }
  }, []);

  return (
    <div className="relative">
      <button
        onClick={() => {
          if (connected) {
            handleDisconnect();
          } else {
            setShowDropdown(!showDropdown);
          }
        }}
        className="cyber-button"
      >
        {connected ? (
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 bg-green-400 rounded-full"/>
            {publicKey ? `${publicKey.slice(0, 4)}...` : "Connected"}
          </span>
        ) : (
          "Select Wallet"
        )}
      </button>

      {showDropdown && !connected && (
        <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-xl">
          <button
            onClick={() => {
              window.open("https://phantom.app/", "_blank");
              setShowDropdown(false);
            }}
            className="w-full p-2 hover:bg-gray-700 text-white text-left"
          >
            Install Phantom
          </button>
          <button
            onClick={handleConnect}
            className="w-full p-2 hover:bg-gray-700 text-white text-left"
          >
            Already Installed
          </button>
        </div>
      )}
    </div>
  );
}