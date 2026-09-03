import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { MOCK_STUDENT_SUBJECTS } from "@/lib/constants/curriculum";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const gradeCode = searchParams.get("grade") || "class-8";

    try {
      const dbSubjects = await prisma.subject.findMany({
        where: {
          grade: {
            code: gradeCode,
          },
        },
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
        orderBy: { orderIndex: "asc" },
      });

      if (dbSubjects && dbSubjects.length > 0) {
        const formatted = dbSubjects.map((s) => ({
          id: s.id,
          code: s.code,
          name: s.name,
          nameNepali: s.nameNepali,
          creditHours: s.creditHours,
          unitsCount: s.units.length,
          chaptersCount: s.units.reduce((acc: number, u) => acc + u.chapters.length, 0),
          lessonsCount: s.units.reduce(
            (acc: number, u) => acc + u.chapters.reduce((cAcc: number, c) => cAcc + c.lessons.length, 0),
            0
          ),
        }));

        return NextResponse.json({ subjects: formatted });
      }
    } catch {
      // Fallback
    }

    // Default mock response for dev mode
    const fallbackSubjects = MOCK_STUDENT_SUBJECTS.map((s) => ({
      id: s.id,
      code: s.code,
      name: s.name,
      nameNepali: s.nameNepali,
      creditHours: 4,
      unitsCount: s.unitsCount,
      chaptersCount: s.chaptersCount,
      lessonsCount: s.chaptersCount * 3,
    }));

    return NextResponse.json({ subjects: fallbackSubjects, demo: true, persisted: false });
  } catch (error) {
    console.error("Subjects API error:", error);
    return NextResponse.json({ error: "Failed to fetch subjects" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { gradeId, code, name, nameNepali, creditHours } = body;

    if (!code || !name) {
      return NextResponse.json({ error: "Subject code and name are required" }, { status: 400 });
    }

    const created = await prisma.subject.create({
      data: {
        gradeId,
        code,
        name,
        nameNepali: nameNepali || name,
        creditHours: creditHours || 4,
        orderIndex: 99,
      },
    });

    return NextResponse.json({ success: true, persisted: true, subject: created });
  } catch (error) {
    console.error("Create subject API error:", error);
    return NextResponse.json({ error: "Failed to create subject" }, { status: 500 });
  }
}
