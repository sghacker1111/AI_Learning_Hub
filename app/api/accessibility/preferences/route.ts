import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_ACCESSIBILITY_PREFERENCES } from "@/lib/accessibility/config";

export async function GET() {
  return NextResponse.json({
    success: true,
    persisted: false,
    preferences: DEFAULT_ACCESSIBILITY_PREFERENCES,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    return NextResponse.json({
      success: true,
      persisted: false,
      message: "Preferences were validated for this preview but were not saved server-side.",
      preferences: { ...DEFAULT_ACCESSIBILITY_PREFERENCES, ...body },
    });
  } catch {
    return NextResponse.json({ error: "Invalid accessibility preferences payload." }, { status: 400 });
  }
}
