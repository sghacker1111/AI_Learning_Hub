# Voice and administrator update — 2026-09-03

## Database account result

The explicitly requested real account was created in the connected Neon database as an ACTIVE, global SUPER_ADMIN (schoolId null). The operation used the existing password validator, hashing helper and role model. Normal database authentication was verified before and after commit; the existing `/api/auth/login` endpoint and `/api/auth/me` session lookup both passed against the running application.

The password was supplied through a hidden terminal prompt and a temporary process environment, not saved in source. The temporary create-only maintenance script was removed. An audit entry records the owner-authorized operation. The original one-time bootstrap script and its existing-admin refusal remain intact.

Five previous accounts were left unchanged. Permanent deletion is pending the owner's choice between archival (preserve linked records) and deletion (potential loss of linked records). No seed, reset, schema change, destructive migration or existing-user update was performed.

## Voice result and limits

Admin → Login Users → AI teacher & voice settings now has a setup checklist and an authenticated, read-only service check. It distinguishes configuration presence from real connectivity. Speech-provider configuration is checked on the worker, not incorrectly inferred from web-server keys. Missing TTS model/base URL is no longer reported as configured just because a key exists.

Voice-service network failures no longer masquerade as database errors. Browser connection cancellation has additional stale-attempt guards and speech-synthesis feature detection. Demo authentication now respects its explicit opt-in setting, including existing dev sessions; the running server reports demo authentication disabled. Login pages start with empty credential fields.

LiveKit and voice-service credentials are still absent, and no production worker was started. Real microphone transport, voice quality, speech-provider authentication and English/Nepali recognition/speech remain unverified. Follow [the setup guide](LIVE-VOICE-SETUP.md); no local language-model download is required for the hosted Groq path.

## Executed verification

- `npm run verify`: passed ESLint, TypeScript, 52 tests, Prisma validation and production build (164 routes).
- `npm run test:integration`: passed against disposable PostgreSQL/PGlite and fixture providers, including normal bootstrap login, voice-check permissions, CSRF, learning persistence, role changes and cross-school access denial. Its initial dev-server lock conflict was fixed with a separate test build directory and rerun successfully; the user's running server was not terminated.
- Voice worker Python unittest discovery: 5 tests passed, including authenticated health and refusal to start an unconfigured pipeline. These tests do not start LiveKit or send audio to providers.
- Real Neon: both configured URLs accepted `SELECT 1`; all seven applied migration checksums match. There are no `dev-*` database users.
- `npm run db:check` returned a configuration failure because `DIRECT_URL` still uses the pooler. Replace it privately with the matching unpooled Neon URL. Normal database access succeeded; this warning was not disguised as a passing check.

## Files changed

- Voice server/UI: `app/api/admin/teaching-settings/route.ts`, `app/api/voice/livekit-token/route.ts`, `components/admin/teaching-settings-panel.tsx`, `components/guru-ai/use-live-voice.ts`, `lib/voice/configuration.ts`, `lib/voice/service-check.ts`.
- Python worker: `services/voice-agent/app.py`, `services/voice-agent/readiness.py`, `services/voice-agent/test_readiness.py`, `services/voice-agent/test_health.py`.
- Demo/login policy: `lib/auth/demo-policy.ts`, `lib/auth/session.ts`, `lib/billing/entitlements.ts`, `app/api/auth/login/route.ts`, `app/api/auth/register/route.ts`, `app/(public)/login/page.tsx`, `app/(public)/admin/login/page.tsx`.
- Tests/configuration: `tests/voice-configuration.test.ts`, `tests/bootstrap-super-admin.test.ts`, `tests/lesson-integration.ts`, `package.json`, `next.config.ts`, `tsconfig.json`, `tsconfig.integration.json`, `eslint.config.mjs`.
- Templates/docs: `.env.example` (removed populated credentials and duplicates, added empty voice placeholders), `README.md`, `docs/LIVE-VOICE-SETUP.md`, this report.

The private `.env`, Prisma schema and migration files were not changed. Credentials found in the public template were removed; rotate any password reused there or shared in chat.
