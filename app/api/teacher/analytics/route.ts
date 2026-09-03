import { NextRequest, NextResponse } from "next/server";
import { getClassroomAnalytics } from "@/lib/teacher/analytics";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get("classId") || "class-8a";
    const analytics = getClassroomAnalytics(classId);
    return NextResponse.json({ success: true, demo: true, persisted: false, analytics });
  } catch (error) {
    console.error("Teacher analytics API error:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
