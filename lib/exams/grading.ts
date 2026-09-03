import { ExamPaper, ExamReportCard, ExamSubmissionPayload, QuestionGradingResult, QuestionGroup } from "./types";

export function evaluateExamSubmission(
  paper: ExamPaper,
  submission: ExamSubmissionPayload
): ExamReportCard {
  if (!submission.answers || typeof submission.answers !== "object") {
    throw new Error("Exam submission answers are required.");
  }

  let totalMarksObtained = 0;
  const questionResults: QuestionGradingResult[] = [];
  const groupStats: Record<QuestionGroup, { title: string; possible: number; obtained: number }> = {
    GROUP_A: { title: "Group A (Very Short)", possible: 0, obtained: 0 },
    GROUP_B: { title: "Group B (Short)", possible: 0, obtained: 0 },
    GROUP_C: { title: "Group C (Long)", possible: 0, obtained: 0 },
    GROUP_D: { title: "Group D (Higher Ability)", possible: 0, obtained: 0 },
  };

  const weakLearningOutcomes: ExamReportCard["weakLearningOutcomes"] = [];

  for (const group of paper.groups) {
    groupStats[group.group].possible += group.totalGroupMarks;

    for (const q of group.questions) {
      const studentAns = submission.answers[q.id];
      const isCorrect = studentAns?.selectedOptionId === q.correctOptionId;
      const marksEarned = isCorrect ? q.marks : 0;

      totalMarksObtained += marksEarned;
      groupStats[group.group].obtained += marksEarned;

      const studentChoiceText = q.options?.find((o) => o.id === studentAns?.selectedOptionId)?.text || "Not Attempted";
      const modelChoiceText = q.options?.find((o) => o.id === q.correctOptionId)?.text || q.modelAnswerMarkdown;

      questionResults.push({
        questionId: q.id,
        questionNumber: q.questionNumber,
        group: q.group,
        marksPossible: q.marks,
        marksObtained: marksEarned,
        isCorrect,
        studentAnswer: studentChoiceText,
        modelAnswer: modelChoiceText,
        feedback: isCorrect ? "Full Marks Awarded (All Steps Correct)" : "0 Marks — Please review model answer.",
      });

      if (!isCorrect) {
        weakLearningOutcomes.push({
          outcomeCode: q.learningOutcomeCode,
          topic: `${paper.subject} • ${q.cognitiveLevel}`,
          recommendation: `Review ${q.questionEnglish.slice(0, 70)}... with Socratic AI Tutor`,
        });
      }
    }
  }

  const percentage = paper.fullMarks > 0
    ? Math.round((totalMarksObtained / paper.fullMarks) * 100)
    : 0;

  // Determine Letter Grade and GPA
  let letterGrade: ExamReportCard["letterGrade"] = "NG";
  let gpa = 0.0;

  if (percentage >= 90) {
    letterGrade = "A+";
    gpa = 4.0;
  } else if (percentage >= 80) {
    letterGrade = "A";
    gpa = 3.6;
  } else if (percentage >= 70) {
    letterGrade = "B+";
    gpa = 3.2;
  } else if (percentage >= 60) {
    letterGrade = "B";
    gpa = 2.8;
  } else if (percentage >= 50) {
    letterGrade = "C+";
    gpa = 2.4;
  } else if (percentage >= 40) {
    letterGrade = "C";
    gpa = 2.0;
  } else if (percentage >= 35) {
    letterGrade = "D";
    gpa = 1.6;
  } else {
    letterGrade = "NG";
    gpa = 0.0;
  }

  const groupWisePerformance = Object.entries(groupStats).map(([key, val]) => ({
    group: key as QuestionGroup,
    title: val.title,
    marksPossible: val.possible,
    marksObtained: val.obtained,
    percentage: val.possible > 0 ? Math.round((val.obtained / val.possible) * 100) : 0,
  }));

  return {
    id: `rep-${Date.now()}`,
    examTitle: paper.title,
    examType: paper.examType,
    fullMarks: paper.fullMarks,
    passMarks: paper.passMarks,
    marksObtained: totalMarksObtained,
    percentage,
    letterGrade,
    gpa,
    isPassed: totalMarksObtained >= paper.passMarks,
    timeTakenMinutes: Math.round(
      Math.min(
        paper.timeDurationMinutes * 60,
        Math.max(0, Number.isFinite(submission.timeSpentSeconds) ? submission.timeSpentSeconds : 0)
      ) / 60
    ),
    groupWisePerformance,
    questionResults,
    weakLearningOutcomes,
  };
}
