"use client";

import * as React from "react";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Send,
  Sparkles,
  Calculator,
  Lightbulb,
  CheckCircle2,
  Languages,
  BookMarked,
  Bot,
  User,
} from "lucide-react";
import { StudentDashboardShell } from "@/components/layout/student-dashboard-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MathView } from "@/components/ui/math-view";
import { TutorResponseActions } from "@/components/ai/tutor-response-actions";
import { MixedMathText } from "@/components/ui/mixed-math-text";
import { SocraticStage, TutorMessageItem, HintTier, HintResponse } from "@/lib/ai/tutor/types";

function SocraticTutorContent() {
  const searchParams = useSearchParams();
  const initialSubject = searchParams.get("subject") || "mth-801";

  const [selectedSubject, setSelectedSubject] = React.useState(initialSubject);
  const [selectedChapter, setSelectedChapter] = React.useState("Sets & Cardinality");
  const [currentStage, setCurrentStage] = React.useState<SocraticStage>("STAGE_2_GUIDED_EXPLORATION");
  const [inputMessage, setInputMessage] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [activeHint, setActiveHint] = React.useState<HintResponse | null>(null);
  const [currentHintTier, setCurrentHintTier] = React.useState<HintTier>(1);

  const [messages, setMessages] = React.useState<TutorMessageItem[]>([
    {
      id: "msg-0",
      role: "assistant",
      content: `नमस्ते Aayush! I am your AI Tutor.

We are exploring Class 8 Mathematics: Unit 1 (Sets).

Remember our fundamental theorem for overlapping sets:
n(A union B) = n(A) + n(B) - n(A intersection B)

Ask any question. I will give the direct answer, explain the required steps, and check the result.`,
      stage: "STAGE_1_DIAGNOSIS",
      timestamp: "Just now",
    },
  ]);

  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || loading) return;

    const userMsg: TutorMessageItem = {
      id: `usr-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: "Just now",
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setLoading(true);

    try {
      const res = await fetch("/api/tutor/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          grade: "Class 8",
          subject: selectedSubject === "mth-801" ? "Compulsory Mathematics" : "Science & Technology",
          chapter: selectedChapter,
          currentStage,
          history: messages
            .filter((item) => item.role === "user" || item.role === "assistant")
            .slice(-10)
            .map((item) => ({ role: item.role, content: item.content })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "The Tutor could not answer this question.");
      }

      if (data.message) {
        setMessages((prev) => [...prev, data.message]);
        if (data.currentStage) {
          setCurrentStage(data.currentStage);
        }
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          content: error instanceof Error ? error.message : "The Tutor could not answer this question.",
          timestamp: "Just now",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestHint = async () => {
    try {
      const res = await fetch("/api/tutor/hints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: selectedChapter,
          tier: currentHintTier,
        }),
      });
      const data = await res.json();
      if (data.hint) {
        setActiveHint(data.hint);
        if (data.hint.nextTierAvailable) {
          setCurrentHintTier((prev) => (prev < 3 ? ((prev + 1) as HintTier) : 1));
        } else {
          setCurrentHintTier(1);
        }
      }
    } catch {
      // ignore
    }
  };

  const stageLabels: Record<SocraticStage, { label: string; color: string }> = {
    STAGE_1_DIAGNOSIS: { label: "1. Understand Question", color: "bg-blue-500/10 text-blue-600 border-blue-200" },
    STAGE_2_GUIDED_EXPLORATION: { label: "2. Direct Answer", color: "bg-purple-500/10 text-purple-600 border-purple-200" },
    STAGE_3_CONCEPTUAL_BRIDGE: { label: "3. Explain Concept", color: "bg-amber-500/10 text-amber-600 border-amber-200" },
    STAGE_4_INDEPENDENT_CALCULATION: { label: "4. Verify Result", color: "bg-cyan-500/10 text-cyan-600 border-cyan-200" },
    STAGE_5_MASTERY_CONFIRMED: { label: "5. Complete", color: "bg-emerald-500/10 text-emerald-600 border-emerald-200" },
  };

  return (
    <div className="space-y-4">
      {/* Top Bar: Subject & Socratic Stage Tracker */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border bg-card shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedSubject}
            onChange={(e) => {
              setSelectedSubject(e.target.value);
              setSelectedChapter(e.target.value === "mth-801" ? "Sets & Cardinality" : "Force & Pressure");
            }}
            className="h-9 rounded-xl border border-input bg-background px-3 text-xs font-semibold focus:ring-2 focus:ring-primary"
          >
            <option value="mth-801">Class 8 — Compulsory Mathematics</option>
            <option value="sci-802">Class 8 — Science & Technology</option>
          </select>

          <select
            value={selectedChapter}
            onChange={(e) => setSelectedChapter(e.target.value)}
            className="h-9 rounded-xl border border-input bg-background px-3 text-xs focus:ring-2 focus:ring-primary"
          >
            {selectedSubject === "mth-801" ? (
              <>
                <option value="Sets & Cardinality">Unit 1: Sets (खप्टिएका समूहहरू)</option>
                <option value="Profit, Loss & VAT">Unit 2: Arithmetic (13% VAT)</option>
                <option value="Algebraic Factorization">Unit 4: Algebra (ax² + bx + c)</option>
              </>
            ) : (
              <>
                <option value="Force & Pressure">Unit 2: Pressure & Archimedes (U = Vdg)</option>
                <option value="Measurement">Unit 1: Scientific Measurement</option>
              </>
            )}
          </select>

          <Badge variant="outline" className="text-[10px] font-mono">
            LO-MTH801-1.1
          </Badge>
        </div>

        {/* Answer Stage Pill */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-muted-foreground font-medium">Answer Stage:</span>
          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${stageLabels[currentStage].color}`}>
            {stageLabels[currentStage].label}
          </span>
        </div>
      </div>

      {/* Main Chat Workspace */}
      <Card className="flex flex-col h-[620px] border bg-card overflow-hidden shadow-md">
        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {messages.map((m, messageIndex) => {
            const isUser = m.role === "user";
            const precedingQuestion = messages
              .slice(0, messageIndex)
              .reverse()
              .find((item) => item.role === "user")?.content;
            return (
              <div key={m.id} className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-bold text-xs shadow-sm ${
                    isUser
                      ? "bg-primary text-primary-foreground"
                      : "bg-gradient-to-br from-red-600 to-blue-700 text-white"
                  }`}
                >
                  {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>

                <div className={`space-y-1.5 max-w-[82%] ${isUser ? "items-end" : "items-start"}`}>
                  <div
                    className={`rounded-2xl p-4 text-xs leading-relaxed ${
                      isUser
                        ? "bg-primary text-primary-foreground rounded-tr-none"
                        : "bg-muted/40 border text-foreground rounded-tl-none shadow-sm"
                    }`}
                  >
                    <MixedMathText content={m.content} />
                  </div>

                  {/* CDC Citation Footer for Assistant Messages */}
                  {!isUser && m.citations && m.citations.length > 0 && (
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground pl-1">
                      <BookMarked className="h-3 w-3 text-primary" />
                      <span>
                        CDC Curriculum Citation: {m.citations[0].grade} • {m.citations[0].chapter} (p. {m.citations[0].page})
                      </span>
                    </div>
                  )}
                  {!isUser ? (
                    <TutorResponseActions
                      answer={m.content}
                      question={precedingQuestion}
                      grade="Class 8"
                      subject={selectedSubject === "mth-801" ? "Compulsory Mathematics" : "Science & Technology"}
                      topic={selectedChapter}
                      onFollowUp={(prompt) => void handleSendMessage(prompt)}
                      onRegenerate={precedingQuestion ? () => void handleSendMessage(precedingQuestion) : undefined}
                      autoCreate={m.requestCategory === "IMAGE_GENERATION" ? "image" : m.requestCategory === "VISUAL_CREATION" ? "visual" : undefined}
                    />
                  ) : null}
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-red-600 to-blue-700 text-white text-xs animate-pulse">
                <Bot className="h-4 w-4" />
              </div>
              <div className="rounded-2xl rounded-tl-none border bg-muted/40 p-4 text-xs text-muted-foreground flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 animate-spin text-primary" />
                <span>Solving, checking, and preparing a clear answer...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Hint Banner (if active) */}
        {activeHint && (
          <div className="px-4 py-3 bg-amber-500/10 border-t border-b border-amber-500/20 text-xs text-amber-900 dark:text-amber-200 flex items-center justify-between animate-in fade-in">
            <div className="space-y-1">
              <div className="font-semibold flex items-center gap-1.5">
                <Lightbulb className="h-3.5 w-3.5 text-amber-600" />
                <span>Progressive Hint (Tier {activeHint.tier} of 3)</span>
              </div>
              <p>{activeHint.hintText}</p>
              {activeHint.latexSnippet && (
                <div className="pt-1 font-mono text-primary font-bold">
                  <MathView math={activeHint.latexSnippet} displayMode={false} />
                </div>
              )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveHint(null)}
              className="h-7 text-[11px] text-muted-foreground"
            >
              Dismiss
            </Button>
          </div>
        )}

        {/* Quick Prompt Buttons */}
        <div className="p-3 bg-muted/20 border-t flex items-center gap-2 overflow-x-auto text-xs no-scrollbar">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRequestHint}
            className="h-8 text-[11px] shrink-0 gap-1.5 bg-background hover:border-amber-500"
          >
            <Lightbulb className="h-3 w-3 text-amber-500" />
            Hint (Tier {currentHintTier})
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSendMessage("Give the direct answer, show the relevant formula in plain text, and explain each variable.")}
            className="h-8 text-[11px] shrink-0 gap-1.5 bg-background"
          >
            <Calculator className="h-3 w-3 text-primary" />
            Show Formula
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSendMessage("कृपया मलाई यो नेपालीमा सरल भाषामा सम्झाउनुहोस्।")}
            className="h-8 text-[11px] shrink-0 gap-1.5 bg-background font-nepali"
          >
            <Languages className="h-3 w-3 text-emerald-600" />
            नेपालीमा सम्झाउनुहोस्
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSendMessage("Can you give me a similar practice problem to test my understanding?")}
            className="h-8 text-[11px] shrink-0 gap-1.5 bg-background"
          >
            <CheckCircle2 className="h-3 w-3 text-blue-600" />
            Test My Understanding
          </Button>
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-card border-t flex items-center gap-3">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Ask any question. The Tutor will answer directly and explain the steps."
            className="text-xs h-11"
            disabled={loading}
          />
          <Button
            variant="nepal"
            onClick={() => handleSendMessage()}
            disabled={loading || !inputMessage.trim()}
            className="h-11 px-5 shrink-0 gap-1.5 text-xs font-semibold"
          >
            <span>Send</span>
            <Send className="h-3.5 w-3.5" />
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default function StudentTutorPage() {
  return (
    <StudentDashboardShell>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AI Tutor</h1>
          <p className="text-xs text-muted-foreground">
            Get a direct answer, the required explanation, and a checked result from the configured AI provider.
          </p>
        </div>
        <Suspense
          fallback={
            <div className="flex h-96 items-center justify-center text-xs text-muted-foreground">
              Loading AI Tutor workspace...
            </div>
          }
        >
          <SocraticTutorContent />
        </Suspense>
      </div>
    </StudentDashboardShell>
  );
}
