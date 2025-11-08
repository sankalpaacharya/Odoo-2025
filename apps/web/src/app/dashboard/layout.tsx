import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { authClient } from "@/lib/auth-client";
import { SidebarWrapper } from "@/components/sidebar-wrapper";
import DashboardClientLayout from "./dashboard-client-layout";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
      <SidebarWrapper />
      <SidebarInset>
        <header className="border-b px-6 py-4 flex items-center gap-4">
          <SidebarTrigger />
        </header>
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </SidebarInset>
    </DashboardClientLayout>
  );
}
