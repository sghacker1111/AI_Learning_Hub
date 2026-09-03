import { OfflineOutboxItem, StorageQuotaInfo } from "./types";
import { CDC_OFFLINE_PACKS } from "./packs";

export const MOCK_OFFLINE_OUTBOX: OfflineOutboxItem[] = [
  {
    id: "out-01",
    activityType: "PRACTICE_SUBMISSION",
    learningOutcomeCode: "LO-MTH801-2.2 (13% VAT)",
    score: 5,
    totalPoints: 5,
    xpEarned: 100,
    timestamp: "10 mins ago (Offline Mode)",
    syncStatus: "QUEUED_OFFLINE",
  },
  {
    id: "out-02",
    activityType: "FLASHCARD_REVIEW",
    learningOutcomeCode: "LO-SCI802-2.2 (Archimedes)",
    score: 3,
    totalPoints: 3,
    xpEarned: 40,
    timestamp: "15 mins ago (Offline Mode)",
    syncStatus: "QUEUED_OFFLINE",
  },
];

export function calculateStorageQuota(): StorageQuotaInfo {
  const downloadedPacks = CDC_OFFLINE_PACKS.filter((p) => p.isDownloaded);
  const usedBytes = downloadedPacks.reduce((acc, p) => acc + p.approxSizeBytes, 0);
  const quotaBytes = 50 * 1024 * 1024; // 50 MB standard browser IndexedDB quota
  const usagePercentage = Math.round((usedBytes / quotaBytes) * 100);

  return {
    usedBytes,
    quotaBytes,
    usedFormatted: `${(usedBytes / (1024 * 1024)).toFixed(1)} MB`,
    quotaFormatted: "50.0 MB",
    usagePercentage,
    downloadedPacksCount: downloadedPacks.length,
  };
}

export function simulateReconcileOfflineOutbox(): {
  syncedCount: number;
  totalXpReconciled: number;
  timestamp: string;
} {
  return {
    syncedCount: MOCK_OFFLINE_OUTBOX.length,
    totalXpReconciled: MOCK_OFFLINE_OUTBOX.reduce((acc, i) => acc + i.xpEarned, 0),
    timestamp: new Date().toISOString(),
  };
}
