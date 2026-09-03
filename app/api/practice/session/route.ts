import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionUser();
    const body = await request.json();
    const { chapter = "Sets", subject = "Compulsory Mathematics" } = body;

    const sessionId = `prac-${Date.now()}`;
    return NextResponse.json({
      success: true,
      persisted: false,
      demo: true,
      sessionId,
      studentId: session?.userId || "demo-student",
      chapter,
      subject,
      startedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Practice session API error:", error);
    return NextResponse.json({ error: "Failed to initialize practice session" }, { status: 500 });
  }
}
