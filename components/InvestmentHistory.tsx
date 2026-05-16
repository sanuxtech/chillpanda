"use client";

import { useState, useEffect } from "react";
import ClaimTokens from "./ClaimTokens";
import { useWallet } from "@solana/wallet-adapter-react";

interface Investment {
  _id: string;
  walletAddress: string;
  amountUSDT: number;
  tokensAllocated: number;
  tokensClaimed: number;
  paymentMethod: "usdt" | "card";
  usdtTransactionHash: string;
  claimTransactionHash?: string;
  status: "pending" | "paid" | "claimed" | "failed";
  claimable: boolean;
  network: string;
  timestamp: string;
  claimDate?: string;
}

interface InvestmentData {
  investments: Investment[];
  totalInvested: number;
  totalTokensAllocated: number;
  totalTokensClaimed: number;
  totalRaised: number;
  totalInvestors: number;
  totalCPDSold: number;
  presaleCap: number;
  presaleProgress: {
    tokenProgress: number;
    remainingTokens: number;
    isCapReached: boolean;
    isActive: boolean;
  };
}

interface InvestmentHistoryProps {
  refreshTrigger: number;
}

const EMPTY: InvestmentData = {
  investments: [], totalInvested: 0, totalTokensAllocated: 0, totalTokensClaimed: 0,
  totalRaised: 0, totalInvestors: 0, totalCPDSold: 0, presaleCap: 0,
  presaleProgress: { tokenProgress: 0, remainingTokens: 0, isCapReached: false, isActive: false },
};

function StatusBadge({ inv }: { inv: Investment }) {
  if (inv.status === "claimed") {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        ✅ Claimed{inv.claimDate && <span className="ml-1">({new Date(inv.claimDate).toLocaleDateString('en-US')})</span>}
      </span>
    );
  }
  if (inv.status === "paid") {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        {inv.claimable ? "🟢 Ready to Claim" : "⏳ Awaiting Claim"}
      </span>
    );
  }
  if (inv.status === "pending") {
    return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">⏳ Processing</span>;
  }
  return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">❌ Failed</span>;
}

function TxLink({ hash, network, label, colorClass }: { hash: string; network: string; label: string; colorClass: string }) {
  const isReal = hash && !hash.startsWith("test_") && !hash.startsWith("card_") && !hash.startsWith("dev");
  if (!isReal) {
    return <span className="text-gray-400 text-xs">{hash?.startsWith("dev") ? "Devnet TX" : hash?.startsWith("card_") ? "Card" : "Manual"}</span>;
  }
  return (
    <a href={`https://explorer.solana.com/tx/${hash}?cluster=${network}`} target="_blank" rel="noopener noreferrer"
      className={`${colorClass} underline text-xs flex items-center gap-1`}>
      <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
      </svg>
      {label}
    </a>
  );
}

