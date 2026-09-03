import assert from "node:assert/strict";
import test from "node:test";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { voiceConfiguration, workerConfigurationChecks } from "../lib/voice/configuration";
import { checkVoiceServices } from "../lib/voice/service-check";
import { teachingSettingsSchema } from "../lib/ai/teaching-settings";

const settings = teachingSettingsSchema.parse({ model: "fixture-model", voiceEnabled: true, ttsProvider: "browser", sttProvider: "groq" });
const env = { NODE_ENV: "production", LIVEKIT_URL: "wss://voice.fixture.test", LIVEKIT_API_KEY: "fixture-key", LIVEKIT_API_SECRET: "fixture-livekit-secret", VOICE_AGENT_URL: "https://worker.fixture.test", VOICE_AGENT_SECRET: "fixture-shared-voice-secret-long-enough" };

test("voice setup distinguishes enabled, configured and actually connected", () => {
  assert.equal(voiceConfiguration(settings, {}).configured, false);
  assert.equal(voiceConfiguration(settings, env).configured, true);
  assert.equal(voiceConfiguration({ voiceEnabled: false }, env).enabled, false);
  assert.doesNotMatch(JSON.stringify(voiceConfiguration(settings, env)), /fixture/);
});

test("voice configuration rejects unsafe URLs, short secrets and pasted placeholders", () => {
  for (const url of ["https://voice.fixture.test", "wss://user:secret@voice.fixture.test", "ws://localhost:7880", "wss://voice.fixture.test?token=secret", "not-a-url"]) assert.equal(voiceConfiguration(settings, { ...env, LIVEKIT_URL: url }).configured, false);
  assert.equal(voiceConfiguration(settings, { ...env, VOICE_AGENT_URL: "http://worker.fixture.test" }).configured, false);
  assert.equal(voiceConfiguration(settings, { ...env, VOICE_AGENT_SECRET: "too-short" }).configured, false);
  assert.equal(voiceConfiguration(settings, { ...env, LIVEKIT_API_KEY: "YOUR_KEY" }).configured, false);
  assert.equal(voiceConfiguration(settings, { ...env, NODE_ENV: "development", LIVEKIT_URL: "ws://localhost:7880", VOICE_AGENT_URL: "http://localhost:7860" }).configured, true);
});

test("worker checks use the selected speech provider, not unrelated web-server keys", () => {
  const health = { health_version: 1, livekit_configured: true, callback_configured: true, stt_configured: true, tts_configured: false };
  assert.ok(workerConfigurationChecks(health, settings).every((check) => check.ok));
  assert.equal(workerConfigurationChecks(health, { ...settings, ttsProvider: "openai" }).find((check) => check.id === "workerTts")?.ok, false);
  assert.equal(workerConfigurationChecks(health, { ...settings, sttProvider: "whisper" }).find((check) => check.id === "workerStt")?.ok, false);
  assert.ok(workerConfigurationChecks(null, settings).some((check) => !check.ok));
  assert.ok(workerConfigurationChecks({ livekit_configured: "true" }, settings).some((check) => !check.ok));
});

test("incomplete voice settings never trigger an outbound service probe", async () => {
  const result = await checkVoiceServices(settings, {}, async () => { throw new Error("Outbound request must not run"); });
  assert.equal(result.ok, false); assert.equal(result.checks.length, 5);
});

test("read-only voice checks authenticate, redact errors, detect worker failures and never start sessions", async () => {
  let workerStatus = 200, malformed = false;
  const paths: string[] = [];
  const server = createServer((request, response) => {
    paths.push(request.url!);
    assert.ok(request.headers.authorization?.startsWith("Bearer "));
    if (request.url === "/health") {
      response.writeHead(workerStatus, { "Content-Type": "application/json" });
      response.end(malformed ? "private-error-fixture" : JSON.stringify({ health_version: 1, livekit_configured: true, callback_configured: true, stt_configured: true }));
    } else { response.setHeader("Content-Type", "application/json"); response.end(JSON.stringify({ rooms: [] })); }
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const port = (server.address() as { port: number }).port;
  const fixtureEnv = { ...env, NODE_ENV: "development", LIVEKIT_URL: `ws://127.0.0.1:${port}`, VOICE_AGENT_URL: `http://127.0.0.1:${port}` };
  try {
    let result = await checkVoiceServices(settings, fixtureEnv);
    assert.equal(result.ok, true); assert.ok(result.checks.some((check) => check.id === "livekitApi" && check.ok));
    workerStatus = 401; result = await checkVoiceServices(settings, fixtureEnv); assert.equal(result.ok, false);
    assert.match(result.checks.find((check) => check.id === "workerApi")!.hint, /must match/);
    workerStatus = 200; malformed = true; result = await checkVoiceServices(settings, fixtureEnv); assert.equal(result.ok, false);
    assert.doesNotMatch(JSON.stringify(result), /fixture|private-error|Bearer/);
    assert.ok(paths.every((path) => path === "/health" || path === "/twirp/livekit.RoomService/ListRooms"));
  } finally { server.closeAllConnections(); await new Promise<void>((resolve) => server.close(() => resolve())); }
});

test("public environment template has only empty bootstrap and voice credentials without duplicates", async () => {
  const source = await readFile(".env.example", "utf8");
  for (const key of ["BOOTSTRAP_SUPERADMIN_EMAIL", "BOOTSTRAP_SUPERADMIN_PASSWORD", "BOOTSTRAP_SUPERADMIN_NAME", "LIVEKIT_API_KEY", "LIVEKIT_API_SECRET", "VOICE_AGENT_SECRET", "GROQ_API_KEY", "TTS_API_KEY"]) {
    const values = source.split(/\r?\n/).filter((line) => line.startsWith(`${key}=`));
    assert.equal(values.length, 1, `${key} must appear exactly once`);
    assert.equal(values[0], `${key}=""`, `${key} must be an empty placeholder`);
  }
});
