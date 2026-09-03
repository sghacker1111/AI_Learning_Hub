import { SchoolAnalyticsMetrics } from "./types";

export function getSchoolAnalytics(): SchoolAnalyticsMetrics {
  return {
    schoolId: "school-shanti-001",
    overallMastery: 79,
    palikaBenchmarkAverage: 72,
    bleBoardReadiness: 84,
    seeBoardReadiness: 81,
    gradePerformance: [
      { grade: "Class 8 (BLE)", studentCount: 78, averageMastery: 84, status: "EXCELLENT" },
      { grade: "Class 10 (SEE)", studentCount: 72, averageMastery: 81, status: "EXCELLENT" },
      { grade: "Class 9", studentCount: 70, averageMastery: 77, status: "ON_TRACK" },
      { grade: "Class 7", studentCount: 68, averageMastery: 76, status: "ON_TRACK" },
      { grade: "Class 6", studentCount: 65, averageMastery: 74, status: "ON_TRACK" },
      { grade: "Class 5", studentCount: 64, averageMastery: 80, status: "EXCELLENT" },
      { grade: "Class 4", studentCount: 63, averageMastery: 82, status: "EXCELLENT" },
    ],
    recentSyncLogs: [
      {
        id: "sync-101",
        timestamp: "Today, 08:30 AM",
        recordsSynced: 480,
        recordsFailed: 0,
        syncType: "FULL_EMIS",
        status: "SUCCESS",
        syncedBy: "Admin Mukunda Sharma",
      },
      {
        id: "sync-100",
        timestamp: "2081-04-15",
        recordsSynced: 476,
        recordsFailed: 4,
        syncType: "STUDENT_ROSTER",
        status: "PARTIAL",
        syncedBy: "System Cron",
      },
    ],
  };
}
