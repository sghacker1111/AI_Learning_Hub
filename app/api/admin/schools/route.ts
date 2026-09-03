import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { getSessionUser } from "@/lib/auth/session";
export async function GET() {
  if ((await getSessionUser())?.role !== "SUPER_ADMIN") return NextResponse.json({ error: "Super Admin access required." }, { status: 403 });
  try {
    const schools = await prisma.school.findMany({ select: { id: true, name: true, code: true, status: true, address: true, district: true, subscription: { select: { bundleCode: true, status: true } } }, orderBy: { name: "asc" }, take: 500 });
    return NextResponse.json({ schools });
  } catch { return NextResponse.json({ error: "School database unavailable." }, { status: 503 }); }
}
export async function PATCH(request: NextRequest) {
  const user = await getSessionUser();
  if (user?.role !== "SUPER_ADMIN") return NextResponse.json({ error: "Super Admin access required." }, { status: 403 });
  const parsed = z.object({ id: z.string().min(1).max(120), name: z.string().trim().min(3).max(160), status: z.enum(["ACTIVE", "SUSPENDED", "ARCHIVED", "HIDDEN"]) }).safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid school details." }, { status: 400 });
  try {
    const { id, ...data } = parsed.data;
    await prisma.$transaction(async (tx) => {
      await tx.school.update({ where: { id }, data });
      await tx.auditLog.create({ data: { userId: user.userId, action: "SCHOOL_UPDATE", entityType: "School", entityId: id, changesJson: data } });
    });
    return NextResponse.json({ saved: true });
  } catch { return NextResponse.json({ error: "School could not be updated." }, { status: 503 }); }
}
