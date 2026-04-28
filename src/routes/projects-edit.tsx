import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getProject, updateProject } from "../lib/api-projects";
import type { Project } from "../types";

export function EditProjectRoute() {
  const { siteId, projectId } = useParams<{ siteId: string; projectId: string }>();
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [goals, setGoals] = useState("");
  const [internalNotes, setInternalNotes] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;
    getProject(projectId).then((p: Project | null) => {
      if (!p) {
        setErr("Project not found");
        setLoaded(true);
        return;
      }
      setName(p.name);
      setGoals(p.goals ?? "");
      setInternalNotes(p.internal_notes ?? "");
      setLoaded(true);
    });
  }, [projectId]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!projectId || !siteId) return;
    setBusy(true); setErr(null);
    try {
      await updateProject(projectId, {
        name: name.trim(),
        goals: goals.trim() || undefined,
        internal_notes: internalNotes.trim() || undefined,
      });
      nav(`/sites/${siteId}`);
    } catch (e: any) {
      setErr(e?.message ?? String(e));
      setBusy(false);
    }
  }

  if (!loaded) return <div className="p-6 text-gray-500">Loading…</div>;

  return (
    <form onSubmit={submit} className="p-4 max-w-md mx-auto flex flex-col gap-3">
      <Link to={`/sites/${siteId}`} className="text-upscape-orange text-xs">← Back</Link>
      <h1 className="text-2xl font-bold">Edit Project</h1>
      <input
        required placeholder="Project name"
        value={name} onChange={(e) => setName(e.target.value)}
        className="rounded p-3 bg-upscape-panel border border-upscape-rule text-white"
      />
      <label className="block text-xs uppercase text-upscape-orange mt-2">Customer Goals</label>
      <textarea
        rows={4}
        placeholder="What does the customer want? Tap the keyboard's mic icon to dictate."
        value={goals} onChange={(e) => setGoals(e.target.value)}
        className="rounded p-3 bg-upscape-panel border border-upscape-rule text-white"
      />
      <label className="block text-xs uppercase text-upscape-orange mt-2">Internal Notes</label>
      <textarea
        rows={4}
        placeholder="Things only Hayes/Ross need to remember (access, dogs, gotchas…)."
        value={internalNotes} onChange={(e) => setInternalNotes(e.target.value)}
        className="rounded p-3 bg-upscape-panel border border-upscape-rule text-white"
      />
      <button disabled={busy} className="rounded p-3 bg-upscape-orange text-black font-bold disabled:opacity-50">
        {busy ? "Saving…" : "Save"}
      </button>
      {err && <p className="text-red-400">{err}</p>}
    </form>
  );
}
