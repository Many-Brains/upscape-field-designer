import { db } from "./db";
import type { QueuedOp } from "./db";
import { supabase } from "./supabase";

let running = false;

export async function flushQueue() {
  if (running) return;
  if (!navigator.onLine) return;
  running = true;
  try {
    while (true) {
      const op = await db.queue.where("status").equals("pending").first();
      if (!op) break;
      await db.queue.update(op.id!, { status: "in_flight" });
      try {
        await execute(op);
        await db.queue.delete(op.id!);
      } catch (e: any) {
        await db.queue.update(op.id!, {
          status: op.retries >= 3 ? "failed" : "pending",
          error: String(e),
          retries: op.retries + 1,
        });
        if (op.retries >= 3) break;
      }
    }
  } finally {
    running = false;
  }
}

async function execute(op: QueuedOp) {
  switch (op.kind) {
    case "insert_target": {
      const { error } = await supabase.from("targets").insert(op.payload);
      if (error) throw error;
      break;
    }
    case "update_target": {
      const { id, ...patch } = op.payload;
      const { error } = await supabase.from("targets").update(patch).eq("id", id);
      if (error) throw error;
      break;
    }
    case "delete_target": {
      const { error } = await supabase.from("targets").delete().eq("id", op.payload.id);
      if (error) throw error;
      break;
    }
    case "upload_photo": {
      const { id, siteId, targetId } = op.payload;
      const blobRow = await db.pendingBlobs.get(id);
      if (!blobRow) throw new Error("blob missing");
      const path = `${siteId}/${id}.jpg`;
      const up = await supabase.storage.from("site-photos")
        .upload(path, blobRow.blob, { contentType: "image/jpeg" });
      if (up.error) throw up.error;
      const { error } = await supabase.from("photos").insert({
        id, site_id: siteId, target_id: targetId,
        storage_path: `site-photos/${path}`,
        captured_at: op.payload.captured_at,
        captured_lat: op.payload.captured_lat,
        captured_lng: op.payload.captured_lng,
      });
      if (error) throw error;
      await db.pendingBlobs.delete(id);
      break;
    }
    case "update_site": {
      const { id, ...patch } = op.payload;
      const { error } = await supabase.from("sites").update(patch).eq("id", id);
      if (error) throw error;
      break;
    }
    case "insert_project": {
      const { error } = await supabase.from("projects").insert(op.payload);
      if (error) throw error;
      break;
    }
    case "update_project": {
      const { id, ...patch } = op.payload;
      const { error } = await supabase.from("projects").update(patch).eq("id", id);
      if (error) throw error;
      break;
    }
    case "delete_project": {
      const { error } = await supabase.from("projects").delete().eq("id", op.payload.id);
      if (error) throw error;
      break;
    }
  }
}

export function startSyncLoop() {
  window.addEventListener("online", flushQueue);
  setInterval(flushQueue, 15_000);
  flushQueue();
}
