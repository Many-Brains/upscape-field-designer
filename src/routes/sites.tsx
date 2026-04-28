import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listSites, deleteSite } from "../lib/api";
import type { Site } from "../types";

export function SitesListRoute() {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    listSites().then(setSites).finally(() => setLoading(false));
  }, []);

  async function handleDelete(s: Site) {
    if (!confirm(`Delete ${s.customer_name}?\n\nThis permanently removes the site, all targets, photos, and any draft proposals. Cannot be undone.`)) return;
    setDeleting(s.id);
    try {
      await deleteSite(s.id);
      setSites(prev => prev.filter(x => x.id !== s.id));
    } catch (e: any) {
      console.error("[delete site]", e);
      alert("Delete failed:\n\n" + (e?.message ?? String(e)));
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-4 gap-2">
        <h1 className="text-2xl font-bold flex-1">Sites</h1>
        <Link to="/settings" className="text-gray-400 px-3 py-2 text-2xl" aria-label="Settings">⚙</Link>
        <Link to="/sites/new" className="bg-upscape-orange text-black px-4 py-2 rounded font-bold">
          + New Site
        </Link>
      </div>
      {loading && <p>Loading…</p>}
      {!loading && sites.length === 0 && <p className="text-gray-500">No sites yet.</p>}
      <ul className="space-y-2">
        {sites.map((s) => (
          <li key={s.id} className="bg-upscape-panel p-3 rounded flex items-start gap-2">
            <Link to={`/sites/${s.id}`} className="block flex-1 min-w-0">
              <div className="font-bold truncate">{s.customer_name}</div>
              <div className="text-gray-400 text-sm truncate">{s.property_address}</div>
              <div className="text-gray-500 text-xs mt-1">
                {s.status} · updated {new Date(s.updated_at).toLocaleString()}
              </div>
            </Link>
            <button
              onClick={() => handleDelete(s)}
              disabled={deleting === s.id}
              className="text-gray-500 hover:text-red-400 px-3 py-2 text-sm flex-shrink-0 disabled:opacity-50"
              aria-label={`Delete ${s.customer_name}`}
            >
              {deleting === s.id ? "…" : "🗑"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
