"use client";

import * as React from "react";
import { useLearning } from "@/components/learning/learning-provider";
import Link from "next/link";
import {
  Clock,
  CheckCircle2,
  Play,
  ArrowRight,
  RotateCcw,
  Bot,
  Sliders,
  Flag,
  ArrowLeft,
} from "lucide-react";
import { StudentDashboardShell } from "@/components/layout/student-dashboard-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MathView } from "@/components/ui/math-view";
import { MixedMathText } from "@/components/ui/mixed-math-text";
import { ExamPaper, ExamReportCard, ExamQuestion } from "@/lib/exams/types";
import { generateExamPaper } from "@/lib/exams/generator";
import { evaluateExamSubmission } from "@/lib/exams/grading";

interface ExamCatalogItem {
  id: string;
  title: string;
  titleNepali: string;
  badge: string;
  grade: string;
  subject: string;
  fullMarks: number;
  durationMinutes: number;
  description: string;
}

const FEATURED_EXAMS: ExamCatalogItem[] = [
  {
    id: "ble_class_8_math",
    title: "Class 8 BLE Practice Mini-Paper — Mathematics",
    titleNepali: "कक्षा ८ BLE अभ्यास लघु परीक्षा — अनिवार्य गणित",
    badge: "16-Mark Practice Sample",
    grade: "Class 8",
    subject: "Compulsory Mathematics",
    fullMarks: 16,
    durationMinutes: 120,
    description: "A four-group practice sample. It is not a complete or officially certified BLE board paper.",
  },
  {
    id: "unit_test_math_sets_vat",
    title: "Class 8 Mathematics: Unit Test 1 (Sets & 13% VAT)",
    titleNepali: "कक्षा ८ गणित: एकाइ परीक्षा १ (समूह र १३% भ्याट)",
    badge: "20 Marks Unit Test",
    grade: "Class 8",
    subject: "Compulsory Mathematics",
    fullMarks: 20,
    durationMinutes: 45,
    description: "Focused periodic unit test covering overlapping sets cardinality and Nepal 13% VAT rules.",
  },
];

