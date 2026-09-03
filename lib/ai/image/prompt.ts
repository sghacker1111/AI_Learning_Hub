import { EducationalImageRequest, EnrichedImagePrompt, ImageGenerationError } from "./types";

const UNSAFE_IMAGE_PATTERN = /\b(porn|pornographic|explicit sex|sexual act|nude child|naked child|child abuse|self[- ]?harm|suicide method|graphic gore|dismemberment)\b/i;

function audienceForGrade(grade: string): string {
  const normalized = grade.toLowerCase();
  if (/nursery|lkg|ukg/.test(normalized)) return "early-childhood learner, large friendly shapes and very simple composition";

  const classNumber = Number(normalized.match(/\d{1,2}/)?.[0]);
  if (Number.isFinite(classNumber) && classNumber <= 3) return "young primary learner, simple and friendly visual language";
  if (Number.isFinite(classNumber) && classNumber <= 8) return "basic-level learner, clear educational detail without clutter";
  return "secondary-level learner, accurate and moderately detailed educational presentation";
}

export function assertSafeEducationalImagePrompt(prompt: string): void {
  if (UNSAFE_IMAGE_PATTERN.test(prompt)) {
    throw new ImageGenerationError(
      "UNSAFE_PROMPT",
      "This image request is outside the school-safe educational image policy.",
      400
    );
  }
}

export function enrichEducationalImagePrompt(request: EducationalImageRequest): EnrichedImagePrompt {
  assertSafeEducationalImagePrompt(request.prompt);

  const topic = request.topic ? ` Topic: ${request.topic}.` : "";
  const style = request.style === "realistic"
    ? "high-quality realistic educational scene"
    : request.style === "diagram"
      ? "clean textbook-style educational diagram"
      : "high-quality educational illustration";

  return {
    prompt: [
      `Create a ${style} for a ${audienceForGrade(request.grade)}.`,
      `Curriculum context: ${request.grade}, ${request.subject}.${topic}`,
      `Requested content: ${request.prompt}.`,
      "Make the central concept immediately understandable, scientifically and culturally respectful, school appropriate, balanced, and uncluttered.",
      "Use accurate relative scale where it matters. Include only labels explicitly requested by the user, and make any requested labels short and legible.",
    ].join(" "),
    negativePrompt: [
      "watermark",
      "logo",
      "signature",
      "random text",
      "gibberish labels",
      "misspelled labels",
      "decorative typography",
      "unsafe content",
      "graphic violence",
      "sexual content",
      "distorted anatomy",
      "cluttered composition",
    ].join(", "),
  };
}
