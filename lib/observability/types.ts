export type HealthStatus = "HEALTHY" | "DEGRADED" | "UNHEALTHY";

export interface SubsystemHealth {
  id: string;
  name: string;
  nameNepali: string;
  status: HealthStatus;
  latencyMs: number;
  uptimePercent: number;
  message?: string;
  details?: Record<string, unknown>;
}

export interface SystemHealthReport {
  overallStatus: HealthStatus;
  uptimeSeconds: number;
  timestamp: string;
  timestampBs: string;
  version: string;
  subsystems: SubsystemHealth[];
}

export interface PrometheusMetric {
  name: string;
  help: string;
  type: "counter" | "gauge" | "histogram";
  values: {
    labels?: Record<string, string>;
    value: number;
  }[];
}

export type AuditActionType =
  | "IEMIS_ROSTER_IMPORT"
  | "IEMIS_CLOUD_SYNC"
  | "USER_ROLE_ELEVATION"
  | "EXAM_PAPER_PUBLISHED"
  | "LESSON_PLAN_CREATED"
  | "VAT_INVOICE_GENERATED"
  | "SECURITY_LOGIN_FAILURE"
  | "CURRICULUM_CONTENT_EDIT";

export interface AuditLogEntry {
  id: string;
  action: AuditActionType;
  actorId: string;
  actorName: string;
  actorRole: "ADMIN" | "TEACHER" | "SUPER_ADMIN" | "SYSTEM";
  targetResource: string;
  ipAddress: string;
  status: "SUCCESS" | "WARNING" | "FAILURE";
  timestamp: string;
  timestampBs: string;
  metadata?: Record<string, unknown>;
}
