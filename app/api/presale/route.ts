import dbConnect from "@/lib/db";
import PresaleStats from "@/models/PresaleStats";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  await dbConnect();
  try {
    let stats = await PresaleStats.findOne();
    if (!stats) stats = await PresaleStats.create({});
    return NextResponse.json({ presaleStats: stats });
  } catch (error) {
    console.error("Failed to fetch or create presale stats:", error);
  }
}
