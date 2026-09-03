export interface SchoolTenantProfile {
  id: string;
  iemisCode: string; // e.g. "270104001" (9 digits)
  name: string;
  nameNepali: string;
  schoolType: "COMMUNITY_PUBLIC" | "INSTITUTIONAL_PRIVATE";
  province: string; // "Bagmati Province"
  district: string; // "Kathmandu"
  municipality: string; // "Kathmandu Metropolitan City"
  wardNumber: number; // 4
  address: string;
  principalName: string;
  contactEmail: string;
  contactPhone: string;
  establishedYearBs: number; // e.g. 2028
  totalStudents: number;
  totalTeachers: number;
  activePlan: "INSTITUTIONAL_STANDARD" | "PALIKA_ENTERPRISE";
  studentSeatQuota: number; // 500
  teacherSeatQuota: number; // 30
}

export interface IEMISStudentRecord {
  iemisStudentId: string; // e.g. "270104001-ST081"
  name: string;
  nameNepali: string;
  dobBs: string; // "2068-05-14"
  gender: "M" | "F" | "O";
  grade: string; // "Class 8"
  section: string; // "Section A"
  rollNumber: number;
  parentName: string;
  parentPhone: string;
  syncStatus: "SYNCED" | "PENDING" | "CONFLICT";
}

export interface IEMISTeacherRecord {
  iemisTeacherId: string; // e.g. "270104001-T01"
  name: string;
  nameNepali: string;
  qualification: string;
  assignedGrades: string[];
  assignedSubjects: string[];
  totalLessonPlansGenerated: number;
  activeSectionsCount: number;
  syncStatus: "SYNCED" | "PENDING";
}

export interface IEMISSyncLog {
  id: string;
  timestamp: string;
  recordsSynced: number;
  recordsFailed: number;
  syncType: "STUDENT_ROSTER" | "TEACHER_ROSTER" | "EXAM_MARKS" | "FULL_EMIS";
  status: "SUCCESS" | "FAILED" | "PARTIAL";
  syncedBy: string;
}

export interface SchoolAnalyticsMetrics {
  schoolId: string;
  overallMastery: number; // 0 to 100
  palikaBenchmarkAverage: number; // 0 to 100
  bleBoardReadiness: number; // 0 to 100
  seeBoardReadiness: number; // 0 to 100
  gradePerformance: {
    grade: string;
    studentCount: number;
    averageMastery: number;
    status: "EXCELLENT" | "ON_TRACK" | "NEEDS_ATTENTION";
  }[];
  recentSyncLogs: IEMISSyncLog[];
}
