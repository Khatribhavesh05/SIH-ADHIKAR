import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { TopBar } from "@/components/app/TopBar";
import { Sidebar } from "@/components/app/Sidebar";

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
    <div className="flex flex-col min-h-screen">
      <TopBar name={user.name} role={user.role} jurisdiction={jurisdiction || null} />
      <div className="flex flex-1">
        <Sidebar role={user.role} />
        <main className="flex-1 px-6 py-6 min-w-0">{children}</main>
      </div>
    </div>
  );
}
