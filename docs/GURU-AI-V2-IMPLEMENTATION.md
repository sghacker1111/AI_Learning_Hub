# Guru AI v2 — implementation and remaining phases

This extends the existing Next.js application. It does not rebuild it as a new monorepo or silently replace its configured Qwen provider.

## Working in this version

- Student and Teacher workspaces each have four left-sidebar destinations: Dashboard, My Learning, Guru AI, Exams. On mobile the same vertical navigation opens in an accessible drawer.
- Super Admin has eight management-only destinations: Login Users, Students, Teachers, School, Add MCQs, Add Questions, Add Exam Questions, Add Specification Grid. Old prototype page URLs redirect to the corresponding retained workflow. Existing source files and APIs outside these workflows are not destructively deleted.
- Server layouts enforce roles. Admin cannot open Student or Teacher classrooms. Current database account status, role assignments, and school status are checked in authenticated server access; deactivated accounts do not retain access merely because their cookie is still signed.
- Guru AI starts with Class → Subject → Chapter → optional topic → AI teacher → language. Ram Sir and Sita Ma'am are selectable AI personas, not human teachers.
- Classroom includes an animated avatar, teacher status, timer, safe text/LaTeX whiteboard, transcript, language switch, pause/resume, repeat, speech speed, hint, simpler/deeper explanations, examples, practice questions, MCQs and end/mark-complete actions.
- Approved-content mode declines chapters without evidence. Retrieval is filtered by class, subject and chapter. General mode remains optional and is not an official textbook source.
- Qwen calls stay on the server. Cancel/interrupt signals propagate to supported provider requests and prevent stale replies from appearing. Visible text is progressively revealed after the JSON answer arrives; this is not token streaming.
- Whiteboard messages use a validated data-only contract (title, step, equation, question, bullet list), with no arbitrary model HTML or scripts.
- Browser speech recognition and synthesis remain the available voice adapter. Clicking the microphone stops current speech/generation before listening. Repeated recognition callbacks are guarded. There is no raw-audio recording/storage added by this implementation. Browser speech processing and supported voices depend on the browser/vendor.
- My Learning uses recorded activity, question/answer history, chapter completion, participation level and practice-exam results. Completion is explicitly self-reported. Participation is not academic mastery, and practice exam results are not official grades.
- Activity is cached per account in this browser and synced idempotently to authenticated database storage. Only the signed-in learner's activity is read or written. The most recent 1,000 events are shown. A failed sync is visibly labelled; no fake progress is shown.
- Admin can create learner/teacher accounts associated with active schools, provision school bundles, update school details/status, author mixed text/LaTeX questions and MCQs, and create specification grids. Exam questions must match an existing grid's class, subject, chapter, type, cognitive level and marks. Grid row totals must equal full marks.
- Approved curriculum text import remains available under Add Questions. The CDC catalog is a framework scaffold, not a collection of complete official textbooks.

## Current database setup

The former localhost/P1000 diagnosis is superseded: Neon now connects and the existing migrations are applied. See [Neon database setup and verification](NEON-DATABASE.md) for the current configuration, migration list, security regression coverage, and remaining manual onboarding. The historical architecture-phase notes below are not a current verification report.

1. Set the correct `DATABASE_URL` and `DIRECT_URL` in the project's `.env`. Never paste the real password into chat or commit it. Example only:

   `DATABASE_URL="postgresql://YOUR_USER:YOUR_PASSWORD@YOUR_ENDPOINT-pooler.YOUR_REGION.aws.neon.tech/YOUR_DATABASE?sslmode=require"`

   Set `DIRECT_URL` to the matching Neon direct URL (hostname without `-pooler`). Migrations use `DIRECT_URL`; runtime queries use `DATABASE_URL`.

2. Run `npx prisma migrate status` to check the target and pending migrations.
3. Run `npx prisma migrate deploy` to apply additive migrations, including `202609030001_workspace_learning`.
4. Run `npx prisma generate`, then restart the app with `npm run dev`. On Windows stop this app's dev server before generating if Prisma's DLL is locked.
5. Do not run `prisma/seed.ts` against a real installation: it creates demonstration progress and can reset demo passwords. Use authorized real-account onboarding.
6. Use a real database account, then revisit My Learning and press Sync. Development `dev-*` personas deliberately keep browser-only records; they are not database users and cannot persist account data.

Browser-only activity is not a backup, does not sync between devices, and remains on that browser profile. Use a private personal profile while the database is unavailable, especially on shared school devices.

## Attached architecture: not yet implemented

The attached prompt explicitly requires phased delivery. The following are remaining backend phases, not advertised as working buttons:

1. Database-backed lesson sessions with objective-by-objective state, validated semantic answer evaluation, assessed mastery/retries/misconceptions, tenant-scoped teacher transcripts and analytics. This version's activity history is not that assessment engine.
2. Secure PDF ingestion, text extraction, chunk metadata, real embeddings and pgvector. Existing curriculum retrieval uses published content or labelled bundled samples with deterministic retrieval, not vector embeddings. School-private PDF collections and school-scoped RAG need their own schema and authorization before enabling uploads.
3. LiveKit WebRTC, Pipecat voice worker, VAD, Faster-Whisper and streaming TTS. They require deployed services, credentials and a supported TTS/STT runtime. None is currently connected. Automatic hands-free barge-in, streaming transcripts/audio, reconnect, sentence-level speech streaming and precise lip sync cannot be claimed from the browser speech fallback.
4. Persisted admin AI/voice settings, teacher curriculum/assignment management, expanded school-admin workflows, full observability and operational deployment testing.

Keep hosted Qwen as the default unless the operator explicitly chooses self-hosting. Adding Ollama/GPU containers is optional; it is not required for the current API-key-based text tutor. Do not add fake LiveKit tokens, placeholder Whisper responses, guessed mastery scores, or fabricated official CDC content to hide missing services.

## Verification

- `npm run verify`: lint, typecheck, unit/regression tests, Prisma schema validation, production build.
- `node tests/panel-smoke.mjs`: local development logins, role separation, retained routes, legacy redirects and invalid grid rejection. This expects development demo accounts and must not be used against production.
- `node tests/panel-smoke.mjs --ai`: additionally makes a real quota-consuming AI request and prints its provider, simulation flag and answer. It does not print tokens or cookies.
- Database migrations, persistence and cross-school integration tests must be repeated with valid credentials before deployment.
- Real voice testing requires a human microphone/voice check in a compatible browser. Visual avatar movement is state-based animation, not audio-phoneme lip synchronization.

Do not declare the full attached architecture production-ready until the remaining phases and operational checks pass.
