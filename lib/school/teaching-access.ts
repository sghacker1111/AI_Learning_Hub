import { prisma } from "@/lib/db/prisma";
import { getSessionUser } from "@/lib/auth/session";
import { assertSameOrigin, LessonError } from "@/lib/lessons/http";
import type { SessionPayload } from "@/lib/auth/jwt";
export async function teachingManager(request: Request, write = false) {
  if (write) assertSameOrigin(request);
  const user = await getSessionUser();
  if (!user || !["SUPER_ADMIN", "SCHOOL_ADMIN", "TEACHER"].includes(user.role)) throw new LessonError("Teaching staff access required.", 403);
  if (user.userId.startsWith("dev-") || (user.role !== "SUPER_ADMIN" && !user.schoolId)) throw new LessonError("Connect the database and use a real staff account.", 503);
  return user;
}
export async function canManageSubject(user: SessionPayload, grade: string, subject: string) {
  if (user.role === "SUPER_ADMIN" || user.role === "SCHOOL_ADMIN") return;
  const assignment = await prisma.teacherAssignment.findFirst({ where: { schoolId: user.schoolId!, teacherId: user.userId, grade, subject } });
  if (!assignment) throw new LessonError("Only assigned classes and subjects are accessible.", 403);
}
export function assignmentFilter(assignment: { schoolId: string; grade: string; subject: string; sectionId: string }) {
  return { schoolId: assignment.schoolId, grade: assignment.grade, subject: assignment.subject, student: { enrollments: { some: { schoolId: assignment.schoolId, status: "ACTIVE" as const, schoolClass: { grade: { name: assignment.grade } }, ...(assignment.sectionId ? { sectionId: assignment.sectionId } : {}) } } } };
}
