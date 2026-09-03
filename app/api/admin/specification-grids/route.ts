import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { specificationGridSchema } from "@/lib/validation/specification-grid";
export async function GET() {
  if ((await getSessionUser())?.role !== "SUPER_ADMIN") return NextResponse.json({ error: "Super Admin access required." }, { status: 403 });
  try { return NextResponse.json({ grids: await prisma.specificationGrid.findMany({ orderBy: { createdAt: "desc" }, take: 300 }) }); }
  catch { return NextResponse.json({ error: "Specification grid database unavailable." }, { status: 503 }); }
}
export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  if (user?.role !== "SUPER_ADMIN") return NextResponse.json({ error: "Super Admin access required." }, { status: 403 });
  const parsed = specificationGridSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  try {
    const input = parsed.data;
    const subject = await prisma.subject.findFirst({ where: { id: input.subjectId, gradeId: input.gradeId }, include: { units: { include: { chapters: true } } } });
    const chapterIds = new Set(subject?.units.flatMap((unit) => unit.chapters.map((chapter) => chapter.id)));
    if (!subject || input.rows.some((row) => !chapterIds.has(row.chapterId))) return NextResponse.json({ error: "Every grid chapter must belong to the selected class and subject." }, { status: 400 });
    if (await prisma.specificationGrid.findUnique({ where: { code: input.code } })) return NextResponse.json({ error: "A grid already uses this code. Choose a new version code." }, { status: 409 });
    const grid = await prisma.$transaction(async (tx) => {
      const saved = await tx.specificationGrid.create({ data: { ...input, rows: input.rows, createdBy: user.userId } });
      await tx.auditLog.create({ data: { userId: user.userId, action: "SPECIFICATION_GRID_CREATE", entityType: "SpecificationGrid", entityId: saved.id } });
      return saved;
    });
    return NextResponse.json({ grid }, { status: 201 });
  } catch { return NextResponse.json({ error: "Grid could not be saved. Check database connectivity and code uniqueness." }, { status: 503 }); }
}
