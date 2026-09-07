"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PERMISSIONS, type Role } from "@/lib/domain/roles";

interface NavItem {
  href: string;
  label: string;
  show: (perm: (typeof PERMISSIONS)[Role]) => boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", show: () => true },
  { href: "/projects", label: "Projects", show: () => true },
  { href: "/deadlines", label: "Deadline & Risk", show: (p) => p.deadlineScope !== undefined },
  { href: "/map", label: "GIS Map", show: () => true },
  { href: "/documents", label: "Documents", show: () => true },
];

export function Sidebar({ role }: { role: Role }) {
  const pathname = usePathname();
  const perm = PERMISSIONS[role];

  return (
    <nav className="w-56 shrink-0 border-r border-hairline flex flex-col py-4">
      <ul className="flex flex-col gap-0.5 px-2">
        {NAV_ITEMS.filter((item) => item.show(perm)).map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`block px-3 py-2 text-sm rounded-[var(--radius-sm)] ${
                  active
                    ? "bg-brand-tint text-brand-dark font-medium"
                    : "text-ink-muted hover:bg-paper-raised hover:text-ink"
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
