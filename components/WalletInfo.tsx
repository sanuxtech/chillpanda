"use client";

import { useState } from "react";

const PROJECT_WALLET = process.env.NEXT_PUBLIC_WALLET_ADDRESS;

export default function WalletInfo() {
  const [copied, setCopied] = useState(false);

  if (!PROJECT_WALLET) return null;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(PROJECT_WALLET);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
      <h4 className="font-semibold text-blue-800 mb-2">Direct USDT Payments</h4>
      <p className="text-sm text-blue-700 mb-2">
        You can also send USDT directly to our project wallet:
      </p>
      <div className="flex items-center gap-2">
        <code className="flex-1 text-xs bg-white text-gray-600 p-2 rounded border break-all">
          {PROJECT_WALLET}
        </code>
        <button
          type="button"
          onClick={copyToClipboard}
          className={`shrink-0 px-3 py-2 rounded text-sm font-medium transition-colors ${
            copied
              ? "bg-green-600 text-white"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <p className="text-xs text-blue-600 mt-2">
        ⚠️ Include your wallet address in the memo field for automatic token allocation
      </p>
    </div>
  );
}
