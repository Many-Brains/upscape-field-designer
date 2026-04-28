import { supabase } from "./supabase";
import { db } from "./db";
import { flushQueue } from "./sync";
import type { Target } from "../types";

/**
 * Hydrate Dexie from Supabase for a given site.
 * Called when a site is loaded so the local DB matches server state on entry.
 */
export async function hydrateTargetsForSite(siteId: string): Promise<void> {
  const { data, error } = await supabase.from("targets")
    .select("*").eq("site_id", siteId).order("order_index");
  if (error) throw error;
  // Replace local rows for this site with server rows
  await db.transaction("rw", db.targets, async () => {
    const existing = await db.targets.where("site_id").equals(siteId).toArray();
    await db.targets.bulkDelete(existing.map(t => t.id));
    if (data && data.length) await db.targets.bulkAdd(data as Target[]);
  });
}

/**
 * Hydrate Dexie from Supabase for a given project.
 * Called when a project is loaded so the local DB matches server state on entry.
 */
export async function hydrateTargetsForProject(projectId: string): Promise<void> {
  const { data, error } = await supabase.from("targets")
    .select("*").eq("project_id", projectId).order("order_index");
  if (error) throw error;
  await db.transaction("rw", db.targets, async () => {
    const existing = await db.targets.where("project_id").equals(projectId).toArray();
    await db.targets.bulkDelete(existing.map(t => t.id));
    if (data && data.length) await db.targets.bulkAdd(data as Target[]);
  });
}

/** Read targets from local Dexie (call useLiveQuery in components instead for reactivity). */
export async function listTargets(siteId: string): Promise<Target[]> {
  return db.targets.where("site_id").equals(siteId).sortBy("order_index");
}

export async function insertTarget(t: Omit<Target, "id">): Promise<Target> {
  const id = crypto.randomUUID();
  const full: Target = { ...t, id };
  await db.targets.add(full);
  await db.queue.add({
    kind: "insert_target",
    payload: full,
    created_at: Date.now(),
    status: "pending",
    retries: 0,
  });
  void flushQueue();
  return full;
}

export async function updateTarget(id: string, patch: Partial<Target>): Promise<void> {
  await db.targets.update(id, patch);
  await db.queue.add({
    kind: "update_target",
    payload: { id, ...patch },
    created_at: Date.now(),
    status: "pending",
    retries: 0,
  });
  void flushQueue();
}

export async function deleteTarget(id: string): Promise<void> {
  await db.targets.delete(id);
  await db.queue.add({
    kind: "delete_target",
    payload: { id },
    created_at: Date.now(),
    status: "pending",
    retries: 0,
  });
  void flushQueue();
}
