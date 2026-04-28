import { useState } from "react";
import { supabase } from "../../lib/supabase";

export function MagicLinkForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      setErr(error.message);
      return;
    }
    // AuthGuard's onAuthStateChange will redirect.
  }

  return (
    <form onSubmit={signIn} className="flex flex-col gap-3 max-w-sm w-full">
      <input
        type="email" required value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@getupscaped.com"
        autoComplete="email"
        className="rounded p-3 bg-upscape-panel border border-upscape-rule text-white"
      />
      <input
        type="password" required value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        autoComplete="current-password"
        className="rounded p-3 bg-upscape-panel border border-upscape-rule text-white"
      />
      <button type="submit" disabled={busy}
              className="rounded p-3 bg-upscape-orange text-black font-bold disabled:opacity-50">
        {busy ? "Signing in…" : "Sign In"}
      </button>
      {err && <p className="text-red-400 text-sm break-words">{err}</p>}
      <p className="text-gray-500 text-xs mt-2">
        New users: ask Ross to set up your account in the Supabase dashboard.
      </p>
    </form>
  );
}
