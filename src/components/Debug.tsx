'use client';

import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { ConnectButton } from "./wallet/ConnectButton";

export const Debug = () => {
  return (
    <div className="p-4 bg-white">
      <h1 className="text-black text-2xl">Galactic Eden - Debug Mode</h1>
      <p className="text-black">If you can see this, basic rendering is working.</p>
      <div className="mt-4">
        <ConnectButton />
      </div>
    </div>
  );
};

export default Debug;