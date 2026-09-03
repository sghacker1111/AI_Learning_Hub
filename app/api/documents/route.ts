import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { teachingManager, canManageSubject } from "@/lib/school/teaching-access";
import { lessonError, LessonError } from "@/lib/lessons/http";
import { documentMetadataSchema, chunkPages } from "@/lib/rag/document-contracts";
import { boundedFormData, extractPdf } from "@/lib/rag/extract-pdf";
import { consumeFixedWindowRateLimit } from "@/lib/ai/rate-limit";
export const runtime = "nodejs";
export const maxDuration = 60;
export async function GET(request: Request) {
  try {
    const user = await teachingManager(request);
    const where = user.role === "SUPER_ADMIN" ? {} : { schoolId: user.schoolId!, ...(user.role === "TEACHER" ? { createdBy: user.userId } : {}) };
    return NextResponse.json({ documents: await prisma.curriculumDocument.findMany({ where, orderBy: { updatedAt: "desc" }, take: 100, include: { _count: { select: { chunks: true } } } }), canPublish: user.role !== "TEACHER" });
  } catch (error) { return lessonError(error); }
}
export async function POST(request: Request) {
  try {
    const user = await teachingManager(request, true);
    if (!consumeFixedWindowRateLimit(`pdf:${user.userId}`, 6, 3600000).allowed) throw new LessonError("Upload limit reached. Try again later.", 429);
    const form = await boundedFormData(request), file = form.get("file");
    const parsed = documentMetadataSchema.safeParse(Object.fromEntries([...form].filter(([key]) => key !== "file")));
    if (!parsed.success) throw new LessonError(parsed.error.issues[0].message);
    await canManageSubject(user, parsed.data.grade, parsed.data.subject);
    if (!(file instanceof File) || file.type !== "application/pdf") throw new LessonError("Choose a PDF file.");
    const bytes = new Uint8Array(await file.arrayBuffer()), pages = await extractPdf(bytes), chunks = chunkPages(pages);
    if (chunks.length > 200) throw new LessonError("Upload a smaller chapter (maximum 200 text chunks).");
    const document = await prisma.$transaction(async (tx) => {
      const saved = await tx.curriculumDocument.create({ data: { ...parsed.data, schoolId: user.role === "SUPER_ADMIN" ? null : user.schoolId!, createdBy: user.userId, pageCount: pages.length, sha256: createHash("sha256").update(bytes).digest("hex"), chunks: { create: chunks } } });
      await tx.auditLog.create({ data: { userId: user.userId, action: "CURRICULUM_PDF_IMPORT", entityType: "CurriculumDocument", entityId: saved.id, changesJson: { schoolId: saved.schoolId, pageCount: saved.pageCount } } });
      return saved;
    });
    return NextResponse.json({ document, preview: chunks.slice(0, 3), message: "Text extracted into a draft. Review the pages, then index and publish. Original PDF and raw audio are not retained." }, { status: 201 });
  } catch (error) { return lessonError(error); }
}
