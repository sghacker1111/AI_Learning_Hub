import { NextRequest, NextResponse } from "next/server";
import { parseVoiceCommand } from "@/lib/voice/commands";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transcript = "" } = body;
    if (typeof transcript !== "string" || transcript.length > 2000) {
      return NextResponse.json({ error: "Transcript must be at most 2000 characters." }, { status: 400 });
    }

    const commandMatch = parseVoiceCommand(transcript);

    return NextResponse.json({
      success: true,
      transcript,
      isCommand: !!commandMatch,
      commandMatch,
      transcribed: false,
      parserOnly: true,
    });
  } catch (error) {
    console.error("Voice STT API error:", error);
    return NextResponse.json({ error: "Failed to transcribe speech" }, { status: 500 });
  }
}
