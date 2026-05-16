"use client";

import { useState, useEffect } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { sendCPDTokens, sendTestCPDTokens } from "@/lib/solana/cpdtokens";
import { PublicKey } from "@solana/web3.js";

interface ClaimTokensProps {
  claimableAmount: number;
  refreshData: () => void;
}

type ClaimStatus = "disabled" | "pending" | "active";

export default function ClaimTokens({ claimableAmount, refreshData }: ClaimTokensProps) {
  const [isClaiming, setIsClaiming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [claimStatus, setClaimStatus] = useState<ClaimStatus>("disabled");
  const [presaleEndDate, setPresaleEndDate] = useState<Date | null>(null);
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);

  const { publicKey, signTransaction, connected } = useWallet();
  const { connection } = useConnection();

  const isDevnet = process.env.NEXT_PUBLIC_SOLANA_NETWORK === "devnet";

  useEffect(() => {
    let cancelled = false;
    fetch("/api/investments?claimStatus=true")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data) return;
        const progress = data.presaleProgress;
        if (progress?.isActive === false) {
          setClaimStatus("active");
          if (progress.claimStartDate) {
            const claimStart = new Date(progress.claimStartDate);
            setPresaleEndDate(claimStart);
            const now = new Date();
            if (now < claimStart) {
              setDaysRemaining(Math.ceil((claimStart.getTime() - now.getTime()) / 86400000));
              setClaimStatus("pending");
            }
          }
        } else {
          setClaimStatus("disabled");
          if (progress?.estimatedEndDate) {
            const endDate = new Date(progress.estimatedEndDate);
            setPresaleEndDate(endDate);
            const now = new Date();
            if (now < endDate) {
              setDaysRemaining(Math.ceil((endDate.getTime() - now.getTime()) / 86400000));
            }
          }
        }
      })
      .catch((err) => console.error("Error checking claim status:", err));
    return () => { cancelled = true; };
  }, [claimableAmount]);

  const handleClaim = async () => {
    if (!publicKey || !signTransaction || !connected) {
      setError("Please connect your wallet first.");
      return;
    }
    if (claimableAmount <= 0) {
      setError("No tokens available to claim.");
      return;
    }
    if (claimStatus !== "active") {
      setError("Token claiming is not active yet.");
      return;
    }

    setIsClaiming(true);
    setError(null);
    setSuccess(false);

    try {
      let claimTxHash = "";

      if (isDevnet) {
        claimTxHash = await sendTestCPDTokens(connection, publicKey, claimableAmount, signTransaction);
      } else {
        const projectWalletAddress = process.env.NEXT_PUBLIC_WALLET_ADDRESS;
        if (!projectWalletAddress) {
          throw new Error("Project wallet address not configured.");
        }
        claimTxHash = await sendCPDTokens(
          connection,
          new PublicKey(projectWalletAddress),
          publicKey,
          claimableAmount,
          signTransaction
        );
      }

      const response = await fetch("/api/investments/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: publicKey.toString(),
          amount: claimableAmount,
          transactionHash: claimTxHash,
          network: isDevnet ? "devnet" : "mainnet-beta",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Claim failed");
      }

      setSuccess(true);
      refreshData();
    } catch (err: unknown) {
      console.error("Claim error:", err);
      let msg = err instanceof Error ? err.message : "Claim failed. Please try again.";
      if (msg.includes("Insufficient CPD tokens")) msg = "Insufficient tokens in project wallet. Please contact support.";
      else if (msg.includes("User rejected")) msg = "Transaction was rejected by your wallet.";
      else if (msg.includes("Transaction was not confirmed")) msg = "Transaction timed out. Please try again.";
      setError(msg);
    } finally {
      setIsClaiming(false);
    }
  };

  if (claimableAmount <= 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="font-bold text-gray-700 text-xl mb-2">Token Distribution</h3>
        <p className="text-gray-600 mb-4">
          No tokens allocated yet. Invest in the presale to receive CPD tokens.
        </p>
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-lg border border-purple-200">
          <h4 className="font-semibold text-purple-700 mb-2">How It Works</h4>
          <ol className="text-sm text-purple-600 space-y-1 list-decimal list-inside">
            <li>Invest USDT in the presale</li>
            <li>Receive token allocation immediately</li>
            <li>Claim tokens after presale ends</li>
            <li>Tokens sent to your Solana wallet</li>
          </ol>
        </div>
      </div>
    );
  }

  if (claimStatus === "disabled") {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-bold text-blue-800 text-xl mb-2">⏳ Presale Still Active</h3>
        <p className="text-blue-700 mb-4">
          You have <strong>{claimableAmount.toLocaleString()} CPD tokens</strong> allocated.
          Tokens will become claimable after the presale ends.
        </p>
        <div className="space-y-3">
          <div className="flex justify-between items-center bg-white p-3 rounded-lg">
            <span className="text-gray-700">Allocated Tokens:</span>
            <span className="font-bold text-blue-600 text-lg">{claimableAmount.toLocaleString()} CPD</span>
          </div>
          {daysRemaining !== null && (
            <div className="flex justify-between items-center bg-yellow-50 p-3 rounded-lg border border-yellow-200">
              <span className="text-yellow-700">Estimated Presale End:</span>
              <span className="font-bold text-yellow-700">{daysRemaining} day{daysRemaining !== 1 ? "s" : ""}</span>
            </div>
          )}
          <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-600 space-y-1">
            <p className="font-semibold text-gray-700 mb-1">Distribution Timeline</p>
            <p>• Presale phase: token allocation only</p>
            <p>• After presale: token distribution begins</p>
            <p>• You&apos;ll be notified when claiming starts</p>
          </div>
        </div>
      </div>
    );
  }

  if (claimStatus === "pending") {
    return (
      <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="font-bold text-yellow-800 text-xl mb-2">🕒 Claiming Starts Soon</h3>
        <p className="text-yellow-700 mb-4">
          You have <strong>{claimableAmount.toLocaleString()} CPD tokens</strong> ready to claim.
          Claiming will begin in {daysRemaining} day{daysRemaining !== 1 ? "s" : ""}.
        </p>
        <div className="space-y-3">
          <div className="flex justify-between items-center bg-white p-3 rounded-lg">
            <span className="text-gray-700">Ready to Claim:</span>
            <span className="font-bold text-yellow-600 text-lg">{claimableAmount.toLocaleString()} CPD</span>
          </div>
          {presaleEndDate && (
            <div className="flex justify-between items-center bg-blue-50 p-3 rounded-lg border border-blue-200">
              <span className="text-blue-700">Claiming Starts:</span>
              <span className="font-bold text-blue-700">{presaleEndDate.toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // claimStatus === 'active'
  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
      <h3 className="font-bold text-green-800 text-xl mb-2">🎉 Claim Your Tokens!</h3>
      <p className="text-green-700 mb-4">
        You have <strong>{claimableAmount.toLocaleString()} CPD tokens</strong> available to claim.
      </p>
      <div className="space-y-3">
        <div className="flex justify-between items-center bg-white p-3 rounded-lg">
          <span className="text-gray-700">Available to claim:</span>
          <span className="font-bold text-green-600 text-lg">{claimableAmount.toLocaleString()} CPD</span>
        </div>

        <button
          type="button"
          onClick={handleClaim}
          disabled={isClaiming || !connected}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-3 px-4 rounded-lg font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isClaiming ? (
            <>
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Claiming...
            </>
          ) : (
            "Claim Tokens Now"
          )}
        </button>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}
        {success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700 text-sm font-medium">
              ✅ Tokens claimed successfully! They should appear in your wallet shortly.
            </p>
          </div>
        )}

        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-600 space-y-1">
          <p className="font-semibold text-blue-700 mb-1">Important Notes</p>
          <p>• You need a small amount of SOL for transaction fees</p>
          <p>• Claiming may take a few minutes to process</p>
          <p>• Tokens will be sent to your connected wallet</p>
        </div>
      </div>
    </div>
  );
}
