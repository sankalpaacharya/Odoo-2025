import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { authClient } from "@/lib/auth-client";
import { Sidebar } from "@/components/sidebar";
import UserMenu from "@/components/user-menu";
import DashboardClientLayout from "./dashboard-client-layout";
import { HeaderActions } from "@/components/header-actions";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await authClient.getSession({
    fetchOptions: {
      headers: await headers(),
      throw: true,
    },
  });

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <DashboardClientLayout>
      <div className="flex h-full">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <header className="border-b px-6 py-4 flex items-center justify-between">
            <HeaderActions />
            <UserMenu />
          </header>
          <main className="flex-1 overflow-auto p-6">{children}</main>
        </div>
      </div>
    </DashboardClientLayout>
  );
}
