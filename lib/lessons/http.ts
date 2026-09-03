import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { checkSchoolFeature } from "@/lib/billing/entitlements";
import { consumeFixedWindowRateLimit } from "@/lib/ai/rate-limit";
export class LessonError extends Error { constructor(message: string, public status = 400) { super(message); } }
export function assertSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const url = new URL(request.url);
  // Next may reconstruct the internal URL as localhost; Host remains the browser-facing authority.
  const browserOrigin = `${url.protocol}//${request.headers.get("host") || url.host}`;
  if (origin && origin !== url.origin && origin !== browserOrigin) throw new LessonError("Cross-site requests are not allowed.", 403);
  if (request.headers.get("sec-fetch-site") === "cross-site") throw new LessonError("Cross-site requests are not allowed.", 403);
}
export async function lessonUser(request: Request, write = false) {
  if (write) assertSameOrigin(request);
  const user = await getSessionUser();
  if (!user || !["STUDENT", "TEACHER"].includes(user.role)) throw new LessonError("Student or teacher access required.", 403);
  if (user.userId.startsWith("dev-") || !user.schoolId) throw new LessonError("Saved lessons require a real school account and a connected database. Demo conversations remain browser-only.", 503);
  if (write) {
    const limit = consumeFixedWindowRateLimit(`lesson:${user.userId}`, 120, 3600000);
    if (!limit.allowed) throw new LessonError("Hourly lesson limit reached. Please try later.", 429);
    const access = await checkSchoolFeature(user, "AI_TUTOR");
    if (!access.allowed) throw new LessonError(access.reason || "AI Tutor is not in this school bundle.", 402);
  }
  return { ...user, schoolId: user.schoolId as string };
}
export function lessonError(error: unknown) {
  if (error instanceof LessonError) return NextResponse.json({ error: error.message }, { status: error.status });
  console.error(JSON.stringify({ event: "lesson_error", code: error && typeof error === "object" && "code" in error ? error.code : "UNAVAILABLE" }));
  return NextResponse.json({ error: "Saved learning is temporarily unavailable. Check the database connection and migrations." }, { status: 503 });
}
