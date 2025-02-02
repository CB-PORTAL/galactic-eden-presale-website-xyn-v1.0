"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { WalletName } from "@solana/wallet-adapter-base";
import { useCallback, useState, useEffect } from "react";

export function ConnectButton() {
  const { connected, publicKey, select, connect, disconnect } = useWallet();
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    console.log("ConnectButton: Wallet connection status:", connected);
  }, [connected]);

  const handleConnect = useCallback(async () => {
    try {
      if (!window.solana) {
        window.open("https://phantom.app/", "_blank");
        return;
      }
      
      // First select Phantom wallet
      select("Phantom" as WalletName);
      
      // Then connect
      await connect();
      console.log("ConnectButton: Connecting wallet...");
      setShowDropdown(false);
    } catch (err) {
      console.error("Connection failed:", err);
      alert("Failed to connect. Please try again.");
    }
  }, [connect, select]);

  const handleDisconnect = useCallback(async () => {
    try {
      await disconnect();
      console.log("ConnectButton: Disconnected wallet");
    } catch (err) {
      console.error("Disconnect failed:", err);
    }
  }, [disconnect]);

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
            {publicKey ? `${publicKey.toString().slice(0, 4)}...` : "Connected"}
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