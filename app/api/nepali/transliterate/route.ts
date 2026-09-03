import { NextRequest, NextResponse } from "next/server";
import { transliterateRomanizedToDevanagari } from "@/lib/nepali/transliterator";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text = "" } = body;

    const result = transliterateRomanizedToDevanagari(text);
    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Transliterate API error:", error);
    return NextResponse.json({ error: "Failed to transliterate text" }, { status: 500 });
  }
}
