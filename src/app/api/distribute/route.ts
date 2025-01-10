// File: /app/api/distribute/route.ts
import { NextResponse } from "next/server";
import {
  Connection,
  PublicKey,
  Keypair,
  Transaction
} from "@solana/web3.js";
import {
  createTransferInstruction,
  getOrCreateAssociatedTokenAccount
} from "@solana/spl-token";

const PRESALE_SECRET_KEY = process.env.NEXT_PRIVATE_PRESALE_SECRET_KEY || "";
const XYN_MINT_ADDRESS   = process.env.NEXT_PUBLIC_XYN_MINT_ADDRESS    || "";
const RPC_ENDPOINT       = process.env.NEXT_PUBLIC_RPC_ENDPOINT        || "";

// Load your presale wallet from the secret bytes
function loadWalletFromEnv() {
  const secretBytes = JSON.parse(PRESALE_SECRET_KEY) as number[];
  const secret = Uint8Array.from(secretBytes);
  return Keypair.fromSecretKey(secret);
}

export async function POST(request: Request) {
  try {
    const { buyerPubkey, xynAmount } = await request.json();
    if (!buyerPubkey || !xynAmount) {
      return NextResponse.json(
        { error: "Missing buyerPubkey or xynAmount" },
        { status: 400 }
      );
    }

    // 1) Load presale wallet
    const presaleWallet = loadWalletFromEnv();

    // 2) Connect to QuickNode (no devnet fallback)
    const connection = new Connection(RPC_ENDPOINT);

    // 3) XYN mint
    const mintPubkey = new PublicKey(XYN_MINT_ADDRESS);

    // 4) Convert string -> number
    const xynToSend = Number(xynAmount);

    // 5) Get or create the presale’s associated token account
    const sourceATA = await getOrCreateAssociatedTokenAccount(
      connection,
      presaleWallet,
      mintPubkey,
      presaleWallet.publicKey
    );

    // 6) Buyer’s ATA
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

    // 8) Fee payer + blockhash
    transaction.feePayer = presaleWallet.publicKey;
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;

    // 9) Sign + send
    transaction.sign(presaleWallet);
    const rawTx = transaction.serialize();
    const signature = await connection.sendRawTransaction(rawTx);
    await connection.confirmTransaction(signature);

    // 10) Return success
    return NextResponse.json({ success: true, signature }, { status: 200 });
  } catch (err: any) {
    console.error("Error distributing XYN:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}