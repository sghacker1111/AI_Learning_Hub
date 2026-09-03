import { CIPipelineStage } from "./types";

export const PIPELINE_REFERENCE_STAGES: CIPipelineStage[] = [
  {
    id: "stage-lint",
    name: "ESLint Rules & Code Quality Gate",
    command: "npm run lint",
    durationSeconds: 0,
    status: "NOT_RUN",
    outputLogSnippet: "Reference command only; no pipeline execution is recorded here.",
  },
  {
    id: "stage-typecheck",
    name: "TypeScript Strict Type Checking",
    command: "tsc --noEmit",
    durationSeconds: 0,
    status: "NOT_RUN",
    outputLogSnippet: "Reference command only; no pipeline execution is recorded here.",
  },
  {
    id: "stage-build",
    name: "Next.js Production Standalone Build",
    command: "npm run build",
    durationSeconds: 0,
    status: "NOT_RUN",
    outputLogSnippet: "Reference command only; no pipeline execution is recorded here.",
  },
  {
    id: "stage-docker",
    name: "Multi-Stage Docker Image Build",
    command: "docker build -t ai-learning-nepal:local .",
    durationSeconds: 0,
    status: "NOT_RUN",
    outputLogSnippet: "Reference command only; Docker has not been verified by this status view.",
  },
  {
    id: "stage-deploy",
    name: "Deployment Step",
    command: "configure-a-real-deployment-target",
    durationSeconds: 0,
    status: "NOT_RUN",
    outputLogSnippet: "No hosting provider, cluster, or production region is configured.",
  },
  {
    id: "stage-health",
    name: "Post-Deployment Synthetic Health Probe",
    command: "curl -f http://localhost:3000/api/health",
    durationSeconds: 0,
    status: "NOT_RUN",
    outputLogSnippet: "Reference command only; health depends on the local database and configured integrations.",
  },
];

export function getPipelineStages(): CIPipelineStage[] {
  return PIPELINE_REFERENCE_STAGES;
}
