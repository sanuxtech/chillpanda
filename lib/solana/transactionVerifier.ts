import { Connection, PublicKey } from '@solana/web3.js';

export async function verifyTransaction(
  connection: Connection,
  signature: string,
  expectedSender: PublicKey,
  expectedReceiver: PublicKey,
  expectedAmount: number
): Promise<boolean> {
  try {
    const transaction = await connection.getTransaction(signature, {
      commitment: 'confirmed'
    });
    
    if (!transaction) return false;
    
    // Verify transaction details match expected values
    // This is simplified - you'd need to parse the transaction instructions
    console.log('Transaction verification:', {
      signature,
      confirmed: !!transaction
    });
    
    return !!transaction; // Basic check
  } catch (error) {
    console.error('Transaction verification failed:', error);
    return false;
  }
}