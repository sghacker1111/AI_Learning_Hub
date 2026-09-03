import assert from "node:assert/strict";
import nextEnv from "@next/env";
nextEnv.loadEnvConfig(process.cwd(), true, { info() {}, error() {} });
const base = process.env.SMOKE_BASE_URL || "http://localhost:3000";
const password = process.env.DEMO_PASSWORD || "password123";
async function login(email) {
  const response = await fetch(`${base}/api/auth/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
  assert.equal(response.status, 200, `Development login: ${email}`);
  return response.headers.get("set-cookie").split(";")[0];
}
const student = await login("student@demo.np");
const teacher = await login("teacher@demo.np");
const admin = await login("admin@ailearning.np");
async function check(path, cookie, status, location) {
  const response = await fetch(base + path, { headers: { cookie }, redirect: "manual" });
  assert.equal(response.status, status, path);
  if (location) assert.equal(new URL(response.headers.get("location"), base).pathname, location);
  console.log(`PASS ${status} ${path}${location ? ` -> ${location}` : ""}`);
}
await check("/student/dashboard", student, 200);
await check("/student/learning", student, 200);
await check("/student/guru-ai", student, 200);
await check("/student/practice", student, 307, "/student/guru-ai");
await check("/teacher/learning", teacher, 200);
await check("/teacher/guru-ai", teacher, 200);
await check("/teacher/exams", teacher, 200);
await check("/admin/users", admin, 200);
await check("/admin/specification-grids", admin, 200);
await check("/student/dashboard", admin, 307, "/admin");
await check("/teacher/guru-ai", admin, 307, "/admin");
await check("/api/admin/questions", student, 403);
await check("/api/learning/activity", admin, 403);
const invalid = await fetch(`${base}/api/admin/specification-grids`, { method: "POST", headers: { cookie: admin, "Content-Type": "application/json" }, body: JSON.stringify({}) });
assert.equal(invalid.status, 400);
console.log("PASS invalid specification grid rejected");
if (process.argv.includes("--ai")) {
  const response = await fetch(`${base}/api/tutor/chat`, { method: "POST", headers: { cookie: student, "Content-Type": "application/json" }, body: JSON.stringify({ message: "Simplify the ratio 6:9. Give a short explanation.", grade: "Class 7", subject: "Compulsory Mathematics", chapter: "Ratio and Proportion", language: "en", persona: "ram_sir", tutorMode: "teach_me", curriculumOnly: false }) });
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.ok(data.message?.content);
  assert.notEqual(data.isSimulated, true);
  console.log(JSON.stringify({ provider: data.provider, simulated: Boolean(data.isSimulated), answer: data.message.content }));
}
