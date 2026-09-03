import { NextResponse } from "next/server";
import { DEFAULT_SCHOOL_PROFILE } from "@/lib/school/iemis";

export async function GET() {
  try {
    return NextResponse.json({ success: true, demo: true, persisted: false, school: DEFAULT_SCHOOL_PROFILE });
  } catch (error) {
    console.error("School profile API error:", error);
    return NextResponse.json({ error: "Failed to fetch school profile" }, { status: 500 });
  }
}
