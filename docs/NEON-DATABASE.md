# Neon database configuration and verification

Updated 2026-09-03. This task preserves Next.js, Qwen, existing APIs, roles and migrations. It does not start, configure or extend LiveKit, Pipecat, Whisper or streaming TTS.

## Configuration

The project uses Prisma 6.4.1; keep its existing schema-based configuration:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

There is no `prisma.config.ts` required for this installed version. Do not migrate to Prisma 7 configuration as part of this database change.

Copy the pooled URL from the Neon Connect dialog into `DATABASE_URL`. Disable Connection pooling in that dialog and copy the matching direct URL into `DIRECT_URL`. Keep the same branch, database, schema and role. Retain `sslmode=require` and any Neon-supplied TLS parameters. Suggested connection timeouts are shown in `.env.example`; no credentials are in that template or the Prisma schema. See [Neon's connection-pooling documentation](https://neon.com/docs/connect/connection-pooling).

`.env*` is ignored by `.gitignore`; only `.env.example` is exempt. This directory currently has no Git repository, so no Git commit/push was performed. Never paste URLs or passwords into logs/chat. Restart the web server after environment changes. Check `.env.local`, deployment variables and production environment files if configuration differs between CLI and the running app; environment overrides can take precedence.

### Manual correction still required at the last check

The user's `.env` was left unchanged. Both supplied URLs used a pooled Neon hostname. The direct endpoint was verified and used through a process-only `DIRECT_URL` override for deployment and the database probes, retaining the same supplied credentials. Remove only `-pooler` from the hostname in the saved `DIRECT_URL`, or copy the direct URL from Neon. Do not remove it from `DATABASE_URL`.

Until that saved edit is made, `npm run db:check` intentionally reports a direct-endpoint configuration error even though both supplied URLs can connect. No password change is necessary.

## Safe migration workflow

```powershell
npx prisma validate
npx prisma migrate status
npx prisma migrate deploy
npx prisma generate
npm run db:check
npm run verify
npm run test:integration
```

`migrate status` returning a nonzero code for a reviewed pending migration is expected. `migrate deploy` applies pending migrations without a reset. Never run `migrate reset`, `db push --force-reset`, drops, or the demo seed to repair connectivity. Preserve production backups and review any future migration before deployment.

On Windows, stop this application's own running server or database-probe process before `prisma generate` if its query-engine DLL is locked. A disconnected Prisma client can still keep its native DLL loaded until its process exits. Do not kill unrelated Node applications.

## Migrations actually checked

| Migration | Result in this task |
| --- | --- |
| `20260822000000_initial` | Already applied; checksum matched |
| `20260823000000_school_bundle_entitlements` | Already applied; checksum matched |
| `20260824000000_question_specification_grid` | Already applied; checksum matched |
| `202609030001_workspace_learning` | Already applied; checksum matched |
| `202609030002_guru_lessons` | Already applied; checksum matched |
| `202609030003_assessment_evidence` | Already applied; checksum matched |
| `202609030004_learning_tenant_scope` | Newly applied; checksum matched |

All seven files were reviewed/tested as additive CREATE operations or ALTER TABLE ADD operations. Foreign-key `ON DELETE` clauses describe future behavior; none of these migrations executes a DELETE. The six existing files were not modified. The new migration adds one nullable school column and an index; it does not update, delete or guess ownership of historical rows.

## Persistence and tenant behavior

- Learning activity is stored using the authenticated user and school, not IDs supplied in event content. POST additionally requires an account/school scope matching the session to reject stale tabs after an account switch. Requests from other origins are rejected.
- Questions/answers, Guru activity and self-reported chapter completions are idempotent activity records, not official grades. Saved Guru lessons, turns, sources and events retain their existing owner/school checks and assessment rules.
- Browser caches are separated by user and school. Development `dev-*` personas retain their old browser-only key and never become database users.
- Older database activity with unknown school remains intact with `schoolId = NULL`, excluded from school-specific histories. Its owner receives an unassigned-record notice. Reconcile such records only after explicitly verifying the historical school; current membership alone is not proof.
- Existing user-only browser caches are preserved, not automatically uploaded into a guessed school. They can be inspected/exported from the original browser profile for reviewed recovery. A new school-scoped cache does not delete the old key.
- Teacher report access requires the current school, an assignment and active student enrollment. School administrators cannot read or suspend another school's users. Current user status, role membership and school status are rechecked against the database, not just an old cookie.

## Executed checks and limits

The final `npm run verify` completed successfully: ESLint, TypeScript, all 40 unit/regression tests, Prisma validation and the production build (164 generated routes). The final `npm run test:integration` also passed, including current school suspension and role-revocation checks. A final `npx prisma migrate status` reported all seven migrations up to date. Prisma Client 6.4.1 generated successfully in a separate process after resolving a Windows DLL lock.

`db:check` is read-only, outputs connection classifications and aggregate counts only, and checks migration checksums without printing credentials or user records. Both Neon endpoints passed SELECT 1 with the direct-endpoint override described above.

`npm run db:probe` explicitly runs a transaction-only write/read probe against the configured runtime database. It exercises activity, stored answers, completion, duplicate sync, lesson/transcript/events and scoped reads, then deliberately rolls back. That probe passed on Neon and verified no test users, schools or learning records remained. It is not evidence of a committed production-user HTTP session.

`npm run test:integration` creates its own isolated in-memory PostgreSQL-compatible PGlite database, applies every migration, and runs the actual Next.js authentication and API routes. Its fixture schools/users never enter Neon. AI/embedding responses are deterministic fixtures; the test does not prove live Qwen output quality or consume hosted-model quota. It verifies committed/reloaded learning records, lesson/transcript persistence, assessment idempotency, cross-school and same-user/multiple-school isolation, admin/teacher/student restrictions, stale-session revocation, and browser-only development personas.

The connected Neon database was empty (zero users, schools or activity) before and after the rollback probe. A real authenticated production-account check remains pending legitimate school/user onboarding; no demo seed, fake production user, reset or deletion was performed. Existing legacy prototype endpoints remain intact; this report covers the retained v2 learning/lesson workflows, not a claim that every legacy preview API now persists data.

## Files changed for this task

- `.env.example`, `prisma/schema.prisma`, `prisma/migrations/202609030004_learning_tenant_scope/migration.sql`
- `lib/db/prisma.ts`, `lib/db/config-check.ts`
- `app/api/learning/activity/route.ts`, `lib/learning/activity.ts`
- `components/learning/learning-provider.tsx`, `components/layout/workspace-shell.tsx`
- `scripts/db-check.ts`, `scripts/db-persistence-check.ts`
- `tests/database.test.ts`, `tests/lesson-integration.ts`, `package.json`
- `README.md`, `docs/GURU-AI-V2-IMPLEMENTATION.md`, `docs/NEON-DATABASE.md`

`.env`, Qwen/voice services and existing migration files were not edited. Prisma Client was regenerated under ignored `node_modules`.
