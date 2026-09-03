import { z } from "zod";

export const curriculumContentImportSchema = z.object({
  gradeId: z.string().trim().min(1).max(100),
  subjectId: z.string().trim().min(1).max(100),
  chapterId: z.string().trim().min(1).max(100),
  lessonNumber: z.number().int().min(1).max(999),
  lessonTitle: z.string().trim().min(2).max(300),
  lessonTitleNepali: z.string().trim().max(300).optional().default(""),
  topicTitle: z.string().trim().max(300).optional().default(""),
  contentTitle: z.string().trim().min(2).max(300),
  bodyEnglish: z.string().trim().min(20).max(100_000),
  bodyNepali: z.string().trim().max(100_000).optional().default(""),
  formulas: z.array(z.string().trim().min(1).max(2000)).max(50).default([]),
  sourceTitle: z.string().trim().min(2).max(500),
  editionYear: z.string().trim().min(2).max(50),
  pageNumber: z.string().trim().max(100).optional().default(""),
  sourceUrl: z.string().trim().url().max(2000).optional().or(z.literal("")).default(""),
});

export type CurriculumContentImport = z.infer<typeof curriculumContentImportSchema>;

