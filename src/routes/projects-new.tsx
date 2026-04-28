import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { insertProject } from "../lib/api-projects";

export function NewProjectRoute() {
  const { siteId } = useParams<{ siteId: string }>();
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [goals, setGoals] = useState("");
  const [internalNotes, setInternalNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!siteId) return;
    setBusy(true); setErr(null);
    try {
      const project = await insertProject({
        site_id: siteId,
        name: name.trim(),
        goals: goals.trim() || undefined,
        internal_notes: internalNotes.trim() || undefined,
      });
      nav(`/sites/${siteId}/projects/${project.id}`);
    } catch (e: any) {
      setErr(e?.message ?? String(e));
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="p-4 max-w-md mx-auto flex flex-col gap-3">
      <Link to={`/sites/${siteId}`} className="text-upscape-orange text-xs">← Back</Link>
      <h1 className="text-2xl font-bold">New Project</h1>
      <input
        required placeholder='Project name (e.g., "Front Yard 2026")'
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
        {busy ? "Creating…" : "Start Capture"}
      </button>
      {err && <p className="text-red-400">{err}</p>}
    </form>
  );
}
