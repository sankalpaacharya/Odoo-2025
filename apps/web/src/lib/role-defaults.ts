import type { Role } from "@/types/profile";
import type { Route } from "next";

export const ROLE_DEFAULT_PAGES: Record<Role, Route> = {
  ADMIN: "/dashboard" as Route,
  HR_OFFICER: "/dashboard/employees" as Route,
  PAYROLL_OFFICER: "/dashboard/payroll" as Route,
  EMPLOYEE: "/dashboard/attendance" as Route,
};

export function getDefaultPageForRole(role: Role | null | undefined): Route {
  if (!role) return "/dashboard/attendance" as Route;
  return ROLE_DEFAULT_PAGES[role] || ("/dashboard/attendance" as Route);
}
