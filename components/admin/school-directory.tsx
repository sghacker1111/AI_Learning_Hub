"use client";
import * as React from "react";
type School = { id: string; name: string; code: string; status: string; address: string | null; subscription: { bundleCode: string; status: string } | null };
export function SchoolDirectory() {
  const [schools, setSchools] = React.useState<School[]>([]);
  const [message, setMessage] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  React.useEffect(() => { fetch("/api/admin/schools").then(async (response) => { const data = await response.json(); if (!response.ok) throw new Error(data.error); setSchools(data.schools); }).catch((error) => setMessage(error.message)); }, []);
  async function save(event: React.FormEvent<HTMLFormElement>, id: string) {
    event.preventDefault(); setBusy(true);
    const values = Object.fromEntries(new FormData(event.currentTarget));
    try { const response = await fetch("/api/admin/schools", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...values, id }) }); const data = await response.json(); if (!response.ok) throw new Error(data.error); setMessage("School updated. Inactive schools cannot use their learner accounts."); }
    catch (error) { setMessage(error instanceof Error ? error.message : "School update failed."); }
    finally { setBusy(false); }
  }
  return <section className="space-y-4 rounded-2xl border bg-background p-5"><h2 className="text-lg font-bold">School directory</h2>{message && <p role="status" className="text-sm text-muted-foreground">{message}</p>}<div className="grid gap-4 xl:grid-cols-2">{schools.map((school) => <form key={school.id} onSubmit={(event) => void save(event, school.id)} className="space-y-3 rounded-xl border p-4"><p className="text-xs font-bold text-muted-foreground">{school.code}</p><label className="block text-sm">School name<input name="name" defaultValue={school.name} required minLength={3} className="mt-1 w-full rounded-lg border bg-background p-2" /></label><label className="block text-sm">School status<select name="status" defaultValue={school.status} className="mt-1 w-full rounded-lg border bg-background p-2">{["ACTIVE","SUSPENDED","ARCHIVED","HIDDEN"].map((status) => <option key={status}>{status}</option>)}</select></label><p className="text-xs text-muted-foreground">{school.subscription ? `${school.subscription.bundleCode} · ${school.subscription.status}` : "No subscription assigned"}</p><button disabled={busy} className="rounded-lg border px-3 py-2 text-sm font-semibold disabled:opacity-40">Save school</button></form>)}</div>{!schools.length && !message && <p className="text-sm text-muted-foreground">No schools found.</p>}</section>;
}
