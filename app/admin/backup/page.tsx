"use client";

import * as React from "react";
import Link from "next/link";
import {
  HardDrive,
  ShieldCheck,
  Download,
  ArrowLeft,
  Server,
  Lock,
  CheckCircle2,
  Clock,
  RotateCcw,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { getDBSnapshots, verifySnapshotIntegrity } from "@/lib/backup/engine";
import { getDRReplicationStatus } from "@/lib/backup/dr-replication";
import { DBSnapshot, DRRegionStatus, IntegrityCheckResult } from "@/lib/backup/types";

export default function AdminBackupPage() {
  const [snapshots] = React.useState<DBSnapshot[]>(() => getDBSnapshots());
  const [drStatus] = React.useState<DRRegionStatus>(() => getDRReplicationStatus());
  const [targetPitrTime, setTargetPitrTime] = React.useState("2081-05-04 06:00");
  const [actionFeedback, setActionFeedback] = React.useState<string | null>(null);
  const [integrityResult, setIntegrityResult] = React.useState<IntegrityCheckResult | null>(null);

  const handleCreateSnapshot = () => {
    setActionFeedback("Backup storage is not configured. No snapshot was created.");
  };

  const handleVerifyIntegrity = (snapshotId: string) => {
    const result = verifySnapshotIntegrity(snapshotId);
    setIntegrityResult(result);
  };

  const handleSimulatePITR = () => {
    setActionFeedback(`PITR is not configured. No data was restored to ${targetPitrTime}.`);
  };

  const handleSimulateFailover = () => {
    setActionFeedback("No disaster-recovery region is configured. No failover occurred.");
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
          <h1 className="text-2xl font-bold tracking-tight">Backup & Recovery Demonstration</h1>
          <p className="text-xs text-muted-foreground">
            Illustrative snapshot metadata and recovery controls. No archive storage, replication, or PITR service is configured.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSimulateFailover}
            className="text-xs gap-1.5 font-semibold h-9"
          >
            <Server className="h-3.5 w-3.5 text-blue-600" />
            <span>Simulate DR Failover Drill</span>
          </Button>

          <Button
            variant="nepal"
            size="sm"
            onClick={handleCreateSnapshot}
            className="text-xs gap-1.5 font-semibold h-9"
          >
            <HardDrive className="h-3.5 w-3.5" />
            <span>Check Snapshot Availability</span>
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

      {/* Disaster Recovery Multi-Region Telemetry Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border bg-card space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
            <span>Sample Primary Region</span>
            <Server className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-foreground">{drStatus.primaryRegion}</div>
          <p className="text-[11px] text-muted-foreground font-semibold">Illustrative metadata only</p>
        </Card>

        <Card className="p-4 border bg-card space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
            <span>Sample DR Region</span>
            <ShieldCheck className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-xl font-bold text-foreground">{drStatus.secondaryRegion}</div>
          <p className="text-[11px] text-muted-foreground font-mono">No live replication</p>
        </Card>

        <Card className="p-4 border bg-card space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
            <span>Recovery Time Objective</span>
            <Clock className="h-4 w-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold font-mono">Not defined</div>
          <p className="text-[11px] text-muted-foreground">No measured RTO</p>
        </Card>

        <Card className="p-4 border bg-card space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
            <span>Recovery Point Objective</span>
            <RotateCcw className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold font-mono">Not defined</div>
          <p className="text-[11px] text-muted-foreground">No measured RPO</p>
        </Card>
      </div>

      {/* Main Split: Snapshots Repository (Left) vs PITR Restore Wizard (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Snapshots Table */}
        <div className="lg:col-span-8 space-y-4">
          <Card className="p-6 border bg-card space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2 font-bold text-sm">
                <HardDrive className="h-4 w-4 text-primary" />
                <span>Sample Snapshot Metadata</span>
              </div>
              <Badge variant="subtle" className="text-[10px]">No Archives Present</Badge>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/40 text-muted-foreground font-semibold border-b">
                  <tr>
                    <th className="p-3">Snapshot Name</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Size</th>
                    <th className="p-3">Rows</th>
                    <th className="p-3">Region</th>
                    <th className="p-3">Date (B.S.)</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {snapshots.map((snap) => (
                    <tr key={snap.id} className="hover:bg-muted/20 transition-all">
                      <td className="p-3 font-mono font-bold text-foreground">
                        <div className="flex items-center gap-1.5">
                          <Lock className="h-3 w-3 text-emerald-600 shrink-0" />
                          <span className="truncate max-w-[140px]">{snap.filename}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge variant="outline" className="text-[9px]">{snap.type.replace("SNAPSHOT_", "")}</Badge>
                      </td>
                      <td className="p-3 font-mono">{snap.sizeFormatted}</td>
                      <td className="p-3 font-mono">{snap.totalRows.toLocaleString()}</td>
                      <td className="p-3 font-mono text-[10px] text-muted-foreground">{snap.region}</td>
                      <td className="p-3 font-mono text-muted-foreground">{snap.createdAtBs}</td>
                      <td className="p-3 text-right space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled
                          onClick={() => handleVerifyIntegrity(snap.id)}
                          className="h-7 text-xs text-primary gap-1"
                        >
                          <ShieldCheck className="h-3 w-3" />
                          <span>Verify</span>
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          disabled
                          className="h-7 text-xs text-muted-foreground hover:text-foreground"
                          title="No archive is available"
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Right: Point-In-Time Recovery (PITR) Wizard */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="p-5 border bg-card space-y-4 shadow-sm">
            <div className="border-b pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sm">
                <RotateCcw className="h-4 w-4 text-primary" />
                <span>Point-in-Time Recovery (PITR)</span>
              </div>
              <Badge variant="outline" className="text-[9px]">Unavailable</Badge>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Preview the timestamp input used by a future recovery workflow. This control does not restore data.
            </p>

            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground">Target Recovery Timestamp (B.S.)</label>
              <Input
                value={targetPitrTime}
                onChange={(e) => setTargetPitrTime(e.target.value)}
                placeholder="2081-05-04 06:00"
                className="h-8 text-xs font-mono"
              />
            </div>

            <div className="p-3 rounded-xl bg-muted/30 border text-xs space-y-1 text-muted-foreground">
              <span className="font-bold text-foreground">Affected Primary Schemas:</span>
              <p>• StudentMastery (sample progress records)</p>
              <p>• IemisSchool (9-Digit Institutional Roster)</p>
              <p>• ExamAttempt (Board Exam Submissions)</p>
              <p>• PaymentInvoice (13% VAT Tax Receipts)</p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleSimulatePITR}
              className="w-full text-xs font-bold gap-1.5 h-9"
            >
              <RotateCcw className="h-3.5 w-3.5 text-primary" />
              <span>Simulate PITR Restore Drill</span>
            </Button>
          </Card>
        </div>
      </div>

      {/* Checksum Integrity Inspector Modal */}
      {integrityResult && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6 border bg-card space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <h3 className="font-bold text-sm text-foreground">Sample Integrity Metadata</h3>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setIntegrityResult(null)} className="h-7 w-7 p-0">
                ✕
              </Button>
            </div>

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 font-semibold flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-amber-600 shrink-0" />
              <span>{integrityResult.message}</span>
            </div>

            <div className="space-y-1.5 text-xs text-muted-foreground">
              <p><strong>Snapshot ID:</strong> {integrityResult.snapshotId}</p>
              <p><strong>Expected Checksum:</strong></p>
              <pre className="p-2 rounded-lg bg-slate-950 text-slate-100 font-mono text-[10px] truncate">
                {integrityResult.expectedSha256}
              </pre>
              <p><strong>Calculated Checksum:</strong></p>
              <pre className="p-2 rounded-lg bg-slate-950 text-slate-100 font-mono text-[10px] truncate">
                {integrityResult.calculatedSha256}
              </pre>
            </div>

            <div className="pt-2 flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setIntegrityResult(null)} className="text-xs">
                Close
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
