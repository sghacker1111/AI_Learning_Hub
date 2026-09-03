import { HintResponse, HintTier } from "./types";

export function generateProgressiveHint(topic: string, currentTier: HintTier = 1): HintResponse {
  const isSets = topic.toLowerCase().includes("set") || topic.toLowerCase().includes("cardinality");
  const isPressure = topic.toLowerCase().includes("pressure") || topic.toLowerCase().includes("archimedes") || topic.toLowerCase().includes("upthrust");

  if (isSets) {
    if (currentTier === 1) {
      return {
        tier: 1,
        hintText: "💡 **Clue 1:** Think about students who like both subjects. If you add all students who like Math and all who like Science, have you counted anyone twice?",
        nextTierAvailable: true,
      };
    }
    if (currentTier === 2) {
      return {
        tier: 2,
        hintText: "📐 **Formula Hint:** For two finite sets, find the union by subtracting the overlap counted twice:",
        latexSnippet: "n(A \\cup B) = n(A) + n(B) - n(A \\cap B)",
        nextTierAvailable: true,
      };
    }
    return {
      tier: 3,
      hintText: "🔢 **Step 1 Helper:** First substitute the given values into the formula to find the total union $n(A \\cup B)$, then subtract that from the universal total $n(U)$ to find the complement $n(A \\cup B)'$.",
      latexSnippet: "n(A \\cup B)' = n(U) - n(A \\cup B)",
      nextTierAvailable: false,
    };
  }

  if (isPressure) {
    if (currentTier === 1) {
      return {
        tier: 1,
        hintText: "💡 **Clue 1:** When an object enters water, it pushes some volume of water away. What force does that displaced water exert upwards?",
        nextTierAvailable: true,
      };
    }
    if (currentTier === 2) {
      return {
        tier: 2,
        hintText: "📐 **Formula Hint:** Upthrust ($U$) is calculated using the volume displaced ($V$), liquid density ($d$), and gravity ($g$):",
        latexSnippet: "U = V \\cdot d \\cdot g",
        nextTierAvailable: true,
      };
    }
    return {
      tier: 3,
      hintText: "🔢 **Step 1 Helper:** Apparent weight in liquid equals the true weight in air minus the upward buoyant force (Upthrust).",
      latexSnippet: "\\text{Apparent Weight} = W_{\\text{air}} - U",
      nextTierAvailable: false,
    };
  }

  // General fallback hints
  if (currentTier === 1) {
    return {
      tier: 1,
      hintText: "💡 **Clue 1:** Identify the known quantities and unknown goal from the problem statement.",
      nextTierAvailable: true,
    };
  }
  if (currentTier === 2) {
    return {
      tier: 2,
      hintText: "📐 **Formula Hint:** Check the formula connecting the given variables in your verified course material.",
      nextTierAvailable: true,
    };
  }
  return {
    tier: 3,
    hintText: "🔢 **Step 1 Helper:** Substitute known values into the equation and solve for the primary variable.",
    nextTierAvailable: false,
  };
}
