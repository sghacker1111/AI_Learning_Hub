"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  CheckCircle2,
  HardDrive,
  RefreshCw,
  Layers,
  ArrowRight,
  Shield,
  BookOpen,
} from "lucide-react";
import { StudentDashboardShell } from "@/components/layout/student-dashboard-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getOfflinePacks } from "@/lib/offline/packs";
import { calculateStorageQuota, MOCK_OFFLINE_OUTBOX, simulateReconcileOfflineOutbox } from "@/lib/offline/sync-engine";
import { DEFAULT_DATA_SAVER_CONFIG } from "@/lib/offline/bandwidth";
import { OfflineContentPack, OfflineOutboxItem } from "@/lib/offline/types";

export default function StudentOfflinePage() {
  const [packs, setPacks] = React.useState<OfflineContentPack[]>(() => getOfflinePacks());
  const [outbox, setOutbox] = React.useState<OfflineOutboxItem[]>(MOCK_OFFLINE_OUTBOX);
  const [quota, setQuota] = React.useState(() => calculateStorageQuota());
  const [dataSaver, setDataSaver] = React.useState(DEFAULT_DATA_SAVER_CONFIG);
  const [syncFeedback, setSyncFeedback] = React.useState<string | null>(null);

  const handleToggleDownload = (packId: string) => {
    setPacks((prev) =>
      prev.map((p) => {
        if (p.id === packId) {
          const newStatus = !p.isDownloaded;
          return {
            ...p,
            isDownloaded: newStatus,
            downloadedAt: newStatus ? new Date().toISOString().slice(0, 16) : undefined,
          };
        }
        return p;
      })
    );
    setTimeout(() => {
      setQuota(calculateStorageQuota());
    }, 100);
  };

  const handleSyncOutbox = () => {
    setSyncFeedback("Syncing offline outbox with AI Learning Nepal cloud...");
    setTimeout(() => {
      const res = simulateReconcileOfflineOutbox();
      setOutbox([]);
      setSyncFeedback(
        `Successfully synchronized ${res.syncedCount} offline submissions! +${res.totalXpReconciled} XP credited to your profile ✓`
      );
      setTimeout(() => setSyncFeedback(null), 5000);
    }, 1200);
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
            <h1 className="text-2xl font-bold tracking-tight">Offline PWA & Local Content Sync Center</h1>
            <p className="text-xs text-muted-foreground">
              Download CDC curriculum packs for offline learning in rural areas, manage browser storage, and sync queued outbox answers.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="nepal" className="text-[10px]">
              Offline-First Ready (PWA)
            </Badge>
          </div>
        </div>

        {/* Sync Feedback Banner */}
        {syncFeedback && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300 font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{syncFeedback}</span>
          </div>
        )}

        {/* Top Storage & Bandwidth Telemetry */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 border bg-card space-y-1.5 shadow-sm">
            <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
              <span>Local Storage Used</span>
              <HardDrive className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold">{quota.usedFormatted}</div>
            <Progress value={quota.usagePercentage} className="h-1.5" />
            <p className="text-[10px] text-muted-foreground font-mono">{quota.quotaFormatted} Total Quota</p>
          </Card>

          <Card className="p-4 border bg-card space-y-1.5 shadow-sm">
            <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
              <span>Downloaded Course Packs</span>
              <BookOpen className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-emerald-600">{quota.downloadedPacksCount} Packs</div>
            <p className="text-[11px] text-muted-foreground">Ready for Offline Practice</p>
          </Card>

          <Card className="p-4 border bg-card space-y-1.5 shadow-sm">
            <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
              <span>Offline Outbox Items</span>
              <RefreshCw className="h-4 w-4 text-amber-500" />
            </div>
            <div className="text-2xl font-bold text-amber-600">{outbox.length} Queued</div>
            <p className="text-[11px] text-muted-foreground">Awaiting Network Sync</p>
          </Card>

          <Card className="p-4 border bg-card space-y-1.5 shadow-sm">
            <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
              <span>Data Saver Mode</span>
              <Shield className="h-4 w-4 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-purple-600">Active (2G/3G)</div>
            <p className="text-[11px] text-emerald-600 font-semibold">Compressed Payloads</p>
          </Card>
        </div>

        {/* Main Content Split Screen */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Downloadable CDC Chapter Packs */}
          <div className="lg:col-span-8 space-y-4">
            <Card className="p-6 border bg-card space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <Layers className="h-4 w-4 text-primary" />
                  <span>CDC Course Content Packs for Offline Use</span>
                </div>
                <span className="text-xs text-muted-foreground">Self-Contained Bundles</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {packs.map((pack) => (
                  <div
                    key={pack.id}
                    className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 transition-all ${
                      pack.isDownloaded
                        ? "bg-emerald-500/5 border-emerald-500/30"
                        : "bg-muted/20 border-border hover:bg-muted/30"
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge
                          variant={pack.isDownloaded ? "success" : "outline"}
                          className="text-[10px]"
                        >
                          {pack.isDownloaded ? "Downloaded (Offline Ready)" : "Not Downloaded"}
                        </Badge>
                        <span className="font-mono text-[10px] text-muted-foreground font-bold">
                          {pack.approxSizeFormatted}
                        </span>
                      </div>

                      <div className="space-y-0.5">
                        <h4 className="font-bold text-xs text-foreground leading-snug">{pack.title}</h4>
                        <p className="text-[11px] text-primary font-nepali font-semibold">{pack.titleNepali}</p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                        <span>{pack.totalQuestionsCount} Questions</span>
                        <span>•</span>
                        <span>{pack.totalTheoryCardsCount} Theory Cards</span>
                        {pack.hasInteractiveSimulations && (
                          <>
                            <span>•</span>
                            <span className="text-primary font-semibold">STEM Lab Included</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 border-t flex items-center justify-between gap-2">
                      <Button
                        variant={pack.isDownloaded ? "outline" : "nepal"}
                        size="sm"
                        onClick={() => handleToggleDownload(pack.id)}
                        className="text-xs gap-1.5 h-8 flex-1"
                      >
                        {pack.isDownloaded ? (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                            <span>Remove Pack</span>
                          </>
                        ) : (
                          <>
                            <Download className="h-3.5 w-3.5" />
                            <span>Download ({pack.approxSizeFormatted})</span>
                          </>
                        )}
                      </Button>

                      {pack.isDownloaded && (
                        <Link href="/student/practice">
                          <Button variant="nepal" size="sm" className="text-xs h-8 gap-1">
                            <span>Open</span>
                            <ArrowRight className="h-3 w-3" />
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right Column: Offline Outbox Queue & Data Saver Settings */}
          <div className="lg:col-span-4 space-y-4">
            {/* Outbox Card */}
            <Card className="p-5 border bg-card space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <RefreshCw className="h-4 w-4 text-amber-500" />
                  <span>Offline Sync Outbox Queue</span>
                </div>
                <Badge variant="outline" className="text-[10px]">
                  {outbox.length} Items
                </Badge>
              </div>

              {outbox.length > 0 ? (
                <div className="space-y-2.5">
                  {outbox.map((item) => (
                    <div key={item.id} className="p-3 rounded-xl border bg-muted/20 text-xs space-y-1">
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-foreground">{item.learningOutcomeCode}</span>
                        <span className="text-amber-600 font-mono">+{item.xpEarned} XP</span>
                      </div>
                      <div className="flex items-center justify-between text-muted-foreground text-[11px]">
                        <span>Score: {item.score}/{item.totalPoints}</span>
                        <span>{item.timestamp}</span>
                      </div>
                    </div>
                  ))}

                  <div className="pt-2">
                    <Button
                      variant="nepal"
                      size="sm"
                      onClick={handleSyncOutbox}
                      className="w-full text-xs font-semibold gap-1.5 h-8"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      <span>Sync Outbox Now</span>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="p-4 text-center text-xs text-muted-foreground space-y-1">
                  <CheckCircle2 className="h-6 w-6 text-emerald-600 mx-auto" />
                  <p className="font-semibold text-foreground">All Submissions Synced</p>
                  <p className="text-[11px]">No pending offline answers in local outbox.</p>
                </div>
              )}
            </Card>

            {/* Data Saver Settings */}
            <Card className="p-5 border bg-card space-y-3 shadow-sm text-xs">
              <div className="flex items-center justify-between border-b pb-2">
                <span className="font-bold text-sm text-foreground">Rural Network Data Saver</span>
                <Badge variant="subtle" className="text-[10px]">Optimization</Badge>
              </div>

              <div className="space-y-2 text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span>Compress Vector Schemas</span>
                  <input
                    type="checkbox"
                    checked={dataSaver.compressMedia}
                    onChange={(e) => setDataSaver({ ...dataSaver, compressMedia: e.target.checked })}
                    className="h-4 w-4 rounded text-primary focus:ring-primary"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span>Reduce AI Streaming Overhead</span>
                  <input
                    type="checkbox"
                    checked={dataSaver.isDataSaverEnabled}
                    onChange={(e) => setDataSaver({ ...dataSaver, isDataSaverEnabled: e.target.checked })}
                    className="h-4 w-4 rounded text-primary focus:ring-primary"
                  />
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </StudentDashboardShell>
  );
}
