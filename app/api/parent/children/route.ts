import { NextResponse } from "next/server";
import { MOCK_CHILDREN_PROFILES } from "@/lib/parent/child-data";

export async function GET() {
  try {
    return NextResponse.json({ success: true, demo: true, persisted: false, children: MOCK_CHILDREN_PROFILES });
  } catch (error) {
    console.error("Parent children API error:", error);
    return NextResponse.json({ error: "Failed to fetch linked children" }, { status: 500 });
  }
}
