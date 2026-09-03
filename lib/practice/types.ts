export type CognitiveLevel =
  | "LEVEL_1_KNOWLEDGE"
  | "LEVEL_2_UNDERSTANDING"
  | "LEVEL_3_APPLICATION"
  | "LEVEL_4_HIGHER_ABILITY";

export type QuestionType = "MCQ" | "NUMERICAL" | "TRUE_FALSE";

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
  latex?: string;
}

export interface GeneratedQuestion {
  id: string;
  grade: string; // "Class 8"
  subject: string; // "Compulsory Mathematics"
  chapter: string; // "Unit 1: Sets"
  learningOutcomeCode: string; // "LO-MTH801-1.1"
  cognitiveLevel: CognitiveLevel;
  difficultyLabel: "Easy" | "Medium" | "Hard" | "Challenging";
  questionType: QuestionType;
  questionText: string;
  latexEquation?: string;
  options: QuestionOption[];
  correctOptionId: string;
  explanationMarkdown: string;
  marks: number;
}

export interface AnswerSubmissionPayload {
  sessionId?: string;
  questionId: string;
  learningOutcomeCode: string;
  selectedOptionId: string;
  timeSpentSeconds: number;
  currentStreak: number;
  currentLevel: CognitiveLevel;
}

export interface AnswerSubmissionResult {
  isCorrect: boolean;
  persisted: boolean;
  correctOptionId: string;
  explanationMarkdown: string;
  masteryScoreDelta: number;
  newStreak: number;
  nextRecommendedLevel: CognitiveLevel;
  socraticFollowupPrompt: string;
}
