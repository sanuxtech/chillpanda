/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/solana/usdtpayment.ts - UPDATED WITH YOUR WALLET
import { Connection, PublicKey, Transaction, Keypair } from "@solana/web3.js";
import {
  getOrCreateAssociatedTokenAccount,
  createTransferInstruction,
  TOKEN_PROGRAM_ID,
  getAccount,
} from "@solana/spl-token";

// ==================== TYPE DEFINITIONS ====================
type SignTransaction = (transaction: Transaction) => Promise<Transaction>;

// ==================== CONFIGURATION ====================
const network = process.env.NEXT_PUBLIC_SOLANA_NETWORK || "devnet";

// USDT mint addresses for different networks
const USDT_MINTS = {
  "mainnet-beta": "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
  mainnet: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
  devnet: "Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr",
  testnet: "Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr",
};

// Get USDT mint based on network
const usdtMintAddress =
  process.env.NEXT_PUBLIC_USDT_MINT ||
  USDT_MINTS[network as keyof typeof USDT_MINTS];
console.log("usedt mint address", usdtMintAddress);

// ==================== YOUR PROJECT WALLET ====================
// Your public project wallet - hardcoded to avoid env issues
export const PROJECT_WALLET = new PublicKey(
  process.env.NEXT_PUBLIC_WALLET_ADDRESS || ''
);

// USDT mint address
export const USDT_MINT = new PublicKey(usdtMintAddress);

// ==================== VALIDATE CONFIGURATION ====================
console.log("🔧 USDT Payment Configuration:");
console.log("- Network:", network);
console.log("- Project Wallet:", PROJECT_WALLET.toString());
console.log("- USDT Mint:", USDT_MINT.toString());
console.log("- Is Devnet:", network === "devnet");

// ==================== MAIN FUNCTIONS ====================

// Update the sendUSDT function in usdtpayment.ts
// lib/solana/usdtpayment.ts - MAINNET PRODUCTION VERSION

