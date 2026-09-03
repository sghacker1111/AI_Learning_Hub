import { z } from "zod";
import { GURU_CHAPTERS, GURU_SUBJECTS, type GuruGrade, type GuruSubject } from "@/lib/guru-ai/catalog";
import { getCDCGradeCatalog } from "@/lib/constants/cdc-compulsory-catalog";

export const lessonSelectionSchema = z.object({
  grade: z.string().max(30), subject: z.string().max(60), chapterId: z.string().min(1).max(200),
  topic: z.string().trim().max(200).default(""), language: z.enum(["en", "ne", "bilingual"]).default("en"),
  persona: z.enum(["ram_sir", "sita_maam"]).default("ram_sir"), curriculumOnly: z.boolean().default(true),
}).superRefine((value, ctx) => {
  if (!GURU_CHAPTERS[value.grade as GuruGrade]?.[value.subject as GuruSubject]?.some((chapter) => chapter.id === value.chapterId))
    ctx.addIssue({ code: "custom", message: "Select a valid class, subject and chapter." });
});
export function resolveLessonSelection(value: z.infer<typeof lessonSelectionSchema>) {
  const grade = value.grade as GuruGrade, subject = value.subject as GuruSubject;
  const chapter = GURU_CHAPTERS[grade][subject].find((item) => item.id === value.chapterId)!;
  return { ...value, subjectKey: subject,
    subject: getCDCGradeCatalog(grade).subjects.find((item) => item.key === subject)?.name || GURU_SUBJECTS[subject].curriculumName,
    chapter: chapter.title, objective: `Explain and apply ${value.topic || chapter.title}` };
}
export const lessonMessageSchema = z.object({
  requestId: z.string().uuid(), message: z.string().trim().min(1).max(4000),
  kind: z.enum(["MESSAGE", "START", "HINT", "EXPLAIN", "PRACTICE"]).default("MESSAGE"),
  language: z.enum(["en", "ne", "bilingual"]).optional(), curriculumOnly: z.boolean().optional(),
});
export const lessonActionSchema = z.object({ action: z.enum(["pause", "resume", "complete", "end", "interrupt"]) });
export const assessmentSchema = z.object({
  classification: z.enum(["correct", "partially_correct", "incorrect", "unclear", "not_answer"]),
  correctness: z.number().min(0).max(1), reason: z.string().max(1000),
  missing_concepts: z.array(z.string().max(200)).max(8), misconceptions: z.array(z.string().max(200)).max(8),
  should_hint: z.boolean(),
}).strict();
export type Assessment = z.infer<typeof assessmentSchema>;
export function parseAssessment(text: string): Assessment | null {
  try { return assessmentSchema.parse(JSON.parse(text.replace(/^```(?:json)?\s*|\s*```$/g, "").trim())); } catch { return null; }
}
// The model does not get to set a score. Unclear answers and requests are never graded.
export function masteryDelta(assessment: Assessment | null) {
  if (!assessment) return 0;
  if (assessment.classification === "correct" && assessment.correctness >= 0.8) return 12;
  if (assessment.classification === "partially_correct" && assessment.correctness >= 0.3 && assessment.correctness < 0.8) return 3;
  if (assessment.classification === "incorrect" && assessment.correctness < 0.3) return -3;
  return 0;
}
export function isAssessed(value: Assessment | null) {
  return !!value && (masteryDelta(value) !== 0);
}
export function masteryBand(score: number) {
  return score <= 20 ? "Beginning" : score <= 40 ? "Developing" : score <= 60 ? "Basic" : score <= 80 ? "Proficient" : "Mastered";
}
export function nextMastery(score: number, assessment: Assessment | null) { return Math.min(100, Math.max(0, score + masteryDelta(assessment))); }
export function lastQuestion(answer: string) {
  return answer.match(/[^.!?\n]+[?？]/g)?.at(-1)?.trim().slice(0, 1500) || null;
}
