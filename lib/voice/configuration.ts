import type { TeachingConfiguration } from "../ai/teaching-settings";

export type VoiceEnvironment = Record<string, string | undefined>;
export type VoiceCheck = { id: string; label: string; ok: boolean; hint: string };
export type VoiceConfiguration = { enabled: boolean; configured: boolean; checks: VoiceCheck[] };

function configured(value: string | undefined, min = 1) {
  return !!value && value === value.trim() && value.length >= min && !/^(?:your[_-]|replace[_-]|change[_-]|<)/i.test(value);
}
function validUrl(value: string | undefined, protocols: string[], production: boolean) {
  if (!configured(value)) return false;
  try {
    const url = new URL(value!);
    return protocols.includes(url.protocol) && !url.username && !url.password && !url.search && !url.hash
      && (!production || ["wss:", "https:"].includes(url.protocol));
  } catch { return false; }
}

/** Web-server settings only. Speech keys belong to the separately deployed worker. */
export function voiceConfiguration(settings: Pick<TeachingConfiguration, "voiceEnabled">, env: VoiceEnvironment = process.env): VoiceConfiguration {
  const production = env.NODE_ENV === "production";
  const checks: VoiceCheck[] = [
    { id: "LIVEKIT_URL", label: "LiveKit project URL", ok: validUrl(env.LIVEKIT_URL, ["wss:", "ws:"], production), hint: "Set LIVEKIT_URL to your LiveKit project's wss:// URL." },
    { id: "LIVEKIT_API_KEY", label: "LiveKit API key", ok: configured(env.LIVEKIT_API_KEY), hint: "Set LIVEKIT_API_KEY from the same LiveKit project." },
    { id: "LIVEKIT_API_SECRET", label: "LiveKit API secret", ok: configured(env.LIVEKIT_API_SECRET), hint: "Set LIVEKIT_API_SECRET from the same LiveKit project." },
    { id: "VOICE_AGENT_URL", label: "Voice worker URL", ok: validUrl(env.VOICE_AGENT_URL, ["https:", "http:"], production), hint: "Set VOICE_AGENT_URL to the running Python voice service; use HTTPS in production." },
    { id: "VOICE_AGENT_SECRET", label: "Shared worker secret", ok: configured(env.VOICE_AGENT_SECRET, 32), hint: "Set the same random VOICE_AGENT_SECRET (32+ characters) on the web server and voice worker." },
  ];
  return { enabled: settings.voiceEnabled, configured: checks.every((check) => check.ok), checks };
}

export function workerConfigurationChecks(payload: unknown, settings: Pick<TeachingConfiguration, "sttProvider" | "ttsProvider">): VoiceCheck[] {
  const data = payload && typeof payload === "object" ? payload as Record<string, unknown> : {};
  return [
    { id: "workerVersion", label: "Voice worker health contract", ok: data.health_version === 1, hint: "Deploy the current services/voice-agent code and restart it." },
    { id: "workerLivekit", label: "Worker LiveKit URL", ok: data.livekit_configured === true, hint: "Set the worker LIVEKIT_URL to the same project as the web server." },
    { id: "workerCallback", label: "Worker callback URL", ok: data.callback_configured === true, hint: "Set GURU_WEB_URL on the worker to the reachable Guru website URL." },
    { id: "workerStt", label: "Worker speech recognition", ok: settings.sttProvider === "groq" ? data.stt_configured === true : data.whisper_configured === true, hint: settings.sttProvider === "groq" ? "Set GROQ_API_KEY on the voice worker for hosted Whisper; no local model needed." : "Install Faster-Whisper on the worker, or select hosted Groq recognition." },
    { id: "workerTts", label: "Worker teacher speech", ok: settings.ttsProvider === "browser" || data.tts_configured === true, hint: "Set TTS_API_KEY, TTS_BASE_URL and TTS_MODEL on the worker, or select Browser speech only." },
  ];
}
