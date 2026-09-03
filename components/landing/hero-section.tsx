"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, Bot, CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
      {/* Background gradients */}
      <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
        <div className="h-[450px] w-[600px] rounded-full bg-gradient-to-tr from-red-500/10 via-blue-500/10 to-indigo-500/10 blur-3xl" />
        <div className="absolute top-1/4 -left-32 h-[350px] w-[350px] rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-12">
          {/* Left Column - Copy & Actions */}
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left lg:col-span-7 space-y-6">
            <Badge variant="outline" className="gap-2 px-3 py-1.5 border-primary/30 bg-primary/5 text-primary text-xs font-medium rounded-full">
              <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
              <span>Nepal-Focused Learning Prototype</span>
            </Badge>

            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-foreground leading-[1.15]">
              Learn Smarter with Your{" "}
              <span className="bg-gradient-to-r from-red-600 via-rose-500 to-blue-700 bg-clip-text text-transparent">
                Personal AI Teacher
              </span>
            </h1>

            <p className="text-lg text-muted-foreground sm:text-xl max-w-2xl leading-relaxed">
              Explore a Nursery-to-Class-12 grade catalog and a working Class 8 sample with
              hosted open-model tutoring, rule-based solvers, practice, and English/नेपाली interfaces.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto pt-2">
              <Link href="/register" className="w-full sm:w-auto">
                <Button variant="nepal" size="lg" className="w-full sm:w-auto gap-2 shadow-lg shadow-red-500/25">
                  Create Demo Account
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="#classes" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto gap-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  Explore Grade Catalog
                </Button>
              </Link>
            </div>

            {/* Social Proof & Trust Badges */}
            <div className="pt-6 border-t border-border/60 w-full grid grid-cols-3 gap-4 text-center lg:text-left">
              <div>
                <p className="text-2xl font-bold text-foreground">15 Grades</p>
                <p className="text-xs text-muted-foreground">Nursery to Class 12</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">5 Chunks</p>
                <p className="text-xs text-muted-foreground">Class 8 Demo Content</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">Bilingual</p>
                <p className="text-xs text-muted-foreground">English & नेपाली</p>
              </div>
            </div>
          </div>

          {/* Right Column - Interactive Preview Card */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto max-w-md rounded-3xl border bg-card p-6 shadow-2xl shadow-primary/10">
              {/* Header of Preview */}
              <div className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">Tutor Interaction Preview</h3>
                    <p className="text-xs text-muted-foreground">Class 8 • Mathematics • Sets</p>
                  </div>
                </div>
                <Badge variant="subtle" className="text-[10px]">Static Sample</Badge>
              </div>

              {/* Chat Simulation */}
              <div className="space-y-4 py-5 text-sm">
                {/* Student message */}
                <div className="flex items-start justify-end gap-2">
                  <div className="rounded-2xl rounded-tr-sm bg-primary px-4 py-2.5 text-primary-foreground max-w-[85%] shadow-sm">
                    <p className="text-xs">{"How do I find A ∪ B when A = {1, 2, 3} and B = {3, 4, 5}?"}</p>
                  </div>
                </div>

                {/* AI Tutor message */}
                <div className="flex items-start gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div className="rounded-2xl rounded-tl-sm bg-muted/60 p-3.5 text-foreground max-w-[88%] space-y-2 border">
                    <p className="text-xs font-medium text-primary">Direct answer example:</p>
                    <p className="text-xs leading-relaxed">
                      {"The union is A ∪ B = {1, 2, 3, 4, 5}. Start with every element in A, then add only the elements from B that are not already present."}
                    </p>
                    <div className="rounded-lg bg-background p-2 font-mono text-xs text-emerald-600 dark:text-emerald-400 border">
                      {"A ∪ B = {elements in A or B}"}
                    </div>
                    <div className="flex items-center gap-1.5 pt-1 text-[10px] text-muted-foreground">
                      <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                      <span>Bundled Class 8 example • not an official page citation</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Prompt Suggestions */}
              <div className="space-y-2 pt-2 border-t">
                <p className="text-[11px] font-medium text-muted-foreground">Try asking in English or Nepali:</p>
                <div className="flex flex-wrap gap-1.5">
                  <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] text-secondary-foreground">
                    &quot;Explain with Venn Diagram&quot;
                  </span>
                  <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] text-secondary-foreground">
                    &quot;मलाई उदाहरण दिनुहोस्&quot;
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
