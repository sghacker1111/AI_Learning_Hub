import { createHash } from "node:crypto";
import { EducationalImageRequest, ImageGenerationResult } from "./types";

interface CacheEntry {
  result: ImageGenerationResult;
  expiresAt: number;
  size: number;
}

const MAX_CACHE_BYTES = 24 * 1024 * 1024;
const CACHE_TTL_MS = 30 * 60 * 1_000;
const cache = new Map<string, CacheEntry>();

export function createImageCacheKey(model: string, request: EducationalImageRequest): string {
  return createHash("sha256")
    .update(JSON.stringify({ model, ...request }))
    .digest("hex");
}

export function getCachedImage(key: string, now = Date.now()): ImageGenerationResult | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (entry.expiresAt <= now) {
    cache.delete(key);
    return null;
  }

  cache.delete(key);
  cache.set(key, entry);
  return { ...entry.result, cached: true };
}

export function setCachedImage(key: string, result: ImageGenerationResult, now = Date.now()): void {
  const size = result.bytes.byteLength;
  if (size > MAX_CACHE_BYTES / 2) return;

  cache.set(key, { result: { ...result, cached: false }, expiresAt: now + CACHE_TTL_MS, size });

  let totalBytes = 0;
  for (const entry of cache.values()) totalBytes += entry.size;
  while (totalBytes > MAX_CACHE_BYTES && cache.size > 1) {
    const oldestKey = cache.keys().next().value as string | undefined;
    if (!oldestKey) break;
    const oldest = cache.get(oldestKey);
    cache.delete(oldestKey);
    totalBytes -= oldest?.size || 0;
  }
}
