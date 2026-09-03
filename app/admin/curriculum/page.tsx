"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Search,
  Download,
  Upload,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  FileCheck,
} from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { CDC_GRADES, LEVEL_TABS } from "@/lib/constants/curriculum";

export default function AdminCurriculumPage() {
  const [selectedLevel, setSelectedLevel] = React.useState<string>("all");
  const [search, setSearch] = React.useState("");
  const [importModalOpen, setImportModalOpen] = React.useState(false);
  const [importNotice, setImportNotice] = React.useState<string | null>(null);

  const filteredGrades = React.useMemo(() => {
    return CDC_GRADES.filter((g) => {
      const matchLevel = selectedLevel === "all" || g.level === selectedLevel;
      const matchSearch =
        g.name.toLowerCase().includes(search.toLowerCase()) ||
        g.nameNepali.toLowerCase().includes(search.toLowerCase());
      return matchLevel && matchSearch;
    });
  }, [selectedLevel, search]);

  const handleTriggerImport = async () => {
    try {
      const res = await fetch("/api/admin/curriculum/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ curriculumVersion: "2081_REVISED", timestamp: new Date().toISOString() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Validation request failed.");
      setImportNotice(data.message || "Sample request validated; no data was imported.");
      setImportModalOpen(false);
      setTimeout(() => setImportNotice(null), 5000);
    } catch (error) {
      setImportNotice(error instanceof Error ? error.message : "Validation request failed.");
      setImportModalOpen(false);
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
                <Link href="/admin" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                  <ArrowLeft className="h-3.5 w-3.5" /> Back to Admin Center
                </Link>
              </div>
              <h1 className="text-2xl font-bold tracking-tight">Curriculum Prototype Catalog</h1>
              <p className="text-xs text-muted-foreground">
                Inspect grade definitions and the small bundled Class 8 sample. This is not a complete or officially verified CDC corpus.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/admin/curriculum/editor">
                <Button variant="nepal" size="sm" className="gap-2">
                  <Sparkles className="h-4 w-4" />
                  Lesson Editor
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setImportModalOpen(true)}
                className="gap-1.5 text-xs"
              >
                <Upload className="h-3.5 w-3.5" />
                Validate Import
              </Button>
              <a href="/api/admin/curriculum/export?grade=class-8" download>
                <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                  <Download className="h-3.5 w-3.5" />
                  Export
                </Button>
              </a>
            </div>
          </div>

          {/* Import Notice */}
          {importNotice && (
            <div className="rounded-xl bg-amber-500/15 border border-amber-500/30 p-3.5 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>{importNotice}</span>
            </div>
          )}

          {/* Filters & Search Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Level Tabs */}
            <div className="flex flex-wrap gap-1.5 p-1 bg-muted rounded-xl border">
              {LEVEL_TABS.map((lvl) => (
                <button
                  key={lvl.id}
                  onClick={() => setSelectedLevel(lvl.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    selectedLevel === lvl.id
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {lvl.label}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search grade name..."
                className="pl-9 h-9 text-xs"
              />
            </div>
          </div>

          {/* Grades Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {filteredGrades.map((g) => {
              const hasBundledSample = g.id === "class-8";

              return (
                <Card
                  key={g.id}
                  className="flex flex-col justify-between border bg-card hover:border-primary/50 hover:shadow-md transition-all group"
                >
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-[10px]">
                        {g.levelLabel}
                      </Badge>
                      <span className="text-[11px] font-bold text-primary">
                        {hasBundledSample ? "Small Sample" : "Definition Only"}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold group-hover:text-primary transition-colors">
                        {g.name}
                      </h3>
                      <p className="text-xs text-muted-foreground font-nepali">{g.nameNepali}</p>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      <div className="flex justify-between text-[11px] text-muted-foreground">
                        <span>{hasBundledSample ? "2 sample subjects" : "No bundled lessons"}</span>
                        <span>{hasBundledSample ? "5 demo chunks" : "0 chunks"}</span>
                      </div>
                      <Progress value={hasBundledSample ? 10 : 0} className="h-1.5" />
                    </div>
                  </div>

                  <div className="p-3 pt-0">
                    <Link href={`/admin/curriculum/${g.id}`} className="w-full">
                      <Button variant="outline" size="sm" className="w-full text-xs justify-between group-hover:bg-primary group-hover:text-primary-foreground">
                        <span>Manage Subjects</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </main>
      <SiteFooter />

      {/* Import Modal */}
      {importModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <Card className="w-full max-w-md border bg-card p-6 space-y-4 shadow-2xl">
            <div className="space-y-1">
              <CardTitle className="text-lg font-bold">Validate Curriculum Import Metadata</CardTitle>
              <CardDescription className="text-xs">
                This preview validates a sample request only; it does not upload or persist a curriculum file.
              </CardDescription>
            </div>

            <div className="rounded-xl border border-dashed p-6 text-center space-y-2 bg-muted/20">
              <FileCheck className="h-8 w-8 mx-auto text-primary" />
              <p className="text-xs text-foreground font-semibold">
                curriculum_sample_2081.json
              </p>
              <p className="text-[11px] text-muted-foreground">
                Example filename only; no file has been selected or read.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button variant="ghost" size="sm" onClick={() => setImportModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="nepal" size="sm" onClick={handleTriggerImport}>
                Validate Sample Request
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
