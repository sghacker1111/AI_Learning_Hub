# Create the first real Super Admin

This is a manual, one-time operation using the existing `User`, `Role`, `UserRole` and `AuditLog` tables. It does not seed/reset/migrate the database, create a demo persona, or modify an existing user. The Prisma schema is unchanged.

## Set values privately

Keep the application's existing Neon `DATABASE_URL` configured. The script uses that runtime connection, not a fallback database. Keep the application's existing signing secret configured for normal browser login.

In the ignored `.env` file, set these three variables with your own values:

```env
BOOTSTRAP_SUPERADMIN_EMAIL="your-real-email"
BOOTSTRAP_SUPERADMIN_PASSWORD="your-own-strong-secret"
BOOTSTRAP_SUPERADMIN_NAME="your-display-name"
```

These are explanatory placeholders, not working credentials. Email is trimmed and lowercased exactly as in login. Name must be 2–100 characters. Password must have at least 16 characters, uppercase and lowercase letters, a number and a symbol, at least eight distinct characters, and at most 72 UTF-8 bytes. Common password patterns and control characters are rejected; whitespace is not silently trimmed. Generate a unique secret in a password manager. The byte limit avoids [bcrypt's documented input truncation](https://github.com/dcodeIO/bcrypt.js#security-considerations).

Environment variables supplied by your process and Next.js environment files can override `.env`, just as for the web application. For a password containing `$`, follow [Next.js environment-file escaping](https://nextjs.org/docs/app/guides/environment-variables#referencing-other-variables) (`\$`) or supply it through a private secret-injection mechanism. Do not paste the password into chat, shell history, source files or logs. Never prefix any bootstrap variable with `NEXT_PUBLIC_`.

## Run exactly once

From the project directory:

```powershell
npm run create-super-admin
```

Only run it after the existing Prisma migrations are applied. No build, startup, seed or migration hook runs it automatically. It emits a fixed safe success/error message and a nonzero exit status on failure, never the email, password, password hash, database URL or raw database error.

On success, remove all three bootstrap values from `.env` and any parent-shell/deployment secret configuration. Then sign in through the existing `/login` or `/admin/login` page with the email and password you chose. The existing login creates the normal cookie; bootstrap never issues or bypasses a session.

## Safeguards

- A case-insensitive existing-email check refuses to promote, reactivate, overwrite or reset an existing account.
- Any existing `SUPER_ADMIN` assignment, including an inactive or school-scoped one, closes bootstrap. Use normal account recovery/administration instead.
- The existing `SUPER_ADMIN` role is reused without editing it, or only that role is created if missing. No unrelated roles, permissions or school records are seeded.
- The account is an actual `ACTIVE` database user. Its role assignment is global (`schoolId = NULL`). Password hashing uses the unchanged `lib/auth/passwords.ts` utility used for ordinary account creation.
- A transaction-scoped PostgreSQL advisory lock serializes competing bootstrap attempts. User, assignment, verification and audit marker commit atomically. A failure during verification rolls everything back.
- Before commit, bootstrap calls the exact shared database authentication function used by `/api/auth/login`, checking the password, user ID, active status, global scope and Super Admin role. A successful transaction also records `FIRST_SUPER_ADMIN_BOOTSTRAP`, preventing later reuse even after the assignment is removed. Preserve that audit marker; this script is not an account-recovery tool.
- A lost connection during commit can have an uncertain outcome. The script reports that it cannot confirm creation; inspect account state privately before retrying. Never reset the database to resolve it.

## Verification boundary

The creation entry point is deliberately not executed during development checks. Automated tests use the bootstrap library with synthetic accounts in their own disposable PostgreSQL-compatible database, never the configured Neon database or real bootstrap environment values. The integration test logs in the bootstrapped fixture through the actual `/api/auth/login` endpoint and verifies its normal `/api/auth/me` session. This validates the implementation, not creation of your real account; you perform that action manually with the command above.

Verified on 2026-09-03: `npm run verify` passed lint, TypeScript, all 45 tests, Prisma validation and the production build. `npm run test:integration` passed the normal bootstrap-fixture login and existing tenant/role regressions. A separate read-only check confirmed the configured database was reachable with zero Super Admin assignments and zero bootstrap markers. No real bootstrap account was created during implementation.
