import { NextRequest, NextResponse } from "next/server";
import {
  RoleCode,
  SchoolBundleCode,
  SchoolSubscriptionStatus,
  SubscriptionBillingCycle,
  UserStatus,
} from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { getSessionUser } from "@/lib/auth/session";
import { hashPassword } from "@/lib/auth/passwords";
import { z } from "zod";

interface AdminUserResponse {
  id: string;
  name: string;
  email: string;
  status: UserStatus;
  role: RoleCode;
  createdAt: string;
  schoolName: string;
  bundleCode?: SchoolBundleCode;
  subscriptionStatus?: SchoolSubscriptionStatus;
}

const ADMIN_ROLES: RoleCode[] = [RoleCode.SUPER_ADMIN];
const ACTIVE_ROLES = new Set<RoleCode>([
  RoleCode.SUPER_ADMIN,
  RoleCode.SCHOOL_ADMIN,
  RoleCode.TEACHER,
  RoleCode.STUDENT,
  RoleCode.PARENT,
]);

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || !ADMIN_ROLES.includes(session.role)) {
      return NextResponse.json({ error: "Forbidden: Admin access required." }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.toLowerCase() || "";
    const roleFilter = searchParams.get("role");
    const statusFilter = searchParams.get("status");
    const requestedPage = parseInt(searchParams.get("page") || "1", 10);
    const requestedLimit = parseInt(searchParams.get("limit") || "10", 10);
    const page = Number.isFinite(requestedPage) ? Math.max(1, requestedPage) : 1;
    const limit = Number.isFinite(requestedLimit)
      ? Math.min(100, Math.max(1, requestedLimit))
      : 10;

    let users: AdminUserResponse[] = [];
    const demo = false;

    try {
      const dbUsers = await prisma.user.findMany({
        include: {
          userRoles: {
            include: {
              role: true,
              school: { include: { subscription: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      users = dbUsers.map((u) => {
        const assignment = u.userRoles.find((item) => ACTIVE_ROLES.has(item.role.code));
        return {
          id: u.id,
          name: u.name,
          email: u.email,
          status: u.status,
          role: assignment?.role.code || RoleCode.STUDENT,
          createdAt: u.createdAt.toISOString(),
          schoolName: assignment?.school?.name || "General",
          bundleCode: assignment?.school?.subscription?.bundleCode,
          subscriptionStatus: assignment?.school?.subscription?.status,
        };
      });
    } catch {
      return NextResponse.json({ error: "User database is unavailable. Connect PostgreSQL to manage accounts." }, { status: 503 });
    }

    // Apply filtering
    if (search) {
      users = users.filter(
        (u) =>
          u.name.toLowerCase().includes(search) ||
          u.email.toLowerCase().includes(search) ||
          u.schoolName.toLowerCase().includes(search)
      );
    }

    if (roleFilter && roleFilter !== "ALL") {
      users = users.filter((u) => u.role === roleFilter);
    }

    if (statusFilter && statusFilter !== "ALL") {
      users = users.filter((u) => u.status === statusFilter);
    }

    const total = users.length;
    const startIndex = (page - 1) * limit;
    const paginatedUsers = users.slice(startIndex, startIndex + limit);

    return NextResponse.json({
      demo,
      users: paginatedUsers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Admin Users API error:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

const provisionSchoolSchema = z.object({
  schoolName: z.string().trim().min(3).max(160),
  schoolCode: z.string().trim().min(2).max(40).regex(/^[A-Za-z0-9_-]+$/),
  schoolEmail: z.string().trim().email().optional().or(z.literal("")),
  address: z.string().trim().max(240).optional().default(""),
  district: z.string().trim().max(80).optional().default(""),
  adminName: z.string().trim().min(2).max(120),
  adminEmail: z.string().trim().email(),
  password: z.string().min(10).max(128),
  bundleCode: z.nativeEnum(SchoolBundleCode),
  billingCycle: z.nativeEnum(SubscriptionBillingCycle),
  subscriptionStatus: z.enum(["TRIALING", "ACTIVE"]),
});

export async function POST(request: NextRequest) {
  const session = await getSessionUser();
  if (!session || session.role !== RoleCode.SUPER_ADMIN) {
    return NextResponse.json({ error: "Super Admin access is required." }, { status: 403 });
  }

  const parsed = provisionSchoolSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid school account data." },
      { status: 400 }
    );
  }

  const input = parsed.data;
  const normalizedEmail = input.adminEmail.toLowerCase();
  const schoolCode = input.schoolCode.toUpperCase();
  const passwordHash = await hashPassword(input.password);
  const now = new Date();
  const endsAt = new Date(now);
  if (input.billingCycle === SubscriptionBillingCycle.MONTHLY) {
    endsAt.setMonth(endsAt.getMonth() + 1);
  } else {
    endsAt.setFullYear(endsAt.getFullYear() + 1);
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const duplicateUser = await tx.user.findUnique({ where: { email: normalizedEmail } });
      if (duplicateUser) throw new Error("ADMIN_EMAIL_EXISTS");
      const duplicateSchool = await tx.school.findUnique({ where: { code: schoolCode } });
      if (duplicateSchool) throw new Error("SCHOOL_CODE_EXISTS");
      const schoolAdminRole = await tx.role.findUnique({ where: { code: RoleCode.SCHOOL_ADMIN } });
      if (!schoolAdminRole) throw new Error("ROLE_NOT_INITIALIZED");

      const school = await tx.school.create({
        data: {
          name: input.schoolName,
          code: schoolCode,
          email: input.schoolEmail || null,
          address: input.address || null,
          district: input.district || null,
          status: UserStatus.ACTIVE,
        },
      });
      const admin = await tx.user.create({
        data: {
          name: input.adminName,
          email: normalizedEmail,
          passwordHash,
          status: UserStatus.ACTIVE,
          preferredLanguage: "bilingual",
        },
      });
      await tx.userRole.create({ data: { userId: admin.id, roleId: schoolAdminRole.id, schoolId: school.id } });
      const subscription = await tx.schoolSubscription.create({
        data: {
          schoolId: school.id,
          bundleCode: input.bundleCode,
          billingCycle: input.billingCycle,
          status: input.subscriptionStatus as SchoolSubscriptionStatus,
          startsAt: now,
          endsAt,
          source: input.subscriptionStatus === "ACTIVE" ? "MANUAL_ADMIN_PAYMENT_CONFIRMED" : "MANUAL_ADMIN_TRIAL",
        },
      });
      await tx.auditLog.create({
        data: {
          userId: session.userId,
          action: "SCHOOL_ACCOUNT_PROVISION",
          entityType: "School",
          entityId: school.id,
          changesJson: { bundleCode: subscription.bundleCode, status: subscription.status, adminUserId: admin.id },
        },
      });
      return { school, admin, subscription };
    });

    return NextResponse.json(
      {
        success: true,
        user: {
          id: result.admin.id,
          name: result.admin.name,
          email: result.admin.email,
          status: result.admin.status,
          role: RoleCode.SCHOOL_ADMIN,
          createdAt: result.admin.createdAt.toISOString(),
          schoolName: result.school.name,
          bundleCode: result.subscription.bundleCode,
          subscriptionStatus: result.subscription.status,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "ADMIN_EMAIL_EXISTS") return NextResponse.json({ error: "That administrator email already exists." }, { status: 409 });
    if (message === "SCHOOL_CODE_EXISTS") return NextResponse.json({ error: "That school code already exists." }, { status: 409 });
    if (message === "ROLE_NOT_INITIALIZED") return NextResponse.json({ error: "School Admin role is not initialized. Run the seed." }, { status: 503 });
    console.error("School account provisioning failed:", error);
    return NextResponse.json({ error: "School account could not be created." }, { status: 503 });
  }
}
