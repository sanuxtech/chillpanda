// models/Investment.ts - CORRECTED VERSION
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IInvestment extends Document {
  walletAddress: string;
  amountUSDT: number;
  tokensAllocated: number;
  tokensClaimed: number;
  usdtTransactionHash: string;
  paymentMethod: 'usdt' | 'card';
  network: 'devnet' | 'mainnet-beta';
  status: 'pending' | 'paid' | 'claimed' | 'failed';
  verified: boolean;
  claimable: boolean;
  claimTransactionHash?: string;
  claimDate?: Date;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

const InvestmentSchema: Schema = new Schema({
  walletAddress: {
    type: String,
    required: true,
    index: true
  },
  amountUSDT: {
    type: Number,
    required: true,
    min: [10, 'Minimum investment is 10 USDT']
  },
  tokensAllocated: {
    type: Number,
    required: true,
    min: 0
  },
  tokensClaimed: {
    type: Number,
    default: 0,
    min: 0
  },
  usdtTransactionHash: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  paymentMethod: {
    type: String,
    enum: ['usdt', 'card'],
    default: 'usdt'
  },
  network: {
    type: String,
    enum: ['devnet', 'mainnet-beta'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'claimed', 'failed'],
    default: 'pending'
  },
  verified: {
    type: Boolean,
    default: false
  },
  claimable: {
    type: Boolean,
    default: false
  },
  claimTransactionHash: {
    type: String,
    sparse: true
  },
  claimDate: {
    type: Date
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Check if model already exists to prevent OverwriteModelError
const Investment: Model<IInvestment> = mongoose.models.Investment ||
  mongoose.model<IInvestment>('Investment', InvestmentSchema);

export default Investment;