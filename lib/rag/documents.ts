import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { embedTexts, embeddingModel } from "./embeddings";
import { documentScope } from "./document-contracts";
export interface LessonSource { chunkId: string; documentId: string; title: string; page: string; grade: string; subject: string; chapter: string; content: string }
export async function retrieveDocuments(input: { schoolId: string | null; grade: string; subject: string; chapter: string; topic?: string; query: string; topK: number; similarity: number; signal?: AbortSignal }) {
  const where = { ...documentScope(input.schoolId), grade: input.grade, subject: input.subject, chapter: input.chapter, status: "PUBLISHED", ...(input.topic ? { AND: [{ OR: [{ topic: "" }, { topic: input.topic }] }] } : {}) };
  const count = await prisma.curriculumDocument.count({ where });
  if (!count) return { authoritative: false, sources: [] as LessonSource[] };
  const model = embeddingModel();
  const [vector] = await embedTexts([input.query], "query", input.signal);
  // Cast a bound numeric array, never interpolate query text or tenant IDs into SQL.
  // pgvector's cosine operator searches only the authorized, published curriculum slice.
  const vectorLiteral = `[${vector.join(",")}]`;
  const rows = await prisma.$queryRaw<Array<{ id: string; documentId: string; content: string; page: number; title: string; grade: string; subject: string; chapter: string; score: number }>>(Prisma.sql`
    SELECT c."id", c."documentId", c."content", c."page", d."title", d."grade", d."subject", d."chapter",
      1 - (c."embedding"::vector <=> ${vectorLiteral}::vector) AS score
    FROM "DocumentChunk" c JOIN "CurriculumDocument" d ON d."id" = c."documentId"
    WHERE (d."schoolId" IS NULL OR d."schoolId" = ${input.schoolId})
      AND d."status" = 'PUBLISHED' AND d."grade" = ${input.grade} AND d."subject" = ${input.subject}
      AND d."chapter" = ${input.chapter} AND (${input.topic || ""} = '' OR d."topic" = '' OR d."topic" = ${input.topic || ""})
      AND c."embeddingModel" = ${model} AND cardinality(c."embedding") = ${vector.length}
    ORDER BY c."embedding"::vector <=> ${vectorLiteral}::vector LIMIT ${input.topK}`);
  return { authoritative: true, sources: rows.filter((row) => row.score >= input.similarity).map((row) => ({ chunkId: row.id, documentId: row.documentId, title: row.title, page: String(row.page), grade: row.grade, subject: row.subject, chapter: row.chapter, content: row.content })) };
}
