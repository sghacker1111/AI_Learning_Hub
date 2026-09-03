"use client";

import * as React from "react";
import Link from "next/link";
import {
  BookOpen,
  Search,
  Languages,
  ArrowLeft,
  Sparkles,
  Copy,
  Check,
  Keyboard,
} from "lucide-react";
import { StudentDashboardShell } from "@/components/layout/student-dashboard-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MathView } from "@/components/ui/math-view";
import { CDC_BILINGUAL_GLOSSARY, searchGlossary } from "@/lib/nepali/glossary";
import { transliterateRomanizedToDevanagari } from "@/lib/nepali/transliterator";
import { arabicToNepaliNumerals } from "@/lib/nepali/normalizer";
import { GlossaryTerm } from "@/lib/nepali/types";

export default function StudentGlossaryPage() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedSubject, setSelectedSubject] = React.useState("ALL");
  const [activeTab, setActiveTab] = React.useState<"glossary" | "transliterator">("glossary");

  // Transliterator sandbox state
  const [romanizedInput, setRomanizedInput] = React.useState("namaste sathi haru, set ko cardinality kasari nikalne?");
  const [copied, setCopied] = React.useState(false);

  const transliterated = React.useMemo(() => {
    return transliterateRomanizedToDevanagari(romanizedInput).devanagariText;
  }, [romanizedInput]);

  const filteredTerms: GlossaryTerm[] = React.useMemo(() => {
    return searchGlossary(searchQuery, selectedSubject);
  }, [searchQuery, selectedSubject]);

  const handleCopy = () => {
    navigator.clipboard.writeText(transliterated);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <StudentDashboardShell>
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
            <h1 className="text-2xl font-bold tracking-tight">CDC Bilingual Terminology & Transliterator Hub</h1>
            <p className="text-xs text-muted-foreground">
              Bilingual STEM glossary sample, Romanized-to-Devanagari converter, and terminology explorer.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="nepal" className="text-xs">
              English • नेपाली द्विभाषी
            </Badge>
          </div>
        </div>

        {/* View Switcher */}
        <div className="flex flex-wrap gap-2 p-1.5 bg-muted rounded-2xl border">
          <button
            onClick={() => setActiveTab("glossary")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "glossary"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <BookOpen className="h-4 w-4 text-primary" />
            <span>CDC Bilingual Glossary ({CDC_BILINGUAL_GLOSSARY.length} Terms)</span>
          </button>

          <button
            onClick={() => setActiveTab("transliterator")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "transliterator"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Keyboard className="h-4 w-4 text-purple-600" />
            <span>Romanized Nepali Transliterator Sandbox</span>
          </button>
        </div>

        {/* TAB 1: GLOSSARY EXPLORER */}
        {activeTab === "glossary" && (
          <div className="space-y-5">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search in English, नेपाली (Devanagari), or Romanized (e.g. upthrust, समूह, vat)..."
                  className="pl-9 text-xs h-10"
                />
              </div>

              <div className="flex gap-2">
                {["ALL", "Mathematics", "Science"].map((subj) => (
                  <Button
                    key={subj}
                    variant={selectedSubject === subj ? "nepal" : "outline"}
                    size="sm"
                    onClick={() => setSelectedSubject(subj)}
                    className="text-xs h-10 px-4"
                  >
                    {subj === "ALL" ? "All Subjects" : subj}
                  </Button>
                ))}
              </div>
            </div>

            {/* Results Count */}
            <div className="flex justify-between items-center text-xs text-muted-foreground px-1">
              <span>Showing {filteredTerms.length} curriculum terminology entries</span>
              <span>CDC Standard Curricula 2081/82</span>
            </div>

            {/* Term Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTerms.map((term) => (
                <Card key={term.id} className="p-5 border bg-card hover:shadow-md transition-all space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                          <span>{term.english}</span>
                        </h3>
                        <div className="text-sm font-bold text-primary font-nepali">
                          {term.nepali} <span className="text-[11px] font-normal text-muted-foreground">({term.romanized})</span>
                        </div>
                      </div>

                      <Badge variant="outline" className="text-[10px] shrink-0">
                        {term.subject}
                      </Badge>
                    </div>

                    {/* Formula / Symbol */}
                    {term.formulaOrSymbol && (
                      <div className="p-2.5 rounded-xl bg-primary/5 border border-primary/15 text-center font-mono text-xs text-primary font-bold overflow-x-auto">
                        <MathView math={term.formulaOrSymbol} displayMode={false} />
                      </div>
                    )}

                    {/* Definitions */}
                    <div className="space-y-2 text-xs">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                          English Definition
                        </span>
                        <p className="text-muted-foreground leading-relaxed">
                          {term.definitionEnglish}
                        </p>
                      </div>

                      <div className="space-y-0.5 pt-1 border-t">
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                          नेपाली परिभाषा
                        </span>
                        <p className="text-foreground leading-relaxed font-nepali">
                          {term.definitionNepali}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>Grade: <strong>{term.gradeLevel}</strong></span>
                    <Link
                      href={`/student/tutor?topic=${encodeURIComponent(term.english)}`}
                      className="text-primary hover:underline font-semibold"
                    >
                      Ask AI Tutor →
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: TRANSLITERATOR SANDBOX */}
        {activeTab === "transliterator" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Romanized Input */}
            <Card className="p-5 border bg-card space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <Keyboard className="h-4 w-4 text-primary" />
                  <span>Romanized Nepali Typing Input</span>
                </div>
                <Badge variant="outline" className="text-[10px]">
                  Phonetic English Keyboard
                </Badge>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  Type conversational Romanized Nepali (e.g. <em>namaste, urdhwachap, set ko union</em>):
                </p>
                <textarea
                  rows={6}
                  value={romanizedInput}
                  onChange={(e) => setRomanizedInput(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background p-3.5 text-xs font-mono focus:ring-2 focus:ring-primary"
                  placeholder="Type here..."
                />
              </div>

              {/* Sample Quick Phrases */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-muted-foreground">Sample Prompts:</span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "namaste sir, sets ko union kasari nikalne?",
                    "archimedes ko siddhanta bhaneko k ho?",
                    "13% vat kasari calculate garne?",
                    "mero answer milo ki milena?",
                  ].map((phrase, idx) => (
                    <button
                      key={idx}
                      onClick={() => setRomanizedInput(phrase)}
                      className="px-2.5 py-1 rounded-lg border bg-muted/40 hover:bg-muted text-[11px] text-muted-foreground hover:text-foreground transition-all"
                    >
                      {phrase}
                    </button>
                  ))}
                </div>
              </div>
            </Card>

            {/* Devanagari Output */}
            <Card className="p-5 border bg-card space-y-4 flex flex-col justify-between shadow-md">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <div className="flex items-center gap-2 font-bold text-sm text-foreground">
                    <Languages className="h-4 w-4 text-emerald-600" />
                    <span>Instant Devanagari (नेपाली लिपि) Output</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    className="h-7 text-xs gap-1"
                  >
                    {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                    <span>{copied ? "Copied!" : "Copy"}</span>
                  </Button>
                </div>

                <div className="p-4 rounded-xl border bg-muted/30 min-h-[140px] text-base leading-relaxed font-nepali font-semibold text-foreground whitespace-pre-wrap">
                  {transliterated || "यहाँ नेपाली लिपिमा रूपान्तरण देखिनेछ..."}
                </div>

                {/* Numeral Converter Preview */}
                <div className="p-3.5 rounded-xl border bg-primary/5 space-y-2 text-xs">
                  <div className="font-semibold flex items-center gap-1.5 text-primary">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Devanagari Numeral Standardization:</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                    <div className="p-2 rounded-lg bg-background border">
                      <span className="text-muted-foreground">English:</span> 1234567890
                    </div>
                    <div className="p-2 rounded-lg bg-background border font-bold text-primary">
                      <span className="text-muted-foreground">नेपाली:</span> {arabicToNepaliNumerals("1234567890")}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t flex justify-end">
                <Link href={`/student/tutor?msg=${encodeURIComponent(transliterated)}`}>
                  <Button variant="nepal" size="sm" className="text-xs gap-1.5">
                    <span>Send to Socratic Tutor</span>
                    <ArrowLeft className="h-3 w-3 rotate-180" />
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        )}
      </div>
    </StudentDashboardShell>
  );
}
