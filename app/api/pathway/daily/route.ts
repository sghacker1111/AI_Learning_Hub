import { NextResponse } from "next/server";
import { generatePersonalizedLearningPlan } from "@/lib/pathway/recommendations";
import { getSessionUser } from "@/lib/auth/session";

export async function GET() {
  try {
    const session = await getSessionUser();
    const plan = generatePersonalizedLearningPlan(session?.userId || "student-demo-1");
    return NextResponse.json({ success: true, demo: true, persisted: false, plan });
  } catch (error) {
    console.error("Pathway daily API error:", error);
    return NextResponse.json({ error: "Failed to generate daily learning plan" }, { status: 500 });
  }
}
