import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSessionUser } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionUser();
    const body = await request.json();
    const { gradeId, subjectId, chapterId, lessonId } = body;
    if (
      [gradeId, subjectId, chapterId, lessonId].some(
        (value) => value !== undefined && (typeof value !== "string" || value.length > 120)
      )
    ) {
      return NextResponse.json({ error: "Invalid tutor session context." }, { status: 400 });
    }

    const studentId = session?.userId || "demo-student";
    let sessionId = `sess-${Date.now()}`;
    let persisted = false;

    try {
      // Find or create in DB if available
      const dbGrade = await prisma.grade.findFirst({ where: { code: gradeId || "class-8" } });
      const dbSubject = await prisma.subject.findFirst({
        where: { code: subjectId || "MTH-801", gradeId: dbGrade?.id },
      });

      if (dbGrade && dbSubject && session?.userId && !session.userId.startsWith("dev-")) {
        const createdSession = await prisma.tutorSession.create({
          data: {
            studentId: session.userId,
            gradeId: dbGrade.id,
            subjectId: dbSubject.id,
            chapterId,
            lessonId,
          },
        });
        sessionId = createdSession.id;
        persisted = true;
      }
    } catch {
      // Fallback
    }

    return NextResponse.json({
      success: true,
      persisted,
      sessionId,
      studentId,
      startedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Tutor session API error:", error);
    return NextResponse.json({ error: "Failed to initialize tutor session" }, { status: 500 });
  }
}
