import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { itemId, xpReward = 50 } = body;

    return NextResponse.json({
      success: true,
      simulated: true,
      persisted: false,
      message: `Previewed completion of item ${itemId}; progress was not saved.`,
      xpEarned: xpReward,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Pathway complete API error:", error);
    return NextResponse.json({ error: "Failed to mark item as completed" }, { status: 500 });
  }
}
