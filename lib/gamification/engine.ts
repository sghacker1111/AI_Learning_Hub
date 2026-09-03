import { DailyMission, StudentGamificationProfile } from "./types";
import { getLevelForXp } from "./levels";
import { getCulturalQuests } from "./quests";
import { getAchievementBadges } from "./badges";

export function getDailyMissions(): DailyMission[] {
  return [
    {
      id: "mis-1",
      title: "Solve 5 Adaptive Practice Problems",
      titleNepali: "५ वटा गणित वा विज्ञानका प्रश्नहरू हल गर्नुहोस्",
      xpReward: 50,
      targetCount: 5,
      currentCount: 3,
      isCompleted: false,
      targetUrl: "/student/practice",
    },
    {
      id: "mis-2",
      title: "Complete 1 Socratic AI Dialogue Session",
      titleNepali: "सक्रेटिस एआई ट्युटरसँग १ सिकाई संवाद पुरा गर्नुहोस्",
      xpReward: 60,
      targetCount: 1,
      currentCount: 1,
      isCompleted: true,
      targetUrl: "/student/tutor",
    },
    {
      id: "mis-3",
      title: "Review 3 Spaced Retention Flashcards",
      titleNepali: "३ वटा स्मरण कार्डहरू पुनरावलोकन गर्नुहोस्",
      xpReward: 40,
      targetCount: 3,
      currentCount: 3,
      isCompleted: true,
      targetUrl: "/student/learning",
    },
  ];
}

export function getStudentGamificationProfile(
  studentId: string = "student-demo-1",
  totalXp: number = 1450
): StudentGamificationProfile {
  const levelInfo = getLevelForXp(totalXp);
  const badges = getAchievementBadges();
  const activeQuests = getCulturalQuests();
  const dailyMissions = getDailyMissions();

  return {
    studentId,
    totalXp,
    currentLevel: levelInfo.currentLevel,
    nextLevel: levelInfo.nextLevel,
    xpToNextLevel: levelInfo.xpToNextLevel,
    levelProgressPercentage: levelInfo.progressPercentage,
    currentStreakDays: 5,
    streakMultiplier: 1.15,
    unlockedBadgesCount: badges.filter((b) => b.isUnlocked).length,
    totalBadgesCount: badges.length,
    badges,
    activeQuests,
    dailyMissions,
  };
}
