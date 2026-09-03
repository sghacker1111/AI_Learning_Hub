import { DailyRecommendationItem, PersonalizedLearningPlan } from "./types";
import { generateSequencedRoadmap } from "./sequencer";
import { generateSpacedRepetitionDeck } from "./spaced-repetition";

export function generateDailyRecommendations(): DailyRecommendationItem[] {
  return [
    {
      id: "rec-1",
      type: "SPACED_REVIEW",
      title: "Spaced Retention: Overlapping Sets Cardinality",
      titleNepali: "पुनरावलोकन: दुई खप्टिएका समूहहरूको गणना",
      subject: "Compulsory Mathematics",
      chapter: "Sets",
      estimatedMinutes: 5,
      xpReward: 50,
      priority: "HIGH",
      badge: "Memory Retention",
      actionLabel: "Start Flash Review",
      targetUrl: "/student/practice?chapter=Sets",
      isCompleted: false,
    },
    {
      id: "rec-2",
      type: "SOCRATIC_LESSON",
      title: "Socratic Discovery: 13% Nepal VAT & Marked Price",
      titleNepali: "सक्रेटिस सिकाइ: १३% मूल्य अभिवृद्धि कर र अंकित मूल्य",
      subject: "Compulsory Mathematics",
      chapter: "Arithmetic (13% VAT)",
      estimatedMinutes: 12,
      xpReward: 120,
      priority: "HIGH",
      badge: "Core Concept",
      actionLabel: "Learn with AI Tutor",
      targetUrl: "/student/tutor?topic=13%25%20VAT",
      isCompleted: false,
    },
    {
      id: "rec-3",
      type: "PRACTICE_DRILL",
      title: "Adaptive Practice: Liquid Pressure & Archimedes Upthrust",
      titleNepali: "अनुकूलित अभ्यास: तरलको चाप र आर्किमिडिज उर्ध्वचाप",
      subject: "Science & Technology",
      chapter: "Force & Pressure",
      estimatedMinutes: 10,
      xpReward: 100,
      priority: "MEDIUM",
      badge: "Formula Mastery",
      actionLabel: "Solve 5 Problems",
      targetUrl: "/student/practice?chapter=Force%20%26%20Pressure",
      isCompleted: false,
    },
    {
      id: "rec-4",
      type: "STEM_EXPERIMENT",
      title: "Interactive STEM Lab: Fluid Eureka Can Simulation",
      titleNepali: "प्रयोगशाला: युरेका क्यान र विस्थापित तरल सिमुलेसन",
      subject: "Science & Technology",
      chapter: "Archimedes' Principle",
      estimatedMinutes: 8,
      xpReward: 80,
      priority: "LOW",
      badge: "Interactive Lab",
      actionLabel: "Open Simulation",
      targetUrl: "/student/practice/stem-lab",
      isCompleted: false,
    },
  ];
}

export function generatePersonalizedLearningPlan(
  studentId: string = "student-demo-1"
): PersonalizedLearningPlan {
  const dailyPlaylist = generateDailyRecommendations();
  const spacedReviewDeck = generateSpacedRepetitionDeck();
  const milestones = generateSequencedRoadmap();

  return {
    studentId,
    currentGrade: "Class 8",
    targetExam: "BLE_CLASS_8",
    daysUntilExam: 42,
    dailyGoalMinutes: 35,
    currentStreakDays: 5,
    totalXp: 1450,
    dailyPlaylist,
    spacedReviewDeck,
    milestones,
  };
}
