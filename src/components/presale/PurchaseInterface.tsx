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

  const solAmount = parseFloat(xynAmount) / PRESALE_CONFIG.XYN_PER_SOL || 0;

  const handlePurchase = async () => {
    if (!window.solana?.publicKey || !xynAmount) return;

    try {
      setIsProcessing(true);

      // 1) Send SOL to the presale wallet
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: window.solana.publicKey,
          toPubkey: new PublicKey(PRESALE_CONFIG.PRESALE_ADDRESS),
          lamports: solAmount * LAMPORTS_PER_SOL
        })
      );

      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = window.solana.publicKey;

      const signed = await window.solana.signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signed.serialize());
      await connection.confirmTransaction(signature);

      alert("SOL transferred! Transaction: " + signature);

      // 2) **Distribute** XYN to the buyer (the current wallet)
      const buyerPubkey = window.solana.publicKey.toString();
      // We'll call our new /api/distribute route
      const distributeRes = await fetch("/api/distribute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buyerPubkey,
          xynAmount // how many tokens user is purchasing
        })
      });

      if (!distributeRes.ok) {
        const errData = await distributeRes.json();
        throw new Error("Distribution failed: " + errData.error);
      }

      const distData = await distributeRes.json();
      alert("XYN Distribution successful! Signature: " + distData.signature);

      setXynAmount("");
    } catch (error) {
      console.error("Purchase failed:", error);
      alert("Purchase failed or distribution error. Please try again.");
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
          <input
            type="number"
            value={xynAmount}
            onChange={(e) => setXynAmount(e.target.value)}
            className="w-full p-3 bg-black/20 border border-blue-500/30 rounded"
            placeholder="Enter XYN amount (min 100,000)"
            min="100000"
            step="100000"
          />
          <p className="mt-2 text-gray-400 text-sm">
            Cost: {solAmount.toFixed(4)} SOL
          </p>
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