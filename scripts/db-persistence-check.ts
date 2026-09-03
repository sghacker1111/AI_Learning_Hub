import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";
import { randomUUID } from "node:crypto";
import assert from "node:assert/strict";
import { inspectDatabaseConfiguration } from "../lib/db/config-check";

class ProbeRollback extends Error {}

/** Explicit opt-in: synthetic records exist only inside a rolled-back transaction. */
async function main() {
  if (!process.argv.includes("--rollback-probe")) throw new Error("Run with --rollback-probe to authorize the non-committing write/read check.");
  loadEnvConfig(process.cwd(), process.env.NODE_ENV !== "production");
  const config = inspectDatabaseConfiguration(process.env);
  if (config.errors.length) { console.error(config.errors.join("\n")); process.exitCode = 1; return; }
  const db = new PrismaClient({ log: [] });
  const prefix = `verification-${randomUUID()}`;
  const studentId = `${prefix}-student`, schoolId = `${prefix}-school`;
  let exercised = false;
  try {
    try {
      await db.$transaction(async (tx) => {
        await tx.school.create({ data: { id: schoolId, code: prefix, name: "Transaction-only persistence verification" } });
        await tx.user.create({ data: { id: studentId, name: "Transaction-only verification", email: `${prefix}@example.invalid`, status: "ARCHIVED" } });
        const selection = { grade: "Class 7", subject: "Mathematics", chapterId: "verification-ratios", chapter: "Ratios", topic: "Equivalent ratios" };
        const activity = { ...selection, userId: studentId, schoolId, question: "Simplify 2:4", answer: "1:2" };
        const events = ["STARTED", "QUESTION", "COMPLETED"].map((kind) => ({ ...activity, id: randomUUID(), kind }));
        await tx.learningActivity.createMany({ data: events });
        assert.equal((await tx.learningActivity.createMany({ data: events, skipDuplicates: true })).count, 0);
        const saved = await tx.learningActivity.findMany({ where: { userId: studentId, schoolId } });
        assert.equal(saved.length, 3);
        assert.ok(saved.some((item) => item.kind === "QUESTION" && item.answer === "1:2"));
        assert.ok(saved.some((item) => item.kind === "COMPLETED"));
        assert.equal(await tx.learningActivity.count({ where: { userId: studentId, schoolId: "different-school" } }), 0);
        const lesson = await tx.guruLesson.create({ data: { ...selection, subjectKey: "math", studentId, schoolId, objective: "Compare ratios", events: { create: { type: "START" } }, turns: { create: { requestId: randomUUID(), kind: "MESSAGE", input: "Simplify 2:4", answer: "1:2", status: "COMPLETE", sources: [], whiteboard: [] } } } });
        await tx.guruLesson.update({ where: { id: lesson.id }, data: { status: "PAUSED", events: { create: { type: "PAUSE" } } } });
        const restored = await tx.guruLesson.findFirstOrThrow({ where: { id: lesson.id, studentId, schoolId }, include: { turns: true, events: true } });
        assert.equal(restored.status, "PAUSED"); assert.equal(restored.turns[0].answer, "1:2"); assert.equal(restored.events.length, 2);
        assert.equal(await tx.guruLesson.count({ where: { id: lesson.id, schoolId: "different-school" } }), 0);
        exercised = true;
        throw new ProbeRollback();
      }, { maxWait: 15000, timeout: 60000 });
    } catch (error) { if (!(error instanceof ProbeRollback)) throw error; }
    assert.ok(exercised);
    assert.equal(await db.user.count({ where: { id: studentId } }), 0);
    assert.equal(await db.school.count({ where: { id: schoolId } }), 0);
    assert.equal(await db.learningActivity.count({ where: { userId: studentId } }), 0);
    assert.equal(await db.guruLesson.count({ where: { studentId } }), 0);
    console.log("PASS: Neon runtime write/read, question history, chapter completion, activity idempotency, lesson/transcript/events and tenant-scoped queries.");
    console.log("PASS: transaction rolled back; no verification accounts or records persisted. This is not a committed authenticated-user end-to-end test.");
  } finally { await db.$disconnect(); }
}
main().catch((error) => { const code = error && typeof error === "object" && "code" in error ? String(error.code) : "CHECK_FAILED"; console.error(`Persistence check failed (${code}); sensitive details withheld.`); process.exitCode = 1; });
