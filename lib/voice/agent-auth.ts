import { SignJWT, jwtVerify } from "jose";
import { prisma } from "@/lib/db/prisma";
import { LessonError } from "@/lib/lessons/http";
function secret() { const value = process.env.VOICE_AGENT_SECRET || ""; if (value.length < 32) throw new LessonError("Voice service secret is not configured.", 503); return new TextEncoder().encode(value); }
export async function createVoiceToken(lessonId: string, userId: string, schoolId: string, minutes: number) {
  return new SignJWT({ lessonId, schoolId }).setSubject(userId).setProtectedHeader({ alg: "HS256" }).setIssuer("guru-web").setAudience("guru-voice-callback").setIssuedAt().setExpirationTime(`${minutes}m`).sign(secret());
}
export async function voiceIdentity(request: Request) {
  try {
    const token = request.headers.get("authorization")?.replace(/^Bearer /, "") || "";
    const { payload } = await jwtVerify(token, secret(), { issuer: "guru-web", audience: "guru-voice-callback", algorithms: ["HS256"] });
    if (typeof payload.sub !== "string" || typeof payload.schoolId !== "string" || typeof payload.lessonId !== "string") throw new Error();
    const assignment = await prisma.userRole.findFirst({ where: { userId: payload.sub, schoolId: payload.schoolId, role: { code: { in: ["STUDENT", "TEACHER"] } }, user: { status: "ACTIVE" }, school: { status: "ACTIVE" } }, include: { role: true, user: true } });
    if (!assignment) throw new Error();
    return { lessonId: payload.lessonId, user: { userId: payload.sub, schoolId: payload.schoolId, role: assignment.role.code, status: assignment.user.status, name: assignment.user.name, email: assignment.user.email } };
  } catch { throw new LessonError("Invalid voice session.", 401); }
}
