import React, { useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { PRESALE_CONFIG } from "@/config/presale";

export function PurchaseInterface() {
  const { connected, publicKey } = useWallet();
  const { connection } = useConnection();
  const [amount, setAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Convert XYN to SOL cost and calculate estimates
  const solAmount = parseFloat(amount) / PRESALE_CONFIG.XYN_PER_SOL || 0;
  const xynEstimate = (solAmount * PRESALE_CONFIG.XYN_PER_SOL).toLocaleString();

  async function verifyTokenAvailability(amount: string): Promise<boolean> {
    try {
      const response = await fetch('/api/verify-balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Balance verification failed');
      }
      
      const { available } = await response.json();
      return available;
    } catch (error) {
      console.error('Verification error:', error);
      throw error;
    }
  }

  const handlePurchase = () => {
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) return;
    setShowConfirmation(true);
  };

  const confirmPurchase = async () => {
    if (!publicKey || !amount) return;
    
    setError("");
    setIsProcessing(true);
    setStatus("Verifying availability...");
    
    try {
      // 1. Verify token availability
      const isAvailable = await verifyTokenAvailability(amount);
      if (!isAvailable) {
        throw new Error("Insufficient presale tokens available");
      }

      // 2. Process XYN distribution
      setStatus("Processing distribution...");
      const distributeRes = await fetch("/api/distribute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buyerPubkey: publicKey.toString(),
          xynAmount: amount
        })
      });

      if (!distributeRes.ok) {
        const error = await distributeRes.json();
        throw new Error(error.message || "Distribution failed");
      }

      // 3. Process SOL transfer
      setStatus("Transferring SOL...");
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(PRESALE_CONFIG.PRESALE_ADDRESS),
          lamports: solAmount * LAMPORTS_PER_SOL
        })
      );

      transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
      transaction.feePayer = publicKey;

      const signed = await window?.solana?.signTransaction?.(transaction);
      if (!signed) throw new Error("Failed to sign transaction");
      const signature = await connection.sendRawTransaction(signed.serialize());
      await connection.confirmTransaction(signature);

      setStatus(`Success! Signature: ${signature.slice(0, 8)}...`);
      setAmount("");
      setShowConfirmation(false);
    } catch (error: any) {
      console.error("Transaction failed:", error);
      setError(error.message);
      setStatus("");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto p-4">
      {/* Main Card */}
      <div className="bg-slate-900 text-white border border-slate-700 rounded-lg overflow-hidden">
        {/* Header */}
        <div className="p-6 text-center border-b border-slate-700">
          <h2 className="text-2xl font-bold">Galactic Eden Presale</h2>
          <p className="text-slate-400 mt-2">Exchange SOL for XYN tokens</p>
        </div>
        
        {/* Content */}
        <div className="p-6 space-y-4">
          {!connected ? (
            <div className="text-center p-6">
              <p className="text-slate-400 mb-4">Please connect your wallet to participate</p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">
                  Amount of XYN
                </label>
                <input
                  type="number"
                  placeholder="Enter XYN amount (min 100,000)"
                  value={amount}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)}
                  className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  min={PRESALE_CONFIG.MIN_PURCHASE}
                  disabled={isProcessing}
                />
                <p className="mt-2 text-gray-400">
                  Cost: {solAmount.toFixed(4)} SOL
                </p>
              </div>
              
              {error && (
                <div className="p-4 bg-red-500/20 border border-red-500 rounded-lg">
                  {error}
                </div>
              )}
              
              {status && (
                <div className="p-4 bg-blue-500/20 border border-blue-500 rounded-lg">
                  {status}
                </div>
              )}

              <button
                onClick={handlePurchase}
                disabled={!amount || isProcessing || parseFloat(amount) <= 0}
                className="w-full p-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 
                         disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" 
                         xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" 
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  'Purchase XYN'
                )}
              </button>
            </>
          )}
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 text-xs text-slate-400 text-center border-t border-slate-700">
          Exchange Rate: 1 SOL = {PRESALE_CONFIG.XYN_PER_SOL.toLocaleString()} XYN
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-slate-900 text-white border border-slate-700 rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium mb-2">Confirm Purchase</h3>
            <p className="text-slate-400 mb-4">
              You are about to exchange {solAmount.toFixed(4)} SOL for {xynEstimate} XYN tokens.
              This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirmation(false)}
                className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmPurchase}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}