import React, { useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { PRESALE_CONFIG } from "@/config/presale";
import { LoadingSpinner } from '../../LoadingSpinner';

export function PurchaseInterface() {
  const { connected, publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  const [amount, setAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [transactionSignature, setTransactionSignature] = useState("");

  // Convert XYN to SOL cost and calculate estimates
  const xynAmount = parseFloat(amount) || 0;
  const solAmount = xynAmount / PRESALE_CONFIG.XYN_PER_SOL || 0;
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
    if (!publicKey || !amount || !signTransaction) return;
   
    setError("");
    setIsProcessing(true);
    setStatus("Verifying availability...");
   
    try {
      // 1. Verify token availability
      const isAvailable = await verifyTokenAvailability(amount);
      if (!isAvailable) {
        throw new Error("Insufficient presale tokens available");
      }

      // 2. Process XYN distribution first
      setStatus("Processing token distribution...");
      const distributeRes = await fetch("/api/distribute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buyerPubkey: publicKey.toString(),
          xynAmount: amount
        })
      });

      const responseData = await distributeRes.json();

      if (!distributeRes.ok || !responseData.success) {
        throw new Error(responseData.error || responseData.details || "Distribution failed");
      }

      setTransactionSignature(responseData.signature);

      // 3. Process SOL transfer after successful distribution
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

      const signed = await signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signed.serialize());
      await connection.confirmTransaction(signature);

      setStatus(`Success! XYN tokens sent to your wallet. Transaction: ${responseData.signature.slice(0, 8)}...`);
      setAmount("");
      setShowConfirmation(false);
    } catch (error: any) {
      console.error("Transaction failed:", error);
      setError(error.message || "Transaction failed");
      setStatus("");
    } finally {
      setIsProcessing(false);
    }
  };

  const cardStyle: React.CSSProperties = {
    background: 'rgba(45, 18, 100, 0.6)',
    borderRadius: '0.75rem',
    border: '1px solid rgba(139, 92, 246, 0.3)',
    overflow: 'hidden',
    width: '100%'
  };

  const cardHeaderStyle: React.CSSProperties = {
    padding: '1.5rem',
    textAlign: 'center',
    borderBottom: '1px solid rgba(139, 92, 246, 0.3)',
    background: 'rgba(59, 7, 100, 0.6)'
  };

  const cardContentStyle: React.CSSProperties = {
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.75rem',
    backgroundColor: 'rgba(45, 18, 100, 0.8)',
    border: '1px solid rgba(139, 92, 246, 0.4)',
    borderRadius: '0.5rem',
    color: 'white',
    outline: 'none'
  };

  const buttonStyle: React.CSSProperties = {
    padding: '0.75rem',
    backgroundColor: '#3B82F6',
    border: 'none',
    borderRadius: '0.5rem',
    color: 'white',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    fontWeight: '500',
    width: '100%'
  };

  const modalOverlayStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
    zIndex: 50
  };

  const modalCardStyle: React.CSSProperties = {
    backgroundColor: 'rgba(45, 18, 100, 0.95)',
    border: '1px solid rgba(139, 92, 246, 0.4)',
    borderRadius: '0.75rem',
    maxWidth: '28rem',
    width: '100%',
    padding: '1.5rem'
  };

  // Display wallet information at the top of the purchase interface
  const walletInfoStyle: React.CSSProperties = {
    padding: '1rem',
    backgroundColor: 'rgba(59, 7, 100, 0.4)',
    borderRadius: '0.5rem',
    marginBottom: '1rem',
    border: '1px solid rgba(139, 92, 246, 0.2)'
  };

  return (
    <div style={{ width: '100%', padding: '1rem' }}>
      {/* Main Card */}
      <div style={cardStyle}>
        {/* Header */}
        <div style={cardHeaderStyle}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#93C5FD', margin: 0 }}>XYN Token Purchase</h2>
          <p style={{ color: 'rgba(147, 197, 253, 0.7)', marginTop: '0.5rem' }}>Exchange SOL for XYN tokens</p>
        </div>
       
        {/* Content */}
        <div style={cardContentStyle}>
          {/* Wallet Info */}
          {connected && publicKey && (
            <div style={walletInfoStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <div style={{ height: '10px', width: '10px', backgroundColor: '#4ade80', borderRadius: '50%' }}/>
                <span style={{ color: '#93C5FD', fontWeight: 'bold' }}>Connected Wallet:</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'white', overflowWrap: 'break-word', marginBottom: '0.5rem' }}>
                {publicKey.toString()}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span style={{ color: '#93C5FD' }}>Network:</span>
                <span style={{ color: 'white' }}>{process.env.NEXT_PUBLIC_SOLANA_NETWORK || "testnet"}</span>
              </div>
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#93C5FD', marginBottom: '0.5rem' }}>
              Amount of XYN
            </label>
            <input
              type="number"
              placeholder="Enter XYN amount (min 100,000)"
              value={amount}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)}
              style={inputStyle}
              min={PRESALE_CONFIG.MIN_PURCHASE}
              disabled={isProcessing}
            />
            <p style={{ color: 'rgba(147, 197, 253, 0.7)', marginTop: '0.5rem', fontSize: '0.875rem' }}>
              Cost: {solAmount.toFixed(4)} SOL
            </p>
          </div>
         
          {error && (
            <div style={{
              padding: '0.75rem',
              backgroundColor: 'rgba(220, 38, 38, 0.2)',
              border: '1px solid rgba(220, 38, 38, 0.5)',
              borderRadius: '0.5rem',
              color: '#FCA5A5'
            }}>
              {error}
            </div>
          )}
         
          {status && (
            <div style={{
              padding: '0.75rem',
              backgroundColor: 'rgba(37, 99, 235, 0.2)',
              border: '1px solid rgba(37, 99, 235, 0.5)',
              borderRadius: '0.5rem',
              color: '#93C5FD'
            }}>
              {status}
              {isProcessing && (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.5rem' }}>
                  <LoadingSpinner />
                </div>
              )}
            </div>
          )}

          {transactionSignature && (
            <div style={{
              padding: '0.75rem',
              backgroundColor: 'rgba(16, 185, 129, 0.2)',
              border: '1px solid rgba(16, 185, 129, 0.5)',
              borderRadius: '0.5rem',
              color: '#6EE7B7'
            }}>
              <div style={{ marginBottom: '0.5rem' }}>Transaction Complete</div>
              <a 
                href={`https://${process.env.NEXT_PUBLIC_SOLANA_NETWORK === 'mainnet-beta' ? '' : process.env.NEXT_PUBLIC_SOLANA_NETWORK + '.'}solscan.io/tx/${transactionSignature}`} 
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#93C5FD', fontSize: '0.8rem', wordBreak: 'break-all' }}
              >
                {transactionSignature}
              </a>
            </div>
          )}

          <button
            onClick={handlePurchase}
            disabled={!amount || isProcessing || parseFloat(amount) <= 0}
            style={{
              ...buttonStyle,
              backgroundColor: (!amount || isProcessing || parseFloat(amount) <= 0) ? 'rgba(59, 130, 246, 0.5)' : '#3B82F6',
              cursor: (!amount || isProcessing || parseFloat(amount) <= 0) ? 'not-allowed' : 'pointer'
            }}
          >
            {isProcessing ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
                <svg style={{
                  animation: 'spin 1s linear infinite',
                  width: '1.25rem',
                  height: '1.25rem'
                }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              'Purchase XYN'
            )}
          </button>
        </div>
       
        {/* Footer */}
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid rgba(139, 92, 246, 0.3)', textAlign: 'center' }}>
          <p style={{ fontSize: '0.75rem', color: 'rgba(147, 197, 253, 0.7)' }}>
            Exchange Rate: 1 SOL = {PRESALE_CONFIG.XYN_PER_SOL.toLocaleString()} XYN
          </p>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div style={modalOverlayStyle}>
          <div style={modalCardStyle}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '500', color: '#93C5FD', marginBottom: '0.5rem' }}>Confirm Purchase</h3>
            <p style={{ color: 'rgba(147, 197, 253, 0.7)', marginBottom: '1rem' }}>
              You are about to exchange {solAmount.toFixed(4)} SOL for {xynEstimate} XYN tokens.
              This action cannot be undone.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                onClick={() => setShowConfirmation(false)}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: 'transparent',
                  color: 'rgba(147, 197, 253, 0.7)',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmPurchase}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#3B82F6',
                  border: 'none',
                  borderRadius: '0.375rem',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}