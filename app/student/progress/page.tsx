"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Sparkles,
  Bot,
  Layers,
  Award,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  BrainCircuit,
  GraduationCap,
} from "lucide-react";
import { StudentDashboardShell } from "@/components/layout/student-dashboard-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CDC_KNOWLEDGE_GRAPH_NODES, CDC_KNOWLEDGE_GRAPH_EDGES } from "@/lib/mastery/knowledge-graph";
import { generateMockStudentMasteryProfile } from "@/lib/mastery/engine";
import { StudentMasteryProfile } from "@/lib/mastery/types";
import { diagnoseLearningOutcomeGap } from "@/lib/mastery/diagnostics";

export default function StudentProgressPage() {
  const [profile] = React.useState<StudentMasteryProfile>(() => generateMockStudentMasteryProfile());
  const [selectedNodeId, setSelectedNodeId] = React.useState<string>("LO-MTH801-1.2");

  const selectedNode = CDC_KNOWLEDGE_GRAPH_NODES.find((n) => n.id === selectedNodeId) || CDC_KNOWLEDGE_GRAPH_NODES[0];
  const nodeMastery = profile.nodeMasteries[selectedNode.id];

  const diagnosticResult = diagnoseLearningOutcomeGap(selectedNode.id, profile);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "EXEMPLARY_RETENTION":
        return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30";
      case "MASTERED":
        return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
      case "COMPETENT":
        return "bg-amber-500/10 text-amber-600 border-amber-500/20";
      case "IN_PROGRESS":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
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
            <h1 className="text-2xl font-bold tracking-tight">Knowledge Graph & Mastery Demonstration</h1>
            <p className="text-xs text-muted-foreground">
              Inspect a seeded Class 8 prerequisite graph and rule-based diagnostics; these scores are not live student analytics.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="nepal" className="text-xs font-semibold">
              Seeded Demo Graph
            </Badge>
          </div>
        </div>

        {/* Top Readiness Scorecard */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 border bg-card space-y-1.5 shadow-sm">
            <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
              <span>Overall Curriculum Mastery</span>
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-foreground">{profile.overallMasteryScore}%</div>
            <Progress value={profile.overallMasteryScore} className="h-1.5" />
          </Card>

          <Card className="p-4 border bg-card space-y-1.5 shadow-sm">
            <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
              <span>BLE Exam Readiness</span>
              <Award className="h-4 w-4 text-primary" />
            </div>
            <div className="text-2xl font-bold text-primary">{profile.bleExamReadinessPercentage}%</div>
            <p className="text-[11px] text-muted-foreground font-medium">Estimated GPA: {profile.estimatedGpa.toFixed(2)} (A)</p>
          </Card>

          <Card className="p-4 border bg-card space-y-1.5 shadow-sm">
            <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
              <span>Mastered Learning Outcomes</span>
              <GraduationCap className="h-4 w-4 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-foreground">{profile.masteredCount} Outcomes</div>
            <p className="text-[11px] text-emerald-600 font-semibold">{profile.competentCount} Competent • {profile.inProgressCount} In Progress</p>
          </Card>

          <Card className="p-4 border bg-card space-y-1.5 shadow-sm">
            <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
              <span>Active Prerequisite Gaps</span>
              <AlertTriangle className="h-4 w-4 text-amber-600" />
            </div>
            <div className="text-2xl font-bold text-amber-600">{profile.needsAttentionGaps.length} Alert</div>
            <p className="text-[11px] text-muted-foreground">Actionable Remedy Available</p>
          </Card>
        </div>

        {/* Prerequisite Misconception Gap Alert Card */}
        {profile.needsAttentionGaps.length > 0 && (
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="space-y-0.5 text-xs">
                <span className="font-bold text-foreground">
                  Diagnostic Alert: Prerequisite Gap in &quot;{profile.needsAttentionGaps[0].nodeTitle}&quot;
                </span>
                <p className="text-muted-foreground leading-relaxed">
                  Struggles identified because prerequisite foundation <strong>&quot;{profile.needsAttentionGaps[0].prerequisiteTitle}&quot;</strong> needs reinforcement.
                </p>
              </div>
            </div>

            <Link href={`/student/tutor?topic=${encodeURIComponent(profile.needsAttentionGaps[0].prerequisiteTitle)}`}>
              <Button variant="nepal" size="sm" className="text-xs gap-1.5 shrink-0 font-semibold">
                <Bot className="h-3.5 w-3.5" />
                <span>Fix with Socratic AI Tutor</span>
              </Button>
            </Link>
          </div>
        )}

        {/* Main Split-Screen Workspace: Knowledge Graph Nodes & Inspector */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Interactive Knowledge Graph Tree */}
          <div className="lg:col-span-7 space-y-4">
            <Card className="p-5 border bg-card space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <BrainCircuit className="h-4 w-4 text-primary" />
                  <span>Curriculum Learning Outcomes & Prerequisite Dependencies</span>
                </div>
                <Badge variant="outline" className="text-[10px]">
                  {CDC_KNOWLEDGE_GRAPH_NODES.length} Nodes • {CDC_KNOWLEDGE_GRAPH_EDGES.length} Edges
                </Badge>
              </div>

              {/* Node Cards List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {CDC_KNOWLEDGE_GRAPH_NODES.map((node) => {
                  const m = profile.nodeMasteries[node.id];
                  const isSelected = selectedNodeId === node.id;
                  const isGap = profile.needsAttentionGaps.some((g) => g.nodeId === node.id);

                  return (
                    <button
                      key={node.id}
                      onClick={() => setSelectedNodeId(node.id)}
                      className={`p-3.5 rounded-2xl border text-left text-xs transition-all flex flex-col justify-between gap-2.5 ${
                        isSelected
                          ? "border-primary bg-primary/10 ring-2 ring-primary/20 shadow-sm"
                          : "border-border bg-card/60 hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-mono text-[10px] text-muted-foreground font-bold">{node.id}</span>
                        <div className="flex items-center gap-1">
                          {isGap && <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />}
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getStatusColor(m?.masteryStatus)}`}>
                            {m ? `${m.masteryScore}%` : "Not Started"}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-0.5">
                        <div className="font-bold text-foreground line-clamp-1">{node.title}</div>
                        <div className="text-[11px] text-primary font-nepali font-semibold line-clamp-1">
                          {node.titleNepali}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1.5 border-t w-full">
                        <span>{node.unit}</span>
                        <span>Bloom: <strong>{node.bloomLevel}</strong></span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Right Column: Node Details & Diagnostic Insight */}
          <div className="lg:col-span-5 space-y-4">
            <Card className="p-6 border bg-card space-y-5 shadow-md">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono font-bold text-muted-foreground">{selectedNode.id}</span>
                  <h3 className="font-bold text-base text-foreground leading-snug">{selectedNode.title}</h3>
                  <p className="text-xs text-primary font-nepali font-semibold">{selectedNode.titleNepali}</p>
                </div>
              </div>

              {/* Multi-Factor Mastery Breakdown */}
              {nodeMastery && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-muted-foreground">Multi-Factor Mastery:</span>
                    <span className="font-bold text-base text-primary">{nodeMastery.masteryScore}%</span>
                  </div>
                  <Progress value={nodeMastery.masteryScore} className="h-2" />

                  <div className="grid grid-cols-3 gap-2 text-center text-[11px] pt-1">
                    <div className="p-2 rounded-xl bg-muted/40 border">
                      <div className="text-muted-foreground text-[10px]">Practice Acc.</div>
                      <div className="font-bold text-foreground">{Math.round(nodeMastery.practiceAccuracy * 100)}%</div>
                    </div>
                    <div className="p-2 rounded-xl bg-muted/40 border">
                      <div className="text-muted-foreground text-[10px]">Exam Avg.</div>
                      <div className="font-bold text-foreground">{nodeMastery.examScoreAverage}%</div>
                    </div>
                    <div className="p-2 rounded-xl bg-muted/40 border">
                      <div className="text-muted-foreground text-[10px]">AI Sessions</div>
                      <div className="font-bold text-primary">{nodeMastery.socraticSessionsCount}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Prerequisite Connections */}
              <div className="space-y-2 text-xs">
                <span className="font-semibold text-muted-foreground">Prerequisite Foundations:</span>
                {selectedNode.prerequisiteIds.length > 0 ? (
                  <div className="space-y-1.5">
                    {selectedNode.prerequisiteIds.map((pId) => {
                      const pNode = CDC_KNOWLEDGE_GRAPH_NODES.find((n) => n.id === pId);
                      const pMastery = profile.nodeMasteries[pId]?.masteryScore || 50;
                      return (
                        <div
                          key={pId}
                          className="p-2.5 rounded-xl border bg-muted/20 flex items-center justify-between text-xs"
                        >
                          <span className="font-medium text-foreground">{pNode?.title || pId}</span>
                          <Badge variant="outline" className="text-[10px] font-mono">
                            {pMastery}% Mastery
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-[11px] text-muted-foreground italic">
                    Foundational concept. No earlier prerequisites required in Class 8.
                  </p>
                )}
              </div>

              {/* Diagnostic Insight Recommendation */}
              {diagnosticResult && (
                <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 space-y-3 text-xs">
                  <div className="flex items-center gap-2 font-bold text-primary text-xs">
                    <Sparkles className="h-4 w-4" />
                    <span>AI Diagnostic Evaluation</span>
                  </div>

                  <p className="text-foreground leading-relaxed">
                    {diagnosticResult.remedialAdviceMarkdown}
                  </p>

                  <div className="space-y-2 pt-1 border-t border-primary/20">
                    <div className="text-[10px] uppercase font-bold text-muted-foreground">Recommended Steps:</div>
                    <div className="space-y-1.5">
                      {diagnosticResult.recommendedNextActions.map((act, idx) => (
                        <Link key={idx} href={act.targetUrl} className="block">
                          <Button
                            variant={idx === 0 ? "nepal" : "outline"}
                            size="sm"
                            className="w-full text-xs gap-1.5 justify-start h-8"
                          >
                            {act.type === "AI_TUTOR" ? (
                              <Bot className="h-3.5 w-3.5" />
                            ) : act.type === "STEM_LAB" ? (
                              <Layers className="h-3.5 w-3.5" />
                            ) : (
                              <ArrowRight className="h-3.5 w-3.5" />
                            )}
                            <span className="truncate">{act.label}</span>
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
