import assert from "node:assert/strict";
import test from "node:test";
import { readFile, readdir } from "node:fs/promises";
import { inspectDatabaseConfiguration } from "../lib/db/config-check";
import { learningCacheKey } from "../lib/learning/activity";

const runtime = "postgresql://fixture:secret@ep-test-pooler.region.aws.neon.tech/db?sslmode=require";
const direct = runtime.replace("-pooler.", ".");
test("Neon uses pooled runtime and matching direct migration connection without exposing secrets", () => {
  const result = inspectDatabaseConfiguration({ DATABASE_URL: runtime, DIRECT_URL: direct });
  assert.deepEqual(result.errors, []);
  assert.equal(result.connections[0].pooled, true);
  assert.equal(result.connections[1].pooled, false);
  assert.doesNotMatch(JSON.stringify(result), /secret|ep-test|fixture/);
});
test("database diagnostics reject pooled direct URLs, TLS omissions, localhost mismatch and malformed values", () => {
  for (const value of [runtime, direct.replace("?sslmode=require", ""), "postgresql://fixture:secret@localhost/db", "bad:secret"]) {
    const result = inspectDatabaseConfiguration({ DATABASE_URL: runtime, DIRECT_URL: value });
    assert.ok(result.errors.length);
    assert.doesNotMatch(JSON.stringify(result), /secret/);
  }
});
test("all existing migrations are additive and never execute destructive statements", async () => {
  for (const name of (await readdir("prisma/migrations")).filter((item) => /^\d/.test(item))) {
    const sql = (await readFile(`prisma/migrations/${name}/migration.sql`, "utf8")).replace(/--[^\n]*/g, "");
    for (const statement of sql.split(";").map((item) => item.trim()).filter(Boolean)) {
      assert.match(statement, /^(CREATE (?:TYPE|TABLE|(?:UNIQUE )?INDEX)\s|ALTER TABLE "[^"]+"\s+ADD (?:COLUMN|CONSTRAINT)\s)/i, `${name} needs manual safety review`);
    }
  }
});
test("Prisma uses environment references and Git ignores local environment files", async () => {
  const schema = await readFile("prisma/schema.prisma", "utf8");
  assert.match(schema, /url\s*=\s*env\("DATABASE_URL"\)/);
  assert.match(schema, /directUrl\s*=\s*env\("DIRECT_URL"\)/);
  assert.doesNotMatch(schema, /postgres(?:ql)?:\/\//);
  const ignore = await readFile(".gitignore", "utf8");
  assert.match(ignore, /^\.env\*$/m);
  assert.match(ignore, /^!\.env\.example$/m);
});
test("browser learning caches separate schools while preserving the browser-only legacy key", () => {
  assert.notEqual(learningCacheKey("student", "a"), learningCacheKey("student", "b"));
  assert.notEqual(learningCacheKey("student", "a"), learningCacheKey("other", "a"));
  assert.equal(learningCacheKey("dev-student"), "guru.learning.v2.dev-student");
  assert.notEqual(learningCacheKey("student", "a"), learningCacheKey("student"));
});