export default function StudentExamsPage() {
  const { record } = useLearning();
  const [activeView, setActiveView] = React.useState<"catalog" | "live" | "report">("catalog");
  const [examPaper, setExamPaper] = React.useState<ExamPaper>(() => generateExamPaper("ble_class_8_math"));

  // Live Exam State
  const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(0);
  const [answers, setAnswers] = React.useState<Record<string, { selectedOptionId?: string; isFlagged?: boolean }>>({});
  const [secondsRemaining, setSecondsRemaining] = React.useState(45 * 60);
  const [reportCard, setReportCard] = React.useState<ExamReportCard | null>(null);

  // Custom Exam Builder State
  const [showCustomModal, setShowCustomModal] = React.useState(false);
  const [customTitle, setCustomTitle] = React.useState("Customized Mathematics Assessment");
  const [customDuration, setCustomDuration] = React.useState("45");

  // Flatten all questions across groups for linear pagination
  const allQuestions: ExamQuestion[] = React.useMemo(() => {
    return examPaper.groups.flatMap((g) => g.questions);
  }, [examPaper]);

  const activeQuestion = allQuestions[currentQuestionIndex] || allQuestions[0];

  const handleSubmitExam = React.useCallback(() => {
    const formattedAnswers: Record<string, { questionId: string; selectedOptionId?: string }> = {};
    for (const [qId, data] of Object.entries(answers)) {
      formattedAnswers[qId] = {
        questionId: qId,
        selectedOptionId: data.selectedOptionId,
      };
    }

    const report = evaluateExamSubmission(examPaper, {
      examId: examPaper.id,
      timeSpentSeconds: examPaper.timeDurationMinutes * 60 - secondsRemaining,
      answers: formattedAnswers,
    });

    record({ kind: "EXAM", grade: examPaper.grade, subject: examPaper.subject, chapterId: examPaper.id, chapter: examPaper.title, score: report.marksObtained, maxScore: report.fullMarks, durationSeconds: Math.max(0, examPaper.timeDurationMinutes * 60 - secondsRemaining) });
    setReportCard(report);
    setActiveView("report");
  }, [answers, examPaper, secondsRemaining, record]);

  // Timer countdown
  React.useEffect(() => {
    if (activeView !== "live") return;
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [activeView, handleSubmitExam]);

  const handleStartExam = (examKey: string) => {
    const paper = generateExamPaper(examKey);
    setExamPaper(paper);
    setAnswers({});
    setCurrentQuestionIndex(0);
    setSecondsRemaining(paper.timeDurationMinutes * 60);
    setActiveView("live");
  };

  const handleStartCustomExam = () => {
    const paper = generateExamPaper("unit_test_math_sets_vat", {
      title: customTitle,
      durationMinutes: parseInt(customDuration, 10),
    });
    setExamPaper(paper);
    setAnswers({});
    setCurrentQuestionIndex(0);
    setSecondsRemaining(paper.timeDurationMinutes * 60);
    setShowCustomModal(false);
    setActiveView("live");
  };

  const handleSelectOption = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        selectedOptionId: optionId,
      },
    }));
  };

  const handleToggleFlag = (questionId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        isFlagged: !prev[questionId]?.isFlagged,
      },
    }));
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <StudentDashboardShell>
      <div className="space-y-6">
        {/* VIEW 1: EXAM CATALOG & BUILDER */}
        {activeView === "catalog" && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Link
                    href="/student/dashboard"
                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
                  </Link>
                </div>
                <h1 className="text-2xl font-bold tracking-tight">Practice Examination Portal</h1>
                <p className="text-xs text-muted-foreground">
                  Launch the implemented Class 8 mathematics practice papers and review transparent scoring.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="nepal"
                  size="sm"
                  onClick={() => setShowCustomModal(true)}
                  className="gap-1.5 text-xs font-semibold"
                >
                  <Sliders className="h-3.5 w-3.5" />
                  <span>Create Custom Exam</span>
                </Button>
              </div>
            </div>

            {/* Custom Exam Builder Modal */}
            {showCustomModal && (
              <div className="rounded-2xl border-2 border-primary/40 bg-primary/5 p-5 space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between border-b border-primary/20 pb-3">
                  <div className="flex items-center gap-2 font-bold text-sm text-primary">
                    <Sliders className="h-4 w-4" />
                    <span>Customized Exam Creator Wizard</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCustomModal(false)}
                    className="h-7 text-xs"
                  >
                    Cancel
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <label className="font-semibold">Exam Title</label>
                    <Input
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                      className="text-xs h-9"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold">Duration (Minutes)</label>
                    <Input
                      type="number"
                      value={customDuration}
                      onChange={(e) => setCustomDuration(e.target.value)}
                      className="text-xs h-9"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button variant="nepal" size="sm" onClick={handleStartCustomExam} className="text-xs gap-1.5">
                    <Play className="h-3 w-3" />
                    <span>Generate & Launch Exam</span>
                  </Button>
                </div>
              </div>
            )}

            {/* Featured Model Exams Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {FEATURED_EXAMS.map((exam) => (
                <Card
                  key={exam.id}
                  className="p-6 border bg-card hover:shadow-lg transition-all space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="nepal" className="text-[10px]">
                        {exam.badge}
                      </Badge>
                      <span className="text-xs text-muted-foreground font-mono font-semibold">
                        {exam.fullMarks} Marks
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-bold text-base text-foreground leading-snug">{exam.title}</h3>
                      <p className="text-xs text-primary font-nepali font-semibold">{exam.titleNepali}</p>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed">{exam.description}</p>
                  </div>

                  <div className="pt-4 border-t space-y-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {exam.durationMinutes} Minutes
                      </span>
                      <span>Grade: <strong>{exam.grade}</strong></span>
                    </div>

                    <Button
                      variant="outline"
                      onClick={() => handleStartExam(exam.id)}
                      className="w-full text-xs font-semibold gap-1.5 hover:bg-primary hover:text-primary-foreground"
                    >
                      <Play className="h-3.5 w-3.5" />
                      <span>Take Examination</span>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 2: LIVE TIMED EXAM WORKSPACE */}
        {activeView === "live" && (
          <div className="space-y-5">
            {/* Top Proctoring Bar */}
            <div className="p-4 rounded-2xl border bg-card shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px]">
                    {examPaper.examType} PROCTORED
                  </Badge>
                  <span className="font-bold text-sm text-foreground">{examPaper.title}</span>
                </div>
                <span className="text-[11px] text-muted-foreground">
                  Full Marks: {examPaper.fullMarks} • Pass Marks: {examPaper.passMarks}
                </span>
              </div>

              <div className="flex items-center gap-3">
                {/* Timer Badge */}
                <div
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-mono text-xs font-bold ${
                    secondsRemaining < 300
                      ? "bg-destructive/10 border-destructive text-destructive animate-pulse"
                      : "bg-muted/40 border-border text-foreground"
                  }`}
                >
                  <Clock className="h-3.5 w-3.5" />
                  <span>{formatTimer(secondsRemaining)} Remaining</span>
                </div>

                <Button
                  variant="nepal"
                  size="sm"
                  onClick={handleSubmitExam}
                  className="text-xs font-semibold gap-1"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Submit Exam</span>
                </Button>
              </div>
            </div>

            {/* Main Exam Testing Screen */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Active Question View */}
              <div className="lg:col-span-8 space-y-4">
                <Card className="p-6 border bg-card space-y-5 shadow-md">
                  <div className="flex items-center justify-between border-b pb-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="subtle" className="text-[11px] font-mono">
                        Question {currentQuestionIndex + 1} of {allQuestions.length}
                      </Badge>
                      <span className="text-xs font-semibold text-primary">
                        {activeQuestion.group.replace("_", " ")} ({activeQuestion.marks} Marks)
                      </span>
                    </div>

                    <Button
                      variant={answers[activeQuestion.id]?.isFlagged ? "destructive" : "ghost"}
                      size="sm"
                      onClick={() => handleToggleFlag(activeQuestion.id)}
                      className="h-7 text-xs gap-1"
                    >
                      <Flag className="h-3 w-3" />
                      <span>{answers[activeQuestion.id]?.isFlagged ? "Flagged" : "Flag for Review"}</span>
                    </Button>
                  </div>

                  {/* Question Content */}
                  <div className="space-y-3">
                    <MixedMathText
                      content={activeQuestion.questionEnglish}
                      className="text-sm font-semibold leading-relaxed"
                    />
                    <div className="text-xs text-primary font-nepali font-semibold">
                      {activeQuestion.questionNepali}
                    </div>
                    {activeQuestion.latexFormula && (
                      <div className="p-3 rounded-xl bg-primary/5 border text-center font-mono text-xs text-primary font-bold">
                        <MathView math={activeQuestion.latexFormula} displayMode={false} />
                      </div>
                    )}
                  </div>

                  {/* Options Selection */}
                  {activeQuestion.options && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      {activeQuestion.options.map((opt) => {
                        const isSelected = answers[activeQuestion.id]?.selectedOptionId === opt.id;
                        return (
                          <button
                            key={opt.id}
                            onClick={() => handleSelectOption(activeQuestion.id, opt.id)}
                            className={`p-4 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                              isSelected
                                ? "border-primary bg-primary/10 text-primary font-semibold ring-2 ring-primary/20"
                                : "border-border hover:bg-muted/40"
                            }`}
                          >
                            <MixedMathText content={opt.text} />
                            {isSelected && <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Navigation Arrows */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentQuestionIndex === 0}
                      onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                      className="text-xs gap-1"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      Previous
                    </Button>

                    <Button
                      variant="default"
                      size="sm"
                      disabled={currentQuestionIndex === allQuestions.length - 1}
                      onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                      className="text-xs gap-1"
                    >
                      Next
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </Card>
              </div>

              {/* Right Column: Question Palette Navigation */}
              <div className="lg:col-span-4 space-y-4">
                <Card className="p-5 border bg-card space-y-4 shadow-sm">
                  <div className="flex items-center justify-between border-b pb-3">
                    <span className="font-bold text-sm text-foreground">Question Palette</span>
                    <span className="text-xs text-muted-foreground">
                      {Object.keys(answers).filter((k) => answers[k]?.selectedOptionId).length} / {allQuestions.length} Answered
                    </span>
                  </div>

                  {/* Question Grid Numbers */}
                  <div className="grid grid-cols-5 gap-2">
                    {allQuestions.map((q, idx) => {
                      const isAnswered = Boolean(answers[q.id]?.selectedOptionId);
                      const isFlagged = Boolean(answers[q.id]?.isFlagged);
                      const isCurrent = idx === currentQuestionIndex;

                      let btnStyle = "bg-muted text-muted-foreground border-border";
                      if (isFlagged) {
                        btnStyle = "bg-red-500/20 text-red-700 dark:text-red-300 border-red-500 font-bold";
                      } else if (isAnswered) {
                        btnStyle = "bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-500 font-bold";
                      }

                      if (isCurrent) {
                        btnStyle += " ring-2 ring-primary";
                      }

                      return (
                        <button
                          key={q.id}
                          onClick={() => setCurrentQuestionIndex(idx)}
                          className={`h-9 w-9 rounded-xl border text-xs font-mono font-bold transition-all flex items-center justify-center ${btnStyle}`}
                        >
                          {idx + 1}
                        </button>
                      );
                    })}
                  </div>

                  {/* Legend */}
                  <div className="pt-2 border-t text-[11px] space-y-1.5 text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full bg-emerald-500" />
                      <span>Answered</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full bg-red-500" />
                      <span>Flagged for Review</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full bg-muted border" />
                      <span>Not Answered</span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: DETAILED EXAM REPORT CARD */}
        {activeView === "report" && reportCard && (
          <div className="space-y-6 animate-in fade-in">
            {/* Report Header Card */}
            <Card className="p-6 border bg-card space-y-6 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
                <div className="space-y-1">
                  <Badge variant="subtle" className="text-xs">
                    Practice Exam Performance Report
                  </Badge>
                  <h2 className="text-2xl font-bold text-foreground">{reportCard.examTitle}</h2>
                  <p className="text-xs text-muted-foreground">
                    Time taken: {reportCard.timeTakenMinutes} minutes • Pass Marks: {reportCard.passMarks} / {reportCard.fullMarks}
                  </p>
                </div>

                {/* Big GPA Badge */}
                <div className="flex items-center gap-3">
                  <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 text-center">
                    <div className="text-[10px] uppercase font-bold text-muted-foreground">Grade Point (GPA)</div>
                    <div className="text-3xl font-extrabold text-primary">{reportCard.gpa.toFixed(2)}</div>
                    <Badge variant="nepal" className="text-[11px] mt-1">
                      Grade: {reportCard.letterGrade}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Group-Wise Performance Breakdown */}
              <div className="space-y-2">
                <span className="font-bold text-xs text-foreground">Group-Wise Marks Distribution:</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {reportCard.groupWisePerformance.map((grp) => (
                    <div key={grp.group} className="p-3.5 rounded-xl border bg-muted/30 space-y-1">
                      <div className="text-[11px] font-semibold text-muted-foreground">{grp.title}</div>
                      <div className="text-lg font-bold text-foreground">
                        {grp.marksObtained} / {grp.marksPossible}
                      </div>
                      <div className="text-[10px] text-primary font-bold">{grp.percentage}% Score</div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Question-by-Question Marking Rubric */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-foreground">Step-by-Step Marking Rubrics & Solutions</h3>
              <div className="space-y-4">
                {reportCard.questionResults.map((res) => (
                  <Card key={res.questionId} className="p-5 border bg-card space-y-3 shadow-sm">
                    <div className="flex items-center justify-between border-b pb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs">Question {res.questionNumber}</span>
                        <Badge variant="outline" className="text-[10px]">
                          {res.group.replace("_", " ")}
                        </Badge>
                      </div>
                      <Badge variant={res.isCorrect ? "success" : "destructive"} className="text-[10px]">
                        {res.marksObtained} / {res.marksPossible} Marks
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-muted/40 border space-y-1">
                        <div className="text-[10px] font-semibold text-muted-foreground">Your Selected Option:</div>
                        <div className={`font-semibold ${res.isCorrect ? "text-emerald-600" : "text-destructive"}`}>
                          {res.studentAnswer}
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 space-y-1">
                        <div className="text-[10px] font-semibold text-primary">Sample Model Answer:</div>
                        <div className="font-semibold text-primary">{res.modelAnswer}</div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Actions Bar */}
            <div className="flex justify-between items-center pt-4 border-t">
              <Button variant="outline" size="sm" onClick={() => setActiveView("catalog")} className="gap-1.5 text-xs">
                <RotateCcw className="h-3.5 w-3.5" />
                Back to Exam Catalog
              </Button>

              <Link href="/student/guru-ai">
                <Button variant="nepal" size="sm" className="gap-1.5 text-xs font-semibold">
                  <Bot className="h-3.5 w-3.5" />
                  Review Mistakes with AI Tutor
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </StudentDashboardShell>
  );
}
