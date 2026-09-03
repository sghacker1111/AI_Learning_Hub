import { z } from "zod";

const optionSchema = z.object({
  optionText: z.string().trim().min(1).max(2000),
  isCorrect: z.boolean(),
  explanation: z.string().trim().max(4000).optional().default(""),
});

export const questionBankSchema = z
  .object({
    gradeId: z.string().trim().min(1).max(100),
    subjectId: z.string().trim().min(1).max(100),
    chapterId: z.string().trim().min(1).max(100),
    type: z.enum([
      "MCQ",
      "TRUE_FALSE",
      "FILL_BLANK",
      "VERY_SHORT",
      "SHORT",
      "LONG",
      "NUMERICAL",
      "DIAGRAM",
      "ESSAY",
    ]),
    questionText: z.string().trim().min(3).max(12000),
    questionNepali: z.string().trim().max(12000).optional().default(""),
    solution: z.string().trim().max(20000).optional().default(""),
    difficulty: z.enum(["EASY", "MEDIUM", "HARD", "EXPERT"]).default("MEDIUM"),
    cognitiveLevel: z
      .enum(["KNOWLEDGE", "UNDERSTANDING", "APPLICATION", "HIGHER_ABILITY"])
      .default("UNDERSTANDING"),
    marks: z.number().int().min(1).max(100),
    status: z.enum(["DRAFT", "APPROVED", "PUBLISHED"]).default("APPROVED"),
    specificationGridCode: z.string().trim().max(120).optional().default(""),
    isExamQuestion: z.boolean().default(false),
    sourceTitle: z.string().trim().max(500).optional().default(""),
    sourceEdition: z.string().trim().max(80).optional().default(""),
    sourcePage: z.string().trim().max(100).optional().default(""),
    options: z.array(optionSchema).max(6).default([]),
  })
  .superRefine((value, context) => {
    if (value.isExamQuestion && !value.specificationGridCode) context.addIssue({ code: z.ZodIssueCode.custom, path: ["specificationGridCode"], message: "Exam questions require a saved specification grid." });
    if (value.type === "MCQ") {
      if (value.options.length < 2) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["options"],
          message: "MCQs require at least two options.",
        });
      }
      if (value.options.filter((option) => option.isCorrect).length !== 1) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["options"],
          message: "Select exactly one correct MCQ option.",
        });
      }
    } else if (value.options.length > 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["options"],
        message: "Only MCQ questions can contain answer options.",
      });
    }
  });

export type QuestionBankInput = z.infer<typeof questionBankSchema>;
