// src/app/api/verify-balance/route.ts
import { NextResponse } from "next/server";
import { PublicKey, Keypair } from "@solana/web3.js";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import { getConnection } from "@/config/connection";

export async function POST(request: Request) {
  try {
    const { amount } = await request.json();
   
    if (!amount) {
      return NextResponse.json(
        { error: "Amount is required" },
        { status: 400 }
      );
    }

    console.log('Verifying balance for amount:', amount);
   
    // Production implementation
    if (!process.env.NEXT_PUBLIC_XYN_MINT_ADDRESS ||
        !process.env.NEXT_PRIVATE_PRESALE_SECRET_KEY) {
      throw new Error("Missing required environment variables");
    }
    
    const connection = getConnection();
    const XYN_MINT_ADDRESS = process.env.NEXT_PUBLIC_XYN_MINT_ADDRESS;
    
    // Get presale wallet public key
    let presaleWalletPublicKey;
    try {
      const secretKeyJson = process.env.NEXT_PRIVATE_PRESALE_SECRET_KEY;
      const secretBytes = JSON.parse(secretKeyJson.replace(/'/g, '"'));
      const keypair = Keypair.fromSecretKey(Uint8Array.from(secretBytes));
      presaleWalletPublicKey = keypair.publicKey;
      
      console.log("Presale wallet public key:", presaleWalletPublicKey.toString());
    } catch (error) {
      console.error("Failed to load presale wallet:", error);
      throw new Error("Failed to initialize presale wallet");
    }
    
    const mintPubkey = new PublicKey(XYN_MINT_ADDRESS);
    
    // Get the associated token account address
    const tokenAccountAddress = await getAssociatedTokenAddress(
      mintPubkey,
      presaleWalletPublicKey
    );
    
    // Get token balance
    try {
      const accountInfo = await connection.getAccountInfo(tokenAccountAddress);
      
      if (!accountInfo) {
        return NextResponse.json({
          available: false,
          error: "Token account not found",
          message: "The presale wallet does not have a token account"
        });
      }
      
      const tokenBalance = await connection.getTokenAccountBalance(tokenAccountAddress);
      const availableAmount = Number(tokenBalance.value.amount);
      const requestedAmount = Number(amount) * (10 ** 9); // Assuming 9 decimals for XYN token
      
      const isAvailable = availableAmount >= requestedAmount;
      
      return NextResponse.json({
        available: isAvailable,
        availableBalance: availableAmount / (10 ** 9), // Convert back to user-friendly format
        requestedAmount: Number(amount)
      });
    } catch (error) {
      console.error("Failed to check token balance:", error);
      return NextResponse.json({
        available: false,
        error: "Balance check failed",
        message: "Could not verify token balance"
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error("Balance verification failed:", error);
    
    return NextResponse.json({
      error: "Balance verification failed",
      details: error.message || "Unknown error occurred during balance check",
      errorCode: "BALANCE_CHECK_ERROR"
    }, { status: 500 });
  }
}