import { Keypair } from "@solana/web3.js";
import * as fs from 'fs';

const main = () => {
  const keypair = Keypair.generate();
  const secret = JSON.stringify(Array.from(keypair.secretKey));
  console.log('Generated Public Key:', keypair.publicKey.toString());
  return secret;
};

const secret = main();
console.log('Save this secret key array in your .env.local:');
console.log(secret);