"use client";

import { EmployeeProvider } from "@/lib/employee-context";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AbilityProvider } from "@/components/ability-provider";
import { usePermissions } from "@/hooks/use-permissions";

export default function DashboardClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { ability } = usePermissions();

  return (
    <EmployeeProvider>
      <AbilityProvider ability={ability}>
        <SidebarProvider>{children}</SidebarProvider>
      </AbilityProvider>
    </EmployeeProvider>
  );
}
