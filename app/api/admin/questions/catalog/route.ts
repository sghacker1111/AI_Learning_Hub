import { NextResponse } from "next/server";
import { RoleCode } from "@prisma/client";
import { getSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const session = await getSessionUser();
  if (!session || session.role !== RoleCode.SUPER_ADMIN) {
    return NextResponse.json({ error: "Super Admin access is required." }, { status: 403 });
  }

  try {
    const grades = await prisma.grade.findMany({
      orderBy: { orderIndex: "asc" },
      select: {
        id: true,
        code: true,
        name: true,
        nameNepali: true,
        subjects: {
          orderBy: { orderIndex: "asc" },
          select: {
            id: true,
            code: true,
            name: true,
            nameNepali: true,
            units: {
              orderBy: { orderIndex: "asc" },
              select: {
                id: true,
                title: true,
                chapters: {
                  orderBy: { orderIndex: "asc" },
                  select: {
                    id: true,
                    chapterNumber: true,
                    title: true,
                    titleNepali: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ grades });
  } catch (error) {
    console.error("Question catalog query failed:", error);
    return NextResponse.json(
      { error: "Curriculum database is unavailable. Connect PostgreSQL and run migrations." },
      { status: 503 }
    );
  }
}
