import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { createServer } from "node:http";
import { once } from "node:events";
import { spawn, execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { PGlite } from "@electric-sql/pglite";
import { vector } from "@electric-sql/pglite-pgvector";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../lib/auth/passwords";
import { GURU_CHAPTERS } from "../lib/guru-ai/catalog";
import { getCDCGradeCatalog } from "../lib/constants/cdc-compulsory-catalog";
import { createSessionToken, SESSION_COOKIE_NAME } from "../lib/auth/jwt";
import { createFirstSuperAdmin } from "../lib/auth/bootstrap-super-admin";

// This test never reads DATABASE_URL or replaces .env. All data and providers are isolated fixtures.
async function main() {
  const db = await PGlite.create({ extensions: { vector } });
  await db.exec("CREATE EXTENSION vector;");
  for (const name of (await readdir("prisma/migrations")).sort()) {
    if (/^\d/.test(name)) await db.exec(await readFile(`prisma/migrations/${name}/migration.sql`, "utf8"));
  }
  console.log("PASS: every migration applied to isolated PostgreSQL + pgvector");
  const socket = new PGLiteSocketServer({ db, host: "127.0.0.1", port: 0, maxConnections: 12 });
  await socket.start();
  // PGlite multiplexes a single backend; do not retain per-client named statements.
  // This setting is test-only and never changes the application's Neon connection.
  const databaseUrl = `postgresql://postgres:postgres@${socket.getServerConn()}/postgres?connection_limit=1&pgbouncer=true`;
  const prisma = new PrismaClient({ datasources: { db: { url: databaseUrl } } });
  const vectorValue = Array.from({ length: 64 }, (_, i) => i === 0 ? 1 : 0);
  let generations = 0;
  const provider = createServer(async (request, response) => {
    let raw = ""; for await (const chunk of request) raw += chunk;
    const body = JSON.parse(raw || "{}");
    if (request.url === "/embeddings") { response.setHeader("Content-Type", "application/json"); response.end(JSON.stringify({ data: body.input.map((_: string, index: number) => ({ index, embedding: vectorValue })) })); return; }
    generations++;
    const evaluating = body.messages[0].content.includes("Evaluate the student answer");
    const text = evaluating ? JSON.stringify({ classification: "correct", correctness: 1, reason: "Equivalent ratio.", missing_concepts: [], misconceptions: [], should_hint: false }) : "A ratio compares two quantities. What is the ratio of 2 red balls to 4 blue balls?";
    response.writeHead(200, { "Content-Type": "text/event-stream" });
    for (const part of text.match(/.{1,18}/g) || []) response.write(`data: ${JSON.stringify({ choices: [{ delta: { content: part } }] })}\n\n`);
    response.end('data: {"choices":[{"delta":{},"finish_reason":"stop"}]}\n\ndata: [DONE]\n\n');
  });
  provider.listen(0, "127.0.0.1"); await once(provider, "listening");
  const providerUrl = `http://127.0.0.1:${(provider.address() as { port: number }).port}`;
  const port = Number(process.env.LESSON_TEST_PORT || "3107"), base = `http://127.0.0.1:${port}`;
  let app: ReturnType<typeof spawn> | undefined, logs = "";
  try {
    const roles = Object.fromEntries(await Promise.all(["SUPER_ADMIN", "SCHOOL_ADMIN", "STUDENT", "TEACHER"].map(async (code) => { const role = await prisma.role.create({ data: { code: code as "STUDENT", name: code } }); return [code, role.id]; })));
    const schoolA = await prisma.school.create({ data: { name: "Fixture A", code: "FIX-A", subscription: { create: { bundleCode: "FULL_SCHOOL_AI", status: "ACTIVE" } } } });
    const schoolB = await prisma.school.create({ data: { name: "Fixture B", code: "FIX-B", subscription: { create: { bundleCode: "FULL_SCHOOL_AI", status: "ACTIVE" } } } });
    const password = "Fixture-Admin-Only-47!", passwordHash = await hashPassword(password);
    async function account(email: string, role: string, schoolId: string | null) { return prisma.user.create({ data: { email, name: email, passwordHash, userRoles: { create: { roleId: roles[role], schoolId } } } }); }
    const studentA = await account("a@fixture.test", "STUDENT", schoolA.id);
    const studentB = await account("b@fixture.test", "STUDENT", schoolB.id);
    await account("principal-a@fixture.test", "SCHOOL_ADMIN", schoolA.id);
    await account("principal-b@fixture.test", "SCHOOL_ADMIN", schoolB.id);
    await account("teacher-b@fixture.test", "TEACHER", schoolB.id);
    const teacher = await account("teacher@fixture.test", "TEACHER", schoolA.id);
    // Exercise the bootstrap library only against this isolated database, never its CLI.
    await createFirstSuperAdmin(prisma, { email: "ADMIN@fixture.test", password, name: "Fixture Super Admin" });
    const admin = await prisma.user.findUniqueOrThrow({ where: { email: "admin@fixture.test" } });
    const chapter = GURU_CHAPTERS["Class 7"].math.find((item) => /ratio/i.test(item.title))!;
    assert.ok(chapter);
    const subject = getCDCGradeCatalog("Class 7").subjects.find((item) => item.key === "math")!.name;
    const curriculum = await prisma.curriculum.create({ data: { name: "Integration fixture", versions: { create: { versionCode: "TEST", name: "TEST", effectiveFrom: new Date(), grades: { create: { code: "class-7", name: "Class 7", nameNepali: "कक्षा ७", level: "LOWER_SECONDARY", orderIndex: 7 } } } } }, include: { versions: { include: { grades: true } } } });
    const year = await prisma.academicYear.create({ data: { schoolId: schoolA.id, name: "TEST", startDate: new Date("2026-01-01"), endDate: new Date("2026-12-31") } });
    const schoolClass = await prisma.schoolClass.create({ data: { schoolId: schoolA.id, academicYearId: year.id, gradeId: curriculum.versions[0].grades[0].id, name: "Class 7" } });
    await prisma.enrollment.create({ data: { studentId: studentA.id, schoolId: schoolA.id, academicYearId: year.id, schoolClassId: schoolClass.id } });
    await prisma.curriculumDocument.create({ data: { schoolId: schoolA.id, createdBy: admin.id, title: "Ratio integration fixture", source: "Original test content, not CDC", grade: "Class 7", subject, chapter: chapter.title, sha256: "fixture", pageCount: 1, status: "PUBLISHED", embeddingModel: "test-embedding", chunks: { create: { ordinal: 0, page: 1, content: "A ratio compares two quantities. Two red balls and four blue balls have ratio 2:4, equivalent to 1:2.", embedding: vectorValue, embeddingModel: "test-embedding" } } } });
    app = spawn(process.execPath, ["node_modules/next/dist/bin/next", "dev", "--port", String(port), "--hostname", "127.0.0.1"], { cwd: process.cwd(), windowsHide: true, env: { ...process.env, DATABASE_URL: databaseUrl, DIRECT_URL: databaseUrl, AI_PROVIDER: "qwen", AI_MODEL: "fixture", AI_API_KEY: "fixture-only", AI_BASE_URL: providerUrl, AI_FALLBACK_PROVIDER: "qwen", AI_FALLBACK_MODEL: "fixture", EMBEDDING_MODEL: "test-embedding", EMBEDDING_BASE_URL: providerUrl, EMBEDDING_API_KEY: "fixture-only", NEXTAUTH_SECRET: "isolated-test-signing-key-not-for-real-users", VOICE_AGENT_SECRET: "isolated-voice-test-secret-not-for-real-users", NODE_ENV: "development", NEXT_TELEMETRY_DISABLED: "1", GURU_INTEGRATION_TEST: "true", ALLOW_DEMO_AUTH: "true", LIVEKIT_URL: "", LIVEKIT_API_KEY: "", LIVEKIT_API_SECRET: "", VOICE_AGENT_URL: "" }, stdio: ["ignore", "pipe", "pipe"] });
    for (const stream of [app.stdout, app.stderr]) stream?.on("data", (chunk) => { logs = (logs + chunk).slice(-10000); });
    await prisma.$disconnect();
    let ready = false;
    for (let index = 0; index < 90; index++) { if (app.exitCode !== null) break; try { if ((await fetch(base + "/api/health")).ok) { ready = true; break; } } catch {} await new Promise((resolve) => setTimeout(resolve, 1000)); }
    assert.ok(ready, "Test web server did not start");
    async function login(email: string) { const response = await fetch(base + "/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) }); assert.equal(response.status, 200, await response.text()); return response.headers.get("set-cookie")!.split(";")[0]; }
    const a = await login("a@fixture.test"), b = await login("b@fixture.test"), t = await login("teacher@fixture.test"), adminCookie = await login("admin@fixture.test");
    const verifiedAdmin = await fetch(base + "/api/auth/me", { headers: { Cookie: adminCookie } });
    assert.equal(verifiedAdmin.status, 200);
    const adminIdentity = await verifiedAdmin.json(); assert.equal(adminIdentity.user.id, admin.id); assert.equal(adminIdentity.user.role, "SUPER_ADMIN");
    console.log("PASS: bootstrapped fixture uses normal /api/auth/login and a database-revalidated Super Admin session");
    const principalA = await login("principal-a@fixture.test"), principalB = await login("principal-b@fixture.test"), teacherB = await login("teacher-b@fixture.test");
    async function call(path: string, cookie: string, body?: unknown, method = body ? "POST" : "GET") { return fetch(base + path, { method, headers: { Cookie: cookie, "Content-Type": "application/json", Origin: base }, ...(body ? { body: JSON.stringify(body) } : {}) }); }
    assert.equal((await call("/api/admin/teaching-settings", t)).status, 403);
    assert.equal((await call("/api/admin/teaching-settings", t, {})).status, 403);
    const teacherSettings = await (await call("/api/admin/teaching-settings", adminCookie)).json();
    assert.equal(teacherSettings.voice.configured, false);
    const voiceProbe = await call("/api/admin/teaching-settings", adminCookie, {});
    assert.equal(voiceProbe.status, 200);
    const probeResult = await voiceProbe.json(); assert.equal(probeResult.ok, false); assert.equal(probeResult.checks.length, 5);
    assert.doesNotMatch(JSON.stringify(probeResult), /isolated-voice-test-secret/);
    const enabled = await call("/api/admin/teaching-settings", adminCookie, { ...teacherSettings.settings, voiceEnabled: true }, "PUT");
    assert.equal(enabled.status, 200); assert.match((await enabled.json()).warning, /still needs/);
    assert.equal((await fetch(base + "/api/admin/teaching-settings", { method: "POST", headers: { Cookie: adminCookie, Origin: "https://attacker.invalid" } })).status, 403);
    console.log("PASS: voice setup checks require real Super Admin, reject CSRF and distinguish missing configuration from live readiness");
    const scopeA = { userId: studentA.id, schoolId: schoolA.id };
    const activity = { id: randomUUID(), kind: "QUESTION", grade: "Class 7", subject, chapterId: chapter.id, chapter: chapter.title, question: "What is 2:4 in simplest form?", answer: "1:2", createdAt: new Date().toISOString() };
    const events = [activity, { ...activity, id: randomUUID(), kind: "STARTED" }, { ...activity, id: randomUUID(), kind: "COMPLETED", durationSeconds: 120 }];
    assert.equal((await call("/api/learning/activity", a, { events, scope: scopeA })).status, 200);
    assert.equal((await call("/api/learning/activity", a, { events, scope: scopeA })).status, 200);
    const persisted = await (await call("/api/learning/activity", await login("a@fixture.test"))).json();
    assert.equal(persisted.events.length, 3); assert.ok(persisted.events.some((event: { kind: string }) => event.kind === "COMPLETED"));
    assert.equal(persisted.events.find((event: { kind: string }) => event.kind === "QUESTION").answer, "1:2");
    assert.equal((await (await call("/api/learning/activity", b)).json()).events.length, 0);
    assert.equal((await call("/api/learning/activity", b, { events, scope: scopeA })).status, 409);
    assert.equal((await call("/api/learning/activity", adminCookie)).status, 403);
    assert.equal((await fetch(base + "/api/learning/activity", { method: "POST", headers: { Cookie: a, "Content-Type": "application/json", Origin: "https://attacker.invalid" }, body: JSON.stringify({ events, scope: scopeA }) })).status, 403);
    // A signed membership switch must not expose the same user's other school history.
    await prisma.userRole.create({ data: { userId: studentA.id, roleId: roles.STUDENT, schoolId: schoolB.id } });
    process.env.NEXTAUTH_SECRET = "isolated-test-signing-key-not-for-real-users";
    const switched = `${SESSION_COOKIE_NAME}=${await createSessionToken({ userId: studentA.id, email: studentA.email, name: studentA.name, status: "ACTIVE", role: "STUDENT", schoolId: schoolB.id })}`;
    assert.equal((await (await call("/api/learning/activity", switched)).json()).events.length, 0);
    assert.equal((await call("/api/learning/activity", switched, { events, scope: scopeA })).status, 409);
    assert.equal((await call("/api/learning/activity", switched, { events, scope: { userId: studentA.id, schoolId: schoolB.id } })).status, 409);
    const history = await prisma.learningActivity.findMany({ where: { userId: studentA.id } }); assert.ok(history.every((event) => event.schoolId === schoolA.id));
    const demoLogin = await fetch(base + "/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: "student@demo.np", password: "password123" }) });
    assert.equal(demoLogin.status, 200); const demo = demoLogin.headers.get("set-cookie")!.split(";")[0];
    assert.equal((await call("/api/learning/activity", demo, { events, scope: scopeA })).status, 503);
    assert.equal((await call("/api/lessons", demo, {})).status, 503);
    assert.equal((await call("/api/admin/teaching-settings", demo, {})).status, 403);
    assert.equal(await prisma.user.count({ where: { id: { startsWith: "dev-" } } }), 0);
    console.log("PASS: authenticated question history, Guru activity, chapter completion, replay sync, same-user tenant isolation and browser-only demo personas");
    const create = await call("/api/lessons", a, { grade: "Class 7", subject: "math", chapterId: chapter.id, topic: "", language: "en", curriculumOnly: true });
    const created = await create.json(); assert.equal(create.status, 201, JSON.stringify(created)); const id = created.lesson.id;
    const unavailableVoice = await call("/api/voice/livekit-token", a, { lessonId: id });
    assert.equal(unavailableVoice.status, 503); assert.match((await unavailableVoice.json()).error, /setup is incomplete/);
    assert.equal((await call("/api/voice/livekit-token", b, { lessonId: id })).status, 404);
    assert.equal((await call("/api/voice/livekit-token", adminCookie, { lessonId: id })).status, 403);
    assert.equal((await call(`/api/lessons/${id}`, b)).status, 404);
    assert.equal((await call(`/api/lessons/${id}`, switched)).status, 404);
    assert.equal((await call(`/api/lessons/${id}`, b, { action: "pause" }, "PATCH")).status, 404);
    assert.equal((await call(`/api/lessons/${id}/messages`, b, { requestId: randomUUID(), message: "hello" })).status, 404);
    assert.equal((await call("/api/lessons", adminCookie)).status, 403);
    console.log("PASS: login, real lesson creation and cross-school / role isolation");
    async function message(text: string, kind = "MESSAGE", requestId = randomUUID()) { const response = await call(`/api/lessons/${id}/messages`, a, { requestId, message: text, kind }); assert.equal(response.status, 200, `message status ${response.status}`); const events = (await response.text()).trim().split("\n").map((line) => JSON.parse(line)); assert.equal(events.at(-1).type, "done", JSON.stringify(events)); return { events, requestId }; }
    const first = await message("Start this lesson", "START"); assert.ok(first.events.filter((event) => event.type === "text").length > 1);
    const answer = await message("2:4"); assert.equal(answer.events.at(-1).mastery, 12);
    const beforeReplay = generations; await message("2:4", "MESSAGE", answer.requestId); assert.equal(generations, beforeReplay);
    const saved = await (await call(`/api/lessons/${id}`, a)).json(); assert.equal(saved.mastery.attempts, 1); assert.equal(saved.turns.length, 2); assert.ok(saved.turns[1].sources[0].chunkId);
    await call(`/api/lessons/${id}`, a, { action: "pause" }, "PATCH");
    assert.equal((await call(`/api/lessons/${id}/messages`, a, { requestId: randomUUID(), message: "test" })).status, 409);
    await call(`/api/lessons/${id}`, a, { action: "resume" }, "PATCH");
    await message("Give me a hint", "HINT");
    const afterHint = await (await call(`/api/lessons/${id}`, a)).json(); assert.equal(afterHint.mastery.attempts, 1); assert.equal(afterHint.mastery.hints, 1);
    assert.equal((await call(`/api/lessons/${id}`, a, { action: "complete" }, "PATCH")).status, 409);
    console.log("PASS: pgvector-grounded streaming, semantic assessment, idempotency, pause/resume and hint accounting");
    const repeat = await message("2:4"); assert.equal(repeat.events.at(-1).mastery, 12, "Repeating a question must not award mastery again");
    const schoolReport = await (await call("/api/teacher/learning-report", principalA)).json(); assert.equal(schoolReport.mastery.length, 1);
    assert.equal((await call(`/api/teacher/learning-report?lessonId=${id}`, principalB)).status, 404);
    assert.equal((await call(`/api/teacher/learning-report?lessonId=${id}`, teacherB)).status, 404);
    const schoolView = await (await call("/api/school/manage", principalA)).json(); assert.equal(schoolView.school.id, schoolA.id); assert.ok(schoolView.users.every((entry: { user: { id: string } }) => entry.user.id !== studentB.id));
    assert.equal((await call("/api/school/manage", principalA, { action: "status", userId: studentB.id, status: "SUSPENDED" })).status, 403);
    assert.equal((await call("/api/school/manage", a)).status, 403);
    assert.equal((await call("/api/admin/users", t)).status, 403);
    assert.equal((await prisma.user.findUniqueOrThrow({ where: { id: studentB.id } })).status, "ACTIVE");
    console.log("PASS: school administrators cannot read or suspend another school's students; teacher cannot enter admin API");
    let report = await (await call("/api/teacher/learning-report", t)).json(); assert.equal(report.mastery.length, 0);
    await prisma.teacherAssignment.create({ data: { teacherId: teacher.id, schoolId: schoolA.id, grade: "Class 7", subject } });
    report = await (await call("/api/teacher/learning-report", t)).json(); assert.equal(report.mastery.length, 1); assert.equal(report.mastery[0].student.id, studentA.id);
    const transcript = await (await call(`/api/teacher/learning-report?lessonId=${id}`, t)).json(); assert.ok(transcript.lesson.turns.length);
    await prisma.enrollment.updateMany({ where: { studentId: studentA.id }, data: { status: "TRANSFERRED" } });
    assert.equal((await call(`/api/teacher/learning-report?lessonId=${id}`, t)).status, 404);
    assert.equal((await fetch(base + "/api/voice/agent", { method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer invalid" }, body: "{}" })).status, 401);
    const crossSite = await fetch(base + "/api/lessons", { method: "POST", headers: { Cookie: a, "Content-Type": "application/json", Origin: "https://attacker.invalid" }, body: "{}" }); assert.equal(crossSite.status, 403);
    console.log("PASS: teacher enrollment scope, source inspection, service-token denial and CSRF protection");
    await prisma.user.update({ where: { id: studentA.id }, data: { status: "SUSPENDED" } });
    assert.equal((await call(`/api/lessons/${id}`, a)).status, 403);
    await prisma.school.update({ where: { id: schoolB.id }, data: { status: "SUSPENDED" } });
    assert.equal((await call("/api/learning/activity", b)).status, 403);
    await prisma.userRole.updateMany({ where: { userId: teacher.id, schoolId: schoolA.id }, data: { roleId: roles.STUDENT } });
    assert.equal((await call("/api/teacher/learning-report", t)).status, 403);
    assert.equal((await fetch(base + "/api/learning/activity")).status, 401);
    console.log("PASS: current account, school and role changes invalidate stale access; anonymous access denied");
  } catch (error) { console.error(logs); throw error; }
  finally {
    if (app?.pid) { if (process.platform === "win32") { try { execFileSync("taskkill", ["/pid", String(app.pid), "/t", "/f"], { windowsHide: true, stdio: "ignore" }); } catch {} } else app.kill("SIGTERM"); }
    await prisma.$disconnect(); provider.closeAllConnections(); await new Promise<void>((resolve) => provider.close(() => resolve())); await socket.stop(); await db.close();
  }
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
