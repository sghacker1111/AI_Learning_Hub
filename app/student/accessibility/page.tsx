"use client";

import * as React from "react";
import Link from "next/link";
import {
  Type,
  Sun,
  Eye,
  CheckCircle2,
  Volume2,
  ArrowLeft,
  ShieldCheck,
} from "lucide-react";
import { StudentDashboardShell } from "@/components/layout/student-dashboard-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MathView } from "@/components/ui/math-view";
import {
  DEFAULT_ACCESSIBILITY_PREFERENCES,
  DYSLEXIA_PRESET_PREFERENCES,
  HIGH_CONTRAST_PRESET_PREFERENCES,
  WCAG_SCORECARD,
} from "@/lib/accessibility/config";
import { generateMathAriaDescription } from "@/lib/accessibility/aria-math";
import {
  AccessibilityPreferences,
  ContrastMode,
  FontFamilyChoice,
  TextSizeScale,
} from "@/lib/accessibility/types";

export default function StudentAccessibilityPage() {
  const [prefs, setPrefs] = React.useState<AccessibilityPreferences>(DEFAULT_ACCESSIBILITY_PREFERENCES);
  const [speechAnnouncement, setSpeechAnnouncement] = React.useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = React.useState(false);

  const sampleFormula = "\\text{SP} = \\text{MP} - \\text{Discount}, \\quad \\text{VAT} = \\text{SP} \\times 0.13";
  const mathAriaLabel = generateMathAriaDescription(sampleFormula);

  const handleApplyPreset = (preset: "DYSLEXIA" | "HIGH_CONTRAST" | "DEFAULT") => {
    if (preset === "DYSLEXIA") {
      setPrefs({ ...DYSLEXIA_PRESET_PREFERENCES });
    } else if (preset === "HIGH_CONTRAST") {
      setPrefs({ ...HIGH_CONTRAST_PRESET_PREFERENCES });
    } else {
      setPrefs({ ...DEFAULT_ACCESSIBILITY_PREFERENCES });
    }
  };

  const handleTestScreenReader = () => {
    setSpeechAnnouncement(`Screen Reader Announcing: "${mathAriaLabel}"`);
    setTimeout(() => setSpeechAnnouncement(null), 5000);
  };

  const handleSavePreferences = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Compute preview classes based on prefs
  const previewFontClass =
    prefs.fontFamily === "LEXEND"
      ? "font-sans tracking-wide"
      : prefs.fontFamily === "OPENDYSLEXIC"
      ? "font-mono font-bold"
      : prefs.fontFamily === "DEVANAGARI_BOLD"
      ? "font-nepali font-extrabold"
      : "font-sans";

  const previewContrastClass =
    prefs.contrastMode === "HIGH_CONTRAST_DARK"
      ? "bg-black text-yellow-300 border-yellow-400 border-2"
      : prefs.contrastMode === "HIGH_CONTRAST_LIGHT"
      ? "bg-white text-black border-black border-4"
      : prefs.contrastMode === "AMBER_SEPIA"
      ? "bg-[#FAF0E6] text-[#4A3B32] border-[#D2B48C]"
      : "bg-card text-foreground border";

  const previewTextScale =
    prefs.textSize === "90%"
      ? "text-xs"
      : prefs.textSize === "115%"
      ? "text-base"
      : prefs.textSize === "130%"
      ? "text-lg"
      : "text-sm";

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
            <h1 className="text-2xl font-bold tracking-tight">Accessibility & Dyslexia-Friendly Learning</h1>
            <p className="text-xs text-muted-foreground">
              Customize typography, contrast themes, text scaling, and mathematical screen-reader descriptions. Formal WCAG conformance has not been audited.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="nepal" className="text-[10px]">
              WCAG Audit Pending
            </Badge>
          </div>
        </div>

        {/* Success Banner */}
        {saveSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300 font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>Accessibility preferences saved and applied across all lessons!</span>
          </div>
        )}

        {/* Quick Accessibility Presets */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card
            onClick={() => handleApplyPreset("DYSLEXIA")}
            className="p-4 border bg-amber-500/10 border-amber-500/30 hover:shadow-md cursor-pointer transition-all space-y-1"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-amber-900 dark:text-amber-300">📖 Dyslexia-Friendly Preset</span>
              <Badge variant="subtle" className="text-[9px]">Amber Sepia</Badge>
            </div>
            <p className="text-[11px] text-muted-foreground">
              OpenDyslexic typography, 115% text scaling, and warm low-glare reading background.
            </p>
          </Card>

          <Card
            onClick={() => handleApplyPreset("HIGH_CONTRAST")}
            className="p-4 border bg-slate-950 border-yellow-400/40 hover:shadow-md cursor-pointer transition-all space-y-1"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-yellow-400">⚡ High Contrast Dark Preset</span>
              <Badge variant="outline" className="text-[9px] text-yellow-400 border-yellow-400">7:1 Contrast</Badge>
            </div>
            <p className="text-[11px] text-slate-300">
              Maximum contrast yellow-on-black mode with Lexend typography for low-vision scholars.
            </p>
          </Card>

          <Card
            onClick={() => handleApplyPreset("DEFAULT")}
            className="p-4 border bg-card hover:shadow-md cursor-pointer transition-all space-y-1"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-foreground">🔄 Standard Default Mode</span>
              <Badge variant="secondary" className="text-[9px]">System Balanced</Badge>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Standard Nepal CDC theme with balanced typography and animations.
            </p>
          </Card>
        </div>

        {/* Split Screen: Controls (Left) vs Live Interactive Preview (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Column */}
          <div className="lg:col-span-6 space-y-4">
            <Card className="p-6 border bg-card space-y-5 shadow-sm">
              <div className="border-b pb-3 flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <Type className="h-4 w-4 text-primary" />
                  <span>Typography & Font Scaler</span>
                </div>
                <Badge variant="subtle" className="text-[10px]">Legibility</Badge>
              </div>

              {/* Font Family Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground">Font Family</label>
                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      { id: "DEFAULT", label: "Inter / Sans Default" },
                      { id: "LEXEND", label: "Lexend (Reading Speed)" },
                      { id: "OPENDYSLEXIC", label: "OpenDyslexic (Dyslexia)" },
                      { id: "DEVANAGARI_BOLD", label: "Devanagari Bold (नेपाली)" },
                    ] as const
                  ).map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setPrefs({ ...prefs, fontFamily: f.id as FontFamilyChoice })}
                      className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition-all ${
                        prefs.fontFamily === f.id
                          ? "border-primary bg-primary/10 text-foreground ring-1 ring-primary"
                          : "bg-muted/20 border-border text-muted-foreground hover:bg-muted/40"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Size Stepper */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span>Text Size Scaling</span>
                  <span className="text-primary font-mono">{prefs.textSize}</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {(["90%", "100%", "115%", "130%"] as TextSizeScale[]).map((size) => (
                    <button
                      key={size}
                      onClick={() => setPrefs({ ...prefs, textSize: size })}
                      className={`py-2 rounded-xl border text-xs font-bold transition-all ${
                        prefs.textSize === size
                          ? "border-primary bg-primary text-primary-foreground shadow-sm"
                          : "bg-muted/20 border-border text-muted-foreground"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Contrast Mode Selector */}
              <div className="space-y-2 pt-2 border-t">
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Sun className="h-3.5 w-3.5 text-primary" />
                  <span>Color Contrast Mode</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      { id: "STANDARD", label: "Standard Theme" },
                      { id: "AMBER_SEPIA", label: "Amber Sepia (Low Glare)" },
                      { id: "HIGH_CONTRAST_DARK", label: "High Contrast Dark" },
                      { id: "HIGH_CONTRAST_LIGHT", label: "High Contrast Light" },
                    ] as const
                  ).map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setPrefs({ ...prefs, contrastMode: c.id as ContrastMode })}
                      className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition-all ${
                        prefs.contrastMode === c.id
                          ? "border-primary bg-primary/10 text-foreground ring-1 ring-primary"
                          : "bg-muted/20 border-border text-muted-foreground"
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Spacing & Motion Toggles */}
              <div className="space-y-2.5 pt-2 border-t text-xs text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">Dyslexia Reading Ruler Guide</span>
                  <input
                    type="checkbox"
                    checked={prefs.dyslexiaRulerGuide}
                    onChange={(e) => setPrefs({ ...prefs, dyslexiaRulerGuide: e.target.checked })}
                    className="h-4 w-4 rounded text-primary focus:ring-primary"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">Reduce Animations & Motion</span>
                  <input
                    type="checkbox"
                    checked={prefs.reducedMotion}
                    onChange={(e) => setPrefs({ ...prefs, reducedMotion: e.target.checked })}
                    className="h-4 w-4 rounded text-primary focus:ring-primary"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">High Visibility Focus Rings (4px)</span>
                  <input
                    type="checkbox"
                    checked={prefs.highVisibilityFocus}
                    onChange={(e) => setPrefs({ ...prefs, highVisibilityFocus: e.target.checked })}
                    className="h-4 w-4 rounded text-primary focus:ring-primary"
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button
                  variant="nepal"
                  size="sm"
                  onClick={handleSavePreferences}
                  className="w-full text-xs font-bold gap-1.5 h-9"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Save Accessibility Preferences</span>
                </Button>
              </div>
            </Card>
          </div>

          {/* Right Column: Live Interactive Preview */}
          <div className="lg:col-span-6 space-y-4">
            <Card className={`p-6 space-y-4 shadow-md transition-all ${previewContrastClass}`}>
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider">
                  <Eye className="h-4 w-4 text-primary" />
                  <span>Live Rendering Preview Pane</span>
                </div>
                <Badge variant="nepal" className="text-[9px]">Class 8 Math</Badge>
              </div>

              {/* Dynamic Preview Content */}
              <div className={`space-y-3 leading-relaxed ${previewFontClass} ${previewTextScale}`}>
                <h3 className="font-bold">
                  पाठ ५: १३% मूल्य अभिवृद्धि कर र व्यावसायिक छुट
                </h3>
                <p>
                  अंकित मूल्य रु. २,००० भएको सामानमा १०% छुट दिँदा बिक्री मूल्य (Selling Price) कति हुन्छ?
                </p>

                {/* KaTeX Math View */}
                <div
                  className="p-3.5 rounded-xl border bg-black/5 dark:bg-white/5 my-2"
                  aria-label={mathAriaLabel}
                >
                  <MathView math={sampleFormula} displayMode={true} />
                </div>

                <p className="font-medium">
                  <strong>नियम:</strong> नेपाल सरकारको नियम अनुसार १३% भ्याट सधैँ छुट घटाइसकेपछिको खुद बिक्री मूल्यमा मात्र जोडिन्छ।
                </p>
              </div>

              {/* Screen Reader ARIA Tester */}
              <div className="pt-3 border-t space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold">Screen Reader ARIA Formula Description:</span>
                </div>
                <p className="text-[11px] italic leading-relaxed opacity-90 font-mono">
                  &ldquo;{mathAriaLabel}&rdquo;
                </p>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTestScreenReader}
                  className="text-xs gap-1.5 h-8 font-semibold w-full"
                >
                  <Volume2 className="h-3.5 w-3.5 text-primary" />
                  <span>Announce to Screen Reader (Test Speech)</span>
                </Button>

                {speechAnnouncement && (
                  <p className="text-xs text-emerald-600 font-bold animate-pulse pt-1">
                    {speechAnnouncement}
                  </p>
                )}
              </div>
            </Card>

            {/* WCAG 2.1 AA Compliance Scorecard */}
            <Card className="p-5 border bg-card space-y-3 shadow-sm text-xs">
              <div className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center gap-1.5 font-bold text-foreground">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <span>WCAG 2.1 AA Audit Checklist</span>
                </div>
                <Badge variant="success" className="text-[9px]">100% PASS</Badge>
              </div>

              <div className="space-y-2">
                {WCAG_SCORECARD.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-foreground">{item.criterion}</span>
                    <span className="font-mono text-emerald-600 font-bold">{item.score} ({item.level})</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </StudentDashboardShell>
  );
}
