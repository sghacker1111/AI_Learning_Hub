import { SocraticStage } from "./types";

export function evaluateNextSocraticStage(
  currentStage: SocraticStage,
  userMessage: string,
  turnCount: number
): SocraticStage {
  const text = userMessage.toLowerCase().trim();

  // If student asks a fresh new topic, reset to Stage 1 Diagnosis
  if (text.startsWith("how do i") || text.startsWith("what is") || text.includes("explain") || turnCount <= 1) {
    return "STAGE_1_DIAGNOSIS";
  }

  // If student provides numbers or attempts the first step
  if (/\d+/.test(text) && (currentStage === "STAGE_1_DIAGNOSIS" || currentStage === "STAGE_2_GUIDED_EXPLORATION")) {
    return "STAGE_3_CONCEPTUAL_BRIDGE";
  }

  // If in bridge and student confirms understanding
  if (currentStage === "STAGE_3_CONCEPTUAL_BRIDGE") {
    return "STAGE_4_INDEPENDENT_CALCULATION";
  }

  // If in calculation and student gives final answer
  if (currentStage === "STAGE_4_INDEPENDENT_CALCULATION") {
    return "STAGE_5_MASTERY_CONFIRMED";
  }

  // Default step progression based on turn count
  if (turnCount >= 5) return "STAGE_5_MASTERY_CONFIRMED";
  if (turnCount >= 3) return "STAGE_4_INDEPENDENT_CALCULATION";
  if (turnCount >= 2) return "STAGE_3_CONCEPTUAL_BRIDGE";
  return "STAGE_2_GUIDED_EXPLORATION";
}

export function getStageInstruction(stage: SocraticStage): string {
  switch (stage) {
    case "STAGE_1_DIAGNOSIS":
      return "Give the direct answer, then identify the information provided and any missing assumption.";
    case "STAGE_2_GUIDED_EXPLORATION":
      return "Give the direct answer and explain the relevant relationship in simple language.";
    case "STAGE_3_CONCEPTUAL_BRIDGE":
      return "Connect the answer to the relevant concept. Include a plain-text formula only when it is necessary and certainly correct; never invent one.";
    case "STAGE_4_INDEPENDENT_CALCULATION":
      return "Complete the calculation, show the essential steps, and verify the result.";
    case "STAGE_5_MASTERY_CONFIRMED":
      return "Current Goal: The student has solved or understood the concept. Provide warm praise, summarize the core lesson, and offer a quick challenge.";
  }
}