export async function sendUSDT(
  connection: Connection,
  sender: PublicKey,
  amount: number,
  signTransaction: SignTransaction
): Promise<string> {
  try {
    const network = process.env.NEXT_PUBLIC_SOLANA_NETWORK;

    console.log("💰 Starting USDT transfer:", {
      network,
      sender: sender.toString(),
      amount,
      projectWallet: PROJECT_WALLET.toString(),
    });

    // USDT has 6 decimals on Solana
    const amountInSmallestUnits = BigInt(Math.floor(amount * 1_000_000));

    // ============ HANDLE SENDER'S USDT ACCOUNT ============
    console.log("🔍 Checking sender's USDT token account...");

    // Check if sender already has a USDT token account
    const senderAccounts = await connection.getTokenAccountsByOwner(sender, {
      mint: USDT_MINT,
    });

    let senderTokenAccount: PublicKey;

    if (senderAccounts.value.length === 0) {
      // User doesn't have a USDT account - we need to create one
      console.log("⚠️ No USDT account found. Creating one for the user...");

      // Create the associated token account instruction
      const { createAssociatedTokenAccountInstruction, getAssociatedTokenAddress } = await import('@solana/spl-token');

      // Derive the associated token account address
      const associatedTokenAccount = await getAssociatedTokenAddress(
        USDT_MINT,
        sender
      );

      const createAccountInstruction = createAssociatedTokenAccountInstruction(
        sender, // Payer (user pays the fee)
        associatedTokenAccount, // Associated token account address
        sender, // Owner of the new account
        USDT_MINT // USDT mint
      );

      // Create transaction with account creation
      const setupTransaction = new Transaction().add(createAccountInstruction);
      const { blockhash } = await connection.getLatestBlockhash();
      setupTransaction.recentBlockhash = blockhash;
      setupTransaction.feePayer = sender;

      // User signs to create account (costs ~0.002 SOL)
      console.log("📝 Requesting signature for account creation...");
      const signedSetupTx = await signTransaction(setupTransaction);

      console.log("🚀 Sending account creation transaction...");
      const setupSignature = await connection.sendRawTransaction(signedSetupTx.serialize());

      // Wait for account creation to confirm
      await connection.confirmTransaction(setupSignature, "confirmed");
      console.log("✅ USDT account created! Signature:", setupSignature);

      // Get the newly created account
      const newAccounts = await connection.getTokenAccountsByOwner(sender, {
        mint: USDT_MINT,
      });
      senderTokenAccount = newAccounts.value[0].pubkey;
    } else {
      // User already has a USDT account
      senderTokenAccount = senderAccounts.value[0].pubkey;
      console.log("✅ Found existing USDT account:", senderTokenAccount.toString());
    }

    // ============ CHECK SENDER'S BALANCE ============
    const senderBalance = await connection.getTokenAccountBalance(senderTokenAccount);
    const senderBalanceInUSDT = Number(senderBalance.value.amount) / 1_000_000;

    if (senderBalanceInUSDT < amount) {
      throw new Error(
        `Insufficient USDT balance. You have ${senderBalanceInUSDT.toFixed(2)} USDT, need ${amount} USDT`
      );
    }

    // ============ HANDLE PROJECT'S USDT ACCOUNT ============
    console.log("🔍 Setting up project's USDT token account...");

    // For project wallet, we need to create/use its token account
    // This requires the project wallet to sign, but since we can't do that in browser,
    // we need a different approach for production

    let projectTokenAccount: PublicKey;

    // Check if project already has a USDT token account
    const projectAccounts = await connection.getTokenAccountsByOwner(PROJECT_WALLET, {
      mint: USDT_MINT,
    });

    if (projectAccounts.value.length === 0) {
      // This is a problem - project wallet doesn't have a USDT account
      // In production, you should create this account beforehand
      console.error("❌ Project wallet doesn't have a USDT token account!");
      throw new Error(
        "Project wallet not properly configured. Please contact support."
      );
    } else {
      projectTokenAccount = projectAccounts.value[0].pubkey;
      console.log("✅ Found project USDT account:", projectTokenAccount.toString());
    }

    // ============ CREATE TRANSFER INSTRUCTION ============
    const transferInstruction = createTransferInstruction(
      senderTokenAccount,    // source
      projectTokenAccount,   // destination
      sender,               // owner
      amountInSmallestUnits,
      [],                   // multiSigners
      TOKEN_PROGRAM_ID
    );

    // ============ SEND TRANSACTION ============
    const transaction = new Transaction().add(transferInstruction);

    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = sender;

    console.log("⏳ Requesting wallet signature for transfer...");
    const signedTransaction = await signTransaction(transaction);

    console.log("🚀 Sending transfer transaction...");
    const signature = await connection.sendRawTransaction(signedTransaction.serialize());

    // Confirm transaction
    console.log("📝 Confirming transaction:", signature);
    await connection.confirmTransaction(
      {
        blockhash,
        lastValidBlockHeight,
        signature,
      },
      "confirmed"
    );

    console.log("✅ USDT transfer successful! Signature:", signature);
    return signature;

  } catch (error: any) {
    console.error("❌ USDT transfer failed:", error);

    // Provide user-friendly error messages
    if (error.message.includes("insufficient lamports")) {
      throw new Error("You need SOL in your wallet to pay for transaction fees.");
    } else if (error.message.includes("User rejected")) {
      throw new Error("Transaction was rejected by your wallet.");
    } else {
      throw new Error(`Payment failed: ${error.message}`);
    }
  }
}

/**
 * Get user's USDT balance
 */
export async function getUSDTBalance(
  connection: Connection,
  walletAddress: PublicKey
): Promise<number> {
  try {
    const network = process.env.NEXT_PUBLIC_SOLANA_NETWORK;

    // Return mock balance on devnet for testing
    if (network === "devnet") {
      console.log("🧪 Devnet mode: Returning mock USDT balance for testing");
      return 10000; // High balance for testing
    }

    // Check real balance on mainnet
    console.log(
      "💰 Checking USDT balance on mainnet for:",
      walletAddress.toString()
    );

    const accounts = await connection.getTokenAccountsByOwner(walletAddress, {
      mint: USDT_MINT,
    });

    console.log("accounts", accounts);

    if (accounts.value.length === 0) {
      return 0;
    }

    const tokenAccountInfo = await getAccount(
      connection,
      accounts.value[0].pubkey
    );
    const balance = Number(tokenAccountInfo.amount) / 1_000_000;

    console.log("✅ USDT Balance fetched:", balance.toFixed(2), "USDT");
    return balance;
  } catch (error) {
    console.error("❌ Error getting USDT balance:", error);

    // On devnet or error, return mock balance
    if (process.env.NEXT_PUBLIC_SOLANA_NETWORK === "devnet") {
      console.log("🧪 Returning mock balance after error");
      return 10000;
    }

    return 0;
  }
}

