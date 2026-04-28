import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { supabase } from "../lib/supabase";
import { db } from "../lib/db";
import { hydrateProjectsForSite, deleteProject } from "../lib/api-projects";
import type { Site, Project } from "../types";

export function SiteDetailRoute() {
  const { siteId } = useParams<{ siteId: string }>();
  const [site, setSite] = useState<Site | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const projects = useLiveQuery<Project[]>(
    () => siteId ? db.projects.where("site_id").equals(siteId).sortBy("created_at") : Promise.resolve<Project[]>([]),
    [siteId],
  ) ?? [];

  useEffect(() => {
    if (!siteId) return;
    supabase.from("sites").select("*").eq("id", siteId).single().then(({ data }) => setSite(data as Site));
    hydrateProjectsForSite(siteId).catch(err => console.warn("[hydrate projects]", err));
  }, [siteId]);

  async function handleDelete(p: Project) {
    if (!confirm(`Delete project "${p.name}"?\n\nThis removes all its targets and photos. Cannot be undone.`)) return;
    setDeletingId(p.id);
    try {
      await deleteProject(p.id);
    } catch (e: any) {
      alert("Delete failed:\n\n" + (e?.message ?? String(e)));
    } finally {
      setDeletingId(null);
    }
  }

  if (!site) return <div className="p-6 text-gray-500">Loading…</div>;

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <Link to="/" className="text-upscape-orange text-xs">← Sites</Link>
      <h1 className="text-2xl font-bold mt-1">{site.customer_name}</h1>
      <p className="text-sm text-gray-400 mb-4">{site.property_address}</p>

      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-bold">Projects</h2>
        <Link to={`/sites/${siteId}/projects/new`} className="bg-upscape-orange text-black px-4 py-2 rounded font-bold">
          + New Project
        </Link>
      </div>

      {projects.length === 0 && <p className="text-gray-500">No projects yet.</p>}
      <ul className="space-y-2">
        {projects.map((p) => (
          <li key={p.id} className="bg-upscape-panel p-3 rounded flex items-start gap-2">
            <Link to={`/sites/${siteId}/projects/${p.id}`} className="block flex-1 min-w-0">
              <div className="font-bold truncate">{p.name}</div>
              <div className="text-gray-500 text-xs mt-1">
                {p.status} · updated {new Date(p.updated_at).toLocaleString()}
              </div>
              {p.goals && <div className="text-gray-400 text-sm mt-1 line-clamp-2">{p.goals}</div>}
            </Link>
            <Link
              to={`/sites/${siteId}/projects/${p.id}/edit`}
              className="text-gray-500 hover:text-upscape-orange px-3 py-2 text-sm flex-shrink-0"
              aria-label={`Edit ${p.name}`}
            >
              ✏️
            </Link>
            <button
              onClick={() => handleDelete(p)}
              disabled={deletingId === p.id}
              className="text-gray-500 hover:text-red-400 px-3 py-2 text-sm flex-shrink-0 disabled:opacity-50"
              aria-label={`Delete ${p.name}`}
            >
              {deletingId === p.id ? "…" : "🗑"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
