import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { teachingManager } from "@/lib/school/teaching-access";
import { lessonError, LessonError } from "@/lib/lessons/http";
import { hashPassword } from "@/lib/auth/passwords";
const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("profile"), name: z.string().trim().min(2).max(160), email: z.string().email().or(z.literal("")), phone: z.string().max(40) }),
  z.object({ action: z.literal("account"), name: z.string().trim().min(2).max(120), email: z.string().email().max(250), password: z.string().min(10).max(128), role: z.enum(["TEACHER", "STUDENT"]) }),
  z.object({ action: z.literal("status"), userId: z.string().min(1), status: z.enum(["ACTIVE", "SUSPENDED", "ARCHIVED"]) }),
  z.object({ action: z.literal("class"), gradeId: z.string().min(1), year: z.string().trim().min(2).max(60), start: z.string().date(), end: z.string().date(), section: z.string().trim().min(1).max(60) }),
  z.object({ action: z.literal("enroll"), studentId: z.string().min(1), schoolClassId: z.string().min(1), sectionId: z.string().min(1), rollNumber: z.coerce.number().int().min(1).max(10000) }),
]);
async function manager(request: Request, write = false) {
  const user = await teachingManager(request, write);
  if (user.role !== "SCHOOL_ADMIN" || !user.schoolId) throw new LessonError("A school administrator account is required.", 403);
  return { ...user, schoolId: user.schoolId as string };
}
export async function GET(request: Request) {
  try {
    const user = await manager(request);
    const [school, users, classes, grades] = await Promise.all([
      prisma.school.findUnique({ where: { id: user.schoolId }, select: { id: true, name: true, code: true, phone: true, email: true, subscription: true } }),
      prisma.userRole.findMany({ where: { schoolId: user.schoolId, role: { code: { in: ["TEACHER", "STUDENT"] } } }, select: { id: true, role: { select: { code: true } }, user: { select: { id: true, name: true, email: true, status: true, enrollments: { where: { schoolId: user.schoolId }, select: { id: true, status: true, rollNumber: true, section: { select: { name: true } }, schoolClass: { select: { name: true } } } } } } }, take: 500 }),
      prisma.schoolClass.findMany({ where: { schoolId: user.schoolId }, include: { sections: true, academicYear: true, grade: { select: { name: true } } }, orderBy: { createdAt: "desc" } }),
      prisma.grade.findMany({ select: { id: true, name: true, curriculumVersion: { select: { versionCode: true } } }, orderBy: { orderIndex: "asc" }, take: 100 }),
    ]);
    return NextResponse.json({ school, users, classes, grades, limited: users.length === 500 });
  } catch (error) { return lessonError(error); }
}
export async function POST(request: Request) {
  try {
    const user = await manager(request, true), parsed = schema.safeParse(await request.json());
    if (!parsed.success) throw new LessonError(parsed.error.issues[0].message);
    const data = parsed.data;
    if (data.action === "profile") await prisma.school.update({ where: { id: user.schoolId }, data: { name: data.name, email: data.email || null, phone: data.phone || null } });
    if (data.action === "account") {
      if (await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } })) throw new LessonError("This email already has an account. Ask Super Admin to review existing access.", 409);
      const role = await prisma.role.findUnique({ where: { code: data.role } }); if (!role) throw new LessonError("Initialize database roles first.", 503);
      await prisma.user.create({ data: { name: data.name, email: data.email.toLowerCase(), passwordHash: await hashPassword(data.password), userRoles: { create: { roleId: role.id, schoolId: user.schoolId } } } });
    }
    if (data.action === "status") {
      const assignments = await prisma.userRole.findMany({ where: { userId: data.userId }, include: { role: true } });
      if (!assignments.length || assignments.some((item) => item.schoolId !== user.schoolId || !["TEACHER", "STUDENT"].includes(item.role.code))) throw new LessonError("This account cannot be changed by this school. Contact Super Admin.", 403);
      await prisma.user.update({ where: { id: data.userId }, data: { status: data.status, archivedAt: data.status === "ARCHIVED" ? new Date() : null } });
    }
    if (data.action === "class") {
      if (data.end <= data.start) throw new LessonError("Academic year must end after it starts.");
      const grade = await prisma.grade.findUnique({ where: { id: data.gradeId } }); if (!grade) throw new LessonError("Choose a valid curriculum class.");
      await prisma.$transaction(async (tx) => {
        const year = await tx.academicYear.upsert({ where: { schoolId_name: { schoolId: user.schoolId, name: data.year } }, create: { schoolId: user.schoolId, name: data.year, startDate: new Date(data.start), endDate: new Date(data.end) }, update: {} });
        const schoolClass = await tx.schoolClass.upsert({ where: { schoolId_academicYearId_gradeId: { schoolId: user.schoolId, academicYearId: year.id, gradeId: grade.id } }, create: { schoolId: user.schoolId, academicYearId: year.id, gradeId: grade.id, name: grade.name }, update: {} });
        await tx.section.upsert({ where: { schoolClassId_name: { schoolClassId: schoolClass.id, name: data.section } }, create: { schoolClassId: schoolClass.id, name: data.section }, update: {} });
      });
    }
    if (data.action === "enroll") {
      const student = await prisma.userRole.findFirst({ where: { userId: data.studentId, schoolId: user.schoolId, role: { code: "STUDENT" }, user: { status: "ACTIVE" } } });
      const schoolClass = await prisma.schoolClass.findFirst({ where: { id: data.schoolClassId, schoolId: user.schoolId, sections: { some: { id: data.sectionId } } } });
      if (!student || !schoolClass) throw new LessonError("Student, class and section must belong to your school.");
      await prisma.enrollment.upsert({ where: { studentId_schoolId_academicYearId: { studentId: data.studentId, schoolId: user.schoolId, academicYearId: schoolClass.academicYearId } }, create: { studentId: data.studentId, schoolId: user.schoolId, academicYearId: schoolClass.academicYearId, schoolClassId: schoolClass.id, sectionId: data.sectionId, rollNumber: data.rollNumber }, update: { schoolClassId: schoolClass.id, sectionId: data.sectionId, rollNumber: data.rollNumber, status: "ACTIVE" } });
    }
    await prisma.auditLog.create({ data: { userId: user.userId, action: `SCHOOL_${data.action.toUpperCase()}`, entityType: "School", entityId: user.schoolId } });
    return NextResponse.json({ saved: true });
  } catch (error) { return lessonError(error); }
}
