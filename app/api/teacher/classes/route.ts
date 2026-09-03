import { NextResponse } from "next/server";
import { getMockClassSections } from "@/lib/teacher/analytics";

export async function GET() {
  try {
    const classes = getMockClassSections();
    return NextResponse.json({ success: true, demo: true, persisted: false, classes });
  } catch (error) {
    console.error("Teacher classes API error:", error);
    return NextResponse.json({ error: "Failed to fetch classes" }, { status: 500 });
  }
}
