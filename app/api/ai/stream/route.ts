import { NextRequest } from "next/server";
import { RoleCode } from "@prisma/client";
import { generateCompletion } from "@/lib/ai/router";
import { CompletionOptions } from "@/lib/ai/types";
import { getSessionUser } from "@/lib/auth/session";
import { completionRequestSchema } from "@/lib/ai/request-validation";
import { consumeFixedWindowRateLimit } from "@/lib/ai/rate-limit";
import { checkSchoolFeature } from "@/lib/billing/entitlements";

const STREAM_ROLES = new Set<RoleCode>([RoleCode.STUDENT, RoleCode.TEACHER, RoleCode.SUPER_ADMIN]);

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || !STREAM_ROLES.has(session.role)) {
      return new Response(JSON.stringify({ error: "Student, teacher, or Super Admin access is required." }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }
    const entitlement = await checkSchoolFeature(session, "AI_TUTOR");
    if (!entitlement.allowed) {
      return new Response(JSON.stringify({ error: entitlement.reason, upgradeRequired: true }), {
        status: 402,
        headers: { "Content-Type": "application/json" },
      });
    }
    const rateLimit = consumeFixedWindowRateLimit(`ai-stream:${session.userId}`, 60, 60 * 60 * 1_000);
    if (!rateLimit.allowed) {
      return new Response(JSON.stringify({ error: "The hourly AI request limit was reached." }), {
        status: 429,
        headers: { "Content-Type": "application/json", "Retry-After": String(rateLimit.retryAfterSeconds) },
      });
    }
    const parsed = completionRequestSchema.safeParse(await request.json());
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: "Messages array required" }), { status: 400 });
    }
    const { messages, grade, subject, chapter, language } = parsed.data;

    const options: CompletionOptions = {
      messages,
      grade: grade || "Class 8",
      subject: subject || "Compulsory Mathematics",
      chapter,
      language: language || "bilingual",
      userId: session?.userId,
    };

    const result = await generateCompletion(options);
    // Providers are called in buffered mode. Return one truthful SSE payload rather than
    // adding artificial delays that look like provider-native token streaming.
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        const payload = JSON.stringify({
          chunk: result.text,
          isDone: true,
          buffered: true,
          isSimulated: result.isSimulated ?? false,
          provider: result.provider,
          model: result.model,
        });
        controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Streaming error";
    return new Response(JSON.stringify({ error: msg }), { status: 500 });
  }
}
