export async function resizeImageToBlob(
  file: File, maxDim = 2048, quality = 0.85,
): Promise<Blob> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error(`Failed to decode image (${file.type || "unknown type"}, ${(file.size / 1024).toFixed(0)} KB). iOS may have served HEIC — try Camera Settings → Formats → "Most Compatible".`));
      i.src = objectUrl;
    });
    const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
    const w = Math.round(img.width * scale);
    const h = Math.round(img.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D context unavailable");
    ctx.drawImage(img, 0, 0, w, h);
    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (b) => b ? resolve(b) : reject(new Error("Canvas toBlob returned null")),
        "image/jpeg", quality,
      )
    );
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
