import { PublicKey, Keypair } from '@solana/web3.js';
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { getConnection } from '../config/connection';

export const verifyTokenBalance = async (): Promise<{ 
  success: boolean; 
  message: string; 
  balance?: number;
}> => {
  try {
    const connection = getConnection();
    
    // Parse the private key from environment
    const privateKeyString = process.env.NEXT_PRIVATE_PRESALE_SECRET_KEY || '';
    let privateKeyArray: number[];
    
    try {
      privateKeyArray = JSON.parse(privateKeyString.replace(/'/g, '"'));
    } catch (e) {
      return { success: false, message: 'Invalid private key format' };
    }
    
    // Create keypair from private key array
    const keypair = Keypair.fromSecretKey(Uint8Array.from(privateKeyArray));
    
    // Get token mint
    const tokenMint = new PublicKey(process.env.NEXT_PUBLIC_XYN_MINT_ADDRESS || '');
    
    // Get token account for presale wallet
    const tokenAccountAddress = await getAssociatedTokenAddress(
      tokenMint,
      keypair.publicKey
    );
    
    // Check if account exists
    const accountInfo = await connection.getAccountInfo(tokenAccountAddress);
    if (!accountInfo) {
      return { 
        success: false, 
        message: 'Token account does not exist for presale wallet' 
      };
    }
    
    // Get token balance
    const tokenAccountInfo = await connection.getTokenAccountBalance(tokenAccountAddress);
    // Don't divide by decimals - report raw balance
    const balance = Number(tokenAccountInfo.value.amount);
        return {
          success: true,
          message: 'Token account verified',
          balance
        };
      } catch (error: any) {
        return {
          success: false,
          message: `Verification failed: ${error.message}`
        };
   }
 };