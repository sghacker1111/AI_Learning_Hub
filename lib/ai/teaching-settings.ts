import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
export const teachingSettingsSchema = z.object({
  provider: z.enum(["qwen", "groq", "openrouter", "ollama"]).default("qwen"),
  model: z.string().trim().min(1).max(200), temperature: z.number().min(0).max(1).default(0.2),
  maxTokens: z.number().int().min(128).max(4096).default(1024),
  ragTopK: z.number().int().min(1).max(8).default(3), similarity: z.number().min(0).max(1).default(0.45),
  speechSpeed: z.number().min(0.6).max(1.2).default(0.92),
  silenceSeconds: z.number().min(0.3).max(3).default(0.8), lessonMinutes: z.number().int().min(5).max(120).default(45),
  sttProvider: z.enum(["groq", "whisper"]).default("groq"),
  ttsProvider: z.enum(["openai", "browser"]).default("browser"),
  ttsVoice: z.string().trim().min(1).max(100).default("alloy"),
  voiceEnabled: z.boolean().default(false),
}).strict();
export type TeachingConfiguration = z.infer<typeof teachingSettingsSchema>;
export function defaultTeachingSettings(): TeachingConfiguration {
  return teachingSettingsSchema.parse({ provider: process.env.AI_PROVIDER || "qwen", model: process.env.AI_MODEL || "Qwen/Qwen3.5-122B-A10B:fastest" });
}
export async function getTeachingSettings() {
  const row = await prisma.teachingSettings.findUnique({ where: { id: "platform" } });
  const parsed = teachingSettingsSchema.safeParse(row?.value);
  return parsed.success ? parsed.data : defaultTeachingSettings();
}
