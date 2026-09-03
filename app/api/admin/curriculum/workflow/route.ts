import { NextRequest, NextResponse } from "next/server";
import { ContentStatus, RoleCode } from "@prisma/client";
import { getSessionUser } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";

const ACTIONS: Record<string, { status: ContentStatus; roles: RoleCode[] }> = {
  SUBMIT: {
    status: ContentStatus.SUBMITTED,
    roles: [RoleCode.SUPER_ADMIN],
  },
  START_REVIEW: {
    status: ContentStatus.UNDER_REVIEW,
    roles: [RoleCode.SUPER_ADMIN],
  },
  REQUEST_REVISION: {
    status: ContentStatus.DRAFT,
    roles: [RoleCode.SUPER_ADMIN],
  },
  APPROVE: {
    status: ContentStatus.APPROVED,
    roles: [RoleCode.SUPER_ADMIN],
  },
  PUBLISH: {
    status: ContentStatus.PUBLISHED,
    roles: [RoleCode.SUPER_ADMIN],
  },
  ARCHIVE: {
    status: ContentStatus.ARCHIVED,
    roles: [RoleCode.SUPER_ADMIN],
  },
};

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const body = await request.json();
    const lessonId = typeof body.lessonId === "string" ? body.lessonId : "";
    const action = typeof body.action === "string" ? body.action : "";
    const transition = ACTIONS[action];
    if (!lessonId || !transition) {
      return NextResponse.json({ error: "A valid lessonId and workflow action are required." }, { status: 400 });
    }
    if (!transition.roles.includes(session.role)) {
      return NextResponse.json({ error: "Your role cannot perform this workflow action." }, { status: 403 });
    }

    const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found." }, { status: 404 });
    }
    const updated = await prisma.lesson.update({
      where: { id: lessonId },
      data: { status: transition.status },
    });

    return NextResponse.json({
      success: true,
      persisted: true,
      lessonId,
      action,
      previousStatus: lesson.status,
      newStatus: updated.status,
      updatedBy: session.name,
      updatedAt: updated.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error("Workflow API error:", error);
    return NextResponse.json({ error: "Failed to transition workflow status." }, { status: 500 });
  }
}
