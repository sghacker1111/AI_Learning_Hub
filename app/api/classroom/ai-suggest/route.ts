import { NextRequest, NextResponse } from "next/server";
import { getAICoTeacherSuggestions } from "@/lib/classroom/co-teacher";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { chapter = "13% VAT" } = body;

    const suggestions = getAICoTeacherSuggestions(chapter);
    return NextResponse.json({ success: true, simulated: true, suggestions });
  } catch (error) {
    console.error("Classroom AI suggest API error:", error);
    return NextResponse.json({ error: "Failed to generate suggestions" }, { status: 500 });
  }
}
