import { Prisma, RoleCode, UserStatus, type PrismaClient } from "@prisma/client";
import { z } from "zod";
import { loginSchema, registerSchema } from "../validation/auth";
import { hashPassword } from "./passwords";
import { authenticateDatabaseUser, normalizeLoginEmail } from "./database-login";

const SAFE_ERRORS = {
  INPUT: "Set valid BOOTSTRAP_SUPERADMIN_EMAIL, BOOTSTRAP_SUPERADMIN_NAME (2–100 characters), and a strong BOOTSTRAP_SUPERADMIN_PASSWORD (16+ characters, upper/lowercase, number, symbol; at most 72 UTF-8 bytes).",
  EXISTS: "Bootstrap refused: an account already uses that email. No existing account was changed.",
  CLOSED: "Bootstrap refused: a Super Admin assignment or completed bootstrap already exists. Use normal administrator management or account recovery.",
  VERIFY: "Bootstrap verification failed. The transaction was rolled back; no account was created.",
  DATABASE: "Bootstrap could not be confirmed. Check database access and migrations privately; inspect account state before retrying. No existing account was overwritten.",
  ENV: "Bootstrap requires a valid DATABASE_URL and readable server environment configuration.",
} as const;

export class SuperAdminBootstrapError extends Error {
  constructor(public code: keyof typeof SAFE_ERRORS) { super(SAFE_ERRORS[code]); }
}
export function bootstrapErrorMessage(error: unknown) {
  // Never echo raw Prisma/Zod/connection errors: they can include submitted values.
  return error instanceof SuperAdminBootstrapError ? SAFE_ERRORS[error.code] : SAFE_ERRORS.DATABASE;
}

const passwordSchema = z.string().min(16).max(72)
  .refine((value) => Buffer.byteLength(value, "utf8") <= 72)
  .refine((value) => /[A-Z]/.test(value) && /[a-z]/.test(value) && /[0-9]/.test(value) && /[^\p{L}\p{N}\s]/u.test(value))
  .refine((value) => !/[\p{Cc}]/u.test(value) && new Set(value).size >= 8)
  .refine((value) => !/password|changeme|qwerty|letmein|replace.?me/i.test(value));
const inputSchema = z.object({ email: loginSchema.shape.email.transform(normalizeLoginEmail), name: registerSchema.shape.name.refine((value) => !/[\p{Cc}]/u.test(value)), password: passwordSchema });
export type SuperAdminBootstrapInput = z.infer<typeof inputSchema>;

export function readSuperAdminBootstrapInput(env: Record<string, string | undefined>): SuperAdminBootstrapInput {
  const parsed = inputSchema.safeParse({ email: env.BOOTSTRAP_SUPERADMIN_EMAIL, name: env.BOOTSTRAP_SUPERADMIN_NAME, password: env.BOOTSTRAP_SUPERADMIN_PASSWORD });
  if (!parsed.success) throw new SuperAdminBootstrapError("INPUT");
  return parsed.data;
}

const BOOTSTRAP_ACTION = "FIRST_SUPER_ADMIN_BOOTSTRAP";

/** CLI-only operation. Importing this module never creates an account. */
export async function createFirstSuperAdmin(db: PrismaClient, input: SuperAdminBootstrapInput): Promise<void> {
  const checked = inputSchema.safeParse(input);
  if (!checked.success) throw new SuperAdminBootstrapError("INPUT");
  const values = checked.data;
  // Same salt/cost/hash utility as normal account creation. Do not trim/alter the password.
  const passwordHash = await hashPassword(values.password);
  await db.$transaction(async (tx) => {
    // Transaction-scoped lock works with Neon pooling and serializes bootstrap attempts.
    // READ COMMITTED lets the waiter see the first run's committed assignment/audit marker.
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(194728013, 1)`;
    const existing = await tx.user.findFirst({ where: { email: { equals: values.email, mode: "insensitive" } }, select: { id: true } });
    if (existing) throw new SuperAdminBootstrapError("EXISTS");
    const admin = await tx.userRole.findFirst({ where: { role: { code: RoleCode.SUPER_ADMIN } }, select: { id: true } });
    const used = await tx.auditLog.findFirst({ where: { action: BOOTSTRAP_ACTION }, select: { id: true } });
    if (admin || used) throw new SuperAdminBootstrapError("CLOSED");
    // Do not overwrite an existing role or seed unrelated roles/permissions.
    const role = await tx.role.findUnique({ where: { code: RoleCode.SUPER_ADMIN } })
      ?? await tx.role.create({ data: { code: RoleCode.SUPER_ADMIN, name: "Super Administrator" } });
    const created = await tx.user.create({ data: {
      email: values.email, name: values.name, passwordHash, status: UserStatus.ACTIVE,
      preferredLanguage: "en", userRoles: { create: { roleId: role.id, schoolId: null } },
    } });
    const verified = await authenticateDatabaseUser(tx, values.email, values.password);
    if (verified.outcome !== "authenticated" || verified.user.userId !== created.id || verified.user.role !== RoleCode.SUPER_ADMIN || verified.user.schoolId !== null || verified.user.status !== UserStatus.ACTIVE || created.id.startsWith("dev-")) throw new SuperAdminBootstrapError("VERIFY");
    await tx.auditLog.create({ data: { userId: created.id, action: BOOTSTRAP_ACTION, entityType: "User", entityId: created.id, changesJson: { role: RoleCode.SUPER_ADMIN, schoolId: null } } });
  }, { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted, maxWait: 15000, timeout: 30000 });
}
