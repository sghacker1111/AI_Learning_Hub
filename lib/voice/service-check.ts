import { RoomServiceClient } from "livekit-server-sdk";
import type { TeachingConfiguration } from "../ai/teaching-settings";
import { voiceConfiguration, workerConfigurationChecks, type VoiceEnvironment, type VoiceCheck } from "./configuration";

export type VoiceServiceCheck = { ok: boolean; checkedAt: string; checks: VoiceCheck[]; note: string };

/** Read-only checks: no room creation, microphone access or speech/LLM generation. */
export async function checkVoiceServices(settings: TeachingConfiguration, env: VoiceEnvironment = process.env, fetcher: typeof fetch = fetch): Promise<VoiceServiceCheck> {
  const config = voiceConfiguration(settings, env), checks = [...config.checks];
  if (config.configured) {
    const [livekit, worker] = await Promise.all([
      (async (): Promise<VoiceCheck[]> => {
        try {
          const host = env.LIVEKIT_URL!.replace(/^ws/, "http");
          await new RoomServiceClient(host, env.LIVEKIT_API_KEY!, env.LIVEKIT_API_SECRET!, { requestTimeout: 5, failover: false }).listRooms();
          return [{ id: "livekitApi", label: "LiveKit API authentication", ok: true, hint: "Read-only API check passed; microphone transport still needs a lesson test." }];
        } catch { return [{ id: "livekitApi", label: "LiveKit API authentication", ok: false, hint: "Check the project URL, matching API key/secret, network access and LiveKit service status." }]; }
      })(),
      (async (): Promise<VoiceCheck[]> => {
        try {
          const response = await fetcher(`${env.VOICE_AGENT_URL!.replace(/\/$/, "")}/health`, { headers: { Authorization: `Bearer ${env.VOICE_AGENT_SECRET}` }, signal: AbortSignal.timeout(5000), redirect: "error", cache: "no-store" });
          if (!response.ok) return [{ id: "workerApi", label: "Voice worker authentication", ok: false, hint: response.status === 401 || response.status === 403 ? "VOICE_AGENT_SECRET must match on both services." : "Check voice-worker deployment and its health endpoint." }];
          const checks = workerConfigurationChecks(await response.json(), settings);
          return [{ id: "workerApi", label: "Voice worker reachable", ok: true, hint: "Authenticated health request passed." }, ...checks];
        } catch { return [{ id: "workerApi", label: "Voice worker reachable", ok: false, hint: "Start/deploy the voice worker and check VOICE_AGENT_URL, HTTPS and network access." }]; }
      })(),
    ]);
    checks.push(...livekit, ...worker);
  }
  return { ok: checks.every((check) => check.ok), checkedAt: new Date().toISOString(), checks, note: "No room, audio or speech/AI generation was created. Speech API credentials and real microphone/audio quality are not verified by this check. Restart both services after changing environment variables." };
}
