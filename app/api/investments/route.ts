import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Investment from "@/models/Investment";
import PresaleStats from "@/models/PresaleStats";
import { Connection, ParsedInstruction } from "@solana/web3.js";

const securityHeaders = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
};

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { walletAddress, signature, amountUSDT: clientAmount, network } = body;

    if (!walletAddress || !network) {
      return NextResponse.json(
        { success: false, error: "walletAddress and network are required" },
        { status: 400, headers: securityHeaders }
      );
    }

    const isDevnet = network === "devnet";
    let amountUSDT = 0;

    if (isDevnet) {
      if (!clientAmount || clientAmount < 10) {
        return NextResponse.json(
          { success: false, error: "Valid amountUSDT required in devnet" },
          { status: 400, headers: securityHeaders }
        );
      }
      amountUSDT = Number(clientAmount);
    } else {
      if (!signature) {
        return NextResponse.json(
          { success: false, error: "signature is required in mainnet" },
          { status: 400, headers: securityHeaders }
        );
      }

      if (!process.env.NEXT_PUBLIC_SOLANA_RPC) {
        throw new Error("NEXT_PUBLIC_SOLANA_RPC not set");
      }

      const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC, "confirmed");
      const tx = await connection.getParsedTransaction(signature, {
        maxSupportedTransactionVersion: 0,
      });

      if (!tx || tx.meta?.err) {
        return NextResponse.json(
          { success: false, error: "Invalid or failed transaction" },
          { status: 400, headers: securityHeaders }
        );
      }

      const transferInstruction = tx.transaction.message.instructions.find(
        (ix): ix is ParsedInstruction =>
          "parsed" in ix &&
          ix.parsed?.type === "transfer" &&
          ix.parsed?.info?.destination === process.env.NEXT_PUBLIC_WALLET_ADDRESS
      );

      if (!transferInstruction) {
        return NextResponse.json(
          { success: false, error: "Payment not sent to project wallet" },
          { status: 400, headers: securityHeaders }
        );
      }

      amountUSDT = Number(transferInstruction.parsed.info.amount) / 1_000_000;
    }

    const tokensAllocated = Math.floor((amountUSDT / 100) * 1500);

    if (!isDevnet && signature) {
      const existing = await Investment.findOne({ usdtTransactionHash: signature }).exec();
      if (existing) {
        return NextResponse.json(
          { success: false, error: "Duplicate transaction detected" },
          { status: 409, headers: securityHeaders }
        );
      }
    }

    let presaleStats = await PresaleStats.findOne({}).exec();
    if (!presaleStats) {
      presaleStats = new PresaleStats({
        totalRaised: 0,
        totalInvestors: 0,
        totalTokensAllocated: 0,
        totalTokensClaimed: 0,
        presaleCap: 1000000000,
        softCap: 50000000,
        hardCap: 100000000,
        isActive: true,
        presalePhase: "active",
        metadata: {
          rate: 1500,
          minInvestment: 10,
          maxInvestment: 1000000,
          startDate: new Date(),
        },
      });
      await presaleStats.save();
    }

    if (!presaleStats.isActive) {
      return NextResponse.json(
        { success: false, error: "Presale has ended" },
        { status: 403, headers: securityHeaders }
      );
    }

    const remainingTokens = presaleStats.presaleCap - presaleStats.totalTokensAllocated;
    if (tokensAllocated > remainingTokens) {
      return NextResponse.json(
        { success: false, error: "Insufficient tokens remaining" },
        { status: 400, headers: securityHeaders }
      );
    }

    const investment = new Investment({
      walletAddress,
      amountUSDT,
      tokensAllocated,
      tokensClaimed: 0,
      usdtTransactionHash: isDevnet
        ? `dev_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
        : signature,
      paymentMethod: "usdt",
      network,
      status: "paid",
      verified: !isDevnet,
      claimable: false,
      timestamp: new Date(),
    });

    await investment.save();

    presaleStats.totalRaised += amountUSDT;
    presaleStats.totalTokensAllocated += tokensAllocated;
    presaleStats.totalInvestors += 1;
    presaleStats.lastUpdated = new Date();

    if (presaleStats.totalTokensAllocated >= presaleStats.presaleCap) {
      presaleStats.isActive = false;
      presaleStats.presalePhase = "completed";
    }

    await presaleStats.save();

    return NextResponse.json(
      {
        success: true,
        investment: {
          _id: investment._id,
          walletAddress,
          amountUSDT,
          tokensAllocated,
          status: "paid",
          timestamp: investment.timestamp,
        },
      },
      { status: 201, headers: securityHeaders }
    );
  } catch (error: unknown) {
    console.error("POST /api/investments error:", error);

    if (typeof error === "object" && error !== null && "code" in error && (error as { code: unknown }).code === 11000) {
      return NextResponse.json(
        { success: false, error: "Duplicate transaction detected" },
        { status: 409, headers: securityHeaders }
      );
    }

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500, headers: securityHeaders }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const address = searchParams.get("address");
    const limit = parseInt(searchParams.get("limit") || "50");
    const page = parseInt(searchParams.get("page") || "1");

    let investments;
    let totalInvested = 0;
    let totalTokens = 0;
    let totalInvestments = 0;

    if (address) {
      const skip = (page - 1) * limit;

      investments = await Investment.find({ walletAddress: address })
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .select("-__v")
        .lean()
        .exec();

      const walletInvestments = await Investment.find({ walletAddress: address }).lean().exec();
      totalInvested = walletInvestments.reduce((sum: number, inv: { amountUSDT: number }) => sum + inv.amountUSDT, 0);
      totalTokens = walletInvestments.reduce((sum: number, inv: { tokensAllocated: number }) => sum + inv.tokensAllocated, 0);
      totalInvestments = walletInvestments.length;
    } else {
      investments = await Investment.find()
        .sort({ timestamp: -1 })
        .limit(Math.min(limit, 100))
        .select("-__v")
        .lean()
        .exec();

      totalInvestments = await Investment.countDocuments({}).exec();
    }

    let presaleStats = await PresaleStats.findOne({}).exec();
    if (!presaleStats) {
      presaleStats = new PresaleStats({
        totalRaised: 0,
        totalInvestors: 0,
        totalTokensAllocated: 0,
        totalTokensClaimed: 0,
        presaleCap: 1000000000,
        softCap: 50000000,
        isActive: true,
        presalePhase: "active",
      });
      await presaleStats.save();
    }

    const usdProgress =
      presaleStats.softCap > 0 ? (presaleStats.totalRaised / presaleStats.softCap) * 100 : 0;
    const tokenProgress =
      presaleStats.presaleCap > 0
        ? (presaleStats.totalTokensAllocated / presaleStats.presaleCap) * 100
        : 0;
    const remainingTokens = Math.max(0, presaleStats.presaleCap - presaleStats.totalTokensAllocated);

    return NextResponse.json(
      {
        success: true,
        investments: investments || [],
        totalInvested,
        totalTokens,
        totalTokensAllocated: totalTokens,
        totalInvestments,
        totalRaised: presaleStats.totalRaised || 0,
        totalInvestors: presaleStats.totalInvestors || 0,
        totalCPDSold: presaleStats.totalTokensAllocated || 0,
        totalTokensClaimed: presaleStats.totalTokensClaimed || 0,
        presaleCap: presaleStats.presaleCap || 1000000000,
        presaleProgress: {
          usdProgress,
          tokenProgress,
          remainingTokens,
          isCapReached:
            (presaleStats.totalTokensAllocated || 0) >= (presaleStats.presaleCap || 0),
          isActive: presaleStats.isActive !== false,
          presalePhase: presaleStats.presalePhase || "active",
        },
        pagination: {
          page,
          limit,
          total: totalInvestments,
          hasMore: investments.length === limit,
        },
      },
      { headers: securityHeaders }
    );
  } catch (error: unknown) {
    console.error("GET /api/investments error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500, headers: securityHeaders }
    );
  }
}

export async function DELETE() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { success: false, error: "Not allowed in production" },
      { status: 403, headers: securityHeaders }
    );
  }

  try {
    await dbConnect();

    const deleteResult = await Investment.deleteMany({}).exec();
    await PresaleStats.deleteMany({}).exec();

    const newStats = new PresaleStats({
      totalRaised: 0,
      totalInvestors: 0,
      totalTokensAllocated: 0,
      totalTokensClaimed: 0,
      presaleCap: 1000000000,
      softCap: 50000000,
      hardCap: 100000000,
      isActive: true,
      presalePhase: "active",
      metadata: {
        rate: 1500,
        minInvestment: 10,
        maxInvestment: 1000000,
        startDate: new Date(),
      },
    });
    await newStats.save();

    return NextResponse.json(
      {
        success: true,
        message: "Database reset successfully",
        deletedInvestments: deleteResult.deletedCount,
      },
      { headers: securityHeaders }
    );
  } catch (error: unknown) {
    console.error("DELETE /api/investments error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500, headers: securityHeaders }
    );
  }
}
