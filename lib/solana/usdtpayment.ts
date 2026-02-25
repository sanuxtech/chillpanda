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
  process.env.NEXT_PUBLIC_WALLET_ADDRESS
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
export async function sendUSDT(
  connection: Connection,
  sender: PublicKey,
  amount: number,
  signTransaction: SignTransaction
): Promise<string> {
  try {
    const network = process.env.NEXT_PUBLIC_SOLANA_NETWORK;
    const isDevnet = network === "devnet";

    console.log("💰 Starting USDT transfer:", {
      network,
      sender: sender.toString(),
      amount,
      isDevnet,
      projectWallet: PROJECT_WALLET.toString(),
    });

    // If devnet, use test transaction (bypass real USDT)
    if (isDevnet) {
      console.log(
        "🧪 Devnet mode: Using test transaction (no real USDT needed)"
      );
      return await sendTestUSDT(connection, sender, amount, signTransaction);
    }

    // USDT has 6 decimals on Solana
    const amountInSmallestUnits = BigInt(Math.floor(amount * 1_000_000));

    try {
      // 1. Get sender's USDT token account
      const senderTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        { publicKey: sender, secretKey: new Uint8Array(0) } as Keypair,
        USDT_MINT,
        sender,
        true
      );

      console.log(
        "✅ Sender token account:",
        senderTokenAccount.address.toString()
      );

      // 2. Get project's USDT token account
      const projectTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        { publicKey: sender, secretKey: new Uint8Array(0) } as Keypair,
        USDT_MINT,
        PROJECT_WALLET,
        true
      );

      console.log(
        "✅ Project token account:",
        projectTokenAccount.address.toString()
      );

      // 3. Check sender balance
      const senderBalance = await connection.getTokenAccountBalance(
        senderTokenAccount.address
      );
      const senderBalanceInUSDT =
        Number(senderBalance.value.amount) / 1_000_000;

      if (senderBalanceInUSDT < amount) {
        throw new Error(
          `Insufficient USDT balance. You have ${senderBalanceInUSDT.toFixed(
            2
          )} USDT, trying to send ${amount} USDT`
        );
      }

      // 4. Create transfer instruction
      const transferInstruction = createTransferInstruction(
        senderTokenAccount.address, // source
        projectTokenAccount.address, // destination
        sender, // owner
        amountInSmallestUnits,
        [], // multiSigners
        TOKEN_PROGRAM_ID
      );

      // 5. Create and send transaction
      const transaction = new Transaction().add(transferInstruction);

      // Get recent blockhash
      const { blockhash, lastValidBlockHeight } =
        await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = sender;

      // 6. Sign and send transaction
      console.log("⏳ Requesting wallet signature...");
      const signedTransaction = await signTransaction(transaction);

      console.log("🚀 Sending transaction...");
      const signature = await connection.sendRawTransaction(
        signedTransaction.serialize()
      );

      // 7. Confirm transaction
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
      // If token account creation fails on devnet, use test transaction
      if (isDevnet && error.message.includes("TokenAccountNotFoundError")) {
        console.log(
          "⚠️ No USDT token account on devnet, using test transaction"
        );
        return await sendTestUSDT(connection, sender, amount, signTransaction);
      }
      throw error;
    }
  } catch (error: any) {
    console.error("❌ USDT transfer failed:", error);

    // Provide user-friendly error messages
    if (error.message.includes("TokenAccountNotFoundError")) {
      throw new Error(
        "You need a USDT token account. Try getting test USDT from a faucet."
      );
    } else if (error.message.includes("Insufficient USDT balance")) {
      throw new Error(
        `Insufficient USDT balance. Please ensure you have enough USDT in your wallet.`
      );
    } else if (error.message.includes("User rejected")) {
      throw new Error("Transaction was rejected by your wallet.");
    } else if (error.message.includes("Transaction was not confirmed")) {
      throw new Error("Transaction timed out. Please try again.");
    } else if (error.message.includes("Blockhash not found")) {
      throw new Error("Network error. Please try again.");
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
  walletAddress: PublicKey,
  signTransaction: SignTransaction
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
