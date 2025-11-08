import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { authClient } from "@/lib/auth-client";
import { SidebarWrapper } from "@/components/sidebar-wrapper";
import DashboardClientLayout from "./dashboard-client-layout";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AuthGuard } from "@/components/auth-guard";

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
        <AuthGuard>
          <main className="flex-1 overflow-auto p-4 md:p-6 max-w-[100vw]">
            {children}
          </main>
        </AuthGuard>
      </SidebarInset>
    </DashboardClientLayout>
  );
}
