import { supabase } from "./supabase";
import { db } from "./db";
import type { Site } from "../types";

export async function listSites(): Promise<Site[]> {
  const { data, error } = await supabase
    .from("sites").select("*")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return data as Site[];
}

export async function createSite(input: {
  customer_name: string; property_address: string;
  map_center_lat: number; map_center_lng: number; map_zoom: number;
}): Promise<Site> {
  const { data, error } = await supabase
    .from("sites").insert({ ...input, status: "capturing" })
    .select().single();
  if (error) throw error;
  return data as Site;
}

export async function deleteSite(siteId: string): Promise<void> {
  // 1. Remove storage objects for this site (private bucket — paginate just in case)
  const { data: files, error: listErr } = await supabase.storage
    .from("site-photos")
    .list(siteId, { limit: 1000 });
  if (listErr) throw listErr;
  if (files && files.length) {
    const paths = files.map(f => `${siteId}/${f.name}`);
    const { error: rmErr } = await supabase.storage.from("site-photos").remove(paths);
    if (rmErr) throw rmErr;
  }
  // 2. Delete proposals (no cascade FK)
  const { error: propErr } = await supabase.from("proposals").delete().eq("site_id", siteId);
  if (propErr) throw propErr;
  // 3. Delete site (cascades to targets and photos)
  const { error: siteErr } = await supabase.from("sites").delete().eq("id", siteId);
  if (siteErr) throw siteErr;
  // 4. Wipe local Dexie data for this site
  await db.transaction("rw", db.sites, db.targets, db.photos, db.pendingBlobs, async () => {
    await db.sites.delete(siteId);
    await db.targets.where("site_id").equals(siteId).delete();
    await db.photos.where("site_id").equals(siteId).delete();
    await db.pendingBlobs.where("siteId").equals(siteId).delete();
  });
}
