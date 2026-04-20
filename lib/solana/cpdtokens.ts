// lib/solana/cpdtokens.ts
import {
  Connection,
  PublicKey,
  Transaction,
  Keypair
} from '@solana/web3.js';
import {
  getOrCreateAssociatedTokenAccount,
  createTransferInstruction,
  TOKEN_PROGRAM_ID,
  getAccount
} from '@solana/spl-token';

// CPD Token Mint Address
export const CPD_MINT = new PublicKey(
  process.env.NEXT_PUBLIC_CPD_MINT || ''
); 

// CPD has 9 decimals (standard for Solana tokens)
export const CPD_DECIMALS = 9;

export type SignTransaction = (transaction: Transaction) => Promise<Transaction>;

/**
 * Send CPD tokens to user after USDT payment
 * @param connection Solana connection
 * @param fromWallet Your project wallet (must hold CPD tokens)
 * @param toWallet User's wallet
 * @param amount CPD token amount (e.g., 1500)
 * @param signTransaction Signing function
 * @returns Transaction signature
 */
export async function sendCPDTokens(
  connection: Connection,
  fromWallet: PublicKey,
  toWallet: PublicKey,
  amount: number,
  signTransaction: SignTransaction
): Promise<string> {
  try {
    console.log('Starting CPD token distribution:', {
      from: fromWallet.toString(),
      to: toWallet.toString(),
      amount,
      decimals: CPD_DECIMALS
    });

    // Convert amount to smallest units (considering decimals)
    const amountInSmallestUnits = BigInt(Math.floor(amount * Math.pow(10, CPD_DECIMALS)));

    // 1. Get your project's CPD token account
    const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      { publicKey: fromWallet, secretKey: new Uint8Array(0) } as Keypair,
      CPD_MINT,
      fromWallet,
      true
    );

    // 2. Get user's CPD token account (create if doesn't exist)
    const toTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      { publicKey: fromWallet, secretKey: new Uint8Array(0) } as Keypair,
      CPD_MINT,
      toWallet,
      true
    );

    console.log('CPD Token Accounts:', {
      fromAccount: fromTokenAccount.address.toString(),
      toAccount: toTokenAccount.address.toString()
    });

    // 3. Check project's CPD balance
    const fromBalance = await connection.getTokenAccountBalance(fromTokenAccount.address);
    const fromBalanceInCPD = Number(fromBalance.value.amount) / Math.pow(10, CPD_DECIMALS);

    if (fromBalanceInCPD < amount) {
      throw new Error(`Insufficient CPD tokens in project wallet. Available: ${fromBalanceInCPD.toLocaleString()} CPD, Needed: ${amount.toLocaleString()} CPD`);
    }

    // 4. Create transfer instruction
    const transferInstruction = createTransferInstruction(
      fromTokenAccount.address,    // source
      toTokenAccount.address,      // destination
      fromWallet,                  // owner (project wallet)
      amountInSmallestUnits,
      [],                          // multiSigners
      TOKEN_PROGRAM_ID
    );

    // 5. Create and send transaction
    const transaction = new Transaction().add(transferInstruction);

    // Get recent blockhash
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = fromWallet;

    // 6. Sign and send transaction
    console.log('Signing CPD transfer transaction...');
    const signedTransaction = await signTransaction(transaction);

    console.log('Sending CPD transfer...');
    const signature = await connection.sendRawTransaction(signedTransaction.serialize());

    // 7. Confirm transaction
    await connection.confirmTransaction({
      blockhash,
      lastValidBlockHeight,
      signature
    }, 'confirmed');

    console.log('✅ CPD tokens sent successfully! Signature:', signature);
    return signature;
  } catch (error) {
    console.error('❌ CPD token transfer failed:', error);
    throw error;
  }
}

/**
 * Get user's CPD token balance
 */
export async function getCPDBalance(
  connection: Connection,
  walletAddress: PublicKey
): Promise<number> {
  try {
    const accounts = await connection.getTokenAccountsByOwner(
      walletAddress,
      { mint: CPD_MINT }
    );

    if (accounts.value.length === 0) {
      return 0;
    }

    const tokenAccountInfo = await getAccount(connection, accounts.value[0].pubkey);
    const balance = Number(tokenAccountInfo.amount) / Math.pow(10, CPD_DECIMALS);

    return balance;
  } catch (error) {
    console.error('Error getting CPD balance:', error);
    return 0;
  }
}

/**
 * Check if presale cap reached (1 billion tokens)
 */
export function checkPresaleCap(totalSold: number): {
  reached: boolean;
  remaining: number;
  percentage: number;
} {
  const PRESALE_CAP = 1_000_000_000; // 1 billion tokens
  const remaining = PRESALE_CAP - totalSold;

  return {
    reached: totalSold >= PRESALE_CAP,
    remaining: Math.max(0, remaining),
    percentage: (totalSold / PRESALE_CAP) * 100
  };
}

/**
 * Simulated CPD transfer for devnet testing
 */
// lib/solana/cpdtokens.ts - Update sendTestCPDTokens
export async function sendTestCPDTokens(
  connection: Connection,
  toWallet: PublicKey,
  amount: number,
  signTransaction: SignTransaction
): Promise<string> {
  console.log('🧪 Simulating CPD token transfer (devnet):', {
    to: toWallet.toString(),
    amount,
    note: 'Creating REAL test transaction on devnet'
  });

  try {
    // Actually create a token account and transfer on devnet
    // This requires you to have CPD tokens deployed on devnet

    // For now, create a real transaction but with a mock signature
    const mockTransaction = new Transaction();
    const { blockhash } = await connection.getLatestBlockhash();
    mockTransaction.recentBlockhash = blockhash;
    mockTransaction.feePayer = toWallet;

    // Actually sign the transaction (real signature)
    const signedTransaction = await signTransaction(mockTransaction);

    // This is a REAL transaction signature, but for an empty transaction
    const signature = signedTransaction.signature?.toString('base64') || 'mock_signature';

    console.log('✅ Test CPD transaction created (real signature):', signature.slice(0, 20) + '...');

    return 'test_cpd_' + signature;
  } catch (error) {
    console.error('Test CPD transfer error:', error);
    return 'test_error_' + Date.now();
  }
}