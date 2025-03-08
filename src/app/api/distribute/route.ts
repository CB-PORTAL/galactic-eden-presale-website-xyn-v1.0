import { API_CONFIG } from "@/config/api-config";
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

// Helper function for simulation delays
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function POST(request: Request) {
  console.log("Distribution process started", API_CONFIG.TEST_MODE ? "(TEST MODE)" : "");
 
  try {
    // Parse request body
    const { buyerPubkey, xynAmount, solSignature } = await request.json();
   
    // Validate input parameters
    if (!buyerPubkey || !xynAmount || isNaN(Number(xynAmount)) || Number(xynAmount) <= 0) {
      console.error("Invalid input parameters:", { buyerPubkey, xynAmount });
      return NextResponse.json({
        error: "Invalid input parameters",
        details: "Public key and a positive XYN amount are required"
      }, { status: 400 });
    }

    // Validate SOL signature is present in production mode
    if (!API_CONFIG.TEST_MODE && !solSignature) {
      console.error("Missing SOL transaction signature");
      return NextResponse.json({
        error: "Missing SOL transaction signature",
        details: "SOL payment verification failed"
      }, { status: 400 });
    }

    // Log the attempt
    console.log(`Processing distribution of ${xynAmount} XYN to ${buyerPubkey}`);
    if (solSignature) {
      console.log(`SOL payment transaction: ${solSignature}`);
    }

    if (API_CONFIG.TEST_MODE) {
      // Simulate processing delay
      await sleep(API_CONFIG.SIMULATION.DELAY);
     
      // Occasionally simulate a failure for testing error handling
      if (Math.random() > API_CONFIG.SIMULATION.SUCCESS_RATE) {
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
      const MAX_RETRIES = API_CONFIG.PRODUCTION.MAX_RETRIES;
      const RETRY_DELAY = API_CONFIG.PRODUCTION.RETRY_DELAY;
      const MAX_TIMEOUT = API_CONFIG.PRODUCTION.MAX_TIMEOUT;
     
      const connection = new Connection(RPC_ENDPOINT, {
        commitment: 'confirmed',
        confirmTransactionInitialTimeout: MAX_TIMEOUT,
      });
     
      // If SOL signature is provided, verify it is confirmed before proceeding
      if (solSignature) {
        try {
          console.log(`Verifying SOL payment transaction: ${solSignature}`);
          const signatureStatus = await connection.getSignatureStatus(solSignature);
          
          if (!signatureStatus.value || signatureStatus.value.err || 
              !['confirmed', 'finalized'].includes(signatureStatus.value.confirmationStatus || '')) {
            console.error("SOL payment transaction not confirmed:", signatureStatus);
            return NextResponse.json({
              success: false,
              error: "SOL payment verification failed",
              details: "The SOL payment transaction has not been confirmed on the network"
            }, { status: 400 });
          }
          
          console.log("SOL payment confirmed. Proceeding with token distribution.");
        } catch (error) {
          console.error("Error verifying SOL payment:", error);
          return NextResponse.json({
            success: false,
            error: "SOL payment verification error",
            details: "Failed to verify SOL payment transaction"
          }, { status: 400 });
        }
      }
     
      const presaleWallet = loadWalletFromEnv(PRESALE_SECRET_KEY);
      const mintPubkey = new PublicKey(XYN_MINT_ADDRESS);
      const DECIMALS = 9;
      const rawAmount = Number(xynAmount) * (10 ** DECIMALS);
     
      console.log("Initializing token accounts...");

      try {
        // Check if buyer public key is valid
        let buyerPubkeyObj: PublicKey;
        try {
          buyerPubkeyObj = new PublicKey(buyerPubkey);
        } catch (error) {
          console.error("Invalid buyer public key:", error);
          return NextResponse.json({
            success: false,
            error: "Invalid wallet address",
            details: "The provided wallet address is not a valid Solana address"
          }, { status: 400 });
        }
       
        // First check if destination token account exists before getting/creating
        const buyerATA = await getAssociatedTokenAddress(
          mintPubkey,
          buyerPubkeyObj
        );
        
        // Get source token account
        const sourceATA = await getOrCreateAssociatedTokenAccount(
          connection,
          presaleWallet,
          mintPubkey,
          presaleWallet.publicKey
        );
       
        // Balance verification - Make sure presale wallet has enough tokens
        const sourceAccount = await connection.getTokenAccountBalance(sourceATA.address);
        const sourceBalance = Number(sourceAccount.value.amount);
       
        if (sourceBalance < rawAmount) {
          return NextResponse.json({
            success: false,
            error: "Insufficient presale balance",
            details: "Not enough tokens in the presale wallet"
          }, { status: 400 });
        }
       
        // Now try to get or create the buyer's token account
        let buyerTokenAccount;
        try {
          buyerTokenAccount = await getOrCreateAssociatedTokenAccount(
            connection,
            presaleWallet,
            mintPubkey,
            buyerPubkeyObj
          );
        } catch (error) {
          console.error("Failed to get or create buyer token account:", error);
          return NextResponse.json({
            success: false,
            error: "Token account creation failed",
            details: "Could not create or access your XYN token account"
          }, { status: 500 });
        }
       
        // Create transaction with compute budget to prevent errors
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
            buyerTokenAccount.address,
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
          RETRY_DELAY
        );
       
        // Additional verification that tokens were received
        try {
          await sleep(2000); // Brief pause to allow network to process
          const tokenAccount = await connection.getTokenAccountBalance(buyerTokenAccount.address);
          console.log(`Token account balance after transfer: ${tokenAccount.value.amount}`);
        } catch (err) {
          console.log("Note: Post-verification check could not confirm token balance, but transaction was signed");
        }
        
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
  retryDelay = 2000
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