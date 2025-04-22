import type { NextRequest } from 'next/server';
import { verifyTokenBalance } from '../../../lib/tokenVerification';

export async function GET(request: NextRequest) {
  try {
    // Call the verifyTokenBalance function
    const result = await verifyTokenBalance();
    
    return Response.json(result);
  } catch (error: any) {
    return Response.json({
      success: false,
      message: `Server error: ${error.message}`
    }, { status: 500 });
  }
}