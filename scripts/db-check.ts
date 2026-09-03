import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";
import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import { inspectDatabaseConfiguration } from "../lib/db/config-check";

// Read-only. Never dump environment values, database URLs, engine errors or user records.
async function main() {
  loadEnvConfig(process.cwd(), process.env.NODE_ENV !== "production");
  const config = inspectDatabaseConfiguration(process.env);
  console.log(JSON.stringify(config));
  for (const key of ["DATABASE_URL", "DIRECT_URL"] as const) {
    if (!process.env[key]) continue;
    const client = new PrismaClient({ datasources: { db: { url: process.env[key] } }, log: [] });
    try {
      await client.$queryRaw`SELECT 1`;
      console.log(`${key}: SELECT 1 succeeded`);
      if (key !== "DIRECT_URL") continue;
      const rows = await client.$queryRaw<{ migration_name: string; checksum: string; finished_at: Date | null; rolled_back_at: Date | null }[]>`SELECT migration_name, checksum, finished_at, rolled_back_at FROM "_prisma_migrations" ORDER BY started_at`;
      for (const name of (await readdir("prisma/migrations")).filter((item) => /^\d/.test(item)).sort()) {
        const file = await readFile(`prisma/migrations/${name}/migration.sql`, "utf8");
        const hashes = [file, file.replace(/\r\n/g, "\n"), file.replace(/\r?\n/g, "\r\n")].map((value) => createHash("sha256").update(value).digest("hex"));
        const row = rows.find((item) => item.migration_name === name && item.finished_at && !item.rolled_back_at);
        const state = row ? hashes.includes(row.checksum) ? "applied; checksum matches" : "CHECKSUM MISMATCH" : "pending or failed";
        console.log(`${name}: ${state}`);
        if (!row || !hashes.includes(row.checksum)) process.exitCode = 1;
      }
      console.log(JSON.stringify({ users: await client.user.count(), schools: await client.school.count(), activities: await client.learningActivity.count(), lessons: await client.guruLesson.count(), turns: await client.guruTurn.count(), unassignedActivities: await client.learningActivity.count({ where: { schoolId: null } }), devDatabaseAccounts: await client.user.count({ where: { id: { startsWith: "dev-" } } }) }));
    } catch (error) {
      const code = error && typeof error === "object" && "code" in error ? String(error.code) : "DATABASE_CHECK_FAILED";
      console.error(`${key}: check failed (${code}); connection details withheld.`);
      process.exitCode = 1;
    } finally { await client.$disconnect(); }
  }
  if (config.errors.length) process.exitCode = 1;
}
main().catch(() => { console.error("Database check could not complete; details withheld."); process.exitCode = 1; });
