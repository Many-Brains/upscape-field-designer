import Dexie, { type Table } from "dexie";
import type { Site, Target, Photo } from "../types";

export interface QueuedOp {
  id?: number;
  kind: "insert_target" | "update_target" | "delete_target" | "upload_photo" | "update_site";
  payload: any;
  created_at: number;
  status: "pending" | "in_flight" | "failed";
  error?: string;
  retries: number;
}

export interface PendingBlob {
  id: string;
  blob: Blob;
  siteId: string;
  targetId: string | null;
}

export class FieldDB extends Dexie {
  sites!: Table<Site, string>;
  targets!: Table<Target, string>;
  photos!: Table<Photo, string>;
  queue!: Table<QueuedOp, number>;
  // Local blob storage for queued photos before upload
  pendingBlobs!: Table<PendingBlob, string>;

  constructor() {
    super("upscape-field");
    this.version(1).stores({
      sites: "id, customer_name, status, updated_at",
      targets: "id, site_id, type, order_index",
      photos: "id, site_id, target_id, captured_at",
      queue: "++id, status, created_at",
      pendingBlobs: "id, siteId, targetId",
    });
  }
}

export const db = new FieldDB();
