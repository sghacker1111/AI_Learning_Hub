"use client";
import { Bot, Play } from "lucide-react";
import { GURU_CHAPTERS, type GuruGrade, type GuruSubject } from "@/lib/guru-ai/catalog";
import { CDC_COMPULSORY_CATALOG, getCDCGradeCatalog } from "@/lib/constants/cdc-compulsory-catalog";
import type { LessonSelection } from "@/lib/guru-ai/classroom";
import { LiveTeacherAvatar } from "./live-teacher-avatar";

export function LessonSetup({ value, onChange, onStart, canContinue }: { value: LessonSelection; onChange: (value: LessonSelection) => void; onStart: (resume: boolean) => void; canContinue: boolean }) {
  const subjects = getCDCGradeCatalog(value.grade).subjects;
  const chapters = GURU_CHAPTERS[value.grade][value.subject] || [];
  function changeGrade(grade: GuruGrade) {
    const available = getCDCGradeCatalog(grade).subjects;
    const subject = available.some((item) => item.key === value.subject) ? value.subject : available[0].key;
    onChange({ ...value, grade, subject, chapterId: GURU_CHAPTERS[grade][subject]?.[0]?.id || "", topic: "" });
  }
  function changeSubject(subject: GuruSubject) { onChange({ ...value, subject, chapterId: GURU_CHAPTERS[value.grade][subject]?.[0]?.id || "", topic: "" }); }
  return <div className="space-y-7">
    <div><p className="mb-2 text-xs font-bold uppercase tracking-[.2em] text-indigo-600">Meet your learning companion</p><h1 className="text-3xl font-extrabold">What would you like to learn?</h1><p className="mt-3 text-muted-foreground">Choose your chapter and AI teacher. Learn by talking, typing, and practising.</p></div>
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
      <section className="space-y-6 rounded-3xl border bg-background p-5 sm:p-7"><h2 className="text-lg font-bold">1. Choose your lesson</h2><div className="grid gap-5 sm:grid-cols-2">
        <label className="space-y-2 text-sm font-semibold">Class<select value={value.grade} onChange={(e) => changeGrade(e.target.value as GuruGrade)} className="block h-12 w-full rounded-xl border bg-background px-3">{CDC_COMPULSORY_CATALOG.map((grade) => <option key={grade.name} value={grade.name}>{grade.name}</option>)}</select></label>
        <label className="space-y-2 text-sm font-semibold">Subject<select value={value.subject} onChange={(e) => changeSubject(e.target.value as GuruSubject)} className="block h-12 w-full rounded-xl border bg-background px-3">{subjects.map((subject) => <option key={subject.key} value={subject.key}>{subject.name}</option>)}</select></label>
        <label className="space-y-2 text-sm font-semibold sm:col-span-2">Chapter<select value={value.chapterId} onChange={(e) => onChange({ ...value, chapterId: e.target.value, topic: "" })} className="block h-12 w-full rounded-xl border bg-background px-3">{chapters.map((chapter) => <option key={chapter.id} value={chapter.id}>{chapter.title}</option>)}</select></label>
        <label className="space-y-2 text-sm font-semibold">Topic (optional)<input value={value.topic} onChange={(e) => onChange({ ...value, topic: e.target.value })} maxLength={120} placeholder="Whole chapter, or enter a topic" className="block h-12 w-full rounded-xl border bg-background px-3" /></label>
        <label className="space-y-2 text-sm font-semibold">Teaching language<select value={value.language} onChange={(e) => onChange({ ...value, language: e.target.value as LessonSelection["language"] })} className="block h-12 w-full rounded-xl border bg-background px-3"><option value="en">English</option><option value="ne">नेपाली</option><option value="bilingual">English + नेपाली</option></select></label>
      </div><div className="border-t pt-6"><h2 className="mb-4 text-lg font-bold">2. Choose your AI teacher</h2><div className="grid gap-3 sm:grid-cols-2">{[{ id: "ram_sir" as const, name: "Ram Sir AI", text: "Patient, step-by-step explanations", subject: "math" as const }, { id: "sita_maam" as const, name: "Sita Ma’am AI", text: "Curious, example-led learning", subject: "science" as const }].map((teacher) => <button key={teacher.id} type="button" aria-pressed={value.persona === teacher.id} onClick={() => onChange({ ...value, persona: teacher.id })} className={`rounded-2xl border p-4 text-left transition ${value.persona === teacher.id ? "border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500 dark:bg-indigo-950" : "hover:bg-muted"}`}><LiveTeacherAvatar compact subject={teacher.subject} state="idle" /><p className="mt-3 text-sm text-muted-foreground">{teacher.text}</p></button>)}</div></div><div className="flex flex-wrap gap-3 border-t pt-6"><button disabled={!value.chapterId} onClick={() => onStart(false)} className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white disabled:opacity-50"><Play className="h-4 w-4" />Start AI lesson</button>{canContinue && <button onClick={() => onStart(true)} className="rounded-xl border px-5 py-3 font-semibold">Continue previous lesson</button>}</div></section>
      <aside className="space-y-5"><div className="rounded-3xl bg-indigo-600 p-6 text-white"><Bot className="h-10 w-10" /><h2 className="mt-5 text-xl font-bold">Built around your questions</h2><p className="mt-3 text-sm leading-6 text-indigo-100">Ask for a shorter explanation, go deeper, see another example, or practise with MCQs.</p></div><div className="rounded-2xl border bg-background p-5 text-sm leading-6 text-muted-foreground"><p className="font-semibold text-foreground">Curriculum first</p><p className="mt-2">Chapter outlines are not full textbooks. Approved-content mode will say when a lesson needs imported content.</p><p className="mt-3">Voice uses your browser’s speech service. Availability, language support, and processing location depend on your browser. Text always remains available.</p></div></aside>
    </div>
  </div>;
}
