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

      // get latest blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = window.solana.publicKey;

      // sign + send
      const signed = await window.solana.signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signed.serialize());
      await connection.confirmTransaction(signature);

      // Notify user
      alert("SOL transferred! Transaction: " + signature);

      // 2) Distribute XYN
      setStatus("Distributing XYN...");
      const buyerPubkey = window.solana.publicKey.toString();
      console.log("Calling /api/distribute with:", { buyerPubkey, xynAmount });

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

      // Reset input
      setXynAmount("");
    } catch (error) {
      console.error("Purchase failed:", error);
      alert("Purchase failed or distribution error. Please try again.");
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