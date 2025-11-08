"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Users, Calendar, Clock, Wallet, FileText, Settings } from "lucide-react";
import type { Route } from "next";
import { useEmployee } from "@/lib/employee-context";

type Role = "ADMIN" | "EMPLOYEE" | "HR_OFFICER" | "PAYROLL_OFFICER";

type NavigationItem = {
  name: string;
  href: Route;
  icon: React.ComponentType<{ className?: string }>;
  allowedRoles?: Role[];
};

const navigationItems: NavigationItem[] = [
  {
    name: "Employees",
    href: "/dashboard/employees" as Route,
    icon: Users,
    allowedRoles: ["ADMIN", "HR_OFFICER", "PAYROLL_OFFICER"],
  },
  {
    name: "Attendance",
    href: "/dashboard/attendance" as Route,
    icon: Calendar,
  },
  {
    name: "Time Off",
    href: "/dashboard/time-off" as Route,
    icon: Clock,
  },
  {
    name: "Payroll",
    href: "/dashboard/payroll" as Route,
    icon: Wallet,
    allowedRoles: ["ADMIN", "PAYROLL_OFFICER"],
  },
  {
    name: "Reports",
    href: "/dashboard/reports" as Route,
    icon: FileText,
  },
  {
    name: "Settings",
    href: "/dashboard/settings" as Route,
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { employee, isLoading } = useEmployee();

  // Filter navigation items based on user role
  const filteredNavigationItems = navigationItems.filter((item) => {
    // If no role restrictions, show to everyone
    if (!item.allowedRoles) {
      return true;
    }

    // If still loading or no employee data, hide restricted items
    if (isLoading || !employee) {
      return false;
    }
    console.log("Employee Role:", employee.role);
    // Check if user's role is in the allowed roles
    return item.allowedRoles.includes(employee.role);
  });

  return (
    <aside className="w-60 border-r bg-background shrink-0">
      <div className="flex items-center gap-3 px-6 py-5 border-b">
        <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center shrink-0">
          <span className="text-primary-foreground font-bold text-lg">W</span>
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-base">WorkZen</span>
          <span className="text-xs text-muted-foreground">HR Platform</span>
        </div>
      </div>
      <nav className="flex flex-col p-4 space-y-2">
        {filteredNavigationItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-4 px-4 py-3.5 rounded-lg text-base font-medium transition-colors",
                isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}>
              <Icon className="h-6 w-6" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
