import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { teachingManager, canManageSubject } from "@/lib/school/teaching-access";
import { lessonError, LessonError } from "@/lib/lessons/http";
import { embedTexts, embeddingModel } from "@/lib/rag/embeddings";
import { consumeFixedWindowRateLimit } from "@/lib/ai/rate-limit";
export const maxDuration = 300;
type Context = { params: Promise<{ id: string }> };
async function authorized(request: Request, context: Context, write = false) {
  const user = await teachingManager(request, write);
  const document = await prisma.curriculumDocument.findFirst({ where: { id: (await context.params).id, ...(user.role === "SUPER_ADMIN" ? {} : { schoolId: user.schoolId! }), ...(user.role === "TEACHER" ? { createdBy: user.userId } : {}) } });
  if (!document) throw new LessonError("Document not found.", 404);
  await canManageSubject(user, document.grade, document.subject);
  return { user, document };
}
export async function GET(request: Request, context: Context) {
  try { const { document } = await authorized(request, context); const page = Math.max(1, Number(new URL(request.url).searchParams.get("page")) || 1); return NextResponse.json({ document, chunks: await prisma.documentChunk.findMany({ where: { documentId: document.id, page }, select: { id: true, content: true, page: true }, orderBy: { ordinal: "asc" } }) }); } catch (error) { return lessonError(error); }
}
export async function PATCH(request: Request, context: Context) {
  try {
    const { user, document } = await authorized(request, context, true);
    const { action } = await request.json();
    if (!["index", "publish", "archive"].includes(action)) throw new LessonError("Invalid document action.");
    if (action === "index") {
      if (!consumeFixedWindowRateLimit(`index:${user.userId}`, 8, 3600000).allowed) throw new LessonError("Indexing limit reached.", 429);
      const extension = await prisma.$queryRaw<Array<{ installed: boolean }>>`SELECT EXISTS(SELECT 1 FROM pg_extension WHERE extname = 'vector') AS installed`;
      if (!extension[0]?.installed) throw new LessonError("Enable the PostgreSQL vector extension before indexing. See docs/GURU-AI-OPERATIONS.md.", 503);
      const lease = await prisma.curriculumDocument.updateMany({ where: { id: document.id, status: { in: ["DRAFT", "INDEX_FAILED", "INDEXED"] } }, data: { status: "INDEXING", error: null } });
      if (!lease.count) throw new LessonError("This document is already processing or published. Import a new draft to replace it.", 409);
      try {
        const chunks = await prisma.documentChunk.findMany({ where: { documentId: document.id }, orderBy: { ordinal: "asc" } });
        for (let offset = 0; offset < chunks.length; offset += 8) {
          const batch = chunks.slice(offset, offset + 8), vectors = await embedTexts(batch.map((chunk) => chunk.content), "passage", request.signal);
          await prisma.$transaction(batch.map((chunk, index) => prisma.documentChunk.update({ where: { id: chunk.id }, data: { embedding: vectors[index], embeddingModel: embeddingModel() } })));
        }
        await prisma.curriculumDocument.update({ where: { id: document.id }, data: { status: "INDEXED", embeddingModel: embeddingModel() } });
      } catch {
        await prisma.curriculumDocument.update({ where: { id: document.id }, data: { status: "INDEX_FAILED", error: "Embedding failed. Check the configured model, key, quota and connectivity, then retry." } });
        throw new LessonError("Embedding failed; the draft was retained and was not published. Check the embedding provider and retry.", 503);
      }
    } else {
      if (user.role === "TEACHER") throw new LessonError("A school administrator must approve publication or archiving.", 403);
      if (action === "publish" && document.status !== "INDEXED") throw new LessonError("Review and index the document before publishing.", 409);
      await prisma.curriculumDocument.update({ where: { id: document.id }, data: { status: action === "publish" ? "PUBLISHED" : "ARCHIVED" } });
    }
    await prisma.auditLog.create({ data: { userId: user.userId, action: `DOCUMENT_${action.toUpperCase()}`, entityType: "CurriculumDocument", entityId: document.id } });
    return NextResponse.json({ document: await prisma.curriculumDocument.findUnique({ where: { id: document.id } }) });
  } catch (error) { return lessonError(error); }
}
