import { useState } from "react";
import { supabase } from "../../lib/supabase";

type Step = "email" | "code";

export function MagicLinkForm() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function sendCode(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    const { error } = await supabase.auth.signInWithOtp({ email });
    setBusy(false);
    if (error) {
      setErr(error.message);
      return;
    }
    setStep("code");
  }

  async function verifyCode(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: code.trim(),
      type: "magiclink",
    });
    setBusy(false);
    if (error) {
      setErr(error.message);
      return;
    }
    // AuthGuard's onAuthStateChange will redirect; nothing else to do.
  }

  if (step === "email") {
    return (
      <form onSubmit={sendCode} className="flex flex-col gap-3 max-w-sm w-full">
        <input
          type="email" required value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@getupscaped.com"
          autoComplete="email"
          className="rounded p-3 bg-upscape-panel border border-upscape-rule text-white"
        />
        <button type="submit" disabled={busy}
                className="rounded p-3 bg-upscape-orange text-black font-bold disabled:opacity-50">
          {busy ? "Sending…" : "Send Code"}
        </button>
        {err && <p className="text-red-400 text-sm break-words">{err}</p>}
      </form>
    );
  }

  return (
    <form onSubmit={verifyCode} className="flex flex-col gap-3 max-w-sm w-full">
      <p className="text-gray-400 text-sm">
        We emailed a code to <span className="text-white">{email}</span>.
      </p>
      <input
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern="[0-9]*"
        required
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
        placeholder="12345678"
        maxLength={8}
        className="rounded p-3 bg-upscape-panel border border-upscape-rule text-white text-center text-2xl tracking-widest font-mono"
      />
      <button type="submit" disabled={busy || code.length < 6}
              className="rounded p-3 bg-upscape-orange text-black font-bold disabled:opacity-50">
        {busy ? "Verifying…" : "Verify"}
      </button>
      <button type="button"
              onClick={() => { setStep("email"); setCode(""); setErr(null); }}
              className="text-gray-400 text-sm underline">
        Use a different email
      </button>
      {err && <p className="text-red-400 text-sm break-words">{err}</p>}
    </form>
  );
}
