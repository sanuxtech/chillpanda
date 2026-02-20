"use client";

import { useState, useEffect } from "react";

export default function PresaleStats() {
  const [stats, setStats] = useState({
    totalRaised: 0,
    totalInvestors: 0,
    totalCPDSold: 0,
    loading: true,
    error: null as string | null,
  });
  const [isMockData, setIsMockData] = useState(false);

  const softCap = 50_000_000; // 50 million USDT soft cap
  const presaleCap = 1_000_000_000; // 1 billion CPD tokens
  const isDevnet = process.env.NEXT_PUBLIC_SOLANA_NETWORK === "devnet";

  // Fetch real presale stats from API
  useEffect(() => {
    fetchPresaleStats();
  }, []);

  const fetchPresaleStats = async () => {
    try {
      setStats((prev) => ({ ...prev, loading: true, error: null }));

      const response = await fetch("/api/investments");

      if (!response.ok) {
        throw new Error("Failed to fetch presale stats");
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error("Invalid API response");
      }

      setStats({
        totalRaised: data.totalRaised || 0,
        totalInvestors: data.totalInvestors || 0,
        totalCPDSold: data.totalCPDSold || 0,
        loading: false,
        error: null,
      });
    } catch (error) {
      if (isDevnet) {
        console.log("🧪 Devnet detected — using mock stats");
        setIsMockData(true);
        setStats({
          totalRaised: 1250000,
          totalInvestors: 342,
          totalCPDSold: 18750000,
          loading: false,
          error: null,
        });
      } else {
        // 🚨 PRODUCTION MUST NEVER SILENTLY MOCK
        setStats((prev) => ({
          ...prev,
          loading: false,
          error: "Failed to load presale stats",
        }));
      }
    }
  };

  const usdProgress = (stats.totalRaised / softCap) * 100;
  const cpdProgress = (stats.totalCPDSold / presaleCap) * 100;
  const isCapReached = stats.totalCPDSold >= presaleCap;

  // Format large numbers with commas
  const formatNumber = (num: number) => {
    return num.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-lg p-6 text-white">
      <h2 className="text-2xl font-bold mb-6">Presale Progress</h2>

      <div className="space-y-6">
        {/* USD Raised Progress */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>Raised: {formatCurrency(stats.totalRaised)}</span>
            <span>Soft Cap: {formatCurrency(softCap)}</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-3">
            <div
              className="bg-green-400 h-3 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(usdProgress, 100)}%` }}
            ></div>
          </div>
          <p className="text-xs text-white/80 mt-1">
            {usdProgress.toFixed(1)}% of soft cap reached
          </p>
        </div>

        {/* CPD Tokens Sold Progress */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>CPD Sold: {formatNumber(stats.totalCPDSold)}</span>
            <span>Presale Cap: {formatNumber(presaleCap)}</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-3">
            <div
              className="bg-yellow-400 h-3 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(cpdProgress, 100)}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-white/80 mt-1">
            <span>{cpdProgress.toFixed(1)}% of presale tokens sold</span>
            <span>
              {isCapReached
                ? "🎉 Presale Complete!"
                : `${formatNumber(
                    presaleCap - stats.totalCPDSold
                  )} CPD remaining`}
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <div className="text-2xl font-bold">
              {stats.loading ? "..." : formatCurrency(stats.totalRaised)}
            </div>
            <div className="text-sm text-white/90">Total Raised (USD)</div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <div className="text-2xl font-bold">
              {stats.loading ? "..." : formatNumber(stats.totalInvestors)}
            </div>
            <div className="text-sm text-white/90">Total Investors</div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <div className="text-2xl font-bold">
              {stats.loading ? "..." : formatNumber(stats.totalCPDSold)}
            </div>
            <div className="text-sm text-white/90">CPD Tokens Sold</div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <div className="text-2xl font-bold">1,500</div>
            <div className="text-sm text-white/90">Tokens per $100</div>
          </div>
        </div>

        {/* Refresh Button */}
        <button
          onClick={fetchPresaleStats}
          disabled={stats.loading}
          className="w-full bg-white/20 hover:bg-white/30 text-white py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {stats.loading ? (
            <>
              <svg
                className="animate-spin h-4 w-4 text-white"
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
              Loading...
            </>
          ) : (
            <>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Refresh Stats
            </>
          )}
        </button>

        {/* Development Mode Indicator */}
        {isMockData && (
          <div className="p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg text-center text-sm">
            <span className="text-yellow-300">
              🧪 Devnet Mode — Using Mock Presale Data
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
