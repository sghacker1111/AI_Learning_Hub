import { NextRequest, NextResponse } from "next/server";
import { RoleCode } from "@prisma/client";
import { generateCompletion } from "@/lib/ai/router";
import { CompletionOptions } from "@/lib/ai/types";
import { getSessionUser } from "@/lib/auth/session";
import { completionRequestSchema } from "@/lib/ai/request-validation";
import { consumeFixedWindowRateLimit } from "@/lib/ai/rate-limit";
import { checkSchoolFeature } from "@/lib/billing/entitlements";

const AI_ROLES = new Set<RoleCode>([RoleCode.STUDENT, RoleCode.TEACHER, RoleCode.SUPER_ADMIN]);

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || !AI_ROLES.has(session.role)) {
      return NextResponse.json({ error: "Student, teacher, or Super Admin access is required." }, { status: 403 });
    }
    const entitlement = await checkSchoolFeature(session, "AI_TUTOR");
    if (!entitlement.allowed) {
      return NextResponse.json({ error: entitlement.reason, upgradeRequired: true }, { status: 402 });
    }
    const rateLimit = consumeFixedWindowRateLimit(`ai-generate:${session.userId}`, 60, 60 * 60 * 1_000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "The hourly AI request limit was reached." },
        { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
      );
    }
    const parsed = completionRequestSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid AI request.", details: parsed.error.flatten() }, { status: 400 });
    }
    const { messages, grade, subject, chapter, socraticMode, language } = parsed.data;

    const options: CompletionOptions = {
      messages,
      grade: grade || "Class 8",
      subject: subject || "Compulsory Mathematics",
      chapter,
      socraticMode: socraticMode ?? true,
      language: language || "bilingual",
      userId: session.userId,
    };

    const result = await generateCompletion(options);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: unknown) {
    console.error("AI Generate API error:", error);
    return NextResponse.json({ error: "Failed to generate AI completion." }, { status: 500 });
  }
}
