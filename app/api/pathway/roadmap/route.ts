import { NextResponse } from "next/server";
import { generateSequencedRoadmap } from "@/lib/pathway/sequencer";

export async function GET() {
  try {
    const milestones = generateSequencedRoadmap();
    return NextResponse.json({ success: true, demo: true, persisted: false, milestones });
  } catch (error) {
    console.error("Pathway roadmap API error:", error);
    return NextResponse.json({ error: "Failed to generate roadmap" }, { status: 500 });
  }
}
