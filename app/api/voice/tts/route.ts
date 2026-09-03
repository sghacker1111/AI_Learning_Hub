import { NextRequest, NextResponse } from "next/server";
import { verbalizeMathLatex } from "@/lib/voice/formula-verbalizer";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { latex = "", language = "NEPALI" } = body;
    if (
      typeof latex !== "string" ||
      latex.length > 2000 ||
      (language !== "NEPALI" && language !== "ENGLISH")
    ) {
      return NextResponse.json({ error: "Invalid formula verbalization request." }, { status: 400 });
    }

    const spoken = verbalizeMathLatex(latex, language);

    return NextResponse.json({
      success: true,
      latex,
      spoken,
      language,
      audioGenerated: false,
      verbalizationOnly: true,
    });
  } catch (error) {
    console.error("Voice TTS API error:", error);
    return NextResponse.json({ error: "Failed to verbalize formula" }, { status: 500 });
  }
}
