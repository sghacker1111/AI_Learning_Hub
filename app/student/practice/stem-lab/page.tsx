"use client";

import * as React from "react";
import Link from "next/link";
import {
  Calculator,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Sliders,
  Waves,
  Layers,
} from "lucide-react";
import { StudentDashboardShell } from "@/components/layout/student-dashboard-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MathView } from "@/components/ui/math-view";
import { solveVenn2Sets } from "@/lib/stem/sets";
import { simulateUpthrust, LIQUID_DENSITIES } from "@/lib/stem/physics";
import { verifyMathStep } from "@/lib/stem/verifier";
import { MathStepVerification, VennDiagramData, PhysicsSimulationData } from "@/lib/stem/types";

export default function STEMLabPage() {
  const [activeTab, setActiveTab] = React.useState<"verifier" | "venn" | "physics">("verifier");

  // Tab 1: Step Verifier State
  const [problemContext, setProblemContext] = React.useState("Class 8 Sets: Finding union cardinality");
  const [stepInput, setStepInput] = React.useState("n(A ∪ B) = n(A) + n(B) - n(A ∩ B)");
  const [verificationResult, setVerificationResult] = React.useState<MathStepVerification | null>(null);

  // Tab 2: Venn Sandbox State
  const [nU, setNU] = React.useState(60);
  const [nA, setNA] = React.useState(35);
  const [nB, setNB] = React.useState(28);
  const [nIntersection, setNIntersection] = React.useState(12);
  const [vennData, setVennData] = React.useState<VennDiagramData>(() => solveVenn2Sets(60, 35, 28, 12));

  // Tab 3: Physics Simulator State
  const [volume, setVolume] = React.useState(0.002); // 2 liters
  const [selectedLiquid, setSelectedLiquid] = React.useState("water");
  const [objectWeight, setObjectWeight] = React.useState(30); // 30 N
  const [depth, setDepth] = React.useState(0.5); // 0.5 m
  const [physicsData, setPhysicsData] = React.useState<PhysicsSimulationData>(() =>
    simulateUpthrust(0.002, "water", 30, 0.5)
  );

  // Math Palette Symbols
  const MATH_SYMBOLS = ["∪", "∩", "∈", "∉", "∅", "√", "x²", "±", "π", "÷", "×", "≤", "≥", "≠", "°"];

  const insertSymbol = (sym: string) => {
    setStepInput((prev) => prev + sym);
  };

  const handleVerifyStep = () => {
    const res = verifyMathStep(problemContext, stepInput);
    setVerificationResult(res);
  };

  const handleUpdateVenn = (newU: number, newA: number, newB: number, newInter: number) => {
    setNU(newU);
    setNA(newA);
    setNB(newB);
    setNIntersection(newInter);
    const solved = solveVenn2Sets(newU, newA, newB, newInter);
    setVennData(solved);
  };

  const handleUpdatePhysics = (newVol: number, newLiq: string, newWt: number, newDepth: number) => {
    setVolume(newVol);
    setSelectedLiquid(newLiq);
    setObjectWeight(newWt);
    setDepth(newDepth);
    const solved = simulateUpthrust(newVol, newLiq, newWt, newDepth);
    setPhysicsData(solved);
  };

  return (
    <StudentDashboardShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Link
                href="/student/practice"
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back to Practice
              </Link>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Interactive STEM Simulation & Math Lab</h1>
            <p className="text-xs text-muted-foreground">
              Step-by-step mathematical verifier, interactive Venn diagrams, and Archimedes fluid physics simulator.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="nepal" className="text-xs">
              Class 8 Practice Sample
            </Badge>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 p-1.5 bg-muted rounded-2xl border">
          <button
            onClick={() => setActiveTab("verifier")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "verifier"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Calculator className="h-4 w-4 text-primary" />
            <span>Step-by-Step Math Verifier</span>
          </button>

          <button
            onClick={() => setActiveTab("venn")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "venn"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Layers className="h-4 w-4 text-purple-600" />
            <span>Venn Diagram Sandbox</span>
          </button>

          <button
            onClick={() => setActiveTab("physics")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "physics"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Waves className="h-4 w-4 text-blue-600" />
            <span>Fluid Pressure & Upthrust Lab</span>
          </button>
        </div>

        {/* TAB 1: STEP-BY-STEP MATH VERIFIER */}
        {activeTab === "verifier" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 space-y-4">
              <Card className="p-5 border bg-card space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <Calculator className="h-4 w-4 text-primary" />
                    <span>Mathematical Step Verification Workbench</span>
                  </div>
                  <Badge variant="outline" className="text-[10px]">
                    Symbolic Checker
                  </Badge>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="space-y-1">
                    <label className="font-semibold text-foreground">Problem Context</label>
                    <select
                      value={problemContext}
                      onChange={(e) => setProblemContext(e.target.value)}
                      className="w-full h-10 rounded-xl border border-input bg-background px-3 text-xs focus:ring-2 focus:ring-primary"
                    >
                      <option value="Class 8 Sets: Finding union cardinality">
                        Class 8 Math: Sets (Overlapping Sets Cardinality)
                      </option>
                      <option value="Class 8 Arithmetic: 13% VAT Calculation">
                        Class 8 Math: Arithmetic (13% VAT & Discount Calculation)
                      </option>
                      <option value="Class 8 Algebra: Quadratic Factorization">
                        Class 8 Math: Algebra (Factorizing ax² + bx + c)
                      </option>
                      <option value="Class 8 Science: Archimedes Upthrust">
                        Class 8 Science: Force & Pressure (Upthrust U = Vdg)
                      </option>
                    </select>
                  </div>

                  {/* Math Symbols Palette */}
                  <div className="space-y-1.5 pt-1">
                    <label className="text-[11px] font-semibold text-muted-foreground">
                      Quick Math Symbols Palette:
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {MATH_SYMBOLS.map((sym) => (
                        <button
                          key={sym}
                          type="button"
                          onClick={() => insertSymbol(sym)}
                          className="h-7 w-7 rounded-lg border bg-muted/40 hover:bg-primary/10 hover:border-primary text-xs font-mono font-bold transition-all"
                        >
                          {sym}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1 pt-1">
                    <label className="font-semibold text-foreground">Your Calculation / Derivation Step</label>
                    <textarea
                      rows={3}
                      value={stepInput}
                      onChange={(e) => setStepInput(e.target.value)}
                      placeholder="e.g. n(A ∪ B) = n(A) + n(B) - n(A ∩ B)"
                      className="w-full rounded-xl border border-input bg-background p-3 text-xs font-mono focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button variant="nepal" size="sm" onClick={handleVerifyStep} className="gap-1.5 text-xs">
                      <Sparkles className="h-3.5 w-3.5" />
                      Verify Step
                    </Button>
                  </div>
                </div>
              </Card>
            </div>

            {/* Verification Result Feedback Box */}
            <div className="lg:col-span-5 space-y-4">
              <Card className="p-5 border bg-card shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <span className="font-bold text-sm text-foreground">Verification Diagnostic</span>
                  {verificationResult && (
                    <Badge variant={verificationResult.isValid ? "success" : "destructive"} className="text-[10px]">
                      {verificationResult.isValid ? "Valid Step" : "Error Detected"}
                    </Badge>
                  )}
                </div>

                {!verificationResult ? (
                  <div className="py-10 text-center text-xs text-muted-foreground space-y-2">
                    <Calculator className="h-8 w-8 mx-auto text-muted-foreground/40" />
                    <p>Enter your mathematical step on the left and click <strong>Verify Step</strong>.</p>
                  </div>
                ) : (
                  <div className="space-y-4 text-xs">
                    <div
                      className={`p-4 rounded-xl border ${
                        verificationResult.isValid
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-900 dark:text-emerald-200"
                          : "bg-destructive/10 border-destructive/20 text-destructive dark:text-red-300"
                      }`}
                    >
                      <div className="font-bold text-sm flex items-center gap-1.5">
                        {verificationResult.isValid ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-destructive" />
                        )}
                        <span>{verificationResult.feedback}</span>
                      </div>
                      {verificationResult.pinpointedError && (
                        <p className="mt-2 text-xs leading-relaxed font-medium">
                          {verificationResult.pinpointedError}
                        </p>
                      )}
                    </div>

                    {verificationResult.suggestedNextStep && (
                      <div className="p-4 rounded-xl border bg-muted/30 space-y-1.5">
                        <div className="text-[11px] font-semibold text-muted-foreground">
                          Recommended Correct Step:
                        </div>
                        <div className="font-mono text-primary font-bold text-sm">
                          <MathView math={verificationResult.latexPreview || ""} displayMode={false} />
                        </div>
                        <p className="text-[11px] text-muted-foreground pt-1">
                          {verificationResult.suggestedNextStep}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            </div>
          </div>
        )}

        {/* TAB 2: VENN DIAGRAM SANDBOX */}
        {activeTab === "venn" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 space-y-4">
              <Card className="p-5 border bg-card space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <Sliders className="h-4 w-4 text-purple-600" />
                    <span>Set Parameters</span>
                  </div>
                  <Badge variant="outline" className="text-[10px]">
                    2-Set Overlap
                  </Badge>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex justify-between font-semibold">
                      <span>Universal Set $n(U)$</span>
                      <span className="text-primary font-mono font-bold">{nU}</span>
                    </div>
                    <input
                      type="range"
                      min="20"
                      max="100"
                      value={nU}
                      onChange={(e) => handleUpdateVenn(parseInt(e.target.value, 10), nA, nB, nIntersection)}
                      className="w-full h-2 rounded-lg bg-muted accent-primary cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between font-semibold">
                      <span>Set A Cardinality $n(A)$</span>
                      <span className="text-blue-600 font-mono font-bold">{nA}</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="60"
                      value={nA}
                      onChange={(e) => handleUpdateVenn(nU, parseInt(e.target.value, 10), nB, nIntersection)}
                      className="w-full h-2 rounded-lg bg-muted accent-blue-600 cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between font-semibold">
                      <span>Set B Cardinality $n(B)$</span>
                      <span className="text-emerald-600 font-mono font-bold">{nB}</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="60"
                      value={nB}
                      onChange={(e) => handleUpdateVenn(nU, nA, parseInt(e.target.value, 10), nIntersection)}
                      className="w-full h-2 rounded-lg bg-muted accent-emerald-600 cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between font-semibold">
                      <span>Intersection $n(A \cap B)$</span>
                      <span className="text-amber-600 font-mono font-bold">{nIntersection}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max={Math.min(nA, nB)}
                      value={nIntersection}
                      onChange={(e) => handleUpdateVenn(nU, nA, nB, parseInt(e.target.value, 10))}
                      className="w-full h-2 rounded-lg bg-muted accent-amber-600 cursor-pointer"
                    />
                  </div>
                </div>
              </Card>

              {/* Calculated Results Table */}
              <Card className="p-4 border bg-card space-y-2 text-xs">
                <span className="font-bold text-foreground">Calculated Partition Values:</span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <div className="text-muted-foreground">$n_o(A)$ (Only A)</div>
                    <div className="text-lg font-bold text-blue-600">{vennData.nOnlyA}</div>
                  </div>
                  <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <div className="text-muted-foreground">$n_o(B)$ (Only B)</div>
                    <div className="text-lg font-bold text-emerald-600">{vennData.nOnlyB}</div>
                  </div>
                  <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <div className="text-muted-foreground">$n(A \cap B)$ (Both)</div>
                    <div className="text-lg font-bold text-amber-600">{vennData.nIntersection}</div>
                  </div>
                  <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
                    <div className="text-muted-foreground">$n(A \cup B)&apos;$ (Neither)</div>
                    <div className="text-lg font-bold text-purple-600">{vennData.nComplement}</div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Visual Venn Diagram Rendering */}
            <div className="lg:col-span-7 space-y-4">
              <Card className="p-6 border bg-card flex flex-col items-center justify-center min-h-[380px] relative shadow-md">
                <div className="w-full flex justify-between items-center text-xs font-semibold pb-2 border-b">
                  <span>Universal Set $U = {nU}$</span>
                  <span>Union $n(A \cup B) = {vennData.nUnion}$</span>
                </div>

                {/* SVG Venn Diagram Graphic */}
                <div className="relative w-full max-w-[420px] h-[240px] my-6 flex items-center justify-center">
                  {/* Circle A */}
                  <div className="absolute left-6 w-48 h-48 rounded-full border-2 border-blue-500 bg-blue-500/20 flex flex-col items-start justify-center pl-8 text-blue-800 dark:text-blue-200">
                    <span className="font-bold text-xs">Set A</span>
                    <span className="font-extrabold text-2xl">{vennData.nOnlyA}</span>
                    <span className="text-[10px] text-muted-foreground font-mono">n_o(A)</span>
                  </div>

                  {/* Circle B */}
                  <div className="absolute right-6 w-48 h-48 rounded-full border-2 border-emerald-500 bg-emerald-500/20 flex flex-col items-end justify-center pr-8 text-emerald-800 dark:text-emerald-200">
                    <span className="font-bold text-xs">Set B</span>
                    <span className="font-extrabold text-2xl">{vennData.nOnlyB}</span>
                    <span className="text-[10px] text-muted-foreground font-mono">n_o(B)</span>
                  </div>

                  {/* Intersection Overlap Badge */}
                  <div className="z-10 flex flex-col items-center justify-center p-2 rounded-xl bg-background/90 border shadow-md">
                    <span className="text-[10px] font-bold text-amber-600">Both</span>
                    <span className="text-xl font-black text-amber-600">{vennData.nIntersection}</span>
                  </div>

                  {/* Complement Box Outside */}
                  <div className="absolute top-1 right-2 px-2.5 py-1 rounded-lg bg-muted/60 border text-[11px] font-bold text-purple-600">
                    Outside: {vennData.nComplement}
                  </div>
                </div>

                {/* Live Formula Derivation */}
                <div className="w-full p-3 rounded-xl bg-muted/30 border text-center text-xs font-mono">
                  <MathView
                    math={`n(A \\cup B) = ${nA} + ${nB} - ${nIntersection} = ${vennData.nUnion}`}
                    displayMode={false}
                  />
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* TAB 3: FLUID PRESSURE & UPTHRUST SIMULATOR */}
        {activeTab === "physics" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 space-y-4">
              <Card className="p-5 border bg-card space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <Waves className="h-4 w-4 text-blue-600" />
                    <span>Fluid & Object Parameters</span>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="space-y-1">
                    <label className="font-semibold text-foreground">Liquid Substance</label>
                    <select
                      value={selectedLiquid}
                      onChange={(e) => handleUpdatePhysics(volume, e.target.value, objectWeight, depth)}
                      className="w-full h-10 rounded-xl border border-input bg-background px-3 text-xs focus:ring-2 focus:ring-primary"
                    >
                      {Object.entries(LIQUID_DENSITIES).map(([key, liq]) => (
                        <option key={key} value={key}>
                          {liq.name} (d = {liq.densityKgM3} kg/m³)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between font-semibold">
                      <span>Displaced Volume ($V$)</span>
                      <span className="text-primary font-mono font-bold">{(volume * 1000).toFixed(1)} Liters</span>
                    </div>
                    <input
                      type="range"
                      min="0.0005"
                      max="0.01"
                      step="0.0005"
                      value={volume}
                      onChange={(e) =>
                        handleUpdatePhysics(parseFloat(e.target.value), selectedLiquid, objectWeight, depth)
                      }
                      className="w-full h-2 rounded-lg bg-muted accent-primary cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between font-semibold">
                      <span>True Weight in Air (W_air)</span>
                      <span className="text-amber-600 font-mono font-bold">{objectWeight} N</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="100"
                      value={objectWeight}
                      onChange={(e) =>
                        handleUpdatePhysics(volume, selectedLiquid, parseFloat(e.target.value), depth)
                      }
                      className="w-full h-2 rounded-lg bg-muted accent-amber-600 cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between font-semibold">
                      <span>Immersion Depth ($h$)</span>
                      <span className="text-blue-600 font-mono font-bold">{depth.toFixed(1)} m</span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="3.0"
                      step="0.1"
                      value={depth}
                      onChange={(e) =>
                        handleUpdatePhysics(volume, selectedLiquid, objectWeight, parseFloat(e.target.value))
                      }
                      className="w-full h-2 rounded-lg bg-muted accent-blue-600 cursor-pointer"
                    />
                  </div>
                </div>
              </Card>
            </div>

            {/* Physics Visual Tank & Upthrust Display */}
            <div className="lg:col-span-7 space-y-4">
              <Card className="p-6 border bg-card space-y-5 shadow-md">
                <div className="flex items-center justify-between border-b pb-3">
                  <span className="font-bold text-sm text-foreground">Archimedes Force Simulation</span>
                  <Badge
                    variant={
                      physicsData.flotationStatus === "FLOATS"
                        ? "success"
                        : physicsData.flotationStatus === "SUSPENDED"
                        ? "subtle"
                        : "destructive"
                    }
                    className="text-xs"
                  >
                    Status: {physicsData.flotationStatus}
                  </Badge>
                </div>

                {/* Simulation Tank Graphic */}
                <div className="h-44 w-full rounded-2xl border bg-gradient-to-b from-blue-500/10 to-blue-600/30 p-4 relative overflow-hidden flex items-center justify-center">
                  {/* Floating / Sinking Object Block */}
                  <div
                    className={`h-16 w-20 rounded-xl border-2 shadow-lg flex flex-col items-center justify-center text-[10px] font-bold transition-all duration-300 ${
                      physicsData.flotationStatus === "FLOATS"
                        ? "translate-y-[-24px] bg-amber-500 text-white border-amber-600 shadow-amber-500/30"
                        : "translate-y-[20px] bg-stone-700 text-white border-stone-800 shadow-stone-900/30"
                    }`}
                  >
                    <span>Object</span>
                    <span>{objectWeight} N</span>
                  </div>

                  {/* Water Surface Line */}
                  <div className="absolute top-10 left-0 right-0 border-b-2 border-dashed border-blue-400/60" />
                </div>

                {/* Quantitative Calculations Breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-muted/40 border space-y-1">
                    <div className="text-[10px] text-muted-foreground font-semibold">Calculated Upthrust ($U = Vdg$)</div>
                    <div className="text-lg font-bold text-emerald-600">
                      {physicsData.upthrustNewtons.toFixed(2)} N
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-muted/40 border space-y-1">
                    <div className="text-[10px] text-muted-foreground font-semibold">Apparent Weight in Fluid</div>
                    <div className="text-lg font-bold text-primary">
                      {physicsData.apparentWeightNewtons.toFixed(2)} N
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-muted/40 border space-y-1">
                    <div className="text-[10px] text-muted-foreground font-semibold">Liquid Pressure at Depth</div>
                    <div className="text-lg font-bold text-blue-600">
                      {((physicsData.liquidPressurePascals || 0) / 1000).toFixed(2)} kPa
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </StudentDashboardShell>
  );
}
