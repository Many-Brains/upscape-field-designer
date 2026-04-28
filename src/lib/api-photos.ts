import { supabase } from "./supabase";
import type { Photo } from "../types";

export async function uploadPhoto(args: {
  siteId: string; targetId: string | null; blob: Blob;
  capturedLat?: number; capturedLng?: number;
}): Promise<Photo> {
  const id = crypto.randomUUID();
  const path = `site-photos/${args.siteId}/${id}.jpg`;
  const up = await supabase.storage.from("site-photos")
    .upload(path.replace(/^site-photos\//, ""), args.blob, { contentType: "image/jpeg" });
  if (up.error) throw up.error;

  const { data, error } = await supabase.from("photos").insert({
    id,
    site_id: args.siteId,
    target_id: args.targetId,
    storage_path: path,
    captured_at: new Date().toISOString(),
    captured_lat: args.capturedLat,
    captured_lng: args.capturedLng,
  }).select().single();
  if (error) throw error;
  return data as Photo;
}

export async function listPhotosForTarget(targetId: string): Promise<Photo[]> {
  const { data, error } = await supabase.from("photos")
    .select("*").eq("target_id", targetId).order("captured_at");
  if (error) throw error;
  return data as Photo[];
}
