import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { learningActivitySchema } from "@/lib/learning/activity";
import { consumeFixedWindowRateLimit } from "@/lib/ai/rate-limit";
import { assertSameOrigin, lessonError } from "@/lib/lessons/http";
async function learner() {
  const user = await getSessionUser();
  return user && (user.role === "STUDENT" || user.role === "TEACHER") ? user : null;
}
export async function GET() {
  const user = await learner();
  if (!user) return NextResponse.json({ error: "Learner access required." }, { status: 403 });
  if (user.userId.startsWith("dev-")) return NextResponse.json({ error: "Demo account activity is stored in your browser only." }, { status: 503 });
  if (!user.schoolId) return NextResponse.json({ error: "A school membership is required to sync learning." }, { status: 403 });
  try {
    const events = await prisma.learningActivity.findMany({ where: { userId: user.userId, schoolId: user.schoolId }, orderBy: { createdAt: "desc" }, take: 1000 });
    const unscopedCount = await prisma.learningActivity.count({ where: { userId: user.userId, schoolId: null } });
    return NextResponse.json({ events, unscopedCount, scope: { userId: user.userId, schoolId: user.schoolId } }, { headers: { "Cache-Control": "private, no-store" } });
  } catch { return NextResponse.json({ error: "Learning database unavailable." }, { status: 503 }); }
}
export async function POST(request: NextRequest) {
  try { assertSameOrigin(request); } catch (error) { return lessonError(error); }
  const user = await learner();
  if (!user) return NextResponse.json({ error: "Learner access required." }, { status: 403 });
  if (user.userId.startsWith("dev-")) return NextResponse.json({ error: "Demo account activity is browser-only." }, { status: 503 });
  if (!user.schoolId) return NextResponse.json({ error: "A school membership is required to sync learning." }, { status: 403 });
  const limit = consumeFixedWindowRateLimit(`learning:${user.userId}`, 240, 60000);
  if (!limit.allowed) return NextResponse.json({ error: "Please wait before syncing again." }, { status: 429 });
  const input = z.object({ scope: z.object({ userId: z.string(), schoolId: z.string() }), events: z.array(learningActivitySchema).min(1).max(50) }).safeParse(await request.json().catch(() => null));
  if (!input.success) return NextResponse.json({ error: "Invalid learning activity." }, { status: 400 });
  if (input.data.scope.userId !== user.userId || input.data.scope.schoolId !== user.schoolId) return NextResponse.json({ error: "Your account or school changed. Reload before syncing." }, { status: 409 });
  try {
    // Client-reported activity is not an official grade or an assessed mastery score.
    const result = await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${"activity:" + user.userId}))`;
      const conflict = await tx.learningActivity.findFirst({ where: { userId: user.userId, id: { in: input.data.events.map((event) => event.id) }, OR: [{ schoolId: null }, { schoolId: { not: user.schoolId } }] }, select: { id: true } });
      if (conflict) return false;
      await tx.learningActivity.createMany({ data: input.data.events.map((event) => ({ ...event, userId: user.userId, schoolId: user.schoolId, createdAt: new Date(event.createdAt) })), skipDuplicates: true });
      return true;
    });
    if (!result) return NextResponse.json({ error: "Activity belongs to a different or unassigned school; it was not moved." }, { status: 409 });
    return NextResponse.json({ saved: true });
  } catch { return NextResponse.json({ error: "Learning database unavailable. Keep your browser copy and retry." }, { status: 503 }); }
}
