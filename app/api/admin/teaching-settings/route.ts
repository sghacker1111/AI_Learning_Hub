import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { assertSameOrigin, lessonError, LessonError } from "@/lib/lessons/http";
import { defaultTeachingSettings, getTeachingSettings, teachingSettingsSchema } from "@/lib/ai/teaching-settings";
import { voiceConfiguration } from "@/lib/voice/configuration";
import { checkVoiceServices } from "@/lib/voice/service-check";
import { consumeFixedWindowRateLimit } from "@/lib/ai/rate-limit";
export async function GET() {
  const user = await getSessionUser();
  if (user?.role !== "SUPER_ADMIN") return NextResponse.json({ error: "Super Admin access required." }, { status: 403 });
  try {
    const settings = await getTeachingSettings();
    const vector = await prisma.$queryRaw<Array<{ installed: boolean }>>`SELECT EXISTS(SELECT 1 FROM pg_extension WHERE extname='vector') AS installed`;
    return NextResponse.json({ settings, voice: voiceConfiguration(settings), health: { database: true, vector: vector[0]?.installed || false, qwen: !!(process.env.AI_API_KEY || process.env.HF_TOKEN), embeddings: !!(process.env.EMBEDDING_API_KEY || process.env.HF_TOKEN) }, note: "Configuration presence only. Use Check voice services for authenticated connectivity checks." }, { headers: { "Cache-Control": "no-store" } });
  } catch { return NextResponse.json({ error: "Connect PostgreSQL and apply migrations before saving settings.", settings: defaultTeachingSettings() }, { status: 503 }); }
}
export async function POST(request: Request) {
  try {
    assertSameOrigin(request); const user = await getSessionUser();
    if (user?.role !== "SUPER_ADMIN" || user.userId.startsWith("dev-")) throw new LessonError("A real Super Admin account is required.", 403);
    if (!consumeFixedWindowRateLimit(`voice-health:${user.userId}`, 6, 60000).allowed) throw new LessonError("Wait a minute before checking voice services again.", 429);
    return NextResponse.json(await checkVoiceServices(await getTeachingSettings()), { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return lessonError(error); }
}
export async function PUT(request: Request) {
  try {
    assertSameOrigin(request); const user = await getSessionUser();
    if (user?.role !== "SUPER_ADMIN" || user.userId.startsWith("dev-")) throw new LessonError("A real Super Admin account is required.", 403);
    const parsed = teachingSettingsSchema.safeParse(await request.json());
    if (!parsed.success) throw new LessonError(parsed.error.issues[0].message);
    await prisma.$transaction(async (tx) => {
      await tx.teachingSettings.upsert({ where: { id: "platform" }, create: { id: "platform", value: parsed.data, updatedBy: user.userId }, update: { value: parsed.data, updatedBy: user.userId } });
      await tx.auditLog.create({ data: { userId: user.userId, action: "TEACHING_SETTINGS_UPDATE", entityType: "TeachingSettings", entityId: "platform", changesJson: parsed.data } });
    });
    const voice = voiceConfiguration(parsed.data);
    return NextResponse.json({ settings: parsed.data, voice, warning: parsed.data.voiceEnabled && !voice.configured ? "Settings saved, but LiveKit voice still needs the server settings listed below. Browser microphone and text remain available." : undefined });
  } catch (error) { return lessonError(error); }
}
