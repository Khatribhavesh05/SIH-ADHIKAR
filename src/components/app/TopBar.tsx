import { GovSeal } from "@/components/ui/GovSeal";
import { ROLE_LABELS, type Role } from "@/lib/domain/roles";
import { AccountSwitcher } from "@/components/app/AccountSwitcher";
import { SignOutButton } from "@/components/app/SignOutButton";
import { MobileAccountMenu } from "@/components/app/MobileAccountMenu";
import Link from "next/link";

export function TopBar({
  name,
  role,
  jurisdiction,
  onMenuClick,
}: {
  name: string;
  role: Role;
  jurisdiction: string | null;
  onMenuClick: () => void;
}) {
  return (
    <header className="border-b border-hairline bg-paper-raised">
      <div className="flex items-center justify-between px-3 sm:px-5 py-2.5 gap-2">
        <div className="flex items-center gap-1 sm:gap-2.5 min-w-0">
          {/* Hamburger — mobile only, opens the Sidebar drawer */}
          <button
            onClick={onMenuClick}
            aria-label="Open navigation menu"
            className="md:hidden w-11 h-11 -ml-1 flex items-center justify-center shrink-0 text-ink"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" strokeLinecap="round" />
              <line x1="3" y1="12" x2="21" y2="12" strokeLinecap="round" />
              <line x1="3" y1="18" x2="21" y2="18" strokeLinecap="round" />
            </svg>
          </button>

          <Link href="/dashboard" className="flex items-center gap-2 min-w-0">
            <GovSeal size={28} />
            <span className="font-serif-heading font-semibold text-sm truncate text-brand-dark">Adhikar</span>
          </Link>
        </div>

        {/* Right side: user info */}
        <div className="flex items-center gap-3">
          {/* Desktop: full identity block + switcher + sign out, inline */}
          <div className="hidden md:flex items-center gap-4 border-l border-hairline pl-3">
            <div className="text-right leading-tight">
              <div className="text-sm font-semibold">{name}</div>
              <div className="text-xs text-brand font-medium">
                {ROLE_LABELS[role]}
                {jurisdiction ? ` · ${jurisdiction}` : ""}
              </div>
            </div>
            <AccountSwitcher current={role} />
            <SignOutButton />
          </div>

          {/* Mobile: collapsed into account menu */}
          <div className="md:hidden">
            <MobileAccountMenu name={name} role={role} jurisdiction={jurisdiction} />
          </div>
        </div>
      </div>
    </header>
  );
}
