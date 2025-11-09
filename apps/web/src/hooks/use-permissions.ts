"use client";

import { useEffect, useState, useMemo } from "react";
import { authClient } from "@/lib/auth-client";
import { defineAbilityFor, createAbility } from "@/lib/ability";
import type { AppAbility } from "@/lib/ability";

const API_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";

// Map of route paths to their required module and permission
const ROUTE_PERMISSIONS: Record<
  string,
  { module: string; permission: string }
> = {
  "/dashboard": { module: "Dashboard", permission: "View" },
  "/dashboard/employees": { module: "Employees", permission: "View" },
  "/dashboard/attendance": { module: "Attendance", permission: "View" },
  "/dashboard/time-off": { module: "Time Off", permission: "View" },
  "/dashboard/payroll": { module: "Payroll", permission: "View" },
  "/dashboard/reports": { module: "Reports", permission: "View" },
  "/dashboard/settings": { module: "Settings", permission: "View" },
};

export function usePermissions() {
  const { data: session } = authClient.useSession();
  const [permissions, setPermissions] = useState<Record<string, string[]>>({});
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const ability = useMemo<AppAbility>(() => {
    if (Object.keys(permissions).length === 0) {
      return createAbility();
    }
    return defineAbilityFor(permissions);
  }, [permissions]);

  useEffect(() => {
    // First, check if user is authenticated
    if (!session) {
      setLoading(false);
      return;
    }

    const fetchRoleAndPermissions = async () => {
      try {
        // Fetch employee data to get the role
        const employeeResponse = await fetch(`${API_URL}/api/employees/me`, {
          credentials: "include",
        });

        if (!employeeResponse.ok) {
          console.warn(
            "Failed to fetch employee data, status:",
            employeeResponse.status
          );
          setLoading(false);
          return;
        }

        const employeeData = await employeeResponse.json();
        const role = employeeData.role;

        setUserRole(role);

        // Now fetch permissions for this role
        const permissionsResponse = await fetch(
          `${API_URL}/api/permissions/${role}`,
          {
            credentials: "include",
          }
        );

        if (permissionsResponse.ok) {
          const data = await permissionsResponse.json();
          console.log("Fetched permissions for role", role, ":", data);
          setPermissions(data);
        } else {
          console.warn(
            "Failed to fetch permissions, status:",
            permissionsResponse.status
          );
        }
      } catch (error) {
        console.error("Failed to fetch role and permissions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoleAndPermissions();
  }, [session]);

  const hasPermission = (module: string, permission: string): boolean => {
    return permissions[module]?.includes(permission) ?? false;
  };

  const canAccessRoute = (route: string): boolean => {
    // Check exact match first
    let routePermission = ROUTE_PERMISSIONS[route];

    // If no exact match, check for parent route (e.g., /dashboard/employees/123 -> /dashboard/employees)
    if (!routePermission) {
      const pathParts = route.split("/").filter(Boolean);
      for (let i = pathParts.length; i > 0; i--) {
        const parentPath = "/" + pathParts.slice(0, i).join("/");
        routePermission = ROUTE_PERMISSIONS[parentPath];
        if (routePermission) break;
      }
    }

    if (!routePermission) return true; // Allow access to routes without specific permissions
    return hasPermission(routePermission.module, routePermission.permission);
  };

  return {
    permissions,
    hasPermission,
    canAccessRoute,
    loading,
    userRole,
    ability,
  };
}
