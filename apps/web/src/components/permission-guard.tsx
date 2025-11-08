"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { usePermissions } from "@/hooks/use-permissions";
import Loader from "./loader";
import type { Route } from "next";

interface PermissionGuardProps {
  children: React.ReactNode;
  module: string;
  permission: string;
  fallbackRoute?: Route;
}

export function PermissionGuard({
  children,
  module,
  permission,
  fallbackRoute = "/dashboard" as Route,
}: PermissionGuardProps) {
  const router = useRouter();
  const { hasPermission, loading } = usePermissions();

  useEffect(() => {
    if (!loading && !hasPermission(module, permission)) {
      router.push(fallbackRoute);
    }
  }, [loading, hasPermission, module, permission, router, fallbackRoute]);

  if (loading) {
    return <Loader />;
  }

  if (!hasPermission(module, permission)) {
    return null;
  }

  return <>{children}</>;
}
