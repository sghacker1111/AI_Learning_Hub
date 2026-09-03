"use client";
import * as React from "react";
import { learningActivitySchema, learningCacheKey, mergeActivities, type LearningActivity, type ActivityInput } from "@/lib/learning/activity";

type SavedActivity = LearningActivity & { synced?: boolean };
type LearningContextValue = { events: LearningActivity[]; ready: boolean; status: string; role: "STUDENT" | "TEACHER"; record: (input: ActivityInput) => void; sync: () => Promise<void> };
const LearningContext = React.createContext<LearningContextValue | null>(null);

export function LearningProvider({ userId, schoolId, role, children }: { userId: string; schoolId?: string | null; role: "STUDENT" | "TEACHER"; children: React.ReactNode }) {
  const key = learningCacheKey(userId, schoolId);
  const current = React.useRef<SavedActivity[]>([]);
  const syncing = React.useRef(false);
  const cacheAvailable = React.useRef(true);
  const requestController = React.useRef<AbortController | null>(null);
  const [events, setEvents] = React.useState<LearningActivity[]>([]);
  const [ready, setReady] = React.useState(false);
  const [status, setStatus] = React.useState("Loading your learning record…");
  const persist = React.useCallback((items: SavedActivity[]) => {
    current.current = items;
    setEvents(items);
    try { localStorage.setItem(key, JSON.stringify(items)); cacheAvailable.current = true; }
    catch { cacheAvailable.current = false; setStatus("Browser storage unavailable. Unsynced activity may be lost when you leave."); }
  }, [key]);
  const sync = React.useCallback(async () => {
    if (syncing.current) return;
    if (userId.startsWith("dev-") || !schoolId) { React.startTransition(() => setStatus("Browser-only account · learning is not saved to the database.")); return; }
    syncing.current = true;
    const controller = new AbortController();
    requestController.current = controller;
    try {
      const response = await fetch("/api/learning/activity", { cache: "no-store", signal: controller.signal });
      if (!response.ok) throw new Error();
      const data = await response.json();
      if (data.scope?.userId !== userId || data.scope?.schoolId !== schoolId) throw new Error("Account changed");
      const saved = (data.events as unknown[]).flatMap((item) => { const parsed = learningActivitySchema.safeParse(item); return parsed.success ? [{ ...parsed.data, synced: true }] : []; });
      persist(mergeActivities(current.current, saved));
      while (current.current.some((item) => !item.synced)) {
        const batch = current.current.filter((item) => !item.synced).slice(0, 50);
        const result = await fetch("/api/learning/activity", { method: "POST", signal: controller.signal, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ events: batch, scope: { userId, schoolId } }) });
        if (!result.ok) throw new Error();
        const ids = new Set(batch.map((item) => item.id));
        persist(current.current.map((item) => ids.has(item.id) ? { ...item, synced: true } : item));
      }
      setStatus(data.unscopedCount ? "Saved to this school. Older unassigned records are preserved; ask your administrator to review their school." : "Saved to your school account · recent 1,000 activities");
    } catch { if (!controller.signal.aborted) setStatus(cacheAvailable.current ? "Browser copy retained. Account sync failed or your school changed; reload or use Sync after reconnecting." : "Not saved: browser storage and the account database are unavailable. Keep this page open."); }
    finally { syncing.current = false; }
  }, [persist, userId, schoolId]);
  React.useEffect(() => {
    let items: SavedActivity[] = [];
    try {
      const raw: unknown = JSON.parse(localStorage.getItem(key) || "[]");
      if (Array.isArray(raw)) items = raw.slice(0, 1000).flatMap((item) => { const parsed = learningActivitySchema.safeParse(item); return parsed.success ? [{ ...parsed.data, synced: item.synced === true }] : []; });
    } catch { /* A corrupted cache must not prevent learning. */ }
    current.current = items;
    // Hydration reads an external, account-scoped browser cache after server rendering.
    React.startTransition(() => { setEvents(items); setReady(true); });
    void sync();
    const reconnect = () => void sync();
    window.addEventListener("online", reconnect);
    return () => { window.removeEventListener("online", reconnect); requestController.current?.abort(); syncing.current = false; };
  }, [key, sync]);
  const record = React.useCallback((input: ActivityInput) => {
    const parsed = learningActivitySchema.parse({ ...input, id: crypto.randomUUID(), createdAt: new Date().toISOString() });
    persist(mergeActivities(current.current, [parsed]));
    setStatus("Saved in this browser · syncing to account…");
    void sync();
  }, [persist, sync]);
  return <LearningContext.Provider value={{ events, ready, status, role, record, sync }}>{children}</LearningContext.Provider>;
}
export function useLearning() {
  const context = React.useContext(LearningContext);
  if (!context) throw new Error("LearningProvider is required.");
  return context;
}