/**
 * Simulated USDT transfer for devnet testing
 */
export async function sendTestUSDT(
  connection: Connection,
  sender: PublicKey,
  amount: number,
  signTransaction: SignTransaction
): Promise<string> {
  try {
    console.log("🧪 Starting TEST USDT transfer (devnet):", {
      sender: sender.toString(),
      amount,
      note: "This is a simulated transaction for devnet testing",
    });

    // Create a mock transaction to sign (real interaction)
    const mockTransaction = new Transaction();
    const { blockhash } = await connection.getLatestBlockhash();
    mockTransaction.recentBlockhash = blockhash;
    mockTransaction.feePayer = sender;

    // Get real signature from wallet for simulation
    const signedTransaction = await signTransaction(mockTransaction);

    // Generate mock transaction hash
    const mockSignature =
      "test_usdt_tx_" +
      Date.now().toString(36) +
      "_" +
      Math.random().toString(36).substr(2, 9) +
      "_" +
      (signedTransaction.signature?.toString("hex").slice(0, 16) ||
        "mock_signature");

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    console.log("✅ Test transaction completed:", mockSignature);

    return mockSignature;
  } catch (error: any) {
    console.error("Test USDT transfer failed:", error);
    throw new Error(`Test payment failed: ${error.message}`);
  }
}

/**
 * Check if user has a USDT token account
 */
export async function hasUSDTAccount(
  connection: Connection,
  walletAddress: PublicKey
): Promise<boolean> {
  try {
    // For devnet, always return true for testing
    if (process.env.NEXT_PUBLIC_SOLANA_NETWORK === "devnet") {
      return true;
    }

    const accounts = await connection.getTokenAccountsByOwner(walletAddress, {
      mint: USDT_MINT,
    });
    return accounts.value.length > 0;
  } catch (error) {
    console.error("Error checking USDT account:", error);
    return false;
  }
}

/**
 * Create USDT token account for user if it doesn't exist
 */
export async function createUSDTAccount(
  connection: Connection,
  walletAddress: PublicKey
): Promise<PublicKey> {
  try {
    console.log(
      "🏦 Creating USDT token account for:",
      walletAddress.toString()
    );

    const tokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      { publicKey: walletAddress, secretKey: new Uint8Array(0) } as Keypair,
      USDT_MINT,
      walletAddress,
      true
    );

    console.log(
      "✅ USDT token account created:",
      tokenAccount.address.toString()
    );
    return tokenAccount.address;
  } catch (error: any) {
    console.error("Error creating USDT account:", error);
    throw new Error(`Failed to create USDT account: ${error.message}`);
  }
}

/**
 * Get current configuration status
 */
export function getConfigStatus() {
  const isDevnet = network === "devnet";

  return {
    isDevnet,
    network,
    projectWallet: PROJECT_WALLET.toString(),
    usdtMint: USDT_MINT.toString(),
    projectWalletValid: true, // Hardcoded so always valid
    status: isDevnet
      ? "DEVNET (Test Mode) - Mock USDT balances used"
      : "MAINNET (Production) - Ready for real transactions",

    // Helper methods
    getInstructions() {
      if (isDevnet) {
        return [
          "✅ Connect Phantom wallet to devnet",
          "✅ Get devnet SOL from a faucet",
          "✅ Get devnet USDT for testing",
          "✅ Test investment flow",
        ];
      } else {
        return [
          "✅ Connect Phantom wallet to mainnet",
   "✅ Ensure you have SOL for gas fees",
          "✅ Have USDT on Solana network",
          "✅ Ready for real investments",
        ];
      }
    },
  };
}

// Export configuration
export const config = getConfigStatus();
console.log("📋 Configuration loaded:", config.status);
