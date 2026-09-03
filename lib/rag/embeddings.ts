import { InferenceClient } from "@huggingface/inference";

export function embeddingModel() { return process.env.EMBEDDING_MODEL || "intfloat/multilingual-e5-large"; }
export function validateEmbedding(value: unknown): number[] {
  if (!Array.isArray(value) || value.length < 32 || value.length > 4096 || value.some((number) => typeof number !== "number" || !Number.isFinite(number))) throw new Error("The embedding provider returned an invalid vector.");
  const norm = Math.sqrt(value.reduce((sum, number) => sum + number * number, 0));
  if (norm === 0) throw new Error("The embedding provider returned an empty vector.");
  return value.map((number) => number / norm);
}
export async function embedTexts(texts: string[], kind: "query" | "passage", signal?: AbortSignal) {
  const model = embeddingModel();
  const inputs = texts.map((text) => model.includes("e5") ? `${kind}: ${text}` : text);
  const timeout = signal ? AbortSignal.any([signal, AbortSignal.timeout(60000)]) : AbortSignal.timeout(60000);
  let vectors: unknown;
  if (process.env.EMBEDDING_BASE_URL) {
    const key = process.env.EMBEDDING_API_KEY;
    if (!key) throw new Error("EMBEDDING_API_KEY is required for this embedding endpoint.");
    const response = await fetch(`${process.env.EMBEDDING_BASE_URL.replace(/\/$/, "")}/embeddings`, { method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" }, body: JSON.stringify({ model, input: inputs }), signal: timeout });
    if (!response.ok) throw new Error(`Embedding service unavailable (${response.status}).`);
    const data = await response.json();
    vectors = data.data?.sort((a: {index: number}, b: {index: number}) => a.index - b.index).map((item: { embedding: unknown }) => item.embedding);
  } else {
    const key = process.env.EMBEDDING_API_KEY || process.env.HF_TOKEN;
    if (!key) throw new Error("HF_TOKEN or an embedding endpoint is required to index documents.");
    vectors = await new InferenceClient(key).featureExtraction({ model, inputs, normalize: true, truncate: true }, { signal: timeout, retry_on_error: false });
  }
  if (!Array.isArray(vectors) || vectors.length !== inputs.length) throw new Error("Embedding batch size does not match the document.");
  const result = vectors.map(validateEmbedding);
  if (result.some((vector) => vector.length !== result[0].length)) throw new Error("Embedding dimensions are inconsistent.");
  return result;
}
