import { cleanAIOutput } from "../clean-output";
import { callQwen } from "../providers/qwen";
import { assertSafeEducationalImagePrompt } from "./prompt";
import { EducationalImageRequest, EnrichedImagePrompt } from "./types";

const MAX_ENHANCED_PROMPT_LENGTH = 1_800;

export interface ImagePromptPlannerConfiguration {
  enabled: boolean;
  model: string;
}

export function getImagePromptPlannerConfiguration(): ImagePromptPlannerConfiguration {
  return {
    enabled: process.env.AI_IMAGE_PROMPT_ENHANCEMENT !== "false",
    model: process.env.AI_IMAGE_PROMPT_MODEL?.trim()
      || process.env.AI_MODEL?.trim()
      || "Qwen/Qwen3.5-122B-A10B:fastest",
  };
}

export function sanitizeEnhancedImagePrompt(value: string): string {
  return cleanAIOutput(value)
    .replace(/<think>[\s\S]*?(?:<\/think>|$)/gi, "")
    .replace(/^\s*(?:prompt|final prompt)\s*:\s*/i, "")
    .replace(/^['\"]|['\"]$/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_ENHANCED_PROMPT_LENGTH);
}

export async function enhanceEducationalImagePrompt(
  request: EducationalImageRequest,
  basePrompt: EnrichedImagePrompt,
  _signal?: AbortSignal
): Promise<EnrichedImagePrompt> {
  void _signal;
  const planner = getImagePromptPlannerConfiguration();
  if (!planner.enabled) return basePrompt;

  try {
    const result = await callQwen(
      {
        messages: [
          {
            role: "system",
            content: [
              "You are an educational image prompt planner for a school learning platform.",
              "Rewrite the supplied base prompt into one precise text-to-image prompt of at most 180 words.",
              "Preserve every requested fact and do not invent scientific, historical, mathematical, or cultural claims.",
              "Specify composition, relative position, scale, lighting, color, and visual hierarchy only when they improve clarity.",
              "For diagrams, favor clean textbook geometry and exact requested labels. Do not add unrequested text.",
              "Return only the final plain-text image prompt. Do not use headings, Markdown, quotation marks, or explanations.",
            ].join(" "),
          },
          {
            role: "user",
            content: [
              `Grade: ${request.grade}`,
              `Subject: ${request.subject}`,
              `Topic: ${request.topic || "Not specified"}`,
              `Style: ${request.style}`,
              `Student request: ${request.prompt}`,
              `Validated base prompt: ${basePrompt.prompt}`,
            ].join("\n"),
          },
        ],
        temperature: 0.1,
        maxTokens: 300,
      },
      {
        model: planner.model,
      }
    );

    const prompt = sanitizeEnhancedImagePrompt(result.text);
    if (prompt.length < 40) return basePrompt;
    assertSafeEducationalImagePrompt(prompt);
    return { ...basePrompt, prompt };
  } catch {
    // Image generation must continue even if the optional hosted prompt planner
    // is unavailable. The deterministic prompt remains safe and complete.
    return basePrompt;
  }
}
