"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal, WalletIcon } from "@solana/wallet-adapter-react-ui";

export const CustomWalletButton = () => {
  const { disconnect, publicKey, connected, connecting, wallets } = useWallet();
  const { setVisible } = useWalletModal();

  const phantomWallet = wallets.find((w) => w.adapter.name === "Phantom") ?? null;

  if (connected && publicKey) {
    return (
      <div className="flex items-center gap-3">
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-lg shadow-md">
          <div className="text-sm font-medium flex items-center gap-2">
            {phantomWallet && <WalletIcon wallet={phantomWallet} className="w-4 h-4" />}
            {publicKey.toString().slice(0, 4)}...
            {publicKey.toString().slice(-4)}
          </div>
        </div>
        <button
          type="button"
          onClick={disconnect}
          className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors shadow-md"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setVisible(true)}
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
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
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
