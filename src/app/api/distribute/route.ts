"use client";

import { NextResponse } from 'next/server';
import {
  Connection,
  PublicKey,
  Keypair,
  Transaction
} from '@solana/web3.js';
import {
  createTransferInstruction,
  getOrCreateAssociatedTokenAccount
} from '@solana/spl-token';

const PRESALE_SECRET_KEY  = process.env.NEXT_PRIVATE_PRESALE_SECRET_KEY || '';
const XYN_MINT_ADDRESS    = process.env.NEXT_PUBLIC_XYN_MINT_ADDRESS    || '';
const RPC_ENDPOINT        = process.env.NEXT_PUBLIC_RPC_ENDPOINT        || 'https://api.devnet.solana.com';

/**
 * Convert JSON array of secret bytes into a Keypair
 * Example in .env.local:
 *   NEXT_PRIVATE_PRESALE_SECRET_KEY="[57,212,99, ...]"
 */
function loadWalletFromEnv() {
  const secretBytes = JSON.parse(PRESALE_SECRET_KEY) as number[];
  const secret = Uint8Array.from(secretBytes);
  return Keypair.fromSecretKey(secret);
}

export async function POST(request: Request) {
  try {
    const { buyerPubkey, xynAmount } = await request.json();
    if (!buyerPubkey || !xynAmount) {
      return NextResponse.json({ error: 'Missing buyerPubkey or xynAmount' }, { status: 400 });
    }

    // 1) Load the presale wallet
    const presaleWallet = loadWalletFromEnv();

    // 2) Connect to Solana
    const connection = new Connection(RPC_ENDPOINT);

    // 3) The XYN token’s mint address
    const mintPubkey = new PublicKey(XYN_MINT_ADDRESS);

    // 4) Convert XYN amount to correct decimals
    //    If XYN has 0 decimals, just parse as Number()
    const xynToSend = Number(xynAmount);

    // 5) Find or create the presale wallet’s associated token account
    const sourceATA = await getOrCreateAssociatedTokenAccount(
      connection,
      presaleWallet,
      mintPubkey,
      presaleWallet.publicKey
    );

    // 6) Find or create the buyer’s associated token account
    const buyerPubkeyObj = new PublicKey(buyerPubkey);
    const buyerATA = await getOrCreateAssociatedTokenAccount(
      connection,
      presaleWallet,
      mintPubkey,
      buyerPubkeyObj
    );

    // 7) Create Transfer Instruction
    const transaction = new Transaction().add(
      createTransferInstruction(
        sourceATA.address,
        buyerATA.address,
        presaleWallet.publicKey,
        xynToSend
      )
    );

    // 8) Add blockhash, sign, send
    transaction.feePayer = presaleWallet.publicKey;
    const latestBlockhash = await connection.getLatestBlockhash();
    transaction.recentBlockhash = latestBlockhash.blockhash;

    // Keypair sign
    transaction.sign(presaleWallet);

    // Serialize & send
    const rawTx = transaction.serialize();
    const signature = await connection.sendRawTransaction(rawTx);
    await connection.confirmTransaction(signature);

    return NextResponse.json({ success: true, signature }, { status: 200 });
  } catch (err: any) {
    console.error('Error distributing XYN:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}