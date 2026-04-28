import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listSites } from "../lib/api";
import type { Site } from "../types";

export function SitesListRoute() {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    listSites().then(setSites).finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Sites</h1>
        <Link to="/sites/new" className="bg-upscape-orange text-black px-4 py-2 rounded font-bold">
          + New Site
        </Link>
      </div>
      {loading && <p>Loading…</p>}
      {!loading && sites.length === 0 && <p className="text-gray-500">No sites yet.</p>}
      <ul className="space-y-2">
        {sites.map((s) => (
          <li key={s.id} className="bg-upscape-panel p-3 rounded">
            <Link to={`/sites/${s.id}`} className="block">
              <div className="font-bold">{s.customer_name}</div>
              <div className="text-gray-400 text-sm">{s.property_address}</div>
              <div className="text-gray-500 text-xs mt-1">
                {s.status} · updated {new Date(s.updated_at).toLocaleString()}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
