export type MasteryStatus =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "COMPETENT"
  | "MASTERED"
  | "EXEMPLARY_RETENTION";

export interface KnowledgeGraphNode {
  id: string; // e.g. "LO-MTH801-1.1"
  title: string;
  titleNepali: string;
  grade: string;
  subject: string;
  unit: string;
  chapter: string;
  description: string;
  prerequisiteIds: string[]; // IDs of required foundational outcomes
  nextOutcomeIds: string[]; // IDs of dependent advanced outcomes
  bloomLevel: "Remember" | "Understand" | "Apply" | "Analyze" | "Evaluate";
}

export interface KnowledgeGraphEdge {
  fromNodeId: string;
  toNodeId: string;
  relationship: "PREREQUISITE_FOR" | "EXTENDS" | "APPLICATION_OF";
}

export interface StudentNodeMastery {
  nodeId: string;
  masteryScore: number; // 0 to 100
  masteryStatus: MasteryStatus;
  practiceAttemptCount: number;
  practiceAccuracy: number; // 0 to 1.0
  examScoreAverage: number; // 0 to 100
  socraticSessionsCount: number;
  lastPracticedDate: string;
  retentionDecayFactor: number; // 0.8 to 1.0
}

export interface DiagnosticProbeResult {
  targetNodeId: string;
  isPassed: boolean;
  score: number;
  hasPrerequisiteGap: boolean;
  rootCauseNodeId?: string;
  rootCauseTitle?: string;
  remedialAdviceMarkdown: string;
  recommendedNextActions: {
    label: string;
    targetUrl: string;
    type: "AI_TUTOR" | "PRACTICE" | "STEM_LAB";
  }[];
}

export interface StudentMasteryProfile {
  studentId: string;
  overallMasteryScore: number; // 0 to 100
  bleExamReadinessPercentage: number;
  estimatedGpa: number;
  nodeMasteries: Record<string, StudentNodeMastery>;
  masteredCount: number;
  competentCount: number;
  inProgressCount: number;
  needsAttentionGaps: {
    nodeId: string;
    nodeTitle: string;
    prerequisiteId: string;
    prerequisiteTitle: string;
    gapSeverity: "HIGH" | "MEDIUM" | "LOW";
  }[];
}
