import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { teachingManager, assignmentFilter } from "@/lib/school/teaching-access";
import { lessonError, LessonError } from "@/lib/lessons/http";
export async function GET(request: Request) {
  try {
    const user = await teachingManager(request), params = new URL(request.url).searchParams;
    if (!user.schoolId) throw new LessonError("Select a school staff account to view student records.", 403);
    const assignments = await prisma.teacherAssignment.findMany({ where: { teacherId: user.userId, schoolId: user.schoolId } });
    if (user.role !== "SCHOOL_ADMIN" && !assignments.length) {
      if (params.get("lessonId")) throw new LessonError("Lesson not found.", 404);
      return NextResponse.json({ mastery: [], lessons: [], sections: [], assignments: [], limited: false });
    }
    const access = user.role === "SCHOOL_ADMIN" ? { schoolId: user.schoolId } : { schoolId: user.schoolId, OR: assignments.map(assignmentFilter) };
    // The explicit guard above must run before constructing an ORM OR filter.
    const from = params.get("from"), to = params.get("to");
    if ([from, to].some((value) => value && !/^\d{4}-\d{2}-\d{2}$/.test(value))) throw new LessonError("Invalid date filter.");
    const filters = { ...(params.get("grade") ? { grade: params.get("grade")! } : {}), ...(params.get("subject") ? { subject: params.get("subject")! } : {}), ...(params.get("chapter") ? { chapter: { contains: params.get("chapter")!, mode: "insensitive" as const } } : {}), ...(from || to ? { updatedAt: { ...(from ? { gte: new Date(from) } : {}), ...(to ? { lt: new Date(new Date(to).getTime() + 86400000) } : {}) } } : {}), ...(params.get("section") ? { student: { enrollments: { some: { schoolId: user.schoolId, sectionId: params.get("section")!, status: "ACTIVE" as const } } } } : {}) };
    const lessonId = params.get("lessonId");
    if (lessonId) {
      const lesson = await prisma.guruLesson.findFirst({ where: { AND: [access, { id: lessonId }] }, include: { turns: { orderBy: { createdAt: "asc" }, take: 100 }, student: { select: { name: true } } } });
      if (!lesson) throw new LessonError("Lesson not found.", 404);
      return NextResponse.json({ lesson });
    }
    const [mastery, lessons, sections] = await Promise.all([
      prisma.guruMastery.findMany({ where: { AND: [access, filters] }, include: { student: { select: { id: true, name: true } } }, orderBy: { updatedAt: "desc" }, take: 200 }),
      prisma.guruLesson.findMany({ where: { AND: [access, filters] }, include: { student: { select: { name: true } }, _count: { select: { turns: true } } }, orderBy: { updatedAt: "desc" }, take: 100 }),
      prisma.section.findMany({ where: { schoolClass: { schoolId: user.schoolId } }, select: { id: true, name: true } }),
    ]);
    return NextResponse.json({ mastery, lessons, sections, assignments, limited: mastery.length === 200 || lessons.length === 100 });
  } catch (error) { return lessonError(error); }
}
