"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { usePermissions } from "@/hooks/use-permissions";
import Loader from "./loader";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = authClient.useSession();
  const { canAccessRoute, loading } = usePermissions();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const sessionData = await authClient.getSession();
        const user = (sessionData as any)?.data?.user;

        if (!user) {
          router.push("/login");
          return;
        }

        // Skip permission check for login, signup, and root paths
        if (
          pathname === "/login" ||
          pathname === "/signup" ||
          pathname === "/" ||
          pathname === "/dashboard/profile"
        ) {
          return;
        }

        // Check if user has permission to access this route
        if (!loading && !canAccessRoute(pathname)) {
          console.warn("User does not have permission to access:", pathname);
          // Redirect to dashboard (or first available route)
          router.push("/dashboard");
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        router.push("/login");
      }
    };

    checkAuth();
  }, [router, pathname, loading, canAccessRoute]);

  // Show loader while checking authentication and permissions
  if (!session || loading) {
    return <Loader />;
  }

  return <>{children}</>;
}
