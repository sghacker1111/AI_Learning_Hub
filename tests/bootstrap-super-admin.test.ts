import assert from "node:assert/strict";
import test from "node:test";
import { readFile, readdir } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";
import { PrismaClient } from "@prisma/client";
import { bootstrapErrorMessage, createFirstSuperAdmin, readSuperAdminBootstrapInput, SuperAdminBootstrapError } from "../lib/auth/bootstrap-super-admin";
import { authenticateDatabaseUser } from "../lib/auth/database-login";
import { hashPassword, verifyPassword } from "../lib/auth/passwords";
import { isDemoAuthEnabled } from "../lib/auth/demo-policy";

test("fake development logins and sessions require explicit opt-in and never run in production", () => {
  assert.equal(isDemoAuthEnabled({ NODE_ENV: "development" }), false);
  assert.equal(isDemoAuthEnabled({ NODE_ENV: "development", ALLOW_DEMO_AUTH: "false" }), false);
  assert.equal(isDemoAuthEnabled({ NODE_ENV: "production", ALLOW_DEMO_AUTH: "true" }), false);
  assert.equal(isDemoAuthEnabled({ NODE_ENV: "development", ALLOW_DEMO_AUTH: "true" }), true);
});

// Synthetic test values only. Never load .env or execute scripts/create-super-admin.ts.
const fixture = { email: "admin@fixture.test", name: "Fixture Administrator", password: "Fixture-Only!Strong47" };
const env = { BOOTSTRAP_SUPERADMIN_EMAIL: "  ADMIN@fixture.test  ", BOOTSTRAP_SUPERADMIN_NAME: "  Fixture Administrator  ", BOOTSTRAP_SUPERADMIN_PASSWORD: fixture.password };
const isCode = (code: string) => (error: unknown) => error instanceof SuperAdminBootstrapError && error.code === code;

test("bootstrap requires valid environment values and uses login email normalization", () => {
  assert.deepEqual(readSuperAdminBootstrapInput(env), fixture);
  assert.throws(() => readSuperAdminBootstrapInput({}), isCode("INPUT"));
  assert.throws(() => readSuperAdminBootstrapInput({ ...env, BOOTSTRAP_SUPERADMIN_EMAIL: "not-email" }), isCode("INPUT"));
  assert.throws(() => readSuperAdminBootstrapInput({ ...env, BOOTSTRAP_SUPERADMIN_NAME: " " }), isCode("INPUT"));
});

test("bootstrap rejects weak/common/control-character and bcrypt-truncated passwords", () => {
  for (const value of ["Short12!", "lowercaseonly123!", "UPPERCASEONLY123!", "MissingNumbers!!", "NoSymbolsHere12345", "Password-Example47!", "Aaa111!!!!!!!!!!!!", "Valid-Looking47!\n", "A1!" + "अ".repeat(24), "A1!" + "a".repeat(70)]) {
    assert.throws(() => readSuperAdminBootstrapInput({ ...env, BOOTSTRAP_SUPERADMIN_PASSWORD: value }), isCode("INPUT"));
  }
  const preserved = `  ${fixture.password}  `;
  assert.equal(readSuperAdminBootstrapInput({ ...env, BOOTSTRAP_SUPERADMIN_PASSWORD: preserved }).password, preserved);
});

test("bootstrap errors never echo environment values, raw database errors, or passwords", () => {
  const error = new Error(`Connection failed ${fixture.password} ${fixture.email} postgresql://private:secret@host/db`);
  assert.equal(bootstrapErrorMessage(error), bootstrapErrorMessage(null));
  assert.doesNotMatch(bootstrapErrorMessage(error), /Fixture-Only|fixture.test|postgresql|secret@/);
  assert.doesNotMatch(bootstrapErrorMessage(new SuperAdminBootstrapError("INPUT")), /Fixture-Only|fixture.test/);
});

test("bootstrap entrypoint is manual-only and neither seeds nor changes the schema", async () => {
  const pkg = JSON.parse(await readFile("package.json", "utf8"));
  assert.equal(pkg.scripts["create-super-admin"], "tsx scripts/create-super-admin.ts");
  for (const [name, command] of Object.entries(pkg.scripts)) if (name !== "create-super-admin") assert.doesNotMatch(String(command), /scripts\/create-super-admin\.ts|npm run create-super-admin/);
  const source = await readFile("scripts/create-super-admin.ts", "utf8");
  assert.doesNotMatch(source, /migrate|db seed|\.user\.(?:update|upsert|delete)/);
});

