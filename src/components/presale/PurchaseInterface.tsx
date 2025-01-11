"use client";

import { useState } from "react";
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction
} from "@solana/web3.js";
import { useConnection } from "@solana/wallet-adapter-react";
import { PRESALE_CONFIG } from "@/config/presale";

export function PurchaseInterface() {
  const { connection } = useConnection();
  const [xynAmount, setXynAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState("");

  // Convert XYN input to SOL cost
  const solAmount = parseFloat(xynAmount) / PRESALE_CONFIG.XYN_PER_SOL || 0;

  const handlePurchase = async () => {
    if (!window.solana?.publicKey) {
      alert("Phantom wallet not connected!");
      return;
    }
    if (!xynAmount || solAmount <= 0) {
      alert("Please enter a valid XYN amount");
      return;
    }

    try {
      setIsProcessing(true);
      setStatus("Transferring SOL...");

      // 1) Create SOL transfer
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: window.solana.publicKey,
          toPubkey: new PublicKey(PRESALE_CONFIG.PRESALE_ADDRESS),
          lamports: solAmount * LAMPORTS_PER_SOL
        })
      );

      // 2) Blockhash + feePayer
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = window.solana.publicKey;

      // 3) Sign + send
      const signed = await window.solana.signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signed.serialize());
      await connection.confirmTransaction(signature);

      alert("SOL transferred! Transaction: " + signature);

      // 4) Distribute XYN
      setStatus("Distributing XYN...");
      const buyerPubkey = window.solana.publicKey.toString();

      const distributeRes = await fetch("/api/distribute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ buyerPubkey, xynAmount })
      });
      if (!distributeRes.ok) {
        const errData = await distributeRes.json();
        throw new Error("Distribution failed: " + errData.error);
      }

      const distData = await distributeRes.json();
      alert("XYN Distribution successful! Signature: " + distData.signature);

      setStatus("Transaction Complete!");
      setXynAmount("");
    } catch (error: any) {
      console.error("Purchase failed or distribution error:", error);
    
      // We'll give a more thorough user-facing message:
      const maybeTimeoutHint =      
    `If this error said, something along the lines of, "Transaction not confirmed in X seconds"
    or "Timeout," check your Phantom wallet or Solana Explorer to see if the tokens arrive
    anyway. Sometimes the network finalizes slower than our code expects, but the purchase
    still goes through on-chain!`;
      
      alert(`Purchase failed or distribution error. Please try again.
    ${maybeTimeoutHint}`);
    
      // Optionally reset your status or show an error state in the UI
      setStatus("");
    } finally {
      setIsProcessing(false);
    }
    
  };

  return (
    <div className="cyber-card p-6">
      <h2 className="text-xl font-bold mb-4">Purchase XYN Tokens</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm mb-2">Amount of XYN</label>
          <p className="text-xs text-gray-400 mt-1">
            What you type here is the exact XYN amount you’ll receive.
            (We handle the 9-decimal conversion on our server.)
          </p>

          <input
            type="number"
            value={xynAmount}
            onChange={(e) => setXynAmount(e.target.value)}
            className="w-full p-3 bg-black/20 border border-blue-500/30 rounded"
            placeholder="Enter XYN amount (min 100,000)"
          />
          <p className="mt-2 text-gray-400 text-sm">
            Cost: {solAmount.toFixed(4)} SOL
          </p>
          {status && <p className="text-blue-500 text-sm">{status}</p>}
        </div>

        <button
          onClick={handlePurchase}
          disabled={isProcessing || !xynAmount || solAmount <= 0}
          className="cyber-button w-full"
        >
          {isProcessing ? "Processing..." : "Swap SOL For XYN"}
        </button>
      </div>
    </div>
  );
}