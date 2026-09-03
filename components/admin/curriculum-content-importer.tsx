"use client";

import * as React from "react";
import { BookUp, CheckCircle2, FileText, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MixedMathText } from "@/components/ui/mixed-math-text";

type CatalogChapter = { id: string; chapterNumber: number; title: string };
type CatalogSubject = { id: string; name: string; units: Array<{ id: string; title: string; chapters: CatalogChapter[] }> };
type CatalogGrade = { id: string; name: string; subjects: CatalogSubject[] };

export function CurriculumContentImporter() {
  const [grades, setGrades] = React.useState<CatalogGrade[]>([]);
  const [gradeId, setGradeId] = React.useState("");
  const [subjectId, setSubjectId] = React.useState("");
  const [chapterId, setChapterId] = React.useState("");
  const [lessonNumber, setLessonNumber] = React.useState(1);
  const [lessonTitle, setLessonTitle] = React.useState("");
  const [lessonTitleNepali, setLessonTitleNepali] = React.useState("");
  const [topicTitle, setTopicTitle] = React.useState("");
  const [contentTitle, setContentTitle] = React.useState("");
  const [bodyEnglish, setBodyEnglish] = React.useState("");
  const [bodyNepali, setBodyNepali] = React.useState("");
  const [formulaText, setFormulaText] = React.useState("");
  const [sourceTitle, setSourceTitle] = React.useState("CDC Nepal approved curriculum or textbook");
  const [editionYear, setEditionYear] = React.useState("2081 BS");
  const [pageNumber, setPageNumber] = React.useState("");
  const [sourceUrl, setSourceUrl] = React.useState("https://lib.moecdc.gov.np/");
  const [busy, setBusy] = React.useState(false);
  const [notice, setNotice] = React.useState<{ error?: boolean; text: string } | null>(null);

  const grade = grades.find((item) => item.id === gradeId);
  const subjects = grade?.subjects ?? [];
  const subject = subjects.find((item) => item.id === subjectId);
  const chapters = subject?.units.flatMap((unit) => unit.chapters) ?? [];

  React.useEffect(() => {
    let active = true;
    fetch("/api/admin/questions/catalog", { cache: "no-store" })
      .then(async (response) => ({ response, data: await response.json() }))
      .then(({ response, data }) => {
        if (!active) return;
        if (!response.ok) throw new Error(data.error || "Curriculum catalog could not load.");
        const nextGrades: CatalogGrade[] = data.grades ?? [];
        const firstGrade = nextGrades[0];
        const firstSubject = firstGrade?.subjects[0];
        const firstChapter = firstSubject?.units.flatMap((unit) => unit.chapters)[0];
        setGrades(nextGrades);
        setGradeId(firstGrade?.id ?? "");
        setSubjectId(firstSubject?.id ?? "");
        setChapterId(firstChapter?.id ?? "");
      })
      .catch((error) => setNotice({ error: true, text: error instanceof Error ? error.message : "Curriculum catalog could not load." }));
    return () => { active = false; };
  }, []);

  const loadTextFile = async (file: File | undefined, language: "en" | "ne") => {
    if (!file) return;
    if (file.size > 2_000_000) {
      setNotice({ error: true, text: "Use a text or Markdown file smaller than 2 MB." });
      return;
    }
    const text = await file.text();
    if (language === "ne") setBodyNepali(text);
    else setBodyEnglish(text);
    setNotice({ text: `${file.name} loaded into the ${language === "ne" ? "Nepali" : "English"} content editor. Review it before publishing.` });
  };

  const publishContent = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setNotice(null);
    try {
      const response = await fetch("/api/admin/curriculum/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gradeId,
          subjectId,
          chapterId,
          lessonNumber,
          lessonTitle,
          lessonTitleNepali,
          topicTitle,
          contentTitle,
          bodyEnglish,
          bodyNepali,
          formulas: formulaText.split("\n").map((formula) => formula.trim()).filter(Boolean),
          sourceTitle,
          editionYear,
          pageNumber,
          sourceUrl,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Curriculum content could not be published.");
      setNotice({ text: "Content published. Curriculum-only Guru AI can now retrieve this approved lesson." });
    } catch (error) {
      setNotice({ error: true, text: error instanceof Error ? error.message : "Curriculum content could not be published." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="border bg-card p-6 shadow-md">
      <div className="mb-5 flex flex-col justify-between gap-3 border-b pb-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2 font-bold"><BookUp className="h-5 w-5 text-primary" /> Import full chapter or topic content</div>
          <p className="mt-1 text-sm text-muted-foreground">Published content becomes the authoritative source for Guru AI Curriculum-only answers.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border bg-background px-3 py-2 text-sm font-semibold hover:bg-muted">
            <FileText className="h-4 w-4" /> Load English .txt/.md
            <input type="file" accept=".txt,.md,text/plain,text/markdown" className="sr-only" onChange={(event) => void loadTextFile(event.target.files?.[0], "en")} />
          </label>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border bg-background px-3 py-2 text-sm font-semibold hover:bg-muted">
            <FileText className="h-4 w-4" /> नेपाली file
            <input type="file" accept=".txt,.md,text/plain,text/markdown" className="sr-only" onChange={(event) => void loadTextFile(event.target.files?.[0], "ne")} />
          </label>
        </div>
      </div>

      {notice ? <div className={`mb-4 rounded-xl border p-3 text-sm ${notice.error ? "border-red-300 bg-red-50 text-red-800" : "border-emerald-300 bg-emerald-50 text-emerald-800"}`}>{notice.text}</div> : null}

      <form onSubmit={publishContent} className="space-y-4">
        <div className="grid gap-3 md:grid-cols-3">
          <label className="space-y-1 text-sm font-semibold">Class
            <select value={gradeId} onChange={(event) => { const nextGrade = grades.find((item) => item.id === event.target.value); const nextSubject = nextGrade?.subjects[0]; setGradeId(event.target.value); setSubjectId(nextSubject?.id ?? ""); setChapterId(nextSubject?.units.flatMap((unit) => unit.chapters)[0]?.id ?? ""); }} className="h-11 w-full rounded-xl border bg-background px-3 font-normal" required>{grades.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
          </label>
          <label className="space-y-1 text-sm font-semibold">Subject
            <select value={subjectId} onChange={(event) => { const nextSubject = subjects.find((item) => item.id === event.target.value); setSubjectId(event.target.value); setChapterId(nextSubject?.units.flatMap((unit) => unit.chapters)[0]?.id ?? ""); }} className="h-11 w-full rounded-xl border bg-background px-3 font-normal" required>{subjects.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
          </label>
          <label className="space-y-1 text-sm font-semibold">Chapter
            <select value={chapterId} onChange={(event) => setChapterId(event.target.value)} className="h-11 w-full rounded-xl border bg-background px-3 font-normal" required>{chapters.map((item) => <option key={item.id} value={item.id}>{item.chapterNumber}. {item.title}</option>)}</select>
          </label>
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          <label className="space-y-1 text-sm font-semibold">Lesson number<Input type="number" min={1} max={999} value={lessonNumber} onChange={(event) => setLessonNumber(Number(event.target.value))} required /></label>
          <label className="space-y-1 text-sm font-semibold">Lesson title<Input value={lessonTitle} onChange={(event) => setLessonTitle(event.target.value)} required /></label>
          <label className="space-y-1 text-sm font-semibold">Lesson title — नेपाली<Input value={lessonTitleNepali} onChange={(event) => setLessonTitleNepali(event.target.value)} /></label>
          <label className="space-y-1 text-sm font-semibold">Topic title<Input value={topicTitle} onChange={(event) => setTopicTitle(event.target.value)} /></label>
          <label className="space-y-1 text-sm font-semibold md:col-span-4">Content section title<Input value={contentTitle} onChange={(event) => setContentTitle(event.target.value)} required /></label>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <label className="space-y-1 text-sm font-semibold">Full content — English
            <textarea value={bodyEnglish} onChange={(event) => setBodyEnglish(event.target.value)} rows={12} className="w-full rounded-xl border bg-background p-3 font-normal leading-7" placeholder="Paste the reviewed chapter/topic content. Normal text and LaTeX are supported." required />
          </label>
          <label className="space-y-1 text-sm font-semibold">Full content — नेपाली (optional)
            <textarea value={bodyNepali} onChange={(event) => setBodyNepali(event.target.value)} rows={12} className="w-full rounded-xl border bg-background p-3 font-normal leading-7" />
          </label>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <label className="space-y-1 text-sm font-semibold">LaTeX formulas — one per line
            <textarea value={formulaText} onChange={(event) => setFormulaText(event.target.value)} rows={4} className="w-full rounded-xl border bg-background p-3 font-mono font-normal" placeholder={'P = \\frac{F}{A}\nax^2 + bx + c'} />
          </label>
          <div className="rounded-xl border bg-muted/20 p-4"><p className="mb-2 text-sm font-bold">Formula preview</p>{formulaText.trim() ? formulaText.split("\n").filter(Boolean).map((formula, index) => <MixedMathText key={`${formula}-${index}`} content={`\\[${formula}\\]`} className="text-sm" />) : <p className="text-sm text-muted-foreground">Entered formulas will render here.</p>}</div>
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          <label className="space-y-1 text-sm font-semibold md:col-span-2">Source title<Input value={sourceTitle} onChange={(event) => setSourceTitle(event.target.value)} required /></label>
          <label className="space-y-1 text-sm font-semibold">Edition<Input value={editionYear} onChange={(event) => setEditionYear(event.target.value)} required /></label>
          <label className="space-y-1 text-sm font-semibold">Pages<Input value={pageNumber} onChange={(event) => setPageNumber(event.target.value)} /></label>
        </div>
        <label className="block space-y-1 text-sm font-semibold">Official source URL<Input type="url" value={sourceUrl} onChange={(event) => setSourceUrl(event.target.value)} /></label>

        <Button type="submit" disabled={busy || !gradeId || !subjectId || !chapterId} className="w-full gap-2 text-sm"><Save className="h-4 w-4" /> {busy ? <><Loader2 className="h-4 w-4 animate-spin" /> Publishing...</> : <><CheckCircle2 className="h-4 w-4" /> Publish approved content</>}</Button>
      </form>
    </Card>
  );
}
