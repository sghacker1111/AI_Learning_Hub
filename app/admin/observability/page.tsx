"use client";

import * as React from "react";
import Link from "next/link";
import {
  Activity,
  Server,
  Cpu,
  Database,
  ArrowLeft,
  RefreshCw,
  Clock,
  Sparkles,
  Code2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SystemHealthReport } from "@/lib/observability/types";

const UNPROBED_HEALTH: SystemHealthReport = {
  overallStatus: "DEGRADED",
  uptimeSeconds: 0,
  timestamp: "Not checked",
  timestampBs: "Unavailable",
  version: "Unknown",
  subsystems: [],
};

export default function AdminObservabilityPage() {
  const [health, setHealth] = React.useState<SystemHealthReport>(UNPROBED_HEALTH);
  const [rawMetricsText, setRawMetricsText] = React.useState("# Select Refresh Health to load live process metrics.\n");
  const [showPrometheusRaw, setShowPrometheusRaw] = React.useState(false);
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const [healthResponse, metricsResponse] = await Promise.all([
        fetch("/api/health", { cache: "no-store" }),
        fetch("/api/metrics", { cache: "no-store" }),
      ]);
      setHealth(await healthResponse.json());
      setRawMetricsText(await metricsResponse.text());
    } finally {
      setIsRefreshing(false);
    }
  };

  const databaseProbe = health.subsystems.find((subsystem) => subsystem.id === "db-prisma");
  const ragProbe = health.subsystems.find((subsystem) => subsystem.id === "rag-demo-index");
  const ragChunks = typeof ragProbe?.details?.chunks === "number" ? ragProbe.details.chunks : "Not loaded";

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
          <h1 className="text-2xl font-bold tracking-tight">System Monitoring & Observability Telemetry</h1>
          <p className="text-xs text-muted-foreground">
            On-demand database/configuration health probes and current process-level Prometheus metrics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/admin/audit">
            <Button variant="outline" size="sm" className="text-xs font-semibold">
              <span>Security Audit Logs</span>
            </Button>
          </Link>

          <Button
            variant="nepal"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="text-xs gap-1.5 font-semibold h-9"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>Refresh Telemetry</span>
          </Button>
        </div>
      </div>

      {/* Top Health Telemetry Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border bg-card space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
            <span>Overall System Health</span>
            <Activity className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold">{health.overallStatus}</div>
          <p className="text-[11px] text-muted-foreground">Latest on-demand probe only</p>
        </Card>

        <Card className="p-4 border bg-card space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
            <span>Process Uptime</span>
            <Clock className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold font-mono">{health.uptimeSeconds}s</div>
          <p className="text-[11px] text-muted-foreground">No historical SLA data collected</p>
        </Card>

        <Card className="p-4 border bg-card space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
            <span>Database Probe</span>
            <Sparkles className="h-4 w-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold font-mono">{databaseProbe?.latencyMs ?? "--"} ms</div>
          <p className="text-[11px] text-muted-foreground">{databaseProbe?.status ?? "Not checked"}</p>
        </Card>

        <Card className="p-4 border bg-card space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
            <span>Subsystems Probed</span>
            <Server className="h-4 w-4 text-primary" />
          </div>
          <div className="text-2xl font-bold text-foreground">{health.subsystems.length}</div>
          <p className="text-[11px] text-muted-foreground">No active-session counter configured</p>
        </Card>
      </div>

      {/* Subsystem Health Grid */}
      <Card className="p-6 border bg-card space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2 font-bold text-sm">
            <Database className="h-4 w-4 text-primary" />
            <span>Subsystem Diagnostic Probes (/api/health)</span>
          </div>
          <Badge variant="outline" className="text-[10px]">On-Demand Status</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {health.subsystems.map((sub) => (
            <div key={sub.id} className="p-4 rounded-xl border bg-muted/20 space-y-2 flex flex-col justify-between">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-[9px]">{sub.status}</Badge>
                  <span className="font-mono text-xs font-bold text-muted-foreground">{sub.latencyMs} ms</span>
                </div>
                <h4 className="font-bold text-xs text-foreground pt-1">{sub.name}</h4>
                <p className="text-[11px] text-primary font-nepali font-semibold">{sub.nameNepali}</p>
                <p className="text-xs text-muted-foreground leading-relaxed pt-1">{sub.message}</p>
              </div>

              <div className="pt-2 border-t flex items-center justify-between text-[11px] text-muted-foreground">
                <span>Probe signal: <strong>{sub.uptimePercent}%</strong></span>
                <span className="font-mono">v{health.version}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Prometheus Text Exposition & Live Metric Viewer */}
      <Card className="p-6 border bg-card space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2 font-bold text-sm">
            <Cpu className="h-4 w-4 text-primary" />
            <span>Prometheus Metrics Exposition (/api/metrics)</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPrometheusRaw(!showPrometheusRaw)}
            className="text-xs gap-1.5 h-8 font-semibold"
          >
            <Code2 className="h-3.5 w-3.5" />
            <span>{showPrometheusRaw ? "Hide Raw Export" : "View Prometheus Text Format"}</span>
          </Button>
        </div>

        {showPrometheusRaw ? (
          <pre className="p-4 rounded-xl bg-slate-950 text-slate-100 font-mono text-xs overflow-x-auto leading-relaxed max-h-96">
            {rawMetricsText}
          </pre>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl border bg-muted/20 space-y-1">
              <span className="text-muted-foreground font-semibold">HTTP Request Counter</span>
              <div className="text-xl font-bold font-mono">Not collected</div>
              <p className="text-[11px] text-muted-foreground">Add an instrumentation backend for totals</p>
            </div>

            <div className="p-4 rounded-xl border bg-muted/20 space-y-1">
              <span className="text-muted-foreground font-semibold">AI Token Counter</span>
              <div className="text-xl font-bold font-mono">Not collected</div>
              <p className="text-[11px] text-muted-foreground">No provider usage store configured</p>
            </div>

            <div className="p-4 rounded-xl border bg-muted/20 space-y-1">
              <span className="text-muted-foreground font-semibold">Bundled RAG Demo Chunks</span>
              <div className="text-xl font-bold font-mono">{ragChunks}</div>
              <p className="text-[11px] text-muted-foreground">No persistent vector index</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
