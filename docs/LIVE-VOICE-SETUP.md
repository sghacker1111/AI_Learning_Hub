# Live voice setup

The existing LiveKit/Pipecat service connects microphone audio to hosted Groq Whisper and your existing Qwen/approved-content tutor. It is separate from the Next.js server. This setup does not require downloading local AI models. A hosting runtime is still needed for the Python service.

Browser microphone dictation, typed questions and browser speech are separate fallbacks; enabling LiveKit in Admin cannot create provider credentials or start a worker.

## 1. Private web-server environment

In the project root `.env` (or the web host's secret manager), set:

```env
LIVEKIT_URL="wss://YOUR_PROJECT.livekit.cloud"
LIVEKIT_API_KEY="YOUR_PROJECT_API_KEY"
LIVEKIT_API_SECRET="YOUR_PROJECT_API_SECRET"
VOICE_AGENT_URL="https://YOUR_VOICE_WORKER_HOST"
VOICE_AGENT_SECRET="YOUR_RANDOM_SHARED_SECRET_AT_LEAST_32_CHARACTERS"
```

Get the three LiveKit values from the same project in [LiveKit Cloud](https://cloud.livekit.io/). See the [official connection setup](https://docs.livekit.io/agents/start/voice-ai/). Use server-side environment variables, never `NEXT_PUBLIC_*` for keys/secrets. Do not paste real keys into chat, source files or `.env.example`. Production URLs require TLS.

Generate a cryptographically random shared secret in your password manager, and save the identical value privately on both services. Credentials containing `$` need `\$` escaping in Next.js `.env` files. Do not escape `$` when setting raw host environment variables.

## 2. Private voice-worker environment

Deploy `services/voice-agent` with its included Dockerfile, or use the already-installed Python virtual environment on this workstation. The worker needs:

```env
LIVEKIT_URL="wss://YOUR_PROJECT.livekit.cloud"
VOICE_AGENT_SECRET="SAME_SHARED_SECRET_AS_WEB_SERVER"
GURU_WEB_URL="https://YOUR_GURU_WEBSITE"
GROQ_API_KEY="YOUR_GROQ_KEY"
```

Get a Groq key from [Groq Console](https://console.groq.com/keys); the existing worker uses its [hosted speech-to-text API](https://console.groq.com/docs/speech-to-text). Provider quotas/billing apply. This is API-based recognition; do not select self-hosted Faster-Whisper if you want no model download.

The worker does not need a database URL, LiveKit API secret or Qwen key. The website issues narrowly scoped room/callback tokens and keeps using the current Qwen configuration.

For local development only, use `VOICE_AGENT_URL=http://127.0.0.1:7860` on the web server and `GURU_WEB_URL=http://127.0.0.1:3000` on the worker. These URLs are not suitable for separate production hosts. Set worker variables privately in its process environment before launching; Uvicorn does not automatically read the web app's `.env`.

From `D:\A WebSite\AI Learning Hub`:

```powershell
& '.\services\voice-agent\.venv\Scripts\python.exe' -m uvicorn app:app --app-dir services/voice-agent --host 127.0.0.1 --port 7860 --workers 1 --no-access-log
```

For production, use the worker Dockerfile behind HTTPS, with one Uvicorn worker per instance. The current session registry is in-process: multi-instance deployments need sticky routing or a shared session coordinator. Allow the worker outbound access to the Guru website, LiveKit and selected speech providers. Configure the proxy for long-lived connections. Do not run the project's local-Postgres Docker Compose configuration to set up Neon.

## 3. Select speech output

In Admin → Login Users → AI teacher & voice settings:

- Speech recognition: Hosted Whisper (Groq API).
- Teacher audio: Browser speech only to avoid another speech-output API key. English/Nepali voices depend on the learner's browser and installed system voices.
- Alternatively select OpenAI-compatible speech API and set `TTS_API_KEY`, `TTS_BASE_URL` (including the provider's API prefix) and `TTS_MODEL` on the worker. Set a voice supported by that provider; verify Nepali support before selecting it for Nepali lessons.
- Enable LiveKit voice and save settings. Restart both services after changing environment variables.

## 4. Verify without pretending configuration is a live conversation

Click **Check voice services**. This performs an authenticated, read-only LiveKit API request and an authenticated worker health request. It does not start a room, send speech or consume LLM/STT/TTS inference. It checks worker configuration, not speech-provider key validity or quality.

Then use a real school Student/Teacher account with an active AI Tutor bundle and a saved, active lesson. Grant microphone permission on HTTPS (or localhost), connect Live voice, ask a question and confirm the transcript, saved answer, audible response and interruption. Super Admin is a global management role and does not impersonate a student for a live lesson.

An error or missing key must remain visible; browser microphone and text remain usable. End-to-end voice cannot be verified until actual LiveKit/Groq credentials and a running worker are supplied.
