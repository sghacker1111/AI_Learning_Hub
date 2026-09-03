export type PipelineStatus = "SUCCESS" | "RUNNING" | "QUEUED" | "FAILED" | "NOT_RUN";

export interface CIPipelineStage {
  id: string;
  name: string;
  command: string;
  durationSeconds: number;
  status: PipelineStatus;
  outputLogSnippet: string;
}

export interface PhaseAuditItem {
  promptNumber: number;
  title: string;
  titleNepali: string;
  category: string;
  isCompleted: boolean;
  verifiedRoutesCount: number;
}

export interface ReleaseMetadata {
  version: string;
  releaseName: string;
  releaseNameNepali: string;
  buildNumber: number;
  gitCommitSha: string;
  targetRegions: string[];
  totalRoutesCompiled: number;
  auditPassedPhasesCount: number;
  totalPhasesCount: number;
  releaseDateBs: string;
  releaseDateUtc: string;
  dockerImageTag: string;
  isProductionActive: boolean;
}
