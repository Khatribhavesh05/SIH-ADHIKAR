import { GovSeal } from "@/components/ui/GovSeal";
import { ROLE_LABELS, type Role } from "@/lib/domain/roles";
import { AccountSwitcher } from "@/components/app/AccountSwitcher";
import { SignOutButton } from "@/components/app/SignOutButton";
import Link from "next/link";

export function TopBar({
  name,
  role,
  jurisdiction,
}: {
  name: string;
  role: Role;
  jurisdiction: string | null;
}) {
  return (
    <header className="border-b border-hairline">
      <div className="flex items-center justify-between px-5 py-2.5">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <GovSeal size={30} />
          <span className="font-serif-heading font-semibold text-sm">Adhikar</span>
        </Link>

        <div className="flex items-center gap-4">
          {/* Single, dominant identity block — always the currently-authenticated account. */}
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
      </div>
    </header>
  );
}