export default function InvestmentHistory({ refreshTrigger }: InvestmentHistoryProps) {
  // null = "not yet fetched / loading"; EMPTY = "fetched, nothing found"; data = "fetched with results"
  const [investmentData, setInvestmentData] = useState<InvestmentData | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [claimableAmount, setClaimableAmount] = useState(0);
  const [refreshTick, setRefreshTick] = useState(0);

  const { publicKey } = useWallet();
  const address = publicKey?.toString();

  // Derived loading state — no synchronous setState needed in the effect
  const isLoading = !!address && investmentData === null && fetchError === null;

  useEffect(() => {
    if (!address) return;
    let cancelled = false;

    fetch(`/api/investments?address=${encodeURIComponent(address)}`)
      .then((res) => {
        if (!res.ok) return res.json().then((e: { error?: string }) => { throw new Error(e.error ?? `API Error: ${res.status}`); });
        return res.json();
      })
      .then((data: InvestmentData & { success?: boolean }) => {
        if (cancelled) return;
        if (data.success && data.investments) {
          setInvestmentData(data);
          setClaimableAmount(
            data.investments.reduce((sum, inv) =>
              inv.status === "paid" && inv.claimable ? sum + (inv.tokensAllocated - inv.tokensClaimed) : sum, 0)
          );
        } else {
          setInvestmentData(EMPTY);
          setClaimableAmount(0);
        }
        setFetchError(null);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setFetchError(err instanceof Error ? err.message : "Failed to load investment history");
        setInvestmentData(EMPTY);
      });

    return () => { cancelled = true; };
  }, [address, refreshTick, refreshTrigger]);

  // Event handler — React Compiler allows setState here
  const handleRefresh = () => {
    setInvestmentData(null);
    setFetchError(null);
    setRefreshTick((t) => t + 1);
  };

  /* ── No wallet ── */
  if (!address) {
    return (
      <section className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Your Investment History</h2>
        <div className="text-center py-10">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <p className="text-gray-600 font-medium mb-1">Connect your wallet to view your investments</p>
          <p className="text-sm text-gray-500">Your investments and claimable tokens will appear here</p>
        </div>
      </section>
    );
  }

  /* ── Loading ── */
  if (isLoading) {
    return (
      <section className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Your Investment History</h2>
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="text-gray-500 mt-4">Loading your investments…</p>
        </div>
      </section>
    );
  }

  /* ── Error ── */
  if (fetchError) {
    return (
      <section className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Your Investment History</h2>
        <div className="text-center py-10">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-red-600 font-medium mb-2">Error loading investments</p>
          <p className="text-sm text-gray-500 mb-4">{fetchError}</p>
          <button type="button" onClick={handleRefresh} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            Try Again
          </button>
        </div>
      </section>
    );
  }

  const { investments, totalInvested, totalTokensAllocated, totalTokensClaimed } = investmentData ?? EMPTY;

  return (
    <section className="bg-white rounded-xl shadow-lg p-6 mb-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Your Investment History</h2>
        <button type="button" onClick={handleRefresh}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Claim Section */}
      {claimableAmount > 0 && (
        <div className="mb-8">
          <ClaimTokens claimableAmount={claimableAmount} refreshData={handleRefresh} />
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          { value: `$${totalInvested?.toLocaleString() ?? "0"}`, label: "Total Invested", color: "text-blue-600", bg: "from-blue-50 to-blue-100 border-blue-200" },
          { value: totalTokensAllocated?.toLocaleString() ?? "0", label: "Tokens Allocated", color: "text-green-600", bg: "from-green-50 to-green-100 border-green-200" },
          { value: totalTokensClaimed?.toLocaleString() ?? "0", label: "Tokens Claimed", color: "text-purple-600", bg: "from-purple-50 to-purple-100 border-purple-200" },
          { value: String(investments?.length ?? 0), label: "Investments", color: "text-gray-600", bg: "from-gray-50 to-gray-100 border-gray-200" },
        ].map(({ value, label, color, bg }) => (
          <div key={label} className={`bg-gradient-to-r ${bg} border rounded-lg p-3 sm:p-4`}>
            <div className={`text-xl sm:text-2xl font-bold ${color}`}>{value}</div>
            <div className="text-xs sm:text-sm text-gray-600 mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Investments */}
      {investments && investments.length > 0 ? (
        <>
          {/* ── Mobile: cards ── */}
          <div className="md:hidden space-y-4">
            {investments.map((inv, i) => (
              <div key={inv._id || i} className="border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <p className="text-xs text-gray-500">{new Date(inv.timestamp).toLocaleDateString('en-US')}</p>
                    <p className="font-bold text-gray-900 text-lg">${inv.amountUSDT.toLocaleString()} <span className="text-sm font-normal text-gray-500">USDT</span></p>
                  </div>
                  <StatusBadge inv={inv} />
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-wide">Allocated</p>
                    <p className="font-semibold text-blue-600">{inv.tokensAllocated.toLocaleString()} CPD</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-wide">Claimed</p>
                    <p className="font-semibold text-green-600">{inv.tokensClaimed.toLocaleString()} CPD</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 pt-1 border-t border-gray-100">
                  <TxLink hash={inv.usdtTransactionHash} network={inv.network} label="View TX" colorClass="text-blue-600 hover:text-blue-800" />
                  {inv.claimTransactionHash && (
                    <TxLink hash={inv.claimTransactionHash} network={inv.network} label="Claim TX" colorClass="text-green-600 hover:text-green-800" />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* ── Desktop: table ── */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  {["Date", "Amount (USDT)", "Tokens Allocated", "Tokens Claimed", "Method", "Status", "Transaction"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {investments.map((inv, i) => (
                  <tr key={inv._id || i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                      {new Date(inv.timestamp).toLocaleDateString('en-US')}{" "}
                      <span className="text-gray-500 text-xs">{new Date(inv.timestamp).toLocaleTimeString('en-US', { hour: "2-digit", minute: "2-digit" })}</span>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">${inv.amountUSDT.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-blue-600">{inv.tokensAllocated.toLocaleString()} CPD</td>
                    <td className="px-4 py-3 text-sm font-semibold text-green-600">{inv.tokensClaimed.toLocaleString()} CPD</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${inv.paymentMethod === "usdt" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"}`}>
                        {inv.paymentMethod === "usdt" ? "USDT" : "Card"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm"><StatusBadge inv={inv} /></td>
                    <td className="px-4 py-3 text-sm space-y-1">
                      <TxLink hash={inv.usdtTransactionHash} network={inv.network} label="View TX" colorClass="text-blue-600 hover:text-blue-800" />
                      {inv.claimTransactionHash && (
                        <TxLink hash={inv.claimTransactionHash} network={inv.network} label="Claim TX" colorClass="text-green-600 hover:text-green-800" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="text-center py-10 border border-gray-100 rounded-lg">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No investments yet</h3>
          <p className="mt-1 text-sm text-gray-500">Make your first investment above to get started.</p>
        </div>
      )}

      {/* Info Box */}
      <div className="mt-8 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg">
        <h3 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Token Claim Information
        </h3>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• Tokens are allocated immediately but claimed after the presale ends</li>
          <li>• Claim transactions require a small SOL fee for gas</li>
          <li>• Claimed tokens will appear in your connected wallet</li>
          <li>• Presale ends when 1 billion CPD tokens are sold</li>
        </ul>
      </div>

      {/* Presale Progress */}
      {investmentData?.presaleProgress && (
        <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Presale Progress:</span>
            <span className="font-medium text-gray-800">
              {investmentData.totalCPDSold?.toLocaleString() ?? "0"} / {investmentData.presaleCap?.toLocaleString() ?? "0"} CPD
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(investmentData.presaleProgress.tokenProgress ?? 0, 100)}%` }} />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{investmentData.presaleProgress.tokenProgress?.toFixed(1) ?? "0"}% sold</span>
            <span>{investmentData.presaleProgress.remainingTokens?.toLocaleString() ?? "0"} CPD remaining</span>
          </div>
        </div>
      )}
    </section>
  );
}
