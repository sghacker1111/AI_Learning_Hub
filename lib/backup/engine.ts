import { DBSnapshot, IntegrityCheckResult } from "./types";

export const MOCK_DB_SNAPSHOTS: DBSnapshot[] = [
  {
    id: "snap-20810504-0700-inc",
    filename: "ai_nepal_inc_20810504_0700.dump.enc",
    type: "SNAPSHOT_INCREMENTAL_HOURLY",
    sizeBytes: 3565158,
    sizeFormatted: "3.4 MB",
    encryptionAlgorithm: "AES-256-GCM",
    sha256Checksum: "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
    tablesIncluded: ["MasteryRecord", "AuditLog", "PaymentInvoice", "OfflineSyncOutbox"],
    totalRows: 480,
    createdAt: "2026-08-22T07:00:00Z",
    createdAtBs: "2081-05-04 07:00",
    region: "KATHMANDU_DC1",
    status: "VERIFIED",
  },
  {
    id: "snap-20810504-0600-full",
    filename: "ai_nepal_full_20810504_0600.dump.enc",
    type: "SNAPSHOT_FULL_DAILY",
    sizeBytes: 50541363,
    sizeFormatted: "48.2 MB",
    encryptionAlgorithm: "AES-256-GCM",
    sha256Checksum: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    tablesIncluded: [
      "User",
      "CurriculumGrade",
      "CurriculumSubject",
      "CurriculumLesson",
      "StudentMastery",
      "IemisSchool",
      "ExamPaper",
      "PaymentInvoice",
    ],
    totalRows: 14280,
    createdAt: "2026-08-22T06:00:00Z",
    createdAtBs: "2081-05-04 06:00",
    region: "KATHMANDU_DC1",
    status: "VERIFIED",
  },
  {
    id: "snap-20810503-0600-full",
    filename: "ai_nepal_full_20810503_0600.dump.enc",
    type: "SNAPSHOT_FULL_DAILY",
    sizeBytes: 49807360,
    sizeFormatted: "47.5 MB",
    encryptionAlgorithm: "AES-256-GCM",
    sha256Checksum: "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8",
    tablesIncluded: ["All 28 Schema Tables"],
    totalRows: 13950,
    createdAt: "2026-08-21T06:00:00Z",
    createdAtBs: "2081-05-03 06:00",
    region: "POKHARA_DC2",
    status: "VERIFIED",
  },
  {
    id: "snap-20810502-iemis-premigration",
    filename: "ai_nepal_premigration_20810502.dump.enc",
    type: "SNAPSHOT_MANUAL_PRE_MIGRATION",
    sizeBytes: 48758784,
    sizeFormatted: "46.5 MB",
    encryptionAlgorithm: "AES-256-GCM",
    sha256Checksum: "4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a",
    tablesIncluded: ["All 28 Schema Tables"],
    totalRows: 13200,
    createdAt: "2026-08-20T14:30:00Z",
    createdAtBs: "2081-05-02 14:30",
    region: "KATHMANDU_DC1",
    status: "VERIFIED",
  },
];

export function getDBSnapshots(): DBSnapshot[] {
  return MOCK_DB_SNAPSHOTS;
}

export function createOnDemandSnapshot(): DBSnapshot {
  const timestamp = new Date().toISOString();
  const id = `snap-${Date.now()}`;

  return {
    id,
    filename: `ai_nepal_manual_${Date.now()}.dump.enc`,
    type: "SNAPSHOT_MANUAL_PRE_MIGRATION",
    sizeBytes: 50855936,
    sizeFormatted: "48.5 MB",
    encryptionAlgorithm: "AES-256-GCM",
    sha256Checksum: "6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b",
    tablesIncluded: ["All 28 Schema Tables + Vector Index"],
    totalRows: 14350,
    createdAt: timestamp,
    createdAtBs: "2081-05-04 (Just now)",
    region: "KATHMANDU_DC1",
    status: "VERIFIED",
  };
}

export function verifySnapshotIntegrity(snapshotId: string): IntegrityCheckResult {
  const snapshot = MOCK_DB_SNAPSHOTS.find((s) => s.id === snapshotId) || MOCK_DB_SNAPSHOTS[0];

  return {
    snapshotId,
    isValid: false,
    expectedSha256: snapshot.sha256Checksum,
    calculatedSha256: "not-computed-no-archive-present",
    verifiedAt: new Date().toISOString(),
    message: "This is sample metadata only. No archive exists, so integrity was not verified.",
  };
}
