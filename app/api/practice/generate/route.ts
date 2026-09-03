import { NextRequest, NextResponse } from "next/server";
import { generateAdaptiveQuestion } from "@/lib/practice/generator";
import { CognitiveLevel } from "@/lib/practice/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subject = "Compulsory Mathematics", chapter = "Sets", level = "LEVEL_2_UNDERSTANDING" } = body;

    const levels: CognitiveLevel[] = [
      "LEVEL_1_KNOWLEDGE",
      "LEVEL_2_UNDERSTANDING",
      "LEVEL_3_APPLICATION",
      "LEVEL_4_HIGHER_ABILITY",
    ];
    if (typeof subject !== "string" || typeof chapter !== "string" || subject.length > 100 || chapter.length > 100) {
      return NextResponse.json({ error: "Invalid subject or chapter." }, { status: 400 });
    }
    if (!levels.includes(level as CognitiveLevel)) {
      return NextResponse.json({ error: "Invalid cognitive level." }, { status: 400 });
    }

    const question = generateAdaptiveQuestion(subject, chapter, level as CognitiveLevel);
    return NextResponse.json({ success: true, demo: true, question });
  } catch (error) {
    console.error("Practice generate API error:", error);
    return NextResponse.json({ error: "Failed to generate practice question" }, { status: 500 });
  }
}
