"use client";

import * as React from "react";
import Link from "next/link";
import {
  Rocket,
  CheckCircle2,
  GitBranch,
  RotateCcw,
  ArrowLeft,
  Server,
  Layers,
  ShieldCheck,
  Check,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getProductionReleaseMetadata, MASTER_26_PHASES_AUDIT } from "@/lib/deployment/release";
import { getPipelineStages } from "@/lib/deployment/pipeline";
import { ReleaseMetadata, CIPipelineStage, PhaseAuditItem } from "@/lib/deployment/types";

export default function AdminDeploymentPage() {
  const [release] = React.useState<ReleaseMetadata>(() => getProductionReleaseMetadata());
  const [pipelineStages] = React.useState<CIPipelineStage[]>(() => getPipelineStages());
  const [auditMatrix] = React.useState<PhaseAuditItem[]>(MASTER_26_PHASES_AUDIT);
  const [actionFeedback, setActionFeedback] = React.useState<string | null>(null);

  const handleDeployRelease = () => {
    setActionFeedback("No deployment provider is configured. No infrastructure was changed.");
  };

  const handleRollback = () => {
    setActionFeedback("No deployment history or rollback provider is configured. No infrastructure was changed.");
  };

  return (
    <div className="min-h-screen bg-muted/20 p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link
              href="/admin"
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Admin Suite
            </Link>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Deployment Readiness Demonstration</h1>
          <p className="text-xs text-muted-foreground">
            Reference Docker and CI/CD commands. This screen is not connected to a deployment provider.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRollback}
            className="text-xs gap-1.5 font-semibold h-9 text-destructive hover:bg-destructive/10"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Check Rollback Availability</span>
          </Button>

          <Button
            variant="nepal"
            size="sm"
            onClick={handleDeployRelease}
            className="text-xs gap-1.5 font-bold h-9 shadow-md"
          >
            <Rocket className="h-3.5 w-3.5" />
            <span>Check Deployment Availability</span>
          </Button>
        </div>
      </div>

      {/* Action Feedback Banner */}
      {actionFeedback && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 text-amber-600 shrink-0" />
          <span>{actionFeedback}</span>
        </div>
      )}

      {/* Top Production Release Telemetry */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 border-2 border-primary/40 bg-card space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
            <span>Local Readiness Version</span>
            <Badge variant="outline" className="text-[9px]">NOT DEPLOYED</Badge>
          </div>
          <div className="text-2xl font-extrabold text-primary font-mono">{release.version}</div>
          <p className="text-[11px] text-muted-foreground">Build #{release.buildNumber} • Commit {release.gitCommitSha.slice(0, 7)}</p>
        </Card>

        <Card className="p-5 border bg-card space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
            <span>Independent Audit</span>
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold">Not performed</div>
          <p className="text-[11px] text-muted-foreground font-semibold">Feature inventory is not certification</p>
        </Card>

        <Card className="p-5 border bg-card space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
            <span>Last Local Build Routes</span>
            <Layers className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold font-mono">{release.totalRoutesCompiled} Routes</div>
          <p className="text-[11px] text-muted-foreground">Static and dynamic application routes</p>
        </Card>

        <Card className="p-5 border bg-card space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
            <span>Docker Deployment Tag</span>
            <Server className="h-4 w-4 text-purple-600" />
          </div>
          <div className="text-sm font-bold font-mono text-foreground truncate">{release.dockerImageTag}</div>
          <p className="text-[11px] text-muted-foreground font-semibold">Docker was not available for local validation</p>
        </Card>
      </div>

      {/* CI/CD Pipeline Live Visualizer */}
      <Card className="p-6 border bg-card space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2 font-bold text-sm">
            <GitBranch className="h-4 w-4 text-primary" />
            <span>Reference CI/CD Pipeline Stages</span>
          </div>
          <Badge variant="outline" className="text-[10px]">Not Executed Here</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pipelineStages.map((stage, idx) => (
            <div key={stage.id} className="p-4 rounded-xl border bg-muted/20 space-y-2 flex flex-col justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Badge variant="nepal" className="text-[9px]">Stage #{idx + 1}</Badge>
                  <span className="font-mono text-xs text-muted-foreground font-bold">NOT RUN</span>
                </div>
                <h4 className="font-bold text-xs text-foreground">{stage.name}</h4>
                <div className="font-mono text-[11px] text-muted-foreground bg-muted/40 p-1.5 rounded-lg truncate">
                  $ {stage.command}
                </div>
                <p className="text-[11px] text-foreground leading-relaxed pt-1 font-mono text-xs opacity-90">
                  {stage.outputLogSnippet}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Master 26-Phase Release Audit Matrix */}
      <Card className="p-6 border bg-card space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2 font-bold text-sm">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>26-Phase Feature Inventory</span>
          </div>
          <span className="text-xs text-muted-foreground font-semibold">Not independently audited</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {auditMatrix.map((item) => (
            <div
              key={item.promptNumber}
              className="p-3 rounded-xl border bg-muted/20 flex flex-col justify-between space-y-1.5 transition-all"
            >
              <div className="flex items-center justify-between">
                <Badge variant="subtle" className="text-[9px] font-mono">
                  Prompt {item.promptNumber}
                </Badge>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-bold">
                  <Check className="h-3 w-3" />
                  <span>NOT AUDITED</span>
                </div>
              </div>

              <div>
                <h5 className="font-bold text-xs text-foreground leading-snug">{item.title}</h5>
                <p className="text-[10px] text-primary font-nepali font-semibold">{item.titleNepali}</p>
              </div>

              <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t">
                <span>{item.category}</span>
                <span className="font-mono">inventory item</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
