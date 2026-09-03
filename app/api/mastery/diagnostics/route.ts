import { NextRequest, NextResponse } from "next/server";
import { diagnoseLearningOutcomeGap } from "@/lib/mastery/diagnostics";
import { generateMockStudentMasteryProfile } from "@/lib/mastery/engine";
import { getSessionUser } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionUser();
    const body = await request.json();
    const { targetNodeId } = body;

    if (typeof targetNodeId !== "string" || !targetNodeId || targetNodeId.length > 100) {
      return NextResponse.json({ error: "targetNodeId is required" }, { status: 400 });
    }

    const profile = generateMockStudentMasteryProfile(session?.userId || "student-demo-1");
    const diagnosticResult = diagnoseLearningOutcomeGap(targetNodeId, profile);

    return NextResponse.json({ success: true, demo: true, persisted: false, diagnosticResult });
  } catch (error) {
    console.error("Mastery diagnostic API error:", error);
    return NextResponse.json({ error: "Failed to run diagnostic probe" }, { status: 500 });
  }
}
