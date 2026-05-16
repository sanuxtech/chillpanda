import { z } from 'zod';

export const investmentSchema = z.object({
  walletAddress: z.string().regex(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/, 'Invalid Solana address'),
  amountUSDT: z.number().min(10).max(1000000),
  paymentMethod: z.enum(['usdt', 'card']),
  usdtTransactionHash: z.string().min(10).max(100),
  cpdTransactionHash: z.string().min(10).max(100),
  tokensReceived: z.number().min(0),
  network: z.enum(['devnet', 'mainnet-beta'])
});

export const walletQuerySchema = z.object({
  address: z.string().regex(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/).optional()
});