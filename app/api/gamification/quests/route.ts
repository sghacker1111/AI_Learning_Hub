import { NextRequest, NextResponse } from "next/server";
import { getCulturalQuests } from "@/lib/gamification/quests";

export async function GET() {
  try {
    const quests = getCulturalQuests();
    return NextResponse.json({ success: true, demo: true, persisted: false, quests });
  } catch (error) {
    console.error("Gamification quests API error:", error);
    return NextResponse.json({ error: "Failed to fetch quests" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { questId, stepNumber } = body;

    return NextResponse.json({
      success: true,
      simulated: true,
      persisted: false,
      message: `Previewed step ${stepNumber} in quest ${questId}; progress was not saved.`,
      xpBonus: 100,
    });
  } catch (error) {
    console.error("Gamification quest step API error:", error);
    return NextResponse.json({ error: "Failed to update quest step" }, { status: 500 });
  }
}
