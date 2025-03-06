import { NextResponse } from "next/server";
import {
  Connection,
  PublicKey,
  Keypair,
  Transaction,
  sendAndConfirmTransaction,
  ComputeBudgetProgram,
} from "@solana/web3.js";
import {
  createTransferInstruction,
  getOrCreateAssociatedTokenAccount,
  getAssociatedTokenAddress,
} from "@solana/spl-token";

// TEST MODE CONFIGURATION
// In production, these would come from environment variables
const TEST_MODE = true; // Change to false for mainnet
const SIMULATION_DELAY = 2000; // ms to simulate transaction processing
const SIMULATION_SUCCESS_RATE = 0.95; // 95% success rate for testing error handling

// Helper function for simulation delays
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function POST(request: Request) {
  console.log("Distribution process started", TEST_MODE ? "(TEST MODE)" : "");
 
  try {
    // Parse request body
    const { buyerPubkey, xynAmount } = await request.json();
   
    // Validate input parameters
    if (!buyerPubkey || !xynAmount || isNaN(Number(xynAmount)) || Number(xynAmount) <= 0) {
      console.error("Invalid input parameters:", { buyerPubkey, xynAmount });
      return NextResponse.json({
        error: "Invalid input parameters",
        details: "Public key and a positive XYN amount are required"
      }, { status: 400 });
    }

    // Log the attempt
    console.log(`Processing distribution of ${xynAmount} XYN to ${buyerPubkey}`);

    if (TEST_MODE) {
      // Simulate processing delay
      await sleep(SIMULATION_DELAY);
     
      // Occasionally simulate a failure for testing error handling
      if (Math.random() > SIMULATION_SUCCESS_RATE) {
        throw new Error("Simulated random transaction failure for testing");
      }
     
      // Return success response with simulated transaction signature
      const simulatedSignature = `sim${Date.now().toString(36)}${Math.random().toString(36).substr(2, 9)}`;
     
      console.log(`TEST MODE: Transaction simulation successful. Signature: ${simulatedSignature}`);
     
      return NextResponse.json({
        success: true,
        signature: simulatedSignature,
        message: "Test transfer completed successfully",
        txDetails: {
          amount: xynAmount,
          recipient: buyerPubkey,
          timestamp: new Date().toISOString()
        }
      });
    }
    else {
      // PRODUCTION MODE IMPLEMENTATION
      // Environment variables with strict validation
      if (!process.env.NEXT_PRIVATE_PRESALE_SECRET_KEY ||
          !process.env.NEXT_PUBLIC_XYN_MINT_ADDRESS ||
          !process.env.NEXT_PUBLIC_RPC_ENDPOINT) {
        throw new Error("Missing required environment variables");
      }
     
      const PRESALE_SECRET_KEY = process.env.NEXT_PRIVATE_PRESALE_SECRET_KEY;
      const XYN_MINT_ADDRESS = process.env.NEXT_PUBLIC_XYN_MINT_ADDRESS;
      const RPC_ENDPOINT = process.env.NEXT_PUBLIC_RPC_ENDPOINT;
     
      // Constants for transaction handling
      const MAX_RETRIES = 5;
      const RETRY_DELAY = 2000; // 2 seconds  // Moved this inside the function scope
      const MAX_TIMEOUT = 90000; // 90 seconds
     
      const connection = new Connection(RPC_ENDPOINT, {
        commitment: 'confirmed',
        confirmTransactionInitialTimeout: MAX_TIMEOUT,
      });
     
      const presaleWallet = loadWalletFromEnv(PRESALE_SECRET_KEY);
      const mintPubkey = new PublicKey(XYN_MINT_ADDRESS);
      const DECIMALS = 9;
      const rawAmount = Number(xynAmount) * (10 ** DECIMALS);
     
      console.log("Initializing token accounts...");

      try {
        // Get source token account
        const sourceATA = await getOrCreateAssociatedTokenAccount(
          connection,
          presaleWallet,
          mintPubkey,
          presaleWallet.publicKey
        );
       
        // Balance verification
        const sourceAccount = await connection.getTokenAccountBalance(sourceATA.address);
        const sourceBalance = Number(sourceAccount.value.amount);
        
        if (sourceBalance < rawAmount) {
          return NextResponse.json({ 
            success: false,
            error: "Insufficient presale balance",
            details: "Not enough tokens in the presale wallet"
          }, { status: 400 });
        }
       
        const buyerPubkeyObj = new PublicKey(buyerPubkey);
        
        // Get or create destination token account
        const buyerATA = await getOrCreateAssociatedTokenAccount(
          connection,
          presaleWallet,
          mintPubkey,
          buyerPubkeyObj
        );
       
        const transaction = new Transaction();
       
        // Add compute budget to prevent compute limit errors
        transaction.add(
          ComputeBudgetProgram.setComputeUnitLimit({
            units: 400000
          })
        );
       
        transaction.add(
          createTransferInstruction(
            sourceATA.address,
            buyerATA.address,
            presaleWallet.publicKey,
            rawAmount
          )
        );
       
        // Send transaction with retry mechanism
        const signature = await sendTransactionWithRetry(
          connection, 
          transaction, 
          [presaleWallet],
          MAX_RETRIES,
          RETRY_DELAY  // Pass the RETRY_DELAY as a parameter
        );
       
        return NextResponse.json({
          success: true,
          signature,
          message: "Transfer completed and verified"
        });
      } catch (error: any) {
        console.error("Token account operations failed:", error);
        throw error;
      }
    }
  } catch (error: any) {
    console.error("Distribution failed:", error);
   
    // Return a user-friendly error
    return NextResponse.json({
      success: false,
      error: "Transaction failed",
      details: error.message || "Unknown error occurred during token distribution",
      errorCode: "DISTRIBUTION_ERROR"
    }, { status: 500 });
  }
}

