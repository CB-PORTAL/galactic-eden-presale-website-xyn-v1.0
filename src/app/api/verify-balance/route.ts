// src/app/api/verify-balance/route.ts
import { NextResponse } from "next/server";
import { Connection, PublicKey } from "@solana/web3.js";
import { getAccount, getAssociatedTokenAddress } from "@solana/spl-token";

const RPC_ENDPOINT = process.env.NEXT_PUBLIC_RPC_ENDPOINT || "";
const XYN_MINT_ADDRESS = process.env.NEXT_PUBLIC_XYN_MINT_ADDRESS || "";
const PRESALE_ADDRESS = process.env.NEXT_PUBLIC_PRESALE_ADDRESS || "";

export async function POST(request: Request) {
  try {
    const { amount } = await request.json();
    if (!amount) {
      return NextResponse.json(
        { error: "Amount is required" },
        { status: 400 }
      );
    }

    // Connect to RPC endpoint
    const connection = new Connection(RPC_ENDPOINT);
    const mintPubkey = new PublicKey(XYN_MINT_ADDRESS);
    const presalePubkey = new PublicKey(PRESALE_ADDRESS);

    // Get presale wallet's ATA
    const tokenAddress = await getAssociatedTokenAddress(
      mintPubkey,
      presalePubkey,
      true // allowOwnerOffCurve
    );

    // Get token account info
    const tokenAccount = await getAccount(connection, tokenAddress);
    const presaleBalance = Number(tokenAccount.amount);
    const requestedAmount = Number(amount) * (10 ** 9); // Convert to raw amount

    // Verify sufficient balance
    const available = presaleBalance >= requestedAmount;
    
    console.log('Presale balance:', presaleBalance);
    console.log('Requested amount:', requestedAmount);
    console.log('Available:', available);
    
    return NextResponse.json({ available });
  } catch (error) {
    console.error("Balance verification failed:", error);
    return NextResponse.json(
      { error: "Balance verification failed" },
      { status: 500 }
    );
  }
}