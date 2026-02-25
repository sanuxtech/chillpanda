// app/WalletProviderWrapper.tsx
"use client";

import { ReactNode, useMemo } from "react";
import {
  ConnectionProvider,
  WalletProvider as SolanaWalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";

// Import the CSS
import "@solana/wallet-adapter-react-ui/styles.css";

export function WalletProviderWrapper({ children }: { children: ReactNode }) {
  const network =
    process.env.NEXT_PUBLIC_SOLANA_NETWORK === "devnet"
      ? WalletAdapterNetwork.Devnet
      : WalletAdapterNetwork.Mainnet;

  // List of reliable devnet RPC endpoints
  const endpoint = useMemo(() => {
    // Try in order: 1. Custom, 2. Helius, 3. Public, 4. GenesysGo
    // SOLANA_RPC_URL;
    const endpoints = [
      process.env.NEXT_PUBLIC_SOLANA_RPC,
      "https://api.devnet.solana.com",
      "https://devnet.genesysgo.net",
      "https://solana-devnet.g.alchemy.com/v2/demo",
    ];

    // Use first available endpoint
    for (const url of endpoints) {
      if (url && url.startsWith("http")) {
        console.log("🔗 Using RPC:", url);
        return url;
      }
    }

    // Fallback
    console.warn("⚠️ No valid RPC found, using default");
    return "https://api.devnet.solana.com";
  }, []);

  console.log("🌐 Wallet Provider:", { network, endpoint });

  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <SolanaWalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </SolanaWalletProvider>
    </ConnectionProvider>
  );
}
