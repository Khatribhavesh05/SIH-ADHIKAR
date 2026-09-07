"use client";

import { useState, useRef, useEffect } from "react";
import { ROLE_LABELS, type Role } from "@/lib/domain/roles";
import { AccountSwitcher } from "@/components/app/AccountSwitcher";
import { SignOutButton } from "@/components/app/SignOutButton";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/**
 * Mobile-only collapsed identity control — a single tappable avatar that
 * opens a sheet with the same identity block, account switcher, and sign
 * out that render inline on desktop. Trying to fit all of that in one
 * phone-width header row is what caused the wrapping/squeeze the fix
 * addresses.
 */
export function MobileAccountMenu({
  name,
  role,
  jurisdiction,
}: {
  name: string;
  role: Role;
  jurisdiction: string | null;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Account menu"
        aria-expanded={open}
        className="w-11 h-11 flex items-center justify-center rounded-full bg-brand-tint text-brand-dark font-mono-data text-sm font-semibold border border-hairline-strong"
      >
        {initials(name)}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-72 border border-hairline-strong bg-paper-raised rounded-[var(--radius-md)] shadow-lg p-4 flex flex-col gap-4">
            <div>
              <div className="text-sm font-semibold">{name}</div>
              <div className="text-xs text-brand font-medium mt-0.5">
                {ROLE_LABELS[role]}
                {jurisdiction ? ` · ${jurisdiction}` : ""}
              </div>
            </div>
            <AccountSwitcher current={role} />
            <SignOutButton />
          </div>
        </>
      )}
    </div>
  );
}