// Helper functions for production mode
function loadWalletFromEnv(secretKeyJson: string) {
  try {
    const secretBytes = JSON.parse(secretKeyJson);
    if (!Array.isArray(secretBytes)) {
      throw new Error("Invalid secret key format");
    }
    return Keypair.fromSecretKey(Uint8Array.from(secretBytes));
  } catch (error) {
    console.error("Critical: Failed to load presale wallet:", error);
    throw new Error("Presale wallet initialization failed");
  }
}

async function sendTransactionWithRetry(
  connection: Connection,
  transaction: Transaction,
  signers: Keypair[],
  maxRetries = 5,
  retryDelay = 2000  // Added retryDelay parameter with default value
): Promise<string> {
  let lastError;
 
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Get a fresh blockhash for each attempt
      const blockhash = await connection.getLatestBlockhash('confirmed');
      transaction.recentBlockhash = blockhash.blockhash;
      transaction.feePayer = signers[0].publicKey;
     
      console.log(`Attempt ${attempt + 1}/${maxRetries} - Sending transaction...`);
      const signature = await sendAndConfirmTransaction(
        connection,
        transaction,
        signers,
        {
          skipPreflight: false,
          commitment: 'confirmed',
          preflightCommitment: 'confirmed',
          maxRetries: 3,
        }
      );
     
      // Verify transaction success
      const confirmation = await connection.confirmTransaction({
        signature,
        blockhash: blockhash.blockhash,
        lastValidBlockHeight: blockhash.lastValidBlockHeight
      }, 'confirmed');
     
      if (!confirmation.value.err) {
        console.log(`Transaction confirmed: ${signature}`);
        return signature;
      } else {
        throw new Error(`Transaction error: ${confirmation.value.err}`);
      }
    } catch (error) {
      lastError = error as Error;
      console.log(`Attempt ${attempt + 1} failed:`, (error as Error).message);
     
      if (attempt < maxRetries - 1) {
        await sleep(retryDelay * (attempt + 1)); // Exponential backoff using the parameter
        continue;
      }
    }
  }
 
  throw lastError || new Error('Transaction failed after all retries');
}