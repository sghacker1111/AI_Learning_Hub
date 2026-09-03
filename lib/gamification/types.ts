export interface LevelDefinition {
  levelNumber: number;
  title: string;
  titleNepali: string;
  minXp: number;
  maxXp: number;
  badgeIcon: string;
  perks: string[];
}

export type BadgeRarity = "COMMON" | "RARE" | "EPIC" | "LEGENDARY";

export interface AchievementBadge {
  id: string;
  title: string;
  titleNepali: string;
  description: string;
  icon: string; // emoji or icon name
  rarity: BadgeRarity;
  isUnlocked: boolean;
  unlockedAt?: string;
  progressPercentage: number;
  requirementText: string;
}

export interface QuestStep {
  stepNumber: number;
  altitudeMeters?: number; // e.g. 5364 for Base Camp
  title: string;
  titleNepali: string;
  description: string;
  challengeType: "SETS" | "VAT" | "PRESSURE" | "ARCHIMEDES";
  targetUrl: string;
  xpReward: number;
  isCompleted: boolean;
}

export interface CulturalQuest {
  id: string;
  title: string;
  titleNepali: string;
  theme: "HIMALAYAN_EXPEDITION" | "HERITAGE_TRAIL" | "TERAI_PHYSICS";
  description: string;
  totalXpReward: number;
  completionBadgeId: string;
  steps: QuestStep[];
  currentStepIndex: number;
  isCompleted: boolean;
}

export interface DailyMission {
  id: string;
  title: string;
  titleNepali: string;
  xpReward: number;
  targetCount: number;
  currentCount: number;
  isCompleted: boolean;
  targetUrl: string;
}

export interface StudentGamificationProfile {
  studentId: string;
  totalXp: number;
  currentLevel: LevelDefinition;
  nextLevel?: LevelDefinition;
  xpToNextLevel: number;
  levelProgressPercentage: number;
  currentStreakDays: number;
  streakMultiplier: number; // e.g. 1.25x
  unlockedBadgesCount: number;
  totalBadgesCount: number;
  badges: AchievementBadge[];
  activeQuests: CulturalQuest[];
  dailyMissions: DailyMission[];
}
