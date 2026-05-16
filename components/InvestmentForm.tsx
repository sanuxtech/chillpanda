"use client";

import { useState, useEffect } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { Transaction } from "@solana/web3.js";
import { sendUSDT, getUSDTBalance } from "@/lib/solana/usdtpayment";
import WalletInfo from "./WalletInfo";

interface InvestmentFormProps {
  onInvestment: () => void;
}

const InvestmentForm = ({ onInvestment }: InvestmentFormProps) => {
  const [amount, setAmount] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("usdt");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [usdtBalance, setUsdtBalance] = useState<number | null>(null);

  const isDevnet = process.env.NEXT_PUBLIC_SOLANA_NETWORK === "devnet";

  const { publicKey, signTransaction, connected } = useWallet();
  const { connection } = useConnection();

  useEffect(() => {
    if (!publicKey || !connected) return;
    let cancelled = false;
    (async () => {
      try {
        const balance = await getUSDTBalance(connection, publicKey);
        if (!cancelled) setUsdtBalance(balance);
      } catch {
        if (!cancelled) setUsdtBalance(isDevnet ? 10000 : null);
      }
    })();
    return () => { cancelled = true; };
  }, [connection, isDevnet, publicKey, connected]);


  const calculateTokens = (usdtAmount: number): number =>
    Math.floor((usdtAmount / 100) * 1500);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    if (!publicKey || !connected || !signTransaction) {
      setError("Please connect your wallet first.");
      setIsSubmitting(false);
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum < 10) {
      setError("Minimum investment amount is 10 USDT");
      setIsSubmitting(false);
      return;
    }

    try {
      let usdtTxHash = "";
      const tokensAllocated = calculateTokens(amountNum);

      if (isDevnet) {
        const mockTransaction = new Transaction();
        const { blockhash } = await connection.getLatestBlockhash();
        mockTransaction.recentBlockhash = blockhash;
        mockTransaction.feePayer = publicKey;
        await signTransaction(mockTransaction);
        usdtTxHash = `devnet_test_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
      } else {
        usdtTxHash = await sendUSDT(connection, publicKey, amountNum, signTransaction);
      }

      const apiData = isDevnet
        ? {
            walletAddress: publicKey.toString(),
            amountUSDT: amountNum,
            paymentMethod,
            usdtTransactionHash: usdtTxHash,
            tokensAllocated,
            network: "devnet",
            status: "paid",
            claimable: false,
          }
        : {
            walletAddress: publicKey.toString(),
            signature: usdtTxHash,
            network: "mainnet-beta",
          };

      const response = await fetch("/api/investments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apiData),
      });

      let responseData: Record<string, unknown> = {};
      try {
        const text = await response.text();
        if (text) responseData = JSON.parse(text);
      } catch {
        // non-JSON response
      }

      if (!response.ok) {
        let msg = "Investment failed";
        if (typeof responseData.error === "string") msg = responseData.error;
        else if (response.status === 500) msg = "Server error. Please try again.";
        else if (response.status === 400) msg = "Invalid data. Please check your input.";
        throw new Error(msg);
      }

      onInvestment();
      setAmount("");
      setSuccessMessage(
        `Investment successful! You have been allocated ${tokensAllocated.toLocaleString()} CPD tokens. Tokens will be claimable after the presale ends.`
      );
    } catch (err: unknown) {
      let msg = err instanceof Error ? err.message : "Investment failed";
      if (msg.includes("User rejected")) msg = "Transaction was rejected by your wallet.";
      else if (msg.includes("wallet transaction failed")) msg = "Wallet transaction failed. Please try again.";
      else if (msg.includes("Server error")) msg = "Server error. Please try again later.";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold mb-4 text-gray-600">
        Invest in Chillpanda Presale
      </h3>

      {isDevnet && (
        <div className="mb-4 bg-yellow-100 text-yellow-800 p-2 rounded text-sm text-center font-medium">
          ⚠️ TEST MODE (Devnet) — No real money involved
        </div>
      )}

      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-semibold text-blue-800 mb-1">🗓️ Token Distribution Timeline</h4>
        <p className="text-sm text-blue-700">
          CPD tokens will be distributed <strong>after the presale ends</strong>. You&apos;ll be able to claim them from your dashboard.
        </p>
        <p className="text-xs text-blue-600 mt-1">
          Rate: 1,500 CPD per $100 USDT • Presale ends when 1B tokens are sold
        </p>
      </div>

      {connected && usdtBalance !== null && paymentMethod === "usdt" && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Your USDT Balance:</span>
            <span className="font-semibold text-gray-800">{usdtBalance.toFixed(2)} USDT</span>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-700 font-medium text-sm">✅ {successMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount (USDT)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => { setAmount(e.target.value); setSuccessMessage(null); }}
            min="10"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            placeholder="Minimum 10 USDT"
            required
          />
          <p className="text-xs text-gray-500 mt-1">USDT must be on Solana network</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Method
          </label>
          <select
            title="Payment Method"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="usdt">USDT (Solana)</option>
            <option value="card" disabled>Credit/Debit Card (Coming Soon)</option>
          </select>
        </div>

        {amount && !isNaN(parseFloat(amount)) && (
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">You invest:</span>
              <span className="font-semibold text-gray-800">{parseFloat(amount).toFixed(2)} USDT</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tokens allocated:</span>
              <span className="font-bold text-blue-600">
                {calculateTokens(parseFloat(amount)).toLocaleString()} CPD
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Tokens will be claimable after presale ends</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || !amount || parseFloat(amount) < 10 || !connected}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-3 px-4 rounded-md font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {!connected ? (
            "Connect Wallet First"
          ) : isSubmitting ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Processing...
            </>
          ) : (
            "Invest Now"
          )}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
          <p className="text-xs text-red-500 mt-1">
            Need USDT on Solana? Bridge from Ethereum or buy on a Solana DEX.
          </p>
        </div>
      )}

      {paymentMethod === "usdt" && !isDevnet && <WalletInfo />}
    </div>
  );
};

export default InvestmentForm;
