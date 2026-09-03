import { NextRequest, NextResponse } from "next/server";
import { generateCDCLessonPlan } from "@/lib/teacher/lesson-plan-generator";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subject = "Compulsory Mathematics", chapter = "13% VAT", durationMinutes = 45 } = body;

    const lessonPlan = generateCDCLessonPlan(subject, chapter, durationMinutes);
    return NextResponse.json({ success: true, demo: true, persisted: false, lessonPlan });
  } catch (error) {
    console.error("Teacher lesson plan API error:", error);
    return NextResponse.json({ error: "Failed to generate lesson plan" }, { status: 500 });
  }
}
