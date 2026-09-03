"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Calculator, CheckCircle2, ListChecks, Plus, Save, Trash2 } from "lucide-react";
import { CurriculumContentImporter } from "@/components/admin/curriculum-content-importer";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MixedMathText } from "@/components/ui/mixed-math-text";
import { LatexInsertDialog } from "@/components/admin/latex-insert-dialog";

type CatalogChapter = { id: string; chapterNumber: number; title: string; titleNepali: string };
type CatalogSubject = {
  id: string;
  code: string;
  name: string;
  units: { id: string; title: string; chapters: CatalogChapter[] }[];
};
type CatalogGrade = { id: string; code: string; name: string; nameNepali: string; subjects: CatalogSubject[] };
type QuestionItem = {
  id: string;
  type: string;
  questionText: string;
  marks: number;
  status: string;
  grade: { name: string };
  subject: { name: string };
  chapter: { title: string };
};

const emptyOptions = () =>
  Array.from({ length: 4 }, (_, index) => ({ optionText: "", isCorrect: index === 0, explanation: "" }));

export function QuestionBankPanel({ purpose = "QUESTION" }: { purpose?: "QUESTION" | "MCQ" | "EXAM" }) {
  const heading = purpose === "MCQ" ? "Add MCQs" : purpose === "EXAM" ? "Add Exam Questions" : "Add Questions";
  const [grids, setGrids] = React.useState<{ code: string; title: string; gradeId: string; subjectId: string }[]>([]);
  const [grades, setGrades] = React.useState<CatalogGrade[]>([]);
  const [questions, setQuestions] = React.useState<QuestionItem[]>([]);
  const [mode, setMode] = React.useState<"MCQ" | "TRUE_FALSE" | "FILL_BLANK" | "VERY_SHORT" | "SHORT" | "LONG" | "NUMERICAL" | "DIAGRAM" | "ESSAY">(purpose === "MCQ" ? "MCQ" : "SHORT");
  const [gradeId, setGradeId] = React.useState("");
  const [subjectId, setSubjectId] = React.useState("");
  const [chapterId, setChapterId] = React.useState("");
  const [questionText, setQuestionText] = React.useState("");
  const [questionNepali, setQuestionNepali] = React.useState("");
  const [solution, setSolution] = React.useState("");
  const [difficulty, setDifficulty] = React.useState("MEDIUM");
  const [cognitiveLevel, setCognitiveLevel] = React.useState("UNDERSTANDING");
  const [marks, setMarks] = React.useState(purpose === "MCQ" ? 1 : 2);
  const [status, setStatus] = React.useState("APPROVED");
  const [specificationGridCode, setSpecificationGridCode] = React.useState("");
  const [sourceTitle, setSourceTitle] = React.useState("");
  const [sourceEdition, setSourceEdition] = React.useState("");
  const [sourcePage, setSourcePage] = React.useState("");
  const [latexTarget, setLatexTarget] = React.useState<"question" | "solution" | number | null>(null);
  const [options, setOptions] = React.useState(emptyOptions);
  const [busy, setBusy] = React.useState(false);
  const [notice, setNotice] = React.useState<{ type: "success" | "error"; text: string } | null>(null);

  const selectedGrade = grades.find((grade) => grade.id === gradeId);
  const subjects = selectedGrade?.subjects ?? [];
  const selectedSubject = subjects.find((subject) => subject.id === subjectId);
  const chapters = selectedSubject?.units.flatMap((unit) => unit.chapters) ?? [];

  const loadQuestions = React.useCallback(async () => {
    const response = await fetch(`/api/admin/questions?purpose=${purpose}`, { cache: "no-store" });
    const data = await response.json();
    if (response.ok) setQuestions(data.questions ?? []);
  }, [purpose]);

  React.useEffect(() => {
    let active = true;
    fetch("/api/admin/specification-grids").then((r) => r.json()).then((data) => { if (active) setGrids(data.grids || []); }).catch(() => undefined);
    Promise.all([
      fetch("/api/admin/questions/catalog", { cache: "no-store" }).then(async (response) => ({ response, data: await response.json() })),
      fetch(`/api/admin/questions?purpose=${purpose}`, { cache: "no-store" }).then(async (response) => ({ response, data: await response.json() })),
    ])
      .then(([catalogResult, questionsResult]) => {
        if (!active) return;
        if (!catalogResult.response.ok) throw new Error(catalogResult.data.error || "Curriculum catalog could not load.");
        const catalogGrades = catalogResult.data.grades ?? [];
        setGrades(catalogGrades);
        setQuestions(questionsResult.response.ok ? questionsResult.data.questions ?? [] : []);
        const firstGrade = catalogGrades[0];
        const firstSubject = firstGrade?.subjects[0];
        setGradeId(firstGrade?.id ?? "");
        setSubjectId(firstSubject?.id ?? "");
        setChapterId(firstSubject?.units.flatMap((unit: CatalogSubject["units"][number]) => unit.chapters)[0]?.id ?? "");
      })
      .catch((error) => setNotice({ type: "error", text: error instanceof Error ? error.message : "Question bank could not load." }));
    return () => {
      active = false;
    };
  }, [purpose]);

  function chooseMode(nextMode: "MCQ" | "SHORT") {
    setMode(nextMode);
    setMarks(nextMode === "MCQ" ? 1 : 2);
    setOptions(emptyOptions());
  }

  async function saveQuestion(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setNotice(null);
    try {
      const response = await fetch("/api/admin/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gradeId,
          subjectId,
          chapterId,
          type: mode,
          questionText,
          questionNepali,
          solution,
          difficulty,
          cognitiveLevel,
          marks,
          status,
          specificationGridCode,
          isExamQuestion: purpose === "EXAM",
          sourceTitle,
          sourceEdition,
          sourcePage,
          options: mode === "MCQ" ? options : [],
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Question could not be saved.");
      setQuestionText("");
      setQuestionNepali("");
      setSolution("");
      setOptions(emptyOptions());
      setNotice({ type: "success", text: `${mode === "MCQ" ? "MCQ" : "Question"} saved to the curriculum question bank.` });
      await loadQuestions();
    } catch (error) {
      setNotice({ type: "error", text: error instanceof Error ? error.message : "Question could not be saved." });
    } finally {
      setBusy(false);
    }
  }

  async function deleteQuestion(id: string) {
    if (!window.confirm("Delete this question from the bank?")) return;
    const response = await fetch(`/api/admin/questions/${id}`, { method: "DELETE" });
    const data = await response.json();
    if (!response.ok) {
      setNotice({ type: "error", text: data.error || "Question could not be deleted." });
      return;
    }
    setQuestions((current) => current.filter((question) => question.id !== id));
    setNotice({ type: "success", text: "Question deleted." });
  }

  return (
    <div className="space-y-6">

      <div>
        <div className="space-y-6">
          <div className="flex flex-col justify-between gap-4 border-b pb-5 sm:flex-row sm:items-end">
            <div className="space-y-2">
              <Link href="/admin" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-3.5 w-3.5" /> Back to Admin Center
              </Link>
              <h1 className="text-2xl font-bold">{heading}</h1>
              <p className="text-sm text-muted-foreground">Create class, subject, and chapter-specific questions with normal text and LaTeX in the same field.</p>
            </div>
            <Badge variant="outline">Super Admin authoring</Badge>
          </div>

          {notice && (
            <div className={`rounded-xl border p-3 text-sm ${notice.type === "success" ? "border-emerald-300 bg-emerald-50 text-emerald-800" : "border-red-300 bg-red-50 text-red-800"}`}>
              {notice.text}
            </div>
          )}

          {purpose === "QUESTION" && <details className="rounded-2xl border bg-background p-4"><summary className="cursor-pointer font-semibold">Import approved curriculum content for Guru AI</summary><div className="mt-4"><CurriculumContentImporter /></div></details>}
          <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
            <Card className="p-5">
              {purpose === "EXAM" && <div className="mb-5 grid grid-cols-2 gap-3">
                <Button type="button" variant={mode === "MCQ" ? "default" : "outline"} onClick={() => chooseMode("MCQ")} className="gap-2">
                  <ListChecks className="h-4 w-4" /> Add MCQ
                </Button>
                <Button type="button" variant={mode !== "MCQ" ? "default" : "outline"} onClick={() => chooseMode("SHORT")} className="gap-2">
                  <Plus className="h-4 w-4" /> Add Question
                </Button>
              </div>}

              <form onSubmit={saveQuestion} className="space-y-4">
                {mode !== "MCQ" ? (
                  <label className="block space-y-1 text-xs font-semibold">Question type
                    <select disabled={purpose === "MCQ"} value={mode} onChange={(event) => setMode(event.target.value as typeof mode)} className="h-10 w-full rounded-xl border bg-background px-3 font-normal">
                      <option value="TRUE_FALSE">True / False</option><option value="FILL_BLANK">Fill in the blank</option><option value="VERY_SHORT">Very short answer</option><option value="SHORT">Short answer</option><option value="LONG">Long answer</option><option value="NUMERICAL">Numerical</option><option value="DIAGRAM">Diagram</option><option value="ESSAY">Essay</option>
                    </select>
                  </label>
                ) : null}
                <div className="grid gap-3 md:grid-cols-3">
                  <label className="space-y-1 text-xs font-semibold">Class
                    <select value={gradeId} onChange={(event) => { const next = grades.find((grade) => grade.id === event.target.value); const subject = next?.subjects[0]; setGradeId(event.target.value); setSpecificationGridCode(""); setSubjectId(subject?.id ?? ""); setChapterId(subject?.units.flatMap((unit) => unit.chapters)[0]?.id ?? ""); }} className="h-10 w-full rounded-xl border bg-background px-3 font-normal" required>
                      {grades.map((grade) => <option key={grade.id} value={grade.id}>{grade.name}</option>)}
                    </select>
                  </label>
                  <label className="space-y-1 text-xs font-semibold">Subject
                    <select value={subjectId} onChange={(event) => { const subject = subjects.find((item) => item.id === event.target.value); setSubjectId(event.target.value); setSpecificationGridCode(""); setChapterId(subject?.units.flatMap((unit) => unit.chapters)[0]?.id ?? ""); }} className="h-10 w-full rounded-xl border bg-background px-3 font-normal" required>
                      {subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
                    </select>
                  </label>
                  <label className="space-y-1 text-xs font-semibold">Chapter
                    <select value={chapterId} onChange={(event) => setChapterId(event.target.value)} className="h-10 w-full rounded-xl border bg-background px-3 font-normal" required>
                      {chapters.map((chapter) => <option key={chapter.id} value={chapter.id}>{chapter.chapterNumber}. {chapter.title}</option>)}
                    </select>
                  </label>
                </div>

                <div className="block space-y-1 text-xs font-semibold">
                  <div className="flex flex-wrap items-center justify-between gap-2"><label htmlFor="question-text">Question text + LaTeX</label><Button type="button" variant="outline" size="sm" className="gap-2" onClick={() => setLatexTarget("question")}><Calculator className="h-4 w-4" /> Insert LaTeX</Button></div>
                  <textarea id="question-text" value={questionText} onChange={(event) => setQuestionText(event.target.value)} rows={5} className="w-full rounded-xl border bg-background p-3 font-normal leading-relaxed" placeholder="Example: If $x^2 = 16$, find $x$." required />
                  <span className="block font-normal text-muted-foreground">Use $...$ for inline math or $$...$$ for display math. Normal text can be before and after it.</span>
                </div>
                <label className="block space-y-1 text-xs font-semibold">Nepali version (optional)
                  <textarea value={questionNepali} onChange={(event) => setQuestionNepali(event.target.value)} rows={2} className="w-full rounded-xl border bg-background p-3 font-normal" />
                </label>

                {mode === "MCQ" && (
                  <div className="space-y-2">
                    <div className="text-xs font-semibold">Answer options (choose exactly one correct answer)</div>
                    {options.map((option, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input type="radio" name="correct-option" checked={option.isCorrect} onChange={() => setOptions((current) => current.map((item, itemIndex) => ({ ...item, isCorrect: itemIndex === index })))} aria-label={`Option ${index + 1} is correct`} />
                        <Input value={option.optionText} onChange={(event) => setOptions((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, optionText: event.target.value } : item))} placeholder={`Option ${String.fromCharCode(65 + index)} (text and LaTeX supported)`} required />
                        <Button type="button" variant="outline" size="icon" onClick={() => setLatexTarget(index)} aria-label={`Insert LaTeX in option ${index + 1}`}><Calculator className="h-4 w-4" /></Button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="block space-y-1 text-xs font-semibold">
                  <div className="flex flex-wrap items-center justify-between gap-2"><label htmlFor="question-solution">Answer / solution (optional)</label><Button type="button" variant="outline" size="sm" className="gap-2" onClick={() => setLatexTarget("solution")}><Calculator className="h-4 w-4" /> Insert LaTeX</Button></div>
                  <textarea id="question-solution" value={solution} onChange={(event) => setSolution(event.target.value)} rows={4} className="w-full rounded-xl border bg-background p-3 font-normal" placeholder="Explain the answer; mixed normal text and LaTeX are supported." />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="space-y-1 text-xs font-semibold">CDC specification grid code<select required={purpose === "EXAM"} value={specificationGridCode} onChange={(event) => setSpecificationGridCode(event.target.value)} className="h-10 w-full rounded-xl border bg-background px-3"><option value="">Select saved grid</option>{grids.filter((grid) => grid.gradeId === gradeId && grid.subjectId === subjectId).map((grid) => <option key={grid.code} value={grid.code}>{grid.title} · {grid.code}</option>)}</select></label>
                  <label className="space-y-1 text-xs font-semibold">Approved source title<Input value={sourceTitle} onChange={(event) => setSourceTitle(event.target.value)} placeholder="CDC textbook or curriculum title" /></label>
                  <label className="space-y-1 text-xs font-semibold">Source edition<Input value={sourceEdition} onChange={(event) => setSourceEdition(event.target.value)} placeholder="Example: 2081 BS" /></label>
                  <label className="space-y-1 text-xs font-semibold">Source page(s)<Input value={sourcePage} onChange={(event) => setSourcePage(event.target.value)} placeholder="Example: 65-68" /></label>
                </div>

                <div className="grid gap-3 sm:grid-cols-4">
                  <select value={difficulty} onChange={(event) => setDifficulty(event.target.value)} className="h-10 rounded-xl border bg-background px-3 text-xs"><option>EASY</option><option>MEDIUM</option><option>HARD</option><option>EXPERT</option></select>
                  <select value={cognitiveLevel} onChange={(event) => setCognitiveLevel(event.target.value)} className="h-10 rounded-xl border bg-background px-3 text-xs"><option>KNOWLEDGE</option><option>UNDERSTANDING</option><option>APPLICATION</option><option>HIGHER_ABILITY</option></select>
                  <Input type="number" min={1} max={100} value={marks} onChange={(event) => setMarks(Number(event.target.value))} aria-label="Marks" />
                  <select value={status} onChange={(event) => setStatus(event.target.value)} className="h-10 rounded-xl border bg-background px-3 text-xs"><option>DRAFT</option><option>APPROVED</option><option>PUBLISHED</option></select>
                </div>
                <Button type="submit" disabled={busy || !gradeId || !subjectId || !chapterId} className="w-full gap-2"><Save className="h-4 w-4" /> {busy ? "Saving..." : `Save ${mode === "MCQ" ? "MCQ" : "Question"}`}</Button>
              </form>
            </Card>

            <div className="space-y-6">
              <Card className="p-5">
                <h2 className="mb-3 font-bold">Live preview</h2>
                {questionText ? <MixedMathText content={questionText} className="text-sm leading-7" /> : <p className="text-sm text-muted-foreground">Your mixed text and LaTeX question will appear here.</p>}
                {mode === "MCQ" && <div className="mt-4 space-y-2">{options.filter((option) => option.optionText).map((option, index) => <div key={index} className={`rounded-lg border p-2 text-sm ${option.isCorrect ? "border-emerald-300 bg-emerald-50" : ""}`}><MixedMathText content={`${String.fromCharCode(65 + index)}. ${option.optionText}`} /></div>)}</div>}
                {solution && <div className="mt-4 border-t pt-3"><div className="mb-1 text-xs font-semibold text-muted-foreground">Solution</div><MixedMathText content={solution} className="text-sm" /></div>}
              </Card>
              <Card className="p-5">
                <div className="mb-3 flex items-center justify-between"><h2 className="font-bold">Saved bank</h2><Badge variant="outline">{questions.length}</Badge></div>
                <div className="max-h-[520px] space-y-3 overflow-y-auto pr-1">
                  {questions.map((question) => <div key={question.id} className="rounded-xl border p-3 text-xs"><div className="mb-2 flex items-center justify-between gap-2"><div className="flex gap-1"><Badge variant="outline">{question.type}</Badge><Badge variant="secondary">{question.marks} marks</Badge></div><Button type="button" variant="ghost" size="icon" onClick={() => deleteQuestion(question.id)} aria-label="Delete question"><Trash2 className="h-4 w-4 text-destructive" /></Button></div><MixedMathText content={question.questionText} className="text-sm" /><div className="mt-2 text-muted-foreground">{question.grade.name} · {question.subject.name} · {question.chapter.title}</div></div>)}
                  {!questions.length && <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground"><CheckCircle2 className="mx-auto mb-2 h-5 w-5" />No saved questions found.</div>}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <LatexInsertDialog
        open={latexTarget !== null}
        onClose={() => setLatexTarget(null)}
        onInsert={(value) => {
          if (latexTarget === "question") setQuestionText((current) => `${current}${current && !current.endsWith(" ") ? " " : ""}${value}`);
          else if (latexTarget === "solution") setSolution((current) => `${current}${current && !current.endsWith(" ") ? " " : ""}${value}`);
          else if (typeof latexTarget === "number") setOptions((current) => current.map((option, index) => index === latexTarget ? { ...option, optionText: `${option.optionText}${option.optionText && !option.optionText.endsWith(" ") ? " " : ""}${value}` } : option));
        }}
      />
    </div>
  );
}
