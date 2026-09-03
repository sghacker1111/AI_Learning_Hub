import { NextRequest, NextResponse } from "next/server";
import { generateExamPaper } from "@/lib/exams/generator";
import { RoleCode } from "@prisma/client";
import { getSessionUser } from "@/lib/auth/session";
import { checkSchoolFeature } from "@/lib/billing/entitlements";

const EXAM_GENERATOR_ROLES = new Set<RoleCode>([
  RoleCode.SUPER_ADMIN,
  RoleCode.SCHOOL_ADMIN,
  RoleCode.TEACHER,
]);

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || !EXAM_GENERATOR_ROLES.has(session.role)) {
      return NextResponse.json({ error: "Teacher or administrator access is required." }, { status: 403 });
    }
    const entitlement = await checkSchoolFeature(session, "EXAM_GENERATOR");
    if (!entitlement.allowed) {
      return NextResponse.json(
        { error: entitlement.reason || "The school bundle does not include Exam Generator.", upgradeRequired: true },
        { status: 402 }
      );
    }
    const body = await request.json();
    const { examKey = "ble_class_8_math", customOptions } = body;

    if (typeof examKey !== "string") {
      return NextResponse.json({ error: "Invalid exam key." }, { status: 400 });
    }
    if (customOptions?.title && (typeof customOptions.title !== "string" || customOptions.title.length > 120)) {
      return NextResponse.json({ error: "Exam title must be at most 120 characters." }, { status: 400 });
    }
    if (customOptions?.durationMinutes !== undefined && !Number.isFinite(customOptions.durationMinutes)) {
      return NextResponse.json({ error: "Invalid exam duration." }, { status: 400 });
    }

    const paper = generateExamPaper(examKey, customOptions);
    return NextResponse.json({ success: true, demo: true, officialPaper: false, paper });
  } catch (error) {
    console.error("Exam generate API error:", error);
    const message = error instanceof Error ? error.message : "";
    const status = message.startsWith("Unknown exam key") ? 400 : 500;
    return NextResponse.json({ error: status === 400 ? message : "Failed to generate exam paper" }, { status });
  }
}
