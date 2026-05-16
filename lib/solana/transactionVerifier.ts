import { Connection } from "@solana/web3.js";

export async function verifyTransaction(
  connection: Connection,
  signature: string
): Promise<boolean> {
  try {
    const transaction = await connection.getTransaction(signature, {
      commitment: "confirmed",
      maxSupportedTransactionVersion: 0,
    });

    return !!transaction;
  } catch (error) {
    console.error("Transaction verification failed:", error);
    return false;
  }
}
