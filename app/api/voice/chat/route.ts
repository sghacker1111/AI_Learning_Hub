import { NextRequest, NextResponse } from "next/server";
import { generateVoiceSocraticTurn } from "@/lib/voice/tutor-voice";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message = "" } = body;
    if (typeof message !== "string" || !message.trim() || message.length > 2000) {
      return NextResponse.json({ error: "Message must contain between 1 and 2000 characters." }, { status: 400 });
    }

    const responseItem = generateVoiceSocraticTurn(message);

    return NextResponse.json({
      success: true,
      turn: responseItem,
      simulated: true,
      audioGenerated: false,
    });
  } catch (error) {
    console.error("Voice chat API error:", error);
    return NextResponse.json({ error: "Failed to process voice dialogue turn" }, { status: 500 });
  }
}
