"use client";

import * as React from "react";
import Link from "next/link";
import {
  Database,
  ArrowLeft,
  Search,
  Zap,
  BookOpen,
  Layers,
  BookMarked,
  Play,
} from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MathView } from "@/components/ui/math-view";
import { CDC_CURRICULUM_KNOWLEDGE_BASE } from "@/lib/rag/knowledge-base";
import { RAGQueryResult, RAGQueryResultChunk } from "@/lib/rag/types";
import { CurriculumContentImporter } from "@/components/admin/curriculum-content-importer";

const indexedGrades = new Set(CDC_CURRICULUM_KNOWLEDGE_BASE.map((chunk) => chunk.metadata.gradeCode)).size;

export default function AdminRAGPage() {
  const [query, setQuery] = React.useState("What is the formula for union of overlapping sets in Class 8?");
  const [selectedSubject, setSelectedSubject] = React.useState("ALL");
  const [hybridAlpha] = React.useState("0.65");
  const [loading, setLoading] = React.useState(false);
  const [queryResult, setQueryResult] = React.useState<RAGQueryResult | null>(null);

  const handleRunQuery = async (queryText?: string) => {
    const q = (queryText || query).trim();
    if (!q) return;
    setLoading(true);
    try {
      const res = await fetch("/api/rag/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: q,
          subject: selectedSubject,
          hybridAlpha: parseFloat(hybridAlpha),
          topK: 3,
        }),
      });
      const data = await res.json();
      if (data.result) {
        setQueryResult(data.result);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-muted/20">
      <SiteHeader />
      <main className="flex-1 py-8">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Link
                  href="/admin"
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Back to Admin Center
                </Link>
              </div>
              <h1 className="text-2xl font-bold tracking-tight">Curriculum Knowledge Center</h1>
              <p className="text-xs text-muted-foreground">
                Publish approved chapter content and inspect retrieval from the curriculum store and bundled samples.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="nepal" className="text-xs">
                Approved content + sample retrieval
              </Badge>
            </div>
          </div>

          {/* Telemetry Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4 border bg-card space-y-1.5">
              <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
                <span>Bundled Fallback Chunks</span>
                <Database className="h-4 w-4 text-blue-600" />
              </div>
              <div className="text-2xl font-bold">{CDC_CURRICULUM_KNOWLEDGE_BASE.length} Chunks</div>
              <p className="text-[11px] text-muted-foreground">Bundled in application memory</p>
            </Card>

            <Card className="p-4 border bg-card space-y-1.5">
              <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
                <span>CDC Grades Covered</span>
                <BookOpen className="h-4 w-4 text-purple-600" />
              </div>
              <div className="text-2xl font-bold">{indexedGrades} Grade</div>
              <p className="text-[11px] text-muted-foreground">Coverage represented by sample chunks</p>
            </Card>

            <Card className="p-4 border bg-card space-y-1.5">
              <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
                <span>Avg. Retrieval Latency</span>
                <Zap className="h-4 w-4 text-amber-600" />
              </div>
              <div className="text-2xl font-bold">{queryResult ? `${queryResult.latencyMs} ms` : "Not run"}</div>
              <p className="text-[11px] text-muted-foreground">Measured for the latest local query</p>
            </Card>

            <Card className="p-4 border bg-card space-y-1.5">
              <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
                <span>Vector Dimension</span>
                <Layers className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold">64 Dim</div>
              <p className="text-[11px] text-muted-foreground">Deterministic character hash</p>
            </Card>
          </div>

          {/* Live RAG Query Benchmark Tool */}
          <CurriculumContentImporter />

          <Card className="p-6 border bg-card space-y-5 shadow-md">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2 font-bold text-sm">
                <Search className="h-4 w-4 text-primary" />
                <span>Retrieval Demo & Reference Inspector</span>
              </div>
              <Badge variant="outline" className="text-[10px]">
                Interactive Tester
              </Badge>
            </div>

            <div className="space-y-4">
              {/* Search Bar & Controls */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                <div className="md:col-span-6 relative">
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleRunQuery()}
                    placeholder="Enter student query or problem statement..."
                    className="text-xs h-10"
                  />
                </div>

                <div className="md:col-span-3">
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full h-10 rounded-xl border border-input bg-background px-3 text-xs focus:ring-2 focus:ring-primary"
                  >
                    <option value="ALL">All Subjects</option>
                    <option value="MTH-801">Compulsory Mathematics</option>
                    <option value="SCI-802">Science & Technology</option>
                  </select>
                </div>

                <div className="md:col-span-3 flex gap-2">
                  <Button
                    variant="nepal"
                    onClick={() => handleRunQuery()}
                    disabled={loading}
                    className="h-10 text-xs gap-1.5 w-full font-semibold"
                  >
                    <Play className="h-3.5 w-3.5" />
                    <span>{loading ? "Searching..." : "Run Retrieval"}</span>
                  </Button>
                </div>
              </div>

              {/* Sample Quick Queries */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-muted-foreground">Sample Queries:</span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "Cardinality of overlapping sets formula",
                    "How is 13% VAT calculated in Nepal?",
                    "आर्किमिडिजको सिद्धान्त र उर्ध्वचाप (Archimedes upthrust)",
                    "Factorization of quadratic polynomials by splitting middle term",
                  ].map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setQuery(q);
                        handleRunQuery(q);
                      }}
                      className="px-2.5 py-1 rounded-lg border bg-muted/40 hover:bg-muted text-[11px] text-muted-foreground hover:text-foreground transition-all"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Results Viewport */}
              {queryResult && (
                <div className="space-y-4 pt-4 border-t">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-foreground">
                      Retrieved {queryResult.topChunks.length} Top-K Chunks ({queryResult.latencyMs}ms)
                    </span>
                    <span className="text-muted-foreground">
                      Hybrid α = {hybridAlpha} (Dense: {Math.round(parseFloat(hybridAlpha) * 100)}%, Sparse:{" "}
                      {Math.round((1 - parseFloat(hybridAlpha)) * 100)}%)
                    </span>
                  </div>

                  <div className="space-y-4">
                    {queryResult.topChunks.map((res: RAGQueryResultChunk, idx: number) => (
                      <Card key={idx} className="p-5 border bg-card/60 space-y-3 shadow-sm hover:shadow-md transition-all">
                        <div className="flex flex-wrap items-start justify-between gap-2 border-b pb-2">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-[10px] font-mono">
                                Rank #{idx + 1}
                              </Badge>
                              <span className="font-bold text-sm text-foreground">
                                {res.chunk.metadata.sectionTitle}
                              </span>
                            </div>
                            <span className="text-[11px] text-muted-foreground">
                              {res.chunk.metadata.grade} • {res.chunk.metadata.subject} • {res.chunk.metadata.unit} (LO:{" "}
                              {res.chunk.metadata.learningOutcomeCode})
                            </span>
                          </div>

                          {/* Scores Badge */}
                          <div className="flex items-center gap-2 text-[11px]">
                            <div className="px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20 text-primary font-bold">
                              Hybrid Score: {res.score}
                            </div>
                            <div className="hidden sm:block text-[10px] text-muted-foreground font-mono">
                              (Dense: {res.denseScore} | Sparse: {res.sparseScore})
                            </div>
                          </div>
                        </div>

                        {/* Chunk Content */}
                        <div className="p-3.5 rounded-xl bg-muted/30 text-xs leading-relaxed whitespace-pre-line space-y-2">
                          {res.chunk.content.includes("$$") ? (
                            res.chunk.content.split("$$").map((part, pIdx) => {
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
                            <span>{res.chunk.content}</span>
                          )}
                        </div>

                        {/* Reference metadata supplied with the demo chunk. */}
                        <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20">
                          <BookMarked className="h-3.5 w-3.5 shrink-0" />
                          <span className="font-mono">Demo reference metadata: {res.citationString}</span>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
