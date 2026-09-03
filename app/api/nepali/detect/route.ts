import { NextRequest, NextResponse } from "next/server";
import { analyzeCodeSwitching } from "@/lib/nepali/code-switch";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text = "" } = body;

    const analysis = analyzeCodeSwitching(text);
    return NextResponse.json({ success: true, analysis });
  } catch (error) {
    console.error("Detect API error:", error);
    return NextResponse.json({ error: "Failed to analyze language" }, { status: 500 });
  }
}
