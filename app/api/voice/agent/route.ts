import { NextResponse } from "next/server";
import { voiceIdentity } from "@/lib/voice/agent-auth";
import { changeLesson, reserveTurn, runLessonTurn } from "@/lib/lessons/service";
import { lessonMessageSchema } from "@/lib/lessons/contracts";
import { lessonError, LessonError } from "@/lib/lessons/http";
import { lessonStreamResponse } from "@/lib/lessons/stream-protocol";
import { checkSchoolFeature } from "@/lib/billing/entitlements";
import { consumeFixedWindowRateLimit } from "@/lib/ai/rate-limit";
export const maxDuration = 180;
export async function POST(request: Request) {
  try {
    const { user, lessonId } = await voiceIdentity(request), body = await request.json();
    if (!consumeFixedWindowRateLimit(`voice-agent:${user.userId}`, 180, 3600000).allowed) throw new LessonError("Voice lesson limit reached.", 429);
    if (!(await checkSchoolFeature(user, "AI_TUTOR")).allowed) throw new LessonError("School subscription does not include AI Tutor.", 402);
    if (body.action === "interrupt") return NextResponse.json({ lesson: await changeLesson(lessonId, user, "interrupt") });
    const input = lessonMessageSchema.safeParse(body);
    if (!input.success) throw new LessonError("Invalid voice message.");
    const reserved = await reserveTurn(lessonId, user, input.data);
    return lessonStreamResponse((send, signal) => runLessonTurn(reserved, user.role, send, signal), request.signal);
  } catch (error) { return lessonError(error); }
}
