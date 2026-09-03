import { NextResponse } from "next/server";
import { getSchoolAnalytics } from "@/lib/school/analytics";

export async function GET() {
  try {
    const analytics = getSchoolAnalytics();
    return NextResponse.json({ success: true, demo: true, persisted: false, analytics });
  } catch (error) {
    console.error("School analytics API error:", error);
    return NextResponse.json({ error: "Failed to fetch school analytics" }, { status: 500 });
  }
}
