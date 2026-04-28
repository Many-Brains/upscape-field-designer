import { useRef, useState } from "react";
import { resizeImageToBlob } from "../../lib/photo";
import { uploadPhoto } from "../../lib/api-photos";

export function PhotoCapture({
  siteId, targetId,
  onUploaded,
}: { siteId: string; targetId: string | null; onUploaded: (id: string) => void; }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploading(true);
    try {
      const blob = await resizeImageToBlob(f);
      // Get device GPS if granted (best-effort)
      const pos = await new Promise<GeolocationPosition | null>((res) => {
        if (!navigator.geolocation) return res(null);
        navigator.geolocation.getCurrentPosition(res as any, () => res(null), { timeout: 3000 });
      });
      const photo = await uploadPhoto({
        siteId, targetId, blob,
        capturedLat: pos?.coords.latitude, capturedLng: pos?.coords.longitude,
      });
      onUploaded(photo.id);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <>
      <button onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="px-4 py-2 bg-upscape-orange text-black rounded font-bold disabled:opacity-50">
        {uploading ? "Uploading…" : "📷 Take Photo"}
      </button>
      <input
        ref={inputRef} type="file" accept="image/*" capture="environment"
        onChange={onChange} className="hidden"
      />
    </>
  );
}
