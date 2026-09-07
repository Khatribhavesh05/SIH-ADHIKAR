"use client";

import { useState } from "react";
import { TopBar } from "@/components/app/TopBar";
import { Sidebar } from "@/components/app/Sidebar";
import type { Role } from "@/lib/domain/roles";

export function AppShell({
  name,
  role,
  jurisdiction,
  children,
}: {
  name: string;
  role: Role;
  jurisdiction: string | null;
  children: React.ReactNode;
}) {
  const [navOpen, setNavOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar name={name} role={role} jurisdiction={jurisdiction} onMenuClick={() => setNavOpen(true)} />
      <div className="flex flex-1 min-h-0">
        {/* Desktop sidebar — always visible, static column */}
        <Sidebar role={role} className="hidden md:flex w-56 shrink-0 border-r border-hairline" />

        {/* Mobile sidebar — hidden by default, slide-in drawer over a backdrop */}
        {navOpen && (
          <div className="md:hidden fixed inset-0 z-50">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setNavOpen(false)}
              aria-hidden
            />
            <div className="absolute left-0 top-0 bottom-0 w-72 max-w-[85vw] bg-paper-raised border-r border-hairline-strong shadow-lg flex flex-col">
              <div className="flex items-center justify-between px-4 py-3 border-b border-hairline">
                <span className="font-serif-heading font-semibold text-sm">Menu</span>
                <button
                  onClick={() => setNavOpen(false)}
                  aria-label="Close navigation menu"
                  className="w-11 h-11 -mr-2 flex items-center justify-center text-ink-muted"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" strokeLinecap="round" />
                    <line x1="6" y1="6" x2="18" y2="18" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
              <Sidebar role={role} onNavigate={() => setNavOpen(false)} className="flex-1" />
            </div>
          </div>
        )}

        <main className="flex-1 px-4 sm:px-6 py-5 sm:py-6 min-w-0 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
