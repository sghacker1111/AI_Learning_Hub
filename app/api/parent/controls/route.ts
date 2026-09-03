import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { dailyStudyLimitMinutes, bedtimeLockEnabled, bedtimeLockHour } = body;

    return NextResponse.json({
      success: false,
      persisted: false,
      message: "Parental controls persistence is not implemented.",
      settings: {
        dailyStudyLimitMinutes,
        bedtimeLockEnabled,
        bedtimeLockHour,
      },
    }, { status: 501 });
  } catch (error) {
    console.error("Parent controls API error:", error);
    return NextResponse.json({ error: "Failed to update controls" }, { status: 500 });
  }
}
