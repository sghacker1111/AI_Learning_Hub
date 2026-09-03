import { NextRequest, NextResponse } from "next/server";
import { RoleCode, UserStatus } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { authenticateDatabaseUser, normalizeLoginEmail } from "@/lib/auth/database-login";
import { createSessionToken, SESSION_COOKIE_NAME, SessionPayload } from "@/lib/auth/jwt";
import { getRoleRedirectPath } from "@/lib/auth/session";
import { loginSchema } from "@/lib/validation/auth";
import { isDemoAuthEnabled } from "@/lib/auth/demo-policy";

// Non-persistent development personas. Never insert these into the database.
const DEV_USERS: Record<string, { name: string; role: RoleCode; status: UserStatus }> = {
  "admin@ailearning.np": { name: "Super Administrator", role: RoleCode.SUPER_ADMIN, status: UserStatus.ACTIVE },
  "principal@demo.np": { name: "Ramesh Adhikari (Principal)", role: RoleCode.SCHOOL_ADMIN, status: UserStatus.ACTIVE },
  "teacher@demo.np": { name: "Sunita Thapa (Teacher)", role: RoleCode.TEACHER, status: UserStatus.ACTIVE },
  "student@demo.np": { name: "Aayush Sharma", role: RoleCode.STUDENT, status: UserStatus.ACTIVE },
  "parent@demo.np": { name: "Bikash Sharma (Parent)", role: RoleCode.PARENT, status: UserStatus.ACTIVE },
};

export async function GET() {
  return NextResponse.json({ demoAuthEnabled: isDemoAuthEnabled() }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.format() },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;
    const normalizedEmail = normalizeLoginEmail(email);

    let userPayload: SessionPayload | null = null;
    let databaseUnavailable = false;
    let databaseUserFound = false;

    try {
      const result = await authenticateDatabaseUser(prisma, normalizedEmail, password);
      databaseUserFound = result.found;
      if (result.outcome === "inactive") return NextResponse.json({ error: "This account is not active. Please contact the administrator." }, { status: 403 });
      if (result.outcome === "invalid" && result.found) return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
      if (result.outcome === "authenticated") userPayload = result.user;
    } catch {
      databaseUnavailable = true;
      if (process.env.NODE_ENV === "development") {
        console.warn("Login database is unavailable; checking the explicit development demo personas.");
      } else {
        console.error("Login database lookup failed.");
      }
    }

    if (!userPayload && !databaseUserFound && isDemoAuthEnabled() && DEV_USERS[normalizedEmail]) {
      const dev = DEV_USERS[normalizedEmail];
      const demoPassword = process.env.DEMO_PASSWORD || "password123";

      if (password !== demoPassword) {
        return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
      }

      if (dev.status !== UserStatus.ACTIVE) {
        return NextResponse.json(
          { error: "This account has been suspended." },
          { status: 403 }
        );
      }

      userPayload = {
        userId: `dev-${normalizedEmail}`,
        email: normalizedEmail,
        name: dev.name,
        role: dev.role,
        status: dev.status,
        preferredLanguage: "bilingual",
      };
    }

    if (!userPayload) {
      if (databaseUnavailable && !isDemoAuthEnabled()) {
        return NextResponse.json(
          { error: "Authentication service is temporarily unavailable." },
          { status: 503 }
        );
      }

      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const token = await createSessionToken(userPayload);
    const redirectUrl = getRoleRedirectPath(userPayload.role);

    const response = NextResponse.json({
      success: true,
      redirectUrl,
      user: {
        id: userPayload.userId,
        name: userPayload.name,
        email: userPayload.email,
        role: userPayload.role,
        status: userPayload.status,
      },
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login API error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during login." },
      { status: 500 }
    );
  }
}
