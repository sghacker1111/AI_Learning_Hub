export interface TeachingPhase {
  phaseNumber: number;
  title: string;
  titleNepali: string;
  durationMinutes: number;
  teacherActivity: string;
  studentActivity: string;
  teachingMethod: string;
  latexFormulas?: string[];
}

export interface LessonPlan {
  id: string;
  grade: string; // e.g. "Class 8"
  subject: string; // "Compulsory Mathematics"
  unit: string; // "Unit 2: Arithmetic"
  chapter: string; // "Discount & 13% VAT"
  periodNumber: number;
  durationMinutes: number; // e.g. 45
  curriculumEdition: string; // sample/template identifier
  specificObjectives: string[];
  specificObjectivesNepali: string[];
  instructionalMaterials: string[]; // Low-cost materials e.g. "Old market receipts, chart paper"
  instructionalMaterialsNepali: string[];
  phases: TeachingPhase[];
  formativeEvaluationQuestions: string[];
  homeworkTasks: string[];
  teacherReflectionNotes: string;
}

export interface StudentRosterEntry {
  id: string;
  rollNumber: number;
  name: string;
  email: string;
  masteryPercentage: number;
  streakDays: number;
  hasPrerequisiteGap: boolean;
  gapTopic?: string;
  lastActive: string;
}

export interface ClassSection {
  id: string;
  grade: string;
  section: string; // "Section A"
  subject: string;
  studentCount: number;
  averageMastery: number;
  activeAssignmentsCount: number;
  roster: StudentRosterEntry[];
}

export interface TeacherAssignment {
  id: string;
  title: string;
  classSectionId: string;
  subject: string;
  chapter: string;
  totalPoints: number;
  dueDate: string;
  submissionCount: number;
  totalStudents: number;
  status: "ACTIVE" | "COMPLETED" | "DRAFT";
}

export interface ClassroomAnalytics {
  classId: string;
  className: string;
  averageMastery: number;
  highPerformersCount: number; // 90%+
  onTrackCount: number; // 60-89%
  needsSupportCount: number; // <60%
  conceptHeatmap: {
    chapter: string;
    masteryScore: number;
    difficultyLevel: "Easy" | "Medium" | "Challenging";
  }[];
  atRiskStudents: {
    studentName: string;
    rollNumber: number;
    strugglingConcept: string;
    prerequisiteGap: string;
    masteryScore: number;
  }[];
}
