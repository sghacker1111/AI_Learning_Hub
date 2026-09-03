"use client";

import * as React from "react";
import Link from "next/link";
import {
  Upload,
  Sparkles,
  ArrowLeft,
  Bot,
  Layers,
  Calculator,
  ArrowRight,
  ImageIcon,
  FileText,
} from "lucide-react";
import { StudentDashboardShell } from "@/components/layout/student-dashboard-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MathView } from "@/components/ui/math-view";
import { MultimodalScanResponse } from "@/lib/ai/multimodal/types";
import { executeMultimodalPipeline } from "@/lib/ai/multimodal/pipeline";

interface SamplePreset {
  id: string;
  title: string;
  subject: string;
  badge: string;
  description: string;
}

const SAMPLE_PRESETS: SamplePreset[] = [
  {
    id: "sample_sets",
    title: "Class 8 Math: Sets Survey Problem",
    subject: "Compulsory Mathematics",
    badge: "Sets & Venn",
    description: "Printed CDC textbook exercise with 2-set overlap survey and Venn diagram.",
  },
  {
    id: "sample_vat",
    title: "Class 8 Math: 13% VAT & Discount",
    subject: "Compulsory Mathematics",
    badge: "13% VAT",
    description: "Marked price of Rs. 1500 with 10% discount and 13% Nepal VAT calculation.",
  },
  {
    id: "sample_pressure",
    title: "Class 8 Science: Archimedes Upthrust",
    subject: "Science & Technology",
    badge: "Force & Pressure",
    description: "Bilingual Devanagari problem with submerged block (d = 1000 kg/m³, V = 0.002 m³).",
  },
];

