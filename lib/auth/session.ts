import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { RoleCode, UserStatus } from "@prisma/client";
import { SESSION_COOKIE_NAME, verifySessionToken, SessionPayload } from "@/lib/auth/jwt";
import { prisma } from "@/lib/db/prisma";
import { isDemoAuthEnabled } from "@/lib/auth/demo-policy";

export function getRoleRedirectPath(role: RoleCode): string {
  switch (role) {
    case RoleCode.SUPER_ADMIN:
      return "/admin";
    case RoleCode.SCHOOL_ADMIN:
      return "/school";
    case RoleCode.TEACHER:
      return "/teacher";
    case RoleCode.PARENT:
      return "/parent";
    case RoleCode.STUDENT:
      return "/student/dashboard";
    default:
      return "/login?error=role_not_supported";
  }
}

export async function getSessionUser(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = await verifySessionToken(token);
  if (!payload) return null;

  // Only active accounts may use an existing session.
  if (payload.status !== UserStatus.ACTIVE) {
    return null;
  }

  if (payload.userId.startsWith("dev-")) return isDemoAuthEnabled() ? payload : null;
  // A signed cookie does not override an administrator's later suspension or role change.
  try {
    const current = await prisma.user.findUnique({ where: { id: payload.userId }, select: { status: true, userRoles: { include: { role: true, school: { select: { status: true } } } } } });
    if (!current || current.status !== UserStatus.ACTIVE) return null;
    const assignment = current.userRoles.find((item) => item.role.code === payload.role && (item.schoolId || null) === (payload.schoolId || null));
    if (!assignment || (assignment.school && assignment.school.status !== UserStatus.ACTIVE)) return null;
  } catch { return null; }

  return payload;
}

export async function requireUser(): Promise<SessionPayload> {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  if (user.status !== UserStatus.ACTIVE) {
    redirect("/login?error=account_inactive");
  }

  return user;
}

export async function requireRole(allowedRoles: RoleCode[]): Promise<SessionPayload> {
  const user = await requireUser();

  if (!allowedRoles.includes(user.role)) {
    // If user does not have permission, redirect to their designated home portal
    redirect(getRoleRedirectPath(user.role));
  }

  return user;
}
