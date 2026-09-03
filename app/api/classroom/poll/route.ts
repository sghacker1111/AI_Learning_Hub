import { NextRequest, NextResponse } from "next/server";
import { getDefaultLivePoll } from "@/lib/classroom/polls";

export async function GET() {
  try {
    const poll = getDefaultLivePoll();
    return NextResponse.json({ success: true, demo: true, connected: false, poll });
  } catch (error) {
    console.error("Classroom poll API error:", error);
    return NextResponse.json({ error: "Failed to fetch poll" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { optionId } = body;

    return NextResponse.json({
      success: true,
      simulated: true,
      persisted: false,
      message: `Previewed a vote for option ${optionId}; no live room state was changed.`,
      totalVotes: 37,
    });
  } catch (error) {
    console.error("Classroom vote API error:", error);
    return NextResponse.json({ error: "Failed to submit vote" }, { status: 500 });
  }
}
