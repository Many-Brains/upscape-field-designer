import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import type { Target, TargetType } from "../../types";
import { PhotoCapture } from "../Photo/PhotoCapture";
import { db } from "../../lib/db";

const OPTIONS_BY_TYPE: Record<TargetType, { key: string; label: string; type: "boolean" | "number" }[]> = {
  specimen_tree: [{ key: "large_canopy", label: "Large canopy (paired)", type: "boolean" }],
  tree_run: [{ key: "spacing_ft", label: "Spacing (ft)", type: "number" }],
  walkway: [{ key: "spacing_ft", label: "Spacing (ft)", type: "number" }],
  garden_bed: [{ key: "edge_spacing_ft", label: "Edge spacing (ft)", type: "number" }],
  facade: [{ key: "include_portico_downlight", label: "Include portico downlight", type: "boolean" }],
  architectural_feature: [],
  receptacle: [],
  custom_fixture: [],
};

interface Props {
  target: Target;
  siteId: string;
  onSave: (patch: Partial<Target>) => void;
  onDelete: () => void;
  onClose: () => void;
}

export function TargetDetailModal({ target, siteId, onSave, onDelete, onClose }: Props) {
  const [label, setLabel] = useState(target.label ?? "");
  const [notes, setNotes] = useState(target.notes ?? "");
  const [options, setOptions] = useState<Record<string, unknown>>(target.options ?? {});

  const photos = useLiveQuery(
    () => db.photos.where("target_id").equals(target.id).sortBy("captured_at"),
    [target.id],
  ) ?? [];

  return (
    <div className="fixed inset-0 bg-black/70 z-[2000] flex items-end sm:items-center justify-center p-2">
      <div className="bg-upscape-panel w-full max-w-md p-4 rounded-t-2xl sm:rounded-2xl">
        <h2 className="text-lg font-bold mb-2">{target.type.replace("_", " ")}</h2>
        <label className="block text-xs uppercase text-upscape-orange mb-1">Label</label>
        <input value={label} onChange={(e) => setLabel(e.target.value)}
               className="w-full p-2 mb-3 bg-upscape-bg rounded border border-upscape-rule" />

        {OPTIONS_BY_TYPE[target.type].map((opt) => (
          <div key={opt.key} className="mb-3">
            <label className="block text-xs uppercase text-upscape-orange mb-1">{opt.label}</label>
            {opt.type === "boolean" ? (
              <input type="checkbox" checked={!!options[opt.key]}
                     onChange={(e) => setOptions({ ...options, [opt.key]: e.target.checked })} />
            ) : (
              <input type="number" value={String(options[opt.key] ?? "")}
                     onChange={(e) => setOptions({ ...options, [opt.key]: Number(e.target.value) })}
                     className="w-full p-2 bg-upscape-bg rounded border border-upscape-rule" />
            )}
          </div>
        ))}

        <label className="block text-xs uppercase text-upscape-orange mb-1">Notes</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full p-2 mb-3 bg-upscape-bg rounded border border-upscape-rule" />

        <div className="mb-3">
          <label className="block text-xs uppercase text-upscape-orange mb-1">Photos ({photos.length})</label>
          <div className="flex gap-2 mb-2 overflow-x-auto">
            {photos.map((p) => (
              <div key={p.id} className="w-16 h-16 bg-black flex-shrink-0 rounded overflow-hidden flex items-center justify-center">
                <span className="text-[10px] text-gray-400 p-1 text-center">{new Date(p.captured_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            ))}
          </div>
          <PhotoCapture
            siteId={siteId}
            targetId={target.id}
            onUploaded={() => onClose()}
          />
        </div>

        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 p-3 bg-upscape-bg rounded">Cancel</button>
          <button onClick={onDelete} className="p-3 px-4 bg-red-700 rounded">Delete</button>
          <button onClick={() => onSave({ label, notes, options })}
                  className="flex-1 p-3 bg-upscape-orange text-black font-bold rounded">Save</button>
        </div>
      </div>
    </div>
  );
}
