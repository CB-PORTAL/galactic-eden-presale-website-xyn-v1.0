// File: /src/app/providers.tsx
"use client";

import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";
import { useMemo } from "react";

// Use NEXT_PUBLIC_SOLANA_NETWORK if set; default to "devnet" otherwise
const solanaNetworkEnv = process.env.NEXT_PUBLIC_SOLANA_NETWORK || "devnet";

export function Providers({ children }: { children: React.ReactNode }) {
  const network =
    solanaNetworkEnv === "mainnet-beta"
      ? WalletAdapterNetwork.Mainnet
      : solanaNetworkEnv === "testnet"
      ? WalletAdapterNetwork.Testnet
      : WalletAdapterNetwork.Devnet;

  // Use QuickNode from env, else fallback to clusterApiUrl
  const endpoint = useMemo(() => {
    return process.env.NEXT_PUBLIC_RPC_ENDPOINT || clusterApiUrl(network);
  }, [network]);

  const wallets = useMemo(() => [new PhantomWalletAdapter({ network })], [network]);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect={false}>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}