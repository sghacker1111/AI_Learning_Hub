import { NextRequest, NextResponse } from "next/server";
import { normalizeDevanagari, nepaliToArabicNumerals, arabicToNepaliNumerals } from "@/lib/nepali/normalizer";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text = "", mode = "normalize" } = body;

    let result = text;
    if (mode === "normalize") {
      result = normalizeDevanagari(text);
    } else if (mode === "to_arabic_numerals") {
      result = nepaliToArabicNumerals(text);
    } else if (mode === "to_nepali_numerals") {
      result = arabicToNepaliNumerals(text);
    }

    return NextResponse.json({ success: true, result, mode });
  } catch (error) {
    console.error("Normalize API error:", error);
    return NextResponse.json({ error: "Failed to normalize text" }, { status: 500 });
  }
}
