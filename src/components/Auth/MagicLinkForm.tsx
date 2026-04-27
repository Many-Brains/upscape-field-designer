import { useState } from "react";
import { supabase } from "../../lib/supabase";

export function MagicLinkForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sent" | "error">("idle");
  const [err, setErr] = useState<string | null>(null);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    setStatus("idle");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    });
    if (error) { setErr(error.message); setStatus("error"); }
    else setStatus("sent");
  }

  if (status === "sent") {
    return <p className="text-upscape-orange">Check your email for the login link.</p>;
  }
  return (
    <form onSubmit={send} className="flex flex-col gap-3 max-w-sm">
      <input
        type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
        placeholder="you@getupscaped.com"
        className="rounded p-3 bg-upscape-panel border border-upscape-rule text-white"
      />
      <button type="submit" className="rounded p-3 bg-upscape-orange text-black font-bold">
        Send Magic Link
      </button>
      {status === "error" && <p className="text-red-400">{err}</p>}
    </form>
  );
}
