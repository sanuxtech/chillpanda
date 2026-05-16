// models/AdminLog.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IAdminLog extends Document {
  action: string;
  adminWallet: string;
  details: any;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
}

const AdminLogSchema = new Schema<IAdminLog>({
  action: {
    type: String,
    required: true,
    enum: [
      'withdrawal',
      'stats_update',
      'investment_verification',
      'presale_toggle',
      'admin_login',
      'config_change'
    ]
  },
  adminWallet: {
    type: String,
    required: true,
    index: true
  },
  details: {
    type: Schema.Types.Mixed,
    required: true
  },
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Check if model already exists before creating
const AdminLog = mongoose.models.AdminLog || 
  mongoose.model<IAdminLog>('AdminLog', AdminLogSchema);

export default AdminLog;