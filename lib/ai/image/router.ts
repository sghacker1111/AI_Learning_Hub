import { createImageCacheKey, getCachedImage, setCachedImage } from "./cache";
import { getImagePromptPlannerConfiguration } from "./prompt-enhancer";
import { HuggingFaceImageProvider, getHuggingFaceImageConfiguration } from "./providers/hugging-face";
import { EducationalImageRequest, ImageGenerationError, ImageGenerationResult, ImageProviderConfiguration } from "./types";

export function getImageProviderConfiguration(): ImageProviderConfiguration {
  const provider = process.env.AI_IMAGE_PROVIDER?.trim() || "huggingface";
  if (provider !== "huggingface") {
    const promptPlanner = getImagePromptPlannerConfiguration();
    return {
      provider: "huggingface",
      model: process.env.AI_IMAGE_MODEL?.trim() || null,
      inferenceProvider: process.env.AI_IMAGE_INFERENCE_PROVIDER?.trim() || "auto",
      configured: false,
      tokenConfigured: Boolean(process.env.HF_TOKEN?.trim()),
      endpointConfigured: Boolean(process.env.AI_IMAGE_ENDPOINT?.trim()),
      promptEnhancementEnabled: promptPlanner.enabled,
      promptModel: promptPlanner.model,
      description: `Unsupported image provider '${provider}'. Use AI_IMAGE_PROVIDER=huggingface.`,
    };
  }
  return getHuggingFaceImageConfiguration();
}

export async function generateEducationalImage(
  request: EducationalImageRequest,
  signal?: AbortSignal
): Promise<ImageGenerationResult> {
  const configuration = getImageProviderConfiguration();
  if (!configuration.model) {
    throw new ImageGenerationError("UNCONFIGURED", configuration.description, 503);
  }

  const cacheKey = createImageCacheKey(configuration.model, request);
  const cached = getCachedImage(cacheKey);
  if (cached) return cached;

  const provider = new HuggingFaceImageProvider();
  const result = await provider.generate(request, signal);
  setCachedImage(cacheKey, result);
  return result;
}
