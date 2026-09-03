import { IEMISStudentRecord, IEMISTeacherRecord, IEMISSyncLog, SchoolTenantProfile } from "./types";

export const DEFAULT_SCHOOL_PROFILE: SchoolTenantProfile = {
  id: "school-shanti-001",
  iemisCode: "270104001",
  name: "Shree Shanti Secondary School",
  nameNepali: "श्री शान्ति माध्यमिक विद्यालय",
  schoolType: "COMMUNITY_PUBLIC",
  province: "Bagmati Province",
  district: "Kathmandu",
  municipality: "Kathmandu Metropolitan City",
  wardNumber: 4,
  address: "Baluwatar, Ward 4, Kathmandu, Nepal",
  principalName: "Dr. Mukunda Sharma",
  contactEmail: "contact@shreeshanti.edu.np",
  contactPhone: "+977-01-4412345",
  establishedYearBs: 2028,
  totalStudents: 480,
  totalTeachers: 24,
  activePlan: "INSTITUTIONAL_STANDARD",
  studentSeatQuota: 500,
  teacherSeatQuota: 30,
};

export const MOCK_IEMIS_STUDENTS: IEMISStudentRecord[] = [
  {
    iemisStudentId: "270104001-ST001",
    name: "Aarav Sharma",
    nameNepali: "आरभ शर्मा",
    dobBs: "2068-05-14",
    gender: "M",
    grade: "Class 8",
    section: "Section A",
    rollNumber: 1,
    parentName: "Dinesh Sharma",
    parentPhone: "+977-9841234567",
    syncStatus: "SYNCED",
  },
  {
    iemisStudentId: "270104001-ST002",
    name: "Bishal Thapa",
    nameNepali: "विशाल थापा",
    dobBs: "2068-08-22",
    gender: "M",
    grade: "Class 8",
    section: "Section A",
    rollNumber: 2,
    parentName: "Gopal Thapa",
    parentPhone: "+977-9851098765",
    syncStatus: "SYNCED",
  },
  {
    iemisStudentId: "270104001-ST003",
    name: "Divya Adhikari",
    nameNepali: "दिव्या अधिकारी",
    dobBs: "2068-03-10",
    gender: "F",
    grade: "Class 8",
    section: "Section A",
    rollNumber: 3,
    parentName: "Ramesh Adhikari",
    parentPhone: "+977-9841122334",
    syncStatus: "SYNCED",
  },
  {
    iemisStudentId: "270104001-ST004",
    name: "Kiran Poudel",
    nameNepali: "किरण पौडेल",
    dobBs: "2067-11-19",
    gender: "M",
    grade: "Class 8",
    section: "Section A",
    rollNumber: 4,
    parentName: "Hari Poudel",
    parentPhone: "+977-9860112233",
    syncStatus: "SYNCED",
  },
  {
    iemisStudentId: "270104001-ST005",
    name: "Ananya Sharma",
    nameNepali: "अनन्या शर्मा",
    dobBs: "2072-01-25",
    gender: "F",
    grade: "Class 4",
    section: "Section B",
    rollNumber: 5,
    parentName: "Dinesh Sharma",
    parentPhone: "+977-9841234567",
    syncStatus: "SYNCED",
  },
];

export const MOCK_IEMIS_TEACHERS: IEMISTeacherRecord[] = [
  {
    iemisTeacherId: "270104001-T01",
    name: "Ram Prasad Subedi",
    nameNepali: "राम प्रसाद सुवेदी",
    qualification: "M.Sc. Mathematics (Tribhuvan University)",
    assignedGrades: ["Class 8", "Class 10"],
    assignedSubjects: ["Compulsory Mathematics"],
    totalLessonPlansGenerated: 18,
    activeSectionsCount: 2,
    syncStatus: "SYNCED",
  },
  {
    iemisTeacherId: "270104001-T02",
    name: "Sita Karki",
    nameNepali: "सीता कार्की",
    qualification: "M.Sc. Physics (Kathmandu University)",
    assignedGrades: ["Class 8", "Class 9", "Class 10"],
    assignedSubjects: ["Science & Technology"],
    totalLessonPlansGenerated: 14,
    activeSectionsCount: 3,
    syncStatus: "SYNCED",
  },
  {
    iemisTeacherId: "270104001-T03",
    name: "Narayan Prasad Bhattarai",
    nameNepali: "नारायण प्रसाद भट्टराई",
    qualification: "M.A. Nepali Literature",
    assignedGrades: ["Class 8", "Class 10"],
    assignedSubjects: ["Compulsory Nepali"],
    totalLessonPlansGenerated: 12,
    activeSectionsCount: 2,
    syncStatus: "SYNCED",
  },
];

export function validateIEMISCode(code: string): {
  isValid: boolean;
  districtCode?: string;
  municipalityCode?: string;
  schoolSerial?: string;
  errorMessage?: string;
} {
  const clean = code.trim();
  if (!/^\d{9}$/.test(clean)) {
    return {
      isValid: false,
      errorMessage: "IEMIS code must be exactly 9 numeric digits according to Nepal Ministry of Education format.",
    };
  }

  const districtCode = clean.slice(0, 2);
  const municipalityCode = clean.slice(2, 6);
  const schoolSerial = clean.slice(6, 9);

  return {
    isValid: true,
    districtCode,
    municipalityCode,
    schoolSerial,
  };
}

export function simulateIEMISCloudSync(): IEMISSyncLog {
  return {
    id: `sync-${Date.now()}`,
    timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
    recordsSynced: 0,
    recordsFailed: 0,
    syncType: "FULL_EMIS",
    status: "FAILED",
    syncedBy: "Simulation only - no remote connection",
  };
}
