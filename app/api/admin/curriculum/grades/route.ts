import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { CDC_GRADES } from "@/lib/constants/curriculum";

export async function GET() {
  try {
    try {
      const dbGrades = await prisma.grade.findMany({
        include: {
          subjects: {
            include: {
              units: {
                include: {
                  chapters: {
                    include: {
                      lessons: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: { orderIndex: "asc" },
      });

      if (dbGrades && dbGrades.length > 0) {
        const formatted = dbGrades.map((g) => {
          const catalogGrade = CDC_GRADES.find((grade) => grade.id === g.code);
          const totalChapters = g.subjects.reduce(
            (acc: number, s) => acc + s.units.reduce((uAcc: number, u) => uAcc + u.chapters.length, 0),
            0
          );
          const lessons = g.subjects.flatMap((subject) =>
            subject.units.flatMap((unit) => unit.chapters.flatMap((chapter) => chapter.lessons))
          );
          const publishedLessons = lessons.filter((lesson) => lesson.status === "PUBLISHED").length;
          const totalLessons = lessons.length;

          return {
            id: g.id,
            code: g.code,
            name: g.name,
            nameNepali: g.nameNepali,
            level: catalogGrade?.level.toUpperCase() || g.level,
            levelLabel: catalogGrade?.levelLabel || g.level,
            subjectsCount: g.subjects.length,
            totalChapters,
            totalLessons,
            publishedLessons,
            completeness: totalLessons > 0 ? Math.round((publishedLessons / totalLessons) * 100) : 0,
          };
        });

        return NextResponse.json({ grades: formatted });
      }
    } catch {
      // Fallback in case DB not connected
    }

    // Default static CDC grades fallback
    const fallbackGrades = CDC_GRADES.map((g) => ({
      id: g.id,
      code: g.id,
      name: g.name,
      nameNepali: g.nameNepali,
      level: g.level.toUpperCase(),
      levelLabel: g.levelLabel,
      subjectsCount: 0,
      catalogSubjectsCount: g.subjectsCount,
      totalChapters: 0,
      totalLessons: 0,
      publishedLessons: 0,
      completeness: 0,
    }));

    return NextResponse.json({ grades: fallbackGrades, demo: true, persisted: false });
  } catch (error) {
    console.error("Grades API error:", error);
    return NextResponse.json({ error: "Failed to fetch grades" }, { status: 500 });
  }
}
