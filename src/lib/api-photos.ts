import { supabase } from "./supabase";
import { db } from "./db";
import { flushQueue } from "./sync";
import type { Photo } from "../types";

export async function hydratePhotosForSite(siteId: string): Promise<void> {
  const { data, error } = await supabase.from("photos")
    .select("*").eq("site_id", siteId).order("captured_at");
  if (error) throw error;
  await db.transaction("rw", db.photos, async () => {
    const existing = await db.photos.where("site_id").equals(siteId).toArray();
    await db.photos.bulkDelete(existing.map(p => p.id));
    if (data && data.length) await db.photos.bulkAdd(data as Photo[]);
  });
}

export async function listPhotosForTarget(targetId: string): Promise<Photo[]> {
  return db.photos.where("target_id").equals(targetId).sortBy("captured_at");
}

export async function uploadPhoto(args: {
  siteId: string; targetId: string | null; blob: Blob;
  capturedLat?: number; capturedLng?: number;
}): Promise<Photo> {
  const id = crypto.randomUUID();
  const captured_at = new Date().toISOString();
  await db.pendingBlobs.put({ id, blob: args.blob, siteId: args.siteId, targetId: args.targetId });
  const local: Photo = {
    id, site_id: args.siteId, target_id: args.targetId,
    storage_path: `site-photos/${args.siteId}/${id}.jpg`,
    thumbnail_path: null,
    captured_at,
    captured_lat: args.capturedLat, captured_lng: args.capturedLng,
    caption: undefined, order_index: 0,
  };
  await db.photos.add(local);
  await db.queue.add({
    kind: "upload_photo",
    payload: { id, siteId: args.siteId, targetId: args.targetId, captured_at,
               captured_lat: args.capturedLat, captured_lng: args.capturedLng },
    created_at: Date.now(),
    status: "pending",
    retries: 0,
  });
  void flushQueue();
  return local;
}
