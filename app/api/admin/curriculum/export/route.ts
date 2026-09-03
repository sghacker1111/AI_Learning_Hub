import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const gradeCode = searchParams.get("grade") || "class-8";

    let curriculumData = null;
    try {
      curriculumData = await prisma.grade.findFirst({
        where: { code: gradeCode },
        include: {
          subjects: {
            include: {
              units: {
                include: {
                  chapters: {
                    include: {
                      lessons: {
                        include: {
                          contents: {
                            include: {
                              formulas: true,
                              workedExamples: true,
                              sourceReferences: true,
                            },
                          },
                          learningOutcomes: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });
    } catch {
      // Fallback
    }

    const payload = {
      curriculumVersion: "2081_REVISED",
      framework: "Nepal Curriculum Development Centre (CDC)",
      exportedAt: new Date().toISOString(),
      grade: gradeCode,
      data: curriculumData || {
        grade: "Class 8",
        subjects: [
          {
            code: "MTH-801",
            name: "Compulsory Mathematics",
            units: [
              {
                unitNumber: 1,
                title: "Sets",
                chapters: [
                  {
                    chapterNumber: 1,
                    title: "Overlapping Sets & Cardinality Formulas",
                    lessons: [
                      {
                        lessonNumber: 1,
                        title: "Cardinality of Two Overlapping Sets",
                        formula: "n(A ∪ B) = n(A) + n(B) - n(A ∩ B)",
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    };

    return new NextResponse(JSON.stringify(payload, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="nepal_cdc_${gradeCode}_syllabus_2081.json"`,
      },
    });
  } catch (error) {
    console.error("Curriculum export error:", error);
    return NextResponse.json({ error: "Failed to export curriculum" }, { status: 500 });
  }
}
