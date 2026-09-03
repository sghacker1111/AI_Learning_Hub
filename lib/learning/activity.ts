import { z } from "zod";

export const learningActivitySchema = z.object({
  id: z.string().uuid(),
  kind: z.enum(["STARTED", "QUESTION", "COMPLETED", "EXAM"]),
  grade: z.string().trim().min(1).max(120),
  subject: z.string().trim().min(1).max(120),
  chapterId: z.string().trim().min(1).max(200),
  chapter: z.string().trim().min(1).max(200),
  topic: z.string().trim().max(200).default(""),
  question: z.string().max(4000).default(""),
  answer: z.string().max(16000).default(""),
  createdAt: z.string().datetime(),
  durationSeconds: z.number().int().min(0).max(86400).default(0),
  score: z.number().min(0).max(10000).nullable().default(null),
  maxScore: z.number().positive().max(10000).nullable().default(null),
}).refine((event) => event.score === null || (event.maxScore !== null && event.score <= event.maxScore), { message: "Invalid practice score." });

export type LearningActivity = z.infer<typeof learningActivitySchema>;
export function learningCacheKey(userId: string, schoolId?: string | null) {
  // Keep the original key for browser-only personas; never auto-import unknown-tenant data.
  return schoolId ? `guru.learning.v3.${JSON.stringify([userId, schoolId])}` : `guru.learning.v2.${userId}`;
}
export type ActivityInput = Omit<LearningActivity, "id" | "createdAt" | "durationSeconds" | "score" | "maxScore" | "topic" | "question" | "answer"> & Partial<Pick<LearningActivity, "durationSeconds" | "score" | "maxScore" | "topic" | "question" | "answer">>;
export function mergeActivities(...lists: LearningActivity[][]) {
  return [...new Map(lists.flat().map((item) => [item.id, item])).values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 1000);
}
export function summarizeLearning(events: LearningActivity[]) {
  const chapters = new Map<string, { grade: string; subject: string; chapterId: string; chapter: string; questions: number; completed: boolean; lastAt: string }>();
  for (const event of events) {
    if (event.kind === "EXAM") continue;
    const key = JSON.stringify([event.grade, event.subject, event.chapterId]);
    const entry = chapters.get(key) || { grade: event.grade, subject: event.subject, chapterId: event.chapterId, chapter: event.chapter, questions: 0, completed: false, lastAt: event.createdAt };
    if (event.kind === "QUESTION") entry.questions++;
    if (event.kind === "COMPLETED") entry.completed = true;
    if (event.createdAt > entry.lastAt) entry.lastAt = event.createdAt;
    chapters.set(key, entry);
  }
  const completed = [...chapters.values()].filter((item) => item.completed).length;
  const questions = events.filter((event) => event.kind === "QUESTION");
  const exams = events.filter((event) => event.kind === "EXAM");
  return { chapters: [...chapters.values()].sort((a,b) => b.lastAt.localeCompare(a.lastAt)), completed, completion: chapters.size ? Math.round(completed / chapters.size * 100) : 0, questions, exams, minutes: Math.round(events.reduce((sum, event) => sum + event.durationSeconds, 0) / 60), level: 1 + Math.floor((questions.length + completed * 5) / 10) };
}
