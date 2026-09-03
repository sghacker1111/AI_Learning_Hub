export type ImageProviderId = "huggingface";
export type EducationalImageStyle = "illustration" | "realistic" | "diagram";

export interface EducationalImageRequest {
  prompt: string;
  grade: string;
  subject: string;
  topic?: string;
  style: EducationalImageStyle;
  width: number;
  height: number;
  seed?: number;
}

export interface EnrichedImagePrompt {
  prompt: string;
  negativePrompt: string;
}

export interface ImageGenerationResult {
  bytes: ArrayBuffer;
  contentType: "image/jpeg" | "image/png" | "image/webp";
  provider: ImageProviderId;
  model: string;
  latencyMs: number;
  cached: boolean;
  enrichedPrompt: string;
}

export interface ImageProviderConfiguration {
  provider: ImageProviderId;
  model: string | null;
  inferenceProvider: string;
  configured: boolean;
  tokenConfigured: boolean;
  endpointConfigured: boolean;
  promptEnhancementEnabled: boolean;
  promptModel: string;
  description: string;
}

export interface ImageProvider {
  readonly id: ImageProviderId;
  generate(request: EducationalImageRequest, signal?: AbortSignal): Promise<ImageGenerationResult>;
}

export type ImageGenerationErrorCode =
  | "UNCONFIGURED"
  | "UNSAFE_PROMPT"
  | "RATE_LIMITED"
  | "PROVIDER_ERROR"
  | "INVALID_OUTPUT"
  | "TIMEOUT";

export class ImageGenerationError extends Error {
  constructor(
    public readonly code: ImageGenerationErrorCode,
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = "ImageGenerationError";
  }
}
