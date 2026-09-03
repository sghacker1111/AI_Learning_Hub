import { ChunkMetadata } from "./types";

/**
 * Formats locator metadata for a bundled demonstration chunk.
 */
export function generateCitationString(metadata: ChunkMetadata): string {
  return `[Demo reference metadata • ${metadata.curriculumEdition} • ${metadata.grade} ${metadata.subject} • ${metadata.unit}: ${metadata.chapter} (sample locator ${metadata.pageRange}, ${metadata.learningOutcomeCode})]`;
}

/**
 * Performs a limited formula-overlap check. This is not factual or curricular validation.
 */
export function checkGroundingAccuracy(
  generatedText: string,
  retrievedContextText: string
): { isGrounded: boolean; confidence: number } {
  const ctxLower = retrievedContextText.toLowerCase();

  // Check if formulas mentioned in generated text are grounded in context
  const mathMatches = generatedText.match(/\$([^\$]+)\$/g) || [];
  let groundedMathCount = 0;

  for (const formula of mathMatches) {
    const cleanFormula = formula.replace(/\$/g, "").trim();
    if (ctxLower.includes(cleanFormula.toLowerCase()) || cleanFormula.length < 4) {
      groundedMathCount++;
    }
  }

  const mathGroundingRatio = mathMatches.length > 0 ? groundedMathCount / mathMatches.length : 1.0;
  const isGrounded = mathGroundingRatio >= 0.7;

  return {
    isGrounded,
    confidence: Math.round(mathGroundingRatio * 100) / 100,
  };
}
