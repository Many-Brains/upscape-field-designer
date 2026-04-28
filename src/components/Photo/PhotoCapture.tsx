import { useRef, useState } from "react";
import { resizeImageToBlob } from "../../lib/photo";
import { uploadPhoto } from "../../lib/api-photos";

type Stage = "idle" | "resize" | "gps" | "upload" | "save";

const STAGE_LABEL: Record<Stage, string> = {
  idle: "📷 Add Photo",
  resize: "Resizing…",
  gps: "Locating…",
  upload: "Uploading…",
  save: "Saving…",
};

function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${ms / 1000}s`)), ms)
    ),
  ]);
}

export function PhotoCapture({
  siteId, targetId,
  onUploaded,
}: { siteId: string; targetId: string | null; onUploaded: (id: string) => void; }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [stage, setStage] = useState<Stage>("idle");
  const [error, setError] = useState<string | null>(null);

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setError(null);
    console.log(`[photo] file selected: ${f.name}, ${f.type}, ${(f.size / 1024).toFixed(0)} KB`);

    try {
      setStage("resize");
      const blob = await withTimeout(resizeImageToBlob(f), 15_000, "Resize");
      console.log(`[photo] resized to ${(blob.size / 1024).toFixed(0)} KB`);

      setStage("gps");
      // iOS Safari hangs getCurrentPosition forever if permission is unresolved or services are off.
      // Wrap in Promise.race with our own hard 5s timeout that always fires.
      const pos = await Promise.race([
        new Promise<GeolocationPosition | null>((res) => {
          if (!navigator.geolocation) return res(null);
          navigator.geolocation.getCurrentPosition(res as any, () => res(null), { timeout: 3000, maximumAge: 60_000 });
        }),
        new Promise<null>((res) => setTimeout(() => res(null), 5000)),
      ]);
      console.log(`[photo] gps: ${pos ? `${pos.coords.latitude},${pos.coords.longitude}` : "denied/unavailable/timed-out"}`);

      setStage("upload");
      const photo = await withTimeout(
        uploadPhoto({
          siteId, targetId, blob,
          capturedLat: pos?.coords.latitude, capturedLng: pos?.coords.longitude,
        }),
        30_000,
        "Upload",
      );
      console.log(`[photo] uploaded: ${photo.id}`);
      onUploaded(photo.id);
    } catch (e: any) {
      console.error("[photo] failed at stage:", stage, e);
      const msg = e?.message ?? e?.error_description ?? String(e);
      setError(`Stage ${stage}: ${msg}`);
      alert(`Photo failed at "${STAGE_LABEL[stage]}":\n\n${msg}`);
    } finally {
      setStage("idle");
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const busy = stage !== "idle";
  return (
    <div>
      <button onClick={() => inputRef.current?.click()}
              disabled={busy}
              className="px-4 py-2 bg-upscape-orange text-black rounded font-bold disabled:opacity-50">
        {STAGE_LABEL[stage]}
      </button>
      <input
        ref={inputRef} type="file" accept="image/*"
        onChange={onChange} className="hidden"
      />
      {error && (
        <p className="text-red-400 text-xs mt-2 break-words">{error}</p>
      )}
    </div>
  );
}