export default function StudentScannerPage() {
  const [selectedSample, setSelectedSample] = React.useState("sample_sets");
  const [scanning, setScanning] = React.useState(false);
  const [scanResult, setScanResult] = React.useState<MultimodalScanResponse | null>(null);

  const handleRunScan = React.useCallback(async (sampleKey: string) => {
    setSelectedSample(sampleKey);
    setScanning(true);
    try {
      const res = await executeMultimodalPipeline("", sampleKey);
      setScanResult(res);
    } catch {
      // ignore
    } finally {
      setScanning(false);
    }
  }, []);

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
            <h1 className="text-2xl font-bold tracking-tight">Textbook Scanner Demonstration</h1>
            <p className="text-xs text-muted-foreground">
              Explore three pre-authored OCR samples and their KaTeX formula output. Live image OCR is not configured.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="nepal" className="text-xs">
              Sample Data + KaTeX
            </Badge>
          </div>
        </div>

        {/* Preset Sample Selector Bar */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-muted-foreground">
            Try Sample Nepal CDC Textbook Questions:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {SAMPLE_PRESETS.map((preset) => {
              const isSelected = selectedSample === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => handleRunScan(preset.id)}
                  className={`p-3.5 rounded-2xl border text-left text-xs transition-all flex flex-col justify-between gap-2 ${
                    isSelected
                      ? "border-primary bg-primary/10 ring-2 ring-primary/20 shadow-sm"
                      : "border-border bg-card hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-bold text-foreground">{preset.title}</span>
                    <Badge variant="outline" className="text-[10px]">
                      {preset.badge}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                    {preset.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Split-Screen Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Pane: Image Snapshot Viewer & Upload Dropzone */}
          <div className="lg:col-span-5 space-y-4">
            <Card className="p-5 border bg-card space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <ImageIcon className="h-4 w-4 text-primary" />
                  <span>Textbook / Homework Snapshot</span>
                </div>
                <Badge variant="outline" className="text-[10px]">
                  Snapshot Preview
                </Badge>
              </div>

              {/* Mock Snapshot Graphic */}
              <div className="h-64 rounded-2xl border bg-muted/40 p-4 flex flex-col justify-between relative overflow-hidden font-mono text-xs">
                <div className="flex items-center justify-between text-[11px] text-muted-foreground border-b pb-2">
                  <span>CDC Curriculum Grade 8 • Exercise Sheet</span>
                  <span className="text-primary font-bold">Sample Preview</span>
                </div>

                <div className="p-4 rounded-xl bg-background/80 border shadow-sm my-auto space-y-2">
                  <div className="text-[10px] text-muted-foreground uppercase font-bold">
                    Captured Image Region:
                  </div>
                  <p className="text-xs text-foreground leading-relaxed italic">
                    &quot;{scanResult?.ocr.cleanedText || "Select a sample above."}&quot;
                  </p>
                </div>

                <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-2 border-t">
                  <span>Sample confidence: <strong>{scanResult ? `${(scanResult.ocr.confidenceScore * 100).toFixed(0)}%` : "--"}</strong></span>
                  <span>Detected: <strong>{scanResult?.ocr.detectedLanguage.toUpperCase()}</strong></span>
                </div>
              </div>

              {/* Upload Dropzone */}
              <div className="p-4 rounded-2xl border-2 border-dashed border-muted-foreground/30 text-center space-y-2 bg-muted/10">
                <Upload className="h-6 w-6 mx-auto text-muted-foreground" />
                <div className="text-xs font-semibold text-foreground">
                  Image upload is not connected in this demo
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Configure a real OCR provider and secure upload storage before enabling it.
                </p>
              </div>
            </Card>
          </div>

          {/* Right Pane: OCR & KaTeX Formula Recognition Results */}
          <div className="lg:col-span-7 space-y-4">
            <Card className="p-6 border bg-card space-y-5 shadow-md">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span>Sample Recognition & Formula Extraction</span>
                </div>
                {scanning && (
                  <Badge variant="nepal" className="text-[10px] animate-pulse">
                    Processing OCR...
                  </Badge>
                )}
              </div>

              {!scanResult && !scanning && (
                <div className="rounded-xl border border-dashed p-6 text-center text-xs text-muted-foreground">
                  Select a sample above to run the demonstration scanner.
                </div>
              )}

              {scanResult && (
                <div className="space-y-4">
                  {/* Cleaned Extracted Text */}
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5 text-primary" />
                      <span>Extracted Problem Text</span>
                    </div>
                    <div className="p-3.5 rounded-xl border bg-muted/30 text-xs leading-relaxed font-medium">
                      {scanResult.ocr.cleanedText}
                    </div>
                  </div>

                  {/* Extracted Mathematical Formulas Card */}
                  {scanResult.ocr.extractedFormulas.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
                        <Calculator className="h-3.5 w-3.5 text-primary" />
                        <span>Parsed Mathematical Equations (KaTeX Typeset)</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {scanResult.ocr.extractedFormulas.map((formula, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-xl bg-primary/5 border border-primary/15 text-center font-mono text-xs text-primary font-bold overflow-x-auto"
                          >
                            <MathView math={formula} displayMode={false} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Diagram Entity Perception */}
                  {scanResult.diagram && (
                    <div className="space-y-2">
                      <div className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
                        <Layers className="h-3.5 w-3.5 text-purple-600" />
                        <span>Recognized Diagram: {scanResult.diagram.diagramType}</span>
                      </div>
                      <div className="p-3.5 rounded-xl border bg-purple-500/10 border-purple-500/20 text-xs space-y-2">
                        <p className="text-purple-950 dark:text-purple-200 font-medium">
                          {scanResult.diagram.description}
                        </p>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {scanResult.diagram.detectedElements.map((elem, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-md bg-background/80 border text-[10px] text-muted-foreground"
                            >
                              ✓ {elem}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Socratic AI Action Handoffs */}
                  <div className="space-y-2 pt-2 border-t">
                    <div className="text-[11px] font-semibold text-muted-foreground">
                      One-Click Pedagogical Actions:
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {scanResult.suggestedNextActions.map((act, idx) => (
                        <Link key={idx} href={act.targetUrl}>
                          <Button
                            variant={idx === 0 ? "nepal" : "outline"}
                            size="sm"
                            className="text-xs gap-1.5 h-9"
                          >
                            {idx === 0 ? <Bot className="h-3.5 w-3.5" /> : <ArrowRight className="h-3.5 w-3.5" />}
                            <span>{act.label}</span>
                          </Button>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </StudentDashboardShell>
  );
}
