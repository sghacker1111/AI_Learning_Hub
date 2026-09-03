"use client";

import * as React from "react";
import Link from "next/link";
import {
  CheckCircle2,
  ArrowRight,
  RotateCcw,
  Bot,
  Flame,
  Award,
  BookMarked,
  XCircle,
} from "lucide-react";
import { StudentDashboardShell } from "@/components/layout/student-dashboard-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MathView } from "@/components/ui/math-view";
import { CognitiveLevel, GeneratedQuestion, AnswerSubmissionResult } from "@/lib/practice/types";
import { generateAdaptiveQuestion } from "@/lib/practice/generator";

export default function StudentPracticePage() {
  const [selectedSubject, setSelectedSubject] = React.useState("Compulsory Mathematics");
  const [selectedChapter, setSelectedChapter] = React.useState("Sets");
  const [currentLevel, setCurrentLevel] = React.useState<CognitiveLevel>("LEVEL_2_UNDERSTANDING");
  const [currentStreak, setCurrentStreak] = React.useState(0);
  const [questionIndex, setQuestionIndex] = React.useState(1);
  const [totalQuestions] = React.useState(5);
  const [totalScore, setTotalScore] = React.useState(0);
  const [correctCount, setCorrectCount] = React.useState(0);

  // Active question state
  const [currentQuestion, setCurrentQuestion] = React.useState<GeneratedQuestion>(() =>
    generateAdaptiveQuestion("Compulsory Mathematics", "Sets", "LEVEL_2_UNDERSTANDING")
  );
  const [selectedOptionId, setSelectedOptionId] = React.useState<string | null>(null);
  const [submitted, setSubmitted] = React.useState(false);
  const [submissionResult, setSubmissionResult] = React.useState<AnswerSubmissionResult | null>(null);
  const [isCompleted, setIsCompleted] = React.useState(false);

  const handleFetchNextQuestion = React.useCallback((level: CognitiveLevel) => {
    const q = generateAdaptiveQuestion(selectedSubject, selectedChapter, level);
    setCurrentQuestion(q);
    setSelectedOptionId(null);
    setSubmitted(false);
    setSubmissionResult(null);
  }, [selectedSubject, selectedChapter]);

  const handleSubjectChange = (subj: string, chap: string) => {
    setSelectedSubject(subj);
    setSelectedChapter(chap);
    setQuestionIndex(1);
    setCurrentStreak(0);
    setTotalScore(0);
    setCorrectCount(0);
    setIsCompleted(false);
    const q = generateAdaptiveQuestion(subj, chap, "LEVEL_2_UNDERSTANDING");
    setCurrentQuestion(q);
    setSelectedOptionId(null);
    setSubmitted(false);
    setSubmissionResult(null);
  };

  const handleCheckAnswer = async () => {
    if (!selectedOptionId || submitted) return;

    try {
      const res = await fetch("/api/practice/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payload: {
            questionId: currentQuestion.id,
            learningOutcomeCode: currentQuestion.learningOutcomeCode,
            selectedOptionId,
            timeSpentSeconds: 25,
            currentStreak,
            currentLevel,
          },
          correctOptionId: currentQuestion.correctOptionId,
          explanation: currentQuestion.explanationMarkdown,
        }),
      });

      const data = await res.json();
      if (data.result) {
        setSubmissionResult(data.result);
        setSubmitted(true);
        setCurrentStreak(data.result.newStreak);
        setCurrentLevel(data.result.nextRecommendedLevel);

        if (data.result.isCorrect) {
          setTotalScore((prev) => prev + currentQuestion.marks);
          setCorrectCount((prev) => prev + 1);
        }
      }
    } catch {
      // Fallback
      const isCorrect = selectedOptionId === currentQuestion.correctOptionId;
      setSubmitted(true);
      if (isCorrect) {
        setTotalScore((prev) => prev + currentQuestion.marks);
        setCorrectCount((prev) => prev + 1);
      }
    }
  };

  const handleNextQuestion = () => {
    if (questionIndex >= totalQuestions) {
      setIsCompleted(true);
      return;
    }

    setQuestionIndex((prev) => prev + 1);
    handleFetchNextQuestion(currentLevel);
  };

  const handleRestartQuiz = () => {
    setQuestionIndex(1);
    setCurrentStreak(0);
    setTotalScore(0);
    setCorrectCount(0);
    setIsCompleted(false);
    handleFetchNextQuestion("LEVEL_2_UNDERSTANDING");
  };

  const levelBadgeInfo: Record<CognitiveLevel, { label: string; color: string }> = {
    LEVEL_1_KNOWLEDGE: { label: "Level 1: Knowledge & Recall", color: "bg-blue-500/10 text-blue-600 border-blue-200" },
    LEVEL_2_UNDERSTANDING: { label: "Level 2: Understanding & Formulas", color: "bg-purple-500/10 text-purple-600 border-purple-200" },
    LEVEL_3_APPLICATION: { label: "Level 3: Application & Word Problems", color: "bg-amber-500/10 text-amber-600 border-amber-200" },
    LEVEL_4_HIGHER_ABILITY: { label: "Level 4: Higher Ability & Proofs", color: "bg-emerald-500/10 text-emerald-600 border-emerald-200" },
  };

  return (
    <StudentDashboardShell>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Interactive STEM Lab Banner */}
        <div className="rounded-2xl border bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-emerald-600/10 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-foreground">Interactive STEM Simulation Lab</span>
              <Badge variant="nepal" className="text-[10px]">New</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Verify your math steps, simulate 2-set Venn diagrams, and test Archimedes fluid upthrust.
            </p>
          </div>
          <Link href="/student/practice/stem-lab">
            <Button variant="outline" size="sm" className="text-xs gap-1.5 shrink-0 bg-background hover:bg-primary hover:text-primary-foreground">
              <span>Open STEM Lab</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        {/* Practice Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="subtle" className="text-xs">
                CDC Adaptive Practice Engine
              </Badge>
              <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${levelBadgeInfo[currentLevel].color}`}>
                {levelBadgeInfo[currentLevel].label}
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              Class 8 • {selectedSubject} ({selectedChapter})
            </h1>
            <p className="text-xs text-muted-foreground">
              Question {questionIndex} of {totalQuestions} • BLE Syllabus Aligned (2081/82)
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Subject Selector */}
            <select
              value={`${selectedSubject}|${selectedChapter}`}
              onChange={(e) => {
                const [subj, chap] = e.target.value.split("|");
                handleSubjectChange(subj, chap);
              }}
              className="h-9 rounded-xl border border-input bg-background px-3 text-xs font-semibold focus:ring-2 focus:ring-primary"
            >
              <option value="Compulsory Mathematics|Sets">Math: Sets (समुह)</option>
              <option value="Compulsory Mathematics|Arithmetic">Math: Arithmetic (13% VAT)</option>
              <option value="Science & Technology|Force & Pressure">Science: Force & Pressure (उर्ध्वचाप)</option>
            </select>

            {/* Streak Badge */}
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-orange-500/10 border border-orange-500/20 text-xs font-bold text-orange-600">
              <Flame className="h-3.5 w-3.5 fill-orange-500 text-orange-500" />
              <span>{currentStreak} Streak</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Progress: {Math.round((questionIndex / totalQuestions) * 100)}%</span>
            <span>Current Score: {totalScore} marks</span>
          </div>
          <Progress value={(questionIndex / totalQuestions) * 100} />
        </div>

        {/* QUIZ COMPLETION SUMMARY CARD */}
        {isCompleted ? (
          <Card className="p-8 border bg-card text-center space-y-6 shadow-md animate-in fade-in">
            <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600">
              <Award className="h-8 w-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground">Practice Session Completed! 🎉</h2>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                You solved {correctCount} out of {totalQuestions} questions correctly in <strong>{selectedChapter}</strong>.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto text-xs">
              <div className="p-3 rounded-xl bg-muted/40 border">
                <div className="text-muted-foreground">Accuracy</div>
                <div className="text-lg font-bold text-emerald-600">
                  {Math.round((correctCount / totalQuestions) * 100)}%
                </div>
              </div>
              <div className="p-3 rounded-xl bg-muted/40 border">
                <div className="text-muted-foreground">Marks Obtained</div>
                <div className="text-lg font-bold text-primary">{totalScore} Marks</div>
              </div>
              <div className="p-3 rounded-xl bg-muted/40 border">
                <div className="text-muted-foreground">Mastery Level</div>
                <div className="text-lg font-bold text-purple-600">
                  {currentLevel.replace("LEVEL_", "Level ").replace("_", " ")}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-4">
              <Button variant="outline" size="sm" onClick={handleRestartQuiz} className="gap-1.5 text-xs">
                <RotateCcw className="h-3.5 w-3.5" />
                Retry Chapter
              </Button>
              <Link href={`/student/tutor?topic=${encodeURIComponent(selectedChapter)}`}>
                <Button variant="nepal" size="sm" className="gap-1.5 text-xs font-semibold">
                  <Bot className="h-3.5 w-3.5" />
                  Review with AI Tutor
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          /* ACTIVE QUESTION CARD */
          <Card className="border bg-card p-6 space-y-6 shadow-md">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-[11px] font-mono">
                {currentQuestion.learningOutcomeCode} • {currentQuestion.difficultyLabel}
              </Badge>
              <span className="text-xs text-muted-foreground">Marks: {currentQuestion.marks}</span>
            </div>

            <div className="text-base font-semibold leading-relaxed space-y-2">
              <p>{currentQuestion.questionText}</p>
              {currentQuestion.latexEquation && (
                <div className="my-2 py-2 px-3 rounded-xl bg-primary/5 border border-primary/15 text-center font-mono text-xs text-primary font-bold">
                  <MathView math={currentQuestion.latexEquation} displayMode={false} />
                </div>
              )}
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentQuestion.options.map((opt) => {
                const isSelected = selectedOptionId === opt.id;
                const isCorrect = opt.id === currentQuestion.correctOptionId;

                let style = "border-border hover:bg-muted/50";
                if (submitted) {
                  if (isCorrect) style = "border-emerald-500 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 font-bold ring-2 ring-emerald-500/20";
                  else if (isSelected) style = "border-red-500 bg-red-500/10 text-red-800 dark:text-red-300 font-semibold";
                } else if (isSelected) {
                  style = "border-primary bg-primary/10 text-primary font-semibold ring-2 ring-primary/20";
                }

                return (
                  <button
                    key={opt.id}
                    disabled={submitted}
                    onClick={() => setSelectedOptionId(opt.id)}
                    className={`p-4 rounded-xl border text-left text-xs sm:text-sm transition-all flex items-center justify-between ${style}`}
                  >
                    <span>{opt.text}</span>
                    {submitted && isCorrect && <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />}
                    {submitted && isSelected && !isCorrect && <XCircle className="h-4 w-4 text-destructive shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Solution & Explanation on Submit */}
            {submitted && (
              <div className="rounded-2xl border bg-muted/40 p-4 space-y-3 text-xs animate-in fade-in duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-sm text-foreground">
                    {submissionResult?.isCorrect ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-destructive" />
                    )}
                    <span>
                      {submissionResult?.isCorrect
                        ? "Correct! Well Done 🌟"
                        : "Incorrect — Review CDC Solution Below"}
                    </span>
                  </div>

                  <Link
                    href={`/student/tutor?msg=${encodeURIComponent(
                      `I got this question wrong in practice: "${currentQuestion.questionText}". Can you explain step-by-step why the answer is ${
                        currentQuestion.options.find((o) => o.id === currentQuestion.correctOptionId)?.text
                      }?`
                    )}`}
                  >
                    <Button variant="outline" size="sm" className="h-7 text-[11px] gap-1 text-primary">
                      <Bot className="h-3 w-3" />
                      Ask AI Tutor
                    </Button>
                  </Link>
                </div>

                <div className="text-muted-foreground leading-relaxed whitespace-pre-line space-y-2">
                  {currentQuestion.explanationMarkdown.includes("$$") ? (
                    currentQuestion.explanationMarkdown.split("$$").map((part, pIdx) => {
                      if (pIdx % 2 === 1) {
                        return (
                          <div
                            key={pIdx}
                            className="my-2 py-2 px-3 rounded-lg bg-primary/10 text-center font-bold text-sm overflow-x-auto text-primary"
                          >
                            <MathView math={part} displayMode={true} />
                          </div>
                        );
                      }
                      return <span key={pIdx}>{part}</span>;
                    })
                  ) : (
                    <span>{currentQuestion.explanationMarkdown}</span>
                  )}
                </div>

                <div className="text-[10px] text-muted-foreground flex items-center gap-1 pt-1 border-t">
                  <BookMarked className="h-3 w-3 text-primary" />
                  <span>Nepal CDC Curriculum Learning Outcome: {currentQuestion.learningOutcomeCode}</span>
                </div>
              </div>
            )}

            {/* Footer Actions */}
            <div className="flex items-center justify-between pt-4 border-t">
              <span className="text-xs text-muted-foreground">
                {!submitted ? "Select an option and click Check Answer" : "Click Next Question to continue"}
              </span>

              {!submitted ? (
                <Button
                  variant="nepal"
                  size="sm"
                  disabled={!selectedOptionId}
                  onClick={handleCheckAnswer}
                  className="gap-2 px-6 text-xs font-semibold"
                >
                  Check Answer
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleNextQuestion}
                  className="gap-2 px-6 text-xs font-semibold"
                >
                  <span>{questionIndex >= totalQuestions ? "View Summary" : "Next Question"}</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </Card>
        )}
      </div>
    </StudentDashboardShell>
  );
}
