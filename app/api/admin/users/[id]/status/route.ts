import { NextRequest, NextResponse } from "next/server";
import { UserStatus, RoleCode } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { getSessionUser } from "@/lib/auth/session";

const ADMIN_ROLES: RoleCode[] = [
  RoleCode.SUPER_ADMIN,
];

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionUser();
    if (!session || !ADMIN_ROLES.includes(session.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await context.params;
    const { status, reason } = await request.json();

    if (!Object.values(UserStatus).includes(status)) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    }

    if (id === session.userId && status !== UserStatus.ACTIVE) {
      return NextResponse.json(
        { error: "A Super Admin cannot deactivate their own account." },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id },
        data: {
          status,
          archivedAt: status === UserStatus.ARCHIVED ? new Date() : null,
        },
      });

      // Write to AuditLog
      await tx.auditLog.create({
        data: {
          userId: session.userId,
          action: "USER_STATUS_CHANGE",
          entityType: "User",
          entityId: id,
          changesJson: {
            previousStatus: existingUser.status,
            newStatus: status,
            reason: reason || "Administrative update",
          },
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: `User status changed to ${status}`,
      userId: id,
      newStatus: status,
    });
  } catch (error) {
    console.error("Change status API error:", error);
    return NextResponse.json({ error: "Failed to update user status" }, { status: 500 });
  }
}
