import { NextRequest, NextResponse } from "next/server";
import { RoleCode } from "@prisma/client";
import { generateProgressiveHint } from "@/lib/ai/tutor/hints";
import { HintTier } from "@/lib/ai/tutor/types";
import { getSessionUser } from "@/lib/auth/session";

const TUTOR_ROLES = new Set<RoleCode>([RoleCode.STUDENT, RoleCode.TEACHER, RoleCode.SUPER_ADMIN]);

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || !TUTOR_ROLES.has(session.role)) {
      return NextResponse.json({ error: "Student, teacher, or Super Admin access is required." }, { status: 403 });
    }
    const body = await request.json();
    const { topic = "Sets", tier = 1 } = body;
    if (typeof topic !== "string" || !topic.trim() || topic.length > 120 || !Number.isInteger(tier)) {
      return NextResponse.json({ error: "Invalid hint request." }, { status: 400 });
    }
    const validatedTier = (tier >= 1 && tier <= 3 ? tier : 1) as HintTier;

    const hint = generateProgressiveHint(topic, validatedTier);
    return NextResponse.json({ success: true, hint });
  } catch (error) {
    console.error("Hint API error:", error);
    return NextResponse.json({ error: "Failed to generate hint" }, { status: 500 });
  }
}
