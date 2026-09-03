import { AnswerSubmissionPayload, AnswerSubmissionResult, CognitiveLevel } from "./types";
import { prisma } from "@/lib/db/prisma";

const LEVEL_ORDER: CognitiveLevel[] = [
  "LEVEL_1_KNOWLEDGE",
  "LEVEL_2_UNDERSTANDING",
  "LEVEL_3_APPLICATION",
  "LEVEL_4_HIGHER_ABILITY",
];

export async function evaluateAnswerSubmission(
  payload: AnswerSubmissionPayload,
  clientCorrectOptionId: string,
  explanation: string,
  userId?: string
): Promise<AnswerSubmissionResult> {
  let dbQuestion: Awaited<ReturnType<typeof prisma.question.findUnique>> & {
    options?: { id: string; isCorrect: boolean }[];
    learningOutcome?: { code: string } | null;
  } | null = null;

  if (userId && !userId.startsWith("dev-") && payload.questionId) {
    try {
      dbQuestion = await prisma.question.findUnique({
        where: { id: payload.questionId },
        include: { options: true, learningOutcome: true },
      });
    } catch {
      dbQuestion = null;
    }
  }

  const authoritativeOption = dbQuestion?.learningOutcome?.code === payload.learningOutcomeCode
    ? dbQuestion.options?.find((option) => option.isCorrect)?.id
    : undefined;
  const correctOptionId = authoritativeOption ?? clientCorrectOptionId;
  const isCorrect = payload.selectedOptionId === correctOptionId;
  const currentLevelIndex = LEVEL_ORDER.indexOf(payload.currentLevel);
  let newStreak = Math.max(0, Math.min(100, Math.floor(payload.currentStreak || 0)));
  let nextLevelIndex = currentLevelIndex >= 0 ? currentLevelIndex : 1;
  let masteryDelta = 0;

  if (isCorrect) {
    newStreak += 1;
    masteryDelta = 3 + nextLevelIndex * 1.5;
    if (newStreak >= 2 && nextLevelIndex < LEVEL_ORDER.length - 1) {
      nextLevelIndex += 1;
      newStreak = 0;
    }
  } else {
    newStreak = 0;
    masteryDelta = -1;
    if (nextLevelIndex > 0) nextLevelIndex -= 1;
  }

  const nextRecommendedLevel = LEVEL_ORDER[nextLevelIndex];
  const socraticFollowupPrompt = isCorrect
    ? `Great job! Would you like to try a higher-level problem on ${payload.learningOutcomeCode}?`
    : `Let's understand why this step was tricky. Review: ${explanation.slice(0, 150)}...`;

  let persisted = false;
  const selectedOptionBelongsToQuestion = dbQuestion?.options?.some(
    (option) => option.id === payload.selectedOptionId
  );

  if (userId && dbQuestion?.learningOutcomeId && authoritativeOption && selectedOptionBelongsToQuestion) {
    try {
      await prisma.$transaction(async (tx) => {
        const existing = await tx.learningOutcomeMastery.findUnique({
          where: {
            studentId_learningOutcomeId: {
              studentId: userId,
              learningOutcomeId: dbQuestion!.learningOutcomeId!,
            },
          },
        });
        const nextMastery = Math.min(100, Math.max(0, (existing?.masteryScore ?? 60) + masteryDelta));
        await tx.questionAttempt.create({
          data: {
            studentId: userId,
            questionId: dbQuestion!.id,
            selectedOptionId: payload.selectedOptionId,
            isCorrect,
            marksObtained: isCorrect ? dbQuestion!.marks : 0,
            timeSpentSeconds: Math.min(3600, Math.max(0, Math.round(payload.timeSpentSeconds || 0))),
          },
        });
        await tx.learningOutcomeMastery.upsert({
          where: {
            studentId_learningOutcomeId: {
              studentId: userId,
              learningOutcomeId: dbQuestion!.learningOutcomeId!,
            },
          },
          update: {
            attemptCount: { increment: 1 },
            correctCount: isCorrect ? { increment: 1 } : undefined,
            masteryScore: nextMastery,
          },
          create: {
            studentId: userId,
            learningOutcomeId: dbQuestion!.learningOutcomeId!,
            masteryScore: nextMastery,
            attemptCount: 1,
            correctCount: isCorrect ? 1 : 0,
          },
        });
      });
      persisted = true;
    } catch {
      persisted = false;
    }
  }

  return {
    isCorrect,
    persisted,
    correctOptionId,
    explanationMarkdown: explanation,
    masteryScoreDelta: persisted ? masteryDelta : 0,
    newStreak,
    nextRecommendedLevel,
    socraticFollowupPrompt,
  };
}
