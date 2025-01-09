import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import * as fs from 'fs';

const main = async () => {
    try {
        // Read private key from temporary file
        const privateKey = fs.readFileSync('temp-key.txt', 'utf8').trim();
        const decoded = bs58.decode(privateKey);
        const arrayFormat = JSON.stringify(Array.from(decoded));
        
        // Create env content
        const envContent = `NEXT_PRIVATE_PRESALE_SECRET_KEY='${arrayFormat}'
NEXT_PUBLIC_XYN_MINT_ADDRESS="72nqcXcqFwcgyYfgrDxpwm1NxGkKpQ2YH8ZgeaVLJGxv"
NEXT_PUBLIC_PRESALE_ADDRESS="xojqRfqjtLNN7hqWzpeiyXyAw49SAyz1PB7FFsno3i9"
NEXT_PUBLIC_RPC_ENDPOINT="https://api.devnet.solana.com"
NEXT_PUBLIC_SOLANA_NETWORK="devnet"`;

        fs.writeFileSync('../../.env.local', envContent, 'utf8');
        fs.unlinkSync('temp-key.txt'); // Delete temp file
        
        console.log('✅ Key converted and .env.local updated');
    } catch (error) {
        console.error('Error:', error);
    }
};

main();