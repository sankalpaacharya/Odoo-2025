"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Users,
  Calendar,
  Clock,
  Wallet,
  FileText,
  Settings,
} from "lucide-react";
import type { Route } from "next";

type NavigationItem = {
  name: string;
  href: Route;
  icon: React.ComponentType<{ className?: string }>;
};

const navigationItems: NavigationItem[] = [
  {
    name: "Employees",
    href: "/dashboard/employees" as Route,
    icon: Users,
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

  return (
    <aside className="w-[200px] border-r bg-background flex-shrink-0">
      <nav className="flex flex-col p-4 space-y-1">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
