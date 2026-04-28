import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../lib/db";

export function SyncStatus() {
  const pending = useLiveQuery(() => db.queue.where("status").equals("pending").count(), []) ?? 0;
  const failed = useLiveQuery(() => db.queue.where("status").equals("failed").count(), []) ?? 0;
  if (failed > 0) return <span className="text-red-400 text-xs font-mono">⚠ {failed} failed</span>;
  if (pending > 0) return <span className="text-yellow-400 text-xs font-mono">⟳ {pending} syncing</span>;
  return <span className="text-green-400 text-xs font-mono">✓ synced</span>;
}
