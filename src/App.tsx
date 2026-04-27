import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LoginRoute } from "./routes/login";
import { AuthGuard } from "./components/Auth/AuthGuard";
import { SitesListRoute } from "./routes/sites";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginRoute />} />
        <Route path="/" element={<AuthGuard><SitesListRoute /></AuthGuard>} />
      </Routes>
    </BrowserRouter>
  );
}
