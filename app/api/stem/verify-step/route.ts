import { NextRequest, NextResponse } from "next/server";
import { verifyMathStep } from "@/lib/stem/verifier";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { problemContext, stepGiven } = body;

    if (!problemContext || !stepGiven) {
      return NextResponse.json(
        { error: "Both 'problemContext' and 'stepGiven' are required." },
        { status: 400 }
      );
    }

    const verification = verifyMathStep(problemContext, stepGiven);
    return NextResponse.json({ success: true, verification });
  } catch (error) {
    console.error("Verify step API error:", error);
    return NextResponse.json({ error: "Failed to verify step." }, { status: 500 });
  }
}
