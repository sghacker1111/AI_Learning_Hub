import { NextRequest, NextResponse } from "next/server";
import { RoleCode } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { getSessionUser } from "@/lib/auth/session";

const ASSIGNABLE_ROLES = new Set<RoleCode>([
  RoleCode.SUPER_ADMIN,
  RoleCode.SCHOOL_ADMIN,
  RoleCode.TEACHER,
  RoleCode.STUDENT,
  RoleCode.PARENT,
]);

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== RoleCode.SUPER_ADMIN) {
      return NextResponse.json({ error: "Unauthorized: Super Admin role required to modify user roles." }, { status: 403 });
    }

    const { id } = await context.params;
    const { role } = await request.json();

    if (!ASSIGNABLE_ROLES.has(role)) {
      return NextResponse.json({ error: "Invalid or retired role value" }, { status: 400 });
    }

    if (id === session.userId && role !== RoleCode.SUPER_ADMIN) {
      return NextResponse.json(
        { error: "A Super Admin cannot remove their own administrative role." },
        { status: 400 }
      );
    }

    const [dbRole, targetUser] = await Promise.all([
      prisma.role.findUnique({ where: { code: role } }),
      prisma.user.findUnique({ where: { id }, select: { id: true } }),
    ]);

    if (!dbRole || !targetUser) {
      return NextResponse.json({ error: "User or role not found" }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.userRole.deleteMany({ where: { userId: id, schoolId: null } });
      await tx.userRole.create({ data: { userId: id, roleId: dbRole.id } });
      await tx.auditLog.create({
        data: {
          userId: session.userId,
          action: "ROLE_ASSIGNMENT",
          entityType: "User",
          entityId: id,
          changesJson: { assignedRole: role },
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: `User role updated to ${role}`,
      userId: id,
      newRole: role,
    });
  } catch (error) {
    console.error("Change role API error:", error);
    return NextResponse.json({ error: "Failed to update user role" }, { status: 500 });
  }
}
