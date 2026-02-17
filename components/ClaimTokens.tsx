// components/ClaimTokens.tsx - UPDATED VERSION
"use client";

import { useState, useEffect } from "react";
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { sendCPDTokens, sendTestCPDTokens } from "@/lib/solana/cpdtokens";
import { PublicKey } from "@solana/web3.js";

interface ClaimTokensProps {
  claimableAmount: number;
  refreshData: () => void;
}

export default function ClaimTokens({ claimableAmount, refreshData }: ClaimTokensProps) {
  const [isClaiming, setIsClaiming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [claimStatus, setClaimStatus] = useState<'disabled' | 'pending' | 'active'>('disabled');
  const [presaleEndDate, setPresaleEndDate] = useState<Date | null>(null);
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);
  
  const { publicKey, signTransaction, connected } = useWallet();
  const { connection } = useConnection();

  // Check claim status and presale info
  useEffect(() => {
    checkClaimStatus();
  }, [claimableAmount]);

  const checkClaimStatus = async () => {
    try {
      // Fetch presale status from API
      const response = await fetch('/api/investments?claimStatus=true');
      if (response.ok) {
        const data = await response.json();
        
        if (data.presaleProgress?.isActive === false) {
          // Presale ended, check if claiming is active
          setClaimStatus('active');
          
          if (data.presaleProgress?.claimStartDate) {
            const claimStart = new Date(data.presaleProgress.claimStartDate);
            setPresaleEndDate(claimStart);
            
            // Calculate days remaining if claim hasn't started yet
            const now = new Date();
            if (now < claimStart) {
              const diffTime = claimStart.getTime() - now.getTime();
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              setDaysRemaining(diffDays);
              setClaimStatus('pending');
            }
          }
        } else {
          // Presale still active
          setClaimStatus('disabled');
          
          // Get presale end date if available
          if (data.presaleProgress?.estimatedEndDate) {
            const endDate = new Date(data.presaleProgress.estimatedEndDate);
            setPresaleEndDate(endDate);
            
            const now = new Date();
            if (now < endDate) {
              const diffTime = endDate.getTime() - now.getTime();
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              setDaysRemaining(diffDays);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error checking claim status:', error);
    }
  };

  const handleClaim = async () => {
    if (!publicKey || !signTransaction || !connected) {
      setError("Please connect your wallet first.");
      return;
    }

    if (claimableAmount <= 0) {
      setError("No tokens available to claim.");
      return;
    }

    if (claimStatus !== 'active') {
      setError("Token claiming is not active yet.");
      return;
    }

    setIsClaiming(true);
    setError(null);
    setSuccess(false);

    try {
      console.log('🚀 Claiming tokens:', claimableAmount);

      // Check network
      const isDevnet = process.env.NEXT_PUBLIC_SOLANA_NETWORK === 'devnet';
      let claimTxHash = "";

      if (isDevnet) {
        // Test claim on devnet
        claimTxHash = await sendTestCPDTokens(
          connection,
          publicKey,
          claimableAmount,
          signTransaction
        );
      } else {
        // Real claim on mainnet
        const projectWallet = new PublicKey(process.env.NEXT_PUBLIC_PROJECT_WALLET!);
        claimTxHash = await sendCPDTokens(
          connection,
          projectWallet,
          publicKey,
          claimableAmount,
          signTransaction
        );
      }

      // Update database
      const response = await fetch("/api/investments/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: publicKey.toString(),
          amount: claimableAmount,
          transactionHash: claimTxHash,
          network: isDevnet ? "devnet" : "mainnet-beta"
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Claim failed");
      }

      setSuccess(true);
      refreshData();
      
      alert(`✅ Successfully claimed ${claimableAmount.toLocaleString()} CPD tokens!\nTransaction: ${claimTxHash.slice(0, 20)}...`);

    } catch (err: any) {
      console.error('Claim error:', err);
      
      // User-friendly error messages
      let errorMessage = err.message;
      if (errorMessage.includes('Insufficient CPD tokens')) {
        errorMessage = 'Insufficient tokens in project wallet. Please contact support.';
      } else if (errorMessage.includes('User rejected')) {
        errorMessage = 'Transaction was rejected by your wallet.';
      } else if (errorMessage.includes('Transaction was not confirmed')) {
        errorMessage = 'Transaction timed out. Please try again.';
      }
      
      setError(errorMessage || "Claim failed. Please try again.");
    } finally {
      setIsClaiming(false);
    }
  };

  // Render based on claim status
  const renderClaimSection = () => {
    if (claimStatus === 'disabled') {
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
              <span className="font-bold text-blue-600 text-lg">
                {claimableAmount.toLocaleString()} CPD
              </span>
            </div>
            
            {daysRemaining !== null && (
              <div className="flex justify-between items-center bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                <span className="text-yellow-700">Estimated Presale End:</span>
                <span className="font-bold text-yellow-700">
                  {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}
                </span>
              </div>
            )}
            
            <div className="p-3 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-700 mb-1">📅 Distribution Timeline</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Presale Phase: Token allocation only</li>
                <li>• After Presale: Token distribution begins</li>
                <li>• You'll be notified when claiming starts</li>
                <li>• Tokens sent directly to your wallet</li>
              </ul>
            </div>
          </div>
        </div>
      );
    }

    if (claimStatus === 'pending') {
      return (
        <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="font-bold text-yellow-800 text-xl mb-2">🕒 Claiming Starts Soon</h3>
          <p className="text-yellow-700 mb-4">
            You have <strong>{claimableAmount.toLocaleString()} CPD tokens</strong> ready to claim.
            Claiming will begin {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} from now.
          </p>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center bg-white p-3 rounded-lg">
              <span className="text-gray-700">Ready to Claim:</span>
              <span className="font-bold text-yellow-600 text-lg">
                {claimableAmount.toLocaleString()} CPD
              </span>
            </div>
            
            {presaleEndDate && (
              <div className="flex justify-between items-center bg-blue-50 p-3 rounded-lg border border-blue-200">
                <span className="text-blue-700">Claiming Starts:</span>
                <span className="font-bold text-blue-700">
                  {presaleEndDate.toLocaleDateString()}
                </span>
              </div>
            )}
            
            <div className="p-3 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-700 mb-1">🎯 Get Ready to Claim</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Ensure you have SOL for transaction fees</li>
                <li>• Keep your wallet connected</li>
                <li>• Claiming will be available for 30 days</li>
                <li>• Check back on the start date</li>
              </ul>
            </div>
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
            <span className="font-bold text-green-600 text-lg">
              {claimableAmount.toLocaleString()} CPD
            </span>
          </div>
          
          <button
            onClick={handleClaim}
            disabled={isClaiming || !connected}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-3 px-4 rounded-lg font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isClaiming ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Claiming...
              </>
            ) : (
              'Claim Tokens Now'
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
          
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-700 mb-1">⚠️ Important Notes</h4>
            <ul className="text-xs text-blue-600 space-y-1">
              <li>• You need SOL in your wallet for transaction fees (≈0.000005 SOL)</li>
              <li>• Claiming may take a few minutes to process</li>
              <li>• Tokens will be sent to your connected wallet address</li>
              <li>• Keep your transaction hash for reference</li>
            </ul>
          </div>
        </div>
      </div>
    );
  };

  // If no claimable tokens
  if (claimableAmount <= 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="font-bold text-gray-700 text-xl mb-2">Token Distribution</h3>
        <p className="text-gray-600 mb-4">
          No tokens allocated yet. Invest in the presale to receive CPD tokens.
        </p>
        
        <div className="space-y-3">
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-lg border border-purple-200">
            <h4 className="font-semibold text-purple-700 mb-2">💰 How It Works</h4>
            <ul className="text-sm text-purple-600 space-y-1">
              <li>1. Invest USDT in the presale</li>
              <li>2. Receive token allocation immediately</li>
              <li>3. Claim tokens after presale ends</li>
              <li>4. Tokens sent to your Solana wallet</li>
            </ul>
          </div>
          
          <div className="flex items-center text-sm text-gray-500">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            Presale ends when 1 billion CPD tokens are sold
          </div>
        </div>
      </div>
    );
  }

  return renderClaimSection();
}