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
  LayoutDashboard,
  LogOut,
  User,
  ChevronsUpDown,
} from "lucide-react";
import type { Route } from "next";
import {
  Sidebar as SidebarUI,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarStatus } from "@/components/sidebar-status";

type NavigationItem = {
  name: string;
  href: Route;
  icon: React.ComponentType<{ className?: string }>;
};

const navigationItems: NavigationItem[] = [
  {
    name: "Dashboard",
    href: "/dashboard" as Route,
    icon: LayoutDashboard,
  },
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
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const user = (session as any)?.user as any;

  const userInitials = user?.name
    ? user.name
        .split(" ")
        .map((s: string) => (s ? s[0] : ""))
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";

  return (
    <SidebarUI collapsible="icon" className="border-r">
      <SidebarHeader>
        <div className="flex items-center gap-3 px-2 py-3">
          <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center ">
            <span className="text-primary-foreground font-bold text-lg">W</span>
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="font-semibold text-base">WorkZen</span>
            <span className="text-xs text-muted-foreground">HR Platform</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-4">
        <SidebarMenu>
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={item.name}
                >
                  <Link href={item.href}>
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarStatus />

      <SidebarFooter className="border-0">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                      <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <span className="text-sm font-semibold">
                          {userInitials}
                        </span>
                      </div>
                      <div className="flex flex-col gap-0.5 leading-none group-data-[collapsible=icon]:hidden">
                        <span className="font-semibold">{user?.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {user?.email}
                        </span>
                      </div>
                    </div>
                    <ChevronsUpDown className="h-4 w-4 ml-auto group-data-[collapsible=icon]:hidden" />
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56"
                align="end"
                side="top"
                sideOffset={4}
              >
                <DropdownMenuItem
                  onClick={() => router.push("/dashboard/profile")}
                >
                  <User className="h-4 w-4 mr-2" />
                  My Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    authClient.signOut({
                      fetchOptions: {
                        onSuccess: () => {
                          router.push("/");
                        },
                      },
                    });
                  }}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </SidebarUI>
  );
}
