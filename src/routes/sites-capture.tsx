import { useParams } from "react-router-dom";

export function SiteCaptureRoute() {
  const { siteId } = useParams();
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Site Capture</h1>
      <p className="text-gray-400">site_id: {siteId}</p>
      <p className="text-gray-500 mt-4">Coming in Phase 6.</p>
    </div>
  );
}
