import mongoose from "mongoose";
import Investment from "@/models/Investment";
import PresaleStats from "@/models/PresaleStats";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/chilledpanda";

const sampleInvestments = [
  {
    walletAddress: "0x742E4d6c15f4cE4e6E20D8B5310034e77d0eDd99",
    amountUSDT: 1000,
    tokensReceived: 15000,
    paymentMethod: "usdt",
    transactionHash: "0xabc123def456ghi789jkl012mno345pqr678stu901vwx234yz",
    timestamp: new Date("2024-01-15"),
  },
  {
    walletAddress: "0x742E4d6c15f4cE4e6E20D8B5310034e77d0eDd99",
    amountUSDT: 500,
    tokensReceived: 7500,
    paymentMethod: "card",
    timestamp: new Date("2024-01-10"),
  },
];

async function seedDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    // Clear existing data
    await Investment.deleteMany({});
    await PresaleStats.deleteMany({});

    // Insert sample investments
    await Investment.insertMany(sampleInvestments);

    // Create initial presale stats
    await PresaleStats.create({
      totalRaised: 1500,
      totalInvestors: 2,
    });

    console.log("Sample data inserted successfully");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();
