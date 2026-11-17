"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight, Compass, Lock, ShieldCheck } from "lucide-react";

export function LoginGate() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = (await res.json().catch(() => ({}))) as { error?: string };

      if (!res.ok) {
        setError(data.error || "Authentication failed.");
        setSubmitting(false);
        return;
      }

      window.location.reload();
    } catch {
      setError("Network error while verifying credentials.");
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FAF7F4] px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#23384F] text-[#FAF7F4] shadow-sm">
            <Compass className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9B4E27]">
              Ostaad Operations
            </p>
            <h1 className="text-xl font-bold tracking-tight text-[#23384F]">
              Vendor Coverage Map
            </h1>
          </div>
        </div>

        <div className="rounded-2xl border border-[#EAE4DE] bg-white p-7 shadow-sm">
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-[#EAE4DE] bg-[#FAF7F4] p-3.5">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#9B4E27]" />
            <div className="text-xs leading-relaxed text-[#23384F]/80">
              Internal access gate protecting live Kolkata &amp; West Bengal vendor records
              synced from <span className="font-mono font-medium text-[#23384F]">ostaad-db</span>.
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="ops-password"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#23384F]/75"
              >
                Ops Access Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#23384F]/45" />
                <input
                  id="ops-password"
                  type="password"
                  required
                  autoFocus
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter internal ops password"
                  className="w-full rounded-xl border border-[#EAE4DE] bg-[#FAF7F4]/60 py-2.5 pl-10 pr-4 text-sm text-[#23384F] placeholder:text-[#23384F]/40 focus:border-[#9B4E27] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#9B4E27]/20"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#23384F] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1B2C3F] disabled:opacity-60"
            >
              {submitting ? "Verifying..." : "Unlock Coverage Map"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-xs text-[#23384F]/50">
          Read-only session secured with HMAC-SHA256 HttpOnly cookie
        </p>
      </div>
    </main>
  );
}
