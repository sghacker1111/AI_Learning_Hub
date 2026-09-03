import { NextRequest, NextResponse } from "next/server";
import { RoleCode } from "@prisma/client";
import { analyzeDiagram } from "@/lib/ai/multimodal/diagram";
import { getSessionUser } from "@/lib/auth/session";

const AI_ROLES = new Set<RoleCode>([RoleCode.STUDENT, RoleCode.TEACHER, RoleCode.SUPER_ADMIN]);

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || !AI_ROLES.has(session.role)) {
      return NextResponse.json({ error: "Student, teacher, or Super Admin access is required." }, { status: 403 });
    }
    const body = await request.json();
    const { diagramTypeHint, contextText } = body;
    const validHints = ["VENN_DIAGRAM", "FLUID_EXPERIMENT", "TEXT_ONLY"];
    if (
      (diagramTypeHint !== undefined && !validHints.includes(diagramTypeHint)) ||
      (contextText !== undefined && (typeof contextText !== "string" || contextText.length > 4000))
    ) {
      return NextResponse.json({ error: "Invalid diagram demonstration request." }, { status: 400 });
    }

    const result = analyzeDiagram(diagramTypeHint, contextText);
    return NextResponse.json({ success: true, simulated: true, imageAnalyzed: false, result });
  } catch (error) {
    console.error("Diagram API error:", error);
    return NextResponse.json({ error: "Failed to analyze diagram" }, { status: 500 });
  }
}
