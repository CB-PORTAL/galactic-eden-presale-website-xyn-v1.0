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
  return Keypair.fromSecretKey(Uint8Array.from(secretBytes));
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

    // 2) Connect to mainnet (no devnet fallback)
    const connection = new Connection(RPC_ENDPOINT);

    // 3) XYN mint
    const mintPubkey = new PublicKey(XYN_MINT_ADDRESS);

    // 4) Multiply by 10^9 so "100000" typed = 100000 tokens on-chain
    const DECIMALS = 9;
    const rawUserInput = Number(xynAmount);
    const xynToSend = rawUserInput * 10 ** DECIMALS;

    // 5) Source ATA
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

    // 7) Create transfer
    const transaction = new Transaction().add(
      createTransferInstruction(
        sourceATA.address,
        buyerATA.address,
        presaleWallet.publicKey,
        xynToSend
      )
    );
    transaction.feePayer = presaleWallet.publicKey;
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;

    // 8) Sign + send
    transaction.sign(presaleWallet);
    const rawTx = transaction.serialize();
    const signature = await connection.sendRawTransaction(rawTx);
    await connection.confirmTransaction(signature);

    return NextResponse.json({ success: true, signature }, { status: 200 });
  } catch (err: any) {
    console.error("Error distributing XYN:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}