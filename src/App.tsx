import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LoginRoute } from "./routes/login";
import { AuthGuard } from "./components/Auth/AuthGuard";
import { SitesListRoute } from "./routes/sites";
import { NewSiteRoute } from "./routes/sites-new";
import { SiteCaptureRoute } from "./routes/sites-capture";
import { SiteDetailRoute } from "./routes/site-detail";
import { NewProjectRoute } from "./routes/projects-new";
import { EditProjectRoute } from "./routes/projects-edit";
import { SettingsRoute } from "./routes/settings";
import { startSyncLoop } from "./lib/sync";

export default function App() {
  useEffect(() => { startSyncLoop(); }, []);
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginRoute />} />
        <Route path="/" element={<AuthGuard><SitesListRoute /></AuthGuard>} />
        <Route path="/settings" element={<AuthGuard><SettingsRoute /></AuthGuard>} />
        <Route path="/sites/new" element={<AuthGuard><NewSiteRoute /></AuthGuard>} />
        <Route path="/sites/:siteId" element={<AuthGuard><SiteDetailRoute /></AuthGuard>} />
        <Route path="/sites/:siteId/projects/new" element={<AuthGuard><NewProjectRoute /></AuthGuard>} />
        <Route path="/sites/:siteId/projects/:projectId/edit" element={<AuthGuard><EditProjectRoute /></AuthGuard>} />
        <Route path="/sites/:siteId/projects/:projectId" element={<AuthGuard><SiteCaptureRoute /></AuthGuard>} />
      </Routes>
    </BrowserRouter>
  );
}
