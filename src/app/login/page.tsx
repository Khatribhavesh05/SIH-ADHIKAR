"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";
import { GovSeal } from "@/components/ui/GovSeal";
import Link from "next/link";
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from "@/lib/domain/demo-accounts";
import { ROLE_LABELS } from "@/lib/domain/roles";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="flex items-center gap-3 mb-8">
        <GovSeal size={40} />
        <div>
          <div className="font-serif-heading font-semibold text-lg leading-tight">Adhikar</div>
          <div className="text-xs text-ink-muted">National Land Acquisition &amp; Management System</div>
        </div>
      </div>

      <Panel raised className="w-full max-w-sm p-6">
        <h1 className="font-serif-heading text-xl font-semibold mb-1">Sign in</h1>
        <p className="text-sm text-ink-muted mb-6">
          Official government account required. Public self-signup is not supported.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-hairline-strong rounded-[var(--radius-sm)] px-3 py-2 text-sm bg-paper-raised focus:outline-none focus:border-brand"
              placeholder="collector@demo.gov.in"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Password</span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border border-hairline-strong rounded-[var(--radius-sm)] px-3 py-2 text-sm bg-paper-raised focus:outline-none focus:border-brand"
            />
          </label>

          {error && (
            <p className="text-sm text-[var(--color-danger)] bg-[var(--color-danger-tint)] border border-[var(--color-danger)]/30 rounded-[var(--radius-sm)] px-3 py-2">
              {error}
            </p>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </Panel>

      <Panel className="w-full max-w-sm p-4 mt-4">
        <p className="text-xs font-medium text-ink-muted mb-2">Demo accounts (seed password: {DEMO_PASSWORD})</p>
        <ul className="text-xs text-ink-muted space-y-1 font-mono-data">
          {Object.entries(DEMO_ACCOUNTS).map(([role, email]) => (
            <li key={email} className="flex justify-between">
              <span>{ROLE_LABELS[role as keyof typeof ROLE_LABELS]}</span>
              <span>{email}</span>
            </li>
          ))}
        </ul>
      </Panel>

      <Link href="/" className="text-xs text-ink-muted mt-6 hover:text-ink">
        ← Back to landing page
      </Link>
    </div>
  );
}
