import { MasteryStatus, StudentMasteryProfile, StudentNodeMastery } from "./types";

export function calculateNodeMasteryScore(params: {
  practiceAccuracy: number; // 0.0 to 1.0
  examScoreAverage: number; // 0 to 100
  socraticSessionsCount: number;
  retentionDecayFactor?: number; // 0.8 to 1.0
}): { score: number; status: MasteryStatus } {
  const {
    practiceAccuracy,
    examScoreAverage,
    socraticSessionsCount,
    retentionDecayFactor = 0.95,
  } = params;

  // 1. Practice Component (40%)
  const practiceComp = practiceAccuracy * 100 * 0.4;

  // 2. Exam Component (30%)
  const examComp = examScoreAverage * 0.3;

  // 3. Socratic Engagement Component (20%, cap at 5 sessions = full 20 pts)
  const socraticComp = Math.min(20, socraticSessionsCount * 4);

  // 4. Spaced Retention Factor (10%)
  const retentionComp = 10 * retentionDecayFactor;

  const rawScore = practiceComp + examComp + socraticComp + retentionComp;
  const score = Math.round(Math.max(0, Math.min(100, rawScore)));

  let status: MasteryStatus = "NOT_STARTED";
  if (score >= 95) status = "EXEMPLARY_RETENTION";
  else if (score >= 80) status = "MASTERED";
  else if (score >= 50) status = "COMPETENT";
  else if (score > 0) status = "IN_PROGRESS";

  return { score, status };
}

export function generateMockStudentMasteryProfile(
  studentId: string = "student-demo-1"
): StudentMasteryProfile {
  const nodeMasteries: Record<string, StudentNodeMastery> = {
    "LO-MTH800-0.1": {
      nodeId: "LO-MTH800-0.1",
      masteryScore: 88,
      masteryStatus: "MASTERED",
      practiceAttemptCount: 14,
      practiceAccuracy: 0.92,
      examScoreAverage: 85,
      socraticSessionsCount: 3,
      lastPracticedDate: "2081-05-12",
      retentionDecayFactor: 0.96,
    },
    "LO-MTH801-1.1": {
      nodeId: "LO-MTH801-1.1",
      masteryScore: 92,
      masteryStatus: "MASTERED",
      practiceAttemptCount: 18,
      practiceAccuracy: 0.94,
      examScoreAverage: 90,
      socraticSessionsCount: 4,
      lastPracticedDate: "2081-05-14",
      retentionDecayFactor: 0.98,
    },
    "LO-MTH801-1.2": {
      nodeId: "LO-MTH801-1.2",
      masteryScore: 78,
      masteryStatus: "COMPETENT",
      practiceAttemptCount: 10,
      practiceAccuracy: 0.8,
      examScoreAverage: 75,
      socraticSessionsCount: 2,
      lastPracticedDate: "2081-05-13",
      retentionDecayFactor: 0.94,
    },
    "LO-MTH801-1.3": {
      nodeId: "LO-MTH801-1.3",
      masteryScore: 45,
      masteryStatus: "IN_PROGRESS",
      practiceAttemptCount: 4,
      practiceAccuracy: 0.5,
      examScoreAverage: 40,
      socraticSessionsCount: 1,
      lastPracticedDate: "2081-05-10",
      retentionDecayFactor: 0.9,
    },
    "LO-MTH801-2.1": {
      nodeId: "LO-MTH801-2.1",
      masteryScore: 85,
      masteryStatus: "MASTERED",
      practiceAttemptCount: 12,
      practiceAccuracy: 0.88,
      examScoreAverage: 82,
      socraticSessionsCount: 2,
      lastPracticedDate: "2081-05-11",
      retentionDecayFactor: 0.95,
    },
    "LO-MTH801-2.2": {
      nodeId: "LO-MTH801-2.2",
      masteryScore: 82,
      masteryStatus: "MASTERED",
      practiceAttemptCount: 16,
      practiceAccuracy: 0.85,
      examScoreAverage: 80,
      socraticSessionsCount: 3,
      lastPracticedDate: "2081-05-14",
      retentionDecayFactor: 0.97,
    },
    "LO-MTH801-4.1": {
      nodeId: "LO-MTH801-4.1",
      masteryScore: 72,
      masteryStatus: "COMPETENT",
      practiceAttemptCount: 8,
      practiceAccuracy: 0.75,
      examScoreAverage: 70,
      socraticSessionsCount: 2,
      lastPracticedDate: "2081-05-09",
      retentionDecayFactor: 0.92,
    },
    "LO-SCI800-0.1": {
      nodeId: "LO-SCI800-0.1",
      masteryScore: 95,
      masteryStatus: "EXEMPLARY_RETENTION",
      practiceAttemptCount: 20,
      practiceAccuracy: 0.98,
      examScoreAverage: 95,
      socraticSessionsCount: 5,
      lastPracticedDate: "2081-05-14",
      retentionDecayFactor: 0.99,
    },
    "LO-SCI802-2.1": {
      nodeId: "LO-SCI802-2.1",
      masteryScore: 86,
      masteryStatus: "MASTERED",
      practiceAttemptCount: 15,
      practiceAccuracy: 0.9,
      examScoreAverage: 84,
      socraticSessionsCount: 3,
      lastPracticedDate: "2081-05-13",
      retentionDecayFactor: 0.96,
    },
    "LO-SCI802-2.2": {
      nodeId: "LO-SCI802-2.2",
      masteryScore: 80,
      masteryStatus: "MASTERED",
      practiceAttemptCount: 14,
      practiceAccuracy: 0.82,
      examScoreAverage: 78,
      socraticSessionsCount: 3,
      lastPracticedDate: "2081-05-12",
      retentionDecayFactor: 0.95,
    },
  };

  const scores = Object.values(nodeMasteries).map((n) => n.masteryScore);
  const overallMasteryScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

  const masteredCount = Object.values(nodeMasteries).filter(
    (n) => n.masteryStatus === "MASTERED" || n.masteryStatus === "EXEMPLARY_RETENTION"
  ).length;
  const competentCount = Object.values(nodeMasteries).filter(
    (n) => n.masteryStatus === "COMPETENT"
  ).length;
  const inProgressCount = Object.values(nodeMasteries).filter(
    (n) => n.masteryStatus === "IN_PROGRESS"
  ).length;

  const needsAttentionGaps = [
    {
      nodeId: "LO-MTH801-1.3",
      nodeTitle: "Advanced 3-Set & Ratio Complement Problems",
      prerequisiteId: "LO-MTH801-1.2",
      prerequisiteTitle: "Venn Diagram Survey Modeling (2 Sets)",
      gapSeverity: "HIGH" as const,
    },
  ];

  return {
    studentId,
    overallMasteryScore,
    bleExamReadinessPercentage: Math.round(overallMasteryScore * 0.96),
    estimatedGpa: 3.65,
    nodeMasteries,
    masteredCount,
    competentCount,
    inProgressCount,
    needsAttentionGaps,
  };
}
