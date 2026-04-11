// models/PresaleStats.ts - UPDATED FOR FRONTEND STATS
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPresaleStats extends Document {
  totalRaised: number;
  totalInvestors: number;
  totalTokensAllocated: number;
  totalTokensClaimed: number;
  totalCPDSold: number;  // Added for frontend compatibility
  presaleCap: number;
  softCap: number;
  hardCap: number;
  lastUpdated: Date;
  isActive: boolean;
  presalePhase: 'active' | 'completed' | 'claiming' | 'ended';
  claimStartDate?: Date;
  claimEndDate?: Date;
  metadata?: {
    rate: number;
    minInvestment: number;
    maxInvestment: number;
    startDate: Date;
    endDate?: Date;
  };
}

const PresaleStatsSchema: Schema = new Schema({
  totalRaised: {
    type: Number,
    default: 0,
    min: 0
  },
  totalInvestors: {
    type: Number,
    default: 0,
    min: 0
  },
  totalTokensAllocated: {
    type: Number,
    default: 0,
    min: 0
  },
  totalTokensClaimed: {
    type: Number,
    default: 0,
    min: 0
  },
  totalCPDSold: {
    type: Number,
    default: 0,
    min: 0
  },
  presaleCap: {
    type: Number,
    default: 1000000000
  },
  softCap: {
    type: Number,
    default: 50000000
  },
  hardCap: {
    type: Number,
    default: 100000000
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  presalePhase: {
    type: String,
    enum: ['active', 'completed', 'claiming', 'ended'],
    default: 'active'
  },
  claimStartDate: {
    type: Date
  },
  claimEndDate: {
    type: Date
  },
  metadata: {
    rate: {
      type: Number,
      default: 1500
    },
    minInvestment: {
      type: Number,
      default: 10
    },
    maxInvestment: {
      type: Number,
      default: 1000000
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: {
      type: Date
    }
  }
}, {
  timestamps: true
});

// Check if model already exists
const PresaleStats: Model<IPresaleStats> = mongoose.models.PresaleStats || 
  mongoose.model<IPresaleStats>('PresaleStats', PresaleStatsSchema);

export default PresaleStats;