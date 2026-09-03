import { z } from "zod";
export const specificationGridSchema = z.object({
  code: z.string().trim().min(2).max(120).regex(/^[A-Za-z0-9_-]+$/, "Use letters, numbers, hyphens or underscores for the code."),
  title: z.string().trim().min(3).max(200), gradeId: z.string().min(1).max(100), subjectId: z.string().min(1).max(100),
  fullMarks: z.number().int().min(1).max(1000), durationMinutes: z.number().int().min(5).max(600),
  source: z.string().trim().max(500).default(""),
  rows: z.array(z.object({ chapterId: z.string().min(1).max(100), type: z.enum(["MCQ", "VERY_SHORT", "SHORT", "LONG", "NUMERICAL", "DIAGRAM", "ESSAY", "TRUE_FALSE", "FILL_BLANK"]), cognitiveLevel: z.enum(["KNOWLEDGE", "UNDERSTANDING", "APPLICATION", "HIGHER_ABILITY"]), count: z.number().int().min(1).max(100), marks: z.number().int().min(1).max(100) })).min(1).max(100),
}).refine((grid) => grid.rows.reduce((total, row) => total + row.count * row.marks, 0) === grid.fullMarks, { message: "Grid row marks must add up to the full marks.", path: ["fullMarks"] });
export type SpecificationGridInput = z.infer<typeof specificationGridSchema>;
