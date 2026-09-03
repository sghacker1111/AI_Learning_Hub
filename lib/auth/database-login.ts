import { RoleCode, UserStatus, type Prisma } from "@prisma/client";
import { verifyPassword } from "./passwords";
import type { SessionPayload } from "./jwt";

const ROLE_PRIORITY: RoleCode[] = [RoleCode.SUPER_ADMIN, RoleCode.SCHOOL_ADMIN, RoleCode.TEACHER, RoleCode.PARENT, RoleCode.STUDENT];

export function normalizeLoginEmail(email: string) { return email.toLowerCase().trim(); }

export type DatabaseLoginResult =
  | { outcome: "authenticated"; found: true; user: SessionPayload }
  | { outcome: "invalid"; found: boolean }
  | { outcome: "inactive"; found: true };

/** Shared by normal login and bootstrap verification. No demo fallback or session bypass. */
export async function authenticateDatabaseUser(db: Pick<Prisma.TransactionClient, "user">, email: string, password: string): Promise<DatabaseLoginResult> {
  const account = await db.user.findUnique({ where: { email: normalizeLoginEmail(email) }, include: { userRoles: { include: { role: true } } } });
  if (!account?.passwordHash) return { outcome: "invalid", found: Boolean(account) };
  if (!await verifyPassword(password, account.passwordHash)) return { outcome: "invalid", found: true };
  if (account.status !== UserStatus.ACTIVE) return { outcome: "inactive", found: true };
  const assignedRoles = new Set(account.userRoles.map((assignment) => assignment.role.code));
  const role = ROLE_PRIORITY.find((code) => assignedRoles.has(code));
  if (!role) return { outcome: "invalid", found: true };
  const assignment = account.userRoles.find((item) => item.role.code === role && item.schoolId);
  return { outcome: "authenticated", found: true, user: {
    userId: account.id, email: account.email, name: account.name, role,
    status: account.status, schoolId: assignment?.schoolId ?? null, preferredLanguage: account.preferredLanguage,
  } };
}
