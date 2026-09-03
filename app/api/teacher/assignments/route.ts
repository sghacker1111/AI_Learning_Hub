import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { teachingManager } from "@/lib/school/teaching-access";
import { lessonError, LessonError } from "@/lib/lessons/http";
import { getCDCGradeCatalog } from "@/lib/constants/cdc-compulsory-catalog";
const schema = z.object({ schoolId: z.string().min(1).max(120), teacherId: z.string().min(1).max(120), grade: z.string().regex(/^Class ([1-9]|1[0-2])$/), subject: z.string().min(2).max(120), sectionId: z.string().max(120).default("") });
export async function GET(request: Request) {
  try {
    const user = await teachingManager(request);
    if (user.role === "TEACHER") throw new LessonError("Administrator access required.", 403);
    const where = user.role === "SUPER_ADMIN" ? {} : { id: user.schoolId! };
    const schools = await prisma.school.findMany({ where: { ...where, status: "ACTIVE" }, select: { id: true, name: true, userRoles: { where: { role: { code: "TEACHER" }, user: { status: "ACTIVE" } }, select: { user: { select: { id: true, name: true } } } }, schoolClasses: { select: { grade: { select: { name: true } }, sections: { select: { id: true, name: true } } } } } });
    return NextResponse.json({ schools, assignments: await prisma.teacherAssignment.findMany({ where: user.role === "SUPER_ADMIN" ? {} : { schoolId: user.schoolId! }, orderBy: { createdAt: "desc" }, take: 500 }) });
  } catch (error) { return lessonError(error); }
}
export async function POST(request: Request) {
  try {
    const user = await teachingManager(request, true);
    if (user.role === "TEACHER") throw new LessonError("Administrator access required.", 403);
    const parsed = schema.safeParse(await request.json()); if (!parsed.success) throw new LessonError("Invalid assignment.");
    const data = parsed.data;
    if (user.role !== "SUPER_ADMIN" && user.schoolId !== data.schoolId) throw new LessonError("School not accessible.", 403);
    if (!getCDCGradeCatalog(data.grade).subjects.some((subject) => subject.name === data.subject)) throw new LessonError("Choose a subject in the selected class.");
    const teacher = await prisma.userRole.findFirst({ where: { userId: data.teacherId, schoolId: data.schoolId, role: { code: "TEACHER" }, user: { status: "ACTIVE" }, school: { status: "ACTIVE" } } });
    if (!teacher) throw new LessonError("Choose an active teacher in this school.");
    if (data.sectionId && !await prisma.section.findFirst({ where: { id: data.sectionId, schoolClass: { schoolId: data.schoolId, grade: { name: data.grade } } } })) throw new LessonError("Section does not belong to this school and class.");
    const assignment = await prisma.$transaction(async (tx) => { const saved = await tx.teacherAssignment.upsert({ where: { schoolId_teacherId_grade_subject_sectionId: data }, create: data, update: {} }); await tx.auditLog.create({ data: { userId: user.userId, action: "TEACHER_ASSIGN", entityType: "TeacherAssignment", entityId: saved.id, changesJson: data } }); return saved; });
    return NextResponse.json({ assignment });
  } catch (error) { return lessonError(error); }
}
export async function DELETE(request: Request) {
  try {
    const user = await teachingManager(request, true), id = new URL(request.url).searchParams.get("id");
    if (user.role === "TEACHER" || !id) throw new LessonError("Administrator access required.", 403);
    const assignment = await prisma.teacherAssignment.findFirst({ where: { id, ...(user.role === "SUPER_ADMIN" ? {} : { schoolId: user.schoolId! }) } });
    if (!assignment) throw new LessonError("Assignment not found.", 404);
    await prisma.$transaction([prisma.teacherAssignment.delete({ where: { id } }), prisma.auditLog.create({ data: { userId: user.userId, action: "TEACHER_UNASSIGN", entityType: "TeacherAssignment", entityId: id, changesJson: assignment } })]);
    return NextResponse.json({ removed: true });
  } catch (error) { return lessonError(error); }
}
