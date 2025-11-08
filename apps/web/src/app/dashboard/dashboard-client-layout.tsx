"use client";

import { EmployeeProvider } from "@/lib/employee-context";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function DashboardClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <EmployeeProvider>
      <SidebarProvider>{children}</SidebarProvider>
    </EmployeeProvider>
  );
}
