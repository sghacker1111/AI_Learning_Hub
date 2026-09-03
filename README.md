# AI Learning Nepal

AI Learning Nepal is a Next.js 16 educational platform with role-based dashboards, a Prisma/PostgreSQL data model, a Class 1–12 compulsory-subject scaffold, curriculum-grounded Guru AI, deterministic STEM visuals, practice questions, and sample mathematics exams.

## Guru AI v2 workspace

Students and teachers now use four left-sidebar sections: Dashboard, My Learning, Guru AI and Exams. Super Admin uses a separate eight-section management panel. See [implementation status and setup](docs/GURU-AI-V2-IMPLEMENTATION.md) for the classroom controls, new learning/grid migration, database setup, verification commands, and the remaining LiveKit/Pipecat/pgvector/assessed-mastery phases from the architecture brief.

For the current Neon database configuration and executed persistence/security checks, see [Neon setup and verification](docs/NEON-DATABASE.md). No local PostgreSQL installation is required when Neon is configured.

## Requirements

- Node.js 20.9 or newer
- npm
- PostgreSQL for database-backed authentication and administration

## Local setup

1. Copy `.env.example` to `.env` and replace the development secrets.
2. Set `DATABASE_URL` to Neon's pooled URL and `DIRECT_URL` to the matching direct URL; both require TLS. The template contains placeholders only.
3. Install dependencies with `npm ci`.
4. Run `npx prisma generate` and `npx prisma migrate deploy`.
5. Do not run the demo seed against a real Neon installation. It can reset demo passwords and creates artificial progress. Provision real school accounts through an authorized onboarding process.
6. Start the app with `npm run dev` and open `http://localhost:3000`.

Demo login personas require explicit `ALLOW_DEMO_AUTH=true` outside production; the default is disabled. Public registration permits only student and parent roles. Teacher and administrative roles must be assigned through an authorized onboarding process. Real account access requires a working database so suspension and school status can be checked.

For an empty installation without a real Super Admin, use the [secure one-time Super Admin bootstrap](docs/SUPER-ADMIN-BOOTSTRAP.md). Set the three private `BOOTSTRAP_SUPERADMIN_*` variables and manually run `npm run create-super-admin`. This command is never run automatically and refuses to overwrite an existing account.

## Hosted AI Tutor (no local model download)

The Tutor and image-prompt planner use Hugging Face Inference Providers through its OpenAI-compatible router. The configured primary model is `Qwen/Qwen3.5-122B-A10B:fastest`; `Qwen/Qwen3-Next-80B-A3B-Instruct:fastest` is the hosted fallback. Qwen reasoning is disabled for normal Tutor calls so the provider returns a complete final answer instead of spending the output limit on a reasoning trace.

1. Create a Hugging Face token with Inference Providers permission at `https://huggingface.co/settings/tokens`.
2. Put it in the server-only `.env` as `HF_TOKEN="hf_..."`.
3. Keep `AI_PROVIDER="qwen"` and `AI_BASE_URL="https://router.huggingface.co/v1"`.
4. Restart `npm run dev` and use **Test Provider** in the Super Admin AI Control Center.

No Ollama service or model files are required. The optional Ollama adapter remains in the codebase only for administrators who deliberately choose an offline provider later.

### Guru AI voice and approved-content teaching

Guru AI uses the browser microphone for the learner turn and browser speech synthesis for the teacher turn, so no speech model or voice module needs to be downloaded. In **AI Classroom**, keep **Approved content only** enabled to prevent the hosted model from answering outside content retrieved from the school curriculum store. A Super Admin publishes full English/Nepali chapter or topic text, formulas, and its source record from **Admin → RAG & Approved Content**. The teacher writes the answer progressively, speaks that exact final answer, and can attach a free deterministic visual when the lesson needs one.

Microphone transcription depends on the browser's Web Speech support and microphone permission. The text box remains available when browser transcription is unavailable.

For the separate live microphone/teacher pipeline, follow [LiveKit + hosted voice setup](docs/LIVE-VOICE-SETUP.md). Admin → Login Users → AI teacher & voice settings now includes a missing-settings checklist and authenticated service checks; an enabled checkbox alone does not mean voice is connected.

## Verification

Run the full local quality gate:

```powershell
npm run verify
```

The command runs ESLint, TypeScript, regression tests, Prisma schema validation, and a production build. `npm audit --omit=dev` is also recommended before release and is enforced by CI for high-severity findings.

## Educational visuals and Qwen images

Every Student and Teacher Tutor answer now has two different visual actions:

