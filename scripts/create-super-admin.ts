import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";
import { bootstrapErrorMessage, createFirstSuperAdmin, readSuperAdminBootstrapInput, SuperAdminBootstrapError } from "../lib/auth/bootstrap-super-admin";

async function main() {
  // Respect Next.js environment precedence, but never print environment/parser details.
  loadEnvConfig(process.cwd(), process.env.NODE_ENV !== "production", { info() {}, error() { throw new SuperAdminBootstrapError("ENV"); } });
  const input = readSuperAdminBootstrapInput(process.env);
  try {
    const url = new URL(process.env.DATABASE_URL || "");
    if (!["postgres:", "postgresql:"].includes(url.protocol)) throw new Error();
  } catch { throw new SuperAdminBootstrapError("ENV"); }
  const db = new PrismaClient({ log: [] });
  try {
    await createFirstSuperAdmin(db, input);
  } finally {
    // This clears this process only, never rewrites .env or a user's shell environment.
    delete process.env.BOOTSTRAP_SUPERADMIN_PASSWORD;
    await db.$disconnect();
  }
  console.log("Super Admin created successfully; normal database authentication verified. Remove the bootstrap environment values and sign in through the existing login page.");
}

// No startup/build/migration hook invokes this entry point. Run the npm command manually.
main().catch((error) => { console.error(bootstrapErrorMessage(error)); process.exitCode = 1; });
