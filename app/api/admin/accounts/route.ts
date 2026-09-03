import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { getSessionUser } from "@/lib/auth/session";
import { hashPassword } from "@/lib/auth/passwords";
const schema = z.object({ name: z.string().trim().min(2).max(120), email: z.string().trim().email().max(250), password: z.string().min(10).max(128), role: z.enum(["STUDENT", "TEACHER", "SCHOOL_ADMIN"]), schoolId: z.string().min(1).max(120) });
export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  if (user?.role !== "SUPER_ADMIN") return NextResponse.json({ error: "Super Admin access required." }, { status: 403 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid account data." }, { status: 400 });
  const input = parsed.data;
  try {
    const school = await prisma.school.findFirst({ where: { id: input.schoolId, status: "ACTIVE" } });
    if (!school) return NextResponse.json({ error: "Select an active school." }, { status: 400 });
    const existing = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } });
    if (existing) return NextResponse.json({ error: "This email already has an account." }, { status: 409 });
    const role = await prisma.role.findUnique({ where: { code: input.role } });
    if (!role) return NextResponse.json({ error: "Initialize the database roles first." }, { status: 503 });
    const passwordHash = await hashPassword(input.password);
    const created = await prisma.$transaction(async (tx) => {
      const account = await tx.user.create({ data: { name: input.name, email: input.email.toLowerCase(), passwordHash, userRoles: { create: { roleId: role.id, schoolId: school.id } } } });
      await tx.auditLog.create({ data: { userId: user.userId, action: "USER_CREATE", entityType: "User", entityId: account.id, changesJson: { role: input.role, schoolId: school.id } } });
      return account;
    });
    return NextResponse.json({ user: { id: created.id, name: created.name, email: created.email, status: created.status, role: input.role, schoolName: school.name, createdAt: created.createdAt.toISOString() } }, { status: 201 });
  } catch { return NextResponse.json({ error: "Account could not be saved. Check the database connection and email uniqueness." }, { status: 503 }); }
}
