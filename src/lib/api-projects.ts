import { supabase } from "./supabase";
import { db } from "./db";
import { flushQueue } from "./sync";
import type { Project } from "../types";

export async function hydrateProjectsForSite(siteId: string): Promise<void> {
  const { data, error } = await supabase.from("projects")
    .select("*").eq("site_id", siteId).order("created_at");
  if (error) throw error;
  await db.transaction("rw", db.projects, async () => {
    const existing = await db.projects.where("site_id").equals(siteId).toArray();
    await db.projects.bulkDelete(existing.map(p => p.id));
    if (data && data.length) await db.projects.bulkAdd(data as Project[]);
  });
}

export async function getProject(projectId: string): Promise<Project | null> {
  // Try local first
  const local = await db.projects.get(projectId);
  if (local) return local;
  const { data, error } = await supabase.from("projects").select("*").eq("id", projectId).single();
  if (error) return null;
  if (data) await db.projects.put(data as Project);
  return data as Project;
}

export async function insertProject(input: {
  site_id: string;
  name: string;
  goals?: string;
  internal_notes?: string;
}): Promise<Project> {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const full: Project = {
    id, site_id: input.site_id, name: input.name,
    status: "capturing", goals: input.goals, internal_notes: input.internal_notes,
    created_at: now, updated_at: now,
  };
  await db.projects.add(full);
  await db.queue.add({
    kind: "insert_project",
    payload: full,
    created_at: Date.now(),
    status: "pending",
    retries: 0,
  });
  void flushQueue();
  return full;
}

export async function updateProject(id: string, patch: Partial<Project>): Promise<void> {
  await db.projects.update(id, patch);
  await db.queue.add({
    kind: "update_project",
    payload: { id, ...patch },
    created_at: Date.now(),
    status: "pending",
    retries: 0,
  });
  void flushQueue();
}

export async function deleteProject(id: string): Promise<void> {
  await db.projects.delete(id);
  await db.queue.add({
    kind: "delete_project",
    payload: { id },
    created_at: Date.now(),
    status: "pending",
    retries: 0,
  });
  void flushQueue();
}
