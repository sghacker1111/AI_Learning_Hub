import { MathStepVerification } from "./types";

export function verifyMathStep(problemContext: string, stepGiven: string): MathStepVerification {
  const cleanStep = stepGiven.toLowerCase().trim();
  const context = problemContext.toLowerCase();

  // 1. Sets Cardinality Errors
  if (context.includes("set") || context.includes("n(a")) {
    if (cleanStep.includes("+ n(a") && cleanStep.includes("+ n(b") && cleanStep.includes("+ n(a") && cleanStep.includes("cap")) {
      return {
        problemContext,
        stepGiven,
        isValid: false,
        isVerified: true,
        feedback: "Sign Error in Set Union Formula",
        pinpointedError: "You wrote $+ n(A \\cap B)$, but overlapping elements are counted twice in $n(A) + n(B)$, so you MUST SUBTRACT the intersection.",
        suggestedNextStep: "$n(A \\cup B) = n(A) + n(B) - n(A \\cap B)$",
        latexPreview: "n(A \\cup B) = n(A) + n(B) - n(A \\cap B)",
      };
    }
  }

  // 2. VAT & Arithmetic Errors
  if (context.includes("vat") || context.includes("discount")) {
    if (cleanStep.includes("vat on mp") || cleanStep.includes("mp * 0.13")) {
      return {
        problemContext,
        stepGiven,
        isValid: false,
        isVerified: true,
        feedback: "VAT Order Error",
        pinpointedError: "In Nepal taxation rules, 13% VAT is calculated on the SELLING PRICE AFTER DISCOUNT (SP), never on the original Marked Price (MP).",
        suggestedNextStep: "First compute $\\text{SP} = \\text{MP} - \\text{Discount}$, then calculate $\\text{VAT} = \\text{SP} \\times 0.13$.",
        latexPreview: "\\text{VAT} = (\\text{MP} - \\text{Discount}) \\times 0.13",
      };
    }
  }

  // 3. Physics Upthrust Errors
  if (context.includes("upthrust") || context.includes("pressure")) {
    if (cleanStep.includes("u = v/d") || cleanStep.includes("u = m/v")) {
      return {
        problemContext,
        stepGiven,
        isValid: false,
        isVerified: true,
        feedback: "Formula Error in Archimedes' Principle",
        pinpointedError: "Upthrust is the weight of displaced fluid, which is calculated as product $U = V \\times d \\times g$, not division.",
        suggestedNextStep: "$U = V \\cdot d \\cdot g$",
        latexPreview: "U = V \\cdot d \\cdot g",
      };
    }
  }

  // Unknown expressions must not be reported as mathematically proven.
  return {
    problemContext,
    stepGiven,
    isValid: false,
    isVerified: false,
    feedback: "This rule-based verifier could not prove or disprove the submitted step.",
    suggestedNextStep: "Check the formula and arithmetic manually, or ask the tutor for a guided review.",
    latexPreview: stepGiven,
  };
}
