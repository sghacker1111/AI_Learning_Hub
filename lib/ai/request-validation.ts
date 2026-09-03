import { z } from "zod";

const aiMessageSchema = z
  .object({
    role: z.enum(["user", "assistant"]),
    content: z.string().trim().min(1).max(8000),
  })
  .strict();

export const completionRequestSchema = z
  .object({
    messages: z.array(aiMessageSchema).min(1).max(20),
    grade: z.string().trim().min(1).max(120).optional(),
    subject: z.string().trim().min(1).max(120).optional(),
    chapter: z.string().trim().min(1).max(120).optional(),
    socraticMode: z.boolean().optional(),
    language: z.enum(["en", "ne", "bilingual"]).optional(),
  })
  .strict()
  .refine(
    (value) => value.messages.reduce((total, message) => total + message.content.length, 0) <= 20000,
    { message: "Combined message content must be at most 20000 characters.", path: ["messages"] }
  );
