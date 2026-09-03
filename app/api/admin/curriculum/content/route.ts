import { NextRequest, NextResponse } from "next/server";
import { ContentStatus, ContentType, RoleCode } from "@prisma/client";
import { getSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { curriculumContentImportSchema } from "@/lib/validation/curriculum-content";

export async function POST(request: NextRequest) {
  const session = await getSessionUser();
  if (!session || session.role !== RoleCode.SUPER_ADMIN) {
    return NextResponse.json({ error: "Super Admin access is required." }, { status: 403 });
  }

  const parsed = curriculumContentImportSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid curriculum content.", details: parsed.error.format() }, { status: 400 });
  }

  const input = parsed.data;
  try {
    const chapter = await prisma.chapter.findUnique({
      where: { id: input.chapterId },
      select: { title: true, unit: { select: { subject: { select: { id: true, gradeId: true } } } } },
    });
    if (!chapter || chapter.unit.subject.id !== input.subjectId || chapter.unit.subject.gradeId !== input.gradeId) {
      return NextResponse.json({ error: "The selected class, subject, and chapter do not belong to one curriculum path." }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const lesson = await tx.lesson.upsert({
        where: { chapterId_lessonNumber: { chapterId: input.chapterId, lessonNumber: input.lessonNumber } },
        update: {
          title: input.lessonTitle,
          titleNepali: input.lessonTitleNepali || input.lessonTitle,
          status: ContentStatus.PUBLISHED,
        },
        create: {
          chapterId: input.chapterId,
          lessonNumber: input.lessonNumber,
          title: input.lessonTitle,
          titleNepali: input.lessonTitleNepali || input.lessonTitle,
          status: ContentStatus.PUBLISHED,
          orderIndex: input.lessonNumber,
        },
      });

      let topicId: string | undefined;
      if (input.topicTitle) {
        const existingTopic = await tx.topic.findFirst({ where: { lessonId: lesson.id, title: input.topicTitle } });
        const topic = existingTopic || await tx.topic.create({
          data: { lessonId: lesson.id, title: input.topicTitle, orderIndex: 1 },
        });
        topicId = topic.id;
      }

      const saveLanguage = async (language: "en" | "ne", bodyMarkdown: string) => {
        const existing = await tx.learningContent.findFirst({
          where: { lessonId: lesson.id, topicId: topicId || null, title: input.contentTitle, language },
        });
        const content = existing
          ? await tx.learningContent.update({
              where: { id: existing.id },
              data: {
                bodyMarkdown,
                topicId,
                status: ContentStatus.PUBLISHED,
                version: { increment: 1 },
                approvedById: session.userId,
                publishedAt: new Date(),
              },
            })
          : await tx.learningContent.create({
              data: {
                lessonId: lesson.id,
                topicId,
                type: ContentType.CONCEPT,
                title: input.contentTitle,
                bodyMarkdown,
                language,
                status: ContentStatus.PUBLISHED,
                createdById: session.userId,
                approvedById: session.userId,
                publishedAt: new Date(),
              },
            });

        await tx.sourceReference.deleteMany({ where: { learningContentId: content.id } });
        await tx.sourceReference.create({
          data: {
            learningContentId: content.id,
            bookTitle: input.sourceTitle,
            editionYear: input.editionYear,
            pageNumber: input.pageNumber || null,
            chapterName: chapter.title,
            notes: input.sourceUrl ? `Official source: ${input.sourceUrl}` : "Imported by Super Admin",
          },
        });
        if (language === "en") {
          await tx.formula.deleteMany({ where: { learningContentId: content.id } });
          if (input.formulas.length) {
            await tx.formula.createMany({
              data: input.formulas.map((latexExpression, index) => ({
                learningContentId: content.id,
                name: `Formula ${index + 1}`,
                latexExpression,
              })),
            });
          }
        }
        return content.id;
      };

      const englishContentId = await saveLanguage("en", input.bodyEnglish);
      const nepaliContentId = input.bodyNepali ? await saveLanguage("ne", input.bodyNepali) : null;
      await tx.auditLog.create({
        data: {
          userId: session.userId,
          action: "CURRICULUM_CONTENT_PUBLISH",
          entityType: "Lesson",
          entityId: lesson.id,
          changesJson: { gradeId: input.gradeId, subjectId: input.subjectId, chapterId: input.chapterId, englishContentId, nepaliContentId },
        },
      });
      return { lessonId: lesson.id, englishContentId, nepaliContentId };
    });

    return NextResponse.json({ success: true, persisted: true, published: true, ...result }, { status: 201 });
  } catch (error) {
    console.error("Curriculum content import failed:", error);
    return NextResponse.json({ error: "Curriculum content could not be saved. Check the PostgreSQL connection and migration status." }, { status: 503 });
  }
}
