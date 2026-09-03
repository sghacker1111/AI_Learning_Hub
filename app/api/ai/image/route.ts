import { RoleCode } from "@prisma/client";
import { after, NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateEducationalImage } from "@/lib/ai/image/router";
import { ImageGenerationError } from "@/lib/ai/image/types";
import { consumeFixedWindowRateLimit } from "@/lib/ai/rate-limit";
import { getSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { checkSchoolFeature } from "@/lib/billing/entitlements";

const IMAGE_ROLES = new Set<RoleCode>([RoleCode.STUDENT, RoleCode.TEACHER, RoleCode.SUPER_ADMIN]);
const allowedDimensions = [512, 768, 1024] as const;
const imageRequestSchema = z.object({
  prompt: z.string().trim().min(3).max(1_000),
  grade: z.string().trim().min(1).max(80).default("Class 8"),
  subject: z.string().trim().min(1).max(120).default("General Education"),
  topic: z.string().trim().min(1).max(120).optional(),
  style: z.enum(["illustration", "realistic", "diagram"]).default("illustration"),
  width: z.union(allowedDimensions.map((value) => z.literal(value)) as [z.ZodLiteral<512>, z.ZodLiteral<768>, z.ZodLiteral<1024>]).default(768),
  height: z.union(allowedDimensions.map((value) => z.literal(value)) as [z.ZodLiteral<512>, z.ZodLiteral<768>, z.ZodLiteral<1024>]).default(512),
  seed: z.number().int().min(0).max(2_147_483_647).optional(),
}).strict();

function getHourlyImageLimit(): number {
  const configured = Number(process.env.AI_IMAGE_RATE_LIMIT_PER_HOUR || 8);
  return Number.isFinite(configured) ? Math.min(60, Math.max(1, Math.floor(configured))) : 8;
}

export async function POST(request: NextRequest) {
  const session = await getSessionUser();
  if (!session || !IMAGE_ROLES.has(session.role)) {
    return NextResponse.json({ error: "Student, teacher, or Super Admin access is required." }, { status: 403 });
  }
  const entitlement = await checkSchoolFeature(session, "AI_TUTOR");
  if (!entitlement.allowed) {
    return NextResponse.json({ error: entitlement.reason, upgradeRequired: true }, { status: 402 });
  }

  const parsed = imageRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "A valid school-safe image request is required." }, { status: 400 });
  }

  const rateLimit = consumeFixedWindowRateLimit(
    `ai-image:${session.schoolId || "global"}:${session.userId}`,
    getHourlyImageLimit(),
    60 * 60 * 1_000
  );
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "The hourly image quota was reached. Use Show Visual or try again later.", code: "RATE_LIMITED" },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
    );
  }

  const timeoutController = new AbortController();
  const timeoutMs = Math.min(180_000, Math.max(20_000, Number(process.env.AI_IMAGE_TIMEOUT_MS || 120_000)));
  const timeout = setTimeout(() => timeoutController.abort(), timeoutMs);
  const abortOnDisconnect = () => timeoutController.abort();
  request.signal.addEventListener("abort", abortOnDisconnect, { once: true });

  try {
    const result = await generateEducationalImage(parsed.data, timeoutController.signal);

    after(async () => {
      await prisma.aIUsageLog.create({
        data: {
          userId: session.userId,
          provider: result.provider,
          model: result.model,
          requestType: "image_generation",
          latencyMs: result.latencyMs,
          success: true,
        },
      }).catch(() => undefined);
    });

    return new Response(result.bytes, {
      status: 200,
      headers: {
        "Content-Type": result.contentType,
        "Content-Length": String(result.bytes.byteLength),
        "Cache-Control": "private, no-store",
        "X-AI-Image-Provider": result.provider,
        "X-AI-Image-Model": result.model,
        "X-AI-Image-Cached": String(result.cached),
        "X-RateLimit-Remaining": String(rateLimit.remaining),
      },
    });
  } catch (error) {
    const normalized = error instanceof ImageGenerationError
      ? error
      : new ImageGenerationError("PROVIDER_ERROR", "Image generation failed.", 500);

    after(async () => {
      await prisma.aIUsageLog.create({
        data: {
          userId: session.userId,
          provider: "huggingface",
          model: process.env.AI_IMAGE_MODEL || "unconfigured",
          requestType: "image_generation",
          latencyMs: 0,
          success: false,
          errorMessage: normalized.code,
        },
      }).catch(() => undefined);
    });

    return NextResponse.json(
      { error: normalized.message, code: normalized.code, freeVisualAvailable: true },
      { status: normalized.status }
    );
  } finally {
    clearTimeout(timeout);
    request.signal.removeEventListener("abort", abortOnDisconnect);
  }
}
