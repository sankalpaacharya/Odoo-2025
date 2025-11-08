"use client";

import { EmployeeProvider } from "@/lib/employee-context";

export default function DashboardClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <EmployeeProvider>{children}</EmployeeProvider>;
}
