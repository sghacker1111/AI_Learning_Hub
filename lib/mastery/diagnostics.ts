import { DiagnosticProbeResult, StudentMasteryProfile } from "./types";
import { CDC_KNOWLEDGE_GRAPH_NODES } from "./knowledge-graph";

export function diagnoseLearningOutcomeGap(
  targetNodeId: string,
  profile: StudentMasteryProfile
): DiagnosticProbeResult {
  const targetNode = CDC_KNOWLEDGE_GRAPH_NODES.find((n) => n.id === targetNodeId);

  if (!targetNode) {
    return {
      targetNodeId,
      isPassed: false,
      score: 0,
      hasPrerequisiteGap: false,
      remedialAdviceMarkdown: "Learning outcome not found in curriculum graph.",
      recommendedNextActions: [],
    };
  }

  const targetMastery = profile.nodeMasteries[targetNodeId]?.masteryScore ?? 0;

  // Check prerequisites
  let lowestPrereqScore = 100;
  let rootPrereqId: string | undefined = undefined;
  let rootPrereqTitle: string | undefined = undefined;

  for (const prereqId of targetNode.prerequisiteIds) {
    const pScore = profile.nodeMasteries[prereqId]?.masteryScore ?? 50;
    if (pScore < lowestPrereqScore) {
      lowestPrereqScore = pScore;
      rootPrereqId = prereqId;
      const pNode = CDC_KNOWLEDGE_GRAPH_NODES.find((n) => n.id === prereqId);
      rootPrereqTitle = pNode?.title || prereqId;
    }
  }

  const hasPrerequisiteGap = lowestPrereqScore < 75;

  let advice = "";
  if (hasPrerequisiteGap && rootPrereqTitle) {
    advice = `**Diagnostic Insight:** While attempting **${targetNode.title}**, the root misconception lies in prerequisite concept **${rootPrereqTitle}** (Mastery: ${lowestPrereqScore}%). We recommend strengthening this foundation first.`;
  } else {
    advice = `**Diagnostic Insight:** Prerequisite foundations are solid (${lowestPrereqScore}%). You just need additional practice on ${targetNode.title} word problems and formula steps.`;
  }

  return {
    targetNodeId,
    isPassed: targetMastery >= 75,
    score: targetMastery,
    hasPrerequisiteGap,
    rootCauseNodeId: rootPrereqId,
    rootCauseTitle: rootPrereqTitle,
    remedialAdviceMarkdown: advice,
    recommendedNextActions: [
      {
        label: `Remediate with Socratic AI Tutor (${rootPrereqTitle || targetNode.title})`,
        targetUrl: `/student/tutor?topic=${encodeURIComponent(rootPrereqTitle || targetNode.title)}`,
        type: "AI_TUTOR",
      },
      {
        label: `Solve 5 Targeted Practice Questions`,
        targetUrl: `/student/practice?chapter=${encodeURIComponent(targetNode.chapter)}`,
        type: "PRACTICE",
      },
      {
        label: `Simulate in STEM Lab`,
        targetUrl: `/student/practice/stem-lab`,
        type: "STEM_LAB",
      },
    ],
  };
}
