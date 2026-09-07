import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AppShell } from "@/components/app/AppShell";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const jurisdiction = [user.jurisdictionDistrict, user.jurisdictionState]
    .filter(Boolean)
    .join(", ");

  return (
    <AppShell name={user.name} role={user.role} jurisdiction={jurisdiction || null}>
      {children}
    </AppShell>
  );
}
