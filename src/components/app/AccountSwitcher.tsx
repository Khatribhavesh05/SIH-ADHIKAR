"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ALL_ROLES, ROLE_LABELS, type Role } from "@/lib/domain/roles";
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from "@/lib/domain/demo-accounts";

/**
 * FOR DEMO CONVENIENCE ONLY — but functionally real underneath. Selecting
 * a role signs out of the current session and signs in as that role's
 * actual seeded demo account, so every page, permission, and data query
 * afterward is exactly what a direct login as that account would show.
 * There is no separate "view as" overlay — getCurrentUser() is the only
 * source of truth, and after this swap it genuinely reflects the new role.
 */
export function AccountSwitcher({ current }: { current: Role }) {
  const router = useRouter();
  const [switching, setSwitching] = useState<Role | null>(null);

  async function handleChange(role: Role) {
    if (role === current) return;
    setSwitching(role);
    const supabase = createClient();
    await supabase.auth.signOut();
    const { error } = await supabase.auth.signInWithPassword({
      email: DEMO_ACCOUNTS[role],
      password: DEMO_PASSWORD,
    });
    setSwitching(null);
    if (error) {
      // eslint-disable-next-line no-console
      console.error("Account switch failed:", error.message);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="border border-dashed border-[var(--color-saffron)] bg-[var(--color-saffron-tint)] rounded-[var(--radius-sm)] px-2.5 py-2 sm:py-1.5 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
      <span className="text-[10px] font-medium text-[var(--color-warning)] uppercase tracking-wide whitespace-nowrap">
        Demo: switch account
      </span>
      <select
        value={current}
        disabled={switching !== null}
        onChange={(e) => handleChange(e.target.value as Role)}
        className="text-xs bg-transparent border-none focus:outline-none text-[var(--color-warning)] font-medium disabled:opacity-60 min-h-[36px] sm:min-h-0"
      >
        {ALL_ROLES.map((r) => (
          <option key={r} value={r}>
            {ROLE_LABELS[r]}
          </option>
        ))}
      </select>
      {switching && <span className="text-[10px] text-[var(--color-warning)]">switching…</span>}
    </div>
  );
}
