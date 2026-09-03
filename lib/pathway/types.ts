export type RoadmapStepStatus = "COMPLETED" | "IN_PROGRESS" | "LOCKED" | "RECOMMENDED";

export interface RoadmapStep {
  id: string;
  stepNumber: number;
  title: string;
  titleNepali: string;
  subject: string;
  unit: string;
  chapter: string;
  learningOutcomeCode: string;
  description: string;
  status: RoadmapStepStatus;
  masteryPercentage: number;
  prerequisiteStepIds: string[];
  estimatedHours: number;
  xpReward: number;
  targetUrl: string;
}

export interface PathwayMilestone {
  id: string;
  milestoneNumber: number;
  title: string;
  titleNepali: string;
  description: string;
  steps: RoadmapStep[];
  isCompleted: boolean;
  totalSteps: number;
  completedSteps: number;
}

export type RecommendationType =
  | "SPACED_REVIEW"
  | "SOCRATIC_LESSON"
  | "PRACTICE_DRILL"
  | "STEM_EXPERIMENT"
  | "CHECKPOINT_QUIZ";

export interface DailyRecommendationItem {
  id: string;
  type: RecommendationType;
  title: string;
  titleNepali: string;
  subject: string;
  chapter: string;
  estimatedMinutes: number;
  xpReward: number;
  priority: "HIGH" | "MEDIUM" | "LOW";
  badge: string;
  actionLabel: string;
  targetUrl: string;
  isCompleted?: boolean;
}

export interface SpacedReviewCard {
  id: string;
  conceptTitle: string;
  conceptTitleNepali: string;
  formulaLatex?: string;
  promptQuestion: string;
  quickAnswer: string;
  lastReviewedDaysAgo: number;
  retentionIntervalDays: number;
  status: "DUE_TODAY" | "MASTERED_STABLE" | "OVERDUE";
}

export interface PersonalizedLearningPlan {
  studentId: string;
  currentGrade: string;
  targetExam: "BLE_CLASS_8" | "SEE_CLASS_10";
  daysUntilExam: number;
  dailyGoalMinutes: number;
  currentStreakDays: number;
  totalXp: number;
  dailyPlaylist: DailyRecommendationItem[];
  spacedReviewDeck: SpacedReviewCard[];
  milestones: PathwayMilestone[];
}
