import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Investment from '@/models/Investment';
import PresaleStats from '@/models/PresaleStats';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { walletAddress, amount, transactionHash, network } = body;

    if (!walletAddress || !amount || !transactionHash || !network) {
      return NextResponse.json(
        { success: false, error: 'walletAddress, amount, transactionHash, and network are required' },
        { status: 400 }
      );
    }

    const presaleStats = await PresaleStats.findOne().exec();
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

    const investments = await Investment.find({
      walletAddress,
      status: 'paid',
      claimable: true,
    }).exec();

    if (investments.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No claimable investments found' },
        { status: 404 }
      );
    }

    const totalClaimable = investments.reduce((sum, inv) => {
      return sum + (inv.tokensAllocated - inv.tokensClaimed);
    }, 0);

    if (amount > totalClaimable) {
      return NextResponse.json(
        { success: false, error: `Only ${totalClaimable.toLocaleString()} tokens available to claim` },
        { status: 400 }
      );
    }

    let remainingToClaim = amount;

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
      remainingToClaim -= toClaim;
    }

    presaleStats.totalTokensClaimed += amount;
    await presaleStats.save();

    return NextResponse.json({
      success: true,
      message: `Successfully claimed ${amount.toLocaleString()} CPD tokens`,
      data: {
        claimed: amount,
        remaining: totalClaimable - amount,
        transactionHash,
      },
    });
  } catch (error: unknown) {
    console.error('POST /api/investments/claim error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
