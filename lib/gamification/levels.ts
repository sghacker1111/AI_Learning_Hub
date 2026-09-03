import { LevelDefinition } from "./types";

export const LEVEL_HIERARCHY: LevelDefinition[] = [
  {
    levelNumber: 1,
    title: "Sikharu (Novice)",
    titleNepali: "शिखारु",
    minXp: 0,
    maxXp: 299,
    badgeIcon: "🌱",
    perks: ["Access to Basic Practice Arena", "Socratic AI Tutor (Standard Speed)"],
  },
  {
    levelNumber: 2,
    title: "Abhyasi (Practitioner)",
    titleNepali: "अभ्यासी",
    minXp: 300,
    maxXp: 699,
    badgeIcon: "📚",
    perks: ["Unlock Formula Retention Cards", "5% Bonus XP on Streaks"],
  },
  {
    levelNumber: 3,
    title: "Vidhyarthi (Dedicated Scholar)",
    titleNepali: "विद्यार्थी",
    minXp: 700,
    maxXp: 1199,
    badgeIcon: "🎓",
    perks: ["Unlock Practice Mini-Paper Preview", "10% Demo XP on Streaks"],
  },
  {
    levelNumber: 4,
    title: "Khoji (Explorer)",
    titleNepali: "खोजी",
    minXp: 1200,
    maxXp: 1999,
    badgeIcon: "🧭",
    perks: ["Unlock Sagarmatha Cultural Expedition", "Interactive STEM Lab Simulations"],
  },
  {
    levelNumber: 5,
    title: "Pundit (Master Scholar)",
    titleNepali: "पण्डित",
    minXp: 2000,
    maxXp: 2999,
    badgeIcon: "📜",
    perks: ["Unlock Custom Exam Creator", "20% Bonus XP on Streaks", "Scholar Profile Badge"],
  },
  {
    levelNumber: 6,
    title: "Gyani (Grand Master / Sage)",
    titleNepali: "ज्ञानी",
    minXp: 3000,
    maxXp: 10000,
    badgeIcon: "👑",
    perks: ["Demo Hall of Fame Distinction", "Tutor Interface Badge", "Golden Avatar Border"],
  },
];

export function getLevelForXp(xp: number): {
  currentLevel: LevelDefinition;
  nextLevel?: LevelDefinition;
  xpToNextLevel: number;
  progressPercentage: number;
} {
  const currentLevel =
    LEVEL_HIERARCHY.slice().reverse().find((l) => xp >= l.minXp) || LEVEL_HIERARCHY[0];
  const nextLevel = LEVEL_HIERARCHY.find((l) => l.levelNumber === currentLevel.levelNumber + 1);

  if (!nextLevel) {
    return {
      currentLevel,
      nextLevel: undefined,
      xpToNextLevel: 0,
      progressPercentage: 100,
    };
  }

  const range = currentLevel.maxXp - currentLevel.minXp + 1;
  const currentProgress = xp - currentLevel.minXp;
  const progressPercentage = Math.min(100, Math.round((currentProgress / range) * 100));
  const xpToNextLevel = nextLevel.minXp - xp;

  return {
    currentLevel,
    nextLevel,
    xpToNextLevel: Math.max(0, xpToNextLevel),
    progressPercentage,
  };
}
