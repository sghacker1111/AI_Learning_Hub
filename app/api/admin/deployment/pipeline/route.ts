import { NextResponse } from "next/server";
import { getPipelineStages } from "@/lib/deployment/pipeline";

export async function GET() {
  try {
    const stages = getPipelineStages();
    return NextResponse.json({ success: true, simulated: true, executed: false, stages });
  } catch (error) {
    console.error("Pipeline API error:", error);
    return NextResponse.json({ error: "Failed to fetch pipeline stages" }, { status: 500 });
  }
}
