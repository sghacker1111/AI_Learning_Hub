export type ExamType =
  | "BLE" // Basic Level Examination (Class 8)
  | "SEE" // Secondary Education Examination (Class 10)
  | "TERMINAL" // 1st / 2nd / Pre-Board Terminal Exams
  | "UNIT_TEST" // Short Assessment (20-25 Marks)
  | "CUSTOM"; // Student/Teacher Tailored Exam

export type QuestionGroup = "GROUP_A" | "GROUP_B" | "GROUP_C" | "GROUP_D";

export interface ExamQuestion {
  id: string;
  questionNumber: number;
  group: QuestionGroup;
  marks: number;
  cognitiveLevel: "Knowledge" | "Understanding" | "Application" | "Higher Ability";
  learningOutcomeCode: string;
  questionEnglish: string;
  questionNepali: string;
  latexFormula?: string;
  options?: { id: string; text: string; isCorrect: boolean }[];
  correctOptionId?: string;
  modelAnswerMarkdown: string;
  markingSchemeSteps: { stepDescription: string; marks: number }[];
}

export interface ExamPaper {
  id: string;
  title: string;
  titleNepali: string;
  examType: ExamType;
  grade: string;
  subject: string;
  subjectCode: string;
  fullMarks: number;
  passMarks: number;
  timeDurationMinutes: number;
  instructionsEnglish: string[];
  instructionsNepali: string[];
  groups: {
    group: QuestionGroup;
    groupTitle: string;
    groupTitleNepali: string;
    marksPerQuestion: number;
    questionCount: number;
    totalGroupMarks: number;
    questions: ExamQuestion[];
  }[];
}

export interface StudentExamAnswer {
  questionId: string;
  selectedOptionId?: string;
  writtenAnswerText?: string;
  isFlaggedForReview?: boolean;
}

export interface ExamSubmissionPayload {
  examId: string;
  studentId?: string;
  timeSpentSeconds: number;
  answers: Record<string, StudentExamAnswer>;
}

export interface QuestionGradingResult {
  questionId: string;
  questionNumber: number;
  group: QuestionGroup;
  marksPossible: number;
  marksObtained: number;
  isCorrect: boolean;
  studentAnswer: string;
  modelAnswer: string;
  feedback: string;
}

export interface ExamReportCard {
  id: string;
  examTitle: string;
  examType: ExamType;
  fullMarks: number;
  passMarks: number;
  marksObtained: number;
  percentage: number;
  letterGrade: "A+" | "A" | "B+" | "B" | "C+" | "C" | "D" | "NG";
  gpa: number; // 0.0 to 4.0
  isPassed: boolean;
  timeTakenMinutes: number;
  groupWisePerformance: {
    group: QuestionGroup;
    title: string;
    marksPossible: number;
    marksObtained: number;
    percentage: number;
  }[];
  questionResults: QuestionGradingResult[];
  weakLearningOutcomes: { outcomeCode: string; topic: string; recommendation: string }[];
}
