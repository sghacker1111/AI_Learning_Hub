import { ContentStatus } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import type { CurriculumChunk } from "./types";

function extractKeywords(text: string): string[] {
  return Array.from(new Set(
    text
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\u0900-\u097F\s]/g, " ")
      .split(/\s+/)
      .filter((word) => word.length > 2)
  )).slice(0, 24);
}

export async function loadPublishedCurriculumChunks(filters: { grade?: string; subject?: string } = {}): Promise<CurriculumChunk[]> {
  try {
    const contents = await prisma.learningContent.findMany({
      where: {
        status: ContentStatus.PUBLISHED,
        lesson: {
          chapter: {
            unit: {
              subject: {
                ...(filters.subject && filters.subject !== "ALL"
                  ? { OR: [{ code: { equals: filters.subject, mode: "insensitive" } }, { name: { contains: filters.subject, mode: "insensitive" } }] }
                  : {}),
                grade: filters.grade && filters.grade !== "ALL"
                  ? { OR: [{ code: { equals: filters.grade, mode: "insensitive" } }, { name: { equals: filters.grade, mode: "insensitive" } }] }
                  : undefined,
              },
            },
          },
        },
      },
      include: {
        topic: true,
        formulas: true,
        sourceReferences: true,
        lesson: {
          include: {
            learningOutcomes: true,
            chapter: {
              include: {
                unit: {
                  include: {
                    subject: { include: { grade: { include: { curriculumVersion: true } } } },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: [{ updatedAt: "desc" }],
      take: 500,
    });

    return contents.map((content) => {
      const chapter = content.lesson.chapter;
      const subject = chapter.unit.subject;
      const grade = subject.grade;
      const source = content.sourceReferences[0];
      const outcome = content.lesson.learningOutcomes[0];
      const isNepali = content.language.toLowerCase().startsWith("ne");
      return {
        id: `db-${content.id}`,
        content: content.bodyMarkdown,
        contentNepali: isNepali ? content.bodyMarkdown : undefined,
        latexFormulas: content.formulas.map((formula) => formula.latexExpression),
        metadata: {
          grade: grade.name,
          gradeCode: grade.code,
          subject: subject.name,
          subjectCode: subject.code,
          unit: chapter.unit.title,
          chapter: chapter.title,
          learningOutcomeCode: outcome?.code || "ADMIN-IMPORTED",
          pageRange: source?.pageNumber || "Not supplied",
          curriculumEdition: source?.editionYear || grade.curriculumVersion.versionCode,
          sectionTitle: content.topic?.title || content.title,
        },
        keywords: extractKeywords(`${content.title} ${content.bodyMarkdown} ${chapter.title} ${chapter.unit.title}`),
      };
    });
  } catch {
    return [];
  }
}

