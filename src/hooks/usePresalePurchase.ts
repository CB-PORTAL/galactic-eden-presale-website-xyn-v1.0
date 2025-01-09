// src/hooks/usePresalePurchase.ts
"use client";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { PRESALE_CONFIG } from "@/config/presale";

export const usePresalePurchase = () => {
  const { connection } = useConnection();
  const { publicKey, signTransaction } = useWallet();

  const purchaseTokens = async (solAmount: number) => {
    if (!publicKey || !signTransaction) {
      throw new Error("Wallet not connected");
    }

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: new PublicKey(PRESALE_CONFIG.PRESALE_ADDRESS),
        lamports: solAmount * LAMPORTS_PER_SOL
      })
    );

    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = publicKey;

    const signed = await signTransaction(transaction);
    const signature = await connection.sendRawTransaction(signed.serialize());
    await connection.confirmTransaction(signature);

    return signature;
  };

  return { purchaseTokens };
};