import { NextRequest, NextResponse } from "next/server";
import { getLevelForXp } from "@/lib/gamification/levels";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { xpAmount = 50, activityType = "PRACTICE" } = body;

    const newTotalXp = 1450 + xpAmount;
    const levelInfo = getLevelForXp(newTotalXp);

    return NextResponse.json({
      success: true,
      simulated: true,
      persisted: false,
      xpAwarded: xpAmount,
      activityType,
      newTotalXp,
      currentLevel: levelInfo.currentLevel,
      levelUp: newTotalXp >= 2000,
    });
  } catch (error) {
    console.error("Gamification award XP API error:", error);
    return NextResponse.json({ error: "Failed to award XP" }, { status: 500 });
  }
}
