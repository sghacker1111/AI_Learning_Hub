import { NextResponse } from "next/server";
import { getStudentGamificationProfile } from "@/lib/gamification/engine";
import { getSessionUser } from "@/lib/auth/session";

export async function GET() {
  try {
    const session = await getSessionUser();
    const profile = getStudentGamificationProfile(session?.userId || "student-demo-1");
    return NextResponse.json({ success: true, demo: true, persisted: false, profile });
  } catch (error) {
    console.error("Gamification profile API error:", error);
    return NextResponse.json({ error: "Failed to fetch gamification profile" }, { status: 500 });
  }
}
