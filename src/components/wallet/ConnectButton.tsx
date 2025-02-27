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
      
      select("Phantom" as WalletName);
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
        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-4 px-8 rounded-lg transition-all transform hover:scale-105"
      >
        {connected ? (
          <span className="flex items-center justify-center gap-2">
            <span className="h-2 w-2 bg-green-400 rounded-full"/>
            {publicKey ? `${publicKey.toString().slice(0, 4)}...` : "Connected"}
          </span>
        ) : (
          "Begin Journey"
        )}
      </button>

      {showDropdown && !connected && (
        <div className="absolute w-full mt-2 bg-gradient-to-r from-indigo-900/80 to-purple-900/80 backdrop-blur-lg rounded-lg shadow-xl border border-indigo-500/20">
          <button
            onClick={() => {
              window.open("https://phantom.app/", "_blank");
              setShowDropdown(false);
            }}
            className="w-full p-3 hover:bg-indigo-600/30 text-white/80 hover:text-white text-left transition-all"
          >
            Install Phantom
          </button>
          <button
            onClick={handleConnect}
            className="w-full p-3 hover:bg-indigo-600/30 text-white/80 hover:text-white text-left transition-all"
          >
            Already Installed
          </button>
        </div>
      )}
    </div>
  );
}