import { NextRequest, NextResponse } from "next/server";
import { RoleCode } from "@prisma/client";
import { getSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { questionBankSchema } from "@/lib/validation/question-bank";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionUser();
  if (!session || session.role !== RoleCode.SUPER_ADMIN) {
    return NextResponse.json({ error: "Super Admin access is required." }, { status: 403 });
  }
  const input = questionBankSchema.safeParse(await request.json());
  if (!input.success) {
    return NextResponse.json({ error: input.error.issues[0]?.message }, { status: 400 });
  }
  const { id } = await params;
  try {
    const value = input.data;
    const chapter = await prisma.chapter.findUnique({
      where: { id: value.chapterId },
      select: { unit: { select: { subject: { select: { id: true, gradeId: true } } } } },
    });
    if (!chapter || chapter.unit.subject.id !== value.subjectId || chapter.unit.subject.gradeId !== value.gradeId) {
      return NextResponse.json(
        { error: "The selected class, subject, and chapter do not belong to one curriculum path." },
        { status: 400 }
      );
    }
    const question = await prisma.$transaction(async (tx) => {
      await tx.questionOption.deleteMany({ where: { questionId: id } });
      await tx.questionSolution.deleteMany({ where: { questionId: id } });
      const updated = await tx.question.update({
        where: { id },
        data: {
          gradeId: value.gradeId,
          subjectId: value.subjectId,
          chapterId: value.chapterId,
          type: value.type,
          questionText: value.questionText,
          questionNepali: value.questionNepali || null,
          difficulty: value.difficulty,
          cognitiveLevel: value.cognitiveLevel,
          marks: value.marks,
          status: value.status,
          options: {
            create: value.options.map((option, index) => ({
              optionText: option.optionText,
              isCorrect: option.isCorrect,
              explanation: option.explanation || null,
              orderIndex: index + 1,
            })),
          },
          solutions: value.solution ? { create: { solutionMarkdown: value.solution } } : undefined,
        },
      });
      await tx.auditLog.create({
        data: { userId: session.userId, action: "QUESTION_UPDATE", entityType: "Question", entityId: id },
      });
      return updated;
    });
    return NextResponse.json({ success: true, question });
  } catch (error) {
    console.error("Question update failed:", error);
    return NextResponse.json({ error: "Question could not be updated." }, { status: 503 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionUser();
  if (!session || session.role !== RoleCode.SUPER_ADMIN) {
    return NextResponse.json({ error: "Super Admin access is required." }, { status: 403 });
  }
  const { id } = await params;
  try {
    await prisma.$transaction([
      prisma.question.delete({ where: { id } }),
      prisma.auditLog.create({
        data: { userId: session.userId, action: "QUESTION_DELETE", entityType: "Question", entityId: id },
      }),
    ]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Question deletion failed:", error);
    return NextResponse.json({ error: "Question could not be deleted." }, { status: 503 });
  }
}