test("isolated database: first real user is global, login-compatible, atomic, one-time and non-overwriting", { timeout: 90000 }, async () => {
  const memory = await PGlite.create();
  const socket = new PGLiteSocketServer({ db: memory, host: "127.0.0.1", port: 0, maxConnections: 4 });
  let db: PrismaClient | undefined;
  try {
    for (const name of (await readdir("prisma/migrations")).filter((item) => /^\d/.test(item)).sort()) await memory.exec(await readFile(`prisma/migrations/${name}/migration.sql`, "utf8"));
    await socket.start();
    db = new PrismaClient({ datasources: { db: { url: `postgresql://postgres:postgres@${socket.getServerConn()}/postgres?connection_limit=1&pgbouncer=true` } }, log: [] });
    const studentRole = await db.role.create({ data: { code: "STUDENT", name: "Existing role", description: "Preserve me" } });
    const previous = await db.user.create({ data: { email: "Existing@fixture.test", name: "Existing fixture", status: "SUSPENDED", passwordHash: await hashPassword("Existing-Fixture47!"), userRoles: { create: { roleId: studentRole.id, schoolId: null } } } });
    await assert.rejects(createFirstSuperAdmin(db, { ...fixture, email: " existing@fixture.test " }), isCode("EXISTS"));
    assert.equal(await db.role.count({ where: { code: "SUPER_ADMIN" } }), 0);
    // This trigger exists only in the disposable test database and forces verification failure.
    await memory.exec(`CREATE FUNCTION bootstrap_fixture_inactive() RETURNS trigger AS $$ BEGIN NEW."status" := 'SUSPENDED'; RETURN NEW; END; $$ LANGUAGE plpgsql;
      CREATE TRIGGER bootstrap_fixture_inactive BEFORE INSERT ON "User" FOR EACH ROW WHEN (NEW.email = 'verification-failure@fixture.test') EXECUTE FUNCTION bootstrap_fixture_inactive();`);
    await assert.rejects(createFirstSuperAdmin(db, { ...fixture, email: "verification-failure@fixture.test" }), isCode("VERIFY"));
    assert.equal(await db.user.count(), 1);
    assert.equal(await db.role.count({ where: { code: "SUPER_ADMIN" } }), 0);
    assert.equal(await db.auditLog.count(), 0);
    // Two simultaneous attempts: only one may create an administrator.
    const attempts = await Promise.allSettled([createFirstSuperAdmin(db, fixture), createFirstSuperAdmin(db, { ...fixture, email: "second@fixture.test" })]);
    assert.equal(attempts.filter((item) => item.status === "fulfilled").length, 1);
    const failure = attempts.find((item) => item.status === "rejected");
    assert.ok(failure?.status === "rejected" && isCode("CLOSED")(failure.reason));
    const assignment = await db.userRole.findFirstOrThrow({ where: { role: { code: "SUPER_ADMIN" } }, include: { user: true } });
    assert.equal(assignment.schoolId, null); assert.equal(assignment.user.status, "ACTIVE");
    assert.ok(!assignment.userId.startsWith("dev-"));
    assert.notEqual(assignment.user.passwordHash, fixture.password);
    assert.ok(await verifyPassword(fixture.password, assignment.user.passwordHash!));
    const login = await authenticateDatabaseUser(db, ` ${assignment.user.email.toUpperCase()} `, fixture.password);
    assert.equal(login.outcome, "authenticated");
    if (login.outcome === "authenticated") { assert.equal(login.user.role, "SUPER_ADMIN"); assert.equal(login.user.schoolId, null); assert.equal(login.user.userId, assignment.userId); }
    assert.equal((await authenticateDatabaseUser(db, assignment.user.email, "Wrong-Secret-47!abc")).outcome, "invalid");
    await assert.rejects(createFirstSuperAdmin(db, { ...fixture, email: assignment.user.email }), isCode("EXISTS"));
    await assert.rejects(createFirstSuperAdmin(db, { ...fixture, email: "another@fixture.test" }), isCode("CLOSED"));
    assert.deepEqual(await db.user.findUniqueOrThrow({ where: { id: previous.id } }), previous);
    assert.deepEqual(await db.role.findUniqueOrThrow({ where: { id: studentRole.id } }), studentRole);
    const audit = await db.auditLog.findMany({ where: { action: "FIRST_SUPER_ADMIN_BOOTSTRAP" } });
    assert.equal(audit.length, 1); assert.doesNotMatch(JSON.stringify(audit), /Fixture-Only|passwordHash/);
    // Test-only state changes simulate an administrator becoming inactive/losing their role.
    await db.user.update({ where: { id: assignment.userId }, data: { status: "SUSPENDED" } });
    assert.equal((await authenticateDatabaseUser(db, assignment.user.email, fixture.password)).outcome, "inactive");
    await assert.rejects(createFirstSuperAdmin(db, { ...fixture, email: "suspension@fixture.test" }), isCode("CLOSED"));
    await db.userRole.update({ where: { id: assignment.id }, data: { roleId: studentRole.id } });
    await assert.rejects(createFirstSuperAdmin(db, { ...fixture, email: "marker@fixture.test" }), isCode("CLOSED"));
    assert.equal(await db.user.count(), 2);
    assert.equal(await db.school.count(), 0);
  } finally { await db?.$disconnect(); await socket.stop(); await memory.close(); }
});