- `Show Visual` uses the built-in deterministic SVG engine. It is immediate, does not need an API key, and is the preferred route for Venn diagrams, force diagrams, water-cycle diagrams, and concept maps because labels remain exact.
- `Create Image` lets the hosted Qwen text model refine the educational composition, then uses the server-side Hugging Face image provider with `Qwen/Qwen-Image-2512` to render the pixels. If prompt refinement is unavailable, the validated deterministic prompt is used automatically. Browser clients never receive `HF_TOKEN`.

Generative image models can still misplace leader lines or exact labels even when they spell the text correctly. The Tutor classifier therefore sends requests for diagrams and exact visuals to `Show Visual`, while `Create Image` is reserved for richer illustrations and scenes.

The Hugging Face JavaScript module is installed locally at:

```text
D:\A WebSite\AI Learning Hub\node_modules\@huggingface\inference
```

To enable hosted Qwen-Image generation:

1. Create a Hugging Face access token with Inference Providers permission at `https://huggingface.co/settings/tokens`.
2. Open the configured model page and accept its access conditions if requested.
3. Put the token only in the server `.env` as `HF_TOKEN="hf_..."`.
4. Restart `npm run dev`, sign in, and select `Create Image` under a Tutor answer.

Hugging Face free accounts receive only limited monthly inference credits, so this path is suitable for evaluation rather than unlimited production use. The application enforces a configurable per-user hourly quota, validates inputs and output MIME types, times out stalled requests, keeps generated images private/no-store, and caches repeated generation requests briefly in server memory. `AI_IMAGE_STEPS` and `AI_IMAGE_GUIDANCE_SCALE` can be tuned; the included Qwen-Image defaults are `40` and `4`.

No Qwen-Image weights are downloaded on this workstation. The hosted `Qwen/Qwen-Image-2512` repository is roughly 57.7 GB before runtime overhead, so it is not practical on this computer's 4 GB GPU. On a separate suitable GPU server, place the Hugging Face cache in a dedicated directory such as `D:\AI Models\huggingface`, expose the model through a private Hugging Face Inference Endpoint-compatible URL, and set `AI_IMAGE_ENDPOINT` to that URL. The web application does not need to change.

## Deployment

`next.config.ts` produces Next.js standalone output for the included Dockerfile. Docker Compose requires `POSTGRES_PASSWORD` and `NEXTAUTH_SECRET`; never commit a populated `.env` file. The CI workflow validates deployment readiness but intentionally does not claim to deploy anywhere until a real target and credentials are configured.

### Neon PostgreSQL on this Windows workstation

The application uses Prisma's PostgreSQL connector with your server-only Neon environment variables. Runtime queries use `DATABASE_URL`; migrations use `DIRECT_URL`. Do not replace a working Neon URL with localhost. After configuring both URLs in `.env`, run:

```powershell
npx prisma validate
npx prisma migrate status
npx prisma migrate deploy
npx prisma generate
npm run db:check
npm run dev
```

The Docker Compose PostgreSQL service remains an optional local development setup; it is not needed for Neon. Never run a reset, drop or development seed to repair a Neon connection.

## Current prototype boundaries

The application deliberately labels or disables unimplemented external integrations:

- Super Admin can provision trial or manually-confirmed school bundles and the API enforces their Tutor/Exam entitlements. Payment routes remain sandbox previews: they do not yet sign or verify real eSewa, Khalti, Fonepay, or ConnectIPS transactions or activate access from a webhook.
- The scanner exposes three pre-authored OCR samples. Live image upload and OCR are not configured.
- Hosted Qwen-Image generation requires `HF_TOKEN` or a private `AI_IMAGE_ENDPOINT`. The deterministic Tutor visual engine works without either.
- The Class 1–12 catalog is an official-framework scaffold, not a claim that every displayed chapter title is an exact textbook table of contents. Super Admins must import and editorially verify licensed/approved full chapter content and page references. Guru AI retrieves those published database records and retains a small bundled Class 8 sample for demonstration.
- IEMIS import/sync, offline reconciliation, backup/restore/failover, and deployment controls are simulations and do not mutate external systems.
- Exam generation currently supports a 16-mark Class 8 BLE practice mini-paper and a 20-mark Sets/VAT unit test. It does not generate a complete official BLE or SEE paper.
- System health reports a real database connectivity probe and configuration state; it does not fabricate provider uptime or request counters.

Before production use, add verified curriculum licensing/editorial review, school-scoped database authorization on every tenant-owned query, real payment webhook verification, durable storage, operational backups, rate limiting, monitoring, and deployment infrastructure.
