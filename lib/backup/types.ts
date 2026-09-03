export type SnapshotType =
  | "SNAPSHOT_FULL_DAILY"
  | "SNAPSHOT_INCREMENTAL_HOURLY"
  | "SNAPSHOT_MANUAL_PRE_MIGRATION";

export interface DBSnapshot {
  id: string;
  filename: string;
  type: SnapshotType;
  sizeBytes: number;
  sizeFormatted: string; // e.g. "48.2 MB"
  encryptionAlgorithm: "AES-256-GCM";
  sha256Checksum: string;
  tablesIncluded: string[];
  totalRows: number;
  createdAt: string;
  createdAtBs: string;
  region: "KATHMANDU_DC1" | "POKHARA_DC2";
  status: "COMPLETED" | "VERIFIED" | "IN_PROGRESS" | "FAILED";
}

export interface DRRegionStatus {
  primaryRegion: "KATHMANDU_DC1";
  secondaryRegion: "POKHARA_DC2";
  replicationStatus: "SYNCED" | "LAGGING" | "FAILOVER_ACTIVE";
  replicationLagSeconds: number; // e.g. 12
  rtoMinutes: number; // 5
  rpoSeconds: number; // 60
  lastReplicatedAt: string;
  lastReplicatedAtBs: string;
  isSecondaryHotStandby: boolean;
}

export interface PITRRestoreRequest {
  targetTimestampBs: string; // e.g. "2081-05-04 06:00"
  targetTimestampUtc: string;
  dryRun: boolean;
  affectedTables: string[];
  estimatedDurationSeconds: number;
}

export interface IntegrityCheckResult {
  snapshotId: string;
  isValid: boolean;
  expectedSha256: string;
  calculatedSha256: string;
  verifiedAt: string;
  message: string;
}
