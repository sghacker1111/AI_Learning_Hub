import { z } from "zod";
export const documentMetadataSchema = z.object({
  title: z.string().trim().min(3).max(200), source: z.string().trim().min(3).max(500),
  grade: z.string().regex(/^Class ([1-9]|1[0-2])$/), subject: z.string().trim().min(2).max(120),
  chapter: z.string().trim().min(2).max(200), topic: z.string().trim().max(200).default(""),
  language: z.enum(["en", "ne", "bilingual"]).default("en"),
  documentType: z.enum(["TEXTBOOK", "TEACHER_GUIDE", "LESSON_NOTE", "QUESTION_BANK"]).default("LESSON_NOTE"),
});
export function chunkPages(pages: string[], maxLength = 1600, overlap = 200) {
  if (maxLength < 200 || overlap < 0 || overlap >= maxLength) throw new Error("Invalid chunk size.");
  const chunks: { content: string; page: number; ordinal: number }[] = [];
  for (const [index, raw] of pages.entries()) {
    const text = raw.normalize("NFKC").replace(/\u0000/g, "").replace(/[ \t]+/g, " ").trim();
    for (let start = 0; start < text.length;) {
      let end = Math.min(start + maxLength, text.length);
      if (end < text.length) { const boundary = text.lastIndexOf(" ", end); if (boundary > start + maxLength / 2) end = boundary; }
      const content = text.slice(start, end).trim();
      if (content) chunks.push({ content, page: index + 1, ordinal: chunks.length });
      if (end === text.length) break;
      start = end - overlap;
    }
  }
  return chunks;
}
export function documentScope(schoolId: string | null) { return { OR: [{ schoolId: null }, ...(schoolId ? [{ schoolId }] : [])] }; }
