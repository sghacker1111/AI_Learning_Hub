import { NextRequest, NextResponse } from "next/server";
import { RoleCode } from "@prisma/client";
import { getSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { questionBankSchema } from "@/lib/validation/question-bank";
import { specificationGridSchema } from "@/lib/validation/specification-grid";

const questionInclude = {
  grade: { select: { id: true, name: true } },
  subject: { select: { id: true, name: true } },
  chapter: { select: { id: true, title: true } },
  options: { orderBy: { orderIndex: "asc" as const } },
  solutions: true,
};

async function requireSuperAdmin() {
  const session = await getSessionUser();
  return session?.role === RoleCode.SUPER_ADMIN ? session : null;
}

export async function GET(request: NextRequest) {
  if (!(await requireSuperAdmin())) {
    return NextResponse.json({ error: "Super Admin access is required." }, { status: 403 });
  }

  const params = request.nextUrl.searchParams;
  const search = params.get("search")?.trim();
  try {
    const questions = await prisma.question.findMany({
      where: {
        ...(params.get("purpose") === "EXAM" ? { isExamQuestion: true } : params.get("purpose") === "QUESTION" ? { isExamQuestion: false, type: { not: "MCQ" as const } } : params.get("purpose") === "MCQ" ? { type: "MCQ" as const, isExamQuestion: false } : {}),
        ...(params.get("gradeId") ? { gradeId: params.get("gradeId")! } : {}),
        ...(params.get("subjectId") ? { subjectId: params.get("subjectId")! } : {}),
        ...(params.get("chapterId") ? { chapterId: params.get("chapterId")! } : {}),
        ...(params.get("type") ? { type: params.get("type") as never } : {}),
        ...(search
          ? { questionText: { contains: search, mode: "insensitive" as const } }
          : {}),
      },
      include: questionInclude,
      orderBy: { createdAt: "desc" },
      take: 200,
    });
    return NextResponse.json({ questions });
  } catch (error) {
    console.error("Question bank query failed:", error);
    return NextResponse.json({ error: "Question database is unavailable." }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  const session = await requireSuperAdmin();
  if (!session) {
    return NextResponse.json({ error: "Super Admin access is required." }, { status: 403 });
  }

  const parsed = questionBankSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid question data.", details: parsed.error.format() },
      { status: 400 }
    );
  }

  const input = parsed.data;
  try {
    if (input.isExamQuestion) {
      const grid = await prisma.specificationGrid.findUnique({ where: { code: input.specificationGridCode } });
      const checked = specificationGridSchema.safeParse(grid);
      if (!checked.success || checked.data.gradeId !== input.gradeId || checked.data.subjectId !== input.subjectId || !checked.data.rows.some((row) => row.chapterId === input.chapterId && row.type === input.type && row.cognitiveLevel === input.cognitiveLevel && row.marks === input.marks)) {
        return NextResponse.json({ error: "Question class, subject, chapter, type, cognitive level and marks must match a row in the saved grid." }, { status: 400 });
      }
    }
    const chapter = await prisma.chapter.findUnique({
      where: { id: input.chapterId },
      select: { unit: { select: { subject: { select: { id: true, gradeId: true } } } } },
    });
    if (
      !chapter ||
      chapter.unit.subject.id !== input.subjectId ||
      chapter.unit.subject.gradeId !== input.gradeId
    ) {
      return NextResponse.json(
        { error: "The selected class, subject, and chapter do not belong to one curriculum path." },
        { status: 400 }
      );
    }

    const question = await prisma.$transaction(async (tx) => {
      const created = await tx.question.create({
        data: {
          gradeId: input.gradeId,
          subjectId: input.subjectId,
          chapterId: input.chapterId,
          type: input.type,
          questionText: input.questionText,
          questionNepali: input.questionNepali || null,
          difficulty: input.difficulty,
          cognitiveLevel: input.cognitiveLevel,
          marks: input.marks,
          status: input.status,
          specificationGridCode: input.specificationGridCode || null,
          isExamQuestion: input.isExamQuestion,
          options: {
            create: input.options.map((option, index) => ({
              optionText: option.optionText,
              isCorrect: option.isCorrect,
              explanation: option.explanation || null,
              orderIndex: index + 1,
            })),
          },
          solutions: input.solution
            ? { create: { solutionMarkdown: input.solution } }
            : undefined,
          sourceReferences: input.sourceTitle
            ? { create: { bookTitle: input.sourceTitle, editionYear: input.sourceEdition || "Not supplied", pageNumber: input.sourcePage || null } }
            : undefined,
        },
        include: questionInclude,
      });
      await tx.auditLog.create({
        data: {
          userId: session.userId,
          action: "QUESTION_CREATE",
          entityType: "Question",
          entityId: created.id,
          changesJson: {
            type: input.type,
            gradeId: input.gradeId,
            subjectId: input.subjectId,
            chapterId: input.chapterId,
          },
        },
      });
      return created;
    });

    return NextResponse.json({ success: true, question }, { status: 201 });
  } catch (error) {
    console.error("Question creation failed:", error);
    return NextResponse.json({ error: "Question could not be saved." }, { status: 503 });
  }
}
