import { AuditLogEntry, AuditActionType } from "./types";

export const MOCK_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: "aud-101",
    action: "IEMIS_ROSTER_IMPORT",
    actorId: "usr-admin-01",
    actorName: "Principal Kedar Sharma",
    actorRole: "ADMIN",
    targetResource: "IEMIS School: 270104001 (Shree Shanti Secondary School)",
    ipAddress: "103.10.28.45 (NTC FIBER, Lalitpur)",
    status: "SUCCESS",
    timestamp: "2026-08-22T06:45:00Z",
    timestampBs: "2081-05-04 06:45",
    metadata: { importedStudentsCount: 142, gradeSections: ["8A", "8B", "9A", "10A"] },
  },
  {
    id: "aud-102",
    action: "EXAM_PAPER_PUBLISHED",
    actorId: "usr-teacher-01",
    actorName: "Dr. Ram Prasad Subedi",
    actorRole: "TEACHER",
    targetResource: "BLE Model Exam 1 (Class 8 Compulsory Mathematics - 50 Marks)",
    ipAddress: "103.14.120.18 (WorldLink, Kathmandu)",
    status: "SUCCESS",
    timestamp: "2026-08-22T06:50:00Z",
    timestampBs: "2081-05-04 06:50",
    metadata: { totalQuestions: 20, timeLimitMinutes: 120, specGridAligned: true },
  },
  {
    id: "aud-103",
    action: "VAT_INVOICE_GENERATED",
    actorId: "usr-student-01",
    actorName: "Aarav Sharma",
    actorRole: "SYSTEM",
    targetResource: "VAT Invoice: INV-2081-0842 (NPR 499.00 via eSewa)",
    ipAddress: "27.34.45.89 (Ncell 4G, Pokhara)",
    status: "SUCCESS",
    timestamp: "2026-08-22T07:05:00Z",
    timestampBs: "2081-05-04 07:05",
    metadata: { baseNpr: 441.59, vat13Npr: 57.41, pan: "601234567" },
  },
  {
    id: "aud-104",
    action: "LESSON_PLAN_CREATED",
    actorId: "usr-teacher-01",
    actorName: "Dr. Ram Prasad Subedi",
    actorRole: "TEACHER",
    targetResource: "CDC 5-Phase Lesson Plan: 13% Nepal VAT & Commercial Discounts",
    ipAddress: "103.14.120.18 (WorldLink, Kathmandu)",
    status: "SUCCESS",
    timestamp: "2026-08-22T07:15:00Z",
    timestampBs: "2081-05-04 07:15",
    metadata: { phases: ["Motivation", "Presentation", "Group Practice", "Evaluation", "Homework"] },
  },
  {
    id: "aud-105",
    action: "USER_ROLE_ELEVATION",
    actorId: "usr-superadmin",
    actorName: "Ministry System Admin",
    actorRole: "SUPER_ADMIN",
    targetResource: "User: subedi.ram@shanti.edu.np -> TEACHER to SCHOOL_ADMIN",
    ipAddress: "103.1.200.10 (Singha Durbar Govt Intranet)",
    status: "SUCCESS",
    timestamp: "2026-08-22T07:20:00Z",
    timestampBs: "2081-05-04 07:20",
    metadata: { reason: "Promoted to Head of Mathematics Department" },
  },
];

export function getAuditLogs(filterAction?: AuditActionType): AuditLogEntry[] {
  if (filterAction) {
    return MOCK_AUDIT_LOGS.filter((l) => l.action === filterAction);
  }
  return MOCK_AUDIT_LOGS;
}
