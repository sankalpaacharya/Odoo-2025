"use client";

import { SidebarStatus } from "@/components/sidebar-status";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  Sidebar as SidebarUI,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";
import { apiClient } from "@/lib/api-client";
import {
  Calendar,
  ChevronsUpDown,
  Clock,
  FileText,
  LayoutDashboard,
  LogOut,
  Monitor,
  Moon,
  Settings,
  Sun,
  User,
  Users,
  Wallet,
} from "lucide-react";
import type { Route } from "next";
import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { Role } from "../../../../packages/db/prisma/generated/enums";
import { useEffect, useState } from "react";

type NavigationItem = {
  name: string;
  href: Route;
  icon: React.ComponentType<{ className?: string }>;
  allowedRoles?: Role[];
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
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const { theme, setTheme } = useTheme();
  const user = (session as any)?.user as any;
  const [organization, setOrganization] = useState<{
    companyName: string;
    logo: string | null;
  } | null>(null);
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    const fetchOrganization = async () => {
      try {
        const data = await apiClient<{
          companyName: string;
          logo: string | null;
        }>("/api/organization/me");
        console.log("Fetched organization data:", data);
        setOrganization(data);
        setLogoError(false);
      } catch (error) {
        console.error("Failed to fetch organization:", error);
      }
    };

    if (session) {
      fetchOrganization();
    }
  }, [session]);

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
        <div className="flex items-center gap-2 px-2 py-3 justify-between">
          <div className="flex items-center gap-3 group-data-[collapsible=icon]:hidden">
            {organization?.logo && !logoError ? (
              <div className="h-9 w-9 rounded-lg overflow-hidden shrink-0 bg-muted">
                <img
                  src={`${
                    process.env.NEXT_PUBLIC_SERVER_URL ||
                    "http://localhost:3000"
                  }${organization.logo}`}
                  alt={organization.companyName}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    console.error(
                      "Failed to load logo from:",
                      `${
                        process.env.NEXT_PUBLIC_SERVER_URL ||
                        "http://localhost:3000"
                      }${organization.logo}`
                    );
                    setLogoError(true);
                  }}
                />
              </div>
            ) : (
              <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center shrink-0">
                <span className="text-primary-foreground font-bold">
                  {organization?.companyName?.[0]?.toUpperCase() || "W"}
                </span>
              </div>
            )}
            <div className="flex flex-col">
              <span className="font-semibold text-base">
                {organization?.companyName || "WorkZen"}
              </span>
              <span className="text-xs text-muted-foreground">HR Platform</span>
            </div>
          </div>
          <SidebarTrigger />
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
                  <div className="flex items-center justify-between w-full group-data-[collapsible=icon]:justify-center">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground ">
                        <span className="text-sm font-semibold">
                          {userInitials}
                        </span>
                      </div>
                      <div className="flex flex-col gap-0.5 leading-none group-data-[collapsible=icon]:hidden min-w-0 flex-1">
                        <span className="font-semibold truncate">
                          {user?.name}
                        </span>
                        <span className="text-xs text-muted-foreground truncate">
                          {user?.email}
                        </span>
                      </div>
                    </div>
                    <ChevronsUpDown className="h-5 w-5 ml-2 shrink-0 group-data-[collapsible=icon]:hidden" />
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
                <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
                  Theme
                </DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => setTheme("light")}
                  className={theme === "light" ? "bg-accent" : ""}
                >
                  <Sun className="h-4 w-4 mr-2" />
                  Light
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setTheme("dark")}
                  className={theme === "dark" ? "bg-accent" : ""}
                >
                  <Moon className="h-4 w-4 mr-2" />
                  Dark
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setTheme("system")}
                  className={theme === "system" ? "bg-accent" : ""}
                >
                  <Monitor className="h-4 w-4 mr-2" />
                  System
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
