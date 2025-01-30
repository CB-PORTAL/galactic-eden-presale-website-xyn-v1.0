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
  getAccount,
} from "@solana/spl-token";

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
const RETRY_DELAY = 2000; // 2 seconds
const MAX_TIMEOUT = 90000; // 90 seconds

// Helper function for delays
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function sendTransactionWithRetry(
  connection: Connection,
  transaction: Transaction,
  signers: Keypair[],
  maxRetries = MAX_RETRIES
): Promise<string> {
  let lastError;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Get a fresh blockhash for each attempt
      const blockhash = await connection.getLatestBlockhash('confirmed');
      transaction.recentBlockhash = blockhash.blockhash;
      
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
      }
    } catch (error) {
      lastError = error as Error;
      console.log(`Attempt ${attempt + 1} failed:`, (error as Error).message);
      
      if (attempt < maxRetries - 1) {
        await sleep(RETRY_DELAY * (attempt + 1)); // Exponential backoff
        continue;
      }
    }
  }
  
  throw lastError || new Error('Transaction failed after all retries');
}

export async function POST(request: Request) {
  console.log("Distribution process started");
  try {
    const { buyerPubkey, xynAmount } = await request.json();
    if (!buyerPubkey || !xynAmount || isNaN(Number(xynAmount)) || Number(xynAmount) <= 0) {
      return NextResponse.json({ error: "Invalid input parameters" }, { status: 400 });
    }

    const connection = new Connection(RPC_ENDPOINT, {
      commitment: 'confirmed',
      confirmTransactionInitialTimeout: MAX_TIMEOUT,
    });

    const presaleWallet = loadWalletFromEnv();
    const mintPubkey = new PublicKey(XYN_MINT_ADDRESS);
    const DECIMALS = 9;
    const rawAmount = Number(xynAmount) * (10 ** DECIMALS);

    console.log("Initializing token accounts...");
    const sourceATA = await getOrCreateAssociatedTokenAccount(
      connection,
      presaleWallet,
      mintPubkey,
      presaleWallet.publicKey,
      true
    );

    // Balance verification
    const hasBalance = await verifyPresaleBalance(connection, sourceATA.address, rawAmount);
    if (!hasBalance) {
      return NextResponse.json({ error: "Insufficient presale balance" }, { status: 400 });
    }

    const buyerPubkeyObj = new PublicKey(buyerPubkey);
    const buyerATA = await getOrCreateAssociatedTokenAccount(
      connection,
      presaleWallet,
      mintPubkey,
      buyerPubkeyObj,
      true
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
    const signature = await sendTransactionWithRetry(connection, transaction, [presaleWallet]);

    return NextResponse.json({
      success: true,
      signature,
      message: "Transfer completed and verified"
    });

  } catch (error: any) {
    console.error("Distribution failed:", error);
    return NextResponse.json({
      error: error.message,
      details: error.toString()
    }, { status: 500 });
  }
}

// Helper function to verify balance (moved outside to keep code organized)
async function verifyPresaleBalance(
  connection: Connection,
  sourceAddress: PublicKey,
  requiredAmount: number
): Promise<boolean> {
  try {
    const account = await getAccount(connection, sourceAddress);
    const currentBalance = Number(account.amount);
    console.log(`Presale Balance Check - Current: ${currentBalance}, Required: ${requiredAmount}`);
    return currentBalance >= requiredAmount;
  } catch (error) {
    console.error("Balance verification failed:", error);
    return false;
  }
}

function loadWalletFromEnv() {
  try {
    const secretBytes = JSON.parse(PRESALE_SECRET_KEY);
    if (!Array.isArray(secretBytes)) {
      throw new Error("Invalid secret key format");
    }
    return Keypair.fromSecretKey(Uint8Array.from(secretBytes));
  } catch (error) {
    console.error("Critical: Failed to load presale wallet:", error);
    throw new Error("Presale wallet initialization failed");
  }
}