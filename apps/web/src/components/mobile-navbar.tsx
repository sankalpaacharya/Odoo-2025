"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Menu,
  Calendar,
  Clock,
  FileText,
  LayoutDashboard,
  Settings,
  Users,
  Wallet,
  LogOut,
  User,
  Sun,
  Moon,
  Monitor,
} from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { usePermissions } from "@/hooks/use-permissions";
import { useProfile } from "@/hooks/useProfile";
import { getProfileImageUrl } from "@/lib/image-utils";
import { useTheme } from "next-themes";
import type { Route } from "next";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

type NavigationItem = {
  name: string;
  href: Route;
  icon: React.ComponentType<{ className?: string }>;
  module: string;
  permission: string;
};

const navigationItems: NavigationItem[] = [
  {
    name: "Dashboard",
    href: "/dashboard" as Route,
    icon: LayoutDashboard,
    module: "Dashboard",
    permission: "View",
  },
  {
    name: "Employees",
    href: "/dashboard/employees" as Route,
    icon: Users,
    module: "Employees",
    permission: "View",
  },
  {
    name: "Attendance",
    href: "/dashboard/attendance" as Route,
    icon: Calendar,
    module: "Attendance",
    permission: "View",
  },
  {
    name: "Time Off",
    href: "/dashboard/time-off" as Route,
    icon: Clock,
    module: "Time Off",
    permission: "View",
  },
  {
    name: "Payroll",
    href: "/dashboard/payroll" as Route,
    icon: Wallet,
    module: "Payroll",
    permission: "View",
  },
  {
    name: "Reports",
    href: "/dashboard/reports" as Route,
    icon: FileText,
    module: "Reports",
    permission: "View",
  },
  {
    name: "Settings",
    href: "/dashboard/settings" as Route,
    icon: Settings,
    module: "Settings",
    permission: "View",
  },
];

export function MobileNavbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const { data: profile } = useProfile();
  const { theme, setTheme } = useTheme();
  const { hasPermission, loading } = usePermissions();
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

  const profileImageUrl = getProfileImageUrl(
    profile?.profileImage,
    profile?.image
  );

  const userInitials = user?.name
    ? user.name
        .split(" ")
        .map((s: string) => (s ? s[0] : ""))
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";

  return (
    <header className="lg:hidden sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4 gap-3">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="shrink-0">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72 flex flex-col">
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-4 border-b">
              {organization?.logo && !logoError ? (
                <div className="h-10 w-10 rounded-lg overflow-hidden shrink-0 bg-muted">
                  <img
                    src={`${
                      process.env.NEXT_PUBLIC_SERVER_URL ||
                      "http://localhost:3000"
                    }${organization.logo}`}
                    alt={organization.companyName}
                    className="h-full w-full object-cover"
                    onError={() => setLogoError(true)}
                  />
                </div>
              ) : (
                <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center shrink-0">
                  <span className="text-primary-foreground font-bold">
                    {organization?.companyName?.[0]?.toUpperCase() || "W"}
                  </span>
                </div>
              )}
              <div className="flex flex-col">
                <span className="font-semibold text-base">
                  {organization?.companyName || "WorkZen"}
                </span>
                <span className="text-xs text-muted-foreground">
                  HR Platform
                </span>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-auto py-4">
              <nav className="space-y-1 px-3">
                {loading ? (
                  <div className="text-sm text-muted-foreground p-4">
                    Loading...
                  </div>
                ) : (
                  navigationItems
                    .filter((item) =>
                      hasPermission(item.module, item.permission)
                    )
                    .map((item) => {
                      const isActive = pathname === item.href;
                      const Icon = item.icon;

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setOpen(false)}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                            isActive
                              ? "bg-primary text-primary-foreground"
                              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                          )}
                        >
                          <Icon className="h-5 w-5" />
                          <span>{item.name}</span>
                        </Link>
                      );
                    })
                )}
              </nav>
            </div>

            {/* Footer */}
            <div className="border-t p-4 space-y-3">
              {/* Theme Selector */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground px-3">
                  Theme
                </p>
                <div className="flex gap-2">
                  <Button
                    variant={theme === "light" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTheme("light")}
                    className="flex-1"
                  >
                    <Sun className="h-4 w-4 mr-2" />
                    Light
                  </Button>
                  <Button
                    variant={theme === "dark" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTheme("dark")}
                    className="flex-1"
                  >
                    <Moon className="h-4 w-4 mr-2" />
                    Dark
                  </Button>
                </div>
              </div>

              <Separator />

              {/* User Profile */}
              <div className="space-y-2">
                <div className="flex items-center gap-3 px-3 py-2">
                  {profileImageUrl ? (
                    <div className="h-10 w-10 rounded-lg overflow-hidden bg-muted">
                      <img
                        src={profileImageUrl}
                        alt={user?.name || "User"}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
                      <span className="text-sm font-semibold">
                        {userInitials}
                      </span>
                    </div>
                  )}
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="font-semibold text-sm truncate">
                      {user?.name}
                    </span>
                    <span className="text-xs text-muted-foreground truncate">
                      {user?.email}
                    </span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    router.push("/dashboard/profile" as Route);
                    setOpen(false);
                  }}
                >
                  <User className="h-4 w-4 mr-2" />
                  My Profile
                </Button>

                <Button
                  variant="destructive"
                  className="w-full justify-start"
                  onClick={() => {
                    authClient.signOut({
                      fetchOptions: {
                        onSuccess: () => {
                          router.push("/");
                        },
                      },
                    });
                  }}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <div className="flex items-center gap-2 flex-1 min-w-0">
          {organization?.logo && !logoError ? (
            <div className="h-8 w-8 rounded-lg overflow-hidden shrink-0 bg-muted">
              <img
                src={`${
                  process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000"
                }${organization.logo}`}
                alt={organization.companyName}
                className="h-full w-full object-cover"
                onError={() => setLogoError(true)}
              />
            </div>
          ) : (
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
              <span className="text-primary-foreground font-bold text-sm">
                {organization?.companyName?.[0]?.toUpperCase() || "W"}
              </span>
            </div>
          )}
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-sm truncate">
              {organization?.companyName || "WorkZen"}
            </span>
            <span className="text-xs text-muted-foreground">HR Platform</span>
          </div>
        </div>
      </div>
    </header>
  );
}
