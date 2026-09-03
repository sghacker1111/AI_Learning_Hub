"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Printer,
  Clock,
  CheckCircle2,
  Layers,
  FileText,
  BookMarked,
  Lightbulb,
} from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MathView } from "@/components/ui/math-view";
import { generateCDCLessonPlan } from "@/lib/teacher/lesson-plan-generator";
import { LessonPlan } from "@/lib/teacher/types";

export default function TeacherLessonsPage() {
  const [selectedSubject, setSelectedSubject] = React.useState("Compulsory Mathematics");
  const [selectedChapter, setSelectedChapter] = React.useState("13% VAT");
  const [duration, setDuration] = React.useState(45);
  const [lessonPlan, setLessonPlan] = React.useState<LessonPlan>(() =>
    generateCDCLessonPlan("Compulsory Mathematics", "13% VAT", 45)
  );

  const handleGenerate = (subj: string, chap: string, dur: number) => {
    const lp = generateCDCLessonPlan(subj, chap, dur);
    setLessonPlan(lp);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex min-h-screen flex-col bg-muted/20">
      <SiteHeader />
      <main className="flex-1 py-8">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-6">
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
              <h1 className="text-2xl font-bold tracking-tight">Class 8 Lesson Plan Template Generator</h1>
              <p className="text-xs text-muted-foreground">
                Generate editable five-phase demonstration templates for teacher review; official format compliance has not been verified.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5 text-xs">
                <Printer className="h-3.5 w-3.5" />
                <span>Print / Save PDF</span>
              </Button>
            </div>
          </div>

          {/* Generator Controls Card */}
          <Card className="p-5 border bg-card space-y-4 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-muted-foreground">Subject</label>
                <select
                  value={selectedSubject}
                  onChange={(e) => {
                    setSelectedSubject(e.target.value);
                    const chap = e.target.value.includes("Science") ? "Archimedes Upthrust" : "13% VAT";
                    setSelectedChapter(chap);
                    handleGenerate(e.target.value, chap, duration);
                  }}
                  className="w-full h-9 rounded-xl border border-input bg-background px-3 text-xs focus:ring-2 focus:ring-primary"
                >
                  <option value="Compulsory Mathematics">Compulsory Mathematics (अनिवार्य गणित)</option>
                  <option value="Science & Technology">Science & Technology (विज्ञान तथा प्रविधि)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-muted-foreground">Chapter Topic</label>
                <select
                  value={selectedChapter}
                  onChange={(e) => {
                    setSelectedChapter(e.target.value);
                    handleGenerate(selectedSubject, e.target.value, duration);
                  }}
                  className="w-full h-9 rounded-xl border border-input bg-background px-3 text-xs focus:ring-2 focus:ring-primary"
                >
                  {selectedSubject.includes("Math") ? (
                    <>
                      <option value="13% VAT">Unit 2: Discount & 13% VAT</option>
                      <option value="Sets Cardinality">Unit 1: Sets Cardinality & Venn</option>
                    </>
                  ) : (
                    <option value="Archimedes Upthrust">Unit 2: Force, Pressure & Archimedes</option>
                  )}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-muted-foreground">Period Duration</label>
                <select
                  value={duration}
                  onChange={(e) => {
                    const dur = parseInt(e.target.value, 10);
                    setDuration(dur);
                    handleGenerate(selectedSubject, selectedChapter, dur);
                  }}
                  className="w-full h-9 rounded-xl border border-input bg-background px-3 text-xs focus:ring-2 focus:ring-primary"
                >
                  <option value={45}>45 Minutes (Sample Period)</option>
                  <option value={90}>90 Minutes (Double Practical Block)</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Generated Lesson Plan Viewport */}
          <Card className="p-8 border bg-card space-y-6 shadow-md printable-lesson-plan">
            {/* Document Header */}
            <div className="border-b pb-4 space-y-2 text-center">
              <Badge variant="nepal" className="text-xs mx-auto">
                {lessonPlan.curriculumEdition} • Daily Instructional Plan
              </Badge>
              <h2 className="text-xl font-bold text-foreground">{lessonPlan.chapter}</h2>
              <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-muted-foreground">
                <span>Grade: <strong>{lessonPlan.grade}</strong></span>
                <span>•</span>
                <span>Subject: <strong>{lessonPlan.subject}</strong></span>
                <span>•</span>
                <span>Period: <strong>#{lessonPlan.periodNumber} ({lessonPlan.durationMinutes} Mins)</strong></span>
              </div>
            </div>

            {/* Section 1: Specific Objectives (सिकाई उपलब्धि) */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm text-foreground">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>1. Specific Objectives / Learning Outcomes (विशिष्ट सिकाई उपलब्धि)</span>
              </div>
              <div className="p-4 rounded-xl bg-muted/30 border text-xs space-y-2">
                <ul className="list-disc pl-5 space-y-1 text-foreground leading-relaxed">
                  {lessonPlan.specificObjectives.map((obj, idx) => (
                    <li key={idx}>
                      <span>{obj}</span>
                      <p className="text-[11px] text-primary font-nepali font-medium pt-0.5">
                        {lessonPlan.specificObjectivesNepali[idx]}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Section 2: Low-Cost Instructional Materials (शैक्षिक सामग्री) */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm text-foreground">
                <Layers className="h-4 w-4 text-blue-600" />
                <span>2. Low-Cost Instructional Materials (शैक्षिक सामग्रीहरू)</span>
              </div>
              <div className="p-4 rounded-xl bg-muted/30 border text-xs space-y-1.5">
                {lessonPlan.instructionalMaterials.map((mat, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="font-bold text-primary">•</span>
                    <div>
                      <span className="font-medium text-foreground">{mat}</span>
                      <span className="text-[11px] text-muted-foreground font-nepali ml-2">
                        ({lessonPlan.instructionalMaterialsNepali[idx]})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 3: 5-Phase Teaching-Learning Activities (शिक्षण-सिकाई क्रियाकलाप) */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 font-bold text-sm text-foreground">
                <Clock className="h-4 w-4 text-purple-600" />
                <span>3. Teaching-Learning Activities: 5-Phase Workflow (शिक्षण-सिकाई क्रियाकलाप)</span>
              </div>

              <div className="space-y-3">
                {lessonPlan.phases.map((phase) => (
                  <div key={phase.phaseNumber} className="p-4 rounded-xl border bg-muted/20 space-y-2.5">
                    <div className="flex items-center justify-between border-b pb-1.5">
                      <div className="space-y-0.5">
                        <span className="font-bold text-xs text-foreground">{phase.title}</span>
                        <p className="text-[11px] text-primary font-nepali font-semibold">{phase.titleNepali}</p>
                      </div>
                      <Badge variant="outline" className="text-[10px] font-mono">
                        {phase.durationMinutes} Minutes
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="space-y-1">
                        <span className="font-bold text-[11px] text-muted-foreground">Teacher&apos;s Role (शिक्षक क्रियाकलाप):</span>
                        <p className="text-foreground leading-relaxed">{phase.teacherActivity}</p>
                      </div>

                      <div className="space-y-1">
                        <span className="font-bold text-[11px] text-muted-foreground">Student&apos;s Role (विद्यार्थी क्रियाकलाप):</span>
                        <p className="text-foreground leading-relaxed">{phase.studentActivity}</p>
                      </div>
                    </div>

                    {phase.latexFormulas && phase.latexFormulas.length > 0 && (
                      <div className="pt-2 border-t space-y-1">
                        <span className="text-[10px] uppercase font-bold text-primary">Mathematical Board Formulas:</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {phase.latexFormulas.map((f, fIdx) => (
                            <div key={fIdx} className="p-2 rounded-lg bg-primary/10 border border-primary/20 text-center font-mono text-xs text-primary font-bold">
                              <MathView math={f} displayMode={false} />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Section 4: Formative Evaluation & Homework */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-2">
                <div className="flex items-center gap-2 font-bold text-xs text-foreground">
                  <FileText className="h-3.5 w-3.5 text-amber-600" />
                  <span>4. Formative Assessment Questions</span>
                </div>
                <div className="p-3.5 rounded-xl border bg-muted/30 text-xs space-y-1.5 text-foreground leading-relaxed">
                  {lessonPlan.formativeEvaluationQuestions.map((q, idx) => (
                    <p key={idx}><strong>Q{idx + 1}:</strong> {q}</p>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 font-bold text-xs text-foreground">
                  <BookMarked className="h-3.5 w-3.5 text-emerald-600" />
                  <span>5. Assigned Homework & Extension</span>
                </div>
                <div className="p-3.5 rounded-xl border bg-muted/30 text-xs space-y-1.5 text-foreground leading-relaxed">
                  {lessonPlan.homeworkTasks.map((hw, idx) => (
                    <p key={idx}><strong>Task {idx + 1}:</strong> {hw}</p>
                  ))}
                </div>
              </div>
            </div>

            {/* Teacher Reflection Note */}
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs flex items-start gap-2.5">
              <Lightbulb className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-bold text-amber-900 dark:text-amber-300">Teacher Pedagogical Reflection:</span>
                <p className="text-amber-800 dark:text-amber-200">{lessonPlan.teacherReflectionNotes}</p>
              </div>
            </div>
          </Card>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
