"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Send,
  CheckCircle2,
  Eye,
  Edit3,
  Calculator,
  FileCheck2,
  Sparkles,
  BookMarked,
} from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MathView } from "@/components/ui/math-view";

type WorkflowStatus = "DRAFT" | "SUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "PUBLISHED";

export default function CurriculumEditorPage() {
  // Lesson Meta
  const [title, setTitle] = React.useState("Cardinality of Two Overlapping Sets");
  const [titleNepali, setTitleNepali] = React.useState("दुई खप्टिएका समूहहरूको गणनात्मकता");
  const grade = "Class 8";
  const subject = "Compulsory Mathematics";
  const unit = "Unit 1: Sets";
  const chapter = "Chapter 1: Overlapping Sets";
  const outcomeCode = "LO-MTH801-1.1";
  const cognitiveLevel = "APPLICATION";

  // Body Content
  const [bodyMarkdown, setBodyMarkdown] = React.useState(
    `### What are Overlapping Sets?\nTwo sets $A$ and $B$ are said to be **overlapping sets** if they share at least one common element, meaning $A \\cap B \\neq \\emptyset$.\n\n### The Fundamental Cardinality Theorem\nWhen two sets $A$ and $B$ overlap in universal set $U$:\n$$n(A \\cup B) = n(A) + n(B) - n(A \\cap B)$$\n\nIf $U$ represents the entire class roster:\n$$n(U) = n(A \\cup B) + n(A \\cup B)'$$`
  );

  // Formulas
  const [formulaName, setFormulaName] = React.useState("Cardinality of Union of Two Sets");
  const [latexExpression, setLatexExpression] = React.useState("n(A \\cup B) = n(A) + n(B) - n(A \\cap B)");
  const [formulaVars, setFormulaVars] = React.useState("n(A): elements in set A, n(B): elements in set B, n(A ∩ B): intersection");

  // Worked Example
  const [exampleProblem, setExampleProblem] = React.useState(
    "In a class of 60 students, 35 like Nepali, 28 like English, and 12 like both subjects. Find how many students like neither subject using formula."
  );
  const [exampleSolution, setExampleSolution] = React.useState(
    "1. Compute union: n(N ∪ E) = 35 + 28 - 12 = 51\n2. Compute complement: n(N ∪ E)' = 60 - 51 = 9 students."
  );

  // Textbook Citation
  const [bookTitle, setBookTitle] = React.useState("CDC Grade 8 Compulsory Mathematics (Syllabus 2081)");
  const [pageNumber, setPageNumber] = React.useState("Pages 12–15");

  // Workflow State
  const [status, setStatus] = React.useState<WorkflowStatus>("PUBLISHED");
  const [notification, setNotification] = React.useState<string | null>(null);

  const handleWorkflowAction = async (newStatus: WorkflowStatus, message: string) => {
    setStatus(newStatus);
    setNotification(message);
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div className="flex min-h-screen flex-col bg-muted/20">
      <SiteHeader />
      <main className="flex-1 py-6">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Top Workflow Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Link
                  href="/admin/curriculum"
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Back to Curriculum CMS
                </Link>
              </div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight">CDC Lesson Authoring & LaTeX Editor</h1>
                <Badge
                  variant={
                    status === "PUBLISHED"
                      ? "success"
                      : status === "APPROVED"
                      ? "nepal"
                      : status === "UNDER_REVIEW"
                      ? "subtle"
                      : "outline"
                  }
                  className="text-[10px]"
                >
                  Workflow: {status}
                </Badge>
              </div>
            </div>

            {/* Workflow Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleWorkflowAction("DRAFT", "Saved as Draft")}
                className="text-xs gap-1"
              >
                <Save className="h-3.5 w-3.5" />
                Save Draft
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleWorkflowAction("SUBMITTED", "Submitted for Reviewer Audit")}
                className="text-xs gap-1"
              >
                <Send className="h-3.5 w-3.5" />
                Submit
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleWorkflowAction("APPROVED", "Curriculum Approved by Admin")}
                className="text-xs gap-1"
              >
                <FileCheck2 className="h-3.5 w-3.5 text-blue-600" />
                Approve
              </Button>

              <Button
                variant="nepal"
                size="sm"
                onClick={() => handleWorkflowAction("PUBLISHED", "Published to Live Student Portal")}
                className="text-xs gap-1"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Publish Live
              </Button>
            </div>
          </div>

          {/* Toast Notification */}
          {notification && (
            <div className="rounded-xl bg-emerald-500/15 border border-emerald-500/30 p-3 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>{notification}</span>
            </div>
          )}

          {/* Metadata Bar */}
          <Card className="p-4 border bg-card grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground">Grade & Subject</label>
              <div className="font-semibold text-foreground pt-0.5">
                {grade} • {subject}
              </div>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground">Unit & Chapter</label>
              <div className="font-semibold text-foreground pt-0.5">
                {unit} / {chapter}
              </div>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground">CDC Learning Outcome</label>
              <div className="font-mono text-primary font-bold pt-0.5">{outcomeCode}</div>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground">Bloom Cognitive Level</label>
              <Badge variant="outline" className="text-[10px] mt-0.5">
                {cognitiveLevel}
              </Badge>
            </div>
          </Card>

          {/* Split Pane Editor & Live Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Pane: Authoring Controls */}
            <div className="lg:col-span-6 space-y-4">
              <Card className="border bg-card p-5 space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <Edit3 className="h-4 w-4 text-primary" />
                    <span>Lesson Core Content</span>
                  </div>
                  <Badge variant="outline" className="text-[10px]">
                    Markdown & LaTeX
                  </Badge>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="space-y-1">
                    <label className="font-semibold text-foreground">Lesson Title (English)</label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="text-xs h-9"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-foreground">Lesson Title (Nepali)</label>
                    <Input
                      value={titleNepali}
                      onChange={(e) => setTitleNepali(e.target.value)}
                      className="text-xs h-9 font-nepali"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="font-semibold text-foreground">Theory / Concept Body</label>
                      <span className="text-[10px] text-muted-foreground">
                        Supports $...$ inline and $$...$$ display math
                      </span>
                    </div>
                    <textarea
                      rows={9}
                      value={bodyMarkdown}
                      onChange={(e) => setBodyMarkdown(e.target.value)}
                      className="w-full rounded-xl border border-input bg-background p-3 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </Card>

              {/* LaTeX Formula Block */}
              <Card className="border bg-card p-5 space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <Calculator className="h-4 w-4 text-emerald-600" />
                    <span>Structured Formula Specification</span>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="space-y-1">
                    <label className="font-semibold text-foreground">Formula Title</label>
                    <Input
                      value={formulaName}
                      onChange={(e) => setFormulaName(e.target.value)}
                      className="text-xs h-9"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-foreground">LaTeX Expression</label>
                    <Input
                      value={latexExpression}
                      onChange={(e) => setLatexExpression(e.target.value)}
                      className="text-xs h-9 font-mono text-primary font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-foreground">Variable Descriptions</label>
                    <Input
                      value={formulaVars}
                      onChange={(e) => setFormulaVars(e.target.value)}
                      className="text-xs h-9"
                    />
                  </div>
                </div>
              </Card>

              {/* Worked Example */}
              <Card className="border bg-card p-5 space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <Sparkles className="h-4 w-4 text-purple-600" />
                    <span>Step-by-Step Worked Example</span>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="space-y-1">
                    <label className="font-semibold text-foreground">Problem Statement</label>
                    <textarea
                      rows={2}
                      value={exampleProblem}
                      onChange={(e) => setExampleProblem(e.target.value)}
                      className="w-full rounded-xl border border-input bg-background p-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-foreground">Step-by-Step Solution</label>
                    <textarea
                      rows={3}
                      value={exampleSolution}
                      onChange={(e) => setExampleSolution(e.target.value)}
                      className="w-full rounded-xl border border-input bg-background p-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </Card>

              {/* Textbook Citation */}
              <Card className="border bg-card p-5 space-y-3">
                <div className="flex items-center gap-2 font-bold text-sm border-b pb-3">
                  <BookMarked className="h-4 w-4 text-amber-600" />
                  <span>CDC Textbook Citation</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <label className="font-semibold text-foreground">Textbook Edition</label>
                    <Input
                      value={bookTitle}
                      onChange={(e) => setBookTitle(e.target.value)}
                      className="text-xs h-9"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-foreground">Page Reference</label>
                    <Input
                      value={pageNumber}
                      onChange={(e) => setPageNumber(e.target.value)}
                      className="text-xs h-9"
                    />
                  </div>
                </div>
              </Card>
            </div>

            {/* Right Pane: Real-Time KaTeX Student View Preview */}
            <div className="lg:col-span-6 space-y-4 sticky top-6">
              <Card className="border bg-card shadow-lg p-6 space-y-6">
                <div className="flex items-center justify-between border-b pb-4">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-primary" />
                    <span className="font-bold text-sm text-foreground">Live KaTeX Student Preview</span>
                  </div>
                  <Badge variant="nepal" className="text-[10px]">
                    Sample Metadata
                  </Badge>
                </div>

                {/* Lesson Header Preview */}
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">
                    {grade} • {subject} • {unit}
                  </div>
                  <h2 className="text-2xl font-extrabold tracking-tight text-foreground">{title}</h2>
                  <p className="text-sm font-nepali text-muted-foreground">{titleNepali}</p>
                </div>

                {/* Formula Highlight Preview Box */}
                <div className="rounded-2xl border bg-primary/5 border-primary/20 p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-primary">{formulaName}</span>
                    <Badge variant="outline" className="text-[10px]">
                      Core Theorem
                    </Badge>
                  </div>
                  <div className="text-center py-2 overflow-x-auto text-lg text-foreground font-semibold">
                    <MathView math={latexExpression} displayMode={true} />
                  </div>
                  <p className="text-[11px] text-muted-foreground">{formulaVars}</p>
                </div>

                {/* Theory Body Preview */}
                <div className="prose dark:prose-invert max-w-none text-xs leading-relaxed space-y-3">
                  <div className="font-semibold text-sm text-foreground">Concept Explanation</div>
                  <div className="p-4 rounded-xl border bg-muted/20 whitespace-pre-line">
                    {bodyMarkdown}
                  </div>
                </div>

                {/* Worked Example Preview */}
                <div className="rounded-2xl border bg-emerald-500/5 border-emerald-500/20 p-5 space-y-3">
                  <div className="flex items-center gap-2 font-bold text-xs text-emerald-800 dark:text-emerald-300">
                    <Sparkles className="h-4 w-4 text-emerald-600" />
                    <span>Worked Example</span>
                  </div>
                  <p className="text-xs text-foreground font-medium">{exampleProblem}</p>
                  <div className="p-3 rounded-lg bg-background border text-xs text-muted-foreground whitespace-pre-line font-mono">
                    {exampleSolution}
                  </div>
                </div>

                {/* Textbook Reference Footer */}
                <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-4 border-t">
                  <span>Source: {bookTitle}</span>
                  <span className="font-semibold">{pageNumber}</span>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
