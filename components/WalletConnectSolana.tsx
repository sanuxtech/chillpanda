"use client";

import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useEffect, useState } from "react";
import {
  useWalletModal,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";

interface WalletConnectSolanaProps {
  onAddressChange: (address: string | null) => void;
}

export const WalletConnectSolana = ({
  onAddressChange,
}: WalletConnectSolanaProps) => {
  const { connect, disconnect, publicKey, connected, connecting, wallet } =
    useWallet();
  const { connection } = useConnection();
  const [balance, setBalance] = useState<number>(0);
  const { setVisible } = useWalletModal();

  console.log("=== WALLET DEBUG ===");
  console.log("Connected:", connected);
  console.log("Public key:", publicKey?.toString());
  console.log("Wallet:", wallet?.adapter.name);
  console.log("====================");

  // Handle wallet connection state
  useEffect(() => {
    if (publicKey && connected) {
      onAddressChange(publicKey.toString());

      // Fetch SOL balance
      const fetchBalance = async () => {
        try {
          const solBalance = await connection.getBalance(publicKey);
          setBalance(solBalance / LAMPORTS_PER_SOL);
        } catch (error) {
          console.error("Error fetching balance:", error);
        }
      };
      fetchBalance();
    } else {
      onAddressChange(null);
      setBalance(0);
    }
  }, [publicKey, connected, connection, onAddressChange]);

  const handleConnect = async () => {
    console.log("Connect button clicked");

    // Check if modal is available
    if (typeof setVisible === "function") {
      setVisible(true);
    } else {
      // Fallback: try to connect directly
      console.warn("WalletModal not available, trying direct connection");
      try {
        await connect();
      } catch (error) {
        console.error("Direct connection failed:", error);
        alert("Please install Phantom wallet from https://phantom.app/");
      }
    }
  };

  // If connected, show wallet info
  if (connected && publicKey) {
    return (
      <div className="flex items-center gap-3">
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-lg shadow-md">
          <div className="text-sm font-medium">
            {publicKey.toString().slice(0, 6)}...
            {publicKey.toString().slice(-4)}
          </div>
          <div className="text-xs opacity-90">{balance.toFixed(4)} SOL</div>
        </div>
        <button
          onClick={() => disconnect()}
          className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors shadow-md"
        >
          Disconnect
        </button>
      </div>
    );
  }

  // If not connected, show connect button
  return (
    <button
      type="button"
      onClick={handleConnect}
      disabled={connecting}
      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
    >
      {connecting ? (
        <>
          <svg
            className="animate-spin h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Connecting...
        </>
      ) : (
        <>
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M21 12.42V12a9 9 0 00-9-9 9 9 0 00-9 9v.42A2 2 0 004 14.42V16a2 2 0 002 2h12a2 2 0 002-2v-1.58a2 2 0 00-1-1.73zM12 2a10 10 0 0110 10v.42A4 4 0 0120 14.42V16a4 4 0 01-4 4H8a4 4 0 01-4-4v-1.58A4 4 0 012 12.42V12a10 10 0 0110-10zm0 12a2 2 0 100 4 2 2 0 000-4z" />
          </svg>
          Connect Wallet
        </>
      )}
    </button>
  );
};
