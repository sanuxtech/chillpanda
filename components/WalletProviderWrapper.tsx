"use client";

import { ReactNode, useMemo } from "react";
import {
  ConnectionProvider,
  WalletProvider as SolanaWalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import "@solana/wallet-adapter-react-ui/styles.css";

export function WalletProviderWrapper({ children }: { children: ReactNode }) {
  const network =
    process.env.NEXT_PUBLIC_SOLANA_NETWORK === "devnet"
      ? WalletAdapterNetwork.Devnet
      : WalletAdapterNetwork.Mainnet;

  const endpoint = useMemo(() => {
    const custom = process.env.NEXT_PUBLIC_SOLANA_RPC;
    if (custom && custom.startsWith("http")) return custom;
    return network === WalletAdapterNetwork.Devnet
      ? "https://api.devnet.solana.com"
      : "https://api.mainnet-beta.solana.com";
  }, [network]);

  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <SolanaWalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </SolanaWalletProvider>
    </ConnectionProvider>
  );
}
