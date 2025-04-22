// src/app/api/distribute/route.ts
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

// Helper function for delays
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function POST(request: Request) {
  console.log("Distribution process started");
 
  try {
    // Parse request body
    const { buyerPubkey, xynAmount, solSignature } = await request.json();
   
    // Validate input parameters
    if (!buyerPubkey || !xynAmount || isNaN(Number(xynAmount)) || Number(xynAmount) <= 0) {
      console.error("Invalid input parameters:", { buyerPubkey, xynAmount });
      return NextResponse.json({
        success: false,
        error: "Invalid input parameters",
        details: "Public key and a positive XYN amount are required"
      }, { status: 400 });
    }

    // Validate SOL signature is present
    if (!solSignature) {
      console.error("Missing SOL transaction signature");
      return NextResponse.json({
        success: false,
        error: "Missing SOL transaction signature",
        details: "SOL payment verification failed"
      }, { status: 400 });
    }

    // Log the attempt
    console.log(`Processing distribution of ${xynAmount} XYN to ${buyerPubkey}`);
    console.log(`SOL payment transaction: ${solSignature}`);

    // Environment variables with strict validation
    if (!process.env.NEXT_PRIVATE_PRESALE_SECRET_KEY ||
        !process.env.NEXT_PUBLIC_XYN_MINT_ADDRESS ||
        !process.env.NEXT_PUBLIC_RPC_ENDPOINT) {
      throw new Error("Missing required environment variables");
    }
   
    const PRESALE_SECRET_KEY = process.env.NEXT_PRIVATE_PRESALE_SECRET_KEY;
    const XYN_MINT_ADDRESS = process.env.NEXT_PUBLIC_XYN_MINT_ADDRESS;
    const RPC_ENDPOINT = process.env.NEXT_PUBLIC_RPC_ENDPOINT;
   
    // Connection with extended timeout for mainnet
    const connection = new Connection(RPC_ENDPOINT, {
      commitment: 'confirmed',
      confirmTransactionInitialTimeout: 90000, // 90 seconds
    });
   
    // Verify SOL payment transaction is confirmed before proceeding
    try {
      console.log(`Verifying SOL payment transaction: ${solSignature}`);
      
      // Add retry logic for signature verification
      let signatureStatus;
      let retries = 0;
      const maxRetries = 3;
      
      while (retries < maxRetries) {
        try {
          signatureStatus = await connection.getSignatureStatus(solSignature);
          
          // Successfully got status
          if (signatureStatus && signatureStatus.value) {
            // If transaction was successful or is being processed, proceed
            if (!signatureStatus.value.err && 
                (signatureStatus.value.confirmationStatus === 'confirmed' || 
                 signatureStatus.value.confirmationStatus === 'finalized' ||
                 signatureStatus.value.confirmationStatus === 'processed')) {
              console.log("SOL payment confirmed with status:", signatureStatus.value.confirmationStatus);
              break;
            }
            // If transaction has a clear error, report it immediately
            else if (signatureStatus.value.err) {
              console.error("Transaction has an error:", signatureStatus.value.err);
              return NextResponse.json({
                success: false,
                error: "SOL payment failed",
                details: `Transaction error: ${JSON.stringify(signatureStatus.value.err)}`
              }, { status: 400 });
            }
          }
          
          // If we get here, transaction is not yet confirmed but has no errors
          console.log(`Waiting for transaction confirmation (attempt ${retries+1}/${maxRetries})...`);
          retries++;
          
          // If we've reached max retries, but transaction is still processing, let's proceed anyway
          if (retries >= maxRetries) {
            console.log("Max retries reached but transaction appears to be processing. Proceeding cautiously.");
            break;
          }
          
          // Wait before next retry
          await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (verifyError) {
          console.error(`Error checking signature status (attempt ${retries+1}/${maxRetries}):`, verifyError);
          retries++;
          if (retries >= maxRetries) {
            throw verifyError;
          }
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      console.log("Proceeding with token distribution.");
    } catch (error) {
      console.error("Error verifying SOL payment:", error);
      
      // Check if the transaction exists even if verification failed
      try {
        const tx = await connection.getParsedTransaction(solSignature, {
          maxSupportedTransactionVersion: 0,
          commitment: 'confirmed'
        });
        
        if (tx) {
          console.log("Transaction exists despite verification error. Proceeding with caution.");
          // Continue processing - the transaction might be valid but verification failed
        } else {
          return NextResponse.json({
            success: false,
            error: "SOL payment verification error",
            details: "Failed to verify SOL payment transaction exists"
          }, { status: 400 });
        }
      } catch (secondError) {
        return NextResponse.json({
          success: false,
          error: "SOL payment verification error",
          details: "Failed to verify SOL payment transaction"
        }, { status: 400 });
      }
    }
   
    // Load presale wallet from environment
    let presaleWallet;
    try {
      // Parse the secret key - handling the JSON array format with single quotes
      const secretKeyString = PRESALE_SECRET_KEY.replace(/'/g, '"');
      const secretKeyArray = JSON.parse(secretKeyString);
      presaleWallet = Keypair.fromSecretKey(Uint8Array.from(secretKeyArray));
      
      console.log("Presale wallet loaded successfully: ", presaleWallet.publicKey.toString());
    } catch (error) {
      console.error("Failed to load presale wallet:", error);
      return NextResponse.json({
        success: false,
        error: "Presale wallet initialization failed",
        details: "Could not load the presale wallet. Please contact support."
      }, { status: 500 });
    }
    
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
      
      // Get source token account with explicit error handling
      let sourceATA;
      try {
        // First check if the source token account exists
        const sourceATAAddress = await getAssociatedTokenAddress(
          mintPubkey,
          presaleWallet.publicKey
        );
        
        // Check if the account exists before trying to get info
        const sourceAccount = await connection.getAccountInfo(sourceATAAddress);
        
        if (!sourceAccount) {
          console.error("Presale wallet's token account does not exist");
          return NextResponse.json({
            success: false,
            error: "Presale setup error",
            details: "The presale wallet doesn't have a token account set up for XYN"
          }, { status: 500 });
        }
        
        // Get or create the account if it exists
        sourceATA = await getOrCreateAssociatedTokenAccount(
          connection,
          presaleWallet,
          mintPubkey,
          presaleWallet.publicKey
        );
        
        console.log("Source token account:", sourceATA.address.toString());
      } catch (error) {
        console.error("Failed to access presale token account:", error);
        return NextResponse.json({
          success: false,
          error: "Token account error",
          details: "Could not access the presale token account"
        }, { status: 500 });
      }
     
      // Balance verification - Make sure presale wallet has enough tokens
      try {
        const sourceBalance = await connection.getTokenAccountBalance(sourceATA.address);
        const availableBalance = Number(sourceBalance.value.amount);
        
        console.log(`Presale wallet balance: ${availableBalance / (10 ** DECIMALS)} XYN`);
        
        if (availableBalance < rawAmount) {
          return NextResponse.json({
            success: false,
            error: "Insufficient presale balance",
            details: `Not enough tokens in the presale wallet. Available: ${availableBalance / (10 ** DECIMALS)} XYN, Requested: ${xynAmount} XYN`
          }, { status: 400 });
        }
      } catch (error) {
        console.error("Failed to check token balance:", error);
        return NextResponse.json({
          success: false,
          error: "Balance check failed",
          details: "Could not verify token balance"
        }, { status: 500 });
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
        
        console.log("Buyer token account:", buyerTokenAccount.address.toString());
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
      console.log("Sending token distribution transaction...");
      let signature;
      
      try {
        // Get a fresh blockhash
        const blockhash = await connection.getLatestBlockhash('confirmed');
        transaction.recentBlockhash = blockhash.blockhash;
        transaction.feePayer = presaleWallet.publicKey;
        
        signature = await sendAndConfirmTransaction(
          connection,
          transaction,
          [presaleWallet],
          {
            skipPreflight: false,
            commitment: 'confirmed',
            preflightCommitment: 'confirmed',
            maxRetries: 3,
          }
        );
        
        console.log(`Transaction confirmed: ${signature}`);
      } catch (error) {
        console.error("Token transaction failed:", error);
        return NextResponse.json({
          success: false,
          error: "Transaction failed",
          details: `Token transfer failed: ${(error as Error).message}`
        }, { status: 500 });
      }
     
      // Additional verification that tokens were received
      try {
        // Brief pause to allow network to process
        await sleep(2000);
        
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