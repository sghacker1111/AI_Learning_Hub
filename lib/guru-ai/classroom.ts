import type { GuruGrade, GuruPersona, GuruSubject } from "./catalog";
import { GURU_CHAPTERS } from "./catalog";
export interface LessonSelection { grade: GuruGrade; subject: GuruSubject; chapterId: string; topic: string; persona: GuruPersona; language: "en" | "ne" | "bilingual" }
export function selectionFromSearch(params: Record<string, string | string[] | undefined>): LessonSelection {
  const selection: LessonSelection = { grade: "Class 8", subject: "math", chapterId: "factorization", topic: "", persona: "ram_sir", language: "en" };
  const grade = params.grade as GuruGrade, subject = params.subject as GuruSubject;
  if (GURU_CHAPTERS[grade]?.[subject]?.some((chapter) => chapter.id === params.chapter)) return { ...selection, grade, subject, chapterId: params.chapter as string, topic: typeof params.topic === "string" ? params.topic.slice(0, 200) : "" };
  return selection;
}
export const TEACHING_ACTIONS = [
  { label: "Short explanation", prompt: "Explain the current concept briefly in 2–3 sentences." },
  { label: "Go deeper", prompt: "Explain the current concept more deeply, one step at a time." },
  { label: "Similar example", prompt: "Give a different worked example of the same concept." },
  { label: "Practice question", prompt: "Give me one practice question on the current concept. Wait for my answer before giving the solution." },
  { label: "MCQs", prompt: "Ask one MCQ on this topic with four labelled options and exactly one correct answer. Wait for my answer before revealing the correct option." },
] as const;
export function boundedTutorHistory(messages: { role: "user" | "assistant"; content: string }[]) {
  let budget = 14000;
  return messages.slice(-10).reverse().flatMap((message) => {
    const content = message.content.slice(0, Math.min(3500, budget));
    budget -= content.length;
    return content.trim() ? [{ role: message.role, content }] : [];
  }).reverse();
}
