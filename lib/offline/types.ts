export interface OfflineContentPack {
  id: string;
  title: string;
  titleNepali: string;
  grade: string;
  subject: string;
  chapter: string;
  approxSizeBytes: number; // e.g. 1250000 (~1.2 MB)
  approxSizeFormatted: string; // "1.2 MB"
  totalQuestionsCount: number;
  totalTheoryCardsCount: number;
  hasInteractiveSimulations: boolean;
  isDownloaded: boolean;
  downloadedAt?: string;
}

export interface OfflineOutboxItem {
  id: string;
  activityType: "PRACTICE_SUBMISSION" | "EXAM_SUBMISSION" | "FLASHCARD_REVIEW";
  learningOutcomeCode: string;
  score: number;
  totalPoints: number;
  xpEarned: number;
  timestamp: string;
  syncStatus: "QUEUED_OFFLINE" | "SYNCING" | "SYNCED";
}

export interface StorageQuotaInfo {
  usedBytes: number;
  quotaBytes: number;
  usedFormatted: string; // e.g. "3.4 MB"
  quotaFormatted: string; // e.g. "50.0 MB"
  usagePercentage: number;
  downloadedPacksCount: number;
}

export interface DataSaverConfig {
  isDataSaverEnabled: boolean;
  compressMedia: boolean;
  disableHighResSimulations: boolean;
  batchSyncIntervalMinutes: number;
}
