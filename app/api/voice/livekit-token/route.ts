import { AccessToken } from "livekit-server-sdk";
import { TrackSource } from "@livekit/protocol";
import { NextResponse } from "next/server";
import { z } from "zod";
import { lessonUser, lessonError, LessonError } from "@/lib/lessons/http";
import { ownedLesson } from "@/lib/lessons/service";
import { getTeachingSettings } from "@/lib/ai/teaching-settings";
import { createVoiceToken } from "@/lib/voice/agent-auth";
import { prisma } from "@/lib/db/prisma";
import { voiceConfiguration } from "@/lib/voice/configuration";
const schema = z.object({ lessonId: z.string().uuid(), language: z.enum(["en", "ne", "bilingual"]).optional() });
export async function POST(request: Request) {
  try {
    const user = await lessonUser(request, true), parsed = schema.safeParse(await request.json());
    if (!parsed.success) throw new LessonError("Start a saved lesson before connecting voice.");
    const lesson = await ownedLesson(parsed.data.lessonId, user), settings = await getTeachingSettings();
    const { LIVEKIT_URL: url, LIVEKIT_API_KEY: key, LIVEKIT_API_SECRET: secret, VOICE_AGENT_URL: agentUrl, VOICE_AGENT_SECRET: agentSecret } = process.env;
    if (!settings.voiceEnabled) throw new LessonError("LiveKit voice is disabled by your administrator. Browser microphone and text still work.", 503);
    if (!voiceConfiguration(settings).configured || !url || !key || !secret || !agentUrl || !agentSecret) throw new LessonError("LiveKit voice setup is incomplete. Ask your administrator to open Login Users → AI teacher settings → Check voice services. Browser microphone and text still work.", 503);
    if (lesson.status !== "ACTIVE") throw new LessonError("Resume the lesson before connecting voice.", 409);
    const remaining = Math.ceil((settings.lessonMinutes * 60000 - (Date.now() - lesson.startedAt.getTime())) / 60000);
    if (remaining < 1) throw new LessonError("This lesson has reached its time limit. Start a new lesson.", 409);
    const language = parsed.data.language || lesson.language;
    if (parsed.data.language) await prisma.guruLesson.update({ where: { id: lesson.id }, data: { language } });
    const room = `guru-${lesson.id}`, identity = `student-${user.userId}`, agentIdentity = `teacher-${lesson.id}`;
    const student = new AccessToken(key, secret, { identity, ttl: "5m" });
    student.addGrant({ roomJoin: true, room, canSubscribe: true, canPublish: true, canPublishData: false, canPublishSources: [TrackSource.MICROPHONE] });
    const agent = new AccessToken(key, secret, { identity: agentIdentity, ttl: `${remaining}m` });
    agent.addGrant({ roomJoin: true, room, canSubscribe: true, canPublish: true, canPublishData: true });
    const callbackToken = await createVoiceToken(lesson.id, user.userId, user.schoolId, remaining);
    const response = await fetch(`${agentUrl.replace(/\/$/, "")}/sessions`, { method: "POST", headers: { Authorization: `Bearer ${agentSecret}`, "Content-Type": "application/json" }, redirect: "error", signal: AbortSignal.timeout(15000), body: JSON.stringify({ lesson_id: lesson.id, room, room_token: await agent.toJwt(), callback_token: callbackToken, participant: identity, language, duration_seconds: remaining * 60, stt_provider: settings.sttProvider, tts_provider: settings.ttsProvider, voice: settings.ttsVoice, speed: settings.speechSpeed, silence_seconds: settings.silenceSeconds }) }).catch(() => { throw new LessonError("The voice service could not be reached. Continue with browser microphone or text while your administrator checks the voice service connection.", 503); });
    if (!response.ok) throw new LessonError("The voice service is unavailable or its speech API keys are missing. Continue in text mode and check voice-service health.", 503);
    return NextResponse.json({ url, token: await student.toJwt(), agentIdentity, browserTts: settings.ttsProvider === "browser" }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return lessonError(error); }
}
export async function DELETE(request: Request) {
  try {
    const user = await lessonUser(request, true), id = new URL(request.url).searchParams.get("lessonId");
    if (!id) throw new LessonError("Lesson required.");
    await ownedLesson(id, user);
    const url = process.env.VOICE_AGENT_URL, secret = process.env.VOICE_AGENT_SECRET;
    if (url && secret) { const response = await fetch(`${url.replace(/\/$/, "")}/sessions/${encodeURIComponent(id)}`, { method: "DELETE", headers: { Authorization: `Bearer ${secret}` }, redirect: "error", signal: AbortSignal.timeout(5000) }).catch(() => { throw new LessonError("Voice service disconnect could not be confirmed. Your microphone is disconnected locally.", 503); }); if (!response.ok) throw new LessonError("Voice disconnect could not be confirmed.", 503); }
    return NextResponse.json({ disconnected: true });
  } catch (error) { return lessonError(error); }
}
