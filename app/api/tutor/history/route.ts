import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";

export async function GET() {
  try {
    const session = await getSessionUser();

    const sampleSessions = [
      {
        id: "sess-1",
        grade: "Class 8",
        subject: "Compulsory Mathematics",
        chapter: "Unit 1: Sets",
        topic: "Cardinality of Two Overlapping Sets",
        messageCount: 8,
        finalStage: "STAGE_5_MASTERY_CONFIRMED",
        masteryAchieved: "92.5%",
        startedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      },
      {
        id: "sess-2",
        grade: "Class 8",
        subject: "Science & Technology",
        chapter: "Unit 2: Force & Pressure",
        topic: "Archimedes' Principle and Upthrust",
        messageCount: 6,
        finalStage: "STAGE_4_INDEPENDENT_CALCULATION",
        masteryAchieved: "78.0%",
        startedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      },
    ];

    return NextResponse.json({
      sessions: sampleSessions,
      studentId: session?.userId || "demo-student",
      demo: true,
      persisted: false,
    });
  } catch (error) {
    console.error("History API error:", error);
    return NextResponse.json({ error: "Failed to fetch tutor history" }, { status: 500 });
  }
}
