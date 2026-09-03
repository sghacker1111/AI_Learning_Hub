"use client";

import * as React from "react";
import Link from "next/link";
import {
  Printer,
  Sparkles,
  ArrowLeft,
  Sliders,
} from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MathView } from "@/components/ui/math-view";
import { MixedMathText } from "@/components/ui/mixed-math-text";
import { ExamPaper } from "@/lib/exams/types";

export default function TeacherExamGeneratorPage() {
  const [grade, setGrade] = React.useState("Class 8");
  const [subject, setSubject] = React.useState("Compulsory Mathematics");
  const examType = "BLE_PRACTICE_MINI";
  const [schoolName, setSchoolName] = React.useState("Shree Shanti Vidya Niketan Secondary School");
  const [schoolAddress, setSchoolAddress] = React.useState("Patan, Lalitpur, Bagmati Province");
  const [academicYear, setAcademicYear] = React.useState("2081 / 2082");
  const [showRubrics, setShowRubrics] = React.useState(false);
  const [generatedPaper, setGeneratedPaper] = React.useState<ExamPaper | null>(null);
  const [generating, setGenerating] = React.useState(false);
  const [generationError, setGenerationError] = React.useState<string | null>(null);

  const handleGeneratePaper = async () => {
    setGenerating(true);
    setGenerationError(null);
    try {
      const response = await fetch("/api/exams/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examKey: "ble_class_8_math",
          customOptions: {
            title: `${grade} ${subject} — ${examType.replaceAll("_", " ")} Practice Paper`,
            durationMinutes: 120,
          },
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Paper could not be generated.");
      setGeneratedPaper(data.paper);
    } catch (error) {
      setGenerationError(error instanceof Error ? error.message : "Paper could not be generated.");
    } finally {
      setGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex min-h-screen flex-col bg-muted/20">
      <SiteHeader />
      <main className="flex-1 py-8">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Link
                  href="/teacher"
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Back to Teacher Workspace
                </Link>
              </div>
              <h1 className="text-2xl font-bold tracking-tight">Exam Paper & Rubric Demonstration</h1>
              <p className="text-xs text-muted-foreground">
                Generate the implemented 16-mark Class 8 mathematics practice mini-paper and marking rubric.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="gap-1.5 text-xs font-semibold"
              >
                <Printer className="h-3.5 w-3.5" />
                  <span>Print / Save as PDF</span>
              </Button>

              <Button
                variant="nepal"
                size="sm"
                onClick={handleGeneratePaper}
                disabled={generating}
                className="gap-1.5 text-xs font-bold shadow-md"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>{generating ? "Generating..." : "Generate New Practice Paper"}</span>
              </Button>
            </div>
          </div>

          {/* Generator Configuration Grid */}
          <Card className="p-5 border bg-card space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b pb-2.5">
              <div className="flex items-center gap-2 font-bold text-xs">
                <Sliders className="h-4 w-4 text-primary" />
                <span>Sample Paper & Header Parameters</span>
              </div>
              <Badge variant="nepal" className="text-[9px]">Practice Sample</Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-muted-foreground">Target Grade / Level</label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full h-9 rounded-xl border border-input bg-background px-3 text-xs font-semibold"
                >
                  <option value="Class 8">Class 8 (Basic Level BLE)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-muted-foreground">Subject</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full h-9 rounded-xl border border-input bg-background px-3 text-xs font-semibold"
                >
                  <option value="Compulsory Mathematics">Compulsory Mathematics</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-muted-foreground">Examination Type</label>
                <select
                  value={examType}
                  disabled
                  className="w-full h-9 rounded-xl border border-input bg-background px-3 text-xs font-semibold"
                >
                  <option value="BLE_PRACTICE_MINI">BLE Practice Mini-Paper (16 Marks)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-muted-foreground">Academic Year (B.S.)</label>
                <Input
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="text-xs h-9 font-mono"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="font-semibold text-muted-foreground">School / Institution Name</label>
                <Input
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  className="text-xs h-9 font-semibold"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="font-semibold text-muted-foreground">School Address / District</label>
                <Input
                  value={schoolAddress}
                  onChange={(e) => setSchoolAddress(e.target.value)}
                  className="text-xs h-9"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t text-xs">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="rubricsCheck"
                  checked={showRubrics}
                  onChange={(e) => setShowRubrics(e.target.checked)}
                  className="h-4 w-4 rounded text-primary focus:ring-primary"
                />
                <label htmlFor="rubricsCheck" className="font-semibold text-foreground cursor-pointer">
                  Include Step-by-Step Teacher Marking Scheme & Model Solutions
                </label>
              </div>

              <span className="text-[11px] text-muted-foreground">
                Total Groups: <strong>4 (Group A to D)</strong> • Full Marks: <strong>{generatedPaper?.fullMarks ?? "—"}</strong>
              </span>
            </div>
          </Card>

          {generationError ? <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-800">{generationError}</div> : null}
          {/* Generated Printable Exam Paper (A4 Style) */}
          {generatedPaper ? (
          <div className="p-8 sm:p-12 rounded-2xl border-2 border-slate-300 dark:border-slate-800 bg-card shadow-xl space-y-6 print:p-0 print:border-none print:shadow-none">
            {/* School Header */}
            <div className="text-center space-y-1.5 border-b-2 border-slate-900 dark:border-slate-100 pb-4">
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-wide uppercase">{schoolName}</h2>
              <p className="text-xs text-muted-foreground font-medium">{schoolAddress}</p>
              <h3 className="text-sm sm:text-base font-bold text-primary pt-1">
                {generatedPaper.title} • {academicYear}
              </h3>

              <div className="flex flex-wrap justify-between items-center text-xs font-semibold pt-2 px-2">
                <span>Grade: <strong>{grade}</strong></span>
                <span>Subject: <strong>{subject}</strong></span>
                <span>Time: <strong>{generatedPaper.timeDurationMinutes / 60} Hours</strong></span>
                <span>Full Marks: <strong>{generatedPaper.fullMarks}</strong> (Pass: {generatedPaper.passMarks})</span>
              </div>
            </div>

            {/* Candidate Box */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs border p-3 rounded-xl bg-muted/20 font-mono">
              <div>Candidate Name: _________________</div>
              <div>Roll No: _______</div>
              <div>Section: _______</div>
              <div>Room No: _______</div>
            </div>

            {/* Instructions */}
            <div className="text-[11px] text-muted-foreground italic space-y-0.5 border-b pb-3">
              <p>• All candidates are required to write their answers in their own words as far as practicable.</p>
              <p>• The figures in the margin indicate full marks for each question.</p>
              <p>• Mathematical formulas must show clear steps and simplified answers.</p>
            </div>

            {/* Questions Groups */}
            <div className="space-y-6">
              {generatedPaper.groups.map((group) => (
                <div key={group.group} className="space-y-4">
                  {/* Group Banner */}
                  <div className="flex items-center justify-between border-b pb-1.5">
                    <span className="font-bold text-xs uppercase tracking-wider text-primary">
                      {group.groupTitle}
                    </span>
                    <span className="text-xs font-semibold font-mono text-muted-foreground">
                      [{group.totalGroupMarks} Marks]
                    </span>
                  </div>

                  {/* Group Questions List */}
                  <div className="space-y-4 pl-2">
                    {group.questions.map((q, qIdx) => (
                      <div key={q.id} className="space-y-1.5 text-xs">
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-1 flex-1">
                            <MixedMathText
                              content={`${qIdx + 1}. ${q.questionEnglish}`}
                              className="font-semibold text-foreground leading-relaxed"
                            />
                            <div className="text-[11px] text-primary font-nepali font-semibold">
                              {q.questionNepali}
                            </div>

                            {q.latexFormula && (
                              <div className="py-1">
                                <MathView math={q.latexFormula} displayMode={false} />
                              </div>
                            )}

                            {/* Options if MCQ */}
                            {q.options && (
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                                {q.options.map((opt, oIdx) => (
                                  <div key={opt.id} className="p-2 rounded-lg border bg-muted/20 text-[11px]">
                                    <MixedMathText content={`(${String.fromCharCode(97 + oIdx)}) ${opt.text}`} />
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          <span className="font-mono font-bold text-muted-foreground shrink-0">
                            [{q.marks}]
                          </span>
                        </div>

                        {/* Marking Scheme toggle */}
                        {showRubrics && (
                          <div className="mt-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] space-y-1">
                            <span className="font-bold text-emerald-800 dark:text-emerald-300">
                              ✓ Marking Step Rubric ({q.marks} Marks):
                            </span>
                            <p className="text-muted-foreground font-mono">
                              • Step 1: Correct formula/equation identification (1 Mark)
                            </p>
                            <p className="text-muted-foreground font-mono">
                              • Step 2: Accurate algebraic/arithmetic computation ({q.marks - 1} Marks)
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer Sign-off */}
            <div className="pt-8 border-t flex justify-between text-xs font-semibold text-muted-foreground">
              <span>Teacher-created practice material</span>
              <span>AI Learning Nepal prototype • Not an official examination</span>
            </div>
          </div>
          ) : (
            <Card className="border-dashed p-10 text-center text-sm text-muted-foreground">
              Select the paper settings and generate a paper. Access is checked against the school’s paid bundle on the server.
            </Card>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
