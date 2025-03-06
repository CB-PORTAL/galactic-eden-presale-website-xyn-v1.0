// Create or update this file at src/app/api/verify-balance/route.ts
import { NextResponse } from "next/server";

// TEST MODE CONFIGURATION
const TEST_MODE = true;
const SIMULATION_DELAY = 1000;
const MIN_BALANCE_THRESHOLD = 5000000;

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
    
    if (TEST_MODE) {
      // Simulate processing delay
      await sleep(SIMULATION_DELAY);
      
      // In test mode, always return available=true for simplicity
      const numAmount = Number(amount);
      
      console.log(`TEST MODE: Simulated balance check - Amount: ${numAmount}, Available: true`);
      
      return NextResponse.json({ 
        available: true,
        simulatedBalance: MIN_BALANCE_THRESHOLD,
        requestedAmount: numAmount,
        testMode: true
      });
    } 
    else {
      // Since we don't have production implementation enabled yet, return error
      return NextResponse.json({
        error: "Production mode not implemented",
        details: "Please set TEST_MODE to true for development"
      }, { status: 501 });
    }
  } catch (error: any) {
    console.error("Balance verification failed:", error);
    
    if (TEST_MODE) {
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