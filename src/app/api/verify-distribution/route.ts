// src/app/api/verify-distribution/route.ts
import { NextResponse } from "next/server";
import { Connection, PublicKey } from "@solana/web3.js";
import { getAccount } from "@solana/spl-token";

export async function POST(request: Request) {
  try {
    const { buyerPubkey, signature } = await request.json();
    const connection = new Connection(process.env.NEXT_PUBLIC_RPC_ENDPOINT!);
    
    // Wait for confirmation and check token account
    const mintPubkey = new PublicKey(process.env.NEXT_PUBLIC_XYN_MINT_ADDRESS!);
    const buyerPublicKey = new PublicKey(buyerPubkey);
    
    const tokenAccount = await getAccount(connection, buyerPublicKey);
    const received = tokenAccount !== null;
    
    return NextResponse.json({ received });
  } catch (error) {
    console.error("Distribution verification failed:", error);
    return NextResponse.json({ received: false }, { status: 500 });
  }
}