import { NextResponse } from "next/server";
import { generateMockStudentMasteryProfile } from "@/lib/mastery/engine";
import { getSessionUser } from "@/lib/auth/session";

export async function GET() {
  try {
    const session = await getSessionUser();
    const profile = generateMockStudentMasteryProfile(session?.userId || "student-demo-1");
    return NextResponse.json({ success: true, demo: true, persisted: false, profile });
  } catch (error) {
    console.error("Student mastery profile API error:", error);
    return NextResponse.json({ error: "Failed to fetch student mastery profile" }, { status: 500 });
  }
}
