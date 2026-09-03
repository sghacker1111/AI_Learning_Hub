"use client";
import * as React from "react";
type Account = { id: string; name: string; email: string; role: "STUDENT" | "TEACHER" | "SCHOOL_ADMIN"; status: "ACTIVE"; schoolName: string; createdAt: string };
export function CreateUserForm({ defaultRole, onCreated }: { defaultRole: "STUDENT" | "TEACHER"; onCreated: (user: Account) => void }) {
  const [schools, setSchools] = React.useState<{ id: string; name: string; status: string }[]>([]);
  const [message, setMessage] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  React.useEffect(() => { fetch("/api/admin/schools").then((response) => response.json()).then((data) => setSchools(data.schools || [])).catch(() => setMessage("Schools could not load.")); }, []);
  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage("");
    const form = event.currentTarget;
    try {
      const data = Object.fromEntries(new FormData(form));
      const response = await fetch("/api/admin/accounts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Account could not be created.");
      onCreated(result.user); form.reset(); setMessage("Account created successfully.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Account could not be created."); }
    finally { setBusy(false); }
  }
  return <details className="rounded-2xl border bg-background p-5"><summary className="cursor-pointer font-bold">Add {defaultRole === "TEACHER" ? "teacher" : "student"} login</summary><form onSubmit={save} className="mt-5 grid gap-4 sm:grid-cols-2"><label className="text-sm">Full name<input name="name" minLength={2} maxLength={120} required className="mt-2 w-full rounded-xl border bg-background p-3" /></label><label className="text-sm">Email<input name="email" type="email" required className="mt-2 w-full rounded-xl border bg-background p-3" /></label><label className="text-sm">Password<input name="password" type="password" minLength={10} maxLength={128} autoComplete="new-password" required className="mt-2 w-full rounded-xl border bg-background p-3" /></label><input type="hidden" name="role" value={defaultRole} /><label className="text-sm">School<select name="schoolId" required defaultValue="" className="mt-2 w-full rounded-xl border bg-background p-3"><option value="">Select an active school</option>{schools.filter((school) => school.status === "ACTIVE").map((school) => <option key={school.id} value={school.id}>{school.name}</option>)}</select></label><button disabled={busy || !schools.some((school) => school.status === "ACTIVE")} className="rounded-xl bg-indigo-600 p-3 font-semibold text-white disabled:opacity-40">{busy ? "Saving…" : "Create login"}</button>{!schools.length && <p className="text-sm text-muted-foreground">Create a school first. A connected database is required.</p>}<p role="status" className="text-sm sm:col-span-2">{message}</p></form></details>;
}
