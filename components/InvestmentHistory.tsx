// components/InvestmentHistory.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import ClaimTokens from "./ClaimTokens";

interface Investment {
  _id: string;
  walletAddress: string;
  amountUSDT: number;
  tokensAllocated: number;
  tokensClaimed: number;
  paymentMethod: "usdt" | "card";
  usdtTransactionHash: string;
  cpdTransactionHash?: string;
  claimTransactionHash?: string;
  status: 'pending' | 'paid' | 'claimed' | 'failed';
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
  address: string | null;
  refreshTrigger: number;
}

export default function InvestmentHistory({ address, refreshTrigger }: InvestmentHistoryProps) {
  const [investmentData, setInvestmentData] = useState<InvestmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [claimableAmount, setClaimableAmount] = useState(0);

  const fetchInvestmentHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!address) {
        setInvestmentData(null);
        return;
      }

      const queryParam = `?address=${address}`;
      const response = await fetch(`/api/investments${queryParam}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API Error: ${response.status}`);
      }
      
      const data = await response.json();

      if (data.success && data.investments) {
        setInvestmentData(data);
        
        // Calculate total claimable tokens
        const claimable = data.investments.reduce((sum: number, inv: Investment) => {
          if (inv.status === 'paid' && inv.claimable) {
            return sum + (inv.tokensAllocated - inv.tokensClaimed);
          }
          return sum;
        }, 0);
        
        setClaimableAmount(claimable);
      } else {
        setInvestmentData({
          investments: [],
          totalInvested: 0,
          totalTokensAllocated: 0,
          totalTokensClaimed: 0,
          totalRaised: 0,
          totalInvestors: 0,
          totalCPDSold: 0,
          presaleCap: 0,
          presaleProgress: {
            tokenProgress: 0,
            remainingTokens: 0,
            isCapReached: false,
            isActive: false
          }
        });
      }
    } catch (err: any) {
      console.error("Error fetching investment history:", err);
      setError(err.message || "Failed to load investment history");
      setInvestmentData({
        investments: [],
        totalInvested: 0,
        totalTokensAllocated: 0,
        totalTokensClaimed: 0,
        totalRaised: 0,
        totalInvestors: 0,
        totalCPDSold: 0,
        presaleCap: 0,
        presaleProgress: {
          tokenProgress: 0,
          remainingTokens: 0,
          isCapReached: false,
          isActive: false
        }
      });
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    if (address) {
      fetchInvestmentHistory();
    } else {
      setInvestmentData(null);
      setClaimableAmount(0);
      setLoading(false);
    }
  }, [address, refreshTrigger, fetchInvestmentHistory]);

  if (!address) {
    return (
      <section className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          Your Investment History
        </h2>
        <div className="text-center py-8">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <p className="text-gray-600 mb-2">Connect your wallet to view your investment history</p>
          <p className="text-sm text-gray-500">Your investments and claimable tokens will appear here</p>
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          Your Investment History
        </h2>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading your investments...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          Your Investment History
        </h2>
        <div className="text-center py-8">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-red-600 mb-2">Error loading investments</p>
          <p className="text-sm text-gray-500 mb-4">{error}</p>
          <button
            onClick={fetchInvestmentHistory}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      </section>
    );
  }

  const { investments, totalInvested, totalTokensAllocated, totalTokensClaimed } = investmentData || {};

  return (
    <section className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Your Investment History
        </h2>
        <button
          onClick={fetchInvestmentHistory}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Claim Tokens Section */}
      {claimableAmount > 0 && (
        <div className="mb-8">
          <ClaimTokens 
            claimableAmount={claimableAmount} 
            refreshData={fetchInvestmentHistory}
          />
        </div>
      )}

      {/* Investment Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600">
            ${totalInvested?.toLocaleString() || '0'}
          </div>
          <div className="text-sm text-blue-700 mt-1">Total Invested</div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600">
            {totalTokensAllocated?.toLocaleString() || '0'}
          </div>
          <div className="text-sm text-green-700 mt-1">Tokens Allocated</div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-purple-600">
            {totalTokensClaimed?.toLocaleString() || '0'}
          </div>
          <div className="text-sm text-purple-700 mt-1">Tokens Claimed</div>
        </div>

        <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-gray-600">
            {investments?.length || 0}
          </div>
          <div className="text-sm text-gray-700 mt-1">Total Investments</div>
        </div>
      </div>

      {/* Transactions Table */}
      {investments && investments.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount (USDT)
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tokens Allocated
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tokens Claimed
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Method
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {investments.map((investment, index) => (
                <tr
                  key={investment._id || `investment-${index}`}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {new Date(investment.timestamp).toLocaleDateString()}{" "}
                    {new Date(investment.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    ${investment.amountUSDT.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-blue-600 font-semibold">
                    {investment.tokensAllocated.toLocaleString()} CPD
                  </td>
                  <td className="px-4 py-3 text-sm text-green-600 font-semibold">
                    {investment.tokensClaimed.toLocaleString()} CPD
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        investment.paymentMethod === "usdt"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {investment.paymentMethod === "usdt"
                        ? "USDT"
                        : "Credit Card"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {investment.status === 'claimed' ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        ✅ Claimed
                        {investment.claimDate && (
                          <span className="ml-1 text-xs">
                            ({new Date(investment.claimDate).toLocaleDateString()})
                          </span>
                        )}
                      </span>
                    ) : investment.status === 'paid' ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        {investment.claimable ? '🟢 Ready to Claim' : '⏳ Awaiting Claim'}
                      </span>
                    ) : investment.status === 'pending' ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        ⏳ Processing
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        ❌ Failed
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {investment.usdtTransactionHash &&
                    !investment.usdtTransactionHash.startsWith("test_") &&
                    !investment.usdtTransactionHash.startsWith("card_") ? (
                      <a
                        href={`https://explorer.solana.com/tx/${investment.usdtTransactionHash}?cluster=${investment.network}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline text-xs flex items-center gap-1"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        View TX
                      </a>
                    ) : (
                      <span className="text-gray-400 text-xs">
                        {investment.usdtTransactionHash?.startsWith("test_") 
                          ? "Test Transaction" 
                          : investment.usdtTransactionHash?.startsWith("card_")
                          ? "Card Payment"
                          : "Manual"}
                      </span>
                    )}
                    
                    {/* Claim Transaction Link */}
                    {investment.claimTransactionHash && (
                      <div className="mt-1">
                        <a
                          href={`https://explorer.solana.com/tx/${investment.claimTransactionHash}?cluster=${investment.network}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 hover:text-green-800 underline text-xs flex items-center gap-1"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Claim TX
                        </a>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No investments yet
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by making your first investment in Chillpanda tokens.
          </p>
        </div>
      )}

      {/* Token Claim Information */}
      <div className="mt-8 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg">
        <h3 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Token Claim Information
        </h3>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• Tokens are allocated immediately but claimed after presale ends</li>
          <li>• You can claim tokens when the "Ready to Claim" status appears</li>
          <li>• Claim transactions require a small SOL fee for gas</li>
          <li>• Claimed tokens will appear in your connected wallet</li>
          <li>• Presale ends when 1 billion CPD tokens are sold</li>
        </ul>
      </div>

      {/* Presale Progress (if available) */}
      {investmentData?.presaleProgress && (
        <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Presale Progress:</span>
            <span className="font-medium text-gray-800">
              {investmentData.totalCPDSold?.toLocaleString() || '0'} / {investmentData.presaleCap?.toLocaleString() || '0'} CPD
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(investmentData.presaleProgress.tokenProgress || 0, 100)}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{investmentData.presaleProgress.tokenProgress?.toFixed(1) || '0'}% sold</span>
            <span>{investmentData.presaleProgress.remainingTokens?.toLocaleString() || '0'} CPD remaining</span>
          </div>
        </div>
      )}
    </section>
  );
}