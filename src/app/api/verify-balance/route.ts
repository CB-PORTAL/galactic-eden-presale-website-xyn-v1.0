import { API_CONFIG } from "@/config/api-config";
import { NextResponse } from "next/server";
import { Connection, PublicKey, Keypair } from "@solana/web3.js";
import { getAssociatedTokenAddress } from "@solana/spl-token";

// Helper function for simulation delays
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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
   
    if (API_CONFIG.TEST_MODE) {
      // Simulate processing delay
      await sleep(API_CONFIG.SIMULATION.DELAY);
     
      // In test mode, always return available=true for simplicity
      const numAmount = Number(amount);
     
      console.log(`TEST MODE: Simulated balance check - Amount: ${numAmount}, Available: true`);
     
      return NextResponse.json({
        available: true,
        simulatedBalance: API_CONFIG.MIN_BALANCE_THRESHOLD,
        requestedAmount: numAmount,
        testMode: true
      });
    }
    else {
      // Production implementation
      if (!process.env.NEXT_PUBLIC_XYN_MINT_ADDRESS ||
          !process.env.NEXT_PUBLIC_RPC_ENDPOINT ||
          !process.env.NEXT_PRIVATE_PRESALE_SECRET_KEY) {
        throw new Error("Missing required environment variables");
      }
      
      const RPC_ENDPOINT = process.env.NEXT_PUBLIC_RPC_ENDPOINT;
      const XYN_MINT_ADDRESS = process.env.NEXT_PUBLIC_XYN_MINT_ADDRESS;
      
      // For production, we need to check the actual presale wallet balance
      const connection = new Connection(RPC_ENDPOINT, 'confirmed');
      
      // Get presale wallet public key
      let presaleWalletPublicKey;
      try {
        const secretKeyJson = process.env.NEXT_PRIVATE_PRESALE_SECRET_KEY;
        const secretBytes = JSON.parse(secretKeyJson);
        const keypair = Keypair.fromSecretKey(Uint8Array.from(secretBytes));
        presaleWalletPublicKey = keypair.publicKey;
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
      const tokenBalance = await connection.getTokenAccountBalance(tokenAccountAddress);
      const availableAmount = Number(tokenBalance.value.amount);
      const requestedAmount = Number(amount) * (10 ** 9); // Assuming 9 decimals for XYN token
      
      const isAvailable = availableAmount >= requestedAmount;
      
      return NextResponse.json({
        available: isAvailable,
        availableBalance: availableAmount / (10 ** 9), // Convert back to user-friendly format
        requestedAmount: Number(amount)
      });
    }
  } catch (error: any) {
    console.error("Balance verification failed:", error);
   
    if (API_CONFIG.TEST_MODE) {
      // In test mode, we can fallback to a successful response for better UX
      console.log("TEST MODE: Returning fallback success response despite error");
      return NextResponse.json({ available: true, fallback: true });
    } else {
      return NextResponse.json({
        error: "Balance verification failed",
        details: error.message || "Unknown error occurred during balance check",
        errorCode: "BALANCE_CHECK_ERROR"
      }, { status: 500 });
    }
  }
}