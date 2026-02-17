// app/api/investments/claim/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import mongoose from 'mongoose';
const Investment = mongoose.models.Investment;
const PresaleStats = mongoose.models.PresaleStats;
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { walletAddress, amount, transactionHash, network } = body;

    console.log('🎯 Token claim request:', { walletAddress, amount });

    // 1. Get presale stats to check if claiming is active
    const presaleStats = await PresaleStats.findOne();
    if (!presaleStats) {
      return NextResponse.json(
        { success: false, error: 'Presale not found' },
        { status: 404 }
      );
    }

    if (presaleStats.presalePhase !== 'claiming') {
      return NextResponse.json(
        { success: false, error: 'Claiming is not active yet' },
        { status: 403 }
      );
    }

    // 2. Find user's investments
    const investments = await Investment.find({
      walletAddress,
      status: 'paid',
      claimable: true
    });

    if (investments.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No claimable investments found' },
        { status: 404 }
      );
    }

    // 3. Calculate total claimable
    const totalClaimable = investments.reduce((sum, inv) => {
      const remaining = inv.tokensAllocated - inv.tokensClaimed;
      return sum + remaining;
    }, 0);

    if (amount > totalClaimable) {
      return NextResponse.json(
        { success: false, error: `Only ${totalClaimable.toLocaleString()} tokens available to claim` },
        { status: 400 }
      );
    }

    // 4. Process claim (simplified - claims from first investments)
    let remainingToClaim = amount;
    const updatedInvestments = [];

    for (const investment of investments) {
      if (remainingToClaim <= 0) break;

      const remaining = investment.tokensAllocated - investment.tokensClaimed;
      const toClaim = Math.min(remaining, remainingToClaim);

      investment.tokensClaimed += toClaim;
      investment.claimTransactionHash = transactionHash;
      investment.claimDate = new Date();
      
      if (investment.tokensClaimed >= investment.tokensAllocated) {
        investment.status = 'claimed';
      }

      await investment.save();
      updatedInvestments.push(investment);
      remainingToClaim -= toClaim;
    }

    // 5. Update presale stats
    presaleStats.totalTokensClaimed += amount;
    await presaleStats.save();

    console.log('✅ Claim processed:', {
      walletAddress,
      amount,
      remaining: totalClaimable - amount
    });

    return NextResponse.json({
      success: true,
      message: `Successfully claimed ${amount.toLocaleString()} CPD tokens`,
      data: {
        claimed: amount,
        remaining: totalClaimable - amount,
        transactionHash
      }
    });

  } catch (error: any) {
    console.error('❌ Claim error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}