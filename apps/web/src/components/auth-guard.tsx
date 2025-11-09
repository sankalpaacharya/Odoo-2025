"use client";

import { usePermissions } from "@/hooks/use-permissions";
import { getDefaultPageForRole } from "@/lib/role-defaults";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import Loader from "./loader";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { loading, canAccessRoute, userRole } = usePermissions();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !canAccessRoute(pathname)) {
      const defaultPage = getDefaultPageForRole(userRole as any);
      router.push(defaultPage);
    }
  }, [loading, pathname, canAccessRoute, userRole, router]);

  if (loading) {
    return <Loader />;
  }

  if (!canAccessRoute(pathname)) {
    return <Loader />;
  }

  return <>{children}</>;
}
