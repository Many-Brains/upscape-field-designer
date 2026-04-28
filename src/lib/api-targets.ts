import { supabase } from "./supabase";
import type { Target } from "../types";

export async function listTargets(siteId: string): Promise<Target[]> {
  const { data, error } = await supabase.from("targets")
    .select("*").eq("site_id", siteId).order("order_index");
  if (error) throw error;
  return data as Target[];
}

export async function insertTarget(t: Omit<Target, "id">): Promise<Target> {
  const { data, error } = await supabase.from("targets").insert(t).select().single();
  if (error) throw error;
  return data as Target;
}

export async function deleteTarget(id: string) {
  const { error } = await supabase.from("targets").delete().eq("id", id);
  if (error) throw error;
}
