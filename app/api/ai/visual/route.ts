import { RoleCode } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { consumeFixedWindowRateLimit } from "@/lib/ai/rate-limit";
import { generateEducationalVisual } from "@/lib/ai/visual/engine";
import { getSessionUser } from "@/lib/auth/session";

const VISUAL_ROLES = new Set<RoleCode>([RoleCode.STUDENT, RoleCode.TEACHER, RoleCode.SUPER_ADMIN]);
const visualRequestSchema = z.object({
  prompt: z.string().trim().min(2).max(1_000),
  grade: z.string().trim().min(1).max(80).optional(),
  subject: z.string().trim().min(1).max(120).optional(),
  topic: z.string().trim().min(1).max(120).optional(),
}).strict();

export async function POST(request: NextRequest) {
  const session = await getSessionUser();
  if (!session || !VISUAL_ROLES.has(session.role)) {
    return NextResponse.json({ error: "Student, teacher, or Super Admin access is required." }, { status: 403 });
  }

  const parsed = visualRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "A valid visual request is required." }, { status: 400 });
  }

  const rateLimit = consumeFixedWindowRateLimit(`ai-visual:${session.userId}`, 60, 60 * 60 * 1_000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "The visual limit was reached. Please try again later." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
    );
  }

  const { prompt, grade, subject, topic } = parsed.data;
  const context = [prompt, grade, subject, topic].filter(Boolean).join(" — ");
  const visual = generateEducationalVisual(context);

  return NextResponse.json(
    { success: true, visual, rateLimit: { remaining: rateLimit.remaining, resetAt: rateLimit.resetAt } },
    { headers: { "Cache-Control": "private, no-store" } }
  );
}
