// app/api/investments/route.ts - FIXED WITH PROPER SYNTAX
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Investment from '@/models/Investment';
import PresaleStats from '@/models/PresaleStats';

// Security headers
const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
};

export async function POST(request: NextRequest) {
  try {
    console.log('=== INVESTMENT API CALL STARTED ===');
    
    // Connect to database
    console.log('📊 Connecting to database...');
    await dbConnect();
    console.log('✅ Database connected');
    
    const body = await request.json();
    console.log('📥 Request body received:', {
      walletAddress: body.walletAddress?.slice(0, 20) + '...',
      amountUSDT: body.amountUSDT,
      tokensAllocated: body.tokensAllocated,
      network: body.network
    });

    // Basic validation
    if (!body.walletAddress || !body.amountUSDT) {
      console.error('❌ Validation failed: Missing required fields');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: walletAddress and amountUSDT are required' 
        }, 
        { status: 400, headers: securityHeaders }
      );
    }

    const { 
      walletAddress, 
      amountUSDT, 
      paymentMethod = 'usdt', 
      usdtTransactionHash = `dev_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      tokensAllocated = Math.floor((amountUSDT / 100) * 1500),
      network = 'devnet',
      status = 'paid',
      claimable = false
    } = body;

    console.log('🔍 Processing data:', {
      walletAddress: walletAddress.slice(0, 20) + '...',
      amountUSDT,
      tokensAllocated,
      network
    });

    // Check for duplicate transactions
    if (usdtTransactionHash && !usdtTransactionHash.startsWith('dev_') && !usdtTransactionHash.startsWith('test_')) {
      // Using findOne with await
      const existing = await Investment.findOne({ usdtTransactionHash: usdtTransactionHash }).exec();
      if (existing) {
        console.warn('⚠️ Duplicate transaction detected:', usdtTransactionHash);
        return NextResponse.json(
          { 
            success: false, 
            error: 'Duplicate transaction detected' 
          }, 
          { status: 409, headers: securityHeaders }
        );
      }
    }

    // Get or create presale stats
    // Using findOne with exec()
    let presaleStats = await PresaleStats.findOne({}).exec();
    
    if (!presaleStats) {
      console.log('📈 Creating initial presale stats...');
      // Using create with new keyword
      presaleStats = new PresaleStats({
        totalRaised: 0,
        totalInvestors: 0,
        totalTokensAllocated: 0,
        totalTokensClaimed: 0,
        presaleCap: 1000000000,
        softCap: 50000000,
        hardCap: 100000000,
        isActive: true,
        presalePhase: 'active',
        metadata: {
          rate: 1500,
          minInvestment: 10,
          maxInvestment: 1000000,
          startDate: new Date()
        }
      });
      await presaleStats.save();
      console.log('✅ Created initial presale stats');
    }

    // Check if presale is active
    if (!presaleStats.isActive) {
      console.warn('⚠️ Presale is not active');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Presale has ended' 
        }, 
        { status: 403, headers: securityHeaders }
      );
    }

    // Check if investment exceeds remaining tokens
    const remainingTokens = Math.max(0, presaleStats.presaleCap - presaleStats.totalTokensAllocated);
    if (tokensAllocated > remainingTokens) {
      console.warn('⚠️ Insufficient tokens remaining:', { tokensAllocated, remainingTokens });
      return NextResponse.json(
        { 
          success: false, 
          error: `Insufficient tokens remaining. Only ${remainingTokens.toLocaleString()} CPD tokens left` 
        }, 
        { status: 400, headers: securityHeaders }
      );
    }

    // Create investment record
    console.log('💾 Creating investment record...');
    const investmentData = {
      walletAddress,
      amountUSDT,
      tokensAllocated,
      tokensClaimed: 0,
      usdtTransactionHash,
      paymentMethod,
      network,
      status,
      verified: network === 'devnet',
      claimable,
      timestamp: new Date()
    };

    console.log('📝 Investment data:', investmentData);
    
    // Using new keyword and save()
    const investment = new Investment(investmentData);
    await investment.save();
    console.log('✅ Investment created with ID:', investment._id.toString());

    // Update presale stats
    presaleStats.totalRaised += amountUSDT;
    presaleStats.totalTokensAllocated += tokensAllocated;
    presaleStats.totalInvestors += 1;
    presaleStats.lastUpdated = new Date();
    
    // Check if presale cap reached
    if (presaleStats.totalTokensAllocated >= presaleStats.presaleCap) {
      presaleStats.isActive = false;
      presaleStats.presalePhase = 'completed';
      if (presaleStats.metadata) {
        presaleStats.metadata.endDate = new Date();
      }
    }
    
    await presaleStats.save();
    console.log('📊 Presale stats updated:', {
      totalRaised: presaleStats.totalRaised,
      totalTokensAllocated: presaleStats.totalTokensAllocated,
      totalInvestors: presaleStats.totalInvestors
    });

    // Calculate progress
    const usdProgress = (presaleStats.totalRaised / presaleStats.softCap) * 100;
    const tokenProgress = (presaleStats.totalTokensAllocated / presaleStats.presaleCap) * 100;

    console.log('🎉 Investment successfully recorded!');

    return NextResponse.json(
      { 
        success: true, 
        investment: {
          _id: investment._id.toString(),
          walletAddress: investment.walletAddress,
          amountUSDT: investment.amountUSDT,
          tokensAllocated: investment.tokensAllocated,
          status: investment.status,
          timestamp: investment.timestamp,
          usdtTransactionHash: investment.usdtTransactionHash
        },
        presaleStats: {
          totalRaised: presaleStats.totalRaised,
          totalInvestors: presaleStats.totalInvestors,
          totalTokensAllocated: presaleStats.totalTokensAllocated,
          presaleCap: presaleStats.presaleCap,
          isActive: presaleStats.isActive,
          progress: {
            usdProgress,
            tokenProgress,
            remainingTokens: Math.max(0, presaleStats.presaleCap - presaleStats.totalTokensAllocated),
            isCapReached: presaleStats.totalTokensAllocated >= presaleStats.presaleCap,
            isActive: presaleStats.isActive
          }
        },
        message: 'Investment recorded successfully' 
      }, 
      { 
        status: 201, 
        headers: securityHeaders 
      }
    );
  } catch (error: any) {
    console.error('❌ API Error (POST):', error);
    
    // Detailed error logging
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    
    // MongoDB duplicate key error
    if (error.code === 11000) {
      console.error('Duplicate key error');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Duplicate transaction detected'
        }, 
        { status: 409, headers: securityHeaders }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        message: error.message || 'Something went wrong'
      }, 
      { status: 500, headers: securityHeaders }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('📤 GET investments request');
    
    console.log('📊 Connecting to database...');
    await dbConnect();
    console.log('✅ Database connected');
    
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');

    console.log('🔍 Query parameters:', { address: address ? address.slice(0, 20) + '...' : 'all', limit, page });

    let investments;
    let totalInvested = 0;
    let totalTokens = 0;
    let totalInvestments = 0;

    if (address) {
      // Get specific wallet investments with pagination
      const skip = (page - 1) * limit;
      
      // Using find with exec()
      investments = await Investment.find({ walletAddress: address })
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .select('-__v')
        .lean()
        .exec();

      console.log(`📊 Found ${investments.length} investments for wallet`);

      // Calculate wallet stats
      const walletInvestments = await Investment.find({ walletAddress: address }).exec();
      
      totalInvested = walletInvestments.reduce((sum: number, inv: any) => sum + inv.amountUSDT, 0);
      totalTokens = walletInvestments.reduce((sum: number, inv: any) => sum + inv.tokensAllocated, 0);
      totalInvestments = walletInvestments.length;
      
      console.log(`💰 Wallet stats: ${totalInvested} USDT, ${totalTokens} tokens, ${totalInvestments} investments`);
    } else {
      // Get all investments
      investments = await Investment.find()
        .sort({ timestamp: -1 })
        .limit(Math.min(limit, 100))
        .select('-__v')
        .lean()
        .exec();
      
      totalInvestments = await Investment.countDocuments({}).exec();
      console.log(`📊 Total investments in database: ${totalInvestments}`);
    }

    // Get presale stats
    let presaleStats = await PresaleStats.findOne({}).exec();
    
    if (!presaleStats) {
      console.log('📈 No presale stats found, creating default');
      // Create default stats
      presaleStats = new PresaleStats({
        totalRaised: 0,
        totalInvestors: 0,
        totalTokensAllocated: 0,
        totalTokensClaimed: 0,
        presaleCap: 1000000000,
        softCap: 50000000,
        isActive: true,
        presalePhase: 'active'
      });
      await presaleStats.save();
    }

    // Calculate progress
    const usdProgress = presaleStats.softCap > 0 ? (presaleStats.totalRaised / presaleStats.softCap) * 100 : 0;
    const tokenProgress = presaleStats.presaleCap > 0 ? (presaleStats.totalTokensAllocated / presaleStats.presaleCap) * 100 : 0;
    const remainingTokens = Math.max(0, presaleStats.presaleCap - presaleStats.totalTokensAllocated);

    console.log('📊 Presale progress:', {
      usdProgress,
      tokenProgress,
      remainingTokens,
      isActive: presaleStats.isActive
    });

    return NextResponse.json({
      success: true,
      investments: investments || [],
      totalInvested,
      totalTokens,
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
        isCapReached: (presaleStats.totalTokensAllocated || 0) >= (presaleStats.presaleCap || 0),
        isActive: presaleStats.isActive !== false,
        presalePhase: presaleStats.presalePhase || 'active'
      },
      pagination: {
        page,
        limit,
        total: totalInvestments,
        hasMore: investments.length === limit
      }
    }, { headers: securityHeaders });
  } catch (error: any) {
    console.error('❌ API Error (GET):', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        message: error.message || 'Something went wrong'
      }, 
      { status: 500, headers: securityHeaders }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { success: false, error: 'Not allowed in production' }, 
        { status: 403, headers: securityHeaders }
      );
    }

    console.log('🧹 Cleaning database (development mode)...');
    
    await dbConnect();
    
    // Delete all investments
    const deleteResult = await Investment.deleteMany({}).exec();
    console.log(`🗑️ Deleted ${deleteResult.deletedCount} investments`);
    
    // Reset presale stats
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
      presalePhase: 'active',
      metadata: {
        rate: 1500,
        minInvestment: 10,
        maxInvestment: 1000000,
        startDate: new Date()
      }
    });
    await newStats.save();
    
    console.log('✅ Database reset complete');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database reset successfully',
      deletedInvestments: deleteResult.deletedCount
    }, { headers: securityHeaders });
  } catch (error: any) {
    console.error('❌ API Error (DELETE):', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500, headers: securityHeaders });
  }
}