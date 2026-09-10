"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";
import { GovSeal } from "@/components/ui/GovSeal";
import { GoogleTranslateWidget } from "@/components/app/GoogleTranslateWidget";
import Link from "next/link";
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from "@/lib/domain/demo-accounts";
import { ROLE_LABELS } from "@/lib/domain/roles";
import { ChevronDown, ChevronUp, KeyRound, ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDemoAccounts, setShowDemoAccounts] = useState(false);

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

  function fillDemoAccount(demoEmail: string) {
    setEmail(demoEmail);
    setPassword(DEMO_PASSWORD);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-paper relative">
      <div className="absolute top-4 right-4">
        <GoogleTranslateWidget />
      </div>

      <div className="flex items-center gap-3 mb-8">
        <GovSeal size={44} />
        <div>
          <div className="font-serif-heading font-bold text-xl text-brand-dark leading-tight">Adhikar</div>
          <div className="text-xs text-ink-muted">National Land Acquisition Command Center</div>
        </div>
      </div>

      <Panel raised className="w-full max-w-md p-6 sm:p-8 shadow-md">
        <h1 className="font-serif-heading text-xl font-bold text-brand-dark mb-1">Sign in to Portal</h1>
        <p className="text-xs text-ink-muted mb-6 leading-relaxed">
          Official government account required. Authorized personnel login only.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-ink">Official Email Address</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input text-sm"
              placeholder="collector@demo.gov.in"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-ink">Password</span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input text-sm"
            />
          </label>

          {error && (
            <p className="text-xs text-danger bg-danger-tint border border-danger/30 rounded px-3 py-2">
              {error}
            </p>
          )}

          <Button type="submit" disabled={loading} className="w-full py-2.5 font-semibold text-sm">
            {loading ? "Signing in..." : "Sign in to Dashboard"}
          </Button>
        </form>
      </Panel>

      {/* Collapsed Demo Accounts Panel (Closed by Default) */}
      <div className="w-full max-w-md mt-4">
        <button
          onClick={() => setShowDemoAccounts(!showDemoAccounts)}
          className="w-full p-3 rounded-md border border-hairline bg-paper-raised flex items-center justify-between text-xs font-semibold text-ink hover:text-brand hover:border-brand transition-all cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <KeyRound className="w-3.5 h-3.5 text-saffron" />
            <span>Demo Accounts Logins (Judge / Tester Accounts)</span>
          </span>
          {showDemoAccounts ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showDemoAccounts && (
          <div className="p-4 rounded-b-md border-x border-b border-hairline bg-paper-raised text-xs flex flex-col gap-2 mt-[-1px] animate-fadeIn">
            <div className="text-[11px] text-ink-muted mb-1">
              Click any account below to auto-fill credentials (password: <code className="font-mono-data font-semibold text-brand">{DEMO_PASSWORD}</code>):
            </div>
            <ul className="space-y-1.5">
              {Object.entries(DEMO_ACCOUNTS).map(([role, demoEmail]) => (
                <li key={demoEmail}>
                  <button
                    onClick={() => fillDemoAccount(demoEmail)}
                    className="w-full flex items-center justify-between p-2 rounded border border-hairline hover:border-brand/40 bg-paper hover:bg-brand-tint/20 text-left transition-colors cursor-pointer"
                  >
                    <span className="font-semibold text-brand-dark">{ROLE_LABELS[role as keyof typeof ROLE_LABELS]}</span>
                    <span className="font-mono-data text-ink-muted text-[11px]">{demoEmail}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <Link href="/" className="text-xs text-ink-muted mt-6 hover:text-ink flex items-center gap-1">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Landing Page
      </Link>
    </div>
  );
}
