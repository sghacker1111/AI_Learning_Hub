"use client";

import Link from "next/link";
import { Bot, Sparkles, BookOpen, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function TutorPreviewSection() {
  return (
    <section id="ai-tutor" className="py-20 bg-gradient-to-b from-background via-muted/30 to-background border-t">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          {/* Left Column */}
          <div className="lg:col-span-6 space-y-6">
            <Badge variant="subtle" className="px-3 py-1 text-xs font-semibold">
              Configured Local AI Tutor
            </Badge>

            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-foreground">
              Direct Answers with Clear Explanations
            </h2>

            <p className="text-muted-foreground text-base leading-relaxed">
              {"Students and teachers receive the answer they asked for, followed by the essential reasoning and a result check. "}
              <strong>AI Learning Nepal</strong>
              {" uses the configured hosted open model, recent conversation context, and relevant bundled Class 8 samples when available."}
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 font-bold text-xs">
                  01
                </div>
                <div>
                  <h4 className="text-sm font-semibold">Metadata-Filtered RAG Retrieval</h4>
                  <p className="text-xs text-muted-foreground">
                    Tutor chat retrieves relevant material from five bundled Class 8 reference chunks and labels it as an unverified sample.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 font-bold text-xs">
                  02
                </div>
                <div>
                  <h4 className="text-sm font-semibold">Rule-Based Math Verification</h4>
                  <p className="text-xs text-muted-foreground">
                    Supported sets, VAT, algebra, and physics steps are checked by deterministic routines; unsupported steps are marked unverified.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 font-bold text-xs">
                  03
                </div>
                <div>
                  <h4 className="text-sm font-semibold">Multi-Provider Server-Side Router</h4>
                  <p className="text-xs text-muted-foreground">
                    Supports Qwen-compatible, OpenRouter, Groq, or local Ollama configuration through server environment variables.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Link href="/student/tutor">
                <Button variant="nepal" size="lg" className="gap-2">
                  <Bot className="h-4 w-4" />
                  Open AI Tutor Demo
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Column - Interactive Preview Box */}
          <div className="lg:col-span-6">
            <div className="rounded-3xl border bg-card p-6 shadow-xl space-y-4">
              {/* Tutor Header */}
              <div className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-sm font-semibold">Static Tutor Sample: Class 8 Science</span>
                </div>
                <Badge variant="outline" className="text-xs">Mode: Explain Simply</Badge>
              </div>

              {/* Sample Dialog */}
              <div className="space-y-3.5 text-xs">
                <div className="bg-muted p-3.5 rounded-2xl rounded-tr-sm self-end ml-10">
                  <p className="font-medium text-foreground">
                    &quot;What is Archimedes&apos; Principle and how does it relate to upthrust in liquid?&quot;
                  </p>
                </div>

                <div className="bg-primary/5 border border-primary/20 p-4 rounded-2xl rounded-tl-sm mr-6 space-y-2.5">
                  <div className="flex items-center gap-2 text-primary font-semibold text-xs">
                    <Sparkles className="h-4 w-4" />
                    <span>Class 8 sample • Force &amp; Pressure</span>
                  </div>
                  <p className="text-foreground leading-relaxed">
                    {"According to Archimedes' Principle, when an object is partially or wholly immersed in a liquid, it experiences an upward force (upthrust) which is equal to the weight of the liquid displaced by it."}
                  </p>
                  <div className="p-2.5 bg-background rounded-lg border font-mono text-xs text-blue-600 dark:text-blue-400">
                    {"U = V × d × g"}
                    <span className="text-[10px] text-muted-foreground block mt-1">
                      Where U = Upthrust, V = Volume displaced, d = Density of liquid, g = Gravity
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 pt-1 text-[11px] text-muted-foreground border-t">
                    <BookOpen className="h-3 w-3 text-emerald-500" />
                    <span>Concept example only • no official textbook page citation</span>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex flex-wrap gap-2 pt-2 border-t text-[11px]">
                <span className="rounded-lg bg-secondary px-3 py-1.5 font-medium">
                  💡 Show Hint
                </span>
                <span className="rounded-lg bg-secondary px-3 py-1.5 font-medium">
                  🧪 Test with a practice question
                </span>
                <span className="rounded-lg bg-secondary px-3 py-1.5 font-medium">
                  🇳🇵 नेपालीमा व्याख्या गर्नुहोस्
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
