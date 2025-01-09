"use client";

import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";
import { useMemo } from "react";

// Import the env var from NEXT_PUBLIC_SOLANA_NETWORK
const solanaNetworkEnv = process.env.NEXT_PUBLIC_SOLANA_NETWORK || "devnet";

export function Providers({ children }: { children: React.ReactNode }) {
  // convert string to proper WalletAdapterNetwork type
  // or default to devnet if it's not recognized
  const network =
    solanaNetworkEnv === "mainnet-beta"
      ? WalletAdapterNetwork.Mainnet
      : solanaNetworkEnv === "testnet"
      ? WalletAdapterNetwork.Testnet
      : WalletAdapterNetwork.Devnet;

  // use the chosen network to get cluster endpoint
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  const wallets = useMemo(
    () => [new PhantomWalletAdapter({ network })],
    [network]
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect={false}>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}