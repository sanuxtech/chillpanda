"use client";

import { useState, useEffect } from "react";

interface StatsState {
  totalRaised: number;
  totalInvestors: number;
  totalCPDSold: number;
  loading: boolean;
  error: string | null;
}

const SOFT_CAP = 50_000_000;
const PRESALE_CAP = 1_000_000_000;

export default function PresaleStats() {
  const [stats, setStats] = useState<StatsState>({
    totalRaised: 0,
    totalInvestors: 0,
    totalCPDSold: 0,
    loading: true,
    error: null,
  });
  const [isMockData, setIsMockData] = useState(false);
  const [refreshTick, setRefreshTick] = useState(0);

  const isDevnet = process.env.NEXT_PUBLIC_SOLANA_NETWORK === "devnet";

  useEffect(() => {
    let cancelled = false;
    fetch("/api/investments")
      .then((res) => {
        if (!res.ok) throw new Error("fetch failed");
        return res.json();
      })
      .then((data: Record<string, unknown>) => {
        if (cancelled) return;
        if (!data.success) throw new Error("invalid response");
        setStats({
          totalRaised: (data.totalRaised as number) || 0,
          totalInvestors: (data.totalInvestors as number) || 0,
          totalCPDSold: (data.totalCPDSold as number) || 0,
          loading: false,
          error: null,
        });
      })
      .catch(() => {
        if (cancelled) return;
        if (isDevnet) {
          setIsMockData(true);
          setStats({ totalRaised: 1_250_000, totalInvestors: 342, totalCPDSold: 18_750_000, loading: false, error: null });
        } else {
          setStats((prev) => ({ ...prev, loading: false, error: "Failed to load presale stats" }));
        }
      });
    return () => { cancelled = true; };
  }, [refreshTick, isDevnet]);

  // Event handler — setState here is allowed by the React Compiler
  const handleRefresh = () => {
    setStats((prev) => ({ ...prev, loading: true, error: null }));
    setRefreshTick((t) => t + 1);
  };

  const usdProgress = (stats.totalRaised / SOFT_CAP) * 100;
  const cpdProgress = (stats.totalCPDSold / PRESALE_CAP) * 100;
  const isCapReached = stats.totalCPDSold >= PRESALE_CAP;

  const fmt = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 0 });
  const fmtUSD = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

  return (
    <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-lg p-6 text-white">
      <h2 className="text-2xl font-bold mb-6">Presale Progress</h2>

      <div className="space-y-6">
        {/* USD Raised */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>Raised: {fmtUSD(stats.totalRaised)}</span>
            <span>Soft Cap: {fmtUSD(SOFT_CAP)}</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-3">
            <div
              className="bg-green-400 h-3 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(usdProgress, 100)}%` }}
            />
          </div>
          <p className="text-xs text-white/80 mt-1">{usdProgress.toFixed(1)}% of soft cap reached</p>
        </div>

        {/* CPD Tokens Sold */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>CPD Sold: {fmt(stats.totalCPDSold)}</span>
            <span>Presale Cap: {fmt(PRESALE_CAP)}</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-3">
            <div
              className="bg-yellow-400 h-3 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(cpdProgress, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-white/80 mt-1">
            <span>{cpdProgress.toFixed(1)}% of presale tokens sold</span>
            <span>
              {isCapReached ? "🎉 Presale Complete!" : `${fmt(PRESALE_CAP - stats.totalCPDSold)} CPD remaining`}
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 text-center">
          {[
            { value: stats.loading ? "..." : fmtUSD(stats.totalRaised), label: "Total Raised (USD)" },
            { value: stats.loading ? "..." : fmt(stats.totalInvestors), label: "Total Investors" },
            { value: stats.loading ? "..." : fmt(stats.totalCPDSold), label: "CPD Tokens Sold" },
            { value: "1,500", label: "Tokens per $100" },
          ].map(({ value, label }) => (
            <div key={label} className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="text-2xl font-bold">{value}</div>
              <div className="text-sm text-white/90">{label}</div>
            </div>
          ))}
        </div>

        {stats.error && (
          <p className="text-red-300 text-sm text-center">{stats.error}</p>
        )}

        <button
          type="button"
          onClick={handleRefresh}
          disabled={stats.loading}
          className="w-full bg-white/20 hover:bg-white/30 text-white py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {stats.loading ? (
            <>
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Loading...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh Stats
            </>
          )}
        </button>

        {isMockData && (
          <div className="p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg text-center text-sm">
            <span className="text-yellow-300">🧪 Devnet Mode — Using Mock Presale Data</span>
          </div>
        )}
      </div>
    </div>
  );
}
