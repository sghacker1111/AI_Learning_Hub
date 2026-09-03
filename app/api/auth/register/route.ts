import { isDemoAuthEnabled } from "@/lib/auth/demo-policy";
import { NextRequest, NextResponse } from "next/server";
import { RoleCode, UserStatus } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { hashPassword } from "@/lib/auth/passwords";
import { createSessionToken, SESSION_COOKIE_NAME, SessionPayload } from "@/lib/auth/jwt";
import { getRoleRedirectPath } from "@/lib/auth/session";
import { registerSchema } from "@/lib/validation/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = registerSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.format() },
        { status: 400 }
      );
    }

    const { name, email, password, role } = validation.data;
    const normalizedEmail = email.toLowerCase().trim();
    const roleEnum = role as RoleCode;
    const allowDemo = isDemoAuthEnabled();

    const passwordHash = await hashPassword(password);
    let userId: string | null = null;
    let persisted = false;

    try {
      // Check existing email in database
      const existing = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (existing) {
        return NextResponse.json(
          { error: "An account with this email address already exists." },
          { status: 409 }
        );
      }

      // Find or create role in database
      const dbRole = await prisma.role.findUnique({
        where: { code: roleEnum },
      });

      if (!dbRole) {
        return NextResponse.json(
          { error: "Account roles are not initialized. Run the database seed first." },
          { status: 503 }
        );
      }

      const user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          name,
          passwordHash,
          status: UserStatus.ACTIVE,
          preferredLanguage: "bilingual",
          userRoles: {
            create: {
              roleId: dbRole.id,
            },
          },
        },
      });

      userId = user.id;
      persisted = true;
    } catch {
      if (process.env.NODE_ENV === "development") {
        console.warn("Registration database is unavailable; using a non-persistent development session if enabled.");
      } else {
        console.error("Registration database write failed.");
      }
      if (!allowDemo) {
        return NextResponse.json(
          { error: "Registration service is temporarily unavailable." },
          { status: 503 }
        );
      }
    }

    userId ??= `demo-user-${Date.now()}`;

    const userPayload: SessionPayload = {
      userId,
      email: normalizedEmail,
      name,
      role: roleEnum,
      status: UserStatus.ACTIVE,
      preferredLanguage: "bilingual",
    };

    const token = await createSessionToken(userPayload);
    const redirectUrl = getRoleRedirectPath(roleEnum);

    const response = NextResponse.json({
      success: true,
      persisted,
      warning: persisted ? undefined : "Development demo session only; the account was not saved.",
      redirectUrl,
      user: {
        id: userPayload.userId,
        name: userPayload.name,
        email: userPayload.email,
        role: userPayload.role,
      },
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Register API error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during registration." },
      { status: 500 }
    );
  }
}
