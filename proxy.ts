import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth/jwt";
import { retiredWorkspaceDestination } from "@/lib/navigation/workspace";

const PROTECTED_PREFIXES = [
  "/admin",
  "/teacher",
  "/student",
  "/parent",
  "/school",
  "/classroom",
  "/dashboard",
];

const PUBLIC_API_PATHS = new Set([
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/logout",
  "/api/health",
  "/api/billing/plans",
]);

const ADMIN_ROLES = new Set(["SUPER_ADMIN"]);

function roleHome(role: string): string {
  if (role === "SUPER_ADMIN") return "/admin";
  if (role === "SCHOOL_ADMIN") return "/school";
  if (role === "TEACHER") return "/teacher";
  if (role === "PARENT") return "/parent";
  if (role === "STUDENT") return "/student/dashboard";
  return "/login?error=role_not_supported";
}

function isRoleAllowed(pathname: string, role: string): boolean {
  if (pathname.startsWith("/api/ai") || pathname.startsWith("/api/voice")) {
    return role === "STUDENT" || role === "TEACHER";
  }
  if (pathname === "/api/exams/generate") {
    return role === "STUDENT" || role === "TEACHER" || role === "SCHOOL_ADMIN" || role === "SUPER_ADMIN";
  }
  if (
    [
      "/api/practice",
      "/api/mastery",
      "/api/pathway",
      "/api/gamification",
      "/api/stem",
      "/api/offline",
      "/api/exams",
    ].some((prefix) => pathname.startsWith(prefix))
  ) {
    return role === "STUDENT";
  }
  if (pathname.startsWith("/api/billing")) {
    return role === "STUDENT" || role === "PARENT";
  }
  if (pathname.startsWith("/api/tutor")) {
    return role === "STUDENT" || role === "TEACHER";
  }
  if (pathname.startsWith("/api/learning")) return role === "STUDENT" || role === "TEACHER";
  if (pathname.startsWith("/teacher")) return role === "TEACHER";
  if (pathname === "/api/metrics") return ADMIN_ROLES.has(role);
  if (pathname === "/api/rag/index" || pathname === "/api/rag/stats") {
    return ADMIN_ROLES.has(role);
  }
  if (pathname.startsWith("/admin/rag")) {
    return ADMIN_ROLES.has(role);
  }
  if (pathname.startsWith("/api/admin/curriculum") || pathname.startsWith("/admin/curriculum")) {
    return ADMIN_ROLES.has(role);
  }
  if (pathname.startsWith("/api/admin") || pathname.startsWith("/admin")) {
    return ADMIN_ROLES.has(role);
  }
  if (pathname.startsWith("/api/teacher") || pathname.startsWith("/teacher")) {
    return role === "TEACHER" || role === "SCHOOL_ADMIN" || role === "SUPER_ADMIN";
  }
  if (pathname.startsWith("/api/school") || pathname.startsWith("/school")) {
    return role === "SCHOOL_ADMIN" || role === "SUPER_ADMIN";
  }
  if (pathname.startsWith("/api/parent") || pathname.startsWith("/parent")) {
    return role === "PARENT";
  }
  if (pathname.startsWith("/student")) return role === "STUDENT";
  if (pathname.startsWith("/api/classroom") || pathname.startsWith("/classroom")) {
    return role === "STUDENT" || role === "TEACHER" || role === "SCHOOL_ADMIN";
  }
  return true;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isApiRequest = pathname.startsWith("/api/");

  // Service callbacks have their own short-lived, lesson-scoped JWT verification.
  if (pathname === "/api/voice/agent") return NextResponse.next();

  if (isApiRequest && PUBLIC_API_PATHS.has(pathname)) {
    return NextResponse.next();
  }

  // Allow unrestricted access to the separate Admin Login page
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  const isProtected =
    isApiRequest || PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  if (!isProtected) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!token && isApiRequest) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  // All other protected routes (/student, /classroom, /teacher, /school, /parent, /dashboard)
  if (!token) {
    const loginUrl = new URL(pathname.startsWith("/admin") ? "/admin/login" : "/login", request.url);
    loginUrl.searchParams.set("returnUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const session = await verifySessionToken(token);

  if (!session) {
    if (isApiRequest) {
      const response = NextResponse.json({ error: "Invalid or expired session" }, { status: 401 });
      response.cookies.delete(SESSION_COOKIE_NAME);
      return response;
    }

    const loginUrl = new URL(pathname.startsWith("/admin") ? "/admin/login" : "/login", request.url);
    loginUrl.searchParams.set("error", "session_expired");
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete(SESSION_COOKIE_NAME);
    return response;
  }

  if (session.status !== "ACTIVE") {
    if (isApiRequest) {
      const response = NextResponse.json({ error: "Account is not active" }, { status: 403 });
      response.cookies.delete(SESSION_COOKIE_NAME);
      return response;
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("error", "account_inactive");
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete(SESSION_COOKIE_NAME);
    return response;
  }

  if (!isRoleAllowed(pathname, session.role)) {
    if (isApiRequest) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.redirect(new URL(roleHome(session.role), request.url));
  }

  const destination = !isApiRequest && retiredWorkspaceDestination(pathname);
  if (destination) return NextResponse.redirect(new URL(destination, request.url));
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/teacher/:path*",
    "/student/:path*",
    "/parent/:path*",
    "/school/:path*",
    "/classroom/:path*",
    "/dashboard",
    "/api/:path*",
  ],
};
