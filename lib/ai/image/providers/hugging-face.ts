import { InferenceClient, type InferenceProviderOrPolicy } from "@huggingface/inference";
import { enrichEducationalImagePrompt } from "../prompt";
import { enhanceEducationalImagePrompt, getImagePromptPlannerConfiguration } from "../prompt-enhancer";
import {
  EducationalImageRequest,
  ImageGenerationError,
  ImageGenerationResult,
  ImageProvider,
  ImageProviderConfiguration,
} from "../types";

const ALLOWED_CONTENT_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const ALLOWED_INFERENCE_PROVIDERS = new Set<InferenceProviderOrPolicy>([
  "auto",
  "baseten",
  "deepinfra",
  "fal-ai",
  "hf-inference",
  "nscale",
  "novita",
  "replicate",
  "together",
  "wavespeed",
]);

function getInferenceProvider(): InferenceProviderOrPolicy {
  const configured = process.env.AI_IMAGE_INFERENCE_PROVIDER || "auto";
  return ALLOWED_INFERENCE_PROVIDERS.has(configured as InferenceProviderOrPolicy)
    ? configured as InferenceProviderOrPolicy
    : "auto";
}

export function getHuggingFaceImageConfiguration(): ImageProviderConfiguration {
  const model = process.env.AI_IMAGE_MODEL?.trim() || null;
  const tokenConfigured = Boolean(process.env.HF_TOKEN?.trim());
  const endpointConfigured = Boolean(process.env.AI_IMAGE_ENDPOINT?.trim());
  const promptPlanner = getImagePromptPlannerConfiguration();

  return {
    provider: "huggingface",
    model,
    inferenceProvider: getInferenceProvider(),
    configured: Boolean(model && (tokenConfigured || endpointConfigured)),
    tokenConfigured,
    endpointConfigured,
    promptEnhancementEnabled: promptPlanner.enabled,
    promptModel: promptPlanner.model,
    description: model
      ? tokenConfigured || endpointConfigured
        ? `Hugging Face image routing is configured for ${model}. ${promptPlanner.enabled ? `${promptPlanner.model} refines each educational prompt locally before generation.` : "Local prompt refinement is disabled."}`
        : `${model} is selected, but HF_TOKEN is still required for hosted inference.`
      : "Set AI_IMAGE_MODEL and HF_TOKEN, or provide a private AI_IMAGE_ENDPOINT.",
  };
}

function getFiniteNumber(value: string | undefined, fallback: number, minimum: number, maximum: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.min(maximum, Math.max(minimum, parsed)) : fallback;
}

function mapProviderError(error: unknown): ImageGenerationError {
  if (error instanceof ImageGenerationError) return error;
  if (error instanceof DOMException && error.name === "AbortError") {
    return new ImageGenerationError("TIMEOUT", "Image generation timed out. Please try a smaller image.", 504);
  }

  const message = error instanceof Error ? error.message : String(error);
  if (/quota|credit|payment|required|402/i.test(message)) {
    return new ImageGenerationError(
      "PROVIDER_ERROR",
      "The Hugging Face inference credit or provider quota is unavailable. The free educational visual tool still works.",
      503
    );
  }
  if (/401|403|authorization|token|credential|gated/i.test(message)) {
    return new ImageGenerationError(
      "UNCONFIGURED",
      "Hugging Face authorization failed. Check HF_TOKEN and accept any model access conditions on the model page.",
      503
    );
  }

  return new ImageGenerationError(
    "PROVIDER_ERROR",
    "Hugging Face could not generate the image. Try again or use Show Visual for a free diagram.",
    502
  );
}

export class HuggingFaceImageProvider implements ImageProvider {
  readonly id = "huggingface" as const;

  async generate(request: EducationalImageRequest, signal?: AbortSignal): Promise<ImageGenerationResult> {
    const configuration = getHuggingFaceImageConfiguration();
    if (!configuration.configured || !configuration.model) {
      throw new ImageGenerationError(
        "UNCONFIGURED",
        configuration.description,
        503
      );
    }

    const startedAt = Date.now();
    const basePrompt = enrichEducationalImagePrompt(request);
    const enriched = await enhanceEducationalImagePrompt(request, basePrompt, signal);
    const token = process.env.HF_TOKEN?.trim();
    const endpointUrl = process.env.AI_IMAGE_ENDPOINT?.trim();
    const client = new InferenceClient(token, endpointUrl ? { endpointUrl } : undefined);
    const isSchnell = /schnell/i.test(configuration.model);
    const isQwenImage = /qwen[-/]image/i.test(configuration.model);
    const defaultSteps = isSchnell ? 4 : isQwenImage ? 40 : 28;
    const defaultGuidance = isSchnell ? 0 : isQwenImage ? 4 : 3.5;
    const inferenceSteps = Math.round(getFiniteNumber(process.env.AI_IMAGE_STEPS, defaultSteps, 1, 60));
    const guidanceScale = getFiniteNumber(process.env.AI_IMAGE_GUIDANCE_SCALE, defaultGuidance, 0, 20);

    try {
      const image = await client.textToImage(
        {
          model: configuration.model,
          provider: getInferenceProvider(),
          inputs: enriched.prompt,
          parameters: {
            width: request.width,
            height: request.height,
            seed: request.seed,
            negative_prompt: enriched.negativePrompt,
            num_inference_steps: inferenceSteps,
            guidance_scale: guidanceScale,
          },
        },
        { outputType: "blob", signal, retry_on_error: false }
      );

      const normalizedContentType = image.type.split(";")[0].toLowerCase();
      if (!ALLOWED_CONTENT_TYPES.has(normalizedContentType) || image.size === 0 || image.size > 8 * 1024 * 1024) {
        throw new ImageGenerationError(
          "INVALID_OUTPUT",
          "The image provider returned an unsupported or oversized file.",
          502
        );
      }

      return {
        bytes: await image.arrayBuffer(),
        contentType: normalizedContentType as ImageGenerationResult["contentType"],
        provider: "huggingface",
        model: configuration.model,
        latencyMs: Date.now() - startedAt,
        cached: false,
        enrichedPrompt: enriched.prompt,
      };
    } catch (error) {
      throw mapProviderError(error);
    }
  }
}
