"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Bot, Send, User } from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TutorResponseActions } from "@/components/ai/tutor-response-actions";
import { MixedMathText } from "@/components/ui/mixed-math-text";
import type { AIRequestCategory } from "@/lib/ai/classifier";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  requestCategory?: AIRequestCategory;
}

export default function TeacherTutorPage() {
  const [subject, setSubject] = React.useState("Compulsory Mathematics");
  const [question, setQuestion] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [messages, setMessages] = React.useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Ask a teaching or subject question. I will answer directly, explain the required details, and check calculations before replying.",
    },
  ]);

  const sendQuestion = async (textToSend?: string) => {
    const content = (textToSend || question).trim();
    if (!content || loading) return;

    const userMessage: ChatMessage = { id: `user-${Date.now()}`, role: "user", content };
    const history = messages.slice(-10).map((message) => ({
      role: message.role,
      content: message.content,
    }));
    setMessages((current) => [...current, userMessage]);
    setQuestion("");
    setLoading(true);

    try {
      const response = await fetch("/api/tutor/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: content,
          history,
          grade: "Class 8",
          subject,
          chapter: "Teacher question",
          currentStage: "STAGE_2_GUIDED_EXPLORATION",
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.message?.content) {
        throw new Error(data.error || "The Tutor did not return an answer.");
      }
      setMessages((current) => [
        ...current,
        {
          id: data.message.id || `answer-${Date.now()}`,
          role: "assistant",
          content: data.message.content,
          requestCategory: data.requestCategory,
        },
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: error instanceof Error ? error.message : "The Tutor could not answer this question.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-muted/20">
      <SiteHeader />
      <main className="flex-1 py-8">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-5">
          <div className="space-y-1 border-b pb-4">
            <Link href="/teacher" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Teacher Workspace
            </Link>
            <h1 className="text-2xl font-bold tracking-tight">Teacher AI Tutor</h1>
            <p className="text-xs text-muted-foreground">
              Ask subject, explanation, example, or lesson-preparation questions using the configured local AI provider.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <label htmlFor="teacher-tutor-subject" className="text-xs font-semibold">Subject</label>
            <select
              id="teacher-tutor-subject"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              className="h-9 rounded-xl border border-input bg-background px-3 text-xs"
            >
              <option>Compulsory Mathematics</option>
              <option>Science & Technology</option>
              <option>English</option>
              <option>Nepali</option>
              <option>Social Studies</option>
            </select>
          </div>

          <Card className="flex h-[600px] flex-col overflow-hidden border bg-card">
            <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6" aria-live="polite">
              {messages.map((message, messageIndex) => {
                const isUser = message.role === "user";
                const precedingQuestion = messages
                  .slice(0, messageIndex)
                  .reverse()
                  .find((item) => item.role === "user")?.content;
                return (
                  <div key={message.id} className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${isUser ? "bg-primary text-primary-foreground" : "bg-emerald-600 text-white"}`}>
                      {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                    </div>
                    <div className={`max-w-[84%] rounded-2xl border p-4 text-xs leading-relaxed ${isUser ? "bg-primary text-primary-foreground" : "bg-muted/40"}`}>
                      <MixedMathText content={message.content} />
                      {!isUser ? (
                        <TutorResponseActions
                          answer={message.content}
                          question={precedingQuestion}
                          grade="Class 8"
                          subject={subject}
                          topic="Teacher question"
                          onFollowUp={(prompt) => void sendQuestion(prompt)}
                          onRegenerate={precedingQuestion ? () => void sendQuestion(precedingQuestion) : undefined}
                          autoCreate={message.requestCategory === "IMAGE_GENERATION" ? "image" : message.requestCategory === "VISUAL_CREATION" ? "visual" : undefined}
                        />
                      ) : null}
                    </div>
                  </div>
                );
              })}
              {loading ? (
                <div className="text-xs text-muted-foreground">Solving and checking the answer...</div>
              ) : null}
            </div>

            <div className="flex gap-3 border-t p-4">
              <Input
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void sendQuestion();
                  }
                }}
                placeholder="Ask any teaching or subject question..."
                disabled={loading}
              />
              <Button
                variant="nepal"
                onClick={() => void sendQuestion()}
                disabled={loading || !question.trim()}
                className="gap-1.5"
              >
                Send <Send className="h-3.5 w-3.5" />
              </Button>
            </div>
          </Card>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
