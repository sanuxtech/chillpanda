import dbConnect from "@/lib/db";
import PresaleStats from "@/models/PresaleStats";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    let stats = await PresaleStats.findOne().exec();
    if (!stats) stats = await PresaleStats.create({});
    return NextResponse.json({ success: true, presaleStats: stats });
  } catch (error: any) {
    console.error("Failed to fetch or create presale stats:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch presale stats" },
      { status: 500 }
    );
  }
}
