export type UserRole =
  | "SUPER_ADMIN"
  | "CURRICULUM_ADMIN"
  | "CONTENT_CREATOR"
  | "CONTENT_REVIEWER"
  | "SCHOOL_ADMIN"
  | "TEACHER"
  | "STUDENT"
  | "PARENT";

export type UserStatus = "ACTIVE" | "HIDDEN" | "ARCHIVED" | "SUSPENDED";

export type ContentStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "PUBLISHED"
  | "ARCHIVED";

export type QuestionType =
  | "MCQ"
  | "TRUE_FALSE"
  | "FILL_BLANK"
  | "VERY_SHORT"
  | "SHORT"
  | "LONG"
  | "NUMERICAL"
  | "DIAGRAM"
  | "ESSAY";

export type DifficultyLevel = "EASY" | "MEDIUM" | "HARD" | "EXPERT";

export type CognitiveLevel = "KNOWLEDGE" | "UNDERSTANDING" | "APPLICATION" | "HIGHER_ABILITY";

export interface StudentProfileMock {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  grade: string;
  gradeNepali: string;
  schoolName: string;
  streakDays: number;
  totalStudyMinutes: number;
  overallMastery: number;
  weeklyGoalMinutes: number;
  completedLessonsCount: number;
  totalQuizzesTaken: number;
}
