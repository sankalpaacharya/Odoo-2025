"use client";

import { usePermissions } from "@/hooks/use-permissions";
import Loader from "./loader";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { loading } = usePermissions();

  // Show loader while permissions are being fetched
  // The dashboard layout already handles authentication
  if (loading) {
    return <Loader />;
  }

  return <>{children}</>;
}
