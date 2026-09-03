import { DRRegionStatus, PITRRestoreRequest } from "./types";

const currentDRStatus: DRRegionStatus = {
  primaryRegion: "KATHMANDU_DC1",
  secondaryRegion: "POKHARA_DC2",
  replicationStatus: "SYNCED",
  replicationLagSeconds: 8,
  rtoMinutes: 5,
  rpoSeconds: 60,
  lastReplicatedAt: new Date().toISOString(),
  lastReplicatedAtBs: "2081-05-04 07:40",
  isSecondaryHotStandby: true,
};

export function getDRReplicationStatus(): DRRegionStatus {
  return currentDRStatus;
}

export function simulatePITRRestore(targetTimestampBs: string): {
  success: boolean;
  request: PITRRestoreRequest;
  restoredRows: number;
  message: string;
} {
  const request: PITRRestoreRequest = {
    targetTimestampBs,
    targetTimestampUtc: new Date().toISOString(),
    dryRun: true,
    affectedTables: [
      "User",
      "StudentMastery",
      "IemisSchool",
      "ExamAttempt",
      "PaymentInvoice",
    ],
    estimatedDurationSeconds: 45,
  };

  return {
    success: false,
    request,
    restoredRows: 0,
    message: `PITR is not configured. No data was restored to ${targetTimestampBs}.`,
  };
}

export function simulateDRFailover(): {
  success: boolean;
  previousPrimary: string;
  newPrimary: string;
  failoverDurationSeconds: number;
  message: string;
} {
  const prevPrimary = currentDRStatus.primaryRegion;
  return {
    success: false,
    previousPrimary: prevPrimary,
    newPrimary: "POKHARA_DC2",
    failoverDurationSeconds: 0,
    message: "Disaster recovery is not configured. No region was promoted and no failover occurred.",
  };
}
